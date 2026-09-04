# ADR-0003: One learning engine across tracks

- Status: Accepted
- Date: 2026-09-04
- Related Linear issues: TAO-18, TAO-19, TAO-29

## Context

CodeReview Coach covers frontend, backend, API, database, testing, and security topics. Separate implementations per technology would duplicate scoring, progress, recommendation, and review behaviour.

## Decision

Represent curated snippets and future pull-request content through shared `Exercise`, `CodeFile`, `ExpectedFinding`, `ReviewFinding`, and `Attempt` contracts. Technology-specific behaviour belongs in content metadata and replaceable adapters, not separate product engines.

## Consequences

- New tracks can reuse the same review and progress flows.
- Contracts must support single-file and multi-file challenges from the start.
- Content validation becomes a central platform capability.
- Real pull requests must be normalised into the internal challenge model.

## Alternatives considered

- One application flow per language/framework: rejected because it creates duplicated logic and inconsistent learner metrics.
