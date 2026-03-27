---
name: feature
description: Implement a new feature end-to-end following clean architecture. Spawns a backend agent to implement, verifies with lint + tests, and SRE reviews reliability before handing off.
---

Implement this feature: $ARGUMENTS

## Process

**Step 1 — implement**
Spawn the `backend` subagent with this exact task:
> Implement the following feature in the shipping API: $ARGUMENTS
> Follow the project's clean architecture (Routes → Controllers → Use Cases → Providers).
> Write unit tests for all new business logic following the Vitest + vitest-mock-extended pattern.
> After implementing, run `npm run lint` and `npm test` and report the results.
> Only return when lint is clean and all tests pass.

**Step 2 — verify**
After the backend agent returns:
- Run `npm run lint` in the main context to confirm
- Run `npm test` to confirm all tests pass
- If either fails, send the error output back to the backend agent via SendMessage and ask it to fix

**Step 3 — reliability review**
Spawn the `sre` subagent with:
> Review the following newly implemented feature for production reliability: $ARGUMENTS
> Focus only on: error handling completeness, logging sufficiency, external service resilience.
> Read only the files the backend agent modified/created.
> Return Critical and Recommended findings only — skip low-priority observations.

**Step 4 — report**
Summarize to the user:
- What was implemented (files changed)
- Test coverage (which cases are covered)
- SRE findings (if any critical ones, fix them now)
