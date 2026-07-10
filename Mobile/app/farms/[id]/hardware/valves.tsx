import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated, RefreshControl, ScrollView, StyleSheet,
  Switch, Text, TouchableOpacity, View,
} from 'react-native';
import { hardwareService } from '../../../../apiservice/api';

const C = {
  bg:'#080d10', card:'#0f1923', border:'rgba(255,255,255,0.07)',
  brand:'#10b981', sky:'#38bdf8', danger:'#ef4444',
  textPri:'#e2e8f0', textSec:'#94a3b8', textMuted:'#475569',
};

function ValveCard({ valve, onToggle }: { valve: any; onToggle: (id: string, open: boolean) => void }) {
  const isOpen  = valve.isOpen ?? false;
  const stColor = isOpen ? C.brand : C.textMuted;

  return (
    <View style={[s.valveCard, { borderLeftColor: stColor }]}>
      <View style={s.valveTop}>
        <View style={{ flex: 1 }}>
          <Text style={s.valveCaption}>VALVE CONTROLLER</Text>
          <Text style={s.valveName}>{valve.name ?? valve.deviceSerial ?? 'Valve'}</Text>
          {valve.zoneId && <Text style={s.valveSub}>Zone: {valve.zoneId}</Text>}
        </View>
        <View style={{ alignItems: 'flex-end', gap: 8 }}>
          <View style={[s.badge, { backgroundColor: isOpen ? 'rgba(16,185,129,0.14)' : 'rgba(71,85,105,0.18)', borderColor: stColor }]}>
            <Feather name="droplet" size={10} color={stColor} />
            <Text style={[s.badgeTxt, { color: stColor }]}>{isOpen ? 'OPEN' : 'CLOSED'}</Text>
          </View>
          <Switch
            value={isOpen}
            onValueChange={v => onToggle(valve.id, v)}
            trackColor={{ false: 'rgba(255,255,255,0.1)', true: 'rgba(16,185,129,0.35)' }}
            thumbColor={isOpen ? C.brand : '#334155'}
          />
        </View>
      </View>

      {/* Flow indicator */}
      <View style={s.flowRow}>
        <Feather name="activity" size={12} color={isOpen ? C.sky : C.textMuted} />
        <Text style={[s.flowTxt, { color: isOpen ? C.sky : C.textMuted }]}>
          {isOpen ? 'Water flowing' : 'No flow'}
        </Text>
        <View style={[s.flowDot, { backgroundColor: isOpen ? C.sky : C.textMuted }]} />
      </View>
    </View>
  );
}

export default function ValvesScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router  = useRouter();
  const [valves, setValves]       = useState<any[]>([]);
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing]= useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const load = async () => {
    try {
      const res = await hardwareService.getValves(id);
      const mapped = (res.data || []).map((v: any) => ({
        ...v,
        isOpen: v.isOpen ?? (v.state === 'Open' || v.state === 'OPEN'),
      }));
      setValves(mapped);
    } catch { /* silent */ }
    finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { load(); }, [id]);
  useEffect(() => {
    if (!loading) Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, [loading]);

  const onRefresh    = () => { setRefreshing(true); load(); };
  const handleToggle = async (valveId: string, isOpen: boolean) => {
    setValves(prev => prev.map(v => v.id === valveId ? { ...v, isOpen } : v));
    try { await hardwareService.updateValve(valveId, isOpen); } catch { /* silent */ }
  };

  const openCount = valves.filter(v => v.isOpen).length;

  return (
    <View style={s.root}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Feather name="arrow-left" size={20} color={C.brand} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={s.headerTitle}>Valves</Text>
          <Text style={s.headerSub}>{openCount}/{valves.length} OPEN</Text>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }} contentContainerStyle={s.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.brand} colors={[C.brand]} />}
        showsVerticalScrollIndicator={false}
      >
        {valves.length > 0 ? (
          <Animated.View style={{ opacity: fadeAnim, gap: 12 }}>
            {valves.map(v => <ValveCard key={v.id} valve={v} onToggle={handleToggle} />)}
          </Animated.View>
        ) : (
          <View style={s.emptyCard}>
            <Feather name="toggle-right" size={40} color={C.textMuted} />
            <Text style={s.emptyTitle}>No valves found</Text>
            <Text style={s.emptyText}>No valve controllers are registered for this farm.</Text>
          </View>
        )}
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
  scroll:      { padding: 16, paddingBottom: 40 },

  valveCard:    { backgroundColor: C.card, borderRadius: 16, borderWidth: 1, borderColor: C.border, borderLeftWidth: 4, padding: 14, gap: 10 },
  valveTop:     { flexDirection: 'row', alignItems: 'flex-start' },
  valveCaption: { fontSize: 9, fontWeight: '700', color: C.textMuted, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 2 },
  valveName:    { fontSize: 15, fontWeight: '800', color: C.textPri },
  valveSub:     { fontSize: 11, color: C.textSec, marginTop: 2 },
  badge:        { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 9, paddingVertical: 4, borderRadius: 20, borderWidth: 1 },
  badgeTxt:     { fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },
  flowRow:      { flexDirection: 'row', alignItems: 'center', gap: 6 },
  flowTxt:      { fontSize: 11, fontWeight: '600' },
  flowDot:      { width: 6, height: 6, borderRadius: 3, marginLeft: 'auto' },

  emptyCard:  { backgroundColor: C.card, borderRadius: 18, padding: 48, alignItems: 'center', gap: 10, borderWidth: 1, borderColor: C.border },
  emptyTitle: { fontSize: 17, fontWeight: '800', color: C.textPri },
  emptyText:  { fontSize: 12, color: C.textSec, textAlign: 'center', lineHeight: 18 },
});
