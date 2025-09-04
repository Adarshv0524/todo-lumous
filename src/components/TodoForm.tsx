import React, { useEffect, useRef, useState } from 'react';
import type { Importance } from '../types';

export default function TodoForm({ onAdd }: { onAdd: (payload: { title: string; importance?: Importance; dueDate?: string | null; notes?: string }) => void }) {
  const [title, setTitle] = useState('');
  const [importance, setImportance] = useState<Importance>('focus');
  const [dueDate, setDueDate] = useState<string>('');
  const [notes, setNotes] = useState('');
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAdd({ title, importance, dueDate: dueDate || null, notes });
    setTitle('');
    setImportance('focus');
    setDueDate('');
    setNotes('');
  };

  return (
    <form className="todo-form" onSubmit={submit}>
      <input
        ref={inputRef}
        aria-label="New todo"
        placeholder="What do you want to do?"
        value={title}
        onChange={e => setTitle(e.target.value)}
        autoComplete="off"
      />
      <select
        aria-label="Importance"
        value={importance}
        onChange={e => setImportance(e.target.value as Importance)}
        style={{ minWidth: 90 }}
      >
        <option value="urgent">🔥 Urgent</option>
        <option value="planned">📅 Planned</option>
        <option value="optional">🌱 Optional</option>
      </select>
      <div className="date-group">
        <input
          type="date"
          aria-label="Due date"
          value={dueDate}
          onChange={e => setDueDate(e.target.value)}
          placeholder=" "
          style={{ minWidth: 110 }}
        />
        <label>Due date</label>
      </div>
      <div className="notes-group">
        <input
          aria-label="Notes"
          placeholder=" "
          value={notes}
          onChange={e => setNotes(e.target.value)}
          style={{ minWidth: 120 }}
        />
        <label>Notes (optional)</label>
      </div>
      <button className="add-btn" type="submit">Add</button>
    </form>
  );
}
