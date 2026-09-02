import { NavLink } from 'react-router-dom';

const NAV_ITEMS = [
  { to: '/', label: 'Portfolio' },
  { to: '/insights', label: 'Insights' },
  { to: '/evidence', label: 'Evidence' },
];

export function TopNav() {
  return (
    <header className="border-b border-border bg-surface">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-8 py-4">
        <div className="leading-tight">
          <div className="text-lg font-semibold tracking-tight text-ink">monico</div>
          <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted">
            Customer Success OS
          </div>
        </div>
        <nav aria-label="Primary" className="flex items-center gap-1">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                [
                  'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                  isActive ? 'bg-accent-soft text-accent' : 'text-muted hover:bg-surface-soft hover:text-ink',
                ].join(' ')
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}
