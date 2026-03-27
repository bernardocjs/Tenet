---
alwaysApply: false
globs:
  - "backend/**"
description: "Prevent N+1 queries, enforce batch operations, pagination, read replica usage, and query parallelization in backend code."

Triggers:
  - findMany
  - findUnique
  - findFirst
  - findUniqueOrThrow
  - findFirstOrThrow
  - createMany
  - updateMany
  - deleteMany
  - prisma
  - PrismaService
  - include
  - select
  - Promise.all
  - for
  - map
  - query
  - pagination
  - replica
  - performance
  - repository
  - N+1
---

## Backend Query Performance Rule

Every backend change involving database queries must follow these patterns to prevent N+1 queries, over-fetching, and unnecessary database load.

### Pagination

- Every `findMany` returning user-facing data must be paginated with standard `page` and `limit` query params
- Use Prisma's `skip` and `take` for pagination, never `offset`/`limit` in raw SQL
- Return pagination metadata in response: `{ data: [...], meta: { page, limit, total } }`

### 1. N+1 Query Prevention

Never execute Prisma queries inside loops. Batch into single queries.

```typescript
// ✅ Good: single batch query
const orders = await this.prisma.order.findMany({
  where: { uuid: { in: orderUuids } },
});

// ✅ Good: batch relation update with set
await this.prisma.order.update({
  where: { uuid: orderUuid },
  data: { tags: { set: tagUuids.map((uuid) => ({ uuid })) } },
});

// ✅ Good: bulk create
await this.prisma.orderDriverQualification.createMany({
  data: qualifications.map((q) => ({
    orderUuid,
    driverQualificationUuid: q.uuid,
  })),
});

// ❌ Bad: individual queries in loop
await Promise.all(
  tagUuids.map(async (tagUuid) =>
    this.prisma.order.update({
      where: { id: orderUuid },
      data: { tags: { connect: { uuid: tagUuid } } },
    }),
  ),
);

// ❌ Bad: findUnique inside iteration
for (const orderId of orderIds) {
  const order = await this.prismaService.order.findUnique({
    where: { id: orderId },
  });
  // process order
}
```

### 2. Select and Include Discipline

- Use `select` to fetch only the fields needed when the full model is not required
- Avoid nested `include` deeper than 3 levels — if you need deeply nested data, make separate queries and combine in the service layer

```typescript
// ✅ Good: select only needed fields
const order = await this.prisma.order.findUnique({
  where: { id: orderUuid },
  select: { id: true, status: true, companyId: true },
});

// ✅ Good: reuse existing select
const shipment = await this.prisma.shipment.findUniqueOrThrow({
  where: { id: shipmentUuid },
  select: shipmentForChargeStatisticsSelect,
});

// ❌ Bad: deep nesting
const order = await this.prisma.order.findUniqueOrThrow({
  where: { id: orderUuid },
  include: {
    shipments: {
      include: {
        legs: {
          include: {
            stops: {
              include: { address: true },
            },
          },
        },
      },
    },
  },
});
```

### 5. Parallelization

- Independent queries should be parallelized with `Promise.all` — never execute sequential queries that don't depend on each other
- Use `Promise.allSettled` when partial failure is acceptable and results should be preserved
