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
import { useTheme } from '../../hooks/useTheme';
import { Notebook, Page } from '../../types';

interface TodoTemplateProps {
  notebook: Notebook;
  pages: Page[];
  currentPage: Page | null;
  pageIndex: number;
  onPageChange: (index: number) => void;
}

interface TodoItem {
  id: string;
  text: string;
  priority: 'high' | 'medium' | 'low';
  done: boolean;
  deadline?: string;
}

const PRIORITY_COLORS = {
  high: '#ef4444',
  medium: '#f59e0b',
  low: '#10b981',
};

export const TodoTemplate: React.FC<TodoTemplateProps> = ({
  notebook,
}) => {
  const { colors, isDark } = useTheme();
  const themeColor = notebook.appearance?.themeColor || '#3b82f6';

  const [todos, setTodos] = useState<TodoItem[]>([
    { id: '1', text: 'Review project requirements', priority: 'high', done: false },
    { id: '2', text: 'Write unit tests', priority: 'medium', done: false },
    { id: '3', text: 'Update documentation', priority: 'low', done: true },
  ]);
  const [newTodo, setNewTodo] = useState('');
  const [newPriority, setNewPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [filter, setFilter] = useState<'all' | 'active' | 'done'>('all');

  const addTodo = () => {
    if (newTodo.trim()) {
      setTodos((prev) => [
        { id: Date.now().toString(), text: newTodo.trim(), priority: newPriority, done: false },
        ...prev,
      ]);
      setNewTodo('');
    }
  };

  const toggleTodo = (id: string) => {
    setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  };

  const deleteTodo = (id: string) => {
    setTodos((prev) => prev.filter((t) => t.id !== id));
  };

  const filteredTodos = todos.filter((t) => {
    if (filter === 'active') return !t.done;
    if (filter === 'done') return t.done;
    return true;
  });

  const doneCount = todos.filter((t) => t.done).length;
  const progress = todos.length ? (doneCount / todos.length) * 100 : 0;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: isDark ? '#0c0a09' : '#f8fafc' }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Progress */}
      <View style={[styles.progressSection, { backgroundColor: isDark ? '#1c1917' : '#fff' }]}>
        <View style={styles.progressHeader}>
          <Text style={[styles.progressTitle, { color: colors.foreground }]}>Progress</Text>
          <Text style={[styles.progressCount, { color: themeColor }]}>
            {doneCount}/{todos.length} done
          </Text>
        </View>
        <View style={[styles.progressBar, { backgroundColor: isDark ? '#292524' : '#f1f5f9' }]}>
          <View
            style={[
              styles.progressFill,
              { width: `${progress}%` as any, backgroundColor: themeColor },
            ]}
          />
        </View>
      </View>

      {/* Add Todo */}
      <View style={[styles.addSection, { backgroundColor: isDark ? '#1c1917' : '#fff' }]}>
        {/* Priority selector */}
        <View style={styles.priorityRow}>
          {(['high', 'medium', 'low'] as const).map((p) => (
            <TouchableOpacity
              key={p}
              onPress={() => setNewPriority(p)}
              style={[
                styles.priorityBtn,
                {
                  backgroundColor:
                    newPriority === p ? PRIORITY_COLORS[p] : `${PRIORITY_COLORS[p]}20`,
                },
              ]}
            >
              <Text
                style={[
                  styles.priorityText,
                  { color: newPriority === p ? '#fff' : PRIORITY_COLORS[p] },
                ]}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.addRow}>
          <TextInput
            value={newTodo}
            onChangeText={setNewTodo}
            placeholder="Add a task..."
            placeholderTextColor={colors.mutedForeground}
            style={[styles.addInput, { color: colors.foreground, borderColor: colors.border }]}
            onSubmitEditing={addTodo}
          />
          <TouchableOpacity onPress={addTodo} style={[styles.addBtn, { backgroundColor: themeColor }]}>
            <Ionicons name="add" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Filter tabs */}
      <View style={[styles.filterRow, { backgroundColor: isDark ? '#1c1917' : '#f1f5f9' }]}>
        {(['all', 'active', 'done'] as const).map((f) => (
          <TouchableOpacity
            key={f}
            onPress={() => setFilter(f)}
            style={[
              styles.filterTab,
              { backgroundColor: filter === f ? themeColor : 'transparent' },
            ]}
          >
            <Text
              style={[
                styles.filterText,
                { color: filter === f ? '#fff' : colors.mutedForeground },
              ]}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Todo list */}
      <View style={styles.list}>
        {filteredTodos.map((todo) => (
          <View
            key={todo.id}
            style={[
              styles.todoItem,
              { backgroundColor: isDark ? '#1c1917' : '#fff', borderColor: colors.border },
            ]}
          >
            <TouchableOpacity onPress={() => toggleTodo(todo.id)} style={styles.todoCheck}>
              <View
                style={[
                  styles.checkbox,
                  {
                    borderColor: todo.done ? themeColor : colors.border,
                    backgroundColor: todo.done ? themeColor : 'transparent',
                  },
                ]}
              >
                {todo.done && <Ionicons name="checkmark" size={12} color="#fff" />}
              </View>
            </TouchableOpacity>

            <View style={styles.todoContent}>
              <Text
                style={[
                  styles.todoText,
                  { color: colors.foreground },
                  todo.done && { textDecorationLine: 'line-through', color: colors.mutedForeground },
                ]}
              >
                {todo.text}
              </Text>
              <View
                style={[
                  styles.priorityBadge,
                  { backgroundColor: `${PRIORITY_COLORS[todo.priority]}20` },
                ]}
              >
                <View style={[styles.priorityDot, { backgroundColor: PRIORITY_COLORS[todo.priority] }]} />
                <Text style={[styles.priorityBadgeText, { color: PRIORITY_COLORS[todo.priority] }]}>
                  {todo.priority}
                </Text>
              </View>
            </View>

            <TouchableOpacity onPress={() => deleteTodo(todo.id)} style={styles.deleteBtn}>
              <Ionicons name="trash-outline" size={16} color="#9ca3af" />
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  progressSection: {
    margin: 12,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  progressTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  progressCount: {
    fontSize: 14,
    fontWeight: '600',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  addSection: {
    margin: 12,
    marginTop: 0,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  priorityRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  priorityBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    flex: 1,
    alignItems: 'center',
  },
  priorityText: {
    fontSize: 13,
    fontWeight: '600',
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
  filterRow: {
    flexDirection: 'row',
    marginHorizontal: 12,
    borderRadius: 10,
    padding: 4,
    marginBottom: 8,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600',
  },
  list: {
    paddingHorizontal: 12,
    gap: 8,
    paddingBottom: 40,
  },
  todoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    gap: 10,
  },
  todoCheck: {
    marginTop: 2,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  todoContent: {
    flex: 1,
    gap: 6,
  },
  todoText: {
    fontSize: 14,
    lineHeight: 20,
  },
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  priorityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  priorityBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  deleteBtn: {
    padding: 4,
  },
});
