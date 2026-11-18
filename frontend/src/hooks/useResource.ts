import { useCallback, useEffect, useState } from 'react'

import { ApiError } from '../api'

interface ResourceState<T> {
  key: string | null
  data: T | null
  error: string | null
}

export function errorMessage(error: unknown): string {
  return error instanceof ApiError ? error.message : 'Algo deu errado. Tente novamente.'
}

export function useResource<T>(key: string, fetcher: (key: string) => Promise<T>) {
  const [version, setVersion] = useState(0)
  const [state, setState] = useState<ResourceState<T>>({ key: null, data: null, error: null })
  const requestKey = `${key}#${version}`

  useEffect(() => {
    let active = true
    fetcher(key)
      .then((data) => {
        if (active) {
          setState({ key: requestKey, data, error: null })
        }
      })
      .catch((error: unknown) => {
        if (active) {
          setState({ key: requestKey, data: null, error: errorMessage(error) })
        }
      })
    return () => {
      active = false
    }
  }, [key, requestKey, fetcher])

  const reload = useCallback(() => setVersion((value) => value + 1), [])

  const replace = useCallback(
    (data: T) => setState({ key: requestKey, data, error: null }),
    [requestKey],
  )

  return {
    data: state.data,
    error: state.key === requestKey ? state.error : null,
    loading: state.key !== requestKey,
    reload,
    replace,
  }
}
