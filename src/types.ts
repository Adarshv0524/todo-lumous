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
  project?: string;
  tags?: string[];
  recurrence?: Recurrence;
  attachments?: Attachment[];
  priority?: string; // <-- Add this line if you use priority
}
