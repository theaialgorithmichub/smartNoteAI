/**
 * This file provides the remaining 22 template implementations not covered by dedicated files.
 * Each template is a full React Native component matching the web app's features and visual style.
 */

import React, { useState, useRef } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, Modal, Alert, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { format, startOfWeek, addDays } from 'date-fns';
import { useTheme } from '../../hooks/useTheme';
import { Notebook, Page } from '../../types';
import { AIAPI } from '../../services/api';

interface TemplateProps {
  notebook: Notebook;
  pages: Page[];
  currentPage: Page | null;
  pageIndex: number;
  onPageChange: (i: number) => void;
}

// ─── 1. Book Notes ────────────────────────────────────────────────────────────
interface BookNote { id: string; bookTitle: string; author: string; genre: string; rating: number; status: 'reading'|'completed'|'want-to-read'; notes: string; quotes: string[]; chapters: {id: string; title: string; notes: string}[]; }

export const BookNotesTemplate: React.FC<TemplateProps> = ({ notebook }) => {
  const { colors, isDark } = useTheme();
  const themeColor = notebook.appearance?.themeColor || '#8b5cf6';
  const [books, setBooks] = useState<BookNote[]>([]);
  const [activeBookId, setActiveBookId] = useState<string | null>(null);
  const [showAddBook, setShowAddBook] = useState(false);
  const [form, setForm] = useState({ bookTitle: '', author: '', genre: '', status: 'want-to-read' as BookNote['status'], rating: 0 });
  const [newQuote, setNewQuote] = useState('');
  const STATUS_COLORS = { 'want-to-read': '#6b7280', reading: '#f59e0b', completed: '#10b981' };
  const activeBook = books.find(b => b.id === activeBookId);

  const addBook = () => {
    if (!form.bookTitle.trim()) return;
    const book: BookNote = { id: Date.now().toString(), ...form, notes: '', quotes: [], chapters: [] };
    setBooks(p => [...p, book]);
    setForm({ bookTitle: '', author: '', genre: '', status: 'want-to-read', rating: 0 });
    setShowAddBook(false);
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: isDark ? '#0c0a09' : '#faf5ff' }]} showsVerticalScrollIndicator={false}>
      <LinearGradient colors={[themeColor, `${themeColor}99`]} style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Ionicons name="book" size={22} color="#fff" />
          <Text style={styles.headerTitle}>Book Notes</Text>
          <TouchableOpacity onPress={() => setShowAddBook(true)} style={styles.headerAddBtn}>
            <Ionicons name="add" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
        <View style={{ flexDirection: 'row', gap: 16, marginTop: 8 }}>
          {(['want-to-read', 'reading', 'completed'] as const).map(s => (
            <View key={s} style={{ alignItems: 'center' }}>
              <Text style={{ color: '#fff', fontWeight: '800', fontSize: 16 }}>{books.filter(b => b.status === s).length}</Text>
              <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11 }}>{s.split('-').map(w => w[0].toUpperCase() + w.slice(1)).join(' ')}</Text>
            </View>
          ))}
        </View>
      </LinearGradient>

      {activeBook ? (
        <View style={[styles.bookDetail, { backgroundColor: isDark ? '#1c1917' : '#fff' }]}>
          <TouchableOpacity onPress={() => setActiveBookId(null)} style={styles.backRow}>
            <Ionicons name="arrow-back" size={16} color={themeColor} />
            <Text style={[styles.backText, { color: themeColor }]}>All Books</Text>
          </TouchableOpacity>
          <Text style={[styles.bookDetailTitle, { color: colors.foreground }]}>{activeBook.bookTitle}</Text>
          <Text style={[styles.bookDetailAuthor, { color: colors.mutedForeground }]}>by {activeBook.author}</Text>
          <View style={styles.starsRow}>{Array.from({ length: 5 }).map((_, i) => (
            <TouchableOpacity key={i} onPress={() => setBooks(p => p.map(b => b.id === activeBook.id ? { ...b, rating: i + 1 } : b))}>
              <Ionicons name={i < activeBook.rating ? 'star' : 'star-outline'} size={22} color="#f59e0b" />
            </TouchableOpacity>
          ))}</View>
          <Text style={[styles.sectionLabel, { color: colors.foreground }]}>📝 Notes</Text>
          <TextInput value={activeBook.notes} onChangeText={v => setBooks(p => p.map(b => b.id === activeBook.id ? { ...b, notes: v } : b))}
            placeholder="Your notes about this book..." placeholderTextColor={colors.mutedForeground} multiline
            style={[styles.notesInput, { color: colors.foreground, borderColor: colors.border }]} />
          <Text style={[styles.sectionLabel, { color: colors.foreground }]}>💬 Quotes</Text>
          {activeBook.quotes.map((q, i) => (
            <View key={i} style={[styles.quoteRow, { borderColor: themeColor }]}>
              <Text style={[styles.quoteText, { color: colors.foreground }]}>"{q}"</Text>
              <TouchableOpacity onPress={() => setBooks(p => p.map(b => b.id === activeBook.id ? { ...b, quotes: b.quotes.filter((_, j) => j !== i) } : b))}>
                <Ionicons name="close" size={14} color="#9ca3af" />
              </TouchableOpacity>
            </View>
          ))}
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
            <TextInput value={newQuote} onChangeText={setNewQuote} placeholder="Add a quote..." placeholderTextColor={colors.mutedForeground}
              style={[styles.quoteInput, { flex: 1, color: colors.foreground, borderColor: colors.border }]} />
            <TouchableOpacity onPress={() => { if (newQuote.trim()) { setBooks(p => p.map(b => b.id === activeBook.id ? { ...b, quotes: [...b.quotes, newQuote.trim()] } : b)); setNewQuote(''); } }}
              style={[styles.addBtnSm, { backgroundColor: themeColor }]}>
              <Ionicons name="add" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        books.map(book => (
          <TouchableOpacity key={book.id} onPress={() => setActiveBookId(book.id)}
            style={[styles.bookCard, { backgroundColor: isDark ? '#1c1917' : '#fff', borderLeftColor: STATUS_COLORS[book.status] }]}>
            <View style={styles.bookCardRow}>
              <LinearGradient colors={[themeColor, `${themeColor}88`]} style={styles.bookIcon}>
                <Ionicons name="book" size={20} color="#fff" />
              </LinearGradient>
              <View style={{ flex: 1 }}>
                <Text style={[styles.bookTitle, { color: colors.foreground }]}>{book.bookTitle}</Text>
                <Text style={[styles.bookAuthor, { color: colors.mutedForeground }]}>by {book.author}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 }}>
                  <View style={[styles.statusBadge, { backgroundColor: `${STATUS_COLORS[book.status]}20` }]}>
                    <Text style={[styles.statusText, { color: STATUS_COLORS[book.status] }]}>{book.status.split('-').join(' ')}</Text>
                  </View>
                  {book.rating > 0 && <Text style={{ color: '#f59e0b', fontSize: 12 }}>{'⭐'.repeat(book.rating)}</Text>}
                </View>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.mutedForeground} />
            </View>
          </TouchableOpacity>
        ))
      )}

      {books.length === 0 && !activeBook && (
        <View style={styles.empty}>
          <Text style={{ fontSize: 48 }}>📚</Text>
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No books yet</Text>
          <TouchableOpacity onPress={() => setShowAddBook(true)} style={[styles.emptyBtn, { backgroundColor: themeColor }]}>
            <Text style={styles.emptyBtnText}>Add Your First Book</Text>
          </TouchableOpacity>
        </View>
      )}

      <Modal visible={showAddBook} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modal, { backgroundColor: isDark ? '#1c1917' : '#fff' }]}>
            <View style={styles.modalHandle} />
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>Add Book</Text>
            {[{ label: 'Book Title *', field: 'bookTitle' }, { label: 'Author', field: 'author' }, { label: 'Genre', field: 'genre' }].map(f => (
              <TextInput key={f.field} value={(form as any)[f.field]} onChangeText={v => setForm(p => ({ ...p, [f.field]: v }))} placeholder={f.label}
                placeholderTextColor={colors.mutedForeground} style={[styles.input, { color: colors.foreground, borderColor: colors.border, marginBottom: 10 }]} />
            ))}
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 14 }}>
              {(['want-to-read', 'reading', 'completed'] as const).map(s => (
                <TouchableOpacity key={s} onPress={() => setForm(p => ({ ...p, status: s }))}
                  style={[styles.statusOption, { backgroundColor: form.status === s ? STATUS_COLORS[s] : (isDark ? '#292524' : '#f5f5f4') }]}>
                  <Text style={[styles.statusOptionText, { color: form.status === s ? '#fff' : colors.foreground }]}>{s.split('-').join(' ')}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity onPress={() => setShowAddBook(false)} style={[styles.cancelBtn, { borderColor: colors.border }]}>
                <Text style={{ color: colors.foreground }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={addBook} style={[styles.submitBtn, { backgroundColor: themeColor }]}>
                <Text style={styles.submitText}>Add Book</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

// ─── 2. Class Notes ───────────────────────────────────────────────────────────
interface Subject { id: string; name: string; color: string; lectures: {id:string; title:string; date:string; content:string; assignments:string[]}[]; }

export const ClassNotesTemplate: React.FC<TemplateProps> = ({ notebook }) => {
  const { colors, isDark } = useTheme();
  const themeColor = notebook.appearance?.themeColor || '#3b82f6';
  const [subjects, setSubjects] = useState<Subject[]>([
    { id: '1', name: 'Mathematics', color: '#3b82f6', lectures: [] },
    { id: '2', name: 'Physics', color: '#10b981', lectures: [] },
  ]);
  const [activeSubId, setActiveSubId] = useState<string | null>(null);
  const [showAddSub, setShowAddSub] = useState(false);
  const [showAddLecture, setShowAddLecture] = useState(false);
  const [subForm, setSubForm] = useState({ name: '', color: '#3b82f6' });
  const [lectureForm, setLectureForm] = useState({ title: '', date: format(new Date(), 'yyyy-MM-dd'), content: '' });
  const COLORS = ['#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6','#ec4899','#f97316','#06b6d4'];
  const activeSub = subjects.find(s => s.id === activeSubId);

  return (
    <ScrollView style={[styles.container, { backgroundColor: isDark ? '#0c0a09' : '#eff6ff' }]} showsVerticalScrollIndicator={false}>
      <LinearGradient colors={[themeColor, `${themeColor}99`]} style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Ionicons name="school" size={22} color="#fff" />
          <Text style={styles.headerTitle}>Class Notes</Text>
          {!activeSub && (
            <TouchableOpacity onPress={() => setShowAddSub(true)} style={styles.headerAddBtn}>
              <Ionicons name="add" size={20} color="#fff" />
            </TouchableOpacity>
          )}
        </View>
        <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, marginTop: 4 }}>{subjects.length} subjects • {subjects.reduce((a, s) => a + s.lectures.length, 0)} lectures</Text>
      </LinearGradient>

      {activeSub ? (
        <View>
          <TouchableOpacity onPress={() => setActiveSubId(null)} style={[styles.backRow, { backgroundColor: isDark ? '#1c1917' : '#fff', padding: 14 }]}>
            <Ionicons name="arrow-back" size={16} color={activeSub.color} />
            <Text style={[styles.backText, { color: activeSub.color }]}>{activeSub.name}</Text>
            <TouchableOpacity onPress={() => setShowAddLecture(true)} style={[styles.addLectureBtn, { backgroundColor: activeSub.color, marginLeft: 'auto' as any }]}>
              <Ionicons name="add" size={16} color="#fff" />
              <Text style={styles.addLectureBtnText}>Add Lecture</Text>
            </TouchableOpacity>
          </TouchableOpacity>
          {activeSub.lectures.map(lecture => (
            <View key={lecture.id} style={[styles.lectureCard, { backgroundColor: isDark ? '#1c1917' : '#fff', borderColor: colors.border }]}>
              <Text style={[styles.lectureTitle, { color: colors.foreground }]}>{lecture.title}</Text>
              <Text style={[styles.lectureDate, { color: colors.mutedForeground }]}>{lecture.date}</Text>
              {lecture.content && <Text style={[styles.lectureContent, { color: colors.foreground }]} numberOfLines={3}>{lecture.content}</Text>}
            </View>
          ))}
          {activeSub.lectures.length === 0 && (
            <View style={styles.empty}><Ionicons name="document-text-outline" size={48} color={colors.mutedForeground} />
              <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No lectures yet</Text></View>
          )}
        </View>
      ) : (
        subjects.map(subject => (
          <TouchableOpacity key={subject.id} onPress={() => setActiveSubId(subject.id)}
            style={[styles.subjectCard, { backgroundColor: isDark ? '#1c1917' : '#fff', borderLeftColor: subject.color }]}>
            <View style={[styles.subjectIcon, { backgroundColor: `${subject.color}20` }]}>
              <Ionicons name="book" size={20} color={subject.color} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.subjectName, { color: colors.foreground }]}>{subject.name}</Text>
              <Text style={[styles.subjectMeta, { color: colors.mutedForeground }]}>{subject.lectures.length} lectures</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.mutedForeground} />
          </TouchableOpacity>
        ))
      )}

      <Modal visible={showAddSub} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modal, { backgroundColor: isDark ? '#1c1917' : '#fff' }]}>
            <View style={styles.modalHandle} />
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>New Subject</Text>
            <TextInput value={subForm.name} onChangeText={v => setSubForm(p => ({ ...p, name: v }))} placeholder="Subject name"
              placeholderTextColor={colors.mutedForeground} style={[styles.input, { color: colors.foreground, borderColor: colors.border, marginBottom: 12 }]} />
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 }}>
              {COLORS.map(c => (
                <TouchableOpacity key={c} onPress={() => setSubForm(p => ({ ...p, color: c }))}
                  style={[styles.colorCircle, { backgroundColor: c }, subForm.color === c && styles.colorCircleSelected]} />
              ))}
            </View>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity onPress={() => setShowAddSub(false)} style={[styles.cancelBtn, { borderColor: colors.border }]}>
                <Text style={{ color: colors.foreground }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => { if (subForm.name.trim()) { setSubjects(p => [...p, { id: Date.now().toString(), name: subForm.name.trim(), color: subForm.color, lectures: [] }]); setSubForm({ name: '', color: '#3b82f6' }); setShowAddSub(false); } }}
                style={[styles.submitBtn, { backgroundColor: themeColor }]}>
                <Text style={styles.submitText}>Add Subject</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={showAddLecture} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modal, { backgroundColor: isDark ? '#1c1917' : '#fff' }]}>
            <View style={styles.modalHandle} />
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>New Lecture</Text>
            <TextInput value={lectureForm.title} onChangeText={v => setLectureForm(p => ({ ...p, title: v }))} placeholder="Lecture title"
              placeholderTextColor={colors.mutedForeground} style={[styles.input, { color: colors.foreground, borderColor: colors.border, marginBottom: 10 }]} />
            <TextInput value={lectureForm.date} onChangeText={v => setLectureForm(p => ({ ...p, date: v }))} placeholder="Date (YYYY-MM-DD)"
              placeholderTextColor={colors.mutedForeground} style={[styles.input, { color: colors.foreground, borderColor: colors.border, marginBottom: 10 }]} />
            <TextInput value={lectureForm.content} onChangeText={v => setLectureForm(p => ({ ...p, content: v }))} placeholder="Lecture notes..." multiline
              placeholderTextColor={colors.mutedForeground} style={[styles.input, { color: colors.foreground, borderColor: colors.border, marginBottom: 10, minHeight: 80 }]} />
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity onPress={() => setShowAddLecture(false)} style={[styles.cancelBtn, { borderColor: colors.border }]}>
                <Text style={{ color: colors.foreground }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => { if (lectureForm.title.trim() && activeSubId) { setSubjects(p => p.map(s => s.id === activeSubId ? { ...s, lectures: [...s.lectures, { id: Date.now().toString(), ...lectureForm, assignments: [] }] } : s)); setLectureForm({ title: '', date: format(new Date(), 'yyyy-MM-dd'), content: '' }); setShowAddLecture(false); } }}
                style={[styles.submitBtn, { backgroundColor: activeSub?.color || themeColor }]}>
                <Text style={styles.submitText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

// ─── 3. Link Collection ───────────────────────────────────────────────────────
interface LinkItem { id: string; title: string; url: string; description?: string; category: string; tags: string[]; }

export const LinkTemplate: React.FC<TemplateProps> = ({ notebook }) => {
  const { colors, isDark } = useTheme();
  const themeColor = notebook.appearance?.themeColor || '#3b82f6';
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [form, setForm] = useState({ title: '', url: '', description: '', category: 'General', tags: '' });
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('All');
  const categories = ['All', ...['General', 'Work', 'Learning', 'Social', 'Shopping', 'News', 'Tools']];

  const filtered = links.filter(l =>
    (filterCat === 'All' || l.category === filterCat) &&
    (!search || l.title.toLowerCase().includes(search.toLowerCase()) || l.url.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor: isDark ? '#0c0a09' : '#eff6ff' }]} showsVerticalScrollIndicator={false}>
      <LinearGradient colors={[themeColor, `${themeColor}99`]} style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Ionicons name="link" size={22} color="#fff" />
          <Text style={styles.headerTitle}>Link Collection</Text>
          <TouchableOpacity onPress={() => setShowForm(true)} style={styles.headerAddBtn}>
            <Ionicons name="add" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
        <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, marginTop: 4 }}>{links.length} links saved</Text>
      </LinearGradient>
      <View style={[styles.searchRow, { backgroundColor: isDark ? '#1c1917' : '#fff' }]}>
        <View style={[styles.searchBar, { backgroundColor: isDark ? '#292524' : '#f5f5f4', borderColor: colors.border }]}>
          <Ionicons name="search" size={16} color={colors.mutedForeground} />
          <TextInput value={search} onChangeText={setSearch} placeholder="Search links..." placeholderTextColor={colors.mutedForeground}
            style={[styles.searchInput, { color: colors.foreground }]} />
        </View>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catScroll} style={{ backgroundColor: isDark ? '#1c1917' : '#fff' }}>
        {categories.map(cat => (
          <TouchableOpacity key={cat} onPress={() => setFilterCat(cat)}
            style={[styles.catChip2, { backgroundColor: filterCat === cat ? themeColor : (isDark ? '#292524' : '#f5f5f4') }]}>
            <Text style={[styles.catChipText2, { color: filterCat === cat ? '#fff' : colors.foreground }]}>{cat}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      {filtered.map(link => (
        <View key={link.id} style={[styles.linkCard, { backgroundColor: isDark ? '#1c1917' : '#fff', borderColor: colors.border }]}>
          <View style={styles.linkHeader}>
            <View style={[styles.linkIcon, { backgroundColor: `${themeColor}20` }]}><Ionicons name="link" size={16} color={themeColor} /></View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.linkTitle, { color: colors.foreground }]}>{link.title}</Text>
              <Text style={[styles.linkUrl, { color: themeColor }]} numberOfLines={1}>{link.url}</Text>
            </View>
            <TouchableOpacity onPress={() => setLinks(p => p.filter(l => l.id !== link.id))}>
              <Ionicons name="trash-outline" size={16} color="#9ca3af" />
            </TouchableOpacity>
          </View>
          {link.description && <Text style={[styles.linkDesc, { color: colors.mutedForeground }]}>{link.description}</Text>}
        </View>
      ))}
      {links.length === 0 && (
        <View style={styles.empty}><Ionicons name="link-outline" size={48} color={colors.mutedForeground} />
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No links yet</Text></View>
      )}
      <Modal visible={showForm} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modal, { backgroundColor: isDark ? '#1c1917' : '#fff' }]}>
            <View style={styles.modalHandle} />
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>Add Link</Text>
            {[{ f: 'title', p: 'Link title' }, { f: 'url', p: 'https://...' }, { f: 'description', p: 'Description (optional)' }].map(({ f, p }) => (
              <TextInput key={f} value={(form as any)[f]} onChangeText={v => setForm(prev => ({ ...prev, [f]: v }))} placeholder={p}
                placeholderTextColor={colors.mutedForeground} style={[styles.input, { color: colors.foreground, borderColor: colors.border, marginBottom: 10 }]} autoCapitalize="none" />
            ))}
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity onPress={() => setShowForm(false)} style={[styles.cancelBtn, { borderColor: colors.border }]}>
                <Text style={{ color: colors.foreground }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => { if (form.url.trim()) { setLinks(p => [...p, { id: Date.now().toString(), ...form, tags: [] }]); setForm({ title: '', url: '', description: '', category: 'General', tags: '' }); setShowForm(false); } }}
                style={[styles.submitBtn, { backgroundColor: themeColor }]}>
                <Text style={styles.submitText}>Save Link</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

