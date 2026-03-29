# Media Rows

## Problem Statement

Currently, all media uploaded to a couple website exists in a single flat list ordered by a global `sortOrder`. This doesn't match the experience of a Netflix-like site, where content is organized into thematic rows (e.g., "Our First Year", "Trips", "Favorite Moments"). Without rows, the couple cannot tell a story with their media — everything is dumped into one undifferentiated collection, making it hard to navigate or present meaningfully.

## Solution

Introduce a **Rows** concept for couple websites. Each website can have up to 10 named rows, each containing up to 10 media items. Media can appear in multiple rows. Rows and the media within them are independently orderable. Ungrouped media (not assigned to any row) is hidden from the public view until assigned. The public website endpoint returns media organized by rows in their defined order.

## User Stories

1. As a website owner, I want to create a named row, so that I can group related media together under a title.
2. As a website owner, I want to rename an existing row, so that I can correct or update its label.
3. As a website owner, I want to delete a row, so that I can remove a grouping I no longer need without losing the media itself.
4. As a website owner, I want to reorder my rows, so that the most important category appears first on my website.
5. As a website owner, I want to add a media item to a row, so that it becomes part of that thematic group.
6. As a website owner, I want to remove a media item from a row, so that it no longer appears in that group.
7. As a website owner, I want to reorder media within a row, so that the most impactful photo or video appears first in that row.
8. As a website owner, I want to add the same media item to multiple rows, so that a special moment can appear in both "Our Trips" and "Favorites" for example.
9. As a website owner, I want each row to have its own independent ordering of media, so that the same photo can appear in a different position in each row it belongs to.
10. As a website owner, I want ungrouped media to be hidden on the public view, so that only intentionally curated content is visible to visitors.
11. As a website owner, I want to see ungrouped media in my editing view, so that I can assign it to rows without losing track of it.
12. As a website owner, I want empty rows to be hidden from the public view, so that visitors don't see placeholder rows with no content.
13. As a website owner, I want to see empty rows in my editing view, so that I can add content to them before publishing.
14. As a website owner, I want to be prevented from creating more than 10 rows per website, so that the site stays manageable.
15. As a website owner, I want to be prevented from adding more than 10 media items to a single row, so that rows remain concise.
16. As a website visitor, I want to see media organized by named rows, so that I can navigate the couple's story thematically.
17. As a website visitor, I want rows and their media to appear in the order the couple defined, so that the narrative flows as intended.
18. As a website visitor, I want rows with no media to be hidden, so that the page looks complete and intentional.
19. As a website visitor, I want to only see media that has been assigned to at least one row, so that the public view is always curated.

## Implementation Decisions

### Schema Changes

