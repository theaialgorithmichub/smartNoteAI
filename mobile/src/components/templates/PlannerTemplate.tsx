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
import { LinearGradient } from 'expo-linear-gradient';
import { format, startOfWeek, addDays } from 'date-fns';
import { useTheme } from '../../hooks/useTheme';
import { Notebook, Page } from '../../types';

interface PlannerTemplateProps {
  notebook: Notebook;
  pages: Page[];
  currentPage: Page | null;
  pageIndex: number;
  onPageChange: (index: number) => void;
}

interface AgendaItem {
  id: string;
  time: string;
  title: string;
  done: boolean;
}

export const PlannerTemplate: React.FC<PlannerTemplateProps> = ({
  notebook,
  pages,
  currentPage,
  pageIndex,
  onPageChange,
}) => {
  const { colors, isDark } = useTheme();
  const themeColor = notebook.appearance?.themeColor || '#3b82f6';
  const today = new Date();

  const [agendaItems, setAgendaItems] = useState<AgendaItem[]>([
    { id: '1', time: '08:00', title: 'Morning routine', done: false },
    { id: '2', time: '09:00', title: 'Work block', done: false },
    { id: '3', time: '12:00', title: 'Lunch break', done: false },
  ]);
  const [goals, setGoals] = useState(['Complete project draft', 'Exercise for 30 min']);
  const [notes, setNotes] = useState('');
  const [newItem, setNewItem] = useState('');
  const [newTime, setNewTime] = useState('');
  const [newGoal, setNewGoal] = useState('');

  const weekDays = Array.from({ length: 7 }, (_, i) =>
    addDays(startOfWeek(today), i)
  );

  const toggleAgendaItem = (id: string) => {
    setAgendaItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, done: !item.done } : item))
    );
  };

  const addAgendaItem = () => {
    if (newItem.trim()) {
      setAgendaItems((prev) => [
        ...prev,
        { id: Date.now().toString(), time: newTime || '00:00', title: newItem.trim(), done: false },
      ]);
      setNewItem('');
      setNewTime('');
    }
  };

  const addGoal = () => {
    if (newGoal.trim()) {
      setGoals((prev) => [...prev, newGoal.trim()]);
      setNewGoal('');
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: isDark ? '#0c0a09' : '#f8fafc' }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <LinearGradient
        colors={[themeColor, `${themeColor}aa`]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={styles.headerTitle}>{format(today, 'EEEE, MMMM d')}</Text>
        <Text style={styles.headerSub}>Daily Planner</Text>
      </LinearGradient>

      {/* Mini Week Calendar */}
      <View style={[styles.weekCalendar, { backgroundColor: isDark ? '#1c1917' : '#fff' }]}>
        {weekDays.map((day) => {
          const isToday = format(day, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');
          return (
            <View key={day.toISOString()} style={styles.dayColumn}>
              <Text style={[styles.dayName, { color: colors.mutedForeground }]}>
                {format(day, 'EEE')[0]}
              </Text>
              <View
                style={[
                  styles.dayNumber,
                  isToday && { backgroundColor: themeColor },
                ]}
              >
                <Text
                  style={[
                    styles.dayNumberText,
                    { color: isToday ? '#fff' : colors.foreground },
                  ]}
                >
                  {format(day, 'd')}
                </Text>
              </View>
            </View>
          );
        })}
      </View>

      {/* Goals */}
      <View style={[styles.section, { backgroundColor: isDark ? '#1c1917' : '#fff' }]}>
        <View style={styles.sectionHeader}>
          <Text style={{ fontSize: 16 }}>🎯</Text>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Today's Goals</Text>
        </View>
        {goals.map((goal, i) => (
          <View key={i} style={styles.goalItem}>
            <View style={[styles.goalBullet, { backgroundColor: themeColor }]} />
            <Text style={[styles.goalText, { color: colors.foreground }]}>{goal}</Text>
          </View>
        ))}
        <View style={styles.addRow}>
          <TextInput
            value={newGoal}
            onChangeText={setNewGoal}
            placeholder="Add a goal..."
            placeholderTextColor={colors.mutedForeground}
            style={[styles.addInput, { color: colors.foreground, borderColor: colors.border }]}
            onSubmitEditing={addGoal}
          />
          <TouchableOpacity
            onPress={addGoal}
            style={[styles.addBtn, { backgroundColor: themeColor }]}
          >
            <Ionicons name="add" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Agenda */}
      <View style={[styles.section, { backgroundColor: isDark ? '#1c1917' : '#fff' }]}>
        <View style={styles.sectionHeader}>
          <Text style={{ fontSize: 16 }}>📋</Text>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Agenda</Text>
        </View>
        {agendaItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            onPress={() => toggleAgendaItem(item.id)}
            style={styles.agendaItem}
          >
            <Text style={[styles.agendaTime, { color: themeColor }]}>{item.time}</Text>
            <View style={[styles.agendaCheck, { borderColor: themeColor }]}>
              {item.done && (
                <Ionicons name="checkmark" size={12} color={themeColor} />
              )}
            </View>
            <Text
              style={[
                styles.agendaTitle,
                { color: colors.foreground },
                item.done && { textDecorationLine: 'line-through', color: colors.mutedForeground },
              ]}
            >
              {item.title}
            </Text>
          </TouchableOpacity>
        ))}
        <View style={styles.addRow}>
          <TextInput
            value={newTime}
            onChangeText={setNewTime}
            placeholder="HH:MM"
            placeholderTextColor={colors.mutedForeground}
            style={[styles.timeInput, { color: colors.foreground, borderColor: colors.border }]}
          />
          <TextInput
            value={newItem}
            onChangeText={setNewItem}
            placeholder="Add agenda item..."
            placeholderTextColor={colors.mutedForeground}
            style={[styles.addInput, { flex: 1, color: colors.foreground, borderColor: colors.border }]}
            onSubmitEditing={addAgendaItem}
          />
          <TouchableOpacity
            onPress={addAgendaItem}
            style={[styles.addBtn, { backgroundColor: themeColor }]}
          >
            <Ionicons name="add" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Notes */}
      <View style={[styles.section, { backgroundColor: isDark ? '#1c1917' : '#fff' }]}>
        <View style={styles.sectionHeader}>
          <Text style={{ fontSize: 16 }}>📝</Text>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Notes</Text>
        </View>
        <TextInput
          value={notes}
          onChangeText={setNotes}
          placeholder="Notes, reminders, ideas..."
          placeholderTextColor={colors.mutedForeground}
          multiline
          style={[
            styles.notesInput,
            { color: colors.foreground, borderColor: colors.border },
          ]}
          textAlignVertical="top"
        />
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
  headerSub: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    marginTop: 2,
  },
  weekCalendar: {
    flexDirection: 'row',
    margin: 12,
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  dayColumn: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  dayName: {
    fontSize: 11,
    fontWeight: '600',
  },
  dayNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayNumberText: {
    fontSize: 13,
    fontWeight: '600',
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
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  goalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    gap: 10,
  },
  goalBullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  goalText: {
    fontSize: 14,
    flex: 1,
  },
  agendaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 10,
  },
  agendaTime: {
    width: 44,
    fontSize: 12,
    fontWeight: '600',
  },
  agendaCheck: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  agendaTitle: {
    fontSize: 14,
    flex: 1,
  },
  addRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
    alignItems: 'center',
  },
  timeInput: {
    width: 64,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 8,
    fontSize: 13,
  },
  addInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 13,
    flex: 1,
  },
  addBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notesInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    minHeight: 100,
  },
});
