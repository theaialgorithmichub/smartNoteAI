"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import {
  Wallet,
  Plus,
  Loader2,
  Trash2,
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart,
  Calendar,
  Filter,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  CreditCard,
  ShoppingCart,
  Home,
  Car,
  Utensils,
  Zap,
  Heart,
  Plane,
  Gift,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Target,
  AlertCircle
} from "lucide-react";

interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
  date: string;
  recurring?: boolean;
  recurringFrequency?: 'daily' | 'weekly' | 'monthly' | 'yearly';
}

interface Budget {
  id: string;
  category: string;
  limit: number;
  spent: number;
  period: 'monthly' | 'yearly';
}

interface ExpenseTemplateProps {
  title?: string;
  notebookId?: string;
}

const CATEGORIES = {
  income: [
    { id: 'salary', name: 'Salary', icon: DollarSign, color: '#22c55e' },
    { id: 'freelance', name: 'Freelance', icon: CreditCard, color: '#10b981' },
    { id: 'investments', name: 'Investments', icon: TrendingUp, color: '#14b8a6' },
    { id: 'gifts', name: 'Gifts', icon: Gift, color: '#06b6d4' },
    { id: 'other-income', name: 'Other', icon: MoreHorizontal, color: '#0ea5e9' },
  ],
  expense: [
    { id: 'food', name: 'Food & Dining', icon: Utensils, color: '#f97316' },
    { id: 'shopping', name: 'Shopping', icon: ShoppingCart, color: '#ec4899' },
    { id: 'housing', name: 'Housing', icon: Home, color: '#8b5cf6' },
    { id: 'transport', name: 'Transport', icon: Car, color: '#6366f1' },
    { id: 'utilities', name: 'Utilities', icon: Zap, color: '#eab308' },
    { id: 'health', name: 'Health', icon: Heart, color: '#ef4444' },
    { id: 'travel', name: 'Travel', icon: Plane, color: '#0ea5e9' },
    { id: 'entertainment', name: 'Entertainment', icon: Gift, color: '#a855f7' },
    { id: 'other', name: 'Other', icon: MoreHorizontal, color: '#64748b' },
  ]
};

