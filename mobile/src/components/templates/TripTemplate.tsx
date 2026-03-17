import React, { useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, Modal, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { format } from 'date-fns';
import { useTheme } from '../../hooks/useTheme';
import { Notebook, Page } from '../../types';

interface Activity { id: string; time: string; title: string; category: string; cost: number; notes: string; completed: boolean; }
interface DayPlan { id: string; date: string; activities: Activity[]; }
interface PackingItem { id: string; name: string; category: string; packed: boolean; }

interface Props { notebook: Notebook; pages: Page[]; currentPage: Page | null; pageIndex: number; onPageChange: (i: number) => void; }

const ACTIVITY_CATEGORIES = [
  { id: 'transport', name: 'Transport', icon: 'car', color: '#3b82f6' },
  { id: 'accommodation', name: 'Hotel', icon: 'bed', color: '#8b5cf6' },
  { id: 'food', name: 'Food', icon: 'restaurant', color: '#f97316' },
  { id: 'activity', name: 'Activity', icon: 'camera', color: '#22c55e' },
  { id: 'shopping', name: 'Shopping', icon: 'bag', color: '#ec4899' },
  { id: 'other', name: 'Other', icon: 'globe', color: '#64748b' },
] as const;

const PACKING_CATEGORIES = ['Clothing', 'Toiletries', 'Electronics', 'Documents', 'Medicine', 'Other'];

export const TripTemplate: React.FC<Props> = ({ notebook }) => {
  const { colors, isDark } = useTheme();
  const themeColor = notebook.appearance?.themeColor || '#06b6d4';
  const [activeTab, setActiveTab] = useState<'overview' | 'itinerary' | 'packing' | 'budget'>('overview');
  const [destination, setDestination] = useState('');
  const [source, setSource] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [budget, setBudget] = useState('');
  const [travelers, setTravelers] = useState('1');
  const [notes, setNotes] = useState('');
  const [days, setDays] = useState<DayPlan[]>([]);
  const [packingList, setPackingList] = useState<PackingItem[]>([
    { id: '1', name: 'Passport', category: 'Documents', packed: false },
    { id: '2', name: 'Phone charger', category: 'Electronics', packed: false },
    { id: '3', name: 'Sunscreen', category: 'Toiletries', packed: false },
  ]);
  const [expenses, setExpenses] = useState<{ id: string; desc: string; amount: number; category: string }[]>([]);
  const [showAddActivity, setShowAddActivity] = useState(false);
  const [selectedDayId, setSelectedDayId] = useState<string | null>(null);
  const [activityForm, setActivityForm] = useState({ time: '', title: '', category: 'activity', cost: '', notes: '' });
  const [newPacking, setNewPacking] = useState({ name: '', category: 'Clothing' });
  const [newExpense, setNewExpense] = useState({ desc: '', amount: '', category: 'Food' });

  const addDay = () => {
    const newDay: DayPlan = { id: Date.now().toString(), date: `Day ${days.length + 1}`, activities: [] };
    setDays(p => [...p, newDay]);
  };

  const addActivity = () => {
    if (!activityForm.title.trim() || !selectedDayId) return;
    const activity: Activity = {
      id: Date.now().toString(), ...activityForm,
      cost: parseFloat(activityForm.cost) || 0, completed: false,
    };
    setDays(p => p.map(d => d.id === selectedDayId ? { ...d, activities: [...d.activities, activity] } : d));
    setActivityForm({ time: '', title: '', category: 'activity', cost: '', notes: '' });
    setShowAddActivity(false);
  };

  const toggleActivity = (dayId: string, actId: string) => {
    setDays(p => p.map(d => d.id === dayId ? {
      ...d, activities: d.activities.map(a => a.id === actId ? { ...a, completed: !a.completed } : a)
    } : d));
  };

  const addPackingItem = () => {
    if (!newPacking.name.trim()) return;
    setPackingList(p => [...p, { id: Date.now().toString(), ...newPacking, packed: false }]);
    setNewPacking(p => ({ ...p, name: '' }));
  };

  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const totalTripCost = days.flatMap(d => d.activities).reduce((s, a) => s + a.cost, 0);

  const getCatInfo = (catId: string) => ACTIVITY_CATEGORIES.find(c => c.id === catId) || ACTIVITY_CATEGORIES[5];

  return (
    <ScrollView style={[styles.container, { backgroundColor: isDark ? '#0c0a09' : '#ecfeff' }]} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <LinearGradient colors={[themeColor, `${themeColor}99`]} style={styles.header}>
        <View style={styles.headerRow}>
          <Ionicons name="airplane" size={24} color="#fff" />
          <TextInput value={destination} onChangeText={setDestination} placeholder="Destination" placeholderTextColor="rgba(255,255,255,0.6)"
            style={styles.destinationInput} />
        </View>
        <View style={styles.tripMeta}>
          <View style={styles.metaItem}>
            <Ionicons name="location" size={14} color="rgba(255,255,255,0.7)" />
            <TextInput value={source} onChangeText={setSource} placeholder="From" placeholderTextColor="rgba(255,255,255,0.5)"
              style={styles.metaInput} />
          </View>
          <Text style={styles.metaArrow}>→</Text>
          <View style={styles.metaItem}>
            <Ionicons name="calendar" size={14} color="rgba(255,255,255,0.7)" />
            <TextInput value={startDate} onChangeText={setStartDate} placeholder="Start date" placeholderTextColor="rgba(255,255,255,0.5)"
              style={styles.metaInput} />
          </View>
        </View>
        <View style={styles.statsRow}>
          <View style={styles.stat}><Text style={styles.statNum}>{travelers}</Text><Text style={styles.statLabel}>Travelers</Text></View>
          <View style={styles.stat}><Text style={styles.statNum}>${budget || '0'}</Text><Text style={styles.statLabel}>Budget</Text></View>
          <View style={styles.stat}><Text style={styles.statNum}>{days.length}</Text><Text style={styles.statLabel}>Days</Text></View>
          <View style={styles.stat}><Text style={styles.statNum}>${totalTripCost.toFixed(0)}</Text><Text style={styles.statLabel}>Planned Cost</Text></View>
        </View>
      </LinearGradient>

      {/* Tabs */}
      <View style={[styles.tabs, { backgroundColor: isDark ? '#1c1917' : '#f0fdfe' }]}>
        {(['overview', 'itinerary', 'packing', 'budget'] as const).map(tab => (
          <TouchableOpacity key={tab} onPress={() => setActiveTab(tab)}
            style={[styles.tab, activeTab === tab && { backgroundColor: themeColor }]}>
            <Text style={[styles.tabText, { color: activeTab === tab ? '#fff' : colors.foreground }]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {activeTab === 'overview' && (
        <View style={[styles.section, { backgroundColor: isDark ? '#1c1917' : '#fff' }]}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Trip Details</Text>
          <View style={styles.fieldRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Travelers</Text>
              <TextInput value={travelers} onChangeText={setTravelers} keyboardType="numeric"
                style={[styles.input, { color: colors.foreground, borderColor: colors.border }]} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Budget ($)</Text>
              <TextInput value={budget} onChangeText={setBudget} keyboardType="numeric"
                style={[styles.input, { color: colors.foreground, borderColor: colors.border }]} />
            </View>
          </View>
          <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Notes</Text>
          <TextInput value={notes} onChangeText={setNotes} placeholder="Travel notes, visa requirements, emergency contacts..." placeholderTextColor={colors.mutedForeground}
            multiline style={[styles.textarea, { color: colors.foreground, borderColor: colors.border }]} />
        </View>
      )}

      {activeTab === 'itinerary' && (
        <View>
          {days.map((day, di) => (
            <View key={day.id} style={[styles.dayCard, { backgroundColor: isDark ? '#1c1917' : '#fff' }]}>
              <View style={styles.dayHeader}>
                <LinearGradient colors={[themeColor, `${themeColor}88`]} style={styles.dayBadge}>
                  <Text style={styles.dayBadgeText}>{day.date}</Text>
                </LinearGradient>
                <TouchableOpacity onPress={() => { setSelectedDayId(day.id); setShowAddActivity(true); }}
                  style={[styles.addDayBtn, { borderColor: themeColor }]}>
                  <Ionicons name="add" size={16} color={themeColor} />
                  <Text style={[styles.addDayBtnText, { color: themeColor }]}>Add</Text>
                </TouchableOpacity>
              </View>
              {day.activities.length === 0 ? (
                <Text style={[styles.emptyDay, { color: colors.mutedForeground }]}>No activities yet. Tap + to add.</Text>
              ) : (
                day.activities.map(activity => {
                  const cat = getCatInfo(activity.category);
                  return (
                    <TouchableOpacity key={activity.id} onPress={() => toggleActivity(day.id, activity.id)}
                      style={[styles.activityRow, activity.completed && styles.activityCompleted]}>
                      <View style={[styles.activityIcon, { backgroundColor: `${cat.color}20` }]}>
                        <Ionicons name={cat.icon as any} size={16} color={cat.color} />
                      </View>
                      <View style={styles.activityContent}>
                        <View style={styles.activityTitleRow}>
                          <Text style={[styles.activityTitle, { color: colors.foreground }, activity.completed && { textDecorationLine: 'line-through', color: colors.mutedForeground }]}>
                            {activity.title}
                          </Text>
                          {activity.time && <Text style={[styles.activityTime, { color: themeColor }]}>{activity.time}</Text>}
                        </View>
                        {activity.cost > 0 && <Text style={[styles.activityCost, { color: colors.mutedForeground }]}>${activity.cost}</Text>}
                        {activity.notes && <Text style={[styles.activityNotes, { color: colors.mutedForeground }]}>{activity.notes}</Text>}
                      </View>
                      {activity.completed && <Ionicons name="checkmark-circle" size={18} color="#10b981" />}
                    </TouchableOpacity>
                  );
                })
              )}
            </View>
          ))}
          <TouchableOpacity onPress={addDay} style={[styles.addDayCard, { borderColor: themeColor }]}>
            <Ionicons name="add-circle" size={20} color={themeColor} />
            <Text style={[styles.addDayCardText, { color: themeColor }]}>Add Day</Text>
          </TouchableOpacity>
        </View>
      )}

      {activeTab === 'packing' && (
        <View>
          {PACKING_CATEGORIES.map(cat => {
            const items = packingList.filter(i => i.category === cat);
            if (items.length === 0) return null;
            return (
              <View key={cat} style={[styles.section, { backgroundColor: isDark ? '#1c1917' : '#fff' }]}>
                <Text style={[styles.sectionTitle, { color: colors.foreground }]}>{cat}</Text>
                {items.map(item => (
                  <TouchableOpacity key={item.id} onPress={() => setPackingList(p => p.map(i => i.id === item.id ? { ...i, packed: !i.packed } : i))}
                    style={styles.packingRow}>
                    <View style={[styles.packCheck, { borderColor: themeColor, backgroundColor: item.packed ? themeColor : 'transparent' }]}>
                      {item.packed && <Ionicons name="checkmark" size={12} color="#fff" />}
                    </View>
                    <Text style={[styles.packName, { color: colors.foreground }, item.packed && { textDecorationLine: 'line-through', color: colors.mutedForeground }]}>{item.name}</Text>
                    <TouchableOpacity onPress={() => setPackingList(p => p.filter(i => i.id !== item.id))}>
                      <Ionicons name="close" size={16} color="#9ca3af" />
                    </TouchableOpacity>
                  </TouchableOpacity>
                ))}
              </View>
            );
          })}
          <View style={[styles.section, { backgroundColor: isDark ? '#1c1917' : '#fff' }]}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Add Item</Text>
            <View style={styles.addRow}>
              <TextInput value={newPacking.name} onChangeText={v => setNewPacking(p => ({ ...p, name: v }))} placeholder="Item name"
                placeholderTextColor={colors.mutedForeground} style={[styles.addInput, { flex: 2, color: colors.foreground, borderColor: colors.border }]} />
              <TouchableOpacity onPress={addPackingItem} style={[styles.addBtn, { backgroundColor: themeColor }]}>
                <Ionicons name="add" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
              {PACKING_CATEGORIES.map(cat => (
                <TouchableOpacity key={cat} onPress={() => setNewPacking(p => ({ ...p, category: cat }))}
                  style={[styles.catChip, { backgroundColor: newPacking.category === cat ? themeColor : (isDark ? '#292524' : '#f5f5f4') }]}>
                  <Text style={[styles.catChipText, { color: newPacking.category === cat ? '#fff' : colors.foreground }]}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      )}

      {activeTab === 'budget' && (
        <View>
          <View style={[styles.section, { backgroundColor: isDark ? '#1c1917' : '#fff' }]}>
            <View style={styles.budgetSummary}>
              <View style={styles.budgetItem}><Text style={[styles.budgetNum, { color: themeColor }]}>${parseFloat(budget || '0').toLocaleString()}</Text><Text style={[styles.budgetLabel, { color: colors.mutedForeground }]}>Total Budget</Text></View>
              <View style={styles.budgetItem}><Text style={[styles.budgetNum, { color: '#ef4444' }]}>${totalExpenses.toFixed(2)}</Text><Text style={[styles.budgetLabel, { color: colors.mutedForeground }]}>Spent</Text></View>
              <View style={styles.budgetItem}><Text style={[styles.budgetNum, { color: '#10b981' }]}>${(parseFloat(budget || '0') - totalExpenses).toFixed(2)}</Text><Text style={[styles.budgetLabel, { color: colors.mutedForeground }]}>Remaining</Text></View>
            </View>
          </View>
          {expenses.map(exp => (
            <View key={exp.id} style={[styles.expenseRow, { backgroundColor: isDark ? '#1c1917' : '#fff', borderColor: colors.border }]}>
              <Text style={[styles.expDesc, { color: colors.foreground }]}>{exp.desc}</Text>
              <Text style={[styles.expAmount, { color: '#ef4444' }]}>-${exp.amount.toFixed(2)}</Text>
              <TouchableOpacity onPress={() => setExpenses(p => p.filter(e => e.id !== exp.id))}>
                <Ionicons name="close" size={16} color="#9ca3af" />
              </TouchableOpacity>
            </View>
          ))}
          <View style={[styles.section, { backgroundColor: isDark ? '#1c1917' : '#fff' }]}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Log Expense</Text>
            <View style={styles.addRow}>
              <TextInput value={newExpense.desc} onChangeText={v => setNewExpense(p => ({ ...p, desc: v }))} placeholder="Description"
                placeholderTextColor={colors.mutedForeground} style={[styles.addInput, { flex: 2, color: colors.foreground, borderColor: colors.border }]} />
              <TextInput value={newExpense.amount} onChangeText={v => setNewExpense(p => ({ ...p, amount: v }))} placeholder="$" keyboardType="numeric"
                style={[styles.addInput, { flex: 1, color: colors.foreground, borderColor: colors.border }]} />
              <TouchableOpacity onPress={() => {
                if (!newExpense.desc || !newExpense.amount) return;
                setExpenses(p => [...p, { id: Date.now().toString(), ...newExpense, amount: parseFloat(newExpense.amount) }]);
                setNewExpense(p => ({ ...p, desc: '', amount: '' }));
              }} style={[styles.addBtn, { backgroundColor: themeColor }]}>
                <Ionicons name="add" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Add Activity Modal */}
      <Modal visible={showAddActivity} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, { backgroundColor: isDark ? '#1c1917' : '#fff' }]}>
            <View style={styles.modalHandle} />
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>Add Activity</Text>
            <TextInput value={activityForm.title} onChangeText={v => setActivityForm(p => ({ ...p, title: v }))} placeholder="Activity title"
              placeholderTextColor={colors.mutedForeground} style={[styles.modalInput, { color: colors.foreground, borderColor: colors.border }]} />
            <View style={styles.addRow}>
              <TextInput value={activityForm.time} onChangeText={v => setActivityForm(p => ({ ...p, time: v }))} placeholder="Time (e.g. 9:00 AM)"
                placeholderTextColor={colors.mutedForeground} style={[styles.addInput, { flex: 1, color: colors.foreground, borderColor: colors.border }]} />
              <TextInput value={activityForm.cost} onChangeText={v => setActivityForm(p => ({ ...p, cost: v }))} placeholder="Cost $" keyboardType="numeric"
                style={[styles.addInput, { flex: 1, color: colors.foreground, borderColor: colors.border }]} />
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
              {ACTIVITY_CATEGORIES.map(cat => (
                <TouchableOpacity key={cat.id} onPress={() => setActivityForm(p => ({ ...p, category: cat.id }))}
                  style={[styles.catChip, { backgroundColor: activityForm.category === cat.id ? cat.color : (isDark ? '#292524' : '#f5f5f4') }]}>
                  <Text style={[styles.catChipText, { color: activityForm.category === cat.id ? '#fff' : colors.foreground }]}>{cat.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TextInput value={activityForm.notes} onChangeText={v => setActivityForm(p => ({ ...p, notes: v }))} placeholder="Notes..."
              placeholderTextColor={colors.mutedForeground} style={[styles.modalInput, { color: colors.foreground, borderColor: colors.border }]} />
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 8 }}>
              <TouchableOpacity onPress={() => setShowAddActivity(false)} style={[styles.modalCancelBtn, { borderColor: colors.border }]}>
                <Text style={{ color: colors.foreground, fontWeight: '600' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={addActivity} style={[styles.submitBtn, { flex: 2, backgroundColor: themeColor }]}>
                <Text style={styles.submitBtnText}>Add Activity</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 20, paddingTop: 24, gap: 12 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  destinationInput: { flex: 1, color: '#fff', fontSize: 20, fontWeight: '800' },
  tripMeta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  metaItem: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaInput: { flex: 1, color: 'rgba(255,255,255,0.9)', fontSize: 13 },
  metaArrow: { color: 'rgba(255,255,255,0.6)', fontSize: 16 },
  statsRow: { flexDirection: 'row', gap: 8 },
  stat: { flex: 1, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 10, padding: 8, alignItems: 'center' },
  statNum: { color: '#fff', fontSize: 16, fontWeight: '800' },
  statLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 10, marginTop: 2 },
  tabs: { flexDirection: 'row', margin: 12, borderRadius: 10, padding: 4, gap: 4 },
  tab: { flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: 'center' },
  tabText: { fontSize: 11, fontWeight: '600' },
  section: { margin: 12, borderRadius: 12, padding: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  sectionTitle: { fontSize: 15, fontWeight: '700', marginBottom: 12 },
  fieldRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  fieldLabel: { fontSize: 12, marginBottom: 6 },
  input: { borderWidth: 1, borderRadius: 8, padding: 10, fontSize: 14 },
  textarea: { borderWidth: 1, borderRadius: 8, padding: 10, fontSize: 14, minHeight: 80 },
  dayCard: { margin: 12, marginBottom: 0, borderRadius: 12, padding: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  dayHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  dayBadge: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 },
  dayBadgeText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  addDayBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, borderWidth: 1.5 },
  addDayBtnText: { fontSize: 12, fontWeight: '600' },
  emptyDay: { fontSize: 13, textAlign: 'center', paddingVertical: 12 },
  activityRow: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 10, borderTopWidth: 1, borderTopColor: '#00000008', gap: 10 },
  activityCompleted: { opacity: 0.6 },
  activityIcon: { width: 32, height: 32, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  activityContent: { flex: 1 },
  activityTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  activityTitle: { fontSize: 14, fontWeight: '600', flex: 1 },
  activityTime: { fontSize: 12, fontWeight: '600' },
  activityCost: { fontSize: 12, marginTop: 2 },
  activityNotes: { fontSize: 11, marginTop: 2 },
  addDayCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, margin: 12, paddingVertical: 14, borderRadius: 12, borderWidth: 2, borderStyle: 'dashed' },
  addDayCardText: { fontSize: 14, fontWeight: '700' },
  packingRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, gap: 10, borderTopWidth: 1, borderTopColor: '#00000008' },
  packCheck: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, justifyContent: 'center', alignItems: 'center' },
  packName: { flex: 1, fontSize: 14 },
  addRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  addInput: { borderWidth: 1, borderRadius: 8, padding: 10, fontSize: 13 },
  addBtn: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  catChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  catChipText: { fontSize: 11, fontWeight: '600' },
  budgetSummary: { flexDirection: 'row', justifyContent: 'space-around' },
  budgetItem: { alignItems: 'center' },
  budgetNum: { fontSize: 20, fontWeight: '800' },
  budgetLabel: { fontSize: 12, marginTop: 2 },
  expenseRow: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 12, marginBottom: 8, borderRadius: 10, borderWidth: 1, padding: 12, gap: 10 },
  expDesc: { flex: 1, fontSize: 14 },
  expAmount: { fontSize: 14, fontWeight: '700' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalSheet: { borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, paddingBottom: 40 },
  modalHandle: { width: 40, height: 4, backgroundColor: '#e7e5e4', borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 16 },
  modalInput: { borderWidth: 1, borderRadius: 8, padding: 10, fontSize: 14, marginBottom: 10 },
  modalCancelBtn: { flex: 1, borderWidth: 1, borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  submitBtn: { flex: 2, paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  submitBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
});
