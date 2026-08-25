import React from 'react';
import TodoCard from './TodoCard';
import { sortTodosByOverdue } from '../utils/overdue';

function TodoList({ todos, onToggle, onEdit, onDelete, isLoading }) {
  if (todos.length === 0) {
    return (
      <div className="todo-list empty-state">
        <p className="empty-state-message">
          No todos yet. Add one to get started! 👻
        </p>
      </div>
    );
  }

  // Overdue todos are grouped at the top (oldest due date first); recomputed each
  // render so the current local date is always the reference for "overdue".
  const orderedTodos = sortTodosByOverdue(todos);

  return (
    <div className="todo-list">
      {orderedTodos.map((todo) => (
        <TodoCard
          key={todo.id}
          todo={todo}
          onToggle={onToggle}
          onEdit={onEdit}
          onDelete={onDelete}
          isLoading={isLoading}
        />
      ))}
    </div>
  );
}

export default TodoList;
