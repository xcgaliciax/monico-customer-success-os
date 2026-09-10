import { formatMonoDateShort } from '../formatters';
import { getWeeklyStatusDraft, type DraftField, type SourceRef, type WeeklyDraftCustomerCard, type WeeklyStatusDraft } from './weeklyStatusDraft';
import type { CommercialStanding } from '../../types/commercialStatusSnapshot';
import type { OperatingStage } from '../../types/operatingStage';
import type { MissingInformationField } from './customerIntelligenceSelectors';
import type { WeeklyActionOutcome } from './weeklyReportContext';

export interface WeeklyStatusMarkdownOptions {
  includeSourceRefs?: boolean;
  includeTechnicalCaveats?: boolean;
}

const OPERATING_STAGE_LABELS: Record<OperatingStage, string> = {
  handoff: 'Handoff',
  ready: 'Ready',
  proving: 'Proving',
  first_value: 'First Value',
  adopting: 'Adopting',
  operating: 'Operating',
};

const COMMERCIAL_STANDING_LABELS: Record<CommercialStanding, string> = {
  healthy: 'Healthy',
  attention: 'Attention',
  critical: 'Critical',
  pre_contract: 'Pre-contract',
  unknown: 'Unknown',
};

const OUTCOME_LABELS: Record<WeeklyActionOutcome, string> = {
  achieved: 'Logrado',
  partial: 'Parcial',
  not_achieved: 'No logrado',
  unresolved: 'Pendiente',
  not_evaluable: 'No evaluable',
};

const MISSING_INFORMATION_LABELS: Record<MissingInformationField, string> = {
  productMetricSnapshot: 'Sin baseline de ProductMetric',
  commercialStatusSnapshot: 'Sin CommercialStatusSnapshot',
  operatingStage: 'Sin baseline de Operating Stage',
  healthSnapshot: 'Sin snapshot de Health',
  periodCoverage: 'Sin cobertura del periodo de actividad',
};

function formatDateRange(start: string, end: string): string {
  return `${formatMonoDateShort(start, { withYear: false })} – ${formatMonoDateShort(end)}`;
}

function refsLine(field: DraftField<unknown>, options: WeeklyStatusMarkdownOptions): string[] {
  if (!options.includeSourceRefs || !field.sourceRefs?.length) return [];
  return [`_Source refs: ${formatSourceRefs(field.sourceRefs)}_`];
}

function formatSourceRefs(sourceRefs: SourceRef[]): string {
  return sourceRefs.map((ref) => `${ref.entityType}:${ref.id}`).join(', ');
}

function renderPlaceholder(label: string, field: DraftField<undefined>): string[] {
  const placeholder = field.automationLevel === 'requires_interpretation' ? '[Requires interpretation]' : '[Requires human decision]';
  return [`${label}:`, placeholder, ''];
}

function renderPortfolio(draft: WeeklyStatusDraft, options: WeeklyStatusMarkdownOptions): string[] {
  const lines: string[] = ['## Resumen del portfolio', ''];
  const productMetrics = draft.portfolioSnapshot.productMetrics;
  const coverage = productMetrics.coverage;
  const historicalTotals = productMetrics.historicalTotals;
  const activityTotals = productMetrics.activityTotals;

  lines.push(`Clientes: ${draft.portfolioSnapshot.currentRosterCustomerCount.value}`);
  lines.push(`Cobertura de Product Metrics: ${coverage.customersWithActivityPeriodCoverage} / ${coverage.currentRosterCustomerCount} clientes`);
  lines.push('');

  lines.push('Métricas históricas de producto:');
  if (historicalTotals) {
    lines.push(`- Proyectos: ${historicalTotals.value.totals.projectsTotal}`);
    lines.push(`- Usuarios: ${historicalTotals.value.totals.usersTotal}`);
    lines.push(
      `- Cobertura: ${historicalTotals.value.aggregateCoverage.measuredCustomerCount} / ${historicalTotals.value.aggregateCoverage.rosterCustomerCount} clientes (${historicalTotals.value.aggregateCoverage.coverage})`,
    );
    lines.push(...refsLine(historicalTotals, options));
  } else {
    lines.push('- No medido');
  }
  lines.push('');

  lines.push(`Actividad ${formatDateRange(draft.activityPeriod.start, draft.activityPeriod.end)}:`);
  if (activityTotals) {
    lines.push(`- ${activityTotals.value.totals.projectsCreatedInPeriod} proyectos creados`);
    lines.push(`- ${activityTotals.value.totals.projectsCompletedInPeriod} proyectos completados`);
    lines.push(`- ${activityTotals.value.totals.projectsErroredInPeriod} errores de proyecto`);
    lines.push(
      `- Cobertura: ${activityTotals.value.aggregateCoverage.measuredCustomerCount} / ${activityTotals.value.aggregateCoverage.rosterCustomerCount} clientes (${activityTotals.value.aggregateCoverage.coverage})`,
    );
    lines.push(...refsLine(activityTotals, options));
  } else {
    lines.push('- No medido');
  }
  lines.push('');

  const missing = coverage.customersMissingActivityPeriodCoverage.map((customer) => customer.customerName).join(', ');
  lines.push('Cobertura:');
  lines.push(`- clientes medidos: ${coverage.customersWithActivityPeriodCoverage} / ${coverage.currentRosterCustomerCount}`);
  lines.push(`- faltantes: ${missing || 'Ninguno'}`);
  lines.push('');
  lines.push('Nota: la falta de Product Metrics no se trata como actividad cero.');
  if (!options.includeTechnicalCaveats) {
    lines.push('Evidence se muestra como canónica actual filtrada por fecha de fuente; la fecha histórica de publicación canónica es parcial.');
  }
  lines.push('');

  return lines;
}

