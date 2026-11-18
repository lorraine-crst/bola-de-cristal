import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { alpha } from '@mui/material/styles'

import { formatDate, formatOccurred } from '../format'
import { statusStyles } from '../theme'
import type { BetStatus, Resolution } from '../types'

interface ResolutionBoxProps {
  status: BetStatus
  resolution: Resolution
}

export function ResolutionBox({ status, resolution }: ResolutionBoxProps) {
  const color = statusStyles[status].color
  const accepted = status === 'ACCEPTED'

  return (
    <Box sx={{ mt: 2, p: 1.5, borderRadius: 2, bgcolor: alpha(color, 0.06), borderLeft: `3px solid ${color}` }}>
      <Typography variant="body2" sx={{ fontWeight: 700, color }}>
        {accepted ? 'Confirmada' : 'Negada'} por {resolution.resolvedBy.displayName} em{' '}
        {formatDate(resolution.resolvedAt)}
      </Typography>
      {accepted && (
        <Typography variant="body2" sx={{ mt: 0.5 }}>
          Aconteceu em <strong>{formatOccurred(resolution)}</strong>
        </Typography>
      )}
      <Typography
        variant="body2"
        sx={{ mt: 0.5, fontStyle: 'italic', whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}
      >
        “{resolution.comment}”
      </Typography>
    </Box>
  )
}