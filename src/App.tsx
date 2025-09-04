// src/App.jsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import useLocalStorage from './hooks/useLocalStorage';
import ThemeToggle from './components/ThemeToggle';
import TodoForm from './components/TodoForm';
import TodoList from './components/TodoList';
import { exportTodosAsJson, parseTodosFile } from './utils/io';
import { Todo, Importance } from './types';

export default function App() {
  const [todos, setTodos] = useLocalStorage<Todo[]>('todos', []);
  const [filter, setFilter] = useState<'all' | 'active' | 'done'>('all');
  const [isNavOpen, setIsNavOpen] = useState(false);
  const importInputRef = useRef<HTMLInputElement>(null);
  const [theme, setTheme] = useLocalStorage<'dark' | 'light'>('theme', 'dark');
  const [lastDeleted, setLastDeleted] = useState<Todo | null>(null);
  const [sortDue, setSortDue] = useState(false);
  const [search, setSearch] = useState('');
  const remaining = todos.filter(t => !t.completed).length;

  // NEW: State for mobile navigation
  const [isNavOpen, setIsNavOpen] = useState(false);

  const importInputRef = useRef(null);

  const [theme, setTheme] = useLocalStorage('theme', 'dark');
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // --- Actions ---
  const addTodo = (payload) => {
    const newTodo = {
      id: Date.now().toString() + '-' + Math.random().toString(36).slice(2, 8),
      title: payload.title.trim(),
      notes: payload.notes || '',
      completed: false,
      importance: payload.importance || 'planned',
      createdAt: new Date().toISOString(),
      dueDate: payload.dueDate || null,
      project: payload.project || 'General',
      tags: payload.tags || [],
      recurrence: payload.recurrence || 'none',
      attachments: payload.attachments || [],
    };
    setTodos((prev) => [newTodo, ...prev]);
  };


  const toggle = (id) => setTodos(prev =>
    prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t)
  );

  const [lastDeleted, setLastDeleted] = useState(null);

  const remove = (id) => {
    setTodos(prev => {
      const toDelete = prev.find(t => t.id === id);
      if (toDelete) setLastDeleted(toDelete);
      return prev.filter(t => t.id !== id);
    });
  };

  const undoDelete = () => {
    if (lastDeleted) {
      setTodos(prev => [lastDeleted, ...prev]);
      setLastDeleted(null);
    }
  };

  const edit = (id, updates) => setTodos(prev =>
    prev.map(t => t.id === id ? { ...t, ...updates } : t)
  );

  const clearCompleted = () => setTodos(prev => prev.filter(t => !t.completed));

  const filtered = useMemo(() => {
    if (filter === 'active') return todos.filter(t => !t.completed);
    if (filter === 'done') return todos.filter(t => t.completed);
    return todos;
  }, [todos, filter]);

  const [sortDue, setSortDue] = useState(false);

  const sorted = useMemo(() => {
    let list = filtered;
    if (sortDue) {
      list = [...list].sort((a, b) => {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate) - new Date(b.dueDate);
      });
    }
    return list;
  }, [filtered, sortDue]);

  const [search, setSearch] = useState('');
  const searched = useMemo(() => {
    if (!search.trim()) return sorted;
    return sorted.filter(t => t.title.toLowerCase().includes(search.toLowerCase()));
  }, [sorted, search]);

  const handleExport = () => {
    const ok = exportTodosAsJson(todos);
    if (!ok) alert('Export failed. Check console for details.');
  };

  const handleOpenImportDialog = () => {
    importInputRef.current?.click();
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const imported = await parseTodosFile(file);
      if (!Array.isArray(imported) || imported.length === 0) {
        alert('No valid tasks found in file.');
        return;
      }
      const existingIds = new Set(todos.map(t => t.id));
      const sanitized = imported.map((t) => {
        const id = t.id && !existingIds.has(t.id) ? t.id : (Date.now().toString() + '-' + Math.random().toString(36).slice(2, 6));
        return {
          id,
          title: t.title || 'Untitled task',
          completed: !!t.completed,
          priority: t.priority || 'normal',
          notes: t.notes || '',
          createdAt: t.createdAt || new Date().toISOString(),
          dueDate: t.dueDate || null,
        };
      });
      setTodos(prev => [...sanitized, ...prev]);
      alert(`Imported ${sanitized.length} task(s).`);
    } catch (err) {
      console.error('Import failed', err);
      alert('Import failed: ' + (err.message || 'Invalid file'));
    }
  };

  useEffect(() => {
    const handler = (ev: KeyboardEvent) => {
      const isMod = ev.ctrlKey || ev.metaKey;
      if (isMod && ev.key.toLowerCase() === 'k') {
        ev.preventDefault();
        const el = document.querySelector('[aria-label="New todo"]');
        if (el) el.focus();
        return;
      }
      if (isMod && ev.shiftKey && ev.key.toLowerCase() === 'e') {
        ev.preventDefault();
        handleExport();
        return;
      }
      if (isMod && ev.shiftKey && ev.key.toLowerCase() === 'i') {
        ev.preventDefault();
        handleOpenImportDialog();
        return;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [todos]);

  useEffect(() => {
    document.title = "Todo App";
  }, []);

  return (
    // UPDATED: Added conditional class for mobile nav
    <div className={`app-root ${isNavOpen ? 'is-nav-open' : ''}`}>
      <header className="app-header">
        {/* NEW: Hamburger menu button */}
        <button className="mobile-menu-toggle" onClick={() => setIsNavOpen(true)} aria-label="Open menu">
          ☰
        </button>

        <h1>Todo App</h1>
        <div className="meta">
          <span>{remaining} remaining</span>
          <span>{todos.filter(t => t.completed).length} done</span>
          <ThemeToggle theme={theme} setTheme={setTheme} />
        </div>
      </header>
      
      {/* NEW: Mobile Nav Panel and Overlay */}
      <div className="nav-overlay" onClick={() => setIsNavOpen(false)}></div>
      <aside className="mobile-nav-panel">
        <div>
          <h3>Filters</h3>
          <nav className="filters-nav">
            <button
              className={filter === 'all' ? 'active' : ''}
              onClick={() => { setFilter('all'); setIsNavOpen(false); }}
            >All</button>
            <button
              className={filter === 'active' ? 'active' : ''}
              onClick={() => { setFilter('active'); setIsNavOpen(false); }}
            >Active</button>
            <button
              className={filter === 'done' ? 'active' : ''}
              onClick={() => { setFilter('done'); setIsNavOpen(false); }}
            >Done</button>
          </nav>
        </div>
        <div>
            <h3>Actions</h3>
            <div className="action-buttons">
                <button onClick={() => { setTodos(prev => prev.map(t => ({...t, completed: true}))); setIsNavOpen(false); }}>
                  Mark all done
                </button>
                <button onClick={() => { clearCompleted(); setIsNavOpen(false); }}>
                  Clear completed
                </button>
                <button onClick={() => { setSortDue(s => !s); setIsNavOpen(false); }}>
                  {sortDue ? "Unsort" : "Sort by due"}
                </button>
                <button onClick={() => { handleExport(); setIsNavOpen(false); }}>
                  Export
                </button>
                <button onClick={() => { handleOpenImportDialog(); setIsNavOpen(false); }}>
                  Import
                </button>
            </div>
        </div>
      </aside>

      <div className="app-layout">
        {/* Left Sidebar (for desktop) */}
        <aside className="sidebar-left">
          <nav className="filters-nav">
            <button
              aria-pressed={filter === 'all'}
              className={filter === 'all' ? 'active' : ''}
              onClick={() => setFilter('all')}
            >All</button>
            <button
              aria-pressed={filter === 'active'}
              className={filter === 'active' ? 'active' : ''}
              onClick={() => setFilter('active')}
            >Active</button>
            <button
              aria-pressed={filter === 'done'}
              className={filter === 'done' ? 'active' : ''}
              onClick={() => setFilter('done')}
            >Done</button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="main-content">
          <TodoForm onAdd={addTodo} />
          
          <div className="search-bar">
            <input
              type="search"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="🔍 Search tasks..."
            />
          </div>

          <TodoList todos={searched} onToggle={toggle} onDelete={remove} onEdit={edit} />
          
          {lastDeleted && (
            <div className="undo-delete">
              <button onClick={undoDelete}>Undo delete</button>
            </div>
          )}
        </main>

        {/* Right Sidebar (for desktop) */}
        <aside className="sidebar-right">
          <div className="action-buttons">
            <button onClick={() => setTodos(prev => prev.map(t => ({...t, completed: true})))}>
              Mark all done
            </button>
            <button onClick={clearCompleted}>
              Clear completed
            </button>
            <button onClick={() => setSortDue(s => !s)}>
              {sortDue ? "Unsort" : "Sort by due"}
            </button>
            <button onClick={handleExport}>
              Export
            </button>
            <button onClick={handleOpenImportDialog}>
              Import
            </button>
          </div>
        </aside>
      </div>

      <footer className="app-footer futuristic-footer">
        <span className="footer-text">Made by <span className="footer-author">Adarsh</span></span>
      </footer>
      {/* Hidden file input for imports */}
      <input
        type="file"
        ref={importInputRef}
        onChange={handleImportFile}
        accept=".json,application/json"
        style={{ display: 'none' }}
      />
    </div>
  );
}