import React, { useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, Modal, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../hooks/useTheme';
import { Notebook, Page } from '../../types';

interface Task {
  id: string; title: string;
  status: 'backlog' | 'todo' | 'in-progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high'; assignee?: string;
}

interface Props { notebook: Notebook; pages: Page[]; currentPage: Page | null; pageIndex: number; onPageChange: (i: number) => void; }

const STAGES = [
  { id: 'backlog', name: 'Backlog', color: '#6b7280', icon: 'alert-circle' },
  { id: 'todo', name: 'To Do', color: '#3b82f6', icon: 'time' },
  { id: 'in-progress', name: 'In Progress', color: '#8b5cf6', icon: 'arrow-forward' },
  { id: 'review', name: 'Review', color: '#f59e0b', icon: 'eye' },
  { id: 'done', name: 'Done', color: '#10b981', icon: 'checkmark-circle' },
] as const;

const PRIORITY_COLORS = { low: '#10b981', medium: '#f59e0b', high: '#ef4444' };

export const ProjectPipelineTemplate: React.FC<Props> = ({ notebook }) => {
  const { colors, isDark } = useTheme();
  const themeColor = notebook.appearance?.themeColor || '#0ea5e9';
  const [tasks, setTasks] = useState<Task[]>([
    { id: '1', title: 'Research competitors', status: 'done', priority: 'high', assignee: 'Alice' },
    { id: '2', title: 'Design wireframes', status: 'review', priority: 'high', assignee: 'Bob' },
    { id: '3', title: 'Implement API endpoints', status: 'in-progress', priority: 'medium', assignee: 'Alice' },
    { id: '4', title: 'Write unit tests', status: 'todo', priority: 'medium' },
    { id: '5', title: 'Set up CI/CD', status: 'backlog', priority: 'low' },
  ]);
  const [showAdd, setShowAdd] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', priority: 'medium' as 'low' | 'medium' | 'high', assignee: '', status: 'backlog' as Task['status'] });
  const [selectedStage, setSelectedStage] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');

  const getTasksByStatus = (status: string) => tasks.filter(t => t.status === status);

  const addTask = () => {
    if (!newTask.title.trim()) return;
    setTasks(p => [...p, { id: Date.now().toString(), ...newTask }]);
    setNewTask({ title: '', priority: 'medium', assignee: '', status: 'backlog' });
    setShowAdd(false);
  };

  const moveTask = (taskId: string, newStatus: Task['status']) => {
    setTasks(p => p.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
  };

  const deleteTask = (id: string) => setTasks(p => p.filter(t => t.id !== id));

  const TaskCard = ({ task }: { task: Task }) => (
    <View style={[styles.taskCard, { backgroundColor: isDark ? '#292524' : '#fff', borderColor: colors.border }]}>
      <View style={styles.taskCardTop}>
        <Text style={[styles.taskTitle, { color: colors.foreground }]} numberOfLines={2}>{task.title}</Text>
        <TouchableOpacity onPress={() => deleteTask(task.id)}>
          <Ionicons name="close" size={14} color="#9ca3af" />
        </TouchableOpacity>
      </View>
      <View style={styles.taskCardBottom}>
        <View style={[styles.priorityBadge, { backgroundColor: `${PRIORITY_COLORS[task.priority]}20` }]}>
          <Text style={[styles.priorityText, { color: PRIORITY_COLORS[task.priority] }]}>{task.priority}</Text>
        </View>
        {task.assignee && (
          <View style={styles.assigneeRow}>
            <View style={[styles.avatarSmall, { backgroundColor: themeColor }]}>
              <Text style={styles.avatarSmallText}>{task.assignee[0].toUpperCase()}</Text>
            </View>
            <Text style={[styles.assigneeName, { color: colors.mutedForeground }]}>{task.assignee}</Text>
          </View>
        )}
      </View>
      {/* Move to next stage */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.moveRow}>
        {STAGES.filter(s => s.id !== task.status).map(s => (
          <TouchableOpacity key={s.id} onPress={() => moveTask(task.id, s.id as Task['status'])}
            style={[styles.moveBtn, { borderColor: s.color }]}>
            <Text style={[styles.moveBtnText, { color: s.color }]}>{s.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#0c0a09' : '#f0f9ff' }]}>
      {/* Header */}
      <LinearGradient colors={[themeColor, `${themeColor}99`]} style={styles.header}>
        <View style={styles.headerRow}>
          <Ionicons name="git-branch" size={20} color="#fff" />
          <Text style={styles.headerTitle}>Project Pipeline</Text>
          <View style={styles.headerRight}>
            <TouchableOpacity onPress={() => setViewMode(viewMode === 'kanban' ? 'list' : 'kanban')} style={styles.viewToggle}>
              <Ionicons name={viewMode === 'kanban' ? 'list' : 'grid'} size={18} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowAdd(true)} style={styles.addHeaderBtn}>
              <Ionicons name="add" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
        {/* Stats */}
        <View style={styles.statsRow}>
          {STAGES.map(s => (
            <View key={s.id} style={styles.stageStat}>
              <Text style={styles.stageStatNum}>{getTasksByStatus(s.id).length}</Text>
              <Text style={styles.stageStatLabel}>{s.name}</Text>
            </View>
          ))}
        </View>
      </LinearGradient>

      {viewMode === 'kanban' ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.kanbanBoard}>
          {STAGES.map(stage => (
            <View key={stage.id} style={[styles.kanbanColumn, { backgroundColor: isDark ? '#1c1917' : '#f8fafc' }]}>
              <View style={[styles.columnHeader, { borderBottomColor: stage.color }]}>
                <Ionicons name={stage.icon as any} size={14} color={stage.color} />
                <Text style={[styles.columnTitle, { color: stage.color }]}>{stage.name}</Text>
                <View style={[styles.countBadge, { backgroundColor: `${stage.color}20` }]}>
                  <Text style={[styles.countText, { color: stage.color }]}>{getTasksByStatus(stage.id).length}</Text>
                </View>
              </View>
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingTop: 8 }}>
                {getTasksByStatus(stage.id).map(task => <TaskCard key={task.id} task={task} />)}
                <TouchableOpacity onPress={() => { setNewTask(p => ({ ...p, status: stage.id as Task['status'] })); setShowAdd(true); }}
                  style={[styles.addCardBtn, { borderColor: stage.color }]}>
                  <Ionicons name="add" size={14} color={stage.color} />
                  <Text style={[styles.addCardBtnText, { color: stage.color }]}>Add</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          ))}
        </ScrollView>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 12, gap: 8 }}>
          {tasks.map(task => {
            const stage = STAGES.find(s => s.id === task.status)!;
            return (
              <View key={task.id} style={[styles.listItem, { backgroundColor: isDark ? '#1c1917' : '#fff', borderColor: colors.border }]}>
                <View style={[styles.statusDot, { backgroundColor: stage.color }]} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.listItemTitle, { color: colors.foreground }]}>{task.title}</Text>
                  <Text style={[styles.listItemStatus, { color: stage.color }]}>{stage.name}</Text>
                </View>
                <View style={[styles.priorityBadge, { backgroundColor: `${PRIORITY_COLORS[task.priority]}20` }]}>
                  <Text style={[styles.priorityText, { color: PRIORITY_COLORS[task.priority] }]}>{task.priority}</Text>
                </View>
                <TouchableOpacity onPress={() => deleteTask(task.id)}><Ionicons name="trash-outline" size={16} color="#9ca3af" /></TouchableOpacity>
              </View>
            );
          })}
        </ScrollView>
      )}

      {/* Add Task Modal */}
      <Modal visible={showAdd} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modal, { backgroundColor: isDark ? '#1c1917' : '#fff' }]}>
            <View style={styles.modalHandle} />
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>New Task</Text>
            <TextInput value={newTask.title} onChangeText={v => setNewTask(p => ({ ...p, title: v }))} placeholder="Task title..."
              placeholderTextColor={colors.mutedForeground} style={[styles.modalInput, { color: colors.foreground, borderColor: colors.border }]} />
            <TextInput value={newTask.assignee} onChangeText={v => setNewTask(p => ({ ...p, assignee: v }))} placeholder="Assignee (optional)"
              placeholderTextColor={colors.mutedForeground} style={[styles.modalInput, { color: colors.foreground, borderColor: colors.border }]} />
            <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Stage</Text>
            <View style={styles.stageGrid}>
              {STAGES.map(s => (
                <TouchableOpacity key={s.id} onPress={() => setNewTask(p => ({ ...p, status: s.id as Task['status'] }))}
                  style={[styles.stageOption, { backgroundColor: newTask.status === s.id ? s.color : (isDark ? '#292524' : '#f5f5f4'), borderColor: newTask.status === s.id ? s.color : colors.border }]}>
                  <Text style={[styles.stageOptionText, { color: newTask.status === s.id ? '#fff' : colors.foreground }]}>{s.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Priority</Text>
            <View style={styles.priorityRow}>
              {(['low', 'medium', 'high'] as const).map(p => (
                <TouchableOpacity key={p} onPress={() => setNewTask(prev => ({ ...prev, priority: p }))}
                  style={[styles.prioOption, { backgroundColor: newTask.priority === p ? PRIORITY_COLORS[p] : `${PRIORITY_COLORS[p]}20` }]}>
                  <Text style={[styles.prioText, { color: newTask.priority === p ? '#fff' : PRIORITY_COLORS[p] }]}>{p}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
              <TouchableOpacity onPress={() => setShowAdd(false)} style={[styles.cancelBtn, { borderColor: colors.border }]}>
                <Text style={{ color: colors.foreground }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={addTask} style={[styles.submitBtn, { backgroundColor: themeColor }]}>
                <Text style={styles.submitText}>Add Task</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 16, paddingTop: 20, gap: 12 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerTitle: { flex: 1, color: '#fff', fontSize: 18, fontWeight: '700' },
  headerRight: { flexDirection: 'row', gap: 8 },
  viewToggle: { width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  addHeaderBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(255,255,255,0.25)', justifyContent: 'center', alignItems: 'center' },
  statsRow: { flexDirection: 'row', gap: 4 },
  stageStat: { flex: 1, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 8, padding: 6, alignItems: 'center' },
  stageStatNum: { color: '#fff', fontSize: 16, fontWeight: '800' },
  stageStatLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 9, marginTop: 1 },
  kanbanBoard: { flex: 1 },
  kanbanColumn: { width: 220, margin: 8, borderRadius: 12, padding: 10, maxHeight: 600 },
  columnHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingBottom: 10, borderBottomWidth: 2, marginBottom: 4 },
  columnTitle: { flex: 1, fontSize: 13, fontWeight: '700' },
  countBadge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 10 },
  countText: { fontSize: 11, fontWeight: '700' },
  taskCard: { borderRadius: 10, borderWidth: 1, padding: 10, gap: 8 },
  taskCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  taskTitle: { flex: 1, fontSize: 13, fontWeight: '600', lineHeight: 18 },
  taskCardBottom: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  priorityBadge: { paddingHorizontal: 7, paddingVertical: 3, borderRadius: 8 },
  priorityText: { fontSize: 10, fontWeight: '700' },
  assigneeRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  avatarSmall: { width: 18, height: 18, borderRadius: 9, justifyContent: 'center', alignItems: 'center' },
  avatarSmallText: { color: '#fff', fontSize: 9, fontWeight: '700' },
  assigneeName: { fontSize: 11 },
  moveRow: { flexDirection: 'row', gap: 4, paddingTop: 4 },
  moveBtn: { paddingHorizontal: 7, paddingVertical: 3, borderRadius: 6, borderWidth: 1 },
  moveBtnText: { fontSize: 9, fontWeight: '700' },
  addCardBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingVertical: 8, borderRadius: 8, borderWidth: 1.5, borderStyle: 'dashed' },
  addCardBtnText: { fontSize: 12, fontWeight: '600' },
  listItem: { flexDirection: 'row', alignItems: 'center', borderRadius: 10, borderWidth: 1, padding: 12, gap: 10 },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  listItemTitle: { fontSize: 14, fontWeight: '600' },
  listItemStatus: { fontSize: 12, marginTop: 2 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modal: { borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, paddingBottom: 40 },
  modalHandle: { width: 40, height: 4, backgroundColor: '#e7e5e4', borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 14 },
  modalInput: { borderWidth: 1, borderRadius: 8, padding: 10, fontSize: 14, marginBottom: 10 },
  fieldLabel: { fontSize: 13, fontWeight: '600', marginBottom: 8 },
  stageGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  stageOption: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 1.5 },
  stageOptionText: { fontSize: 12, fontWeight: '600' },
  priorityRow: { flexDirection: 'row', gap: 8, marginBottom: 4 },
  prioOption: { flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: 'center' },
  prioText: { fontSize: 13, fontWeight: '700' },
  cancelBtn: { flex: 1, borderWidth: 1, borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  submitBtn: { flex: 2, paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  submitText: { color: '#fff', fontSize: 14, fontWeight: '700' },
});
