import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useState, type FormEvent } from 'react'

import { ApiError, api } from '../api'
import type { Bet, BetDetail } from '../types'

interface DenyDialogProps {
  bet: Bet
  onClose: () => void
  onSaved: (detail: BetDetail) => void
}

export function DenyDialog({ bet, onClose, onSaved }: DenyDialogProps) {
  const theme = useTheme()
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'))
  const [comment, setComment] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFormError(null)
    if (!comment.trim()) {
      setError('Explique por que a aposta está sendo negada.')
      return
    }
    setError(null)
    setSaving(true)
    try {
      onSaved(await api.denyBet(bet.id, { comment: comment.trim() }))
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.fields.comment ?? null)
        setFormError(err.message)
      } else {
        setFormError('Não foi possível negar. Tente novamente.')
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open onClose={saving ? undefined : onClose} fullWidth maxWidth="sm" fullScreen={fullScreen}>
      <form onSubmit={handleSubmit} noValidate>
        <DialogTitle>Negar aposta</DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} sx={{ pt: 1 }}>
            <Typography color="text.secondary" sx={{ fontStyle: 'italic', overflowWrap: 'anywhere' }}>
              “{bet.description}”
            </Typography>
            {formError && <Alert severity="error">{formError}</Alert>}
            <TextField
              label="Por que está negando?"
              placeholder="Ex.: O prazo passou e não aconteceu."
              value={comment}
              onChange={(event) => {
                setComment(event.target.value)
                setError(null)
              }}
              error={Boolean(error)}
              helperText={error}
              multiline
              minRows={3}
              autoFocus
              fullWidth
            />
            <Alert severity="warning">Depois de negada, a aposta não pode mais ser alterada.</Alert>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button type="submit" variant="contained" color="error" loading={saving}>
            Negar
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}