export interface TemplateConfig {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  isPro?: boolean;
  isNew?: boolean;
  jsonBacked?: boolean;
  color: string;
}

export const TEMPLATES: TemplateConfig[] = [
  { id: 'simple', name: 'Simple Notebook', description: 'Basic note-taking with page flipping and rich text', icon: 'book', category: 'Basic', color: '#f59e0b' },
  { id: 'meeting-notes', name: 'Meeting Notes', description: 'Scratch pad, pinned notes, structured minutes', icon: 'users', category: 'Work', color: '#3b82f6' },
  { id: 'document', name: 'Document', description: 'Multiple tabs, charts, overview sections', icon: 'file-text', category: 'Work', jsonBacked: true, color: '#8b5cf6' },
  { id: 'dashboard', name: 'Dashboard', description: 'Notes, calendar, task management', icon: 'layout-dashboard', category: 'Work', jsonBacked: true, color: '#06b6d4' },
  { id: 'code-notebook', name: 'Code Notebook', description: 'Code blocks, syntax highlighting, output', icon: 'code', category: 'Tech', jsonBacked: true, color: '#10b981' },
  { id: 'planner', name: 'Planner', description: 'Context, goals, timed agenda', icon: 'calendar', category: 'Productivity', jsonBacked: true, color: '#f59e0b' },
  { id: 'ai-research', name: 'AI Research', description: 'Source management, AI chat, deep research', icon: 'search', category: 'AI', jsonBacked: true, color: '#a855f7', isPro: true },
  { id: 'diary', name: 'Diary', description: 'Daily entries, mood tracking, calendar', icon: 'heart', category: 'Personal', jsonBacked: true, color: '#ec4899' },
  { id: 'journal', name: 'Journal', description: 'Prompts, reflection, gratitude log', icon: 'pen-tool', category: 'Personal', color: '#f97316' },
  { id: 'custom', name: 'Custom Pages', description: 'Fully customizable page layout', icon: 'layout', category: 'Basic', color: '#64748b' },
  { id: 'doodle', name: 'Doodle', description: 'Drawing tools, color palette, layers', icon: 'edit-3', category: 'Creative', color: '#f43f5e' },
  { id: 'project', name: 'Project', description: 'Tasks, timeline, milestones', icon: 'briefcase', category: 'Work', jsonBacked: true, color: '#0ea5e9' },
  { id: 'loop', name: 'Loop', description: 'Real-time sync, comments, mentions', icon: 'refresh-cw', category: 'Collaboration', jsonBacked: true, color: '#22c55e' },
  { id: 'story', name: 'Story', description: 'Chapters, character profiles, plot outline', icon: 'book-open', category: 'Creative', color: '#8b5cf6' },
  { id: 'storytelling', name: 'Storytelling', description: 'Story studio features', icon: 'feather', category: 'Creative', color: '#a855f7' },
  { id: 'typewriter', name: 'Typewriter', description: 'Focus mode, typewriter sounds, word count', icon: 'type', category: 'Writing', color: '#78716c' },
  { id: 'n8n', name: 'n8n Workflows', description: 'Workflow integration notes', icon: 'git-branch', category: 'Tech', color: '#f97316' },
  { id: 'image-prompt', name: 'Image Prompts', description: 'Image prompt templates and examples', icon: 'image', category: 'AI', color: '#ec4899', isPro: true },
  { id: 'video-prompt', name: 'Video Prompts', description: 'Video prompt templates', icon: 'video', category: 'AI', color: '#ef4444', isPro: true },
  { id: 'link', name: 'Link Collection', description: 'Categories, tags, quick access', icon: 'link', category: 'Productivity', color: '#3b82f6' },
  { id: 'studybook', name: 'Study Book', description: 'Summaries, key concepts, review mode', icon: 'graduation-cap', category: 'Education', jsonBacked: true, color: '#10b981' },
  { id: 'flashcard', name: 'Flashcards', description: 'Study mode, spaced repetition', icon: 'layers', category: 'Education', color: '#f59e0b' },
  { id: 'whiteboard', name: 'Whiteboard', description: 'Infinite canvas, shapes, sticky notes', icon: 'square', category: 'Creative', jsonBacked: true, color: '#64748b' },
  { id: 'recipe', name: 'Recipe Book', description: 'Ingredients, step-by-step, cook timer', icon: 'coffee', category: 'Lifestyle', color: '#f97316' },
  { id: 'expense', name: 'Expense Tracker', description: 'Logging, categories, budget, reports', icon: 'dollar-sign', category: 'Finance', color: '#22c55e' },
  { id: 'trip', name: 'Trip Planner', description: 'Itinerary, packing list, budget', icon: 'map-pin', category: 'Travel', jsonBacked: true, color: '#06b6d4' },
  { id: 'todo', name: 'Todo List', description: 'Priorities, deadlines, completion tracking', icon: 'check-square', category: 'Productivity', color: '#3b82f6' },
  { id: 'sound-box', name: 'Sound Box', description: 'Voice-to-text, multi-language support', icon: 'mic', category: 'AI', color: '#a855f7' },
  { id: 'book-notes', name: 'Book Reading Notes', description: 'Book tracker, chapter notes, quotes', icon: 'bookmark', category: 'Education', color: '#8b5cf6' },
  { id: 'habit-tracker', name: 'Habit Tracker', description: 'Daily tracking, streaks, progress', icon: 'trending-up', category: 'Lifestyle', color: '#10b981' },
  { id: 'workout-log', name: 'Workout Log', description: 'Exercise library, sets/reps, plans', icon: 'activity', category: 'Lifestyle', color: '#f97316' },
  { id: 'budget-planner', name: 'Budget Planner', description: 'Income/expenses, savings goals', icon: 'pie-chart', category: 'Finance', color: '#22c55e' },
  { id: 'class-notes', name: 'Class Notes', description: 'Subjects, lectures, assignments', icon: 'book', category: 'Education', color: '#3b82f6' },
  { id: 'research-builder', name: 'Research Builder', description: 'AI content, chapter planning', icon: 'search', category: 'Education', color: '#8b5cf6', isPro: true },
  { id: 'grocery-list', name: 'Grocery List', description: 'Categories, check-off, quantities', icon: 'shopping-cart', category: 'Lifestyle', color: '#22c55e' },
  { id: 'expense-sharer', name: 'Expense Sharer', description: 'Participants, auto-split, settlement', icon: 'users', category: 'Finance', color: '#f59e0b' },
  { id: 'project-pipeline', name: 'Project Pipeline', description: 'Kanban, stages, progress tracking', icon: 'columns', category: 'Work', color: '#0ea5e9' },
  { id: 'prompt-diary', name: 'Prompt Diary', description: 'Prompt library, categories, search', icon: 'message-square', category: 'AI', jsonBacked: true, color: '#a855f7', isPro: true },
  { id: 'save-the-date', name: 'Save the Date', description: 'Events, reminders, countdown, URLs', icon: 'calendar', category: 'Events', jsonBacked: true, color: '#ec4899' },
  { id: 'important-urls', name: 'Important URLs', description: 'YouTube/Instagram/Reels bookmarks', icon: 'link-2', category: 'Productivity', color: '#f97316' },
  { id: 'language-translator', name: 'Language Translator', description: 'Voice/text, multi-language', icon: 'globe', category: 'Tools', color: '#06b6d4' },
  { id: 'dictionary', name: 'Dictionary', description: 'Word lookup, definitions, examples', icon: 'book', category: 'Tools', color: '#3b82f6' },
  { id: 'meals-planner', name: 'Meals Planner', description: 'Menu, orders, table management', icon: 'utensils', category: 'Lifestyle', color: '#f59e0b' },
  { id: 'games-scorecard', name: 'Games Scorecard', description: 'Matches, scores, leaderboard', icon: 'award', category: 'Lifestyle', color: '#f97316' },
  { id: 'sticker-book', name: 'Sticker Book', description: 'Sticky notes, drag & drop, colors', icon: 'star', category: 'Creative', color: '#ec4899' },
  { id: 'tutorial-learn', name: 'Tutorial Learn', description: 'Steps, sections, images, PDF export', icon: 'play', category: 'Education', jsonBacked: true, color: '#10b981' },
  { id: 'mind-map', name: 'Mind Map', description: 'Nodes, hierarchy, JSON export', icon: 'git-merge', category: 'Productivity', color: '#8b5cf6' },
  { id: 'goal-tracker', name: 'Goal Tracker', description: 'SMART goals, milestones, progress', icon: 'target', category: 'Productivity', color: '#f59e0b' },
  { id: 'ai-prompt-studio', name: 'AI Prompt Studio', description: 'Version control, multi-model, metrics', icon: 'zap', category: 'AI', color: '#a855f7', isPro: true },
  { id: 'piano-notes', name: 'Piano Notes', description: 'Repertoire, practice log, technique', icon: 'music', category: 'Lifestyle', color: '#8b5cf6' },
  { id: 'vocabulary', name: 'Vocabulary', description: 'Word lists, definitions, tags', icon: 'type', category: 'Education', color: '#10b981' },
];

export const TEMPLATE_CATEGORIES = [
  'All', 'Basic', 'Work', 'Productivity', 'Creative', 'Writing', 'Education',
  'AI', 'Finance', 'Lifestyle', 'Travel', 'Events', 'Tools', 'Tech', 'Collaboration'
];

export const NOTEBOOK_CATEGORIES = ['All', 'Personal', 'Work', 'School', 'Research'];

export const PAPER_PATTERNS = [
  { id: 'blank', name: 'Blank' },
  { id: 'lined', name: 'Lined' },
  { id: 'grid', name: 'Grid' },
  { id: 'dotted', name: 'Dotted' },
];

export const FONT_STYLES = [
  { id: 'sans', name: 'Sans Serif' },
  { id: 'serif', name: 'Serif' },
  { id: 'handwritten', name: 'Handwritten' },
];
