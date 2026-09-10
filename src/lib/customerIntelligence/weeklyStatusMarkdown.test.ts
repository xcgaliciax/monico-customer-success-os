import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { getWeeklyStatusDraft } from './weeklyStatusDraft';
import { getWeeklyStatusMarkdown, renderWeeklyStatusMarkdown } from './weeklyStatusMarkdown';

function readSource(relativePath: string): string {
  return readFileSync(fileURLToPath(new URL(relativePath, import.meta.url)), 'utf-8');
}

describe('getWeeklyStatusMarkdown — Sep 9 benchmark', () => {
  it('renders the portfolio snapshot with metric coverage and totals', () => {
    const markdown = getWeeklyStatusMarkdown('2026-09-09');

    expect(markdown).toContain('# Weekly Customer Status');
    expect(markdown).toContain('Fecha del reporte: 9 sep 2026');
    expect(markdown).toContain('Actividad de producto: 2 sep – 8 sep 2026');
    expect(markdown).toContain('## Resumen del portfolio');
    expect(markdown).toContain('Clientes: 5');
    expect(markdown).toContain('Cobertura de Product Metrics: 4 / 5 clientes');
    expect(markdown).toContain('- Proyectos: 115');
    expect(markdown).toContain('- Usuarios: 55');
    expect(markdown).toContain('- 7 proyectos creados');
    expect(markdown).toContain('- 5 proyectos completados');
    expect(markdown).toContain('- 2 errores de proyecto');
    expect(markdown).toContain('- faltantes: ASCH');
    expect(markdown).toContain('Nota: la falta de Product Metrics no se trata como actividad cero.');
  });

  it('renders Manprec facts without inventing planned actions or expected results', () => {
    const markdown = getWeeklyStatusMarkdown('2026-09-09');

    expect(markdown).toContain('## Manprec');
    expect(markdown).toContain('- Proyectos creados: 3');
    expect(markdown).toContain('- Completados: 1');
    expect(markdown).toContain('- Errores de proyecto: 2');
    expect(markdown).toContain('Commercial Standing:');
    expect(markdown).toContain('- Standing: Healthy');
    expect(markdown).toContain('Resultado: Parcial (partial)');
    expect(markdown).toContain('Sin Weekly Actions planeadas registradas para este ciclo.');
  });

  it('renders Grupo Balle activity facts', () => {
    const markdown = getWeeklyStatusMarkdown('2026-09-09');

    expect(markdown).toContain('## Grupo Balle');
    expect(markdown).toContain('- Proyectos creados: 2');
    expect(markdown).toContain('- Completados: 2');
    expect(markdown).toContain('- Errores de proyecto: 0');
  });

  it('renders Siemens observed zero activity without converting it into a synthetic Risk', () => {
    const markdown = getWeeklyStatusMarkdown('2026-09-09');
    const siemensSection = markdown.slice(markdown.indexOf('## Siemens'), markdown.indexOf('## Grupo Balle'));

    expect(siemensSection).toContain('- Proyectos creados: 0');
    expect(siemensSection).toContain('- Completados: 0');
    expect(siemensSection).toContain('- Errores de proyecto: 0');
    expect(siemensSection).not.toContain('zero activity');
  });

  it('renders Fibroptica not_achieved as No logrado', () => {
    const markdown = getWeeklyStatusMarkdown('2026-09-09');

    expect(markdown).toContain('## Fibroptica');
    expect(markdown).toContain('- Proyectos creados: 2');
    expect(markdown).toContain('- Completados: 2');
    expect(markdown).toContain('- Errores de proyecto: 0');
    expect(markdown).toContain('Resultado: No logrado (not_achieved)');
  });

  it('renders ASCH as ready/pre-contract with no measured Product Metrics or Health', () => {
    const markdown = getWeeklyStatusMarkdown('2026-09-09');
    const aschSection = markdown.slice(markdown.indexOf('## ASCH'), markdown.indexOf('## Revisión humana'));

    expect(aschSection).toContain('Operating Stage: Ready');
    expect(aschSection).toContain('- Standing: Pre-contract');
    expect(aschSection).toContain('Actividad de producto:');
    expect(aschSection).toContain('- No medido para este periodo.');
    expect(aschSection).toContain('CS Health:');
    expect(aschSection).toContain('- No establecido');
    expect(aschSection).toContain('- Sin baseline de ProductMetric');
    expect(aschSection).toContain('- Sin snapshot de Health');
    expect(aschSection).not.toContain('- Proyectos creados: 0');
  });
});

