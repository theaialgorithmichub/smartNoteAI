import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Alert, ActivityIndicator, TextInput, Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../hooks/useTheme';
import { WorkspacesAPI } from '../../services/api';
import { Workspace } from '../../types';

export default function WorkspacesScreen() {
  const navigation = useNavigation();
  const { colors, isDark } = useTheme();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [newName, setNewName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadWorkspaces();
  }, []);

  const loadWorkspaces = async () => {
    try {
      const res = await WorkspacesAPI.list();
      setWorkspaces(res.data.workspaces || res.data || []);
    } catch {
      setWorkspaces([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setCreating(true);
    try {
      const res = await WorkspacesAPI.create({ name: newName.trim() });
      setWorkspaces((prev) => [res.data.workspace || res.data, ...prev]);
      setShowCreate(false);
      setNewName('');
    } catch {
      Alert.alert('Error', 'Could not create workspace');
    } finally {
      setCreating(false);
    }
  };

  const handleJoin = async () => {
    if (!inviteCode.trim()) return;
    setCreating(true);
    try {
      const res = await WorkspacesAPI.join(inviteCode.trim());
      setWorkspaces((prev) => [res.data.workspace || res.data, ...prev]);
      setShowJoin(false);
      setInviteCode('');
    } catch {
      Alert.alert('Error', 'Invalid invite code');
    } finally {
      setCreating(false);
    }
  };

  const getRoleColor = (role: string) => {
    const map: Record<string, string> = {
      owner: '#f59e0b',
      admin: '#8b5cf6',
      editor: '#3b82f6',
      viewer: '#10b981',
    };
    return map[role] || '#6b7280';
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Workspaces</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={() => setShowJoin(true)} style={styles.headerBtn}>
            <Ionicons name="enter-outline" size={20} color={colors.foreground} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowCreate(true)} style={styles.headerBtn}>
            <Ionicons name="add-circle" size={22} color="#f59e0b" />
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="#f59e0b" />
        </View>
      ) : workspaces.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="business-outline" size={64} color={colors.mutedForeground} />
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No workspaces yet</Text>
          <Text style={[styles.emptySubtitle, { color: colors.mutedForeground }]}>
            Create a workspace to collaborate
          </Text>
          <TouchableOpacity onPress={() => setShowCreate(true)} style={styles.createBtn}>
            <LinearGradient colors={['#f59e0b', '#f97316']} style={styles.createBtnGradient}>
              <Text style={styles.createBtnText}>Create Workspace</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={workspaces}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => {
            const myRole = item.members?.find(() => true)?.role || 'viewer';
            return (
              <View style={[styles.wsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <LinearGradient
                  colors={['#f59e0b', '#f97316']}
                  style={styles.wsIcon}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Ionicons name="business" size={22} color="#fff" />
                </LinearGradient>
                <View style={styles.wsInfo}>
                  <Text style={[styles.wsName, { color: colors.foreground }]}>{item.name}</Text>
                  <View style={styles.wsMetaRow}>
                    <View style={[styles.roleBadge, { backgroundColor: `${getRoleColor(myRole)}20` }]}>
                      <Text style={[styles.roleText, { color: getRoleColor(myRole) }]}>{myRole}</Text>
                    </View>
                    <Text style={[styles.wsMeta, { color: colors.mutedForeground }]}>
                      {item.members?.length || 0} members
                    </Text>
                  </View>
                </View>
                <View style={styles.wsActions}>
                  <Text style={[styles.inviteCode, { color: colors.mutedForeground }]}>
                    {item.inviteCode}
                  </Text>
                  <TouchableOpacity>
                    <Ionicons name="chevron-forward" size={18} color={colors.mutedForeground} />
                  </TouchableOpacity>
                </View>
              </View>
            );
          }}
        />
      )}

      {/* Create Modal */}
      <Modal visible={showCreate} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modal, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>New Workspace</Text>
            <TextInput
              value={newName}
              onChangeText={setNewName}
              placeholder="Workspace name"
              placeholderTextColor={colors.mutedForeground}
              style={[styles.modalInput, { color: colors.foreground, borderColor: colors.border }]}
            />
            <View style={styles.modalBtns}>
              <TouchableOpacity onPress={() => setShowCreate(false)} style={[styles.modalBtn, { borderColor: colors.border }]}>
                <Text style={[styles.modalBtnText, { color: colors.foreground }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleCreate} style={[styles.modalBtn, { backgroundColor: '#f59e0b' }]}>
                <Text style={[styles.modalBtnText, { color: '#fff' }]}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Join Modal */}
      <Modal visible={showJoin} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modal, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>Join Workspace</Text>
            <TextInput
              value={inviteCode}
              onChangeText={setInviteCode}
              placeholder="Enter invite code"
              placeholderTextColor={colors.mutedForeground}
              style={[styles.modalInput, { color: colors.foreground, borderColor: colors.border }]}
              autoCapitalize="characters"
            />
            <View style={styles.modalBtns}>
              <TouchableOpacity onPress={() => setShowJoin(false)} style={[styles.modalBtn, { borderColor: colors.border }]}>
                <Text style={[styles.modalBtnText, { color: colors.foreground }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleJoin} style={[styles.modalBtn, { backgroundColor: '#f59e0b' }]}>
                <Text style={[styles.modalBtnText, { color: '#fff' }]}>Join</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingTop: 56, paddingBottom: 12, paddingHorizontal: 16, borderBottomWidth: 1, gap: 12 },
  backBtn: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { flex: 1, fontSize: 18, fontWeight: '700' },
  headerActions: { flexDirection: 'row', gap: 4 },
  headerBtn: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40, gap: 8 },
  emptyTitle: { fontSize: 20, fontWeight: '700', marginTop: 16 },
  emptySubtitle: { fontSize: 14, textAlign: 'center' },
  createBtn: { marginTop: 16, borderRadius: 12, overflow: 'hidden' },
  createBtnGradient: { paddingVertical: 12, paddingHorizontal: 24, borderRadius: 12 },
  createBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  list: { padding: 16, gap: 10 },
  wsCard: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, borderWidth: 1, padding: 12, gap: 12 },
  wsIcon: { width: 48, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  wsInfo: { flex: 1 },
  wsName: { fontSize: 15, fontWeight: '700' },
  wsMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  roleBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  roleText: { fontSize: 11, fontWeight: '700' },
  wsMeta: { fontSize: 12 },
  wsActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  inviteCode: { fontSize: 11, fontFamily: 'monospace' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modal: { borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24, paddingBottom: 40 },
  modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 16 },
  modalInput: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, marginBottom: 16 },
  modalBtns: { flexDirection: 'row', gap: 10 },
  modalBtn: { flex: 1, paddingVertical: 12, borderRadius: 10, borderWidth: 1, alignItems: 'center' },
  modalBtnText: { fontSize: 15, fontWeight: '600' },
});
