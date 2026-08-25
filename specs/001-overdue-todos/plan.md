# Implementation Plan: Support for Overdue Todo Items

**Branch**: `001-overdue-todos` | **Date**: 2026-08-25 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/001-overdue-todos/spec.md`

## Summary

Add a derived "overdue" state to todos in the existing React + Express monorepo. An incomplete todo
whose `dueDate` is strictly before the user's current local calendar date is **overdue**. Overdue
todos are shown with an "Overdue" text badge and their due date in the design system's danger color,
and they are grouped at the top of the list sorted most-overdue-first (oldest due date at top), above
the existing newest-first todos.

Technical approach: implement this entirely on the **frontend** as a pure display/derivation concern.
"Overdue" depends on the user's local date (FR-008), so it is computed client-side and requires no
backend or persistence changes — no new stored fields (see [data-model.md](./data-model.md)). A small
pure helper module derives overdue status and produces the ordered list; `TodoCard` renders the badge;
`TodoList`/`App` apply the ordering. All new logic is covered by Jest tests following existing patterns.

## Technical Context

**Language/Version**: JavaScript (ES2020+), Node.js v16+ (per project-overview.md)

**Primary Dependencies**: React 18 (frontend), Express (backend, unchanged for this feature)

**Storage**: In-memory store in the backend; no schema change. Todo shape:
`{ id, title, dueDate (ISO date string | null), completed (0|1), createdAt (ISO timestamp) }`

**Testing**: Jest + React Testing Library (frontend), Jest + Supertest (backend). Colocated
`__tests__/` dirs.

**Target Platform**: Desktop web browser (single-column responsive UI)

**Project Type**: Web application (npm workspaces monorepo: `packages/frontend`, `packages/backend`)

**Performance Goals**: Instant/interactive; list sizes are small (single-user app). Sorting/derivation
is O(n log n) over a modest list, computed on render.

**Constraints**: Overdue is evaluated at whole-day (calendar date) granularity in the user's local
timezone; a due date equal to today is on-time. Marker must convey state by text, not color alone
(accessibility). Must work in both light and dark themes via existing CSS variables.

**Scale/Scope**: Single-user; frontend-only change touching 3–4 files plus a new helper and tests.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Checked against [constitution.md](../../.specify/memory/constitution.md) v1.0.0:

- **I. Readable, Conventional Code**: PASS — new code uses `camelCase`, 2-space indent, `PascalCase`
  components; the overdue helper lives in a focused module with clear names.
- **II. DRY, KISS & SOLID**: PASS — a single reusable pure helper (`isOverdue` / `sortTodosByOverdue`)
  centralizes the logic; `TodoCard` only displays, it does not compute policy. No duplication of date
  logic across components.
- **III. Test-Driven Quality (NON-NEGOTIABLE)**: PASS — plan mandates unit tests for the derivation
  helper (past/today/future/no-date, completed vs incomplete) and component/render tests for the badge
  and ordering, matching FR-011 and the 80%+ coverage principle.
- **IV. Robust Error Handling & Boundary Validation**: PASS — helper guards null/invalid `dueDate` and
  never throws; a missing due date is simply "not overdue". No new persistence, so existing immediate-
  persistence behavior is preserved.
- **V. Design-System Consistency & Scope Discipline**: PASS — uses the existing `--danger-color` token
  and card layout; adds no out-of-scope features (no filters, no new API, no priorities). Reordering is
  an explicitly clarified in-scope behavior.

**Result**: No violations. Complexity Tracking table left empty.

**Post-design re-check (after Phase 1)**: Still PASS. The design keeps all logic in one pure,
independently testable helper (SRP/DRY), changes no backend code or data model, reuses existing design
tokens, and mandates tests for derivation, ordering, and display — no new violations introduced.

## Project Structure

### Documentation (this feature)

```text
specs/001-overdue-todos/
├── plan.md              # This file (/speckit-plan output)
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── spec.md              # Feature specification (with Clarifications)
└── checklists/
    └── requirements.md  # Spec quality checklist
```

No `contracts/` directory: this feature adds no external interface. The backend API is unchanged, and
the change is a client-side display/derivation concern, so there is no new contract to document.

### Source Code (repository root)

```text
packages/frontend/src/
├── utils/
│   ├── overdue.js                    # NEW: pure helpers — isOverdue(todo, now), sortTodosByOverdue(todos, now)
│   └── __tests__/
│       └── overdue.test.js           # NEW: unit tests for derivation + ordering
├── components/
│   ├── TodoCard.js                   # MODIFY: render "Overdue" badge + danger-colored due date when overdue
│   ├── TodoList.js                   # MODIFY (or App.js): apply sortTodosByOverdue before mapping
│   └── __tests__/
│       ├── TodoCard.test.js          # MODIFY: assert badge + danger styling for overdue todos
│       └── TodoList.test.js          # MODIFY: assert overdue-at-top, oldest-first ordering
├── App.js                            # MODIFY (if ordering applied here): pass ordered todos to list
├── App.css                           # MODIFY: .overdue-badge + .todo-due-date.overdue styles
└── styles/
    └── theme.css                     # Reference only: existing --danger-color token (no change expected)

packages/backend/                     # UNCHANGED for this feature
```

**Structure Decision**: Web application. All work is in `packages/frontend`. The overdue derivation and
ordering are placed in a new, independently testable `utils/overdue.js` module (honoring SRP and DRY);
`TodoCard` handles presentation only; the list ordering is applied where the `todos` array is prepared
for rendering (`TodoList` or `App`, decided during tasks based on where `todos` state lives — currently
`App.js`). The backend and its API are not modified.

## Complexity Tracking

> No constitution violations; no entries required.
