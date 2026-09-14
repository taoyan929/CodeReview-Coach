import { learningRules } from '../../config/learningRules'
import type {
  LearningProgressSnapshot,
  ProgressStatus,
} from '../../services/deriveLearningProgress'
import { formatLabel } from '../../utils/formatLabel'

const labels: Record<ProgressStatus, string> = {
  locked: 'Locked',
  available: 'Available',
  'in-progress': 'In progress',
  complete: 'Complete',
}

function gateText(index: number, progress: LearningProgressSnapshot) {
  if (index === 1) {
    const prior = progress.byLevel[0]
    const gate = learningRules.unlocks.technologyReview
    return `Code Literacy ${prior?.completion ?? 0}% / ${gate.completion}% completion · ${prior?.mastery ?? 0}% / ${gate.mastery}% mastery`
  }
  if (index === 2) {
    const prior = progress.byLevel[1]
    const gate = learningRules.unlocks.softwareEngineeringReview
    return `Technology Review ${prior?.completion ?? 0}% / ${gate.completion}% completion · ${prior?.mastery ?? 0}% / ${gate.mastery}% mastery`
  }
  return 'Ready to begin.'
}

export function DashboardLearningPathSection({
  progress,
}: {
  progress: LearningProgressSnapshot
}) {
  return (
    <section
      aria-labelledby="learning-path-heading"
      className="mt-16 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]"
    >
      <article className="rounded-3xl border border-white/10 bg-white/[0.025] p-6">
        <p className="eyebrow">Learning path</p>
        <h2 className="sr-only" id="learning-path-heading">
          Learning path and unlocks
        </h2>
        <div className="mt-6 space-y-3">
          {progress.byLevel.map((level, index) => (
            <div
              className="flex items-center gap-4 rounded-2xl border border-white/10 p-4"
              key={level.id}
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white/[0.06] font-mono text-xs text-mint">
                {index + 1}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-semibold">{formatLabel(level.id)}</h3>
                  <span className="font-mono text-[10px] text-paper/40 uppercase">
                    {labels[level.status]}
                  </span>
                </div>
                <p className="mt-1 text-xs text-paper/45">
                  {level.status === 'locked'
                    ? gateText(index, progress)
                    : `${level.completedExercises}/${level.totalExercises} complete · ${level.mastery === undefined ? 'mastery pending' : `${level.mastery}% mastery`}`}
                </p>
              </div>
            </div>
          ))}
          <div className="rounded-2xl border border-dashed border-white/10 p-4">
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-semibold">Full-Stack Boss Review</h3>
              <span className="font-mono text-[10px] text-paper/35 uppercase">
                {labels[progress.bossReviewStatus]}
              </span>
            </div>
            <p className="mt-2 text-xs text-paper/40">
              Curriculum {progress.curriculumCompletion}% /{' '}
              {learningRules.unlocks.bossReview.curriculumCompletion}% · mastery{' '}
              {progress.reviewMastery ?? 0}% /{' '}
              {learningRules.unlocks.bossReview.mastery}% · Software Engineering
              Review must be unlocked.
            </p>
          </div>
        </div>
      </article>
      <article className="rounded-3xl border border-white/10 bg-white/[0.025] p-6">
        <p className="eyebrow">Focus areas</p>
        {progress.weakConcepts.length || progress.weakTracks.length ? (
          <div className="mt-6 space-y-4">
            <div className="flex flex-wrap gap-2">
              {progress.weakConcepts.map((item) => (
                <span
                  className="rounded-full border border-amber-200/20 bg-amber-200/[0.06] px-3 py-1.5 text-xs text-amber-100/80"
                  key={item.concept}
                >
                  {formatLabel(item.concept)} · missed {item.missCount}
                </span>
              ))}
            </div>
            <p className="text-sm text-paper/55">
              {progress.weakTracks.map(formatLabel).join(', ')}
            </p>
          </div>
        ) : (
          <div className="mt-6 rounded-2xl border border-mint/15 bg-mint/[0.05] p-5">
            <p className="font-semibold text-mint">No weak areas yet</p>
            <p className="mt-2 text-sm leading-6 text-paper/50">
              Submit more reviews to build a reliable mastery signal.
            </p>
          </div>
        )}
      </article>
    </section>
  )
}
