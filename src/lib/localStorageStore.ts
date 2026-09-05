// Generic, dependency-free localStorage boundary. Nothing outside this file
// should call window.localStorage directly — React components never do, and
// neither does anything in services/*. That keeps every consumer of this
// prototype persistence swappable for a real API/database later by rewriting
// only this file (the read/write signatures are deliberately simple enough to
// become async without changing what a "collection" means to its callers).
//
// Namespaced and versioned so a future incompatible shape change can bump the
// prefix without colliding with whatever a browser already has stored.
const NAMESPACE = 'monico:customer-update:v1';

function keyFor(collection: string): string {
  return `${NAMESPACE}:${collection}`;
}

// Best-effort: localStorage can throw (private browsing, quota, disabled) or be
// absent (non-browser context). A read failure degrades to an empty collection
// rather than crashing the page; a write failure is silently dropped — the
// caller's own in-memory value for this render still works, only persistence
// across a refresh is lost. This is a known v0.1 prototype-persistence limitation.
export function readCollection<T>(collection: string): T[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(keyFor(collection));
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

export function writeCollection<T>(collection: string, items: T[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(keyFor(collection), JSON.stringify(items));
  } catch {
    // Prototype persistence is best-effort only — see file header.
  }
}
