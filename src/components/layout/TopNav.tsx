import { NavLink } from 'react-router-dom';
import { formatMonoDateShort } from '../../lib/formatters';
import { getPortfolioSnapshotDate } from '../../lib/portfolio';

const NAV_ITEMS = [
  { to: '/', label: 'Panel', end: true },
  { to: '/accounts', label: 'Cuentas', end: false },
  { to: '/signals', label: 'Señales', end: false },
];

// Spec §02 "Shell de aplicación": 52px height, white surface, hairline bottom.
// Mark + wordmark + "Customer Success OS" rótulo on the left; global nav at 13px;
// snapshot indicator + 28px avatar on the right. No side rail — account nav is
// horizontal (CustomerTabs), not part of this shell.
export function TopNav() {
  const snapshotDate = getPortfolioSnapshotDate();

  return (
    <header className="flex h-[52px] items-center justify-between border-b border-grey-3 bg-white px-[32px]">
      <div className="flex items-center gap-5">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-monico-blue text-sm font-bold text-white">m</span>
          <span className="text-base font-bold tracking-tight text-ink">monico</span>
          <span aria-hidden="true" className="mx-1 h-4 w-px bg-grey-3" />
          <span className="text-[9px] font-semibold uppercase tracking-[0.14em] text-grey-5">Customer Success OS</span>
        </div>
        <nav aria-label="Primary" className="flex items-center gap-[22px]">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => ['text-[13px] font-medium transition-colors', isActive ? 'text-monico-blue' : 'text-grey-6 hover:text-ink'].join(' ')}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
      <div className="flex items-center gap-3">
        {snapshotDate && (
          <p className="text-xs text-grey-5">
            Snapshot <span className="font-mono text-grey-6">{formatMonoDateShort(snapshotDate)}</span>
          </p>
        )}
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-grey-2 text-[11px] font-semibold text-grey-6">CG</span>
      </div>
    </header>
  );
}
