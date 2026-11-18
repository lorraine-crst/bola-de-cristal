import FilterList from '@mui/icons-material/FilterList'
import Search from '@mui/icons-material/Search'
import Badge from '@mui/material/Badge'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Collapse from '@mui/material/Collapse'
import InputAdornment from '@mui/material/InputAdornment'
import MenuItem from '@mui/material/MenuItem'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

import { api } from '../api'
import { BetList } from '../components/BetList'
import { NewBetButton } from '../components/NewBetButton'
import { PageHeader } from '../components/PageHeader'
import { useResource } from '../hooks/useResource'
import { statusStyles } from '../theme'
import type { BetFilters, BetStatus } from '../types'

const FILTER_KEYS = ['status', 'creatorId', 'probableYear', 'createdFrom', 'createdTo'] as const
const STATUSES = Object.keys(statusStyles) as BetStatus[]

const fetchUsers = () => api.users()

function numberParam(value: string | null): number | undefined {
  return value ? Number(value) : undefined
}

export function AllBetsPage() {
  const [params, setParams] = useSearchParams()
  const [search, setSearch] = useState(params.get('q') ?? '')
  const [showFilters, setShowFilters] = useState(() => FILTER_KEYS.some((key) => params.has(key)))
  const users = useResource('users', fetchUsers)

  const filters: BetFilters = {
    q: params.get('q') ?? undefined,
    status: (params.get('status') as BetStatus | null) ?? undefined,
    creatorId: numberParam(params.get('creatorId')),
    probableYear: numberParam(params.get('probableYear')),
    createdFrom: params.get('createdFrom') ?? undefined,
    createdTo: params.get('createdTo') ?? undefined,
  }
  const page = Number(params.get('page') ?? '0')
  const activeFilters = FILTER_KEYS.filter((key) => params.has(key)).length

  const updateParam = useCallback(
    (name: string, value: string) => {
      setParams(
        (previous) => {
          if ((previous.get(name) ?? '') === value) {
            return previous
          }
          const next = new URLSearchParams(previous)
          if (value) {
            next.set(name, value)
          } else {
            next.delete(name)
          }
          next.delete('page')
          return next
        },
        { replace: true },
      )
    },
    [setParams],
  )

  useEffect(() => {
    const timer = setTimeout(() => updateParam('q', search.trim()), 400)
    return () => clearTimeout(timer)
  }, [search, updateParam])

  function changePage(nextPage: number) {
    setParams((previous) => {
      const next = new URLSearchParams(previous)
      if (nextPage > 0) {
        next.set('page', String(nextPage))
      } else {
        next.delete('page')
      }
      return next
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function clearFilters() {
    setSearch('')
    setParams({}, { replace: true })
  }

  return (
    <>
      <PageHeader title="Apostas gerais" subtitle="Todas as previsões de vocês dois." action={<NewBetButton />} />

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack direction="row" spacing={1}>
            <TextField
              placeholder="Buscar na descrição"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              size="small"
              fullWidth
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                },
              }}
            />
            <Button
              variant={showFilters ? 'contained' : 'outlined'}
              onClick={() => setShowFilters((value) => !value)}
              startIcon={
                <Badge badgeContent={activeFilters} color="secondary">
                  <FilterList />
                </Badge>
              }
              sx={{ flexShrink: 0 }}
            >
              Filtros
            </Button>
          </Stack>
          <Collapse in={showFilters}>
            <Box
              sx={{
                display: 'grid',
                gap: 2,
                pt: 2,
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
              }}
            >
              <TextField
                select
                label="Responsável"
                size="small"
                value={params.get('creatorId') ?? ''}
                onChange={(event) => updateParam('creatorId', event.target.value)}
              >
                <MenuItem value="">Todos</MenuItem>
                {(users.data ?? []).map((user) => (
                  <MenuItem key={user.id} value={String(user.id)}>
                    {user.displayName}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                label="Status"
                size="small"
                value={params.get('status') ?? ''}
                onChange={(event) => updateParam('status', event.target.value)}
              >
                <MenuItem value="">Todos</MenuItem>
                {STATUSES.map((status) => (
                  <MenuItem key={status} value={status}>
                    {statusStyles[status].label}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="Ano provável"
                type="number"
                size="small"
                value={params.get('probableYear') ?? ''}
                onChange={(event) => updateParam('probableYear', event.target.value)}
                slotProps={{ htmlInput: { inputMode: 'numeric' } }}
              />
              <TextField
                label="Criada a partir de"
                type="date"
                size="small"
                value={params.get('createdFrom') ?? ''}
                onChange={(event) => updateParam('createdFrom', event.target.value)}
                slotProps={{ inputLabel: { shrink: true } }}
              />
              <TextField
                label="Criada até"
                type="date"
                size="small"
                value={params.get('createdTo') ?? ''}
                onChange={(event) => updateParam('createdTo', event.target.value)}
                slotProps={{ inputLabel: { shrink: true } }}
              />
              <Button onClick={clearFilters} disabled={activeFilters === 0 && !search}>
                Limpar filtros
              </Button>
            </Box>
          </Collapse>
        </CardContent>
      </Card>

      <BetList
        filters={filters}
        page={page}
        onPageChange={changePage}
        emptyMessage="Nenhuma aposta encontrada com esses filtros."
      />
    </>
  )
}