import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { EvidencePlaceholder } from './pages/EvidencePlaceholder';
import { InsightsPlaceholder } from './pages/InsightsPlaceholder';
import { PortfolioHealth } from './pages/PortfolioHealth';
import { AdopcionPage } from './pages/customer360/AdopcionPage';
import { Customer360Layout } from './pages/customer360/Customer360Layout';
import { DeepTabPlaceholder } from './pages/customer360/DeepTabPlaceholder';
import { ResumenPage } from './pages/customer360/ResumenPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<PortfolioHealth />} />
          <Route path="/customers" element={<Navigate to="/" replace />} />
          <Route path="/insights" element={<InsightsPlaceholder />} />
          <Route path="/evidence" element={<EvidencePlaceholder />} />

          <Route path="/customers/:customerId" element={<Customer360Layout />}>
            <Route index element={<Navigate to="resumen" replace />} />
            <Route path="resumen" element={<ResumenPage />} />
            <Route path="salud" element={<DeepTabPlaceholder tabLabel="Salud" />} />
            <Route path="adopcion" element={<AdopcionPage />} />
            <Route path="valor" element={<DeepTabPlaceholder tabLabel="Valor" />} />
            <Route path="riesgos" element={<DeepTabPlaceholder tabLabel="Riesgos" />} />
            <Route path="evidencia" element={<DeepTabPlaceholder tabLabel="Evidencia" />} />
            <Route path="comercial" element={<DeepTabPlaceholder tabLabel="Comercial" />} />
            <Route path="historial" element={<DeepTabPlaceholder tabLabel="Historial" />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
