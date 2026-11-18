import Box from '@mui/material/Box'
import LinearProgress from '@mui/material/LinearProgress'
import Pagination from '@mui/material/Pagination'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

import { api } from '../api'
import { countLabel } from '../format'
import { useResource } from '../hooks/useResource'
import type { BetFilters } from '../types'
import { BetCard } from './BetCard'
import { EmptyState, ErrorState, LoadingState } from './States'

const PAGE_SIZE = 10

const fetchBets = (key: string) => api.listBets(JSON.parse(key) as BetFilters)

interface BetListProps {
  filters: BetFilters
  page: number
  onPageChange: (page: number) => void
  emptyMessage: string
}

export function BetList({ filters, page, onPageChange, emptyMessage }: BetListProps) {
  const key = JSON.stringify({ ...filters, page, size: PAGE_SIZE })
  const { data, error, loading, reload } = useResource(key, fetchBets)

  if (error) {
    return <ErrorState message={error} onRetry={reload} />
  }

  if (!data || (loading && data.content.length === 0)) {
    return <LoadingState />
  }

  if (data.content.length === 0) {
    return <EmptyState message={emptyMessage} />
  }

  return (
    <Box>
      <Box sx={{ height: 4, mb: 1 }}>{loading && <LinearProgress />}</Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
        {countLabel(data.totalElements, 'aposta', 'apostas')}
      </Typography>
      <Stack spacing={2}>
        {data.content.map((bet) => (
          <BetCard key={bet.id} bet={bet} />
        ))}
      </Stack>
      {data.totalPages > 1 && (
        <Pagination
          count={data.totalPages}
          page={page + 1}
          onChange={(_, value) => onPageChange(value - 1)}
          sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}
        />
      )}
    </Box>
  )
}