import { Feather } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  dashboardService,
  farmService,
  getLoggedUser,
  hardwareService,
  telemetryService,
} from '../../apiservice/api';

// ─── Design tokens ────────────────────────────────────────────────────────
const C = {
  bg:       '#080d10',
  card:     '#0f1923',
  border:   'rgba(255,255,255,0.07)',
  acBorder: 'rgba(16,185,129,0.22)',
  brand:    '#10b981',
  sky:      '#38bdf8',
  amber:    '#f59e0b',
  danger:   '#ef4444',
  textPri:  '#e2e8f0',
  textSec:  '#94a3b8',
  textMuted:'#475569',
};

// ─── Animated progress bar ────────────────────────────────────────────────
function AnimBar({ pct, color }: { pct: number; color: string }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.spring(anim, { toValue: pct, useNativeDriver: false, damping: 18, stiffness: 80 }).start();
  }, [pct]);
  const width = anim.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] });
  return (
    <View style={s.barTrack}>
      <Animated.View style={[s.barFill, { width, backgroundColor: color }]} />
    </View>
  );
}

// ─── Metric chip ──────────────────────────────────────────────────────────
function Chip({
  icon, label, value, color,
}: {
  icon: React.ComponentProps<typeof Feather>['name'];
  label: string;
  value: string;
  color: string;
}) {
  return (
    <View style={[s.chip, { borderColor: color + '30' }]}>
      <View style={[s.chipIconWrap, { backgroundColor: color + '18' }]}>
        <Feather name={icon} size={16} color={color} />
      </View>
      <Text style={[s.chipValue, { color }]}>{value}</Text>
      <Text style={s.chipLabel}>{label}</Text>
    </View>
  );
}

// ─── Section header ───────────────────────────────────────────────────────
function SectionHead({
  icon, title,
}: {
  icon: React.ComponentProps<typeof Feather>['name'];
  title: string;
}) {
  return (
    <View style={s.sectionHead}>
      <View style={s.sectionBar} />
      <Feather name={icon} size={14} color={C.brand} />
      <Text style={s.sectionTitle}>{title}</Text>
    </View>
  );
}

// ─── Loading dots ─────────────────────────────────────────────────────────
function Dot({ delay }: { delay: number }) {
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
  return <Animated.View style={[s.dot, { opacity: a }]} />;
}