- Introduce a new `MediaRow` entity belonging to `CoupleWebsite`, with: `id`, `websiteId`, `name`, `sortOrder`, `createdAt`, `updatedAt`, and `deletedAt` (soft delete). This defines the rows and their display order.
- Introduce a new `MediaRowItem` join table linking `MediaRow` and `Media`, with: `id`, `rowId`, `mediaId`, `sortOrder`, and `createdAt`. This enables the many-to-many relationship between media and rows, with per-row ordering.
- The existing `sortOrder` field on `Media` is kept as-is (used for the upload/global order and for the owner's ungrouped media view).
- `MediaRow` has a unique constraint on `(websiteId, name)` to prevent duplicate row names per website.
- `MediaRowItem` has a unique constraint on `(rowId, mediaId)` to prevent the same media from being added to the same row twice.

### New Use Cases

- `create-row`: Validates the 10-row limit per website, creates a `MediaRow` with `sortOrder = max + 1`.
- `rename-row`: Updates the name of a `MediaRow`, respecting the uniqueness constraint.
- `delete-row`: Soft-deletes a `MediaRow`. `MediaRowItem` records for this row are hard-deleted (or cascade-deleted). Media itself is unaffected and becomes ungrouped.
- `list-rows`: Returns all rows for a website (including empty ones), ordered by `sortOrder` asc. For each row, returns media items ordered by their per-row `sortOrder`.
- `reorder-rows`: Accepts an ordered array of row IDs and updates each row's `sortOrder` atomically in a transaction.
- `add-media-to-row`: Validates the 10-media-per-row limit, creates a `MediaRowItem` with `sortOrder = max + 1` in that row.
- `remove-media-from-row`: Deletes the `MediaRowItem` linking the media to the row.
- `reorder-row-media`: Accepts an ordered array of media IDs for a specific row and updates `MediaRowItem.sortOrder` atomically in a transaction.

### Modified Use Cases

- `get-public-website`: Updated to return rows with their ordered media instead of a flat media list. Only rows with at least one media item are returned. Only media assigned to at least one row is visible. Rows are ordered by `sortOrder` asc; media within each row is ordered by `MediaRowItem.sortOrder` asc.

### API Contracts

```
POST   /websites/:id/rows                           → Create a row
PATCH  /websites/:id/rows/:rowId                    → Rename a row
DELETE /websites/:id/rows/:rowId                    → Delete a row
GET    /websites/:id/rows                           → List rows with their media (edit view)
PATCH  /websites/:id/rows/reorder                   → Reorder rows
POST   /websites/:id/rows/:rowId/media              → Add media to a row
DELETE /websites/:id/rows/:rowId/media/:mediaId     → Remove media from a row
PATCH  /websites/:id/rows/:rowId/media/reorder      → Reorder media within a row
```

All new row endpoints are authenticated and scoped to the authenticated user's website.

### Validation Rules

- Maximum 10 rows per website (enforced in `create-row`).
- Maximum 10 media items per row (enforced in `add-media-to-row`).
- Row names must be unique within a website.
- Media must belong to the same website as the row before being added.
- Reorder payloads must contain exactly the IDs of all existing items (no partial reorders).

### Authorization

- All write operations on rows verify that the `websiteId` belongs to the authenticated user.
- The public endpoint (`GET /s/:slug`) remains unauthenticated but filters output as described.

## Testing Decisions

**What makes a good test:**
Test only external behavior — what goes in and what comes out. Do not assert on internal implementation details like which Prisma methods were called or in what order. A good test describes a real scenario: "given a website with 10 rows, creating an 11th row returns a 400 error."

**Modules to test:**

- `create-row`: enforce 10-row limit, auto-assign sortOrder, reject duplicate names.
- `rename-row`: update name, enforce uniqueness, reject rename on non-owned row.
- `delete-row`: soft-delete the row, verify media is unaffected and becomes ungrouped.
- `add-media-to-row`: enforce 10-media limit, reject media from a different website, auto-assign per-row sortOrder.
- `remove-media-from-row`: verify the join record is removed, media itself is unaffected.
- `reorder-rows`: verify all rows receive updated sortOrder atomically.
- `reorder-row-media`: verify per-row sortOrder is updated atomically.
- `get-public-website`: verify only non-empty rows are returned, only assigned media is visible, ordering is correct.

**Prior art:**
Existing tests in `tests/usecases/` follow the pattern of `mockDeep<T>()` for all dependencies with `mockReset()` in `beforeEach`. The `reorder-media` tests are the closest prior art for the reorder use cases. The `get-public-website` test is prior art for the public endpoint changes.

## Out of Scope

- Nested rows or sub-categories.
- Row-level cover images or thumbnails.
- Drag-and-drop or frontend implementation — this PRD covers the backend API only.
- Moving media between rows (equivalent to remove + add).
- Bulk adding multiple media items to a row in one request.
- Visibility toggles per row (rows are always either empty/hidden or populated/visible).
- Any changes to how media is uploaded — media upload flow is unchanged.

## Further Notes

- Since media can appear in multiple rows, deleting a media item should cascade-delete all its `MediaRowItem` records.
- The existing `PATCH /websites/:id/media/reorder` endpoint (global flat reorder) remains available for managing sort order of ungrouped media in the owner's edit view.
- The `list-rows` edit view should also return ungrouped media (media not in any row) separately so the owner can assign it.
