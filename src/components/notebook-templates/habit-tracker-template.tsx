'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Calendar, TrendingUp, Target, Info, Plus, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { TemplateFooter } from './template-footer';

interface Habit {
  id: string;
  name: string;
  streak: number;
  goal: number;
  color: string;
  completedDays: { [date: string]: boolean };
}

interface HabitTrackerTemplateProps {
  title: string;
  notebookId?: string;
}

export function HabitTrackerTemplate({ title, notebookId }: HabitTrackerTemplateProps) {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [saving, setSaving] = useState(false);
  const [showDocumentation, setShowDocumentation] = useState(false);
  const [isAddingHabit, setIsAddingHabit] = useState(false);
  const [newHabitName, setNewHabitName] = useState('');
  const [newHabitGoal, setNewHabitGoal] = useState(30);
  const [newHabitColor, setNewHabitColor] = useState('emerald');
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const saveData = () => {
    if (!notebookId) return;
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    
    saveTimeoutRef.current = setTimeout(() => {
      setSaving(true);
      try {
        localStorage.setItem(`habit-tracker-${notebookId}`, JSON.stringify({ habits }));
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
      const saved = localStorage.getItem(`habit-tracker-${notebookId}`);
      if (saved) {
        const data = JSON.parse(saved);
        setHabits(data.habits || []);
      }
    } catch (error) {
      console.error("Failed to load:", error);
    }
  }, [notebookId]);

  useEffect(() => {
    saveData();
  }, [habits]);

  const getDateString = (daysAgo: number) => {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    return date.toISOString().split('T')[0];
  };

  const getWeekDays = (weekOffset: number) => {
    const days = [];
    const today = new Date();
    const currentDay = today.getDay();
    const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay;
    
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + mondayOffset + (weekOffset * 7) + i);
      days.push({
        label: date.toLocaleDateString('en-US', { weekday: 'short' }),
        date: date.toISOString().split('T')[0],
        dayOfMonth: date.getDate(),
        isToday: date.toISOString().split('T')[0] === today.toISOString().split('T')[0]
      });
    }
    return days;
  };

  const getWeekRange = (weekOffset: number) => {
    const today = new Date();
    const currentDay = today.getDay();
    const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay;
    
    const monday = new Date();
    monday.setDate(monday.getDate() + mondayOffset + (weekOffset * 7));
    
    const sunday = new Date(monday);
    sunday.setDate(sunday.getDate() + 6);
    
    const formatDate = (date: Date) => {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };
    
    return `${formatDate(monday)} - ${formatDate(sunday)}`;
  };

  const days = getWeekDays(currentWeekOffset);
  const weekRange = getWeekRange(currentWeekOffset);
  const isCurrentWeek = currentWeekOffset === 0;

  const addHabit = () => {
    if (!newHabitName.trim()) return;
    const newHabit: Habit = {
      id: Date.now().toString(),
      name: newHabitName,
      streak: 0,
      goal: newHabitGoal,
      color: newHabitColor,
      completedDays: {}
    };
    setHabits([...habits, newHabit]);
    setNewHabitName('');
    setNewHabitGoal(30);
    setNewHabitColor('emerald');
    setIsAddingHabit(false);
  };

  const deleteHabit = (id: string) => {
    setHabits(habits.filter(h => h.id !== id));
  };

  const toggleDay = (habitId: string, date: string) => {
    setHabits(habits.map(habit => {
      if (habit.id !== habitId) return habit;
      
      const completedDays = { ...habit.completedDays };
      completedDays[date] = !completedDays[date];
      
      // Calculate streak
      let streak = 0;
      for (let i = 0; i < 365; i++) {
        const checkDate = getDateString(i);
        if (completedDays[checkDate]) {
          streak++;
        } else {
          break;
        }
      }
      
      return { ...habit, completedDays, streak };
    }));
  };

  const longestStreak = habits.length > 0 ? Math.max(...habits.map(h => h.streak)) : 0;
  const thisWeekCompleted = habits.reduce((total, habit) => {
    return total + days.filter(day => habit.completedDays[day.date]).length;
  }, 0);
  const thisWeekTotal = habits.length * 7;

  const colors = ['emerald', 'blue', 'purple', 'cyan', 'pink', 'orange', 'indigo', 'teal'];

  return (
    <div className="h-full min-h-0 flex flex-col bg-gradient-to-br from-green-50 to-emerald-50 dark:from-neutral-900 dark:to-neutral-800">
      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-8">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-4 mb-2">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                {title}
              </h1>
              <button
                onClick={() => setShowDocumentation(true)}
                className="p-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg hover:bg-emerald-200 dark:hover:bg-emerald-900/50 transition-colors"
                title="Documentation"
              >
                <Info className="h-4 w-4" />
              </button>
            </div>
            <p className="text-neutral-600 dark:text-neutral-400">Build better habits, one day at a time</p>
          </div>

        {/* Week Navigator */}
        <Card className="p-4 bg-white dark:bg-neutral-800">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setCurrentWeekOffset(currentWeekOffset - 1)}
              className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors"
              title="Previous week"
            >
              <ChevronLeft className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
            </button>
            
            <div className="text-center">
              <div className="flex items-center gap-2 justify-center">
                <Calendar className="h-5 w-5 text-emerald-600" />
                <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
                  {isCurrentWeek ? 'This Week' : `Week of ${weekRange.split(' - ')[0]}`}
                </h3>
              </div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">{weekRange}</p>
            </div>
            
            <button
              onClick={() => setCurrentWeekOffset(currentWeekOffset + 1)}
              className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors"
              title="Next week"
            >
              <ChevronRight className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
            </button>
          </div>
          
          {!isCurrentWeek && (
            <div className="mt-3 text-center">
              <button
                onClick={() => setCurrentWeekOffset(0)}
                className="px-4 py-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg hover:bg-emerald-200 dark:hover:bg-emerald-900/50 transition-colors text-sm font-medium"
              >
                Jump to Current Week
              </button>
            </div>
          )}
        </Card>

        {/* Stats Cards */}
        <div className="grid sm:grid-cols-3 gap-4">
          <Card className="p-4 bg-white dark:bg-neutral-800 border-2 border-emerald-200 dark:border-emerald-800">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                <Target className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">Active Habits</p>
                <p className="text-2xl font-bold text-neutral-900 dark:text-white">{habits.length}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4 bg-white dark:bg-neutral-800 border-2 border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">Longest Streak</p>
                <p className="text-2xl font-bold text-neutral-900 dark:text-white">{longestStreak} days</p>
              </div>
            </div>
          </Card>
          <Card className="p-4 bg-white dark:bg-neutral-800 border-2 border-purple-200 dark:border-purple-800">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Calendar className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">This Week</p>
                <p className="text-2xl font-bold text-neutral-900 dark:text-white">{thisWeekCompleted}/{thisWeekTotal}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Habit Tracker */}
        {habits.length > 0 ? (
          <Card className="p-6 bg-white dark:bg-neutral-800">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
                {isCurrentWeek ? "This Week's Progress" : "Week Progress"}
              </h3>
              <div className="text-sm text-neutral-600 dark:text-neutral-400">
                {days.filter(day => habits.some(h => h.completedDays[day.date])).length} / {habits.length * 7} completed
              </div>
            </div>
            <div className="space-y-6">
              {habits.map((habit) => (
                <div key={habit.id} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-neutral-900 dark:text-white">{habit.name}</h4>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        🔥 {habit.streak} day streak • Goal: {habit.goal} days
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                        {Math.round((habit.streak / habit.goal) * 100)}%
                      </p>
                      <button
                        onClick={() => deleteHabit(habit.id)}
                        className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                        title="Delete habit"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Week Grid */}
                  <div className="flex gap-2">
                    {days.map((day) => {
                      const isCompleted = habit.completedDays[day.date];
                      return (
                        <div key={day.date} className="flex-1">
                          <div className="text-center mb-1">
                            <p className="text-xs text-neutral-500 dark:text-neutral-400">{day.label}</p>
                            <p className={`text-xs font-medium ${
                              day.isToday 
                                ? 'text-emerald-600 dark:text-emerald-400' 
                                : 'text-neutral-400 dark:text-neutral-500'
                            }`}>{day.dayOfMonth}</p>
                          </div>
                          <button
                            onClick={() => toggleDay(habit.id, day.date)}
                            className={`w-full h-12 rounded-lg border-2 transition-all relative ${
                              isCompleted
                                ? `bg-${habit.color}-100 dark:bg-${habit.color}-900/30 border-${habit.color}-500 hover:bg-${habit.color}-200`
                                : 'bg-neutral-100 dark:bg-neutral-700 border-neutral-300 dark:border-neutral-600 hover:bg-neutral-200'
                            } ${
                              day.isToday ? 'ring-2 ring-emerald-500 ring-offset-2' : ''
                            }`}
                          >
                            {isCompleted ? (
                              <Check className={`h-6 w-6 mx-auto text-${habit.color}-600`} />
                            ) : (
                              <X className="h-6 w-6 mx-auto text-neutral-400" />
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r from-${habit.color}-500 to-${habit.color}-600 transition-all`}
                      style={{ width: `${Math.min((habit.streak / habit.goal) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ) : (
          <Card className="p-12 bg-white dark:bg-neutral-800 text-center">
            <Target className="h-16 w-16 mx-auto mb-4 text-neutral-400" />
            <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">No Habits Yet</h3>
            <p className="text-neutral-600 dark:text-neutral-400 mb-6">Start tracking your first habit to build better routines</p>
          </Card>
        )}

        {/* Add New Habit */}
        {!isAddingHabit ? (
          <Card 
            onClick={() => setIsAddingHabit(true)}
            className="p-6 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-center cursor-pointer hover:opacity-90 transition-opacity"
          >
            <Plus className="h-12 w-12 mx-auto mb-3" />
            <h3 className="text-xl font-bold mb-2">Add New Habit</h3>
            <p className="text-emerald-100">Start building a new positive habit today</p>
          </Card>
        ) : (
          <Card className="p-6 bg-white dark:bg-neutral-800">
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-4">Create New Habit</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Habit Name</label>
                <input
                  type="text"
                  value={newHabitName}
                  onChange={(e) => setNewHabitName(e.target.value)}
                  placeholder="e.g., Morning Exercise"
                  className="w-full px-4 py-2 bg-neutral-100 dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Goal (days)</label>
                <input
                  type="number"
                  value={newHabitGoal}
                  onChange={(e) => setNewHabitGoal(parseInt(e.target.value) || 30)}
                  min="1"
                  className="w-full px-4 py-2 bg-neutral-100 dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Color</label>
                <div className="flex gap-2 flex-wrap">
                  {colors.map(color => (
                    <button
                      key={color}
                      onClick={() => setNewHabitColor(color)}
                      className={`w-10 h-10 rounded-lg bg-${color}-500 border-2 ${
                        newHabitColor === color ? 'border-neutral-900 dark:border-white scale-110' : 'border-transparent'
                      } transition-all`}
                    />
                  ))}
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={addHabit}
                  disabled={!newHabitName.trim()}
                  className="flex-1 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Add Habit
                </button>
                <button
                  onClick={() => {
                    setIsAddingHabit(false);
                    setNewHabitName('');
                    setNewHabitGoal(30);
                    setNewHabitColor('emerald');
                  }}
                  className="flex-1 px-4 py-2 bg-neutral-200 dark:bg-neutral-700 text-neutral-900 dark:text-white rounded-lg hover:bg-neutral-300 dark:hover:bg-neutral-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
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
              <div className="sticky top-0 bg-gradient-to-r from-emerald-500 to-teal-600 p-6 flex items-center justify-between z-10">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Habit Tracker Guide</h2>
                    <p className="text-emerald-100 text-sm">Build better habits daily</p>
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
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-3">🎯 Overview</h3>
                  <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed">
                    Habit Tracker helps you build positive habits through daily tracking and streak monitoring. Track multiple habits, visualize weekly progress, maintain streaks, set goals, and stay motivated with progress indicators and achievement tracking.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-3">✨ Key Features</h3>
                  <div className="grid gap-3">
                    <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-4">
                      <h4 className="font-semibold text-emerald-900 dark:text-emerald-400 mb-1">🔥 Streak Tracking</h4>
                      <p className="text-sm text-emerald-800 dark:text-emerald-300">Monitor consecutive days of habit completion with streak counters.</p>
                    </div>
                    <div className="bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 rounded-lg p-4">
                      <h4 className="font-semibold text-teal-900 dark:text-teal-400 mb-1">📅 Weekly View</h4>
                      <p className="text-sm text-teal-800 dark:text-teal-300">See your progress across the week with visual check marks.</p>
                    </div>
                    <div className="bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-200 dark:border-cyan-800 rounded-lg p-4">
                      <h4 className="font-semibold text-cyan-900 dark:text-cyan-400 mb-1">🎨 Color Coding</h4>
                      <p className="text-sm text-cyan-800 dark:text-cyan-300">Each habit has a unique color for easy identification.</p>
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-900 dark:text-blue-400 mb-1">📊 Progress Bars</h4>
                      <p className="text-sm text-blue-800 dark:text-blue-300">Visual progress bars show completion percentage toward goals.</p>
                    </div>
                    <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-4">
                      <h4 className="font-semibold text-indigo-900 dark:text-indigo-400 mb-1">🏆 Goal Setting</h4>
                      <p className="text-sm text-indigo-800 dark:text-indigo-300">Set target days for each habit and track progress.</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-3">🚀 How to Use</h3>
                  <div className="space-y-3">
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-sm font-bold">1</div>
                      <div>
                        <p className="font-semibold text-neutral-900 dark:text-white">Add Habits</p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">Click "Add New Habit" to create habits you want to track.</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-sm font-bold">2</div>
                      <div>
                        <p className="font-semibold text-neutral-900 dark:text-white">Set Goals</p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">Define target days for each habit (e.g., 30 days, 21 days).</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-sm font-bold">3</div>
                      <div>
                        <p className="font-semibold text-neutral-900 dark:text-white">Check Off Days</p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">Click day boxes to mark habit completion for each day of the week.</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-sm font-bold">4</div>
                      <div>
                        <p className="font-semibold text-neutral-900 dark:text-white">Build Streaks</p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">Complete habits consecutively to build and maintain streaks.</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-sm font-bold">5</div>
                      <div>
                        <p className="font-semibold text-neutral-900 dark:text-white">Monitor Progress</p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">Watch progress bars fill up as you work toward your goals.</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-sm font-bold">6</div>
                      <div>
                        <p className="font-semibold text-neutral-900 dark:text-white">Review Stats</p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">Check stats cards for active habits, longest streak, and weekly totals.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-3">💡 Pro Tips</h3>
                  <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-4 space-y-2">
                    <p className="text-sm text-neutral-700 dark:text-neutral-300">✅ <strong>Start small</strong> - Begin with 2-3 habits to avoid overwhelming yourself</p>
                    <p className="text-sm text-neutral-700 dark:text-neutral-300">✅ <strong>Be consistent</strong> - Track daily, even if you miss a habit completion</p>
                    <p className="text-sm text-neutral-700 dark:text-neutral-300">✅ <strong>Don't break the chain</strong> - Focus on maintaining streaks for motivation</p>
                    <p className="text-sm text-neutral-700 dark:text-neutral-300">✅ <strong>Realistic goals</strong> - Set achievable targets like 21 or 30 days</p>
                    <p className="text-sm text-neutral-700 dark:text-neutral-300">✅ <strong>Morning check-in</strong> - Review habits each morning to set daily intentions</p>
                    <p className="text-sm text-neutral-700 dark:text-neutral-300">✅ <strong>Celebrate wins</strong> - Acknowledge when you reach streak milestones</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-3">💾 Data Storage</h3>
                  <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-4">
                    <p className="text-sm text-emerald-800 dark:text-emerald-300 leading-relaxed">
                      <strong>Your habit data is automatically saved locally.</strong> All habits, streaks, completion history, and goals are stored in your browser's local storage. Look for the "Saving..." indicator to confirm storage.
                    </p>
                  </div>
                </div>
              </div>

              <div className="sticky bottom-0 bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-700 p-6">
                <button
                  onClick={() => setShowDocumentation(false)}
                  className="w-full px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg hover:opacity-90 transition-opacity font-medium"
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
