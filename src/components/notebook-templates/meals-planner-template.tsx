'use client';

import React, { useState, useEffect, useRef } from 'react';
import { UtensilsCrossed, Plus, Users, Edit2, Trash2, Info, X, Check, Save, Calendar, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface MealsPlannerTemplateProps {
  title: string;
  notebookId?: string;
}

interface FoodOrder {
  personName: string;
  foodItem: string;
  dietaryRestrictions?: string;
  notes?: string;
}

interface MealEvent {
  id: string;
  eventName: string;
  date: string;
  location: string;
  attendees: FoodOrder[];
  createdAt: string;
}

export function MealsPlannerTemplate({ title, notebookId }: MealsPlannerTemplateProps) {
  const [events, setEvents] = useState<MealEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [isAddingPerson, setIsAddingPerson] = useState(false);
  const [newEvent, setNewEvent] = useState({ eventName: '', date: '', location: '' });
  const [newPerson, setNewPerson] = useState({ personName: '', foodItem: '', dietaryRestrictions: '', notes: '' });
  const [editingPersonIndex, setEditingPersonIndex] = useState<number | null>(null);
  const [showDocumentation, setShowDocumentation] = useState(false);
  const [saving, setSaving] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const saveData = () => {
    if (!notebookId) return;
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    
    saveTimeoutRef.current = setTimeout(() => {
      setSaving(true);
      try {
        localStorage.setItem(`meals-planner-${notebookId}`, JSON.stringify({ events }));
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
      const saved = localStorage.getItem(`meals-planner-${notebookId}`);
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

  const addEvent = () => {
    if (!newEvent.eventName.trim() || !newEvent.date || !newEvent.location.trim()) return;
    const event: MealEvent = {
      id: Date.now().toString(),
      eventName: newEvent.eventName,
      date: newEvent.date,
      location: newEvent.location,
      attendees: [],
      createdAt: new Date().toISOString()
    };
    setEvents([event, ...events]);
    setSelectedEvent(event.id);
    setNewEvent({ eventName: '', date: '', location: '' });
    setIsAddingEvent(false);
  };

  const deleteEvent = (id: string) => {
    setEvents(events.filter(e => e.id !== id));
    if (selectedEvent === id) {
      setSelectedEvent(null);
    }
  };

  const addPerson = () => {
    if (!selectedEvent || !newPerson.personName.trim() || !newPerson.foodItem.trim()) return;
    const person: FoodOrder = {
      personName: newPerson.personName,
      foodItem: newPerson.foodItem,
      dietaryRestrictions: newPerson.dietaryRestrictions || undefined,
      notes: newPerson.notes || undefined
    };
    setEvents(events.map(e => 
      e.id === selectedEvent
        ? { ...e, attendees: [...e.attendees, person] }
        : e
    ));
    setNewPerson({ personName: '', foodItem: '', dietaryRestrictions: '', notes: '' });
    setIsAddingPerson(false);
  };

  const startEditPerson = (index: number) => {
    if (!currentEvent) return;
    const person = currentEvent.attendees[index];
    setNewPerson({
      personName: person.personName,
      foodItem: person.foodItem,
      dietaryRestrictions: person.dietaryRestrictions || '',
      notes: person.notes || ''
    });
    setEditingPersonIndex(index);
    setIsAddingPerson(true);
  };

  const updatePerson = () => {
    if (!selectedEvent || editingPersonIndex === null || !newPerson.personName.trim() || !newPerson.foodItem.trim()) return;
    setEvents(events.map(e => 
      e.id === selectedEvent
        ? {
            ...e,
            attendees: e.attendees.map((person, idx) =>
              idx === editingPersonIndex
                ? {
                    personName: newPerson.personName,
                    foodItem: newPerson.foodItem,
                    dietaryRestrictions: newPerson.dietaryRestrictions || undefined,
                    notes: newPerson.notes || undefined
                  }
                : person
            )
          }
        : e
    ));
    setNewPerson({ personName: '', foodItem: '', dietaryRestrictions: '', notes: '' });
    setEditingPersonIndex(null);
    setIsAddingPerson(false);
  };

  const deletePerson = (index: number) => {
    if (!selectedEvent) return;
    setEvents(events.map(e => 
      e.id === selectedEvent
        ? { ...e, attendees: e.attendees.filter((_, idx) => idx !== index) }
        : e
    ));
  };

  const currentEvent = events.find(e => e.id === selectedEvent);
  const attendees = currentEvent?.attendees || [];
  const totalPeople = attendees.length;
  const specialRequests = attendees.filter(a => a.dietaryRestrictions || a.notes).length;

  // Generate food summary with quantities
  const generateFoodSummary = () => {
    if (!currentEvent) return [];
    const foodMap = new Map<string, { count: number; people: string[] }>();
    
    currentEvent.attendees.forEach(person => {
      const foodItem = person.foodItem.trim().toLowerCase();
      if (foodMap.has(foodItem)) {
        const existing = foodMap.get(foodItem)!;
        existing.count++;
        existing.people.push(person.personName);
      } else {
        foodMap.set(foodItem, { count: 1, people: [person.personName] });
      }
    });

    return Array.from(foodMap.entries())
      .map(([food, data]) => ({
        food: food.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
        count: data.count,
        people: data.people
      }))
      .sort((a, b) => b.count - a.count);
  };

  const foodSummary = generateFoodSummary();

  return (
    <div className="h-full bg-gradient-to-br from-orange-50 to-amber-50 dark:from-neutral-900 dark:to-neutral-800 p-8 overflow-y-auto">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent mb-2">
            {title}
          </h1>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => setShowDocumentation(true)}
              className="p-2 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-lg hover:bg-orange-200 dark:hover:bg-orange-900/50 transition-colors"
              title="Know More"
            >
              <Info className="h-5 w-5" />
            </button>
          </div>
          <p className="text-neutral-600 dark:text-neutral-400">Group meal order collection</p>
        </div>

        {/* Stats */}
        <div className="grid sm:grid-cols-3 gap-4">
          <Card className="p-4 bg-gradient-to-br from-orange-500 to-amber-500 text-white">
            <Calendar className="h-8 w-8 mb-2 opacity-80" />
            <p className="text-sm opacity-90 mb-1">Total Events</p>
            <p className="text-3xl font-bold">{events.length}</p>
          </Card>
          <Card className="p-4 bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
            <Users className="h-8 w-8 mb-2 opacity-80" />
            <p className="text-sm opacity-90 mb-1">Total Attendees</p>
            <p className="text-3xl font-bold">{totalPeople}</p>
          </Card>
          <Card className="p-4 bg-gradient-to-br from-green-500 to-emerald-500 text-white">
            <Check className="h-8 w-8 mb-2 opacity-80" />
            <p className="text-sm opacity-90 mb-1">Special Requests</p>
            <p className="text-3xl font-bold">{specialRequests}</p>
          </Card>
        </div>

        {/* Events List */}
        <Card className="p-6 bg-white dark:bg-neutral-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white">Meal Events</h3>
            <Button
              onClick={() => setIsAddingEvent(true)}
              className="bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:opacity-90"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Event
            </Button>
          </div>

          {events.length === 0 ? (
            <div className="text-center py-12">
              <UtensilsCrossed className="h-16 w-16 text-neutral-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">No Events Yet</h3>
              <p className="text-neutral-600 dark:text-neutral-400">Create your first meal event to start organizing</p>
            </div>
          ) : (
            <div className="space-y-3">
              {events.map((event) => (
                <Card 
                  key={event.id} 
                  onClick={() => setSelectedEvent(event.id)}
                  className={`p-4 cursor-pointer transition-all ${
                    selectedEvent === event.id
                      ? 'bg-gradient-to-r from-orange-100 to-amber-100 dark:from-orange-900/30 dark:to-amber-900/30 border-2 border-orange-500'
                      : 'bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 border-2 border-orange-200 dark:border-orange-800 hover:border-orange-400'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="text-lg font-bold text-neutral-900 dark:text-white mb-2">{event.eventName}</h4>
                      <div className="flex flex-wrap gap-3 text-sm text-neutral-600 dark:text-neutral-400">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(event.date).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {event.location}
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {event.attendees.length} people
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteEvent(event.id);
                      }}
                      className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                      title="Delete event"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </Card>

        {/* Selected Event Details */}
        {currentEvent && (
          <>
            {/* Food Summary */}
            {foodSummary.length > 0 && (
              <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-300 dark:border-green-800">
                <div className="flex items-center gap-2 mb-4">
                  <UtensilsCrossed className="h-6 w-6 text-green-600 dark:text-green-400" />
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white">Order Summary for Restaurant</h3>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {foodSummary.map((item, index) => (
                    <Card key={index} className="p-4 bg-white dark:bg-neutral-800 border border-green-200 dark:border-green-700">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-bold text-neutral-900 dark:text-white flex-1">{item.food}</h4>
                        <span className="px-3 py-1 bg-green-500 text-white rounded-full text-sm font-bold ml-2">
                          ×{item.count}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-600 dark:text-neutral-400">
                        For: {item.people.join(', ')}
                      </p>
                    </Card>
                  ))}
                </div>
                <div className="mt-4 p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <p className="text-sm text-green-800 dark:text-green-300 font-medium">
                    📋 Total: {foodSummary.reduce((sum, item) => sum + item.count, 0)} items • {attendees.length} people
                  </p>
                </div>
              </Card>
            )}

            <Card className="p-6 bg-white dark:bg-neutral-800">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white">{currentEvent.eventName} - Individual Orders</h3>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                    {new Date(currentEvent.date).toLocaleDateString()} at {currentEvent.location}
                  </p>
                </div>
                <Button
                  onClick={() => setIsAddingPerson(true)}
                  className="bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:opacity-90"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Person
                </Button>
              </div>

            {attendees.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-neutral-400 mx-auto mb-3" />
                <p className="text-neutral-600 dark:text-neutral-400">No attendees yet. Add people and their food orders.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {attendees.map((person, index) => (
                  <Card key={index} className="p-4 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 border border-orange-200 dark:border-orange-800">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-bold text-neutral-900 dark:text-white mb-2">{person.personName}</h4>
                        <div className="space-y-1">
                          <div>
                            <p className="text-xs font-bold text-orange-600 dark:text-orange-400">FOOD ORDER</p>
                            <p className="text-sm text-neutral-900 dark:text-white">{person.foodItem}</p>
                          </div>
                          {person.dietaryRestrictions && (
                            <div>
                              <p className="text-xs font-bold text-orange-600 dark:text-orange-400">DIETARY RESTRICTIONS</p>
                              <p className="text-sm text-neutral-900 dark:text-white">{person.dietaryRestrictions}</p>
                            </div>
                          )}
                          {person.notes && (
                            <div>
                              <p className="text-xs font-bold text-orange-600 dark:text-orange-400">NOTES</p>
                              <p className="text-sm text-neutral-900 dark:text-white italic">{person.notes}</p>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => startEditPerson(index)}
                          className="p-2 hover:bg-orange-200 dark:hover:bg-orange-800 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                        </button>
                        <button
                          onClick={() => deletePerson(index)}
                          className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </Card>
          </>
        )}

        {/* Add Event Modal */}
        {isAddingEvent && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <Card className="max-w-2xl w-full bg-white dark:bg-neutral-800">
              <div className="p-6 border-b border-neutral-200 dark:border-neutral-700">
                <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Create Meal Event</h2>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Event Name *
                  </label>
                  <input
                    type="text"
                    value={newEvent.eventName}
                    onChange={(e) => setNewEvent({ ...newEvent, eventName: e.target.value })}
                    placeholder="e.g., Team Lunch, Family Dinner"
                    className="w-full px-4 py-2 bg-neutral-50 dark:bg-neutral-700 border-2 border-neutral-200 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Date *
                  </label>
                  <input
                    type="date"
                    value={newEvent.date}
                    onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                    className="w-full px-4 py-2 bg-neutral-50 dark:bg-neutral-700 border-2 border-neutral-200 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Location (Restaurant) *
                  </label>
                  <input
                    type="text"
                    value={newEvent.location}
                    onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                    placeholder="e.g., Italian Bistro, Downtown"
                    className="w-full px-4 py-2 bg-neutral-50 dark:bg-neutral-700 border-2 border-neutral-200 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>
              <div className="p-6 border-t border-neutral-200 dark:border-neutral-700 flex gap-3">
                <Button
                  onClick={() => {
                    setIsAddingEvent(false);
                    setNewEvent({ eventName: '', date: '', location: '' });
                  }}
                  className="flex-1 bg-neutral-200 dark:bg-neutral-700 text-neutral-900 dark:text-white hover:bg-neutral-300 dark:hover:bg-neutral-600"
                >
                  Cancel
                </Button>
                <Button
                  onClick={addEvent}
                  disabled={!newEvent.eventName.trim() || !newEvent.date || !newEvent.location.trim()}
                  className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Create Event
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* Add/Edit Person Modal */}
        {isAddingPerson && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <Card className="max-w-2xl w-full bg-white dark:bg-neutral-800">
              <div className="p-6 border-b border-neutral-200 dark:border-neutral-700">
                <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
                  {editingPersonIndex !== null ? 'Edit Food Order' : 'Add Person & Food Order'}
                </h2>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Person Name *
                  </label>
                  <input
                    type="text"
                    value={newPerson.personName}
                    onChange={(e) => setNewPerson({ ...newPerson, personName: e.target.value })}
                    placeholder="Enter person's name"
                    className="w-full px-4 py-2 bg-neutral-50 dark:bg-neutral-700 border-2 border-neutral-200 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Food Order *
                  </label>
                  <input
                    type="text"
                    value={newPerson.foodItem}
                    onChange={(e) => setNewPerson({ ...newPerson, foodItem: e.target.value })}
                    placeholder="e.g., Margherita Pizza, Pasta Carbonara, Caesar Salad"
                    className="w-full px-4 py-2 bg-neutral-50 dark:bg-neutral-700 border-2 border-neutral-200 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Dietary Restrictions
                  </label>
                  <input
                    type="text"
                    value={newPerson.dietaryRestrictions}
                    onChange={(e) => setNewPerson({ ...newPerson, dietaryRestrictions: e.target.value })}
                    placeholder="e.g., Vegetarian, Vegan, Gluten-free, Nut allergy"
                    className="w-full px-4 py-2 bg-neutral-50 dark:bg-neutral-700 border-2 border-neutral-200 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Additional Notes
                  </label>
                  <textarea
                    value={newPerson.notes}
                    onChange={(e) => setNewPerson({ ...newPerson, notes: e.target.value })}
                    placeholder="Any special requests or preferences..."
                    rows={3}
                    className="w-full px-4 py-2 bg-neutral-50 dark:bg-neutral-700 border-2 border-neutral-200 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                  />
                </div>
              </div>
              <div className="p-6 border-t border-neutral-200 dark:border-neutral-700 flex gap-3">
                <Button
                  onClick={() => {
                    setIsAddingPerson(false);
                    setEditingPersonIndex(null);
                    setNewPerson({ personName: '', foodItem: '', dietaryRestrictions: '', notes: '' });
                  }}
                  className="flex-1 bg-neutral-200 dark:bg-neutral-700 text-neutral-900 dark:text-white hover:bg-neutral-300 dark:hover:bg-neutral-600"
                >
                  Cancel
                </Button>
                <Button
                  onClick={editingPersonIndex !== null ? updatePerson : addPerson}
                  disabled={!newPerson.personName.trim() || !newPerson.foodItem.trim()}
                  className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {editingPersonIndex !== null ? 'Update Order' : 'Add Order'}
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* Documentation Modal */}
        {showDocumentation && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <Card className="max-w-4xl w-full max-h-[90vh] overflow-y-auto bg-white dark:bg-neutral-800">
              <div className="sticky top-0 bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 p-6 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                    <UtensilsCrossed className="h-6 w-6 text-orange-600" />
                    Group Meals - Template Documentation
                  </h2>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">Complete guide to features and capabilities</p>
                </div>
                <button onClick={() => setShowDocumentation(false)} className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors">
                  <X className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
                </button>
              </div>
              <div className="p-6 space-y-6">
                <section>
                  <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-3">📋 Overview</h3>
                  <p className="text-neutral-700 dark:text-neutral-300">
                    Group Meals is a meal order collection tool designed for group dining at restaurants. Perfect for collecting everyone's meal preferences, 
                    dietary restrictions, and special requests before placing a group order. Organize your team lunch, family dinner, or any group dining event efficiently.
                  </p>
                </section>
                <section>
                  <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-4">✨ Key Features</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                      <div className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-orange-600 mt-0.5" />
                        <div>
                          <h4 className="font-bold text-neutral-900 dark:text-white mb-1">Person-Based Orders</h4>
                          <p className="text-sm text-neutral-700 dark:text-neutral-300">Collect meal preferences for each person in your group with their name</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                      <div className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-amber-600 mt-0.5" />
                        <div>
                          <h4 className="font-bold text-neutral-900 dark:text-white mb-1">Dietary Restrictions</h4>
                          <p className="text-sm text-neutral-700 dark:text-neutral-300">Track vegetarian, vegan, allergies, and other dietary requirements</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <div className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div>
                          <h4 className="font-bold text-neutral-900 dark:text-white mb-1">Edit & Delete</h4>
                          <p className="text-sm text-neutral-700 dark:text-neutral-300">Easily modify or remove orders as preferences change</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                      <div className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-green-600 mt-0.5" />
                        <div>
                          <h4 className="font-bold text-neutral-900 dark:text-white mb-1">Special Notes</h4>
                          <p className="text-sm text-neutral-700 dark:text-neutral-300">Add custom notes for special requests or preferences</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                      <div className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-purple-600 mt-0.5" />
                        <div>
                          <h4 className="font-bold text-neutral-900 dark:text-white mb-1">Group Statistics</h4>
                          <p className="text-sm text-neutral-700 dark:text-neutral-300">See total people, meal orders, and special requests at a glance</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 bg-pink-50 dark:bg-pink-900/20 rounded-lg border border-pink-200 dark:border-pink-800">
                      <div className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-pink-600 mt-0.5" />
                        <div>
                          <h4 className="font-bold text-neutral-900 dark:text-white mb-1">Timestamps</h4>
                          <p className="text-sm text-neutral-700 dark:text-neutral-300">Track when each order was added or last updated</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
                <section>
                  <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-4">🚀 How to Use</h3>
                  <div className="space-y-3">
                    <div className="p-4 bg-neutral-50 dark:bg-neutral-700/50 rounded-lg">
                      <h4 className="font-bold text-neutral-900 dark:text-white mb-2">1. Add Person</h4>
                      <p className="text-sm text-neutral-700 dark:text-neutral-300">Click "Add Person" button to open the order form. Enter the person's name and their meal preference.</p>
                    </div>
                    <div className="p-4 bg-neutral-50 dark:bg-neutral-700/50 rounded-lg">
                      <h4 className="font-bold text-neutral-900 dark:text-white mb-2">2. Add Details</h4>
                      <p className="text-sm text-neutral-700 dark:text-neutral-300">Optionally add dietary restrictions (vegetarian, allergies, etc.) and any special notes or requests.</p>
                    </div>
                    <div className="p-4 bg-neutral-50 dark:bg-neutral-700/50 rounded-lg">
                      <h4 className="font-bold text-neutral-900 dark:text-white mb-2">3. Save Order</h4>
                      <p className="text-sm text-neutral-700 dark:text-neutral-300">Click "Add Order" to save. The order appears as a card with all the details clearly displayed.</p>
                    </div>
                    <div className="p-4 bg-neutral-50 dark:bg-neutral-700/50 rounded-lg">
                      <h4 className="font-bold text-neutral-900 dark:text-white mb-2">4. Edit Orders</h4>
                      <p className="text-sm text-neutral-700 dark:text-neutral-300">Click the edit icon on any order card to modify meal preferences or add/change details.</p>
                    </div>
                    <div className="p-4 bg-neutral-50 dark:bg-neutral-700/50 rounded-lg">
                      <h4 className="font-bold text-neutral-900 dark:text-white mb-2">5. Delete Orders</h4>
                      <p className="text-sm text-neutral-700 dark:text-neutral-300">Click the trash icon to remove an order. A confirmation dialog will appear to prevent accidental deletion.</p>
                    </div>
                  </div>
                </section>
                <section className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 p-6 rounded-lg border border-orange-200 dark:border-orange-800">
                  <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-4">💎 Pro Tips</h3>
                  <ul className="space-y-2 text-neutral-700 dark:text-neutral-300">
                    <li className="flex items-start gap-2">
                      <span className="text-orange-600 mt-1">✓</span>
                      <span><strong>Before Ordering:</strong> Collect everyone's preferences before arriving at the restaurant to save time.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-orange-600 mt-1">✓</span>
                      <span><strong>Dietary Info:</strong> Always ask about allergies and dietary restrictions to ensure everyone can eat safely.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-orange-600 mt-1">✓</span>
                      <span><strong>Special Requests:</strong> Use the notes field for modifications like "no onions" or "extra spicy".</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-orange-600 mt-1">✓</span>
                      <span><strong>Group Stats:</strong> Check the statistics cards at the top to see how many people have special dietary needs.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-orange-600 mt-1">✓</span>
                      <span><strong>Update Anytime:</strong> Orders can be edited until you place the actual restaurant order.</span>
                    </li>
                  </ul>
                </section>
                <section>
                  <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-3">🎯 Use Cases</h3>
                  <div className="grid md:grid-cols-2 gap-3">
                    <div className="p-3 bg-neutral-50 dark:bg-neutral-700/50 rounded-lg">
                      <p className="font-medium text-neutral-900 dark:text-white mb-1">Team Lunches</p>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">Organize office lunch orders efficiently</p>
                    </div>
                    <div className="p-3 bg-neutral-50 dark:bg-neutral-700/50 rounded-lg">
                      <p className="font-medium text-neutral-900 dark:text-white mb-1">Family Dinners</p>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">Collect preferences for family restaurant visits</p>
                    </div>
                    <div className="p-3 bg-neutral-50 dark:bg-neutral-700/50 rounded-lg">
                      <p className="font-medium text-neutral-900 dark:text-white mb-1">Event Catering</p>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">Plan meals for events and gatherings</p>
                    </div>
                    <div className="p-3 bg-neutral-50 dark:bg-neutral-700/50 rounded-lg">
                      <p className="font-medium text-neutral-900 dark:text-white mb-1">Group Outings</p>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">Coordinate food orders for trips and outings</p>
                    </div>
                  </div>
                </section>
              </div>
              <div className="sticky bottom-0 bg-white dark:bg-neutral-800 border-t border-neutral-200 dark:border-neutral-700 p-6">
                <Button onClick={() => setShowDocumentation(false)} className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:opacity-90">Got It!</Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
