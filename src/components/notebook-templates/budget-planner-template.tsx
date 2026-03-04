'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DollarSign, TrendingUp, TrendingDown, PiggyBank, Plus, Info, Trash2, X, ChevronLeft, ChevronRight, Edit2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { TemplateHeader } from './template-header';
import { TemplateFooter } from './template-footer';

interface ExpenseCategory {
  id: string;
  name: string;
  amount: number;
  color: string;
  percentage: number;
}

interface MonthBudget {
  month: string;
  income: number;
  expenseCategories: ExpenseCategory[];
}

interface BudgetData {
  monthlyBudgets: { [month: string]: MonthBudget };
}

interface BudgetPlannerTemplateProps {
  title: string;
  notebookId?: string;
}

export function BudgetPlannerTemplate({ title, notebookId }: BudgetPlannerTemplateProps) {
  const [budgetData, setBudgetData] = useState<BudgetData>({ monthlyBudgets: {} });
  const [currentMonthOffset, setCurrentMonthOffset] = useState(0);
  const [isEditingIncome, setIsEditingIncome] = useState(false);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: '', amount: 0, color: 'blue' });
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [showDocumentation, setShowDocumentation] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const saveData = () => {
    if (!notebookId) return;
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    
    saveTimeoutRef.current = setTimeout(() => {
      setSaving(true);
      try {
        localStorage.setItem(`budget-planner-${notebookId}`, JSON.stringify(budgetData));
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
      const saved = localStorage.getItem(`budget-planner-${notebookId}`);
      if (saved) {
        const data = JSON.parse(saved);
        setBudgetData(data);
      }
    } catch (error) {
      console.error("Failed to load:", error);
    }
  }, [notebookId]);

  useEffect(() => {
    saveData();
  }, [budgetData]);

  const getCurrentMonth = () => {
    const date = new Date();
    date.setMonth(date.getMonth() + currentMonthOffset);
    return date.toISOString().slice(0, 7);
  };

  const getMonthName = (monthKey: string) => {
    const [year, month] = monthKey.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const currentMonth = getCurrentMonth();
  const monthBudget = budgetData.monthlyBudgets[currentMonth] || {
    month: currentMonth,
    income: 0,
    expenseCategories: []
  };

  const totalExpenses = monthBudget.expenseCategories.reduce((sum, cat) => sum + cat.amount, 0);
  const savings = monthBudget.income - totalExpenses;
  const savingsRate = monthBudget.income > 0 ? (savings / monthBudget.income) * 100 : 0;

  const colors = ['blue', 'green', 'orange', 'purple', 'pink', 'amber', 'cyan', 'red', 'indigo', 'teal'];

  const updateMonthBudget = (updates: Partial<MonthBudget>) => {
    setBudgetData(prev => ({
      monthlyBudgets: {
        ...prev.monthlyBudgets,
        [currentMonth]: {
          ...monthBudget,
          ...updates
        }
      }
    }));
  };

  const setIncome = (income: number) => {
    updateMonthBudget({ income });
  };

  const addCategory = () => {
    if (!newCategory.name.trim()) return;
    
    const category: ExpenseCategory = {
      id: Date.now().toString(),
      name: newCategory.name,
      amount: newCategory.amount,
      color: newCategory.color,
      percentage: 0
    };

    const updatedCategories = [...monthBudget.expenseCategories, category];
    const total = updatedCategories.reduce((sum, c) => sum + c.amount, 0);
    const categoriesWithPercentage = updatedCategories.map(c => ({
      ...c,
      percentage: total > 0 ? Math.round((c.amount / total) * 100) : 0
    }));

    updateMonthBudget({ expenseCategories: categoriesWithPercentage });
    setNewCategory({ name: '', amount: 0, color: 'blue' });
    setIsAddingCategory(false);
  };

  const updateCategory = (id: string, amount: number) => {
    const updatedCategories = monthBudget.expenseCategories.map(c => 
      c.id === id ? { ...c, amount } : c
    );
    const total = updatedCategories.reduce((sum, c) => sum + c.amount, 0);
    const categoriesWithPercentage = updatedCategories.map(c => ({
      ...c,
      percentage: total > 0 ? Math.round((c.amount / total) * 100) : 0
    }));
    updateMonthBudget({ expenseCategories: categoriesWithPercentage });
  };

  const deleteCategory = (id: string) => {
    const updatedCategories = monthBudget.expenseCategories.filter(c => c.id !== id);
    const total = updatedCategories.reduce((sum, c) => sum + c.amount, 0);
    const categoriesWithPercentage = updatedCategories.map(c => ({
      ...c,
      percentage: total > 0 ? Math.round((c.amount / total) * 100) : 0
    }));
    updateMonthBudget({ expenseCategories: categoriesWithPercentage });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-neutral-900 dark:to-neutral-800">
      <TemplateHeader title={title} />
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-4 mb-2">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                {title}
              </h1>
              <button
              onClick={() => setShowDocumentation(true)}
              className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
              title="Documentation"
            >
              <Info className="h-4 w-4" />
            </button>
          </div>
          <p className="text-neutral-600 dark:text-neutral-400">Plan and track your monthly budget</p>
        </div>

        {/* Month Navigator */}
        <Card className="p-4 bg-white dark:bg-neutral-800">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setCurrentMonthOffset(currentMonthOffset - 1)}
              className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors"
              title="Previous month"
            >
              <ChevronLeft className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
            </button>
            
            <div className="text-center">
              <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
                {getMonthName(currentMonth)}
              </h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">Monthly Budget</p>
            </div>
            
            <button
              onClick={() => setCurrentMonthOffset(currentMonthOffset + 1)}
              className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors"
              title="Next month"
            >
              <ChevronRight className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
            </button>
          </div>
          
          {currentMonthOffset !== 0 && (
            <div className="mt-3 text-center">
              <button
                onClick={() => setCurrentMonthOffset(0)}
                className="px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors text-sm font-medium"
              >
                Jump to Current Month
              </button>
            </div>
          )}
        </Card>

        {/* Summary Cards */}
        <div className="grid sm:grid-cols-3 gap-4">
          <Card 
            className="p-6 bg-gradient-to-br from-green-500 to-emerald-500 text-white cursor-pointer hover:opacity-90 transition-opacity"
            onClick={() => setIsEditingIncome(true)}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-6 w-6" />
                <p className="text-sm opacity-90">Total Income</p>
              </div>
              <Edit2 className="h-4 w-4 opacity-70" />
            </div>
            <p className="text-3xl font-bold">${monthBudget.income.toLocaleString()}</p>
          </Card>
          <Card className="p-6 bg-gradient-to-br from-red-500 to-rose-500 text-white">
            <div className="flex items-center gap-3 mb-2">
              <TrendingDown className="h-6 w-6" />
              <p className="text-sm opacity-90">Total Expenses</p>
            </div>
            <p className="text-3xl font-bold">${totalExpenses.toLocaleString()}</p>
          </Card>
          <Card className="p-6 bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
            <div className="flex items-center gap-3 mb-2">
              <PiggyBank className="h-6 w-6" />
              <p className="text-sm opacity-90">Savings</p>
            </div>
            <p className="text-3xl font-bold">${savings.toLocaleString()}</p>
            <p className="text-sm opacity-90 mt-1">{savingsRate.toFixed(1)}% saved</p>
          </Card>
        </div>

        {/* Expense Breakdown */}
        <Card className="p-6 bg-white dark:bg-neutral-800">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white">Expense Breakdown</h3>
            <button 
              onClick={() => setIsAddingCategory(true)}
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:opacity-90 transition-opacity"
            >
              <Plus className="h-4 w-4 inline mr-2" />
              Add Category
            </button>
          </div>

          {monthBudget.expenseCategories.length > 0 ? (
            <div className="space-y-4">
              {monthBudget.expenseCategories.map((category) => (
                <div key={category.id}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full bg-${category.color}-500`} />
                      <span className="font-medium text-neutral-900 dark:text-white">{category.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      {editingCategoryId === category.id ? (
                        <input
                          type="number"
                          value={category.amount}
                          onChange={(e) => updateCategory(category.id, parseFloat(e.target.value) || 0)}
                          onBlur={() => setEditingCategoryId(null)}
                          autoFocus
                          className="w-24 px-2 py-1 bg-neutral-100 dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded text-right font-bold text-neutral-900 dark:text-white"
                        />
                      ) : (
                        <div className="text-right">
                          <p 
                            className="font-bold text-neutral-900 dark:text-white cursor-pointer hover:text-blue-600"
                            onClick={() => setEditingCategoryId(category.id)}
                          >
                            ${category.amount.toLocaleString()}
                          </p>
                          <p className="text-xs text-neutral-500 dark:text-neutral-400">{category.percentage}%</p>
                        </div>
                      )}
                      <button
                        onClick={() => deleteCategory(category.id)}
                        className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                        title="Delete category"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div className="w-full h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-${category.color}-500 transition-all`}
                      style={{ width: `${category.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <DollarSign className="h-16 w-16 mx-auto mb-4 text-neutral-400" />
              <p className="text-neutral-600 dark:text-neutral-400">No expense categories yet</p>
              <p className="text-sm text-neutral-500 dark:text-neutral-500 mt-2">Click "Add Category" to start budgeting</p>
            </div>
          )}
        </Card>

        {/* Budget Summary */}
        <Card className="p-6 bg-white dark:bg-neutral-800">
          <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-4">Budget Summary</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <span className="font-medium text-neutral-900 dark:text-white">Monthly Income</span>
              <span className="font-bold text-green-600">${monthBudget.income.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <span className="font-medium text-neutral-900 dark:text-white">Total Budgeted Expenses</span>
              <span className="font-bold text-red-600">-${totalExpenses.toLocaleString()}</span>
            </div>
            <div className={`flex items-center justify-between p-3 rounded-lg ${
              savings >= 0 ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-orange-50 dark:bg-orange-900/20'
            }`}>
              <span className="font-medium text-neutral-900 dark:text-white">
                {savings >= 0 ? 'Remaining Budget' : 'Over Budget'}
              </span>
              <span className={`font-bold ${
                savings >= 0 ? 'text-blue-600' : 'text-orange-600'
              }`}>
                ${Math.abs(savings).toLocaleString()}
              </span>
            </div>
          </div>
        </Card>
        {/* Edit Income Modal */}
        <AnimatePresence>
          {isEditingIncome && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              onClick={() => setIsEditingIncome(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={e => e.stopPropagation()}
                className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl w-full max-w-md p-6"
              >
                <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-4">Set Monthly Income</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                      Income for {getMonthName(currentMonth)}
                    </label>
                    <input
                      type="number"
                      value={monthBudget.income}
                      onChange={(e) => setIncome(parseFloat(e.target.value) || 0)}
                      placeholder="Enter monthly income"
                      className="w-full px-4 py-2 bg-neutral-100 dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
                    />
                  </div>
                  <button
                    onClick={() => setIsEditingIncome(false)}
                    className="w-full px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:opacity-90 transition-opacity"
                  >
                    Done
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Add Category Modal */}
        <AnimatePresence>
          {isAddingCategory && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              onClick={() => setIsAddingCategory(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={e => e.stopPropagation()}
                className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl w-full max-w-md p-6"
              >
                <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-4">Add Expense Category</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Category Name</label>
                    <input
                      type="text"
                      value={newCategory.name}
                      onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                      placeholder="e.g., Housing, Food, Transport"
                      className="w-full px-4 py-2 bg-neutral-100 dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Budgeted Amount</label>
                    <input
                      type="number"
                      value={newCategory.amount}
                      onChange={(e) => setNewCategory({ ...newCategory, amount: parseFloat(e.target.value) || 0 })}
                      placeholder="Enter amount"
                      className="w-full px-4 py-2 bg-neutral-100 dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Color</label>
                    <div className="flex gap-2 flex-wrap">
                      {colors.map(color => (
                        <button
                          key={color}
                          onClick={() => setNewCategory({ ...newCategory, color })}
                          className={`w-8 h-8 rounded-lg bg-${color}-500 border-2 ${
                            newCategory.color === color ? 'border-neutral-900 dark:border-white scale-110' : 'border-transparent'
                          } transition-all`}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={addCategory}
                      disabled={!newCategory.name.trim()}
                      className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                    >
                      Add Category
                    </button>
                    <button
                      onClick={() => {
                        setIsAddingCategory(false);
                        setNewCategory({ name: '', amount: 0, color: 'blue' });
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
              <div className="sticky top-0 bg-gradient-to-r from-blue-500 to-cyan-600 p-6 flex items-center justify-between z-10">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Budget Planner Guide</h2>
                    <p className="text-blue-100 text-sm">Manage your monthly budget</p>
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
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-3">💰 Overview</h3>
                  <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed">
                    Budget Planner helps you manage monthly finances with visual expense tracking. Monitor income vs expenses, track spending by category with percentage breakdowns, set savings goals, view recent transactions, and maintain financial health with clear budget visualization.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-3">✨ Key Features</h3>
                  <div className="grid gap-3">
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-900 dark:text-blue-400 mb-1">📊 Income & Expense Summary</h4>
                      <p className="text-sm text-blue-800 dark:text-blue-300">View total income, expenses, and savings at a glance.</p>
                    </div>
                    <div className="bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-200 dark:border-cyan-800 rounded-lg p-4">
                      <h4 className="font-semibold text-cyan-900 dark:text-cyan-400 mb-1">📈 Category Breakdown</h4>
                      <p className="text-sm text-cyan-800 dark:text-cyan-300">Track spending across categories with visual progress bars.</p>
                    </div>
                    <div className="bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 rounded-lg p-4">
                      <h4 className="font-semibold text-teal-900 dark:text-teal-400 mb-1">🎯 Savings Goals</h4>
                      <p className="text-sm text-teal-800 dark:text-teal-300">Set and track progress toward savings goals like emergency fund.</p>
                    </div>
                    <div className="bg-sky-50 dark:bg-sky-900/20 border border-sky-200 dark:border-sky-800 rounded-lg p-4">
                      <h4 className="font-semibold text-sky-900 dark:text-sky-400 mb-1">💳 Transaction History</h4>
                      <p className="text-sm text-sky-800 dark:text-sky-300">View recent transactions with amounts and categories.</p>
                    </div>
                    <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-4">
                      <h4 className="font-semibold text-indigo-900 dark:text-indigo-400 mb-1">📉 Savings Rate</h4>
                      <p className="text-sm text-indigo-800 dark:text-indigo-300">Calculate and display your monthly savings percentage.</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-3">🚀 How to Use</h3>
                  <div className="space-y-3">
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold">1</div>
                      <div>
                        <p className="font-semibold text-neutral-900 dark:text-white">Set Income</p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">Enter your total monthly income in the summary card.</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold">2</div>
                      <div>
                        <p className="font-semibold text-neutral-900 dark:text-white">Add Expense Categories</p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">Click "Add Expense" to create spending categories with amounts.</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold">3</div>
                      <div>
                        <p className="font-semibold text-neutral-900 dark:text-white">Monitor Breakdown</p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">View expense breakdown with percentages and progress bars.</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold">4</div>
                      <div>
                        <p className="font-semibold text-neutral-900 dark:text-white">Track Savings</p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">Check savings card to see how much you're saving monthly.</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold">5</div>
                      <div>
                        <p className="font-semibold text-neutral-900 dark:text-white">Set Goals</p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">Create savings goals and track progress with visual indicators.</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold">6</div>
                      <div>
                        <p className="font-semibold text-neutral-900 dark:text-white">Review Transactions</p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">Check recent transactions section for spending history.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-3">💡 Pro Tips</h3>
                  <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 space-y-2">
                    <p className="text-sm text-neutral-700 dark:text-neutral-300">✅ <strong>50/30/20 rule</strong> - Allocate 50% needs, 30% wants, 20% savings</p>
                    <p className="text-sm text-neutral-700 dark:text-neutral-300">✅ <strong>Track everything</strong> - Include all expenses for accurate budgeting</p>
                    <p className="text-sm text-neutral-700 dark:text-neutral-300">✅ <strong>Review monthly</strong> - Adjust categories based on actual spending</p>
                    <p className="text-sm text-neutral-700 dark:text-neutral-300">✅ <strong>Emergency fund first</strong> - Prioritize 3-6 months of expenses</p>
                    <p className="text-sm text-neutral-700 dark:text-neutral-300">✅ <strong>Automate savings</strong> - Set up automatic transfers to savings goals</p>
                    <p className="text-sm text-neutral-700 dark:text-neutral-300">✅ <strong>Be realistic</strong> - Base budgets on actual spending patterns</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-3">💾 Data Storage</h3>
                  <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-4">
                    <p className="text-sm text-emerald-800 dark:text-emerald-300 leading-relaxed">
                      <strong>Your budget data is automatically saved locally.</strong> All income, expenses, categories, and savings goals are stored in your browser's local storage. Look for the "Saving..." indicator to confirm storage.
                    </p>
                  </div>
                </div>
              </div>

              <div className="sticky bottom-0 bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-700 p-6">
                <button
                  onClick={() => setShowDocumentation(false)}
                  className="w-full px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-lg hover:opacity-90 transition-opacity font-medium"
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
