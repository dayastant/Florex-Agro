import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  Vibration,
  View,
} from 'react-native';
import { farmService, telemetryService } from '../../../../apiservice/api';

const C = {
  bg:'#080d10', card:'#0f1923', cardInner:'#111d27', border:'rgba(255,255,255,0.07)',
  brand:'#10b981', brandGlow:'rgba(16,185,129,0.14)',
  purple:'#7c3aed', purpleGlow:'rgba(124,58,237,0.14)',
  sky:'#38bdf8', amber:'#f59e0b',
  danger:'#ef4444', dangerGlow:'rgba(239,68,68,0.14)',
  textPri:'#e2e8f0', textSec:'#94a3b8', textMuted:'#475569',
};

function MoisBar({ pct, color }: { pct: number; color: string }) {
  const a = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.spring(a, { toValue: pct, useNativeDriver: false, damping: 16, stiffness: 80 }).start();
  }, [pct]);
  const w = a.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] });
  return (
    <View style={{ height: 6, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' }}>
      <Animated.View style={{ height: '100%', borderRadius: 3, width: w, backgroundColor: color }} />
    </View>
  );
}

function ZoneCard({ zone, onCmd, onEdit, onDelete }: {
  zone: any;
  onCmd: (id: string, mode: string) => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const isOpen = zone.status === 'Irrigating';
  const isIdle = zone.status === 'Idle';
  const isAuto = zone.status === 'Active';
  const m      = zone.latestMoisture ?? null;
  const mColor = m != null ? (m > 60 ? C.brand : m > 35 ? C.amber : C.danger) : C.textMuted;
  const accent = isOpen ? C.brand : isAuto ? C.purple : C.textMuted;

  const press = (mode: string) => { Vibration.vibrate(30); onCmd(zone.id, mode); };

  return (
    <View style={[s.zoneCard, { borderLeftColor: accent }]}>
      <View style={s.zoneHeader}>
        <View style={{ flex: 1 }}>
          <Text style={s.zoneCaption}>ZONE</Text>
          <Text style={s.zoneName}>{zone.zoneName ?? zone.name ?? 'Zone'}</Text>
          {zone.cropType ? <Text style={s.zoneSub}>{zone.cropType}</Text> : null}
        </View>
        <View style={{ alignItems: 'flex-end', gap: 6 }}>
          <View style={[s.valveBadge, { backgroundColor: isOpen ? C.brandGlow : 'rgba(71,85,105,0.18)', borderColor: isOpen ? C.brand : C.textMuted }]}>
            <Feather name="droplet" size={9} color={isOpen ? C.brand : C.textMuted} />
            <Text style={[s.valveTxt, { color: isOpen ? C.brand : C.textMuted }]}>{isOpen ? 'OPEN' : 'CLOSED'}</Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 6 }}>
            <TouchableOpacity onPress={onEdit} style={s.iconBtn}>
              <Feather name="edit-2" size={13} color={C.sky} />
            </TouchableOpacity>
            <TouchableOpacity onPress={onDelete} style={[s.iconBtn, { borderColor: 'rgba(239,68,68,0.3)' }]}>
              <Feather name="trash-2" size={13} color={C.danger} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Moisture */}
      {m != null && (
        <View style={{ gap: 4 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={s.moLabel}>SOIL MOISTURE</Text>
            <Text style={[s.moValue, { color: mColor }]}>{m.toFixed(0)}%</Text>
          </View>
          <MoisBar pct={m} color={mColor} />
        </View>
      )}

      {/* Control buttons */}
      <View style={s.ctrlRow}>
        {[
          { label: 'AUTO',  icon: 'zap'      as const, mode: 'AUTO',  active: isAuto, color: C.purple, glow: C.purpleGlow },
          { label: 'OPEN',  icon: 'droplet'  as const, mode: 'OPEN',  active: isOpen, color: C.brand,  glow: C.brandGlow  },
          { label: 'CLOSE', icon: 'x-circle' as const, mode: 'CLOSE', active: isIdle, color: C.danger, glow: C.dangerGlow },
        ].map(b => (
          <TouchableOpacity
            key={b.mode}
            onPress={() => press(b.mode)}
            activeOpacity={0.75}
            style={[s.ctrlBtn, b.active
              ? { backgroundColor: b.glow, borderColor: b.color }
              : { backgroundColor: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.08)' },
            ]}
          >
            <Feather name={b.icon} size={13} color={b.active ? b.color : C.textMuted} />
            <Text style={[s.ctrlBtnTxt, { color: b.active ? b.color : C.textMuted }]}>{b.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

export default function ZonesListScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router  = useRouter();
  const [zones, setZones]       = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const load = async () => {
    if (!id) return;
    try {
      const res   = await farmService.getZonesByFarm(id);
      const zData = res.data || [];
      const enriched = await Promise.all(zData.map(async (z: any) => {
        try {
          const mr = await telemetryService.getMoistureReadings(z.id);
          const rd = mr.data || [];
          if (rd.length) return { ...z, latestMoisture: rd[rd.length - 1].moisturePercentage };
        } catch { /* skip */ }
        return z;
      }));
      setZones(enriched);
    } catch { /* silent */ } finally {
      setLoading(false); setRefreshing(false);
    }
  };

  useEffect(() => { load(); }, [id]);
  useEffect(() => {
    if (!loading) Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, [loading]);

  const onRefresh = () => { setRefreshing(true); load(); };

  const handleCmd = async (zoneId: string, mode: string) => {
    const statusMap: Record<string, string> = { OPEN: 'Irrigating', CLOSE: 'Idle', AUTO: 'Active' };
    const newStatus = statusMap[mode] ?? 'Active';
    setZones(prev => prev.map(z => z.id === zoneId ? { ...z, status: newStatus } : z));
    try { await telemetryService.updateValveStatus(zoneId, newStatus); } catch { /* silent */ }
  };

  const handleDelete = (zone: any) => {
    Alert.alert('Delete Zone', `Delete "${zone.zoneName ?? 'Zone'}"? This cannot be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          try {
            await farmService.deleteZone(zone.id);
            setZones(prev => prev.filter(z => z.id !== zone.id));
          } catch { Alert.alert('Error', 'Could not delete zone.'); }
        },
      },
    ]);
  };

  const activeCount = zones.filter(z => z.status === 'Irrigating').length;

  return (
    <View style={s.root}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Feather name="arrow-left" size={20} color={C.brand} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={s.headerTitle}>Irrigation Zones</Text>
          <Text style={s.headerSub}>{zones.length} ZONES  •  {activeCount} IRRIGATING</Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push(`/farms/${id}/zones/create` as any)}
          style={s.addBtn}
        >
          <Feather name="plus" size={20} color={C.brand} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={{ flex: 1 }} contentContainerStyle={s.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.brand} colors={[C.brand]} />}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fadeAnim }}>
          {zones.length > 0 ? (
            <View style={{ gap: 12 }}>
              {zones.map(zone => (
                <ZoneCard
                  key={zone.id}
                  zone={zone}
                  onCmd={handleCmd}
                  onEdit={() => router.push(`/farms/${id}/zones/${zone.id}/edit` as any)}
                  onDelete={() => handleDelete(zone)}
                />
              ))}
            </View>
          ) : (
            <View style={s.emptyCard}>
              <Feather name="grid" size={40} color={C.textMuted} />
              <Text style={s.emptyTitle}>No zones yet</Text>
              <Text style={s.emptyText}>Tap the + button to create your first irrigation zone.</Text>
              <TouchableOpacity
                onPress={() => router.push(`/farms/${id}/zones/create` as any)}
                style={s.createBtn}
              >
                <Feather name="plus" size={16} color="#fff" />
                <Text style={s.createBtnTxt}>Create Zone</Text>
              </TouchableOpacity>
            </View>
          )}
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  header: {
    paddingTop: 56, paddingBottom: 16, paddingHorizontal: 20,
    backgroundColor: '#0a1520', borderBottomWidth: 1, borderBottomColor: 'rgba(16,185,129,0.18)',
    flexDirection: 'row', alignItems: 'center', gap: 12,
  },
  backBtn:     { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(16,185,129,0.1)', borderWidth: 1, borderColor: 'rgba(16,185,129,0.2)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '900', color: C.textPri },
  headerSub:   { fontSize: 9, color: C.brand, fontWeight: '700', letterSpacing: 1, marginTop: 2 },
  addBtn:      { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(16,185,129,0.12)', borderWidth: 1, borderColor: 'rgba(16,185,129,0.3)', alignItems: 'center', justifyContent: 'center' },

  scroll: { padding: 16, paddingBottom: 40 },

  zoneCard: { backgroundColor: C.cardInner, borderRadius: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', borderLeftWidth: 4, padding: 14, gap: 10 },
  zoneHeader:{ flexDirection: 'row', alignItems: 'flex-start' },
  zoneCaption:{ fontSize: 9, fontWeight: '700', color: C.textMuted, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 2 },
  zoneName:  { fontSize: 15, fontWeight: '800', color: C.textPri },
  zoneSub:   { fontSize: 11, color: C.textSec, marginTop: 2 },
  valveBadge:{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 9, paddingVertical: 4, borderRadius: 20, borderWidth: 1 },
  valveTxt:  { fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },
  iconBtn:   { width: 28, height: 28, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center' },

  moLabel: { fontSize: 9, fontWeight: '700', color: C.textMuted, letterSpacing: 1, textTransform: 'uppercase' },
  moValue: { fontSize: 14, fontWeight: '900' },

  ctrlRow:    { flexDirection: 'row', gap: 8 },
  ctrlBtn:    { flex: 1, flexDirection: 'row', paddingVertical: 10, borderRadius: 10, alignItems: 'center', justifyContent: 'center', borderWidth: 1, gap: 4 },
  ctrlBtnTxt: { fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },

  emptyCard:   { backgroundColor: C.card, borderRadius: 18, padding: 48, alignItems: 'center', gap: 10, borderWidth: 1, borderColor: C.border },
  emptyTitle:  { fontSize: 17, fontWeight: '800', color: C.textPri },
  emptyText:   { fontSize: 12, color: C.textSec, textAlign: 'center', lineHeight: 18 },
  createBtn:   { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: C.brand, borderRadius: 12, paddingHorizontal: 20, paddingVertical: 12, marginTop: 8 },
  createBtnTxt:{ fontSize: 14, fontWeight: '800', color: '#fff' },
});
