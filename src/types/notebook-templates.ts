export type NotebookTemplateType = 
  | 'simple'
  | 'meeting-notes'
  | 'document'
  | 'dashboard'
  | 'code-notebook'
  | 'planner'
  | 'ai-research'
  | 'diary'
  | 'journal'
  | 'custom'
  | 'doodle'
  | 'project'
  | 'loop'
  | 'story'
  | 'storytelling'
  | 'typewriter'
  | 'n8n'
  | 'image-prompt'
  | 'video-prompt'
  | 'link'
  | 'studybook'
  | 'flashcard'
  | 'whiteboard'
  | 'recipe'
  | 'expense'
  | 'trip'
  | 'todo';

export interface NotebookTemplate {
  id: NotebookTemplateType;
  name: string;
  description: string;
  icon: string;
  color: string;
  features: string[];
}

export const NOTEBOOK_TEMPLATES: NotebookTemplate[] = [
  {
    id: 'simple',
    name: 'Simple Notebook',
    description: 'Classic flip-style notebook with pages you can turn',
    icon: 'BookOpen',
    color: 'amber',
    features: ['Page flipping', 'Rich text editor', 'AI assistance'],
  },
  {
    id: 'meeting-notes',
    name: 'Meeting Notes',
    description: 'Scratch pad, pinned notes, and written notes sections',
    icon: 'Users',
    color: 'emerald',
    features: ['Scratch Pad', 'Pinned Notes', 'Written Notes', 'Team collaboration'],
  },
  {
    id: 'document',
    name: 'Document',
    description: 'Professional document with tabs and chart support',
    icon: 'FileText',
    color: 'blue',
    features: ['Multiple tabs', 'Charts & graphs', 'Overview sections', 'Export options'],
  },
  {
    id: 'dashboard',
    name: 'Dashboard',
    description: 'All-in-one workspace with calendar, tasks, and notes',
    icon: 'LayoutDashboard',
    color: 'purple',
    features: ['Notes section', 'Calendar view', 'Task management', 'Pinned Notes', 'Scratch Pad'],
  },
  {
    id: 'code-notebook',
    name: 'Code Notebook',
    description: 'Interactive coding environment with sections and code blocks',
    icon: 'Code',
    color: 'slate',
    features: ['Code blocks', 'Syntax highlighting', 'Output evaluation', 'Sections sidebar'],
  },
  {
    id: 'planner',
    name: 'Planner',
    description: 'Meeting planner with context, goals, and timed agenda',
    icon: 'Calendar',
    color: 'orange',
    features: ['Context panel', 'Goals tracking', 'Timed agenda', 'AI agenda generation'],
  },
  {
    id: 'ai-research',
    name: 'AI Research',
    description: 'NotebookLM-style research with sources, chat, and notes',
    icon: 'Brain',
    color: 'rose',
    features: ['Source management', 'AI Chat', 'Smart notes', 'Deep research'],
  },
];

export interface ScratchPadItem {
  id: string;
  date: string;
  content: string;
}

export interface PinnedNote {
  id: string;
  title: string;
  content: string;
  category: string;
  timestamp: string;
}

export interface WrittenNote {
  id: string;
  title: string;
  sections: {
    heading: string;
    content: string;
    items?: string[];
  }[];
}

export interface CalendarEvent {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  color: string;
}

export interface Task {
  id: string;
  title: string;
  dueDate: string;
  status: 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
}

export interface CodeBlock {
  id: string;
  language: string;
  code: string;
  output?: string;
}

export interface Section {
  id: string;
  title: string;
  blocks: CodeBlock[];
}

export interface AgendaItem {
  id: string;
  time: string;
  title: string;
  description: string;
  questions: string[];
  duration: string;
}

export interface Source {
  id: string;
  title: string;
  type: 'document' | 'web' | 'ai';
  selected: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  prompts?: {
    audio?: string;
    image?: string;
  };
}