function renderStatusNow(card: WeeklyDraftCustomerCard, options: WeeklyStatusMarkdownOptions): string[] {
  const lines: string[] = ['### Status actual', ''];
  const health = card.statusNow.health.value;
  const commercial = card.statusNow.commercial.value;
  const activitySnapshots = card.activity.value;

  lines.push('CS Health:');
  if (health) {
    lines.push(`- Score: ${health.finalScore}`);
    lines.push(`- Status: ${health.finalStatus}`);
    lines.push(`- Trend: ${health.trend}`);
    lines.push(`- Confidence: ${health.confidence}`);
    lines.push(...refsLine(card.statusNow.health, options));
  } else {
    lines.push('- No establecido');
  }
  lines.push('');

  lines.push('Commercial Standing:');
  if (commercial) {
    lines.push(`- Standing: ${COMMERCIAL_STANDING_LABELS[commercial.commercialStatus]}`);
    lines.push(`- Status de pago: ${commercial.paymentStatus}`);
    lines.push(`- Status de contrato: ${commercial.contractStatus}`);
    if (commercial.commercialRisk) lines.push(`- Risk comercial: ${commercial.commercialRisk}`);
    if (commercial.nextCommercialAction) lines.push(`- Siguiente acción comercial: ${commercial.nextCommercialAction}`);
    lines.push(...refsLine(card.statusNow.commercial, options));
  } else {
    lines.push('- No establecido');
  }
  lines.push('');

  lines.push('Actividad de producto:');
  if (activitySnapshots.length > 0) {
    const totals = activitySnapshots.reduce(
      (sum, snapshot) => ({
        projectsCreatedInWindow: sum.projectsCreatedInWindow + snapshot.projectsCreatedInWindow,
        projectsCompletedInWindow: sum.projectsCompletedInWindow + snapshot.projectsCompletedInWindow,
        projectsErroredInWindow: sum.projectsErroredInWindow + snapshot.projectsErroredInWindow,
      }),
      { projectsCreatedInWindow: 0, projectsCompletedInWindow: 0, projectsErroredInWindow: 0 },
    );
    lines.push(`- Proyectos creados: ${totals.projectsCreatedInWindow}`);
    lines.push(`- Completados: ${totals.projectsCompletedInWindow}`);
    lines.push(`- Errores de proyecto: ${totals.projectsErroredInWindow}`);
    lines.push(...refsLine(card.activity, options));
  } else {
    lines.push('- No medido para este periodo.');
  }
  lines.push('');

  return lines;
}

function comparisonLabel(path: string): string {
  const labels: Record<string, string> = {
    operatingStage: 'Operating Stage',
    'commercial.commercialStatus': 'Commercial Standing',
    'commercial.paymentStatus': 'Payment status',
    'commercial.contractStatus': 'Contract status',
    'health.finalScore': 'Health score',
    'health.finalStatus': 'Health status',
    'health.trend': 'Health trend',
    'health.confidence': 'Health confidence',
    'productMetrics.platformHealth': 'Platform Health',
    'productMetrics.projectsTotal': 'Projects total',
    'productMetrics.usersTotal': 'Users total',
  };
  return labels[path] ?? path;
}

