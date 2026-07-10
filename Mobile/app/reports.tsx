import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { Animated, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const C = {
  bg:'#080d10', card:'#0f1923', cardInner:'#111d27', border:'rgba(255,255,255,0.07)',
  brand:'#10b981', sky:'#38bdf8', amber:'#f59e0b', danger:'#ef4444', purple:'#7c3aed',
  textPri:'#e2e8f0', textSec:'#94a3b8', textMuted:'#475569',
};

// Mock data for demonstration
const WATER_USAGE = [
  { day:'Mon', liters: 1200 }, { day:'Tue', liters: 980  },
  { day:'Wed', liters: 1500 }, { day:'Thu', liters: 1100 },
  { day:'Fri', liters: 870  }, { day:'Sat', liters: 1350 },
  { day:'Sun', liters: 1050 },
];
const MAX_LITERS = Math.max(...WATER_USAGE.map(d => d.liters));

const MOISTURE_TREND = [42, 48, 55, 61, 58, 64, 71, 68, 72, 75, 70, 66];

const EVENTS = [
  { id:'1', zone:'North Field A', type:'Manual',    duration:'30 min', time:'Today 06:00',  liters:450  },
  { id:'2', zone:'East Block',    type:'Scheduled', duration:'20 min', time:'Today 07:30',  liters:300  },
  { id:'3', zone:'Greenhouse 1',  type:'Scheduled', duration:'15 min', time:'Yesterday',    liters:220  },
  { id:'4', zone:'North Field A', type:'Manual',    duration:'45 min', time:'2 days ago',   liters:680  },
];

// Simple bar chart
function BarChart() {
  const bars = WATER_USAGE.map(d => ({
    ...d,
    pct: (d.liters / MAX_LITERS) * 100,
    anim: useRef(new Animated.Value(0)).current,
  }));

  useEffect(() => {
    bars.forEach((b, i) => {
      setTimeout(() => {
        Animated.spring(b.anim, { toValue: b.pct, useNativeDriver: false, damping: 14, stiffness: 80 }).start();
      }, i * 60);
    });
  }, []);

  return (
    <View style={s.barChart}>
      {bars.map(b => (
        <View key={b.day} style={s.barCol}>
          <Text style={s.barVal}>{(b.liters / 1000).toFixed(1)}k</Text>
          <View style={s.barTrack}>
            <Animated.View style={[s.barFill, {
              height: b.anim.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] }),
            }]} />
          </View>
          <Text style={s.barDay}>{b.day}</Text>
        </View>
      ))}
    </View>
  );
}

// Simple sparkline
function Sparkline() {
  const pts = MOISTURE_TREND;
  const max = Math.max(...pts); const min = Math.min(...pts);
  const chartH = 50; const chartW = 260;
  const stepX = chartW / (pts.length - 1);
  const toY = (v: number) => chartH - ((v - min) / (max - min)) * chartH;

  const pathD = pts.map((v, i) => `${i === 0 ? 'M' : 'L'} ${i * stepX} ${toY(v)}`).join(' ');

  return (
    <View style={s.sparkline}>
      {/* Simple dot-line simulation without SVG */}
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: chartH, gap: 2 }}>
        {pts.map((v, i) => {
          const h = ((v - min) / (max - min)) * chartH;
          return (
            <View key={i} style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-end' }}>
              <View style={[s.sparkDot, { height: h || 4, backgroundColor: v > 60 ? C.brand : v > 40 ? C.amber : C.danger }]} />
            </View>
          );
        })}
      </View>
    </View>
  );
}

