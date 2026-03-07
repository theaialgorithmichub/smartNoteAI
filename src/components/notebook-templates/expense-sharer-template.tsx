'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Plus, DollarSign, UserPlus, TrendingUp, CheckCircle, Info, X, Trash2, Calendar, ArrowRight, Edit } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { TemplateFooter } from './template-footer';
import { Button } from '@/components/ui/button';

interface ExpenseSharerTemplateProps {
  title: string;
  notebookId?: string;
}

interface Participant {
  id: string;
  name: string;
  color: string;
}

interface Expense {
  id: string;
  description: string;
  amount: number;
  paidBy: string;
  date: string;
  splitAmong: string[];
}

interface Event {
  id: string;
  name: string;
  currency: string;
  participants: Participant[];
  expenses: Expense[];
  createdAt: string;
}

interface Settlement {
  from: string;
  to: string;
  amount: number;
}

export function ExpenseSharerTemplate({ title, notebookId }: ExpenseSharerTemplateProps) {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [isAddingPerson, setIsAddingPerson] = useState(false);
  const [isAddingExpense, setIsAddingExpense] = useState(false);
  const [isEditingExpense, setIsEditingExpense] = useState(false);
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);
  const [newEvent, setNewEvent] = useState({ name: '', currency: 'USD' });
  const [newPerson, setNewPerson] = useState({ name: '', color: 'blue' });
  const [newExpense, setNewExpense] = useState({ description: '', amount: '', paidBy: '', splitAmong: [] as string[] });
  const [saving, setSaving] = useState(false);
  const [showDocumentation, setShowDocumentation] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const currencies = ['USD', 'EUR', 'GBP', 'INR', 'JPY', 'AUD', 'CAD', 'CNY'];
  const colors = ['blue', 'green', 'purple', 'pink', 'orange', 'cyan', 'red', 'indigo', 'teal', 'amber'];

  const saveData = () => {
    if (!notebookId) return;
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    
    saveTimeoutRef.current = setTimeout(() => {
      setSaving(true);
      try {
        localStorage.setItem(`expense-sharer-${notebookId}`, JSON.stringify({ events }));
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
      const saved = localStorage.getItem(`expense-sharer-${notebookId}`);
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

  const currentEvent = events.find(e => e.id === selectedEvent);
  const participants = currentEvent?.participants || [];
  const expenses = currentEvent?.expenses || [];
  const currency = currentEvent?.currency || 'USD';

  const getCurrencySymbol = (curr: string) => {
    const symbols: { [key: string]: string } = {
      USD: '$', EUR: '€', GBP: '£', INR: '₹', JPY: '¥', AUD: 'A$', CAD: 'C$', CNY: '¥'
    };
    return symbols[curr] || curr;
  };

  const addEvent = () => {
    if (!newEvent.name.trim()) return;
    const event: Event = {
      id: Date.now().toString(),
      name: newEvent.name,
      currency: newEvent.currency,
      participants: [],
      expenses: [],
      createdAt: new Date().toISOString()
    };
    setEvents([event, ...events]);
    setSelectedEvent(event.id);
    setNewEvent({ name: '', currency: 'USD' });
    setIsAddingEvent(false);
  };

  const deleteEvent = (id: string) => {
    setEvents(events.filter(e => e.id !== id));
    if (selectedEvent === id) {
      setSelectedEvent(null);
    }
  };

  const addPerson = () => {
    if (!selectedEvent || !newPerson.name.trim()) return;
    const person: Participant = {
      id: Date.now().toString(),
      name: newPerson.name,
      color: newPerson.color
    };
    setEvents(events.map(e => 
      e.id === selectedEvent
        ? { ...e, participants: [...e.participants, person] }
        : e
    ));
    setNewPerson({ name: '', color: 'blue' });
    setIsAddingPerson(false);
  };

  const deletePerson = (personId: string) => {
    if (!selectedEvent) return;
    setEvents(events.map(e => 
      e.id === selectedEvent
        ? { 
            ...e, 
            participants: e.participants.filter(p => p.id !== personId),
            expenses: e.expenses.filter(exp => !exp.splitAmong.includes(personId) && exp.paidBy !== personId)
          }
        : e
    ));
  };

  const addExpense = () => {
    if (!selectedEvent || !newExpense.description.trim() || !newExpense.amount || !newExpense.paidBy) return;
    const expense: Expense = {
      id: Date.now().toString(),
      description: newExpense.description,
      amount: parseFloat(newExpense.amount),
      paidBy: newExpense.paidBy,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      splitAmong: newExpense.splitAmong.length > 0 ? newExpense.splitAmong : participants.map(p => p.id)
    };
    setEvents(events.map(e => 
      e.id === selectedEvent
        ? { ...e, expenses: [expense, ...e.expenses] }
        : e
    ));
    setNewExpense({ description: '', amount: '', paidBy: '', splitAmong: [] });
    setIsAddingExpense(false);
  };

  const deleteExpense = (expenseId: string) => {
    if (!selectedEvent) return;
    setEvents(events.map(e => 
      e.id === selectedEvent
        ? { ...e, expenses: e.expenses.filter(exp => exp.id !== expenseId) }
        : e
    ));
  };

  const startEditExpense = (expense: Expense) => {
    setEditingExpenseId(expense.id);
    setNewExpense({
      description: expense.description,
      amount: expense.amount.toString(),
      paidBy: expense.paidBy,
      splitAmong: expense.splitAmong
    });
    setIsEditingExpense(true);
  };

  const updateExpense = () => {
    if (!selectedEvent || !editingExpenseId || !newExpense.description.trim() || !newExpense.amount || !newExpense.paidBy) return;
    setEvents(events.map(e => 
      e.id === selectedEvent
        ? {
            ...e,
            expenses: e.expenses.map(exp =>
              exp.id === editingExpenseId
                ? {
                    ...exp,
                    description: newExpense.description,
                    amount: parseFloat(newExpense.amount),
                    paidBy: newExpense.paidBy,
                    splitAmong: newExpense.splitAmong.length > 0 ? newExpense.splitAmong : participants.map(p => p.id)
                  }
                : exp
            )
          }
        : e
    ));
    setNewExpense({ description: '', amount: '', paidBy: '', splitAmong: [] });
    setEditingExpenseId(null);
    setIsEditingExpense(false);
  };

  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const perPersonShare = participants.length > 0 ? totalExpenses / participants.length : 0;

  const calculateBalance = (participantId: string) => {
    const paid = expenses
      .filter(exp => exp.paidBy === participantId)
      .reduce((sum, exp) => sum + exp.amount, 0);
    
    const owes = expenses
      .filter(exp => exp.splitAmong.includes(participantId))
      .reduce((sum, exp) => sum + (exp.amount / exp.splitAmong.length), 0);
    
    return paid - owes;
  };

  const calculateSettlements = (): Settlement[] => {
    const balances = participants.map(p => ({
      id: p.id,
      name: p.name,
      balance: calculateBalance(p.id)
    }));

    const creditors = balances.filter(b => b.balance > 0.01).sort((a, b) => b.balance - a.balance);
    const debtors = balances.filter(b => b.balance < -0.01).sort((a, b) => a.balance - b.balance);

    const settlements: Settlement[] = [];
    let i = 0, j = 0;

    while (i < creditors.length && j < debtors.length) {
      const creditor = creditors[i];
      const debtor = debtors[j];
      const amount = Math.min(creditor.balance, Math.abs(debtor.balance));

      settlements.push({
        from: debtor.id,
        to: creditor.id,
        amount: amount
      });

      creditor.balance -= amount;
      debtor.balance += amount;

      if (creditor.balance < 0.01) i++;
      if (Math.abs(debtor.balance) < 0.01) j++;
    }

    return settlements;
  };

  const getParticipantName = (id: string) => {
    return participants.find(p => p.id === id)?.name || 'Unknown';
  };

  const getParticipantColor = (id: string) => {
    return participants.find(p => p.id === id)?.color || 'neutral';
  };

  return (
    <div className="h-full min-h-0 flex flex-col bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-neutral-900 dark:to-neutral-800">
      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-8">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-4 mb-2">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                {title}
              </h1>
              <button
                onClick={() => setShowDocumentation(true)}
                className="p-2 bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 rounded-lg hover:bg-teal-200 dark:hover:bg-teal-900/50 transition-colors"
                title="Documentation"
              >
                <Info className="h-4 w-4" />
              </button>
            </div>
          </div>
          <p className="text-neutral-600 dark:text-neutral-400">Split expenses fairly among friends</p>
        </div>

        {/* Events List */}
        <Card className="p-6 bg-white dark:bg-neutral-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-2">
              <Calendar className="h-5 w-5 text-teal-600" />
              Events
            </h3>
            <button
              onClick={() => setIsAddingEvent(true)}
              className="px-4 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-lg hover:opacity-90 transition-opacity text-sm"
            >
              <Plus className="h-4 w-4 inline mr-2" />
              New Event
            </button>
          </div>
          {events.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {events.map((event) => (
                <Card
                  key={event.id}
                  onClick={() => setSelectedEvent(event.id)}
                  className={`p-4 cursor-pointer transition-all border-2 ${
                    selectedEvent === event.id
                      ? 'bg-gradient-to-br from-teal-100 to-cyan-100 dark:from-teal-900/30 dark:to-cyan-900/30 border-teal-500'
                      : 'bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 hover:border-teal-300'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <Calendar className={`h-5 w-5 ${
                      selectedEvent === event.id ? 'text-teal-600' : 'text-neutral-400'
                    }`} />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteEvent(event.id);
                      }}
                      className="p-1 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors"
                      title="Delete event"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                  <h4 className="font-bold text-neutral-900 dark:text-white mb-1 text-sm line-clamp-2">{event.name}</h4>
                  <div className="flex items-center justify-between text-xs text-neutral-600 dark:text-neutral-400">
                    <span>{event.participants.length} people</span>
                    <span className="font-semibold">{getCurrencySymbol(event.currency)}</span>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 mx-auto mb-3 text-neutral-400" />
              <p className="text-neutral-600 dark:text-neutral-400">No events yet</p>
              <p className="text-sm text-neutral-500 dark:text-neutral-500 mt-1">Create an event to start tracking expenses</p>
            </div>
          )}
        </Card>

        {selectedEvent && currentEvent && (
          <>
            {/* Summary Cards */}
            <div className="grid sm:grid-cols-3 gap-4">
              <Card className="p-6 bg-gradient-to-br from-teal-500 to-cyan-500 text-white">
                <div className="flex items-center gap-3 mb-2">
                  <DollarSign className="h-6 w-6" />
                  <p className="text-sm opacity-90">Total Expenses</p>
                </div>
                <p className="text-3xl font-bold">{getCurrencySymbol(currency)}{totalExpenses.toFixed(2)}</p>
              </Card>
              <Card className="p-6 bg-gradient-to-br from-blue-500 to-indigo-500 text-white">
                <div className="flex items-center gap-3 mb-2">
                  <Users className="h-6 w-6" />
                  <p className="text-sm opacity-90">Participants</p>
                </div>
                <p className="text-3xl font-bold">{participants.length}</p>
              </Card>
              <Card className="p-6 bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                <div className="flex items-center gap-3 mb-2">
                  <TrendingUp className="h-6 w-6" />
                  <p className="text-sm opacity-90">Per Person</p>
                </div>
                <p className="text-3xl font-bold">{getCurrencySymbol(currency)}{perPersonShare.toFixed(2)}</p>
              </Card>
            </div>

            {/* Participants */}
            <Card className="p-6 bg-white dark:bg-neutral-800">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-neutral-900 dark:text-white">Participants</h3>
                <button
                  onClick={() => setIsAddingPerson(true)}
                  className="px-4 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-lg hover:opacity-90 transition-opacity"
                >
                  <UserPlus className="h-4 w-4 inline mr-2" />
                  Add Person
                </button>
              </div>
              {participants.length > 0 ? (
                <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
                  {participants.map(participant => {
                    const balance = calculateBalance(participant.id);
                    return (
                      <div
                        key={participant.id}
                        className={`p-4 bg-gradient-to-br from-${participant.color}-100 to-${participant.color}-200 dark:from-${participant.color}-900/30 dark:to-${participant.color}-900/20 rounded-lg border-2 border-${participant.color}-300 dark:border-${participant.color}-800 relative`}
                      >
                        <button
                          onClick={() => deletePerson(participant.id)}
                          className="absolute top-2 right-2 p-1 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors"
                          title="Remove person"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                        <div className="flex items-center gap-3 mb-2">
                          <div className={`w-10 h-10 rounded-full bg-${participant.color}-500 flex items-center justify-center text-white font-bold`}>
                            {participant.name[0]}
                          </div>
                          <p className="font-bold text-neutral-900 dark:text-white">{participant.name}</p>
                        </div>
                        <div className="mt-3">
                          <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-1">Balance</p>
                          <p className={`text-lg font-bold ${balance > 0 ? 'text-green-600' : balance < 0 ? 'text-red-600' : 'text-neutral-600'}`}>
                            {getCurrencySymbol(currency)}{balance > 0 ? '+' : ''}{balance.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 mx-auto mb-3 text-neutral-400" />
                  <p className="text-neutral-600 dark:text-neutral-400">No participants yet</p>
                  <p className="text-sm text-neutral-500 dark:text-neutral-500 mt-1">Add people to split expenses</p>
                </div>
              )}
            </Card>

            {/* Add Expense Button */}
            <Card className="p-6 bg-white dark:bg-neutral-800">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-neutral-900 dark:text-white">Expenses</h3>
                <button
                  onClick={() => setIsAddingExpense(true)}
                  disabled={participants.length === 0}
                  className="px-4 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="h-4 w-4 inline mr-2" />
                  Add Expense
                </button>
              </div>
            </Card>

            {/* Expenses List */}
            <Card className="p-6 bg-white dark:bg-neutral-800">
              <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-4">Expense History</h3>
              {expenses.length > 0 ? (
                <div className="space-y-3">
                  {expenses.map(expense => {
                    const paidByName = getParticipantName(expense.paidBy);
                    const paidByColor = getParticipantColor(expense.paidBy);
                    const splitAmount = expense.amount / expense.splitAmong.length;
                    
                    return (
                      <div
                        key={expense.id}
                        className="p-4 bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 rounded-lg border border-teal-200 dark:border-teal-800"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex-1">
                            <h4 className="font-bold text-neutral-900 dark:text-white">{expense.description}</h4>
                            <p className="text-sm text-neutral-600 dark:text-neutral-400">
                              Paid by <span className={`font-semibold text-${paidByColor}-600`}>{paidByName}</span> • {expense.date}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <p className="text-2xl font-bold text-neutral-900 dark:text-white">{getCurrencySymbol(currency)}{expense.amount.toFixed(2)}</p>
                              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                {getCurrencySymbol(currency)}{splitAmount.toFixed(2)} per person
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => startEditExpense(expense)}
                                className="p-2 text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                                title="Edit expense"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => deleteExpense(expense.id)}
                                className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                                title="Delete expense"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2 mt-3">
                          {expense.splitAmong.map(pid => {
                            const pName = getParticipantName(pid);
                            const pColor = getParticipantColor(pid);
                            return (
                              <span
                                key={pid}
                                className={`px-2 py-1 bg-${pColor}-100 dark:bg-${pColor}-900/30 text-${pColor}-700 dark:text-${pColor}-400 rounded text-xs font-medium`}
                              >
                                {pName}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <DollarSign className="h-12 w-12 mx-auto mb-3 text-neutral-400" />
                  <p className="text-neutral-600 dark:text-neutral-400">No expenses yet</p>
                  <p className="text-sm text-neutral-500 dark:text-neutral-500 mt-1">Add expenses to track spending</p>
                </div>
              )}
            </Card>

            {/* Settlement Summary */}
            <Card className="p-6 bg-gradient-to-br from-green-500 to-emerald-500 text-white">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle className="h-8 w-8" />
                <h3 className="text-xl font-bold">Settlement Summary</h3>
              </div>
              {participants.length > 0 && expenses.length > 0 ? (
                <>
                  <div className="space-y-2 mb-4">
                    {participants.map(participant => {
                      const balance = calculateBalance(participant.id);
                      if (Math.abs(balance) < 0.01) return null;
                      
                      return (
                        <div key={participant.id} className="flex items-center justify-between p-3 bg-white/10 rounded-lg">
                          <span className="font-semibold">{participant.name}</span>
                          <span className="font-bold">
                            {balance > 0 ? `Gets back ${getCurrencySymbol(currency)}${balance.toFixed(2)}` : `Owes ${getCurrencySymbol(currency)}${Math.abs(balance).toFixed(2)}`}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="border-t border-white/20 pt-4 mt-4">
                    <h4 className="font-bold mb-3 flex items-center gap-2">
                      <ArrowRight className="h-5 w-5" />
                      Suggested Payments
                    </h4>
                    <div className="space-y-2">
                      {calculateSettlements().map((settlement, idx) => (
                        <div key={idx} className="flex items-center gap-2 p-3 bg-white/10 rounded-lg">
                          <span className="font-semibold">{getParticipantName(settlement.from)}</span>
                          <ArrowRight className="h-4 w-4" />
                          <span className="font-semibold">{getParticipantName(settlement.to)}</span>
                          <span className="ml-auto font-bold">{getCurrencySymbol(currency)}{settlement.amount.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-white/80">Add participants and expenses to see settlement details</p>
              )}
            </Card>
          </>
        )}

        {/* Add Event Modal */}
        <AnimatePresence>
          {isAddingEvent && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              onClick={() => setIsAddingEvent(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={e => e.stopPropagation()}
                className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl w-full max-w-md p-6"
              >
                <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-4">Create New Event</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Event Name</label>
                    <input
                      type="text"
                      value={newEvent.name}
                      onChange={(e) => setNewEvent({ ...newEvent, name: e.target.value })}
                      placeholder="e.g., Weekend Trip, Dinner Party"
                      className="w-full px-4 py-2 bg-neutral-100 dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      autoFocus
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Currency</label>
                    <select
                      value={newEvent.currency}
                      onChange={(e) => setNewEvent({ ...newEvent, currency: e.target.value })}
                      className="w-full px-4 py-2 bg-neutral-100 dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                      {currencies.map(curr => (
                        <option key={curr} value={curr}>{curr} ({getCurrencySymbol(curr)})</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={addEvent}
                      disabled={!newEvent.name.trim()}
                      className="flex-1 px-4 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                    >
                      Create Event
                    </button>
                    <button
                      onClick={() => {
                        setIsAddingEvent(false);
                        setNewEvent({ name: '', currency: 'USD' });
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

        {/* Add Person Modal */}
        <AnimatePresence>
          {isAddingPerson && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              onClick={() => setIsAddingPerson(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={e => e.stopPropagation()}
                className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl w-full max-w-md p-6"
              >
                <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-4">Add Person</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Name</label>
                    <input
                      type="text"
                      value={newPerson.name}
                      onChange={(e) => setNewPerson({ ...newPerson, name: e.target.value })}
                      placeholder="Enter person's name"
                      className="w-full px-4 py-2 bg-neutral-100 dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Color</label>
                    <div className="flex gap-2 flex-wrap">
                      {colors.map(color => (
                        <button
                          key={color}
                          onClick={() => setNewPerson({ ...newPerson, color })}
                          className={`w-8 h-8 rounded-lg bg-${color}-500 border-2 ${
                            newPerson.color === color ? 'border-neutral-900 dark:border-white scale-110' : 'border-transparent'
                          } transition-all`}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={addPerson}
                      disabled={!newPerson.name.trim()}
                      className="flex-1 px-4 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                    >
                      Add Person
                    </button>
                    <button
                      onClick={() => {
                        setIsAddingPerson(false);
                        setNewPerson({ name: '', color: 'blue' });
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

        {/* Add/Edit Expense Modal */}
        <AnimatePresence>
          {(isAddingExpense || isEditingExpense) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              onClick={() => {
                setIsAddingExpense(false);
                setIsEditingExpense(false);
                setEditingExpenseId(null);
              }}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={e => e.stopPropagation()}
                className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl w-full max-w-md p-6"
              >
                <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-4">
                  {isEditingExpense ? 'Edit Expense' : 'Add Expense'}
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Description</label>
                    <input
                      type="text"
                      value={newExpense.description}
                      onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                      placeholder="e.g., Dinner, Hotel, Gas"
                      className="w-full px-4 py-2 bg-neutral-100 dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Amount ({getCurrencySymbol(currency)})</label>
                    <input
                      type="number"
                      value={newExpense.amount}
                      onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                      placeholder="0.00"
                      step="0.01"
                      className="w-full px-4 py-2 bg-neutral-100 dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Paid by</label>
                    <select
                      value={newExpense.paidBy}
                      onChange={(e) => setNewExpense({ ...newExpense, paidBy: e.target.value })}
                      className="w-full px-4 py-2 bg-neutral-100 dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                      <option value="">Select person...</option>
                      {participants.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Split among (leave empty for all)</label>
                    <div className="flex gap-2 flex-wrap">
                      {participants.map(p => (
                        <button
                          key={p.id}
                          onClick={() => {
                            const isSelected = newExpense.splitAmong.includes(p.id);
                            setNewExpense({
                              ...newExpense,
                              splitAmong: isSelected
                                ? newExpense.splitAmong.filter(id => id !== p.id)
                                : [...newExpense.splitAmong, p.id]
                            });
                          }}
                          className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                            newExpense.splitAmong.includes(p.id)
                              ? `bg-${p.color}-500 text-white`
                              : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-900 dark:text-white'
                          }`}
                        >
                          {p.name}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={isEditingExpense ? updateExpense : addExpense}
                      disabled={!newExpense.description.trim() || !newExpense.amount || !newExpense.paidBy}
                      className="flex-1 px-4 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                    >
                      {isEditingExpense ? 'Update Expense' : 'Add Expense'}
                    </button>
                    <button
                      onClick={() => {
                        setIsAddingExpense(false);
                        setIsEditingExpense(false);
                        setEditingExpenseId(null);
                        setNewExpense({ description: '', amount: '', paidBy: '', splitAmong: [] });
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
                <div className="sticky top-0 bg-gradient-to-r from-teal-500 to-cyan-600 p-6 flex items-center justify-between z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">Expense Sharer Guide</h2>
                      <p className="text-teal-100 text-sm">Split expenses fairly among friends</p>
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
                    <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-3">👥 Overview</h3>
                    <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed">
                      Expense Sharer helps groups split costs fairly and transparently. Track who paid for what, calculate individual balances, manage group expenses, and settle debts easily. Perfect for roommates, trips, events, or any shared spending scenario.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-3">✨ Key Features</h3>
                    <div className="grid gap-3">
                      <div className="bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 rounded-lg p-4">
                        <h4 className="font-semibold text-teal-900 dark:text-teal-400 mb-1">👤 Participant Management</h4>
                        <p className="text-sm text-teal-800 dark:text-teal-300">Add participants with unique colors for easy identification.</p>
                      </div>
                      <div className="bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-200 dark:border-cyan-800 rounded-lg p-4">
                        <h4 className="font-semibold text-cyan-900 dark:text-cyan-400 mb-1">💰 Expense Tracking</h4>
                        <p className="text-sm text-cyan-800 dark:text-cyan-300">Log expenses with description, amount, payer, and split details.</p>
                      </div>
                      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                        <h4 className="font-semibold text-blue-900 dark:text-blue-400 mb-1">📊 Balance Calculation</h4>
                        <p className="text-sm text-blue-800 dark:text-blue-300">Automatic calculation of who owes whom and how much.</p>
                      </div>
                      <div className="bg-sky-50 dark:bg-sky-900/20 border border-sky-200 dark:border-sky-800 rounded-lg p-4">
                        <h4 className="font-semibold text-sky-900 dark:text-sky-400 mb-1">🎨 Visual Indicators</h4>
                        <p className="text-sm text-sky-800 dark:text-sky-300">Color-coded participants and clear balance displays.</p>
                      </div>
                      <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-4">
                        <h4 className="font-semibold text-emerald-900 dark:text-emerald-400 mb-1">📈 Summary Dashboard</h4>
                        <p className="text-sm text-emerald-800 dark:text-emerald-300">View total expenses, per-person share, and active participants.</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-3">🚀 How to Use</h3>
                    <div className="space-y-3">
                      <div className="flex gap-3">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-teal-500 text-white flex items-center justify-center text-sm font-bold">1</div>
                        <div>
                          <p className="font-semibold text-neutral-900 dark:text-white">Add Participants</p>
                          <p className="text-sm text-neutral-600 dark:text-neutral-400">Create participant profiles for everyone in the group.</p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-teal-500 text-white flex items-center justify-center text-sm font-bold">2</div>
                        <div>
                          <p className="font-semibold text-neutral-900 dark:text-white">Log Expenses</p>
                          <p className="text-sm text-neutral-600 dark:text-neutral-400">Add each expense with description, amount, and who paid.</p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-teal-500 text-white flex items-center justify-center text-sm font-bold">3</div>
                        <div>
                          <p className="font-semibold text-neutral-900 dark:text-white">Split Among Group</p>
                          <p className="text-sm text-neutral-600 dark:text-neutral-400">Select which participants should split each expense.</p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-teal-500 text-white flex items-center justify-center text-sm font-bold">4</div>
                        <div>
                          <p className="font-semibold text-neutral-900 dark:text-white">Check Balances</p>
                          <p className="text-sm text-neutral-600 dark:text-neutral-400">View who owes money and who should receive payments.</p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-teal-500 text-white flex items-center justify-center text-sm font-bold">5</div>
                        <div>
                          <p className="font-semibold text-neutral-900 dark:text-white">Settle Up</p>
                          <p className="text-sm text-neutral-600 dark:text-neutral-400">Use balance information to settle debts within the group.</p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-teal-500 text-white flex items-center justify-center text-sm font-bold">6</div>
                        <div>
                          <p className="font-semibold text-neutral-900 dark:text-white">Track History</p>
                          <p className="text-sm text-neutral-600 dark:text-neutral-400">Review all expenses with dates and split details.</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-3">💡 Pro Tips</h3>
                    <div className="bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 border border-teal-200 dark:border-teal-800 rounded-lg p-4 space-y-2">
                      <p className="text-sm text-neutral-700 dark:text-neutral-300">✅ <strong>Add expenses immediately</strong> - Log costs right after they happen</p>
                      <p className="text-sm text-neutral-700 dark:text-neutral-300">✅ <strong>Be descriptive</strong> - Use clear expense descriptions for easy reference</p>
                      <p className="text-sm text-neutral-700 dark:text-neutral-300">✅ <strong>Check balances regularly</strong> - Review who owes what frequently</p>
                      <p className="text-sm text-neutral-700 dark:text-neutral-300">✅ <strong>Settle periodically</strong> - Don't let balances accumulate too much</p>
                      <p className="text-sm text-neutral-700 dark:text-neutral-300">✅ <strong>Use colors wisely</strong> - Assign distinct colors to participants</p>
                      <p className="text-sm text-neutral-700 dark:text-neutral-300">✅ <strong>Include dates</strong> - Track when expenses occurred for better records</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-3">💾 Data Storage</h3>
                    <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-4">
                      <p className="text-sm text-emerald-800 dark:text-emerald-300 leading-relaxed">
                        <strong>Your expense data is automatically saved locally.</strong> All participants, expenses, and balances are stored in your browser's local storage. Look for the "Saving..." indicator to confirm storage.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="sticky bottom-0 bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-700 p-6">
                  <button
                    onClick={() => setShowDocumentation(false)}
                    className="w-full px-4 py-2 bg-gradient-to-r from-teal-500 to-cyan-600 text-white rounded-lg hover:opacity-90 transition-opacity font-medium"
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
