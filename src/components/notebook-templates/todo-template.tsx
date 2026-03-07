"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TemplateFooter } from './template-footer';
import {
  CheckSquare,
  Plus,
  Loader2,
  Trash2,
  Calendar,
  Clock,
  Tag,
  Flag,
  Filter,
  Search,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  Circle,
  Star,
  AlertCircle,
  TrendingUp,
  BarChart3,
  Sparkles,
  ListTodo,
  CalendarDays,
  Target,
  Zap,
  MoreHorizontal,
  Edit3,
  X,
  ArrowUp,
  ArrowDown,
  Repeat,
  Info
} from "lucide-react";

interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'todo' | 'in-progress' | 'completed';
  dueDate: string | null;
  dueTime: string | null;
  tags: string[];
  project: string;
  subtasks: SubTask[];
  recurring: 'none' | 'daily' | 'weekly' | 'monthly';
  estimatedTime: number; // in minutes
  actualTime: number;
  completedAt: string | null;
  createdAt: string;
}

interface Project {
  id: string;
  name: string;
  color: string;
}

interface TodoTemplateProps {
  title?: string;
  notebookId?: string;
}

const PRIORITY_CONFIG = {
  low: { label: 'Low', color: '#22c55e', icon: ArrowDown },
  medium: { label: 'Medium', color: '#eab308', icon: MoreHorizontal },
  high: { label: 'High', color: '#f97316', icon: ArrowUp },
  urgent: { label: 'Urgent', color: '#ef4444', icon: AlertCircle }
};

const STATUS_CONFIG = {
  'todo': { label: 'To Do', color: '#64748b' },
  'in-progress': { label: 'In Progress', color: '#3b82f6' },
  'completed': { label: 'Completed', color: '#22c55e' }
};

const DEFAULT_TAGS = ['work', 'personal', 'health', 'learning', 'finance', 'home'];
const PROJECT_COLORS = ['#3b82f6', '#22c55e', '#f97316', '#8b5cf6', '#ec4899', '#06b6d4', '#eab308', '#ef4444'];

