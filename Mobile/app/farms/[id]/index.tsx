import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  Vibration,
  View,
} from 'react-native';
import { farmService, hardwareService, telemetryService } from '../../../apiservice/api';

// ─── Design tokens ────────────────────────────────────────────────────────
const C = {
  bg:         '#080d10',
  card:       '#0f1923',
  cardDeep:   '#0b1420',
  border:     'rgba(255,255,255,0.07)',
  brand:      '#10b981',
  brandGlow:  'rgba(16,185,129,0.15)',
  brandBorder:'rgba(16,185,129,0.30)',
  sky:        '#38bdf8',
  skyGlow:    'rgba(56,189,248,0.14)',
  skyBorder:  'rgba(56,189,248,0.35)',
  amber:      '#f59e0b',
  amberGlow:  'rgba(245,158,11,0.13)',
  danger:     '#ef4444',
  dangerGlow: 'rgba(239,68,68,0.14)',
  dangerBorder:'rgba(239,68,68,0.35)',
  purple:     '#a78bfa',
  purpleGlow: 'rgba(167,139,250,0.14)',
  purpleBorder:'rgba(167,139,250,0.35)',
  textPri:    '#e2e8f0',
  textSec:    '#94a3b8',
  textMuted:  '#475569',
};

type ZoneMode = 'AUTO' | 'OPEN' | 'CLOSE';

// ─── Animated moisture bar ────────────────────────────────────────────────
function MoisBar({ pct, color }: { pct: number; color: string }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.spring(anim, { toValue: pct, useNativeDriver: false, damping: 16, stiffness: 80 }).start();
  }, [pct]);
  const width = anim.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] });
  return (
    <View style={s.barTrack}>
      <Animated.View style={[s.barFill, { width, backgroundColor: color }]} />
    </View>
  );
}

// ─── Pulse dot ────────────────────────────────────────────────────────────
function PulseDot({ on }: { on: boolean }) {
  const scale = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (!on) return;
    Animated.loop(Animated.sequence([
      Animated.timing(scale, { toValue: 1.5, duration: 700, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1,   duration: 700, useNativeDriver: true }),
    ])).start();
  }, [on]);
  return (
    <Animated.View style={[s.pulseDot, {
      backgroundColor: on ? C.brand : C.textMuted,
      transform: [{ scale: on ? scale : 1 }],
    }]} />
  );
}

