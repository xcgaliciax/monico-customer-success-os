// Small, deliberately unobtrusive disclosure: this feature persists to the
// browser's localStorage, not a database — a real backend will replace it later
// (see services/customerUpdateStore.ts), but until then a refresh on a different
// browser/device won't show the same data, and clearing site data loses it.
export function PrototypeNotice() {
  return <p className="text-[11px] text-grey-5">Actualizaciones guardadas localmente en este prototipo.</p>;
}
