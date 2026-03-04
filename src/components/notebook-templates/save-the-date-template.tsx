'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Plus, Bell, Trash2, X, Info, BellRing, AlertCircle, CalendarDays, Clock, MapPin, Check } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { TemplateHeader } from './template-header';
import { TemplateFooter } from './template-footer';
import { Button } from '@/components/ui/button';

interface SaveTheDateTemplateProps {
  title: string;
  notebookId?: string;
}

interface Event {
  id: number;
  title: string;
  date: string;
  time: string;
  location?: string;
  reminder: boolean;
  daysUntil: number;
  category: string;
}

export function SaveTheDateTemplate({ title, notebookId }: SaveTheDateTemplateProps) {
  const [events, setEvents] = useState<Event[]>([]);
  const [newEvent, setNewEvent] = useState({ title: '', date: '', time: '', location: '', category: 'Personal' });
  const [upcomingAlerts, setUpcomingAlerts] = useState<Event[]>([]);
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; eventId: number | null; eventTitle: string }>({ show: false, eventId: null, eventTitle: '' });
  const [showDocumentation, setShowDocumentation] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchDate, setSearchDate] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const saveTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const saveData = () => {
    if (!notebookId) return;
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    
    saveTimeoutRef.current = setTimeout(() => {
      setSaving(true);
      try {
        localStorage.setItem(`save-the-date-${notebookId}`, JSON.stringify({ events }));
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
      const saved = localStorage.getItem(`save-the-date-${notebookId}`);
      if (saved) {
        const data = JSON.parse(saved);
        setEvents(data.events || []);
      }
    } catch (error) {
      console.error("Failed to load:", error);
    }
  }, [notebookId]);

  useEffect(() => {
    saveData();
  }, [events]);

  // Calculate days until event
  const calculateDaysUntil = (eventDate: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const event = new Date(eventDate);
    event.setHours(0, 0, 0, 0);
    const diffTime = event.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Update days until for all events
  useEffect(() => {
    const updateDaysUntil = () => {
      setEvents(prevEvents => 
        prevEvents.map(event => ({
          ...event,
          daysUntil: calculateDaysUntil(event.date)
        }))
      );
    };
    
    updateDaysUntil();
    const interval = setInterval(updateDaysUntil, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  // Check for upcoming events with reminders
  useEffect(() => {
    const alerts = events.filter(e => e.reminder && e.daysUntil >= 0 && e.daysUntil <= 3);
    setUpcomingAlerts(alerts);
  }, [events]);

  const handleAddEvent = () => {
    if (!newEvent.title || !newEvent.date || !newEvent.time) return;
    
    const event: Event = {
      id: Date.now(),
      title: newEvent.title,
      date: new Date(newEvent.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      time: newEvent.time,
      location: newEvent.location,
      reminder: true,
      daysUntil: calculateDaysUntil(newEvent.date),
      category: newEvent.category
    };
    
    setEvents([...events, event]);
    setNewEvent({ title: '', date: '', time: '', location: '', category: 'Personal' });
  };

  const toggleReminder = (id: number) => {
    setEvents(events.map(e => e.id === id ? { ...e, reminder: !e.reminder } : e));
  };

  const deleteEvent = (id: number, eventTitle: string) => {
    setDeleteConfirm({ show: true, eventId: id, eventTitle });
  };

  const confirmDelete = () => {
    if (deleteConfirm.eventId) {
      setEvents(events.filter(e => e.id !== deleteConfirm.eventId));
    }
    setDeleteConfirm({ show: false, eventId: null, eventTitle: '' });
  };

  const cancelDelete = () => {
    setDeleteConfirm({ show: false, eventId: null, eventTitle: '' });
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Work': return 'blue';
      case 'Personal': return 'purple';
      case 'Health': return 'green';
      default: return 'neutral';
    }
  };

  // Filter events based on search date and category
  const filteredEvents = events.filter(event => {
    const matchesDate = !searchDate || event.date.includes(new Date(searchDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }));
    const matchesCategory = filterCategory === 'All' || event.category === filterCategory;
    return matchesDate && matchesCategory;
  });

  // Quick date selection helper
  const setQuickDate = (daysFromNow: number) => {
    const date = new Date();
    date.setDate(date.getDate() + daysFromNow);
    const formattedDate = date.toISOString().split('T')[0];
    setNewEvent({ ...newEvent, date: formattedDate });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-rose-50 to-pink-50 dark:from-neutral-900 dark:to-neutral-800">
      <TemplateHeader title={title} />
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-6xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
              {title}
            </h1>
            <button
              onClick={() => setShowDocumentation(true)}
              className="p-2 bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-lg hover:bg-rose-200 dark:hover:bg-rose-900/50 transition-colors"
              title="Know More"
            >
              <Info className="h-5 w-5" />
            </button>
          </div>
          <p className="text-neutral-600 dark:text-neutral-400">Never miss an important date</p>
        </div>

        {/* Reminder Alerts */}
        {upcomingAlerts.length > 0 && (
          <Card className="p-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white border-2 border-amber-600">
            <div className="flex items-center gap-3">
              <BellRing className="h-6 w-6 animate-pulse" />
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-1">Upcoming Events!</h3>
                <p className="text-sm opacity-90">
                  You have {upcomingAlerts.length} event{upcomingAlerts.length > 1 ? 's' : ''} coming up in the next 3 days:
                </p>
                <div className="mt-2 space-y-1">
                  {upcomingAlerts.map(alert => (
                    <div key={alert.id} className="text-sm flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      <span><strong>{alert.title}</strong> - {alert.daysUntil === 0 ? 'Today' : alert.daysUntil === 1 ? 'Tomorrow' : `in ${alert.daysUntil} days`}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        )}

        <div className="grid sm:grid-cols-3 gap-4">
          <Card className="p-4 bg-gradient-to-br from-rose-500 to-pink-500 text-white">
            <p className="text-sm opacity-90 mb-1">Total Events</p>
            <p className="text-3xl font-bold">{events.length}</p>
          </Card>
          <Card className="p-4 bg-gradient-to-br from-amber-500 to-orange-500 text-white">
            <p className="text-sm opacity-90 mb-1">This Week</p>
            <p className="text-3xl font-bold">{events.filter(e => e.daysUntil <= 7).length}</p>
          </Card>
          <Card className="p-4 bg-gradient-to-br from-purple-500 to-pink-500 text-white">
            <p className="text-sm opacity-90 mb-1">Reminders Set</p>
            <p className="text-3xl font-bold">{events.filter(e => e.reminder).length}</p>
          </Card>
        </div>

        <Card className="p-6 bg-white dark:bg-neutral-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white">Add New Event</h3>
            <div className="flex gap-2">
              <button onClick={() => setQuickDate(0)} className="px-3 py-1 text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors">Today</button>
              <button onClick={() => setQuickDate(1)} className="px-3 py-1 text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-lg hover:bg-amber-200 dark:hover:bg-amber-900/50 transition-colors">Tomorrow</button>
              <button onClick={() => setQuickDate(7)} className="px-3 py-1 text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors">Next Week</button>
            </div>
          </div>
          <div className="space-y-3">
            <div className="grid md:grid-cols-2 gap-3">
              <input 
                type="text" 
                placeholder="Event title..." 
                value={newEvent.title}
                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                className="px-4 py-2 bg-neutral-100 dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500" 
              />
              <select
                value={newEvent.category}
                onChange={(e) => setNewEvent({ ...newEvent, category: e.target.value })}
                className="px-4 py-2 bg-neutral-100 dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
              >
                <option value="Personal">Personal</option>
                <option value="Work">Work</option>
                <option value="Health">Health</option>
                <option value="Social">Social</option>
              </select>
            </div>
            <div className="grid md:grid-cols-4 gap-3">
              <input 
                type="date" 
                value={newEvent.date}
                onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                className="px-4 py-2 bg-neutral-100 dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500" 
              />
              <input 
                type="time" 
                value={newEvent.time}
                onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                className="px-4 py-2 bg-neutral-100 dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500" 
              />
              <input 
                type="text" 
                placeholder="Location (optional)" 
                value={newEvent.location}
                onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                className="px-4 py-2 bg-neutral-100 dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500" 
              />
              <Button 
                onClick={handleAddEvent}
                className="bg-gradient-to-r from-rose-500 to-pink-500 text-white hover:opacity-90"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Event
              </Button>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-white dark:bg-neutral-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white">Search & Filter Events</h3>
          </div>
          <div className="grid md:grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-2">Search by Date</label>
              <input 
                type="date" 
                value={searchDate}
                onChange={(e) => setSearchDate(e.target.value)}
                className="w-full px-4 py-2 bg-neutral-100 dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-2">Filter by Category</label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full px-4 py-2 bg-neutral-100 dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
              >
                <option value="All">All Categories</option>
                <option value="Personal">Personal</option>
                <option value="Work">Work</option>
                <option value="Health">Health</option>
                <option value="Social">Social</option>
              </select>
            </div>
            <div className="flex items-end">
              <Button 
                onClick={() => { setSearchDate(''); setFilterCategory('All'); }}
                className="w-full bg-neutral-500 text-white hover:bg-neutral-600"
              >
                Clear Filters
              </Button>
            </div>
          </div>
          {(searchDate || filterCategory !== 'All') && (
            <div className="mt-3 p-3 bg-rose-50 dark:bg-rose-900/20 rounded-lg border border-rose-200 dark:border-rose-800">
              <p className="text-sm text-rose-700 dark:text-rose-400">
                Showing {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''}
                {searchDate && ` on ${new Date(searchDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`}
                {filterCategory !== 'All' && ` in ${filterCategory} category`}
              </p>
            </div>
          )}
        </Card>

        {events.length === 0 ? (
          <Card className="p-12 bg-white dark:bg-neutral-800 text-center">
            <CalendarDays className="h-16 w-16 text-neutral-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">No Events Yet</h3>
            <p className="text-neutral-600 dark:text-neutral-400">Add your first event to start tracking important dates</p>
          </Card>
        ) : filteredEvents.length === 0 ? (
          <Card className="p-12 bg-white dark:bg-neutral-800 text-center">
            <CalendarDays className="h-16 w-16 text-neutral-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">No Events Found</h3>
            <p className="text-neutral-600 dark:text-neutral-400">No events match your search criteria. Try adjusting your filters.</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredEvents.sort((a, b) => a.daysUntil - b.daysUntil).map(event => {
              const color = getCategoryColor(event.category);
              const isPast = event.daysUntil < 0;
              return (
                <Card key={event.id} className={`p-5 bg-gradient-to-r from-${color}-50 to-${color}-100 dark:from-${color}-900/20 dark:to-${color}-900/10 border-2 border-${color}-200 dark:border-${color}-800 ${isPast ? 'opacity-60' : ''}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-neutral-900 dark:text-white">{event.title}</h3>
                        <button
                          onClick={() => toggleReminder(event.id)}
                          className={`p-1 rounded transition-colors ${
                            event.reminder 
                              ? 'text-amber-600 hover:bg-amber-100 dark:hover:bg-amber-900/30' 
                              : 'text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700'
                          }`}
                          title={event.reminder ? 'Reminder ON' : 'Reminder OFF'}
                        >
                          <Bell className={`h-4 w-4 ${event.reminder ? 'fill-amber-600' : ''}`} />
                        </button>
                        <span className={`px-2 py-1 bg-${color}-200 dark:bg-${color}-900/40 text-${color}-700 dark:text-${color}-400 rounded text-xs font-medium`}>
                          {event.category}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-neutral-600 dark:text-neutral-400">
                        <div className="flex items-center gap-1">
                          <CalendarDays className="h-4 w-4" />
                          {event.date}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {event.time}
                        </div>
                        {event.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {event.location}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className={`px-4 py-2 rounded-lg ${
                          isPast ? 'bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400' :
                          event.daysUntil === 0 ? 'bg-red-500 text-white animate-pulse' :
                          event.daysUntil <= 3 ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' :
                          event.daysUntil <= 7 ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400' :
                          'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                        }`}>
                          <p className="text-2xl font-bold">
                            {isPast ? 'Past' : event.daysUntil === 0 ? 'Today!' : event.daysUntil}
                          </p>
                          {!isPast && event.daysUntil > 0 && <p className="text-xs">days left</p>}
                        </div>
                      </div>
                      <button
                        onClick={() => deleteEvent(event.id, event.title)}
                        className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                        title="Delete event"
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* Documentation Modal */}
        {showDocumentation && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <Card className="max-w-4xl w-full max-h-[90vh] overflow-y-auto bg-white dark:bg-neutral-800">
              <div className="sticky top-0 bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 p-6 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                    <CalendarDays className="h-6 w-6 text-rose-600" />
                    Save the Date - Template Documentation
                  </h2>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">Complete guide to features and capabilities</p>
                </div>
                <button
                  onClick={() => setShowDocumentation(false)}
                  className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Overview */}
                <section>
                  <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-3">📋 Overview</h3>
                  <p className="text-neutral-700 dark:text-neutral-300">
                    Save the Date is a comprehensive event management template designed to help you track important dates, deadlines, and appointments. 
                    With smart reminder notifications and automatic countdown tracking, you'll never miss an important event again.
                  </p>
                </section>

                {/* Key Features */}
                <section>
                  <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-4">✨ Key Features</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 bg-rose-50 dark:bg-rose-900/20 rounded-lg border border-rose-200 dark:border-rose-800">
                      <div className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-rose-600 mt-0.5" />
                        <div>
                          <h4 className="font-bold text-neutral-900 dark:text-white mb-1">Smart Reminders</h4>
                          <p className="text-sm text-neutral-700 dark:text-neutral-300">Visual alert banner shows events coming up in the next 3 days with animated notifications</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                      <div className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-amber-600 mt-0.5" />
                        <div>
                          <h4 className="font-bold text-neutral-900 dark:text-white mb-1">Automatic Countdown</h4>
                          <p className="text-sm text-neutral-700 dark:text-neutral-300">Real-time countdown shows days remaining until each event, updates automatically</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                      <div className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-purple-600 mt-0.5" />
                        <div>
                          <h4 className="font-bold text-neutral-900 dark:text-white mb-1">Category Organization</h4>
                          <p className="text-sm text-neutral-700 dark:text-neutral-300">Organize events by Personal, Work, Health, or Social categories with color coding</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <div className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div>
                          <h4 className="font-bold text-neutral-900 dark:text-white mb-1">Toggle Reminders</h4>
                          <p className="text-sm text-neutral-700 dark:text-neutral-300">Click the bell icon to turn reminders on/off for individual events</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                      <div className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-green-600 mt-0.5" />
                        <div>
                          <h4 className="font-bold text-neutral-900 dark:text-white mb-1">Color-Coded Urgency</h4>
                          <p className="text-sm text-neutral-700 dark:text-neutral-300">Red for urgent (0-3 days), amber for soon (4-7 days), green for future events</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 bg-pink-50 dark:bg-pink-900/20 rounded-lg border border-pink-200 dark:border-pink-800">
                      <div className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-pink-600 mt-0.5" />
                        <div>
                          <h4 className="font-bold text-neutral-900 dark:text-white mb-1">Event Details</h4>
                          <p className="text-sm text-neutral-700 dark:text-neutral-300">Track date, time, location, and category for each event</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 bg-cyan-50 dark:bg-cyan-900/20 rounded-lg border border-cyan-200 dark:border-cyan-800">
                      <div className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-cyan-600 mt-0.5" />
                        <div>
                          <h4 className="font-bold text-neutral-900 dark:text-white mb-1">Auto-Sort Events</h4>
                          <p className="text-sm text-neutral-700 dark:text-neutral-300">Events automatically sorted by date with upcoming events shown first</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                      <div className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-red-600 mt-0.5" />
                        <div>
                          <h4 className="font-bold text-neutral-900 dark:text-white mb-1">Delete Events</h4>
                          <p className="text-sm text-neutral-700 dark:text-neutral-300">Remove past or cancelled events with beautiful confirmation dialog</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* How to Use */}
                <section>
                  <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-4">🚀 How to Use</h3>
                  <div className="space-y-3">
                    <div className="p-4 bg-neutral-50 dark:bg-neutral-700/50 rounded-lg">
                      <h4 className="font-bold text-neutral-900 dark:text-white mb-2">1. Adding a New Event</h4>
                      <p className="text-sm text-neutral-700 dark:text-neutral-300">Fill in the event title, select a category, choose the date and time, optionally add a location, then click "Add Event". The event will appear in your list with an automatic countdown.</p>
                    </div>
                    <div className="p-4 bg-neutral-50 dark:bg-neutral-700/50 rounded-lg">
                      <h4 className="font-bold text-neutral-900 dark:text-white mb-2">2. Understanding the Reminder Alert</h4>
                      <p className="text-sm text-neutral-700 dark:text-neutral-300">When events are 3 days or less away, an orange alert banner appears at the top showing all upcoming events. This helps you stay aware of imminent deadlines and appointments.</p>
                    </div>
                    <div className="p-4 bg-neutral-50 dark:bg-neutral-700/50 rounded-lg">
                      <h4 className="font-bold text-neutral-900 dark:text-white mb-2">3. Managing Reminders</h4>
                      <p className="text-sm text-neutral-700 dark:text-neutral-300">Click the bell icon next to any event to toggle reminders on/off. When ON, the bell is filled and amber-colored. When OFF, it's gray and outlined. Only events with reminders ON will appear in the alert banner.</p>
                    </div>
                    <div className="p-4 bg-neutral-50 dark:bg-neutral-700/50 rounded-lg">
                      <h4 className="font-bold text-neutral-900 dark:text-white mb-2">4. Reading the Countdown</h4>
                      <p className="text-sm text-neutral-700 dark:text-neutral-300">Each event shows a countdown badge. Red with pulse animation means TODAY. Red means 1-3 days. Amber means 4-7 days. Green means more than a week away. Past events show "Past" in gray.</p>
                    </div>
                    <div className="p-4 bg-neutral-50 dark:bg-neutral-700/50 rounded-lg">
                      <h4 className="font-bold text-neutral-900 dark:text-white mb-2">5. Deleting Events</h4>
                      <p className="text-sm text-neutral-700 dark:text-neutral-300">Click the trash icon on any event to delete it. A confirmation dialog will appear showing the event title to prevent accidental deletions.</p>
                    </div>
                  </div>
                </section>

                {/* Use Cases */}
                <section>
                  <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-4">💡 Use Cases</h3>
                  <ul className="space-y-2 text-neutral-700 dark:text-neutral-300">
                    <li className="flex items-start gap-2">
                      <span className="text-rose-600 mt-1">•</span>
                      <span><strong>Work Deadlines:</strong> Track project milestones, submission dates, and important meetings</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-rose-600 mt-1">•</span>
                      <span><strong>Personal Events:</strong> Remember birthdays, anniversaries, and social gatherings</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-rose-600 mt-1">•</span>
                      <span><strong>Health Appointments:</strong> Never miss doctor visits, dental checkups, or medication refills</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-rose-600 mt-1">•</span>
                      <span><strong>Social Activities:</strong> Keep track of concerts, events, and plans with friends</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-rose-600 mt-1">•</span>
                      <span><strong>Travel Planning:</strong> Track flight dates, hotel bookings, and trip itineraries</span>
                    </li>
                  </ul>
                </section>

                {/* Tips */}
                <section className="bg-gradient-to-r from-rose-50 to-pink-50 dark:from-rose-900/20 dark:to-pink-900/20 p-6 rounded-lg border border-rose-200 dark:border-rose-800">
                  <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-4">💎 Pro Tips</h3>
                  <ul className="space-y-2 text-neutral-700 dark:text-neutral-300">
                    <li className="flex items-start gap-2">
                      <span className="text-rose-600 mt-1">✓</span>
                      <span>Turn on reminders for critical events to ensure you see the alert banner</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-rose-600 mt-1">✓</span>
                      <span>Use categories to color-code and organize different types of events</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-rose-600 mt-1">✓</span>
                      <span>Add locations to events so you know where to go at a glance</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-rose-600 mt-1">✓</span>
                      <span>Check the "This Week" stat to see how many events are coming up soon</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-rose-600 mt-1">✓</span>
                      <span>Delete past events regularly to keep your list clean and focused on the future</span>
                    </li>
                  </ul>
                </section>
              </div>

              <div className="sticky bottom-0 bg-white dark:bg-neutral-800 border-t border-neutral-200 dark:border-neutral-700 p-6">
                <Button
                  onClick={() => setShowDocumentation(false)}
                  className="w-full bg-gradient-to-r from-rose-500 to-pink-500 text-white hover:opacity-90"
                >
                  Got It!
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirm.show && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <Card className="max-w-md w-full bg-white dark:bg-neutral-800 p-6">
              <div className="text-center">
                <div className="mx-auto w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
                  <Trash2 className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">Delete Event?</h3>
                <p className="text-neutral-600 dark:text-neutral-400 mb-2">
                  Are you sure you want to delete:
                </p>
                <p className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
                  "{deleteConfirm.eventTitle}"
                </p>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-6">
                  This action cannot be undone.
                </p>
                <div className="flex gap-3">
                  <Button
                    onClick={cancelDelete}
                    className="flex-1 bg-neutral-200 dark:bg-neutral-700 text-neutral-900 dark:text-white hover:bg-neutral-300 dark:hover:bg-neutral-600"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={confirmDelete}
                    className="flex-1 bg-red-600 text-white hover:bg-red-700"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Event
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}
        </div>
      </div>
      <TemplateFooter />
    </div>
  );
}
