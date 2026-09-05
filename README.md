# CodeReview Coach

CodeReview Coach is a local-first learning product that helps junior developers practise reading, reviewing, explaining, and fixing code—especially code produced with AI assistance.

The project is in **M2 review-experience development**. The documentation set, React application shell, runtime-validated domain contracts, versioned local learner state, first golden exercise, and structured review workspace are in place.

## Product idea

Learners receive a short requirement and code sample, submit their own review before seeing feedback, fix the code, and then get a deterministic next-step recommendation based on completion, mastery, and weak topics.

```text
Today's Mission
→ inspect requirement and code
→ submit review findings
→ receive staged feedback
→ fix the code
→ update completion and mastery
→ recommend the next exercise
```

## Product principles

- Think first, AI second.
- Judge technical understanding separately from writing quality.
- Scaffold beginner reviews, then progressively remove guidance.
- Treat completion and mastery as different signals.
- Use one learning engine across frontend, backend, API, database, testing, and security tracks.
- Ship a useful deterministic MVP before adding AI grading or content generation.

## Planned MVP stack

- React, TypeScript, and Vite
- Tailwind CSS
- Versioned exercise content validated with schemas
- Deterministic scoring and recommendation engines
- `localStorage` persistence behind repository interfaces
- Vitest, React Testing Library, and end-to-end tests

No backend or account is required for the initial MVP.

## Getting started

Requirements:

- Node.js 20.19 or newer
- npm 10 or newer

```bash
npm install
npm run dev
```

Quality checks:

```bash
npm run check
```

This runs ESLint, the Vitest suite, TypeScript project builds, and the Vite production build.

## Documentation

Start with the [documentation index](docs/README.md). The recommended reading path is:

1. [Product requirements and MVP scope](docs/01-product-requirements.md)
2. [Core UI and UX](docs/02-core-ui-ux.md)
3. [Learning, scoring, and adaptive model](docs/03-learning-scoring-adaptive-model.md)
4. [End-to-end product workflows](docs/04-product-workflows.md)
5. [System architecture](docs/05-system-architecture.md)
6. [Data model and content schema](docs/06-data-model-content-schema.md)
7. [API and service contracts](docs/07-api-service-contracts.md)
8. [AI integration roadmap](docs/08-ai-roadmap.md)
9. [Testing and quality requirements](docs/09-testing-quality-requirements.md)
10. [Delivery plan and dependency map](docs/10-delivery-plan-dependencies.md)

Supporting documents:

- [Roadmap](ROADMAP.md)
- [Repository structure](docs/repository-structure.md)
- [Decision log](docs/decisions/README.md)
- [Glossary](docs/glossary.md)
- [Contributing guide](CONTRIBUTING.md)
- [Security policy](SECURITY.md)

## Current implementation slice

The golden React exercise currently supports the first half of the complete flow:

```text
dashboard
→ challenge brief
→ select a suspicious line
→ structured finding
→ progressive hints
→ submit and persist an attempt
→ first-feedback state
```

Deterministic evaluation and staged feedback are now implemented. TAO-22 will add the active fix step and complete the golden exercise loop.

## Project management

Planning and execution are tracked in [Linear](https://linear.app/taoyan929/project/codereview-coach-56956b929ac7). Repository documents are the implementation reference; material decisions must be reflected in the matching Linear issue or project document so the two systems do not drift.

## Development status

- Project status: M2 in progress
- M1–M5 milestones: defined
- Application scaffold: complete
- Exercise and learner-state contracts: initial version implemented
- Golden exercise: React derived-state review available
- Structured review workspace: line/range selection, guided findings, progressive hints, multiple comments, submission, retry, and local attempt persistence implemented
- Deterministic scoring: finding-level technical dimensions, separate communication score, assistance tracking, staged feedback, and final reveal implemented
- Current recommended work: implement TAO-22 fix-the-code practice and completion transition

## License

No license has been selected yet. Until a license is added, all rights are reserved by the repository owner.
