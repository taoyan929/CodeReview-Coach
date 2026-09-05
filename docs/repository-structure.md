# Repository structure

> Status: Active · Last reviewed: 2026-09-05

The repository started documentation-first and now follows the application boundaries below.

## Structure

```text
.
├── docs/                       Product and engineering specifications
│   ├── decisions/              Architecture decision records
│   └── 01-10*.md               Ordered core specifications
├── public/                     Static public assets
├── src/
│   ├── app/                    Router, providers, and app composition
│   ├── pages/                  Route-level product surfaces
│   ├── components/             Reusable presentation and interaction components
│   ├── domain/                 Framework-independent domain types and rules
│   ├── services/               Application-facing engine implementations
│   ├── repositories/           Storage and content boundaries
│   ├── data/                   Versioned curriculum and exercise content
│   ├── schemas/                Runtime validation and migrations
│   ├── types/                  Shared TypeScript types when no domain owns them
│   └── utils/                  Small domain-neutral helpers
├── tests/                      Cross-feature and end-to-end tests
├── CONTRIBUTING.md
├── ROADMAP.md
└── README.md
```

## Boundary rules

- `domain/` must not import React, browser storage, or provider SDKs.
- `services/` coordinate domain behaviour but do not own UI rendering.
- `repositories/` hide whether data comes from static files, `localStorage`, HTTP, or GitHub.
- `data/` contains content, not page-specific rendering logic.
- UI components call application services rather than implementing scoring or mastery rules directly.
- Future AI and GitHub integrations enter through interfaces; they do not leak provider-specific types across the application.

## Test placement

- Co-locate focused unit/component tests with source files when that improves discoverability.
- Keep cross-domain integration tests and browser journeys under `tests/`.
- Keep reusable golden scoring cases under a dedicated test fixture directory once TAO-21 starts.

## Naming conventions

- React components: `PascalCase.tsx`
- Hooks: `useFeatureName.ts`
- Domain services and utilities: `camelCase.ts`
- Tests: `*.test.ts` or `*.test.tsx`
- End-to-end tests: `*.spec.ts`
- Architecture decisions: `NNNN-short-decision-title.md`
