// Overdue is a client-side, date-relative property derived from a todo's dueDate
// and completion state (see specs/001-overdue-todos). Nothing here is persisted.

// Comparable integer for a Date's local calendar day (ignores time of day).
function dayNumber(date) {
  return date.getFullYear() * 10000 + date.getMonth() * 100 + date.getDate();
}

// Parses a 'YYYY-MM-DD' string into a local Date at midnight, or null if invalid.
function parseLocalDate(value) {
  if (!value || typeof value !== 'string') return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (!match) return null;
  const [, year, month, day] = match;
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  return Number.isNaN(date.getTime()) ? null : date;
}

/**
 * Returns true when a todo is overdue: incomplete, has a valid due date, and that
 * date is strictly before today's local calendar date. Safe for null/invalid input.
 * @param {object} todo - Todo with `dueDate` (string|null) and `completed` (0|1).
 * @param {Date} [now] - Reference "now"; injectable for deterministic tests.
 * @returns {boolean}
 */
export function isOverdue(todo, now = new Date()) {
  if (!todo || todo.completed) return false;
  const due = parseLocalDate(todo.dueDate);
  if (!due) return false;
  return dayNumber(due) < dayNumber(now);
}

/**
 * Returns a new array with overdue todos first (sorted oldest due date first) and
 * all other todos after them in their original order. Does not mutate the input.
 * @param {object[]} todos
 * @param {Date} [now] - Reference "now"; injectable for deterministic tests.
 * @returns {object[]}
 */
export function sortTodosByOverdue(todos, now = new Date()) {
  if (!Array.isArray(todos)) return [];
  const overdue = [];
  const rest = [];
  for (const todo of todos) {
    (isOverdue(todo, now) ? overdue : rest).push(todo);
  }
  overdue.sort(
    (a, b) => dayNumber(parseLocalDate(a.dueDate)) - dayNumber(parseLocalDate(b.dueDate))
  );
  return [...overdue, ...rest];
}
