import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../hooks/useTheme';
import { SearchAPI } from '../../services/api';
import { LinearGradient } from 'expo-linear-gradient';

interface SearchResult {
  _id: string;
  title: string;
  type: 'notebook' | 'page';
  excerpt?: string;
  notebookId?: string;
  category?: string;
}

export default function SearchScreen() {
  const navigation = useNavigation();
  const { colors, isDark } = useTheme();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = useCallback(async () => {
    if (!query.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const res = await SearchAPI.search(query.trim());
      setResults(res.data.results || res.data || []);
    } catch (err) {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [query]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Search</Text>
      </View>

      {/* Search Bar */}
      <View style={[styles.searchBar, { backgroundColor: isDark ? '#1c1917' : '#f5f5f4', borderColor: colors.border }]}>
        <Ionicons name="search" size={18} color={colors.mutedForeground} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search notebooks, pages, content..."
          placeholderTextColor={colors.mutedForeground}
          style={[styles.searchInput, { color: colors.foreground }]}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
          autoFocus
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => { setQuery(''); setResults([]); setSearched(false); }}>
            <Ionicons name="close-circle" size={18} color={colors.mutedForeground} />
          </TouchableOpacity>
        )}
        <TouchableOpacity
          onPress={handleSearch}
          style={[styles.searchBtn, { backgroundColor: '#f59e0b' }]}
        >
          <Ionicons name="search" size={16} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* AI Search toggle */}
      <View style={[styles.searchTypeBanner, { backgroundColor: isDark ? '#1c1917' : '#fffbeb', borderColor: colors.border }]}>
        <LinearGradient colors={['#f59e0b', '#f97316']} style={styles.aiIcon}>
          <Ionicons name="flash" size={12} color="#fff" />
        </LinearGradient>
        <Text style={[styles.aiSearchText, { color: colors.foreground }]}>
          AI-powered semantic search enabled
        </Text>
      </View>

      {/* Results */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#f59e0b" />
          <Text style={[styles.loadingText, { color: colors.mutedForeground }]}>
            Searching...
          </Text>
        </View>
      ) : searched && results.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="search-outline" size={56} color={colors.mutedForeground} />
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No results found</Text>
          <Text style={[styles.emptySubtitle, { color: colors.mutedForeground }]}>
            Try different keywords or check spelling
          </Text>
        </View>
      ) : !searched ? (
        <View style={styles.suggestionsContainer}>
          <Text style={[styles.suggestionsTitle, { color: colors.foreground }]}>
            Search suggestions
          </Text>
          {[
            { icon: 'book-outline', text: 'Search by notebook title' },
            { icon: 'document-text-outline', text: 'Search in page content' },
            { icon: 'pricetag-outline', text: 'Search by tags' },
            { icon: 'flash-outline', text: 'AI semantic search' },
          ].map((s) => (
            <TouchableOpacity
              key={s.text}
              style={[styles.suggestionItem, { borderColor: colors.border }]}
              onPress={() => {}}
            >
              <Ionicons name={s.icon as keyof typeof Ionicons.glyphMap} size={18} color="#f59e0b" />
              <Text style={[styles.suggestionText, { color: colors.foreground }]}>{s.text}</Text>
            </TouchableOpacity>
          ))}
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.resultsList}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => {
                if (item.notebookId || item.type === 'notebook') {
                  (navigation as any).navigate('NotebookViewer', {
                    notebookId: item.notebookId || item._id,
                  });
                }
              }}
              style={[styles.resultCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              <View style={[styles.resultIcon, { backgroundColor: item.type === 'notebook' ? '#f59e0b20' : '#3b82f620' }]}>
                <Ionicons
                  name={item.type === 'notebook' ? 'book-outline' : 'document-text-outline'}
                  size={20}
                  color={item.type === 'notebook' ? '#f59e0b' : '#3b82f6'}
                />
              </View>
              <View style={styles.resultContent}>
                <View style={styles.resultHeader}>
                  <Text style={[styles.resultTitle, { color: colors.foreground }]} numberOfLines={1}>
                    {item.title}
                  </Text>
                  <View style={[styles.resultTypeBadge, { backgroundColor: item.type === 'notebook' ? '#f59e0b20' : '#3b82f620' }]}>
                    <Text style={[styles.resultTypeText, { color: item.type === 'notebook' ? '#f59e0b' : '#3b82f6' }]}>
                      {item.type}
                    </Text>
                  </View>
                </View>
                {item.excerpt && (
                  <Text style={[styles.resultExcerpt, { color: colors.mutedForeground }]} numberOfLines={2}>
                    {item.excerpt}
                  </Text>
                )}
                {item.category && (
                  <Text style={[styles.resultCategory, { color: colors.mutedForeground }]}>
                    {item.category}
                  </Text>
                )}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 56,
    paddingBottom: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    gap: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 4,
  },
  searchBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchTypeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  aiIcon: {
    width: 22,
    height: 22,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  aiSearchText: {
    fontSize: 13,
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  suggestionsContainer: {
    padding: 16,
    gap: 8,
  },
  suggestionsTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 8,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
  },
  suggestionText: {
    fontSize: 14,
  },
  resultsList: {
    padding: 16,
    gap: 10,
  },
  resultCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: 10,
    borderWidth: 1,
    padding: 12,
    gap: 12,
    marginBottom: 10,
  },
  resultIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultContent: {
    flex: 1,
    gap: 4,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  resultTitle: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  resultTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  resultTypeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  resultExcerpt: {
    fontSize: 12,
    lineHeight: 18,
  },
  resultCategory: {
    fontSize: 11,
  },
});