export function TodoTemplate({ title = "Advanced To-Do", notebookId }: TodoTemplateProps) {
  const [activeTab, setActiveTab] = useState<'tasks' | 'today' | 'upcoming' | 'analytics'>('tasks');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([{ id: 'inbox', name: 'Inbox', color: '#64748b' }]);
  const [customTags, setCustomTags] = useState<string[]>([]);
  
  const [filterProject, setFilterProject] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterTag, setFilterTag] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'dueDate' | 'priority' | 'createdAt'>('dueDate');
  
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [newTask, setNewTask] = useState<Partial<Task>>({
    title: '',
    description: '',
    priority: 'medium',
    status: 'todo',
    dueDate: null,
    dueTime: null,
    tags: [],
    project: 'inbox',
    subtasks: [],
    recurring: 'none',
    estimatedTime: 0
  });
  
  const [isAddingProject, setIsAddingProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  
  const [isAddingSubtask, setIsAddingSubtask] = useState<string | null>(null);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());
  
  const [saving, setSaving] = useState(false);
  const [showDocumentation, setShowDocumentation] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const allTags = useMemo(() => [...new Set([...DEFAULT_TAGS, ...customTags])], [customTags]);

  const saveData = () => {
    if (!notebookId) return;
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    
    saveTimeoutRef.current = setTimeout(() => {
      setSaving(true);
      try {
        localStorage.setItem(`todo-${notebookId}`, JSON.stringify({ tasks, projects, customTags }));
      } catch (error) {
        console.error("Failed to save:", error);
      } finally {
        setSaving(false);
      }
    }, 500);
  };

  useEffect(() => {
    if (!notebookId) return;
    try {
      const saved = localStorage.getItem(`todo-${notebookId}`);
      if (saved) {
        const data = JSON.parse(saved);
        setTasks(data.tasks || []);
        setProjects(data.projects || [{ id: 'inbox', name: 'Inbox', color: '#64748b' }]);
        setCustomTags(data.customTags || []);
      }
    } catch (error) {
      console.error("Failed to load:", error);
    }
  }, [notebookId]);

  useEffect(() => {
    saveData();
  }, [tasks, projects, customTags]);

  // Calculate stats
  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'completed').length;
    const inProgress = tasks.filter(t => t.status === 'in-progress').length;
    const overdue = tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'completed').length;
    const completionRate = total > 0 ? (completed / total) * 100 : 0;
    
    const today = new Date().toISOString().split('T')[0];
    const todayTasks = tasks.filter(t => t.dueDate === today);
    const todayCompleted = todayTasks.filter(t => t.status === 'completed').length;
    
    const thisWeek = tasks.filter(t => {
      if (!t.dueDate) return false;
      const due = new Date(t.dueDate);
      const now = new Date();
      const weekEnd = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      return due >= now && due <= weekEnd;
    });
    
    const byPriority = {
      urgent: tasks.filter(t => t.priority === 'urgent' && t.status !== 'completed').length,
      high: tasks.filter(t => t.priority === 'high' && t.status !== 'completed').length,
      medium: tasks.filter(t => t.priority === 'medium' && t.status !== 'completed').length,
      low: tasks.filter(t => t.priority === 'low' && t.status !== 'completed').length,
    };
    
    const completedThisWeek = tasks.filter(t => {
      if (!t.completedAt) return false;
      const completed = new Date(t.completedAt);
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return completed >= weekAgo;
    }).length;
    
    return { total, completed, inProgress, overdue, completionRate, todayTasks: todayTasks.length, todayCompleted, thisWeek: thisWeek.length, byPriority, completedThisWeek };
  }, [tasks]);

  // Filter and sort tasks
  const filteredTasks = useMemo(() => {
    let filtered = [...tasks];
    
    // Search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(t => 
        t.title.toLowerCase().includes(query) || 
        t.description.toLowerCase().includes(query) ||
        t.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    // Filters
    if (filterProject !== 'all') filtered = filtered.filter(t => t.project === filterProject);
    if (filterPriority !== 'all') filtered = filtered.filter(t => t.priority === filterPriority);
    if (filterStatus !== 'all') filtered = filtered.filter(t => t.status === filterStatus);
    if (filterTag !== 'all') filtered = filtered.filter(t => t.tags.includes(filterTag));
    
    // Sort
    filtered.sort((a, b) => {
      if (sortBy === 'priority') {
        const order = { urgent: 0, high: 1, medium: 2, low: 3 };
        return order[a.priority] - order[b.priority];
      }
      if (sortBy === 'dueDate') {
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    
    // Move completed to bottom
    const active = filtered.filter(t => t.status !== 'completed');
    const completed = filtered.filter(t => t.status === 'completed');
    
    return [...active, ...completed];
  }, [tasks, searchQuery, filterProject, filterPriority, filterStatus, filterTag, sortBy]);

  // Today's tasks
  const todayTasks = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return tasks.filter(t => t.dueDate === today).sort((a, b) => {
      if (a.status === 'completed' && b.status !== 'completed') return 1;
      if (a.status !== 'completed' && b.status === 'completed') return -1;
      const order = { urgent: 0, high: 1, medium: 2, low: 3 };
      return order[a.priority] - order[b.priority];
    });
  }, [tasks]);

  // Upcoming tasks (next 7 days)
  const upcomingTasks = useMemo(() => {
    const today = new Date();
    const weekEnd = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    return tasks.filter(t => {
      if (!t.dueDate || t.status === 'completed') return false;
      const due = new Date(t.dueDate);
      return due >= today && due <= weekEnd;
    }).sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime());
  }, [tasks]);

  const addTask = () => {
    if (!newTask.title?.trim()) return;
    
    const task: Task = {
      id: Date.now().toString(),
      title: newTask.title,
      description: newTask.description || '',
      priority: newTask.priority || 'medium',
      status: 'todo',
      dueDate: newTask.dueDate || null,
      dueTime: newTask.dueTime || null,
      tags: newTask.tags || [],
      project: newTask.project || 'inbox',
      subtasks: [],
      recurring: newTask.recurring || 'none',
      estimatedTime: newTask.estimatedTime || 0,
      actualTime: 0,
      completedAt: null,
      createdAt: new Date().toISOString()
    };
    
    setTasks(prev => [task, ...prev]);
    setNewTask({
      title: '', description: '', priority: 'medium', status: 'todo',
      dueDate: null, dueTime: null, tags: [], project: 'inbox',
      subtasks: [], recurring: 'none', estimatedTime: 0
    });
    setIsAddingTask(false);
  };

  const updateTask = (taskId: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(t => {
      if (t.id !== taskId) return t;
      const updated = { ...t, ...updates };
      if (updates.status === 'completed' && t.status !== 'completed') {
        updated.completedAt = new Date().toISOString();
      }
      return updated;
    }));
  };

  const deleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
  };

  const toggleTaskStatus = (taskId: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id !== taskId) return t;
      const newStatus = t.status === 'completed' ? 'todo' : 'completed';
      return {
        ...t,
        status: newStatus,
        completedAt: newStatus === 'completed' ? new Date().toISOString() : null
      };
    }));
  };

  const addSubtask = (taskId: string) => {
    if (!newSubtaskTitle.trim()) return;
    
    const subtask: SubTask = {
      id: Date.now().toString(),
      title: newSubtaskTitle,
      completed: false
    };
    
    setTasks(prev => prev.map(t => 
      t.id === taskId ? { ...t, subtasks: [...t.subtasks, subtask] } : t
    ));
    setNewSubtaskTitle('');
    setIsAddingSubtask(null);
  };

  const toggleSubtask = (taskId: string, subtaskId: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id !== taskId) return t;
      return {
        ...t,
        subtasks: t.subtasks.map(s => 
          s.id === subtaskId ? { ...s, completed: !s.completed } : s
        )
      };
    }));
  };

  const deleteSubtask = (taskId: string, subtaskId: string) => {
    setTasks(prev => prev.map(t => 
      t.id === taskId ? { ...t, subtasks: t.subtasks.filter(s => s.id !== subtaskId) } : t
    ));
  };

  const addProject = () => {
    if (!newProjectName.trim()) return;
    
    const project: Project = {
      id: Date.now().toString(),
      name: newProjectName,
      color: PROJECT_COLORS[projects.length % PROJECT_COLORS.length]
    };
    
    setProjects(prev => [...prev, project]);
    setNewProjectName('');
    setIsAddingProject(false);
  };

  const deleteProject = (projectId: string) => {
    if (projectId === 'inbox') return; // Can't delete inbox
    
    // Reassign all tasks from this project to inbox
    setTasks(prev => prev.map(t => t.project === projectId ? { ...t, project: 'inbox' } : t));
    
    // Remove the project
    setProjects(prev => prev.filter(p => p.id !== projectId));
    
    // Reset filter if we're filtering by the deleted project
    if (filterProject === projectId) {
      setFilterProject('all');
    }
  };

  const toggleTag = (tag: string) => {
    const currentTags = newTask.tags || [];
    if (currentTags.includes(tag)) {
      setNewTask({ ...newTask, tags: currentTags.filter(t => t !== tag) });
    } else {
      setNewTask({ ...newTask, tags: [...currentTags, tag] });
    }
  };

  const toggleTaskExpanded = (taskId: string) => {
    const newExpanded = new Set(expandedTasks);
    if (newExpanded.has(taskId)) {
      newExpanded.delete(taskId);
    } else {
      newExpanded.add(taskId);
    }
    setExpandedTasks(newExpanded);
  };

  const getProjectInfo = (projectId: string) => projects.find(p => p.id === projectId) || projects[0];

  const isOverdue = (task: Task) => task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed';
  const isDueToday = (task: Task) => task.dueDate === new Date().toISOString().split('T')[0];

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
    
    if (dateStr === today.toISOString().split('T')[0]) return 'Today';
    if (dateStr === tomorrow.toISOString().split('T')[0]) return 'Tomorrow';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const renderTaskItem = (task: Task, showProject = true) => {
    const project = getProjectInfo(task.project);
    const priorityConfig = PRIORITY_CONFIG[task.priority];
    const PriorityIcon = priorityConfig.icon;
    const isExpanded = expandedTasks.has(task.id);
    const completedSubtasks = task.subtasks.filter(s => s.completed).length;
    
    return (
      <div key={task.id} className={`bg-white dark:bg-neutral-900 rounded-xl border ${isOverdue(task) ? 'border-red-300 dark:border-red-800' : 'border-neutral-200 dark:border-neutral-800'} overflow-hidden group`}>
        <div className="p-4">
          <div className="flex items-start gap-3">
            <button onClick={() => toggleTaskStatus(task.id)} className="mt-0.5">
              {task.status === 'completed' 
                ? <CheckCircle2 className="w-6 h-6 text-green-500" />
                : <Circle className="w-6 h-6 text-neutral-300 hover:text-neutral-400" />
              }
            </button>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`font-medium ${task.status === 'completed' ? 'line-through text-neutral-400' : 'text-neutral-900 dark:text-white'}`}>
                  {task.title}
                </span>
                <PriorityIcon className="w-4 h-4" style={{ color: priorityConfig.color }} />
                {showProject && project && (
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: project.color + '20', color: project.color }}>
                    {project.name}
                  </span>
                )}
              </div>
              
              {task.description && (
                <p className="text-sm text-neutral-500 mt-1 line-clamp-1">{task.description}</p>
              )}
              
              <div className="flex items-center gap-3 mt-2 flex-wrap">
                {task.dueDate && (
                  <span className={`text-xs flex items-center gap-1 ${isOverdue(task) ? 'text-red-500' : isDueToday(task) ? 'text-amber-500' : 'text-neutral-500'}`}>
                    <Calendar className="w-3 h-3" />
                    {formatDate(task.dueDate)}
                    {task.dueTime && ` at ${task.dueTime}`}
                  </span>
                )}
                {task.tags.map(tag => (
                  <span key={tag} className="text-xs bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded">
                    #{tag}
                  </span>
                ))}
                {task.subtasks.length > 0 && (
                  <span className="text-xs text-neutral-500 flex items-center gap-1">
                    <CheckSquare className="w-3 h-3" />
                    {completedSubtasks}/{task.subtasks.length}
                  </span>
                )}
                {task.recurring !== 'none' && (
                  <span className="text-xs text-blue-500 flex items-center gap-1">
                    <Repeat className="w-3 h-3" />
                    {task.recurring}
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => toggleTaskExpanded(task.id)} className="p-1.5 text-neutral-400 hover:text-neutral-600 rounded">
                {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
              <button onClick={() => deleteTask(task.id)} className="p-1.5 text-neutral-400 hover:text-red-500 rounded">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
        
        {/* Expanded Content */}
        {isExpanded && (
          <div className="px-4 pb-4 pt-2 border-t border-neutral-100 dark:border-neutral-800">
            {/* Status & Priority */}
            <div className="flex gap-4 mb-4">
              <div>
                <label className="text-xs text-neutral-500 block mb-1">Status</label>
                <select
                  value={task.status}
                  onChange={(e) => updateTask(task.id, { status: e.target.value as Task['status'] })}
                  className="text-sm px-3 py-1.5 bg-neutral-50 dark:bg-neutral-800 rounded-lg outline-none"
                >
                  <option value="todo">To Do</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-neutral-500 block mb-1">Priority</label>
                <select
                  value={task.priority}
                  onChange={(e) => updateTask(task.id, { priority: e.target.value as Task['priority'] })}
                  className="text-sm px-3 py-1.5 bg-neutral-50 dark:bg-neutral-800 rounded-lg outline-none"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>
            
            {/* Subtasks */}
            <div className="mb-4">
              <label className="text-xs text-neutral-500 block mb-2">Subtasks</label>
              {task.subtasks.length > 0 && (
                <div className="space-y-2 mb-2">
                  {task.subtasks.map(subtask => (
                    <div key={subtask.id} className="flex items-center gap-2 group/subtask">
                      <button onClick={() => toggleSubtask(task.id, subtask.id)}>
                        {subtask.completed 
                          ? <CheckCircle2 className="w-4 h-4 text-green-500" />
                          : <Circle className="w-4 h-4 text-neutral-300" />
                        }
                      </button>
                      <span className={`text-sm flex-1 ${subtask.completed ? 'line-through text-neutral-400' : ''}`}>
                        {subtask.title}
                      </span>
                      <button onClick={() => deleteSubtask(task.id, subtask.id)} className="p-1 text-neutral-400 hover:text-red-500 opacity-0 group-hover/subtask:opacity-100">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {isAddingSubtask === task.id ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newSubtaskTitle}
                    onChange={(e) => setNewSubtaskTitle(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addSubtask(task.id)}
                    placeholder="Subtask title"
                    className="flex-1 text-sm px-3 py-1.5 bg-neutral-50 dark:bg-neutral-800 rounded-lg outline-none"
                    autoFocus
                  />
                  <button onClick={() => addSubtask(task.id)} className="px-3 py-1.5 bg-indigo-500 text-white rounded-lg text-sm">Add</button>
                  <button onClick={() => setIsAddingSubtask(null)} className="px-3 py-1.5 text-neutral-500 text-sm">Cancel</button>
                </div>
              ) : (
                <button onClick={() => setIsAddingSubtask(task.id)} className="text-sm text-indigo-500 flex items-center gap-1">
                  <Plus className="w-4 h-4" /> Add subtask
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-full min-h-0 flex flex-col bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-neutral-950 dark:to-neutral-900">
      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
      {saving && (
        <div className="fixed top-20 right-6 flex items-center gap-2 text-sm text-neutral-500 bg-white dark:bg-neutral-800 px-3 py-2 rounded-lg shadow-lg z-50">
          <Loader2 className="w-4 h-4 animate-spin" />
          Saving...
        </div>
      )}

      {/* Header */}
      <div className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm border-b border-neutral-200 dark:border-neutral-800 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                <CheckSquare className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-neutral-900 dark:text-white">{title}</h1>
                <p className="text-xs text-neutral-500">{stats.completed}/{stats.total} completed</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowDocumentation(true)}
                className="p-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition-colors"
                title="Documentation"
              >
                <Info className="h-4 w-4" />
              </button>
              <div className="flex gap-1 bg-neutral-100 dark:bg-neutral-800 p-1 rounded-xl">
                {[
                { id: 'tasks', label: 'All Tasks', icon: ListTodo },
                { id: 'today', label: 'Today', icon: Target },
                { id: 'upcoming', label: 'Upcoming', icon: CalendarDays },
                { id: 'analytics', label: 'Analytics', icon: BarChart3 },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
                    activeTab === tab.id
                      ? 'bg-white dark:bg-neutral-700 text-indigo-600 shadow-sm'
                      : 'text-neutral-600 dark:text-neutral-400'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span className="hidden md:inline">{tab.label}</span>
                  {tab.id === 'today' && stats.todayTasks > 0 && (
                    <span className="bg-indigo-100 text-indigo-600 text-xs px-1.5 rounded-full">{stats.todayTasks}</span>
                  )}
                </button>
              ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* All Tasks Tab */}
        {activeTab === 'tasks' && (
          <div className="flex gap-6">
            {/* Sidebar */}
            <div className="w-56 space-y-6 flex-shrink-0">
              {/* Projects */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-neutral-500">Projects</h3>
                  <button onClick={() => setIsAddingProject(true)} className="text-indigo-500">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                
                {isAddingProject && (
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={newProjectName}
                      onChange={(e) => setNewProjectName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && addProject()}
                      placeholder="Project name"
                      className="flex-1 text-sm px-2 py-1 bg-white dark:bg-neutral-800 rounded outline-none"
                      autoFocus
                    />
                    <button onClick={addProject} className="text-indigo-500 text-sm">Add</button>
                  </div>
                )}
                
                <div className="space-y-1">
                  <button
                    onClick={() => setFilterProject('all')}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm ${filterProject === 'all' ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600' : 'hover:bg-neutral-100 dark:hover:bg-neutral-800'}`}
                  >
                    All Tasks
                  </button>
                  {projects.map(project => (
                    <div
                      key={project.id}
                      className={`w-full px-3 py-2 rounded-lg text-sm flex items-center gap-2 group ${filterProject === project.id ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600' : 'hover:bg-neutral-100 dark:hover:bg-neutral-800'}`}
                    >
                      <button
                        onClick={() => setFilterProject(project.id)}
                        className="flex items-center gap-2 flex-1 text-left"
                      >
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: project.color }} />
                        {project.name}
                        <span className="ml-auto text-xs text-neutral-400">
                          {tasks.filter(t => t.project === project.id && t.status !== 'completed').length}
                        </span>
                      </button>
                      {project.id !== 'inbox' && (
                        <button
                          onClick={() => deleteProject(project.id)}
                          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-all"
                          title="Delete project"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-red-500" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Filters */}
              <div>
                <h3 className="text-sm font-medium text-neutral-500 mb-2">Filters</h3>
                <div className="space-y-2">
                  <select
                    value={filterPriority}
                    onChange={(e) => setFilterPriority(e.target.value)}
                    className="w-full text-sm px-3 py-2 bg-white dark:bg-neutral-800 rounded-lg outline-none"
                  >
                    <option value="all">All Priorities</option>
                    <option value="urgent">Urgent</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                  
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full text-sm px-3 py-2 bg-white dark:bg-neutral-800 rounded-lg outline-none"
                  >
                    <option value="all">All Status</option>
                    <option value="todo">To Do</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                  
                  <select
                    value={filterTag}
                    onChange={(e) => setFilterTag(e.target.value)}
                    className="w-full text-sm px-3 py-2 bg-white dark:bg-neutral-800 rounded-lg outline-none"
                  >
                    <option value="all">All Tags</option>
                    {allTags.map(tag => (
                      <option key={tag} value={tag}>#{tag}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Sort */}
              <div>
                <h3 className="text-sm font-medium text-neutral-500 mb-2">Sort By</h3>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                  className="w-full text-sm px-3 py-2 bg-white dark:bg-neutral-800 rounded-lg outline-none"
                >
                  <option value="dueDate">Due Date</option>
                  <option value="priority">Priority</option>
                  <option value="createdAt">Created Date</option>
                </select>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 space-y-4">
              {/* Search & Add */}
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search tasks..."
                    className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-neutral-800 rounded-xl outline-none"
                  />
                </div>
                <button
                  onClick={() => setIsAddingTask(true)}
                  className="px-5 py-2.5 bg-indigo-500 text-white rounded-xl font-medium flex items-center gap-2 hover:bg-indigo-600"
                >
                  <Plus className="w-5 h-5" /> Add Task
                </button>
              </div>

              {/* Add Task Form */}
              {isAddingTask && (
                <div className="bg-white dark:bg-neutral-900 rounded-xl p-5 border border-neutral-200 dark:border-neutral-800 space-y-4">
                  <input
                    type="text"
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    placeholder="Task title"
                    className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800 rounded-xl outline-none text-lg"
                    autoFocus
                  />
                  
                  <textarea
                    value={newTask.description}
                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                    placeholder="Description (optional)"
                    className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800 rounded-xl outline-none resize-none"
                    rows={2}
                  />
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <select
                      value={newTask.project}
                      onChange={(e) => setNewTask({ ...newTask, project: e.target.value })}
                      className="px-3 py-2 bg-neutral-50 dark:bg-neutral-800 rounded-lg outline-none"
                    >
                      {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                    
                    <select
                      value={newTask.priority}
                      onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as Task['priority'] })}
                      className="px-3 py-2 bg-neutral-50 dark:bg-neutral-800 rounded-lg outline-none"
                    >
                      <option value="low">Low Priority</option>
                      <option value="medium">Medium Priority</option>
                      <option value="high">High Priority</option>
                      <option value="urgent">Urgent</option>
                    </select>
                    
                    <input
                      type="date"
                      value={newTask.dueDate || ''}
                      onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value || null })}
                      className="px-3 py-2 bg-neutral-50 dark:bg-neutral-800 rounded-lg outline-none"
                    />
                    
                    <input
                      type="time"
                      value={newTask.dueTime || ''}
                      onChange={(e) => setNewTask({ ...newTask, dueTime: e.target.value || null })}
                      className="px-3 py-2 bg-neutral-50 dark:bg-neutral-800 rounded-lg outline-none"
                    />
                  </div>
                  
                  {/* Tags */}
                  <div>
                    <label className="text-sm text-neutral-500 mb-2 block">Tags</label>
                    <div className="flex flex-wrap gap-2">
                      {allTags.map(tag => (
                        <button
                          key={tag}
                          onClick={() => toggleTag(tag)}
                          className={`px-3 py-1 rounded-full text-sm ${
                            newTask.tags?.includes(tag)
                              ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30'
                              : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800'
                          }`}
                        >
                          #{tag}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <button onClick={addTask} className="px-5 py-2 bg-indigo-500 text-white rounded-lg">
                      Add Task
                    </button>
                    <button onClick={() => setIsAddingTask(false)} className="px-5 py-2 text-neutral-500">
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Task List */}
              {filteredTasks.length > 0 ? (
                <div className="space-y-3">
                  {filteredTasks.map(task => renderTaskItem(task))}
                </div>
              ) : (
                <div className="text-center py-12 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800">
                  <CheckSquare className="w-12 h-12 mx-auto mb-4 text-neutral-300" />
                  <p className="text-neutral-400">No tasks found</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Today Tab */}
        {activeTab === 'today' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Today</h2>
                <p className="text-neutral-500">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-indigo-600">{stats.todayCompleted}/{stats.todayTasks}</p>
                <p className="text-sm text-neutral-500">completed today</p>
              </div>
            </div>

            {todayTasks.length > 0 ? (
              <div className="space-y-3">
                {todayTasks.map(task => renderTaskItem(task))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800">
                <Target className="w-12 h-12 mx-auto mb-4 text-neutral-300" />
                <p className="text-neutral-400">No tasks due today</p>
                <p className="text-sm text-neutral-400">Enjoy your free day!</p>
              </div>
            )}
          </div>
        )}

        {/* Upcoming Tab */}
        {activeTab === 'upcoming' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Upcoming (Next 7 Days)</h2>
            
            {upcomingTasks.length > 0 ? (
              <div className="space-y-3">
                {upcomingTasks.map(task => renderTaskItem(task))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800">
                <CalendarDays className="w-12 h-12 mx-auto mb-4 text-neutral-300" />
                <p className="text-neutral-400">No upcoming tasks</p>
              </div>
            )}
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            {/* Overview Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-neutral-900 rounded-xl p-5 border border-neutral-200 dark:border-neutral-800">
                <p className="text-neutral-500 text-sm">Total Tasks</p>
                <p className="text-3xl font-bold text-neutral-900 dark:text-white">{stats.total}</p>
              </div>
              <div className="bg-white dark:bg-neutral-900 rounded-xl p-5 border border-neutral-200 dark:border-neutral-800">
                <p className="text-neutral-500 text-sm">Completed</p>
                <p className="text-3xl font-bold text-green-600">{stats.completed}</p>
              </div>
              <div className="bg-white dark:bg-neutral-900 rounded-xl p-5 border border-neutral-200 dark:border-neutral-800">
                <p className="text-neutral-500 text-sm">In Progress</p>
                <p className="text-3xl font-bold text-blue-600">{stats.inProgress}</p>
              </div>
              <div className="bg-white dark:bg-neutral-900 rounded-xl p-5 border border-neutral-200 dark:border-neutral-800">
                <p className="text-neutral-500 text-sm">Overdue</p>
                <p className="text-3xl font-bold text-red-600">{stats.overdue}</p>
              </div>
            </div>

            {/* Completion Rate */}
            <div className="bg-white dark:bg-neutral-900 rounded-xl p-6 border border-neutral-200 dark:border-neutral-800">
              <h3 className="font-semibold text-neutral-900 dark:text-white mb-4">Completion Rate</h3>
              <div className="flex items-center gap-4">
                <div className="flex-1 h-4 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" style={{ width: `${stats.completionRate}%` }} />
                </div>
                <span className="text-2xl font-bold text-indigo-600">{stats.completionRate.toFixed(1)}%</span>
              </div>
            </div>

            {/* Priority Breakdown */}
            <div className="bg-white dark:bg-neutral-900 rounded-xl p-6 border border-neutral-200 dark:border-neutral-800">
              <h3 className="font-semibold text-neutral-900 dark:text-white mb-4">Tasks by Priority (Active)</h3>
              <div className="grid grid-cols-4 gap-4">
                {Object.entries(stats.byPriority).map(([priority, count]) => {
                  const config = PRIORITY_CONFIG[priority as keyof typeof PRIORITY_CONFIG];
                  return (
                    <div key={priority} className="text-center">
                      <div className="w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center" style={{ backgroundColor: config.color + '20' }}>
                        <span className="text-lg font-bold" style={{ color: config.color }}>{count}</span>
                      </div>
                      <p className="text-sm text-neutral-500 capitalize">{priority}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Weekly Progress */}
            <div className="bg-white dark:bg-neutral-900 rounded-xl p-6 border border-neutral-200 dark:border-neutral-800">
              <h3 className="font-semibold text-neutral-900 dark:text-white mb-4">This Week</h3>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-4xl font-bold text-indigo-600">{stats.completedThisWeek}</p>
                  <p className="text-neutral-500">Tasks completed</p>
                </div>
                <div>
                  <p className="text-4xl font-bold text-amber-600">{stats.thisWeek}</p>
                  <p className="text-neutral-500">Tasks due</p>
                </div>
              </div>
            </div>

            {/* Projects Overview */}
            <div className="bg-white dark:bg-neutral-900 rounded-xl p-6 border border-neutral-200 dark:border-neutral-800">
              <h3 className="font-semibold text-neutral-900 dark:text-white mb-4">Tasks by Project</h3>
              <div className="space-y-3">
                {projects.map(project => {
                  const projectTasks = tasks.filter(t => t.project === project.id);
                  const completed = projectTasks.filter(t => t.status === 'completed').length;
                  const total = projectTasks.length;
                  const percentage = total > 0 ? (completed / total) * 100 : 0;
                  
                  return (
                    <div key={project.id} className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: project.color }} />
                      <span className="flex-1 font-medium">{project.name}</span>
                      <div className="w-32 h-2 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${percentage}%`, backgroundColor: project.color }} />
                      </div>
                      <span className="text-sm text-neutral-500 w-16 text-right">{completed}/{total}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

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
                    <CheckSquare className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Advanced To-Do Guide</h2>
                    <p className="text-indigo-100 text-sm">Powerful task management</p>
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
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-3">✅ Overview</h3>
                  <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed">
                    Advanced To-Do is a comprehensive task management system. Organize tasks by projects, set priorities and due dates, add subtasks, use tags for categorization, track recurring tasks, estimate time, and analyze productivity with detailed analytics.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-3">✨ Key Features</h3>
                  <div className="grid gap-3">
                    <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-4">
                      <h4 className="font-semibold text-indigo-900 dark:text-indigo-400 mb-1">📋 Project Organization</h4>
                      <p className="text-sm text-indigo-800 dark:text-indigo-300">Group tasks into color-coded projects for better organization.</p>
                    </div>
                    <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                      <h4 className="font-semibold text-purple-900 dark:text-purple-400 mb-1">🎯 Priority Levels</h4>
                      <p className="text-sm text-purple-800 dark:text-purple-300">Set low, medium, high, or urgent priorities with visual indicators.</p>
                    </div>
                    <div className="bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800 rounded-lg p-4">
                      <h4 className="font-semibold text-violet-900 dark:text-violet-400 mb-1">📅 Due Dates & Times</h4>
                      <p className="text-sm text-violet-800 dark:text-violet-300">Schedule tasks with specific dates and times.</p>
                    </div>
                    <div className="bg-fuchsia-50 dark:bg-fuchsia-900/20 border border-fuchsia-200 dark:border-fuchsia-800 rounded-lg p-4">
                      <h4 className="font-semibold text-fuchsia-900 dark:text-fuchsia-400 mb-1">🔄 Recurring Tasks</h4>
                      <p className="text-sm text-fuchsia-800 dark:text-fuchsia-300">Set daily, weekly, or monthly recurring tasks.</p>
                    </div>
                    <div className="bg-pink-50 dark:bg-pink-900/20 border border-pink-200 dark:border-pink-800 rounded-lg p-4">
                      <h4 className="font-semibold text-pink-900 dark:text-pink-400 mb-1">📊 Analytics Dashboard</h4>
                      <p className="text-sm text-pink-800 dark:text-pink-300">Track completion rates, productivity trends, and project progress.</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-3">🚀 How to Use</h3>
                  <div className="space-y-3">
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-500 text-white flex items-center justify-center text-sm font-bold">1</div>
                      <div>
                        <p className="font-semibold text-neutral-900 dark:text-white">Create Projects</p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">Click "Add Project" to create color-coded project categories.</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-500 text-white flex items-center justify-center text-sm font-bold">2</div>
                      <div>
                        <p className="font-semibold text-neutral-900 dark:text-white">Add Tasks</p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">Click "Add Task" and fill in title, description, priority, due date, and tags.</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-500 text-white flex items-center justify-center text-sm font-bold">3</div>
                      <div>
                        <p className="font-semibold text-neutral-900 dark:text-white">Add Subtasks</p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">Break down complex tasks into smaller subtasks for better tracking.</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-500 text-white flex items-center justify-center text-sm font-bold">4</div>
                      <div>
                        <p className="font-semibold text-neutral-900 dark:text-white">Use Tags</p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">Tag tasks with categories like work, personal, health, learning, etc.</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-500 text-white flex items-center justify-center text-sm font-bold">5</div>
                      <div>
                        <p className="font-semibold text-neutral-900 dark:text-white">View Today & Upcoming</p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">Use Today and Upcoming tabs to focus on time-sensitive tasks.</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-500 text-white flex items-center justify-center text-sm font-bold">6</div>
                      <div>
                        <p className="font-semibold text-neutral-900 dark:text-white">Track Analytics</p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">Analytics tab shows completion rates and productivity insights.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-3">💡 Pro Tips</h3>
                  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-4 space-y-2">
                    <p className="text-sm text-neutral-700 dark:text-neutral-300">✅ <strong>Prioritize ruthlessly</strong> - Use urgent priority sparingly for truly critical tasks</p>
                    <p className="text-sm text-neutral-700 dark:text-neutral-300">✅ <strong>Break down big tasks</strong> - Use subtasks to make large projects manageable</p>
                    <p className="text-sm text-neutral-700 dark:text-neutral-300">✅ <strong>Review daily</strong> - Check Today tab each morning to plan your day</p>
                    <p className="text-sm text-neutral-700 dark:text-neutral-300">✅ <strong>Use recurring tasks</strong> - Automate repetitive tasks like weekly reviews</p>
                    <p className="text-sm text-neutral-700 dark:text-neutral-300">✅ <strong>Estimate time</strong> - Add time estimates to better plan your schedule</p>
                    <p className="text-sm text-neutral-700 dark:text-neutral-300">✅ <strong>Tag consistently</strong> - Use tags to quickly filter and find related tasks</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-3">💾 Data Storage</h3>
                  <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-4">
                    <p className="text-sm text-emerald-800 dark:text-emerald-300 leading-relaxed">
                      <strong>Your tasks are automatically saved locally.</strong> All tasks, projects, tags, and settings are stored in your browser's local storage. Look for the "Saving..." indicator to confirm storage.
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
      <TemplateFooter />
    </div>
  );
}