describe('renderWeeklyStatusMarkdown — governance', () => {
  it('renders one compact Evidence caveat in normal mode without per-customer repetition', () => {
    const markdown = getWeeklyStatusMarkdown('2026-09-09');
    const globalCaveat = 'Evidence se muestra como canónica actual filtrada por fecha de fuente; la fecha histórica de publicación canónica es parcial.';

    expect(markdown).toContain(globalCaveat);
    expect(markdown.match(/Evidence se muestra como canónica actual/g) ?? []).toHaveLength(1);
    expect(markdown).not.toContain('Evidence shown is currently canonical and filtered by source date.');
    expect(markdown).not.toContain('Historical canonical publication timing is only partially reconstructable.');
    expect(markdown).not.toMatch(/newly canonical/i);
  });

  it('can render technical Evidence caveats in debug mode', () => {
    const markdown = getWeeklyStatusMarkdown('2026-09-09', { includeTechnicalCaveats: true });

    expect(markdown).toContain('Evidence shown is currently canonical and filtered by source date.');
    expect(markdown).toContain('Historical canonical publication timing is only partially reconstructable.');
    expect(markdown).not.toMatch(/newly canonical/i);
  });

  it('renders compact human placeholders in normal mode', () => {
    const markdown = getWeeklyStatusMarkdown('2026-09-09');

    expect(markdown).toContain('### Pendiente de revisión humana');
    expect(markdown).toContain('- Narrative / interpretación');
    expect(markdown).toContain('- CS Focus');
    expect(markdown).toContain('- siguientes acciones, si aplica');
    expect(markdown).not.toContain('Customer narrative:\n[Requires interpretation]');
    expect(markdown).not.toContain('New recommended actions:\n[Requires human decision]');
    expect(markdown).not.toContain('Portfolio narrative:\n[Requires interpretation]');
  });

  it('can render detailed human placeholders in debug mode', () => {
    const markdown = getWeeklyStatusMarkdown('2026-09-09', { includeTechnicalCaveats: true });

    expect(markdown).toContain('Customer narrative:\n[Requires interpretation]');
    expect(markdown).toContain('CS Focus:\n[Requires human decision]');
    expect(markdown).toContain('New recommended actions:\n[Requires human decision]');
    expect(markdown).toContain('Management conclusion:\n[Requires human decision]');
    expect(markdown).toContain('Portfolio narrative:\n[Requires interpretation]');
    expect(markdown).toContain('Executive priorities:\n[Requires human decision]');
  });

  it('renders first-review comparison gaps compactly in normal mode', () => {
    const markdown = getWeeklyStatusMarkdown('2026-09-09');

    expect(markdown).toContain('Sin baseline histórica comparable para esta primera revisión.');
    expect(markdown).not.toContain('- Operating Stage: sin baseline histórica comparable');
  });

  it('can render detailed comparison gaps in debug mode', () => {
    const markdown = getWeeklyStatusMarkdown('2026-09-09', { includeTechnicalCaveats: true });

    expect(markdown).toContain('Comparación histórica no disponible:');
    expect(markdown).toContain('- Operating Stage: sin baseline histórica comparable');
  });

  it('hides source refs by default and includes them only when requested', () => {
    const defaultMarkdown = getWeeklyStatusMarkdown('2026-09-09');
    const debugMarkdown = getWeeklyStatusMarkdown('2026-09-09', { includeSourceRefs: true });

    expect(defaultMarkdown).not.toContain('_Source refs:');
    expect(debugMarkdown).toContain('_Source refs: product_metric_snapshot:metrics-siemens-2026-09-08');
    expect(debugMarkdown).toContain('weekly_action:wa-manprec-first-invoice');
  });

  it('can render a prebuilt draft without data access', () => {
    const draft = getWeeklyStatusDraft('2026-09-09');
    const markdown = renderWeeklyStatusMarkdown(draft);

    expect(markdown).toContain('# Weekly Customer Status');
    expect(markdown).toContain('## Resumen del portfolio');
  });

  it('does not import or alter the Health engine', () => {
    expect(readSource('./weeklyStatusMarkdown.ts')).not.toMatch(/from ['"].*healthEngine['"]/);
    expect(readSource('../healthEngine.ts')).not.toContain('WeeklyStatusMarkdown');
  });
});
