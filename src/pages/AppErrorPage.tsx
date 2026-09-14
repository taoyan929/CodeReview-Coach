import { useState } from 'react'
import { isRouteErrorResponse, Link, useRouteError } from 'react-router-dom'

import { learnerStateRepository } from '../repositories'
import { downloadTextFile } from '../utils/downloadText'

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
  const [confirmReset, setConfirmReset] = useState(false)
  const [actionError, setActionError] = useState<string>()

  async function downloadRawData() {
    const rawData = await learnerStateRepository.exportRawData()
    if (!rawData) {
      setActionError('No stored learner data was found to download.')
      return
    }
    downloadTextFile(
      rawData,
      `codereview-coach-raw-recovery-${new Date().toISOString().slice(0, 10)}.json`,
    )
  }

  async function resetAndRecover() {
    if (!confirmReset) {
      setConfirmReset(true)
      return
    }
    await learnerStateRepository.reset()
    window.location.assign('/')
  }

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
        <ol className="mt-7 space-y-2 text-sm leading-6 text-paper/60">
          <li>1. Download the raw data for safekeeping or support.</li>
          <li>2. Reset only when you are ready to start with a clean state.</li>
        </ol>
        <div className="mt-8 flex flex-wrap gap-3">
          <button
            className="rounded-full border border-white/15 px-5 py-2.5"
            onClick={downloadRawData}
            type="button"
          >
            Download raw data
          </button>
          <button
            className={`rounded-full border px-5 py-2.5 ${confirmReset ? 'border-red-300/40 bg-red-300/10 text-red-200' : 'border-white/15'}`}
            onClick={resetAndRecover}
            type="button"
          >
            {confirmReset
              ? 'Confirm reset and reopen'
              : 'Reset and recover app'}
          </button>
          <Link
            className="rounded-full px-5 py-2.5 text-mint underline underline-offset-4"
            to="/"
          >
            Try again
          </Link>
        </div>
        {actionError && (
          <p className="mt-4 text-sm text-red-300" role="alert">
            {actionError}
          </p>
        )}
      </div>
    </main>
  )
}
