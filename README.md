# CodeReview Coach

CodeReview Coach is a local-first learning product that helps junior developers practise reading, reviewing, explaining, and fixing code—especially code produced with AI assistance.

The project is currently in the **planning / pre-implementation** stage. The product, architecture, data, workflow, quality, and delivery specifications are documented and ready for the first vertical slice.

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

## First implementation slice

The first slice should take exactly one beginner React or FastAPI challenge through the complete flow:

```text
dashboard placeholder
→ challenge brief
→ select a suspicious line
→ structured finding
→ deterministic feedback
→ final reveal
→ fix code
→ persist completion
```

This validates the contracts and learning loop before building a broad exercise library or a polished progress dashboard.

## Project management

Planning and execution are tracked in [Linear](https://linear.app/taoyan929/project/codereview-coach-56956b929ac7). Repository documents are the implementation reference; material decisions must be reflected in the matching Linear issue or project document so the two systems do not drift.

## Development status

- Project status: Planned
- M1–M5 milestones: defined
- Application scaffold: not started
- Current recommended work: TAO-17 and TAO-18

Installation and development commands will be added after the application scaffold is committed.

## License

No license has been selected yet. Until a license is added, all rights are reserved by the repository owner.
