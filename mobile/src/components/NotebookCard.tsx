import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { Notebook } from '../types';
import { format } from 'date-fns';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

interface NotebookCardProps {
  notebook: Notebook;
  onPress: () => void;
  onLongPress?: () => void;
  onShare?: () => void;
  onDelete?: () => void;
  onEdit?: () => void;
}

const getCategoryColor = (category: string): [string, string] => {
  const colors: Record<string, [string, string]> = {
    Personal: ['#3b82f6', '#2563eb'],
    Work: ['#8b5cf6', '#7c3aed'],
    School: ['#10b981', '#059669'],
    Research: ['#f59e0b', '#d97706'],
  };
  return colors[category] || ['#6366f1', '#4f46e5'];
};

const getThemeGradient = (themeColor: string): [string, string] => {
  return [themeColor, adjustColor(themeColor, -30)];
};

const adjustColor = (hex: string, amount: number): string => {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, Math.max(0, (num >> 16) + amount));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + amount));
  const b = Math.min(255, Math.max(0, (num & 0x0000ff) + amount));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
};

export const NotebookCard: React.FC<NotebookCardProps> = ({
  notebook,
  onPress,
  onLongPress,
  onShare,
  onDelete,
  onEdit,
}) => {
  const { colors, isDark } = useTheme();
  const themeColor = notebook.appearance?.themeColor || '#8B4513';
  const gradientColors = getThemeGradient(themeColor);
  const categoryColors = getCategoryColor(notebook.category);

  return (
    <TouchableOpacity
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.9}
      style={[styles.card, { width: CARD_WIDTH }]}
    >
      {/* Cover */}
      <View style={styles.cover}>
        {notebook.appearance?.coverImageUrl ? (
          <Image
            source={{ uri: notebook.appearance.coverImageUrl }}
            style={styles.coverImage}
          />
        ) : (
          <LinearGradient
            colors={gradientColors}
            style={styles.coverGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            {/* Spine effect */}
            <View style={[styles.spine, { backgroundColor: 'rgba(0,0,0,0.2)' }]} />
            {/* Notebook lines decoration */}
            <View style={styles.notebookLines}>
              {[0, 1, 2, 3].map((i) => (
                <View
                  key={i}
                  style={[styles.notebookLine, { backgroundColor: 'rgba(255,255,255,0.2)' }]}
                />
              ))}
            </View>
            {/* Book icon */}
            <View style={styles.bookIconContainer}>
              <Ionicons name="book" size={28} color="rgba(255,255,255,0.6)" />
            </View>
          </LinearGradient>
        )}

        {/* Category Badge */}
        <LinearGradient
          colors={categoryColors}
          style={styles.badge}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Text style={styles.badgeText}>{notebook.category}</Text>
        </LinearGradient>

        {/* Action buttons */}
        {(onShare || onDelete || onEdit) && (
          <View style={styles.actions}>
            {onEdit && (
              <TouchableOpacity onPress={onEdit} style={styles.actionBtn}>
                <Ionicons name="pencil" size={14} color="#fff" />
              </TouchableOpacity>
            )}
            {onShare && (
              <TouchableOpacity onPress={onShare} style={styles.actionBtn}>
                <Ionicons name="share-outline" size={14} color="#fff" />
              </TouchableOpacity>
            )}
            {onDelete && (
              <TouchableOpacity onPress={onDelete} style={styles.actionBtn}>
                <Ionicons name="trash-outline" size={14} color="#fff" />
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      {/* Info */}
      <View
        style={[
          styles.info,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <Text
          style={[styles.title, { color: colors.foreground }]}
          numberOfLines={2}
        >
          {notebook.title}
        </Text>
        <View style={styles.meta}>
          <Text style={[styles.metaText, { color: colors.mutedForeground }]}>
            {notebook.pageCount || 0} pages
          </Text>
          <Text style={[styles.metaText, { color: colors.mutedForeground }]}>
            {format(new Date(notebook.updatedAt), 'MMM d')}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    marginBottom: 16,
  },
  cover: {
    height: 140,
    position: 'relative',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  coverGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  spine: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 10,
  },
  notebookLines: {
    position: 'absolute',
    right: 8,
    top: 8,
    bottom: 8,
    width: 2,
    justifyContent: 'space-between',
  },
  notebookLine: {
    height: 20,
    width: 2,
    borderRadius: 1,
  },
  bookIconContainer: {
    opacity: 0.8,
  },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  actions: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    flexDirection: 'row',
    gap: 4,
  },
  actionBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  info: {
    padding: 10,
    borderTopWidth: 0,
    borderWidth: 1,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
  },
  title: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
    lineHeight: 18,
  },
  meta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metaText: {
    fontSize: 11,
  },
});
