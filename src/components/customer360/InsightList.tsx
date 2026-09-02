import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export interface InsightListItem {
  id: string;
  statement: string;
  context?: string;
  href?: string;
}

// Spec §10 "Patrón de insight": a closed operational conclusion, 17/600 ink, with an
// optional 13px grey-5 context line. Maximum three per section, enforced by callers.
export function InsightList({ items }: { items: InsightListItem[] }) {
  return (
    <div>
      {items.map((item, index) => {
        const content = (
          <div
            className={[
              'flex items-start justify-between gap-4 py-4',
              index < items.length - 1 ? 'border-b border-grey-2' : '',
            ].join(' ')}
          >
            <div>
              <p className="text-[17px] font-semibold leading-[1.35] text-ink">{item.statement}</p>
              {item.context && <p className="mt-1 text-sm text-grey-5">{item.context}</p>}
            </div>
            {item.href && <ChevronRight className="mt-1 h-4 w-4 flex-none text-grey-4" aria-hidden="true" />}
          </div>
        );
        return item.href ? (
          <Link key={item.id} to={item.href} className="block hover:bg-grey-1">
            {content}
          </Link>
        ) : (
          <div key={item.id}>{content}</div>
        );
      })}
    </div>
  );
}
