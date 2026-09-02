import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { CustomerPlaceholder } from './pages/CustomerPlaceholder';
import { EvidencePlaceholder } from './pages/EvidencePlaceholder';
import { InsightsPlaceholder } from './pages/InsightsPlaceholder';
import { PortfolioHealth } from './pages/PortfolioHealth';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<PortfolioHealth />} />
          <Route path="/insights" element={<InsightsPlaceholder />} />
          <Route path="/evidence" element={<EvidencePlaceholder />} />
          <Route path="/customers/:customerId" element={<CustomerPlaceholder />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
