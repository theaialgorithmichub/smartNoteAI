import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../hooks/useTheme';
import { NotificationsAPI } from '../../services/api';
import { Notification } from '../../types';

const getNotificationIcon = (type: string): { icon: keyof typeof Ionicons.glyphMap; color: string } => {
  const map: Record<string, { icon: keyof typeof Ionicons.glyphMap; color: string }> = {
    friend_request: { icon: 'person-add', color: '#3b82f6' },
    friend_accepted: { icon: 'people', color: '#10b981' },
    notebook_shared: { icon: 'share-social', color: '#f59e0b' },
    comment: { icon: 'chatbubble', color: '#8b5cf6' },
    mention: { icon: 'at', color: '#ec4899' },
  };
  return map[type] || { icon: 'notifications', color: '#6b7280' };
};

export default function NotificationsScreen() {
  const navigation = useNavigation();
  const { colors, isDark } = useTheme();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const res = await NotificationsAPI.list();
      setNotifications(res.data.notifications || []);
    } catch {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await NotificationsAPI.readAll();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch {}
  };

  const handleMarkRead = async (id: string) => {
    try {
      await NotificationsAPI.read(id);
      setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, read: true } : n)));
    } catch {}
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <View>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>Notifications</Text>
          {unreadCount > 0 && (
            <Text style={[styles.unreadCount, { color: colors.mutedForeground }]}>
              {unreadCount} unread
            </Text>
          )}
        </View>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={handleMarkAllRead} style={styles.markAllBtn}>
            <Text style={[styles.markAllText, { color: '#f59e0b' }]}>Mark all read</Text>
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <View style={styles.loading}><ActivityIndicator size="large" color="#f59e0b" /></View>
      ) : notifications.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="notifications-outline" size={64} color={colors.mutedForeground} />
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No notifications</Text>
          <Text style={[styles.emptySubtitle, { color: colors.mutedForeground }]}>
            You're all caught up!
          </Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => {
            const { icon, color } = getNotificationIcon(item.type);
            return (
              <TouchableOpacity
                onPress={() => handleMarkRead(item._id)}
                style={[
                  styles.notifCard,
                  {
                    backgroundColor: item.read ? colors.card : (isDark ? '#1c1917' : '#fffbeb'),
                    borderColor: item.read ? colors.border : `${color}40`,
                  },
                ]}
              >
                <View style={[styles.notifIcon, { backgroundColor: `${color}20` }]}>
                  <Ionicons name={icon} size={20} color={color} />
                </View>
                <View style={styles.notifContent}>
                  <Text style={[styles.notifTitle, { color: colors.foreground }]}>{item.title}</Text>
                  <Text style={[styles.notifMessage, { color: colors.mutedForeground }]} numberOfLines={2}>
                    {item.message}
                  </Text>
                  <Text style={[styles.notifTime, { color: colors.mutedForeground }]}>
                    {format(new Date(item.createdAt), 'MMM d, h:mm a')}
                  </Text>
                </View>
                {!item.read && <View style={[styles.unreadDot, { backgroundColor: color }]} />}
              </TouchableOpacity>
            );
          }}
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
  unreadCount: { fontSize: 12, marginTop: 1 },
  markAllBtn: { marginLeft: 'auto' as any },
  markAllText: { fontSize: 13, fontWeight: '600' },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40, gap: 8 },
  emptyTitle: { fontSize: 20, fontWeight: '700', marginTop: 16 },
  emptySubtitle: { fontSize: 14, textAlign: 'center' },
  list: { padding: 16, gap: 10 },
  notifCard: { flexDirection: 'row', alignItems: 'flex-start', borderRadius: 12, borderWidth: 1, padding: 12, gap: 12 },
  notifIcon: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  notifContent: { flex: 1, gap: 2 },
  notifTitle: { fontSize: 14, fontWeight: '600' },
  notifMessage: { fontSize: 13, lineHeight: 18 },
  notifTime: { fontSize: 11, marginTop: 4 },
  unreadDot: { width: 10, height: 10, borderRadius: 5, marginTop: 4 },
});
