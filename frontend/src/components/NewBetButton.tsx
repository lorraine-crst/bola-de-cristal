import Add from '@mui/icons-material/Add'
import Button from '@mui/material/Button'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { BetFormDialog } from '../dialogs/BetFormDialog'

export function NewBetButton() {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button variant="contained" startIcon={<Add />} onClick={() => setOpen(true)}>
        Nova aposta
      </Button>
      {open && (
        <BetFormDialog
          onClose={() => setOpen(false)}
          onSaved={(detail) => navigate(`/apostas/${detail.bet.id}`, { state: { created: true } })}
        />
      )}
    </>
  )
}