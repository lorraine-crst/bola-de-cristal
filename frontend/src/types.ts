export type BetStatus = 'OPEN' | 'ACCEPTED' | 'DENIED'

export type BetAction = 'CREATED' | 'EDITED' | 'ACCEPTED' | 'DENIED'

export interface User {
  id: number
  username: string
  displayName: string
  color: string
}

export interface LoginResponse {
  token: string
  user: User
}

export interface Resolution {
  resolvedBy: User
  comment: string
  occurredDate: string | null
  occurredYear: number | null
  resolvedAt: string
}

export interface Bet {
  id: number
  creator: User
  description: string
  probableYear: number
  status: BetStatus
  createdAt: string
  resolution: Resolution | null
  canEdit: boolean
  canResolve: boolean
}

export interface BetEvent {
  id: number
  actor: User
  action: BetAction
  comment: string | null
  previousDescription: string | null
  previousProbableYear: number | null
  createdAt: string
}

export interface BetDetail {
  bet: Bet
  history: BetEvent[]
}

export interface Page<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

export interface BetFilters {
  status?: BetStatus
  creatorId?: number
  probableYear?: number
  q?: string
  createdFrom?: string
  createdTo?: string
  mine?: boolean
  page?: number
  size?: number
}

export interface BetInput {
  description: string
  probableYear: number
}

export interface AcceptInput {
  comment: string
  occurredDate: string | null
  occurredYear: number | null
}

export interface DenyInput {
  comment: string
}

export interface PersonStats {
  user: User
  total: number
  open: number
  accepted: number
  denied: number
}

export interface Dashboard {
  total: number
  open: number
  accepted: number
  denied: number
  people: PersonStats[]
}