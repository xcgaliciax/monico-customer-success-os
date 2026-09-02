import type { ReactNode } from 'react';

export interface DataTableColumn<T> {
  key: string;
  header: string;
  align?: 'left' | 'right';
  widthClassName?: string; // e.g. "w-48" for identity/state columns; omit for the 1fr evidence column
  render: (row: T) => ReactNode;
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  rows: T[];
  getRowKey: (row: T) => string;
  emptyLabel?: string;
}

// Spec §08: the canonical table pattern every product table derives from. 1px
// grey-3 border, 12px radius, grey-2 header, no zebra, hover fill only, no shadow.
export function DataTable<T>({ columns, rows, getRowKey, emptyLabel }: DataTableProps<T>) {
  return (
    <div className="overflow-hidden overflow-x-auto rounded-xl border border-grey-3">
      <table className="w-full min-w-[640px] border-collapse">
        <thead className="bg-grey-2">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className={[
                  'border-b border-grey-3 px-[18px] py-[9px] text-[10px] font-semibold uppercase tracking-[0.06em] text-grey-5',
                  column.align === 'right' ? 'text-right' : 'text-left',
                  column.widthClassName ?? '',
                ].join(' ')}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr>
              <td colSpan={columns.length} className="px-[18px] py-[13px] text-sm text-grey-5">
                {emptyLabel ?? 'Sin registros en este periodo'}
              </td>
            </tr>
          )}
          {rows.map((row, index) => (
            <tr
              key={getRowKey(row)}
              className={index < rows.length - 1 ? 'border-b border-grey-2 hover:bg-grey-1' : 'hover:bg-grey-1'}
            >
              {columns.map((column) => (
                <td
                  key={column.key}
                  className={[
                    'px-[18px] py-[13px] text-[13px] text-ink tabular-nums',
                    column.align === 'right' ? 'text-right' : 'text-left',
                  ].join(' ')}
                >
                  {column.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
