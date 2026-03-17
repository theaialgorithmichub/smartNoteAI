import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity,
  PanResponder, Dimensions, Alert, Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Line, Circle, Text as SvgText } from 'react-native-svg';
import { useTheme } from '../../hooks/useTheme';
import { Notebook, Page } from '../../types';

interface MindNode {
  id: string; text: string; color: string;
  x: number; y: number; parentId: string | null; children: string[];
}

interface Props { notebook: Notebook; pages: Page[]; currentPage: Page | null; pageIndex: number; onPageChange: (i: number) => void; }

const COLORS = ['#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6','#ec4899','#14b8a6','#f97316'];
const { width: SW, height: SH } = Dimensions.get('window');
const CX = SW / 2, CY = 240;

const makeNode = (id: string, text: string, color: string, x: number, y: number, parentId: string | null): MindNode => ({
  id, text, color, x, y, parentId, children: [],
});

export const MindMapTemplate: React.FC<Props> = ({ notebook }) => {
  const { colors, isDark } = useTheme();
  const themeColor = notebook.appearance?.themeColor || '#8b5cf6';
  const [nodes, setNodes] = useState<MindNode[]>([
    makeNode('root', notebook.title || 'Central Idea', themeColor, CX, CY, null),
  ]);
  const [selected, setSelected] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [showSidebar, setShowSidebar] = useState(false);

  const addChild = (parentId: string) => {
    const parent = nodes.find(n => n.id === parentId);
    if (!parent) return;
    const siblings = nodes.filter(n => n.parentId === parentId).length;
    const isRoot = parentId === 'root';
    const dist = isRoot ? 180 : 130;
    const angle = isRoot
      ? (siblings * (Math.PI * 2 / Math.max(8, siblings + 1)))
      : (siblings * 55 * (Math.PI / 180) - Math.PI / 3);
    const newNode = makeNode(
      Date.now().toString(),
      'New Idea',
      COLORS[(nodes.length) % COLORS.length],
      parent.x + Math.cos(angle) * dist,
      parent.y + Math.sin(angle) * dist,
      parentId,
    );
    setNodes(prev => {
      const updated = prev.map(n => n.id === parentId ? { ...n, children: [...n.children, newNode.id] } : n);
      return [...updated, newNode];
    });
    setSelected(newNode.id);
    setEditing(newNode.id);
    setEditText(newNode.text);
  };

  const deleteNode = (id: string) => {
    if (id === 'root') return;
    const getAllDescendants = (nid: string): string[] => {
      const node = nodes.find(n => n.id === nid);
      if (!node) return [];
      return [nid, ...node.children.flatMap(getAllDescendants)];
    };
    const toDelete = getAllDescendants(id);
    const parentId = nodes.find(n => n.id === id)?.parentId;
    setNodes(prev => prev
      .filter(n => !toDelete.includes(n.id))
      .map(n => n.id === parentId ? { ...n, children: n.children.filter(c => c !== id) } : n)
    );
    setSelected(null);
  };

  const saveEdit = () => {
    if (!editing) return;
    setNodes(prev => prev.map(n => n.id === editing ? { ...n, text: editText } : n));
    setEditing(null);
    setEditText('');
  };

  const changeColor = (id: string, color: string) => {
    setNodes(prev => prev.map(n => n.id === id ? { ...n, color } : n));
  };

  const getNodeById = (id: string) => nodes.find(n => n.id === id);

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#0f172a' : '#f8fafc' }]}>
      {/* Toolbar */}
      <View style={[styles.toolbar, { backgroundColor: isDark ? '#1e293b' : '#fff', borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => selected && addChild(selected)}
          disabled={!selected}
          style={[styles.toolBtn, { opacity: selected ? 1 : 0.4, backgroundColor: `${themeColor}20` }]}>
          <Ionicons name="add" size={18} color={themeColor} />
          <Text style={[styles.toolBtnText, { color: themeColor }]}>Add Child</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => selected && setEditing(selected) && setEditText(getNodeById(selected)?.text || '')}
          disabled={!selected}
          style={[styles.toolBtn, { opacity: selected ? 1 : 0.4, backgroundColor: '#3b82f620' }]}>
          <Ionicons name="pencil" size={18} color="#3b82f6" />
          <Text style={[styles.toolBtnText, { color: '#3b82f6' }]}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => selected && selected !== 'root' && deleteNode(selected)}
          disabled={!selected || selected === 'root'}
          style={[styles.toolBtn, { opacity: selected && selected !== 'root' ? 1 : 0.4, backgroundColor: '#ef444420' }]}>
          <Ionicons name="trash" size={18} color="#ef4444" />
          <Text style={[styles.toolBtnText, { color: '#ef4444' }]}>Delete</Text>
        </TouchableOpacity>
        {selected && (
          <View style={styles.colorRow}>
            {COLORS.map(c => (
              <TouchableOpacity key={c} onPress={() => changeColor(selected, c)}
                style={[styles.colorDot, { backgroundColor: c }]} />
            ))}
          </View>
        )}
      </View>

      {/* Mind Map SVG */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <Svg width={Math.max(SW, 800)} height={Math.max(600, SH - 180)}>
            {/* Draw lines */}
            {nodes.map(node => {
              if (!node.parentId) return null;
              const parent = nodes.find(n => n.id === node.parentId);
              if (!parent) return null;
              return (
                <Line key={`line-${node.id}`}
                  x1={parent.x} y1={parent.y} x2={node.x} y2={node.y}
                  stroke={node.color} strokeWidth="2" strokeOpacity="0.5" />
              );
            })}
            {/* Draw nodes */}
            {nodes.map(node => {
              const isRoot = node.id === 'root';
              const r = isRoot ? 50 : 40;
              const isSelected = selected === node.id;
              return (
                <React.Fragment key={node.id}>
                  <Circle
                    cx={node.x} cy={node.y} r={r}
                    fill={node.color} opacity={isSelected ? 1 : 0.85}
                    stroke={isSelected ? '#fff' : 'transparent'}
                    strokeWidth={isSelected ? 3 : 0}
                    onPress={() => { setSelected(selected === node.id ? null : node.id); }}
                  />
                  <SvgText
                    x={node.x} y={node.y + 5}
                    textAnchor="middle" fill="#fff"
                    fontSize={isRoot ? 13 : 11} fontWeight="600"
                    onPress={() => { setSelected(selected === node.id ? null : node.id); }}
                  >
                    {node.text.length > 12 ? node.text.slice(0, 12) + '…' : node.text}
                  </SvgText>
                  {node.children.length > 0 && (
                    <SvgText x={node.x + r - 6} y={node.y - r + 8} textAnchor="middle" fill="#fff" fontSize={9}>
                      {node.children.length}
                    </SvgText>
                  )}
                </React.Fragment>
              );
            })}
          </Svg>
        </ScrollView>
      </ScrollView>

      {/* Edit modal */}
      <Modal visible={!!editing} transparent animationType="fade">
        <View style={styles.editOverlay}>
          <View style={[styles.editModal, { backgroundColor: isDark ? '#1c1917' : '#fff' }]}>
            <Text style={[styles.editTitle, { color: colors.foreground }]}>Edit Node</Text>
            <TextInput value={editText} onChangeText={setEditText} style={[styles.editInput, { color: colors.foreground, borderColor: colors.border }]}
              autoFocus selectTextOnFocus />
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
              <TouchableOpacity onPress={() => { setEditing(null); setEditText(''); }}
                style={[styles.editCancelBtn, { borderColor: colors.border }]}>
                <Text style={{ color: colors.foreground }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={saveEdit}
                style={[styles.editSaveBtn, { backgroundColor: themeColor }]}>
                <Text style={{ color: '#fff', fontWeight: '700' }}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Help text */}
      <View style={[styles.helpBar, { backgroundColor: isDark ? '#1e293b' : '#f1f5f9', borderTopColor: colors.border }]}>
        <Text style={[styles.helpText, { color: colors.mutedForeground }]}>
          Tap a node to select → Add Child or Edit • Drag to scroll
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  toolbar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderBottomWidth: 1, gap: 8, flexWrap: 'wrap' },
  toolBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  toolBtnText: { fontSize: 12, fontWeight: '600' },
  colorRow: { flexDirection: 'row', gap: 6, alignItems: 'center', marginLeft: 'auto' as any },
  colorDot: { width: 20, height: 20, borderRadius: 10 },
  editOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 32 },
  editModal: { width: '100%', borderRadius: 16, padding: 20 },
  editTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
  editInput: { borderWidth: 1, borderRadius: 8, padding: 12, fontSize: 16, marginBottom: 4 },
  editCancelBtn: { flex: 1, borderWidth: 1, borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  editSaveBtn: { flex: 1, borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  helpBar: { paddingVertical: 8, paddingHorizontal: 16, borderTopWidth: 1, alignItems: 'center' },
  helpText: { fontSize: 11 },
});
