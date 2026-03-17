import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { useTheme } from '../../hooks/useTheme';
import { Notebook, Page } from '../../types';

interface ExpenseTemplateProps {
  notebook: Notebook;
  pages: Page[];
  currentPage: Page | null;
  pageIndex: number;
  onPageChange: (index: number) => void;
}

interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
}

const CATEGORIES = [
  { id: 'food', label: 'Food', icon: '🍔', color: '#f59e0b' },
  { id: 'transport', label: 'Transport', icon: '🚗', color: '#3b82f6' },
  { id: 'shopping', label: 'Shopping', icon: '🛍️', color: '#ec4899' },
  { id: 'bills', label: 'Bills', icon: '📄', color: '#ef4444' },
  { id: 'health', label: 'Health', icon: '💊', color: '#10b981' },
  { id: 'other', label: 'Other', icon: '📦', color: '#6b7280' },
];

export const ExpenseTemplate: React.FC<ExpenseTemplateProps> = ({ notebook }) => {
  const { colors, isDark } = useTheme();
  const themeColor = notebook.appearance?.themeColor || '#22c55e';

  const [expenses, setExpenses] = useState<Expense[]>([
    { id: '1', description: 'Grocery shopping', amount: 52.40, category: 'food', date: format(new Date(), 'yyyy-MM-dd') },
    { id: '2', description: 'Uber ride', amount: 12.50, category: 'transport', date: format(new Date(), 'yyyy-MM-dd') },
    { id: '3', description: 'Electric bill', amount: 85.00, category: 'bills', date: format(new Date(), 'yyyy-MM-dd') },
  ]);
  const [budget, setBudget] = useState('500');
  const [newDesc, setNewDesc] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newCategory, setNewCategory] = useState('food');

  const total = expenses.reduce((sum, e) => sum + e.amount, 0);
  const budgetNum = parseFloat(budget) || 0;
  const remaining = budgetNum - total;
  const progress = budgetNum > 0 ? Math.min(100, (total / budgetNum) * 100) : 0;

  const addExpense = () => {
    if (newDesc.trim() && newAmount) {
      setExpenses((prev) => [
        {
          id: Date.now().toString(),
          description: newDesc.trim(),
          amount: parseFloat(newAmount),
          category: newCategory,
          date: format(new Date(), 'yyyy-MM-dd'),
        },
        ...prev,
      ]);
      setNewDesc('');
      setNewAmount('');
    }
  };

  const deleteExpense = (id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  };

  const getCategoryInfo = (id: string) => {
    return CATEGORIES.find((c) => c.id === id) || CATEGORIES[5];
  };

  const categoryTotals = CATEGORIES.map((cat) => ({
    ...cat,
    total: expenses.filter((e) => e.category === cat.id).reduce((s, e) => s + e.amount, 0),
  })).filter((c) => c.total > 0);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: isDark ? '#0c0a09' : '#f0fdf4' }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Budget Overview */}
      <View style={[styles.header, { backgroundColor: themeColor }]}>
        <Text style={styles.headerTitle}>Expense Tracker</Text>
        <Text style={styles.headerMonth}>{format(new Date(), 'MMMM yyyy')}</Text>

        <View style={styles.budgetRow}>
          <View>
            <Text style={styles.budgetLabel}>Total Spent</Text>
            <Text style={styles.budgetAmount}>${total.toFixed(2)}</Text>
          </View>
          <View style={styles.budgetInputWrap}>
            <Text style={styles.budgetLabel}>Budget</Text>
            <View style={styles.budgetInputRow}>
              <Text style={styles.budgetCurrency}>$</Text>
              <TextInput
                value={budget}
                onChangeText={setBudget}
                keyboardType="numeric"
                style={styles.budgetInput}
                placeholderTextColor="rgba(255,255,255,0.6)"
              />
            </View>
          </View>
          <View>
            <Text style={styles.budgetLabel}>Remaining</Text>
            <Text style={[styles.budgetAmount, { color: remaining < 0 ? '#fca5a5' : '#bbf7d0' }]}>
              ${remaining.toFixed(2)}
            </Text>
          </View>
        </View>

        {/* Progress */}
        <View style={styles.progressBarContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${progress}%` as any,
                  backgroundColor: progress > 80 ? '#ef4444' : '#bbf7d0',
                },
              ]}
            />
          </View>
          <Text style={styles.progressText}>{progress.toFixed(0)}% of budget used</Text>
        </View>
      </View>

      {/* Category breakdown */}
      {categoryTotals.length > 0 && (
        <View style={[styles.section, { backgroundColor: isDark ? '#1c1917' : '#fff' }]}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>By Category</Text>
          <View style={styles.categoryGrid}>
            {categoryTotals.map((cat) => (
              <View
                key={cat.id}
                style={[styles.categoryCard, { backgroundColor: `${cat.color}15` }]}
              >
                <Text style={styles.categoryIcon}>{cat.icon}</Text>
                <Text style={[styles.categoryLabel, { color: colors.foreground }]}>{cat.label}</Text>
                <Text style={[styles.categoryTotal, { color: cat.color }]}>
                  ${cat.total.toFixed(2)}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Add Expense */}
      <View style={[styles.section, { backgroundColor: isDark ? '#1c1917' : '#fff' }]}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Add Expense</Text>

        {/* Category selector */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catRow}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              onPress={() => setNewCategory(cat.id)}
              style={[
                styles.catOption,
                {
                  backgroundColor:
                    newCategory === cat.id ? `${cat.color}20` : (isDark ? '#292524' : '#f1f5f9'),
                  borderColor: newCategory === cat.id ? cat.color : 'transparent',
                },
              ]}
            >
              <Text>{cat.icon}</Text>
              <Text style={[styles.catLabel, { color: newCategory === cat.id ? cat.color : colors.mutedForeground }]}>
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.addRow}>
          <TextInput
            value={newDesc}
            onChangeText={setNewDesc}
            placeholder="Description"
            placeholderTextColor={colors.mutedForeground}
            style={[styles.addInput, { flex: 2, color: colors.foreground, borderColor: colors.border }]}
          />
          <TextInput
            value={newAmount}
            onChangeText={setNewAmount}
            placeholder="$0.00"
            placeholderTextColor={colors.mutedForeground}
            keyboardType="numeric"
            style={[styles.addInput, { flex: 1, color: colors.foreground, borderColor: colors.border }]}
          />
          <TouchableOpacity onPress={addExpense} style={[styles.addBtn, { backgroundColor: themeColor }]}>
            <Ionicons name="add" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Expense list */}
      <View style={styles.expenseList}>
        {expenses.map((expense) => {
          const cat = getCategoryInfo(expense.category);
          return (
            <View
              key={expense.id}
              style={[styles.expenseItem, { backgroundColor: isDark ? '#1c1917' : '#fff', borderColor: colors.border }]}
            >
              <View style={[styles.expenseIcon, { backgroundColor: `${cat.color}20` }]}>
                <Text style={styles.expenseIconText}>{cat.icon}</Text>
              </View>
              <View style={styles.expenseDetails}>
                <Text style={[styles.expenseDesc, { color: colors.foreground }]}>
                  {expense.description}
                </Text>
                <Text style={[styles.expenseDate, { color: colors.mutedForeground }]}>
                  {cat.label} • {format(new Date(expense.date), 'MMM d')}
                </Text>
              </View>
              <Text style={[styles.expenseAmount, { color: colors.foreground }]}>
                ${expense.amount.toFixed(2)}
              </Text>
              <TouchableOpacity onPress={() => deleteExpense(expense.id)}>
                <Ionicons name="close" size={16} color="#9ca3af" />
              </TouchableOpacity>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    padding: 20,
    paddingTop: 24,
    paddingBottom: 24,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '800',
  },
  headerMonth: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
    marginTop: 2,
    marginBottom: 20,
  },
  budgetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  budgetLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    marginBottom: 4,
  },
  budgetAmount: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '800',
  },
  budgetInputWrap: {},
  budgetInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  budgetCurrency: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },
  budgetInput: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '800',
    minWidth: 80,
  },
  progressBarContainer: {
    gap: 6,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 11,
  },
  section: {
    margin: 12,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 12,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryCard: {
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
    gap: 4,
    minWidth: 72,
  },
  categoryIcon: {
    fontSize: 20,
  },
  categoryLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  categoryTotal: {
    fontSize: 13,
    fontWeight: '700',
  },
  catRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  catOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1.5,
    gap: 4,
  },
  catLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  addRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  addInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 9,
    fontSize: 13,
  },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  expenseList: {
    paddingHorizontal: 12,
    gap: 8,
    paddingBottom: 40,
  },
  expenseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    gap: 10,
  },
  expenseIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  expenseIconText: {
    fontSize: 18,
  },
  expenseDetails: {
    flex: 1,
  },
  expenseDesc: {
    fontSize: 14,
    fontWeight: '500',
  },
  expenseDate: {
    fontSize: 12,
    marginTop: 2,
  },
  expenseAmount: {
    fontSize: 15,
    fontWeight: '700',
  },
});
