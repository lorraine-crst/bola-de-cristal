import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import { RequireAuth } from './auth/RequireAuth'
import { AppLayout } from './layout/AppLayout'
import { AllBetsPage } from './pages/AllBetsPage'
import { BetDetailPage } from './pages/BetDetailPage'
import { DashboardPage } from './pages/DashboardPage'
import { LoginPage } from './pages/LoginPage'
import { MyBetsPage } from './pages/MyBetsPage'
import { StatusBetsPage } from './pages/StatusBetsPage'

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<RequireAuth />}>
          <Route element={<AppLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="minhas" element={<MyBetsPage />} />
            <Route path="gerais" element={<AllBetsPage />} />
            <Route
              path="aceitas"
              element={
                <StatusBetsPage
                  key="aceitas"
                  status="ACCEPTED"
                  title="Apostas aceitas"
                  subtitle="Previsões que se concretizaram."
                  emptyMessage="Nenhuma aposta foi aceita ainda."
                />
              }
            />
            <Route
              path="negadas"
              element={
                <StatusBetsPage
                  key="negadas"
                  status="DENIED"
                  title="Apostas negadas"
                  subtitle="Previsões que não se concretizaram."
                  emptyMessage="Nenhuma aposta foi negada ainda."
                />
              }
            />
            <Route path="apostas/:id" element={<BetDetailPage />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
