import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { AccountsPage } from './pages/AccountsPage';
import { PanelPage } from './pages/PanelPage';
import { SignalsPage } from './pages/SignalsPage';
import { AdopcionPage } from './pages/customer360/AdopcionPage';
import { ComercialPage } from './pages/customer360/ComercialPage';
import { Customer360Layout } from './pages/customer360/Customer360Layout';
import { EvidenciaPage } from './pages/customer360/EvidenciaPage';
import { HistorialPage } from './pages/customer360/HistorialPage';
import { ReportPage } from './pages/customer360/ReportPage';
import { ResumenPage } from './pages/customer360/ResumenPage';
import { RiesgosPage } from './pages/customer360/RiesgosPage';
import { SaludPage } from './pages/customer360/SaludPage';
import { ValorPage } from './pages/customer360/ValorPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Standalone print/report route — no shell chrome, same view-models as the portal. */}
        <Route path="/customers/:customerId/report" element={<ReportPage />} />

        <Route element={<AppShell />}>
          <Route path="/" element={<PanelPage />} />
          <Route path="/accounts" element={<AccountsPage />} />
          <Route path="/signals" element={<SignalsPage />} />

          <Route path="/customers/:customerId" element={<Customer360Layout />}>
            <Route index element={<ResumenPage />} />
            <Route path="health" element={<SaludPage />} />
            <Route path="adoption" element={<AdopcionPage />} />
            <Route path="value" element={<ValorPage />} />
            <Route path="risks" element={<RiesgosPage />} />
            <Route path="evidence" element={<EvidenciaPage />} />
            <Route path="commercial" element={<ComercialPage />} />
            <Route path="history" element={<HistorialPage />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
