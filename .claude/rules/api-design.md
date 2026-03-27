---
description: REST API design rules. Apply when adding or modifying routes, controllers, or DTOs.
globs: ["src/routes/**/*.ts", "src/controllers/**/*.ts", "src/dtos/**/*.ts"]
---

# API Design Rules

## URL conventions

- Plural nouns: `/shipments` not `/shipment`
- Sub-resources: `/shipments/:id/status` not `/shipments/update-status/:id`
- No verbs in URLs — use HTTP method to express action
- IDs always via path params (`:id`), filters via query params

## HTTP status codes

| Scenario                 | Status                  |
| ------------------------ | ----------------------- |
| POST creates resource    | 201 Created             |
| GET / PATCH success      | 200 OK                  |
| Validation failure       | 400 Bad Request         |
| Not found                | 404 Not Found           |
| Invalid state transition | 400 Bad Request         |
| OSRM / external failure  | 503 Service Unavailable |

## Response format

```typescript
// Success — return the resource directly
res.status(201).json(shipment)

// Error (handled by middleware — don't do this manually)
{ "error": "Human-readable message" }

// Validation error (handled by middleware)
{ "error": "Validation error", "details": [{ "field": "origin", "message": "Required" }] }
```

## Validation

- Every request body and param must have a Zod schema in `src/dtos/`
- Call `schema.parse(req.body)` in controller — `ZodError` bubbles to middleware automatically
- UUID path params: validate format with `z.string().uuid()`

## Zod schema naming

```typescript
export const CreateShipmentDto = z.object({ ... })
export type CreateShipmentInput = z.infer<typeof CreateShipmentDto>
```

Pattern: `<Action><Resource>Dto` for schema, `<Action><Resource>Input` for inferred type.

## Controller pattern (copy this)

```typescript
async createShipment(req: Request, res: Response): Promise<void> {
  const input = CreateShipmentDto.parse(req.body)
  const useCase = new CreateShipmentUseCase(new OsrmMapProvider(), prisma)
  const shipment = await useCase.execute(input)
  res.status(201).json(shipment)
}
```

No try/catch — the async error handler middleware catches everything.
Controller per domain (e.g. `ShipmentController`), not per route. Each method corresponds to an usecase. Controllers should be thin — just validation and calling use cases. Business logic goes in use cases, not controllers.
