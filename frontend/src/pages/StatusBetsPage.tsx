import { useSearchParams } from 'react-router-dom'

import { BetList } from '../components/BetList'
import { PageHeader } from '../components/PageHeader'
import type { BetStatus } from '../types'

interface StatusBetsPageProps {
  status: BetStatus
  title: string
  subtitle: string
  emptyMessage: string
}

export function StatusBetsPage({ status, title, subtitle, emptyMessage }: StatusBetsPageProps) {
  const [params, setParams] = useSearchParams()
  const page = Number(params.get('page') ?? '0')

  function changePage(nextPage: number) {
    setParams(nextPage > 0 ? { page: String(nextPage) } : {})
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <>
      <PageHeader title={title} subtitle={subtitle} />
      <BetList filters={{ status }} page={page} onPageChange={changePage} emptyMessage={emptyMessage} />
    </>
  )
}
