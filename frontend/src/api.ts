import type {
  AcceptInput,
  BetDetail,
  BetFilters,
  BetInput,
  Bet,
  Dashboard,
  DenyInput,
  LoginResponse,
  Page,
  User,
} from './types'

const BASE_URL = import.meta.env.VITE_API_URL ?? ''
const TOKEN_KEY = 'bola-de-cristal.token'

export class ApiError extends Error {
  status: number
  fields: Record<string, string>

  constructor(status: number, message: string, fields: Record<string, string> = {}) {
    super(message)
    this.status = status
    this.fields = fields
  }
}

export const tokenStorage = {
  get(): string | null {
    try {
      return localStorage.getItem(TOKEN_KEY)
    } catch {
      return null
    }
  },
  set(token: string) {
    try {
      localStorage.setItem(TOKEN_KEY, token)
    } catch {
      return
    }
  },
  clear() {
    try {
      localStorage.removeItem(TOKEN_KEY)
    } catch {
      return
    }
  },
}

let unauthorizedHandler: (() => void) | null = null

export function onUnauthorized(handler: (() => void) | null) {
  unauthorizedHandler = handler
}

type QueryValue = string | number | boolean | undefined | null

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT'
  body?: unknown
  query?: Record<string, QueryValue>
}

function buildQuery(query?: Record<string, QueryValue>): string {
  if (!query) {
    return ''
  }
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null && value !== '') {
      params.set(key, String(value))
    }
  }
  const text = params.toString()
  return text ? `?${text}` : ''
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const token = tokenStorage.get()
  const headers: Record<string, string> = {}
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }
  if (options.body !== undefined) {
    headers['Content-Type'] = 'application/json'
  }

  let response: Response
  try {
    response = await fetch(`${BASE_URL}${path}${buildQuery(options.query)}`, {
      method: options.method ?? 'GET',
      headers,
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    })
  } catch {
    throw new ApiError(0, 'Não foi possível conectar ao servidor. Confira sua internet.')
  }

  if (response.status === 401 && token) {
    tokenStorage.clear()
    unauthorizedHandler?.()
  }

  if (!response.ok) {
    const data = await response.json().catch(() => null)
    throw new ApiError(
      response.status,
      data?.message ?? 'Algo deu errado. Tente novamente.',
      data?.fields ?? {},
    )
  }

  return response.json() as Promise<T>
}

export const api = {
  login: (username: string, password: string) =>
    request<LoginResponse>('/api/auth/login', { method: 'POST', body: { username, password } }),
  me: () => request<User>('/api/auth/me'),
  users: () => request<User[]>('/api/users'),
  dashboard: () => request<Dashboard>('/api/dashboard'),
  listBets: (filters: BetFilters = {}) =>
    request<Page<Bet>>('/api/bets', { query: { ...filters } }),
  getBet: (id: number) => request<BetDetail>(`/api/bets/${id}`),
  createBet: (input: BetInput) => request<BetDetail>('/api/bets', { method: 'POST', body: input }),
  updateBet: (id: number, input: BetInput) =>
    request<BetDetail>(`/api/bets/${id}`, { method: 'PUT', body: input }),
  acceptBet: (id: number, input: AcceptInput) =>
    request<BetDetail>(`/api/bets/${id}/accept`, { method: 'POST', body: input }),
  denyBet: (id: number, input: DenyInput) =>
    request<BetDetail>(`/api/bets/${id}/deny`, { method: 'POST', body: input }),
}