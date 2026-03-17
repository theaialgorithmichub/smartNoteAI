import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { format } from 'date-fns';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../hooks/useTheme';
import { NotebooksAPI } from '../../services/api';
import { Notebook } from '../../types';

export default function TrashScreen() {
  const navigation = useNavigation();
  const { colors, isDark } = useTheme();
  const [notebooks, setNotebooks] = useState<Notebook[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTrash();
  }, []);

  const loadTrash = async () => {
    try {
      setLoading(true);
      const res = await NotebooksAPI.trash();
      setNotebooks(res.data.notebooks || res.data || []);
    } catch {
      setNotebooks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (notebook: Notebook) => {
    Alert.alert(
      'Restore Notebook',
      `Restore "${notebook.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Restore',
          onPress: async () => {
            try {
              await NotebooksAPI.restore(notebook._id);
              setNotebooks((prev) => prev.filter((n) => n._id !== notebook._id));
            } catch {
              Alert.alert('Error', 'Could not restore notebook');
            }
          },
        },
      ]
    );
  };

  const handlePermanentDelete = async (notebook: Notebook) => {
    Alert.alert(
      'Permanently Delete',
      `This will permanently delete "${notebook.title}". This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Forever',
          style: 'destructive',
          onPress: async () => {
            try {
              await NotebooksAPI.permanentDelete(notebook._id);
              setNotebooks((prev) => prev.filter((n) => n._id !== notebook._id));
            } catch {
              Alert.alert('Error', 'Could not delete notebook');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <View>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>Trash</Text>
          <Text style={[styles.headerSub, { color: colors.mutedForeground }]}>
            Notebooks auto-delete after 30 days
          </Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="#f59e0b" />
        </View>
      ) : notebooks.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="trash-outline" size={72} color={colors.mutedForeground} />
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>Trash is empty</Text>
          <Text style={[styles.emptySubtitle, { color: colors.mutedForeground }]}>
            Deleted notebooks will appear here
          </Text>
        </View>
      ) : (
        <FlatList
          data={notebooks}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View
              style={[
                styles.notebookItem,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <LinearGradient
                colors={[item.appearance?.themeColor || '#ef4444', `${item.appearance?.themeColor || '#ef4444'}88`]}
                style={styles.notebookIcon}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name="book" size={20} color="#fff" />
              </LinearGradient>

              <View style={styles.notebookInfo}>
                <Text style={[styles.notebookTitle, { color: colors.foreground }]} numberOfLines={1}>
                  {item.title}
                </Text>
                <Text style={[styles.notebookMeta, { color: colors.mutedForeground }]}>
                  {item.category} • Deleted {item.trashedAt ? format(new Date(item.trashedAt), 'MMM d') : 'recently'}
                </Text>
              </View>

              <View style={styles.actions}>
                <TouchableOpacity
                  onPress={() => handleRestore(item)}
                  style={[styles.actionBtn, { backgroundColor: '#10b98120', borderColor: '#10b981' }]}
                >
                  <Ionicons name="refresh" size={16} color="#10b981" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handlePermanentDelete(item)}
                  style={[styles.actionBtn, { backgroundColor: '#ef444420', borderColor: '#ef4444' }]}
                >
                  <Ionicons name="trash" size={16} color="#ef4444" />
                </TouchableOpacity>
              </View>
            </View>
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
  headerSub: {
    fontSize: 12,
    marginTop: 2,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
  list: {
    padding: 16,
    gap: 10,
  },
  notebookItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    gap: 12,
  },
  notebookIcon: {
    width: 48,
    height: 48,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notebookInfo: {
    flex: 1,
  },
  notebookTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  notebookMeta: {
    fontSize: 12,
    marginTop: 3,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    width: 34,
    height: 34,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
