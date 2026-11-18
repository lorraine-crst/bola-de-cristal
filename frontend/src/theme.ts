import { ptBR } from '@mui/material/locale'
import { createTheme } from '@mui/material/styles'

import type { BetStatus } from './types'

export const statusStyles: Record<BetStatus, { label: string; color: string }> = {
  OPEN: { label: 'Em aberto', color: '#1E88E5' },
  ACCEPTED: { label: 'Aceita', color: '#2E7D32' },
  DENIED: { label: 'Negada', color: '#C62828' },
}

export const theme = createTheme({
  palette: {
    primary: { main: '#2D2250' },
    background: { default: '#F7F6FB', paper: '#FFFFFF' },
    text: { primary: '#1F1A33', secondary: '#5F5975' },
    divider: '#E6E2F0',
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: '"Nunito", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: { fontWeight: 800 },
    h5: { fontWeight: 800 },
    h6: { fontWeight: 700 },
    button: { textTransform: 'none', fontWeight: 700 },
  },
  components: {
    MuiCard: {
      defaultProps: { elevation: 0 },
      styleOverrides: { root: { border: '1px solid #E6E2F0' } },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
    },
  },
}, ptBR)
