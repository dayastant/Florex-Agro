import { Feather } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
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
import { farmService, getLoggedUser, telemetryService } from '../../apiservice/api';

// ─── Design tokens ────────────────────────────────────────────────────────
const C = {
  bg:         '#080d10',
  card:       '#0f1923',
  border:     'rgba(255,255,255,0.07)',
  brand:      '#10b981',
  brandGlow:  'rgba(16,185,129,0.14)',
  purple:     '#7c3aed',
  purpleGlow: 'rgba(124,58,237,0.14)',
  sky:        '#0284c7',
  amber:      '#f59e0b',
  danger:     '#ef4444',
  dangerGlow: 'rgba(239,68,68,0.14)',
  textPri:    '#e2e8f0',
  textSec:    '#94a3b8',
  textMuted:  '#475569',
};

// ─── Animated moisture bar ────────────────────────────────────────────────
function MoistureBar({ pct, color }: { pct: number; color: string }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.spring(anim, {
      toValue: pct, useNativeDriver: false, damping: 16, stiffness: 80,
    }).start();
  }, [pct]);
  const width = anim.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] });
  return (
    <View style={s.moTrack}>
      <Animated.View style={[s.moFill, { width, backgroundColor: color }]} />
    </View>
  );
}

// ─── Animated pulse dot ───────────────────────────────────────────────────
function PulseDot({ color }: { color: string }) {
  const scale = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scale, { toValue: 1.4, duration: 600, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 1,   duration: 600, useNativeDriver: true }),
      ])
    ).start();
  }, []);
  return (
    <Animated.View
      style={[s.dot, { backgroundColor: color, transform: [{ scale }] }]}
    />
  );
}

