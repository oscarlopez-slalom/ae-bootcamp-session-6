# Feature Specification: Support for Overdue Todo Items

**Feature Branch**: `001-overdue-todos`

**Created**: 2026-08-25

**Status**: Draft

**Input**: User description: "Support for Overdue Todo Items — As a todo application user I want to easily identify and distinguish overdue tasks in my todo list so that I can prioritize my work and quickly see which tasks are past their due date. Users need a clear, visual way to identify which todos have not been completed by their due date. This feature must include automated tests covering the overdue determination logic and its display, following the existing Jest patterns in the repository."

## Clarifications

### Session 2026-08-25

- Q: Should overdue todos change position in the list, or stay in place and only gain a visual marker? → A: Overdue todos are automatically moved to the top of the list (still visually marked); non-overdue todos keep the existing newest-first order below them.
- Q: What visual form should the overdue marker take on a todo card? → A: An "Overdue" text badge on the card together with the todo's due date shown in the design system's danger color (so the state is conveyed by text, not color alone).
- Q: Among the overdue todos grouped at the top, in what order should they appear relative to one another? → A: Most overdue first — sorted by oldest due date at the top.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Identify overdue todos at a glance (Priority: P1)

A user opens their todo list and, without checking any dates manually, can immediately see which
incomplete todos are past their due date because those items are visually distinguished from the
rest of the list.

**Why this priority**: This is the core value of the feature. Surfacing overdue items is the entire
reason for the request; every other scenario builds on it. Delivered alone, it already lets users
prioritize their work.

**Independent Test**: Load a list containing at least one incomplete todo with a due date in the
past and one with a due date in the future. Confirm only the past-due, incomplete item is marked as
overdue and the future-dated item is not.

**Acceptance Scenarios**:

1. **Given** an incomplete todo whose due date is before today, **When** the user views the todo
   list, **Then** that todo is visually marked as overdue.
2. **Given** an incomplete todo whose due date is today, **When** the user views the todo list,
   **Then** that todo is NOT marked as overdue.
3. **Given** an incomplete todo whose due date is in the future, **When** the user views the todo
   list, **Then** that todo is NOT marked as overdue.
4. **Given** a todo that has no due date, **When** the user views the todo list, **Then** that todo
   is NOT marked as overdue.
5. **Given** a list with a mix of overdue and non-overdue todos, **When** the user views the list,
   **Then** all overdue todos appear at the top sorted oldest-due-date first, above the non-overdue
   todos which remain in newest-first order.

---

### User Story 2 - Completed todos are never flagged as overdue (Priority: P2)

A user who has already finished a task before or after its due date should not see it treated as
overdue, so the overdue indicator stays meaningful and only draws attention to outstanding work.

**Why this priority**: Prevents false positives that would erode trust in the indicator. It is
essential for correctness but secondary to establishing the indicator itself.

**Independent Test**: Mark a past-due todo as completed and confirm it is no longer flagged as
overdue, while an equivalent incomplete past-due todo remains flagged.

**Acceptance Scenarios**:

1. **Given** a completed todo whose due date is in the past, **When** the user views the todo list,
   **Then** that todo is NOT marked as overdue.
2. **Given** an overdue todo, **When** the user marks it complete, **Then** the overdue indicator is
   removed from that todo.
3. **Given** a completed past-due todo, **When** the user marks it incomplete again, **Then** the
   overdue indicator reappears.

---

### User Story 3 - Overdue state stays current as the day changes (Priority: P3)

A user returning to the app on a later day sees the overdue status reflect the current date, so a
todo that becomes past due updates automatically without manual action.

**Why this priority**: Keeps the feature accurate over time. It is a refinement of the primary
behavior rather than a new capability, so it is lowest priority.

**Independent Test**: With a todo due "today", advance the reference date to the next day and confirm
the same todo is now flagged as overdue.

**Acceptance Scenarios**:

1. **Given** an incomplete todo due today that is not yet overdue, **When** the current date advances
   past the due date, **Then** the todo becomes marked as overdue the next time the list is viewed.

---

### Edge Cases

- A todo with no due date is never overdue, regardless of completion state.
- A todo due exactly today is treated as on-time (not overdue) for the whole of the current day.
- Time-of-day is not considered: overdue is determined by calendar date, so due dates are compared as
  whole days rather than exact timestamps.
- An empty todo list shows no overdue indicators and no errors.
- The overdue determination uses the user's current local date as the reference for "today".

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST classify an incomplete todo as overdue when its due date is strictly before
  the current date.
- **FR-002**: System MUST NOT classify a todo as overdue when its due date is the current date.
- **FR-003**: System MUST NOT classify a todo as overdue when its due date is after the current date.
- **FR-004**: System MUST NOT classify a todo as overdue when it has no due date.
- **FR-005**: System MUST NOT classify a completed todo as overdue, regardless of its due date.
- **FR-006**: System MUST visually distinguish overdue todos from non-overdue todos in the todo
  list by displaying an "Overdue" text badge on the todo and rendering its due date in the design
  system's danger color.
- **FR-007**: System MUST update a todo's overdue status immediately when its completion state
  changes (completing removes the indicator; reopening restores it if still past due).
- **FR-008**: System MUST determine overdue status relative to the user's current local calendar
  date each time the todo list is displayed.
- **FR-009**: System MUST order overdue todos above all non-overdue todos in the list. Within the
  overdue group, todos MUST be sorted most-overdue first (oldest due date at the top). Non-overdue
  todos retain the existing newest-first ordering below the overdue group.
- **FR-010**: When a todo's overdue status changes (e.g., it is completed, reopened, or the date
  advances), the system MUST re-place it in the correct group (overdue at top, otherwise in its
  normal newest-first position).
- **FR-011**: The feature MUST include automated tests, following the existing Jest patterns in the
  repository, that cover the overdue determination logic (past/today/future/no-due-date, and
  completed vs. incomplete), the reordering of overdue todos to the top, and the display of the
  overdue marker in the todo list.

### Key Entities *(include if feature involves data)*

- **Todo**: An existing task item. Relevant attributes for this feature are its due date (optional)
  and its completion status. This feature introduces a derived "overdue" state computed from those
  attributes and the current date; it does not add new stored fields.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of incomplete todos with a past due date are visually marked as overdue when the
  list is viewed.
- **SC-002**: 0% of completed, future-dated, today-dated, or due-date-less todos are marked as
  overdue (no false positives).
- **SC-003**: A user can identify every overdue task in their list by visual scan alone, without
  manually comparing any due date to today's date.
- **SC-004**: When a user toggles a todo's completion state, its overdue indicator updates to the
  correct state with no additional user action.
- **SC-005**: All overdue todos appear above every non-overdue todo when the list is viewed, and a
  todo moves between groups when its overdue status changes, with no additional user action.
- **SC-006**: Automated tests cover the overdue determination logic, the reordering behavior, and
  the overdue display, and all pass in the existing test suite.

## Assumptions

- Todos already carry an optional due date and a completion status, as described in the existing
  functional requirements; no new persisted fields are introduced.
- "Overdue" is evaluated at whole-day (calendar date) granularity in the user's local timezone; the
  time of day is not considered.
- A due date equal to today is considered on-time for the entirety of that day.
- This remains a single-user application; overdue status is global to the list and not user-specific.
- The visual treatment follows the existing design system (colors, typography, spacing) and applies
  to the existing todo list/card presentation. The overdue marker is an "Overdue" text badge plus
  the due date in the danger color (see Clarifications); exact placement and sizing within the card
  are refined during planning.
