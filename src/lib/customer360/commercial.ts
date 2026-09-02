import { getMilestonesForCustomer, getNextActionsForCustomer } from '../../services/customerRepository';
import { getCustomerHeaderViewModel, resolveMilestoneLabel } from './shared';
import type { CustomerHeaderViewModel } from './shared';
import { EXPANSION_READINESS_LABELS_ES } from '../labels';

// buildCustomerCommercialView — the Comercial tab view-model. Answers "what is the
// contractual and expansion state", kept strictly separate from Customer Health:
// nothing here ever feeds back into HealthScore.

export interface CustomerCommercialView {
  header: CustomerHeaderViewModel;
  expansionReadinessLabel: string | undefined;
  expansionMilestoneLabel: string | undefined;
}

export function buildCustomerCommercialView(customerId: string): CustomerCommercialView | undefined {
  const header = getCustomerHeaderViewModel(customerId);
  if (!header) return undefined;

  const nextActions = getNextActionsForCustomer(customerId);
  const expansionMilestone = getMilestonesForCustomer(customerId).find((milestone) => milestone.category === 'expansion');

  return {
    header,
    expansionReadinessLabel: header.snapshot?.expansionReadiness ? EXPANSION_READINESS_LABELS_ES[header.snapshot.expansionReadiness] : undefined,
    expansionMilestoneLabel: expansionMilestone ? resolveMilestoneLabel(expansionMilestone, nextActions) : undefined,
  };
}
