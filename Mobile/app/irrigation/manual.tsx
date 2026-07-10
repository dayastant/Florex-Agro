import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated, ScrollView, StyleSheet, Text,
  TouchableOpacity, Vibration, View,
} from 'react-native';
import { farmService, getLoggedUser, irrigationService, telemetryService } from '../../apiservice/api';

const C = {
  bg:'#080d10', card:'#0f1923', cardInner:'#111d27', border:'rgba(255,255,255,0.07)',
  brand:'#10b981', brandGlow:'rgba(16,185,129,0.14)',
  danger:'#ef4444', dangerGlow:'rgba(239,68,68,0.14)',
  amber:'#f59e0b', sky:'#38bdf8',
  textPri:'#e2e8f0', textSec:'#94a3b8', textMuted:'#475569',
};

const DURATIONS = [5, 10, 15, 20, 30, 45, 60];

export default function ManualIrrigationScreen() {
  const router    = useRouter();
  const [farms, setFarms]         = useState<any[]>([]);
  const [zones, setZones]         = useState<any[]>([]);
  const [selectedFarm, setSelFarm]= useState<any>(null);
  const [selectedZone, setSelZone]= useState<any>(null);
  const [duration, setDuration]   = useState(15);
  const [active, setActive]       = useState(false);
  const [elapsed, setElapsed]     = useState(0);
  const [loading, setLoading]     = useState(true);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const load = async () => {
      try {
        const cu = getLoggedUser();
        const isTech = cu?.roleId === '33333333-3333-3333-3333-333333333333';
        const res = await farmService.getFarms(isTech ? undefined : cu?.id);
        const fData = res.data || [];
        setFarms(fData);
        if (fData.length > 0) { setSelFarm(fData[0]); loadZones(fData[0].id); }
      } catch { /* silent */ }
      finally { setLoading(false); Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start(); }
    };
    load();
  }, []);

  const loadZones = async (farmId: string) => {
    try {
      const res = await farmService.getZonesByFarm(farmId);
      const z = res.data || [];
      setZones(z);
      setSelZone(z[0] ?? null);
    } catch { setZones([]); setSelZone(null); }
  };

  const selectFarm = (farm: any) => { setSelFarm(farm); loadZones(farm.id); };

  // Pulse animation when active
  useEffect(() => {
    if (active) {
      Animated.loop(Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.08, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])).start();
      timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
    } else {
      pulseAnim.stopAnimation(); pulseAnim.setValue(1);
      if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [active]);

  const handleStart = async () => {
    if (!selectedZone) return;
    Vibration.vibrate(40);
    setActive(true); setElapsed(0);
    try { await irrigationService.startManual(selectedZone.id, duration); } catch { /* optimistic */ }
  };

  const handleStop = async () => {
    Vibration.vibrate(40);
    setActive(false); setElapsed(0);
    try { if (selectedZone) await irrigationService.stopManual(selectedZone.id); } catch { /* silent */ }
  };

  const remaining = Math.max(0, duration * 60 - elapsed);
  const remMin    = Math.floor(remaining / 60).toString().padStart(2, '0');
  const remSec    = (remaining % 60).toString().padStart(2, '0');
  const progress  = Math.min((elapsed / (duration * 60)) * 100, 100);

  return (
    <View style={s.root}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Feather name="arrow-left" size={20} color={C.brand} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={s.headerTitle}>Manual Irrigation</Text>
          <Text style={s.headerSub}>ZONE CONTROL</Text>
        </View>
        {active && (
          <View style={s.livePill}>
            <View style={s.liveDot} />
            <Text style={s.liveTxt}>LIVE</Text>
          </View>
        )}
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <Animated.View style={{ opacity: fadeAnim }}>

          {/* ── Big timer ──────────────────────────────────────────── */}
          <View style={s.timerCard}>
            <Animated.View style={[s.timerRing, {
              borderColor: active ? C.brand : 'rgba(255,255,255,0.08)',
              transform: [{ scale: pulseAnim }],
            }]}>
              <View style={s.timerInner}>
                <Feather name="droplet" size={28} color={active ? C.brand : C.textMuted} />
                <Text style={[s.timerTime, { color: active ? C.brand : C.textPri }]}>
                  {remMin}:{remSec}
                </Text>
                <Text style={s.timerLabel}>{active ? 'remaining' : `${duration} min`}</Text>
              </View>
            </Animated.View>

            {/* Progress bar */}
            {active && (
              <View style={s.progressTrack}>
                <View style={[s.progressFill, { width: `${progress}%` }]} />
              </View>
            )}
          </View>

          {/* ── Farm selector ─────────────────────────────────────── */}
          <View style={s.section}>
            <Text style={s.sectionLabel}>SELECT FARM</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {farms.map(f => (
                  <TouchableOpacity
                    key={f.id}
                    onPress={() => !active && selectFarm(f)}
                    style={[s.chip, selectedFarm?.id === f.id && s.chipActive]}
                  >
                    <Feather name="home" size={13} color={selectedFarm?.id === f.id ? C.brand : C.textMuted} />
                    <Text style={[s.chipTxt, selectedFarm?.id === f.id && s.chipTxtActive]}>
                      {f.farmName ?? f.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* ── Zone selector ─────────────────────────────────────── */}
          <View style={s.section}>
            <Text style={s.sectionLabel}>SELECT ZONE</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {zones.map(z => (
                  <TouchableOpacity
                    key={z.id}
                    onPress={() => !active && setSelZone(z)}
                    style={[s.chip, selectedZone?.id === z.id && s.chipActive]}
                  >
                    <Feather name="grid" size={13} color={selectedZone?.id === z.id ? C.brand : C.textMuted} />
                    <Text style={[s.chipTxt, selectedZone?.id === z.id && s.chipTxtActive]}>
                      {z.zoneName ?? z.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* ── Duration picker ───────────────────────────────────── */}
          <View style={s.section}>
            <Text style={s.sectionLabel}>DURATION</Text>
            <View style={s.durationRow}>
              {DURATIONS.map(d => (
                <TouchableOpacity
                  key={d}
                  onPress={() => !active && setDuration(d)}
                  style={[s.durBtn, duration === d && s.durBtnActive]}
                >
                  <Text style={[s.durTxt, duration === d && s.durTxtActive]}>{d}m</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* ── Start / Stop ──────────────────────────────────────── */}
          {!active ? (
            <TouchableOpacity
              onPress={handleStart}
              disabled={!selectedZone}
              activeOpacity={0.8}
              style={[s.startBtn, !selectedZone && { opacity: 0.4 }]}
            >
              <Feather name="play-circle" size={20} color="#fff" />
              <Text style={s.startBtnTxt}>Start Irrigation</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={handleStop} activeOpacity={0.8} style={s.stopBtn}>
              <Feather name="stop-circle" size={20} color="#fff" />
              <Text style={s.stopBtnTxt}>Stop Irrigation</Text>
            </TouchableOpacity>
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
  livePill:    { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(16,185,129,0.12)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(16,185,129,0.3)' },
  liveDot:     { width: 6, height: 6, borderRadius: 3, backgroundColor: C.brand },
  liveTxt:     { fontSize: 10, fontWeight: '800', color: C.brand, letterSpacing: 1 },

  scroll: { padding: 16, paddingBottom: 40 },

  timerCard: { backgroundColor: C.card, borderRadius: 24, borderWidth: 1, borderColor: C.border, padding: 24, alignItems: 'center', marginBottom: 24, gap: 16 },
  timerRing: { width: 160, height: 160, borderRadius: 80, borderWidth: 3, alignItems: 'center', justifyContent: 'center' },
  timerInner:{ alignItems: 'center', gap: 4 },
  timerTime: { fontSize: 40, fontWeight: '900', letterSpacing: -1 },
  timerLabel:{ fontSize: 11, fontWeight: '600', color: C.textSec },
  progressTrack:{ width: '100%', height: 6, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: C.brand, borderRadius: 3 },

  section:      { marginBottom: 20 },
  sectionLabel: { fontSize: 10, fontWeight: '800', color: C.textMuted, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 10 },
  chip:         { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 9, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', backgroundColor: C.card },
  chipActive:   { borderColor: C.brand, backgroundColor: 'rgba(16,185,129,0.12)' },
  chipTxt:      { fontSize: 12, fontWeight: '700', color: C.textMuted },
  chipTxtActive:{ color: C.brand },

  durationRow:  { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  durBtn:       { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', backgroundColor: C.card },
  durBtnActive: { borderColor: C.brand, backgroundColor: 'rgba(16,185,129,0.14)' },
  durTxt:       { fontSize: 13, fontWeight: '700', color: C.textMuted },
  durTxtActive: { color: C.brand },

  startBtn:    { backgroundColor: C.brand, borderRadius: 16, paddingVertical: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  startBtnTxt: { color: '#fff', fontSize: 16, fontWeight: '900' },
  stopBtn:     { backgroundColor: C.danger, borderRadius: 16, paddingVertical: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  stopBtnTxt:  { color: '#fff', fontSize: 16, fontWeight: '900' },
});
