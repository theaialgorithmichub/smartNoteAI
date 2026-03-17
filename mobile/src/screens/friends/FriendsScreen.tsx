import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Alert, ActivityIndicator, TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../hooks/useTheme';
import { FriendsAPI } from '../../services/api';

interface FriendUser {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface FriendRequest {
  _id: string;
  from: FriendUser;
  status: string;
}

export default function FriendsScreen() {
  const navigation = useNavigation();
  const { colors, isDark } = useTheme();
  const [friends, setFriends] = useState<FriendUser[]>([]);
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [searchResults, setSearchResults] = useState<FriendUser[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'friends' | 'requests' | 'search'>('friends');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [friendsRes, requestsRes] = await Promise.all([
        FriendsAPI.list(),
        FriendsAPI.requests(),
      ]);
      setFriends(friendsRes.data.friends || []);
      setRequests(requestsRes.data.requests || []);
    } catch {
      setFriends([]);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    try {
      const res = await FriendsAPI.search(searchQuery);
      setSearchResults(res.data.users || []);
    } catch {
      setSearchResults([]);
    }
  };

  const handleSendRequest = async (userId: string) => {
    try {
      await FriendsAPI.sendRequest(userId);
      Alert.alert('Request Sent', 'Friend request sent successfully');
    } catch {
      Alert.alert('Error', 'Could not send friend request');
    }
  };

  const handleAccept = async (requestId: string) => {
    try {
      await FriendsAPI.accept(requestId);
      setRequests((prev) => prev.filter((r) => r._id !== requestId));
      loadData();
    } catch {
      Alert.alert('Error', 'Could not accept request');
    }
  };

  const handleReject = async (requestId: string) => {
    try {
      await FriendsAPI.reject(requestId);
      setRequests((prev) => prev.filter((r) => r._id !== requestId));
    } catch {}
  };

  const getInitials = (name: string) => name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

  const AvatarPlaceholder = ({ name, color }: { name: string; color: string }) => (
    <LinearGradient colors={[color, `${color}88`]} style={styles.avatar}>
      <Text style={styles.avatarText}>{getInitials(name)}</Text>
    </LinearGradient>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Friends</Text>
        {requests.length > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{requests.length}</Text>
          </View>
        )}
      </View>

      {/* Tabs */}
      <View style={[styles.tabs, { backgroundColor: isDark ? '#1c1917' : '#f5f5f4' }]}>
        {(['friends', 'requests', 'search'] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab)}
            style={[styles.tab, activeTab === tab && { backgroundColor: '#f59e0b' }]}
          >
            <Text style={[styles.tabText, { color: activeTab === tab ? '#fff' : colors.foreground }]}>
              {tab === 'friends' ? `Friends (${friends.length})` : tab === 'requests' ? `Requests (${requests.length})` : 'Find'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.loading}><ActivityIndicator size="large" color="#f59e0b" /></View>
      ) : activeTab === 'search' ? (
        <View style={styles.searchContainer}>
          <View style={[styles.searchBar, { backgroundColor: isDark ? '#1c1917' : '#f5f5f4', borderColor: colors.border }]}>
            <Ionicons name="search" size={18} color={colors.mutedForeground} />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search by name or email"
              placeholderTextColor={colors.mutedForeground}
              style={[styles.searchInput, { color: colors.foreground }]}
              onSubmitEditing={handleSearch}
            />
            <TouchableOpacity onPress={handleSearch} style={[styles.searchBtn, { backgroundColor: '#f59e0b' }]}>
              <Ionicons name="search" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
          <FlatList
            data={searchResults}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => (
              <View style={[styles.userCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <AvatarPlaceholder name={item.name} color="#f59e0b" />
                <View style={styles.userInfo}>
                  <Text style={[styles.userName, { color: colors.foreground }]}>{item.name}</Text>
                  <Text style={[styles.userEmail, { color: colors.mutedForeground }]}>{item.email}</Text>
                </View>
                <TouchableOpacity
                  onPress={() => handleSendRequest(item._id)}
                  style={[styles.addBtn, { backgroundColor: '#f59e0b15', borderColor: '#f59e0b30' }]}
                >
                  <Ionicons name="person-add" size={16} color="#f59e0b" />
                </TouchableOpacity>
              </View>
            )}
          />
        </View>
      ) : activeTab === 'requests' ? (
        <FlatList
          data={requests}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={() => (
            <View style={styles.emptyState}>
              <Ionicons name="people-outline" size={48} color={colors.mutedForeground} />
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No pending requests</Text>
            </View>
          )}
          renderItem={({ item }) => (
            <View style={[styles.requestCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <AvatarPlaceholder name={item.from.name} color="#8b5cf6" />
              <View style={styles.userInfo}>
                <Text style={[styles.userName, { color: colors.foreground }]}>{item.from.name}</Text>
                <Text style={[styles.userEmail, { color: colors.mutedForeground }]}>{item.from.email}</Text>
              </View>
              <View style={styles.requestActions}>
                <TouchableOpacity onPress={() => handleAccept(item._id)} style={[styles.actionBtn, { backgroundColor: '#10b98120' }]}>
                  <Ionicons name="checkmark" size={18} color="#10b981" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleReject(item._id)} style={[styles.actionBtn, { backgroundColor: '#ef444420' }]}>
                  <Ionicons name="close" size={18} color="#ef4444" />
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      ) : (
        <FlatList
          data={friends}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={() => (
            <View style={styles.emptyState}>
              <Ionicons name="people-outline" size={48} color={colors.mutedForeground} />
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No friends yet</Text>
              <Text style={[styles.emptySubText, { color: colors.mutedForeground }]}>Search to find and add friends</Text>
            </View>
          )}
          renderItem={({ item }) => (
            <View style={[styles.userCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <AvatarPlaceholder name={item.name} color="#3b82f6" />
              <View style={styles.userInfo}>
                <Text style={[styles.userName, { color: colors.foreground }]}>{item.name}</Text>
                <Text style={[styles.userEmail, { color: colors.mutedForeground }]}>{item.email}</Text>
              </View>
              <Ionicons name="chatbubble-outline" size={18} color={colors.mutedForeground} />
            </View>
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
  headerTitle: { flex: 1, fontSize: 18, fontWeight: '700' },
  badge: { backgroundColor: '#ef4444', width: 22, height: 22, borderRadius: 11, justifyContent: 'center', alignItems: 'center' },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  tabs: { flexDirection: 'row', margin: 16, borderRadius: 10, padding: 4, gap: 4 },
  tab: { flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: 'center' },
  tabText: { fontSize: 12, fontWeight: '600' },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  searchContainer: { flex: 1 },
  searchBar: { flexDirection: 'row', alignItems: 'center', margin: 16, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, gap: 8 },
  searchInput: { flex: 1, fontSize: 15, paddingVertical: 4 },
  searchBtn: { width: 32, height: 32, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  list: { padding: 16, gap: 10 },
  userCard: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, borderWidth: 1, padding: 12, gap: 12 },
  avatar: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  userInfo: { flex: 1 },
  userName: { fontSize: 15, fontWeight: '600' },
  userEmail: { fontSize: 12, marginTop: 2 },
  addBtn: { width: 36, height: 36, borderRadius: 10, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
  requestCard: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, borderWidth: 1, padding: 12, gap: 12 },
  requestActions: { flexDirection: 'row', gap: 8 },
  actionBtn: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  emptyState: { paddingVertical: 60, alignItems: 'center', gap: 8 },
  emptyText: { fontSize: 16, fontWeight: '600', marginTop: 8 },
  emptySubText: { fontSize: 13 },
});
