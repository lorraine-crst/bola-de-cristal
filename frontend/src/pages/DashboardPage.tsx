import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardActionArea from '@mui/material/CardActionArea'
import CardContent from '@mui/material/CardContent'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useNavigate } from 'react-router-dom'

import { api } from '../api'
import { useAuth } from '../auth/useAuth'
import { BetCard } from '../components/BetCard'
import { NewBetButton } from '../components/NewBetButton'
import { PageHeader } from '../components/PageHeader'
import { EmptyState, ErrorState, LoadingState } from '../components/States'
import { UserAvatar } from '../components/UserAvatar'
import { countLabel } from '../format'
import { useResource } from '../hooks/useResource'
import { statusStyles } from '../theme'
import type { PersonStats } from '../types'

const fetchDashboard = () => api.dashboard()
const fetchRecent = () => api.listBets({ size: 5 })

interface StatCardProps {
  label: string
  value: number
  color: string
  to: string
}

function StatCard({ label, value, color, to }: StatCardProps) {
  const navigate = useNavigate()
  return (
    <Card>
      <CardActionArea onClick={() => navigate(to)} sx={{ height: '100%' }}>
        <CardContent>
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 700 }}>
            {label}
          </Typography>
          <Typography sx={{ fontSize: 36, fontWeight: 800, color, lineHeight: 1.2 }}>{value}</Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  )
}

function PersonCard({ stats }: { stats: PersonStats }) {
  const items = [
    { label: statusStyles.OPEN.label, value: stats.open, color: statusStyles.OPEN.color },
    { label: 'Aceitas', value: stats.accepted, color: statusStyles.ACCEPTED.color },
    { label: 'Negadas', value: stats.denied, color: statusStyles.DENIED.color },
  ]
  return (
    <Card sx={{ borderTop: `4px solid ${stats.user.color}` }}>
      <CardContent>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 2 }}>
          <UserAvatar user={stats.user} size={44} />
          <Box>
            <Typography sx={{ fontWeight: 800, fontSize: 18 }}>{stats.user.displayName}</Typography>
            <Typography variant="body2" color="text.secondary">
              {countLabel(stats.total, 'aposta feita', 'apostas feitas')}
            </Typography>
          </Box>
        </Stack>
        <Stack direction="row" spacing={1}>
          {items.map((item) => (
            <Box key={item.label} sx={{ flex: 1, textAlign: 'center', py: 1, borderRadius: 2, bgcolor: 'background.default' }}>
              <Typography sx={{ fontWeight: 800, fontSize: 22, color: item.color }}>{item.value}</Typography>
              <Typography variant="caption" color="text.secondary">
                {item.label}
              </Typography>
            </Box>
          ))}
        </Stack>
      </CardContent>
    </Card>
  )
}

export function DashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const dashboard = useResource('dashboard', fetchDashboard)
  const recent = useResource('recent', fetchRecent)

  return (
    <>
      <PageHeader
        title={`Olá, ${user?.displayName ?? ''}!`}
        subtitle="Veja como andam as previsões de vocês."
        action={<NewBetButton />}
      />

      {dashboard.error && <ErrorState message={dashboard.error} onRetry={dashboard.reload} />}
      {!dashboard.error && !dashboard.data && <LoadingState />}
      {dashboard.data && (
        <Stack spacing={3}>
          <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' } }}>
            <StatCard label="Total" value={dashboard.data.total} color="text.primary" to="/gerais" />
            <StatCard label="Em aberto" value={dashboard.data.open} color={statusStyles.OPEN.color} to="/gerais?status=OPEN" />
            <StatCard label="Aceitas" value={dashboard.data.accepted} color={statusStyles.ACCEPTED.color} to="/aceitas" />
            <StatCard label="Negadas" value={dashboard.data.denied} color={statusStyles.DENIED.color} to="/negadas" />
          </Box>
          <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' } }}>
            {dashboard.data.people.map((stats) => (
              <PersonCard key={stats.user.id} stats={stats} />
            ))}
          </Box>
        </Stack>
      )}

      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mt: 4, mb: 2 }}>
        <Typography variant="h6" component="h2">
          Apostas recentes
        </Typography>
        <Button onClick={() => navigate('/gerais')}>Ver todas</Button>
      </Stack>
      {recent.error && <ErrorState message={recent.error} onRetry={recent.reload} />}
      {!recent.error && !recent.data && <LoadingState />}
      {recent.data && recent.data.content.length === 0 && (
        <EmptyState message="Nenhuma aposta ainda. Que tal fazer a primeira previsão?" />
      )}
      {recent.data && recent.data.content.length > 0 && (
        <Stack spacing={2}>
          {recent.data.content.map((bet) => (
            <BetCard key={bet.id} bet={bet} />
          ))}
        </Stack>
      )}
    </>
  )
}