// ─── Farm card with zones ─────────────────────────────────────────────────
function FarmCard({ farm, zones }: { farm: any; zones: any[] }) {
  return (
    <View style={[s.farmCard, { borderColor: C.acBorder }]}>
      <View style={s.farmHeader}>
        <View style={{ flex: 1 }}>
          <Text style={s.farmLabel}>FARM</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Feather name="home" size={14} color={C.brand} />
            <Text style={s.farmName}>{farm.farmName ?? farm.name ?? 'Unnamed Farm'}</Text>
          </View>
          {farm.location ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 }}>
              <Feather name="map-pin" size={10} color={C.textSec} />
              <Text style={s.farmLocation}>{farm.location}</Text>
            </View>
          ) : null}
        </View>
        <View style={s.zoneBadge}>
          <Text style={s.zoneBadgeNum}>{zones.length}</Text>
          <Text style={s.zoneBadgeLbl}>zones</Text>
        </View>
      </View>

      {zones.length > 0 && (
        <View style={s.zonesWrap}>
          {zones.map((zone, idx) => {
            const isIrrigating = zone.status === 'Irrigating';
            const moisture = zone.latestMoisture ?? zone.moisturePercentage ?? null;
            const moColor = moisture != null
              ? moisture > 60 ? C.brand : moisture > 35 ? C.amber : C.danger
              : C.textMuted;

            return (
              <View key={zone.id} style={[s.zoneRow, idx < zones.length - 1 && s.zoneRowBorder]}>
                <View style={[s.zoneIndicator, { backgroundColor: isIrrigating ? C.brand : C.textMuted }]} />
                <View style={{ flex: 1 }}>
                  <Text style={s.zoneName}>{zone.zoneName ?? zone.name ?? 'Zone'}</Text>
                  {zone.cropType ? <Text style={s.zoneCrop}>{zone.cropType}</Text> : null}
                </View>
                <View style={s.zoneRight}>
                  {moisture != null && (
                    <Text style={[s.zoneMoisture, { color: moColor }]}>{moisture.toFixed(0)}%</Text>
                  )}
                  <View style={[s.zoneStatus, {
                    backgroundColor: isIrrigating ? 'rgba(16,185,129,0.14)' : 'rgba(71,85,105,0.2)',
                    borderColor: isIrrigating ? C.brand : C.textMuted,
                  }]}>
                    <Text style={[s.zoneStatusText, { color: isIrrigating ? C.brand : C.textMuted }]}>
                      {isIrrigating ? 'ON' : 'OFF'}
                    </Text>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────
export default function HomeScreen() {
  const [summary, setSummary]           = useState<any>(null);
  const [farms, setFarms]               = useState<any[]>([]);
  const [farmZonesMap, setFarmZonesMap] = useState<Record<string, any[]>>({});
  const [tanks, setTanks]               = useState<any[]>([]);
  const [loading, setLoading]           = useState(true);
  const [refreshing, setRefreshing]     = useState(false);
  const [error, setError]               = useState<string | null>(null);

  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  const loadData = async () => {
    try {
      setError(null);
      const currentUser = getLoggedUser();
      const userId = currentUser?.id;

      const [summaryRes, farmsRes, tanksRes] = await Promise.all([
        dashboardService.getSummary(),
        farmService.getFarms(userId),
        hardwareService.getTanks(),
      ]);

      const farmsData: any[] = farmsRes.data || [];
      setSummary(summaryRes.data);
      setFarms(farmsData);
      setTanks(tanksRes.data || []);

      const zonesMap: Record<string, any[]> = {};
      await Promise.all(
        farmsData.map(async (farm: any) => {
          try {
            const zonesRes = await farmService.getZonesByFarm(farm.id);
            const zones: any[] = zonesRes.data || [];
            const enriched = await Promise.all(
              zones.map(async (zone: any) => {
                try {
                  const mRes = await telemetryService.getMoistureReadings(zone.id);
                  const readings: any[] = mRes.data || [];
                  if (readings.length > 0) {
                    return { ...zone, latestMoisture: readings[readings.length - 1].moisturePercentage };
                  }
                } catch { /* no readings yet */ }
                return zone;
              })
            );
            zonesMap[farm.id] = enriched;
          } catch {
            zonesMap[farm.id] = [];
          }
        })
      );
      setFarmZonesMap(zonesMap);
    } catch {
      setError('Connection failed. Pull down to retry.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { loadData(); }, []);
  useEffect(() => {
    if (!loading) {
      Animated.parallel([
        Animated.timing(fadeAnim,  { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
      ]).start();
    }
  }, [loading]);

  const onRefresh = () => { setRefreshing(true); loadData(); };

  if (loading) {
    return (
      <View style={[s.root, { justifyContent: 'center', alignItems: 'center', gap: 16 }]}>
        <Feather name="loader" size={40} color={C.brand} />
        <Text style={s.loadText}>Loading your farm data…</Text>
        <View style={{ flexDirection: 'row', gap: 6, marginTop: 8 }}>
          {[0, 1, 2].map(i => <Dot key={i} delay={i * 200} />)}
        </View>
      </View>
    );
  }

  const user        = getLoggedUser();
  const allZones    = Object.values(farmZonesMap).flat();
  const totalWater  = tanks.reduce((acc, t) => acc + (t.currentLevel ?? 0), 0);
  const totalCap    = tanks.reduce((acc, t) => acc + (t.capacityLiters ?? 1), 0);
  const tankPct     = totalCap > 0 ? Math.round((totalWater / totalCap) * 100) : 0;
  const isLow       = tankPct < 25;
  const activeTank  = tanks.find(t => (t.currentLevel ?? 0) > 0) ?? tanks[0];

  return (
    <View style={s.root}>
      {/* ── Header ───────────────────────────────────────────────────── */}
      <View style={s.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <View style={s.logoWrap}>
            <Feather name="feather" size={18} color={C.brand} />
          </View>
          <View>
            <Text style={s.headerLogo}>FloraX</Text>
            <Text style={s.headerSub}>
              {user?.fullName ? `Hello, ${user.fullName.split(' ')[0]}` : 'Smart Irrigation'}
            </Text>
          </View>
        </View>
        <View style={s.liveBadge}>
          <View style={s.liveDot} />
          <Text style={s.liveText}>LIVE</Text>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={s.scroll}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.brand} colors={[C.brand]} />
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

        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>

          {/* ── Quick stats ─────────────────────────────────────────── */}
          <View style={s.chipRow}>
            <Chip icon="home"     label="My Farms" value={String(farms.length)}     color={C.brand} />
            <Chip icon="grid"     label="Zones"    value={String(allZones.length)}   color={C.sky}   />
            <Chip icon="droplet"  label="Avg Moist" value={
              allZones.length > 0
                ? `${(allZones.reduce((sum, z) => sum + (z.latestMoisture ?? summary?.averageMoisture ?? 0), 0) / allZones.length).toFixed(0)}%`
                : `${summary?.averageMoisture?.toFixed(0) ?? '—'}%`
            } color={C.amber} />
          </View>

          {/* ── Tank overview ────────────────────────────────────────── */}
          {tanks.length > 0 && (
            <>
              <SectionHead icon="database" title="WATER TANKS" />
              <View style={[s.card, { borderColor: isLow ? 'rgba(239,68,68,0.3)' : C.acBorder }]}>
                <View style={s.tankTopRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={s.tankLabel}>PRIMARY RESERVOIR</Text>
                    <Text style={s.tankName}>{activeTank?.tankName ?? 'Tank'}</Text>
                  </View>
                  <View style={[s.statusPill, {
                    backgroundColor: isLow ? 'rgba(239,68,68,0.15)' : 'rgba(16,185,129,0.12)',
                    borderColor: isLow ? C.danger : C.brand,
                  }]}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <Feather
                        name={isLow ? 'alert-triangle' : 'check-circle'}
                        size={10}
                        color={isLow ? C.danger : C.brand}
                      />
                      <Text style={[s.statusPillText, { color: isLow ? C.danger : C.brand }]}>
                        {isLow ? 'LOW' : 'OK'}
                      </Text>
                    </View>
                  </View>
                </View>
                <View style={s.tankPctRow}>
                  <Text style={[s.tankPct, { color: isLow ? C.danger : C.brand }]}>{tankPct}%</Text>
                  <Text style={s.tankLitres}>{totalWater.toLocaleString()} / {totalCap.toLocaleString()} L</Text>
                </View>
                <AnimBar pct={tankPct} color={isLow ? C.danger : C.brand} />
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
                  <Text style={s.tankMetaText}>{tanks.length} tank{tanks.length !== 1 ? 's' : ''} total</Text>
                  <Text style={s.tankMetaText}>System: {summary?.systemStatus ?? 'Active'}</Text>
                </View>
              </View>
            </>
          )}

          {/* ── My Farms + Zones ─────────────────────────────────────── */}
          <SectionHead icon="map" title="MY FARMS & ZONES" />

          {farms.length > 0 ? (
            <View style={{ gap: 14, marginBottom: 16 }}>
              {farms.map(farm => (
                <FarmCard
                  key={farm.id}
                  farm={farm}
                  zones={farmZonesMap[farm.id] ?? []}
                />
              ))}
            </View>
          ) : (
            <View style={s.emptyCard}>
              <Feather name="map" size={36} color={C.textMuted} />
              <Text style={s.emptyText}>No farms found for your account.</Text>
            </View>
          )}

          {/* Footer */}
          <View style={s.footerRow}>
            <Feather name="activity" size={10} color={C.textMuted} />
            <Text style={s.footer}>FloraX Smart Agriculture  •  Auto Refresh</Text>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root:     { flex: 1, backgroundColor: C.bg },
  loadText: { color: C.brand, fontSize: 13, fontWeight: '700', letterSpacing: 1 },
  dot:      { width: 8, height: 8, borderRadius: 4, backgroundColor: C.brand },

  header: {
    paddingTop: 56, paddingBottom: 16, paddingHorizontal: 20,
    backgroundColor: '#0a1520',
    borderBottomWidth: 1, borderBottomColor: 'rgba(16,185,129,0.18)',
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  logoWrap: {
    width: 38, height: 38, borderRadius: 12,
    backgroundColor: 'rgba(16,185,129,0.12)', borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.25)', alignItems: 'center', justifyContent: 'center',
  },
  headerLogo: { fontSize: 22, fontWeight: '900', color: C.textPri, letterSpacing: -0.5 },
  headerSub:  { fontSize: 12, fontWeight: '700', color: C.brand, letterSpacing: 0.5, marginTop: 2 },
  liveBadge:  { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(16,185,129,0.12)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(16,185,129,0.3)' },
  liveDot:    { width: 6, height: 6, borderRadius: 3, backgroundColor: C.brand },
  liveText:   { fontSize: 10, fontWeight: '800', color: C.brand, letterSpacing: 1 },

  scroll:      { padding: 16, paddingBottom: 40 },
  errorBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(239,68,68,0.1)', borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)', borderRadius: 12, padding: 12, marginBottom: 16 },
  errorText:   { color: '#fca5a5', fontSize: 12, fontWeight: '600', flex: 1 },

  chipRow:     { flexDirection: 'row', gap: 10, marginBottom: 20 },
  chip:        { flex: 1, backgroundColor: C.card, borderRadius: 16, borderWidth: 1, padding: 14, alignItems: 'flex-start' },
  chipIconWrap:{ width: 34, height: 34, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  chipValue:   { fontSize: 19, fontWeight: '900', letterSpacing: -0.5 },
  chipLabel:   { fontSize: 9, fontWeight: '700', color: C.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 3 },

  sectionHead:  { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12, marginTop: 4 },
  sectionBar:   { width: 3, height: 18, borderRadius: 2, backgroundColor: C.brand },
  sectionTitle: { fontSize: 11, fontWeight: '800', color: C.textSec, letterSpacing: 1.5, textTransform: 'uppercase' },

  card: { backgroundColor: C.card, borderRadius: 20, borderWidth: 1, padding: 18, marginBottom: 16 },

  tankTopRow:    { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 14 },
  tankLabel:     { fontSize: 9, fontWeight: '700', color: C.textMuted, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 2 },
  tankName:      { fontSize: 17, fontWeight: '800', color: C.textPri },
  statusPill:    { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, borderWidth: 1 },
  statusPillText:{ fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  tankPctRow:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 10 },
  tankPct:       { fontSize: 36, fontWeight: '900', letterSpacing: -1 },
  tankLitres:    { fontSize: 12, fontWeight: '600', color: C.textSec, marginBottom: 6 },
  barTrack:      { height: 8, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 4, overflow: 'hidden' },
  barFill:       { height: '100%', borderRadius: 4 },
  tankMetaText:  { fontSize: 10, color: C.textMuted, fontWeight: '600' },

  farmCard:     { backgroundColor: C.card, borderRadius: 18, borderWidth: 1, overflow: 'hidden' },
  farmHeader:   { flexDirection: 'row', alignItems: 'flex-start', padding: 16 },
  farmLabel:    { fontSize: 9, fontWeight: '700', color: C.textMuted, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 4 },
  farmName:     { fontSize: 16, fontWeight: '800', color: C.textPri },
  farmLocation: { fontSize: 11, color: C.textSec },
  zoneBadge:    { backgroundColor: 'rgba(16,185,129,0.12)', borderWidth: 1, borderColor: 'rgba(16,185,129,0.25)', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 6, alignItems: 'center' },
  zoneBadgeNum: { fontSize: 18, fontWeight: '900', color: C.brand },
  zoneBadgeLbl: { fontSize: 9, fontWeight: '700', color: C.textSec, textTransform: 'uppercase' },

  zonesWrap:      { borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.06)' },
  zoneRow:        { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, gap: 10 },
  zoneRowBorder:  { borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  zoneIndicator:  { width: 8, height: 8, borderRadius: 4 },
  zoneName:       { fontSize: 13, fontWeight: '700', color: C.textPri },
  zoneCrop:       { fontSize: 10, color: C.textSec, marginTop: 1 },
  zoneRight:      { alignItems: 'flex-end', gap: 4 },
  zoneMoisture:   { fontSize: 14, fontWeight: '800' },
  zoneStatus:     { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, borderWidth: 1 },
  zoneStatusText: { fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },

  emptyCard: { backgroundColor: C.card, borderRadius: 18, padding: 40, alignItems: 'center', gap: 12, borderWidth: 1, borderColor: C.border },
  emptyText: { color: C.textSec, fontSize: 13, fontWeight: '600' },
  footerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 8, marginBottom: 16 },
  footer:    { fontSize: 10, color: C.textMuted, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' },
});
