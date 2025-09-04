// src/types.ts
export type Importance = "urgent" | "planned" | "optional" | "focus";

// Recurrence options
export type Recurrence = 'none' | 'daily' | 'weekly' | 'custom';

export interface Attachment {
  id: string;
  type: 'file' | 'link';
  url: string;
  name: string;   // display name
}

export interface Todo {
  id: string;
  title: string;
  notes?: string;
  completed: boolean;
  importance: Importance;
  createdAt: string;
  dueDate: string | null;

  // --- NEW FIELDS ---
  project?: string;         // e.g., Work / Personal
  tags?: string[];          // flexible labels like #urgent
  recurrence?: Recurrence;  // repeat schedule
  attachments?: Attachment[];
}
