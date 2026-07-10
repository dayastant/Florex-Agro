import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { farmService, getLoggedUser, telemetryService } from '../../apiservice/api';

const C = {
  bg:      '#080d10',
  card:    '#0f1923',
  border:  'rgba(255,255,255,0.07)',
  acBorder:'rgba(16,185,129,0.22)',
  brand:   '#10b981',
  sky:     '#38bdf8',
  amber:   '#f59e0b',
  danger:  '#ef4444',
  purple:  '#7c3aed',
  textPri: '#e2e8f0',
  textSec: '#94a3b8',
  textMuted:'#475569',
};

// ─── Pulse dot ────────────────────────────────────────────────────────────
function PulseDot({ color }: { color: string }) {
  const scale = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scale, { toValue: 1.4, duration: 700, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 1,   duration: 700, useNativeDriver: true }),
      ])
    ).start();
  }, []);
  return <Animated.View style={[{ width: 7, height: 7, borderRadius: 4, backgroundColor: color }, { transform: [{ scale }] }]} />;
}

// ─── Farm card ────────────────────────────────────────────────────────────
function FarmCard({ farm, zones, onPress, onNav }: {
  farm: any;
  zones: any[];
  onPress: () => void;
  onNav: (route: string) => void;
}) {
  const activeZones = zones.filter(z => z.status === 'Irrigating').length;
  const moistureZones = zones.filter(z => z.latestMoisture != null);
  const avgMoisture = moistureZones.length > 0
    ? moistureZones.reduce((a, z) => a + z.latestMoisture, 0) / moistureZones.length
    : null;

  const moColor = avgMoisture != null
    ? avgMoisture > 60 ? C.brand : avgMoisture > 35 ? C.amber : C.danger
    : C.textMuted;

  // Quick actions for this farm
  const ACTIONS = [
    { label: 'Zones',    icon: 'grid'         as const, color: C.sky,    route: `/farms/${farm.id}/zones/index`    },
    { label: 'Motors',   icon: 'settings'     as const, color: C.amber,  route: `/farms/${farm.id}/hardware/motors` },
    { label: 'Valves',   icon: 'toggle-right' as const, color: C.brand,  route: `/farms/${farm.id}/hardware/valves` },
  ];

  return (
    <View style={s.farmCard}>
      {/* Tappable header area */}
      <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={{ flexDirection: 'row' }}>
        {/* Left accent */}
        <View style={[s.farmAccent, { backgroundColor: activeZones > 0 ? C.brand : C.textMuted }]} />

        <View style={s.farmBody}>
          {/* Header */}
          <View style={s.farmHeaderRow}>
            <View style={{ flex: 1 }}>
              <Text style={s.farmCaption}>FARM</Text>
              <Text style={s.farmName} numberOfLines={1}>{farm.farmName ?? farm.name ?? 'Unnamed Farm'}</Text>
              {(farm.district || farm.province) && (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 }}>
                  <Feather name="map-pin" size={10} color={C.textSec} />
                  <Text style={s.farmLoc}>{[farm.district, farm.province].filter(Boolean).join(', ')}</Text>
                </View>
              )}
            </View>
            <Feather name="chevron-right" size={18} color={C.brand} />
          </View>

          {/* Stats row */}
          <View style={s.farmStats}>
            <View style={s.farmStat}>
              <Feather name="grid" size={12} color={C.sky} />
              <Text style={[s.farmStatNum, { color: C.sky }]}>{zones.length}</Text>
              <Text style={s.farmStatLbl}>Zones</Text>
            </View>
            <View style={s.statDiv} />
            <View style={s.farmStat}>
              <PulseDot color={activeZones > 0 ? C.brand : C.textMuted} />
              <Text style={[s.farmStatNum, { color: activeZones > 0 ? C.brand : C.textMuted }]}>{activeZones}</Text>
              <Text style={s.farmStatLbl}>Active</Text>
            </View>
            <View style={s.statDiv} />
            <View style={s.farmStat}>
              <Feather name="activity" size={12} color={moColor} />
              <Text style={[s.farmStatNum, { color: moColor }]}>
                {avgMoisture != null ? `${avgMoisture.toFixed(0)}%` : '—'}
              </Text>
              <Text style={s.farmStatLbl}>Moisture</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>

      {/* ── Quick-action bar ────────────────────────────────── */}
      <View style={s.actionBar}>
        {ACTIONS.map((a, i) => (
          <TouchableOpacity
            key={a.label}
            onPress={() => onNav(a.route)}
            activeOpacity={0.75}
            style={[
              s.actionBtn,
              { borderColor: a.color + '30' },
              i > 0 && { borderLeftWidth: 1, borderLeftColor: 'rgba(255,255,255,0.06)' },
            ]}
          >
            <View style={[s.actionIconWrap, { backgroundColor: a.color + '14' }]}>
              <Feather name={a.icon} size={15} color={a.color} />
            </View>
            <Text style={[s.actionLabel, { color: a.color }]}>{a.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

// ─── Dot loader ───────────────────────────────────────────────────────────
function LoadDot({ delay }: { delay: number }) {
  const a = useRef(new Animated.Value(0.3)).current;
  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.delay(delay),
      Animated.timing(a, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(a, { toValue: 0.3, duration: 400, useNativeDriver: true }),
    ])).start();
  }, []);
  return <Animated.View style={[{ width: 8, height: 8, borderRadius: 4, backgroundColor: C.brand }, { opacity: a }]} />;
}

