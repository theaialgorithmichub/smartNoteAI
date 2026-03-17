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
import { format } from 'date-fns';
import { useTheme } from '../../hooks/useTheme';
import { Notebook, Page } from '../../types';

interface MeetingNotesTemplateProps {
  notebook: Notebook;
  pages: Page[];
  currentPage: Page | null;
  pageIndex: number;
  onPageChange: (index: number) => void;
}

interface ActionItem {
  id: string;
  text: string;
  assignee: string;
  done: boolean;
}

export const MeetingNotesTemplate: React.FC<MeetingNotesTemplateProps> = ({
  notebook,
  pages,
  currentPage,
  pageIndex,
  onPageChange,
}) => {
  const { colors, isDark } = useTheme();
  const themeColor = notebook.appearance?.themeColor || '#3b82f6';

  const [meetingTitle, setMeetingTitle] = useState('');
  const [attendees, setAttendees] = useState('');
  const [agenda, setAgenda] = useState('');
  const [scratchPad, setScratchPad] = useState('');
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);
  const [newActionItem, setNewActionItem] = useState('');
  const [newAssignee, setNewAssignee] = useState('');
  const [pinnedNotes, setPinnedNotes] = useState<string[]>([]);
  const [newPinnedNote, setNewPinnedNote] = useState('');

  const addActionItem = () => {
    if (newActionItem.trim()) {
      setActionItems((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          text: newActionItem.trim(),
          assignee: newAssignee.trim(),
          done: false,
        },
      ]);
      setNewActionItem('');
      setNewAssignee('');
    }
  };

  const addPinnedNote = () => {
    if (newPinnedNote.trim()) {
      setPinnedNotes((prev) => [...prev, newPinnedNote.trim()]);
      setNewPinnedNote('');
    }
  };

  const sectionBg = isDark ? '#1c1917' : '#fff';

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: isDark ? '#0c0a09' : '#f0f4f8' }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Meeting Header */}
      <View style={[styles.meetingHeader, { backgroundColor: themeColor }]}>
        <View style={styles.headerRow}>
          <Ionicons name="people" size={20} color="rgba(255,255,255,0.8)" />
          <TextInput
            value={meetingTitle}
            onChangeText={setMeetingTitle}
            placeholder="Meeting Title"
            placeholderTextColor="rgba(255,255,255,0.6)"
            style={styles.meetingTitleInput}
          />
        </View>
        <Text style={styles.meetingDate}>{format(new Date(), 'MMMM d, yyyy • h:mm a')}</Text>
        <TextInput
          value={attendees}
          onChangeText={setAttendees}
          placeholder="Attendees: Add names..."
          placeholderTextColor="rgba(255,255,255,0.6)"
          style={styles.attendeesInput}
        />
      </View>

      {/* Pinned Notes */}
      {(pinnedNotes.length > 0 || true) && (
        <View style={[styles.section, { backgroundColor: '#fef3c7' }]}>
          <View style={styles.sectionHeader}>
            <Ionicons name="pin" size={16} color="#f59e0b" />
            <Text style={[styles.sectionTitle, { color: '#92400e' }]}>Pinned Notes</Text>
          </View>
          {pinnedNotes.map((note, i) => (
            <View key={i} style={styles.pinnedNote}>
              <Ionicons name="star" size={12} color="#f59e0b" />
              <Text style={[styles.pinnedNoteText, { color: '#78350f' }]}>{note}</Text>
              <TouchableOpacity onPress={() => setPinnedNotes((p) => p.filter((_, j) => j !== i))}>
                <Ionicons name="close" size={14} color="#9ca3af" />
              </TouchableOpacity>
            </View>
          ))}
          <View style={styles.addRow}>
            <TextInput
              value={newPinnedNote}
              onChangeText={setNewPinnedNote}
              placeholder="Pin a note..."
              placeholderTextColor="#a78bfa"
              style={[styles.addInput, { borderColor: '#fbbf24', color: '#78350f' }]}
              onSubmitEditing={addPinnedNote}
            />
            <TouchableOpacity onPress={addPinnedNote} style={[styles.addBtn, { backgroundColor: '#f59e0b' }]}>
              <Ionicons name="add" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Agenda */}
      <View style={[styles.section, { backgroundColor: sectionBg }]}>
        <View style={styles.sectionHeader}>
          <Ionicons name="list" size={16} color={themeColor} />
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Agenda</Text>
        </View>
        <TextInput
          value={agenda}
          onChangeText={setAgenda}
          placeholder="Meeting agenda points..."
          placeholderTextColor={colors.mutedForeground}
          multiline
          style={[styles.textArea, { color: colors.foreground, borderColor: colors.border }]}
          textAlignVertical="top"
        />
      </View>

      {/* Scratch Pad */}
      <View style={[styles.section, { backgroundColor: sectionBg }]}>
        <View style={styles.sectionHeader}>
          <Ionicons name="create" size={16} color={themeColor} />
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Notes</Text>
        </View>
        <TextInput
          value={scratchPad}
          onChangeText={setScratchPad}
          placeholder="Meeting notes, discussions, decisions..."
          placeholderTextColor={colors.mutedForeground}
          multiline
          style={[styles.textAreaLarge, { color: colors.foreground, borderColor: colors.border }]}
          textAlignVertical="top"
        />
      </View>

      {/* Action Items */}
      <View style={[styles.section, { backgroundColor: sectionBg }]}>
        <View style={styles.sectionHeader}>
          <Ionicons name="checkmark-circle" size={16} color={themeColor} />
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Action Items</Text>
        </View>
        {actionItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            onPress={() =>
              setActionItems((prev) =>
                prev.map((a) => (a.id === item.id ? { ...a, done: !a.done } : a))
              )
            }
            style={styles.actionItem}
          >
            <View style={[styles.checkbox, { borderColor: themeColor }]}>
              {item.done && <Ionicons name="checkmark" size={12} color={themeColor} />}
            </View>
            <View style={styles.actionItemContent}>
              <Text
                style={[
                  styles.actionText,
                  { color: colors.foreground },
                  item.done && { textDecorationLine: 'line-through', color: colors.mutedForeground },
                ]}
              >
                {item.text}
              </Text>
              {item.assignee ? (
                <Text style={[styles.assignee, { color: themeColor }]}>@{item.assignee}</Text>
              ) : null}
            </View>
          </TouchableOpacity>
        ))}
        <View style={styles.addRowVertical}>
          <View style={styles.addRow}>
            <TextInput
              value={newActionItem}
              onChangeText={setNewActionItem}
              placeholder="Action item..."
              placeholderTextColor={colors.mutedForeground}
              style={[styles.addInput, { flex: 1, color: colors.foreground, borderColor: colors.border }]}
            />
          </View>
          <View style={styles.addRow}>
            <TextInput
              value={newAssignee}
              onChangeText={setNewAssignee}
              placeholder="Assignee (optional)"
              placeholderTextColor={colors.mutedForeground}
              style={[styles.addInput, { flex: 1, color: colors.foreground, borderColor: colors.border }]}
              onSubmitEditing={addActionItem}
            />
            <TouchableOpacity onPress={addActionItem} style={[styles.addBtn, { backgroundColor: themeColor }]}>
              <Ionicons name="add" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  meetingHeader: {
    padding: 20,
    paddingTop: 24,
    gap: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  meetingTitleInput: {
    flex: 1,
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  meetingDate: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
  },
  attendeesInput: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 13,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
    paddingTop: 8,
    marginTop: 4,
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
  textArea: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    minHeight: 80,
  },
  textAreaLarge: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    minHeight: 140,
  },
  pinnedNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    paddingVertical: 6,
  },
  pinnedNoteText: {
    flex: 1,
    fontSize: 13,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 8,
    gap: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  actionItemContent: {
    flex: 1,
  },
  actionText: {
    fontSize: 14,
  },
  assignee: {
    fontSize: 12,
    marginTop: 2,
  },
  addRowVertical: {
    gap: 8,
    marginTop: 8,
  },
  addRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  addInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 13,
  },
  addBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
