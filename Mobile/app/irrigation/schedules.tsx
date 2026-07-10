import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated, RefreshControl, ScrollView, StyleSheet,
  Switch, Text, TouchableOpacity, View,
} from 'react-native';
import { irrigationService } from '../../apiservice/api';

const C = {
  bg:'#080d10', card:'#0f1923', border:'rgba(255,255,255,0.07)',
  brand:'#10b981', amber:'#f59e0b', danger:'#ef4444', purple:'#7c3aed',
  textPri:'#e2e8f0', textSec:'#94a3b8', textMuted:'#475569',
};

const DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

// Mock schedule data for UI demonstration
const MOCK_SCHEDULES = [
  { id: '1', zoneName: 'North Field A', startTime: '06:00', durationMinutes: 30, daysOfWeek: ['Mon','Wed','Fri'], isEnabled: true },
  { id: '2', zoneName: 'East Block',    startTime: '18:30', durationMinutes: 20, daysOfWeek: ['Tue','Thu','Sat'], isEnabled: true },
  { id: '3', zoneName: 'Greenhouse 1',  startTime: '07:00', durationMinutes: 15, daysOfWeek: DAYS,               isEnabled: false },
];

function ScheduleCard({ schedule, onToggle, onDelete }: {
  schedule: any;
  onToggle: (id: string, enabled: boolean) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <View style={[s.schedCard, !schedule.isEnabled && s.schedCardDim]}>
      <View style={s.schedTop}>
        <View style={{ flex: 1 }}>
          <Text style={s.schedZone}>{schedule.zoneName}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Feather name="clock" size={12} color={C.textSec} />
              <Text style={s.schedTime}>{schedule.startTime}</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Feather name="activity" size={12} color={C.textSec} />
              <Text style={s.schedDur}>{schedule.durationMinutes} min</Text>
            </View>
          </View>
        </View>
        <View style={{ alignItems: 'flex-end', gap: 8 }}>
          <TouchableOpacity onPress={() => onDelete(schedule.id)} style={s.deleteBtn}>
            <Feather name="trash-2" size={14} color={C.danger} />
          </TouchableOpacity>
          <Switch
            value={schedule.isEnabled}
            onValueChange={v => onToggle(schedule.id, v)}
            trackColor={{ false: 'rgba(255,255,255,0.1)', true: 'rgba(16,185,129,0.35)' }}
            thumbColor={schedule.isEnabled ? C.brand : '#334155'}
          />
        </View>
      </View>

      {/* Days chips */}
      <View style={s.daysRow}>
        {DAYS.map(d => (
          <View
            key={d}
            style={[s.dayChip, schedule.daysOfWeek.includes(d) && s.dayChipActive]}
          >
            <Text style={[s.dayChipTxt, schedule.daysOfWeek.includes(d) && s.dayChipTxtActive]}>{d}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

export default function SchedulesScreen() {
  const router = useRouter();
  const [schedules, setSchedules] = useState<any[]>(MOCK_SCHEDULES);
  const [refreshing, setRefreshing] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Try to load real schedules, fallback to mock
    const load = async () => {
      try {
        const res = await irrigationService.getSchedules();
        if (res.data?.length > 0) setSchedules(res.data);
      } catch { /* use mock data */ }
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
    };
    load();
  }, []);

  const onRefresh = () => { setRefreshing(true); setTimeout(() => setRefreshing(false), 800); };

  const handleToggle = async (id: string, enabled: boolean) => {
    setSchedules(prev => prev.map(s => s.id === id ? { ...s, isEnabled: enabled } : s));
    try { await irrigationService.toggleSchedule(id, enabled); } catch { /* silent */ }
  };

  const handleDelete = (id: string) => {
    setSchedules(prev => prev.filter(s => s.id !== id));
    irrigationService.deleteSchedule(id).catch(() => { /* silent */ });
  };

  const enabledCount = schedules.filter(s => s.isEnabled).length;

  return (
    <View style={s.root}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Feather name="arrow-left" size={20} color={C.brand} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={s.headerTitle}>Schedules</Text>
          <Text style={s.headerSub}>{enabledCount} ACTIVE SCHEDULES</Text>
        </View>
        <TouchableOpacity style={s.addBtn}>
          <Feather name="plus" size={20} color={C.brand} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={{ flex: 1 }} contentContainerStyle={s.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.brand} colors={[C.brand]} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Summary */}
        <View style={s.strip}>
          <View style={s.stripItem}>
            <Feather name="clock" size={14} color={C.brand} />
            <Text style={[s.stripNum, { color: C.brand }]}>{schedules.length}</Text>
            <Text style={s.stripLbl}>Total</Text>
          </View>
          <View style={s.stripDiv} />
          <View style={s.stripItem}>
            <Feather name="check-circle" size={14} color={C.brand} />
            <Text style={[s.stripNum, { color: C.brand }]}>{enabledCount}</Text>
            <Text style={s.stripLbl}>Active</Text>
          </View>
          <View style={s.stripDiv} />
          <View style={s.stripItem}>
            <Feather name="pause-circle" size={14} color={C.textMuted} />
            <Text style={[s.stripNum, { color: C.textMuted }]}>{schedules.length - enabledCount}</Text>
            <Text style={s.stripLbl}>Paused</Text>
          </View>
        </View>

        <Animated.View style={{ opacity: fadeAnim, gap: 12 }}>
          {schedules.map(sc => (
            <ScheduleCard
              key={sc.id}
              schedule={sc}
              onToggle={handleToggle}
              onDelete={handleDelete}
            />
          ))}
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
  scroll:      { padding: 16, paddingBottom: 40 },

  strip:    { flexDirection: 'row', backgroundColor: C.card, borderRadius: 16, borderWidth: 1, borderColor: C.border, padding: 14, marginBottom: 20 },
  stripItem:{ flex: 1, alignItems: 'center', gap: 3 },
  stripNum: { fontSize: 22, fontWeight: '900' },
  stripLbl: { fontSize: 9, fontWeight: '700', color: C.textMuted, textTransform: 'uppercase', letterSpacing: 0.8 },
  stripDiv: { width: 1, backgroundColor: 'rgba(255,255,255,0.07)', marginHorizontal: 4 },

  schedCard:    { backgroundColor: C.card, borderRadius: 16, borderWidth: 1, borderColor: C.border, padding: 14, gap: 12 },
  schedCardDim: { opacity: 0.5 },
  schedTop:     { flexDirection: 'row', alignItems: 'flex-start' },
  schedZone:    { fontSize: 15, fontWeight: '800', color: C.textPri },
  schedTime:    { fontSize: 12, fontWeight: '700', color: C.textSec },
  schedDur:     { fontSize: 12, fontWeight: '700', color: C.textSec },
  deleteBtn:    { width: 28, height: 28, borderRadius: 8, backgroundColor: 'rgba(239,68,68,0.1)', borderWidth: 1, borderColor: 'rgba(239,68,68,0.25)', alignItems: 'center', justifyContent: 'center' },

  daysRow:       { flexDirection: 'row', gap: 6 },
  dayChip:       { flex: 1, alignItems: 'center', paddingVertical: 5, borderRadius: 6, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', backgroundColor: 'rgba(255,255,255,0.03)' },
  dayChipActive: { borderColor: C.brand, backgroundColor: 'rgba(16,185,129,0.14)' },
  dayChipTxt:    { fontSize: 9, fontWeight: '700', color: C.textMuted },
  dayChipTxtActive:{ color: C.brand },
});
