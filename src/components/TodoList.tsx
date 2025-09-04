import React from 'react';
import TodoItem from './TodoItem';
import type { Todo } from '../types';

export default function TodoList({ todos, onToggle, onDelete, onEdit }:
  { todos: Todo[]; onToggle: (id: string) => void; onDelete: (id: string) => void; onEdit: (id: string, updates: Partial<Todo>) => void }) {
  if (todos.length === 0) return <div className="empty">No tasks — enjoy the calm 🌙</div>;
  return (
    <ul className="todo-list" role="list">
      {todos.map(todo => (
        <TodoItem key={todo.id} todo={todo} onToggle={onToggle} onDelete={onDelete} onEdit={onEdit} />
      ))}
    </ul>
  );
}