// ─── Control button (AUTO / OPEN / CLOSE) ────────────────────────────────
function CtrlBtn({
  label, icon, active, activeColor, activeGlow, onPress,
}: {
  label: string;
  icon: React.ComponentProps<typeof Feather>['name'];
  active: boolean;
  activeColor: string;
  activeGlow: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      style={[
        s.ctrlBtn,
        active
          ? { backgroundColor: activeGlow, borderColor: activeColor }
          : { backgroundColor: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.08)' },
      ]}
    >
      <Feather
        name={icon}
        size={14}
        color={active ? activeColor : C.textMuted}
      />
      <Text style={[s.ctrlBtnTxt, { color: active ? activeColor : C.textMuted }]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

// ─── Zone Node Card ───────────────────────────────────────────────────────
function ZoneCard({
  zone, onCmd,
}: {
  zone: any;
  onCmd: (id: string, mode: string) => void;
}) {
  const isOpen = zone.status === 'Irrigating';
  const isIdle = zone.status === 'Idle';
  const isAuto = zone.status === 'Active';

  const moisture  = zone.latestMoisture ?? null;
  const moColor   = moisture != null
    ? moisture > 60 ? C.brand : moisture > 35 ? C.amber : C.danger
    : C.textMuted;

  const accentColor  = isOpen ? C.brand : isAuto ? C.purple : C.textMuted;
  const valveBg      = isOpen ? C.brandGlow : 'rgba(71,85,105,0.18)';
  const valveBrd     = isOpen ? C.brand     : C.textMuted;
  const valveLabel   = isOpen ? 'OPEN'      : 'CLOSED';
  const valveColor   = isOpen ? C.brand     : C.textMuted;
  const modeLabel    = isAuto ? 'AUTO'      : 'MANUAL';
  const modeColor    = isAuto ? C.purple    : C.brand;
  const modeBg       = isAuto ? C.purpleGlow : C.brandGlow;

  const press = (mode: string) => { Vibration.vibrate(30); onCmd(zone.id, mode); };

  return (
    <View style={[s.nodeCard, { borderLeftColor: accentColor }]}>

      {/* ── Header row ─────────────────────────────────────────────── */}
      <View style={s.nodeHeader}>
        <View style={{ flex: 1 }}>
          <Text style={s.nodeCaption}>ZONE NODE</Text>
          <Text style={s.nodeName}>{zone.zoneName ?? zone.name ?? 'Zone'}</Text>
          {zone.cropType
            ? <Text style={s.nodeSub}>{zone.cropType}</Text>
            : null}
        </View>

        <View style={{ alignItems: 'flex-end', gap: 6 }}>
          {/* Online */}
          <View style={s.onlineRow}>
            <PulseDot color={C.brand} />
            <Text style={s.onlineTxt}>Online</Text>
          </View>
          {/* Valve badge */}
          <View style={[s.valveBadge, { backgroundColor: valveBg, borderColor: valveBrd }]}>
            <Feather name="droplet" size={10} color={valveColor} />
            <Text style={[s.valveLabel, { color: valveColor }]}>{valveLabel}</Text>
          </View>
        </View>
      </View>

      <View style={s.divider} />

      {/* ── Moisture section ───────────────────────────────────────── */}
      <View style={s.moSection}>
        <View style={s.moHeaderRow}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Feather name="activity" size={12} color={C.textMuted} />
            <Text style={s.moCaption}>SOIL MOISTURE</Text>
          </View>
          <Text style={[s.moValueTxt, { color: moColor }]}>
            {moisture != null ? `${Number(moisture).toFixed(0)}%` : '—'}
          </Text>
        </View>
        {moisture != null
          ? <MoistureBar pct={moisture} color={moColor} />
          : <Text style={s.noMoisture}>No reading yet</Text>}
      </View>

      {/* ── Detail grid ────────────────────────────────────────────── */}
      <View style={s.detailGrid}>
        {/* Control mode */}
        <View style={s.detailCell}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Feather name="cpu" size={10} color={C.textMuted} />
            <Text style={s.detailCaption}>MODE</Text>
          </View>
          <View style={[s.modePill, { backgroundColor: modeBg, borderColor: modeColor }]}>
            <Text style={[s.modePillTxt, { color: modeColor }]}>{modeLabel}</Text>
          </View>
        </View>
        {/* Soil type */}
        <View style={s.detailCell}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Feather name="layers" size={10} color={C.textMuted} />
            <Text style={s.detailCaption}>SOIL</Text>
          </View>
          <Text style={s.detailVal}>{zone.soilType ?? '—'}</Text>
        </View>
        {/* Area */}
        <View style={s.detailCell}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Feather name="maximize-2" size={10} color={C.textMuted} />
            <Text style={s.detailCaption}>AREA</Text>
          </View>
          <Text style={s.detailVal}>{zone.area != null ? `${zone.area} ha` : '—'}</Text>
        </View>
        {/* Crop */}
        <View style={s.detailCell}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Feather name="sun" size={10} color={C.textMuted} />
            <Text style={s.detailCaption}>CROP</Text>
          </View>
          <Text style={s.detailVal}>{zone.cropType ?? '—'}</Text>
        </View>
      </View>

      {/* ── Control buttons ────────────────────────────────────────── */}
      <View style={s.ctrlRow}>
        <CtrlBtn
          label="AUTO"
          icon="zap"
          active={isAuto}
          activeColor={C.purple}
          activeGlow={C.purpleGlow}
          onPress={() => press('AUTO')}
        />
        <CtrlBtn
          label="OPEN"
          icon="droplet"
          active={isOpen}
          activeColor={C.brand}
          activeGlow={C.brandGlow}
          onPress={() => press('OPEN')}
        />
        <CtrlBtn
          label="CLOSE"
          icon="x-circle"
          active={isIdle}
          activeColor={C.danger}
          activeGlow={C.dangerGlow}
          onPress={() => press('CLOSE')}
        />
      </View>
    </View>
  );
}

// ─── Farm section ─────────────────────────────────────────────────────────
function FarmSection({
  farm, zones, onCmd,
}: {
  farm: any;
  zones: any[];
  onCmd: (id: string, mode: string) => void;
}) {
  const openCount = zones.filter(z => z.status === 'Irrigating').length;
  return (
    <View style={s.farmSection}>
      <View style={s.farmHead}>
        <View style={{ flex: 1 }}>
          <Text style={s.farmCaption}>FARM</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Feather name="home" size={14} color={C.brand} />
            <Text style={s.farmName}>{farm.farmName ?? farm.name ?? 'Unnamed Farm'}</Text>
          </View>
          {(farm.district || farm.province) ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 }}>
              <Feather name="map-pin" size={10} color={C.textSec} />
              <Text style={s.farmLoc}>
                {[farm.district, farm.province].filter(Boolean).join(', ')}
              </Text>
            </View>
          ) : null}
        </View>
        <View style={s.openBadge}>
          <Text style={s.openBadgeNum}>{openCount}</Text>
          <Text style={s.openBadgeLbl}>irrigating</Text>
        </View>
      </View>

      {zones.length > 0 ? (
        <View style={s.zonesWrap}>
          {zones.map(zone => (
            <ZoneCard key={zone.id} zone={zone} onCmd={onCmd} />
          ))}
        </View>
      ) : (
        <View style={s.emptyZone}>
          <Feather name="inbox" size={20} color={C.textMuted} />
          <Text style={s.emptyZoneText}>No zones registered for this farm.</Text>
        </View>
      )}
    </View>
  );
}

