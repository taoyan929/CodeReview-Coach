> Status: Draft · Last reviewed: 2026-09-04 · Imported from [Linear](https://linear.app/taoyan929/document/10-delivery-plan-and-dependency-map-192411f89558).
>
> Repository Markdown is the implementation reference. Material product changes should be reflected in both this document and the matching Linear issue or project document.

# Delivery Plan & Dependency Map

## Delivery strategy

Build the product in vertical slices, but keep the domain/data contracts stable enough that later UI and AI work does not require a rewrite.

## M1 — Foundation & Learning Engine

### Outcomes

* React/TypeScript/Vite app shell
* architecture folders/interfaces
* validated exercise/curriculum schema
* learner-state schema + persistence versioning
* first full-stack curated exercise pack

### Primary issues

* [TAO-17](https://linear.app/taoyan929/issue/TAO-17/bootstrap-react-typescript-application) Bootstrap application
* [TAO-18](https://linear.app/taoyan929/issue/TAO-18/define-exercise-curriculum-and-learning-state-data-model) Exercise/curriculum/learning-state model
* [TAO-19](https://linear.app/taoyan929/issue/TAO-19/create-first-full-stack-review-exercise-pack) Initial full-stack exercise pack

### Dependency rule

[TAO-18](https://linear.app/taoyan929/issue/TAO-18/define-exercise-curriculum-and-learning-state-data-model) data contracts should be agreed before large-scale [TAO-19](https://linear.app/taoyan929/issue/TAO-19/create-first-full-stack-review-exercise-pack) content creation and before M2 UI becomes tightly coupled to temporary shapes.

## M2 — Review Experience

### Outcomes

* challenge brief
* independently selectable code lines
* structured beginner review
* intermediate/advanced scaffolding modes
* deterministic evaluation
* staged feedback
* fix-the-code step

### Primary issues

* [TAO-20](https://linear.app/taoyan929/issue/TAO-20/build-structured-daily-review-workspace) Structured review workspace
* [TAO-21](https://linear.app/taoyan929/issue/TAO-21/implement-deterministic-review-scoring-and-coaching-feedback) Deterministic scoring and coaching feedback
* [TAO-22](https://linear.app/taoyan929/issue/TAO-22/add-fix-the-code-practice-step) Fix-the-code practice

### Recommended build order

1. Build one “golden” exercise end-to-end.
2. Add independent multi-line finding interaction.
3. Implement deterministic finding evaluation.
4. Implement staged feedback.
5. Add fix step.
6. Only then generalise across the full exercise pack.

## M3 — Progress, Adaptive Path & MVP Polish

### Outcomes

* completion vs mastery
* weak-topic tracking
* rule-based recommendation engine
* Daily Mission / Weekly Goal
* streaks/unlocks
* mission variety
* Boss Review
* testing/accessibility/polish

### Primary issues

* [TAO-23](https://linear.app/taoyan929/issue/TAO-23/build-curriculum-progress-mastery-and-weak-topic-tracking) Progress/mastery/weak topics ✅
* [TAO-25](https://linear.app/taoyan929/issue/TAO-25/implement-rule-based-adaptive-learning-path-and-daily-recommendations) Rule-based adaptive path ✅
* [TAO-26](https://linear.app/taoyan929/issue/TAO-26/add-developer-style-missions-streaks-and-boss-reviews) Missions/streaks/Boss Reviews
* [TAO-24](https://linear.app/taoyan929/issue/TAO-24/polish-test-and-prepare-mvp-release) MVP quality/release

### Recommended build order

1. Persist attempt history.
2. Calculate completion.
3. Calculate concept/track mastery.
4. Identify weak topics.
5. Generate recommendations.
6. Build Daily Mission.
7. Add unlocks/Boss Review.
8. Polish dashboard/progress/learning-path UI.

## MVP release gate

M1–M3 should produce a complete non-AI product that can be used daily.

Do not make M4 a requirement for first usable release.

## M4 — AI Coach

### Outcomes

* semantic interpretation of learner explanations
* multilingual understanding
* communication coaching
* structured AI result merged with deterministic scoring

### Primary issue

* [TAO-27](https://linear.app/taoyan929/issue/TAO-27/add-ai-semantic-evaluation-and-multilingual-coaching) AI semantic evaluation and multilingual coaching

### Entry criteria

* deterministic scoring is stable
* real learner wording exposes specific limitations
* benchmark cases exist
* backend/server-side secret strategy selected

## M5 — Adaptive AI & Real PR

### Outcomes

* AI adaptive generation/personalisation
* real PR/repository mode
* learner vs reference vs AI comparison

### Primary issues

* [TAO-28](https://linear.app/taoyan929/issue/TAO-28/add-ai-adaptive-exercise-generation-and-personalised-missions) AI adaptive exercise generation
* [TAO-29](https://linear.app/taoyan929/issue/TAO-29/add-real-pr-and-repository-review-mode) Real PR/repository review mode

### Entry criteria

* curated curriculum provides reliable baseline
* AI Coach quality measured
* multi-file internal challenge model is stable

## Architecture dependencies

```text
Exercise/Data Model (TAO-18)
        ↓
Review Workspace (TAO-20)
        ↓
Scoring (TAO-21)
        ↓
Fix Step (TAO-22)
        ↓
Attempt History / Progress (TAO-23)
        ↓
Recommendation Engine (TAO-25)
        ↓
Missions / Unlocks (TAO-26)
        ↓
MVP Polish (TAO-24)
        ↓
AI Coach (TAO-27)
        ↓
AI Adaptive / Real PR (TAO-28/29)
```

Exercise content ([TAO-19](https://linear.app/taoyan929/issue/TAO-19/create-first-full-stack-review-exercise-pack)) can proceed in parallel after the schema stabilises, but the first few exercises should be used as golden test cases rather than creating all content before the learning loop works.

## Recommended first development slice

Implement exactly one beginner FastAPI or React challenge through the full flow:

Dashboard placeholder
→ Challenge Brief
→ select line
→ structured finding
→ deterministic feedback
→ final reveal
→ fix code
→ persist completion

This slice validates architecture earlier than building all dashboard/progress visuals first.

## Documentation source of truth

Use Linear docs as product/architecture source of truth and keep repository README/docs aligned during implementation.

Relevant docs:

* 01 Product Requirements & MVP Scope
* 02 Core UI & UX Specification
* 03 Learning, Scoring & Adaptive Model
* 04 End-to-End Product Workflows
* 05 System Architecture
* 06 Data Model & Content Schema
* 07 API & Service Contracts
* 08 AI Integration & Product Evolution Roadmap
* 09 Testing, Content QA & Non-Functional Requirements

## Change-management rule

When a product decision changes scoring, exercise schema, completion/mastery semantics or AI responsibility, update the relevant Linear doc before/with the implementation issue so code and product behaviour do not drift.
