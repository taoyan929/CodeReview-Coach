# ADR-0002: Deterministic scoring before AI

- Status: Accepted
- Date: 2026-09-04
- Related Linear issues: TAO-21, TAO-27

## Context

The product must give reliable, explainable feedback and must not require exact answer wording. AI can improve semantic interpretation, but using it as the initial scoring authority would make results less reproducible and delay the MVP.

## Decision

Expected findings, concept metadata, selected locations, categories, hint use, and fix outcomes produce the base technical evaluation. AI may later add semantic and communication assessment, but it does not replace deterministic signals or show answers before submission.

## Consequences

- Core scoring is testable with golden cases and works offline.
- Exercise metadata requires careful authoring and validation.
- Technical correctness remains separate from communication quality.
- AI integration can be measured against a known baseline.

## Alternatives considered

- LLM-only grading: rejected because of variability, cost, latency, and weak explainability.
- Exact-text matching: rejected because correct technical reasoning can be expressed in many ways and languages.
