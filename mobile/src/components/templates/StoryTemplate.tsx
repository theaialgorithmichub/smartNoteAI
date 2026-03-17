import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../hooks/useTheme';
import { Notebook, Page } from '../../types';

interface Character { id: string; name: string; role: 'protagonist'|'antagonist'|'supporting'|'minor'; description: string; backstory: string; traits: string[]; }
interface Scene { id: string; title: string; location: string; time: string; description: string; characters: string[]; notes: string; order: number; }
interface Script { id: string; title: string; content: string; type: 'outline'|'draft'|'final'; }

interface Props { notebook: Notebook; pages: Page[]; currentPage: Page | null; pageIndex: number; onPageChange: (i: number) => void; }

const ROLE_COLORS = { protagonist: '#10b981', antagonist: '#ef4444', supporting: '#3b82f6', minor: '#6b7280' };

export const StoryTemplate: React.FC<Props> = ({ notebook }) => {
  const { colors, isDark } = useTheme();
  const themeColor = notebook.appearance?.themeColor || '#8b5cf6';
  const [tab, setTab] = useState<'characters'|'scenes'|'scripts'>('characters');
  const [storyTitle, setStoryTitle] = useState('');
  const [storyGenre, setStoryGenre] = useState('');
  const [synopsis, setSynopsis] = useState('');
  const [characters, setCharacters] = useState<Character[]>([]);
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [scripts, setScripts] = useState<Script[]>([]);
  const [showCharForm, setShowCharForm] = useState(false);
  const [charForm, setCharForm] = useState({ name: '', role: 'protagonist' as Character['role'], description: '', backstory: '', traits: '' });
  const [showSceneForm, setShowSceneForm] = useState(false);
  const [sceneForm, setSceneForm] = useState({ title: '', location: '', time: '', description: '', notes: '' });
  const [activeScript, setActiveScript] = useState<string | null>(null);

  const addCharacter = () => {
    if (!charForm.name.trim()) return;
    setCharacters(p => [...p, { id: Date.now().toString(), ...charForm, traits: charForm.traits.split(',').map(t => t.trim()).filter(Boolean) }]);
    setCharForm({ name: '', role: 'protagonist', description: '', backstory: '', traits: '' });
    setShowCharForm(false);
  };

  const addScene = () => {
    if (!sceneForm.title.trim()) return;
    setScenes(p => [...p, { id: Date.now().toString(), ...sceneForm, characters: [], order: p.length }]);
    setSceneForm({ title: '', location: '', time: '', description: '', notes: '' });
    setShowSceneForm(false);
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: isDark ? '#0c0a09' : '#faf5ff' }]} showsVerticalScrollIndicator={false}>
      <LinearGradient colors={[themeColor, `${themeColor}99`]} style={styles.header}>
        <TextInput value={storyTitle} onChangeText={setStoryTitle} placeholder="Story Title" placeholderTextColor="rgba(255,255,255,0.6)" style={styles.storyTitle} />
        <TextInput value={storyGenre} onChangeText={setStoryGenre} placeholder="Genre (Fantasy, Thriller, Romance...)" placeholderTextColor="rgba(255,255,255,0.5)" style={styles.storyGenre} />
      </LinearGradient>

      {/* Synopsis */}
      <View style={[styles.section, { backgroundColor: isDark ? '#1c1917' : '#fff' }]}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>📖 Synopsis</Text>
        <TextInput value={synopsis} onChangeText={setSynopsis} placeholder="What is your story about?" placeholderTextColor={colors.mutedForeground}
          multiline style={[styles.synopsisInput, { color: colors.foreground, borderColor: colors.border }]} />
      </View>

      {/* Tabs */}
      <View style={[styles.tabs, { backgroundColor: isDark ? '#1c1917' : '#f5f0ff' }]}>
        {(['characters', 'scenes', 'scripts'] as const).map(t => (
          <TouchableOpacity key={t} onPress={() => setTab(t)}
            style={[styles.tab, tab === t && { backgroundColor: themeColor }]}>
            <Text style={[styles.tabText, { color: tab === t ? '#fff' : colors.foreground }]}>
              {t === 'characters' ? '👤 Characters' : t === 'scenes' ? '🎬 Scenes' : '📝 Scripts'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {tab === 'characters' && (
        <View>
          {characters.map(char => (
            <View key={char.id} style={[styles.charCard, { backgroundColor: isDark ? '#1c1917' : '#fff', borderLeftColor: ROLE_COLORS[char.role], borderLeftWidth: 4 }]}>
              <View style={styles.charHeader}>
                <LinearGradient colors={[ROLE_COLORS[char.role], `${ROLE_COLORS[char.role]}88`]} style={styles.charAvatar}>
                  <Text style={styles.charAvatarText}>{char.name[0]}</Text>
                </LinearGradient>
                <View style={styles.charInfo}>
                  <Text style={[styles.charName, { color: colors.foreground }]}>{char.name}</Text>
                  <View style={[styles.roleBadge, { backgroundColor: `${ROLE_COLORS[char.role]}20` }]}>
                    <Text style={[styles.roleText, { color: ROLE_COLORS[char.role] }]}>{char.role}</Text>
                  </View>
                </View>
                <TouchableOpacity onPress={() => setCharacters(p => p.filter(c => c.id !== char.id))}>
                  <Ionicons name="trash-outline" size={16} color="#9ca3af" />
                </TouchableOpacity>
              </View>
              {char.description && <Text style={[styles.charDesc, { color: colors.mutedForeground }]}>{char.description}</Text>}
              {char.traits.length > 0 && (
                <View style={styles.traitsRow}>
                  {char.traits.map((trait, i) => (
                    <View key={i} style={[styles.traitBadge, { backgroundColor: `${themeColor}20` }]}>
                      <Text style={[styles.traitText, { color: themeColor }]}>{trait}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          ))}
          <TouchableOpacity onPress={() => setShowCharForm(true)} style={[styles.addBtn, { borderColor: themeColor }]}>
            <Ionicons name="person-add" size={16} color={themeColor} />
            <Text style={[styles.addBtnText, { color: themeColor }]}>Add Character</Text>
          </TouchableOpacity>
        </View>
      )}

      {tab === 'scenes' && (
        <View>
          {scenes.map((scene, i) => (
            <View key={scene.id} style={[styles.sceneCard, { backgroundColor: isDark ? '#1c1917' : '#fff', borderColor: colors.border }]}>
              <View style={styles.sceneHeader}>
                <View style={[styles.sceneNum, { backgroundColor: themeColor }]}><Text style={styles.sceneNumText}>{i + 1}</Text></View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.sceneTitle, { color: colors.foreground }]}>{scene.title}</Text>
                  {scene.location && <View style={styles.sceneMetaRow}>
                    <Ionicons name="location" size={12} color={colors.mutedForeground} />
                    <Text style={[styles.sceneMeta, { color: colors.mutedForeground }]}>{scene.location}{scene.time ? ` • ${scene.time}` : ''}</Text>
                  </View>}
                </View>
                <TouchableOpacity onPress={() => setScenes(p => p.filter(s => s.id !== scene.id))}>
                  <Ionicons name="trash-outline" size={16} color="#9ca3af" />
                </TouchableOpacity>
              </View>
              {scene.description && <Text style={[styles.sceneDesc, { color: colors.mutedForeground }]}>{scene.description}</Text>}
            </View>
          ))}
          <TouchableOpacity onPress={() => setShowSceneForm(true)} style={[styles.addBtn, { borderColor: themeColor }]}>
            <Ionicons name="videocam" size={16} color={themeColor} />
            <Text style={[styles.addBtnText, { color: themeColor }]}>Add Scene</Text>
          </TouchableOpacity>
        </View>
      )}

      {tab === 'scripts' && (
        <View>
          {scripts.map(script => (
            <TouchableOpacity key={script.id} onPress={() => setActiveScript(script.id === activeScript ? null : script.id)}
              style={[styles.scriptCard, { backgroundColor: isDark ? '#1c1917' : '#fff', borderColor: colors.border }]}>
              <View style={styles.scriptHeader}>
                <Ionicons name="document-text" size={16} color={themeColor} />
                <Text style={[styles.scriptTitle, { color: colors.foreground }]}>{script.title}</Text>
                <View style={[styles.scriptBadge, { backgroundColor: `${themeColor}20` }]}>
                  <Text style={[styles.scriptBadgeText, { color: themeColor }]}>{script.type}</Text>
                </View>
              </View>
              {activeScript === script.id && (
                <TextInput value={script.content} onChangeText={v => setScripts(p => p.map(s => s.id === script.id ? { ...s, content: v } : s))}
                  multiline placeholder="Write your script..." placeholderTextColor={colors.mutedForeground}
                  style={[styles.scriptContent, { color: colors.foreground }]} />
              )}
            </TouchableOpacity>
          ))}
          <TouchableOpacity onPress={() => setScripts(p => [...p, { id: Date.now().toString(), title: `Script ${p.length + 1}`, content: '', type: 'draft' }])}
            style={[styles.addBtn, { borderColor: themeColor }]}>
            <Ionicons name="document" size={16} color={themeColor} />
            <Text style={[styles.addBtnText, { color: themeColor }]}>New Script</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Character Form Modal */}
      <Modal visible={showCharForm} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modal, { backgroundColor: isDark ? '#1c1917' : '#fff' }]}>
            <View style={styles.modalHandle} />
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>New Character</Text>
            {[
              { label: 'Name', field: 'name', placeholder: 'Character name' },
              { label: 'Description', field: 'description', placeholder: 'Brief description' },
              { label: 'Backstory', field: 'backstory', placeholder: 'Background story' },
              { label: 'Traits', field: 'traits', placeholder: 'Brave, Curious, ... (comma separated)' },
            ].map(f => (
              <View key={f.field} style={{ marginBottom: 10 }}>
                <Text style={[styles.fieldLabel, { color: colors.foreground }]}>{f.label}</Text>
                <TextInput value={(charForm as any)[f.field]} onChangeText={v => setCharForm(p => ({ ...p, [f.field]: v }))}
                  placeholder={f.placeholder} placeholderTextColor={colors.mutedForeground}
                  style={[styles.input, { color: colors.foreground, borderColor: colors.border }]} />
              </View>
            ))}
            <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Role</Text>
            <View style={styles.roleGrid}>
              {(['protagonist', 'antagonist', 'supporting', 'minor'] as const).map(role => (
                <TouchableOpacity key={role} onPress={() => setCharForm(p => ({ ...p, role }))}
                  style={[styles.roleOption, { backgroundColor: charForm.role === role ? ROLE_COLORS[role] : (isDark ? '#292524' : '#f5f5f4') }]}>
                  <Text style={[styles.roleOptionText, { color: charForm.role === role ? '#fff' : colors.foreground }]}>{role}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
              <TouchableOpacity onPress={() => setShowCharForm(false)} style={[styles.cancelBtn, { borderColor: colors.border }]}>
                <Text style={{ color: colors.foreground }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={addCharacter} style={[styles.submitBtn, { backgroundColor: themeColor }]}>
                <Text style={styles.submitText}>Add Character</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Scene Form Modal */}
      <Modal visible={showSceneForm} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modal, { backgroundColor: isDark ? '#1c1917' : '#fff' }]}>
            <View style={styles.modalHandle} />
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>New Scene</Text>
            {[
              { label: 'Title', field: 'title', placeholder: 'Scene title' },
              { label: 'Location', field: 'location', placeholder: 'Where does it take place?' },
              { label: 'Time', field: 'time', placeholder: 'When? (Morning, Night, 1920s...)' },
              { label: 'Description', field: 'description', placeholder: 'What happens in this scene?' },
            ].map(f => (
              <View key={f.field} style={{ marginBottom: 10 }}>
                <Text style={[styles.fieldLabel, { color: colors.foreground }]}>{f.label}</Text>
                <TextInput value={(sceneForm as any)[f.field]} onChangeText={v => setSceneForm(p => ({ ...p, [f.field]: v }))}
                  placeholder={f.placeholder} placeholderTextColor={colors.mutedForeground}
                  style={[styles.input, { color: colors.foreground, borderColor: colors.border }]} />
              </View>
            ))}
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
              <TouchableOpacity onPress={() => setShowSceneForm(false)} style={[styles.cancelBtn, { borderColor: colors.border }]}>
                <Text style={{ color: colors.foreground }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={addScene} style={[styles.submitBtn, { backgroundColor: themeColor }]}>
                <Text style={styles.submitText}>Add Scene</Text>
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
  header: { padding: 20, paddingTop: 24, gap: 8 },
  storyTitle: { color: '#fff', fontSize: 22, fontWeight: '800' },
  storyGenre: { color: 'rgba(255,255,255,0.7)', fontSize: 14 },
  section: { margin: 12, borderRadius: 12, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  sectionTitle: { fontSize: 15, fontWeight: '700', marginBottom: 10 },
  synopsisInput: { borderWidth: 1, borderRadius: 8, padding: 10, fontSize: 14, minHeight: 80 },
  tabs: { flexDirection: 'row', margin: 12, borderRadius: 10, padding: 4, gap: 4 },
  tab: { flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: 'center' },
  tabText: { fontSize: 11, fontWeight: '600' },
  charCard: { margin: 12, marginBottom: 0, borderRadius: 12, padding: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2, gap: 8 },
  charHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  charAvatar: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  charAvatarText: { color: '#fff', fontSize: 18, fontWeight: '800' },
  charInfo: { flex: 1 },
  charName: { fontSize: 16, fontWeight: '700' },
  roleBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, alignSelf: 'flex-start', marginTop: 3 },
  roleText: { fontSize: 11, fontWeight: '700' },
  charDesc: { fontSize: 13, lineHeight: 18 },
  traitsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  traitBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10 },
  traitText: { fontSize: 11, fontWeight: '600' },
  sceneCard: { margin: 12, marginBottom: 0, borderRadius: 12, borderWidth: 1, padding: 14, gap: 8 },
  sceneHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  sceneNum: { width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  sceneNumText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  sceneTitle: { fontSize: 15, fontWeight: '700' },
  sceneMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  sceneMeta: { fontSize: 12 },
  sceneDesc: { fontSize: 13, lineHeight: 18 },
  scriptCard: { margin: 12, marginBottom: 0, borderRadius: 12, borderWidth: 1, padding: 14 },
  scriptHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  scriptTitle: { flex: 1, fontSize: 14, fontWeight: '600' },
  scriptBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  scriptBadgeText: { fontSize: 11, fontWeight: '700' },
  scriptContent: { marginTop: 10, fontSize: 14, lineHeight: 22, minHeight: 120, borderTopWidth: 1, borderTopColor: '#00000010', paddingTop: 10 },
  addBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, margin: 12, paddingVertical: 14, borderRadius: 12, borderWidth: 2, borderStyle: 'dashed' },
  addBtnText: { fontSize: 14, fontWeight: '700' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modal: { borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, paddingBottom: 40 },
  modalHandle: { width: 40, height: 4, backgroundColor: '#e7e5e4', borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 14 },
  fieldLabel: { fontSize: 13, fontWeight: '600', marginBottom: 6 },
  input: { borderWidth: 1, borderRadius: 8, padding: 10, fontSize: 14 },
  roleGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  roleOption: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 8 },
  roleOptionText: { fontSize: 12, fontWeight: '600' },
  cancelBtn: { flex: 1, borderWidth: 1, borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  submitBtn: { flex: 2, paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  submitText: { color: '#fff', fontWeight: '700', fontSize: 14 },
});
