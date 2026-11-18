import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardActionArea from '@mui/material/CardActionArea'
import CardContent from '@mui/material/CardContent'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useNavigate } from 'react-router-dom'

import { formatDate } from '../format'
import type { Bet } from '../types'
import { ResolutionBox } from './ResolutionBox'
import { StatusChip } from './StatusChip'
import { UserAvatar } from './UserAvatar'

export function BetCard({ bet }: { bet: Bet }) {
  const navigate = useNavigate()

  return (
    <Card sx={{ borderLeft: `4px solid ${bet.creator.color}` }}>
      <CardActionArea onClick={() => navigate(`/apostas/${bet.id}`)}>
        <CardContent>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 1.5 }}>
            <UserAvatar user={bet.creator} size={36} />
            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
              <Typography sx={{ fontWeight: 700 }}>{bet.creator.displayName}</Typography>
              <Typography variant="body2" color="text.secondary">
                {formatDate(bet.createdAt)}
              </Typography>
            </Box>
            <StatusChip status={bet.status} />
          </Stack>
          <Typography
            sx={{
              whiteSpace: 'pre-wrap',
              overflowWrap: 'anywhere',
              display: '-webkit-box',
              WebkitLineClamp: 4,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {bet.description}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
            Previsto para <strong>{bet.probableYear}</strong>
          </Typography>
          {bet.resolution && <ResolutionBox status={bet.status} resolution={bet.resolution} />}
        </CardContent>
      </CardActionArea>
    </Card>
  )
}