export default function ReportsScreen() {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 450, useNativeDriver: true }).start();
  }, []);

  const totalWater = WATER_USAGE.reduce((a, d) => a + d.liters, 0);
  const avgWater   = Math.round(totalWater / WATER_USAGE.length);

  return (
    <View style={s.root}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Feather name="arrow-left" size={20} color={C.brand} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={s.headerTitle}>Reports</Text>
          <Text style={s.headerSub}>FARM ANALYTICS</Text>
        </View>
        <TouchableOpacity style={s.exportBtn}>
          <Feather name="download" size={16} color={C.brand} />
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <Animated.View style={{ opacity: fadeAnim }}>

          {/* ── Summary strip ──────────────────────────────────────── */}
          <View style={s.strip}>
            <View style={s.stripItem}>
              <Feather name="droplet" size={14} color={C.sky} />
              <Text style={[s.stripNum, { color: C.sky }]}>{(totalWater/1000).toFixed(1)}k</Text>
              <Text style={s.stripLbl}>Total L</Text>
            </View>
            <View style={s.stripDiv} />
            <View style={s.stripItem}>
              <Feather name="bar-chart-2" size={14} color={C.amber} />
              <Text style={[s.stripNum, { color: C.amber }]}>{avgWater}</Text>
              <Text style={s.stripLbl}>Avg/day</Text>
            </View>
            <View style={s.stripDiv} />
            <View style={s.stripItem}>
              <Feather name="activity" size={14} color={C.brand} />
              <Text style={[s.stripNum, { color: C.brand }]}>{EVENTS.length}</Text>
              <Text style={s.stripLbl}>Events</Text>
            </View>
          </View>

          {/* ── Water Usage Chart ─────────────────────────────────── */}
          <View style={s.sectionHead}>
            <View style={s.sectionBar} />
            <Feather name="bar-chart-2" size={14} color={C.brand} />
            <Text style={s.sectionTitle}>WATER USAGE (7 DAYS)</Text>
          </View>
          <View style={s.chartCard}>
            <BarChart />
          </View>

          {/* ── Moisture Trend ────────────────────────────────────── */}
          <View style={s.sectionHead}>
            <View style={s.sectionBar} />
            <Feather name="activity" size={14} color={C.brand} />
            <Text style={s.sectionTitle}>MOISTURE TREND</Text>
          </View>
          <View style={s.chartCard}>
            <Sparkline />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
              <Text style={s.sparkLabel}>12 hrs ago</Text>
              <Text style={s.sparkLabel}>Now</Text>
            </View>
          </View>

          {/* ── Event log ─────────────────────────────────────────── */}
          <View style={s.sectionHead}>
            <View style={s.sectionBar} />
            <Feather name="list" size={14} color={C.brand} />
            <Text style={s.sectionTitle}>IRRIGATION EVENTS</Text>
          </View>
          <View style={s.eventCard}>
            {EVENTS.map((ev, i) => (
              <View key={ev.id} style={[s.eventRow, i < EVENTS.length - 1 && s.eventRowBorder]}>
                <View style={[s.eventIconWrap, { backgroundColor: ev.type === 'Manual' ? 'rgba(124,58,237,0.12)' : 'rgba(16,185,129,0.12)' }]}>
                  <Feather name={ev.type === 'Manual' ? 'play-circle' : 'clock'} size={14} color={ev.type === 'Manual' ? C.purple : C.brand} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.eventZone}>{ev.zone}</Text>
                  <View style={{ flexDirection: 'row', gap: 8, marginTop: 2 }}>
                    <Text style={s.eventMeta}>{ev.type}</Text>
                    <Text style={s.eventMeta}>•</Text>
                    <Text style={s.eventMeta}>{ev.duration}</Text>
                  </View>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={s.eventLiters}>{ev.liters} L</Text>
                  <Text style={s.eventTime}>{ev.time}</Text>
                </View>
              </View>
            ))}
          </View>

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
  exportBtn:   { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(16,185,129,0.1)', borderWidth: 1, borderColor: 'rgba(16,185,129,0.2)', alignItems: 'center', justifyContent: 'center' },
  scroll:      { padding: 16, paddingBottom: 40 },

  strip:     { flexDirection: 'row', backgroundColor: C.card, borderRadius: 16, borderWidth: 1, borderColor: C.border, padding: 14, marginBottom: 20 },
  stripItem: { flex: 1, alignItems: 'center', gap: 3 },
  stripNum:  { fontSize: 22, fontWeight: '900' },
  stripLbl:  { fontSize: 9, fontWeight: '700', color: C.textMuted, textTransform: 'uppercase', letterSpacing: 0.8 },
  stripDiv:  { width: 1, backgroundColor: 'rgba(255,255,255,0.07)', marginHorizontal: 4 },

  sectionHead:  { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  sectionBar:   { width: 4, height: 18, backgroundColor: C.brand, borderRadius: 4 },
  sectionTitle: { fontSize: 11, fontWeight: '800', color: C.textSec, letterSpacing: 1.5, textTransform: 'uppercase' },

  chartCard:   { backgroundColor: C.card, borderRadius: 18, borderWidth: 1, borderColor: C.border, padding: 16, marginBottom: 20 },
  barChart:    { flexDirection: 'row', alignItems: 'flex-end', gap: 6, height: 100 },
  barCol:      { flex: 1, alignItems: 'center', gap: 4 },
  barVal:      { fontSize: 8, color: C.textMuted, fontWeight: '700' },
  barTrack:    { flex: 1, width: '100%', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 4, overflow: 'hidden', justifyContent: 'flex-end' },
  barFill:     { width: '100%', backgroundColor: C.brand, borderRadius: 4 },
  barDay:      { fontSize: 9, color: C.textSec, fontWeight: '700' },

  sparkline:   { height: 60 },
  sparkDot:    { width: '100%', borderRadius: 2, minHeight: 4 },
  sparkLabel:  { fontSize: 9, color: C.textMuted, fontWeight: '600' },

  eventCard:     { backgroundColor: C.card, borderRadius: 16, borderWidth: 1, borderColor: C.border, overflow: 'hidden', marginBottom: 16 },
  eventRow:      { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  eventRowBorder:{ borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  eventIconWrap: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  eventZone:     { fontSize: 13, fontWeight: '700', color: C.textPri },
  eventMeta:     { fontSize: 10, color: C.textSec, fontWeight: '600' },
  eventLiters:   { fontSize: 14, fontWeight: '800', color: C.sky },
  eventTime:     { fontSize: 10, color: C.textMuted, fontWeight: '600', marginTop: 2 },
});
