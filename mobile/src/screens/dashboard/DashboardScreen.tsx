import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  ScrollView,
  Alert,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useUser } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { NotebookCard } from '../../components/NotebookCard';
import { useNotebookStore } from '../../store/notebookStore';
import { NotebooksAPI } from '../../services/api';
import { Notebook } from '../../types';
import { DashboardStackParamList } from '../../navigation/types';

const { width } = Dimensions.get('window');
const CATEGORIES = ['All', 'Personal', 'Work', 'School', 'Research'];

type DashboardNavProp = NativeStackNavigationProp<DashboardStackParamList, 'DashboardHome'>;

export default function DashboardScreen() {
  const navigation = useNavigation<DashboardNavProp>();
  const { colors, isDark } = useTheme();
  const { user } = useUser();
  const { notebooks, setNotebooks, removeNotebook, isLoading, setLoading } = useNotebookStore();
  const [activeCategory, setActiveCategory] = useState('All');
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotebooks = useCallback(async () => {
    try {
      setLoading(true);
      const params = activeCategory !== 'All' ? { category: activeCategory } : {};
      const res = await NotebooksAPI.list(params);
      setNotebooks(res.data.notebooks || res.data || []);
    } catch (err) {
      console.log('Failed to load notebooks', err);
      // Set mock data for demo if API is not connected
      setNotebooks([]);
    } finally {
      setLoading(false);
    }
  }, [activeCategory]);

  useEffect(() => {
    fetchNotebooks();
  }, [activeCategory]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchNotebooks();
    setRefreshing(false);
  };

  const handleDeleteNotebook = (notebookId: string, title: string) => {
    Alert.alert(
      'Move to Trash',
      `Move "${title}" to trash?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Move to Trash',
          style: 'destructive',
          onPress: async () => {
            try {
              await NotebooksAPI.delete(notebookId);
              removeNotebook(notebookId);
            } catch (err) {
              Alert.alert('Error', 'Could not delete notebook');
            }
          },
        },
      ]
    );
  };

  const filteredNotebooks = activeCategory === 'All'
    ? notebooks
    : notebooks.filter((n) => n.category === activeCategory);

  const firstName = user?.firstName || 'there';

  const renderHeader = () => (
    <View>
      {/* Top Bar */}
      <View
        style={[
          styles.topBar,
          {
            backgroundColor: isDark ? 'rgba(12,10,9,0.95)' : 'rgba(255,255,255,0.95)',
            borderBottomColor: colors.border,
          },
        ]}
      >
        <View style={styles.topBarLeft}>
          <LinearGradient
            colors={['#f59e0b', '#f97316']}
            style={styles.logoMini}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name="book" size={18} color="#fff" />
          </LinearGradient>
          <Text style={[styles.appTitle, { color: colors.foreground }]}>SmartNote</Text>
          <Text style={[styles.appTitleAI, { color: '#f59e0b' }]}> AI</Text>
        </View>

        <View style={styles.topBarRight}>
          <TouchableOpacity
            onPress={() => navigation.navigate('Search')}
            style={styles.iconButton}
          >
            <Ionicons name="search" size={22} color={colors.foreground} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate('Notifications')}
            style={styles.iconButton}
          >
            <Ionicons name="notifications-outline" size={22} color={colors.foreground} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => (navigation as any).navigate('AccountTab')}
            style={styles.avatarButton}
          >
            <LinearGradient colors={['#f59e0b', '#f97316']} style={styles.avatarGradient}>
              <Text style={styles.avatarText}>{(user?.firstName || 'U')[0].toUpperCase()}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>

      {/* Greeting + Stats */}
      <LinearGradient
        colors={isDark ? ['#1c1917', '#0c0a09'] : ['#fffbeb', '#fff7ed']}
        style={styles.greetingSection}
      >
        <View>
          <Text style={[styles.greeting, { color: colors.mutedForeground }]}>
            Good {getGreeting()},
          </Text>
          <Text style={[styles.greetingName, { color: colors.foreground }]}>
            {firstName}! 👋
          </Text>
        </View>
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: isDark ? '#292524' : '#fff' }]}>
            <Text style={[styles.statNum, { color: '#f59e0b' }]}>{notebooks.length}</Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Notebooks</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: isDark ? '#292524' : '#fff' }]}>
            <Text style={[styles.statNum, { color: '#10b981' }]}>
              {notebooks.reduce((a, n) => a + (n.pageCount || 0), 0)}
            </Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Pages</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Quick Actions */}
      <View style={[styles.quickActions, { backgroundColor: colors.background }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickActionsScroll}>
          {[
            { icon: 'add-circle', label: 'New Notebook', color: '#f59e0b', onPress: () => navigation.navigate('CreateNotebook') },
            { icon: 'analytics', label: 'Analytics', color: '#8b5cf6', onPress: () => navigation.navigate('Analytics') },
            { icon: 'people', label: 'Workspaces', color: '#3b82f6', onPress: () => navigation.navigate('Workspaces') },
            { icon: 'trash', label: 'Trash', color: '#ef4444', onPress: () => navigation.navigate('Trash') },
            { icon: 'share-social', label: 'Shared', color: '#10b981', onPress: () => navigation.navigate('SharedNotebooks') },
            { icon: 'chatbubbles', label: 'AI Chat', color: '#a855f7', onPress: () => navigation.navigate('AIChat', {}) },
            { icon: 'storefront', label: 'Marketplace', color: '#06b6d4', onPress: () => navigation.navigate('Marketplace') },
          ].map((action) => (
            <TouchableOpacity
              key={action.label}
              style={styles.quickAction}
              onPress={action.onPress}
              activeOpacity={0.8}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: `${action.color}20` }]}>
                <Ionicons name={action.icon as keyof typeof Ionicons.glyphMap} size={22} color={action.color} />
              </View>
              <Text style={[styles.quickActionLabel, { color: colors.mutedForeground }]}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Category Filters */}
      <View style={[styles.categorySection, { backgroundColor: colors.background }]}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
          My Notebooks
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              onPress={() => setActiveCategory(cat)}
              style={[
                styles.categoryChip,
                {
                  backgroundColor: activeCategory === cat ? '#f59e0b' : (isDark ? '#292524' : '#f5f5f4'),
                  borderColor: activeCategory === cat ? '#f59e0b' : colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  { color: activeCategory === cat ? '#fff' : colors.foreground },
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );

  if (isLoading && notebooks.length === 0) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        {renderHeader()}
        <View style={styles.loadingCenter}>
          <ActivityIndicator size="large" color="#f59e0b" />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={filteredNotebooks}
        keyExtractor={(item) => item._id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={renderHeader}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#f59e0b" />
        }
        renderItem={({ item }) => (
          <NotebookCard
            notebook={item}
            onPress={() => navigation.navigate('NotebookViewer', { notebookId: item._id })}
            onEdit={() => navigation.navigate('EditNotebook', { notebookId: item._id })}
            onShare={() => {/* Handle share */}}
            onDelete={() => handleDeleteNotebook(item._id, item.title)}
          />
        )}
        ListEmptyComponent={() => (
          <View style={styles.emptyState}>
            <Ionicons name="book-outline" size={64} color={colors.mutedForeground} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
              No notebooks yet
            </Text>
            <Text style={[styles.emptySubtitle, { color: colors.mutedForeground }]}>
              Create your first notebook to get started
            </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('CreateNotebook')}
              style={styles.emptyButton}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={['#f59e0b', '#f97316']}
                style={styles.emptyButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.emptyButtonText}>Create Notebook</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}
      />

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('CreateNotebook')}
        activeOpacity={0.9}
      >
        <LinearGradient
          colors={['#f59e0b', '#f97316']}
          style={styles.fabGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Ionicons name="add" size={28} color="#fff" />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1 },
  loadingCenter: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 60 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 52,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  topBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoMini: {
    width: 34,
    height: 34,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  appTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  appTitleAI: {
    fontSize: 18,
    fontWeight: '700',
  },
  topBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarButton: {
    marginLeft: 4,
  },
  avatarGradient: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  greetingSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingHorizontal: 20,
  },
  greeting: {
    fontSize: 14,
  },
  greetingName: {
    fontSize: 22,
    fontWeight: '700',
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statCard: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statNum: {
    fontSize: 20,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 11,
    marginTop: 2,
  },
  quickActions: {
    paddingTop: 4,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#00000010',
  },
  quickActionsScroll: {
    paddingHorizontal: 16,
    gap: 8,
    flexDirection: 'row',
  },
  quickAction: {
    alignItems: 'center',
    gap: 4,
    minWidth: 60,
    paddingVertical: 8,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickActionLabel: {
    fontSize: 10,
    textAlign: 'center',
    fontWeight: '500',
  },
  categorySection: {
    padding: 16,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  categoryScroll: {
    flexDirection: 'row',
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: '500',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  row: {
    justifyContent: 'space-between',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  emptyButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  emptyButtonGradient: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  emptyButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    borderRadius: 28,
    shadowColor: '#f59e0b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  fabGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
