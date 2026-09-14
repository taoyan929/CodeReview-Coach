> Status: MVP aligned · Last reviewed: 2026-09-14 · Imported from [Linear](https://linear.app/taoyan929/document/05-system-architecture-490a6909f516).
>
> Repository Markdown is the implementation reference. Material product changes should be reflected in both this document and the matching Linear issue or project document.

# CodeReview Coach — System Architecture

## 1. Architecture goals

* local-first MVP with no backend dependency
* deterministic and testable learning logic
* one engine across languages/frameworks
* clear separation between UI, learning rules and persistence
* future backend/AI/GitHub integrations can replace adapters without rewriting core UI
* exercise content is data, not hard-coded page logic

## 2. MVP high-level architecture

```text
React UI
  ↓
Application / Use Cases
  ↓
Domain Engines
  ├─ Scoring Engine
  ├─ Progress & Mastery Engine
  ├─ Recommendation Engine
  ├─ Mission / Unlock Engine
  └─ Exercise Validation
  ↓
Repositories / Adapters
  ├─ Local Exercise Repository
  └─ localStorage Learner Repository
```

## 3. Frontend stack

* React
* TypeScript
* Vite
* Tailwind CSS
* React Router (recommended for page-level navigation)
* schema validation library such as Zod (recommended)
* syntax-highlighted code/diff renderer; choose implementation during UI spike
* unit/integration testing with Vitest + React Testing Library (recommended)

Avoid introducing a global state library until app complexity proves it necessary. React context/hooks or a small store can be added behind application services if needed.

## 4. Suggested source structure

```text
src/
  app/
    router/
    providers/
  pages/
    dashboard/
    mission/
    challenge/
    feedback/
    fix/
    progress/
    learning-path/
    exercises/
  components/
    code-review/
    progress/
    missions/
    common/
  domain/
    exercise/
    review/
    scoring/
    mastery/
    recommendations/
    missions/
  services/
    scoringEngine.ts
    masteryEngine.ts
    recommendationEngine.ts
    missionEngine.ts
  repositories/
    ExerciseRepository.ts
    LearnerStateRepository.ts
    localExerciseRepository.ts
    localStorageLearnerRepository.ts
  data/
    exercises/
    curriculum/
  schemas/
  types/
  utils/
```

## 5. Domain boundaries

### Exercise domain

Owns challenge content, files, expected findings, hints, prerequisites and curriculum metadata.

### Review domain

Owns learner review findings, independently selected locations, categories, diagnosis/reasoning/fix and review decisions.

### Scoring domain

Pure functions where possible. Converts learner findings + expected findings into structured scoring results.

### Progress/mastery domain

Updates completion, mastery and weak-topic state after an attempt.

The implemented `deriveLearningProgress` service is pure over learner state, exercises, curriculum and time. `synchroniseLearnerProgress` writes its completion, mastery, weak-topic, streak, weekly-goal and unlock snapshot through `LearnerStateRepository`; pages consume the derived read model rather than recalculating history during render.

### Recommendation domain

Consumes learner state + curriculum to produce ranked next-exercise candidates and explainable reasons.

### Mission domain

Builds Daily/Weekly Missions and evaluates unlocks/streak state.

## 6. Persistence strategy — MVP

### Exercises

Static versioned JSON/TypeScript data bundled with the app and validated at startup/build time.

### Learner state

Persist locally through a repository abstraction backed by localStorage.

Recommended stored domains:

* profile/settings
* exercise attempts
* completion
* mastery snapshots
* weak topics
* streak/activity
* daily/weekly mission state
* unlocks

Include a `schemaVersion` so future migrations are possible.

## 7. Key interfaces

```text
ExerciseRepository
- listExercises(filters)
- getExercise(id)
- getCurriculum()

LearnerStateRepository
- getState()
- saveState(state)
- reset()

ScoringEngine
- evaluate(exercise, submission) -> EvaluationResult

ProgressEngine
- applyAttempt(state, exercise, evaluation) -> LearnerState

RecommendationEngine
- recommend(state, curriculum, options) -> Recommendation[]

MissionEngine
- buildDailyMission(state, recommendations) -> Mission
- evaluateUnlocks(state) -> Unlock[]
```

## 8. State-update sequence

```text
Submit review
→ scoringEngine.evaluate
→ feedback UI
→ optional retry/final reveal
→ fix step
→ progressEngine.applyAttempt
→ learnerRepository.save
→ recommendationEngine.recommend
→ missionEngine update
→ dashboard refresh
```

## 9. Exercise content safety

Code snippets and future repository content must be treated as display data, never executed automatically in the browser.

If executable sandboxes/tests are introduced later:

* use isolated sandbox execution
* apply resource/time limits
* never evaluate arbitrary code directly in the app origin

## 10. Future backend architecture

When cloud accounts/AI are required:

```text
React Client
   ↓ HTTPS
Application API
   ├─ Auth/User Service
   ├─ Learning/Progress Service
   ├─ Exercise Service
   ├─ AI Coach Orchestrator
   └─ Integration Service (GitHub)
        ↓
Database + LLM Provider + GitHub API
```

The client should keep the same domain types where possible. Local repositories become HTTP-backed adapters.

## 11. Future AI boundary

Do not call an LLM directly from UI components.

Use an `AiCoachService` interface:

```text
assessReview(input) -> StructuredAiAssessment
generateExercise(input) -> ExerciseDraft
rankRecommendations(input) -> RecommendationRanking
```

Server-side orchestration is preferred once secret API credentials are required.

## 12. Future GitHub/PR boundary

Normalise external PR data into the internal challenge model:

```text
GitHub PR
→ Integration Adapter
→ ReviewChallenge / CodeFile[]
→ existing Review Workspace
```

This avoids building a separate learning system for real repositories.

## 13. Non-functional requirements

* responsive desktop-first UI
* keyboard-accessible review interaction
* fast local startup
* deterministic core scoring tests
* versioned persistence migrations
* validated exercise content
* no secrets in client bundle
* clear error/empty/recovery states
* privacy-conscious future telemetry

## 14. Architecture decision summary

For MVP, keep the system intentionally simple: **frontend app + domain engines + static exercises + localStorage adapters**. The sophistication belongs in the learning model, not unnecessary infrastructure.