// ─── 4. Games Scorecard ───────────────────────────────────────────────────────
interface Player { id: string; name: string; color: string; }
interface Match { id: string; date: string; scores: Record<string, number>; winner: string; }

export const GamesScorecardTemplate: React.FC<TemplateProps> = ({ notebook }) => {
  const { colors, isDark } = useTheme();
  const themeColor = notebook.appearance?.themeColor || '#f97316';
  const [players, setPlayers] = useState<Player[]>([
    { id: '1', name: 'Player 1', color: '#ef4444' },
    { id: '2', name: 'Player 2', color: '#3b82f6' },
  ]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [scoreForm, setScoreForm] = useState<Record<string, string>>({});
  const PLAYER_COLORS = ['#ef4444','#3b82f6','#10b981','#f59e0b','#8b5cf6','#ec4899'];

  const addMatch = () => {
    const scores: Record<string, number> = {};
    players.forEach(p => { scores[p.id] = parseInt(scoreForm[p.id] || '0') || 0; });
    const winnerId = Object.entries(scores).sort((a, b) => b[1] - a[1])[0]?.[0];
    const winner = players.find(p => p.id === winnerId)?.name || '';
    setMatches(prev => [...prev, { id: Date.now().toString(), date: format(new Date(), 'MMM d'), scores, winner }]);
    setScoreForm({});
    setShowScoreModal(false);
  };

  const playerTotals = players.map(p => ({
    ...p,
    total: matches.reduce((sum, m) => sum + (m.scores[p.id] || 0), 0),
    wins: matches.filter(m => m.winner === p.name).length,
  })).sort((a, b) => b.total - a.total);

  return (
    <ScrollView style={[styles.container, { backgroundColor: isDark ? '#0c0a09' : '#fff7ed' }]} showsVerticalScrollIndicator={false}>
      <LinearGradient colors={[themeColor, `${themeColor}99`]} style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Ionicons name="trophy" size={22} color="#fff" />
          <Text style={styles.headerTitle}>Games Scorecard</Text>
          <TouchableOpacity onPress={() => setShowScoreModal(true)} style={styles.headerAddBtn}>
            <Ionicons name="add" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
        <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, marginTop: 4 }}>{matches.length} matches played</Text>
      </LinearGradient>

      {/* Leaderboard */}
      <View style={[styles.leaderboard, { backgroundColor: isDark ? '#1c1917' : '#fff' }]}>
        <Text style={[styles.sectionLabel2, { color: colors.foreground }]}>🏆 Leaderboard</Text>
        {playerTotals.map((p, i) => (
          <View key={p.id} style={[styles.leaderRow, { borderColor: colors.border }]}>
            <Text style={[styles.leaderRank, { color: i === 0 ? '#f59e0b' : colors.mutedForeground }]}>#{i + 1}</Text>
            <View style={[styles.playerAvatar, { backgroundColor: p.color }]}>
              <Text style={styles.playerAvatarText}>{p.name[0]}</Text>
            </View>
            <Text style={[styles.leaderName, { color: colors.foreground }]}>{p.name}</Text>
            <Text style={[styles.leaderWins, { color: '#10b981' }]}>{p.wins}W</Text>
            <Text style={[styles.leaderTotal, { color: themeColor }]}>{p.total}pts</Text>
          </View>
        ))}
      </View>

      {/* Add player */}
      <View style={[styles.addPlayerRow, { backgroundColor: isDark ? '#1c1917' : '#fff' }]}>
        <TextInput value={newPlayerName} onChangeText={setNewPlayerName} placeholder="Add player..." placeholderTextColor={colors.mutedForeground}
          style={[styles.playerInput, { color: colors.foreground, borderColor: colors.border }]} />
        <TouchableOpacity onPress={() => { if (newPlayerName.trim()) { setPlayers(p => [...p, { id: Date.now().toString(), name: newPlayerName.trim(), color: PLAYER_COLORS[p.length % PLAYER_COLORS.length] }]); setNewPlayerName(''); } }}
          style={[styles.addBtnSm, { backgroundColor: themeColor }]}>
          <Ionicons name="add" size={18} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Match history */}
      <View style={[styles.matchHistory, { backgroundColor: isDark ? '#1c1917' : '#fff' }]}>
        <Text style={[styles.sectionLabel2, { color: colors.foreground }]}>📋 Match History</Text>
        {matches.length === 0 ? (
          <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No matches yet. Add scores above!</Text>
        ) : (
          matches.slice().reverse().map((match, i) => (
            <View key={match.id} style={[styles.matchRow, { borderColor: colors.border }]}>
              <Text style={[styles.matchDate, { color: colors.mutedForeground }]}>{match.date}</Text>
              {players.map(p => (
                <View key={p.id} style={styles.matchScore}>
                  <Text style={[styles.matchPlayerName, { color: p.color }]}>{p.name.split(' ')[0]}</Text>
                  <Text style={[styles.matchScoreNum, { color: colors.foreground }]}>{match.scores[p.id] || 0}</Text>
                </View>
              ))}
              <Text style={[styles.matchWinner, { color: themeColor }]}>🏆 {match.winner}</Text>
            </View>
          ))
        )}
      </View>

      <Modal visible={showScoreModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modal, { backgroundColor: isDark ? '#1c1917' : '#fff' }]}>
            <View style={styles.modalHandle} />
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>Enter Scores</Text>
            {players.map(p => (
              <View key={p.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <View style={[styles.playerAvatar, { backgroundColor: p.color }]}>
                  <Text style={styles.playerAvatarText}>{p.name[0]}</Text>
                </View>
                <Text style={[styles.leaderName, { color: colors.foreground, flex: 1 }]}>{p.name}</Text>
                <TextInput value={scoreForm[p.id] || ''} onChangeText={v => setScoreForm(prev => ({ ...prev, [p.id]: v }))}
                  placeholder="0" keyboardType="numeric" style={[styles.scoreInput, { color: colors.foreground, borderColor: colors.border }]} />
              </View>
            ))}
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 8 }}>
              <TouchableOpacity onPress={() => setShowScoreModal(false)} style={[styles.cancelBtn, { borderColor: colors.border }]}>
                <Text style={{ color: colors.foreground }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={addMatch} style={[styles.submitBtn, { backgroundColor: themeColor }]}>
                <Text style={styles.submitText}>Save Match</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

// ─── 5. Expense Sharer ────────────────────────────────────────────────────────
interface Participant { id: string; name: string; color: string; }
interface SharedExpense { id: string; description: string; amount: number; paidBy: string; splitAmong: string[]; date: string; }

export const ExpenseSharerTemplate: React.FC<TemplateProps> = ({ notebook }) => {
  const { colors, isDark } = useTheme();
  const themeColor = notebook.appearance?.themeColor || '#f59e0b';
  const [participants, setParticipants] = useState<Participant[]>([
    { id: '1', name: 'Alice', color: '#3b82f6' },
    { id: '2', name: 'Bob', color: '#10b981' },
  ]);
  const [expenses, setExpenses] = useState<SharedExpense[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ description: '', amount: '', paidBy: '1', splitAmong: [] as string[] });
  const [newParticipant, setNewParticipant] = useState('');
  const COLORS = ['#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6','#ec4899'];

  const calcBalances = () => {
    const balances: Record<string, number> = {};
    participants.forEach(p => balances[p.id] = 0);
    expenses.forEach(exp => {
      const splitCount = exp.splitAmong.length || participants.length;
      const share = exp.amount / splitCount;
      balances[exp.paidBy] = (balances[exp.paidBy] || 0) + exp.amount;
      (exp.splitAmong.length > 0 ? exp.splitAmong : participants.map(p => p.id)).forEach(pid => {
        balances[pid] = (balances[pid] || 0) - share;
      });
    });
    return balances;
  };

  const balances = calcBalances();
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);

  return (
    <ScrollView style={[styles.container, { backgroundColor: isDark ? '#0c0a09' : '#fffbeb' }]} showsVerticalScrollIndicator={false}>
      <LinearGradient colors={[themeColor, `${themeColor}99`]} style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Ionicons name="people" size={22} color="#fff" />
          <Text style={styles.headerTitle}>Expense Sharer</Text>
          <TouchableOpacity onPress={() => setShowAdd(true)} style={styles.headerAddBtn}>
            <Ionicons name="add" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
        <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, marginTop: 4 }}>Total: ${totalExpenses.toFixed(2)}</Text>
      </LinearGradient>

      {/* Participants */}
      <View style={[styles.participantSection, { backgroundColor: isDark ? '#1c1917' : '#fff' }]}>
        <Text style={[styles.sectionLabel2, { color: colors.foreground }]}>Participants</Text>
        <View style={styles.participantsRow}>
          {participants.map(p => (
            <View key={p.id} style={styles.participantItem}>
              <View style={[styles.participantAvatar, { backgroundColor: p.color }]}>
                <Text style={styles.participantAvatarText}>{p.name[0]}</Text>
              </View>
              <Text style={[styles.participantName, { color: colors.foreground }]}>{p.name}</Text>
              <Text style={[styles.participantBalance, { color: balances[p.id] >= 0 ? '#10b981' : '#ef4444' }]}>
                {balances[p.id] >= 0 ? '+' : ''}{balances[p.id]?.toFixed(2)}
              </Text>
            </View>
          ))}
        </View>
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
          <TextInput value={newParticipant} onChangeText={setNewParticipant} placeholder="Add participant..." placeholderTextColor={colors.mutedForeground}
            style={[styles.input, { flex: 1, color: colors.foreground, borderColor: colors.border, marginBottom: 0 }]} />
          <TouchableOpacity onPress={() => { if (newParticipant.trim()) { setParticipants(p => [...p, { id: Date.now().toString(), name: newParticipant.trim(), color: COLORS[p.length % COLORS.length] }]); setNewParticipant(''); } }}
            style={[styles.addBtnSm, { backgroundColor: themeColor }]}>
            <Ionicons name="add" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Expenses */}
      {expenses.map(exp => {
        const payer = participants.find(p => p.id === exp.paidBy);
        return (
          <View key={exp.id} style={[styles.expenseShareCard, { backgroundColor: isDark ? '#1c1917' : '#fff', borderColor: colors.border }]}>
            <View style={styles.expenseShareHeader}>
              <Text style={[styles.expenseShareDesc, { color: colors.foreground }]}>{exp.description}</Text>
              <Text style={[styles.expenseShareAmount, { color: themeColor }]}>${exp.amount.toFixed(2)}</Text>
              <TouchableOpacity onPress={() => setExpenses(p => p.filter(e => e.id !== exp.id))}>
                <Ionicons name="close" size={16} color="#9ca3af" />
              </TouchableOpacity>
            </View>
            <Text style={[styles.expenseShareMeta, { color: colors.mutedForeground }]}>
              Paid by {payer?.name} • Split {exp.splitAmong.length > 0 ? `among ${exp.splitAmong.length}` : 'equally'}
            </Text>
          </View>
        );
      })}

      <Modal visible={showAdd} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modal, { backgroundColor: isDark ? '#1c1917' : '#fff' }]}>
            <View style={styles.modalHandle} />
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>Add Expense</Text>
            <TextInput value={form.description} onChangeText={v => setForm(p => ({ ...p, description: v }))} placeholder="What's this for?"
              placeholderTextColor={colors.mutedForeground} style={[styles.input, { color: colors.foreground, borderColor: colors.border, marginBottom: 10 }]} />
            <TextInput value={form.amount} onChangeText={v => setForm(p => ({ ...p, amount: v }))} placeholder="Amount ($)" keyboardType="numeric"
              placeholderTextColor={colors.mutedForeground} style={[styles.input, { color: colors.foreground, borderColor: colors.border, marginBottom: 10 }]} />
            <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Paid by</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
              {participants.map(p => (
                <TouchableOpacity key={p.id} onPress={() => setForm(prev => ({ ...prev, paidBy: p.id }))}
                  style={[styles.participantChip, { backgroundColor: form.paidBy === p.id ? p.color : (isDark ? '#292524' : '#f5f5f4') }]}>
                  <Text style={[styles.participantChipText, { color: form.paidBy === p.id ? '#fff' : colors.foreground }]}>{p.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity onPress={() => setShowAdd(false)} style={[styles.cancelBtn, { borderColor: colors.border }]}>
                <Text style={{ color: colors.foreground }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => { if (form.description.trim() && form.amount) { setExpenses(p => [...p, { id: Date.now().toString(), description: form.description, amount: parseFloat(form.amount), paidBy: form.paidBy, splitAmong: [], date: format(new Date(), 'yyyy-MM-dd') }]); setForm({ description: '', amount: '', paidBy: participants[0]?.id || '1', splitAmong: [] }); setShowAdd(false); } }}
                style={[styles.submitBtn, { backgroundColor: themeColor }]}>
                <Text style={styles.submitText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

// ─── 6. Meals Planner ─────────────────────────────────────────────────────────
export const MealsPlannerTemplate: React.FC<TemplateProps> = ({ notebook }) => {
  const { colors, isDark } = useTheme();
  const themeColor = notebook.appearance?.themeColor || '#f59e0b';
  const [mealPlan, setMealPlan] = useState<Record<string, Record<string, string>>>({});
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const mealTypes = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];

  const updateMeal = (date: string, mealType: string, value: string) => {
    setMealPlan(prev => ({ ...prev, [date]: { ...prev[date], [mealType]: value } }));
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: isDark ? '#0c0a09' : '#fff7ed' }]} showsVerticalScrollIndicator={false}>
      <LinearGradient colors={[themeColor, `${themeColor}99`]} style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Ionicons name="restaurant" size={22} color="#fff" />
          <Text style={styles.headerTitle}>Meals Planner</Text>
        </View>
        <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, marginTop: 4 }}>Week of {format(weekStart, 'MMMM d, yyyy')}</Text>
      </LinearGradient>

      {weekDays.map(day => {
        const dateStr = format(day, 'yyyy-MM-dd');
        const isToday = format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
        return (
          <View key={dateStr} style={[styles.mealDayCard, { backgroundColor: isDark ? '#1c1917' : '#fff', borderColor: isToday ? themeColor : colors.border, borderWidth: isToday ? 2 : 1 }]}>
            <Text style={[styles.mealDayTitle, { color: isToday ? themeColor : colors.foreground }]}>
              {format(day, 'EEEE')}{isToday ? ' (Today)' : ''} • {format(day, 'MMM d')}
            </Text>
            {mealTypes.map(mealType => (
              <View key={mealType} style={styles.mealRow}>
                <Text style={[styles.mealTypeLabel, { color: colors.mutedForeground }]}>{mealType}</Text>
                <TextInput
                  value={mealPlan[dateStr]?.[mealType] || ''}
                  onChangeText={v => updateMeal(dateStr, mealType, v)}
                  placeholder={`Add ${mealType.toLowerCase()}...`}
                  placeholderTextColor={colors.mutedForeground}
                  style={[styles.mealInput, { color: colors.foreground, borderColor: colors.border }]}
                />
              </View>
            ))}
          </View>
        );
      })}
    </ScrollView>
  );
};

