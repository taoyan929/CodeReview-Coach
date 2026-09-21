# CodeReview Coach

[![CI](https://github.com/taoyan929/CodeReview-Coach/actions/workflows/ci.yml/badge.svg)](https://github.com/taoyan929/CodeReview-Coach/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-7ee2b8.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-20.19%2B-7ee2b8.svg)](package.json)

CodeReview Coach is a local-first learning application that helps junior developers practise reading, reviewing, explaining, and fixing code—especially code produced with AI assistance.

The MVP provides a complete review-to-fix learning loop, a curated full-stack curriculum, deterministic scoring and recommendations, and private browser-local progress. It runs without an account, backend, API key, or `.env` file.

![CodeReview Coach dashboard](docs/assets/dashboard.png)

## Why this project

AI can generate code quickly, but developers still need the judgement to decide whether that code is correct, safe, and maintainable. CodeReview Coach turns that judgement into a repeatable practice loop:

```text
read a requirement
      ↓
inspect an AI-generated code sample
      ↓
select suspicious lines and explain the issue
      ↓
receive staged, deterministic feedback
      ↓
repair the implementation
      ↓
update mastery and recommend the next exercise
```

## Highlights

- **24 curated exercises** across JavaScript, TypeScript, React, Python, FastAPI, REST APIs, SQL, MongoDB/Cosmos DB, testing, and security.
- **Structured review practice** with independent line selection, multiple findings, issue categories, progressive hints, retries, and a guided Language Assist mode.
- **Transparent assessment** using deterministic technical scoring, separate communication feedback, and 96 embedded golden scoring cases.
- **Fix practice** with an editable working copy, reference comparison, and explicit completion criteria.
- **Adaptive learning path** based on prerequisites, level gates, weak concepts, recent performance, hint usage, preferences, and mission variety.
- **Local-first privacy** with versioned `localStorage` state, JSON backup/restore, validation, corruption recovery, and no account or network service.
- **Accessible and responsive UI** tested with keyboard journeys, axe, and 390 px, 768 px, and 1280 px viewports.

## Product tour

The dashboard separates curriculum completion from demonstrated mastery, recommends a daily mission, and explains locked tracks and levels.

The review workspace keeps the requirement, code, hints, and finding composer visible together:

![Structured code review workspace](docs/assets/review-workspace.png)

### Example exercise

Given this requirement:

> Allow only the exact `admin` role through this permission helper.

The learner reviews:

```js
export function canOpenAdmin(user) {
  return user.role == 'admin'
}
```

A strong review selects line 2, identifies loose equality and type coercion, explains the authorization risk, and proposes strict equality:

```js
export function canOpenAdmin(user) {
  return user.role === 'admin'
}
```

The app evaluates the finding, lets the learner retry before revealing the full explanation, and then requires a working code fix before marking the exercise complete.

## Getting started

### Requirements

- Node.js 20.19 or newer
- npm 10 or newer
- A modern browser

### Install and run

```bash
git clone https://github.com/taoyan929/CodeReview-Coach.git
cd CodeReview-Coach
npm ci
npm run dev
```

Open the local URL printed by Vite, normally `http://localhost:5173`.

No environment variables, API keys, database, seed data, or test account are required. Progress is created automatically in the current browser profile.

### Production preview

```bash
npm run build
npm run preview
```

## Available commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Vite development server |
| `npm run build` | Type-check and create a production build |
| `npm run preview` | Serve the production build locally |
| `npm run format:check` | Check formatting with Prettier |
| `npm run lint` | Run ESLint |
| `npm run test` | Run unit and integration tests with Vitest |
| `npm run test:e2e` | Run Playwright browser and accessibility tests |
| `npm run check` | Run formatting, linting, tests, type-checking, and build |
| `npm run check:release` | Run the complete release gate, including browser tests |

## Architecture

The application keeps the learning logic independent from React and browser storage:

```text
React pages and components
          │
          ▼
application services ──────► deterministic scoring and learning rules
          │
          ▼
repository interfaces ─────► validated exercise content
          │                 ► versioned learner state
          ▼
browser localStorage
```

Key design decisions:

- Domain rules do not import React, browser storage, or provider SDKs.
- Repositories hide content and persistence details from the UI.
- Zod schemas validate exercises, learner state, backups, and migrations at runtime.
- Scoring and recommendations are deterministic and explainable for the MVP.
- Future AI or GitHub integrations can enter through interfaces without changing the core learning model.

## Project structure

```text
src/
├── app/            Router and application composition
├── components/     Dashboard and review UI
├── config/         Learning and unlock thresholds
├── data/           Versioned curriculum and exercise content
├── domain/         Framework-independent types and scoring rules
├── pages/          Route-level screens
├── repositories/   Content and learner-state persistence boundaries
├── schemas/        Runtime validation and migrations
├── services/       Progress, recommendation, and submission workflows
└── utils/          Small shared helpers
e2e/                Playwright browser journeys
docs/               Product, UX, architecture, and delivery specifications
```

See [Repository structure](docs/repository-structure.md) for the detailed boundary rules.

## Quality and testing

```bash
npm run check
```

The standard quality gate runs Prettier, ESLint, Vitest, TypeScript project builds, and the Vite production build. The release gate also starts an isolated production preview and runs Playwright Chromium journeys covering the full learning loop, persistence, recovery, accessibility, runtime errors, and responsive overflow.

GitHub Actions runs the same checks for pushes to `main` and pull requests.

## Local data and privacy

Learner progress stays in the browser's `localStorage`. The application makes no API calls and sends no learner data to a server. Dashboard data controls can:

- download a portable JSON backup;
- validate and restore a backup without replacing valid state on failure;
- reset local progress after explicit confirmation; and
- recover the original raw value if stored data becomes corrupted.

Clearing browser storage removes local progress unless it has been exported first.

## Documentation

The [documentation index](docs/README.md) links to the product requirements, UX specification, learning and scoring model, workflows, architecture, data contracts, AI roadmap, testing requirements, and delivery plan.

Additional project documents:

- [Roadmap](ROADMAP.md)
- [Architecture decisions](docs/decisions/README.md)
- [Contributing guide](CONTRIBUTING.md)
- [Security policy](SECURITY.md)
- [Changelog](CHANGELOG.md)

## Known limitations

- Progress remains tied to one browser profile unless the learner exports and restores a backup.
- Scoring uses curated technical aliases and is currently English-oriented rather than semantic or multilingual.
- Exercises are bundled local content; repository import, accounts, cloud sync, and shared progress are outside the MVP.
- The built-in editor is intended for short practice snippets, not arbitrary code execution or repository-scale editing.

## License

CodeReview Coach is released under the [MIT License](LICENSE).
