import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import { RequireAuth } from './auth/RequireAuth'
import { AppLayout } from './layout/AppLayout'
import { LoginPage } from './pages/LoginPage'
import { PlaceholderPage } from './pages/PlaceholderPage'

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<RequireAuth />}>
          <Route element={<AppLayout />}>
            <Route index element={<PlaceholderPage title="Painel" />} />
            <Route path="minhas" element={<PlaceholderPage title="Minhas apostas" />} />
            <Route path="gerais" element={<PlaceholderPage title="Apostas gerais" />} />
            <Route path="aceitas" element={<PlaceholderPage title="Apostas aceitas" />} />
            <Route path="negadas" element={<PlaceholderPage title="Apostas negadas" />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
