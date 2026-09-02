import { NavLink } from 'react-router-dom';

export type CustomerTabKey = 'resumen' | 'salud' | 'adopcion' | 'valor' | 'riesgos' | 'evidencia' | 'comercial' | 'historial';

const TABS: Array<{ key: CustomerTabKey; label: string }> = [
  { key: 'resumen', label: 'Resumen' },
  { key: 'salud', label: 'Salud' },
  { key: 'adopcion', label: 'Adopción' },
  { key: 'valor', label: 'Valor' },
  { key: 'riesgos', label: 'Riesgos' },
  { key: 'evidencia', label: 'Evidencia' },
  { key: 'comercial', label: 'Comercial' },
  { key: 'historial', label: 'Historial' },
];

// Spec §02/§17: eight short tabs, 14px, gap 30px, hairline under the whole row.
// Active = blue-700 text + 2px blue bottom border (margin-bottom -1px so it sits on
// the hairline). No counters, no pills.
export function CustomerTabs({ customerId }: { customerId: string }) {
  return (
    <nav aria-label="Customer 360" className="flex gap-[30px] border-b border-grey-3">
      {TABS.map((tab) => (
        <NavLink
          key={tab.key}
          to={`/customers/${customerId}/${tab.key}`}
          className={({ isActive }) =>
            [
              'pb-3 text-sm font-medium transition-colors',
              isActive ? '-mb-px border-b-2 border-monico-blue text-monico-blue' : 'text-grey-6 hover:text-ink',
            ].join(' ')
          }
        >
          {tab.label}
        </NavLink>
      ))}
    </nav>
  );
}
