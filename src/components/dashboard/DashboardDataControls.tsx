import { useRef, useState, type ChangeEvent } from 'react'
import { useRevalidator } from 'react-router-dom'

import { tracks, type Track } from '../../domain/exercise/types'
import type { LearnerState } from '../../domain/learning/types'
import { learnerStateRepository } from '../../repositories'
import { updateLearnerPreferences } from '../../services/updateLearnerPreferences'
import { downloadTextFile } from '../../utils/downloadText'
import { formatLabel } from '../../utils/formatLabel'

export function DashboardDataControls({
  learnerState,
}: {
  learnerState: LearnerState
}) {
  const revalidator = useRevalidator()
  const inputRef = useRef<HTMLInputElement>(null)
  const [preferredTracks, setPreferredTracks] = useState<Track[]>(
    learnerState.profile.preferredTracks,
  )
  const [dailyTargetMinutes, setDailyTargetMinutes] = useState<10 | 20 | 30>(
    learnerState.profile.dailyTargetMinutes === 10 ||
      learnerState.profile.dailyTargetMinutes === 30
      ? learnerState.profile.dailyTargetMinutes
      : 20,
  )
  const [confirmReset, setConfirmReset] = useState(false)
  const [status, setStatus] = useState<string>()
  const [error, setError] = useState<string>()

  function toggleTrack(track: Track) {
    setPreferredTracks((current) =>
      current.includes(track)
        ? current.filter((item) => item !== track)
        : [...current, track],
    )
  }
  async function saveSettings() {
    await updateLearnerPreferences(learnerStateRepository, {
      preferredTracks,
      dailyTargetMinutes,
    })
    setStatus(
      learnerState.dailyMission?.completedExerciseIds.length
        ? 'Settings saved. Today’s started mission is unchanged; recommendations update tomorrow.'
        : 'Settings saved and today’s unstarted mission was refreshed.',
    )
    await revalidator.revalidate()
  }
  async function exportBackup() {
    downloadTextFile(
      await learnerStateRepository.exportBackup(),
      `codereview-coach-backup-${new Date().toISOString().slice(0, 10)}.json`,
    )
    setStatus('Backup downloaded.')
  }
  async function importBackup(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    setError(undefined)
    try {
      await learnerStateRepository.restoreBackup(await file.text())
      setStatus('Backup restored successfully.')
      await revalidator.revalidate()
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : 'The backup could not be restored.',
      )
    } finally {
      event.target.value = ''
    }
  }
  async function reset() {
    if (!confirmReset) {
      setConfirmReset(true)
      return
    }
    await learnerStateRepository.reset()
    setConfirmReset(false)
    setStatus('Learning progress reset.')
    await revalidator.revalidate()
  }

  return (
    <section
      aria-labelledby="data-controls-heading"
      className="mt-16 grid gap-6 border-t border-white/10 pt-10 lg:grid-cols-2"
    >
      <article className="rounded-3xl border border-white/10 bg-white/[0.025] p-6">
        <p className="eyebrow">Learning settings</p>
        <h2 className="mt-3 text-xl font-semibold" id="data-controls-heading">
          Shape future missions
        </h2>
        <fieldset className="mt-6">
          <legend className="text-sm font-semibold">
            Preferred technology tracks
          </legend>
          <div className="mt-3 flex flex-wrap gap-2">
            {tracks.map((track) => (
              <label
                className={`cursor-pointer rounded-full border px-3 py-2 text-xs ${preferredTracks.includes(track) ? 'border-mint/40 bg-mint/[0.08] text-mint' : 'border-white/10 text-paper/50'}`}
                key={track}
              >
                <input
                  checked={preferredTracks.includes(track)}
                  className="sr-only"
                  onChange={() => toggleTrack(track)}
                  type="checkbox"
                />
                {formatLabel(track)}
              </label>
            ))}
          </div>
        </fieldset>
        <label
          className="mt-6 block text-sm font-semibold"
          htmlFor="daily-target"
        >
          Daily learning target
        </label>
        <select
          className="mt-2 w-full rounded-xl border border-white/10 bg-ink px-3 py-2.5"
          id="daily-target"
          onChange={(event) =>
            setDailyTargetMinutes(Number(event.target.value) as 10 | 20 | 30)
          }
          value={dailyTargetMinutes}
        >
          <option value={10}>10 minutes</option>
          <option value={20}>20 minutes</option>
          <option value={30}>30 minutes</option>
        </select>
        <button
          className="mt-5 rounded-full bg-mint px-5 py-2.5 font-semibold text-ink"
          onClick={saveSettings}
          type="button"
        >
          Save settings
        </button>
      </article>
      <article className="rounded-3xl border border-white/10 bg-white/[0.025] p-6">
        <p className="eyebrow">Data controls</p>
        <h2 className="mt-3 text-xl font-semibold">
          Keep your local progress portable
        </h2>
        <p className="mt-3 text-sm leading-6 text-paper/50">
          Download a JSON backup before clearing browser data. Imports are
          validated before your current state is replaced.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            className="rounded-full border border-white/15 px-4 py-2 text-sm"
            onClick={exportBackup}
            type="button"
          >
            Download backup
          </button>
          <button
            className="rounded-full border border-white/15 px-4 py-2 text-sm"
            onClick={() => inputRef.current?.click()}
            type="button"
          >
            Import backup
          </button>
          <input
            accept="application/json,.json"
            aria-label="Choose learner backup file"
            className="sr-only"
            onChange={importBackup}
            ref={inputRef}
            type="file"
          />
          <button
            className={`rounded-full border px-4 py-2 text-sm ${confirmReset ? 'border-red-300/40 bg-red-300/10 text-red-200' : 'border-white/15 text-paper/55'}`}
            onBlur={() => setConfirmReset(false)}
            onClick={reset}
            type="button"
          >
            {confirmReset ? 'Confirm reset' : 'Reset progress'}
          </button>
        </div>
        {error && (
          <p className="mt-4 text-sm text-red-300" role="alert">
            {error} Your current progress was not changed.
          </p>
        )}
        {status && (
          <p
            aria-live="polite"
            className="mt-4 text-sm text-mint"
            role="status"
          >
            {status}
          </p>
        )}
      </article>
    </section>
  )
}
