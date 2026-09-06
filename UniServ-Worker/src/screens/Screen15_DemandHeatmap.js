import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Rect, Text as SvgText } from 'react-native-svg';
import { colors } from '../theme/colors';
import { useWorker } from '../context/WorkerContext';
import { MOCK_DEMAND_AREAS } from '../data/mockJobs';
import { workerTypes } from '../data/workerTypes';

const GRID_COLS = 8;
const GRID_ROWS = 6;
const CELL_SIZE = 38;
const CELL_GAP = 2;

const getHeatColor = (intensity) => {
  if (intensity > 0.7) return '#EF4444';
  if (intensity > 0.4) return '#F59E0B';
  if (intensity > 0.2) return '#84CC16';
  return '#86EFAC';
};

const AREA_LABELS = [
  { x: 0, y: 0, label: 'Kalkaji' },
  { x: 3, y: 0, label: 'Hauz Khas' },
  { x: 6, y: 0, label: 'Saket' },
  { x: 0, y: 3, label: 'Lajpat' },
  { x: 3, y: 3, label: 'GK-I' },
  { x: 6, y: 3, label: 'Nehru Pl' },
];

export const Screen15_DemandHeatmap = ({ navigation }) => {
  const { t } = useWorker();
  const [selectedTrade, setSelectedTrade] = useState('all');

  const heatData = useMemo(() => {
    return Array.from({ length: GRID_ROWS }, (_, row) =>
      Array.from({ length: GRID_COLS }, (_, col) => ({
        row, col,
        intensity: Math.random() * 0.9 + 0.1,
      }))
    );
  }, [selectedTrade]);

  const mapWidth = GRID_COLS * (CELL_SIZE + CELL_GAP);
  const mapHeight = GRID_ROWS * (CELL_SIZE + CELL_GAP);

  const filteredAreas = selectedTrade === 'all'
    ? MOCK_DEMAND_AREAS
    : MOCK_DEMAND_AREAS.filter((a) => a.service.toLowerCase().replace('_', ' ') === selectedTrade.toLowerCase().replace('_', ' '));

  const getLevelColor = (level) => {
    if (level === 'high') return colors.danger;
    if (level === 'medium') return colors.warning;
    return colors.success;
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.pageTitle}>{t('demandHeatmap', 'Cooperative Demand Heatmap')}</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.subHeader}>
          <Ionicons name="location" size={16} color={colors.primary} />
          <Text style={styles.subHeaderText}>{t('delhiNcrWardRadius', 'Delhi NCR Cooperative Ward Radius')}</Text>
        </View>

        {/* Trade Filter Horizontal Strip */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll} contentContainerStyle={{ paddingHorizontal: 4, gap: 8 }}>
          <TouchableOpacity
            style={[styles.filterChip, selectedTrade === 'all' && styles.filterChipActive]}
            onPress={() => setSelectedTrade('all')}
          >
            <Text style={[styles.filterChipText, selectedTrade === 'all' && styles.filterChipTextActive]}>{t('allTrades', 'All Trades')}</Text>
          </TouchableOpacity>
          {workerTypes.map((tr) => (
            <TouchableOpacity
              key={tr.id}
              style={[styles.filterChip, selectedTrade === tr.id && styles.filterChipActive]}
              onPress={() => setSelectedTrade(tr.id)}
            >
              <Text style={[styles.filterChipText, selectedTrade === tr.id && styles.filterChipTextActive]}>{t(tr.id, tr.label)}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.mapCard}>
          <View style={styles.mapHeader}>
            <Text style={styles.mapTitle}>{t('liveDemandDensity', 'Live Demand Density')}</Text>
            <View style={styles.liveChip}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>{t('liveSync', 'Live Sync')}</Text>
            </View>
          </View>
          <View style={{ alignItems: 'center' }}>
            <Svg width={mapWidth} height={mapHeight} style={styles.svg}>
              {heatData.flat().map((cell) => (
                <Rect
                  key={`${cell.row}-${cell.col}`}
                  x={cell.col * (CELL_SIZE + CELL_GAP)}
                  y={cell.row * (CELL_SIZE + CELL_GAP)}
                  width={CELL_SIZE}
                  height={CELL_SIZE}
                  fill={getHeatColor(cell.intensity)}
                  rx="6"
                  opacity={0.8 + cell.intensity * 0.2}
                />
              ))}
              {AREA_LABELS.map((label, i) => (
                <SvgText
                  key={i}
                  x={label.x * (CELL_SIZE + CELL_GAP) + CELL_SIZE / 2}
                  y={label.y * (CELL_SIZE + CELL_GAP) + CELL_SIZE / 2 + 4}
                  textAnchor="middle"
                  fill="white"
                  fontSize="8"
                  fontWeight="700"
                >
                  {label.label}
                </SvgText>
              ))}
            </Svg>
          </View>

          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#86EFAC' }]} />
              <Text style={styles.legendText}>{t('low', 'Low')}</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#84CC16' }]} />
              <Text style={styles.legendText}>{t('moderate', 'Moderate')}</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#F59E0B' }]} />
              <Text style={styles.legendText}>{t('high', 'High')}</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#EF4444' }]} />
              <Text style={styles.legendText}>{t('surge', 'Surge')}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>{t('highDemandWards', 'High Demand Cooperative Wards')}</Text>
        {filteredAreas.map((item, i) => (
          <View key={i} style={styles.areaCard}>
            <View style={styles.areaLeft}>
              <Text style={styles.areaName}>{item.area}</Text>
              <Text style={styles.areaService}>{t(item.service, item.service)} · {item.distance}</Text>
            </View>
            <View style={[styles.levelBadge, { backgroundColor: getLevelColor(item.level) + '20' }]}>
              <Text style={[styles.levelText, { color: getLevelColor(item.level) }]}>
                {item.level.toUpperCase()} {t('demand', 'DEMAND')}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 36 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  back: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border },
  pageTitle: { fontSize: 18, fontWeight: '800', color: colors.textPrimary },
  subHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
  subHeaderText: { fontSize: 12, color: colors.textMuted, fontWeight: '600' },
  filterScroll: { marginBottom: 16 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  filterChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterChipText: { fontSize: 12, fontWeight: '700', color: colors.textSecondary },
  filterChipTextActive: { color: colors.textInverse },
  mapCard: { backgroundColor: colors.surface, borderRadius: 18, padding: 16, borderWidth: 1, borderColor: colors.border, marginBottom: 18 },
  mapHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  mapTitle: { fontSize: 14, fontWeight: '800', color: colors.textPrimary },
  liveChip: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.successLight, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.success },
  liveText: { fontSize: 10, fontWeight: '800', color: colors.success },
  svg: { borderRadius: 10, overflow: 'hidden' },
  legend: { flexDirection: 'row', justifyContent: 'center', gap: 16, marginTop: 14 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 3 },
  legendText: { fontSize: 11, color: colors.textMuted, fontWeight: '600' },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: colors.textPrimary, marginBottom: 10 },
  areaCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.surface, borderRadius: 12, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: colors.border },
  areaLeft: { flex: 1 },
  areaName: { fontSize: 14, fontWeight: '700', color: colors.textPrimary },
  areaService: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  levelBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  levelText: { fontSize: 10, fontWeight: '800' },
});

export default Screen15_DemandHeatmap;
