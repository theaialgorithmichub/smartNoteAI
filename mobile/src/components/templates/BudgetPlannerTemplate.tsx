import React, { useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../hooks/useTheme';
import { Notebook, Page } from '../../types';

interface BudgetPlannerTemplateProps {
  notebook: Notebook;
  pages: Page[];
  currentPage: Page | null;
  pageIndex: number;
  onPageChange: (index: number) => void;
}

interface BudgetItem {
  id: string;
  label: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
}

const EXPENSE_CATEGORIES = ['Housing', 'Food', 'Transport', 'Health', 'Entertainment', 'Savings', 'Other'];

export const BudgetPlannerTemplate: React.FC<BudgetPlannerTemplateProps> = ({ notebook }) => {
  const { colors, isDark } = useTheme();
  const themeColor = notebook.appearance?.themeColor || '#22c55e';

  const [items, setItems] = useState<BudgetItem[]>([
    { id: '1', label: 'Monthly Salary', amount: 5000, type: 'income', category: 'Income' },
    { id: '2', label: 'Freelance', amount: 500, type: 'income', category: 'Income' },
    { id: '3', label: 'Rent', amount: 1500, type: 'expense', category: 'Housing' },
    { id: '4', label: 'Groceries', amount: 300, type: 'expense', category: 'Food' },
    { id: '5', label: 'Savings Goal', amount: 600, type: 'expense', category: 'Savings' },
  ]);
  const [newLabel, setNewLabel] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newType, setNewType] = useState<'income' | 'expense'>('expense');
  const [newCategory, setNewCategory] = useState('Other');
  const [savingsGoal, setSavingsGoal] = useState('1000');
  const [activeTab, setActiveTab] = useState<'overview' | 'income' | 'expenses'>('overview');

  const totalIncome = items.filter((i) => i.type === 'income').reduce((s, i) => s + i.amount, 0);
  const totalExpenses = items.filter((i) => i.type === 'expense').reduce((s, i) => s + i.amount, 0);
  const balance = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;

  const addItem = () => {
    if (!newLabel.trim() || !newAmount) return;
    setItems((p) => [...p, {
      id: Date.now().toString(),
      label: newLabel.trim(),
      amount: parseFloat(newAmount),
      type: newType,
      category: newType === 'income' ? 'Income' : newCategory,
    }]);
    setNewLabel(''); setNewAmount('');
  };

  const removeItem = (id: string) => setItems((p) => p.filter((i) => i.id !== id));

  const categoryTotals = EXPENSE_CATEGORIES.map((cat) => ({
    cat,
    total: items.filter((i) => i.type === 'expense' && i.category === cat).reduce((s, i) => s + i.amount, 0),
  })).filter((c) => c.total > 0);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: isDark ? '#0c0a09' : '#f0fdf4' }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Summary header */}
      <LinearGradient colors={[themeColor, `${themeColor}99`]} style={styles.header}>
        <Text style={styles.headerTitle}>Budget Planner</Text>
        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Income</Text>
            <Text style={styles.summaryAmount}>${totalIncome.toLocaleString()}</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Expenses</Text>
            <Text style={styles.summaryAmount}>${totalExpenses.toLocaleString()}</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Balance</Text>
            <Text style={[styles.summaryAmount, { color: balance >= 0 ? '#bbf7d0' : '#fca5a5' }]}>
              ${balance.toLocaleString()}
            </Text>
          </View>
        </View>
      </LinearGradient>

      {/* Savings bar */}
      <View style={[styles.savingsSection, { backgroundColor: isDark ? '#1c1917' : '#fff' }]}>
        <View style={styles.savingsHeader}>
          <Text style={[styles.savingsTitle, { color: colors.foreground }]}>Savings Rate</Text>
          <Text style={[styles.savingsRate, { color: themeColor }]}>{savingsRate.toFixed(1)}%</Text>
        </View>
        <View style={[styles.savingsBar, { backgroundColor: isDark ? '#292524' : '#f1f5f9' }]}>
          <LinearGradient
            colors={[themeColor, `${themeColor}99`]}
            style={[styles.savingsFill, { width: `${Math.min(100, Math.max(0, savingsRate))}%` as any }]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          />
        </View>
        <View style={styles.savingsGoalRow}>
          <Text style={[styles.savingsGoalLabel, { color: colors.mutedForeground }]}>Monthly savings goal: $</Text>
          <TextInput
            value={savingsGoal}
            onChangeText={setSavingsGoal}
            keyboardType="numeric"
            style={[styles.savingsGoalInput, { color: colors.foreground, borderColor: colors.border }]}
          />
        </View>
      </View>

      {/* Tabs */}
      <View style={[styles.tabs, { backgroundColor: isDark ? '#1c1917' : '#f5f5f4' }]}>
        {(['overview', 'income', 'expenses'] as const).map((tab) => (
          <TouchableOpacity key={tab} onPress={() => setActiveTab(tab)}
            style={[styles.tab, activeTab === tab && { backgroundColor: themeColor }]}>
            <Text style={[styles.tabText, { color: activeTab === tab ? '#fff' : colors.foreground }]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {activeTab === 'overview' ? (
        <View style={[styles.section, { backgroundColor: isDark ? '#1c1917' : '#fff' }]}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Expense Breakdown</Text>
          {categoryTotals.map(({ cat, total }) => (
            <View key={cat} style={styles.categoryBarRow}>
              <Text style={[styles.catBarLabel, { color: colors.foreground }]}>{cat}</Text>
              <View style={[styles.catBar, { backgroundColor: isDark ? '#292524' : '#f1f5f9' }]}>
                <LinearGradient
                  colors={[themeColor, `${themeColor}88`]}
                  style={[styles.catBarFill, { width: `${(total / totalExpenses) * 100}%` as any }]}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                />
              </View>
              <Text style={[styles.catBarAmount, { color: colors.mutedForeground }]}>${total}</Text>
            </View>
          ))}
        </View>
      ) : (
        <View>
          {items.filter((i) => i.type === activeTab.replace('expenses', 'expense').replace('income', 'income') as any).map((item) => (
            <View key={item.id} style={[styles.itemRow, { backgroundColor: isDark ? '#1c1917' : '#fff', borderColor: colors.border }]}>
              <View style={[styles.itemDot, { backgroundColor: item.type === 'income' ? '#10b981' : '#ef4444' }]} />
              <View style={styles.itemInfo}>
                <Text style={[styles.itemLabel, { color: colors.foreground }]}>{item.label}</Text>
                <Text style={[styles.itemCat, { color: colors.mutedForeground }]}>{item.category}</Text>
              </View>
              <Text style={[styles.itemAmount, { color: item.type === 'income' ? '#10b981' : '#ef4444' }]}>
                {item.type === 'income' ? '+' : '-'}${item.amount.toFixed(2)}
              </Text>
              <TouchableOpacity onPress={() => removeItem(item.id)}>
                <Ionicons name="close" size={16} color="#9ca3af" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      {/* Add Item */}
      <View style={[styles.addSection, { backgroundColor: isDark ? '#1c1917' : '#fff' }]}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Add Item</Text>
        <View style={styles.typeToggle}>
          {(['income', 'expense'] as const).map((t) => (
            <TouchableOpacity key={t} onPress={() => setNewType(t)}
              style={[styles.typeBtn, { backgroundColor: newType === t ? (t === 'income' ? '#10b981' : '#ef4444') : (isDark ? '#292524' : '#f5f5f4') }]}>
              <Text style={[styles.typeBtnText, { color: newType === t ? '#fff' : colors.foreground }]}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.addRow}>
          <TextInput value={newLabel} onChangeText={setNewLabel} placeholder="Label" placeholderTextColor={colors.mutedForeground}
            style={[styles.addInput, { flex: 2, color: colors.foreground, borderColor: colors.border }]} />
          <TextInput value={newAmount} onChangeText={setNewAmount} placeholder="Amount" placeholderTextColor={colors.mutedForeground}
            keyboardType="numeric" style={[styles.addInput, { flex: 1, color: colors.foreground, borderColor: colors.border }]} />
          <TouchableOpacity onPress={addItem} style={[styles.addBtn, { backgroundColor: themeColor }]}>
            <Ionicons name="add" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
        {newType === 'expense' && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catRow}>
            {EXPENSE_CATEGORIES.map((cat) => (
              <TouchableOpacity key={cat} onPress={() => setNewCategory(cat)}
                style={[styles.catChip, { backgroundColor: newCategory === cat ? themeColor : (isDark ? '#292524' : '#f5f5f4'), borderColor: newCategory === cat ? themeColor : colors.border }]}>
                <Text style={[styles.catChipText, { color: newCategory === cat ? '#fff' : colors.foreground }]}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 20, paddingTop: 24 },
  headerTitle: { color: '#fff', fontSize: 22, fontWeight: '800', marginBottom: 16 },
  summaryRow: { flexDirection: 'row', alignItems: 'center' },
  summaryCard: { flex: 1, alignItems: 'center' },
  summaryLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 12, marginBottom: 4 },
  summaryAmount: { color: '#fff', fontSize: 18, fontWeight: '800' },
  summaryDivider: { width: 1, height: 40, backgroundColor: 'rgba(255,255,255,0.2)' },
  savingsSection: {
    margin: 12, borderRadius: 12, padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  savingsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  savingsTitle: { fontSize: 15, fontWeight: '700' },
  savingsRate: { fontSize: 18, fontWeight: '800' },
  savingsBar: { height: 10, borderRadius: 5, overflow: 'hidden', marginBottom: 10 },
  savingsFill: { height: '100%', borderRadius: 5 },
  savingsGoalRow: { flexDirection: 'row', alignItems: 'center' },
  savingsGoalLabel: { fontSize: 13 },
  savingsGoalInput: { borderBottomWidth: 1, fontSize: 14, fontWeight: '700', paddingHorizontal: 4, width: 70 },
  tabs: { flexDirection: 'row', margin: 12, borderRadius: 10, padding: 4, gap: 4 },
  tab: { flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: 'center' },
  tabText: { fontSize: 13, fontWeight: '600' },
  section: {
    margin: 12, borderRadius: 12, padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  sectionTitle: { fontSize: 15, fontWeight: '700', marginBottom: 12 },
  categoryBarRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  catBarLabel: { width: 90, fontSize: 13 },
  catBar: { flex: 1, height: 8, borderRadius: 4, overflow: 'hidden' },
  catBarFill: { height: '100%', borderRadius: 4 },
  catBarAmount: { width: 50, textAlign: 'right', fontSize: 12 },
  itemRow: {
    flexDirection: 'row', alignItems: 'center', marginHorizontal: 12, marginBottom: 8,
    borderRadius: 10, borderWidth: 1, padding: 12, gap: 10,
  },
  itemDot: { width: 10, height: 10, borderRadius: 5 },
  itemInfo: { flex: 1 },
  itemLabel: { fontSize: 14, fontWeight: '600' },
  itemCat: { fontSize: 11, marginTop: 2 },
  itemAmount: { fontSize: 14, fontWeight: '700' },
  addSection: {
    margin: 12, borderRadius: 12, padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  typeToggle: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  typeBtn: { flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  typeBtnText: { fontSize: 14, fontWeight: '600' },
  addRow: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  addInput: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 9, fontSize: 13 },
  addBtn: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  catRow: { flexDirection: 'row', gap: 8, paddingVertical: 4 },
  catChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, borderWidth: 1 },
  catChipText: { fontSize: 12, fontWeight: '500' },
});
