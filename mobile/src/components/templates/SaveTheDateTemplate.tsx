import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, Modal, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { format, differenceInDays, parseISO, isToday, isFuture, isPast } from 'date-fns';
import { useTheme } from '../../hooks/useTheme';
import { Notebook, Page } from '../../types';
import { PagesAPI } from '../../services/api';

interface SaveTheDateEvent {
  id: string; title: string; date: string; time: string;
  location?: string; description?: string; url?: string;
  category: string; reminder: boolean; daysUntil: number;
}

const CATEGORIES = ['Personal', 'Work', 'Birthday', 'Anniversary', 'Holiday', 'Meeting', 'Other'];
const CATEGORY_COLORS: Record<string, string> = {
  Personal: '#3b82f6', Work: '#8b5cf6', Birthday: '#ec4899',
  Anniversary: '#f97316', Holiday: '#10b981', Meeting: '#f59e0b', Other: '#6b7280',
};

interface Props { notebook: Notebook; pages: Page[]; currentPage: Page | null; pageIndex: number; onPageChange: (i: number) => void; }

export const SaveTheDateTemplate: React.FC<Props> = ({ notebook }) => {
  const { colors, isDark } = useTheme();
  const themeColor = notebook.appearance?.themeColor || '#ec4899';
  const [events, setEvents] = useState<SaveTheDateEvent[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [form, setForm] = useState({ title: '', date: '', time: '', location: '', description: '', url: '', category: 'Personal' });

  const calcDaysUntil = (dateStr: string) => {
    try { return differenceInDays(parseISO(dateStr), new Date()); }
    catch { return 0; }
  };

  const addEvent = () => {
    if (!form.title.trim() || !form.date) { Alert.alert('Error', 'Title and date are required'); return; }
    const event: SaveTheDateEvent = {
      id: Date.now().toString(), ...form, reminder: false, daysUntil: calcDaysUntil(form.date),
    };
    setEvents(p => [...p, event]);
    setForm({ title: '', date: '', time: '', location: '', description: '', url: '', category: 'Personal' });
    setShowAdd(false);
  };

  const deleteEvent = (id: string) => {
    Alert.alert('Delete Event', 'Remove this event?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => setEvents(p => p.filter(e => e.id !== id)) },
    ]);
  };

  const getStatusBadge = (event: SaveTheDateEvent) => {
    const days = calcDaysUntil(event.date);
    if (days === 0) return { label: 'Today!', color: '#10b981' };
    if (days < 0) return { label: 'Past', color: '#6b7280' };
    if (days <= 3) return { label: `${days}d left`, color: '#f59e0b' };
    if (days <= 30) return { label: `${days} days`, color: '#3b82f6' };
    return { label: `${Math.ceil(days / 30)}mo`, color: '#8b5cf6' };
  };

  const filtered = events.filter(e =>
    (filterCategory === 'All' || e.category === filterCategory) &&
    (!searchQuery || e.title.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const upcoming = events.filter(e => { const d = calcDaysUntil(e.date); return d >= 0 && d <= 7; }).sort((a, b) => calcDaysUntil(a.date) - calcDaysUntil(b.date));

  return (
    <ScrollView style={[styles.container, { backgroundColor: isDark ? '#0c0a09' : '#fdf2f8' }]} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <LinearGradient colors={[themeColor, `${themeColor}aa`]} style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>Save the Date</Text>
            <Text style={styles.headerSub}>{events.length} events tracked</Text>
          </View>
          <TouchableOpacity onPress={() => setShowAdd(true)} style={styles.addHeaderBtn}>
            <Ionicons name="add" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
        {/* Upcoming this week cards */}
        {upcoming.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.upcomingScroll}>
            {upcoming.map(ev => {
              const days = calcDaysUntil(ev.date);
              return (
                <View key={ev.id} style={styles.upcomingCard}>
                  <Text style={styles.upcomingEmoji}>🎉</Text>
                  <Text style={styles.upcomingTitle} numberOfLines={1}>{ev.title}</Text>
                  <Text style={styles.upcomingDays}>{days === 0 ? 'Today!' : `in ${days}d`}</Text>
                </View>
              );
            })}
          </ScrollView>
        )}
      </LinearGradient>

      {/* Search + Filter */}
      <View style={[styles.searchRow, { backgroundColor: isDark ? '#1c1917' : '#fff' }]}>
        <View style={[styles.searchBar, { backgroundColor: isDark ? '#292524' : '#f5f5f4', borderColor: colors.border }]}>
          <Ionicons name="search" size={16} color={colors.mutedForeground} />
          <TextInput value={searchQuery} onChangeText={setSearchQuery} placeholder="Search events..." placeholderTextColor={colors.mutedForeground}
            style={[styles.searchInput, { color: colors.foreground }]} />
        </View>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll} style={{ backgroundColor: isDark ? '#1c1917' : '#fff' }}>
        {['All', ...CATEGORIES].map(cat => (
          <TouchableOpacity key={cat} onPress={() => setFilterCategory(cat)}
            style={[styles.filterChip, { backgroundColor: filterCategory === cat ? themeColor : (isDark ? '#292524' : '#f5f5f4'), borderColor: filterCategory === cat ? themeColor : colors.border }]}>
            <Text style={[styles.filterChipText, { color: filterCategory === cat ? '#fff' : colors.foreground }]}>{cat}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Events list */}
      {filtered.length === 0 ? (
        <View style={styles.empty}>
          <Text style={{ fontSize: 48 }}>📅</Text>
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No events yet</Text>
          <TouchableOpacity onPress={() => setShowAdd(true)} style={[styles.emptyBtn, { backgroundColor: themeColor }]}>
            <Text style={styles.emptyBtnText}>Add Your First Event</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.eventsList}>
          {filtered.map(ev => {
            const badge = getStatusBadge(ev);
            const catColor = CATEGORY_COLORS[ev.category] || '#6b7280';
            const days = calcDaysUntil(ev.date);
            return (
              <View key={ev.id} style={[styles.eventCard, { backgroundColor: isDark ? '#1c1917' : '#fff', borderColor: colors.border, borderLeftColor: catColor, borderLeftWidth: 4 }]}>
                <View style={styles.eventTop}>
                  <View style={styles.eventMain}>
                    <Text style={[styles.eventTitle, { color: colors.foreground }]}>{ev.title}</Text>
                    <View style={styles.eventMeta}>
                      <Ionicons name="calendar" size={12} color={colors.mutedForeground} />
                      <Text style={[styles.eventDate, { color: colors.mutedForeground }]}>{ev.date} {ev.time && `• ${ev.time}`}</Text>
                    </View>
                    {ev.location && (
                      <View style={styles.eventMeta}>
                        <Ionicons name="location" size={12} color={colors.mutedForeground} />
                        <Text style={[styles.eventDate, { color: colors.mutedForeground }]}>{ev.location}</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.eventRight}>
                    <View style={[styles.daysBadge, { backgroundColor: `${badge.color}20` }]}>
                      <Text style={[styles.daysBadgeText, { color: badge.color }]}>{badge.label}</Text>
                    </View>
                    <TouchableOpacity onPress={() => deleteEvent(ev.id)} style={styles.deleteBtn}>
                      <Ionicons name="trash-outline" size={16} color="#9ca3af" />
                    </TouchableOpacity>
                  </View>
                </View>
                {ev.description ? <Text style={[styles.eventDesc, { color: colors.mutedForeground }]} numberOfLines={2}>{ev.description}</Text> : null}
                <View style={styles.eventFooter}>
                  <View style={[styles.catBadge, { backgroundColor: `${catColor}20` }]}>
                    <Text style={[styles.catBadgeText, { color: catColor }]}>{ev.category}</Text>
                  </View>
                  {days === 0 && <Text style={styles.todayAlert}>🔔 Today!</Text>}
                  {days > 0 && days <= 3 && <Text style={styles.soonAlert}>⚠️ Coming soon</Text>}
                </View>
              </View>
            );
          })}
        </View>
      )}

      {/* Add Event Modal */}
      <Modal visible={showAdd} transparent animationType="slide">
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowAdd(false)}>
          <View style={[styles.modalSheet, { backgroundColor: isDark ? '#1c1917' : '#fff' }]}>
            <View style={styles.modalHandle} />
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>Add Event</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              {[
                { label: 'Event Title *', field: 'title', placeholder: 'Birthday Party' },
                { label: 'Date (YYYY-MM-DD) *', field: 'date', placeholder: '2025-12-25' },
                { label: 'Time', field: 'time', placeholder: '6:00 PM' },
                { label: 'Location', field: 'location', placeholder: 'Venue or address' },
                { label: 'URL', field: 'url', placeholder: 'https://...' },
              ].map(f => (
                <View key={f.field} style={{ marginBottom: 12 }}>
                  <Text style={[styles.fieldLabel, { color: colors.foreground }]}>{f.label}</Text>
                  <TextInput value={(form as any)[f.field]} onChangeText={v => setForm(p => ({ ...p, [f.field]: v }))}
                    placeholder={f.placeholder} placeholderTextColor={colors.mutedForeground}
                    style={[styles.modalInput, { color: colors.foreground, borderColor: colors.border }]} />
                </View>
              ))}
              <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Description</Text>
              <TextInput value={form.description} onChangeText={v => setForm(p => ({ ...p, description: v }))}
                placeholder="Notes about the event..." placeholderTextColor={colors.mutedForeground} multiline
                style={[styles.modalInput, { color: colors.foreground, borderColor: colors.border, minHeight: 64 }]} />
              <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Category</Text>
              <View style={styles.catGrid}>
                {CATEGORIES.map(cat => (
                  <TouchableOpacity key={cat} onPress={() => setForm(p => ({ ...p, category: cat }))}
                    style={[styles.catOption, { backgroundColor: form.category === cat ? CATEGORY_COLORS[cat] : (isDark ? '#292524' : '#f5f5f4'), borderColor: form.category === cat ? CATEGORY_COLORS[cat] : colors.border }]}>
                    <Text style={[styles.catOptionText, { color: form.category === cat ? '#fff' : colors.foreground }]}>{cat}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TouchableOpacity onPress={addEvent} style={[styles.submitBtn, { backgroundColor: themeColor }]}>
                <Text style={styles.submitBtnText}>Save Event</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 20, paddingTop: 24, gap: 16 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { color: '#fff', fontSize: 22, fontWeight: '800' },
  headerSub: { color: 'rgba(255,255,255,0.7)', fontSize: 13 },
  addHeaderBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.25)', justifyContent: 'center', alignItems: 'center' },
  upcomingScroll: { flexDirection: 'row', gap: 10, paddingBottom: 4 },
  upcomingCard: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 12, padding: 12, alignItems: 'center', minWidth: 80 },
  upcomingEmoji: { fontSize: 22 },
  upcomingTitle: { color: '#fff', fontSize: 11, fontWeight: '700', marginTop: 4, textAlign: 'center' },
  upcomingDays: { color: 'rgba(255,255,255,0.8)', fontSize: 10, marginTop: 2 },
  searchRow: { padding: 12, paddingBottom: 8 },
  searchBar: { flexDirection: 'row', alignItems: 'center', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 8, borderWidth: 1, gap: 8 },
  searchInput: { flex: 1, fontSize: 14 },
  filterScroll: { flexDirection: 'row', gap: 8, paddingHorizontal: 12, paddingVertical: 8 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
  filterChipText: { fontSize: 12, fontWeight: '600' },
  empty: { alignItems: 'center', paddingVertical: 60, gap: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '700' },
  emptyBtn: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 10 },
  emptyBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  eventsList: { padding: 12, gap: 10 },
  eventCard: { borderRadius: 12, borderWidth: 1, padding: 14, gap: 8 },
  eventTop: { flexDirection: 'row', justifyContent: 'space-between' },
  eventMain: { flex: 1, gap: 4 },
  eventTitle: { fontSize: 15, fontWeight: '700' },
  eventMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  eventDate: { fontSize: 12 },
  eventRight: { alignItems: 'flex-end', gap: 8 },
  daysBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  daysBadgeText: { fontSize: 12, fontWeight: '700' },
  deleteBtn: { padding: 4 },
  eventDesc: { fontSize: 12, lineHeight: 18 },
  eventFooter: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  catBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  catBadgeText: { fontSize: 11, fontWeight: '700' },
  todayAlert: { fontSize: 12 },
  soonAlert: { fontSize: 12 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalSheet: { borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, paddingBottom: 40, maxHeight: '90%' },
  modalHandle: { width: 40, height: 4, backgroundColor: '#e7e5e4', borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 16 },
  fieldLabel: { fontSize: 13, fontWeight: '600', marginBottom: 6 },
  modalInput: { borderWidth: 1, borderRadius: 8, padding: 10, fontSize: 14, marginBottom: 4 },
  catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  catOption: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 8, borderWidth: 1.5 },
  catOptionText: { fontSize: 12, fontWeight: '600' },
  submitBtn: { paddingVertical: 14, borderRadius: 10, alignItems: 'center', marginTop: 8 },
  submitBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
