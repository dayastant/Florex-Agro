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
  brand:'#10b981', amber:'#f59e0b', danger:'#ef4444',
  textPri:'#e2e8f0', textSec:'#94a3b8', textMuted:'#475569',
};

function MotorCard({ motor, onToggle }: { motor: any; onToggle: (id: string, on: boolean) => void }) {
  const isOn    = motor.isRunning ?? false;
  const speed   = motor.speed ?? 0;
  const stColor = isOn ? C.brand : C.textMuted;

  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (isOn) {
      Animated.loop(Animated.timing(anim, { toValue: 1, duration: 800, useNativeDriver: true })).start();
    } else { anim.stopAnimation(); anim.setValue(0); }
  }, [isOn]);
  const rotate = anim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <View style={[s.motorCard, { borderLeftColor: stColor }]}>
      <View style={s.motorTop}>
        <View style={{ flex: 1 }}>
          <Text style={s.motorCaption}>MOTOR CONTROLLER</Text>
          <Text style={s.motorName}>{motor.name ?? motor.deviceSerial ?? 'Motor'}</Text>
          <Text style={s.motorSub}>{motor.motorType ?? 'Pump Motor'}</Text>
        </View>
        <View style={{ alignItems: 'flex-end', gap: 8 }}>
          <Animated.View style={{ transform: [{ rotate }] }}>
            <Feather name="settings" size={22} color={stColor} />
          </Animated.View>
          <Switch
            value={isOn}
            onValueChange={v => onToggle(motor.id, v)}
            trackColor={{ false: 'rgba(255,255,255,0.1)', true: 'rgba(16,185,129,0.35)' }}
            thumbColor={isOn ? C.brand : '#334155'}
          />
        </View>
      </View>

      {/* Speed bar */}
      <View style={s.speedSection}>
        <View style={s.speedHeaderRow}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Feather name="zap" size={12} color={C.amber} />
            <Text style={s.speedLabel}>SPEED</Text>
          </View>
          <Text style={[s.speedValue, { color: isOn ? C.amber : C.textMuted }]}>{speed}%</Text>
        </View>
        <View style={s.speedTrack}>
          <View style={[s.speedFill, { width: `${speed}%`, backgroundColor: isOn ? C.amber : C.textMuted }]} />
        </View>
      </View>

      {/* Status pill */}
      <View style={[s.statusPill, { backgroundColor: isOn ? 'rgba(16,185,129,0.12)' : 'rgba(71,85,105,0.15)', borderColor: stColor }]}>
        <View style={[s.statusDot, { backgroundColor: stColor }]} />
        <Text style={[s.statusTxt, { color: stColor }]}>{isOn ? 'RUNNING' : 'STOPPED'}</Text>
      </View>
    </View>
  );
}

export default function MotorsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router  = useRouter();
  const [motors, setMotors]       = useState<any[]>([]);
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing]= useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const load = async () => {
    try {
      const res = await hardwareService.getMotors(id);
      const mapped = (res.data || []).map((m: any) => ({
        ...m,
        isRunning: m.isRunning ?? (m.status === 'Running' || m.status === 'RUNNING'),
        speed: m.speed ?? (m.status === 'Running' || m.status === 'RUNNING' ? 100 : 0),
      }));
      setMotors(mapped);
    } catch { /* silent */ }
    finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { load(); }, [id]);
  useEffect(() => {
    if (!loading) Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, [loading]);

  const onRefresh = () => { setRefreshing(true); load(); };
  const handleToggle = async (motorId: string, isOn: boolean) => {
    setMotors(prev => prev.map(m => m.id === motorId ? { ...m, isRunning: isOn, speed: isOn ? 100 : 0 } : m));
    try { await hardwareService.updateMotor(motorId, isOn); } catch { /* revert would go here */ }
  };

  const runningCount = motors.filter(m => m.isRunning).length;

  return (
    <View style={s.root}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Feather name="arrow-left" size={20} color={C.brand} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={s.headerTitle}>Motors</Text>
          <Text style={s.headerSub}>{runningCount}/{motors.length} RUNNING</Text>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }} contentContainerStyle={s.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.brand} colors={[C.brand]} />}
        showsVerticalScrollIndicator={false}
      >
        {motors.length > 0 ? (
          <Animated.View style={{ opacity: fadeAnim, gap: 12 }}>
            {motors.map(m => <MotorCard key={m.id} motor={m} onToggle={handleToggle} />)}
          </Animated.View>
        ) : (
          <View style={s.emptyCard}>
            <Feather name="settings" size={40} color={C.textMuted} />
            <Text style={s.emptyTitle}>No motors found</Text>
            <Text style={s.emptyText}>No motor controllers are registered for this farm.</Text>
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

  motorCard:     { backgroundColor: C.card, borderRadius: 16, borderWidth: 1, borderColor: C.border, borderLeftWidth: 4, padding: 14, gap: 12 },
  motorTop:      { flexDirection: 'row', alignItems: 'flex-start' },
  motorCaption:  { fontSize: 9, fontWeight: '700', color: C.textMuted, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 2 },
  motorName:     { fontSize: 15, fontWeight: '800', color: C.textPri },
  motorSub:      { fontSize: 11, color: C.textSec, marginTop: 2 },

  speedSection:  { gap: 6 },
  speedHeaderRow:{ flexDirection: 'row', justifyContent: 'space-between' },
  speedLabel:    { fontSize: 10, fontWeight: '700', color: C.textMuted, letterSpacing: 1, textTransform: 'uppercase' },
  speedValue:    { fontSize: 14, fontWeight: '900' },
  speedTrack:    { height: 7, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 4, overflow: 'hidden' },
  speedFill:     { height: '100%', borderRadius: 4 },

  statusPill:    { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, borderWidth: 1 },
  statusDot:     { width: 6, height: 6, borderRadius: 3 },
  statusTxt:     { fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },

  emptyCard:  { backgroundColor: C.card, borderRadius: 18, padding: 48, alignItems: 'center', gap: 10, borderWidth: 1, borderColor: C.border },
  emptyTitle: { fontSize: 17, fontWeight: '800', color: C.textPri },
  emptyText:  { fontSize: 12, color: C.textSec, textAlign: 'center', lineHeight: 18 },
});
