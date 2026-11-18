import Chip from '@mui/material/Chip'
import { alpha } from '@mui/material/styles'

import { statusStyles } from '../theme'
import type { BetStatus } from '../types'

interface StatusChipProps {
  status: BetStatus
  size?: 'small' | 'medium'
}

export function StatusChip({ status, size = 'small' }: StatusChipProps) {
  const style = statusStyles[status]
  return (
    <Chip
      label={style.label}
      size={size}
      sx={{ bgcolor: alpha(style.color, 0.12), color: style.color, fontWeight: 700 }}
    />
  )
}
