# Security policy

## Reporting a vulnerability

Do not disclose suspected vulnerabilities in a public issue. Contact the repository owner privately through the contact method published on their GitHub profile until a dedicated security address is configured.

Include the affected component, reproduction steps, impact, and any suggested mitigation. Do not include real secrets or personal learner data.

## MVP security boundaries

- Treat exercise snippets and imported repository content as display data, never executable application code.
- Do not evaluate arbitrary learner or repository code in the browser origin.
- Validate versioned exercise content before use.
- Store only the minimum local learner state needed for the product.
- Never ship provider or AI secrets in client-side bundles.

If executable code, cloud accounts, AI services, or GitHub ingestion are introduced, the threat model and this policy must be updated before release.
