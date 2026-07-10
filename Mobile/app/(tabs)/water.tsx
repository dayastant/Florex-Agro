import { Feather } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { hardwareService } from '../../apiservice/api';

const C = {
  bg:       '#080d10',
  card:     '#0f1923',
  surface:  '#131f2a',
  border:   'rgba(255,255,255,0.07)',
  brand:    '#10b981',
  sky:      '#38bdf8',
  amber:    '#f59e0b',
  danger:   '#ef4444',
  textPri:  '#e2e8f0',
  textSec:  '#94a3b8',
  textMuted:'#475569',
};

function FillBar({ pct, color }: { pct: number; color: string }) {
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

function ChemBox({ label, value, unit }: { label: string; value: string; unit: string }) {
  return (
    <View style={s.chemBox}>
      <Text style={s.chemMain}>{label}</Text>
      <Text style={[s.chemSub, { color: C.sky }]}>{value}</Text>
      <Text style={s.chemUnit}>{unit}</Text>
    </View>
  );
}

function ValveRow({ label, isOpen, onToggle }: { label: string; isOpen: boolean; onToggle: () => void }) {
  return (
    <View style={s.valveRow}>
      <View style={s.valveLeft}>
        <View style={[s.valveDot, { backgroundColor: isOpen ? C.brand : C.textMuted }]} />
        <Text style={s.valveLabel}>{label}</Text>
        <Text style={[s.valveStatus, { color: isOpen ? C.brand : C.textMuted }]}>
          {isOpen ? 'OPEN' : 'CLOSED'}
        </Text>
      </View>
      <Switch
        value={isOpen}
        onValueChange={onToggle}
        trackColor={{ false: 'rgba(255,255,255,0.1)', true: 'rgba(16,185,129,0.3)' }}
        thumbColor={isOpen ? C.brand : '#334155'}
        ios_backgroundColor="rgba(255,255,255,0.08)"
      />
    </View>
  );
}

function TankCard({ tank, onToggleInlet, onToggleOutlet }: {
  tank: any;
  onToggleInlet: () => void;
  onToggleOutlet: () => void;
}) {
  const cap    = tank.capacityLiters ?? 10000;
  const cur    = tank.currentLevel   ?? 5000;
  const pct    = Math.min((cur / cap) * 100, 100);
  const isLow  = pct < 25;
  const barClr = isLow ? C.danger : pct < 50 ? C.amber : C.brand;

  return (
    <View style={[s.tankCard, { borderColor: isLow ? 'rgba(239,68,68,0.3)' : 'rgba(16,185,129,0.2)' }]}>
      {/* Header */}
      <View style={s.tankHeader}>
        <View style={{ flex: 1 }}>
          <Text style={s.tankLabel}>RESERVOIR</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Feather name="database" size={16} color={barClr} />
            <Text style={s.tankName}>{tank.tankName}</Text>
          </View>
        </View>
        <View style={[s.statusPill, {
          backgroundColor: isLow ? 'rgba(239,68,68,0.15)' : 'rgba(16,185,129,0.12)',
          borderColor:     isLow ? C.danger : C.brand,
        }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Feather
              name={isLow ? 'alert-triangle' : 'check-circle'}
              size={10}
              color={isLow ? C.danger : C.brand}
            />
            <Text style={[s.statusPillTxt, { color: isLow ? C.danger : C.brand }]}>
              {isLow ? 'LOW' : (tank.status?.toUpperCase() ?? 'ACTIVE')}
            </Text>
          </View>
        </View>
      </View>

      {/* Volume */}
      <View style={s.volRow}>
        <Text style={[s.volPct, { color: barClr }]}>{pct.toFixed(0)}%</Text>
        <Text style={s.volLitres}>{cur.toLocaleString()} / {cap.toLocaleString()} L</Text>
      </View>
      <FillBar pct={pct} color={barClr} />

      {/* Chemistry */}
      <View style={s.chemRow}>
        <ChemBox label="6.8"  value="pH"  unit="Acidity" />
        <ChemBox label="142"  value="ppm" unit="TDS" />
        <ChemBox label="18.5" value="°C"  unit="Temp" />
      </View>

      {/* Valves */}
      <View style={s.valveSection}>
        <ValveRow label="Inlet Valve"  isOpen={tank.inletOpen}  onToggle={onToggleInlet} />
        <View style={s.valveDivider} />
        <ValveRow label="Outlet Valve" isOpen={tank.outletOpen} onToggle={onToggleOutlet} />
      </View>
    </View>
  );
}

export default function WaterScreen() {
  const [tanks, setTanks]           = useState<any[]>([]);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError]           = useState<string | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const loadTanks = async () => {
    try {
      setError(null);
      const res  = await hardwareService.getTanks();
      const data = (res.data || []).map((t: any) => ({
        ...t,
        inletOpen:  t.inletOpen  ?? true,
        outletOpen: t.outletOpen ?? false,
      }));
      setTanks(data);
    } catch {
      setError('Connection failed. Pull down to retry.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { loadTanks(); }, []);
  useEffect(() => {
    if (!loading) Animated.timing(fadeAnim, { toValue: 1, duration: 450, useNativeDriver: true }).start();
  }, [loading]);

  const onRefresh     = () => { setRefreshing(true); loadTanks(); };
  const toggleInlet   = (id: string) => setTanks(p => p.map(t => t.id === id ? { ...t, inletOpen:  !t.inletOpen  } : t));
  const toggleOutlet  = (id: string) => setTanks(p => p.map(t => t.id === id ? { ...t, outletOpen: !t.outletOpen } : t));

  const totalVol   = tanks.reduce((a, t) => a + (t.currentLevel   ?? 0), 0);
  const totalCap   = tanks.reduce((a, t) => a + (t.capacityLiters ?? 1), 0);
  const overallPct = totalCap > 0 ? Math.round((totalVol / totalCap) * 100) : 0;
  const lowCount   = tanks.filter(t => (t.currentLevel ?? 0) / (t.capacityLiters ?? 1) < 0.25).length;

  if (loading) {
    return (
      <View style={[s.root, { justifyContent: 'center', alignItems: 'center', gap: 16 }]}>
        <Feather name="database" size={40} color={C.brand} />
        <Text style={s.loadText}>Connecting Hydrology Matrix…</Text>
      </View>
    );
  }

  return (
    <View style={s.root}>
      {/* ── Header ───────────────────────────────────────────────────── */}
      <View style={s.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <View style={s.logoWrap}>
            <Feather name="droplet" size={18} color={C.brand} />
          </View>
          <View>
            <Text style={s.headerLogo}>FloraX</Text>
            <Text style={s.headerSub}>RESERVOIR MANAGEMENT</Text>
          </View>
        </View>
        <View style={s.ovBubble}>
          <Text style={[s.ovNum, { color: overallPct < 25 ? C.danger : C.brand }]}>{overallPct}%</Text>
          <Text style={s.ovLbl}>Overall</Text>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={s.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.brand} colors={[C.brand]} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Error */}
        {error && (
          <View style={s.errorBanner}>
            <Feather name="alert-triangle" size={14} color="#fca5a5" />
            <Text style={s.errorText}>{error}</Text>
          </View>
        )}

        {/* Summary strip */}
        <View style={s.strip}>
          <View style={s.stripItem}>
            <Feather name="database" size={14} color={C.brand} />
            <Text style={[s.stripNum, { color: C.brand }]}>{tanks.length}</Text>
            <Text style={s.stripLbl}>Tanks</Text>
          </View>
          <View style={s.stripDiv} />
          <View style={s.stripItem}>
            <Feather name="droplet" size={14} color={C.sky} />
            <Text style={[s.stripNum, { color: C.sky }]}>{totalVol.toLocaleString()}</Text>
            <Text style={s.stripLbl}>Litres</Text>
          </View>
          <View style={s.stripDiv} />
          <View style={s.stripItem}>
            <Feather name="alert-circle" size={14} color={lowCount > 0 ? C.danger : C.brand} />
            <Text style={[s.stripNum, { color: lowCount > 0 ? C.danger : C.brand }]}>{lowCount}</Text>
            <Text style={s.stripLbl}>Low Alert</Text>
          </View>
        </View>

        {/* Section heading */}
        <View style={s.sectionHead}>
          <View style={s.sectionBar} />
          <Feather name="database" size={14} color={C.brand} />
          <Text style={s.sectionTitle}>RESERVOIR DETAILS</Text>
        </View>

        <Animated.View style={{ opacity: fadeAnim }}>
          {tanks.length > 0 ? (
            <View style={{ gap: 16, marginBottom: 16 }}>
              {tanks.map(tank => (
                <TankCard
                  key={tank.id}
                  tank={tank}
                  onToggleInlet={() => toggleInlet(tank.id)}
                  onToggleOutlet={() => toggleOutlet(tank.id)}
                />
              ))}
            </View>
          ) : (
            <View style={s.emptyCard}>
              <Feather name="droplet" size={36} color={C.textMuted} />
              <Text style={s.emptyText}>No water tanks registered.</Text>
            </View>
          )}
        </Animated.View>

        {/* Footer */}
        <View style={s.footerRow}>
          <Feather name="droplet" size={10} color={C.textMuted} />
          <Text style={s.footer}>FloraX Smart Agriculture  •  Auto Refresh</Text>
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
  logoWrap:  { width: 38, height: 38, borderRadius: 12, backgroundColor: 'rgba(16,185,129,0.12)', borderWidth: 1, borderColor: 'rgba(16,185,129,0.25)', alignItems: 'center', justifyContent: 'center' },
  headerLogo:{ fontSize: 22, fontWeight: '900', color: C.textPri, letterSpacing: -0.5 },
  headerSub: { fontSize: 9,  fontWeight: '700', color: C.brand, letterSpacing: 1.5, marginTop: 1 },
  ovBubble:  { backgroundColor: 'rgba(16,185,129,0.1)', borderWidth: 1, borderColor: 'rgba(16,185,129,0.3)', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 8, alignItems: 'center', minWidth: 64 },
  ovNum:     { fontSize: 22, fontWeight: '900' },
  ovLbl:     { fontSize: 9, fontWeight: '700', color: C.textSec, textTransform: 'uppercase', letterSpacing: 1 },

  scroll:      { padding: 16, paddingBottom: 40 },
  errorBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(239,68,68,0.1)', borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)', borderRadius: 12, padding: 12, marginBottom: 16 },
  errorText:   { color: '#fca5a5', fontSize: 12, fontWeight: '600', flex: 1 },

  strip:    { flexDirection: 'row', backgroundColor: C.card, borderRadius: 16, borderWidth: 1, borderColor: C.border, padding: 14, marginBottom: 20 },
  stripItem:{ flex: 1, alignItems: 'center', gap: 3 },
  stripNum: { fontSize: 22, fontWeight: '900' },
  stripLbl: { fontSize: 9, fontWeight: '700', color: C.textMuted, textTransform: 'uppercase', letterSpacing: 1 },
  stripDiv: { width: 1, backgroundColor: 'rgba(255,255,255,0.07)', marginHorizontal: 4 },

  sectionHead:  { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  sectionBar:   { width: 3, height: 18, borderRadius: 2, backgroundColor: C.brand },
  sectionTitle: { fontSize: 11, fontWeight: '800', color: C.textSec, letterSpacing: 1.5, textTransform: 'uppercase' },

  tankCard:   { backgroundColor: C.card, borderRadius: 20, borderWidth: 1, padding: 18 },
  tankHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 14 },
  tankLabel:  { fontSize: 9, fontWeight: '700', color: C.textMuted, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 4 },
  tankName:   { fontSize: 18, fontWeight: '800', color: C.textPri },
  statusPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, borderWidth: 1 },
  statusPillTxt:{ fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },

  volRow:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 10 },
  volPct:    { fontSize: 38, fontWeight: '900', letterSpacing: -1 },
  volLitres: { fontSize: 12, fontWeight: '600', color: C.textSec, marginBottom: 6 },
  barTrack:  { height: 10, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 5, overflow: 'hidden', marginBottom: 16 },
  barFill:   { height: '100%', borderRadius: 5 },

  chemRow:  { flexDirection: 'row', gap: 8, marginBottom: 16 },
  chemBox:  { flex: 1, backgroundColor: C.surface, borderRadius: 12, padding: 10, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  chemMain: { fontSize: 15, fontWeight: '800', color: C.textPri },
  chemSub:  { fontSize: 10, fontWeight: '700', marginTop: 1 },
  chemUnit: { fontSize: 9,  fontWeight: '600', color: C.textMuted, marginTop: 1 },

  valveSection:{ borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.06)', paddingTop: 14 },
  valveRow:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  valveLeft:   { flexDirection: 'row', alignItems: 'center', gap: 8 },
  valveDot:    { width: 8, height: 8, borderRadius: 4 },
  valveLabel:  { fontSize: 13, fontWeight: '700', color: C.textPri },
  valveStatus: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
  valveDivider:{ height: 1, backgroundColor: 'rgba(255,255,255,0.05)', marginVertical: 10 },

  emptyCard: { backgroundColor: C.card, borderRadius: 18, padding: 40, alignItems: 'center', gap: 12, borderWidth: 1, borderColor: C.border },
  emptyText: { color: C.textSec, fontSize: 13, fontWeight: '600' },
  footerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 8, marginBottom: 16 },
  footer:    { fontSize: 10, color: C.textMuted, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' },
});
