> Status: Draft · Last reviewed: 2026-09-04 · Imported from [Linear](https://linear.app/taoyan929/document/04-end-to-end-product-workflows-a1f8f3f6141e).
>
> Repository Markdown is the implementation reference. Material product changes should be reflected in both this document and the matching Linear issue or project document.

# End-to-End Product Workflows

## 1. First-launch workflow

1. Open app.
2. Optional lightweight onboarding selects experience/focus; MVP may also default to Full-Stack Foundations.
3. Create local learner profile/state.
4. Initialise curriculum completion at 0% and mastery as insufficient-data/not yet scored.
5. Rule engine creates first Daily Mission.
6. Dashboard points to the first challenge.

No account is required for MVP.

## 2. Standard daily-learning workflow

Dashboard
→ Today’s Mission
→ Challenge Brief
→ Review Workspace
→ Submit Review
→ Staged Feedback
→ Retry / Hint / Finish
→ Fix the Code
→ Exercise Complete
→ Update Completion & Mastery
→ Recalculate Weak Topics
→ Generate Next Recommendation
→ Dashboard / Next Mission

## 3. Beginner review workflow

 1. Read requirement.
 2. Inspect code.
 3. Select suspicious line/range.
 4. Choose issue category.
 5. Enter diagnosis in own words.
 6. Optionally explain impact.
 7. Optionally suggest fix.
 8. Add finding.
 9. Repeat for other suspected issues.
10. Submit.

The learner is not required to write a standard sentence.

## 4. Intermediate review workflow

1. Read requirement.
2. Select code line/range.
3. Write free-form inline review comment.
4. Request Category Hint / Concept Hint / Strong Hint only if needed.
5. Add multiple comments.
6. Submit review.

## 5. Advanced / PR workflow

1. Read issue/requirement and acceptance criteria.
2. Browse changed files/diff.
3. Add inline review comments freely.
4. No issue count is shown.
5. Optionally inspect tests/context.
6. Select overall decision: Approve / Comment / Request Changes.
7. Submit review.
8. Compare against reference after completion.

## 6. Staged feedback workflow

### Stage A — First submission

System evaluates deterministic signals.

Show:

* strong findings
* findings needing another look
* indication that additional issues may remain

Actions:

* Try Again
* Get Hint
* Finish & Reveal

### Stage B — Retry/hints

Hints become progressively stronger but avoid directly revealing the final answer until the learner chooses to finish.

### Stage C — Final feedback

Show:

* identified findings
* missed findings
* issue severity
* why each matters
* reference/senior review comment
* technical score dimensions
* communication feedback separately
* concepts found/missed

### Stage D — Fix

Learner edits/corrects code and compares with reference implementation.

## 7. Completion workflow

On completion:

1. Persist attempt.
2. Mark exercise completion if criteria met.
3. Increment curriculum completion by configured weight if first completion.
4. Update concept/track mastery.
5. Update weak-topic state.
6. Update streak/daily mission.
7. Evaluate unlock rules.
8. Re-run recommendation engine.
9. Show result/celebration and next CTA.

## 8. Daily Mission workflow

Rule engine selects 1–3 tasks based on:

* curriculum path
* weak concepts
* mastery
* prerequisites
* recent practice
* mission-type variety
* available daily time/default target

Dashboard displays:

* completed/remaining tasks
* estimated remaining time
* why each task is recommended

## 9. Weekly workflow

Throughout week:

* track completed reviews
* track streak
* track concept/track movement

At weekly checkpoint:

* show Weekly Goal progress
* show strongest improvement
* show persistent weak topics
* recommend next-week focus
* optionally unlock Boss Review

## 10. Boss Review workflow

1. Unlock at configured curriculum checkpoint.
2. Present realistic cross-stack feature or incident.
3. Show multiple files: frontend, API, backend, data, tests as relevant.
4. Learner performs review with reduced scaffolding.
5. Feedback is grouped by track and engineering dimension.
6. Completion updates several track/mastery signals.

## 11. Self-directed practice workflow

Exercise Library
→ filter by track/topic/level/difficulty/mission type
→ start exercise
→ standard review workflow
→ progress update

Self-directed practice should not replace the Daily Mission as the default guided experience.

## 12. Future AI Coach workflow

Learner submits own review first
→ deterministic evaluation runs
→ AI receives learner text + expected concept metadata + deterministic signals
→ AI returns structured semantic/communication assessment
→ merge AI coaching with deterministic result
→ show coach feedback

AI never appears as an answer generator before submission.

## 13. Future AI adaptive workflow

Learner history
→ deterministic recommendation candidates
→ AI can rerank/personalise or generate a schema-valid exercise
→ content validation
→ learner receives mission
→ same core review/scoring workflow

## 14. Future real PR workflow

Connect/import PR
→ normalise files/diff into internal ReviewChallenge model
→ learner reviews
→ submit
→ compare with reference/senior/AI reviewer if available
→ update mastery/history

The same core ReviewFinding contract should be used for curated and real PR modes.

