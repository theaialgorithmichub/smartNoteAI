import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../hooks/useTheme';
import { AIAPI } from '../../services/api';
import { Notebook, Page } from '../../types';

interface Source { id: string; title: string; url: string; type: 'web'|'youtube'|'document'|'text'; summary: string; keyPoints: string[]; selected: boolean; }
interface ChatMsg { id: string; role: 'user'|'assistant'; content: string; }
interface Note { id: string; title: string; content: string; createdAt: string; }

interface Props { notebook: Notebook; pages: Page[]; currentPage: Page | null; pageIndex: number; onPageChange: (i: number) => void; }

export const AIResearchTemplate: React.FC<Props> = ({ notebook }) => {
  const { colors, isDark } = useTheme();
  const themeColor = notebook.appearance?.themeColor || '#a855f7';
  const [tab, setTab] = useState<'sources'|'chat'|'notes'>('sources');
  const [sources, setSources] = useState<Source[]>([]);
  const [chat, setChat] = useState<ChatMsg[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [newUrl, setNewUrl] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);

  const addSource = async () => {
    if (!newUrl.trim()) return;
    const isYt = /youtube\.com|youtu\.be/i.test(newUrl);
    const src: Source = {
      id: Date.now().toString(),
      title: newUrl.length > 50 ? newUrl.slice(0, 50) + '...' : newUrl,
      url: newUrl, type: isYt ? 'youtube' : 'web',
      summary: '', keyPoints: [], selected: true,
    };
    setSources(p => [...p, src]);
    setNewUrl('');
    // Try to get AI summary
    setLoading(true);
    try {
      const res = await AIAPI.ask(`Summarize this URL/topic: ${newUrl}`, `Research notebook: ${notebook.title}`);
      const summary = res.data?.content || res.data?.message || '';
      setSources(p => p.map(s => s.id === src.id ? { ...s, summary, keyPoints: summary.split('\n').filter((l: string) => l.startsWith('•') || l.startsWith('-')).slice(0, 5) } : s));
    } catch {}
    setLoading(false);
  };

  const sendChatMessage = async () => {
    if (!chatInput.trim() || chatLoading) return;
    const userMsg: ChatMsg = { id: Date.now().toString(), role: 'user', content: chatInput.trim() };
    setChat(p => [...p, userMsg]);
    setChatInput('');
    setChatLoading(true);
    try {
      const context = sources.filter(s => s.selected).map(s => s.summary).join('\n\n');
      const res = await AIAPI.ask(chatInput, context || `Research: ${notebook.title}`);
      const reply = res.data?.content || res.data?.message || 'I can help with your research.';
      setChat(p => [...p, { id: (Date.now() + 1).toString(), role: 'assistant', content: reply }]);
    } catch {
      setChat(p => [...p, { id: (Date.now() + 1).toString(), role: 'assistant', content: 'Sorry, could not get a response.' }]);
    }
    setChatLoading(false);
  };

  const addNote = () => {
    if (!noteTitle.trim()) return;
    setNotes(p => [...p, { id: Date.now().toString(), title: noteTitle.trim(), content: noteContent, createdAt: new Date().toISOString() }]);
    setNoteTitle(''); setNoteContent('');
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#0c0a09' : '#faf5ff' }]}>
      {/* Header */}
      <LinearGradient colors={[themeColor, `${themeColor}99`]} style={styles.header}>
        <Ionicons name="search" size={20} color="#fff" />
        <Text style={styles.headerTitle}>AI Research</Text>
        <Text style={styles.sourceCount}>{sources.length} sources</Text>
      </LinearGradient>

      {/* Tabs */}
      <View style={[styles.tabs, { backgroundColor: isDark ? '#1c1917' : '#f5f0ff' }]}>
        {(['sources', 'chat', 'notes'] as const).map(t => (
          <TouchableOpacity key={t} onPress={() => setTab(t)}
            style={[styles.tab, tab === t && { backgroundColor: themeColor }]}>
            <Ionicons name={t === 'sources' ? 'globe' : t === 'chat' ? 'chatbubbles' : 'document-text'} size={14} color={tab === t ? '#fff' : colors.mutedForeground} />
            <Text style={[styles.tabText, { color: tab === t ? '#fff' : colors.foreground }]}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {tab === 'sources' && (
        <ScrollView contentContainerStyle={styles.tabContent}>
          {/* Add source */}
          <View style={[styles.addSourceRow, { backgroundColor: isDark ? '#1c1917' : '#fff' }]}>
            <TextInput value={newUrl} onChangeText={setNewUrl} placeholder="Paste URL or topic..." placeholderTextColor={colors.mutedForeground}
              style={[styles.urlInput, { color: colors.foreground, borderColor: colors.border }]} autoCapitalize="none" />
            <TouchableOpacity onPress={addSource} disabled={loading || !newUrl.trim()}
              style={[styles.addSourceBtn, { backgroundColor: themeColor, opacity: loading || !newUrl.trim() ? 0.5 : 1 }]}>
              {loading ? <ActivityIndicator size="small" color="#fff" /> : <Ionicons name="add" size={22} color="#fff" />}
            </TouchableOpacity>
          </View>

          {sources.map(src => (
            <View key={src.id} style={[styles.sourceCard, { backgroundColor: isDark ? '#1c1917' : '#fff', borderColor: colors.border }]}>
              <View style={styles.sourceHeader}>
                <View style={[styles.sourceIcon, { backgroundColor: src.type === 'youtube' ? '#ef444420' : `${themeColor}20` }]}>
                  <Ionicons name={src.type === 'youtube' ? 'logo-youtube' : 'globe-outline'} size={16} color={src.type === 'youtube' ? '#ef4444' : themeColor} />
                </View>
                <Text style={[styles.sourceTitle, { color: colors.foreground }]} numberOfLines={1}>{src.title}</Text>
                <TouchableOpacity onPress={() => setSources(p => p.filter(s => s.id !== src.id))}>
                  <Ionicons name="trash-outline" size={16} color="#9ca3af" />
                </TouchableOpacity>
              </View>
              {src.summary ? (
                <Text style={[styles.sourceSummary, { color: colors.mutedForeground }]} numberOfLines={4}>{src.summary}</Text>
              ) : (
                <Text style={[styles.sourceSummary, { color: colors.mutedForeground }]}>Processing...</Text>
              )}
            </View>
          ))}
          {sources.length === 0 && (
            <View style={styles.empty}>
              <Ionicons name="globe-outline" size={48} color={colors.mutedForeground} />
              <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No sources yet</Text>
              <Text style={[styles.emptySubtitle, { color: colors.mutedForeground }]}>Paste URLs or topics above</Text>
            </View>
          )}
        </ScrollView>
      )}

      {tab === 'chat' && (
        <View style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.chatContent}>
            {chat.length === 0 && (
              <View style={styles.chatEmpty}>
                <LinearGradient colors={[themeColor, `${themeColor}88`]} style={styles.chatEmptyIcon}>
                  <Ionicons name="flash" size={28} color="#fff" />
                </LinearGradient>
                <Text style={[styles.chatEmptyTitle, { color: colors.foreground }]}>Research AI Chat</Text>
                <Text style={[styles.chatEmptySub, { color: colors.mutedForeground }]}>Ask questions about your sources</Text>
              </View>
            )}
            {chat.map(msg => (
              <View key={msg.id} style={[styles.chatMsg, msg.role === 'user' ? styles.userMsg : styles.aiMsg]}>
                {msg.role === 'assistant' && (
                  <LinearGradient colors={[themeColor, `${themeColor}88`]} style={styles.aiAvatar}>
                    <Ionicons name="flash" size={12} color="#fff" />
                  </LinearGradient>
                )}
                <View style={[styles.msgBubble, msg.role === 'user' ? [styles.userBubble, { backgroundColor: themeColor }] : [styles.aiBubble, { backgroundColor: isDark ? '#292524' : '#f5f5f4' }]]}>
                  <Text style={[styles.msgText, { color: msg.role === 'user' ? '#fff' : colors.foreground }]}>{msg.content}</Text>
                </View>
              </View>
            ))}
            {chatLoading && (
              <View style={[styles.chatMsg, styles.aiMsg]}>
                <View style={[styles.aiBubble, { backgroundColor: isDark ? '#292524' : '#f5f5f4', padding: 12 }]}>
                  <ActivityIndicator size="small" color={themeColor} />
                </View>
              </View>
            )}
          </ScrollView>
          <View style={[styles.chatInput, { backgroundColor: isDark ? '#1c1917' : '#fff', borderTopColor: colors.border }]}>
            <TextInput value={chatInput} onChangeText={setChatInput} placeholder="Ask about your research..." placeholderTextColor={colors.mutedForeground}
              style={[styles.chatTextInput, { color: colors.foreground, backgroundColor: isDark ? '#292524' : '#f5f5f4' }]}
              multiline onSubmitEditing={sendChatMessage} />
            <TouchableOpacity onPress={sendChatMessage} disabled={!chatInput.trim() || chatLoading}
              style={[styles.sendBtn, { backgroundColor: themeColor, opacity: !chatInput.trim() || chatLoading ? 0.5 : 1 }]}>
              <Ionicons name="send" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {tab === 'notes' && (
        <ScrollView contentContainerStyle={styles.tabContent}>
          <View style={[styles.noteForm, { backgroundColor: isDark ? '#1c1917' : '#fff' }]}>
            <TextInput value={noteTitle} onChangeText={setNoteTitle} placeholder="Note title..." placeholderTextColor={colors.mutedForeground}
              style={[styles.noteTitleInput, { color: colors.foreground, borderColor: colors.border }]} />
            <TextInput value={noteContent} onChangeText={setNoteContent} placeholder="Note content..." placeholderTextColor={colors.mutedForeground}
              multiline style={[styles.noteContentInput, { color: colors.foreground, borderColor: colors.border }]} />
            <TouchableOpacity onPress={addNote} style={[styles.addNoteBtn, { backgroundColor: themeColor }]}>
              <Ionicons name="add" size={16} color="#fff" />
              <Text style={styles.addNoteBtnText}>Add Note</Text>
            </TouchableOpacity>
          </View>
          {notes.map(note => (
            <View key={note.id} style={[styles.noteCard, { backgroundColor: isDark ? '#1c1917' : '#fff', borderColor: colors.border }]}>
              <View style={styles.noteCardHeader}>
                <Text style={[styles.noteCardTitle, { color: colors.foreground }]}>{note.title}</Text>
                <TouchableOpacity onPress={() => setNotes(p => p.filter(n => n.id !== note.id))}>
                  <Ionicons name="close" size={16} color="#9ca3af" />
                </TouchableOpacity>
              </View>
              {note.content && <Text style={[styles.noteCardContent, { color: colors.mutedForeground }]}>{note.content}</Text>}
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 16, paddingTop: 20 },
  headerTitle: { flex: 1, color: '#fff', fontSize: 18, fontWeight: '700' },
  sourceCount: { color: 'rgba(255,255,255,0.7)', fontSize: 13 },
  tabs: { flexDirection: 'row', margin: 12, borderRadius: 10, padding: 4, gap: 4 },
  tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, paddingVertical: 8, borderRadius: 8 },
  tabText: { fontSize: 12, fontWeight: '600' },
  tabContent: { padding: 12, gap: 10 },
  addSourceRow: { flexDirection: 'row', gap: 8, borderRadius: 12, padding: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  urlInput: { flex: 1, borderWidth: 1, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 9, fontSize: 14 },
  addSourceBtn: { width: 44, height: 44, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  sourceCard: { borderRadius: 12, borderWidth: 1, padding: 14, gap: 8 },
  sourceHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  sourceIcon: { width: 32, height: 32, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  sourceTitle: { flex: 1, fontSize: 13, fontWeight: '600' },
  sourceSummary: { fontSize: 13, lineHeight: 18 },
  empty: { alignItems: 'center', paddingVertical: 60, gap: 8 },
  emptyTitle: { fontSize: 18, fontWeight: '700', marginTop: 8 },
  emptySubtitle: { fontSize: 13 },
  chatContent: { padding: 12, gap: 10, paddingBottom: 20 },
  chatEmpty: { alignItems: 'center', paddingVertical: 40, gap: 10 },
  chatEmptyIcon: { width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center' },
  chatEmptyTitle: { fontSize: 18, fontWeight: '700' },
  chatEmptySub: { fontSize: 13 },
  chatMsg: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  userMsg: { justifyContent: 'flex-end' },
  aiMsg: { justifyContent: 'flex-start' },
  aiAvatar: { width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  msgBubble: { maxWidth: '80%', borderRadius: 16, padding: 12 },
  userBubble: { borderBottomRightRadius: 4 },
  aiBubble: { borderBottomLeftRadius: 4 },
  msgText: { fontSize: 14, lineHeight: 20 },
  chatInput: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, padding: 12, borderTopWidth: 1 },
  chatTextInput: { flex: 1, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, maxHeight: 100 },
  sendBtn: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  noteForm: { borderRadius: 12, padding: 14, gap: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  noteTitleInput: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 15, fontWeight: '600' },
  noteContentInput: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, minHeight: 80 },
  addNoteBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: 8 },
  addNoteBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  noteCard: { borderRadius: 12, borderWidth: 1, padding: 14, gap: 6 },
  noteCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  noteCardTitle: { fontSize: 15, fontWeight: '700' },
  noteCardContent: { fontSize: 13, lineHeight: 18 },
});
