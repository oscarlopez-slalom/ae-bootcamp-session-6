---
description: "Task list for Support for Overdue Todo Items"
---

# Tasks: Support for Overdue Todo Items

**Input**: Design documents from `specs/001-overdue-todos/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Tests**: Included — the specification explicitly requires automated tests (FR-011), so each user
story has test tasks written before its implementation (TDD).

**Organization**: Tasks are grouped by user story so each story can be implemented and tested
independently. This is a frontend-only change; the Express backend and its API are not modified.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story the task belongs to (US1, US2, US3)
- Exact file paths are included in each description

## Path Conventions

- Web app monorepo: all changes are under `packages/frontend/src/`. No `packages/backend/` changes.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare the frontend workspace for the new helper module and confirm a green baseline.

- [X] T001 [P] Create directories `packages/frontend/src/utils/` and `packages/frontend/src/utils/__tests__/` per plan.md
- [X] T002 Confirm the frontend test suite runs green before changes: `npm test --workspace=frontend`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Create the shared, pure overdue helper module that every user story imports.

**⚠️ CRITICAL**: User story work cannot begin until this module exists and is importable.

- [X] T003 Create the helper module scaffold `packages/frontend/src/utils/overdue.js` exporting pure functions `isOverdue(todo, now = new Date())` and `sortTodosByOverdue(todos, now = new Date())` — null/invalid-safe, never mutates inputs, never throws (behavior implemented in later story tasks)

**Checkpoint**: `overdue.js` is importable — user stories can now proceed.

---

## Phase 3: User Story 1 - Identify overdue todos at a glance (Priority: P1) 🎯 MVP

**Goal**: Incomplete todos past their due date are shown with an "Overdue" badge and danger-colored
due date, and grouped at the top of the list sorted oldest-due-date first.

**Independent Test**: Load a list with an incomplete past-due todo and an incomplete future-dated
todo; only the past-due one shows the badge and it appears at the top of the list.

### Tests for User Story 1 (write first, ensure they FAIL) ⚠️

- [X] T004 [P] [US1] Unit tests for `isOverdue` (incomplete todo: past → true; today → false; future → false; no `dueDate` → false), using an injected fixed `now`, in `packages/frontend/src/utils/__tests__/overdue.test.js`
- [X] T005 [P] [US1] Unit tests for `sortTodosByOverdue` (overdue todos on top sorted oldest-due-date first; non-overdue keep incoming newest-first order) in `packages/frontend/src/utils/__tests__/overdue.test.js`
- [X] T006 [P] [US1] Component test: `TodoCard` renders an "Overdue" badge and applies the danger style to the due date only for an overdue todo, in `packages/frontend/src/components/__tests__/TodoCard.test.js`
- [X] T007 [P] [US1] Component test: overdue todos render above non-overdue todos in the correct order, in `packages/frontend/src/components/__tests__/TodoList.test.js`

### Implementation for User Story 1

- [X] T008 [US1] Implement `isOverdue` in `packages/frontend/src/utils/overdue.js` — incomplete (`completed` falsy) AND valid `dueDate` strictly before `now` compared at local calendar-day granularity (makes T004 pass)
- [X] T009 [US1] Implement `sortTodosByOverdue` in `packages/frontend/src/utils/overdue.js` — partition overdue vs rest, sort overdue by `dueDate` ascending, keep `rest` in incoming order, return a new array (makes T005 pass)
- [X] T010 [US1] Update `packages/frontend/src/components/TodoCard.js` to render an "Overdue" text badge and add an `overdue` class to the due-date element when the todo is overdue (makes T006 pass)
- [X] T011 [P] [US1] Add `.overdue-badge` and `.todo-due-date.overdue` styles referencing `var(--danger-color)` in `packages/frontend/src/App.css` (works in light and dark themes)
- [X] T012 [US1] Apply `sortTodosByOverdue` to the `todos` array before rendering the list in `packages/frontend/src/App.js` (passing ordered todos to `TodoList`) (makes T007 pass)

**Checkpoint**: User Story 1 is fully functional and independently testable — this is the MVP.

---

## Phase 4: User Story 2 - Completed todos are never flagged as overdue (Priority: P2)

**Goal**: A completed todo is never overdue; completing an overdue todo removes the badge and returns
it to the normal group, and reopening it restores the overdue state.

**Independent Test**: Mark a past-due todo complete → badge disappears and it leaves the top group;
an equivalent incomplete past-due todo stays flagged.

### Tests for User Story 2 (write first, ensure they FAIL) ⚠️

- [X] T013 [P] [US2] Unit test: `isOverdue` returns `false` for a completed (`completed === 1`) past-due todo, in `packages/frontend/src/utils/__tests__/overdue.test.js`
- [X] T014 [P] [US2] Component/integration test: toggling a todo's completion removes/restores the "Overdue" badge and moves it out of / back into the top group, in `packages/frontend/src/__tests__/App.test.js`

### Implementation for User Story 2

- [X] T015 [US2] Verify/adjust `isOverdue` in `packages/frontend/src/utils/overdue.js` so completed todos short-circuit to `false` before the date check (makes T013 pass)
- [X] T016 [US2] Ensure the list re-derives overdue grouping after `handleToggleTodo` updates `todos` state in `packages/frontend/src/App.js` (makes T014 pass)

**Checkpoint**: User Stories 1 and 2 both work independently.

---

## Phase 5: User Story 3 - Overdue state stays current as the day changes (Priority: P3)

**Goal**: Overdue status is evaluated against the current local date on each render, so a todo due
"today" becomes overdue once the date advances past its due date.

**Independent Test**: With a todo due "today" and an injected `now` advanced to the next day, the todo
is reported overdue.

### Tests for User Story 3 (write first, ensure they FAIL) ⚠️

- [X] T017 [P] [US3] Unit test: a todo due on date D is not overdue when `now` = D, but is overdue when `now` = D+1 (injected `now`), in `packages/frontend/src/utils/__tests__/overdue.test.js`

### Implementation for User Story 3

- [X] T018 [US3] Confirm the render path derives overdue status from a fresh current date each render (no memoized/stale "today") in `packages/frontend/src/App.js`; adjust if a stale value is cached (makes T017's rendering assumption hold)

**Checkpoint**: All three user stories are independently functional.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Edge cases, coverage, and end-to-end validation across stories.

- [X] T019 [P] Add edge-case unit tests (empty list returns empty; list with no due dates is unchanged; stability of ordering) in `packages/frontend/src/utils/__tests__/overdue.test.js`
- [X] T020 [P] Confirm new code keeps coverage ≥ 80% per the constitution: `npm test --workspace=frontend -- --coverage`
- [X] T021 Run full suite to confirm no regressions: `npm test`
- [X] T022 Execute the manual validation steps and theme check in `specs/001-overdue-todos/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately.
- **Foundational (Phase 2)**: Depends on Setup. **Blocks all user stories** (creates `overdue.js`).
- **User Stories (Phase 3–5)**: All depend on Foundational (T003). US1 is the MVP; US2 and US3 build
  on the same helper but are independently testable.
