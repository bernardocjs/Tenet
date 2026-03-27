---
name: add-endpoint
description: Add a new REST API endpoint following the project's layered pattern (DTO → Use Case → Controller → Route → Tests).
---

Add this endpoint: $ARGUMENTS

## Process

**Step 1 — read existing patterns (minimal reads, high signal)**
Before spawning an agent, read these 4 files to pass as context:
- `src/dtos/shipment-dtos.ts` — Zod schema pattern
- `src/usecases/create-shipment.ts` — use case pattern
- `src/controllers/shipment-controller.ts` — controller pattern
- `src/routes/shipment-routes.ts` — route registration pattern

**Step 2 — implement**
Spawn the `backend` subagent with:
> Add the following endpoint to the shipping API: $ARGUMENTS
>
> Follow this exact order:
> 1. Zod schema in src/dtos/shipment-dtos.ts
> 2. Use case in src/usecases/ (inject dependencies via constructor as interfaces)
> 3. Controller handler in src/controllers/shipment-controller.ts
> 4. Route registration in src/routes/shipment-routes.ts
> 5. Unit tests in tests/usecases/ covering: happy path, all error conditions, correct method calls
>
> After implementing, run `npm run lint && npm test` — return only when both pass.
> Report: files created/modified, test cases added, any design decisions.

**Step 3 — verify**
Run in main context:
```
npm run lint
npm test
```
If failures: send error back to backend agent to fix via SendMessage.

**Step 4 — report**
List the new endpoint with: method, path, request body schema, response shape, error cases handled.
