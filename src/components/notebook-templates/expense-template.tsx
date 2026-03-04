"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TemplateHeader } from './template-header';
import { TemplateFooter } from './template-footer';
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
  AlertCircle,
  Info,
  X
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

const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'CHF', symbol: 'Fr', name: 'Swiss Franc' },
  { code: 'SEK', symbol: 'kr', name: 'Swedish Krona' },
  { code: 'NZD', symbol: 'NZ$', name: 'New Zealand Dollar' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
  { code: 'HKD', symbol: 'HK$', name: 'Hong Kong Dollar' },
  { code: 'NOK', symbol: 'kr', name: 'Norwegian Krone' },
  { code: 'KRW', symbol: '₩', name: 'South Korean Won' },
  { code: 'MXN', symbol: 'Mex$', name: 'Mexican Peso' },
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real' },
  { code: 'ZAR', symbol: 'R', name: 'South African Rand' },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham' },
  { code: 'SAR', symbol: '﷼', name: 'Saudi Riyal' },
];

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
  const [currency, setCurrency] = useState<string>('USD');
  
  const [isAddingTransaction, setIsAddingTransaction] = useState(false);
  const [newTransaction, setNewTransaction] = useState<Partial<Transaction>>({
    type: 'expense',
    amount: 0,
    category: 'food',
    description: '',
    date: new Date().toISOString().split('T')[0],
  });
  const [searchDate, setSearchDate] = useState('');
  const [viewMode, setViewMode] = useState<'month' | 'date'>('month');
  
  const [isAddingBudget, setIsAddingBudget] = useState(false);
  const [newBudget, setNewBudget] = useState<Partial<Budget>>({
    category: 'food',
    limit: 0,
    period: 'monthly'
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
        localStorage.setItem(`expense-${notebookId}`, JSON.stringify({ transactions, budgets, currency }));
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
        setCurrency(data.currency || 'USD');
      }
    } catch (error) {
      console.error("Failed to load:", error);
    }
  }, [notebookId]);

  useEffect(() => {
    saveData();
  }, [transactions, budgets, currency]);

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
    let filtered = viewMode === 'month' ? monthlyStats.transactions : transactions;
    
    // Filter by search date if provided
    if (searchDate) {
      filtered = filtered.filter(t => t.date === searchDate);
    }
    
    return filtered.filter(t => {
      if (filterType !== 'all' && t.type !== filterType) return false;
      if (filterCategory !== 'all' && t.category !== filterCategory) return false;
      return true;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [monthlyStats, transactions, filterType, filterCategory, searchDate, viewMode]);

  // Quick date selection helper
  const setQuickDate = (daysFromNow: number) => {
    const date = new Date();
    date.setDate(date.getDate() + daysFromNow);
    const formattedDate = date.toISOString().split('T')[0];
    setNewTransaction({ ...newTransaction, date: formattedDate });
  };

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
    const selectedCurrency = CURRENCIES.find(c => c.code === currency);
    if (selectedCurrency) {
      try {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency }).format(amount);
      } catch (error) {
        return `${selectedCurrency.symbol}${amount.toFixed(2)}`;
      }
    }
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
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-neutral-950 dark:to-neutral-900">
      <TemplateHeader title={title} />
      <div className="flex-1 overflow-y-auto">
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
              {/* Currency Selector */}
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="px-3 py-2 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm font-medium text-neutral-900 dark:text-white hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors cursor-pointer"
                title="Select Currency"
              >
                {CURRENCIES.map(curr => (
                  <option key={curr.code} value={curr.code}>
                    {curr.symbol} {curr.code} - {curr.name}
                  </option>
                ))}
              </select>
              
              <button
                onClick={() => setShowDocumentation(true)}
                className="p-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg hover:bg-emerald-200 dark:hover:bg-emerald-900/50 transition-colors"
                title="Documentation"
              >
                <Info className="h-4 w-4" />
              </button>
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
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Event Date *
                    </label>
                    <input
                      type="date"
                      value={newTransaction.date}
                      onChange={(e) => setNewTransaction({ ...newTransaction, date: e.target.value })}
                      className="w-full px-4 py-3 bg-white dark:bg-neutral-700 border-2 border-emerald-200 dark:border-emerald-800 rounded-lg outline-none focus:border-emerald-500 dark:focus:border-emerald-500 text-neutral-900 dark:text-white font-medium"
                    />
                    <div className="flex gap-2">
                      <button onClick={() => setQuickDate(0)} className="px-3 py-1 text-xs bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-lg hover:bg-emerald-200 dark:hover:bg-emerald-900/50 transition-colors">Today</button>
                      <button onClick={() => setQuickDate(1)} className="px-3 py-1 text-xs bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 rounded-lg hover:bg-teal-200 dark:hover:bg-teal-900/50 transition-colors">Tomorrow</button>
                      <button onClick={() => setQuickDate(-1)} className="px-3 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors">Yesterday</button>
                    </div>
                  </div>
                  
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
            {/* View Mode Toggle */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => { setViewMode('month'); setSearchDate(''); }}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  viewMode === 'month'
                    ? 'bg-emerald-500 text-white'
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                }`}
              >
                Monthly View
              </button>
              <button
                onClick={() => setViewMode('date')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  viewMode === 'date'
                    ? 'bg-emerald-500 text-white'
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                }`}
              >
                Search by Date
              </button>
            </div>

            {/* Date Search */}
            {viewMode === 'date' && (
              <div className="mb-4 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg">
                <label className="text-sm font-medium text-emerald-700 dark:text-emerald-400 mb-2 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Search Expenses by Date
                </label>
                <div className="flex gap-3 mt-2">
                  <input
                    type="date"
                    value={searchDate}
                    onChange={(e) => setSearchDate(e.target.value)}
                    className="flex-1 px-4 py-2 bg-white dark:bg-neutral-800 border border-emerald-300 dark:border-emerald-700 rounded-lg outline-none focus:border-emerald-500 text-neutral-900 dark:text-white"
                  />
                  <button
                    onClick={() => setSearchDate('')}
                    className="px-4 py-2 bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-lg hover:bg-neutral-300 dark:hover:bg-neutral-600 transition-colors"
                  >
                    Clear
                  </button>
                </div>
                {searchDate && (
                  <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-2">
                    📅 Showing expenses for {new Date(searchDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                )}
              </div>
            )}

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
                  <div className="flex gap-2 items-center">
                    <input type="date" value={newTransaction.date} onChange={(e) => setNewTransaction({ ...newTransaction, date: e.target.value })} className="px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border-2 border-emerald-300 dark:border-emerald-700 rounded-lg outline-none focus:border-emerald-500" />
                    <button onClick={() => setQuickDate(0)} className="px-2 py-2 text-xs bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-lg hover:bg-emerald-200 dark:hover:bg-emerald-900/50 transition-colors" title="Set to today">Today</button>
                  </div>
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

      {/* Documentation Modal */}
      <AnimatePresence>
        {showDocumentation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4"
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
                    <Wallet className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Expense Manager Guide</h2>
                    <p className="text-emerald-100 text-sm">Track income, expenses & budgets</p>
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
                    Expense Manager is a comprehensive financial tracking tool. Track income and expenses, set category budgets, analyze spending patterns, manage recurring transactions, and monitor your financial health with detailed analytics and visualizations.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-3">✨ Key Features</h3>
                  <div className="grid gap-3">
                    <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-4">
                      <h4 className="font-semibold text-emerald-900 dark:text-emerald-400 mb-1">💵 Income & Expense Tracking</h4>
                      <p className="text-sm text-emerald-800 dark:text-emerald-300">Record all transactions with categories, descriptions, and dates.</p>
                    </div>
                    <div className="bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 rounded-lg p-4">
                      <h4 className="font-semibold text-teal-900 dark:text-teal-400 mb-1">🎯 Budget Management</h4>
                      <p className="text-sm text-teal-800 dark:text-teal-300">Set spending limits per category and track budget progress.</p>
                    </div>
                    <div className="bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-200 dark:border-cyan-800 rounded-lg p-4">
                      <h4 className="font-semibold text-cyan-900 dark:text-cyan-400 mb-1">🔄 Recurring Transactions</h4>
                      <p className="text-sm text-cyan-800 dark:text-cyan-300">Set up daily, weekly, monthly, or yearly recurring transactions.</p>
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-900 dark:text-blue-400 mb-1">📊 Analytics & Reports</h4>
                      <p className="text-sm text-blue-800 dark:text-blue-300">View spending trends, category breakdowns, and monthly comparisons.</p>
                    </div>
                    <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-4">
                      <h4 className="font-semibold text-indigo-900 dark:text-indigo-400 mb-1">🔍 Filters & Search</h4>
                      <p className="text-sm text-indigo-800 dark:text-indigo-300">Filter by category, type, date range, and search transactions.</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-3">🚀 How to Use</h3>
                  <div className="space-y-3">
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-sm font-bold">1</div>
                      <div>
                        <p className="font-semibold text-neutral-900 dark:text-white">Add Transactions</p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">Click "Add Transaction" to record income or expenses with category and details.</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-sm font-bold">2</div>
                      <div>
                        <p className="font-semibold text-neutral-900 dark:text-white">Set Budgets</p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">Go to Budgets tab, create category budgets with spending limits.</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-sm font-bold">3</div>
                      <div>
                        <p className="font-semibold text-neutral-900 dark:text-white">View Overview</p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">Overview tab shows total income, expenses, balance, and savings rate.</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-sm font-bold">4</div>
                      <div>
                        <p className="font-semibold text-neutral-900 dark:text-white">Analyze Spending</p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">Analytics tab shows category breakdowns, trends, and spending patterns.</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-sm font-bold">5</div>
                      <div>
                        <p className="font-semibold text-neutral-900 dark:text-white">Filter & Search</p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">Use filters to view specific categories, dates, or transaction types.</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-sm font-bold">6</div>
                      <div>
                        <p className="font-semibold text-neutral-900 dark:text-white">Navigate Months</p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">Use month selector to view different time periods.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-3">💡 Pro Tips</h3>
                  <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-4 space-y-2">
                    <p className="text-sm text-neutral-700 dark:text-neutral-300">✅ <strong>Categorize everything</strong> - Proper categorization enables better analytics</p>
                    <p className="text-sm text-neutral-700 dark:text-neutral-300">✅ <strong>Set realistic budgets</strong> - Base budgets on historical spending patterns</p>
                    <p className="text-sm text-neutral-700 dark:text-neutral-300">✅ <strong>Use recurring transactions</strong> - Automate tracking of regular bills and income</p>
                    <p className="text-sm text-neutral-700 dark:text-neutral-300">✅ <strong>Review monthly</strong> - Check analytics to identify spending trends</p>
                    <p className="text-sm text-neutral-700 dark:text-neutral-300">✅ <strong>Track small expenses</strong> - Small purchases add up over time</p>
                    <p className="text-sm text-neutral-700 dark:text-neutral-300">✅ <strong>Monitor budget alerts</strong> - Stay aware when approaching category limits</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-3">💾 Data Storage</h3>
                  <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-4">
                    <p className="text-sm text-emerald-800 dark:text-emerald-300 leading-relaxed">
                      <strong>Your financial data is automatically saved locally.</strong> All transactions, budgets, and settings are stored in your browser's local storage. Look for the "Saving..." indicator to confirm storage.
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
      <TemplateFooter />
    </div>
  );
}
