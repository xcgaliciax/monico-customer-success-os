export function DeepTabPlaceholder({ tabLabel }: { tabLabel: string }) {
  return (
    <div className="rounded-xl border border-grey-3 bg-white px-6 py-16 text-center">
      <h1 className="text-lg font-semibold text-ink">{tabLabel}</h1>
      <p className="mt-2 text-sm text-grey-5">Esta sección aún no está implementada en este prototipo.</p>
    </div>
  );
}
