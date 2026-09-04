import { isRouteErrorResponse, Link, useRouteError } from 'react-router-dom'

function getErrorMessage(error: unknown): string {
  if (isRouteErrorResponse(error)) {
    return error.statusText || 'The requested page could not be loaded.'
  }

  if (error instanceof Error) {
    return error.message
  }

  return 'An unexpected application error occurred.'
}

export function AppErrorPage() {
  const error = useRouteError()

  return (
    <main className="min-h-screen bg-ink px-6 py-24 text-paper">
      <div className="mx-auto max-w-2xl rounded-3xl border border-white/10 bg-white/[0.04] p-8">
        <p className="eyebrow">Unable to load</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-[-0.045em]">
          Your learning state needs attention.
        </h1>
        <p className="mt-5 leading-7 text-paper/65">{getErrorMessage(error)}</p>
        <p className="mt-3 text-sm leading-6 text-paper/45">
          The app keeps incompatible data instead of silently deleting learning
          history. A supported migration or an intentional reset is required.
        </p>
        <Link
          className="mt-8 inline-block text-mint underline underline-offset-4"
          to="/"
        >
          Try again
        </Link>
      </div>
    </main>
  )
}
