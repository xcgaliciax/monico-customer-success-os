import { useParams } from 'react-router-dom';
import { Timeline } from '../../components/customer360/Timeline';
import { buildCustomerHistoryView } from '../../lib/customer360';
import type { HistoryEntry } from '../../lib/customer360';

function groupByMonth(entries: HistoryEntry[]): Array<{ month: string; entries: HistoryEntry[] }> {
  const groups: Array<{ month: string; entries: HistoryEntry[] }> = [];
  for (const entry of entries) {
    const last = groups[groups.length - 1];
    if (last && last.month === entry.monthGroup) {
      last.entries.push(entry);
    } else {
      groups.push({ month: entry.monthGroup, entries: [entry] });
    }
  }
  return groups;
}

export function HistorialPage() {
  const { customerId } = useParams<{ customerId: string }>();
  const view = customerId ? buildCustomerHistoryView(customerId) : undefined;

  if (!view) {
    return (
      <div className="rounded-xl border border-grey-3 bg-white px-6 py-16 text-center">
        <p className="text-sm text-grey-5">Historial no disponible aún para esta cuenta en este prototipo.</p>
      </div>
    );
  }

  const groups = groupByMonth([...view.entries].reverse());

  return (
    <div className="space-y-8">
      {!view.hasNumericHistory && (
        <p className="text-sm text-grey-5">
          Histórico numérico insuficiente para tendencia: sólo existe un snapshot de HealthScore aprobado. Los eventos abajo son marcadores
          direccionales, no puntajes históricos.
        </p>
      )}

      {groups.length === 0 && <p className="text-sm text-grey-5">Sin eventos registrados todavía.</p>}

      {groups.map((group) => (
        <div key={group.month}>
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-grey-5">{group.month}</p>
          <div className="mt-2">
            <Timeline events={group.entries} />
          </div>
        </div>
      ))}
    </div>
  );
}
