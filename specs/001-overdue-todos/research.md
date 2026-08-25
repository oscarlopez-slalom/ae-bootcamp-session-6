# Phase 0 Research: Support for Overdue Todo Items

**Feature**: `001-overdue-todos` | **Date**: 2026-08-25

The specification has no remaining `[NEEDS CLARIFICATION]` markers (all three open questions were
resolved during `/speckit-clarify`). This document records the technical decisions and the codebase
facts that shape the plan and the upcoming tasks.

## Decision 1: Where the overdue logic lives — frontend, not backend

- **Decision**: Compute overdue status and reordering on the frontend; leave the Express backend and
  its API untouched.
- **Rationale**: FR-008 requires overdue to be evaluated against the **user's current local calendar
  date** each time the list is displayed. The backend has no reliable notion of the user's local
  timezone, and the current server already returns todos ordered `createdAt DESC`. Deriving state on
  the client keeps a single source of truth for "today", avoids a schema/API change, and matches the
  constitution's scope-discipline principle (no backend changes were requested).
- **Alternatives considered**:
  - *Compute on the backend and add an `overdue` field*: rejected — introduces timezone ambiguity and
    an unnecessary API/persistence change for a display concern.
  - *Persist an overdue flag*: rejected — overdue is derived state that changes with the date; storing
    it would immediately go stale (contradicts FR-008).

## Decision 2: Overdue determination at day granularity

- **Decision**: A todo is overdue when it is **incomplete**, has a `dueDate`, and that date is
  strictly before today, comparing **calendar dates only** (no time-of-day). Due date equal to today
  is on-time.
- **Rationale**: Matches the clarified spec and edge cases. Comparing whole days avoids off-by-one
  issues from timestamps and DST.
- **Implementation note**: Normalize both the due date and "now" to a local midnight (or to a
  `YYYY-MM-DD` day key) before comparing. `dueDate` arrives as an ISO date string like `2025-12-25`;
  `completed` is `0 | 1`. The helper must treat a null/empty/invalid `dueDate` as not overdue and must
  never throw.

## Decision 3: Ordering strategy

- **Decision**: Partition the list into overdue and non-overdue groups. Overdue group is sorted
  **oldest due date first** (most overdue at the very top). Non-overdue group preserves the existing
  **newest-first (`createdAt DESC`)** order as received from the API.
- **Rationale**: Directly encodes the clarified answers (overdue-at-top, most-overdue-first) while
  leaving the established default ordering intact for everything else. A stable partition keeps the
  behavior deterministic and easy to test.
- **Alternatives considered**: Re-sorting the whole list by due date — rejected because non-overdue
  todos (including those with no due date) must keep newest-first order.

## Decision 4: Visual marker

- **Decision**: When a todo is overdue, `TodoCard` renders an "Overdue" text badge and applies the
  design system's danger color to the due date text.
- **Rationale**: Clarified answer; conveys state by **text**, not color alone, satisfying accessibility
  and the design-system principle. Reuses the existing `--danger-color` CSS variable, which is already
  defined for both light and dark themes in `packages/frontend/src/styles/theme.css`.
- **Implementation note**: Add an `.overdue-badge` style and an `.todo-due-date.overdue` modifier in
  `App.css`. Do not hardcode hex values; reference `var(--danger-color)`.

## Codebase facts (verified)

- **Todo shape** (API + state): `{ id: number, title: string, dueDate: string | null, completed: 0|1,
  createdAt: string }`. Field is `dueDate` (camelCase); `completed` is numeric `0/1`.
- **State**: `todos` held in `App.js` via `useState`, fetched with `TodoService.getAllTodos()`; new
  todos are prepended. Toggle via `PATCH /api/todos/:id/toggle`.
- **Current ordering**: backend `ORDER BY createdAt DESC`; frontend does no client-side reordering
  today. This feature introduces the first client-side ordering step.
- **Due date rendering**: `TodoCard` formats with native `new Date(dateString).toLocaleDateString`; no
  date library is present, and none is needed.
- **Styling**: CSS variables in `styles/theme.css` (`--danger-color` = `#c62828` light / `#ef5350`
  dark); completed state uses a `.completed` class on `.todo-card`.
- **Tests**: Jest everywhere. Frontend uses React Testing Library (+ MSW in `App.test.js`); component
  tests query by text/role and `container.querySelector('.todo-card')`. Backend uses Supertest. Mock
  todos use `dueDate: '2025-12-25'`, `completed: 0|1`.

## Testing approach

- **Unit** (`utils/__tests__/overdue.test.js`): `isOverdue` for past/today/future/no-date and
  completed-vs-incomplete; `sortTodosByOverdue` for overdue-at-top and oldest-first ordering with a
  fixed injected "now" so tests are deterministic.
- **Component**: `TodoCard.test.js` asserts the "Overdue" badge and danger styling appear only for
  overdue todos; `TodoList.test.js` asserts overdue items render above non-overdue ones in the correct
  order.
- **Determinism**: The helper accepts an injectable `now` (Date) parameter so tests never depend on the
  real clock.

**Output**: All unknowns resolved; ready for Phase 1 design.
