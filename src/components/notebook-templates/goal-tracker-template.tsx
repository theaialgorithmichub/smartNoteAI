"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Trash2, 
  Edit2, 
  Target, 
  Calendar,
  CheckCircle2,
  Circle,
  TrendingUp,
  Award,
  Flag,
  X,
  Save,
  ChevronDown,
  ChevronRight,
  BarChart3
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { TemplateHeader } from './template-header';
import { TemplateFooter } from './template-footer';

interface Milestone {
  id: string;
  title: string;
  completed: boolean;
  dueDate: string;
}

interface Goal {
  id: string;
  title: string;
  description: string;
  category: 'personal' | 'career' | 'health' | 'financial' | 'learning' | 'other';
  priority: 'low' | 'medium' | 'high';
  startDate: string;
  targetDate: string;
  progress: number;
  milestones: Milestone[];
  isExpanded: boolean;
  status: 'not-started' | 'in-progress' | 'completed' | 'on-hold';
  notes: string;
}

interface GoalTrackerTemplateProps {
  title: string;
  notebookId?: string;
}

const CATEGORIES = [
  { value: 'personal', label: 'Personal', color: 'bg-blue-500', icon: '🎯' },
  { value: 'career', label: 'Career', color: 'bg-purple-500', icon: '💼' },
  { value: 'health', label: 'Health', color: 'bg-green-500', icon: '💪' },
  { value: 'financial', label: 'Financial', color: 'bg-amber-500', icon: '💰' },
  { value: 'learning', label: 'Learning', color: 'bg-indigo-500', icon: '📚' },
  { value: 'other', label: 'Other', color: 'bg-slate-500', icon: '⭐' },
];

const PRIORITIES = [
  { value: 'low', label: 'Low', color: 'text-slate-500' },
  { value: 'medium', label: 'Medium', color: 'text-amber-500' },
  { value: 'high', label: 'High', color: 'text-red-500' },
];

