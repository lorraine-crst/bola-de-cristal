import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import { useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useState, type FocusEvent, type FormEvent } from 'react'

import { ApiError, api } from '../api'
import { currentYear } from '../format'
import type { Bet, BetDetail } from '../types'

const MAX_LENGTH = 2000
const MAX_YEARS_AHEAD = 100

interface BetFormDialogProps {
  bet?: Bet
  onClose: () => void
  onSaved: (detail: BetDetail) => void
}

export function BetFormDialog({ bet, onClose, onSaved }: BetFormDialogProps) {
  const theme = useTheme()
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'))
  const thisYear = currentYear()
  const [description, setDescription] = useState(bet?.description ?? '')
  const [year, setYear] = useState(String(bet?.probableYear ?? thisYear + 1))
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
    const text = description.trim()
    if (!text) {
      found.description = 'Descreva o que você acha que vai acontecer.'
    } else if (text.length > MAX_LENGTH) {
      found.description = `Use no máximo ${MAX_LENGTH} caracteres.`
    }
    const yearNumber = Number(year)
    const unchanged = bet !== undefined && yearNumber === bet.probableYear
    const inRange = yearNumber >= thisYear && yearNumber <= thisYear + MAX_YEARS_AHEAD
    if (!Number.isInteger(yearNumber) || (!unchanged && !inRange)) {
      found.probableYear = `Escolha um ano entre ${thisYear} e ${thisYear + MAX_YEARS_AHEAD}.`
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
      const input = { description: description.trim(), probableYear: Number(year) }
      const detail = bet ? await api.updateBet(bet.id, input) : await api.createBet(input)
      onSaved(detail)
    } catch (error) {
      if (error instanceof ApiError) {
        setErrors(error.fields)
        setFormError(error.message)
      } else {
        setFormError('Não foi possível salvar. Tente novamente.')
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open onClose={saving ? undefined : onClose} fullWidth maxWidth="sm" fullScreen={fullScreen}>
      <form onSubmit={handleSubmit} noValidate>
        <DialogTitle>{bet ? 'Editar aposta' : 'Nova aposta'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} sx={{ pt: 1 }}>
            {formError && <Alert severity="error">{formError}</Alert>}
            <TextField
              label="O que vai acontecer?"
              placeholder="Ex.: O Brasil vai ganhar a próxima Copa do Mundo."
              value={description}
              onChange={(event) => {
                setDescription(event.target.value)
                clearError('description')
              }}
              error={Boolean(errors.description)}
              helperText={errors.description ?? `${description.trim().length}/${MAX_LENGTH}`}
              multiline
              minRows={4}
              autoFocus
              fullWidth
              slotProps={{
                htmlInput: {
                  onFocus: (event: FocusEvent<HTMLTextAreaElement>) => {
                    const end = event.target.value.length
                    event.target.setSelectionRange(end, end)
                  },
                },
              }}
            />
            <TextField
              label="Ano provável"
              type="number"
              value={year}
              onChange={(event) => {
                setYear(event.target.value)
                clearError('probableYear')
              }}
              error={Boolean(errors.probableYear)}
              helperText={errors.probableYear ?? 'Em que ano você acha que isso acontece?'}
              slotProps={{ htmlInput: { min: thisYear, max: thisYear + MAX_YEARS_AHEAD, inputMode: 'numeric' } }}
              sx={{ maxWidth: 220 }}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button type="submit" variant="contained" loading={saving}>
            {bet ? 'Salvar' : 'Registrar aposta'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}