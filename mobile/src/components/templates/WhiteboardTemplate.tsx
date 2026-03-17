import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, PanResponder,
  Dimensions, Modal, TextInput, ScrollView,
} from 'react-native';
import Svg, { Path, Rect, Circle, Text as SvgText, Line } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../hooks/useTheme';
import { Notebook, Page } from '../../types';

interface Point { x: number; y: number; }
interface DrawElement {
  id: string; type: 'pen' | 'line' | 'rectangle' | 'circle' | 'text' | 'sticky';
  points?: Point[]; start?: Point; end?: Point; text?: string;
  color: string; strokeWidth: number; fill?: string;
}

interface Props { notebook: Notebook; pages: Page[]; currentPage: Page | null; pageIndex: number; onPageChange: (i: number) => void; }

const COLORS = ['#1a1a1a','#ef4444','#f97316','#eab308','#22c55e','#3b82f6','#8b5cf6','#ec4899','#ffffff','#64748b'];
const STICKY_COLORS = ['#fef08a','#bbf7d0','#bfdbfe','#fecaca','#e9d5ff','#fed7aa'];
const STROKE_WIDTHS = [2, 4, 6, 10, 16];
const { width: SW, height: SH } = Dimensions.get('window');

export const WhiteboardTemplate: React.FC<Props> = ({ notebook }) => {
  const { colors, isDark } = useTheme();
  const [elements, setElements] = useState<DrawElement[]>([]);
  const [tool, setTool] = useState<'pen' | 'line' | 'rectangle' | 'circle' | 'eraser' | 'sticky'>('pen');
  const [color, setColor] = useState('#1a1a1a');
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentEl, setCurrentEl] = useState<DrawElement | null>(null);
  const [history, setHistory] = useState<DrawElement[][]>([[]]);
  const [histIdx, setHistIdx] = useState(0);
  const [showTextModal, setShowTextModal] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [textPos, setTextPos] = useState<Point>({ x: 0, y: 0 });
  const [stickyColor, setStickyColor] = useState(STICKY_COLORS[0]);
  const svgRef = useRef<any>(null);
  const startPoint = useRef<Point | null>(null);

  const makeId = () => Date.now().toString() + Math.random().toString(36).slice(2, 5);

  const pushHistory = (els: DrawElement[]) => {
    const newHist = history.slice(0, histIdx + 1);
    setHistory([...newHist, els]);
    setHistIdx(newHist.length);
  };

  const undo = () => { if (histIdx > 0) { setHistIdx(h => h - 1); setElements(history[histIdx - 1]); } };
  const redo = () => { if (histIdx < history.length - 1) { setHistIdx(h => h + 1); setElements(history[histIdx + 1]); } };
  const clear = () => { const els: DrawElement[] = []; setElements(els); pushHistory(els); };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (e) => {
      const { locationX: x, locationY: y } = e.nativeEvent;
      startPoint.current = { x, y };
      if (tool === 'pen') {
        const el: DrawElement = { id: makeId(), type: 'pen', points: [{ x, y }], color, strokeWidth };
        setCurrentEl(el);
      } else if (tool === 'sticky') {
        setStickyColor(STICKY_COLORS[Math.floor(Math.random() * STICKY_COLORS.length)]);
        setTextPos({ x, y }); setShowTextModal(true); return;
      }
      setIsDrawing(true);
    },
    onPanResponderMove: (e) => {
      if (!isDrawing) return;
      const { locationX: x, locationY: y } = e.nativeEvent;
      if (tool === 'pen' && currentEl) {
        setCurrentEl(p => p ? { ...p, points: [...(p.points || []), { x, y }] } : p);
      } else if (startPoint.current && ['line', 'rectangle', 'circle'].includes(tool)) {
        const el: DrawElement = {
          id: makeId(), type: tool as any,
          start: startPoint.current, end: { x, y },
          color, strokeWidth,
        };
        setCurrentEl(el);
      }
    },
    onPanResponderRelease: () => {
      if (currentEl) {
        const newEls = [...elements, currentEl];
        setElements(newEls);
        pushHistory(newEls);
        setCurrentEl(null);
      }
      setIsDrawing(false);
    },
  });

  const addText = () => {
    if (!textInput.trim()) { setShowTextModal(false); return; }
    const el: DrawElement = { id: makeId(), type: 'text', start: textPos, text: textInput, color, strokeWidth, fill: stickyColor };
    const newEls = [...elements, el];
    setElements(newEls); pushHistory(newEls);
    setTextInput(''); setShowTextModal(false);
  };

  const renderElement = (el: DrawElement) => {
    switch (el.type) {
      case 'pen':
        if (!el.points || el.points.length < 2) return null;
        const d = el.points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
        return <Path key={el.id} d={d} stroke={el.color} strokeWidth={el.strokeWidth} fill="none" strokeLinecap="round" strokeLinejoin="round" />;
      case 'line':
        if (!el.start || !el.end) return null;
        return <Line key={el.id} x1={el.start.x} y1={el.start.y} x2={el.end.x} y2={el.end.y} stroke={el.color} strokeWidth={el.strokeWidth} />;
      case 'rectangle':
        if (!el.start || !el.end) return null;
        return <Rect key={el.id} x={Math.min(el.start.x, el.end.x)} y={Math.min(el.start.y, el.end.y)} width={Math.abs(el.end.x - el.start.x)} height={Math.abs(el.end.y - el.start.y)} stroke={el.color} strokeWidth={el.strokeWidth} fill="transparent" />;
      case 'circle':
        if (!el.start || !el.end) return null;
        const r = Math.hypot(el.end.x - el.start.x, el.end.y - el.start.y) / 2;
        return <Circle key={el.id} cx={(el.start.x + el.end.x) / 2} cy={(el.start.y + el.end.y) / 2} r={r} stroke={el.color} strokeWidth={el.strokeWidth} fill="transparent" />;
      case 'text':
      case 'sticky':
        if (!el.start) return null;
        return (
          <React.Fragment key={el.id}>
            {el.fill && <Rect x={el.start.x - 8} y={el.start.y - 20} width={120} height={50} fill={el.fill} rx={6} />}
            <SvgText x={el.start.x} y={el.start.y} fill={el.color} fontSize={14} fontWeight="600">{el.text}</SvgText>
          </React.Fragment>
        );
      default: return null;
    }
  };

  const TOOLS = [
    { id: 'pen', icon: 'pencil', label: 'Pen' },
    { id: 'line', icon: 'remove', label: 'Line' },
    { id: 'rectangle', icon: 'square-outline', label: 'Rect' },
    { id: 'circle', icon: 'ellipse-outline', label: 'Circle' },
    { id: 'sticky', icon: 'document', label: 'Note' },
    { id: 'eraser', icon: 'backspace', label: 'Clear' },
  ] as const;

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#1e293b' : '#f1f5f9' }]}>
      {/* Toolbar */}
      <View style={[styles.toolbar, { backgroundColor: isDark ? '#0f172a' : '#fff', borderBottomColor: colors.border }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.toolbarScroll}>
          {TOOLS.map(t => (
            <TouchableOpacity key={t.id} onPress={() => t.id === 'eraser' ? clear() : setTool(t.id as any)}
              style={[styles.toolBtn, tool === t.id && t.id !== 'eraser' && { backgroundColor: `${color}30` }]}>
              <Ionicons name={t.icon as any} size={18} color={tool === t.id ? color : colors.mutedForeground} />
              <Text style={[styles.toolLabel, { color: tool === t.id ? color : colors.mutedForeground }]}>{t.label}</Text>
            </TouchableOpacity>
          ))}
          <View style={styles.divider} />
          {STROKE_WIDTHS.map(w => (
            <TouchableOpacity key={w} onPress={() => setStrokeWidth(w)}
              style={[styles.strokeBtn, strokeWidth === w && { backgroundColor: `${color}30` }]}>
              <View style={{ width: w, height: w, borderRadius: w / 2, backgroundColor: color }} />
            </TouchableOpacity>
          ))}
          <View style={styles.divider} />
          <TouchableOpacity onPress={undo} style={styles.actionBtn}><Ionicons name="arrow-undo" size={18} color={colors.mutedForeground} /></TouchableOpacity>
          <TouchableOpacity onPress={redo} style={styles.actionBtn}><Ionicons name="arrow-redo" size={18} color={colors.mutedForeground} /></TouchableOpacity>
        </ScrollView>
        {/* Color palette */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.paletteScroll}>
          {COLORS.map(c => (
            <TouchableOpacity key={c} onPress={() => setColor(c)}
              style={[styles.colorDot, { backgroundColor: c }, color === c && styles.colorDotSelected]} />
          ))}
        </ScrollView>
      </View>

      {/* Canvas */}
      <View style={styles.canvas} {...panResponder.panHandlers}>
        <Svg width={SW} height={SH - 200}>
          {elements.map(renderElement)}
          {currentEl && renderElement(currentEl)}
        </Svg>
        {elements.length === 0 && (
          <View style={styles.emptyCanvas} pointerEvents="none">
            <Text style={[styles.emptyCanvasText, { color: colors.mutedForeground }]}>
              Select a tool and start drawing
            </Text>
          </View>
        )}
      </View>

      {/* Text / Sticky note modal */}
      <Modal visible={showTextModal} transparent animationType="fade">
        <View style={styles.textModalOverlay}>
          <View style={[styles.textModal, { backgroundColor: isDark ? '#1c1917' : '#fff' }]}>
            <Text style={[styles.textModalTitle, { color: colors.foreground }]}>Add Text / Note</Text>
            <View style={styles.stickyColorRow}>
              {STICKY_COLORS.map(sc => (
                <TouchableOpacity key={sc} onPress={() => setStickyColor(sc)}
                  style={[styles.stickyDot, { backgroundColor: sc }, stickyColor === sc && styles.stickyDotSelected]} />
              ))}
              <TouchableOpacity onPress={() => setStickyColor('')} style={[styles.stickyDot, { backgroundColor: 'transparent', borderColor: colors.border, borderWidth: 1 }]}>
                <Ionicons name="text" size={12} color={colors.foreground} />
              </TouchableOpacity>
            </View>
            <TextInput value={textInput} onChangeText={setTextInput} placeholder="Enter text..." placeholderTextColor={colors.mutedForeground}
              autoFocus style={[styles.textInput, { color: colors.foreground, borderColor: colors.border }]} />
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
              <TouchableOpacity onPress={() => setShowTextModal(false)} style={[styles.cancelBtn, { borderColor: colors.border }]}>
                <Text style={{ color: colors.foreground }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={addText} style={[styles.addTextBtn, { backgroundColor: notebook.appearance?.themeColor || '#8b5cf6' }]}>
                <Text style={{ color: '#fff', fontWeight: '700' }}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  toolbar: { borderBottomWidth: 1, paddingVertical: 6 },
  toolbarScroll: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, gap: 6 },
  toolBtn: { alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, gap: 2 },
  toolLabel: { fontSize: 9, fontWeight: '600' },
  divider: { width: 1, height: 30, backgroundColor: '#e7e5e4', marginHorizontal: 4 },
  strokeBtn: { width: 32, height: 32, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  actionBtn: { width: 32, height: 32, justifyContent: 'center', alignItems: 'center' },
  paletteScroll: { flexDirection: 'row', gap: 8, paddingHorizontal: 10, paddingVertical: 6 },
  colorDot: { width: 24, height: 24, borderRadius: 12, borderWidth: 1, borderColor: '#e7e5e4' },
  colorDotSelected: { borderWidth: 3, borderColor: '#1a1a1a', transform: [{ scale: 1.2 }] },
  canvas: { flex: 1, position: 'relative' },
  emptyCanvas: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center' },
  emptyCanvasText: { fontSize: 14, textAlign: 'center' },
  textModalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 32 },
  textModal: { width: '100%', borderRadius: 16, padding: 20 },
  textModalTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
  stickyColorRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  stickyDot: { width: 28, height: 28, borderRadius: 6 },
  stickyDotSelected: { borderWidth: 2, borderColor: '#1a1a1a' },
  textInput: { borderWidth: 1, borderRadius: 8, padding: 12, fontSize: 16 },
  cancelBtn: { flex: 1, borderWidth: 1, borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  addTextBtn: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
});
