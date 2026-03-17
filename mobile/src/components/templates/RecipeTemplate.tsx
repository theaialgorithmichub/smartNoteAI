import React, { useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../hooks/useTheme';
import { Notebook, Page } from '../../types';

interface RecipeTemplateProps {
  notebook: Notebook;
  pages: Page[];
  currentPage: Page | null;
  pageIndex: number;
  onPageChange: (index: number) => void;
}

export const RecipeTemplate: React.FC<RecipeTemplateProps> = ({ notebook }) => {
  const { colors, isDark } = useTheme();
  const themeColor = notebook.appearance?.themeColor || '#f97316';

  const [recipeName, setRecipeName] = useState('');
  const [cookTime, setCookTime] = useState('');
  const [servings, setServings] = useState('');
  const [ingredients, setIngredients] = useState<string[]>(['']);
  const [steps, setSteps] = useState<string[]>(['']);
  const [notes, setNotes] = useState('');

  const addIngredient = () => setIngredients((p) => [...p, '']);
  const addStep = () => setSteps((p) => [...p, '']);

  const updateIngredient = (i: number, v: string) => {
    const updated = [...ingredients];
    updated[i] = v;
    setIngredients(updated);
  };

  const updateStep = (i: number, v: string) => {
    const updated = [...steps];
    updated[i] = v;
    setSteps(updated);
  };

  const removeIngredient = (i: number) =>
    setIngredients((p) => p.filter((_, j) => j !== i));
  const removeStep = (i: number) =>
    setSteps((p) => p.filter((_, j) => j !== i));

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: isDark ? '#0c0a09' : '#fff7ed' }]}
      showsVerticalScrollIndicator={false}
    >
      <LinearGradient colors={[themeColor, `${themeColor}99`]} style={styles.header}>
        <Text style={{ fontSize: 28 }}>🍳</Text>
        <TextInput
          value={recipeName}
          onChangeText={setRecipeName}
          placeholder="Recipe Name"
          placeholderTextColor="rgba(255,255,255,0.6)"
          style={styles.recipeTitle}
        />
      </LinearGradient>

      {/* Meta info */}
      <View style={[styles.metaRow, { backgroundColor: isDark ? '#1c1917' : '#fff' }]}>
        {[
          { icon: '⏱️', label: 'Cook Time', value: cookTime, onChange: setCookTime, placeholder: '30 min' },
          { icon: '🍽️', label: 'Servings', value: servings, onChange: setServings, placeholder: '4' },
        ].map((m) => (
          <View key={m.label} style={styles.metaCard}>
            <Text style={styles.metaIcon}>{m.icon}</Text>
            <Text style={[styles.metaLabel, { color: colors.mutedForeground }]}>{m.label}</Text>
            <TextInput
              value={m.value}
              onChangeText={m.onChange}
              placeholder={m.placeholder}
              placeholderTextColor={colors.mutedForeground}
              style={[styles.metaInput, { color: colors.foreground, borderColor: colors.border }]}
              textAlign="center"
            />
          </View>
        ))}
      </View>

      {/* Ingredients */}
      <View style={[styles.section, { backgroundColor: isDark ? '#1c1917' : '#fff' }]}>
        <View style={styles.sectionHeader}>
          <Text style={{ fontSize: 18 }}>🧂</Text>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Ingredients</Text>
        </View>
        {ingredients.map((ing, i) => (
          <View key={i} style={styles.listItem}>
            <View style={[styles.bullet, { backgroundColor: themeColor }]} />
            <TextInput
              value={ing}
              onChangeText={(v) => updateIngredient(i, v)}
              placeholder={`Ingredient ${i + 1}`}
              placeholderTextColor={colors.mutedForeground}
              style={[styles.listInput, { color: colors.foreground, borderColor: colors.border }]}
            />
            {ingredients.length > 1 && (
              <TouchableOpacity onPress={() => removeIngredient(i)}>
                <Ionicons name="close" size={16} color="#9ca3af" />
              </TouchableOpacity>
            )}
          </View>
        ))}
        <TouchableOpacity onPress={addIngredient} style={[styles.addBtn, { borderColor: themeColor }]}>
          <Ionicons name="add" size={16} color={themeColor} />
          <Text style={[styles.addBtnText, { color: themeColor }]}>Add Ingredient</Text>
        </TouchableOpacity>
      </View>

      {/* Steps */}
      <View style={[styles.section, { backgroundColor: isDark ? '#1c1917' : '#fff' }]}>
        <View style={styles.sectionHeader}>
          <Text style={{ fontSize: 18 }}>📋</Text>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Instructions</Text>
        </View>
        {steps.map((step, i) => (
          <View key={i} style={styles.stepItem}>
            <View style={[styles.stepNumber, { backgroundColor: themeColor }]}>
              <Text style={styles.stepNumberText}>{i + 1}</Text>
            </View>
            <TextInput
              value={step}
              onChangeText={(v) => updateStep(i, v)}
              placeholder={`Step ${i + 1}...`}
              placeholderTextColor={colors.mutedForeground}
              multiline
              style={[styles.stepInput, { color: colors.foreground, borderColor: colors.border }]}
              textAlignVertical="top"
            />
            {steps.length > 1 && (
              <TouchableOpacity onPress={() => removeStep(i)}>
                <Ionicons name="close" size={16} color="#9ca3af" />
              </TouchableOpacity>
            )}
          </View>
        ))}
        <TouchableOpacity onPress={addStep} style={[styles.addBtn, { borderColor: themeColor }]}>
          <Ionicons name="add" size={16} color={themeColor} />
          <Text style={[styles.addBtnText, { color: themeColor }]}>Add Step</Text>
        </TouchableOpacity>
      </View>

      {/* Notes */}
      <View style={[styles.section, { backgroundColor: isDark ? '#1c1917' : '#fff' }]}>
        <View style={styles.sectionHeader}>
          <Text style={{ fontSize: 18 }}>💡</Text>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Chef's Notes</Text>
        </View>
        <TextInput
          value={notes}
          onChangeText={setNotes}
          placeholder="Tips, substitutions, variations..."
          placeholderTextColor={colors.mutedForeground}
          multiline
          style={[styles.notesInput, { color: colors.foreground, borderColor: colors.border }]}
          textAlignVertical="top"
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 24, alignItems: 'center', gap: 8 },
  recipeTitle: {
    color: '#fff', fontSize: 22, fontWeight: '800', textAlign: 'center', width: '100%',
  },
  metaRow: {
    flexDirection: 'row', margin: 12, borderRadius: 12, padding: 16, gap: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  metaCard: { flex: 1, alignItems: 'center', gap: 4 },
  metaIcon: { fontSize: 20 },
  metaLabel: { fontSize: 11, fontWeight: '600' },
  metaInput: {
    borderBottomWidth: 1, paddingVertical: 4, fontSize: 16, fontWeight: '700', width: '100%',
  },
  section: {
    margin: 12, borderRadius: 12, padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '700' },
  listItem: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  bullet: { width: 8, height: 8, borderRadius: 4 },
  listInput: { flex: 1, borderBottomWidth: 1, paddingVertical: 6, fontSize: 14 },
  stepItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 12 },
  stepNumber: {
    width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginTop: 4,
  },
  stepNumberText: { color: '#fff', fontSize: 12, fontWeight: '800' },
  stepInput: { flex: 1, borderWidth: 1, borderRadius: 8, padding: 8, fontSize: 14, minHeight: 56 },
  addBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    paddingVertical: 10, borderRadius: 8, borderWidth: 1.5, borderStyle: 'dashed', marginTop: 4,
  },
  addBtnText: { fontSize: 13, fontWeight: '600' },
  notesInput: { borderWidth: 1, borderRadius: 8, padding: 10, fontSize: 14, minHeight: 80 },
});
