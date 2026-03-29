---
name: prd-to-issues
description: Break a PRD into independently-grabbable work items using tracer-bullet vertical slices. Read PRD from a folder and export breakdown to markdown. Use when user wants to break down a PRD into work items or plan a new feature.
---

# PRD to Work Items

Break a PRD into independently-grabbable work items using vertical slices (tracer bullets).

## Process

### 1. Locate the PRD

Ask the user for the path to the PRD file or folder.

If the PRD is not already in your context window, read it using file tools.

### 2. Explore the codebase (optional)

If you have not already explored the codebase, do so to understand the current state of the code.

### 3. Draft vertical slices

Break the PRD into **tracer bullet** issues. Each issue is a thin vertical slice that cuts through ALL integration layers end-to-end, NOT a horizontal slice of one layer.

Slices may be 'HITL' or 'AFK'. HITL slices require human interaction, such as an architectural decision or a design review. AFK slices can be implemented and merged without human interaction. Prefer AFK over HITL where possible.

<vertical-slice-rules>
- Each slice delivers a narrow but COMPLETE path through every layer (schema, API, UI, tests)
- A completed slice is demoable or verifiable on its own
- Prefer many thin slices over few thick ones
</vertical-slice-rules>

### 4. Quiz the user

Present the proposed breakdown as a numbered list. For each slice, show:

- **Title**: short descriptive name
- **Type**: HITL / AFK
- **Blocked by**: which other slices (if any) must complete first
- **User stories covered**: which user stories from the PRD this addresses

Ask the user:

- Does the granularity feel right? (too coarse / too fine)
- Are the dependency relationships correct?
- Should any slices be merged or split further?
- Are the correct slices marked as HITL and AFK?

Iterate until the user approves the breakdown.

### 5. Generate the breakdown document

Export the approved breakdown to a markdown file in the PRD folder.

Format the output as a structured markdown document with sections for each work item:

```
# Work Items Breakdown

## Overview

[Brief summary of the PRD and how it's sliced]

## Work Items

### 1. [Slice Title]

**Type**: HITL / AFK
**Blocked by**: [List of blocking items or "None - can start immediately"]
**User stories addressed**: [List of relevant user stories]

**Description**: [End-to-end behavior and what to build]

**Acceptance criteria**:
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

---
```

Save this as `breakdown.md` in the same directory as the PRD.
