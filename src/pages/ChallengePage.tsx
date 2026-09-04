import { Link, useLoaderData } from 'react-router-dom'

import type { Exercise } from '../domain/exercise/types'
import { formatLabel } from '../utils/formatLabel'

interface ChallengeLoaderData {
  exercise: Exercise
}

export function ChallengePage() {
  const { exercise } = useLoaderData() as ChallengeLoaderData
  const file = exercise.files[0]

  if (!file) {
    throw new Error('Validated exercise has no code file')
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-10 lg:px-10 lg:py-14">
      <Link
        className="text-sm text-paper/55 underline-offset-4 hover:text-paper hover:underline"
        to="/"
      >
        ← Back to mission
      </Link>

      <div className="mt-10 grid gap-8 lg:grid-cols-[0.72fr_1.28fr]">
        <section>
          <p className="eyebrow">{formatLabel(exercise.missionType)}</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-[-0.045em]">
            {exercise.title}
          </h1>
          <p className="mt-6 leading-7 text-paper/65">
            {exercise.requirement.description}
          </p>

          <h2 className="mt-9 text-sm font-semibold tracking-[0.14em] uppercase">
            Acceptance criteria
          </h2>
          <ul className="mt-4 space-y-3 text-sm leading-6 text-paper/65">
            {exercise.requirement.acceptanceCriteria?.map((criterion) => (
              <li className="flex gap-3" key={criterion}>
                <span className="text-mint" aria-hidden="true">
                  □
                </span>
                {criterion}
              </li>
            ))}
          </ul>

          <div className="mt-10 rounded-2xl border border-amber-300/20 bg-amber-300/[0.07] p-4 text-sm leading-6 text-amber-100/80">
            Review input and staged feedback arrive in TAO-20 and TAO-21. This
            M1 slice proves validated content and routing first.
          </div>
        </section>

        <section
          aria-label={`Code in ${file.path}`}
          className="overflow-hidden rounded-3xl border border-white/10 bg-[#0d0f13]"
        >
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
            <p className="font-mono text-xs text-paper/55">{file.path}</p>
            <span className="font-mono text-xs text-mint">{file.language}</span>
          </div>
          <pre className="overflow-x-auto p-5 text-[13px] leading-6 text-[#d9dfeb] sm:p-7">
            <code>
              {file.content.split('\n').map((line, index) => (
                <span className="code-line" key={`${index}-${line}`}>
                  <span className="line-number" aria-hidden="true">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span>{line || ' '}</span>
                </span>
              ))}
            </code>
          </pre>
        </section>
      </div>
    </div>
  )
}
