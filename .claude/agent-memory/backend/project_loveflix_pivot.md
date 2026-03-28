---
name: Loveflix pivot
description: Project pivoted from shipping API to loveflix couple websites platform. New domain: users create couple websites with media uploads to Cloudflare R2.
type: project
---

Project is now "loveflix" — a platform for couples to create shareable websites with photos/videos.

**Why:** Complete domain pivot as of 2026-03-27 (branch feat/test-claude → main).

**How to apply:** Ignore all shipping/OSRM domain concepts. Domain is: User → CoupleWebsite (DRAFT/PUBLISHED/ARCHIVED) → Media (PHOTO/VIDEO). Storage is Cloudflare R2 via S3-compatible API. Auth is JWT (bcryptjs + jsonwebtoken). Public websites accessible via slug at /s/:slug.

Key known issues from code review (2026-03-27):
- Use cases take `PrismaClient` directly instead of interfaces (clean arch violation)
- `req.userId!` non-null assertions in controllers (forbidden outside tests)
- `jwtExpiresIn as unknown as number` unsafe cast in register-user and login-user
- `config.jwtSecret` has weak default "dev-secret-change-me" — no validation
- R2 config values default to empty strings — no startup validation
- slug param in public-controller uses `req.params.slug as string` (unnecessary cast)
- No tests for: UpdateWebsite, ListUserWebsites, ListMedia, ReorderMedia, DeleteMedia use cases
- confirm-upload test missing: video size exceeded path, sortOrder increments after existing media
- reorder-media has no validation that provided mediaIds belong to the website
- delete-media: R2 delete happens before DB soft-delete — partial failure leaves orphaned DB record
- UpdateWebsite allows updating partnerNames without regenerating slug
