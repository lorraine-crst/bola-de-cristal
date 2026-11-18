import type { Resolution } from './types'

export function formatDate(value: string): string {
  const [year, month, day] = value.slice(0, 10).split('-')
  return `${day}/${month}/${year}`
}

export function formatDateTime(value: string): string {
  return `${formatDate(value)} às ${value.slice(11, 16)}`
}

export function formatOccurred(resolution: Resolution): string {
  if (resolution.occurredDate) {
    return formatDate(resolution.occurredDate)
  }
  return resolution.occurredYear ? String(resolution.occurredYear) : ''
}

export function todayIso(): string {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${now.getFullYear()}-${month}-${day}`
}

export function currentYear(): number {
  return new Date().getFullYear()
}

export function countLabel(count: number, singular: string, plural: string): string {
  return `${count} ${count === 1 ? singular : plural}`
}
