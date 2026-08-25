import { isOverdue, sortTodosByOverdue } from '../overdue';

describe('isOverdue', () => {
  // Fixed reference "now" so tests never depend on the real clock.
  const now = new Date(2025, 10, 15); // 2025-11-15 (local)

  const baseTodo = {
    id: 1,
    title: 'Test',
    dueDate: '2025-11-10',
    completed: 0,
    createdAt: '2025-11-01T00:00:00Z',
  };

  it('returns true for an incomplete todo with a past due date', () => {
    expect(isOverdue({ ...baseTodo, dueDate: '2025-11-10' }, now)).toBe(true);
  });

  it('returns false when the due date is today', () => {
    expect(isOverdue({ ...baseTodo, dueDate: '2025-11-15' }, now)).toBe(false);
  });

  it('returns false when the due date is in the future', () => {
    expect(isOverdue({ ...baseTodo, dueDate: '2025-11-20' }, now)).toBe(false);
  });

  it('returns false when there is no due date', () => {
    expect(isOverdue({ ...baseTodo, dueDate: null }, now)).toBe(false);
  });

  it('returns false for a completed todo even if the due date is in the past', () => {
    expect(isOverdue({ ...baseTodo, dueDate: '2025-11-10', completed: 1 }, now)).toBe(false);
  });

  it('does not throw and returns false for invalid input', () => {
    expect(isOverdue(null, now)).toBe(false);
    expect(isOverdue({ ...baseTodo, dueDate: 'not-a-date' }, now)).toBe(false);
    expect(isOverdue({ ...baseTodo, dueDate: '' }, now)).toBe(false);
  });

  it('becomes overdue only once the date advances past a due-today todo', () => {
    const dueToday = { ...baseTodo, dueDate: '2025-11-15' };
    expect(isOverdue(dueToday, new Date(2025, 10, 15))).toBe(false); // same day
    expect(isOverdue(dueToday, new Date(2025, 10, 16))).toBe(true); // next day
  });
});

describe('sortTodosByOverdue', () => {
  const now = new Date(2025, 10, 15); // 2025-11-15

  const overdueOld = { id: 1, title: 'Old overdue', dueDate: '2025-11-01', completed: 0, createdAt: '2025-11-05T00:00:00Z' };
  const overdueRecent = { id: 2, title: 'Recent overdue', dueDate: '2025-11-10', completed: 0, createdAt: '2025-11-08T00:00:00Z' };
  const future = { id: 3, title: 'Future', dueDate: '2025-12-01', completed: 0, createdAt: '2025-11-09T00:00:00Z' };
  const noDate = { id: 4, title: 'No date', dueDate: null, completed: 0, createdAt: '2025-11-07T00:00:00Z' };
  const completedPast = { id: 5, title: 'Done', dueDate: '2025-11-02', completed: 1, createdAt: '2025-11-06T00:00:00Z' };

  it('places overdue todos first, sorted oldest due date first', () => {
    const result = sortTodosByOverdue([future, overdueRecent, noDate, overdueOld], now);
    expect(result.map((t) => t.id).slice(0, 2)).toEqual([1, 2]); // overdueOld then overdueRecent
  });

  it('keeps non-overdue todos after the overdue group in their incoming order', () => {
    const result = sortTodosByOverdue([future, overdueRecent, noDate, overdueOld, completedPast], now);
    // Overdue first: [1, 2]; rest keep incoming order: future(3), noDate(4), completedPast(5)
    expect(result.map((t) => t.id)).toEqual([1, 2, 3, 4, 5]);
  });

  it('returns a new array and does not mutate the input', () => {
    const input = [future, overdueOld];
    const result = sortTodosByOverdue(input, now);
    expect(result).not.toBe(input);
    expect(input.map((t) => t.id)).toEqual([3, 1]);
  });

  it('returns an empty array for an empty list', () => {
    expect(sortTodosByOverdue([], now)).toEqual([]);
  });

  it('leaves a list with no overdue todos unchanged in order', () => {
    const result = sortTodosByOverdue([future, noDate, completedPast], now);
    expect(result.map((t) => t.id)).toEqual([3, 4, 5]);
  });

  it('does not throw for non-array input', () => {
    expect(sortTodosByOverdue(null, now)).toEqual([]);
    expect(sortTodosByOverdue(undefined)).toEqual([]);
  });
});
