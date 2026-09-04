import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-24 text-center">
      <p className="eyebrow">404</p>
      <h1 className="mt-4 text-5xl font-semibold tracking-[-0.05em]">
        This challenge is not available.
      </h1>
      <Link
        className="mt-8 inline-block text-mint underline underline-offset-4"
        to="/"
      >
        Return to today’s mission
      </Link>
    </div>
  )
}
