# Architecture decision records

Architecture decision records (ADRs) explain choices that affect multiple milestones or are expensive to reverse.

## Accepted decisions

- [ADR-0001: Local-first MVP](0001-local-first-mvp.md)
- [ADR-0002: Deterministic scoring before AI](0002-deterministic-scoring-before-ai.md)
- [ADR-0003: One learning engine across tracks](0003-one-learning-engine.md)

## When to add an ADR

Add or supersede an ADR when changing:

- domain or persistence boundaries
- exercise or learner-state contracts
- completion or mastery semantics
- scoring ownership
- security or privacy boundaries
- AI or GitHub integration responsibility

Use the [ADR template](template.md). Do not silently rewrite an accepted decision; create a new ADR that supersedes it.
