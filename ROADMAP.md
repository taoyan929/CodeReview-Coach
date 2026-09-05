# Roadmap

> Status: In progress · Last reviewed: 2026-09-05

## M1 — Foundation and learning engine

Goal: establish the application, stable contracts, versioned learner state, and a small validated exercise set.

- TAO-17 — Bootstrap React + TypeScript application ✅
- TAO-18 — Define exercise, curriculum, and learning-state data model ✅
- TAO-19 — Create the first full-stack review exercise pack ✅

Exit gate: one schema-valid exercise loads through the repository boundary and learner state can be persisted and migrated.

## M2 — Review experience

Goal: complete the core learn-review-feedback-fix loop.

- TAO-20 — Build structured daily review workspace ✅
- TAO-21 — Implement deterministic review scoring and coaching feedback ✅
- TAO-22 — Add fix-the-code practice step ✅

Exit gate: a learner can complete one golden exercise end to end without AI.

## M3 — Progress, adaptation, and MVP release

Goal: make the deterministic product useful for repeated daily practice.

- TAO-23 — Track completion, mastery, and weak topics ✅
- TAO-25 — Implement rule-based recommendations ✅
- TAO-26 — Add missions, streaks, unlocks, and Boss Reviews
- TAO-30 — Build Dashboard, Today’s Mission, and Learning Path UI
- TAO-24 — Test, polish, and prepare the MVP release

Exit gate: M1–M3 form a complete, accessible, daily-use product. AI is not required for release.

## M4 — AI Coach

Goal: add semantic and multilingual coaching where deterministic evaluation has demonstrated limitations.

- TAO-27 — Add AI semantic evaluation and multilingual coaching

Entry gate: deterministic scoring is stable, benchmark cases exist, real learner language exposes measurable gaps, and server-side secret handling is selected.

## M5 — Adaptive AI and real pull requests

Goal: personalise challenge generation and transfer the same learning model to realistic repositories and pull requests.

- TAO-28 — Add adaptive exercise generation and personalised missions
- TAO-29 — Add real PR and repository review mode

Entry gate: curated content is a reliable baseline, AI Coach quality is measured, and the internal multi-file challenge model is stable.

## Delivery rule

Build vertical slices. Stabilise the data contract, then validate one golden exercise through the full learning loop before scaling content or polishing secondary screens. With deterministic adaptation complete, the next recommended slice is TAO-26 developer-style missions and Boss Review progression.
