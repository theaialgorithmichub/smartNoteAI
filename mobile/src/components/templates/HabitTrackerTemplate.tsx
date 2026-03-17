import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { format, subDays } from 'date-fns';
import { useTheme } from '../../hooks/useTheme';
import { Notebook, Page } from '../../types';

interface HabitTrackerTemplateProps {
  notebook: Notebook;
  pages: Page[];
  currentPage: Page | null;
  pageIndex: number;
  onPageChange: (index: number) => void;
}

interface Habit {
  id: string;
  name: string;
  icon: string;
  color: string;
  streak: number;
  completions: string[];
}

const HABIT_COLORS = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899'];
const HABIT_ICONS = ['⚡', '💪', '📚', '🧘', '🏃', '💧', '🍎', '😴'];

export const HabitTrackerTemplate: React.FC<HabitTrackerTemplateProps> = ({ notebook }) => {
  const { colors, isDark } = useTheme();
  const themeColor = notebook.appearance?.themeColor || '#10b981';
  const today = format(new Date(), 'yyyy-MM-dd');

  const [habits, setHabits] = useState<Habit[]>([
    {
      id: '1',
      name: 'Morning Exercise',
      icon: '💪',
      color: '#ef4444',
      streak: 5,
      completions: [today, format(subDays(new Date(), 1), 'yyyy-MM-dd')],
    },
    {
      id: '2',
      name: 'Read 30 min',
      icon: '📚',
      color: '#3b82f6',
      streak: 12,
      completions: [today],
    },
    {
      id: '3',
      name: 'Drink 8 glasses',
      icon: '💧',
      color: '#06b6d4',
      streak: 3,
      completions: [],
    },
  ]);
  const [newHabit, setNewHabit] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('⚡');
  const [selectedColor, setSelectedColor] = useState(HABIT_COLORS[0]);

  const last7Days = Array.from({ length: 7 }, (_, i) =>
    format(subDays(new Date(), 6 - i), 'yyyy-MM-dd')
  );

  const toggleHabit = (habitId: string, date: string) => {
    setHabits((prev) =>
      prev.map((h) => {
        if (h.id !== habitId) return h;
        const isCompleted = h.completions.includes(date);
        const completions = isCompleted
          ? h.completions.filter((d) => d !== date)
          : [...h.completions, date];
        const streak = calculateStreak(completions);
        return { ...h, completions, streak };
      })
    );
  };

  const calculateStreak = (completions: string[]) => {
    let streak = 0;
    let d = new Date();
    while (completions.includes(format(d, 'yyyy-MM-dd'))) {
      streak++;
      d = subDays(d, 1);
    }
    return streak;
  };

  const addHabit = () => {
    if (newHabit.trim()) {
      setHabits((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          name: newHabit.trim(),
          icon: selectedIcon,
          color: selectedColor,
          streak: 0,
          completions: [],
        },
      ]);
      setNewHabit('');
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: isDark ? '#0c0a09' : '#f0fdf4' }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={[styles.header, { backgroundColor: themeColor }]}>
        <Text style={styles.headerTitle}>Habit Tracker</Text>
        <Text style={styles.headerDate}>{format(new Date(), 'MMMM yyyy')}</Text>
        <View style={styles.headerStats}>
          <View style={styles.headerStat}>
            <Text style={styles.headerStatNum}>{habits.length}</Text>
            <Text style={styles.headerStatLabel}>Habits</Text>
          </View>
          <View style={styles.headerStat}>
            <Text style={styles.headerStatNum}>
              {habits.filter((h) => h.completions.includes(today)).length}
            </Text>
            <Text style={styles.headerStatLabel}>Done Today</Text>
          </View>
          <View style={styles.headerStat}>
            <Text style={styles.headerStatNum}>
              {Math.max(...habits.map((h) => h.streak), 0)}
            </Text>
            <Text style={styles.headerStatLabel}>Best Streak</Text>
          </View>
        </View>
      </View>

      {/* 7-day grid header */}
      <View style={[styles.gridHeader, { backgroundColor: isDark ? '#1c1917' : '#fff' }]}>
        <View style={styles.habitNameCol} />
        {last7Days.map((d) => (
          <View key={d} style={styles.dayCol}>
            <Text style={[styles.dayName, { color: colors.mutedForeground }]}>
              {format(new Date(d), 'EEE')[0]}
            </Text>
            <Text
              style={[
                styles.dayNum,
                {
                  color: d === today ? '#fff' : colors.foreground,
                  backgroundColor: d === today ? themeColor : 'transparent',
                },
              ]}
            >
              {format(new Date(d), 'd')}
            </Text>
          </View>
        ))}
        <View style={styles.streakCol}>
          <Text style={[styles.streakLabel, { color: colors.mutedForeground }]}>🔥</Text>
        </View>
      </View>

      {/* Habits */}
      {habits.map((habit) => (
        <View
          key={habit.id}
          style={[styles.habitRow, { backgroundColor: isDark ? '#1c1917' : '#fff', borderColor: colors.border }]}
        >
          <View style={styles.habitNameCol}>
            <Text style={styles.habitIcon}>{habit.icon}</Text>
            <Text style={[styles.habitName, { color: colors.foreground }]} numberOfLines={1}>
              {habit.name}
            </Text>
          </View>
          {last7Days.map((d) => {
            const completed = habit.completions.includes(d);
            return (
              <TouchableOpacity
                key={d}
                onPress={() => toggleHabit(habit.id, d)}
                style={styles.dayCol}
              >
                <View
                  style={[
                    styles.completionDot,
                    {
                      backgroundColor: completed ? habit.color : (isDark ? '#292524' : '#f1f5f9'),
                      borderColor: completed ? habit.color : colors.border,
                    },
                  ]}
                >
                  {completed && <Ionicons name="checkmark" size={10} color="#fff" />}
                </View>
              </TouchableOpacity>
            );
          })}
          <View style={styles.streakCol}>
            <Text style={[styles.streakNum, { color: habit.color }]}>{habit.streak}</Text>
          </View>
        </View>
      ))}

      {/* Add Habit */}
      <View style={[styles.addSection, { backgroundColor: isDark ? '#1c1917' : '#fff' }]}>
        <Text style={[styles.addTitle, { color: colors.foreground }]}>Add Habit</Text>

        {/* Icon selector */}
        <View style={styles.iconRow}>
          {HABIT_ICONS.map((icon) => (
            <TouchableOpacity
              key={icon}
              onPress={() => setSelectedIcon(icon)}
              style={[
                styles.iconOption,
                { backgroundColor: selectedIcon === icon ? `${selectedColor}30` : (isDark ? '#292524' : '#f1f5f9') },
              ]}
            >
              <Text style={styles.iconEmoji}>{icon}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Color selector */}
        <View style={styles.colorRow}>
          {HABIT_COLORS.map((color) => (
            <TouchableOpacity
              key={color}
              onPress={() => setSelectedColor(color)}
              style={[
                styles.colorDot,
                { backgroundColor: color },
                selectedColor === color && styles.colorDotSelected,
              ]}
            />
          ))}
        </View>

        <View style={styles.addRow}>
          <TextInput
            value={newHabit}
            onChangeText={setNewHabit}
            placeholder="Habit name..."
            placeholderTextColor={colors.mutedForeground}
            style={[styles.addInput, { color: colors.foreground, borderColor: colors.border }]}
            onSubmitEditing={addHabit}
          />
          <TouchableOpacity onPress={addHabit} style={[styles.addBtn, { backgroundColor: themeColor }]}>
            <Ionicons name="add" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
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
  headerDate: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
    marginTop: 2,
    marginBottom: 16,
  },
  headerStats: {
    flexDirection: 'row',
    gap: 24,
  },
  headerStat: {
    alignItems: 'center',
  },
  headerStatNum: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '800',
  },
  headerStatLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 11,
    marginTop: 2,
  },
  gridHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#00000010',
  },
  habitNameCol: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dayCol: {
    width: 36,
    alignItems: 'center',
    gap: 4,
  },
  dayName: {
    fontSize: 10,
    fontWeight: '600',
  },
  dayNum: {
    width: 22,
    height: 22,
    borderRadius: 11,
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 22,
  },
  streakCol: {
    width: 30,
    alignItems: 'center',
  },
  streakLabel: {
    fontSize: 14,
  },
  habitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
  },
  habitIcon: {
    fontSize: 18,
  },
  habitName: {
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
    marginLeft: 6,
  },
  completionDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  streakNum: {
    fontSize: 13,
    fontWeight: '700',
  },
  addSection: {
    margin: 12,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  addTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 12,
  },
  iconRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  iconOption: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconEmoji: {
    fontSize: 20,
  },
  colorRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  colorDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  colorDotSelected: {
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  addRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  addInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