- **Polish (Phase 6)**: Depends on the user stories that are being shipped.

### User Story Dependencies

- **US1 (P1)**: Needs T003. Implements the core `isOverdue`/`sortTodosByOverdue` behavior and display.
- **US2 (P2)**: Needs T003; benefits from US1's `isOverdue` (adds/verifies the completed-item rule).
- **US3 (P3)**: Needs T003; verifies date-relative evaluation. Smallest story.

### Within Each User Story

- Write the story's tests first and see them fail, then implement until green.
- In `overdue.js`, `isOverdue` (T008) comes before `sortTodosByOverdue` (T009) since sorting uses it.
- Helper implementation before the components that consume it (T008/T009 before T012).

### Parallel Opportunities

- T001 (setup dirs) is independent.
- Within US1, the four test tasks T004–T007 are `[P]` (T004/T005 same test file may need coordination
  if edited simultaneously; T006/T007 are separate files). T011 (CSS) is `[P]` with the helper work.
- US2 and US3 test authoring (T013, T017) can be drafted in parallel once T003 exists.

---

## Parallel Example: User Story 1

```bash
# Author the US1 component tests in parallel (different files):
Task: "TodoCard overdue badge test in packages/frontend/src/components/__tests__/TodoCard.test.js"
Task: "TodoList ordering test in packages/frontend/src/components/__tests__/TodoList.test.js"

# CSS can be added alongside helper implementation (different files):
Task: "Add .overdue-badge / .todo-due-date.overdue styles in packages/frontend/src/App.css"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

Deliver Phases 1–3. After US1, users can already see overdue todos badged and grouped at the top,
which is the core value. This is a shippable increment on its own.

### Incremental Delivery

1. Setup + Foundational → helper module exists.
2. US1 (P1) → MVP: badge + danger due date + overdue-at-top oldest-first ordering.
3. US2 (P2) → guarantees completed todos are never flagged and re-group on toggle.
4. US3 (P3) → confirms the state tracks the current date.
5. Polish → edge cases, coverage, and full quickstart validation.

### Notes

- All new logic centralizes in one pure, testable module (`overdue.js`) per the constitution's
  DRY/SOLID principles; components stay presentation-only.
- Tests use an injectable `now` so they never depend on the real clock.
