"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus,
  Loader2,
  Type,
  Image as ImageIcon,
  CheckSquare,
  List,
  Calendar as CalendarIcon,
  Link as LinkIcon,
  Quote,
  Code,
  Trash2,
  GripVertical,
  X,
  FileText,
  Heading1,
  AlignLeft,
  Upload,
  Edit3,
  File,
  Clock,
  ChevronLeft,
  ChevronRight,
  FolderOpen,
  Save,
  Info
} from "lucide-react";

type WidgetType = 'heading' | 'text' | 'blog' | 'image' | 'calendar' | 'tasks' | 'checklist' | 'document' | 'link' | 'quote' | 'code' | 'divider';

interface Task {
  id: string;
  text: string;
  completed: boolean;
  dueDate?: string;
}

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time?: string;
}

interface Widget {
  id: string;
  type: WidgetType;
  content: string;
  title?: string;
  items?: string[];
  checked?: boolean[];
  url?: string;
  imageUrl?: string;
  tasks?: Task[];
  events?: CalendarEvent[];
  author?: string;
  date?: string;
  tags?: string[];
}

interface CustomPage {
  id: string;
  name: string;
  widgets: Widget[];
  createdAt: string;
  updatedAt: string;
}

interface CustomTemplateProps {
  title?: string;
  notebookId?: string;
}

const widgetOptions: { type: WidgetType; icon: React.ReactNode; label: string; description: string }[] = [
  { type: 'heading', icon: <Heading1 className="w-5 h-5" />, label: 'Heading', description: 'Section title' },
  { type: 'text', icon: <AlignLeft className="w-5 h-5" />, label: 'Text', description: 'Paragraph text' },
  { type: 'blog', icon: <FileText className="w-5 h-5" />, label: 'Blog Post', description: 'Rich blog content' },
  { type: 'image', icon: <ImageIcon className="w-5 h-5" />, label: 'Image', description: 'Upload or embed' },
  { type: 'calendar', icon: <CalendarIcon className="w-5 h-5" />, label: 'Calendar', description: 'Events & dates' },
  { type: 'tasks', icon: <CheckSquare className="w-5 h-5" />, label: 'Tasks', description: 'To-do with dates' },
  { type: 'checklist', icon: <List className="w-5 h-5" />, label: 'Checklist', description: 'Simple checklist' },
  { type: 'document', icon: <File className="w-5 h-5" />, label: 'Document', description: 'File attachment' },
  { type: 'link', icon: <LinkIcon className="w-5 h-5" />, label: 'Link', description: 'External link' },
  { type: 'quote', icon: <Quote className="w-5 h-5" />, label: 'Quote', description: 'Blockquote' },
  { type: 'code', icon: <Code className="w-5 h-5" />, label: 'Code', description: 'Code snippet' },
  { type: 'divider', icon: <span className="w-full h-0.5 bg-current" />, label: 'Divider', description: 'Section break' },
];

