# Documentation index

This directory is the durable product and engineering specification for CodeReview Coach. The documents originated in Linear and were normalised for repository use on 2026-09-04.

## Reading paths

### Product and design

1. [Product requirements](01-product-requirements.md)
2. [Core UI and UX](02-core-ui-ux.md)
3. [Learning, scoring, and adaptive model](03-learning-scoring-adaptive-model.md)
4. [Product workflows](04-product-workflows.md)

### Engineering

1. [System architecture](05-system-architecture.md)
2. [Data model and content schema](06-data-model-content-schema.md)
3. [API and service contracts](07-api-service-contracts.md)
4. [Testing and quality requirements](09-testing-quality-requirements.md)
5. [Repository structure](repository-structure.md)

### Delivery and evolution

1. [Delivery plan and dependency map](10-delivery-plan-dependencies.md)
2. [Project roadmap](../ROADMAP.md)
3. [AI integration roadmap](08-ai-roadmap.md)
4. [Architecture decisions](decisions/README.md)

## Source-of-truth policy

- Repository Markdown defines intended implementation behaviour.
- Linear owns work state, assignment, priority, dependencies, and delivery reporting.
- Code and documentation must change together when a pull request changes a contract or product behaviour.
- Material changes to scoring, exercise schema, completion/mastery semantics, privacy, or AI responsibility require an architecture decision record.
- The matching Linear issue or document must link to the pull request that implements the decision.

## Document lifecycle

Each specification begins with its status and review date. Use these states:

- **Draft** — direction is useful but may still change.
- **Accepted** — approved for implementation.
- **Superseded** — retained for history and linked to its replacement.

Review affected documents as part of the definition of done for every feature.
