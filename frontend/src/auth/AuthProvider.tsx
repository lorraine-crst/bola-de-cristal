import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'

import { api, onUnauthorized, tokenStorage } from '../api'
import type { User } from '../types'
import { AuthContext, type AuthStatus } from './authContext'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [status, setStatus] = useState<AuthStatus>(() => (tokenStorage.get() ? 'loading' : 'anonymous'))

  const logout = useCallback(() => {
    tokenStorage.clear()
    setUser(null)
    setStatus('anonymous')
  }, [])

  useEffect(() => {
    onUnauthorized(logout)
    return () => onUnauthorized(null)
  }, [logout])

  useEffect(() => {
    if (!tokenStorage.get()) {
      return
    }
    let active = true
    api
      .me()
      .then((me) => {
        if (active) {
          setUser(me)
          setStatus('authenticated')
        }
      })
      .catch(() => {
        if (active) {
          logout()
        }
      })
    return () => {
      active = false
    }
  }, [logout])

  const login = useCallback(async (username: string, password: string) => {
    const response = await api.login(username, password)
    tokenStorage.set(response.token)
    setUser(response.user)
    setStatus('authenticated')
  }, [])

  const value = useMemo(() => ({ user, status, login, logout }), [user, status, login, logout])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}