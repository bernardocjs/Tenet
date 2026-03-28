# Code Review: Shipping API → Loveflix Pivot

**Branch:** `feat/test-claude` (2 commits, 79 files changed, +5505 / -1560)
**Build:** lint clean, 25/25 tests pass, compiles

---

## Critical (block merge)

### 1. JWT secret silently falls back to hardcoded value
`src/config/index.ts:3` — If `JWT_SECRET` is unset in production, the server starts normally signing tokens with `"dev-secret-change-me"`. All sessions become forgeable. Must throw at startup if missing.

### 2. R2 credentials default to empty strings
`src/config/index.ts:7-11` — All R2 config defaults to `""`. The S3 client constructs with blank credentials and fails with opaque AWS errors at runtime, not at startup. Same fix: validate required env vars on boot.

### 3. No SIGTERM handler
`src/server.ts` — Missing entirely. On container shutdown, in-flight DB transactions are abandoned and the Prisma connection pool leaks. Required by production-readiness rules.

### 4. `express.json()` has no body size limit
`src/app.ts` — An attacker can send arbitrarily large JSON payloads. Must be `express.json({ limit: '10kb' })` per production rules.

### 5. `reorderMedia` allows cross-website media tampering
`src/usecases/media/reorder-media.ts:25-31` — Validates website ownership but the `$transaction` updates any `mediaId` passed, regardless of which website the media belongs to. Must add `websiteId` to the `where` clause or validate IDs belong to the website.

### 6. `deleteMedia` deletes from R2 before soft-deleting in DB
`src/usecases/media/delete-media.ts:36-41` — If `storage.deleteObject()` succeeds but the DB update fails, the file is gone but the record remains. Reverse the order: soft-delete DB first, then delete from R2.

---

## High (fix before production)

### 7. `req.userId!` non-null assertions in all controllers
`src/controllers/website-controller.ts` (6 occurrences), `src/controllers/media-controller.ts` (5 occurrences) — If `authMiddleware` is ever accidentally omitted from a route, `userId` will be `undefined` with no error. Add a runtime check or type `Request` with non-optional `userId` after auth.

### 8. `pino-pretty` runs unconditionally — no JSON logs in production
`src/utils/logger.ts` — Log aggregators (Datadog, CloudWatch) expect JSON. `pino-pretty` outputs colored text. Gate it on `NODE_ENV !== 'production'`. Also, `LOG_LEVEL` env var is missing from config and `.env.example`.

### 9. Health check doesn't verify R2
`src/routes/index.ts:12-19` — Only checks DB. R2 is the other critical dependency. Should include `storage: "ok" | "error"`.

### 10. `cors()` allows all origins
`src/app.ts` — For an authenticated platform, wildcard CORS is a meaningful attack surface. Configure `origin` to allowed domains.

### 11. Slug collision unhandled
`src/usecases/websites/create-website.ts:12-14` — `nanoid(6)` makes collisions unlikely but possible. A Prisma `P2002` unique constraint error will surface as a 500. Catch and retry or throw `BadRequestError`.

---

## Medium

### 12. `jwtExpiresIn as unknown as number` — misleading cast
`src/usecases/auth/login-user.ts:31`, `register-user.ts:35` — The value is `"7d"` (string) but cast to `number`. Works because `jsonwebtoken` accepts both, but the cast is wrong. Remove it.

### 13. `ConfirmUploadDto` doesn't validate `mimeType` format
`src/dtos/media-dtos.ts:14` — Accepts any string, but `UploadUrlDto` correctly constrains `contentType` with a regex. Apply the same `^(image|video)\/.+$` regex to `mimeType`.

### 14. Public slug param not validated with Zod
`src/controllers/public-controller.ts:6` — Uses `req.params.slug as string` instead of a Zod schema, inconsistent with every other controller.

### 15. Missing Prisma migrations
Old migrations were deleted but no new migration files exist. `npx prisma migrate deploy` will do nothing — tables won't be created.

---

## Testing Gaps (rule requires 100% branch coverage on use cases)

**6 use cases have zero test coverage:**
- `update-website`, `list-user-websites`, `get-website-by-id`
- `list-media`, `reorder-media`, `delete-media`

**Missing branches in existing tests:**
- `confirm-upload.test.ts` — video size limit path and `sortOrder` increment when `lastMedia` exists
- `register-user.test.ts` — `name` omitted (null default) path

**No provider tests:** `r2-storage-provider.test.ts` doesn't exist.

---

## Summary

| Severity | Count |
|----------|-------|
| Critical | 6 |
| High | 5 |
| Medium | 4 |
| Testing gaps | 9 untested use cases + missing branches |

**Top priorities before merge:**
1. Fail fast on missing `JWT_SECRET` and R2 credentials at startup
2. Add SIGTERM handler and `express.json({ limit })`
3. Fix `reorderMedia` cross-website tampering and `deleteMedia` ordering
4. Add the 6 missing use case test files and cover missing branches
