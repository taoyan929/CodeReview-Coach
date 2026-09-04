> Status: Draft · Last reviewed: 2026-09-04 · Imported from [Linear](https://linear.app/taoyan929/document/07-api-and-service-contracts-9f9304c2ec86).
>
> Repository Markdown is the implementation reference. Material product changes should be reflected in both this document and the matching Linear issue or project document.

# CodeReview Coach — API & Service Contracts

## 1. MVP position

The first MVP is local-first and does **not require a network backend**. However, the application should use explicit service/repository contracts so a future API can replace local adapters without rewriting the UI.

This document defines:

1. internal TypeScript service contracts for MVP
2. proposed future HTTP API contracts
3. future AI and GitHub integration boundaries

## 2. MVP internal service contracts

### ExerciseRepository

```ts
interface ExerciseRepository {
  getExercise(id: string): Promise<Exercise | null>;
  listExercises(filters?: ExerciseFilters): Promise<Exercise[]>;
  getCurriculum(): Promise<Curriculum>;
}
```

### LearnerStateRepository

```ts
interface LearnerStateRepository {
  load(): Promise<LearnerState>;
  save(state: LearnerState): Promise<void>;
  reset(): Promise<void>;
}
```

### ScoringEngine

```ts
interface ScoringEngine {
  evaluate(
    exercise: Exercise,
    attempt: ExerciseAttempt
  ): EvaluationResult;
}
```

### ProgressEngine

```ts
interface ProgressEngine {
  applyAttempt(
    state: LearnerState,
    exercise: Exercise,
    evaluation: EvaluationResult
  ): LearnerState;
}
```

### RecommendationEngine

```ts
interface RecommendationEngine {
  recommend(
    state: LearnerState,
    curriculum: Curriculum,
    exercises: Exercise[],
    options?: RecommendationOptions
  ): Recommendation[];
}
```

### MissionEngine

```ts
interface MissionEngine {
  buildDailyMission(
    state: LearnerState,
    recommendations: Recommendation[]
  ): MissionState;

  evaluateUnlocks(
    state: LearnerState,
    curriculum: Curriculum
  ): UnlockResult[];
}
```

These interfaces are the MVP “API”. UI components should call application/use-case functions rather than directly reading/writing localStorage.

## 3. Proposed future HTTP API

Base path:

```text
/api/v1
```

### Health

```http
GET /api/v1/health
```

Response:

```json
{ "status": "ok" }
```

## 4. User/profile APIs — future

Once authentication/cloud sync is introduced:

```http
GET /api/v1/me
PATCH /api/v1/me/preferences
```

Possible profile fields:

* display name
* preferred tracks
* learning goal
* preferred daily target
* UI preferences

Authentication mechanism is intentionally not selected in MVP documentation; choose based on deployment platform later.

## 5. Exercise APIs — future

```http
GET /api/v1/exercises
GET /api/v1/exercises/{exerciseId}
GET /api/v1/curriculum
```

Example filters:

```text
?track=fastapi
&level=technology-review
&difficulty=2
&missionType=bug-hunt
&status=incomplete
```

Important: learner-facing exercise response must not leak hidden expected findings/reference answers before the reveal state.

Recommended split:

* public learner exercise payload
* protected evaluation/reference payload server-side

## 6. Attempt APIs — future

### Start attempt

```http
POST /api/v1/exercises/{exerciseId}/attempts
```

### Save draft

```http
PATCH /api/v1/attempts/{attemptId}
```

### Submit review

```http
POST /api/v1/attempts/{attemptId}/submit
```

Body:

```json
{
  "findings": [
    {
      "fileId": "users-route",
      "location": { "startLine": 14, "endLine": 14 },
      "category": "error-handling",
      "diagnosis": "User not found is not handled",
      "impact": "The endpoint may return the wrong response",
      "suggestedFix": "Return 404 when the user does not exist"
    }
  ],
  "overallDecision": "request-changes"
}
```

Response should initially support staged feedback and must not automatically reveal every missed finding unless reveal criteria are met.

### Reveal final feedback

```http
POST /api/v1/attempts/{attemptId}/reveal
```

### Submit fix

```http
POST /api/v1/attempts/{attemptId}/fix
```

## 7. Hint APIs — future

```http
POST /api/v1/attempts/{attemptId}/hints
```

Body:

```json
{
  "expectedFindingId": "finding-2",
  "requestedLevel": 1
}
```

Server returns only the next permitted hint, records usage and prevents skipping directly to hidden answer material unless product rules allow it.

## 8. Progress APIs — future

```http
GET /api/v1/progress
GET /api/v1/progress/tracks
GET /api/v1/progress/concepts
GET /api/v1/history
```

Progress response should distinguish:

```json
{
  "curriculumCompletion": 42,
  "reviewMastery": 71,
  "masteryStatus": "measured",
  "weakConcepts": ["api-error-handling", "authorization"],
  "streakDays": 6
}
```

Do not return mastery as `0` when the learner has insufficient attempts; use an explicit insufficient-data state.

## 9. Recommendation and mission APIs — future

```http
GET /api/v1/recommendations
GET /api/v1/missions/today
GET /api/v1/goals/week
```

Recommendation item:

```json
{
  "exerciseId": "fastapi-404-02",
  "reasonCode": "repeated-weak-concept",
  "reasonText": "You missed API error handling in two recent reviews.",
  "priority": 0.92
}
```

Rule-based implementation remains the default/fallback even after AI is introduced.

## 10. AI Coach API — M4

Client should never call the LLM provider directly with a secret key.

Application endpoint:

```http
POST /api/v1/ai/review-assessment
```

Input should contain only the information needed to assess the learner response:

* learner finding
* deterministic matching result
* expected concept metadata
* exercise context needed for interpretation

Do not require the model to re-grade deterministic line/category facts.

Structured response:

```json
{
  "confidence": 0.91,
  "diagnosisMatch": 0.9,
  "reasoningQuality": 0.7,
  "fixQuality": 0.8,
  "communication": {
    "clarity": 0.65,
    "suggestedRewrite": "What happens if the user does not exist? Consider returning a 404 response."
  }
}
```

AI technical assessment should be merged with deterministic scoring through a documented policy, not directly displayed as truth.

## 11. AI generation APIs — M5

```http
POST /api/v1/ai/exercises/generate
POST /api/v1/ai/recommendations/rank
```

Generated exercise workflow:

1. AI returns an `ExerciseDraft`.
2. Server validates schema.
3. Content validation/safety checks run.
4. If validation fails, fall back to curated content.
5. Only then expose the challenge to the learner.

## 12. GitHub / PR APIs — M5

Possible application endpoints:

```http
POST /api/v1/integrations/github/connect
POST /api/v1/pr-challenges/import
GET  /api/v1/pr-challenges/{id}
```

External PR content should be normalised into the same internal `Exercise/ReviewChallenge` representation used by curated exercises.

Never execute imported repository code automatically.

## 13. Error contract

Recommended standard API error shape:

```json
{
  "error": {
    "code": "EXERCISE_NOT_FOUND",
    "message": "Exercise not found",
    "details": null,
    "requestId": "..."
  }
}
```

Use appropriate HTTP status codes and avoid exposing internal exception details.

## 14. API security requirements — future backend

* secrets only server-side
* authenticated learner data access
* authorization on every user-specific resource
* rate limits for AI endpoints
* request/body size limits for imported PR data
* sanitise/render external code as text
* no arbitrary code execution in API workers
* audit/provider usage around AI calls if productised
* minimise learner text sent to model providers

## 15. Versioning

* HTTP API versioned under `/api/v1`
* exercise/curriculum schemas separately versioned
* AI prompt/model changes should not silently alter stored evaluation semantics

## 16. Implementation recommendation

Do not build these HTTP endpoints for the MVP merely because they are documented. First implement the matching local service interfaces. Introduce the backend only when an actual feature—accounts, cloud sync, AI or GitHub integration—requires it.

