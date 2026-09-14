> Status: MVP aligned · Last reviewed: 2026-09-14 · Imported from [Linear](https://linear.app/taoyan929/document/01-product-requirements-and-mvp-scope-93bfa652acda).
>
> Repository Markdown is the implementation reference. Material product changes should be reflected in both this document and the matching Linear issue or project document.

# CodeReview Coach — Product Requirements & MVP Scope

## 1. Product vision

CodeReview Coach is a developer learning product for junior and graduate software engineers working in an AI-assisted coding environment. The product trains learners to **read, reason about, review, explain and fix code** rather than simply generate code or memorise syntax.

Longer term, the product can evolve into an **AI Coding Literacy Platform**: a system that trains developers to safely inspect and supervise AI-generated software.

## 2. Target users

Primary:

* junior software developers
* graduate developers
* CS / applied computing students
* bootcamp graduates
* developers who can build with AI tools but lack confidence reviewing generated code

Secondary future users:

* interview candidates
* bootcamps and universities
* graduate onboarding programmes
* engineering teams training junior developers

## 3. Product principles

1. **Think first, AI second** — AI feedback never appears before the learner attempts a review.
2. **Judge understanding, not wording** — technical correctness is separate from English or communication quality.
3. **Scaffold, then remove scaffolding** — guided review at beginner level, realistic PR review at advanced level.
4. **Completion is not mastery** — show both curriculum completion and quality of performance.
5. **One learning engine, many tracks** — frontend, backend, API, database, testing and security use the same exercise model.
6. **Progress should be visible** — every session should contribute to a clear learning path.
7. **Gamification supports learning** — missions, streaks and unlocks should motivate practice without encouraging guessing.

## 4. MVP technology scope

Frontend application:

* React
* TypeScript
* Vite
* Tailwind CSS
* localStorage persistence
* no account/backend dependency required for MVP

MVP learning tracks:

* JavaScript
* TypeScript
* React
* Python
* FastAPI
* REST API
* SQL
* MongoDB / Cosmos DB concepts
* Testing
* Security

## 5. Learning levels

### Level 1 — Code Literacy

Goal: understand what code does and recognise common mistakes.

### Level 2 — Technology Review

Goal: identify bugs, edge cases and implementation-quality problems in a particular technology.

### Level 3 — Software Engineering Review

Goal: review realistic multi-file changes across Requirement → Frontend → API → Backend → Database → Tests.

## 6. Core learning loop

 1. Learner opens Today’s Mission.
 2. Reads requirement/context.
 3. Inspects code or diff.
 4. Selects one or more suspicious lines independently.
 5. Adds one or more review findings.
 6. Uses hints only if needed.
 7. Submits review.
 8. Receives staged feedback.
 9. Retries or reveals final reference review.
10. Fixes the code.
11. Completion/mastery are updated.
12. Rule engine recommends the next exercise.

## 7. Structured review model

Beginner review findings may contain:

* selected line(s)
* issue category
* diagnosis / what is wrong
* optional impact
* optional suggested fix

Intermediate mode reduces structure. Advanced mode becomes PR-style inline review with minimal guidance.

## 8. Progress model

Two distinct product metrics:

### Curriculum Completion

Percentage of the built-in learning path completed. The complete curated MVP curriculum represents 100%.

### Review Mastery

Quality of learner performance based on issue detection, reasoning, fixes, attempts, difficulty and hint usage.

The product must never present completion percentage as equivalent to engineering skill level.

## 9. Rule-based adaptive learning — MVP

Before AI, use deterministic recommendations:

* low score → easier or same-concept review
* repeated misses → weak topic and higher priority
* high score/no hints → increased difficulty
* sufficient completion/mastery → unlock next level/cross-topic exercise
* stale weak topics → return to daily mission
* rotate mission types to reduce monotony

## 10. Motivation layer

Professional/developer-oriented features:

* Daily Mission (1–3 tasks)
* Weekly Goal
* learning streak
* track/level unlocks
* Bug Hunt
* Ship or Block?
* Production Bug
* Security Incident
* Review the AI
* Quick Fix
* Full-Stack Boss Review

## 11. MVP success criteria

The MVP is successful if a learner can:

* understand what they should practise today
* submit a structured code review without needing perfect English
* understand which findings they got right or missed
* actively fix code after feedback
* see overall and track-level completion
* see mastery and weak areas separately
* receive a useful next-exercise recommendation without AI
* return regularly because the path feels achievable and varied

## 12. Out of scope for first MVP

* required user account/authentication
* cloud sync
* AI semantic grading
* AI-generated exercises
* real GitHub repository ingestion
* team/admin dashboards
* payments/subscriptions

These are designed as later phases, not blockers for the MVP.
