import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { format } from 'date-fns';
import { useTheme } from '../../hooks/useTheme';
import { Notebook, Page } from '../../types';

interface GroceryItem { id: string; name: string; quantity: string; category: string; completed: boolean; }

const CATEGORIES = ['Vegetables','Fruits','Dairy','Meat','Bakery','Pantry','Snacks','Beverages','Frozen','Personal Care'];
const CAT_ICONS: Record<string, string> = {
  Vegetables: '🥦', Fruits: '🍎', Dairy: '🥛', Meat: '🥩', Bakery: '🍞',
  Pantry: '🥫', Snacks: '🍪', Beverages: '🧃', Frozen: '🧊', 'Personal Care': '🧴',
};

interface Props { notebook: Notebook; pages: Page[]; currentPage: Page | null; pageIndex: number; onPageChange: (i: number) => void; }

export const GroceryListTemplate: React.FC<Props> = ({ notebook }) => {
  const { colors, isDark } = useTheme();
  const themeColor = notebook.appearance?.themeColor || '#22c55e';
  const [items, setItems] = useState<GroceryItem[]>([]);
  const [newName, setNewName] = useState('');
  const [newQty, setNewQty] = useState('');
  const [selectedCat, setSelectedCat] = useState('Vegetables');
  const [activeDate, setActiveDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [filterCat, setFilterCat] = useState('All');

  const addItem = () => {
    if (!newName.trim()) return;
    setItems(p => [...p, { id: Date.now().toString(), name: newName.trim(), quantity: newQty || '1', category: selectedCat, completed: false }]);
    setNewName(''); setNewQty('');
  };

  const toggleItem = (id: string) => setItems(p => p.map(i => i.id === id ? { ...i, completed: !i.completed } : i));
  const removeItem = (id: string) => setItems(p => p.filter(i => i.id !== id));

  const grouped = CATEGORIES.reduce((acc, cat) => {
    const catItems = items.filter(i => i.category === cat && (filterCat === 'All' || filterCat === cat));
    if (catItems.length > 0) acc[cat] = catItems;
    return acc;
  }, {} as Record<string, GroceryItem[]>);

  const completed = items.filter(i => i.completed).length;

  return (
    <ScrollView style={[styles.container, { backgroundColor: isDark ? '#0c0a09' : '#f0fdf4' }]} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <LinearGradient colors={[themeColor, `${themeColor}99`]} style={styles.header}>
        <View style={styles.headerRow}>
          <Ionicons name="cart" size={22} color="#fff" />
          <Text style={styles.headerTitle}>Grocery List</Text>
          <Text style={styles.headerDate}>{format(new Date(activeDate), 'MMM d')}</Text>
        </View>
        <View style={styles.progressRow}>
          <Text style={styles.progressText}>{completed}/{items.length} items</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: items.length > 0 ? `${(completed/items.length)*100}%` as any : '0%' }]} />
          </View>
        </View>
      </LinearGradient>

      {/* Category filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll} style={[styles.filterBar, { backgroundColor: isDark ? '#1c1917' : '#fff' }]}>
        {['All', ...CATEGORIES].map(cat => (
          <TouchableOpacity key={cat} onPress={() => setFilterCat(cat)}
            style={[styles.filterChip, { backgroundColor: filterCat === cat ? themeColor : (isDark ? '#292524' : '#f5f5f4') }]}>
            <Text style={styles.filterChipIcon}>{CAT_ICONS[cat] || '🛒'}</Text>
            <Text style={[styles.filterChipText, { color: filterCat === cat ? '#fff' : colors.foreground }]}>{cat}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Add item */}
      <View style={[styles.addSection, { backgroundColor: isDark ? '#1c1917' : '#fff' }]}>
        <View style={styles.addRow}>
          <TextInput value={newName} onChangeText={setNewName} placeholder="Item name..." placeholderTextColor={colors.mutedForeground}
            style={[styles.nameInput, { color: colors.foreground, borderColor: colors.border }]} onSubmitEditing={addItem} />
          <TextInput value={newQty} onChangeText={setNewQty} placeholder="Qty" placeholderTextColor={colors.mutedForeground} keyboardType="numeric"
            style={[styles.qtyInput, { color: colors.foreground, borderColor: colors.border }]} />
          <TouchableOpacity onPress={addItem} style={[styles.addBtn, { backgroundColor: themeColor }]}>
            <Ionicons name="add" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catRow}>
          {CATEGORIES.map(cat => (
            <TouchableOpacity key={cat} onPress={() => setSelectedCat(cat)}
              style={[styles.catChip, { backgroundColor: selectedCat === cat ? themeColor : (isDark ? '#292524' : '#f5f5f4') }]}>
              <Text style={styles.catIcon}>{CAT_ICONS[cat]}</Text>
              <Text style={[styles.catChipText, { color: selectedCat === cat ? '#fff' : colors.foreground }]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Items by category */}
      {Object.entries(grouped).map(([cat, catItems]) => (
        <View key={cat} style={[styles.catSection, { backgroundColor: isDark ? '#1c1917' : '#fff' }]}>
          <View style={styles.catHeader}>
            <Text style={styles.catEmoji}>{CAT_ICONS[cat]}</Text>
            <Text style={[styles.catTitle, { color: colors.foreground }]}>{cat}</Text>
            <View style={[styles.catCount, { backgroundColor: `${themeColor}20` }]}>
              <Text style={[styles.catCountText, { color: themeColor }]}>{catItems.length}</Text>
            </View>
          </View>
          {catItems.map(item => (
            <View key={item.id} style={[styles.itemRow, { borderColor: colors.border }]}>
              <TouchableOpacity onPress={() => toggleItem(item.id)}
                style={[styles.checkbox, { borderColor: themeColor, backgroundColor: item.completed ? themeColor : 'transparent' }]}>
                {item.completed && <Ionicons name="checkmark" size={14} color="#fff" />}
              </TouchableOpacity>
              <Text style={[styles.itemName, { color: colors.foreground }, item.completed && { textDecorationLine: 'line-through', color: colors.mutedForeground }]}>
                {item.name}
              </Text>
              <Text style={[styles.itemQty, { color: colors.mutedForeground }]}>{item.quantity}</Text>
              <TouchableOpacity onPress={() => removeItem(item.id)}>
                <Ionicons name="close" size={16} color="#9ca3af" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      ))}

      {items.length === 0 && (
        <View style={styles.empty}>
          <Text style={{ fontSize: 48 }}>🛒</Text>
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>Your cart is empty</Text>
          <Text style={[styles.emptySubtitle, { color: colors.mutedForeground }]}>Add items above to get started</Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 20, paddingTop: 24, gap: 10 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerTitle: { flex: 1, color: '#fff', fontSize: 20, fontWeight: '800' },
  headerDate: { color: 'rgba(255,255,255,0.8)', fontSize: 13 },
  progressRow: { gap: 6 },
  progressText: { color: 'rgba(255,255,255,0.8)', fontSize: 13 },
  progressBar: { height: 6, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#fff', borderRadius: 3 },
  filterBar: {},
  filterScroll: { flexDirection: 'row', gap: 8, paddingHorizontal: 12, paddingVertical: 8 },
  filterChip: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 16 },
  filterChipIcon: { fontSize: 12 },
  filterChipText: { fontSize: 11, fontWeight: '600' },
  addSection: { margin: 12, borderRadius: 12, padding: 14, gap: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  addRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  nameInput: { flex: 1, borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14 },
  qtyInput: { width: 60, borderWidth: 1, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 10, fontSize: 14 },
  addBtn: { width: 44, height: 44, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  catRow: { flexDirection: 'row', gap: 6, paddingBottom: 2 },
  catChip: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 14 },
  catIcon: { fontSize: 12 },
  catChipText: { fontSize: 11, fontWeight: '600' },
  catSection: { margin: 12, marginBottom: 0, borderRadius: 12, padding: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  catHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  catEmoji: { fontSize: 18 },
  catTitle: { flex: 1, fontSize: 15, fontWeight: '700' },
  catCount: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  catCountText: { fontSize: 12, fontWeight: '700' },
  itemRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderTopWidth: 1, gap: 10 },
  checkbox: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, justifyContent: 'center', alignItems: 'center' },
  itemName: { flex: 1, fontSize: 14 },
  itemQty: { fontSize: 13 },
  empty: { alignItems: 'center', paddingVertical: 60, gap: 8 },
  emptyTitle: { fontSize: 18, fontWeight: '700', marginTop: 8 },
  emptySubtitle: { fontSize: 13 },
});
