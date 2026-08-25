# Quickstart: Validate Overdue Todo Items

**Feature**: `001-overdue-todos` | **Date**: 2026-08-25

This guide describes how to validate the overdue-todos feature once it is implemented. It does not
contain implementation code; see [data-model.md](./data-model.md) for the derivation rules and
[plan.md](./plan.md) for the approach.

## Prerequisites

- Dependencies installed: `npm run install:all` (from repo root).
- On branch `001-overdue-todos`.

## Automated validation (primary)

Run the frontend test suite, which will include the new overdue tests:

```bash
npm test --workspace=frontend
```

Expected: all tests pass, including:

- `packages/frontend/src/utils/__tests__/overdue.test.js`
  - `isOverdue` returns `true` for an incomplete todo with a past `dueDate`.
  - returns `false` for due-today, future, missing-`dueDate`, and completed todos.
  - `sortTodosByOverdue` places overdue todos first, sorted oldest-due-date first, and keeps
    non-overdue todos in their incoming newest-first order.
- `packages/frontend/src/components/__tests__/TodoCard.test.js`
  - renders an "Overdue" badge and danger-colored due date only for overdue todos.
- `packages/frontend/src/components/__tests__/TodoList.test.js`
  - renders overdue todos above non-overdue todos in the correct order.

Run the whole suite to confirm nothing regressed:

```bash
npm test
```

Expected: frontend and backend suites pass; coverage remains ≥ 80% per the constitution.

## Manual validation (secondary)

1. Start the app: `npm start` (frontend on `http://localhost:3000`, backend on `:3030`).
2. Add a todo with a **past** due date and leave it incomplete → it shows the "Overdue" badge, its
   due date is in the danger color, and it appears at the **top** of the list.
3. Add a second overdue todo with an **even older** due date → it appears **above** the first overdue
   todo (oldest-first).
4. Add a todo due **today** and one due in the **future** → neither is marked overdue; both sit below
   the overdue group in newest-first order.
5. Mark an overdue todo **complete** → its badge disappears and it drops out of the top group.
6. Toggle it back to **incomplete** → it is flagged overdue again and returns to the top group.
7. Toggle **dark mode** → the danger color and badge remain legible in both themes.

## Success signals (maps to Success Criteria)

- SC-001/SC-002: only incomplete past-due todos are marked; no false positives.
- SC-003: overdue items are identifiable by visual scan (badge), no manual date math.
- SC-004: toggling completion updates the marker with no other action.
- SC-005: overdue items are grouped on top and move between groups on status change.
- SC-006: automated tests for derivation, ordering, and display all pass.
