import {
  getHealthSnapshotsForCustomer,
  getInsightsForCustomer,
  getLatestAdoptionSnapshot,
  getLatestPlatformTelemetry,
  getNextActionsForCustomer,
} from '../../services/customerRepository';
import { getCustomerHeaderViewModel } from './shared';
import type { CustomerHeaderViewModel } from './shared';
import type { AdoptionSnapshot, ModuleUsage, WorkflowDepthStep } from '../../types/adoption';
import type { Customer } from '../../types/customer';
import type { Insight } from '../../types/insight';
import type { NextAction } from '../../types/nextAction';
import type { PlatformTelemetrySnapshot } from '../../types/platformTelemetry';
import type { Provenance } from '../../types/provenance';

// buildCustomerAdoptionView — the Adopción tab view-model. Every headline metric
// is included only when the account has real, grounded support for it; there is
// no fixed four-metric layout requirement.

export interface AdoptionHeadlineMetric {
  value: string;
  label: string;
  provenance: Provenance;
}

export interface CustomerAdoptionView {
  header: CustomerHeaderViewModel;
  blockerSummary: string;
  headlineMetrics: AdoptionHeadlineMetric[];
  moduleUsage: ModuleUsage[];
  workflowDepth: WorkflowDepthStep[] | undefined;
  perUserTelemetryAvailable: boolean;
  usersTotal: number;
  usersActive: number | undefined;
  requiredRoleActivationScore: number | undefined;
  platformTelemetry: PlatformTelemetrySnapshot | undefined;
  hasSufficientHistory: boolean;
  adoptionInsights: Insight[];
  nextAction: NextAction | undefined;
}

function buildHeadlineMetrics(customer: Customer, adoption: AdoptionSnapshot): AdoptionHeadlineMetric[] {
  const metrics: AdoptionHeadlineMetric[] = [];

  if (customer.users.active !== undefined && adoption.activeUsersProvenance) {
    metrics.push({
      value: `${customer.users.active} / ${customer.users.total}`,
      label: 'usuarios activos',
      provenance: adoption.activeUsersProvenance,
    });
  } else {
    metrics.push({ value: 'No disponible', label: 'usuarios activos', provenance: { class: 'unknown' } });
  }

  if (adoption.workflowCoverage) {
    const { estimatePct, comparator, provenance } = adoption.workflowCoverage;
    const prefix = comparator === 'gt' ? '>' : comparator === 'gte' ? '≥' : '';
    metrics.push({ value: `${prefix}${estimatePct}%`, label: 'cobertura estimada del flujo', provenance });
  }

  if (adoption.independentOperation) {
    metrics.push({
      value: adoption.independentOperation.status === 'confirmed' ? 'Confirmada' : 'En desarrollo',
      label: 'independencia operativa',
      provenance: adoption.independentOperation.provenance,
    });
  }

  const projectCount = customer.projects?.total ?? customer.projects?.active;
  if (projectCount !== undefined) {
    metrics.push({
      value: String(projectCount),
      label: customer.projects?.total !== undefined ? 'proyectos cargados históricamente' : 'proyectos activos',
      provenance: adoption.projectsProvenance ?? { class: 'confirmed_by_cs' },
    });
  }

  return metrics;
}

export function buildCustomerAdoptionView(customerId: string): CustomerAdoptionView | undefined {
  const header = getCustomerHeaderViewModel(customerId);
  const adoption = getLatestAdoptionSnapshot(customerId);
  if (!header || !adoption) return undefined;

  const { customer, snapshot } = header;

  return {
    header,
    blockerSummary: adoption.blockerSummary,
    headlineMetrics: buildHeadlineMetrics(customer, adoption),
    moduleUsage: adoption.moduleUsage,
    workflowDepth: adoption.workflowDepth,
    perUserTelemetryAvailable: adoption.perUserTelemetryAvailable,
    usersTotal: customer.users.total,
    usersActive: customer.users.active,
    requiredRoleActivationScore: snapshot?.dimensions.requiredRoleActivation,
    platformTelemetry: getLatestPlatformTelemetry(customerId),
    hasSufficientHistory: getHealthSnapshotsForCustomer(customerId).length >= 2,
    adoptionInsights: getInsightsForCustomer(customerId, 'adoption'),
    nextAction: getNextActionsForCustomer(customerId)[0],
  };
}
