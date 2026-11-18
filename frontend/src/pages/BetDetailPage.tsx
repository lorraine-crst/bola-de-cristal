import ArrowBack from '@mui/icons-material/ArrowBack'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Snackbar from '@mui/material/Snackbar'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'

import { api } from '../api'
import { ResolutionBox } from '../components/ResolutionBox'
import { ErrorState, LoadingState } from '../components/States'
import { StatusChip } from '../components/StatusChip'
import { UserAvatar } from '../components/UserAvatar'
import { AcceptDialog } from '../dialogs/AcceptDialog'
import { BetFormDialog } from '../dialogs/BetFormDialog'
import { DenyDialog } from '../dialogs/DenyDialog'
import { formatDateTime } from '../format'
import { useResource } from '../hooks/useResource'
import { statusStyles } from '../theme'
import type { BetAction, BetDetail, BetEvent } from '../types'

type DialogName = 'edit' | 'accept' | 'deny'

const ACTION_TEXT: Record<BetAction, string> = {
  CREATED: 'criou a aposta',
  EDITED: 'editou a aposta',
  ACCEPTED: 'aceitou a aposta',
  DENIED: 'negou a aposta',
}

const ACTION_COLOR: Record<BetAction, string> = {
  CREATED: '#2D2250',
  EDITED: '#8E88A3',
  ACCEPTED: statusStyles.ACCEPTED.color,
  DENIED: statusStyles.DENIED.color,
}

const SUCCESS_TEXT: Record<DialogName, string> = {
  edit: 'Aposta atualizada.',
  accept: 'Aposta aceita!',
  deny: 'Aposta negada.',
}

const fetchBet = (key: string) => api.getBet(Number(key))

function HistoryItem({ event, last }: { event: BetEvent; last: boolean }) {
  return (
    <Stack direction="row" spacing={2}>
      <Stack sx={{ alignItems: 'center' }}>
        <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: ACTION_COLOR[event.action], mt: 0.75 }} />
        {!last && <Box sx={{ width: 2, flexGrow: 1, bgcolor: 'divider', my: 0.5 }} />}
      </Stack>
      <Box sx={{ pb: last ? 0 : 3, minWidth: 0 }}>
        <Typography>
          <strong>{event.actor.displayName}</strong> {ACTION_TEXT[event.action]}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {formatDateTime(event.createdAt)}
        </Typography>
        {event.comment && (
          <Typography variant="body2" sx={{ mt: 0.5, fontStyle: 'italic', whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>
            “{event.comment}”
          </Typography>
        )}
        {event.action === 'EDITED' && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>
            Antes: “{event.previousDescription}” · ano {event.previousProbableYear}
          </Typography>
        )}
      </Box>
    </Stack>
  )
}

export function BetDetailPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { data, error, reload, replace } = useResource(id, fetchBet)
  const [dialog, setDialog] = useState<DialogName | null>(null)
  const [message, setMessage] = useState<string | null>(() =>
    (location.state as { created?: boolean } | null)?.created ? 'Aposta registrada!' : null,
  )

  function handleSaved(detail: BetDetail) {
    if (dialog) {
      setMessage(SUCCESS_TEXT[dialog])
    }
    replace(detail)
    setDialog(null)
  }

  function closeMessage() {
    setMessage(null)
    navigate(location.pathname, { replace: true, state: null })
  }

  const back = (
    <Button startIcon={<ArrowBack />} onClick={() => navigate(-1)} sx={{ mb: 2 }}>
      Voltar
    </Button>
  )

  if (error) {
    return (
      <>
        {back}
        <ErrorState message={error} onRetry={reload} />
      </>
    )
  }

  if (!data) {
    return <LoadingState />
  }

  const { bet, history } = data

  return (
    <>
      {back}
      <Card sx={{ borderLeft: `4px solid ${bet.creator.color}`, mb: 3 }}>
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 2 }}>
            <UserAvatar user={bet.creator} size={44} />
            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
              <Typography sx={{ fontWeight: 800 }}>{bet.creator.displayName}</Typography>
              <Typography variant="body2" color="text.secondary">
                Apostou em {formatDateTime(bet.createdAt)}
              </Typography>
            </Box>
            <StatusChip status={bet.status} size="medium" />
          </Stack>
          <Typography sx={{ fontSize: 20, fontWeight: 600, whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>
            {bet.description}
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 2 }}>
            Previsto para <strong>{bet.probableYear}</strong>
          </Typography>
          {bet.resolution && <ResolutionBox status={bet.status} resolution={bet.resolution} />}

          {(bet.canEdit || bet.canResolve) && (
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mt: 3 }}>
              {bet.canResolve && (
                <>
                  <Button variant="contained" color="success" onClick={() => setDialog('accept')}>
                    Aceitar
                  </Button>
                  <Button variant="outlined" color="error" onClick={() => setDialog('deny')}>
                    Negar
                  </Button>
                </>
              )}
              {bet.canEdit && (
                <Button variant="outlined" onClick={() => setDialog('edit')}>
                  Editar
                </Button>
              )}
            </Stack>
          )}
          {bet.canEdit && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Só a outra pessoa pode aceitar ou negar esta aposta.
            </Typography>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
            Histórico
          </Typography>
          {history.map((event, index) => (
            <HistoryItem key={event.id} event={event} last={index === history.length - 1} />
          ))}
        </CardContent>
      </Card>

      {dialog === 'edit' && <BetFormDialog bet={bet} onClose={() => setDialog(null)} onSaved={handleSaved} />}
      {dialog === 'accept' && <AcceptDialog bet={bet} onClose={() => setDialog(null)} onSaved={handleSaved} />}
      {dialog === 'deny' && <DenyDialog bet={bet} onClose={() => setDialog(null)} onSaved={handleSaved} />}

      <Snackbar
        open={message !== null}
        autoHideDuration={3000}
        onClose={closeMessage}
        message={message}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        sx={{ mb: { xs: 9, md: 0 } }}
      />
    </>
  )
}