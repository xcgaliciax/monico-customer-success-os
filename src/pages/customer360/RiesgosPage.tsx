import { useParams } from 'react-router-dom';
import { NextAction } from '../../components/customer360/NextAction';
import { RiskRow } from '../../components/customer360/RiskRow';
import { SectionHeader } from '../../components/customer360/SectionHeader';
import { buildCustomerRisksView } from '../../lib/customer360';
import { getNextActionsForCustomer } from '../../services/customerRepository';

export function RiesgosPage() {
  const { customerId } = useParams<{ customerId: string }>();
  const viewModel = customerId ? buildCustomerRisksView(customerId) : undefined;

  if (!viewModel) {
    return (
      <div className="rounded-xl border border-grey-3 bg-white px-6 py-16 text-center">
        <p className="text-sm text-grey-5">Riesgos no disponibles aún para esta cuenta en este prototipo.</p>
      </div>
    );
  }

  const { header, openRisks, resolvedRisks, commitments, milestones } = viewModel;
  const [nextAction] = getNextActionsForCustomer(header.customer.id);
  const evidenceHref = `/customers/${header.customer.id}/evidence`;

  return (
    <div className="space-y-11">
      <div>
        <SectionHeader eyebrow="Riesgos y dependencias abiertas" />
        {openRisks.length > 0 ? (
          <div className="mt-4 divide-y divide-grey-2">
            {openRisks.map(({ risk, ageLabel, healthImpactStatement }) => (
              <div key={risk.id} className="py-4 first:pt-0">
                <RiskRow
                  title={risk.shortTitle ?? risk.title}
                  cause={risk.shortCause ?? risk.description}
                  dependencyTypeLabel={risk.dependencyTypeLabel}
                  severity={risk.severity}
                  healthImpactStatement={healthImpactStatement}
                  owner={risk.owner}
                  ageLabel={ageLabel}
                  href={evidenceHref}
                />
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm text-grey-5">No hay riesgo material registrado.</p>
        )}
      </div>

      {resolvedRisks.length > 0 && (
        <div className="border-t border-grey-3 pt-8">
          <SectionHeader eyebrow="Riesgos resueltos" />
          <div className="mt-4 divide-y divide-grey-2">
            {resolvedRisks.map(({ risk, ageLabel, healthImpactStatement }) => (
              <div key={risk.id} className="py-4 first:pt-0 opacity-70">
                <RiskRow
                  title={risk.shortTitle ?? risk.title}
                  cause={risk.shortCause ?? risk.description}
                  dependencyTypeLabel={risk.dependencyTypeLabel}
                  severity={risk.severity}
                  healthImpactStatement={healthImpactStatement}
                  owner={risk.owner}
                  ageLabel={ageLabel}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {commitments.length > 0 && (
        <div className="border-t border-grey-3 pt-8">
          <SectionHeader eyebrow="Compromisos" />
          <ul className="mt-4 space-y-2 text-sm text-ink">
            {commitments.map((commitment) => (
              <li key={commitment.id}>
                {commitment.description} — <span className="text-grey-5">{commitment.owner}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="border-t border-grey-3 pt-8">
        <SectionHeader eyebrow="Próximos hitos" />
        {milestones.length > 0 ? (
          <ul className="mt-4 space-y-2 text-sm text-ink">
            {milestones.map((milestone) => (
              <li key={milestone.id}>{milestone.label}</li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 text-sm text-grey-5">Sin hitos registrados todavía.</p>
        )}
      </div>

      {nextAction && (
        <div className="border-t border-grey-3 pt-8">
          <NextAction variant="inline" eyebrow="Siguiente acción" headline={nextAction.headline} />
        </div>
      )}
    </div>
  );
}
