# Contributing

CodeReview Coach is currently an owner-led, documentation-first project. Contributions should keep product behaviour, domain contracts, tests, repository documentation, and Linear work state aligned.

## Before starting

1. Read the [documentation index](docs/README.md).
2. Confirm that a Linear issue defines the scope and acceptance criteria.
3. Check the [delivery dependencies](docs/10-delivery-plan-dependencies.md).
4. Update or create an architecture decision if the work changes a foundational contract.

## Branch and pull-request workflow

- Create a focused branch from the default branch.
- Include the Linear identifier in the branch or pull-request title when practical.
- Keep changes small enough to review as one coherent decision.
- Describe behaviour, tests, accessibility impact, data migration impact, and documentation changes.
- Link the pull request from the matching Linear issue.

## Definition of done

- Acceptance criteria are satisfied.
- Relevant automated tests pass.
- Exercise content passes schema and content validation.
- Keyboard, screen-size, and reduced-motion behaviour are checked where relevant.
- Learner-state changes include a migration or explicit compatibility decision.
- Documentation and decision records are updated.
- No AI or provider secret is committed or exposed to the browser.

## Commit messages

Use concise imperative messages such as:

```text
Add exercise schema validation
Implement deterministic finding matcher
Document learner-state migration policy
```

## Generated or AI-assisted changes

The contributor remains responsible for understanding, testing, and reviewing generated changes. AI assistance must not bypass the learner-safety, content-validation, privacy, or security rules documented in this repository.
