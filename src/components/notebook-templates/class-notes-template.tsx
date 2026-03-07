'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Calendar, CheckSquare, Plus, Clock, Bell, Info, X, Trash2, Edit2, Search } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { TemplateFooter } from './template-footer';

interface Lecture {
  id: string;
  subject: string;
  title: string;
  date: string;
  duration: string;
  notes: string;
  keyPoints: string[];
  color: string;
}

interface Subject {
  id: string;
  name: string;
  color: string;
}

interface ClassNotesTemplateProps {
  title: string;
  notebookId?: string;
}

export function ClassNotesTemplate({ title, notebookId }: ClassNotesTemplateProps) {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [selectedLecture, setSelectedLecture] = useState<Lecture | null>(null);
  const [isAddingLecture, setIsAddingLecture] = useState(false);
  const [isEditingLecture, setIsEditingLecture] = useState(false);
  const [editingLectureId, setEditingLectureId] = useState<string | null>(null);
  const [isAddingSubject, setIsAddingSubject] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [newLecture, setNewLecture] = useState<Partial<Lecture>>({
    subject: '',
    title: '',
    date: new Date().toISOString().split('T')[0],
    duration: '',
    notes: '',
    keyPoints: [],
    color: 'blue'
  });
  const [newSubject, setNewSubject] = useState({ name: '', color: 'blue' });
  const [saving, setSaving] = useState(false);
  const [showDocumentation, setShowDocumentation] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const saveData = () => {
    if (!notebookId) return;
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    
    saveTimeoutRef.current = setTimeout(() => {
      setSaving(true);
      try {
        localStorage.setItem(`class-notes-${notebookId}`, JSON.stringify({ subjects, lectures }));
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
      const saved = localStorage.getItem(`class-notes-${notebookId}`);
      if (saved) {
        const data = JSON.parse(saved);
        setSubjects(data.subjects || []);
        setLectures(data.lectures || []);
      }
    } catch (error) {
      console.error("Failed to load:", error);
    }
  }, [notebookId]);

  useEffect(() => {
    saveData();
  }, [subjects, lectures]);

  const colors = ['blue', 'purple', 'green', 'rose', 'orange', 'cyan', 'pink', 'indigo', 'teal', 'amber'];

  const addSubject = () => {
    if (!newSubject.name.trim()) return;
    const subject: Subject = {
      id: Date.now().toString(),
      name: newSubject.name,
      color: newSubject.color
    };
    setSubjects([...subjects, subject]);
    setNewSubject({ name: '', color: 'blue' });
    setIsAddingSubject(false);
  };

  const addLecture = () => {
    if (!newLecture.subject || !newLecture.title?.trim()) return;
    
    const subject = subjects.find(s => s.id === newLecture.subject);
    const lecture: Lecture = {
      id: Date.now().toString(),
      subject: newLecture.subject,
      title: newLecture.title,
      date: newLecture.date || new Date().toISOString().split('T')[0],
      duration: newLecture.duration || '',
      notes: newLecture.notes || '',
      keyPoints: newLecture.keyPoints || [],
      color: subject?.color || 'blue'
    };

    setLectures([lecture, ...lectures]);
    setNewLecture({
      subject: '',
      title: '',
      date: new Date().toISOString().split('T')[0],
      duration: '',
      notes: '',
      keyPoints: [],
      color: 'blue'
    });
    setIsAddingLecture(false);
  };

  const deleteLecture = (id: string) => {
    setLectures(lectures.filter(l => l.id !== id));
    if (selectedLecture?.id === id) {
      setSelectedLecture(null);
    }
  };

  const startEditLecture = (lecture: Lecture) => {
    setEditingLectureId(lecture.id);
    setNewLecture({
      subject: lecture.subject,
      title: lecture.title,
      date: lecture.date,
      duration: lecture.duration,
      notes: lecture.notes,
      keyPoints: lecture.keyPoints,
      color: lecture.color
    });
    setSelectedLecture(null);
    setIsEditingLecture(true);
  };

  const updateLecture = () => {
    if (!editingLectureId || !newLecture.subject || !newLecture.title?.trim()) return;
    
    const subject = subjects.find(s => s.id === newLecture.subject);
    setLectures(lectures.map(lecture =>
      lecture.id === editingLectureId
        ? {
            ...lecture,
            subject: newLecture.subject!,
            title: newLecture.title!,
            date: newLecture.date || new Date().toISOString().split('T')[0],
            duration: newLecture.duration || '',
            notes: newLecture.notes || '',
            keyPoints: newLecture.keyPoints || [],
            color: subject?.color || 'blue'
          }
        : lecture
    ));
    setNewLecture({
      subject: '',
      title: '',
      date: new Date().toISOString().split('T')[0],
      duration: '',
      notes: '',
      keyPoints: [],
      color: 'blue'
    });
    setEditingLectureId(null);
    setIsEditingLecture(false);
  };

  const deleteSubject = (id: string) => {
    setSubjects(subjects.filter(s => s.id !== id));
    setLectures(lectures.filter(l => l.subject !== id));
  };

  const filteredLectures = lectures.filter(lecture => {
    const matchesSubject = !selectedSubject || lecture.subject === selectedSubject;
    const matchesSearch = !searchQuery || 
      lecture.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lecture.notes.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSubject && matchesSearch;
  });

  const getSubjectById = (id: string) => subjects.find(s => s.id === id);
  const getLectureCountBySubject = (subjectId: string) => lectures.filter(l => l.subject === subjectId).length;

  return (
    <div className="h-full min-h-0 flex flex-col bg-gradient-to-br from-purple-50 to-pink-50 dark:from-neutral-900 dark:to-neutral-800">
      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-8">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-4 mb-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              {title}
            </h1>
            <button
              onClick={() => setShowDocumentation(true)}
              className="p-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
              title="Documentation"
            >
              <Info className="h-4 w-4" />
            </button>
          </div>
          <p className="text-neutral-600 dark:text-neutral-400">Organize and access all your lecture notes</p>
        </div>

        {/* Subjects Grid */}
        <Card className="p-6 bg-white dark:bg-neutral-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white">Subjects</h3>
            <button
              onClick={() => setIsAddingSubject(true)}
              className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:opacity-90 transition-opacity text-sm"
            >
              <Plus className="h-4 w-4 inline mr-2" />
              Add Subject
            </button>
          </div>
          {subjects.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {subjects.map((subject) => (
                <Card 
                  key={subject.id} 
                  onClick={() => setSelectedSubject(selectedSubject === subject.id ? null : subject.id)}
                  className={`p-4 bg-gradient-to-br from-${subject.color}-100 to-${subject.color}-200 dark:from-${subject.color}-900/30 dark:to-${subject.color}-900/20 border-2 ${
                    selectedSubject === subject.id 
                      ? `border-${subject.color}-600` 
                      : `border-${subject.color}-300 dark:border-${subject.color}-800`
                  } cursor-pointer hover:scale-105 transition-transform relative`}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteSubject(subject.id);
                    }}
                    className="absolute top-2 right-2 p-1 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors"
                    title="Delete subject"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                  <BookOpen className={`h-6 w-6 text-${subject.color}-600 mb-2`} />
                  <h3 className="font-bold text-neutral-900 dark:text-white mb-1 text-sm">{subject.name}</h3>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400">
                    {getLectureCountBySubject(subject.id)} lectures
                  </p>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 mx-auto mb-3 text-neutral-400" />
              <p className="text-neutral-600 dark:text-neutral-400">No subjects yet</p>
              <p className="text-sm text-neutral-500 dark:text-neutral-500 mt-1">Add a subject to start organizing lectures</p>
            </div>
          )}
        </Card>

        {/* Lectures List */}
        <Card className="p-6 bg-white dark:bg-neutral-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
              {selectedSubject ? `${getSubjectById(selectedSubject)?.name} Lectures` : 'All Lectures'}
            </h3>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search lectures..."
                  className="pl-9 pr-4 py-2 bg-neutral-100 dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <button
                onClick={() => setIsAddingLecture(true)}
                disabled={subjects.length === 0}
                className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="h-4 w-4 inline mr-2" />
                Add Lecture
              </button>
            </div>
          </div>

          {filteredLectures.length > 0 ? (
            <div className="space-y-3">
              {filteredLectures.map((lecture) => {
                const subject = getSubjectById(lecture.subject);
                return (
                  <div 
                    key={lecture.id} 
                    onClick={() => setSelectedLecture(lecture)}
                    className={`p-4 bg-gradient-to-r from-${lecture.color}-50 to-${lecture.color}-100 dark:from-${lecture.color}-900/20 dark:to-${lecture.color}-900/10 rounded-lg border border-${lecture.color}-200 dark:border-${lecture.color}-800 cursor-pointer hover:shadow-md transition-shadow`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-2 py-0.5 bg-${lecture.color}-200 dark:bg-${lecture.color}-900/40 text-${lecture.color}-700 dark:text-${lecture.color}-400 rounded text-xs font-medium`}>
                            {subject?.name}
                          </span>
                          <span className="text-xs text-neutral-500 dark:text-neutral-400 flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(lecture.date).toLocaleDateString()}
                          </span>
                          {lecture.duration && (
                            <span className="text-xs text-neutral-500 dark:text-neutral-400 flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {lecture.duration}
                            </span>
                          )}
                        </div>
                        <h4 className="font-semibold text-neutral-900 dark:text-white mb-1">{lecture.title}</h4>
                        {lecture.notes && (
                          <p className="text-sm text-neutral-600 dark:text-neutral-400 line-clamp-2">
                            {lecture.notes}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteLecture(lecture.id);
                        }}
                        className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                        title="Delete lecture"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <BookOpen className="h-16 w-16 mx-auto mb-4 text-neutral-400" />
              <p className="text-neutral-600 dark:text-neutral-400">
                {subjects.length === 0 ? 'Add a subject first' : 'No lectures yet'}
              </p>
              <p className="text-sm text-neutral-500 dark:text-neutral-500 mt-2">
                {subjects.length === 0 ? 'Create subjects to organize your lectures' : 'Click "Add Lecture" to start taking notes'}
              </p>
            </div>
          )}
        </Card>

        {/* Add Subject Modal */}
        <AnimatePresence>
          {isAddingSubject && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              onClick={() => setIsAddingSubject(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={e => e.stopPropagation()}
                className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl w-full max-w-md p-6"
              >
                <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-4">Add Subject</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Subject Name</label>
                    <input
                      type="text"
                      value={newSubject.name}
                      onChange={(e) => setNewSubject({ ...newSubject, name: e.target.value })}
                      placeholder="e.g., Mathematics, Physics"
                      className="w-full px-4 py-2 bg-neutral-100 dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Color</label>
                    <div className="flex gap-2 flex-wrap">
                      {colors.map(color => (
                        <button
                          key={color}
                          onClick={() => setNewSubject({ ...newSubject, color })}
                          className={`w-8 h-8 rounded-lg bg-${color}-500 border-2 ${
                            newSubject.color === color ? 'border-neutral-900 dark:border-white scale-110' : 'border-transparent'
                          } transition-all`}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={addSubject}
                      disabled={!newSubject.name.trim()}
                      className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                    >
                      Add Subject
                    </button>
                    <button
                      onClick={() => {
                        setIsAddingSubject(false);
                        setNewSubject({ name: '', color: 'blue' });
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

        {/* Add/Edit Lecture Modal */}
        <AnimatePresence>
          {(isAddingLecture || isEditingLecture) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              onClick={() => {
                setIsAddingLecture(false);
                setIsEditingLecture(false);
                setEditingLectureId(null);
              }}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={e => e.stopPropagation()}
                className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl w-full max-w-5xl p-8 max-h-[90vh] overflow-y-auto"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl">
                    <BookOpen className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-neutral-900 dark:text-white">
                      {isEditingLecture ? 'Edit Lecture' : 'Add New Lecture'}
                    </h3>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">Record your class notes and save for a specific date</p>
                  </div>
                </div>
                <div className="space-y-6">
                  <div>
                    <label className="block text-base font-bold text-neutral-700 dark:text-neutral-300 mb-3 flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-purple-600" />
                      Subject *
                    </label>
                    <select
                      value={newLecture.subject}
                      onChange={(e) => setNewLecture({ ...newLecture, subject: e.target.value })}
                      className="w-full px-5 py-4 text-lg bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-2 border-purple-300 dark:border-purple-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all font-medium text-neutral-900 dark:text-white"
                    >
                      <option value="">Select a subject</option>
                      {subjects.map(subject => (
                        <option key={subject.id} value={subject.id}>{subject.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-base font-bold text-neutral-700 dark:text-neutral-300 mb-3 flex items-center gap-2">
                      <Edit2 className="h-5 w-5 text-pink-600" />
                      Lecture Title *
                    </label>
                    <input
                      type="text"
                      value={newLecture.title}
                      onChange={(e) => setNewLecture({ ...newLecture, title: e.target.value })}
                      placeholder="e.g., Introduction to Calculus"
                      className="w-full px-5 py-4 text-lg bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20 border-2 border-pink-300 dark:border-pink-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all font-medium text-neutral-900 dark:text-white"
                      autoFocus
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-base font-bold text-neutral-700 dark:text-neutral-300 mb-3 flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-blue-600" />
                        Lecture Date * 📅
                      </label>
                      <input
                        type="date"
                        value={newLecture.date}
                        onChange={(e) => setNewLecture({ ...newLecture, date: e.target.value })}
                        className="w-full px-5 py-4 text-lg bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-2 border-blue-300 dark:border-blue-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium text-neutral-900 dark:text-white"
                      />
                      <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">💡 Lecture will be saved for this date</p>
                    </div>
                    <div>
                      <label className="block text-base font-bold text-neutral-700 dark:text-neutral-300 mb-3 flex items-center gap-2">
                        <Clock className="h-5 w-5 text-cyan-600" />
                        Duration (optional)
                      </label>
                      <input
                        type="text"
                        value={newLecture.duration}
                        onChange={(e) => setNewLecture({ ...newLecture, duration: e.target.value })}
                        placeholder="e.g., 90 min"
                        className="w-full px-5 py-4 text-lg bg-gradient-to-r from-cyan-50 to-teal-50 dark:from-cyan-900/20 dark:to-teal-900/20 border-2 border-cyan-300 dark:border-cyan-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all font-medium text-neutral-900 dark:text-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-base font-bold text-neutral-700 dark:text-neutral-300 mb-3 flex items-center gap-2">
                      <Edit2 className="h-5 w-5 text-indigo-600" />
                      Lecture Notes
                    </label>
                    <textarea
                      value={newLecture.notes}
                      onChange={(e) => setNewLecture({ ...newLecture, notes: e.target.value })}
                      placeholder="Write your detailed lecture notes here... Take comprehensive notes during class."
                      rows={20}
                      className="w-full px-5 py-4 text-base bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-900/20 dark:via-purple-900/20 dark:to-pink-900/20 border-2 border-indigo-300 dark:border-indigo-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-neutral-900 dark:text-white leading-relaxed resize-y"
                    />
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2">
                      📝 {newLecture.notes?.length || 0} characters • Tip: Include key concepts, formulas, and examples
                    </p>
                  </div>
                  <div className="flex gap-4 pt-6 border-t border-neutral-200 dark:border-neutral-700">
                    <button
                      onClick={() => {
                        setIsAddingLecture(false);
                        setIsEditingLecture(false);
                        setEditingLectureId(null);
                        setNewLecture({
                          subject: '',
                          title: '',
                          date: new Date().toISOString().split('T')[0],
                          duration: '',
                          notes: '',
                          keyPoints: [],
                          color: 'blue'
                        });
                      }}
                      className="flex-1 px-6 py-3 bg-neutral-200 dark:bg-neutral-700 text-neutral-900 dark:text-white rounded-xl hover:bg-neutral-300 dark:hover:bg-neutral-600 transition-colors font-semibold text-lg"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={isEditingLecture ? updateLecture : addLecture}
                      disabled={!newLecture.subject || !newLecture.title?.trim()}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl hover:shadow-lg hover:shadow-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-bold text-lg flex items-center justify-center gap-2"
                    >
                      <Plus className="h-5 w-5" />
                      {isEditingLecture ? 'Update Lecture' : 'Save Lecture'}
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* View Lecture Modal */}
        <AnimatePresence>
          {selectedLecture && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              onClick={() => setSelectedLecture(null)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={e => e.stopPropagation()}
                className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col"
              >
                <div className={`sticky top-0 bg-gradient-to-r from-${selectedLecture.color}-500 to-${selectedLecture.color}-600 p-6 flex items-center justify-between z-10`}>
                  <div>
                    <p className="text-sm text-white/80 mb-1">{getSubjectById(selectedLecture.subject)?.name}</p>
                    <h2 className="text-2xl font-bold text-white">{selectedLecture.title}</h2>
                    <div className="flex items-center gap-4 mt-2 text-sm text-white/90">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(selectedLecture.date).toLocaleDateString()}
                      </span>
                      {selectedLecture.duration && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {selectedLecture.duration}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => startEditLecture(selectedLecture)}
                      className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                      title="Edit lecture"
                    >
                      <Edit2 className="h-5 w-5 text-white" />
                    </button>
                    <button
                      onClick={() => setSelectedLecture(null)}
                      className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                      <X className="h-5 w-5 text-white" />
                    </button>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-6">
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-3">Lecture Notes</h3>
                  <div className="prose dark:prose-invert max-w-none">
                    <p className="text-neutral-700 dark:text-neutral-300 whitespace-pre-wrap">
                      {selectedLecture.notes || 'No notes available for this lecture.'}
                    </p>
                  </div>
                </div>
                <div className="sticky bottom-0 bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-700 p-6">
                  <button
                    onClick={() => setSelectedLecture(null)}
                    className="w-full px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg hover:opacity-90 transition-opacity font-medium"
                  >
                    Close
                  </button>
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
              <div className="sticky top-0 bg-gradient-to-r from-purple-500 to-pink-600 p-6 flex items-center justify-between z-10">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Class Notes Guide</h2>
                    <p className="text-purple-100 text-sm">Organize your academic life</p>
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
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-3">📚 Overview</h3>
                  <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed">
                    Class Notes helps you organize your academic semester. Track subjects with lecture counts and assignments, manage upcoming deadlines with priority levels, view weekly class schedules, and stay on top of your coursework with a centralized academic dashboard.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-3">✨ Key Features</h3>
                  <div className="grid gap-3">
                    <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                      <h4 className="font-semibold text-purple-900 dark:text-purple-400 mb-1">📖 Subject Organization</h4>
                      <p className="text-sm text-purple-800 dark:text-purple-300">Track all subjects with lecture counts and assignment numbers.</p>
                    </div>
                    <div className="bg-pink-50 dark:bg-pink-900/20 border border-pink-200 dark:border-pink-800 rounded-lg p-4">
                      <h4 className="font-semibold text-pink-900 dark:text-pink-400 mb-1">📅 Assignment Tracking</h4>
                      <p className="text-sm text-pink-800 dark:text-pink-300">Monitor upcoming assignments with due dates and priority levels.</p>
                    </div>
                    <div className="bg-fuchsia-50 dark:bg-fuchsia-900/20 border border-fuchsia-200 dark:border-fuchsia-800 rounded-lg p-4">
                      <h4 className="font-semibold text-fuchsia-900 dark:text-fuchsia-400 mb-1">🗓️ Weekly Schedule</h4>
                      <p className="text-sm text-fuchsia-800 dark:text-fuchsia-300">View your class schedule organized by day of the week.</p>
                    </div>
                    <div className="bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800 rounded-lg p-4">
                      <h4 className="font-semibold text-violet-900 dark:text-violet-400 mb-1">🎨 Color Coding</h4>
                      <p className="text-sm text-violet-800 dark:text-violet-300">Each subject has a unique color for easy identification.</p>
                    </div>
                    <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-lg p-4">
                      <h4 className="font-semibold text-rose-900 dark:text-rose-400 mb-1">⚡ Quick Access</h4>
                      <p className="text-sm text-rose-800 dark:text-rose-300">Click on subjects for quick access to notes and materials.</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-3">🚀 How to Use</h3>
                  <div className="space-y-3">
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-500 text-white flex items-center justify-center text-sm font-bold">1</div>
                      <div>
                        <p className="font-semibold text-neutral-900 dark:text-white">Add Subjects</p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">Create subject cards for each course you're taking this semester.</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-500 text-white flex items-center justify-center text-sm font-bold">2</div>
                      <div>
                        <p className="font-semibold text-neutral-900 dark:text-white">Track Lectures</p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">Update lecture counts as you attend classes throughout the semester.</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-500 text-white flex items-center justify-center text-sm font-bold">3</div>
                      <div>
                        <p className="font-semibold text-neutral-900 dark:text-white">Add Assignments</p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">Log upcoming assignments with due dates and priority levels.</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-500 text-white flex items-center justify-center text-sm font-bold">4</div>
                      <div>
                        <p className="font-semibold text-neutral-900 dark:text-white">Set Priorities</p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">Mark assignments as high, medium, or low priority for better planning.</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-500 text-white flex items-center justify-center text-sm font-bold">5</div>
                      <div>
                        <p className="font-semibold text-neutral-900 dark:text-white">View Schedule</p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">Check weekly schedule to see which classes you have each day.</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-500 text-white flex items-center justify-center text-sm font-bold">6</div>
                      <div>
                        <p className="font-semibold text-neutral-900 dark:text-white">Stay Organized</p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">Use color coding to quickly identify subjects at a glance.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-3">💡 Pro Tips</h3>
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4 space-y-2">
                    <p className="text-sm text-neutral-700 dark:text-neutral-300">✅ <strong>Update regularly</strong> - Keep lecture counts and assignments current</p>
                    <p className="text-sm text-neutral-700 dark:text-neutral-300">✅ <strong>Prioritize wisely</strong> - Use high priority for urgent deadlines</p>
                    <p className="text-sm text-neutral-700 dark:text-neutral-300">✅ <strong>Review weekly</strong> - Check schedule and assignments every Sunday</p>
                    <p className="text-sm text-neutral-700 dark:text-neutral-300">✅ <strong>Color code</strong> - Assign consistent colors to related subjects</p>
                    <p className="text-sm text-neutral-700 dark:text-neutral-300">✅ <strong>Plan ahead</strong> - Add assignments as soon as they're announced</p>
                    <p className="text-sm text-neutral-700 dark:text-neutral-300">✅ <strong>Track progress</strong> - Monitor lecture attendance to stay on track</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-3">💾 Data Storage</h3>
                  <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-4">
                    <p className="text-sm text-emerald-800 dark:text-emerald-300 leading-relaxed">
                      <strong>Your class data is automatically saved locally.</strong> All subjects, assignments, schedules, and notes are stored in your browser's local storage. Look for the "Saving..." indicator to confirm storage.
                    </p>
                  </div>
                </div>
              </div>

              <div className="sticky bottom-0 bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-700 p-6">
                <button
                  onClick={() => setShowDocumentation(false)}
                  className="w-full px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg hover:opacity-90 transition-opacity font-medium"
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
