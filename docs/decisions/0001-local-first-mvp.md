# ADR-0001: Local-first MVP

- Status: Accepted
- Date: 2026-09-04
- Related Linear issues: TAO-17, TAO-18, TAO-23

## Context

The first product must validate the learning loop without introducing account management, cloud infrastructure, or operational dependencies. Future cloud sync must remain possible.

## Decision

Build the MVP as a React application with versioned static exercise content and learner state persisted through a repository abstraction backed by `localStorage`. Include a learner-state `schemaVersion` and explicit migrations.

## Consequences

- The MVP can run without a backend or login.
- Product testing can focus on learning behaviour first.
- Cross-device sync and team features are deferred.
- Browser storage limits and clearing behaviour must be communicated.
- Future HTTP-backed repositories can replace local adapters without changing domain rules.

## Alternatives considered

- Backend-first accounts and cloud persistence: rejected for MVP complexity.
- Direct `localStorage` access in components: rejected because it couples UI to persistence and makes migration harder.
