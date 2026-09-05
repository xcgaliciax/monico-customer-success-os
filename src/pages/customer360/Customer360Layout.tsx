import { Outlet, useLocation, useParams } from 'react-router-dom';
import { CustomerHeader } from '../../components/customer360/CustomerHeader';
import { CustomerTabs } from '../../components/customer360/CustomerTabs';
import { PlaceholderPage } from '../../components/shared/PlaceholderPage';
import { getCustomerHeaderViewModel } from '../../lib/customer360';
import type { PageActionSpec } from '../../components/customer360/PageAction';

// Spec §04: variante completa only on Resumen; every other deep tab uses the
// compact one-line header. Tendencia/confianza/ARR/Champions never repeat there.
export function Customer360Layout() {
  const { customerId } = useParams<{ customerId: string }>();
  const location = useLocation();

  const viewModel = customerId ? getCustomerHeaderViewModel(customerId) : undefined;

  if (!customerId || !viewModel || !viewModel.snapshot) {
    return <PlaceholderPage eyebrow="Customer Success OS" title="Cuenta no encontrada" message="No existe una cuenta con este identificador." />;
  }

  const isResumen = location.pathname === `/customers/${customerId}`;
  const { customer, snapshot } = viewModel;

  const actions: PageActionSpec[] = [
    { id: 'update', label: 'Actualizar cliente', variant: 'secondary', href: `/customers/${customerId}/update` },
    { id: 'evidence', label: 'Ver evidencia', variant: 'secondary', href: `/customers/${customerId}/evidence` },
    { id: 'export', label: 'Exportar', variant: 'primary', href: `/customers/${customerId}/report` },
  ];

  return (
    <div>
      <CustomerHeader
        variant={isResumen ? 'full' : 'compact'}
        customer={customer}
        score={snapshot.finalScore}
        status={snapshot.finalStatus}
        trend={snapshot.trend}
        lifecycle={snapshot.lifecycle}
        confidence={snapshot.confidence}
        actions={actions}
      />
      <CustomerTabs customerId={customerId} />
      <div className="py-8">
        <Outlet />
      </div>
    </div>
  );
}
