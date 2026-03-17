import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../hooks/useTheme';
import { NotebooksAPI } from '../../services/api';
import { Notebook } from '../../types';

export default function SharedNotebooksScreen() {
  const navigation = useNavigation();
  const { colors, isDark } = useTheme();
  const [sharedWithMe, setSharedWithMe] = useState<Notebook[]>([]);
  const [sharedByMe, setSharedByMe] = useState<Notebook[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'with-me' | 'by-me'>('with-me');

  useEffect(() => {
    loadShared();
  }, []);

  const loadShared = async () => {
    try {
      const [withMeRes, byMeRes] = await Promise.all([
        NotebooksAPI.shared(),
        NotebooksAPI.sharedByMe(),
      ]);
      setSharedWithMe(withMeRes.data.notebooks || []);
      setSharedByMe(byMeRes.data.notebooks || []);
    } catch {
      setSharedWithMe([]);
      setSharedByMe([]);
    } finally {
      setLoading(false);
    }
  };

  const data = tab === 'with-me' ? sharedWithMe : sharedByMe;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Shared Notebooks</Text>
      </View>

      <View style={[styles.tabs, { backgroundColor: isDark ? '#1c1917' : '#f5f5f4' }]}>
        {(['with-me', 'by-me'] as const).map((t) => (
          <TouchableOpacity
            key={t}
            onPress={() => setTab(t)}
            style={[styles.tab, tab === t && { backgroundColor: '#f59e0b' }]}
          >
            <Text style={[styles.tabText, { color: tab === t ? '#fff' : colors.foreground }]}>
              {t === 'with-me' ? `Shared with Me (${sharedWithMe.length})` : `Shared by Me (${sharedByMe.length})`}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.loading}><ActivityIndicator size="large" color="#f59e0b" /></View>
      ) : data.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="share-social-outline" size={64} color={colors.mutedForeground} />
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
            {tab === 'with-me' ? 'No notebooks shared with you' : "You haven't shared any notebooks"}
          </Text>
        </View>
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => (navigation as any).navigate('NotebookViewer', { notebookId: item._id })}
              style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              <LinearGradient
                colors={[item.appearance?.themeColor || '#f59e0b', `${item.appearance?.themeColor || '#f59e0b'}88`]}
                style={styles.cardIcon}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name="book" size={20} color="#fff" />
              </LinearGradient>
              <View style={styles.cardInfo}>
                <Text style={[styles.cardTitle, { color: colors.foreground }]}>{item.title}</Text>
                <Text style={[styles.cardMeta, { color: colors.mutedForeground }]}>
                  {item.category} • {item.pageCount} pages
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.mutedForeground} />
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingTop: 56, paddingBottom: 12, paddingHorizontal: 16, borderBottomWidth: 1, gap: 12 },
  backBtn: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  tabs: { flexDirection: 'row', margin: 16, borderRadius: 10, padding: 4, gap: 4 },
  tab: { flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: 'center' },
  tabText: { fontSize: 11, fontWeight: '600' },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40, gap: 8 },
  emptyTitle: { fontSize: 16, fontWeight: '600', textAlign: 'center', marginTop: 16 },
  list: { padding: 16, gap: 10 },
  card: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, borderWidth: 1, padding: 12, gap: 12 },
  cardIcon: { width: 44, height: 44, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  cardInfo: { flex: 1 },
  cardTitle: { fontSize: 15, fontWeight: '600' },
  cardMeta: { fontSize: 12, marginTop: 2 },
});
