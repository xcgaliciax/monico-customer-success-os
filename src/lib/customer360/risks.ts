import { getCommitmentsForCustomer, getMilestonesForCustomer, getNextActionsForCustomer, getRisksForCustomer } from '../../services/customerRepository';
import { formatAgeLabel, getCustomerHeaderViewModel, resolveMilestoneLabel, RISK_SEVERITY_RANK } from './shared';
import type { CustomerHeaderViewModel } from './shared';
import { DIMENSION_LABELS_ES } from '../labels';
import type { Commitment } from '../../types/commitment';
import type { Risk } from '../../types/risk';

// buildCustomerRisksView — the Riesgos tab view-model. Answers "what requires
// attention and who responds". An account with no material risk gets an honest
// empty state, never a fabricated placeholder risk.

export interface RiskDisplayRow {
  risk: Risk;
  ageLabel: string | undefined;
  healthImpactStatement: string; // explicit for every severity, per spec §12's "alta" requirement generalized
}

export interface MilestoneDisplayRow {
  id: string;
  label: string;
}

export interface CustomerRisksView {
  header: CustomerHeaderViewModel;
  openRisks: RiskDisplayRow[];
  resolvedRisks: RiskDisplayRow[];
  commitments: Commitment[];
  milestones: MilestoneDisplayRow[];
}

export function buildCustomerRisksView(customerId: string): CustomerRisksView | undefined {
  const header = getCustomerHeaderViewModel(customerId);
  if (!header) return undefined;

  const asOfIso = header.snapshot?.snapshotDate ?? '2026-09-01';
  const risks = getRisksForCustomer(customerId);
  const nextActions = getNextActionsForCustomer(customerId);

  const toRow = (risk: Risk): RiskDisplayRow => ({
    risk,
    ageLabel: formatAgeLabel(risk.openedAt, asOfIso),
    healthImpactStatement:
      risk.healthImpactStatement ??
      (risk.relatedDimension ? `Relacionado con: ${DIMENSION_LABELS_ES[risk.relatedDimension]}` : 'Impacto en Health no especificado'),
  });

  const openRisks = risks
    .filter((risk) => risk.status === 'open' || risk.status === 'monitoring')
    .sort((a, b) => RISK_SEVERITY_RANK[b.severity] - RISK_SEVERITY_RANK[a.severity])
    .map(toRow);

  const resolvedRisks = risks.filter((risk) => risk.status === 'resolved').map(toRow);

  return {
    header,
    openRisks,
    resolvedRisks,
    commitments: getCommitmentsForCustomer(customerId),
    milestones: getMilestonesForCustomer(customerId).map((milestone) => ({
      id: milestone.id,
      label: resolveMilestoneLabel(milestone, nextActions),
    })),
  };
}