// ─── Main screen ──────────────────────────────────────────────────────────
export default function FarmsScreen() {
  const router = useRouter();
  const [farms, setFarms]               = useState<any[]>([]);
  const [farmZonesMap, setFarmZonesMap] = useState<Record<string, any[]>>({});
  const [loading, setLoading]           = useState(true);
  const [refreshing, setRefreshing]     = useState(false);
  const [error, setError]               = useState<string | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const loadData = useCallback(async () => {
    try {
      setError(null);
      const cu     = getLoggedUser();
      const isTech = cu?.roleId === '33333333-3333-3333-3333-333333333333';
      const res    = await farmService.getFarms(isTech ? undefined : cu?.id);
      const farmsData: any[] = res.data || [];
      setFarms(farmsData);

      const map: Record<string, any[]> = {};
      await Promise.all(farmsData.map(async (f: any) => {
        try {
          const zr = await farmService.getZonesByFarm(f.id);
          const zData = zr.data || [];
          const enriched = await Promise.all(zData.map(async (z: any) => {
            try {
              const mr = await telemetryService.getMoistureReadings(z.id);
              const rd = mr.data || [];
              if (rd.length > 0) {
                return { ...z, latestMoisture: rd[rd.length - 1].moisturePercentage };
              }
            } catch { /* skip */ }
            return z;
          }));
          map[f.id] = enriched;
        } catch { map[f.id] = []; }
      }));
      setFarmZonesMap(map);
    } catch {
      setError('Connection failed. Pull down to retry.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadData(); }, []);
  useEffect(() => {
    if (!loading) Animated.timing(fadeAnim, { toValue: 1, duration: 450, useNativeDriver: true }).start();
  }, [loading]);

  const onRefresh = () => { setRefreshing(true); loadData(); };

  const totalZones  = Object.values(farmZonesMap).flat().length;
  const activeZones = Object.values(farmZonesMap).flat().filter((z: any) => z.status === 'Irrigating').length;

  if (loading) {
    return (
      <View style={[s.root, { justifyContent: 'center', alignItems: 'center', gap: 16 }]}>
        <Feather name="map" size={40} color={C.brand} />
        <Text style={s.loadText}>Loading farms…</Text>
        <View style={{ flexDirection: 'row', gap: 6 }}>
          {[0, 1, 2].map(i => <LoadDot key={i} delay={i * 200} />)}
        </View>
      </View>
    );
  }

  return (
    <View style={s.root}>
      {/* Header */}
      <View style={s.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <View style={s.logoWrap}>
            <Feather name="map" size={18} color={C.brand} />
          </View>
          <View>
            <Text style={s.headerTitle}>My Farms</Text>
            <Text style={s.headerSub}>FARM MANAGEMENT</Text>
          </View>
        </View>
        <View style={s.statBubble}>
          <Text style={s.statNum}>{farms.length}</Text>
          <Text style={s.statLbl}>Farms</Text>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={s.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.brand} colors={[C.brand]} />}
        showsVerticalScrollIndicator={false}
      >
        {error && (
          <View style={s.errorBanner}>
            <Feather name="alert-triangle" size={14} color="#fca5a5" />
            <Text style={s.errorText}>{error}</Text>
          </View>
        )}

        {/* Summary strip */}
        <View style={s.strip}>
          <View style={s.stripItem}>
            <Feather name="home" size={14} color={C.brand} />
            <Text style={[s.stripNum, { color: C.brand }]}>{farms.length}</Text>
            <Text style={s.stripLbl}>Farms</Text>
          </View>
          <View style={s.stripDiv} />
          <View style={s.stripItem}>
            <Feather name="grid" size={14} color={C.sky} />
            <Text style={[s.stripNum, { color: C.sky }]}>{totalZones}</Text>
            <Text style={s.stripLbl}>Zones</Text>
          </View>
          <View style={s.stripDiv} />
          <View style={s.stripItem}>
            <Feather name="droplet" size={14} color={C.brand} />
            <Text style={[s.stripNum, { color: C.brand }]}>{activeZones}</Text>
            <Text style={s.stripLbl}>Irrigating</Text>
          </View>
        </View>

        {/* Section heading */}
        <View style={s.sectionHead}>
          <View style={s.sectionBar} />
          <Feather name="home" size={14} color={C.brand} />
          <Text style={s.sectionTitle}>YOUR FARMS</Text>
        </View>

        <Animated.View style={{ opacity: fadeAnim }}>
          {farms.length > 0 ? (
            <View style={{ gap: 12, marginBottom: 16 }}>
              {farms.map(farm => (
                <FarmCard
                  key={farm.id}
                  farm={farm}
                  zones={farmZonesMap[farm.id] ?? []}
                  onPress={() => router.push(`/farms/${farm.id}` as any)}
                  onNav={(route) => router.push(route as any)}
                />
              ))}
            </View>
          ) : (
            <View style={s.emptyCard}>
              <Feather name="map" size={40} color={C.textMuted} />
              <Text style={s.emptyTitle}>No farms found</Text>
              <Text style={s.emptyText}>No farms are assigned to your account yet.</Text>
            </View>
          )}
        </Animated.View>

        <View style={s.footerRow}>
          <Feather name="activity" size={10} color={C.textMuted} />
          <Text style={s.footer}>FloraX Smart Agriculture  •  Farm Manager</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root:     { flex: 1, backgroundColor: C.bg },
  loadText: { color: C.brand, fontSize: 13, fontWeight: '700', letterSpacing: 1 },

  header: {
    paddingTop: 56, paddingBottom: 16, paddingHorizontal: 20,
    backgroundColor: '#0a1520',
    borderBottomWidth: 1, borderBottomColor: 'rgba(16,185,129,0.18)',
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  logoWrap:    { width: 38, height: 38, borderRadius: 12, backgroundColor: 'rgba(16,185,129,0.12)', borderWidth: 1, borderColor: 'rgba(16,185,129,0.25)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 22, fontWeight: '900', color: C.textPri, letterSpacing: -0.5 },
  headerSub:   { fontSize: 9,  fontWeight: '700', color: C.brand, letterSpacing: 1.5, marginTop: 1 },
  statBubble:  { backgroundColor: 'rgba(16,185,129,0.12)', borderWidth: 1, borderColor: 'rgba(16,185,129,0.3)', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 8, alignItems: 'center' },
  statNum:     { fontSize: 22, fontWeight: '900', color: C.brand },
  statLbl:     { fontSize: 9, fontWeight: '700', color: C.textSec, textTransform: 'uppercase', letterSpacing: 1 },

  scroll:      { padding: 16, paddingBottom: 40 },
  errorBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(239,68,68,0.1)', borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)', borderRadius: 12, padding: 12, marginBottom: 16 },
  errorText:   { color: '#fca5a5', fontSize: 12, fontWeight: '600', flex: 1 },

  strip:     { flexDirection: 'row', backgroundColor: C.card, borderRadius: 16, borderWidth: 1, borderColor: C.border, padding: 14, marginBottom: 20 },
  stripItem: { flex: 1, alignItems: 'center', gap: 3 },
  stripNum:  { fontSize: 20, fontWeight: '900' },
  stripLbl:  { fontSize: 9, fontWeight: '700', color: C.textMuted, textTransform: 'uppercase', letterSpacing: 0.8 },
  stripDiv:  { width: 1, backgroundColor: 'rgba(255,255,255,0.07)', marginHorizontal: 2 },

  sectionHead:  { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  sectionBar:   { width: 4, height: 18, backgroundColor: C.brand, borderRadius: 4 },
  sectionTitle: { fontSize: 12, fontWeight: '800', color: C.textSec, letterSpacing: 1.5, textTransform: 'uppercase' },

  farmCard:      { backgroundColor: C.card, borderRadius: 18, borderWidth: 1, borderColor: C.border, overflow: 'hidden' },
  farmAccent:    { width: 5 },
  farmBody:      { flex: 1, padding: 16, gap: 14 },
  farmHeaderRow: { flexDirection: 'row', alignItems: 'flex-start' },
  farmCaption:   { fontSize: 9, fontWeight: '700', color: C.textMuted, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 4 },
  farmName:      { fontSize: 18, fontWeight: '900', color: C.textPri, letterSpacing: -0.3 },
  farmLoc:       { fontSize: 11, color: C.textSec, marginTop: 2 },
  farmStats: {
    flexDirection: 'row', alignItems: 'stretch',
    backgroundColor: 'rgba(255,255,255,0.025)',
    borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)',
    padding: 0, overflow: 'hidden',
  },
  farmStat:      { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 10, gap: 3 },
  farmStatNum:   { fontSize: 20, fontWeight: '900', lineHeight: 24 },
  farmStatLbl:   { fontSize: 9, fontWeight: '700', color: C.textMuted, textTransform: 'uppercase', letterSpacing: 0.8 },
  statDiv:       { width: 1, backgroundColor: 'rgba(255,255,255,0.07)' },

  // Quick action bar
  actionBar: {
    flexDirection: 'row',
    borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.06)',
    backgroundColor: '#0a1520',
  },
  actionBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 7, paddingVertical: 12,
    borderTopWidth: 0,
  },
  actionIconWrap: {
    width: 26, height: 26, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center',
  },
  actionLabel: { fontSize: 12, fontWeight: '800', letterSpacing: 0.3 },

  emptyCard:  { backgroundColor: C.card, borderRadius: 20, padding: 52, alignItems: 'center', gap: 12, borderWidth: 1, borderColor: C.border },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: C.textPri },
  emptyText:  { fontSize: 12, color: C.textSec, textAlign: 'center', lineHeight: 19 },

  footerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 8, marginBottom: 16 },
  footer:    { fontSize: 10, color: C.textMuted, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' },
});