function renderWhatChanged(card: WeeklyDraftCustomerCard, options: WeeklyStatusMarkdownOptions): string[] {
  const lines: string[] = ['### Qué cambió', ''];

  if (card.whatChanged.changedFacts.value.length === 0) {
    lines.push('No se detectaron cambios históricos confiables.');
  } else {
    for (const fact of card.whatChanged.changedFacts.value) {
      lines.push(`- ${comparisonLabel(fact.path)}: ${String(fact.previous)} → ${String(fact.current)}`);
    }
  }
  lines.push('');

  if (card.whatChanged.notComparableFacts.value.length > 0) {
    if (options.includeTechnicalCaveats) {
      lines.push('Comparación histórica no disponible:');
      for (const fact of card.whatChanged.notComparableFacts.value) {
        lines.push(`- ${comparisonLabel(fact.path)}: sin baseline histórica comparable`);
      }
    } else {
      lines.push('Sin baseline histórica comparable para esta primera revisión.');
    }
    lines.push('');
  }

  return lines;
}

function renderEvidence(card: WeeklyDraftCustomerCard, options: WeeklyStatusMarkdownOptions): string[] {
  const lines: string[] = ['### Evidence / Signals', ''];
  if (options.includeTechnicalCaveats) {
    lines.push('Evidence shown is currently canonical and filtered by source date.');
    lines.push('Historical canonical publication timing is only partially reconstructable.');
    lines.push('');
  }

  const evidence = card.evidence.currentlyCanonicalFilteredBySourceDate.value;
  if (evidence.length === 0) {
    lines.push('Sin Evidence canónica registrada actualmente.');
  } else {
    for (const item of evidence) {
      lines.push(`- ${item.statement}`);
    }
    lines.push(...refsLine(card.evidence.currentlyCanonicalFilteredBySourceDate, options));
  }
  lines.push('');

  return lines;
}

function renderAttention(card: WeeklyDraftCustomerCard, options: WeeklyStatusMarkdownOptions): string[] {
  const lines: string[] = ['### Attention', ''];

  lines.push('Risk attention:');
  if (card.attention.riskAttention.value.length === 0) {
    lines.push('- Ninguno registrado actualmente.');
  } else {
    for (const item of card.attention.riskAttention.value) {
      lines.push(`- ${item.title} (${item.severity}): ${item.cause}`);
    }
    lines.push(...refsLine(card.attention.riskAttention, options));
  }
  lines.push('');

  lines.push('Commercial attention:');
  if (card.attention.commercialAttention.value.length === 0) {
    lines.push('- Ninguna registrada actualmente.');
  } else {
    for (const item of card.attention.commercialAttention.value) {
      lines.push(`- ${COMMERCIAL_STANDING_LABELS[item.commercialStatus]}${item.cause ? `: ${item.cause}` : ''}`);
    }
    lines.push(...refsLine(card.attention.commercialAttention, options));
  }
  lines.push('');

  return lines;
}

function renderActions(card: WeeklyDraftCustomerCard, options: WeeklyStatusMarkdownOptions): string[] {
  const lines: string[] = ['### Review de acciones anteriores', ''];

  if (card.reviewedActions.value.length === 0) {
    lines.push('Sin Weekly Actions revisadas registradas para este ciclo.');
  } else {
    for (const review of card.reviewedActions.value) {
      lines.push(`- Acción: ${review.action.action}`);
      lines.push(`  - Resultado esperado: ${review.expectedResult}`);
      lines.push(`  - Resultado: ${OUTCOME_LABELS[review.outcome]} (${review.status})`);
      if (review.actualResult) lines.push(`  - Resultado real: ${review.actualResult}`);
      if (review.resultNote) lines.push(`  - Nota de resultado: ${review.resultNote}`);
    }
    lines.push(...refsLine(card.reviewedActions, options));
  }
  lines.push('');

  lines.push('### Próximos 7 días');
  lines.push('');
  if (card.plannedActions.value.length === 0) {
    lines.push('Sin Weekly Actions planeadas registradas para este ciclo.');
  } else {
    for (const review of card.plannedActions.value) {
      lines.push(`- Acción: ${review.action.action}`);
      lines.push(`  - Resultado esperado: ${review.expectedResult}`);
    }
    lines.push(...refsLine(card.plannedActions, options));
  }
  lines.push('');

  lines.push('Candidatos a revisar:');
  if (card.carryForwardCandidates.value.length === 0) {
    lines.push('- Ninguno.');
  } else {
    for (const review of card.carryForwardCandidates.value) {
      lines.push(`- ${review.action.action} (${OUTCOME_LABELS[review.outcome]})`);
    }
    lines.push(...refsLine(card.carryForwardCandidates, options));
  }
  lines.push('');

  return lines;
}

