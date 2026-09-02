import { Outlet } from 'react-router-dom';
import { TopNav } from './TopNav';

// Spec §02: 1440 canonical width, 56px horizontal page padding (chrome 32px lives in
// TopNav itself). Breakpoints 1280-1439 relax padding to 40px; below 1024 is not a
// v0.1 target.
export function AppShell() {
  return (
    <div className="min-h-screen bg-canvas text-ink">
      <TopNav />
      <main className="mx-auto max-w-[1440px] px-10 py-2 xl:px-14">
        <Outlet />
      </main>
    </div>
  );
}
