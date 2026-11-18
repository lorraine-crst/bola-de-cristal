import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import { useSearchParams } from 'react-router-dom'

import { BetList } from '../components/BetList'
import { NewBetButton } from '../components/NewBetButton'
import { PageHeader } from '../components/PageHeader'
import { statusStyles } from '../theme'
import type { BetStatus } from '../types'

type TabValue = BetStatus | 'ALL'

const TABS: { value: TabValue; label: string }[] = [
  { value: 'ALL', label: 'Todas' },
  { value: 'OPEN', label: statusStyles.OPEN.label },
  { value: 'ACCEPTED', label: 'Aceitas' },
  { value: 'DENIED', label: 'Negadas' },
]

const EMPTY_MESSAGES: Record<TabValue, string> = {
  ALL: 'Você ainda não fez nenhuma aposta.',
  OPEN: 'Nenhuma aposta sua está em aberto.',
  ACCEPTED: 'Nenhuma aposta sua foi aceita ainda.',
  DENIED: 'Nenhuma aposta sua foi negada.',
}

export function MyBetsPage() {
  const [params, setParams] = useSearchParams()
  const tab = (params.get('status') as BetStatus | null) ?? 'ALL'
  const page = Number(params.get('page') ?? '0')

  function changeTab(value: TabValue) {
    setParams(value === 'ALL' ? {} : { status: value }, { replace: true })
  }

  function changePage(nextPage: number) {
    const next: Record<string, string> = {}
    if (tab !== 'ALL') {
      next.status = tab
    }
    if (nextPage > 0) {
      next.page = String(nextPage)
    }
    setParams(next)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <>
      <PageHeader title="Minhas apostas" subtitle="As previsões que você fez." action={<NewBetButton />} />
      <Tabs
        value={tab}
        onChange={(_, value: TabValue) => changeTab(value)}
        variant="scrollable"
        allowScrollButtonsMobile
        sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
      >
        {TABS.map((item) => (
          <Tab key={item.value} value={item.value} label={item.label} />
        ))}
      </Tabs>
      <BetList
        filters={{ mine: true, status: tab === 'ALL' ? undefined : tab }}
        page={page}
        onPageChange={changePage}
        emptyMessage={EMPTY_MESSAGES[tab]}
      />
    </>
  )
}