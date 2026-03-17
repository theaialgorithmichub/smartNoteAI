import React, { useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { format } from 'date-fns';
import { useTheme } from '../../hooks/useTheme';
import { Notebook, Page } from '../../types';

interface GoalTrackerTemplateProps {
  notebook: Notebook;
  pages: Page[];
  currentPage: Page | null;
  pageIndex: number;
  onPageChange: (index: number) => void;
}

interface Milestone {
  id: string;
  text: string;
  done: boolean;
}

interface Goal {
  id: string;
  title: string;
  description: string;
  category: string;
  deadline: string;
  progress: number;
  milestones: Milestone[];
  color: string;
}

const GOAL_CATEGORIES = ['Career', 'Health', 'Finance', 'Education', 'Personal', 'Relationships'];
const GOAL_COLORS = ['#f59e0b', '#ef4444', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899'];

export const GoalTrackerTemplate: React.FC<GoalTrackerTemplateProps> = ({ notebook }) => {
  const { colors, isDark } = useTheme();
  const themeColor = notebook.appearance?.themeColor || '#f59e0b';
  const [goals, setGoals] = useState<Goal[]>([
    {
      id: '1',
      title: 'Run a 5K',
      description: 'Complete my first 5K run by end of month',
      category: 'Health',
      deadline: '2025-04-30',
      progress: 60,
      milestones: [
        { id: 'm1', text: 'Run 1km without stopping', done: true },
        { id: 'm2', text: 'Run 3km', done: true },
        { id: 'm3', text: 'Complete 5km training run', done: false },
        { id: 'm4', text: 'Race day!', done: false },
      ],
      color: '#10b981',
    },
  ]);
  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCategory, setNewCategory] = useState('Personal');
  const [newColor, setNewColor] = useState(GOAL_COLORS[0]);
  const [newDeadline, setNewDeadline] = useState('');

  const addGoal = () => {
    if (!newTitle.trim()) return;
    setGoals((p) => [...p, {
      id: Date.now().toString(),
      title: newTitle.trim(),
      description: newDesc.trim(),
      category: newCategory,
      deadline: newDeadline,
      progress: 0,
      milestones: [],
      color: newColor,
    }]);
    setNewTitle(''); setNewDesc(''); setNewDeadline('');
    setShowAdd(false);
  };

  const toggleMilestone = (goalId: string, milestoneId: string) => {
    setGoals((p) => p.map((g) => {
      if (g.id !== goalId) return g;
      const milestones = g.milestones.map((m) =>
        m.id === milestoneId ? { ...m, done: !m.done } : m
      );
      const done = milestones.filter((m) => m.done).length;
      const progress = milestones.length ? Math.round((done / milestones.length) * 100) : g.progress;
      return { ...g, milestones, progress };
    }));
  };

  const addMilestone = (goalId: string, text: string) => {
    if (!text.trim()) return;
    setGoals((p) => p.map((g) =>
      g.id === goalId
        ? { ...g, milestones: [...g.milestones, { id: Date.now().toString(), text: text.trim(), done: false }] }
        : g
    ));
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: isDark ? '#0c0a09' : '#fffbeb' }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <LinearGradient colors={[themeColor, `${themeColor}99`]} style={styles.header}>
        <Text style={styles.headerTitle}>Goal Tracker</Text>
        <View style={styles.headerStats}>
          <View style={styles.stat}>
            <Text style={styles.statNum}>{goals.length}</Text>
            <Text style={styles.statLabel}>Goals</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statNum}>{goals.filter((g) => g.progress === 100).length}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statNum}>
              {goals.length ? Math.round(goals.reduce((a, g) => a + g.progress, 0) / goals.length) : 0}%
            </Text>
            <Text style={styles.statLabel}>Avg Progress</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Goals */}
      {goals.map((goal) => (
        <GoalCard
          key={goal.id}
          goal={goal}
          colors={colors}
          isDark={isDark}
          onToggleMilestone={(mId) => toggleMilestone(goal.id, mId)}
          onAddMilestone={(text) => addMilestone(goal.id, text)}
        />
      ))}

      {/* Add Goal */}
      {showAdd ? (
        <View style={[styles.addForm, { backgroundColor: isDark ? '#1c1917' : '#fff' }]}>
          <Text style={[styles.addFormTitle, { color: colors.foreground }]}>New Goal</Text>
          <TextInput value={newTitle} onChangeText={setNewTitle} placeholder="Goal title" placeholderTextColor={colors.mutedForeground}
            style={[styles.input, { color: colors.foreground, borderColor: colors.border }]} />
          <TextInput value={newDesc} onChangeText={setNewDesc} placeholder="Description (optional)" placeholderTextColor={colors.mutedForeground}
            multiline style={[styles.input, { color: colors.foreground, borderColor: colors.border }]} />
          <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Category</Text>
          <View style={styles.categoryGrid}>
            {GOAL_CATEGORIES.map((cat) => (
              <TouchableOpacity key={cat} onPress={() => setNewCategory(cat)}
                style={[styles.catChip, { backgroundColor: newCategory === cat ? themeColor : (isDark ? '#292524' : '#f5f5f4'), borderColor: newCategory === cat ? themeColor : colors.border }]}>
                <Text style={[styles.catText, { color: newCategory === cat ? '#fff' : colors.foreground }]}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Color</Text>
          <View style={styles.colorRow}>
            {GOAL_COLORS.map((c) => (
              <TouchableOpacity key={c} onPress={() => setNewColor(c)}
                style={[styles.colorDot, { backgroundColor: c, borderWidth: newColor === c ? 3 : 0, borderColor: '#fff' }]} />
            ))}
          </View>
          <TextInput value={newDeadline} onChangeText={setNewDeadline} placeholder="Deadline (YYYY-MM-DD)" placeholderTextColor={colors.mutedForeground}
            style={[styles.input, { color: colors.foreground, borderColor: colors.border }]} />
          <View style={styles.formBtns}>
            <TouchableOpacity onPress={() => setShowAdd(false)} style={[styles.formBtn, { borderColor: colors.border }]}>
              <Text style={[styles.formBtnText, { color: colors.foreground }]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={addGoal} style={[styles.formBtn, { backgroundColor: themeColor }]}>
              <Text style={[styles.formBtnText, { color: '#fff' }]}>Add Goal</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <TouchableOpacity onPress={() => setShowAdd(true)} style={[styles.addGoalBtn, { borderColor: themeColor }]}>
          <Ionicons name="add-circle" size={20} color={themeColor} />
          <Text style={[styles.addGoalBtnText, { color: themeColor }]}>Add New Goal</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
};

const GoalCard = ({ goal, colors, isDark, onToggleMilestone, onAddMilestone }: {
  goal: Goal;
  colors: any;
  isDark: boolean;
  onToggleMilestone: (id: string) => void;
  onAddMilestone: (text: string) => void;
}) => {
  const [newMilestone, setNewMilestone] = useState('');
  const [expanded, setExpanded] = useState(true);

  return (
    <View style={[styles.goalCard, { backgroundColor: isDark ? '#1c1917' : '#fff', borderColor: goal.color, borderLeftWidth: 4 }]}>
      <TouchableOpacity onPress={() => setExpanded(!expanded)} style={styles.goalHeader}>
        <View style={styles.goalTitleRow}>
          <View style={[styles.goalColorDot, { backgroundColor: goal.color }]} />
          <Text style={[styles.goalTitle, { color: colors.foreground }]}>{goal.title}</Text>
          <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={16} color={colors.mutedForeground} />
        </View>
        <View style={styles.goalMeta}>
          <View style={[styles.catBadge, { backgroundColor: `${goal.color}20` }]}>
            <Text style={[styles.catBadgeText, { color: goal.color }]}>{goal.category}</Text>
          </View>
          {goal.deadline && <Text style={[styles.deadlineText, { color: colors.mutedForeground }]}>by {goal.deadline}</Text>}
        </View>
        <View style={styles.progressRow}>
          <View style={[styles.progressBar, { backgroundColor: isDark ? '#292524' : '#f1f5f9' }]}>
            <View style={[styles.progressFill, { width: `${goal.progress}%` as any, backgroundColor: goal.color }]} />
          </View>
          <Text style={[styles.progressPct, { color: goal.color }]}>{goal.progress}%</Text>
        </View>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.milestones}>
          {goal.description ? (
            <Text style={[styles.goalDesc, { color: colors.mutedForeground }]}>{goal.description}</Text>
          ) : null}
          {goal.milestones.map((m) => (
            <TouchableOpacity key={m.id} onPress={() => onToggleMilestone(m.id)} style={styles.milestoneRow}>
              <View style={[styles.mCheckbox, { borderColor: goal.color, backgroundColor: m.done ? goal.color : 'transparent' }]}>
                {m.done && <Ionicons name="checkmark" size={12} color="#fff" />}
              </View>
              <Text style={[styles.milestoneText, { color: colors.foreground }, m.done && { textDecorationLine: 'line-through', color: colors.mutedForeground }]}>
                {m.text}
              </Text>
            </TouchableOpacity>
          ))}
          <View style={styles.addMilestoneRow}>
            <TextInput
              value={newMilestone}
              onChangeText={setNewMilestone}
              placeholder="Add milestone..."
              placeholderTextColor={colors.mutedForeground}
              style={[styles.milestoneInput, { color: colors.foreground, borderColor: colors.border }]}
              onSubmitEditing={() => { onAddMilestone(newMilestone); setNewMilestone(''); }}
            />
            <TouchableOpacity onPress={() => { onAddMilestone(newMilestone); setNewMilestone(''); }}
              style={[styles.addMilestoneBtn, { backgroundColor: goal.color }]}>
              <Ionicons name="add" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 20, paddingTop: 24, gap: 16 },
  headerTitle: { color: '#fff', fontSize: 22, fontWeight: '800' },
  headerStats: { flexDirection: 'row', gap: 24 },
  stat: { alignItems: 'center' },
  statNum: { color: '#fff', fontSize: 22, fontWeight: '800' },
  statLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 11, marginTop: 2 },
  goalCard: {
    margin: 12, marginBottom: 8, borderRadius: 12, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  goalHeader: { padding: 16 },
  goalTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  goalColorDot: { width: 10, height: 10, borderRadius: 5 },
  goalTitle: { flex: 1, fontSize: 16, fontWeight: '700' },
  goalMeta: { flexDirection: 'row', gap: 8, alignItems: 'center', marginBottom: 10 },
  catBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  catBadgeText: { fontSize: 11, fontWeight: '700' },
  deadlineText: { fontSize: 12 },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  progressBar: { flex: 1, height: 8, borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4 },
  progressPct: { fontSize: 13, fontWeight: '700', width: 36 },
  milestones: { paddingHorizontal: 16, paddingBottom: 14, borderTopWidth: 1, borderTopColor: '#00000010', paddingTop: 12 },
  goalDesc: { fontSize: 13, marginBottom: 10, fontStyle: 'italic' },
  milestoneRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6, gap: 10 },
  mCheckbox: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, justifyContent: 'center', alignItems: 'center' },
  milestoneText: { flex: 1, fontSize: 14 },
  addMilestoneRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
  milestoneInput: { flex: 1, borderWidth: 1, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 7, fontSize: 13 },
  addMilestoneBtn: { width: 36, height: 36, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  addForm: {
    margin: 12, borderRadius: 12, padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  addFormTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
  input: { borderWidth: 1, borderRadius: 8, padding: 10, fontSize: 14, marginBottom: 10 },
  fieldLabel: { fontSize: 13, fontWeight: '600', marginBottom: 8 },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  catChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 1.5 },
  catText: { fontSize: 13, fontWeight: '500' },
  colorRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  colorDot: { width: 32, height: 32, borderRadius: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 2, elevation: 2 },
  formBtns: { flexDirection: 'row', gap: 10, marginTop: 4 },
  formBtn: { flex: 1, paddingVertical: 12, borderRadius: 10, borderWidth: 1, alignItems: 'center' },
  formBtnText: { fontSize: 14, fontWeight: '600' },
  addGoalBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    margin: 12, paddingVertical: 14, borderRadius: 12, borderWidth: 2, borderStyle: 'dashed',
  },
  addGoalBtnText: { fontSize: 15, fontWeight: '700' },
});
