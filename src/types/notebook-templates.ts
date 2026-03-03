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
  | 'todo'
  | 'sound-box'
  | 'book-notes'
  | 'habit-tracker'
  | 'workout-log'
  | 'budget-planner'
  | 'class-notes'
  | 'research-builder'
  | 'grocery-list'
  | 'expense-sharer'
  | 'project-pipeline'
  | 'prompt-diary'
  | 'save-the-date'
  | 'important-urls'
  | 'language-translator'
  | 'dictionary'
  | 'meals-planner'
  | 'games-scorecard'
  | 'sticker-book';

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
    features: ['Scratch Pad', 'Pinned Notes', 'Written Notes', '+1 more'],
  },
  {
    id: 'document',
    name: 'Document',
    description: 'Professional document with tabs and chart support',
    icon: 'FileText',
    color: 'blue',
    features: ['Multiple tabs', 'Charts & graphs', 'Overview sections', '+1 more'],
  },
  {
    id: 'dashboard',
    name: 'Dashboard',
    description: 'All-in-one workspace with calendar, tasks, and notes',
    icon: 'LayoutDashboard',
    color: 'purple',
    features: ['Notes section', 'Calendar view', 'Task management', '+2 more'],
  },
  {
    id: 'code-notebook',
    name: 'Code Notebook',
    description: 'Interactive coding environment with sections and code blocks',
    icon: 'Code',
    color: 'slate',
    features: ['Code blocks', 'Syntax highlighting', 'Output evaluation', '+1 more'],
  },
  {
    id: 'planner',
    name: 'Planner',
    description: 'Meeting planner with context, goals, and timed agenda',
    icon: 'Calendar',
    color: 'orange',
    features: ['Context panel', 'Goals tracking', 'Timed agenda', '+1 more'],
  },
  {
    id: 'ai-research',
    name: 'AI Research',
    description: 'NotebookLM-style research with sources, chat, and notes',
    icon: 'Brain',
    color: 'rose',
    features: ['Source management', 'AI Chat', 'Smart notes', 'Deep research'],
  },
  {
    id: 'diary',
    name: 'Diary',
    description: 'Personal diary with daily entries and reflections',
    icon: 'BookOpen',
    color: 'rose',
    features: ['Daily entries', 'Mood tracking', 'Private thoughts', 'Calendar view'],
  },
  {
    id: 'journal',
    name: 'Journal',
    description: 'Journaling with prompts and guided reflection',
    icon: 'BookOpen',
    color: 'purple',
    features: ['Writing prompts', 'Reflection guides', 'Goal tracking', 'Gratitude log'],
  },
  {
    id: 'doodle',
    name: 'Doodle',
    description: 'Creative canvas for sketches and visual notes',
    icon: 'Brain',
    color: 'orange',
    features: ['Drawing tools', 'Color palette', 'Layers', 'Export options'],
  },
  {
    id: 'project',
    name: 'Project',
    description: 'Project management with tasks, timeline, and milestones',
    icon: 'LayoutDashboard',
    color: 'blue',
    features: ['Task lists', 'Timeline view', 'Milestones', 'Team notes'],
  },
  {
    id: 'loop',
    name: 'Loop',
    description: 'Collaborative workspace with real-time updates',
    icon: 'Users',
    color: 'emerald',
    features: ['Real-time sync', 'Comments', 'Mentions', 'Version history'],
  },
  {
    id: 'story',
    name: 'Story',
    description: 'Creative writing with chapters and character notes',
    icon: 'BookOpen',
    color: 'purple',
    features: ['Chapter organization', 'Character profiles', 'Plot outline', 'Word count'],
  },
  {
    id: 'typewriter',
    name: 'Typewriter',
    description: 'Distraction-free writing with typewriter mode',
    icon: 'FileText',
    color: 'slate',
    features: ['Focus mode', 'Typewriter sounds', 'Word count', 'Auto-save'],
  },
  {
    id: 'link',
    name: 'Link Collection',
    description: 'Organize and categorize your bookmarks and links',
    icon: 'Brain',
    color: 'blue',
    features: ['Link organization', 'Categories', 'Tags', 'Quick access'],
  },
  {
    id: 'studybook',
    name: 'Study Book',
    description: 'Study notes with summaries and key concepts',
    icon: 'BookOpen',
    color: 'emerald',
    features: ['Note taking', 'Summaries', 'Key concepts', 'Review mode'],
  },
  {
    id: 'flashcard',
    name: 'Flashcards',
    description: 'Create and study with digital flashcards',
    icon: 'Brain',
    color: 'orange',
    features: ['Card creation', 'Study mode', 'Spaced repetition', 'Progress tracking'],
  },
  {
    id: 'whiteboard',
    name: 'Whiteboard',
    description: 'Infinite canvas for brainstorming and diagrams',
    icon: 'LayoutDashboard',
    color: 'purple',
    features: ['Infinite canvas', 'Shapes & arrows', 'Sticky notes', 'Collaboration'],
  },
  {
    id: 'recipe',
    name: 'Recipe Book',
    description: 'Organize recipes with ingredients and instructions',
    icon: 'BookOpen',
    color: 'rose',
    features: ['Ingredients list', 'Step-by-step', 'Photos', 'Cook timer'],
  },
  {
    id: 'expense',
    name: 'Expense Tracker',
    description: 'Track expenses and manage your budget',
    icon: 'LayoutDashboard',
    color: 'emerald',
    features: ['Expense logging', 'Categories', 'Budget tracking', 'Reports'],
  },
  {
    id: 'trip',
    name: 'Trip Planner',
    description: 'Plan your travels with itinerary and packing lists',
    icon: 'Calendar',
    color: 'blue',
    features: ['Itinerary', 'Packing list', 'Budget', 'Maps & locations'],
  },
  {
    id: 'todo',
    name: 'Todo List',
    description: 'Simple task management with priorities and deadlines',
    icon: 'Code',
    color: 'orange',
    features: ['Task lists', 'Priorities', 'Deadlines', 'Completion tracking'],
  },
  {
    id: 'sound-box',
    name: 'Sound Box',
    description: 'Voice-to-text converter with multi-language support',
    icon: 'Mic',
    color: 'indigo',
    features: ['20+ languages', 'Real-time transcription', 'Voice recording', 'Copy & clear'],
  },
  {
    id: 'book-notes',
    name: 'Book Reading Notes',
    description: 'Track books, chapters, quotes, and reading reflections',
    icon: 'BookOpen',
    color: 'amber',
    features: ['Book tracker', 'Chapter notes', 'Quotes collection', 'Reading progress'],
  },
  {
    id: 'habit-tracker',
    name: 'Habit Tracker',
    description: 'Build and track daily habits with streaks and progress',
    icon: 'Calendar',
    color: 'emerald',
    features: ['Daily tracking', 'Streak counter', 'Progress charts', 'Habit goals'],
  },
  {
    id: 'workout-log',
    name: 'Workout Log',
    description: 'Track exercises, sets, reps, and fitness progress',
    icon: 'Brain',
    color: 'orange',
    features: ['Exercise library', 'Sets & reps', 'Progress tracking', 'Workout plans'],
  },
  {
    id: 'budget-planner',
    name: 'Budget Planner',
    description: 'Manage monthly budget with income, expenses, and savings',
    icon: 'Code',
    color: 'blue',
    features: ['Income tracking', 'Expense categories', 'Savings goals', 'Monthly reports'],
  },
  {
    id: 'class-notes',
    name: 'Class Notes',
    description: 'Academic notes with subjects, lectures, and assignments',
    icon: 'FileText',
    color: 'purple',
    features: ['Subject organization', 'Lecture notes', 'Assignment tracker', 'Study schedule'],
  },
  {
    id: 'research-builder',
    name: 'Research Builder',
    description: 'AI-powered research tool with planning, execution, and analysis',
    icon: 'Brain',
    color: 'violet',
    features: ['Chapter planning', 'AI content generation', 'Research analysis', 'Report builder'],
  },
  {
    id: 'grocery-list',
    name: 'Grocery List',
    description: 'Shopping list for groceries and vegetables with completion tracking',
    icon: 'ShoppingCart',
    color: 'green',
    features: ['Item categories', 'Check off items', 'Quantity tracking', 'Shopping history'],
  },
  {
    id: 'expense-sharer',
    name: 'Expense Sharer',
    description: 'Split trip and event expenses among friends',
    icon: 'Users',
    color: 'teal',
    features: ['Add participants', 'Track expenses', 'Auto-split bills', 'Settlement summary'],
  },
  {
    id: 'project-pipeline',
    name: 'Project Pipeline',
    description: 'Visual canvas to plan and track project stages',
    icon: 'Workflow',
    color: 'cyan',
    features: ['Kanban board', 'Stage tracking', 'Task management', 'Progress visualization'],
  },
  {
    id: 'prompt-diary',
    name: 'Prompt Diary',
    description: 'Save and organize useful AI prompts for future use',
    icon: 'MessageSquare',
    color: 'indigo',
    features: ['Prompt library', 'Categories', 'Search & filter', 'Copy to clipboard'],
  },
  {
    id: 'save-the-date',
    name: 'Save the Date',
    description: 'Track important dates, events, and reminders',
    icon: 'CalendarDays',
    color: 'rose',
    features: ['Event calendar', 'Reminders', 'Countdown timers', 'Recurring events'],
  },
  {
    id: 'important-urls',
    name: 'Important URLs',
    description: 'Save YouTube, Instagram, Reels, and Shorts URLs',
    icon: 'Link',
    color: 'red',
    features: ['URL bookmarks', 'Video previews', 'Categories', 'Quick access'],
  },
  {
    id: 'language-translator',
    name: 'Language Translator',
    description: 'Translate text and voice between languages',
    icon: 'Languages',
    color: 'sky',
    features: ['Voice translation', 'Text translation', 'Multi-language support', 'History'],
  },
  {
    id: 'dictionary',
    name: 'Dictionary',
    description: 'Word meanings in source and target languages',
    icon: 'BookOpen',
    color: 'slate',
    features: ['Word lookup', 'Definitions', 'Translations', 'Examples'],
  },
  {
    id: 'meals-planner',
    name: 'Meals Planner',
    description: 'Restaurant order planner and meal organizer',
    icon: 'UtensilsCrossed',
    color: 'orange',
    features: ['Menu builder', 'Order tracking', 'Table management', 'Bill calculator'],
  },
  {
    id: 'games-scorecard',
    name: 'Games Scorecard',
    description: 'Conduct matches and track scores for different games',
    icon: 'Trophy',
    color: 'yellow',
    features: ['Match tracking', 'Score recording', 'Player stats', 'Leaderboard'],
  },
  {
    id: 'sticker-book',
    name: 'Sticker Book',
    description: 'Canvas for organizing sticky notes and ideas',
    icon: 'StickyNote',
    color: 'lime',
    features: ['Sticky notes', 'Drag & drop', 'Color coding', 'Infinite canvas'],
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
