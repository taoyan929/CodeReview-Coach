import { Link, Outlet } from 'react-router-dom'

export function AppShell() {
  return (
    <div className="min-h-screen bg-ink text-paper">
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5 lg:px-10">
          <Link
            className="font-mono text-sm font-semibold tracking-[0.16em] uppercase"
            to="/"
          >
            CodeReview Coach
          </Link>
          <span className="rounded-full border border-mint/30 bg-mint/10 px-3 py-1 font-mono text-xs text-mint">
            M3 adaptive path
          </span>
        </div>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  )
}
