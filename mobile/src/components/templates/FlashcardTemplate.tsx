import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, StyleSheet, ScrollView,
  TouchableOpacity, Animated, Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../hooks/useTheme';
import { Notebook, Page } from '../../types';

interface FlashcardTemplateProps {
  notebook: Notebook;
  pages: Page[];
  currentPage: Page | null;
  pageIndex: number;
  onPageChange: (index: number) => void;
}

interface Flashcard {
  id: string;
  front: string;
  back: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

const { width } = Dimensions.get('window');

export const FlashcardTemplate: React.FC<FlashcardTemplateProps> = ({ notebook }) => {
  const { colors, isDark } = useTheme();
  const themeColor = notebook.appearance?.themeColor || '#f59e0b';
  const flipAnim = useRef(new Animated.Value(0)).current;

  const [cards, setCards] = useState<Flashcard[]>([
    { id: '1', front: 'What is React Native?', back: 'A framework for building native apps using React', difficulty: 'easy' },
    { id: '2', front: 'What is JSX?', back: 'JavaScript XML syntax extension', difficulty: 'medium' },
  ]);
  const [mode, setMode] = useState<'edit' | 'study'>('edit');
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [newFront, setNewFront] = useState('');
  const [newBack, setNewBack] = useState('');
  const [newDifficulty, setNewDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');

  const flipCard = () => {
    Animated.spring(flipAnim, {
      toValue: isFlipped ? 0 : 1,
      friction: 8,
      tension: 10,
      useNativeDriver: true,
    }).start();
    setIsFlipped(!isFlipped);
  };

  const frontInterpolate = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });
  const backInterpolate = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['180deg', '360deg'],
  });

  const nextCard = () => {
    if (currentCardIndex < cards.length - 1) {
      setCurrentCardIndex((i) => i + 1);
      setIsFlipped(false);
      flipAnim.setValue(0);
    }
  };
  const prevCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex((i) => i - 1);
      setIsFlipped(false);
      flipAnim.setValue(0);
    }
  };

  const addCard = () => {
    if (newFront.trim() && newBack.trim()) {
      setCards((p) => [...p, {
        id: Date.now().toString(),
        front: newFront.trim(),
        back: newBack.trim(),
        difficulty: newDifficulty,
      }]);
      setNewFront('');
      setNewBack('');
    }
  };

  const DIFF_COLORS = { easy: '#10b981', medium: '#f59e0b', hard: '#ef4444' };

  const currentCard = cards[currentCardIndex];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: isDark ? '#0c0a09' : '#fffbeb' }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={[styles.header, { backgroundColor: themeColor }]}>
        <Text style={styles.headerTitle}>Flashcards</Text>
        <Text style={styles.headerSub}>{cards.length} cards</Text>
        <View style={styles.modeToggle}>
          {(['edit', 'study'] as const).map((m) => (
            <TouchableOpacity
              key={m}
              onPress={() => { setMode(m); setCurrentCardIndex(0); setIsFlipped(false); flipAnim.setValue(0); }}
              style={[styles.modeBtn, mode === m && { backgroundColor: 'rgba(255,255,255,0.3)' }]}
            >
              <Text style={styles.modeBtnText}>{m === 'edit' ? 'Edit Mode' : 'Study Mode'}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {mode === 'study' && currentCard ? (
        <View style={styles.studyContainer}>
          {/* Progress */}
          <Text style={[styles.progressText, { color: colors.mutedForeground }]}>
            {currentCardIndex + 1} / {cards.length}
          </Text>
          <View style={[styles.progressBar, { backgroundColor: isDark ? '#292524' : '#e7e5e4' }]}>
            <View style={[styles.progressFill, { width: `${((currentCardIndex + 1) / cards.length) * 100}%` as any, backgroundColor: themeColor }]} />
          </View>

          {/* Flip card */}
          <TouchableOpacity onPress={flipCard} activeOpacity={0.95} style={styles.cardWrapper}>
            <Animated.View style={[styles.cardFace, styles.cardFront, { transform: [{ rotateY: frontInterpolate }], backgroundColor: isDark ? '#1c1917' : '#fff', borderColor: colors.border }]}>
              <View style={[styles.cardLabel, { backgroundColor: `${themeColor}20` }]}>
                <Text style={[styles.cardLabelText, { color: themeColor }]}>FRONT</Text>
              </View>
              <Text style={[styles.cardText, { color: colors.foreground }]}>{currentCard.front}</Text>
              <Text style={[styles.tapHint, { color: colors.mutedForeground }]}>Tap to flip</Text>
            </Animated.View>
            <Animated.View style={[styles.cardFace, styles.cardBack, { transform: [{ rotateY: backInterpolate }], backgroundColor: `${themeColor}15`, borderColor: themeColor }]}>
              <View style={[styles.cardLabel, { backgroundColor: `${themeColor}30` }]}>
                <Text style={[styles.cardLabelText, { color: themeColor }]}>ANSWER</Text>
              </View>
              <Text style={[styles.cardText, { color: colors.foreground }]}>{currentCard.back}</Text>
            </Animated.View>
          </TouchableOpacity>

          {/* Difficulty buttons */}
          <View style={styles.diffRow}>
            {(['easy', 'medium', 'hard'] as const).map((d) => (
              <TouchableOpacity
                key={d}
                style={[styles.diffBtn, { backgroundColor: DIFF_COLORS[d] }]}
                onPress={nextCard}
              >
                <Text style={styles.diffBtnText}>{d.charAt(0).toUpperCase() + d.slice(1)}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Nav buttons */}
          <View style={styles.navRow}>
            <TouchableOpacity onPress={prevCard} disabled={currentCardIndex === 0}
              style={[styles.navBtn, { borderColor: colors.border, opacity: currentCardIndex === 0 ? 0.4 : 1 }]}>
              <Ionicons name="chevron-back" size={20} color={colors.foreground} />
            </TouchableOpacity>
            <TouchableOpacity onPress={nextCard} disabled={currentCardIndex === cards.length - 1}
              style={[styles.navBtn, { borderColor: colors.border, opacity: currentCardIndex === cards.length - 1 ? 0.4 : 1 }]}>
              <Ionicons name="chevron-forward" size={20} color={colors.foreground} />
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <>
          {/* Card list */}
          {cards.map((card, i) => (
            <View key={card.id} style={[styles.editCard, { backgroundColor: isDark ? '#1c1917' : '#fff', borderColor: colors.border }]}>
              <View style={styles.editCardHeader}>
                <Text style={[styles.editCardNum, { color: themeColor }]}>#{i + 1}</Text>
                <View style={[styles.diffBadge, { backgroundColor: `${DIFF_COLORS[card.difficulty]}20` }]}>
                  <Text style={[styles.diffBadgeText, { color: DIFF_COLORS[card.difficulty] }]}>{card.difficulty}</Text>
                </View>
                <TouchableOpacity onPress={() => setCards((p) => p.filter((c) => c.id !== card.id))}>
                  <Ionicons name="trash-outline" size={16} color="#9ca3af" />
                </TouchableOpacity>
              </View>
              <Text style={[styles.editCardFront, { color: colors.foreground }]}>Q: {card.front}</Text>
              <Text style={[styles.editCardBack, { color: colors.mutedForeground }]}>A: {card.back}</Text>
            </View>
          ))}

          {/* Add card */}
          <View style={[styles.addSection, { backgroundColor: isDark ? '#1c1917' : '#fff' }]}>
            <Text style={[styles.addTitle, { color: colors.foreground }]}>Add Flashcard</Text>
            <TextInput
              value={newFront}
              onChangeText={setNewFront}
              placeholder="Question (front)"
              placeholderTextColor={colors.mutedForeground}
              style={[styles.addInput, { color: colors.foreground, borderColor: colors.border }]}
            />
            <TextInput
              value={newBack}
              onChangeText={setNewBack}
              placeholder="Answer (back)"
              placeholderTextColor={colors.mutedForeground}
              style={[styles.addInput, { color: colors.foreground, borderColor: colors.border }]}
            />
            <View style={styles.diffSelectRow}>
              {(['easy', 'medium', 'hard'] as const).map((d) => (
                <TouchableOpacity
                  key={d}
                  onPress={() => setNewDifficulty(d)}
                  style={[styles.diffSelect, { backgroundColor: newDifficulty === d ? DIFF_COLORS[d] : `${DIFF_COLORS[d]}20`, borderColor: DIFF_COLORS[d] }]}>
                  <Text style={[styles.diffSelectText, { color: newDifficulty === d ? '#fff' : DIFF_COLORS[d] }]}>{d}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity onPress={addCard} style={[styles.submitBtn, { backgroundColor: themeColor }]}>
              <Ionicons name="add" size={18} color="#fff" />
              <Text style={styles.submitBtnText}>Add Card</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 20, alignItems: 'center', gap: 4 },
  headerTitle: { color: '#fff', fontSize: 22, fontWeight: '800' },
  headerSub: { color: 'rgba(255,255,255,0.7)', fontSize: 13 },
  modeToggle: { flexDirection: 'row', marginTop: 12, borderRadius: 10, overflow: 'hidden', gap: 2 },
  modeBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  modeBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  studyContainer: { padding: 16, alignItems: 'center' },
  progressText: { fontSize: 14, marginBottom: 8 },
  progressBar: { width: '100%', height: 6, borderRadius: 3, marginBottom: 20, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },
  cardWrapper: { width: width - 48, height: 200, marginBottom: 20 },
  cardFace: {
    position: 'absolute', width: '100%', height: '100%', borderRadius: 16,
    borderWidth: 1, justifyContent: 'center', alignItems: 'center', padding: 20,
    backfaceVisibility: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4,
  },
  cardFront: {},
  cardBack: {},
  cardLabel: { position: 'absolute', top: 10, left: 10, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  cardLabelText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  cardText: { fontSize: 18, fontWeight: '600', textAlign: 'center', lineHeight: 26 },
  tapHint: { position: 'absolute', bottom: 10, fontSize: 11 },
  diffRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  diffBtn: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 10 },
  diffBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  navRow: { flexDirection: 'row', gap: 12 },
  navBtn: { width: 48, height: 48, borderRadius: 24, borderWidth: 1.5, justifyContent: 'center', alignItems: 'center' },
  editCard: {
    margin: 12, marginBottom: 8, borderRadius: 12, borderWidth: 1, padding: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  editCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  editCardNum: { fontWeight: '800', fontSize: 14, flex: 1 },
  diffBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  diffBadgeText: { fontSize: 11, fontWeight: '700' },
  editCardFront: { fontSize: 14, fontWeight: '600', marginBottom: 4 },
  editCardBack: { fontSize: 13 },
  addSection: {
    margin: 12, borderRadius: 12, padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  addTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
  addInput: { borderWidth: 1, borderRadius: 8, padding: 10, fontSize: 14, marginBottom: 10 },
  diffSelectRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  diffSelect: { flex: 1, paddingVertical: 8, borderRadius: 8, borderWidth: 1.5, alignItems: 'center' },
  diffSelectText: { fontSize: 13, fontWeight: '600' },
  submitBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12, borderRadius: 10 },
  submitBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
