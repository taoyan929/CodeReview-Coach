> Status: MVP aligned · Last reviewed: 2026-09-14 · Imported from [Linear](https://linear.app/taoyan929/document/02-core-ui-and-ux-specification-18c427fe314a).
>
> Repository Markdown is the implementation reference. Material product changes should be reflected in both this document and the matching Linear issue or project document.

# CodeReview Coach — Core UI & UX Specification

## Design direction

Professional developer-tool aesthetic inspired by GitHub / Linear rather than a game-like education app.

Principles:

* code and reasoning stay visually dominant
* compact information hierarchy
* desktop-first, responsive
* light and dark mode friendly
* status colours used semantically, not decoratively
* gamification is subtle: streaks, progress, unlocks, mission labels

## Core navigation

Primary sidebar:

* Dashboard
* Today’s Mission
* Exercises
* Learning Path
* Progress
* Bookmarks / History (optional MVP)
* Settings

## UI 1 — Dashboard / Home

Purpose: answer three questions immediately: **Where am I? What should I do today? What am I weak at?**

Primary blocks:

* Curriculum Completion %
* Review Mastery %
* Daily Mission progress (e.g. 1/3)
* estimated remaining time
* Continue / Start primary CTA
* Weekly Goal
* streak
* Focus / Weak Topics
* track progress mini-cards
* latest unlock / upcoming Boss Review

Example hierarchy:

1. Today’s Mission
2. Your Path — Completion + Mastery
3. Recommended Focus
4. Track Progress
5. Weekly Goal / Streak

## UI 2 — Today’s Mission

Purpose: provide a small, achievable daily target rather than a large course catalogue.

Show:

* 1–3 assigned tasks
* mission type
* track / topic
* learning level
* difficulty
* estimated time
* recommendation reason
* completion state

Example recommendation reason:
“Recommended because you missed API error handling in two recent reviews.”

## UI 3 — Challenge Brief

Purpose: establish context before code inspection.

Show:

* challenge title
* mission type (Bug Hunt / Production Bug / Ship or Block / etc.)
* requirement/user story
* acceptance criteria
* relevant constraints
* files changed
* technology tags
* difficulty / level / estimated time
* optional concept primer for beginner level

CTA: **Start Review**

## UI 4 — Code Review Workspace

This is the primary product experience.

Desktop layout:

* left/centre: file tree + code/diff viewer
* right: learner review findings
* top: Code / Files / Description / Tests tabs where relevant

Code interaction:

* independently selectable lines, including non-adjacent lines
* single click adds a line; double-click removes only that selected line
* add inline finding
* highlight already-reviewed lines
* multi-file-ready architecture

### Beginner finding composer

* selected line(s)
* Issue Type dropdown
* “What did you notice?”
* “Why does it matter?” optional
* “Suggested fix” optional

### Intermediate finding composer

* selected line(s)
* free-form review comment
* optional Category Hint / Concept Hint / Strong Hint

### Advanced / PR mode

* free inline comments
* no disclosed number of issues
* optional overall decision: Approve / Comment / Request Changes

Primary actions:

* Add Review
* Get Hint
* Finish Review

## UI 5 — Review Feedback

Purpose: coach rather than simply mark right/wrong.

### First-feedback state

Show:

* strong findings
* findings that need another look
* whether more issues may remain
* Try Again
* Get Hint
* Finish & Reveal

Do not immediately reveal all missed findings.

### Final-feedback state

Show separate dimensions:

* Issue Detection
* Reasoning
* Fix Quality
* Communication

Important: Communication is separate from technical correctness.

Comparison tabs:

* Your Review
* Issue Breakdown
* Senior / Reference Review
* AI Review (future only)

Show:

* found vs missed findings
* explanation of why each matters
* professional reference comment
* concepts covered/missed

## UI 6 — Fix the Code

Purpose: require active correction after review.

Layout:

* original code/diff
* editable corrected version
* run/check capability later
* Compare with Reference Solution

Completion state distinguishes:

* reviewed
* understood feedback
* fixed

## UI 7 — Progress & Weak Topics

Purpose: display learning development, not only activity counts.

Top metrics:

* Curriculum Completion
* Review Mastery
* Streak
* Time Spent

Views:

* Overview
* Tracks
* Concepts
* History

Track cards/charts:

* Frontend
* Backend
* API
* Database
* Testing
* Security

Weak-topic table:

* topic
* mastery
* exercises attempted
* recent trend
* next recommended practice

## UI 8 — Learning Path

Purpose: make the built-in 100% curriculum visible and motivating.

Structure:

### Level 1 — Code Literacy

track modules and completion

### Level 2 — Technology Review

locked/unlocked modules

### Level 3 — Software Engineering Review

cross-stack / PR-style challenges

Show:

* prerequisites
* completion %
* mastery threshold
* next unlock
* Boss Review checkpoints

## UI 9 — Exercise Library (secondary MVP)

Filters:

* track
* concept
* level
* difficulty
* mission type
* completed / incomplete

Used for self-directed practice; Today’s Mission remains the recommended default experience.

## Interaction rules

* Never show reference answer before user attempts a review.
* Hint sequence is progressive; each hint reveals only one stronger clue.
* Beginner structure should reduce language pressure without forcing standard wording.
* Technical and communication feedback must be visually separated.
* Completion celebration should be lightweight and professional.
* A user should always have a clear next CTA after finishing a challenge.

## Future UI additions

* AI Coach feedback panel
* learner vs senior vs AI comparison
* real GitHub PR import
* repository selector
* team/instructor dashboard
* interview mode
