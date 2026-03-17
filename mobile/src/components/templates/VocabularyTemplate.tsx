import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../hooks/useTheme';
import { Notebook, Page } from '../../types';

interface VocabEntry { id: string; word: string; definition: string; example: string; tags: string[]; }

interface Props { notebook: Notebook; pages: Page[]; currentPage: Page | null; pageIndex: number; onPageChange: (i: number) => void; }

export const VocabularyTemplate: React.FC<Props> = ({ notebook }) => {
  const { colors, isDark } = useTheme();
  const themeColor = notebook.appearance?.themeColor || '#10b981';
  const [entries, setEntries] = useState<VocabEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTag, setFilterTag] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ word: '', definition: '', example: '', tagsStr: '' });

  const allTags = [...new Set(entries.flatMap(e => e.tags))];

  const saveEntry = () => {
    if (!form.word.trim() || !form.definition.trim()) return;
    const entry: VocabEntry = {
      id: editingId || Date.now().toString(),
      word: form.word.trim(),
      definition: form.definition.trim(),
      example: form.example.trim(),
      tags: form.tagsStr.split(',').map(t => t.trim()).filter(Boolean),
    };
    if (editingId) {
      setEntries(p => p.map(e => e.id === editingId ? entry : e));
      setEditingId(null);
    } else {
      setEntries(p => [...p, entry]);
    }
    setForm({ word: '', definition: '', example: '', tagsStr: '' });
    setShowForm(false);
  };

  const editEntry = (entry: VocabEntry) => {
    setEditingId(entry.id);
    setForm({ word: entry.word, definition: entry.definition, example: entry.example, tagsStr: entry.tags.join(', ') });
    setShowForm(true);
  };

  const filtered = entries.filter(e => {
    const matchSearch = !searchQuery || e.word.toLowerCase().includes(searchQuery.toLowerCase()) || e.definition.toLowerCase().includes(searchQuery.toLowerCase());
    const matchTag = !filterTag || e.tags.includes(filterTag);
    return matchSearch && matchTag;
  });

  return (
    <ScrollView style={[styles.container, { backgroundColor: isDark ? '#0c0a09' : '#f0fdf4' }]} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <LinearGradient colors={[themeColor, `${themeColor}99`]} style={styles.header}>
        <View style={styles.headerRow}>
          <Ionicons name="book" size={22} color="#fff" />
          <Text style={styles.headerTitle}>Vocabulary</Text>
          <Text style={styles.headerCount}>{entries.length} words</Text>
          <TouchableOpacity onPress={() => { setEditingId(null); setShowForm(true); }} style={styles.addHeaderBtn}>
            <Ionicons name="add" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Search */}
      <View style={[styles.searchBar, { backgroundColor: isDark ? '#1c1917' : '#fff', borderColor: colors.border }]}>
        <Ionicons name="search" size={16} color={colors.mutedForeground} />
        <TextInput value={searchQuery} onChangeText={setSearchQuery} placeholder="Search words..." placeholderTextColor={colors.mutedForeground}
          style={[styles.searchInput, { color: colors.foreground }]} />
        {searchQuery ? <TouchableOpacity onPress={() => setSearchQuery('')}><Ionicons name="close-circle" size={16} color={colors.mutedForeground} /></TouchableOpacity> : null}
      </View>

      {/* Tags */}
      {allTags.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tagsScroll}>
          <TouchableOpacity onPress={() => setFilterTag(null)} style={[styles.tagChip, { backgroundColor: !filterTag ? themeColor : (isDark ? '#292524' : '#f5f5f4') }]}>
            <Text style={[styles.tagChipText, { color: !filterTag ? '#fff' : colors.foreground }]}>All</Text>
          </TouchableOpacity>
          {allTags.map(tag => (
            <TouchableOpacity key={tag} onPress={() => setFilterTag(filterTag === tag ? null : tag)}
              style={[styles.tagChip, { backgroundColor: filterTag === tag ? themeColor : (isDark ? '#292524' : '#f5f5f4') }]}>
              <Text style={[styles.tagChipText, { color: filterTag === tag ? '#fff' : colors.foreground }]}>#{tag}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Word list */}
      {filtered.length === 0 ? (
        <View style={styles.empty}>
          <Text style={{ fontSize: 48 }}>📚</Text>
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No words yet</Text>
          <TouchableOpacity onPress={() => setShowForm(true)} style={[styles.emptyBtn, { backgroundColor: themeColor }]}>
            <Text style={styles.emptyBtnText}>Add Your First Word</Text>
          </TouchableOpacity>
        </View>
      ) : (
        filtered.map(entry => (
          <View key={entry.id} style={[styles.wordCard, { backgroundColor: isDark ? '#1c1917' : '#fff', borderLeftColor: themeColor }]}>
            <View style={styles.wordHeader}>
              <Text style={[styles.word, { color: themeColor }]}>{entry.word}</Text>
              <View style={styles.wordActions}>
                <TouchableOpacity onPress={() => editEntry(entry)} style={styles.actionBtn}>
                  <Ionicons name="pencil" size={14} color={colors.mutedForeground} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setEntries(p => p.filter(e => e.id !== entry.id))} style={styles.actionBtn}>
                  <Ionicons name="trash-outline" size={14} color="#9ca3af" />
                </TouchableOpacity>
              </View>
            </View>
            <Text style={[styles.definition, { color: colors.foreground }]}>{entry.definition}</Text>
            {entry.example && (
              <View style={[styles.exampleBox, { backgroundColor: `${themeColor}10`, borderColor: `${themeColor}30` }]}>
                <Text style={[styles.exampleLabel, { color: themeColor }]}>Example:</Text>
                <Text style={[styles.exampleText, { color: colors.mutedForeground }]}>{entry.example}</Text>
              </View>
            )}
            {entry.tags.length > 0 && (
              <View style={styles.tagsRow}>
                {entry.tags.map(tag => (
                  <TouchableOpacity key={tag} onPress={() => setFilterTag(tag)}
                    style={[styles.tag, { backgroundColor: `${themeColor}20` }]}>
                    <Text style={[styles.tagText, { color: themeColor }]}>#{tag}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        ))
      )}

      {/* Form Modal */}
      <Modal visible={showForm} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modal, { backgroundColor: isDark ? '#1c1917' : '#fff' }]}>
            <View style={styles.modalHandle} />
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>{editingId ? 'Edit Word' : 'Add Word'}</Text>
            {[
              { label: 'Word *', field: 'word', placeholder: 'e.g. Ephemeral' },
              { label: 'Definition *', field: 'definition', placeholder: 'What does it mean?' },
              { label: 'Example', field: 'example', placeholder: 'Use in a sentence...' },
              { label: 'Tags', field: 'tagsStr', placeholder: 'grammar, advanced, ... (comma-separated)' },
            ].map(f => (
              <View key={f.field} style={{ marginBottom: 10 }}>
                <Text style={[styles.fieldLabel, { color: colors.foreground }]}>{f.label}</Text>
                <TextInput value={(form as any)[f.field]} onChangeText={v => setForm(p => ({ ...p, [f.field]: v }))}
                  placeholder={f.placeholder} placeholderTextColor={colors.mutedForeground}
                  style={[styles.input, { color: colors.foreground, borderColor: colors.border }]} />
              </View>
            ))}
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 8 }}>
              <TouchableOpacity onPress={() => { setShowForm(false); setEditingId(null); setForm({ word: '', definition: '', example: '', tagsStr: '' }); }}
                style={[styles.cancelBtn, { borderColor: colors.border }]}>
                <Text style={{ color: colors.foreground }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={saveEntry} style={[styles.submitBtn, { backgroundColor: themeColor }]}>
                <Text style={styles.submitText}>{editingId ? 'Save' : 'Add Word'}</Text>
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
  header: { padding: 20, paddingTop: 24 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerTitle: { flex: 1, color: '#fff', fontSize: 20, fontWeight: '800' },
  headerCount: { color: 'rgba(255,255,255,0.7)', fontSize: 13 },
  addHeaderBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.25)', justifyContent: 'center', alignItems: 'center' },
  searchBar: { flexDirection: 'row', alignItems: 'center', margin: 12, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, gap: 8 },
  searchInput: { flex: 1, fontSize: 14 },
  tagsScroll: { flexDirection: 'row', gap: 8, paddingHorizontal: 12, paddingVertical: 4, paddingBottom: 8 },
  tagChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  tagChipText: { fontSize: 12, fontWeight: '600' },
  wordCard: { margin: 12, marginBottom: 0, borderRadius: 12, borderLeftWidth: 4, padding: 14, backgroundColor: '#fff', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2, gap: 8 },
  wordHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  word: { fontSize: 20, fontWeight: '800' },
  wordActions: { flexDirection: 'row', gap: 4 },
  actionBtn: { width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  definition: { fontSize: 15, lineHeight: 22 },
  exampleBox: { borderWidth: 1, borderRadius: 8, padding: 10 },
  exampleLabel: { fontSize: 11, fontWeight: '700', marginBottom: 3 },
  exampleText: { fontSize: 13, fontStyle: 'italic', lineHeight: 18 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  tagText: { fontSize: 11, fontWeight: '600' },
  empty: { alignItems: 'center', paddingVertical: 60, gap: 10 },
  emptyTitle: { fontSize: 18, fontWeight: '700' },
  emptyBtn: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 10 },
  emptyBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modal: { borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, paddingBottom: 40 },
  modalHandle: { width: 40, height: 4, backgroundColor: '#e7e5e4', borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 14 },
  fieldLabel: { fontSize: 13, fontWeight: '600', marginBottom: 6 },
  input: { borderWidth: 1, borderRadius: 8, padding: 10, fontSize: 14 },
  cancelBtn: { flex: 1, borderWidth: 1, borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  submitBtn: { flex: 2, paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  submitText: { color: '#fff', fontWeight: '700', fontSize: 14 },
});
