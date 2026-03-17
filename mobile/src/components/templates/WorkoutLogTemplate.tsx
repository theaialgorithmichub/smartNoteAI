import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { format, startOfWeek, addDays, subWeeks, addWeeks } from 'date-fns';
import { useTheme } from '../../hooks/useTheme';
import { Notebook, Page } from '../../types';

interface Exercise { id: string; name: string; sets: number; reps: number; weight: string; category: string; notes?: string; }
interface DayWorkout { date: string; exercises: Exercise[]; completed: boolean; duration?: number; }

const EXERCISE_CATEGORIES = ['Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core', 'Cardio', 'Stretching'];
const CAT_COLORS: Record<string, string> = {
  Chest: '#ef4444', Back: '#3b82f6', Legs: '#f97316', Shoulders: '#8b5cf6',
  Arms: '#ec4899', Core: '#f59e0b', Cardio: '#10b981', Stretching: '#06b6d4',
};

interface Props { notebook: Notebook; pages: Page[]; currentPage: Page | null; pageIndex: number; onPageChange: (i: number) => void; }

export const WorkoutLogTemplate: React.FC<Props> = ({ notebook }) => {
  const { colors, isDark } = useTheme();
  const themeColor = notebook.appearance?.themeColor || '#f97316';
  const [weekOffset, setWeekOffset] = useState(0);
  const [workouts, setWorkouts] = useState<Record<string, DayWorkout>>({});
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showAddExercise, setShowAddExercise] = useState(false);
  const [exerciseForm, setExerciseForm] = useState({ name: '', sets: '3', reps: '10', weight: '', category: 'Chest', notes: '' });

  const weekStart = addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), weekOffset * 7);
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const addExercise = () => {
    if (!exerciseForm.name.trim() || !selectedDate) return;
    const exercise: Exercise = {
      id: Date.now().toString(),
      name: exerciseForm.name.trim(),
      sets: parseInt(exerciseForm.sets) || 3,
      reps: parseInt(exerciseForm.reps) || 10,
      weight: exerciseForm.weight,
      category: exerciseForm.category,
      notes: exerciseForm.notes,
    };
    setWorkouts(prev => ({
      ...prev,
      [selectedDate]: {
        date: selectedDate,
        exercises: [...(prev[selectedDate]?.exercises || []), exercise],
        completed: false,
      },
    }));
    setExerciseForm({ name: '', sets: '3', reps: '10', weight: '', category: 'Chest', notes: '' });
    setShowAddExercise(false);
  };

  const removeExercise = (date: string, id: string) => {
    setWorkouts(prev => ({
      ...prev,
      [date]: { ...prev[date], exercises: prev[date].exercises.filter(e => e.id !== id) },
    }));
  };

  const toggleComplete = (date: string) => {
    setWorkouts(prev => ({
      ...prev,
      [date]: { ...prev[date], completed: !(prev[date]?.completed) },
    }));
  };

  const selectedWorkout = selectedDate ? workouts[selectedDate] : null;
  const weeklyVolume = Object.values(workouts).reduce((sum, w) => sum + w.exercises.length, 0);
  const weeklyDays = Object.values(workouts).filter(w => w.exercises.length > 0).length;

  return (
    <ScrollView style={[styles.container, { backgroundColor: isDark ? '#0c0a09' : '#fff7ed' }]} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <LinearGradient colors={[themeColor, `${themeColor}99`]} style={styles.header}>
        <View style={styles.headerRow}>
          <Ionicons name="fitness" size={22} color="#fff" />
          <Text style={styles.headerTitle}>Workout Log</Text>
        </View>
        <View style={styles.weekStats}>
          <View style={styles.weekStat}><Text style={styles.weekStatNum}>{weeklyDays}</Text><Text style={styles.weekStatLabel}>Days</Text></View>
          <View style={styles.weekStat}><Text style={styles.weekStatNum}>{weeklyVolume}</Text><Text style={styles.weekStatLabel}>Exercises</Text></View>
        </View>
      </LinearGradient>

      {/* Week navigation */}
      <View style={[styles.weekNav, { backgroundColor: isDark ? '#1c1917' : '#fff', borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => setWeekOffset(w => w - 1)} style={styles.weekNavBtn}>
          <Ionicons name="chevron-back" size={20} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.weekLabel, { color: colors.foreground }]}>
          {format(weekStart, 'MMM d')} – {format(addDays(weekStart, 6), 'MMM d, yyyy')}
        </Text>
        <TouchableOpacity onPress={() => setWeekOffset(w => w + 1)} style={styles.weekNavBtn} disabled={weekOffset === 0}>
          <Ionicons name="chevron-forward" size={20} color={weekOffset === 0 ? colors.border : colors.foreground} />
        </TouchableOpacity>
      </View>

      {/* Week calendar */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.weekCalendar} style={{ backgroundColor: isDark ? '#1c1917' : '#fff' }}>
        {weekDays.map(day => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const dayWorkout = workouts[dateStr];
          const isToday = format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
          const isSelected = selectedDate === dateStr;
          return (
            <TouchableOpacity key={dateStr} onPress={() => setSelectedDate(isSelected ? null : dateStr)}
              style={[styles.dayCard, isSelected && { backgroundColor: themeColor }, dayWorkout?.completed && !isSelected && { borderColor: themeColor, borderWidth: 2 }]}>
              <Text style={[styles.dayName, { color: isSelected ? 'rgba(255,255,255,0.8)' : colors.mutedForeground }]}>{format(day, 'EEE')}</Text>
              <Text style={[styles.dayNum, { color: isSelected ? '#fff' : isToday ? themeColor : colors.foreground }, isToday && { fontWeight: '800' }]}>
                {format(day, 'd')}
              </Text>
              {dayWorkout && dayWorkout.exercises.length > 0 && (
                <View style={[styles.dayDot, { backgroundColor: isSelected ? 'rgba(255,255,255,0.7)' : themeColor }]} />
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Selected day exercises */}
      {selectedDate && (
        <View style={[styles.dayDetail, { backgroundColor: isDark ? '#1c1917' : '#fff' }]}>
          <View style={styles.dayDetailHeader}>
            <Text style={[styles.dayDetailTitle, { color: colors.foreground }]}>
              {format(new Date(selectedDate), 'EEEE, MMMM d')}
            </Text>
            <View style={styles.dayDetailActions}>
              {selectedWorkout && selectedWorkout.exercises.length > 0 && (
                <TouchableOpacity onPress={() => toggleComplete(selectedDate)}
                  style={[styles.completeBtn, { backgroundColor: selectedWorkout.completed ? '#10b98120' : (isDark ? '#292524' : '#f5f5f4') }]}>
                  <Ionicons name="checkmark-circle" size={16} color={selectedWorkout.completed ? '#10b981' : colors.mutedForeground} />
                  <Text style={[styles.completeBtnText, { color: selectedWorkout.completed ? '#10b981' : colors.mutedForeground }]}>
                    {selectedWorkout.completed ? 'Completed' : 'Mark Done'}
                  </Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={() => setShowAddExercise(true)}
                style={[styles.addExerciseBtn, { backgroundColor: themeColor }]}>
                <Ionicons name="add" size={18} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>

          {(!selectedWorkout || selectedWorkout.exercises.length === 0) ? (
            <View style={styles.emptyDay}>
              <Text style={{ fontSize: 36 }}>💪</Text>
              <Text style={[styles.emptyDayText, { color: colors.mutedForeground }]}>No exercises. Add one!</Text>
            </View>
          ) : (
            selectedWorkout.exercises.map(exercise => {
              const catColor = CAT_COLORS[exercise.category] || themeColor;
              return (
                <View key={exercise.id} style={[styles.exerciseRow, { borderColor: colors.border }]}>
                  <View style={[styles.catDot, { backgroundColor: catColor }]} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.exerciseName, { color: colors.foreground }]}>{exercise.name}</Text>
                    <Text style={[styles.exerciseMeta, { color: colors.mutedForeground }]}>
                      {exercise.sets} sets × {exercise.reps} reps{exercise.weight ? ` @ ${exercise.weight}` : ''} • {exercise.category}
                    </Text>
                    {exercise.notes && <Text style={[styles.exerciseNotes, { color: colors.mutedForeground }]}>{exercise.notes}</Text>}
                  </View>
                  <TouchableOpacity onPress={() => removeExercise(selectedDate, exercise.id)}>
                    <Ionicons name="trash-outline" size={16} color="#9ca3af" />
                  </TouchableOpacity>
                </View>
              );
            })
          )}
        </View>
      )}

      {/* Add Exercise Modal */}
      <Modal visible={showAddExercise} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modal, { backgroundColor: isDark ? '#1c1917' : '#fff' }]}>
            <View style={styles.modalHandle} />
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>Add Exercise</Text>
            <TextInput value={exerciseForm.name} onChangeText={v => setExerciseForm(p => ({ ...p, name: v }))} placeholder="Exercise name (e.g. Bench Press)"
              placeholderTextColor={colors.mutedForeground} style={[styles.input, { color: colors.foreground, borderColor: colors.border }]} />
            <View style={styles.setsRow}>
              {[{ label: 'Sets', field: 'sets' }, { label: 'Reps', field: 'reps' }].map(f => (
                <View key={f.field} style={{ flex: 1 }}>
                  <Text style={[styles.inputLabel, { color: colors.mutedForeground }]}>{f.label}</Text>
                  <TextInput value={(exerciseForm as any)[f.field]} onChangeText={v => setExerciseForm(p => ({ ...p, [f.field]: v }))}
                    keyboardType="numeric" style={[styles.input, { color: colors.foreground, borderColor: colors.border }]} />
                </View>
              ))}
              <View style={{ flex: 1 }}>
                <Text style={[styles.inputLabel, { color: colors.mutedForeground }]}>Weight (kg/lbs)</Text>
                <TextInput value={exerciseForm.weight} onChangeText={v => setExerciseForm(p => ({ ...p, weight: v }))} placeholder="Optional"
                  placeholderTextColor={colors.mutedForeground} style={[styles.input, { color: colors.foreground, borderColor: colors.border }]} />
              </View>
            </View>
            <Text style={[styles.inputLabel, { color: colors.mutedForeground }]}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ flexDirection: 'row', gap: 6, marginBottom: 10 }}>
              {EXERCISE_CATEGORIES.map(cat => (
                <TouchableOpacity key={cat} onPress={() => setExerciseForm(p => ({ ...p, category: cat }))}
                  style={[styles.catChip, { backgroundColor: exerciseForm.category === cat ? (CAT_COLORS[cat] || themeColor) : (isDark ? '#292524' : '#f5f5f4') }]}>
                  <Text style={[styles.catChipText, { color: exerciseForm.category === cat ? '#fff' : colors.foreground }]}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TextInput value={exerciseForm.notes} onChangeText={v => setExerciseForm(p => ({ ...p, notes: v }))} placeholder="Notes (optional)"
              placeholderTextColor={colors.mutedForeground} style={[styles.input, { color: colors.foreground, borderColor: colors.border }]} />
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 8 }}>
              <TouchableOpacity onPress={() => setShowAddExercise(false)} style={[styles.cancelBtn, { borderColor: colors.border }]}>
                <Text style={{ color: colors.foreground }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={addExercise} style={[styles.submitBtn, { backgroundColor: themeColor }]}>
                <Text style={styles.submitText}>Add Exercise</Text>
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
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: '800' },
  weekStats: { flexDirection: 'row', gap: 20 },
  weekStat: { alignItems: 'center' },
  weekStatNum: { color: '#fff', fontSize: 22, fontWeight: '800' },
  weekStatLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 11 },
  weekNav: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 16, borderBottomWidth: 1 },
  weekNavBtn: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
  weekLabel: { flex: 1, textAlign: 'center', fontSize: 14, fontWeight: '600' },
  weekCalendar: { flexDirection: 'row', gap: 8, paddingHorizontal: 12, paddingVertical: 10 },
  dayCard: { width: 50, alignItems: 'center', paddingVertical: 8, borderRadius: 12, gap: 4 },
  dayName: { fontSize: 10, fontWeight: '600' },
  dayNum: { fontSize: 16, fontWeight: '700' },
  dayDot: { width: 6, height: 6, borderRadius: 3 },
  dayDetail: { margin: 12, borderRadius: 12, padding: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  dayDetailHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  dayDetailTitle: { fontSize: 15, fontWeight: '700' },
  dayDetailActions: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  completeBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  completeBtnText: { fontSize: 12, fontWeight: '600' },
  addExerciseBtn: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  emptyDay: { alignItems: 'center', paddingVertical: 20, gap: 8 },
  emptyDayText: { fontSize: 14 },
  exerciseRow: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 12, borderTopWidth: 1, gap: 10 },
  catDot: { width: 12, height: 12, borderRadius: 6, marginTop: 3 },
  exerciseName: { fontSize: 14, fontWeight: '700' },
  exerciseMeta: { fontSize: 12, marginTop: 2 },
  exerciseNotes: { fontSize: 11, marginTop: 2, fontStyle: 'italic' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modal: { borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, paddingBottom: 40 },
  modalHandle: { width: 40, height: 4, backgroundColor: '#e7e5e4', borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 14 },
  input: { borderWidth: 1, borderRadius: 8, padding: 10, fontSize: 14, marginBottom: 10 },
  setsRow: { flexDirection: 'row', gap: 8 },
  inputLabel: { fontSize: 12, marginBottom: 4 },
  catChip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 14 },
  catChipText: { fontSize: 12, fontWeight: '600' },
  cancelBtn: { flex: 1, borderWidth: 1, borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  submitBtn: { flex: 2, paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  submitText: { color: '#fff', fontSize: 14, fontWeight: '700' },
});