export function CustomTemplate({ title = "Custom Pages", notebookId }: CustomTemplateProps) {
  const [pages, setPages] = useState<CustomPage[]>([]);
  const [activePageId, setActivePageId] = useState<string | null>(null);
  const [showPageForm, setShowPageForm] = useState(false);
  const [pageName, setPageName] = useState('');
  const [editingPageId, setEditingPageId] = useState<string | null>(null);
  const [confirmDeletePageId, setConfirmDeletePageId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showDocumentation, setShowDocumentation] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showWidgetMenu, setShowWidgetMenu] = useState(false);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pagesRef = useRef<CustomPage[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const activePage = pages.find(p => p.id === activePageId) ?? null;

  const saveData = useCallback(() => {
    if (!notebookId) return;
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    
    saveTimeoutRef.current = setTimeout(() => {
      setSaving(true);
      try {
        localStorage.setItem(`custom-${notebookId}`, JSON.stringify({ pages: pagesRef.current, activePageId }));
      } catch (error) {
        console.error("Failed to save:", error);
      } finally {
        setSaving(false);
      }
    }, 1000);
  }, [notebookId, activePageId]);

  useEffect(() => {
    if (!notebookId) return;
    try {
      const saved = localStorage.getItem(`custom-${notebookId}`);
      if (saved) {
        const data = JSON.parse(saved);
        const loadedPages = data.pages || [];
        if (loadedPages.length === 0) {
          const defaultPage: CustomPage = {
            id: Date.now().toString(),
            name: 'My First Page',
            widgets: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          setPages([defaultPage]);
          pagesRef.current = [defaultPage];
          setActivePageId(defaultPage.id);
        } else {
          setPages(loadedPages);
          pagesRef.current = loadedPages;
          setActivePageId(data.activePageId || loadedPages[0]?.id || null);
        }
      } else {
        const defaultPage: CustomPage = {
          id: Date.now().toString(),
          name: 'My First Page',
          widgets: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        setPages([defaultPage]);
        pagesRef.current = [defaultPage];
        setActivePageId(defaultPage.id);
      }
    } catch (error) {
      console.error("Failed to load:", error);
    }
  }, [notebookId]);

  useEffect(() => {
    saveData();
  }, [pages, activePageId, saveData]);
  
  useEffect(() => {
    pagesRef.current = pages;
  }, [pages]);

  // Page CRUD
  const updatePage = useCallback((updates: Partial<CustomPage>) => {
    if (!activePageId) return;
    setPages(prev => prev.map(p => 
      p.id === activePageId 
        ? { ...p, ...updates, updatedAt: new Date().toISOString() }
        : p
    ));
  }, [activePageId]);

  const createPage = () => {
    if (!pageName.trim()) return;
    const newPage: CustomPage = {
      id: Date.now().toString(),
      name: pageName.trim(),
      widgets: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setPages(prev => [...prev, newPage]);
    setActivePageId(newPage.id);
    setShowPageForm(false);
    setPageName('');
  };

  const saveEditPage = () => {
    if (!editingPageId || !pageName.trim()) return;
    setPages(prev => prev.map(p => 
      p.id === editingPageId 
        ? { ...p, name: pageName.trim(), updatedAt: new Date().toISOString() }
        : p
    ));
    setEditingPageId(null);
    setPageName('');
  };

  const deletePage = (id: string) => {
    const next = pages.filter(p => p.id !== id);
    if (activePageId === id) {
      setActivePageId(next[0]?.id ?? null);
    }
    setPages(next);
    setConfirmDeletePageId(null);
  };

  // Widget CRUD
  const addWidget = (type: WidgetType) => {
    if (!activePage) return;
    const newWidget: Widget = {
      id: Date.now().toString(),
      type,
      content: '',
      items: type === 'checklist' ? [''] : undefined,
      checked: type === 'checklist' ? [false] : undefined,
      tasks: type === 'tasks' ? [] : undefined,
      events: type === 'calendar' ? [] : undefined,
      tags: type === 'blog' ? [] : undefined,
    };
    updatePage({ widgets: [...activePage.widgets, newWidget] });
    setShowWidgetMenu(false);
  };

  const updateWidget = (id: string, updates: Partial<Widget>) => {
    if (!activePage) return;
    updatePage({
      widgets: activePage.widgets.map(w => w.id === id ? { ...w, ...updates } : w)
    });
  };

  const removeWidget = (id: string) => {
    if (!activePage) return;
    updatePage({ widgets: activePage.widgets.filter(w => w.id !== id) });
  };

  const moveWidget = (fromIndex: number, toIndex: number) => {
    if (!activePage) return;
    const newWidgets = [...activePage.widgets];
    const [removed] = newWidgets.splice(fromIndex, 1);
    newWidgets.splice(toIndex, 0, removed);
    updatePage({ widgets: newWidgets });
  };

  // Drag & Drop
  const handleDragStart = (id: string) => {
    setDraggedId(id);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (!draggedId || !activePage) return;
    const draggedIndex = activePage.widgets.findIndex(w => w.id === draggedId);
    if (draggedIndex !== index) {
      moveWidget(draggedIndex, index);
    }
  };

  const handleDragEnd = () => {
    setDraggedId(null);
  };

  // Checklist helpers
  const addChecklistItem = (widgetId: string) => {
    const widget = activePage?.widgets.find(w => w.id === widgetId);
    if (!widget) return;
    updateWidget(widgetId, {
      items: [...(widget.items || []), ''],
      checked: [...(widget.checked || []), false]
    });
  };

  const updateChecklistItem = (widgetId: string, index: number, value: string) => {
    const widget = activePage?.widgets.find(w => w.id === widgetId);
    if (!widget?.items) return;
    const newItems = [...widget.items];
    newItems[index] = value;
    updateWidget(widgetId, { items: newItems });
  };

  const toggleChecklistItem = (widgetId: string, index: number) => {
    const widget = activePage?.widgets.find(w => w.id === widgetId);
    if (!widget?.checked) return;
    const newChecked = [...widget.checked];
    newChecked[index] = !newChecked[index];
    updateWidget(widgetId, { checked: newChecked });
  };

  const removeChecklistItem = (widgetId: string, index: number) => {
    const widget = activePage?.widgets.find(w => w.id === widgetId);
    if (!widget?.items) return;
    updateWidget(widgetId, {
      items: widget.items.filter((_, i) => i !== index),
      checked: widget.checked?.filter((_, i) => i !== index)
    });
  };

  // Task helpers
  const addTask = (widgetId: string) => {
    const widget = activePage?.widgets.find(w => w.id === widgetId);
    if (!widget) return;
    const newTask: Task = {
      id: Date.now().toString(),
      text: '',
      completed: false
    };
    updateWidget(widgetId, { tasks: [...(widget.tasks || []), newTask] });
  };

  const updateTask = (widgetId: string, taskId: string, updates: Partial<Task>) => {
    const widget = activePage?.widgets.find(w => w.id === widgetId);
    if (!widget?.tasks) return;
    updateWidget(widgetId, {
      tasks: widget.tasks.map(t => t.id === taskId ? { ...t, ...updates } : t)
    });
  };

  const removeTask = (widgetId: string, taskId: string) => {
    const widget = activePage?.widgets.find(w => w.id === widgetId);
    if (!widget?.tasks) return;
    updateWidget(widgetId, { tasks: widget.tasks.filter(t => t.id !== taskId) });
  };

  // Calendar helpers
  const addEvent = (widgetId: string) => {
    const widget = activePage?.widgets.find(w => w.id === widgetId);
    if (!widget) return;
    const newEvent: CalendarEvent = {
      id: Date.now().toString(),
      title: '',
      date: new Date().toISOString().split('T')[0]
    };
    updateWidget(widgetId, { events: [...(widget.events || []), newEvent] });
  };

  const updateEvent = (widgetId: string, eventId: string, updates: Partial<CalendarEvent>) => {
    const widget = activePage?.widgets.find(w => w.id === widgetId);
    if (!widget?.events) return;
    updateWidget(widgetId, {
      events: widget.events.map(e => e.id === eventId ? { ...e, ...updates } : e)
    });
  };

  const removeEvent = (widgetId: string, eventId: string) => {
    const widget = activePage?.widgets.find(w => w.id === widgetId);
    if (!widget?.events) return;
    updateWidget(widgetId, { events: widget.events.filter(e => e.id !== eventId) });
  };

  // Image upload
  const handleImageUpload = (widgetId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      updateWidget(widgetId, { imageUrl: e.target?.result as string });
    };
    reader.readAsDataURL(file);
    event.target.value = '';
  };

  const renderWidget = (widget: Widget, index: number) => {
    const commonProps = {
      draggable: true,
      onDragStart: () => handleDragStart(widget.id),
      onDragOver: (e: React.DragEvent) => handleDragOver(e, index),
      onDragEnd: handleDragEnd,
    };

    return (
      <motion.div
        key={widget.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`group relative ${draggedId === widget.id ? 'opacity-50' : ''}`}
        {...commonProps}
      >
        <div className="absolute -left-8 top-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <GripVertical className="w-4 h-4 text-neutral-400 cursor-grab" />
        </div>
        <button
          onClick={() => removeWidget(widget.id)}
          className="absolute -right-8 top-2 p-1 text-neutral-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Trash2 className="w-4 h-4" />
        </button>

        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors">
          {widget.type === 'heading' && (
            <input
              type="text"
              value={widget.content}
              onChange={(e) => updateWidget(widget.id, { content: e.target.value })}
              placeholder="Heading..."
              className="w-full text-2xl font-bold text-neutral-900 dark:text-white bg-transparent outline-none"
            />
          )}

          {widget.type === 'text' && (
            <textarea
              value={widget.content}
              onChange={(e) => updateWidget(widget.id, { content: e.target.value })}
              placeholder="Start typing..."
              className="w-full min-h-[100px] text-neutral-700 dark:text-neutral-300 bg-transparent outline-none resize-none"
            />
          )}

          {widget.type === 'blog' && (
            <div className="space-y-3">
              <input
                type="text"
                value={widget.title || ''}
                onChange={(e) => updateWidget(widget.id, { title: e.target.value })}
                placeholder="Blog post title..."
                className="w-full text-xl font-bold text-neutral-900 dark:text-white bg-transparent outline-none"
              />
              <div className="flex gap-2 text-sm text-neutral-500">
                <input
                  type="text"
                  value={widget.author || ''}
                  onChange={(e) => updateWidget(widget.id, { author: e.target.value })}
                  placeholder="Author"
                  className="flex-1 bg-neutral-50 dark:bg-neutral-800 px-3 py-1 rounded outline-none"
                />
                <input
                  type="date"
                  value={widget.date || ''}
                  onChange={(e) => updateWidget(widget.id, { date: e.target.value })}
                  className="bg-neutral-50 dark:bg-neutral-800 px-3 py-1 rounded outline-none"
                />
              </div>
              <textarea
                value={widget.content}
                onChange={(e) => updateWidget(widget.id, { content: e.target.value })}
                placeholder="Write your blog post content..."
                className="w-full min-h-[200px] text-neutral-700 dark:text-neutral-300 bg-transparent outline-none resize-none"
              />
            </div>
          )}

          {widget.type === 'image' && (
            <div className="space-y-3">
              {widget.imageUrl ? (
                <div className="relative group/img">
                  <img src={widget.imageUrl} alt="" className="w-full rounded-lg" />
                  <button
                    onClick={() => updateWidget(widget.id, { imageUrl: undefined })}
                    className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg opacity-0 group-hover/img:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(widget.id, e)}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-8 border-2 border-dashed border-neutral-300 dark:border-neutral-700 rounded-xl hover:border-indigo-400 flex flex-col items-center gap-2 text-neutral-400 hover:text-indigo-500 transition-colors"
                  >
                    <Upload className="w-8 h-8" />
                    <span>Click to upload image</span>
                  </button>
                  <input
                    type="url"
                    value={widget.url || ''}
                    onChange={(e) => updateWidget(widget.id, { url: e.target.value, imageUrl: e.target.value })}
                    placeholder="Or paste image URL..."
                    className="w-full mt-2 px-3 py-2 bg-neutral-50 dark:bg-neutral-800 rounded outline-none text-sm"
                  />
                </div>
              )}
              <input
                type="text"
                value={widget.content}
                onChange={(e) => updateWidget(widget.id, { content: e.target.value })}
                placeholder="Image caption..."
                className="w-full text-sm text-neutral-600 dark:text-neutral-400 bg-transparent outline-none italic"
              />
            </div>
          )}

          {widget.type === 'calendar' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-neutral-900 dark:text-white">Events</h3>
                <button
                  onClick={() => addEvent(widget.id)}
                  className="text-sm text-indigo-500 hover:text-indigo-600 flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" /> Add Event
                </button>
              </div>
              <div className="space-y-2">
                {widget.events?.map(event => (
                  <div key={event.id} className="flex items-center gap-2 p-2 bg-neutral-50 dark:bg-neutral-800 rounded-lg group/event">
                    <CalendarIcon className="w-4 h-4 text-neutral-400 flex-shrink-0" />
                    <input
                      type="text"
                      value={event.title}
                      onChange={(e) => updateEvent(widget.id, event.id, { title: e.target.value })}
                      placeholder="Event title..."
                      className="flex-1 bg-transparent outline-none text-sm"
                    />
                    <input
                      type="date"
                      value={event.date}
                      onChange={(e) => updateEvent(widget.id, event.id, { date: e.target.value })}
                      className="bg-transparent outline-none text-sm"
                    />
                    <button
                      onClick={() => removeEvent(widget.id, event.id)}
                      className="text-neutral-400 hover:text-red-500 opacity-0 group-hover/event:opacity-100"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                {(!widget.events || widget.events.length === 0) && (
                  <p className="text-sm text-neutral-400 text-center py-4">No events yet</p>
                )}
              </div>
            </div>
          )}

          {widget.type === 'tasks' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-neutral-900 dark:text-white">Tasks</h3>
                <button
                  onClick={() => addTask(widget.id)}
                  className="text-sm text-indigo-500 hover:text-indigo-600 flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" /> Add Task
                </button>
              </div>
              <div className="space-y-2">
                {widget.tasks?.map(task => (
                  <div key={task.id} className="flex items-center gap-2 group/task">
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => updateTask(widget.id, task.id, { completed: !task.completed })}
                      className="w-4 h-4 rounded border-neutral-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <input
                      type="text"
                      value={task.text}
                      onChange={(e) => updateTask(widget.id, task.id, { text: e.target.value })}
                      placeholder="Task description..."
                      className={`flex-1 bg-transparent outline-none text-sm ${task.completed ? 'line-through text-neutral-400' : 'text-neutral-700 dark:text-neutral-300'}`}
                    />
                    <input
                      type="date"
                      value={task.dueDate || ''}
                      onChange={(e) => updateTask(widget.id, task.id, { dueDate: e.target.value })}
                      className="bg-neutral-50 dark:bg-neutral-800 px-2 py-1 rounded text-xs outline-none"
                    />
                    <button
                      onClick={() => removeTask(widget.id, task.id)}
                      className="text-neutral-400 hover:text-red-500 opacity-0 group-hover/task:opacity-100"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                {(!widget.tasks || widget.tasks.length === 0) && (
                  <p className="text-sm text-neutral-400 text-center py-4">No tasks yet</p>
                )}
              </div>
            </div>
          )}

          {widget.type === 'checklist' && (
            <div className="space-y-2">
              {widget.items?.map((item, i) => (
                <div key={i} className="flex items-center gap-2 group/item">
                  <input
                    type="checkbox"
                    checked={widget.checked?.[i] || false}
                    onChange={() => toggleChecklistItem(widget.id, i)}
                    className="w-4 h-4 rounded border-neutral-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => updateChecklistItem(widget.id, i, e.target.value)}
                    placeholder="Checklist item..."
                    className={`flex-1 bg-transparent outline-none ${widget.checked?.[i] ? 'line-through text-neutral-400' : 'text-neutral-700 dark:text-neutral-300'}`}
                  />
                  <button
                    onClick={() => removeChecklistItem(widget.id, i)}
                    className="text-neutral-400 hover:text-red-500 opacity-0 group-hover/item:opacity-100"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              <button
                onClick={() => addChecklistItem(widget.id)}
                className="text-sm text-neutral-400 hover:text-neutral-600 flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Add item
              </button>
            </div>
          )}

          {widget.type === 'document' && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                <File className="w-5 h-5 text-neutral-400" />
                <input
                  type="text"
                  value={widget.title || ''}
                  onChange={(e) => updateWidget(widget.id, { title: e.target.value })}
                  placeholder="Document name..."
                  className="flex-1 bg-transparent outline-none font-medium"
                />
              </div>
              <input
                type="url"
                value={widget.url || ''}
                onChange={(e) => updateWidget(widget.id, { url: e.target.value })}
                placeholder="Document URL or path..."
                className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 rounded outline-none text-sm"
              />
              <textarea
                value={widget.content}
                onChange={(e) => updateWidget(widget.id, { content: e.target.value })}
                placeholder="Document description..."
                className="w-full min-h-[60px] px-3 py-2 bg-neutral-50 dark:bg-neutral-800 rounded outline-none text-sm resize-none"
              />
            </div>
          )}

          {widget.type === 'link' && (
            <div className="space-y-2">
              <input
                type="text"
                value={widget.content}
                onChange={(e) => updateWidget(widget.id, { content: e.target.value })}
                placeholder="Link title..."
                className="w-full text-neutral-900 dark:text-white bg-transparent outline-none font-medium"
              />
              <input
                type="url"
                value={widget.url || ''}
                onChange={(e) => updateWidget(widget.id, { url: e.target.value })}
                placeholder="https://..."
                className="w-full text-sm text-blue-500 bg-transparent outline-none"
              />
            </div>
          )}

          {widget.type === 'quote' && (
            <div className="border-l-4 border-indigo-500 pl-4">
              <textarea
                value={widget.content}
                onChange={(e) => updateWidget(widget.id, { content: e.target.value })}
                placeholder="Enter quote..."
                className="w-full min-h-[60px] text-neutral-700 dark:text-neutral-300 bg-transparent outline-none resize-none italic"
              />
            </div>
          )}

          {widget.type === 'code' && (
            <div className="bg-neutral-900 rounded-lg p-4 font-mono">
              <textarea
                value={widget.content}
                onChange={(e) => updateWidget(widget.id, { content: e.target.value })}
                placeholder="// Enter code..."
                className="w-full min-h-[100px] text-green-400 bg-transparent outline-none resize-none text-sm"
              />
            </div>
          )}

          {widget.type === 'divider' && (
            <hr className="border-neutral-200 dark:border-neutral-700" />
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-indigo-50 to-purple-50 dark:from-neutral-950 dark:to-neutral-900">
      {saving && (
        <div className="fixed top-20 right-6 flex items-center gap-2 text-sm text-neutral-500 bg-white dark:bg-neutral-800 px-3 py-2 rounded-lg shadow-lg z-50">
          <Loader2 className="w-4 h-4 animate-spin" />
          Saving...
        </div>
      )}

      {/* Header with Page Tabs */}
      <div className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm border-b border-neutral-200 dark:border-neutral-800 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">{title}</h1>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowDocumentation(true)}
                className="p-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition-colors"
                title="Documentation"
              >
                <Info className="h-4 w-4" />
              </button>
              <button
                onClick={() => setShowPageForm(true)}
                className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-medium flex items-center gap-2 hover:opacity-90"
              >
                <Plus className="w-4 h-4" />
                New Page
              </button>
            </div>
          </div>

          {/* Page Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {pages.map(page => (
              <div key={page.id} className="relative group flex-shrink-0">
                <button
                  onClick={() => setActivePageId(page.id)}
                  className={`px-4 py-2 rounded-lg transition-all ${
                    activePageId === page.id
                      ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                      : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                  }`}
                >
                  {page.name}
                </button>
                <div className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingPageId(page.id);
                      setPageName(page.name);
                    }}
                    className="p-1 bg-white dark:bg-neutral-800 rounded shadow-sm hover:bg-neutral-100 dark:hover:bg-neutral-700"
                  >
                    <Edit3 className="w-3 h-3" />
                  </button>
                  {pages.length > 1 && (
                    confirmDeletePageId === page.id ? (
                      <div className="flex gap-1">
                        <button
                          onClick={(e) => { e.stopPropagation(); deletePage(page.id); }}
                          className="px-2 py-1 bg-red-500 text-white rounded text-xs"
                        >
                          Del
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); setConfirmDeletePageId(null); }}
                          className="px-2 py-1 bg-neutral-200 dark:bg-neutral-700 rounded text-xs"
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={(e) => { e.stopPropagation(); setConfirmDeletePageId(page.id); }}
                        className="p-1 bg-white dark:bg-neutral-800 rounded shadow-sm hover:bg-red-100 dark:hover:bg-red-900/30"
                      >
                        <Trash2 className="w-3 h-3 text-red-500" />
                      </button>
                    )
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Page Form Modal */}
      {(showPageForm || editingPageId) && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
              {editingPageId ? 'Edit Page' : 'Create New Page'}
            </h3>
            <input
              type="text"
              value={pageName}
              onChange={(e) => setPageName(e.target.value)}
              placeholder="Page name..."
              className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800 rounded-xl outline-none mb-4"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={editingPageId ? saveEditPage : createPage}
                className="flex-1 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600"
              >
                {editingPageId ? 'Save' : 'Create'}
              </button>
              <button
                onClick={() => {
                  setShowPageForm(false);
                  setEditingPageId(null);
                  setPageName('');
                }}
                className="px-4 py-2 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Page Content */}
      {activePage && (
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="space-y-4 mb-6">
            {activePage.widgets.length === 0 && (
              <div className="text-center py-12 bg-white dark:bg-neutral-900 rounded-2xl border-2 border-dashed border-neutral-300 dark:border-neutral-700">
                <p className="text-neutral-400 mb-4">Your page is empty</p>
                <button
                  onClick={() => setShowWidgetMenu(true)}
                  className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg inline-flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add your first widget
                </button>
              </div>
            )}
            {activePage.widgets.map((widget, index) => renderWidget(widget, index))}
          </div>

          {/* Add Widget Button */}
          <div className="relative">
            <button
              onClick={() => setShowWidgetMenu(!showWidgetMenu)}
              className="w-full py-3 border-2 border-dashed border-neutral-300 dark:border-neutral-700 rounded-xl text-neutral-400 hover:border-indigo-400 hover:text-indigo-500 flex items-center justify-center gap-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Widget
            </button>

            {showWidgetMenu && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute bottom-full left-0 right-0 mb-2 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-xl p-3 grid grid-cols-3 gap-2 z-10"
              >
                {widgetOptions.map(option => (
                  <button
                    key={option.type}
                    onClick={() => addWidget(option.type)}
                    className="p-3 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 flex flex-col items-center gap-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
                  >
                    {option.icon}
                    <div className="text-center">
                      <div className="text-xs font-medium">{option.label}</div>
                      <div className="text-[10px] text-neutral-400">{option.description}</div>
                    </div>
                  </button>
                ))}
              </motion.div>
            )}
          </div>
        </div>
      )}

      {!activePage && (
        <div className="max-w-4xl mx-auto px-6 py-20 text-center">
          <FolderOpen className="w-16 h-16 mx-auto mb-4 text-neutral-400" />
          <p className="text-lg text-neutral-400">No page selected</p>
          <p className="text-sm text-neutral-500">Create or select a page to start building</p>
        </div>
      )}

      {/* Documentation Modal */}
      <AnimatePresence>
        {showDocumentation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowDocumentation(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
            >
              <div className="sticky top-0 bg-gradient-to-r from-indigo-500 to-purple-600 p-6 flex items-center justify-between z-10">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Custom Pages Guide</h2>
                    <p className="text-indigo-100 text-sm">Build anything with flexible widgets</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDocumentation(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-white" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-3">🎨 Overview</h3>
                  <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed">
                    Custom Pages is the ultimate flexible template that lets you build exactly what you need. Create multiple pages and add any combination of 12 different widget types - from headings and text to calendars, tasks, code blocks, and more.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-3">📦 12 Widget Types</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-3">
                      <h4 className="font-semibold text-neutral-900 dark:text-white text-sm mb-1 flex items-center gap-2">
                        <Heading1 className="w-4 h-4 text-indigo-500" /> Heading
                      </h4>
                      <p className="text-xs text-neutral-600 dark:text-neutral-400">Large section titles</p>
                    </div>
                    <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-3">
                      <h4 className="font-semibold text-neutral-900 dark:text-white text-sm mb-1 flex items-center gap-2">
                        <AlignLeft className="w-4 h-4 text-indigo-500" /> Text
                      </h4>
                      <p className="text-xs text-neutral-600 dark:text-neutral-400">Paragraph content</p>
                    </div>
                    <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-3">
                      <h4 className="font-semibold text-neutral-900 dark:text-white text-sm mb-1 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-indigo-500" /> Blog Post
                      </h4>
                      <p className="text-xs text-neutral-600 dark:text-neutral-400">Title, author, date, content</p>
                    </div>
                    <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-3">
                      <h4 className="font-semibold text-neutral-900 dark:text-white text-sm mb-1 flex items-center gap-2">
                        <ImageIcon className="w-4 h-4 text-indigo-500" /> Image
                      </h4>
                      <p className="text-xs text-neutral-600 dark:text-neutral-400">Upload or URL with caption</p>
                    </div>
                    <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-3">
                      <h4 className="font-semibold text-neutral-900 dark:text-white text-sm mb-1 flex items-center gap-2">
                        <CalendarIcon className="w-4 h-4 text-indigo-500" /> Calendar
                      </h4>
                      <p className="text-xs text-neutral-600 dark:text-neutral-400">Events with dates</p>
                    </div>
                    <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-3">
                      <h4 className="font-semibold text-neutral-900 dark:text-white text-sm mb-1 flex items-center gap-2">
                        <CheckSquare className="w-4 h-4 text-indigo-500" /> Tasks
                      </h4>
                      <p className="text-xs text-neutral-600 dark:text-neutral-400">To-dos with due dates</p>
                    </div>
                    <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-3">
                      <h4 className="font-semibold text-neutral-900 dark:text-white text-sm mb-1 flex items-center gap-2">
                        <List className="w-4 h-4 text-indigo-500" /> Checklist
                      </h4>
                      <p className="text-xs text-neutral-600 dark:text-neutral-400">Simple checkbox list</p>
                    </div>
                    <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-3">
                      <h4 className="font-semibold text-neutral-900 dark:text-white text-sm mb-1 flex items-center gap-2">
                        <File className="w-4 h-4 text-indigo-500" /> Document
                      </h4>
                      <p className="text-xs text-neutral-600 dark:text-neutral-400">File reference with description</p>
                    </div>
                    <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-3">
                      <h4 className="font-semibold text-neutral-900 dark:text-white text-sm mb-1 flex items-center gap-2">
                        <LinkIcon className="w-4 h-4 text-indigo-500" /> Link
                      </h4>
                      <p className="text-xs text-neutral-600 dark:text-neutral-400">External URL</p>
                    </div>
                    <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-3">
                      <h4 className="font-semibold text-neutral-900 dark:text-white text-sm mb-1 flex items-center gap-2">
                        <Quote className="w-4 h-4 text-indigo-500" /> Quote
                      </h4>
                      <p className="text-xs text-neutral-600 dark:text-neutral-400">Blockquote styling</p>
                    </div>
                    <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-3">
                      <h4 className="font-semibold text-neutral-900 dark:text-white text-sm mb-1 flex items-center gap-2">
                        <Code className="w-4 h-4 text-indigo-500" /> Code
                      </h4>
                      <p className="text-xs text-neutral-600 dark:text-neutral-400">Syntax-highlighted code</p>
                    </div>
                    <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-3">
                      <h4 className="font-semibold text-neutral-900 dark:text-white text-sm mb-1 flex items-center gap-2">
                        <span className="w-4 h-0.5 bg-indigo-500" /> Divider
                      </h4>
                      <p className="text-xs text-neutral-600 dark:text-neutral-400">Visual section break</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-3">🚀 How to Use</h3>
                  <div className="space-y-3">
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-500 text-white flex items-center justify-center text-sm font-bold">1</div>
                      <div>
                        <p className="font-semibold text-neutral-900 dark:text-white">Create a Page</p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">Click "New Page" to create a custom page. Give it a descriptive name.</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-500 text-white flex items-center justify-center text-sm font-bold">2</div>
                      <div>
                        <p className="font-semibold text-neutral-900 dark:text-white">Add Widgets</p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">Click "Add Widget" and choose from 12 widget types. Add as many as you need.</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-500 text-white flex items-center justify-center text-sm font-bold">3</div>
                      <div>
                        <p className="font-semibold text-neutral-900 dark:text-white">Drag to Reorder</p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">Hover over widgets to see the grip icon. Drag widgets to rearrange them.</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-500 text-white flex items-center justify-center text-sm font-bold">4</div>
                      <div>
                        <p className="font-semibold text-neutral-900 dark:text-white">Fill Content</p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">Click into each widget to add content. Different widgets have different fields.</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-500 text-white flex items-center justify-center text-sm font-bold">5</div>
                      <div>
                        <p className="font-semibold text-neutral-900 dark:text-white">Manage Pages</p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">Switch between pages using tabs. Edit page names or delete pages via hover buttons.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-3">💡 Pro Tips</h3>
                  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-4 space-y-2">
                    <p className="text-sm text-neutral-700 dark:text-neutral-300">✅ <strong>Mix widgets freely</strong> - Combine any widgets to create custom layouts</p>
                    <p className="text-sm text-neutral-700 dark:text-neutral-300">✅ <strong>Use dividers</strong> - Separate sections visually for better organization</p>
                    <p className="text-sm text-neutral-700 dark:text-neutral-300">✅ <strong>Create templates</strong> - Build reusable page structures for common needs</p>
                    <p className="text-sm text-neutral-700 dark:text-neutral-300">✅ <strong>Drag to reorder</strong> - Reorganize widgets anytime by dragging</p>
                    <p className="text-sm text-neutral-700 dark:text-neutral-300">✅ <strong>Multiple pages</strong> - Create separate pages for different projects or topics</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-3">💼 Use Cases</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                      <p className="font-semibold text-neutral-900 dark:text-white text-sm mb-1">📋 Project Dashboard</p>
                      <p className="text-xs text-neutral-600 dark:text-neutral-400">Tasks, calendar, notes, links in one place</p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-3">
                      <p className="font-semibold text-neutral-900 dark:text-white text-sm mb-1">📝 Meeting Notes</p>
                      <p className="text-xs text-neutral-600 dark:text-neutral-400">Agenda, attendees, action items, decisions</p>
                    </div>
                    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-3">
                      <p className="font-semibold text-neutral-900 dark:text-white text-sm mb-1">📚 Study Guide</p>
                      <p className="text-xs text-neutral-600 dark:text-neutral-400">Headings, text, code examples, checklists</p>
                    </div>
                    <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                      <p className="font-semibold text-neutral-900 dark:text-white text-sm mb-1">🎯 Goal Tracker</p>
                      <p className="text-xs text-neutral-600 dark:text-neutral-400">Tasks, progress checklists, motivational quotes</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-3">💾 Data Storage</h3>
                  <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-4">
                    <p className="text-sm text-emerald-800 dark:text-emerald-300 leading-relaxed">
                      <strong>Your custom pages are automatically saved locally.</strong> All pages, widgets, and content are stored in your browser's local storage. Changes save automatically as you type. Look for the "Saving..." indicator to confirm storage.
                    </p>
                  </div>
                </div>
              </div>

              <div className="sticky bottom-0 bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-700 p-6">
                <button
                  onClick={() => setShowDocumentation(false)}
                  className="w-full px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:opacity-90 transition-opacity font-medium"
                >
                  Got it!
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
