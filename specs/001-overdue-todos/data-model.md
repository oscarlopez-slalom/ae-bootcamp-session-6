# Phase 1 Data Model: Support for Overdue Todo Items

**Feature**: `001-overdue-todos` | **Date**: 2026-08-25

This feature introduces **no new persisted entities or fields**. It adds a *derived* property computed
on the client from existing todo data plus the current date.

## Entity: Todo (existing — unchanged)

| Field | Type | Notes |
|-------|------|-------|
| `id` | number | Existing identifier. |
| `title` | string | Existing title (required, ≤255 chars). |
| `dueDate` | string \| null | Existing ISO date string (e.g., `"2025-12-25"`), optional. Reference input for overdue derivation. |
| `completed` | number (`0` \| `1`) | Existing completion flag. `1` = complete. |
| `createdAt` | string | Existing ISO timestamp. Drives the default newest-first order. |

No columns are added, removed, or renamed. The backend contract is unchanged.

## Derived property: `isOverdue`

- **Type**: boolean (computed at render time; not stored, not sent to the API).
- **Definition**: `isOverdue(todo, now)` is `true` when **all** of the following hold:
  1. `todo.completed` is falsy (`0`), AND
  2. `todo.dueDate` is a non-empty, valid date, AND
  3. the calendar date of `todo.dueDate` is strictly before the calendar date of `now` (local time).
- **Otherwise** `false` — including when `dueDate` is null/empty/invalid, is today, or is in the
  future, or when the todo is completed.
- **Purity/safety**: pure function of its inputs; never mutates the todo; never throws on bad input.

## Derived ordering: `sortTodosByOverdue`

- **Signature**: `sortTodosByOverdue(todos, now) → Todo[]` (returns a new array; does not mutate input).
- **Rule**:
  1. Partition into `overdue` (where `isOverdue(todo, now)`) and `rest`.
  2. Sort `overdue` by `dueDate` ascending (oldest date first = most overdue at top).
  3. Keep `rest` in its incoming order (newest-first `createdAt DESC` from the API).
  4. Return `[...overdueSorted, ...rest]`.

## State transitions (derived, per render)

A todo's overdue state is recomputed whenever the list renders; there is no stored transition. The
observable transitions are:

| Trigger | Effect on overdue state |
|---------|-------------------------|
| Todo is past due and incomplete | Becomes overdue → badge shown, moved into the top group. |
| User completes an overdue todo | No longer overdue → badge removed, returns to newest-first group. |
| User reopens a completed past-due todo | Overdue again → badge shown, moves back to the top group. |
| Current date advances past a due date | Todo becomes overdue on next render. |
| Todo has no due date | Never overdue, regardless of completion. |

## Validation rules (from requirements)

- FR-001..FR-005: the truth table above (past → overdue; today/future/no-date/completed → not overdue).
- FR-006: overdue todos display an "Overdue" badge and danger-colored due date.
- FR-009/FR-010: overdue group on top, oldest-first; re-placement on status/date change.
- FR-011: derivation, ordering, and display are covered by automated tests.
