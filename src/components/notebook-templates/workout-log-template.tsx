'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dumbbell, Plus, TrendingUp, Calendar, Activity, Info, Trash2, X, ChevronLeft, ChevronRight, Edit2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { TemplateFooter } from './template-footer';

interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  weight: string;
  category: string;
  notes?: string;
}

interface DayWorkout {
  date: string;
  exercises: Exercise[];
  completed: boolean;
  duration?: number;
}

interface WorkoutLogTemplateProps {
  title: string;
  notebookId?: string;
}

export function WorkoutLogTemplate({ title, notebookId }: WorkoutLogTemplateProps) {
  const [weekWorkouts, setWeekWorkouts] = useState<{ [date: string]: DayWorkout }>({});
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isAddingExercise, setIsAddingExercise] = useState(false);
  const [newExercise, setNewExercise] = useState<Partial<Exercise>>({
    name: '',
    sets: 3,
    reps: 10,
    weight: '',
    category: 'Chest'
  });
  const [saving, setSaving] = useState(false);
  const [showDocumentation, setShowDocumentation] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const saveData = () => {
    if (!notebookId) return;
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    
    saveTimeoutRef.current = setTimeout(() => {
      setSaving(true);
      try {
        localStorage.setItem(`workout-log-${notebookId}`, JSON.stringify({ weekWorkouts }));
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
      const saved = localStorage.getItem(`workout-log-${notebookId}`);
      if (saved) {
        const data = JSON.parse(saved);
        setWeekWorkouts(data.weekWorkouts || {});
      }
    } catch (error) {
      console.error("Failed to load:", error);
    }
  }, [notebookId]);

  useEffect(() => {
    saveData();
  }, [weekWorkouts]);

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

  const categories = ['Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core', 'Cardio', 'Full Body'];

  const addExercise = () => {
    if (!selectedDate || !newExercise.name?.trim()) return;
    
    const exercise: Exercise = {
      id: Date.now().toString(),
      name: newExercise.name,
      sets: newExercise.sets || 3,
      reps: newExercise.reps || 10,
      weight: newExercise.weight || '',
      category: newExercise.category || 'Chest',
      notes: newExercise.notes || ''
    };

    setWeekWorkouts(prev => {
      const dayWorkout = prev[selectedDate] || { date: selectedDate, exercises: [], completed: false };
      return {
        ...prev,
        [selectedDate]: {
          ...dayWorkout,
          exercises: [...dayWorkout.exercises, exercise]
        }
      };
    });

    setNewExercise({ name: '', sets: 3, reps: 10, weight: '', category: 'Chest', notes: '' });
    setIsAddingExercise(false);
  };

  const deleteExercise = (date: string, exerciseId: string) => {
    setWeekWorkouts(prev => {
      const dayWorkout = prev[date];
      if (!dayWorkout) return prev;
      
      return {
        ...prev,
        [date]: {
          ...dayWorkout,
          exercises: dayWorkout.exercises.filter(e => e.id !== exerciseId)
        }
      };
    });
  };

  const toggleDayCompleted = (date: string) => {
    setWeekWorkouts(prev => {
      const dayWorkout = prev[date] || { date, exercises: [], completed: false };
      return {
        ...prev,
        [date]: {
          ...dayWorkout,
          completed: !dayWorkout.completed
        }
      };
    });
  };

  const totalWorkoutsThisWeek = days.filter(day => weekWorkouts[day.date]?.completed).length;
  const allWorkouts = Object.values(weekWorkouts);
  const totalWorkoutDays = allWorkouts.filter(w => w.completed).length;
  const totalExercises = allWorkouts.reduce((sum, w) => sum + w.exercises.length, 0);

  return (
    <div className="h-full min-h-0 flex flex-col bg-gradient-to-br from-red-50 to-orange-50 dark:from-neutral-900 dark:to-neutral-800">
      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-8">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-4 mb-2">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                {title}
              </h1>
              <button
              onClick={() => setShowDocumentation(true)}
              className="p-2 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-lg hover:bg-orange-200 dark:hover:bg-orange-900/50 transition-colors"
              title="Documentation"
            >
              <Info className="h-4 w-4" />
            </button>
          </div>
          <p className="text-neutral-600 dark:text-neutral-400">Track your fitness journey</p>
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
                <Calendar className="h-5 w-5 text-orange-600" />
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
                className="px-4 py-2 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-lg hover:bg-orange-200 dark:hover:bg-orange-900/50 transition-colors text-sm font-medium"
              >
                Jump to Current Week
              </button>
            </div>
          )}
        </Card>

        {/* Stats */}
        <div className="grid sm:grid-cols-3 gap-4">
          <Card className="p-4 bg-white dark:bg-neutral-800 border-2 border-orange-200 dark:border-orange-800">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                <Dumbbell className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">This Week</p>
                <p className="text-2xl font-bold text-neutral-900 dark:text-white">{totalWorkoutsThisWeek} days</p>
              </div>
            </div>
          </Card>
          <Card className="p-4 bg-white dark:bg-neutral-800 border-2 border-red-200 dark:border-red-800">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <Calendar className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">Total Days</p>
                <p className="text-2xl font-bold text-neutral-900 dark:text-white">{totalWorkoutDays}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4 bg-white dark:bg-neutral-800 border-2 border-amber-200 dark:border-amber-800">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                <TrendingUp className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">Total Exercises</p>
                <p className="text-2xl font-bold text-neutral-900 dark:text-white">{totalExercises}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Weekly Workout Grid */}
        <div className="grid grid-cols-7 gap-2">
          {days.map((day) => {
            const dayWorkout = weekWorkouts[day.date];
            const hasExercises = dayWorkout && dayWorkout.exercises.length > 0;
            const isCompleted = dayWorkout?.completed;
            
            return (
              <Card
                key={day.date}
                onClick={() => setSelectedDate(day.date)}
                className={`p-3 cursor-pointer transition-all ${
                  selectedDate === day.date
                    ? 'ring-2 ring-orange-500 bg-orange-50 dark:bg-orange-900/30'
                    : 'hover:bg-neutral-50 dark:hover:bg-neutral-700'
                } ${
                  day.isToday ? 'border-2 border-orange-500' : ''
                }`}
              >
                <div className="text-center">
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">{day.label}</p>
                  <p className={`text-lg font-bold ${
                    day.isToday ? 'text-orange-600' : 'text-neutral-900 dark:text-white'
                  }`}>{day.dayOfMonth}</p>
                  {hasExercises && (
                    <div className="mt-2">
                      <div className="text-xs text-neutral-600 dark:text-neutral-400">
                        {dayWorkout.exercises.length} ex
                      </div>
                      {isCompleted && (
                        <div className="mt-1 w-full h-1 bg-green-500 rounded-full" />
                      )}
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>

        {/* Selected Day Workout */}
        {selectedDate && (
          <Card className="p-6 bg-white dark:bg-neutral-800">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
                  {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  {weekWorkouts[selectedDate]?.exercises.length || 0} exercises planned
                </p>
              </div>
              <div className="flex gap-2">
                {weekWorkouts[selectedDate]?.exercises.length > 0 && (
                  <button
                    onClick={() => toggleDayCompleted(selectedDate)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      weekWorkouts[selectedDate]?.completed
                        ? 'bg-green-500 text-white hover:bg-green-600'
                        : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-900 dark:text-white hover:bg-neutral-300 dark:hover:bg-neutral-600'
                    }`}
                  >
                    {weekWorkouts[selectedDate]?.completed ? '✓ Completed' : 'Mark Complete'}
                  </button>
                )}
                <button
                  onClick={() => setIsAddingExercise(true)}
                  className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:opacity-90 transition-opacity"
                >
                  <Plus className="h-4 w-4 inline mr-2" />
                  Add Exercise
                </button>
              </div>
            </div>

            {weekWorkouts[selectedDate]?.exercises.length > 0 ? (
              <div className="space-y-4">
                {weekWorkouts[selectedDate].exercises.map((exercise) => (
                  <div key={exercise.id} className="p-4 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-neutral-900 dark:text-white">{exercise.name}</h4>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">{exercise.category}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {exercise.weight && (
                          <span className="px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 rounded-full text-sm font-medium">
                            {exercise.weight}
                          </span>
                        )}
                        <button
                          onClick={() => deleteExercise(selectedDate, exercise.id)}
                          className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                          title="Delete exercise"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="flex-1 p-3 bg-white dark:bg-neutral-800 rounded-lg text-center">
                        <p className="text-xs text-neutral-600 dark:text-neutral-400">Sets</p>
                        <p className="text-xl font-bold text-neutral-900 dark:text-white">{exercise.sets}</p>
                      </div>
                      <div className="flex-1 p-3 bg-white dark:bg-neutral-800 rounded-lg text-center">
                        <p className="text-xs text-neutral-600 dark:text-neutral-400">Reps</p>
                        <p className="text-xl font-bold text-neutral-900 dark:text-white">{exercise.reps}</p>
                      </div>
                      <div className="flex-1 p-3 bg-white dark:bg-neutral-800 rounded-lg text-center">
                        <p className="text-xs text-neutral-600 dark:text-neutral-400">Volume</p>
                        <p className="text-xl font-bold text-neutral-900 dark:text-white">
                          {exercise.sets * exercise.reps}
                        </p>
                      </div>
                    </div>
                    {exercise.notes && (
                      <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-400 italic">{exercise.notes}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Dumbbell className="h-16 w-16 mx-auto mb-4 text-neutral-400" />
                <p className="text-neutral-600 dark:text-neutral-400">No exercises planned for this day</p>
                <p className="text-sm text-neutral-500 dark:text-neutral-500 mt-2">Click "Add Exercise" to start planning</p>
              </div>
            )}
          </Card>
        )}

        {/* Add Exercise Modal */}
        <AnimatePresence>
          {isAddingExercise && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              onClick={() => setIsAddingExercise(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={e => e.stopPropagation()}
                className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl w-full max-w-2xl p-6"
              >
                <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-4">Add Exercise</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Exercise Name</label>
                    <input
                      type="text"
                      value={newExercise.name || ''}
                      onChange={(e) => setNewExercise({ ...newExercise, name: e.target.value })}
                      placeholder="e.g., Bench Press"
                      className="w-full px-4 py-2 bg-neutral-100 dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Sets</label>
                      <input
                        type="number"
                        value={newExercise.sets || 3}
                        onChange={(e) => setNewExercise({ ...newExercise, sets: parseInt(e.target.value) || 3 })}
                        min="1"
                        className="w-full px-4 py-2 bg-neutral-100 dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Reps</label>
                      <input
                        type="number"
                        value={newExercise.reps || 10}
                        onChange={(e) => setNewExercise({ ...newExercise, reps: parseInt(e.target.value) || 10 })}
                        min="1"
                        className="w-full px-4 py-2 bg-neutral-100 dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Weight</label>
                      <input
                        type="text"
                        value={newExercise.weight || ''}
                        onChange={(e) => setNewExercise({ ...newExercise, weight: e.target.value })}
                        placeholder="e.g., 185 lbs"
                        className="w-full px-4 py-2 bg-neutral-100 dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Category</label>
                      <select
                        value={newExercise.category || 'Chest'}
                        onChange={(e) => setNewExercise({ ...newExercise, category: e.target.value })}
                        className="w-full px-4 py-2 bg-neutral-100 dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      >
                        {categories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Notes (optional)</label>
                    <textarea
                      value={newExercise.notes || ''}
                      onChange={(e) => setNewExercise({ ...newExercise, notes: e.target.value })}
                      placeholder="Add notes about form, technique, etc."
                      rows={2}
                      className="w-full px-4 py-2 bg-neutral-100 dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={addExercise}
                      disabled={!newExercise.name?.trim()}
                      className="flex-1 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                    >
                      Add Exercise
                    </button>
                    <button
                      onClick={() => {
                        setIsAddingExercise(false);
                        setNewExercise({ name: '', sets: 3, reps: 10, weight: '', category: 'Chest', notes: '' });
                      }}
                      className="flex-1 px-4 py-2 bg-neutral-200 dark:bg-neutral-700 text-neutral-900 dark:text-white rounded-lg hover:bg-neutral-300 dark:hover:bg-neutral-600 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

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
              <div className="sticky top-0 bg-gradient-to-r from-orange-500 to-red-600 p-6 flex items-center justify-between z-10">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <Dumbbell className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Workout Log Guide</h2>
                    <p className="text-orange-100 text-sm">Track your fitness progress</p>
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
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-3">💪 Overview</h3>
                  <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed">
                    Workout Log is a comprehensive fitness tracking tool. Record exercises with sets, reps, and weights, track workout frequency, monitor personal records, calculate total volume, and analyze your fitness progress over time with detailed statistics.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-3">✨ Key Features</h3>
                  <div className="grid gap-3">
                    <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
                      <h4 className="font-semibold text-orange-900 dark:text-orange-400 mb-1">📝 Exercise Tracking</h4>
                      <p className="text-sm text-orange-800 dark:text-orange-300">Log exercises with sets, reps, weight, and muscle group categories.</p>
                    </div>
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                      <h4 className="font-semibold text-red-900 dark:text-red-400 mb-1">📊 Volume Calculation</h4>
                      <p className="text-sm text-red-800 dark:text-red-300">Automatically calculate total volume (sets × reps) for each exercise.</p>
                    </div>
                    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                      <h4 className="font-semibold text-amber-900 dark:text-amber-400 mb-1">🏆 PR Tracking</h4>
                      <p className="text-sm text-amber-800 dark:text-amber-300">Monitor personal records and celebrate new achievements.</p>
                    </div>
                    <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-lg p-4">
                      <h4 className="font-semibold text-rose-900 dark:text-rose-400 mb-1">📅 Workout History</h4>
                      <p className="text-sm text-rose-800 dark:text-rose-300">Track workout frequency and total training days.</p>
                    </div>
                    <div className="bg-pink-50 dark:bg-pink-900/20 border border-pink-200 dark:border-pink-800 rounded-lg p-4">
                      <h4 className="font-semibold text-pink-900 dark:text-pink-400 mb-1">🎯 Workout Plans</h4>
                      <p className="text-sm text-pink-800 dark:text-pink-300">Organize workouts by split (Push, Pull, Legs, etc.).</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-3">🚀 How to Use</h3>
                  <div className="space-y-3">
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-500 text-white flex items-center justify-center text-sm font-bold">1</div>
                      <div>
                        <p className="font-semibold text-neutral-900 dark:text-white">Add Exercises</p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">Click "Add Exercise" to log a new exercise with details.</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-500 text-white flex items-center justify-center text-sm font-bold">2</div>
                      <div>
                        <p className="font-semibold text-neutral-900 dark:text-white">Enter Details</p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">Fill in exercise name, sets, reps, weight, and muscle group category.</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-500 text-white flex items-center justify-center text-sm font-bold">3</div>
                      <div>
                        <p className="font-semibold text-neutral-900 dark:text-white">Track Volume</p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">View calculated volume (sets × reps) for each exercise automatically.</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-500 text-white flex items-center justify-center text-sm font-bold">4</div>
                      <div>
                        <p className="font-semibold text-neutral-900 dark:text-white">Monitor Stats</p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">Check stats cards for weekly workouts, total days, PRs, and average duration.</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-500 text-white flex items-center justify-center text-sm font-bold">5</div>
                      <div>
                        <p className="font-semibold text-neutral-900 dark:text-white">Use Workout Plans</p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">Organize exercises by workout split (Push, Pull, Legs).</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-500 text-white flex items-center justify-center text-sm font-bold">6</div>
                      <div>
                        <p className="font-semibold text-neutral-900 dark:text-white">Track Progress</p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">Compare weights and volume over time to measure strength gains.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-3">💡 Pro Tips</h3>
                  <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4 space-y-2">
                    <p className="text-sm text-neutral-700 dark:text-neutral-300">✅ <strong>Progressive overload</strong> - Gradually increase weight or reps each week</p>
                    <p className="text-sm text-neutral-700 dark:text-neutral-300">✅ <strong>Log immediately</strong> - Record exercises right after completing them</p>
                    <p className="text-sm text-neutral-700 dark:text-neutral-300">✅ <strong>Track rest days</strong> - Recovery is as important as training</p>
                    <p className="text-sm text-neutral-700 dark:text-neutral-300">✅ <strong>Note form</strong> - Use description field to track technique improvements</p>
                    <p className="text-sm text-neutral-700 dark:text-neutral-300">✅ <strong>Celebrate PRs</strong> - Acknowledge personal records to stay motivated</p>
                    <p className="text-sm text-neutral-700 dark:text-neutral-300">✅ <strong>Consistent timing</strong> - Track average workout duration for planning</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-3">💾 Data Storage</h3>
                  <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-4">
                    <p className="text-sm text-emerald-800 dark:text-emerald-300 leading-relaxed">
                      <strong>Your workout data is automatically saved locally.</strong> All exercises, sets, reps, weights, and workout history are stored in your browser's local storage. Look for the "Saving..." indicator to confirm storage.
                    </p>
                  </div>
                </div>
              </div>

              <div className="sticky bottom-0 bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-700 p-6">
                <button
                  onClick={() => setShowDocumentation(false)}
                  className="w-full px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg hover:opacity-90 transition-opacity font-medium"
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
