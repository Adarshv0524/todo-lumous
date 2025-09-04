// src/components/TodoItem.tsx
import React, { useEffect, useRef, useState } from 'react';
import type { Todo } from '../types';

export default function TodoItem({
  todo,
  onToggle,
  onDelete,
  onEdit,
}: {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, updates: Partial<Todo>) => void;
}) {
  const [editing, setEditing] = useState(false);

  // Local edit state (only applied on Save)
  const [title, setTitle] = useState(todo.title);
  const [dueDate, setDueDate] = useState<string | null>(todo.dueDate ?? null);
  const [notes, setNotes] = useState<string>(todo.notes ?? '');
  const [importance, setImportance] = useState<Todo['importance']>(todo.importance);

  const editInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    // initialize local state when opening edit mode (so you can cancel safely)
    if (editing) {
      setTitle(todo.title ?? '');
      setDueDate(todo.dueDate ?? null);
      setNotes(todo.notes ?? '');
      setImportance(todo.importance ?? 'planned');

      // focus after small delay to allow animation
      const t = setTimeout(() => editInputRef.current?.focus(), 260);
      // lock background scrolling
      const prevOverflow = document.documentElement.style.overflow;
      document.documentElement.style.overflow = 'hidden';
      return () => {
        clearTimeout(t);
        document.documentElement.style.overflow = prevOverflow;
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editing]);

  // Keyboard: ESC cancels, Ctrl+Enter saves
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!editing) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        handleCancel();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [editing, title, dueDate, notes, importance]);

  // Compute due status
  const dueStatus = (() => {
    if (!todo.dueDate) return 'future';
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const d = new Date(todo.dueDate);
    d.setHours(0, 0, 0, 0);
    if (d < today) return 'overdue';
    if (d.getTime() === today.getTime()) return 'today';
    return 'future';
  })();

  const handleOpenEdit = () => setEditing(true);

  const handleSave = () => {
    const updates: Partial<Todo> = {
      title: title.trim() || 'Untitled task',
      dueDate: dueDate || null,
      notes: notes || '',
      importance: importance || 'planned',
    };
    onEdit(todo.id, updates);
    setEditing(false);
  };

  const handleCancel = () => {
    // revert local changes and close
    setTitle(todo.title);
    setDueDate(todo.dueDate ?? null);
    setNotes(todo.notes ?? '');
    setImportance(todo.importance ?? 'planned');
    setEditing(false);
  };

  // overlay click closes edit
  const handleOverlayClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).classList.contains('todo-edit-overlay')) {
      handleCancel();
    }
  };

  return (
    <>
      {/* Original list item (keeps list layout intact) */}
      <li
        className={`todo-item ${todo.completed ? 'done' : ''} ${dueStatus === 'overdue' && !todo.completed ? 'overdue' : ''}`}
        onClick={(e) => {
          // open edit only when user clicks outside the small action buttons or checkbox
          // if click target is button or input, ignore opening
          const tag = (e.target as HTMLElement).tagName.toLowerCase();
          if (tag === 'button' || tag === 'input' || (e.target as HTMLElement).closest('.actions')) return;
          handleOpenEdit();
        }}
        role="article"
        aria-label={`Task: ${todo.title}`}
      >
        {/* Left: Checkbox */}
        <label className="checkbox" onClick={(e) => e.stopPropagation()}>
          <input
            type="checkbox"
            checked={todo.completed}
            onChange={() => onToggle(todo.id)}
            aria-label={`Mark ${todo.title} as ${todo.completed ? 'not done' : 'done'}`}
          />
          <span className="checkmark" />
        </label>

        {/* Content */}
        <div className="content">
          <div className="title-row">
            <span className="title">{todo.title}</span>
            <span className={`importance ${todo.importance}`}>
              {todo.importance === 'urgent' ? '🔥 Urgent' : todo.importance === 'planned' ? '📅 Planned' : '🌱 Optional'}
            </span>
          </div>

          <div className="meta-row">
            {todo.dueDate && <span className={`due ${dueStatus}`}>{dueStatus === 'overdue' ? '⚠️ ' : ''} Due: {todo.dueDate}</span>}
            {todo.project && <span className="project">📂 {todo.project}</span>}
            {todo.recurrence && todo.recurrence !== 'none' && <span className="recurrence">🔁 {todo.recurrence}</span>}
            {todo.tags && todo.tags.length > 0 && (
              <div className="tags">
                {todo.tags.map((tag) => (
                  <span key={tag} className="tag">#{tag}</span>
                ))}
              </div>
            )}
          </div>

          {todo.notes && <div className="notes">📝 {todo.notes}</div>}

          {todo.attachments && todo.attachments.length > 0 && (
            <div className="attachments">
              {todo.attachments.map((a) => (
                <a key={a.id} href={a.url} target="_blank" rel="noopener noreferrer">📎 {a.name}</a>
              ))}
            </div>
          )}
        </div>

        {/* Actions (small icons, shown on hover) */}
        <div className="actions">
          <button aria-label="Edit task" title="Edit" onClick={(e) => { e.stopPropagation(); handleOpenEdit(); }}>✎</button>
          <button aria-label="Delete task" title="Delete" onClick={(e) => { e.stopPropagation(); onDelete(todo.id); }}>🗑</button>
        </div>
      </li>

      {/* Expanded editing overlay + flipping card */}
      {editing && (
        <div className="todo-edit-overlay" onMouseDown={handleOverlayClick} role="dialog" aria-modal="true">
          <div className="todo-expanded" role="document" onMouseDown={(e) => e.stopPropagation()}>
            <header className="expanded-header">
              <div className="expanded-left">
                <label className="checkbox expanded-checkbox" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => onToggle(todo.id)}
                    aria-label={`Mark ${todo.title} as ${todo.completed ? 'not done' : 'done'}`}
                  />
                  <span className="checkmark" />
                </label>
                <div style={{ marginLeft: 12 }}>
                  <div className="expanded-title">
                    <input
                      ref={editInputRef}
                      className="expanded-title-input"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Task title"
                    />
                  </div>
                  <div className="expanded-sub">
                    <span className="muted">Created: {new Date(todo.createdAt).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="expanded-actions">
                <button className="close-btn" onClick={handleCancel} title="Close">✖</button>
              </div>
            </header>

            <div className="expanded-body">
              <div className="form-row">
                <label>Due date</label>
                <input
                  type="date"
                  value={dueDate || ''}
                  onChange={(e) => setDueDate(e.target.value || null)}
                />
              </div>

              <div className="form-row">
                <label>Importance</label>
                <select value={importance} onChange={(e) => setImportance(e.target.value as Todo['importance'])}>
                  <option value="urgent">🔥 Urgent</option>
                  <option value="planned">📅 Planned</option>
                  <option value="optional">🌱 Optional</option>
                </select>
              </div>

              <div className="form-row">
                <label>Notes</label>
                <textarea
                  rows={5}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add longer notes or steps..."
                />
              </div>

              <div className="form-row attachments-row">
                <label>Attachments</label>
                <div className="attachments">
                  {todo.attachments && todo.attachments.length > 0 ? (
                    todo.attachments.map((a) => (
                      <a key={a.id} href={a.url} target="_blank" rel="noopener noreferrer">📎 {a.name}</a>
                    ))
                  ) : (
                    <span className="muted">No attachments</span>
                  )}
                </div>
              </div>
            </div>

            <footer className="expanded-footer">
              <div className="footer-left muted">Tip: Press <kbd>Esc</kbd> to cancel • <kbd>Ctrl</kbd>+<kbd>Enter</kbd> to save</div>
              <div className="footer-actions">
                <button className="btn neutral" onClick={handleCancel}>Cancel</button>
                <button className="btn save" onClick={handleSave}>Save changes</button>
              </div>
            </footer>
          </div>
        </div>
      )}
    </>
  );
}
