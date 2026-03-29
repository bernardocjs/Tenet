# Work Items Breakdown

## Overview

The Media Rows feature introduces Netflix-style thematic rows to couple websites. Media can belong to multiple rows, each with independent ordering. Ungrouped media is hidden from the public view. The breakdown follows a tracer-bullet approach — each slice cuts through schema, use cases, controller, routes, and tests end-to-end.

## Work Items

### 1. Row entity foundation — schema + CRUD lifecycle

**Type**: AFK
**Blocked by**: None — can start immediately
**User stories addressed**: 1, 2, 3, 11, 13, 14

**Description**: Introduce the `MediaRow` and `MediaRowItem` tables via a Prisma migration. Implement `create-row`, `rename-row`, `delete-row`, and `list-rows` use cases. Wire up controller and routes. The list endpoint returns all rows (including empty ones) with their ordered media, for use in the owner's edit view.

**Acceptance criteria**:
- [ ] Migration adds `MediaRow` (id, websiteId, name, sortOrder, timestamps, deletedAt) and `MediaRowItem` (id, rowId, mediaId, sortOrder, createdAt)
- [ ] `POST /websites/:id/rows` creates a row; returns 400 if website already has 10 rows
- [ ] `PATCH /websites/:id/rows/:rowId` renames a row; returns 400 on duplicate name
- [ ] `DELETE /websites/:id/rows/:rowId` soft-deletes the row; media is unaffected
- [ ] `GET /websites/:id/rows` returns all rows (including empty) ordered by sortOrder, each with its media ordered by per-row sortOrder
- [ ] All endpoints return 403/404 if row does not belong to the authenticated user's website
- [ ] Tests cover limit enforcement, name uniqueness, soft-delete behavior, and list ordering

---

### 2. Reorder rows

**Type**: AFK
**Blocked by**: #1
**User stories addressed**: 4

**Description**: Implement `reorder-rows` use case and `PATCH /websites/:id/rows/reorder` endpoint. Accepts an ordered array of all row IDs for the website and updates each row's `sortOrder` atomically in a transaction.

**Acceptance criteria**:
- [ ] `PATCH /websites/:id/rows/reorder` accepts `{ rowIds: string[] }` and updates sortOrder for each row
- [ ] Operation is atomic (single transaction)
- [ ] Returns 400 if the provided IDs do not exactly match the website's existing row IDs
- [ ] Returns the updated rows in the new order
- [ ] Tests cover correct reordering, partial ID rejection, and cross-website rejection

---

### 3. Add/remove media from a row

**Type**: AFK
**Blocked by**: #1
**User stories addressed**: 5, 6, 8, 9, 15

**Description**: Implement `add-media-to-row` and `remove-media-from-row` use cases. Adding creates a `MediaRowItem` with `sortOrder = max + 1` in that row. Removing deletes the join record. Media can be added to multiple rows with independent positioning.

**Acceptance criteria**:
- [ ] `POST /websites/:id/rows/:rowId/media` adds a media item to the row; returns 400 if row already has 10 items
- [ ] Returns 400 if media does not belong to the same website as the row
- [ ] Returns 400 if media is already in the row (duplicate prevention)
- [ ] `DELETE /websites/:id/rows/:rowId/media/:mediaId` removes the join record; media record itself is unaffected
- [ ] The same media item can be added to different rows independently
- [ ] Tests cover 10-item limit, cross-website rejection, duplicate prevention, and verify media is not deleted on removal

---

### 4. Reorder media within a row

**Type**: AFK
**Blocked by**: #3
**User stories addressed**: 7

**Description**: Implement `reorder-row-media` use case and `PATCH /websites/:id/rows/:rowId/media/reorder` endpoint. Updates `MediaRowItem.sortOrder` for all items in a row atomically. Does not affect the same media item's position in other rows.

**Acceptance criteria**:
- [ ] `PATCH /websites/:id/rows/:rowId/media/reorder` accepts `{ mediaIds: string[] }` and updates per-row sortOrder
- [ ] Operation is atomic (single transaction)
- [ ] Returns 400 if the provided IDs do not exactly match the row's current media
- [ ] Reordering in one row does not affect sortOrder of the same media in other rows
- [ ] Tests cover correct reordering, partial ID rejection, and cross-row isolation

---

### 5. Public website returns grouped rows

**Type**: AFK
**Blocked by**: #1, #3
**User stories addressed**: 10, 12, 16, 17, 18, 19

**Description**: Update `get-public-website` to return media organized by rows instead of a flat list. Only rows with at least one media item are included. Only media assigned to at least one row is visible. Rows are ordered by `sortOrder` asc; media within each row by `MediaRowItem.sortOrder` asc.

**Acceptance criteria**:
- [ ] `GET /s/:slug` response includes a `rows` array instead of a flat `media` array
- [ ] Each row includes `id`, `name`, and `media` (ordered by per-row sortOrder)
- [ ] Empty rows are excluded from the response
- [ ] Media not assigned to any row is excluded from the response
- [ ] Rows are ordered by their `sortOrder` ascending
- [ ] Tests cover: empty rows hidden, ungrouped media hidden, correct row and media ordering, published vs unpublished website access
