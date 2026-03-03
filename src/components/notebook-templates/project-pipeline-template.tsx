'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Workflow, Plus, ArrowRight, CheckCircle, Clock, AlertCircle, Info, X, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ProjectPipelineTemplateProps {
  title: string;
  notebookId?: string;
}

interface Task {
  id: string;
  title: string;
  status: 'backlog' | 'todo' | 'in-progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high';
  assignee?: string;
}

export function ProjectPipelineTemplate({ title, notebookId }: ProjectPipelineTemplateProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState({ title: '', priority: 'medium' as 'low' | 'medium' | 'high', assignee: '' });
  const [saving, setSaving] = useState(false);
  const [showDocumentation, setShowDocumentation] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const saveData = () => {
    if (!notebookId) return;
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    
    saveTimeoutRef.current = setTimeout(() => {
      setSaving(true);
      try {
        localStorage.setItem(`project-pipeline-${notebookId}`, JSON.stringify({ tasks }));
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
      const saved = localStorage.getItem(`project-pipeline-${notebookId}`);
      if (saved) {
        const data = JSON.parse(saved);
        setTasks(data.tasks || []);
      }
    } catch (error) {
      console.error("Failed to load:", error);
    }
  }, [notebookId]);

  useEffect(() => {
    saveData();
  }, [tasks]);

  const stages = [
    { id: 'backlog', name: 'Backlog', color: 'neutral', icon: AlertCircle },
    { id: 'todo', name: 'To Do', color: 'blue', icon: Clock },
    { id: 'in-progress', name: 'In Progress', color: 'purple', icon: ArrowRight },
    { id: 'review', name: 'Review', color: 'amber', icon: CheckCircle },
    { id: 'done', name: 'Done', color: 'green', icon: CheckCircle },
  ];

  const getTasksByStatus = (status: string) => {
    return tasks.filter(task => task.status === status);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'red';
      case 'medium': return 'yellow';
      case 'low': return 'green';
      default: return 'neutral';
    }
  };

  const addTask = () => {
    if (!newTask.title.trim()) return;
    const task: Task = {
      id: Date.now().toString(),
      title: newTask.title,
      status: 'backlog',
      priority: newTask.priority,
      assignee: newTask.assignee || undefined
    };
    setTasks([task, ...tasks]);
    setNewTask({ title: '', priority: 'medium', assignee: '' });
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const moveTask = (taskId: string, newStatus: 'backlog' | 'todo' | 'in-progress' | 'review' | 'done') => {
    setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
  };

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'done').length;
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const teamMembers = Array.from(new Set(tasks.filter(t => t.assignee).map(t => t.assignee)));

  return (
    <div className="h-full bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-neutral-900 dark:to-neutral-800 p-8 overflow-y-auto">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-4 mb-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
              {title}
            </h1>
            <button
              onClick={() => setShowDocumentation(true)}
              className="p-2 bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400 rounded-lg hover:bg-cyan-200 dark:hover:bg-cyan-900/50 transition-colors"
              title="Documentation"
            >
              <Info className="h-4 w-4" />
            </button>
          </div>
          <p className="text-neutral-600 dark:text-neutral-400">Visual project management canvas</p>
        </div>

        {/* Stats */}
        <div className="grid sm:grid-cols-4 gap-4">
          <Card className="p-4 bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
            <p className="text-sm opacity-90 mb-1">Total Tasks</p>
            <p className="text-3xl font-bold">{totalTasks}</p>
          </Card>
          <Card className="p-4 bg-gradient-to-br from-purple-500 to-pink-500 text-white">
            <p className="text-sm opacity-90 mb-1">In Progress</p>
            <p className="text-3xl font-bold">{getTasksByStatus('in-progress').length}</p>
          </Card>
          <Card className="p-4 bg-gradient-to-br from-green-500 to-emerald-500 text-white">
            <p className="text-sm opacity-90 mb-1">Completed</p>
            <p className="text-3xl font-bold">{completedTasks}</p>
          </Card>
          <Card className="p-4 bg-gradient-to-br from-amber-500 to-orange-500 text-white">
            <p className="text-sm opacity-90 mb-1">Progress</p>
            <p className="text-3xl font-bold">{progress}%</p>
          </Card>
        </div>

        {/* Kanban Board */}
        <div className="flex gap-4 overflow-x-auto pb-4">
          {stages.map(stage => {
            const Icon = stage.icon;
            const stageTasks = getTasksByStatus(stage.id);
            
            return (
              <div key={stage.id} className="flex-shrink-0 w-80">
                <Card className={`p-4 bg-gradient-to-br from-${stage.color}-100 to-${stage.color}-200 dark:from-${stage.color}-900/30 dark:to-${stage.color}-900/20 border-2 border-${stage.color}-300 dark:border-${stage.color}-800 h-full`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Icon className={`h-5 w-5 text-${stage.color}-600`} />
                      <h3 className="font-bold text-neutral-900 dark:text-white">{stage.name}</h3>
                    </div>
                    <span className={`px-2 py-1 bg-${stage.color}-200 dark:bg-${stage.color}-900/40 text-${stage.color}-700 dark:text-${stage.color}-400 rounded-full text-xs font-bold`}>
                      {stageTasks.length}
                    </span>
                  </div>

                  <div className="space-y-3 min-h-[400px]">
                    {stageTasks.map(task => {
                      const priorityColor = getPriorityColor(task.priority);
                      return (
                        <Card
                          key={task.id}
                          className="p-4 bg-white dark:bg-neutral-800 shadow-sm hover:shadow-md transition-shadow group relative"
                        >
                          <button
                            onClick={() => deleteTask(task.id)}
                            className="absolute top-2 right-2 p-1 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Delete task"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                          <div className="flex items-start justify-between mb-2 pr-6">
                            <h4 className="font-semibold text-neutral-900 dark:text-white text-sm flex-1">
                              {task.title}
                            </h4>
                            <span className={`px-2 py-0.5 bg-${priorityColor}-100 dark:bg-${priorityColor}-900/30 text-${priorityColor}-700 dark:text-${priorityColor}-400 rounded text-xs font-medium`}>
                              {task.priority}
                            </span>
                          </div>
                          {task.assignee && (
                            <div className="flex items-center gap-2 mt-3">
                              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                                {task.assignee[0]}
                              </div>
                              <span className="text-xs text-neutral-600 dark:text-neutral-400">
                                {task.assignee}
                              </span>
                            </div>
                          )}
                          <div className="flex gap-1 mt-3 flex-wrap">
                            {stages.filter(s => s.id !== stage.id).map(targetStage => (
                              <button
                                key={targetStage.id}
                                onClick={() => moveTask(task.id, targetStage.id as any)}
                                className="px-2 py-1 text-xs bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600 rounded transition-colors"
                                title={`Move to ${targetStage.name}`}
                              >
                                → {targetStage.name}
                              </button>
                            ))}
                          </div>
                        </Card>
                      );
                    })}
                    
                    {stageTasks.length === 0 && (
                      <div className="text-center py-8 text-neutral-400 dark:text-neutral-600 text-sm">
                        No tasks in {stage.name}
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            );
          })}
        </div>

        {/* Quick Add Task */}
        <Card className="p-6 bg-white dark:bg-neutral-800">
          <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-4">Quick Add Task</h3>
          <div className="grid md:grid-cols-5 gap-3">
            <input
              type="text"
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              onKeyPress={(e) => e.key === 'Enter' && addTask()}
              placeholder="Task title..."
              className="md:col-span-2 px-4 py-2 bg-neutral-100 dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
            <select 
              value={newTask.priority}
              onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as 'low' | 'medium' | 'high' })}
              className="px-4 py-2 bg-neutral-100 dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
            </select>
            <input
              type="text"
              value={newTask.assignee}
              onChange={(e) => setNewTask({ ...newTask, assignee: e.target.value })}
              placeholder="Assignee (optional)"
              className="px-4 py-2 bg-neutral-100 dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
            <Button 
              onClick={addTask}
              disabled={!newTask.title.trim()}
              className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Task
            </Button>
          </div>
        </Card>

        {/* Team Members */}
        {teamMembers.length > 0 && (
          <Card className="p-6 bg-white dark:bg-neutral-800">
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-4">Team Members</h3>
            <div className="flex gap-4 flex-wrap">
              {teamMembers.map((member, idx) => {
                const memberTasks = tasks.filter(t => t.assignee === member);
                const colors = ['blue', 'green', 'purple', 'pink', 'orange', 'cyan', 'indigo', 'teal'];
                const color = colors[idx % colors.length];
                
                return (
                  <div
                    key={member}
                    className={`flex-1 min-w-[200px] p-4 bg-gradient-to-br from-${color}-100 to-${color}-200 dark:from-${color}-900/30 dark:to-${color}-900/20 rounded-lg border border-${color}-300 dark:border-${color}-800`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`w-10 h-10 rounded-full bg-gradient-to-br from-${color}-500 to-${color}-600 flex items-center justify-center text-white font-bold`}>
                        {member![0]}
                      </div>
                      <div>
                        <p className="font-bold text-neutral-900 dark:text-white">{member}</p>
                        <p className="text-xs text-neutral-600 dark:text-neutral-400">
                          {memberTasks.length} tasks
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
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
                <div className="sticky top-0 bg-gradient-to-r from-cyan-500 to-blue-600 p-6 flex items-center justify-between z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <Workflow className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">Project Pipeline Guide</h2>
                      <p className="text-cyan-100 text-sm">Visual project management</p>
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
                    <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-3">🔄 Overview</h3>
                    <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed">
                      Project Pipeline provides a visual Kanban-style board for managing project tasks. Track tasks through stages from backlog to completion, assign team members, set priorities, and monitor overall project progress with an intuitive drag-and-drop workflow.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-3">✨ Key Features</h3>
                    <div className="grid gap-3">
                      <div className="bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-200 dark:border-cyan-800 rounded-lg p-4">
                        <h4 className="font-semibold text-cyan-900 dark:text-cyan-400 mb-1">📋 Five-Stage Pipeline</h4>
                        <p className="text-sm text-cyan-800 dark:text-cyan-300">Backlog → To Do → In Progress → Review → Done workflow.</p>
                      </div>
                      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                        <h4 className="font-semibold text-blue-900 dark:text-blue-400 mb-1">👥 Team Assignment</h4>
                        <p className="text-sm text-blue-800 dark:text-blue-300">Assign tasks to team members and track individual workloads.</p>
                      </div>
                      <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-4">
                        <h4 className="font-semibold text-indigo-900 dark:text-indigo-400 mb-1">🎯 Priority Levels</h4>
                        <p className="text-sm text-indigo-800 dark:text-indigo-300">Mark tasks as high, medium, or low priority with color coding.</p>
                      </div>
                      <div className="bg-sky-50 dark:bg-sky-900/20 border border-sky-200 dark:border-sky-800 rounded-lg p-4">
                        <h4 className="font-semibold text-sky-900 dark:text-sky-400 mb-1">📊 Progress Tracking</h4>
                        <p className="text-sm text-sky-800 dark:text-sky-300">Visual progress bar and statistics for project completion.</p>
                      </div>
                      <div className="bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 rounded-lg p-4">
                        <h4 className="font-semibold text-teal-900 dark:text-teal-400 mb-1">🎨 Visual Board</h4>
                        <p className="text-sm text-teal-800 dark:text-teal-300">Kanban-style columns for easy task status visualization.</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-3">🚀 How to Use</h3>
                    <div className="space-y-3">
                      <div className="flex gap-3">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-cyan-500 text-white flex items-center justify-center text-sm font-bold">1</div>
                        <div>
                          <p className="font-semibold text-neutral-900 dark:text-white">Add Tasks</p>
                          <p className="text-sm text-neutral-600 dark:text-neutral-400">Create tasks and add them to the backlog column.</p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-cyan-500 text-white flex items-center justify-center text-sm font-bold">2</div>
                        <div>
                          <p className="font-semibold text-neutral-900 dark:text-white">Set Priorities</p>
                          <p className="text-sm text-neutral-600 dark:text-neutral-400">Mark tasks as high, medium, or low priority based on urgency.</p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-cyan-500 text-white flex items-center justify-center text-sm font-bold">3</div>
                        <div>
                          <p className="font-semibold text-neutral-900 dark:text-white">Assign Team Members</p>
                          <p className="text-sm text-neutral-600 dark:text-neutral-400">Assign tasks to specific team members for accountability.</p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-cyan-500 text-white flex items-center justify-center text-sm font-bold">4</div>
                        <div>
                          <p className="font-semibold text-neutral-900 dark:text-white">Move Through Stages</p>
                          <p className="text-sm text-neutral-600 dark:text-neutral-400">Drag tasks across columns as they progress through the workflow.</p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-cyan-500 text-white flex items-center justify-center text-sm font-bold">5</div>
                        <div>
                          <p className="font-semibold text-neutral-900 dark:text-white">Monitor Progress</p>
                          <p className="text-sm text-neutral-600 dark:text-neutral-400">Track completion percentage and team member workloads.</p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-cyan-500 text-white flex items-center justify-center text-sm font-bold">6</div>
                        <div>
                          <p className="font-semibold text-neutral-900 dark:text-white">Complete Tasks</p>
                          <p className="text-sm text-neutral-600 dark:text-neutral-400">Move finished tasks to the Done column to mark completion.</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-3">💡 Pro Tips</h3>
                    <div className="bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 border border-cyan-200 dark:border-cyan-800 rounded-lg p-4 space-y-2">
                      <p className="text-sm text-neutral-700 dark:text-neutral-300">✅ <strong>Limit WIP</strong> - Keep "In Progress" tasks manageable to avoid bottlenecks</p>
                      <p className="text-sm text-neutral-700 dark:text-neutral-300">✅ <strong>Prioritize ruthlessly</strong> - Use high priority sparingly for truly urgent tasks</p>
                      <p className="text-sm text-neutral-700 dark:text-neutral-300">✅ <strong>Balance workloads</strong> - Distribute tasks evenly across team members</p>
                      <p className="text-sm text-neutral-700 dark:text-neutral-300">✅ <strong>Review regularly</strong> - Use the Review column for quality checks</p>
                      <p className="text-sm text-neutral-700 dark:text-neutral-300">✅ <strong>Clear backlog</strong> - Regularly groom and prioritize backlog items</p>
                      <p className="text-sm text-neutral-700 dark:text-neutral-300">✅ <strong>Celebrate wins</strong> - Acknowledge completed tasks to boost morale</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-3">💾 Data Storage</h3>
                    <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-4">
                      <p className="text-sm text-emerald-800 dark:text-emerald-300 leading-relaxed">
                        <strong>Your project data is automatically saved locally.</strong> All tasks, assignments, priorities, and stages are stored in your browser's local storage. Look for the "Saving..." indicator to confirm storage.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="sticky bottom-0 bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-700 p-6">
                  <button
                    onClick={() => setShowDocumentation(false)}
                    className="w-full px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:opacity-90 transition-opacity font-medium"
                  >
                    Got it!
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
