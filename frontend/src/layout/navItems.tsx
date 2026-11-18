import CancelOutlined from '@mui/icons-material/CancelOutlined'
import CheckCircleOutlined from '@mui/icons-material/CheckCircleOutlined'
import FormatListBulleted from '@mui/icons-material/FormatListBulleted'
import PersonOutlined from '@mui/icons-material/PersonOutlined'
import SpaceDashboardOutlined from '@mui/icons-material/SpaceDashboardOutlined'
import type { ReactElement } from 'react'

export interface NavItem {
  path: string
  label: string
  shortLabel: string
  icon: ReactElement
}

export const navItems: NavItem[] = [
  { path: '/', label: 'Painel', shortLabel: 'Painel', icon: <SpaceDashboardOutlined /> },
  { path: '/minhas', label: 'Minhas apostas', shortLabel: 'Minhas', icon: <PersonOutlined /> },
  { path: '/gerais', label: 'Apostas gerais', shortLabel: 'Gerais', icon: <FormatListBulleted /> },
  { path: '/aceitas', label: 'Apostas aceitas', shortLabel: 'Aceitas', icon: <CheckCircleOutlined /> },
  { path: '/negadas', label: 'Apostas negadas', shortLabel: 'Negadas', icon: <CancelOutlined /> },
]

export function findNavItem(pathname: string): NavItem | undefined {
  return navItems.find((item) => item.path === pathname)
}