export function ExpenseTemplate({ title = "Expense Manager", notebookId }: ExpenseTemplateProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'budgets' | 'analytics'>('overview');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  
  const [isAddingTransaction, setIsAddingTransaction] = useState(false);
  const [newTransaction, setNewTransaction] = useState<Partial<Transaction>>({
    type: 'expense',
    amount: 0,
    category: 'food',
    description: '',
    date: new Date().toISOString().split('T')[0],
  });
  
  const [isAddingBudget, setIsAddingBudget] = useState(false);
  const [newBudget, setNewBudget] = useState<Partial<Budget>>({
    category: 'food',
    limit: 0,
    period: 'monthly'
  });
  
  const [saving, setSaving] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const saveData = () => {
    if (!notebookId) return;
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    
    saveTimeoutRef.current = setTimeout(() => {
      setSaving(true);
      try {
        localStorage.setItem(`expense-${notebookId}`, JSON.stringify({ transactions, budgets }));
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
      const saved = localStorage.getItem(`expense-${notebookId}`);
      if (saved) {
        const data = JSON.parse(saved);
        setTransactions(data.transactions || []);
        setBudgets(data.budgets || []);
      }
    } catch (error) {
      console.error("Failed to load:", error);
    }
  }, [notebookId]);

  useEffect(() => {
    saveData();
  }, [transactions, budgets]);

  // Calculate totals for selected month
  const monthlyStats = useMemo(() => {
    const monthStart = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1);
    const monthEnd = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0);
    
    const monthTransactions = transactions.filter(t => {
      const date = new Date(t.date);
      return date >= monthStart && date <= monthEnd;
    });
    
    const income = monthTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expenses = monthTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const balance = income - expenses;
    const savingsRate = income > 0 ? ((income - expenses) / income) * 100 : 0;
    
    return { income, expenses, balance, savingsRate, transactions: monthTransactions };
  }, [transactions, selectedMonth]);

  // Category breakdown
  const categoryBreakdown = useMemo(() => {
    const breakdown: Record<string, number> = {};
    monthlyStats.transactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        breakdown[t.category] = (breakdown[t.category] || 0) + t.amount;
      });
    return Object.entries(breakdown)
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount);
  }, [monthlyStats]);

  // Budget progress
  const budgetProgress = useMemo(() => {
    return budgets.map(budget => {
      const spent = monthlyStats.transactions
        .filter(t => t.type === 'expense' && t.category === budget.category)
        .reduce((sum, t) => sum + t.amount, 0);
      const percentage = budget.limit > 0 ? (spent / budget.limit) * 100 : 0;
      return { ...budget, spent, percentage };
    });
  }, [budgets, monthlyStats]);

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    return monthlyStats.transactions.filter(t => {
      if (filterType !== 'all' && t.type !== filterType) return false;
      if (filterCategory !== 'all' && t.category !== filterCategory) return false;
      return true;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [monthlyStats, filterType, filterCategory]);

  const addTransaction = () => {
    if (!newTransaction.amount || !newTransaction.category) return;
    
    const transaction: Transaction = {
      id: Date.now().toString(),
      type: newTransaction.type || 'expense',
      amount: Number(newTransaction.amount),
      category: newTransaction.category,
      description: newTransaction.description || '',
      date: newTransaction.date || new Date().toISOString().split('T')[0],
      recurring: newTransaction.recurring,
      recurringFrequency: newTransaction.recurringFrequency
    };
    
    setTransactions(prev => [transaction, ...prev]);
    setNewTransaction({
      type: 'expense',
      amount: 0,
      category: 'food',
      description: '',
      date: new Date().toISOString().split('T')[0],
    });
    setIsAddingTransaction(false);
  };

  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const addBudget = () => {
    if (!newBudget.limit || !newBudget.category) return;
    
    const budget: Budget = {
      id: Date.now().toString(),
      category: newBudget.category,
      limit: Number(newBudget.limit),
      spent: 0,
      period: newBudget.period || 'monthly'
    };
    
    setBudgets(prev => [...prev, budget]);
    setNewBudget({ category: 'food', limit: 0, period: 'monthly' });
    setIsAddingBudget(false);
  };

  const deleteBudget = (id: string) => {
    setBudgets(prev => prev.filter(b => b.id !== id));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const getCategoryInfo = (categoryId: string, type: 'income' | 'expense') => {
    const categories = type === 'income' ? CATEGORIES.income : CATEGORIES.expense;
    return categories.find(c => c.id === categoryId) || { name: categoryId, icon: MoreHorizontal, color: '#64748b' };
  };

  const changeMonth = (delta: number) => {
    setSelectedMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + delta, 1));
  };

  const exportData = () => {
    const csv = [
      ['Date', 'Type', 'Category', 'Description', 'Amount'].join(','),
      ...transactions.map(t => [t.date, t.type, t.category, `"${t.description}"`, t.amount].join(','))
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `expenses-${selectedMonth.toISOString().slice(0, 7)}.csv`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-neutral-950 dark:to-neutral-900">
      {saving && (
        <div className="fixed top-20 right-6 flex items-center gap-2 text-sm text-neutral-500 bg-white dark:bg-neutral-800 px-3 py-2 rounded-lg shadow-lg z-50">
          <Loader2 className="w-4 h-4 animate-spin" />
          Saving...
        </div>
      )}

      {/* Header */}
      <div className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm border-b border-neutral-200 dark:border-neutral-800 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                <Wallet className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-neutral-900 dark:text-white">{title}</h1>
                <p className="text-xs text-neutral-500">Track income & expenses</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Month Selector */}
              <div className="flex items-center gap-2 bg-neutral-100 dark:bg-neutral-800 rounded-lg p-1">
                <button onClick={() => changeMonth(-1)} className="p-1 hover:bg-white dark:hover:bg-neutral-700 rounded">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="px-3 font-medium text-sm">
                  {selectedMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </span>
                <button onClick={() => changeMonth(1)} className="p-1 hover:bg-white dark:hover:bg-neutral-700 rounded">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              <div className="flex gap-1 bg-neutral-100 dark:bg-neutral-800 p-1 rounded-xl">
                {[
                  { id: 'overview', label: 'Overview', icon: PieChart },
                  { id: 'transactions', label: 'Transactions', icon: CreditCard },
                  { id: 'budgets', label: 'Budgets', icon: Target },
                  { id: 'analytics', label: 'Analytics', icon: TrendingUp },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as typeof activeTab)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
                      activeTab === tab.id
                        ? 'bg-white dark:bg-neutral-700 text-emerald-600 shadow-sm'
                        : 'text-neutral-600 dark:text-neutral-400'
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    <span className="hidden md:inline">{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 border border-neutral-200 dark:border-neutral-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-neutral-500 text-sm">Income</span>
                  <ArrowUpRight className="w-5 h-5 text-green-500" />
                </div>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(monthlyStats.income)}</p>
              </div>
              
              <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 border border-neutral-200 dark:border-neutral-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-neutral-500 text-sm">Expenses</span>
                  <ArrowDownRight className="w-5 h-5 text-red-500" />
                </div>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(monthlyStats.expenses)}</p>
              </div>
              
              <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 border border-neutral-200 dark:border-neutral-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-neutral-500 text-sm">Balance</span>
                  <DollarSign className="w-5 h-5 text-blue-500" />
                </div>
                <p className={`text-2xl font-bold ${monthlyStats.balance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                  {formatCurrency(monthlyStats.balance)}
                </p>
              </div>
              
              <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 border border-neutral-200 dark:border-neutral-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-neutral-500 text-sm">Savings Rate</span>
                  <TrendingUp className="w-5 h-5 text-purple-500" />
                </div>
                <p className="text-2xl font-bold text-purple-600">{monthlyStats.savingsRate.toFixed(1)}%</p>
              </div>
            </div>

            {/* Quick Add */}
            <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 border border-neutral-200 dark:border-neutral-800">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-neutral-900 dark:text-white">Quick Add</h2>
                <button onClick={() => setIsAddingTransaction(true)} className="px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm flex items-center gap-2 hover:bg-emerald-600">
                  <Plus className="w-4 h-4" /> Add Transaction
                </button>
              </div>
              
              {isAddingTransaction && (
                <div className="grid grid-cols-1 md:grid-cols-6 gap-4 p-4 bg-neutral-50 dark:bg-neutral-800 rounded-xl">
                  <select
                    value={newTransaction.type}
                    onChange={(e) => setNewTransaction({ ...newTransaction, type: e.target.value as 'income' | 'expense', category: e.target.value === 'income' ? 'salary' : 'food' })}
                    className="px-3 py-2 bg-white dark:bg-neutral-700 rounded-lg outline-none"
                  >
                    <option value="expense">Expense</option>
                    <option value="income">Income</option>
                  </select>
                  
                  <select
                    value={newTransaction.category}
                    onChange={(e) => setNewTransaction({ ...newTransaction, category: e.target.value })}
                    className="px-3 py-2 bg-white dark:bg-neutral-700 rounded-lg outline-none"
                  >
                    {(newTransaction.type === 'income' ? CATEGORIES.income : CATEGORIES.expense).map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                  
                  <input
                    type="number"
                    value={newTransaction.amount || ''}
                    onChange={(e) => setNewTransaction({ ...newTransaction, amount: parseFloat(e.target.value) || 0 })}
                    placeholder="Amount"
                    className="px-3 py-2 bg-white dark:bg-neutral-700 rounded-lg outline-none"
                  />
                  
                  <input
                    type="text"
                    value={newTransaction.description}
                    onChange={(e) => setNewTransaction({ ...newTransaction, description: e.target.value })}
                    placeholder="Description"
                    className="px-3 py-2 bg-white dark:bg-neutral-700 rounded-lg outline-none"
                  />
                  
                  <input
                    type="date"
                    value={newTransaction.date}
                    onChange={(e) => setNewTransaction({ ...newTransaction, date: e.target.value })}
                    className="px-3 py-2 bg-white dark:bg-neutral-700 rounded-lg outline-none"
                  />
                  
                  <div className="flex gap-2">
                    <button onClick={addTransaction} className="flex-1 px-4 py-2 bg-emerald-500 text-white rounded-lg">Add</button>
                    <button onClick={() => setIsAddingTransaction(false)} className="px-4 py-2 text-neutral-500">Cancel</button>
                  </div>
                </div>
              )}
            </div>

            {/* Category Breakdown & Recent */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Category Breakdown */}
              <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 border border-neutral-200 dark:border-neutral-800">
                <h2 className="font-semibold text-neutral-900 dark:text-white mb-4">Spending by Category</h2>
                {categoryBreakdown.length > 0 ? (
                  <div className="space-y-3">
                    {categoryBreakdown.slice(0, 6).map(item => {
                      const cat = getCategoryInfo(item.category, 'expense');
                      const percentage = monthlyStats.expenses > 0 ? (item.amount / monthlyStats.expenses) * 100 : 0;
                      return (
                        <div key={item.category} className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: cat.color + '20' }}>
                            <cat.icon className="w-4 h-4" style={{ color: cat.color }} />
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between text-sm mb-1">
                              <span className="font-medium">{cat.name}</span>
                              <span>{formatCurrency(item.amount)}</span>
                            </div>
                            <div className="h-2 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                              <div className="h-full rounded-full" style={{ width: `${percentage}%`, backgroundColor: cat.color }} />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-neutral-400 text-center py-8">No expenses this month</p>
                )}
              </div>

              {/* Recent Transactions */}
              <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 border border-neutral-200 dark:border-neutral-800">
                <h2 className="font-semibold text-neutral-900 dark:text-white mb-4">Recent Transactions</h2>
                {monthlyStats.transactions.length > 0 ? (
                  <div className="space-y-3">
                    {monthlyStats.transactions.slice(0, 6).map(t => {
                      const cat = getCategoryInfo(t.category, t.type);
                      return (
                        <div key={t.id} className="flex items-center gap-3 p-2 hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded-lg">
                          <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: cat.color + '20' }}>
                            <cat.icon className="w-5 h-5" style={{ color: cat.color }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-neutral-900 dark:text-white truncate">{t.description || cat.name}</p>
                            <p className="text-xs text-neutral-500">{new Date(t.date).toLocaleDateString()}</p>
                          </div>
                          <span className={`font-semibold ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                            {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-neutral-400 text-center py-8">No transactions this month</p>
                )}
              </div>
            </div>

            {/* Budget Alerts */}
            {budgetProgress.filter(b => b.percentage >= 80).length > 0 && (
              <div className="bg-amber-50 dark:bg-amber-900/20 rounded-2xl p-6 border border-amber-200 dark:border-amber-800">
                <h2 className="font-semibold text-amber-800 dark:text-amber-200 mb-4 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" /> Budget Alerts
                </h2>
                <div className="space-y-2">
                  {budgetProgress.filter(b => b.percentage >= 80).map(b => {
                    const cat = getCategoryInfo(b.category, 'expense');
                    return (
                      <div key={b.id} className="flex items-center gap-3 p-3 bg-white dark:bg-neutral-800 rounded-lg">
                        <cat.icon className="w-5 h-5" style={{ color: cat.color }} />
                        <span className="flex-1">{cat.name}</span>
                        <span className={`font-semibold ${b.percentage >= 100 ? 'text-red-600' : 'text-amber-600'}`}>
                          {b.percentage.toFixed(0)}% used
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Transactions Tab */}
        {activeTab === 'transactions' && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="flex items-center gap-4 flex-wrap">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as typeof filterType)}
                className="px-4 py-2 bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 outline-none"
              >
                <option value="all">All Types</option>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
              
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-4 py-2 bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 outline-none"
              >
                <option value="all">All Categories</option>
                {[...CATEGORIES.income, ...CATEGORIES.expense].map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
              
              <div className="flex-1" />
              
              <button onClick={exportData} className="px-4 py-2 bg-neutral-100 dark:bg-neutral-800 rounded-lg flex items-center gap-2 hover:bg-neutral-200">
                <Download className="w-4 h-4" /> Export CSV
              </button>
              
              <button onClick={() => setIsAddingTransaction(true)} className="px-4 py-2 bg-emerald-500 text-white rounded-lg flex items-center gap-2 hover:bg-emerald-600">
                <Plus className="w-4 h-4" /> Add
              </button>
            </div>

            {/* Add Transaction Form */}
            {isAddingTransaction && (
              <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 border border-neutral-200 dark:border-neutral-800">
                <h3 className="font-semibold mb-4">Add Transaction</h3>
                <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                  <select value={newTransaction.type} onChange={(e) => setNewTransaction({ ...newTransaction, type: e.target.value as 'income' | 'expense', category: e.target.value === 'income' ? 'salary' : 'food' })} className="px-3 py-2 bg-neutral-50 dark:bg-neutral-800 rounded-lg outline-none">
                    <option value="expense">Expense</option>
                    <option value="income">Income</option>
                  </select>
                  <select value={newTransaction.category} onChange={(e) => setNewTransaction({ ...newTransaction, category: e.target.value })} className="px-3 py-2 bg-neutral-50 dark:bg-neutral-800 rounded-lg outline-none">
                    {(newTransaction.type === 'income' ? CATEGORIES.income : CATEGORIES.expense).map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                  <input type="number" value={newTransaction.amount || ''} onChange={(e) => setNewTransaction({ ...newTransaction, amount: parseFloat(e.target.value) || 0 })} placeholder="Amount" className="px-3 py-2 bg-neutral-50 dark:bg-neutral-800 rounded-lg outline-none" />
                  <input type="text" value={newTransaction.description} onChange={(e) => setNewTransaction({ ...newTransaction, description: e.target.value })} placeholder="Description" className="px-3 py-2 bg-neutral-50 dark:bg-neutral-800 rounded-lg outline-none" />
                  <input type="date" value={newTransaction.date} onChange={(e) => setNewTransaction({ ...newTransaction, date: e.target.value })} className="px-3 py-2 bg-neutral-50 dark:bg-neutral-800 rounded-lg outline-none" />
                  <div className="flex gap-2">
                    <button onClick={addTransaction} className="flex-1 px-4 py-2 bg-emerald-500 text-white rounded-lg">Add</button>
                    <button onClick={() => setIsAddingTransaction(false)} className="px-4 py-2 text-neutral-500">Cancel</button>
                  </div>
                </div>
              </div>
            )}

            {/* Transaction List */}
            <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
              {filteredTransactions.length > 0 ? (
                <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                  {filteredTransactions.map(t => {
                    const cat = getCategoryInfo(t.category, t.type);
                    return (
                      <div key={t.id} className="flex items-center gap-4 p-4 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 group">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: cat.color + '20' }}>
                          <cat.icon className="w-6 h-6" style={{ color: cat.color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-neutral-900 dark:text-white">{t.description || cat.name}</p>
                          <p className="text-sm text-neutral-500">{cat.name} • {new Date(t.date).toLocaleDateString()}</p>
                        </div>
                        <span className={`text-lg font-semibold ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                          {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                        </span>
                        <button onClick={() => deleteTransaction(t.id)} className="p-2 text-neutral-400 hover:text-red-500 opacity-0 group-hover:opacity-100">
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 text-neutral-400">
                  <CreditCard className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No transactions found</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Budgets Tab */}
        {activeTab === 'budgets' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-neutral-900 dark:text-white">Monthly Budgets</h2>
              <button onClick={() => setIsAddingBudget(true)} className="px-4 py-2 bg-emerald-500 text-white rounded-lg flex items-center gap-2 hover:bg-emerald-600">
                <Plus className="w-4 h-4" /> Add Budget
              </button>
            </div>

            {isAddingBudget && (
              <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 border border-neutral-200 dark:border-neutral-800">
                <h3 className="font-semibold mb-4">Create Budget</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <select value={newBudget.category} onChange={(e) => setNewBudget({ ...newBudget, category: e.target.value })} className="px-3 py-2 bg-neutral-50 dark:bg-neutral-800 rounded-lg outline-none">
                    {CATEGORIES.expense.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                  <input type="number" value={newBudget.limit || ''} onChange={(e) => setNewBudget({ ...newBudget, limit: parseFloat(e.target.value) || 0 })} placeholder="Budget Limit" className="px-3 py-2 bg-neutral-50 dark:bg-neutral-800 rounded-lg outline-none" />
                  <select value={newBudget.period} onChange={(e) => setNewBudget({ ...newBudget, period: e.target.value as 'monthly' | 'yearly' })} className="px-3 py-2 bg-neutral-50 dark:bg-neutral-800 rounded-lg outline-none">
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                  <div className="flex gap-2">
                    <button onClick={addBudget} className="flex-1 px-4 py-2 bg-emerald-500 text-white rounded-lg">Create</button>
                    <button onClick={() => setIsAddingBudget(false)} className="px-4 py-2 text-neutral-500">Cancel</button>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {budgetProgress.map(budget => {
                const cat = getCategoryInfo(budget.category, 'expense');
                const isOverBudget = budget.percentage > 100;
                const isNearLimit = budget.percentage >= 80 && budget.percentage <= 100;
                
                return (
                  <div key={budget.id} className={`bg-white dark:bg-neutral-900 rounded-2xl p-6 border ${isOverBudget ? 'border-red-300 dark:border-red-800' : isNearLimit ? 'border-amber-300 dark:border-amber-800' : 'border-neutral-200 dark:border-neutral-800'}`}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: cat.color + '20' }}>
                          <cat.icon className="w-5 h-5" style={{ color: cat.color }} />
                        </div>
                        <div>
                          <p className="font-semibold text-neutral-900 dark:text-white">{cat.name}</p>
                          <p className="text-sm text-neutral-500">{budget.period}</p>
                        </div>
                      </div>
                      <button onClick={() => deleteBudget(budget.id)} className="p-2 text-neutral-400 hover:text-red-500">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-neutral-500">Spent</span>
                        <span className={`font-semibold ${isOverBudget ? 'text-red-600' : ''}`}>
                          {formatCurrency(budget.spent)} / {formatCurrency(budget.limit)}
                        </span>
                      </div>
                      <div className="h-3 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all ${isOverBudget ? 'bg-red-500' : isNearLimit ? 'bg-amber-500' : 'bg-emerald-500'}`}
                          style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className={`${isOverBudget ? 'text-red-600' : isNearLimit ? 'text-amber-600' : 'text-emerald-600'}`}>
                          {budget.percentage.toFixed(0)}% used
                        </span>
                        <span className="text-neutral-500">
                          {formatCurrency(Math.max(0, budget.limit - budget.spent))} remaining
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {budgetProgress.length === 0 && (
                <div className="md:col-span-2 text-center py-12 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800">
                  <Target className="w-12 h-12 mx-auto mb-4 text-neutral-300" />
                  <p className="text-neutral-400">No budgets set</p>
                  <p className="text-sm text-neutral-400">Create budgets to track your spending limits</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            {/* Monthly Trend */}
            <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 border border-neutral-200 dark:border-neutral-800">
              <h2 className="font-semibold text-neutral-900 dark:text-white mb-6">Monthly Summary</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-600">{formatCurrency(monthlyStats.income)}</p>
                  <p className="text-sm text-neutral-500 mt-1">Total Income</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-red-600">{formatCurrency(monthlyStats.expenses)}</p>
                  <p className="text-sm text-neutral-500 mt-1">Total Expenses</p>
                </div>
                <div className="text-center">
                  <p className={`text-3xl font-bold ${monthlyStats.balance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>{formatCurrency(monthlyStats.balance)}</p>
                  <p className="text-sm text-neutral-500 mt-1">Net Balance</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-purple-600">{monthlyStats.transactions.length}</p>
                  <p className="text-sm text-neutral-500 mt-1">Transactions</p>
                </div>
              </div>
            </div>

            {/* Top Spending Categories */}
            <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 border border-neutral-200 dark:border-neutral-800">
              <h2 className="font-semibold text-neutral-900 dark:text-white mb-4">Top Spending Categories</h2>
              {categoryBreakdown.length > 0 ? (
                <div className="space-y-4">
                  {categoryBreakdown.map((item, index) => {
                    const cat = getCategoryInfo(item.category, 'expense');
                    const percentage = monthlyStats.expenses > 0 ? (item.amount / monthlyStats.expenses) * 100 : 0;
                    return (
                      <div key={item.category} className="flex items-center gap-4">
                        <span className="w-6 text-center font-bold text-neutral-400">#{index + 1}</span>
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: cat.color + '20' }}>
                          <cat.icon className="w-5 h-5" style={{ color: cat.color }} />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between mb-1">
                            <span className="font-medium">{cat.name}</span>
                            <span className="font-semibold">{formatCurrency(item.amount)}</span>
                          </div>
                          <div className="h-2 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                            <div className="h-full rounded-full" style={{ width: `${percentage}%`, backgroundColor: cat.color }} />
                          </div>
                        </div>
                        <span className="text-sm text-neutral-500 w-12 text-right">{percentage.toFixed(1)}%</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-neutral-400 text-center py-8">No expense data for this month</p>
              )}
            </div>

            {/* All-time Stats */}
            <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 border border-neutral-200 dark:border-neutral-800">
              <h2 className="font-semibold text-neutral-900 dark:text-white mb-4">All-Time Statistics</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <p className="text-2xl font-bold text-neutral-900 dark:text-white">{transactions.length}</p>
                  <p className="text-sm text-neutral-500">Total Transactions</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0))}
                  </p>
                  <p className="text-sm text-neutral-500">Total Income</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-red-600">
                    {formatCurrency(transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0))}
                  </p>
                  <p className="text-sm text-neutral-500">Total Expenses</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-600">
                    {formatCurrency(
                      transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0) -
                      transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
                    )}
                  </p>
                  <p className="text-sm text-neutral-500">Net Worth Change</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
