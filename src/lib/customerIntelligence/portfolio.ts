import { getCustomers, getPortfolioSignals } from '../../services/customerRepository';
import type { PortfolioSignal } from '../../types/signal';
import { RISK_SEVERITY_RANK } from '../customer360/shared';
import {
  getCustomerIntelligence,
  type AttentionItem,
  type CustomerIntelligenceBrief,
  type OpportunityItem,
} from './customer';

export interface PortfolioIntelligence {
  accounts: CustomerIntelligenceBrief[];
  attentionItems: AttentionItem[];
  opportunityItems: OpportunityItem[];
  signals: PortfolioSignal[];
}

export function getPortfolioIntelligence(): PortfolioIntelligence {
  const accounts = getCustomers()
    .map((customer) => getCustomerIntelligence(customer.id))
    .filter((item): item is CustomerIntelligenceBrief => Boolean(item));

  const attentionItems = accounts
    .flatMap((account) => account.attentionItems)
    .sort((a, b) => RISK_SEVERITY_RANK[b.severity] - RISK_SEVERITY_RANK[a.severity]);

  const opportunityItems = accounts.flatMap((account) => account.opportunityItems);

  return {
    accounts,
    attentionItems,
    opportunityItems,
    signals: getPortfolioSignals(),
  };
}
