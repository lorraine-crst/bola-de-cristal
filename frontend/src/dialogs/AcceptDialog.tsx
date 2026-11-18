import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import Typography from '@mui/material/Typography'
import { useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useState, type FormEvent } from 'react'

import { ApiError, api } from '../api'
import { currentYear, todayIso } from '../format'
import type { Bet, BetDetail } from '../types'

type Precision = 'date' | 'year'

interface AcceptDialogProps {
  bet: Bet
  onClose: () => void
  onSaved: (detail: BetDetail) => void
}

export function AcceptDialog({ bet, onClose, onSaved }: AcceptDialogProps) {
  const theme = useTheme()
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'))
  const today = todayIso()
  const thisYear = currentYear()
  const createdOn = bet.createdAt.slice(0, 10)
  const createdYear = Number(createdOn.slice(0, 4))
  const [comment, setComment] = useState('')
  const [precision, setPrecision] = useState<Precision>('date')
  const [date, setDate] = useState(today)
  const [year, setYear] = useState(String(thisYear))
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  function clearError(field: string) {
    setErrors((previous) => {
      const next = { ...previous }
      delete next[field]
      return next
    })
  }

  function validate(): Record<string, string> {
    const found: Record<string, string> = {}
    if (!comment.trim()) {
      found.comment = 'Conte como isso aconteceu.'
    }
    if (precision === 'date') {
      if (!date) {
        found.occurredDate = 'Informe a data.'
      } else if (date > today) {
        found.occurredDate = 'A data não pode estar no futuro.'
      } else if (date < createdOn) {
        found.occurredDate = 'A data não pode ser anterior à aposta.'
      }
    } else {
      const yearNumber = Number(year)
      if (!Number.isInteger(yearNumber) || yearNumber < createdYear || yearNumber > thisYear) {
        found.occurredYear = `Escolha um ano entre ${createdYear} e ${thisYear}.`
      }
    }
    return found
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const found = validate()
    setErrors(found)
    setFormError(null)
    if (Object.keys(found).length > 0) {
      return
    }
    setSaving(true)
    try {
      const detail = await api.acceptBet(bet.id, {
        comment: comment.trim(),
        occurredDate: precision === 'date' ? date : null,
        occurredYear: precision === 'year' ? Number(year) : null,
      })
      onSaved(detail)
    } catch (error) {
      if (error instanceof ApiError) {
        setErrors(error.fields)
        setFormError(error.message)
      } else {
        setFormError('Não foi possível aceitar. Tente novamente.')
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open onClose={saving ? undefined : onClose} fullWidth maxWidth="sm" fullScreen={fullScreen}>
      <form onSubmit={handleSubmit} noValidate>
        <DialogTitle>Aceitar aposta</DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} sx={{ pt: 1 }}>
            <Typography color="text.secondary" sx={{ fontStyle: 'italic', overflowWrap: 'anywhere' }}>
              “{bet.description}”
            </Typography>
            {formError && <Alert severity="error">{formError}</Alert>}
            <TextField
              label="Comentário de confirmação"
              placeholder="Ex.: Aconteceu na final, 2 a 1."
              value={comment}
              onChange={(event) => {
                setComment(event.target.value)
                clearError('comment')
              }}
              error={Boolean(errors.comment)}
              helperText={errors.comment}
              multiline
              minRows={3}
              autoFocus
              fullWidth
            />
            <Stack spacing={1}>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                Quando aconteceu?
              </Typography>
              <ToggleButtonGroup
                exclusive
                size="small"
                value={precision}
                onChange={(_, value: Precision | null) => value && setPrecision(value)}
              >
                <ToggleButton value="date">Data exata</ToggleButton>
                <ToggleButton value="year">Só o ano</ToggleButton>
              </ToggleButtonGroup>
            </Stack>
            {precision === 'date' ? (
              <TextField
                label="Data"
                type="date"
                value={date}
                onChange={(event) => {
                  setDate(event.target.value)
                  clearError('occurredDate')
                }}
                error={Boolean(errors.occurredDate)}
                helperText={errors.occurredDate}
                slotProps={{ inputLabel: { shrink: true }, htmlInput: { min: createdOn, max: today } }}
                sx={{ maxWidth: 220 }}
              />
            ) : (
              <TextField
                label="Ano"
                type="number"
                value={year}
                onChange={(event) => {
                  setYear(event.target.value)
                  clearError('occurredYear')
                }}
                error={Boolean(errors.occurredYear)}
                helperText={errors.occurredYear}
                slotProps={{ htmlInput: { min: createdYear, max: thisYear, inputMode: 'numeric' } }}
                sx={{ maxWidth: 220 }}
              />
            )}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button type="submit" variant="contained" color="success" loading={saving}>
            Aceitar
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}