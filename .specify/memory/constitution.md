<!--
Sync Impact Report
==================
Version change: (unversioned template) → 1.0.0
Rationale: Initial ratification of the project constitution. MAJOR bump (0.0.0 → 1.0.0)
because this establishes the first governing principle set for the project.

Modified principles:
- [PRINCIPLE_1_NAME] → I. Readable, Conventional Code
- [PRINCIPLE_2_NAME] → II. DRY, KISS & SOLID
- [PRINCIPLE_3_NAME] → III. Test-Driven Quality (NON-NEGOTIABLE)
- [PRINCIPLE_4_NAME] → IV. Robust Error Handling & Boundary Validation
- [PRINCIPLE_5_NAME] → V. Design-System Consistency & Scope Discipline

Added sections:
- Technology & Architecture Constraints (was [SECTION_2_NAME])
- Development Workflow & Quality Gates (was [SECTION_3_NAME])
- Governance

Removed sections: none

Templates & references:
- Derived from docs/coding-guidelines.md, docs/testing-guidelines.md,
  docs/ui-guidelines.md, docs/functional-requirements.md, docs/project-overview.md

Deferred items / TODOs:
- RATIFICATION_DATE set to 2026-08-25 (date this constitution was first adopted).
  If an earlier adoption date is known, amend accordingly.
-->

# Todo App Constitution

## Core Principles

### I. Readable, Conventional Code

Code MUST be immediately readable and follow the project's established conventions.

- Use 2-space indentation for all files (JavaScript, JSON, CSS, Markdown); use LF line
  endings and remove all trailing whitespace.
- Keep code lines under 100 characters where practical.
- Naming is non-negotiable: `camelCase` for variables and functions, `UPPER_SNAKE_CASE`
  for constants, `PascalCase` for React components and classes. React component file names
  MUST match the component name.
- Organize each module top-to-bottom: imports, constants, utilities, main component/class,
  helpers, exports. Group imports as external → internal → styles, separated by blank lines.
- Comments explain **why**, not **what**. Outdated comments MUST be removed or corrected.
  Public functions and components SHOULD carry JSDoc.

**Rationale**: A single, consistent style keeps a small codebase approachable and lets
AI-generated code blend in without review friction (see docs/coding-guidelines.md).

### II. DRY, KISS & SOLID

Every unit of code MUST have one clear responsibility and avoid needless duplication or
complexity.

- DRY: repeated logic MUST be extracted into shared utilities or reusable components.
- KISS: prefer the simplest solution that works; do not optimize prematurely.
- SOLID: components and modules MUST hold a single responsibility, be open for extension via
  props/composition, honor their prop/interface contracts, expose focused interfaces, and
  depend on injected abstractions rather than hardcoded implementations.
- A component MUST NOT mix concerns — e.g., a display component does not fetch or delete data.

**Rationale**: These principles keep the todo app maintainable and testable as it grows,
and prevent the "vibe coding" sprawl spec-driven development is meant to replace
(see docs/coding-guidelines.md).

### III. Test-Driven Quality (NON-NEGOTIABLE)

Functionality MUST be covered by tests that describe behavior, not implementation.

- Write tests as part of development; for new behavior, prefer writing the failing test
  first, then the minimal code to pass, then refactor (Red-Green-Refactor).
- Maintain **80%+ code coverage** across all packages; critical user workflows MUST reach
  100% coverage.
- Tests MUST be isolated: each sets up its own data, cleans up after itself, shares no state,
  and mocks external dependencies (API calls, timers).
- Follow Arrange-Act-Assert with descriptive test names. Test files are named
  `{filename}.test.js` and colocated in `__tests__/` directories next to the source.
- Tests MUST verify observable behavior so they survive refactoring.

**Rationale**: Behavior-focused, well-isolated tests are the primary guardrail for quality
and give confidence that AI-generated changes are correct (see docs/testing-guidelines.md).

### IV. Robust Error Handling & Boundary Validation

The application MUST fail gracefully and validate untrusted input at its boundaries.

- Wrap operations that can fail (API calls, persistence) in try/catch and surface clear,
  actionable user feedback rather than silent failures.
- Validate and constrain input at API boundaries (e.g., todo title required, max 255
  characters); use guard clauses and sensible defaults to prevent undefined-state errors.
- No `console.log` statements are left in production code; error logging uses `console.error`
  with meaningful context.
- All todo changes (create, update, toggle, delete) MUST be persisted immediately through the
  Express.js backend, and deletion MUST require an explicit confirmation step.

**Rationale**: Graceful handling and boundary validation protect data durability and user
trust for a single-user app that persists every change
(see docs/coding-guidelines.md and docs/functional-requirements.md).

### V. Design-System Consistency & Scope Discipline

The UI MUST follow the defined design system, and features MUST stay within the agreed scope.

- Honor the design system: the 8px spacing grid, defined color palette (Halloween theme),
  typography scale, and full light/dark mode support.
- Components (todo cards, inputs, buttons, empty/completed states) MUST match the documented
  layout and states, including the empty-state message and completed-item styling.
- Stay in scope: no authentication, multi-user support, priorities/categories, recurring
  todos, reminders, search, filtering, bulk operations, or undo/redo unless the constitution
  and requirements are amended first.
- Keep the interface clean, minimal, and desktop-focused.

**Rationale**: A consistent, scoped UI keeps the product coherent and prevents scope creep
that would undermine the spec-driven workflow
(see docs/ui-guidelines.md and docs/functional-requirements.md).

## Technology & Architecture Constraints

- The project is a JavaScript monorepo managed with npm workspaces: `packages/frontend`
  (React) and `packages/backend` (Node.js/Express), with Jest for testing in both.
- Frontend communicates with the backend exclusively through the Express.js REST API; the
  backend owns persistence. No database schema changes beyond basic todo storage.
- Target runtime: Node.js v16+ and npm v7+.
- The application remains single-user; no user identification, isolation, or auth layers are
  introduced.
- Prefer named imports for multi-export modules, default imports for single exports, and
  relative paths for internal modules; avoid circular dependencies.

## Development Workflow & Quality Gates

- **Branching**: use feature branches (e.g., `feature/todo-editing`). Work is proposed via
  pull requests and reviewed before merge.
- **Commits**: keep commits atomic (one logical change) with descriptive messages that
  explain the "why"; use conventional prefixes such as `feat:` and `fix:`.
- **Pre-merge checklist** (from docs/coding-guidelines.md): naming conventions followed,
  imports organized, no linting errors/warnings, code is DRY with single-responsibility
  units, error handling present, comments meaningful, tests written for new functionality,
  commits atomic, and no stray `console.log` in production code.
- **Local gates**: run `npm test` (and coverage where relevant) and resolve all lint issues
  before opening a pull request.

## Governance

- This constitution supersedes ad-hoc practices for the todo app. When guidance conflicts,
  the constitution wins; the referenced `docs/` files provide the detailed, runtime guidance
  that implements these principles.
- **Amendments** MUST be made via pull request, documenting the change, its rationale, and any
  migration impact, and are subject to the same review as code.
- **Versioning** follows semantic versioning: MAJOR for backward-incompatible principle
  removals or redefinitions, MINOR for a new principle/section or materially expanded
  guidance, PATCH for clarifications and non-semantic refinements.
- **Compliance**: every pull request and review MUST verify adherence to these principles.
  Deviations MUST be justified explicitly in the pull request and, if lasting, encoded as an
  amendment.

**Version**: 1.0.0 | **Ratified**: 2026-08-25 | **Last Amended**: 2026-08-25
