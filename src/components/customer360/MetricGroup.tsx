import { MetricItem, type MetricItemProps } from './MetricItem';

// Spec §06 "Tira alineada": grid of 3-5 columns with a top hairline and vertical
// dividers between columns. Used whenever metrics share the same question — never
// one card per metric.
export function MetricGroup({ items }: { items: MetricItemProps[] }) {
  return (
    <div
      className="grid border-t border-grey-2 divide-x divide-grey-2"
      style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}
    >
      {items.map((item) => (
        <MetricItem key={item.label} {...item} />
      ))}
    </div>
  );
}
