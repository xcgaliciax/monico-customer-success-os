import { useParams } from 'react-router-dom';
import { NextAction } from '../../components/customer360/NextAction';
import { SectionHeader } from '../../components/customer360/SectionHeader';
import { buildCustomerCommercialView } from '../../lib/customer360';
import { getNextActionsForCustomer } from '../../services/customerRepository';
import { formatArrCompact, formatCurrency, formatDate } from '../../lib/formatters';

const BILLING_CADENCE_LABELS_ES = { annual: 'Anual', monthly: 'Mensual' } as const;

const COMMERCIAL_STATUS_LABELS_ES = {
  current: 'Al corriente',
  upcoming: 'Próximo pago',
  pending: 'Pendiente',
  overdue: 'Vencido',
  at_risk: 'En riesgo',
} as const;

export function ComercialPage() {
  const { customerId } = useParams<{ customerId: string }>();
  const viewModel = customerId ? buildCustomerCommercialView(customerId) : undefined;

  if (!viewModel) {
    return (
      <div className="rounded-xl border border-grey-3 bg-white px-6 py-16 text-center">
        <p className="text-sm text-grey-5">Comercial no disponible aún para esta cuenta en este prototipo.</p>
      </div>
    );
  }

  const { header, expansionReadinessLabel, expansionMilestoneLabel } = viewModel;
  const { customer } = header;
  const [nextAction] = getNextActionsForCustomer(customer.id);

  return (
    <div className="space-y-11">
      <div className="grid grid-cols-1 gap-x-[72px] gap-y-10 sm:grid-cols-2">
        <div>
          <SectionHeader eyebrow="Contrato" />
          <div className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between border-b border-grey-2 pb-2">
              <span className="text-grey-5">ARR</span>
              <span className="font-semibold tabular-nums text-ink">
                {formatArrCompact(customer.arrUsd)} ({formatCurrency(customer.arrUsd)})
              </span>
            </div>
            <div className="flex justify-between border-b border-grey-2 pb-2">
              <span className="text-grey-5">Facturación</span>
              <span className="text-ink">{BILLING_CADENCE_LABELS_ES[customer.billingCadence]}</span>
            </div>
            <div className="flex justify-between border-b border-grey-2 pb-2">
              <span className="text-grey-5">Estado de pago</span>
              <span className="text-ink">{COMMERCIAL_STATUS_LABELS_ES[customer.commercial.status]}</span>
            </div>
            {customer.commercial.paymentWindowLabel && (
              <div className="flex justify-between border-b border-grey-2 pb-2">
                <span className="text-grey-5">Próximo pago</span>
                <span className="text-ink">{customer.commercial.paymentWindowLabel}</span>
              </div>
            )}
            {customer.commercial.nextInvoiceDate && (
              <div className="flex justify-between border-b border-grey-2 pb-2">
                <span className="text-grey-5">Próxima factura</span>
                <span className="text-ink">{formatDate(customer.commercial.nextInvoiceDate)}</span>
              </div>
            )}
            <div className="flex justify-between border-b border-grey-2 pb-2">
              <span className="text-grey-5">Renovación</span>
              <span className="text-ink">{customer.commercial.renewalConfirmed ? 'Confirmada' : 'No confirmada aún'}</span>
            </div>
            <div className="flex justify-between pb-2">
              <span className="text-grey-5">Cliente desde</span>
              <span className="text-ink">{formatDate(customer.customerSince)}</span>
            </div>
          </div>
        </div>

        <div>
          <SectionHeader eyebrow="Expansión" />
          <div className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between border-b border-grey-2 pb-2">
              <span className="text-grey-5">Preparación para expansión</span>
              <span className="text-ink">{expansionReadinessLabel ?? 'No evaluada todavía'}</span>
            </div>
            <div className="flex justify-between pb-2">
              <span className="text-grey-5">Hito de expansión</span>
              <span className="text-ink">{expansionMilestoneLabel ?? 'Sin hito de expansión registrado'}</span>
            </div>
          </div>
        </div>
      </div>

      {nextAction && (
        <div className="border-t border-grey-3 pt-8">
          <NextAction variant="inline" eyebrow="Siguiente acción" headline={nextAction.headline} />
        </div>
      )}
    </div>
  );
}