export function GoalTrackerTemplate({ title, notebookId }: GoalTrackerTemplateProps) {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [editingGoal, setEditingGoal] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // New goal form state
  const [newGoal, setNewGoal] = useState<Partial<Goal>>({
    title: '',
    description: '',
    category: 'personal',
    priority: 'medium',
    startDate: new Date().toISOString().split('T')[0],
    targetDate: '',
    progress: 0,
    milestones: [],
    status: 'not-started',
    notes: '',
  });

  useEffect(() => {
    if (notebookId) {
      const saved = localStorage.getItem(`goal-tracker-${notebookId}`);
      if (saved) {
        setGoals(JSON.parse(saved));
      }
    }
  }, [notebookId]);

  useEffect(() => {
    if (notebookId && goals.length > 0) {
      localStorage.setItem(`goal-tracker-${notebookId}`, JSON.stringify(goals));
    }
  }, [goals, notebookId]);

  const addGoal = () => {
    if (!newGoal.title || !newGoal.targetDate) return;

    const goal: Goal = {
      id: Date.now().toString(),
      title: newGoal.title,
      description: newGoal.description || '',
      category: newGoal.category as any,
      priority: newGoal.priority as any,
      startDate: newGoal.startDate || new Date().toISOString().split('T')[0],
      targetDate: newGoal.targetDate,
      progress: 0,
      milestones: [],
      isExpanded: false,
      status: 'not-started',
      notes: '',
    };

    setGoals(prev => [...prev, goal]);
    setShowAddGoal(false);
    setNewGoal({
      title: '',
      description: '',
      category: 'personal',
      priority: 'medium',
      startDate: new Date().toISOString().split('T')[0],
      targetDate: '',
      progress: 0,
      milestones: [],
      status: 'not-started',
      notes: '',
    });
  };

  const deleteGoal = (goalId: string) => {
    setGoals(prev => prev.filter(g => g.id !== goalId));
  };

  const toggleGoalExpansion = (goalId: string) => {
    setGoals(prev => prev.map(g => 
      g.id === goalId ? { ...g, isExpanded: !g.isExpanded } : g
    ));
  };

  const updateGoalProgress = (goalId: string, progress: number) => {
    setGoals(prev => prev.map(g => {
      if (g.id !== goalId) return g;
      
      let status = g.status;
      if (progress === 100) status = 'completed';
      else if (progress > 0) status = 'in-progress';
      else status = 'not-started';

      return { ...g, progress, status };
    }));
  };

  const addMilestone = (goalId: string) => {
    const milestone: Milestone = {
      id: Date.now().toString(),
      title: 'New Milestone',
      completed: false,
      dueDate: new Date().toISOString().split('T')[0],
    };

    setGoals(prev => prev.map(g => 
      g.id === goalId 
        ? { ...g, milestones: [...g.milestones, milestone] }
        : g
    ));
  };

  const toggleMilestone = (goalId: string, milestoneId: string) => {
    setGoals(prev => prev.map(g => {
      if (g.id !== goalId) return g;
      
      const updatedMilestones = g.milestones.map(m => 
        m.id === milestoneId ? { ...m, completed: !m.completed } : m
      );
      
      const completedCount = updatedMilestones.filter(m => m.completed).length;
      const progress = updatedMilestones.length > 0 
        ? Math.round((completedCount / updatedMilestones.length) * 100)
        : 0;

      let status = g.status;
      if (progress === 100) status = 'completed';
      else if (progress > 0) status = 'in-progress';

      return { ...g, milestones: updatedMilestones, progress, status };
    }));
  };

  const deleteMilestone = (goalId: string, milestoneId: string) => {
    setGoals(prev => prev.map(g => 
      g.id === goalId 
        ? { ...g, milestones: g.milestones.filter(m => m.id !== milestoneId) }
        : g
    ));
  };

  const filteredGoals = goals.filter(goal => {
    if (filterCategory !== 'all' && goal.category !== filterCategory) return false;
    if (filterStatus !== 'all' && goal.status !== filterStatus) return false;
    return true;
  });

  const stats = {
    total: goals.length,
    completed: goals.filter(g => g.status === 'completed').length,
    inProgress: goals.filter(g => g.status === 'in-progress').length,
    avgProgress: goals.length > 0 
      ? Math.round(goals.reduce((sum, g) => sum + g.progress, 0) / goals.length)
      : 0,
  };

  const getCategoryConfig = (category: string) => {
    return CATEGORIES.find(c => c.value === category) || CATEGORIES[0];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'in-progress': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'on-hold': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
      default: return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400';
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-neutral-900 dark:to-indigo-950">
      <TemplateHeader title={title} />

      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-4 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <Target className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-300">Total Goals</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.total}</p>
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-300">Completed</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.completed}</p>
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-300">In Progress</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.inProgress}</p>
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-300">Avg Progress</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.avgProgress}%</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Filters and Add Button */}
          <div className="flex flex-wrap items-center gap-4">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2 border rounded-lg dark:bg-neutral-800 dark:border-neutral-700"
            >
              <option value="all">All Categories</option>
              {CATEGORIES.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.icon} {cat.label}</option>
              ))}
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border rounded-lg dark:bg-neutral-800 dark:border-neutral-700"
            >
              <option value="all">All Statuses</option>
              <option value="not-started">Not Started</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="on-hold">On Hold</option>
            </select>

            <div className="flex-1" />

            <Button
              onClick={() => setShowAddGoal(true)}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Goal
            </Button>
          </div>

          {/* Goals List */}
          <div className="space-y-4">
            <AnimatePresence>
              {filteredGoals.map((goal) => {
                const categoryConfig = getCategoryConfig(goal.category);
                
                return (
                  <motion.div
                    key={goal.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <Card className="p-6 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm">
                      <div className="flex items-start gap-4">
                        <button
                          onClick={() => toggleGoalExpansion(goal.id)}
                          className="mt-1"
                        >
                          {goal.isExpanded ? (
                            <ChevronDown className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                          ) : (
                            <ChevronRight className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                          )}
                        </button>

                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                                  {goal.title}
                                </h3>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${categoryConfig.color} text-white`}>
                                  {categoryConfig.icon} {categoryConfig.label}
                                </span>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(goal.status)}`}>
                                  {goal.status.replace('-', ' ')}
                                </span>
                              </div>
                              {goal.description && (
                                <p className="text-slate-600 dark:text-slate-300 mb-3">
                                  {goal.description}
                                </p>
                              )}
                            </div>

                            <Button
                              onClick={() => deleteGoal(goal.id)}
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>

                          {/* Progress Bar */}
                          <div className="mb-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                                Progress
                              </span>
                              <span className="text-sm font-bold text-slate-900 dark:text-white">
                                {goal.progress}%
                              </span>
                            </div>
                            <div className="h-3 bg-slate-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                              <motion.div
                                className="h-full bg-gradient-to-r from-blue-500 to-indigo-600"
                                initial={{ width: 0 }}
                                animate={{ width: `${goal.progress}%` }}
                                transition={{ duration: 0.5 }}
                              />
                            </div>
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={goal.progress}
                              onChange={(e) => updateGoalProgress(goal.id, parseInt(e.target.value))}
                              className="w-full mt-2"
                            />
                          </div>

                          {/* Dates */}
                          <div className="flex items-center gap-6 text-sm text-slate-600 dark:text-slate-300 mb-4">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              <span>Start: {new Date(goal.startDate).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Flag className="w-4 h-4" />
                              <span>Target: {new Date(goal.targetDate).toLocaleDateString()}</span>
                            </div>
                          </div>

                          {/* Expanded Content */}
                          <AnimatePresence>
                            {goal.isExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="border-t dark:border-neutral-700 pt-4 mt-4"
                              >
                                <div className="flex items-center justify-between mb-3">
                                  <h4 className="font-semibold text-slate-900 dark:text-white">
                                    Milestones ({goal.milestones.filter(m => m.completed).length}/{goal.milestones.length})
                                  </h4>
                                  <Button
                                    onClick={() => addMilestone(goal.id)}
                                    size="sm"
                                    variant="outline"
                                  >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add Milestone
                                  </Button>
                                </div>

                                <div className="space-y-2">
                                  {goal.milestones.map((milestone) => (
                                    <div
                                      key={milestone.id}
                                      className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-neutral-800 rounded-lg"
                                    >
                                      <button
                                        onClick={() => toggleMilestone(goal.id, milestone.id)}
                                      >
                                        {milestone.completed ? (
                                          <CheckCircle2 className="w-5 h-5 text-green-500" />
                                        ) : (
                                          <Circle className="w-5 h-5 text-slate-400" />
                                        )}
                                      </button>
                                      <span className={`flex-1 ${milestone.completed ? 'line-through text-slate-500' : 'text-slate-900 dark:text-white'}`}>
                                        {milestone.title}
                                      </span>
                                      <span className="text-sm text-slate-500">
                                        {new Date(milestone.dueDate).toLocaleDateString()}
                                      </span>
                                      <Button
                                        onClick={() => deleteMilestone(goal.id, milestone.id)}
                                        variant="ghost"
                                        size="sm"
                                      >
                                        <Trash2 className="w-4 h-4 text-red-500" />
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {filteredGoals.length === 0 && (
              <Card className="p-12 text-center bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm">
                <Award className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                <p className="text-slate-500 dark:text-slate-400">
                  No goals found. Start by adding your first goal!
                </p>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Add Goal Modal */}
      <AnimatePresence>
        {showAddGoal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowAddGoal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-neutral-900 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Add New Goal
                </h2>
                <Button onClick={() => setShowAddGoal(false)} variant="ghost" size="sm">
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
                    Goal Title *
                  </label>
                  <input
                    type="text"
                    value={newGoal.title}
                    onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                    className="w-full p-3 border rounded-lg dark:bg-neutral-800 dark:border-neutral-700"
                    placeholder="e.g., Learn React in 3 months"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
                    Description
                  </label>
                  <textarea
                    value={newGoal.description}
                    onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                    className="w-full p-3 border rounded-lg dark:bg-neutral-800 dark:border-neutral-700"
                    rows={3}
                    placeholder="Describe your goal..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
                      Category
                    </label>
                    <select
                      value={newGoal.category}
                      onChange={(e) => setNewGoal({ ...newGoal, category: e.target.value as any })}
                      className="w-full p-3 border rounded-lg dark:bg-neutral-800 dark:border-neutral-700"
                    >
                      {CATEGORIES.map(cat => (
                        <option key={cat.value} value={cat.value}>
                          {cat.icon} {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
                      Priority
                    </label>
                    <select
                      value={newGoal.priority}
                      onChange={(e) => setNewGoal({ ...newGoal, priority: e.target.value as any })}
                      className="w-full p-3 border rounded-lg dark:bg-neutral-800 dark:border-neutral-700"
                    >
                      {PRIORITIES.map(pri => (
                        <option key={pri.value} value={pri.value}>{pri.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={newGoal.startDate}
                      onChange={(e) => setNewGoal({ ...newGoal, startDate: e.target.value })}
                      className="w-full p-3 border rounded-lg dark:bg-neutral-800 dark:border-neutral-700"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
                      Target Date *
                    </label>
                    <input
                      type="date"
                      value={newGoal.targetDate}
                      onChange={(e) => setNewGoal({ ...newGoal, targetDate: e.target.value })}
                      className="w-full p-3 border rounded-lg dark:bg-neutral-800 dark:border-neutral-700"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={addGoal}
                    disabled={!newGoal.title || !newGoal.targetDate}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Create Goal
                  </Button>
                  <Button
                    onClick={() => setShowAddGoal(false)}
                    variant="outline"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <TemplateFooter />
    </div>
  );
}
