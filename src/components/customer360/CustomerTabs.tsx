import { NavLink } from 'react-router-dom';

export type CustomerTabKey = 'resumen' | 'health' | 'adoption' | 'value' | 'risks' | 'evidence' | 'commercial' | 'history';

const TABS: Array<{ key: CustomerTabKey; label: string }> = [
  { key: 'resumen', label: 'Resumen' },
  { key: 'health', label: 'Salud' },
  { key: 'adoption', label: 'Adopción' },
  { key: 'value', label: 'Valor' },
  { key: 'risks', label: 'Riesgos' },
  { key: 'evidence', label: 'Evidencia' },
  { key: 'commercial', label: 'Comercial' },
  { key: 'history', label: 'Historial' },
];

// Spec §02/§17: eight short tabs, 14px, gap 30px, hairline under the whole row.
// Active = blue-700 text + 2px blue bottom border (margin-bottom -1px so it sits on
// the hairline). No counters, no pills. Resumen has no slug — it's the base path.
export function CustomerTabs({ customerId }: { customerId: string }) {
  return (
    <nav aria-label="Customer 360" className="flex gap-[30px] border-b border-grey-3">
      {TABS.map((tab) => (
        <NavLink
          key={tab.key}
          to={tab.key === 'resumen' ? `/customers/${customerId}` : `/customers/${customerId}/${tab.key}`}
          end={tab.key === 'resumen'}
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
