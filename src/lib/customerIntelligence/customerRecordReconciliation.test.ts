import { describe, expect, it } from 'vitest';
import {
  getCommercialStatusSnapshotsForCustomer,
  getCustomerById,
  getHealthSnapshotsForCustomer,
  getProductMetricSnapshotsForCustomer,
  getRisksForCustomer,
  getWeeklyActionsForCustomer,
} from '../../services/customerRepository';
import { getCustomerContext } from './customerContext';
import { getWeeklyStatusDraft } from './weeklyStatusDraft';

function latestCommercial(customerId: string) {
  const snapshots = getCommercialStatusSnapshotsForCustomer(customerId);
  return snapshots[snapshots.length - 1];
}

function actionIdsForWeek(customerId: string, weekOf: string): string[] {
  return getWeeklyActionsForCustomer(customerId)
    .filter((action) => action.weekOf === weekOf)
    .map((action) => action.id);
}

describe('Sep 9 Customer Record reconciliation', () => {
  it('keeps Siemens Sep 2-8 zero activity explicit without adding an adoption Risk', () => {
    const [metrics] = getProductMetricSnapshotsForCustomer('siemens');

    expect(metrics).toMatchObject({
      windowStart: '2026-09-02',
      windowEnd: '2026-09-08',
      projectsCreatedInWindow: 0,
      projectsCompletedInWindow: 0,
      projectsErroredInWindow: 0,
    });
    expect(getRisksForCustomer('siemens').map((risk) => risk.id)).toEqual(['risk-siemens-regulatory-doc-approval']);
  });

  it('keeps Grupo Balle healthy commercially while the current invoice is pending', () => {
    const commercial = latestCommercial('grupo-balle');

    expect(commercial?.commercialStatus).toBe('healthy');
    expect(commercial?.paymentStatus).toBe('al corriente; factura del mes actual pendiente');
    expect(getCustomerContext('grupo-balle', '2026-09-09')?.commercial.commercialAttention).toEqual([]);
  });

  it('marks Manprec commercial standing as attention without changing Health', () => {
    const commercial = latestCommercial('manprec');
    const health = getHealthSnapshotsForCustomer('manprec')[0];

    expect(commercial?.commercialStatus).toBe('attention');
    expect(commercial?.commercialRisk).toBe('Sin respuesta a llamadas, correos o mensajes para solicitar fecha de pago / respuesta.');
    expect(health).toMatchObject({
      id: 'manprec-2026-09-01',
      finalScore: 82,
      finalStatus: 'green',
      trend: 'improving',
      confidence: 'high',
    });
    expect(getCustomerContext('manprec', '2026-09-09')?.commercial.commercialAttention).toHaveLength(1);
  });

  it('adds Manprec current technical execution Risk separately from commercial payment state', () => {
    const risk = getRisksForCustomer('manprec').find((item) => item.id === 'risk-manprec-technical-workflow-completion');

    expect(risk).toMatchObject({
      severity: 'medium',
      status: 'open',
      relatedDimension: 'executionRisk',
    });
    expect(risk?.description).not.toMatch(/payment|invoice/i);
  });

  it('keeps Fibroptica commercial standing healthy with annual coverage through Sep 2027', () => {
    const commercial = latestCommercial('fibroptica');

    expect(commercial).toMatchObject({
      commercialStatus: 'healthy',
      paymentStatus: 'anualidad pagada confirmada hasta septiembre 2027',
      contractStatus: 'en revisión',
    });
    expect(getCustomerContext('fibroptica', '2026-09-09')?.commercial.commercialAttention).toEqual([]);
  });

  it('keeps ASCH pre_contract with no ProductMetric or Health', () => {
    const context = getCustomerContext('asch', '2026-09-09');

    expect(context?.commercial.latestSnapshot?.commercialStatus).toBe('pre_contract');
    expect(context?.productMetrics.latestSnapshot).toBeUndefined();
    expect(context?.health).toBeUndefined();
    expect(getProductMetricSnapshotsForCustomer('asch')).toEqual([]);
    expect(getHealthSnapshotsForCustomer('asch')).toEqual([]);
  });

  it('has Sep 9 planned WeeklyActions for all five customers', () => {
    expect(actionIdsForWeek('siemens', '2026-09-09')).toEqual([
      'wa-siemens-lam-followup-2026-09-09',
      'wa-siemens-procurement-connectors-2026-09-09',
    ]);
    expect(actionIdsForWeek('grupo-balle', '2026-09-09')).toEqual([
      'wa-balle-second-vault-entity-2026-09-09',
      'wa-balle-search-use-case-2026-09-09',
    ]);
    expect(actionIdsForWeek('manprec', '2026-09-09')).toEqual([
      'wa-manprec-technical-rerun-2026-09-09',
      'wa-manprec-manual-time-baseline-2026-09-09',
      'wa-manprec-payment-commitment-2026-09-09',
    ]);
    expect(actionIdsForWeek('fibroptica', '2026-09-09')).toEqual([
      'wa-fibroptica-reschedule-session-2026-09-09',
      'wa-fibroptica-contract-nda-review-2026-09-09',
      'wa-fibroptica-value-validation-2026-09-09',
    ]);
    expect(actionIdsForWeek('asch', '2026-09-09')).toEqual([
      'wa-asch-first-construction-case-2026-09-09',
      'wa-asch-observe-workflow-2026-09-09',
      'wa-asch-identify-first-value-2026-09-09',
      'wa-asch-happy-path-observations-2026-09-09',
      'wa-asch-product-opportunities-2026-09-09',
    ]);
  });

  it('updates ASCH prior discovery/kickoff action only to the supported outcome', () => {
    const action = getWeeklyActionsForCustomer('asch').find((item) => item.id === 'wa-asch-discovery-call');

    expect(action).toMatchObject({
      status: 'achieved',
      actualResult: 'Kickoff / onboarding ocurrió el martes 8 sep a las 11:00 y los siguientes pasos quedaron definidos.',
      resultNote: 'No implica que Construction Happy Path o First Value ya se hayan logrado.',
    });
  });

  it('leaves existing Sep 1 Health snapshots unchanged', () => {
    expect(getHealthSnapshotsForCustomer('siemens')[0]).toMatchObject({ id: 'siemens-2026-09-01', finalScore: 95 });
    expect(getHealthSnapshotsForCustomer('grupo-balle')[0]).toMatchObject({ id: 'grupo-balle-2026-09-01', finalScore: 77 });
    expect(getHealthSnapshotsForCustomer('manprec')[0]).toMatchObject({ id: 'manprec-2026-09-01', finalScore: 82 });
    expect(getHealthSnapshotsForCustomer('fibroptica')[0]).toMatchObject({ id: 'fibroptica-2026-09-01', finalScore: 76 });
  });

  it('updates duplicated Customer.projects totals only where ProductMetricSnapshot supports them', () => {
    expect(getCustomerById('siemens')?.projects?.total).toBe(71);
    expect(getCustomerById('grupo-balle')?.projects?.total).toBe(19);
    expect(getCustomerById('manprec')?.projects?.total).toBe(13);
    expect(getCustomerById('fibroptica')?.projects?.total).toBe(12);
    expect(getCustomerById('asch')?.projects?.total).toBeUndefined();
  });

  it('reflects reconciled facts in getWeeklyStatusDraft for Sep 9', () => {
    const draft = getWeeklyStatusDraft('2026-09-09');
    const manprec = draft.customerCards.find((customer) => customer.customerId === 'manprec');
    const asch = draft.customerCards.find((customer) => customer.customerId === 'asch');

    expect(manprec?.statusNow.commercial.value?.commercialStatus).toBe('attention');
    expect(manprec?.attention.commercialAttention.value).toHaveLength(1);
    expect(manprec?.plannedActions.value.map((review) => review.action.id)).toContain('wa-manprec-payment-commitment-2026-09-09');
    expect(asch?.statusNow.commercial.value?.commercialStatus).toBe('pre_contract');
    expect(asch?.activity.value).toEqual([]);
    expect(asch?.plannedActions.value.map((review) => review.action.id)).toContain('wa-asch-first-construction-case-2026-09-09');
  });
});
