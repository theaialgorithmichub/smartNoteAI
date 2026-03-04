'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Workflow, Plus, ArrowRight, CheckCircle, Clock, AlertCircle, Info, X, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { TemplateHeader } from './template-header';
import { TemplateFooter } from './template-footer';
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
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-950 via-cyan-950 to-slate-900 relative overflow-hidden">
      <TemplateHeader title={title} />
      {/* Animated background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.03)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]" />
      
      <div className="flex-1 overflow-y-auto relative">
        <div className="max-w-7xl mx-auto p-8 space-y-6 relative z-10">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-4 mb-2">
              <div className="relative">
                <h1 className="text-5xl font-black bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent animate-pulse">
                  {title}
                </h1>
                <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-lg blur opacity-20 group-hover:opacity-40 transition duration-1000" />
              </div>
              <button
                onClick={() => setShowDocumentation(true)}
                className="p-2 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 rounded-lg hover:bg-cyan-500/20 hover:border-cyan-400/50 transition-all duration-300 hover:shadow-[0_0_20px_rgba(34,211,238,0.3)]"
                title="Documentation"
              >
                <Info className="h-4 w-4" />
              </button>
            </div>
          <p className="text-cyan-300/60 text-sm tracking-widest uppercase font-mono">⚡ Neural Project Management System ⚡</p>
        </div>

        {/* Stats - Futuristic Cards */}
        <div className="grid sm:grid-cols-4 gap-4">
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg blur opacity-30 group-hover:opacity-60 transition duration-300" />
            <Card className="relative p-5 bg-slate-900/90 border border-cyan-500/30 backdrop-blur-xl">
              <p className="text-xs text-cyan-400/80 mb-2 font-mono uppercase tracking-wider">Total Tasks</p>
              <p className="text-4xl font-black text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]">{totalTasks}</p>
              <div className="absolute top-2 right-2 w-2 h-2 bg-cyan-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
            </Card>
          </div>
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg blur opacity-30 group-hover:opacity-60 transition duration-300" />
            <Card className="relative p-5 bg-slate-900/90 border border-purple-500/30 backdrop-blur-xl">
              <p className="text-xs text-purple-400/80 mb-2 font-mono uppercase tracking-wider">In Progress</p>
              <p className="text-4xl font-black text-purple-400 drop-shadow-[0_0_10px_rgba(168,85,247,0.5)]">{getTasksByStatus('in-progress').length}</p>
              <div className="absolute top-2 right-2 w-2 h-2 bg-purple-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(168,85,247,0.8)]" />
            </Card>
          </div>
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg blur opacity-30 group-hover:opacity-60 transition duration-300" />
            <Card className="relative p-5 bg-slate-900/90 border border-green-500/30 backdrop-blur-xl">
              <p className="text-xs text-green-400/80 mb-2 font-mono uppercase tracking-wider">Completed</p>
              <p className="text-4xl font-black text-green-400 drop-shadow-[0_0_10px_rgba(34,197,94,0.5)]">{completedTasks}</p>
              <div className="absolute top-2 right-2 w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.8)]" />
            </Card>
          </div>
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500 to-orange-600 rounded-lg blur opacity-30 group-hover:opacity-60 transition duration-300" />
            <Card className="relative p-5 bg-slate-900/90 border border-amber-500/30 backdrop-blur-xl">
              <p className="text-xs text-amber-400/80 mb-2 font-mono uppercase tracking-wider">Progress</p>
              <p className="text-4xl font-black text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.5)]">{progress}%</p>
              <div className="absolute top-2 right-2 w-2 h-2 bg-amber-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(251,191,36,0.8)]" />
            </Card>
          </div>
        </div>

        {/* Kanban Board */}
        <div className="flex gap-4 overflow-x-auto pb-4">
          {stages.map(stage => {
            const Icon = stage.icon;
            const stageTasks = getTasksByStatus(stage.id);
            
            return (
              <div key={stage.id} className="flex-shrink-0 w-80 relative group">
                <div className={`absolute -inset-0.5 bg-gradient-to-r from-${stage.color}-500 to-${stage.color}-600 rounded-lg blur opacity-20 group-hover:opacity-40 transition duration-300`} />
                <Card className={`relative p-4 bg-slate-900/80 border border-${stage.color}-500/40 backdrop-blur-xl h-full hover:border-${stage.color}-400/60 transition-all duration-300`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Icon className={`h-5 w-5 text-${stage.color}-400 drop-shadow-[0_0_8px_rgba(var(--tw-${stage.color}-rgb),0.6)]`} />
                      <h3 className={`font-black text-${stage.color}-300 uppercase tracking-wide text-sm`}>{stage.name}</h3>
                    </div>
                    <span className={`px-3 py-1 bg-${stage.color}-500/20 border border-${stage.color}-500/40 text-${stage.color}-400 rounded-full text-xs font-bold shadow-[0_0_10px_rgba(var(--tw-${stage.color}-rgb),0.3)]`}>
                      {stageTasks.length}
                    </span>
                  </div>

                  <div className="space-y-3 min-h-[400px]">
                    {stageTasks.map(task => {
                      const priorityColor = getPriorityColor(task.priority);
                      return (
                        <motion.div
                          key={task.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="relative group"
                        >
                          <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-lg blur opacity-0 group-hover:opacity-100 transition duration-300" />
                          <Card className="relative p-4 bg-slate-800/60 border border-slate-700/50 backdrop-blur-sm hover:border-cyan-500/50 transition-all duration-300 hover:shadow-[0_0_20px_rgba(34,211,238,0.2)]">
                          <button
                            onClick={() => deleteTask(task.id)}
                            className="absolute top-2 right-2 p-1 text-red-400 hover:bg-red-500/20 hover:border hover:border-red-500/40 rounded opacity-0 group-hover:opacity-100 transition-all duration-300 hover:shadow-[0_0_10px_rgba(239,68,68,0.4)]"
                            title="Delete task"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                          <div className="flex items-start justify-between mb-2 pr-6">
                            <h4 className="font-semibold text-cyan-100 text-sm flex-1">
                              {task.title}
                            </h4>
                            <span className={`px-2 py-0.5 bg-${priorityColor}-500/20 border border-${priorityColor}-500/40 text-${priorityColor}-400 rounded text-xs font-bold shadow-[0_0_8px_rgba(var(--tw-${priorityColor}-rgb),0.3)]`}>
                              {task.priority}
                            </span>
                          </div>
                          {task.assignee && (
                            <div className="flex items-center gap-2 mt-3">
                              <div className="relative">
                                <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full blur opacity-50" />
                                <div className="relative w-6 h-6 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold border border-cyan-400/50 shadow-[0_0_10px_rgba(34,211,238,0.4)]">
                                  {task.assignee[0]}
                                </div>
                              </div>
                              <span className="text-xs text-cyan-300/80 font-mono">
                                {task.assignee}
                              </span>
                            </div>
                          )}
                          <div className="flex gap-1 mt-3 flex-wrap">
                            {stages.filter(s => s.id !== stage.id).map(targetStage => (
                              <button
                                key={targetStage.id}
                                onClick={() => moveTask(task.id, targetStage.id as any)}
                                className="px-2 py-1 text-xs bg-slate-700/50 border border-slate-600/50 text-slate-300 hover:bg-cyan-500/20 hover:border-cyan-500/50 hover:text-cyan-400 rounded transition-all duration-300 hover:shadow-[0_0_8px_rgba(34,211,238,0.3)] font-mono"
                                title={`Move to ${targetStage.name}`}
                              >
                                → {targetStage.name}
                              </button>
                            ))}
                          </div>
                          </Card>
                        </motion.div>
                      );
                    })}
                    
                    {stageTasks.length === 0 && (
                      <div className="text-center py-8 text-slate-600 text-sm font-mono">
                        <div className="text-2xl mb-2 opacity-30">∅</div>
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
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-lg blur opacity-20 group-hover:opacity-40 transition duration-300" />
          <Card className="relative p-6 bg-slate-900/80 border border-cyan-500/30 backdrop-blur-xl">
            <h3 className="text-lg font-black text-cyan-300 mb-4 uppercase tracking-wider flex items-center gap-2">
              <span className="text-cyan-400">⚡</span> Quick Add Task
            </h3>
          <div className="grid md:grid-cols-5 gap-3">
            <input
              type="text"
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              onKeyPress={(e) => e.key === 'Enter' && addTask()}
              placeholder="Task title..."
              className="md:col-span-2 px-4 py-2 bg-slate-800/60 border border-slate-600/50 rounded-lg text-cyan-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:shadow-[0_0_15px_rgba(34,211,238,0.2)] transition-all duration-300 font-mono"
            />
            <select 
              value={newTask.priority}
              onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as 'low' | 'medium' | 'high' })}
              className="px-4 py-2 bg-slate-800/60 border border-slate-600/50 rounded-lg text-cyan-100 focus:outline-none focus:border-cyan-500/50 focus:shadow-[0_0_15px_rgba(34,211,238,0.2)] transition-all duration-300 font-mono"
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
              className="px-4 py-2 bg-slate-800/60 border border-slate-600/50 rounded-lg text-cyan-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:shadow-[0_0_15px_rgba(34,211,238,0.2)] transition-all duration-300 font-mono"
            />
            <Button 
              onClick={addTask}
              disabled={!newTask.title.trim()}
              className="relative bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-bold hover:shadow-[0_0_20px_rgba(34,211,238,0.5)] disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300 border border-cyan-400/50"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Task
            </Button>
          </div>
          </Card>
        </div>

        {/* Team Members */}
        {teamMembers.length > 0 && (
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg blur opacity-20 group-hover:opacity-40 transition duration-300" />
            <Card className="relative p-6 bg-slate-900/80 border border-purple-500/30 backdrop-blur-xl">
              <h3 className="text-lg font-black text-purple-300 mb-4 uppercase tracking-wider flex items-center gap-2">
                <span className="text-purple-400">👥</span> Team Members
              </h3>
            <div className="flex gap-4 flex-wrap">
              {teamMembers.map((member, idx) => {
                const memberTasks = tasks.filter(t => t.assignee === member);
                const colors = ['blue', 'green', 'purple', 'pink', 'orange', 'cyan', 'indigo', 'teal'];
                const color = colors[idx % colors.length];
                
                return (
                  <div
                    key={member}
                    className="flex-1 min-w-[200px] relative group/member"
                  >
                    <div className={`absolute -inset-0.5 bg-gradient-to-r from-${color}-500 to-${color}-600 rounded-lg blur opacity-20 group-hover/member:opacity-40 transition duration-300`} />
                    <div className={`relative p-4 bg-slate-800/60 border border-${color}-500/40 rounded-lg backdrop-blur-sm hover:border-${color}-400/60 transition-all duration-300`}>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="relative">
                          <div className={`absolute -inset-1 bg-gradient-to-r from-${color}-500 to-${color}-600 rounded-full blur opacity-50`} />
                          <div className={`relative w-10 h-10 rounded-full bg-gradient-to-br from-${color}-500 to-${color}-600 flex items-center justify-center text-white font-bold border border-${color}-400/50 shadow-[0_0_15px_rgba(var(--tw-${color}-rgb),0.4)]`}>
                            {member![0]}
                          </div>
                        </div>
                        <div>
                          <p className={`font-bold text-${color}-300`}>{member}</p>
                          <p className="text-xs text-slate-400 font-mono">
                            {memberTasks.length} tasks
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            </Card>
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
      <TemplateFooter />
    </div>
  );
}