// ─── Loading dots ─────────────────────────────────────────────────────────
function LoadDot({ delay }: { delay: number }) {
  const a = useRef(new Animated.Value(0.3)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(a, { toValue: 1,   duration: 400, useNativeDriver: true }),
        Animated.timing(a, { toValue: 0.3, duration: 400, useNativeDriver: true }),
      ])
    ).start();
  }, []);
  return <Animated.View style={[s.loadDot, { opacity: a }]} />;
}

// ─── Main screen ──────────────────────────────────────────────────────────
export default function IrrigationScreen() {
  const [farms, setFarms]               = useState<any[]>([]);
  const [farmZonesMap, setFarmZonesMap] = useState<Record<string, any[]>>({});
  const [loading, setLoading]           = useState(true);
  const [refreshing, setRefreshing]     = useState(false);
  const [error, setError]               = useState<string | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const loadData = async () => {
    try {
      setError(null);
      const cu     = getLoggedUser();
      const isTech = cu?.roleId === '33333333-3333-3333-3333-333333333333';
      const res    = await farmService.getFarms(isTech ? undefined : cu?.id);
      const farmsData: any[] = res.data || [];
      setFarms(farmsData);

      const map: Record<string, any[]> = {};
      await Promise.all(
        farmsData.map(async (f: any) => {
          try {
            const zr  = await farmService.getZonesByFarm(f.id);
            const zones: any[] = zr.data || [];
            map[f.id] = await Promise.all(
              zones.map(async (z: any) => {
                try {
                  const mr = await telemetryService.getMoistureReadings(z.id);
                  const readings: any[] = mr.data || [];
                  if (readings.length) {
                    return { ...z, latestMoisture: readings[readings.length - 1].moisturePercentage };
                  }
                } catch { /* no reading */ }
                return z;
              })
            );
          } catch { map[f.id] = []; }
        })
      );
      setFarmZonesMap(map);
    } catch {
      setError('Connection failed. Pull down to retry.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { loadData(); }, []);
  useEffect(() => {
    if (!loading)
      Animated.timing(fadeAnim, { toValue: 1, duration: 450, useNativeDriver: true }).start();
  }, [loading]);

  const onRefresh = () => { setRefreshing(true); loadData(); };

  const handleCmd = async (zoneId: string, mode: string) => {
    const statusMap: Record<string, string> = {
      OPEN: 'Irrigating', CLOSE: 'Idle', AUTO: 'Active',
    };
    const newStatus = statusMap[mode] ?? 'Active';
    setFarmZonesMap(prev => {
      const next = { ...prev };
      for (const fid of Object.keys(next))
        next[fid] = next[fid].map(z => z.id === zoneId ? { ...z, status: newStatus } : z);
      return next;
    });
    try { await telemetryService.updateValveStatus(zoneId, newStatus); } catch { /* silent */ }
  };

  const allZones  = Object.values(farmZonesMap).flat();
  const totalOpen = allZones.filter(z => z.status === 'Irrigating').length;
  const totalAuto = allZones.filter(z => z.status === 'Active').length;
  const totalIdle = allZones.filter(z => z.status === 'Idle').length;

  // ── Loading state ───────────────────────────────────────────────────────
  if (loading) {
    return (
      <View style={[s.root, { justifyContent: 'center', alignItems: 'center', gap: 16 }]}>
        <Feather name="droplet" size={44} color={C.brand} />
        <Text style={s.loadText}>Connecting to Actuators…</Text>
        <View style={{ flexDirection: 'row', gap: 6 }}>
          {[0, 1, 2].map(i => <LoadDot key={i} delay={i * 200} />)}
        </View>
      </View>
    );
  }

  return (
    <View style={s.root}>

      {/* ── Header ───────────────────────────────────────────────────── */}
      <View style={s.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <View style={s.logoIconWrap}>
            <Feather name="droplet" size={18} color={C.brand} />
          </View>
          <View>
            <Text style={s.headerTitle}>FloraX</Text>
            <Text style={s.headerSub}>IRRIGATION CONTROL</Text>
          </View>
        </View>
        <View style={s.statBubble}>
          <Text style={s.statNum}>{totalOpen}</Text>
          <Text style={s.statLbl}>Active</Text>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={s.scroll}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={C.brand}
            colors={[C.brand]}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Error banner */}
        {error && (
          <View style={s.errorBanner}>
            <Feather name="alert-triangle" size={14} color="#fca5a5" />
            <Text style={s.errorText}>{error}</Text>
          </View>
        )}

        {/* ── Summary strip ──────────────────────────────────────────── */}
        <View style={s.strip}>
          <View style={s.stripItem}>
            <Feather name="home" size={14} color={C.brand} />
            <Text style={[s.stripNum, { color: C.brand }]}>{farms.length}</Text>
            <Text style={s.stripLbl}>Farms</Text>
          </View>
          <View style={s.stripDiv} />
          <View style={s.stripItem}>
            <Feather name="grid" size={14} color={C.sky} />
            <Text style={[s.stripNum, { color: C.sky }]}>{allZones.length}</Text>
            <Text style={s.stripLbl}>Zones</Text>
          </View>
          <View style={s.stripDiv} />
          <View style={s.stripItem}>
            <Feather name="droplet" size={14} color={C.brand} />
            <Text style={[s.stripNum, { color: C.brand }]}>{totalOpen}</Text>
            <Text style={s.stripLbl}>Open</Text>
          </View>
          <View style={s.stripDiv} />
          <View style={s.stripItem}>
            <Feather name="zap" size={14} color={C.purple} />
            <Text style={[s.stripNum, { color: C.purple }]}>{totalAuto}</Text>
            <Text style={s.stripLbl}>Auto</Text>
          </View>
          <View style={s.stripDiv} />
          <View style={s.stripItem}>
            <Feather name="x-circle" size={14} color={C.danger} />
            <Text style={[s.stripNum, { color: C.danger }]}>{totalIdle}</Text>
            <Text style={s.stripLbl}>Idle</Text>
          </View>
        </View>

        {/* ── Section heading ────────────────────────────────────────── */}
        <View style={s.sectionHead}>
          <View style={s.sectionBar} />
          <Feather name="git-branch" size={14} color={C.brand} />
          <Text style={s.sectionTitle}>Irrigation Branch Nodes</Text>
        </View>

        {/* ── Farm + Zone cards ──────────────────────────────────────── */}
        <Animated.View style={{ opacity: fadeAnim }}>
          {farms.length > 0 ? (
            <View style={{ gap: 16, marginBottom: 16 }}>
              {farms.map(farm => (
                <FarmSection
                  key={farm.id}
                  farm={farm}
                  zones={farmZonesMap[farm.id] ?? []}
                  onCmd={handleCmd}
                />
              ))}
            </View>
          ) : (
            <View style={s.emptyCard}>
              <Feather name="map" size={36} color={C.textMuted} />
              <Text style={s.emptyText}>No farms found for your account.</Text>
            </View>
          )}
        </Animated.View>

        {/* Footer */}
        <View style={s.footerRow}>
          <Feather name="activity" size={10} color={C.textMuted} />
          <Text style={s.footer}>FloraX Smart Agriculture  •  Brain + Branches</Text>
        </View>
      </ScrollView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root:     { flex: 1, backgroundColor: C.bg },
  loadText: { color: C.brand, fontSize: 13, fontWeight: '700', letterSpacing: 1 },
  loadDot:  { width: 8, height: 8, borderRadius: 4, backgroundColor: C.brand },

  // Header
  header: {
    paddingTop: 56, paddingBottom: 16, paddingHorizontal: 20,
    backgroundColor: '#0a1520',
    borderBottomWidth: 1, borderBottomColor: 'rgba(16,185,129,0.18)',
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  logoIconWrap: {
    width: 38, height: 38, borderRadius: 12,
    backgroundColor: 'rgba(16,185,129,0.12)', borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.25)', alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { fontSize: 22, fontWeight: '900', color: C.textPri, letterSpacing: -0.5 },
  headerSub:   { fontSize: 9,  fontWeight: '700', color: C.brand, letterSpacing: 1.5, marginTop: 1 },
  statBubble: {
    backgroundColor: 'rgba(16,185,129,0.12)', borderWidth: 1, borderColor: 'rgba(16,185,129,0.3)',
    borderRadius: 14, paddingHorizontal: 14, paddingVertical: 8, alignItems: 'center',
  },
  statNum: { fontSize: 22, fontWeight: '900', color: C.brand },
  statLbl: { fontSize: 9, fontWeight: '700', color: C.textSec, textTransform: 'uppercase', letterSpacing: 1 },

  // Scroll
  scroll: { padding: 16, paddingBottom: 40 },

  // Error banner
  errorBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: 'rgba(239,68,68,0.1)', borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)',
    borderRadius: 12, padding: 12, marginBottom: 16,
  },
  errorText: { color: '#fca5a5', fontSize: 12, fontWeight: '600', flex: 1 },

  // Summary strip
  strip:     { flexDirection: 'row', backgroundColor: C.card, borderRadius: 16, borderWidth: 1, borderColor: C.border, padding: 14, marginBottom: 20 },
  stripItem: { flex: 1, alignItems: 'center', gap: 3 },
  stripNum:  { fontSize: 18, fontWeight: '900' },
  stripLbl:  { fontSize: 9, fontWeight: '700', color: C.textMuted, textTransform: 'uppercase', letterSpacing: 0.8 },
  stripDiv:  { width: 1, backgroundColor: 'rgba(255,255,255,0.07)', marginHorizontal: 2 },

  // Section heading
  sectionHead:  { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  sectionBar:   { width: 4, height: 18, backgroundColor: C.brand, borderRadius: 4 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: C.textPri, letterSpacing: -0.3 },

  // Farm section
  farmSection: { backgroundColor: C.card, borderRadius: 18, borderWidth: 1, borderColor: C.border, overflow: 'hidden' },
  farmHead: { flexDirection: 'row', alignItems: 'flex-start', padding: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)' },
  farmCaption: { fontSize: 9, fontWeight: '700', color: C.textMuted, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 4 },
  farmName: { fontSize: 16, fontWeight: '800', color: C.textPri },
  farmLoc:  { fontSize: 11, color: C.textSec },
  openBadge:    { backgroundColor: 'rgba(16,185,129,0.12)', borderWidth: 1, borderColor: 'rgba(16,185,129,0.25)', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 6, alignItems: 'center' },
  openBadgeNum: { fontSize: 18, fontWeight: '900', color: C.brand },
  openBadgeLbl: { fontSize: 9, fontWeight: '700', color: C.textSec, textTransform: 'uppercase' },
  zonesWrap: { padding: 12, gap: 12 },
  emptyZone: { padding: 20, alignItems: 'center', gap: 8 },
  emptyZoneText: { color: C.textSec, fontSize: 12, fontWeight: '600', fontStyle: 'italic' },

  // Node card
  nodeCard: {
    backgroundColor: '#111d27', borderRadius: 14,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
    borderLeftWidth: 4, padding: 14, gap: 12,
  },
  nodeHeader:  { flexDirection: 'row', alignItems: 'flex-start' },
  nodeCaption: { fontSize: 9, fontWeight: '700', color: C.textMuted, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 2 },
  nodeName:    { fontSize: 15, fontWeight: '800', color: C.textPri },
  nodeSub:     { fontSize: 11, color: C.textSec, marginTop: 2 },
  divider:     { height: 1, backgroundColor: 'rgba(255,255,255,0.05)' },

  // Online indicator
  onlineRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 6 },
  dot:       { width: 7, height: 7, borderRadius: 4 },
  onlineTxt: { fontSize: 10, fontWeight: '700', color: C.brand },

  // Valve badge
  valveBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, borderWidth: 1 },
  valveLabel: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },

  // Moisture
  moSection:   { gap: 6 },
  moHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  moCaption:   { fontSize: 9, fontWeight: '700', color: C.textMuted, letterSpacing: 1, textTransform: 'uppercase' },
  moValueTxt:  { fontSize: 16, fontWeight: '900' },
  moTrack:     { height: 7, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 4, overflow: 'hidden' },
  moFill:      { height: '100%', borderRadius: 4 },
  noMoisture:  { fontSize: 11, color: C.textMuted, fontStyle: 'italic' },

  // Detail grid
  detailGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 10,
    backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: 12,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.04)', padding: 10,
  },
  detailCell:    { width: '47%', gap: 4 },
  detailCaption: { fontSize: 9, fontWeight: '700', color: C.textMuted, letterSpacing: 1, textTransform: 'uppercase' },
  detailVal:     { fontSize: 12, fontWeight: '700', color: C.textSec },

  // Mode pill
  modePill:    { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, borderWidth: 1 },
  modePillTxt: { fontSize: 11, fontWeight: '800' },

  // Control buttons
  ctrlRow:    { flexDirection: 'row', gap: 8 },
  ctrlBtn:    { flex: 1, paddingVertical: 11, borderRadius: 12, alignItems: 'center', borderWidth: 1, gap: 4, flexDirection: 'row', justifyContent: 'center' },
  ctrlBtnTxt: { fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },

  // Empty / footer
  emptyCard: { backgroundColor: C.card, borderRadius: 18, padding: 40, alignItems: 'center', gap: 12, borderWidth: 1, borderColor: C.border },
  emptyText: { color: C.textSec, fontSize: 13, fontWeight: '600' },
  footerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 8, marginBottom: 16 },
  footer:    { fontSize: 10, color: C.textMuted, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' },
});