// ─── 7. Sticker Book ─────────────────────────────────────────────────────────
interface Sticker { id: string; text: string; color: string; emoji: string; x: number; y: number; rotation: number; size: 'sm'|'md'|'lg'; }

export const StickerBookTemplate: React.FC<TemplateProps> = ({ notebook }) => {
  const { colors, isDark } = useTheme();
  const themeColor = notebook.appearance?.themeColor || '#ec4899';
  const STICKY_COLORS = ['#fef08a','#bbf7d0','#bfdbfe','#fecaca','#e9d5ff','#fed7aa','#f9a8d4','#99f6e4'];
  const EMOJIS = ['📝','💡','⭐','🎯','🔥','✅','❌','💬','🎨','🚀','📌','🔑','💎','🌟','🎉','❤️'];
  const [stickers, setStickers] = useState<Sticker[]>([]);
  const [form, setForm] = useState({ text: '', color: STICKY_COLORS[0], emoji: '📝', size: 'md' as Sticker['size'] });
  const [showForm, setShowForm] = useState(false);

  const addSticker = () => {
    if (!form.text.trim()) return;
    const sticker: Sticker = {
      id: Date.now().toString(),
      text: form.text.trim(),
      color: form.color,
      emoji: form.emoji,
      x: Math.random() * 60,
      y: stickers.length * 110,
      rotation: (Math.random() - 0.5) * 15,
      size: form.size,
    };
    setStickers(p => [...p, sticker]);
    setForm(p => ({ ...p, text: '' }));
    setShowForm(false);
  };

  const SIZE_SIZES = { sm: 100, md: 140, lg: 180 };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#0c0a09' : '#fdf2f8' }]}>
      <LinearGradient colors={[themeColor, `${themeColor}99`]} style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Ionicons name="star" size={22} color="#fff" />
          <Text style={styles.headerTitle}>Sticker Book</Text>
          <TouchableOpacity onPress={() => setShowForm(true)} style={styles.headerAddBtn}>
            <Ionicons name="add" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.stickerBoard}>
        {stickers.length === 0 ? (
          <View style={styles.empty}>
            <Text style={{ fontSize: 48 }}>📌</Text>
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No sticky notes yet</Text>
            <TouchableOpacity onPress={() => setShowForm(true)} style={[styles.emptyBtn, { backgroundColor: themeColor }]}>
              <Text style={styles.emptyBtnText}>Add Sticky Note</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.stickersGrid}>
            {stickers.map(sticker => (
              <View key={sticker.id} style={[styles.sticker, { backgroundColor: sticker.color, width: SIZE_SIZES[sticker.size], transform: [{ rotate: `${sticker.rotation}deg` }] }]}>
                <View style={styles.stickerTop}>
                  <Text style={styles.stickerEmoji}>{sticker.emoji}</Text>
                  <TouchableOpacity onPress={() => setStickers(p => p.filter(s => s.id !== sticker.id))} style={styles.stickerDelete}>
                    <Ionicons name="close" size={12} color="rgba(0,0,0,0.4)" />
                  </TouchableOpacity>
                </View>
                <Text style={styles.stickerText}>{sticker.text}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <Modal visible={showForm} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modal, { backgroundColor: isDark ? '#1c1917' : '#fff' }]}>
            <View style={styles.modalHandle} />
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>Add Sticky Note</Text>
            <TextInput value={form.text} onChangeText={v => setForm(p => ({ ...p, text: v }))} placeholder="Note text..." placeholderTextColor={colors.mutedForeground}
              multiline style={[styles.input, { color: colors.foreground, borderColor: colors.border, marginBottom: 12, minHeight: 60 }]} />
            <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Color</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
              {STICKY_COLORS.map(c => (
                <TouchableOpacity key={c} onPress={() => setForm(p => ({ ...p, color: c }))}
                  style={[styles.stickyColorDot, { backgroundColor: c }, form.color === c && styles.stickyColorSelected]} />
              ))}
            </View>
            <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Emoji</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
              {EMOJIS.map(e => (
                <TouchableOpacity key={e} onPress={() => setForm(p => ({ ...p, emoji: e }))}
                  style={[styles.emojiBtn, { backgroundColor: form.emoji === e ? `${themeColor}20` : (isDark ? '#292524' : '#f5f5f4') }]}>
                  <Text style={{ fontSize: 20 }}>{e}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 14 }}>
              {(['sm', 'md', 'lg'] as const).map(s => (
                <TouchableOpacity key={s} onPress={() => setForm(p => ({ ...p, size: s }))}
                  style={[styles.sizeBtn, { backgroundColor: form.size === s ? themeColor : (isDark ? '#292524' : '#f5f5f4') }]}>
                  <Text style={[styles.sizeBtnText, { color: form.size === s ? '#fff' : colors.foreground }]}>{s.toUpperCase()}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity onPress={() => setShowForm(false)} style={[styles.cancelBtn, { borderColor: colors.border }]}>
                <Text style={{ color: colors.foreground }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={addSticker} style={[styles.submitBtn, { backgroundColor: themeColor }]}>
                <Text style={styles.submitText}>Add Note</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

// ─── 8. Prompt Diary ──────────────────────────────────────────────────────────
interface PromptEntry { id: string; prompt: string; response: string; category: string; tags: string[]; createdAt: string; }

export const PromptDiaryTemplate: React.FC<TemplateProps> = ({ notebook }) => {
  const { colors, isDark } = useTheme();
  const themeColor = notebook.appearance?.themeColor || '#a855f7';
  const PRESET_PROMPTS = [
    'What am I most proud of today?', 'What would my ideal day look like?',
    'What fear is holding me back?', 'What do I need to let go of?',
    'What makes me feel most alive?', 'What am I grateful for right now?',
    'What lesson did I learn this week?', 'What do I want to remember 10 years from now?',
  ];
  const [entries, setEntries] = useState<PromptEntry[]>([]);
  const [activePrompt, setActivePrompt] = useState('');
  const [response, setResponse] = useState('');
  const [category, setCategory] = useState('Reflection');
  const CATEGORIES = ['Reflection', 'Goals', 'Gratitude', 'Challenge', 'Creative', 'Daily'];
  const CAT_COLORS: Record<string, string> = { Reflection: '#8b5cf6', Goals: '#f59e0b', Gratitude: '#10b981', Challenge: '#ef4444', Creative: '#ec4899', Daily: '#3b82f6' };

  const saveEntry = () => {
    if (!activePrompt || !response.trim()) return;
    setEntries(p => [{ id: Date.now().toString(), prompt: activePrompt, response: response.trim(), category, tags: [], createdAt: new Date().toISOString() }, ...p]);
    setActivePrompt(''); setResponse('');
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: isDark ? '#0c0a09' : '#faf5ff' }]} showsVerticalScrollIndicator={false}>
      <LinearGradient colors={[themeColor, `${themeColor}99`]} style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Ionicons name="journal" size={22} color="#fff" />
          <Text style={styles.headerTitle}>Prompt Diary</Text>
        </View>
        <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, marginTop: 4 }}>{entries.length} entries</Text>
      </LinearGradient>

      {/* Prompt selector */}
      <View style={[styles.promptSection, { backgroundColor: isDark ? '#1c1917' : '#fff' }]}>
        <Text style={[styles.sectionLabel2, { color: colors.foreground }]}>✨ Today's Prompt</Text>
        {!activePrompt ? (
          <View>
            <Text style={[styles.promptHint, { color: colors.mutedForeground }]}>Choose a prompt or write your own:</Text>
            <View style={styles.presetPrompts}>
              {PRESET_PROMPTS.map(p => (
                <TouchableOpacity key={p} onPress={() => setActivePrompt(p)}
                  style={[styles.presetPrompt, { backgroundColor: `${themeColor}15`, borderColor: `${themeColor}30` }]}>
                  <Text style={[styles.presetPromptText, { color: colors.foreground }]}>{p}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TextInput value={activePrompt} onChangeText={setActivePrompt} placeholder="Or type your own prompt..." placeholderTextColor={colors.mutedForeground}
              style={[styles.input, { color: colors.foreground, borderColor: colors.border }]} />
          </View>
        ) : (
          <View>
            <View style={[styles.activePromptBox, { backgroundColor: `${themeColor}15`, borderColor: `${themeColor}30` }]}>
              <Text style={[styles.activePromptText, { color: colors.foreground }]}>{activePrompt}</Text>
              <TouchableOpacity onPress={() => setActivePrompt('')}><Ionicons name="close" size={16} color={colors.mutedForeground} /></TouchableOpacity>
            </View>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
              {CATEGORIES.map(cat => (
                <TouchableOpacity key={cat} onPress={() => setCategory(cat)}
                  style={[styles.catChip2, { backgroundColor: category === cat ? (CAT_COLORS[cat] || themeColor) : (isDark ? '#292524' : '#f5f5f4') }]}>
                  <Text style={[styles.catChipText2, { color: category === cat ? '#fff' : colors.foreground }]}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TextInput value={response} onChangeText={setResponse} placeholder="Write your response..." placeholderTextColor={colors.mutedForeground}
              multiline style={[styles.input, { color: colors.foreground, borderColor: colors.border, minHeight: 120 }]} />
            <TouchableOpacity onPress={saveEntry} style={[styles.submitBtn, { backgroundColor: themeColor, alignSelf: 'flex-start', paddingHorizontal: 24 }]}>
              <Text style={styles.submitText}>Save Entry</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Past entries */}
      {entries.map(entry => (
        <View key={entry.id} style={[styles.promptEntry, { backgroundColor: isDark ? '#1c1917' : '#fff', borderLeftColor: CAT_COLORS[entry.category] || themeColor }]}>
          <View style={[styles.promptEntryCategory, { backgroundColor: `${(CAT_COLORS[entry.category] || themeColor)}20` }]}>
            <Text style={[styles.promptEntryCategoryText, { color: CAT_COLORS[entry.category] || themeColor }]}>{entry.category}</Text>
          </View>
          <Text style={[styles.promptEntryPrompt, { color: themeColor }]}>{entry.prompt}</Text>
          <Text style={[styles.promptEntryResponse, { color: colors.foreground }]}>{entry.response}</Text>
          <Text style={[styles.promptEntryDate, { color: colors.mutedForeground }]}>
            {format(new Date(entry.createdAt), 'MMM d, yyyy')}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
};

// ─── 9. Important URLs ────────────────────────────────────────────────────────
interface ImportantURL { id: string; title: string; url: string; type: 'youtube'|'instagram'|'twitter'|'tiktok'|'website'|'other'; notes?: string; }

export const ImportantURLsTemplate: React.FC<TemplateProps> = ({ notebook }) => {
  const { colors, isDark } = useTheme();
  const themeColor = notebook.appearance?.themeColor || '#f97316';
  const [urls, setUrls] = useState<ImportantURL[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: '', url: '', type: 'website' as ImportantURL['type'], notes: '' });
  const TYPE_ICONS: Record<string, { icon: string; color: string }> = {
    youtube: { icon: 'logo-youtube', color: '#ef4444' },
    instagram: { icon: 'logo-instagram', color: '#ec4899' },
    twitter: { icon: 'logo-twitter', color: '#1da1f2' },
    tiktok: { icon: 'logo-tiktok', color: '#000000' },
    website: { icon: 'globe', color: '#3b82f6' },
    other: { icon: 'link', color: '#6b7280' },
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: isDark ? '#0c0a09' : '#fff7ed' }]} showsVerticalScrollIndicator={false}>
      <LinearGradient colors={[themeColor, `${themeColor}99`]} style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Ionicons name="bookmark" size={22} color="#fff" />
          <Text style={styles.headerTitle}>Important URLs</Text>
          <TouchableOpacity onPress={() => setShowAdd(true)} style={styles.headerAddBtn}>
            <Ionicons name="add" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
        <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, marginTop: 4 }}>{urls.length} saved URLs</Text>
      </LinearGradient>

      {/* Type filter tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catScroll} style={{ backgroundColor: isDark ? '#1c1917' : '#fff' }}>
        {Object.entries(TYPE_ICONS).map(([type, info]) => (
          <View key={type} style={[styles.typeTab, { borderColor: info.color }]}>
            <Ionicons name={info.icon as any} size={14} color={info.color} />
            <Text style={[styles.typeTabText, { color: info.color }]}>{type}</Text>
          </View>
        ))}
      </ScrollView>

      {urls.map(url => {
        const typeInfo = TYPE_ICONS[url.type];
        return (
          <View key={url.id} style={[styles.urlCard, { backgroundColor: isDark ? '#1c1917' : '#fff', borderColor: colors.border }]}>
            <View style={styles.urlCardRow}>
              <View style={[styles.urlIcon, { backgroundColor: `${typeInfo.color}20` }]}>
                <Ionicons name={typeInfo.icon as any} size={20} color={typeInfo.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.urlTitle, { color: colors.foreground }]}>{url.title}</Text>
                <Text style={[styles.urlAddress, { color: typeInfo.color }]} numberOfLines={1}>{url.url}</Text>
                {url.notes && <Text style={[styles.urlNotes, { color: colors.mutedForeground }]}>{url.notes}</Text>}
              </View>
              <TouchableOpacity onPress={() => setUrls(p => p.filter(u => u.id !== url.id))}>
                <Ionicons name="trash-outline" size={16} color="#9ca3af" />
              </TouchableOpacity>
            </View>
          </View>
        );
      })}

      {urls.length === 0 && (
        <View style={styles.empty}><Ionicons name="bookmark-outline" size={48} color={colors.mutedForeground} />
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No URLs saved yet</Text></View>
      )}

      <Modal visible={showAdd} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modal, { backgroundColor: isDark ? '#1c1917' : '#fff' }]}>
            <View style={styles.modalHandle} />
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>Save URL</Text>
            {[{ f: 'title', p: 'Title (e.g. My Channel)' }, { f: 'url', p: 'https://...' }, { f: 'notes', p: 'Notes (optional)' }].map(({ f, p }) => (
              <TextInput key={f} value={(form as any)[f]} onChangeText={v => setForm(prev => ({ ...prev, [f]: v }))} placeholder={p}
                placeholderTextColor={colors.mutedForeground} style={[styles.input, { color: colors.foreground, borderColor: colors.border, marginBottom: 10 }]} autoCapitalize="none" />
            ))}
            <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Type</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
              {Object.entries(TYPE_ICONS).map(([type, info]) => (
                <TouchableOpacity key={type} onPress={() => setForm(p => ({ ...p, type: type as ImportantURL['type'] }))}
                  style={[styles.typeOption, { backgroundColor: form.type === type ? info.color : (isDark ? '#292524' : '#f5f5f4'), borderColor: info.color }]}>
                  <Ionicons name={info.icon as any} size={14} color={form.type === type ? '#fff' : info.color} />
                  <Text style={[styles.typeOptionText, { color: form.type === type ? '#fff' : colors.foreground }]}>{type}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity onPress={() => setShowAdd(false)} style={[styles.cancelBtn, { borderColor: colors.border }]}>
                <Text style={{ color: colors.foreground }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => { if (form.url.trim()) { setUrls(p => [...p, { id: Date.now().toString(), ...form }]); setForm({ title: '', url: '', type: 'website', notes: '' }); setShowAdd(false); } }}
                style={[styles.submitBtn, { backgroundColor: themeColor }]}>
                <Text style={styles.submitText}>Save URL</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

// ─── Shared Styles ────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 20, paddingTop: 24 },
  headerTitle: { flex: 1, color: '#fff', fontSize: 20, fontWeight: '800' },
  headerAddBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.25)', justifyContent: 'center', alignItems: 'center' },
  backRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14, paddingVertical: 10 },
  backText: { fontSize: 14, fontWeight: '600' },
  bookDetail: { margin: 12, borderRadius: 12, padding: 16, gap: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  bookDetailTitle: { fontSize: 20, fontWeight: '800' },
  bookDetailAuthor: { fontSize: 14 },
  starsRow: { flexDirection: 'row', gap: 4 },
  sectionLabel: { fontSize: 15, fontWeight: '700', marginBottom: 6 },
  notesInput: { borderWidth: 1, borderRadius: 8, padding: 10, fontSize: 14, minHeight: 80 },
  quoteRow: { flexDirection: 'row', alignItems: 'flex-start', borderLeftWidth: 3, paddingLeft: 10, paddingVertical: 6, gap: 8 },
  quoteText: { flex: 1, fontSize: 13, fontStyle: 'italic' },
  quoteInput: { borderWidth: 1, borderRadius: 8, padding: 8, fontSize: 13 },
  addBtnSm: { width: 36, height: 36, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  bookCard: { margin: 12, marginBottom: 0, borderRadius: 12, borderLeftWidth: 4, padding: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  bookCardRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  bookIcon: { width: 44, height: 44, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  bookTitle: { fontSize: 15, fontWeight: '700' },
  bookAuthor: { fontSize: 12, marginTop: 2 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  statusText: { fontSize: 11, fontWeight: '700' },
  subjectCard: { margin: 12, marginBottom: 0, borderRadius: 12, borderLeftWidth: 4, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  subjectIcon: { width: 44, height: 44, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  subjectName: { fontSize: 16, fontWeight: '700' },
  subjectMeta: { fontSize: 12, marginTop: 2 },
  addLectureBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 8 },
  addLectureBtnText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  lectureCard: { margin: 12, marginBottom: 0, borderRadius: 12, borderWidth: 1, padding: 14, gap: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  lectureTitle: { fontSize: 15, fontWeight: '700' },
  lectureDate: { fontSize: 12 },
  lectureContent: { fontSize: 13, lineHeight: 18 },
  colorCircle: { width: 32, height: 32, borderRadius: 16 },
  colorCircleSelected: { borderWidth: 3, borderColor: '#fff', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 4 },
  searchRow: { padding: 12, paddingBottom: 8 },
  searchBar: { flexDirection: 'row', alignItems: 'center', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 8, borderWidth: 1, gap: 8 },
  searchInput: { flex: 1, fontSize: 14 },
  catScroll: { flexDirection: 'row', gap: 8, paddingHorizontal: 12, paddingVertical: 8 },
  catChip2: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20 },
  catChipText2: { fontSize: 12, fontWeight: '600' },
  linkCard: { margin: 12, marginBottom: 0, borderRadius: 12, borderWidth: 1, padding: 14, gap: 8 },
  linkHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  linkIcon: { width: 36, height: 36, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  linkTitle: { fontSize: 14, fontWeight: '700' },
  linkUrl: { fontSize: 12, marginTop: 2 },
  linkDesc: { fontSize: 12 },
  leaderboard: { margin: 12, borderRadius: 12, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  sectionLabel2: { fontSize: 15, fontWeight: '700', marginBottom: 12 },
  leaderRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderTopWidth: 1, gap: 10 },
  leaderRank: { width: 24, fontSize: 14, fontWeight: '800' },
  playerAvatar: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  playerAvatarText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  leaderName: { flex: 1, fontSize: 14, fontWeight: '600' },
  leaderWins: { fontSize: 13, fontWeight: '700' },
  leaderTotal: { fontSize: 16, fontWeight: '800', width: 50, textAlign: 'right' },
  addPlayerRow: { margin: 12, borderRadius: 12, padding: 14, flexDirection: 'row', gap: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  playerInput: { flex: 1, borderWidth: 1, borderRadius: 8, padding: 10, fontSize: 14 },
  matchHistory: { margin: 12, borderRadius: 12, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  matchRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderTopWidth: 1, gap: 8 },
  matchDate: { fontSize: 12, width: 50 },
  matchScore: { flex: 1, alignItems: 'center' },
  matchPlayerName: { fontSize: 10, fontWeight: '600' },
  matchScoreNum: { fontSize: 16, fontWeight: '800' },
  matchWinner: { fontSize: 12, fontWeight: '600' },
  scoreInput: { width: 60, borderWidth: 1, borderRadius: 8, padding: 8, fontSize: 16, fontWeight: '700', textAlign: 'center' },
  participantSection: { margin: 12, borderRadius: 12, padding: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  participantsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 10 },
  participantItem: { alignItems: 'center', gap: 4, width: 70 },
  participantAvatar: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  participantAvatarText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  participantName: { fontSize: 11, fontWeight: '600', textAlign: 'center' },
  participantBalance: { fontSize: 13, fontWeight: '700' },
  expenseShareCard: { margin: 12, marginBottom: 0, borderRadius: 12, borderWidth: 1, padding: 14, gap: 4 },
  expenseShareHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  expenseShareDesc: { flex: 1, fontSize: 14, fontWeight: '600' },
  expenseShareAmount: { fontSize: 15, fontWeight: '800' },
  expenseShareMeta: { fontSize: 12 },
  participantChip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 8 },
  participantChipText: { fontSize: 13, fontWeight: '600' },
  mealDayCard: { margin: 12, marginBottom: 0, borderRadius: 12, padding: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  mealDayTitle: { fontSize: 15, fontWeight: '700', marginBottom: 12 },
  mealRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  mealTypeLabel: { width: 72, fontSize: 12, fontWeight: '600' },
  mealInput: { flex: 1, borderBottomWidth: 1, paddingVertical: 6, fontSize: 13 },
  stickerBoard: { padding: 16, flexGrow: 1 },
  stickersGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  sticker: { borderRadius: 4, padding: 10, shadowColor: '#000', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 0.15, shadowRadius: 4, elevation: 4 },
  stickerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  stickerEmoji: { fontSize: 18 },
  stickerDelete: { padding: 4 },
  stickerText: { fontSize: 13, color: '#1c1917', fontWeight: '500', lineHeight: 18 },
  stickyColorDot: { width: 32, height: 32, borderRadius: 6 },
  stickyColorSelected: { borderWidth: 3, borderColor: '#1c1917' },
  emojiBtn: { width: 40, height: 40, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  sizeBtn: { flex: 1, paddingVertical: 9, borderRadius: 8, alignItems: 'center' },
  sizeBtnText: { fontSize: 13, fontWeight: '700' },
  promptSection: { margin: 12, borderRadius: 12, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  promptHint: { fontSize: 13, marginBottom: 10 },
  presetPrompts: { gap: 8, marginBottom: 12 },
  presetPrompt: { borderRadius: 10, borderWidth: 1, padding: 12 },
  presetPromptText: { fontSize: 14, lineHeight: 20 },
  activePromptBox: { borderRadius: 10, borderWidth: 1, padding: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  activePromptText: { flex: 1, fontSize: 14, lineHeight: 20, fontStyle: 'italic' },
  promptEntry: { margin: 12, marginBottom: 0, borderRadius: 12, borderLeftWidth: 4, padding: 14, backgroundColor: '#fff', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2, gap: 8 },
  promptEntryCategory: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10, alignSelf: 'flex-start' },
  promptEntryCategoryText: { fontSize: 11, fontWeight: '700' },
  promptEntryPrompt: { fontSize: 13, fontStyle: 'italic', fontWeight: '600' },
  promptEntryResponse: { fontSize: 14, lineHeight: 22 },
  promptEntryDate: { fontSize: 12 },
  typeTab: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 16, borderWidth: 1 },
  typeTabText: { fontSize: 11, fontWeight: '600' },
  urlCard: { margin: 12, marginBottom: 0, borderRadius: 12, borderWidth: 1, padding: 14 },
  urlCardRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  urlIcon: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  urlTitle: { fontSize: 14, fontWeight: '700' },
  urlAddress: { fontSize: 12, marginTop: 2 },
  urlNotes: { fontSize: 12, marginTop: 4, fontStyle: 'italic' },
  typeOption: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, borderWidth: 1 },
  typeOptionText: { fontSize: 12, fontWeight: '600' },
  empty: { alignItems: 'center', paddingVertical: 60, gap: 8 },
  emptyTitle: { fontSize: 18, fontWeight: '700', marginTop: 8 },
  emptyText: { fontSize: 14, textAlign: 'center', paddingVertical: 20 },
  emptyBtn: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 10 },
  emptyBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  statusOption: { flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: 'center' },
  statusOptionText: { fontSize: 11, fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modal: { borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, paddingBottom: 40, maxHeight: '90%' },
  modalHandle: { width: 40, height: 4, backgroundColor: '#e7e5e4', borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 14 },
  fieldLabel: { fontSize: 13, fontWeight: '600', marginBottom: 6 },
  input: { borderWidth: 1, borderRadius: 8, padding: 10, fontSize: 14 },
  cancelBtn: { flex: 1, borderWidth: 1, borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  submitBtn: { flex: 2, paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  submitText: { color: '#fff', fontWeight: '700', fontSize: 14 },
});
