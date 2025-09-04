// src/utils/io.ts
import type { Todo } from '../types';

export function exportTodosAsJson(todos: Todo[]) {
  try {
    const data = JSON.stringify(todos, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const ts = new Date().toISOString().replace(/[:.]/g, '-');
    a.href = url;
    a.download = `todos-${ts}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    return true;
  } catch (err) {
    console.error('Export error', err);
    return false;
  }
}

export function parseTodosFile(file: File): Promise<Todo[]> {
  return new Promise((resolve, reject) => {
    if (!file) return reject(new Error('No file provided'));
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result as string);
        if (!Array.isArray(parsed)) throw new Error('Invalid file format: expected an array');
        const normalized = (parsed as any[]).map((t) => {
          if (!t || typeof t !== 'object') return null;
          return {
            id: t.id ?? null,
            title: typeof t.title === 'string' ? t.title : '',
            completed: !!t.completed,
            // map old `priority` -> new `importance` if needed
            importance: t.importance ?? t.priority ?? 'planned',
            notes: t.notes ?? '',
            createdAt: t.createdAt ?? new Date().toISOString(),
            dueDate: t.dueDate ?? null,
            project: t.project ?? 'General',
            tags: Array.isArray(t.tags) ? t.tags : (typeof t.tags === 'string' ? [t.tags] : []),
            recurrence: t.recurrence ?? 'none',
            attachments: Array.isArray(t.attachments) ? t.attachments.map((a: any) => ({
              id: a.id ?? (a.name ? `${Date.now()}-${a.name}` : Date.now().toString()),
              type: a.type ?? 'file',
              url: a.url ?? a.link ?? '',
              name: a.name ?? a.url ?? 'attachment',
            })) : [],
          } as Todo;
        }).filter(Boolean) as Todo[];
        resolve(normalized);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}