function renderDataGaps(card: WeeklyDraftCustomerCard, options: WeeklyStatusMarkdownOptions): string[] {
  const lines: string[] = ['### Datos faltantes', ''];
  if (card.dataGaps.value.length === 0) {
    lines.push('Sin datos faltantes registrados actualmente.');
  } else {
    for (const item of card.dataGaps.value) {
      lines.push(`- ${MISSING_INFORMATION_LABELS[item.field]}`);
    }
    lines.push(...refsLine(card.dataGaps, options));
  }
  lines.push('');
  return lines;
}

function renderCustomerHumanPlaceholders(card: WeeklyDraftCustomerCard, draft: WeeklyStatusDraft, options: WeeklyStatusMarkdownOptions): string[] {
  const human = draft.humanSections.customerNarratives.find((section) => section.customerId === card.customerId);
  if (!human) return [];

  if (!options.includeTechnicalCaveats) {
    return [
      '### Pendiente de revisión humana',
      '',
      '- Narrative / interpretación',
      '- CS Focus',
      '- siguientes acciones, si aplica',
      '',
    ];
  }

  return [
    '### Pendiente de revisión humana',
    '',
    ...renderPlaceholder('Customer narrative', human.narrative),
    ...renderPlaceholder('CS Focus', human.csFocus),
    ...renderPlaceholder('New recommended actions', human.newRecommendedActions),
    ...renderPlaceholder('Management conclusion', human.managementConclusion),
  ];
}

function renderCustomer(card: WeeklyDraftCustomerCard, draft: WeeklyStatusDraft, options: WeeklyStatusMarkdownOptions): string[] {
  const stage = card.currentOperatingStage.value ? OPERATING_STAGE_LABELS[card.currentOperatingStage.value] : 'No establecido';

  return [
    `## ${card.customerName}`,
    '',
    `Operating Stage: ${stage}`,
    '',
    ...renderStatusNow(card, options),
    ...renderWhatChanged(card, options),
    ...renderEvidence(card, options),
    ...renderAttention(card, options),
    ...renderActions(card, options),
    ...renderDataGaps(card, options),
    ...renderCustomerHumanPlaceholders(card, draft, options),
  ];
}

function renderHumanReview(draft: WeeklyStatusDraft, options: WeeklyStatusMarkdownOptions): string[] {
  if (!options.includeTechnicalCaveats) {
    return [
      '## Revisión humana',
      '',
      'Pendiente de revisión humana:',
      '- Narrative / interpretación del portfolio',
      '- prioridades ejecutivas',
      '- decisiones de Customer Success, si aplica',
      '',
    ];
  }

  return [
    '## Revisión humana',
    '',
    ...renderPlaceholder('Portfolio narrative', draft.humanSections.portfolioNarrative),
    ...renderPlaceholder('Executive priorities', draft.humanSections.executivePriorities),
  ];
}

export function renderWeeklyStatusMarkdown(draft: WeeklyStatusDraft, options: WeeklyStatusMarkdownOptions = {}): string {
  const lines: string[] = [
    '# Weekly Customer Status',
    '',
    `Fecha del reporte: ${formatMonoDateShort(draft.reportDate)}`,
    `Actividad de producto: ${formatDateRange(draft.activityPeriod.start, draft.activityPeriod.end)}`,
    '',
    ...renderPortfolio(draft, options),
  ];

  for (const card of draft.customerCards) {
    lines.push(...renderCustomer(card, draft, options));
  }

  lines.push(...renderHumanReview(draft, options));

  return lines.join('\n').replace(/\n{3,}/g, '\n\n').trimEnd();
}

export function getWeeklyStatusMarkdown(reportDate: string, options?: WeeklyStatusMarkdownOptions): string {
  return renderWeeklyStatusMarkdown(getWeeklyStatusDraft(reportDate), options);
}