// ─── Zone branch card ─────────────────────────────────────────────────────
function ZoneBranchCard({ zone, onCmd }: {
  zone: any;
  onCmd: (id: string, mode: ZoneMode) => void;
}) {
  const moisture  = zone.latestMoisture ?? null;
  const isOpen    = zone.status === 'Irrigating';
  const isAuto    = zone.status === 'Active';
  const isClosed  = zone.status === 'Idle';

  const mColor = moisture != null
    ? moisture >= 65 ? C.brand : moisture >= 40 ? C.amber : C.danger
    : C.textMuted;

  const accentColor = isOpen ? C.brand : isAuto ? C.purple : C.textMuted;

  const press = (mode: ZoneMode) => { Vibration.vibrate(25); onCmd(zone.id, mode); };

  return (
    <View style={[s.zoneCard, { borderLeftColor: accentColor }]}>

      {/* ── Header ───────────────────────────────────────────── */}
      <View style={s.zoneTop}>
        <View style={{ flex: 1, gap: 3 }}>
          <Text style={s.zoneNum}>
            Zone {String(zone.id).slice(-2).padStart(2, '0')}
          </Text>
          <Text style={s.zoneName} numberOfLines={1}>
            {zone.zoneName ?? zone.name ?? 'Irrigation Zone'}
          </Text>
          {zone.cropType ? (
            <Text style={s.zoneCrop}>{zone.cropType}</Text>
          ) : null}
        </View>
        <View style={{ alignItems: 'flex-end', gap: 6 }}>
          {/* Online badge */}
          <View style={[s.statusBadge, {
            backgroundColor: isOpen || isAuto ? C.brandGlow : 'rgba(71,85,105,0.18)',
            borderColor:     isOpen || isAuto ? C.brandBorder : 'rgba(71,85,105,0.35)',
          }]}>
            <PulseDot on={isOpen || isAuto} />
            <Text style={[s.statusBadgeTxt, { color: isOpen || isAuto ? C.brand : C.textMuted }]}>
              {isOpen ? 'IRRIGATING' : isAuto ? 'AUTO' : 'IDLE'}
            </Text>
          </View>
          {/* Valve state */}
          <View style={[s.valveBadge, {
            backgroundColor: isOpen ? C.skyGlow   : 'rgba(71,85,105,0.1)',
            borderColor:     isOpen ? C.skyBorder : 'rgba(71,85,105,0.2)',
          }]}>
            <Feather name="droplet" size={9} color={isOpen ? C.sky : C.textMuted} />
            <Text style={[s.valveTxt, { color: isOpen ? C.sky : C.textMuted }]}>
              {isOpen ? 'OPEN' : 'CLOSED'}
            </Text>
          </View>
        </View>
      </View>

      {/* ── Moisture bar ─────────────────────────────────────── */}
      <View style={s.moistSection}>
        <View style={s.moistHeader}>
          <Text style={s.moistLabel}>SOIL MOISTURE</Text>
          {moisture != null ? (
            <Text style={[s.moistValue, { color: mColor }]}>{moisture.toFixed(0)}%</Text>
          ) : (
            <Text style={[s.moistValue, { color: C.textMuted }]}>—</Text>
          )}
        </View>
        <MoisBar pct={moisture ?? 0} color={mColor} />
      </View>

      {/* ── Detail chips ─────────────────────────────────────── */}
      <View style={s.detailRow}>
        <View style={s.detailChip}>
          <Feather name="grid" size={11} color={C.textMuted} />
          <Text style={s.detailTxt}>{zone.soilType ?? 'Loamy'}</Text>
        </View>
        {zone.area ? (
          <View style={s.detailChip}>
            <Feather name="maximize-2" size={11} color={C.textMuted} />
            <Text style={s.detailTxt}>{zone.area} ha</Text>
          </View>
        ) : null}
        <View style={[s.detailChip, {
          backgroundColor: isAuto ? C.purpleGlow : isOpen ? C.brandGlow : 'rgba(71,85,105,0.1)',
          borderColor:     isAuto ? C.purpleBorder : isOpen ? C.brandBorder : 'rgba(71,85,105,0.2)',
        }]}>
          <Feather
            name={isAuto ? 'zap' : isOpen ? 'droplet' : 'x-circle'}
            size={11}
            color={isAuto ? C.purple : isOpen ? C.brand : C.textMuted}
          />
          <Text style={[s.detailTxt, {
            color: isAuto ? C.purple : isOpen ? C.brand : C.textMuted,
            fontWeight: '800',
          }]}>
            {isAuto ? 'AUTO' : isOpen ? 'MANUAL OPEN' : 'MANUAL CLOSE'}
          </Text>
        </View>
      </View>

      {/* ── Control buttons ──────────────────────────────────── */}
      <View style={s.ctrlRow}>
        {/* AUTO */}
        <TouchableOpacity
          onPress={() => press('AUTO')}
          activeOpacity={0.7}
          style={[s.ctrlBtn, isAuto
            ? { backgroundColor: C.purpleGlow, borderColor: C.purpleBorder }
            : { backgroundColor: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.08)' },
          ]}
        >
          <Feather name="zap" size={13} color={isAuto ? C.purple : C.textMuted} />
          <Text style={[s.ctrlTxt, { color: isAuto ? C.purple : C.textMuted }]}>AUTO</Text>
        </TouchableOpacity>

        {/* OPEN */}
        <TouchableOpacity
          onPress={() => press('OPEN')}
          activeOpacity={0.7}
          style={[s.ctrlBtn, isOpen
            ? { backgroundColor: C.skyGlow, borderColor: C.skyBorder }
            : { backgroundColor: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.08)' },
          ]}
        >
          <Feather name="droplet" size={13} color={isOpen ? C.sky : C.textMuted} />
          <Text style={[s.ctrlTxt, { color: isOpen ? C.sky : C.textMuted }]}>OPEN</Text>
        </TouchableOpacity>

        {/* CLOSE */}
        <TouchableOpacity
          onPress={() => press('CLOSE')}
          activeOpacity={0.7}
          style={[s.ctrlBtn, isClosed
            ? { backgroundColor: C.dangerGlow, borderColor: C.dangerBorder }
            : { backgroundColor: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.08)' },
          ]}
        >
          <Feather name="x-circle" size={13} color={isClosed ? C.danger : C.textMuted} />
          <Text style={[s.ctrlTxt, { color: isClosed ? C.danger : C.textMuted }]}>CLOSE</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Stat pill ────────────────────────────────────────────────────────────
function StatPill({ icon, value, label, color }: {
  icon: React.ComponentProps<typeof Feather>['name'];
  value: string; label: string; color: string;
}) {
  return (
    <View style={[s.statPill, { borderColor: color + '35' }]}>
      <Feather name={icon} size={14} color={color} />
      <Text style={[s.statNum, { color }]}>{value}</Text>
      <Text style={s.statLbl}>{label}</Text>
    </View>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────
export default function FarmDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router  = useRouter();

  const [farm, setFarm]         = useState<any>(null);
  const [zones, setZones]       = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // ── Bulk action confirmation pill ─────────────────────────────────────
  const [bulkMsg, setBulkMsg] = useState<string | null>(null);
  const bulkAnim = useRef(new Animated.Value(0)).current;

  const showBulk = (msg: string) => {
    setBulkMsg(msg);
    Animated.sequence([
      Animated.timing(bulkAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
      Animated.delay(1600),
      Animated.timing(bulkAnim, { toValue: 0, duration: 350, useNativeDriver: true }),
    ]).start(() => setBulkMsg(null));
  };

  const load = useCallback(async () => {
    if (!id) return;
    try {
      const [zoneRes] = await Promise.all([
        farmService.getZonesByFarm(id),
        farmService.getFarm(id).then((r: any) => setFarm(r.data)).catch(() => {}),
      ]);
      const zData: any[] = zoneRes.data || [];

      // Enrich with soil moisture
      const enriched = await Promise.all(
        zData.map(async (z: any) => {
          try {
            const mr = await telemetryService.getMoistureReadings(z.id);
            const rd: any[] = mr.data || [];
            if (rd.length > 0)
              return { ...z, latestMoisture: rd[rd.length - 1].moisturePercentage };
          } catch { /* skip */ }
          return z;
        })
      );
      setZones(enriched);
    } catch { /* silent */ }
    finally { setLoading(false); setRefreshing(false); }
  }, [id]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    if (!loading)
      Animated.timing(fadeAnim, { toValue: 1, duration: 450, useNativeDriver: true }).start();
  }, [loading]);

  const onRefresh = () => { setRefreshing(true); load(); };

  // ── Per-zone command ──────────────────────────────────────────────────
  const handleCmd = async (zoneId: string, mode: ZoneMode) => {
    const statusMap: Record<ZoneMode, string> = {
      AUTO:  'Active',
      OPEN:  'Irrigating',
      CLOSE: 'Idle',
    };
    const newStatus = statusMap[mode];
    setZones(prev => prev.map(z => z.id === zoneId ? { ...z, status: newStatus } : z));
    try { await telemetryService.updateValveStatus(zoneId, newStatus); } catch { /* silent */ }
  };

  // ── Bulk commands ─────────────────────────────────────────────────────
  const handleBulk = async (mode: ZoneMode) => {
    Vibration.vibrate([0, 30, 60, 30]);
    const labels: Record<ZoneMode, string> = {
      AUTO:  'All zones → AUTO',
      OPEN:  'All valves → OPEN',
      CLOSE: 'All valves → CLOSED',
    };
    showBulk(labels[mode]);
    const statusMap: Record<ZoneMode, string> = {
      AUTO:  'Active',
      OPEN:  'Irrigating',
      CLOSE: 'Idle',
    };
    const newStatus = statusMap[mode];
    setZones(prev => prev.map(z => ({ ...z, status: newStatus })));
    await Promise.allSettled(
      zones.map(z => telemetryService.updateValveStatus(z.id, newStatus))
    );
  };

  // ── Derived stats ─────────────────────────────────────────────────────
  const irrigatingCount = zones.filter(z => z.status === 'Irrigating').length;
  const autoCount       = zones.filter(z => z.status === 'Active').length;
  const moistureZones   = zones.filter(z => z.latestMoisture != null);
  const avgMoisture     = moistureZones.length > 0
    ? moistureZones.reduce((a, z) => a + z.latestMoisture, 0) / moistureZones.length
    : null;

  return (
    <View style={s.root}>

      {/* ── Header ───────────────────────────────────────────────────── */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Feather name="arrow-left" size={20} color={C.brand} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={s.headerTitle} numberOfLines={1}>
            {farm?.farmName ?? farm?.name ?? 'Farm Overview'}
          </Text>
          {(farm?.district || farm?.province) && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Feather name="map-pin" size={10} color={C.brand} />
              <Text style={s.headerSub}>
                {[farm?.district, farm?.province].filter(Boolean).join(', ')}
              </Text>
            </View>
          )}
        </View>
        <TouchableOpacity
          onPress={() => router.push(`/farms/${id}/zones/index` as any)}
          style={s.moreBtn}
        >
          <Feather name="settings" size={16} color={C.brand} />
        </TouchableOpacity>
      </View>

      {/* ── Bulk confirm toast ────────────────────────────────────────── */}
      {bulkMsg && (
        <Animated.View style={[s.bulkToast, { opacity: bulkAnim }]}>
          <Feather name="check-circle" size={14} color={C.brand} />
          <Text style={s.bulkToastTxt}>{bulkMsg}</Text>
        </Animated.View>
      )}

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={s.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.brand} colors={[C.brand]} />}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fadeAnim }}>

          {/* ── Quick stats strip ─────────────────────────────────────── */}
          <View style={s.statsStrip}>
            <StatPill icon="grid"     value={String(zones.length)} label="Zones"      color={C.sky}   />
            <StatPill icon="droplet"  value={String(irrigatingCount)} label="Irrigating" color={C.brand} />
            <StatPill icon="zap"      value={String(autoCount)}   label="Auto"       color={C.purple} />
            <StatPill icon="activity" value={avgMoisture != null ? `${avgMoisture.toFixed(0)}%` : '—'} label="Moisture" color={C.amber} />
          </View>

          {/* ── BULK CONTROL BAR ──────────────────────────────────────── */}
          <View style={s.bulkSection}>
            <View style={s.bulkSectionHead}>
              <View style={s.sectionBar} />
              <Feather name="sliders" size={14} color={C.brand} />
              <Text style={s.sectionTitle}>ALL ZONES CONTROL</Text>
            </View>
            <View style={s.bulkRow}>
              {/* AUTO ALL */}
              <TouchableOpacity
                onPress={() => handleBulk('AUTO')}
                activeOpacity={0.75}
                style={[s.bulkBtn, { borderColor: C.purpleBorder, backgroundColor: C.purpleGlow }]}
              >
                <Feather name="zap" size={16} color={C.purple} />
                <Text style={[s.bulkBtnLabel, { color: C.purple }]}>AUTO ALL</Text>
                <Text style={[s.bulkBtnSub, { color: C.purple + '99' }]}>System control</Text>
              </TouchableOpacity>

              {/* OPEN ALL */}
              <TouchableOpacity
                onPress={() => handleBulk('OPEN')}
                activeOpacity={0.75}
                style={[s.bulkBtn, { borderColor: C.skyBorder, backgroundColor: C.skyGlow }]}
              >
                <Feather name="droplet" size={16} color={C.sky} />
                <Text style={[s.bulkBtnLabel, { color: C.sky }]}>OPEN ALL</Text>
                <Text style={[s.bulkBtnSub, { color: C.sky + '99' }]}>Start irrigation</Text>
              </TouchableOpacity>

              {/* CLOSE ALL */}
              <TouchableOpacity
                onPress={() => handleBulk('CLOSE')}
                activeOpacity={0.75}
                style={[s.bulkBtn, { borderColor: C.dangerBorder, backgroundColor: C.dangerGlow }]}
              >
                <Feather name="x-circle" size={16} color={C.danger} />
                <Text style={[s.bulkBtnLabel, { color: C.danger }]}>CLOSE ALL</Text>
                <Text style={[s.bulkBtnSub, { color: C.danger + '99' }]}>Stop irrigation</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* ── Zone branch cards ────────────────────────────────────── */}
          <View style={s.branchSectionHead}>
            <View style={s.sectionBar} />
            <Feather name="git-branch" size={14} color={C.brand} />
            <Text style={s.sectionTitle}>IRRIGATION BRANCH NODES</Text>
            <Text style={s.sectionCount}>{irrigatingCount}/{zones.length} ACTIVE</Text>
          </View>

          {zones.length > 0 ? (
            <View style={{ gap: 14, marginBottom: 20 }}>
              {zones.map(zone => (
                <ZoneBranchCard
                  key={zone.id}
                  zone={zone}
                  onCmd={handleCmd}
                />
              ))}
            </View>
          ) : !loading ? (
            <View style={s.emptyCard}>
              <Feather name="git-branch" size={40} color={C.textMuted} />
              <Text style={s.emptyTitle}>No zones configured</Text>
              <Text style={s.emptyText}>Create your first irrigation zone to start controlling the farm.</Text>
              <TouchableOpacity
                onPress={() => router.push(`/farms/${id}/zones/create` as any)}
                style={s.createBtn}
              >
                <Feather name="plus" size={16} color="#fff" />
                <Text style={s.createBtnTxt}>Create First Zone</Text>
              </TouchableOpacity>
            </View>
          ) : null}

          {/* ── Navigate to detailed hardware ────────────────────────── */}
          <View style={s.branchSectionHead}>
            <View style={s.sectionBar} />
            <Feather name="tool" size={14} color={C.brand} />
            <Text style={s.sectionTitle}>HARDWARE</Text>
          </View>
          <View style={s.hwCard}>
            {[
              { icon: 'settings' as const, label: 'Zone Management', sub: 'Create · Edit · Delete zones', route: `/farms/${id}/zones/index` },
              { icon: 'zap'      as const, label: 'Motors',           sub: 'Pump & motor controllers',      route: `/farms/${id}/hardware/motors` },
              { icon: 'toggle-right' as const, label: 'Valves',       sub: 'Individual valve control',      route: `/farms/${id}/hardware/valves` },
            ].map((item, i, arr) => (
              <View key={item.label}>
                <TouchableOpacity
                  onPress={() => router.push(item.route as any)}
                  activeOpacity={0.8}
                  style={s.hwRow}
                >
                  <View style={[s.hwIcon, { backgroundColor: C.brandGlow, borderColor: C.brandBorder }]}>
                    <Feather name={item.icon} size={16} color={C.brand} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.hwLabel}>{item.label}</Text>
                    <Text style={s.hwSub}>{item.sub}</Text>
                  </View>
                  <Feather name="chevron-right" size={16} color={C.textMuted} />
                </TouchableOpacity>
                {i < arr.length - 1 && <View style={s.hwDivider} />}
              </View>
            ))}
          </View>

          <View style={s.footerRow}>
            <Feather name="activity" size={10} color={C.textMuted} />
            <Text style={s.footer}>FloraX Smart Agriculture  •  Pull to refresh</Text>
          </View>

        </Animated.View>
      </ScrollView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },

  header: {
    paddingTop: 56, paddingBottom: 16, paddingHorizontal: 20,
    backgroundColor: '#0a1520',
    borderBottomWidth: 1, borderBottomColor: 'rgba(16,185,129,0.18)',
    flexDirection: 'row', alignItems: 'center', gap: 12,
  },
  backBtn:     { width: 36, height: 36, borderRadius: 10, backgroundColor: C.brandGlow, borderWidth: 1, borderColor: C.brandBorder, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '900', color: C.textPri },
  headerSub:   { fontSize: 10, color: C.brand, fontWeight: '600' },
  moreBtn:     { width: 36, height: 36, borderRadius: 10, backgroundColor: C.brandGlow, borderWidth: 1, borderColor: C.brandBorder, alignItems: 'center', justifyContent: 'center' },

  bulkToast: {
    position: 'absolute', top: 120, alignSelf: 'center', zIndex: 99,
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#0d2218', borderWidth: 1, borderColor: C.brandBorder,
    paddingHorizontal: 18, paddingVertical: 10, borderRadius: 24,
  },
  bulkToastTxt: { fontSize: 13, fontWeight: '700', color: C.brand },

  scroll: { padding: 16, paddingBottom: 40 },

  // Stats strip
  statsStrip: { flexDirection: 'row', gap: 8, marginBottom: 18 },
  statPill:   { flex: 1, alignItems: 'center', gap: 3, backgroundColor: C.card, borderRadius: 14, borderWidth: 1, paddingVertical: 10 },
  statNum:    { fontSize: 18, fontWeight: '900' },
  statLbl:    { fontSize: 8, fontWeight: '700', color: C.textMuted, textTransform: 'uppercase', letterSpacing: 0.7 },

  // Bulk controls
  bulkSection:     { marginBottom: 18 },
  bulkSectionHead: { flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 12 },
  sectionBar:      { width: 4, height: 18, backgroundColor: C.brand, borderRadius: 4 },
  sectionTitle:    { fontSize: 11, fontWeight: '800', color: C.textSec, letterSpacing: 1.5, textTransform: 'uppercase' },
  sectionCount:    { marginLeft: 'auto', fontSize: 10, fontWeight: '700', color: C.brand, letterSpacing: 0.5 },
  bulkRow:         { flexDirection: 'row', gap: 10 },
  bulkBtn:         { flex: 1, alignItems: 'center', gap: 4, paddingVertical: 14, borderRadius: 16, borderWidth: 1.5 },
  bulkBtnLabel:    { fontSize: 11, fontWeight: '900', letterSpacing: 0.5 },
  bulkBtnSub:      { fontSize: 9, fontWeight: '600' },

  // Branch section heading
  branchSectionHead: { flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 12 },

  // Zone branch card
  zoneCard: {
    backgroundColor: C.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
    borderLeftWidth: 4,
    padding: 14,
    gap: 11,
  },
  zoneTop:    { flexDirection: 'row', alignItems: 'flex-start', gap: 4 },
  zoneNum:    { fontSize: 9, fontWeight: '700', color: C.textMuted, letterSpacing: 1.5, textTransform: 'uppercase' },
  zoneName:   { fontSize: 15, fontWeight: '800', color: C.textPri },
  zoneCrop:   { fontSize: 10, color: C.textSec, marginTop: 1 },

  statusBadge:    { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 9, paddingVertical: 4, borderRadius: 20, borderWidth: 1 },
  pulseDot:       { width: 7, height: 7, borderRadius: 4 },
  statusBadgeTxt: { fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },
  valveBadge:     { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, borderWidth: 1 },
  valveTxt:       { fontSize: 9, fontWeight: '700', letterSpacing: 0.3 },

  // Moisture bar
  moistSection: { gap: 6 },
  moistHeader:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  moistLabel:   { fontSize: 9, fontWeight: '700', color: C.textMuted, letterSpacing: 1, textTransform: 'uppercase' },
  moistValue:   { fontSize: 17, fontWeight: '900' },
  barTrack:     { height: 7, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 4, overflow: 'hidden' },
  barFill:      { height: '100%', borderRadius: 4 },

  // Detail chips
  detailRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  detailChip:{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 9, paddingVertical: 4, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', backgroundColor: 'rgba(255,255,255,0.02)' },
  detailTxt: { fontSize: 10, color: C.textSec, fontWeight: '600' },

  // Control buttons
  ctrlRow: { flexDirection: 'row', gap: 8 },
  ctrlBtn: {
    flex: 1, flexDirection: 'row', paddingVertical: 11,
    borderRadius: 11, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, gap: 5,
  },
  ctrlTxt: { fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },

  // Hardware section
  hwCard:    { backgroundColor: C.card, borderRadius: 16, borderWidth: 1, borderColor: C.border, overflow: 'hidden', marginBottom: 20 },
  hwRow:     { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  hwIcon:    { width: 38, height: 38, borderRadius: 11, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  hwLabel:   { fontSize: 14, fontWeight: '700', color: C.textPri },
  hwSub:     { fontSize: 11, color: C.textSec, marginTop: 1 },
  hwDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.04)', marginLeft: 64 },

  // Empty state
  emptyCard:    { backgroundColor: C.card, borderRadius: 18, padding: 48, alignItems: 'center', gap: 10, borderWidth: 1, borderColor: C.border, marginBottom: 20 },
  emptyTitle:   { fontSize: 17, fontWeight: '800', color: C.textPri },
  emptyText:    { fontSize: 12, color: C.textSec, textAlign: 'center', lineHeight: 18 },
  createBtn:    { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: C.brand, borderRadius: 12, paddingHorizontal: 20, paddingVertical: 12, marginTop: 8 },
  createBtnTxt: { fontSize: 14, fontWeight: '800', color: '#fff' },

  footerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 4, marginBottom: 8 },
  footer:    { fontSize: 10, color: C.textMuted, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' },
});
