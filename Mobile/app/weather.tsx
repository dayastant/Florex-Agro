import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const C = {
  bg:'#080d10', card:'#0f1923', cardInner:'#111d27', border:'rgba(255,255,255,0.07)',
  brand:'#10b981', sky:'#38bdf8', amber:'#f59e0b', danger:'#ef4444', purple:'#7c3aed',
  textPri:'#e2e8f0', textSec:'#94a3b8', textMuted:'#475569',
};

// Open-Meteo free API — no key needed
const MOCK_CURRENT = {
  temp: 28, feels: 26, humidity: 62, wind: 14, uv: 7, condition: 'Partly Cloudy',
  icon: 'cloud' as const,
};
const MOCK_FORECAST = [
  { day: 'Mon', icon: 'sun'       as const, high: 31, low: 22, rain: 5  },
  { day: 'Tue', icon: 'cloud'     as const, high: 28, low: 21, rain: 20 },
  { day: 'Wed', icon: 'cloud-rain'as const, high: 25, low: 19, rain: 70 },
  { day: 'Thu', icon: 'cloud-rain'as const, high: 23, low: 18, rain: 80 },
  { day: 'Fri', icon: 'cloud'     as const, high: 27, low: 20, rain: 30 },
  { day: 'Sat', icon: 'sun'       as const, high: 30, low: 21, rain: 5  },
  { day: 'Sun', icon: 'sun'       as const, high: 32, low: 22, rain: 0  },
];

function WeatherStat({ icon, label, value, color }: { icon: React.ComponentProps<typeof Feather>['name']; label: string; value: string; color: string }) {
  return (
    <View style={s.wStat}>
      <Feather name={icon} size={18} color={color} />
      <Text style={[s.wStatVal, { color }]}>{value}</Text>
      <Text style={s.wStatLbl}>{label}</Text>
    </View>
  );
}

export default function WeatherScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, []);

  const onRefresh = () => { setRefreshing(true); setTimeout(() => setRefreshing(false), 800); };

  const rainColor = (pct: number) => pct >= 60 ? C.danger : pct >= 30 ? C.amber : C.brand;

  return (
    <View style={s.root}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Feather name="arrow-left" size={20} color={C.brand} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={s.headerTitle}>Weather</Text>
          <Text style={s.headerSub}>FARM CONDITIONS</Text>
        </View>
        <Feather name="refresh-cw" size={18} color={C.brand} onPress={onRefresh} />
      </View>

      <ScrollView
        style={{ flex: 1 }} contentContainerStyle={s.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.brand} colors={[C.brand]} />}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fadeAnim }}>

          {/* ── Current conditions ─────────────────────────────────── */}
          <View style={s.currentCard}>
            <View style={s.currentTop}>
              <View>
                <Text style={s.conditionLabel}>{MOCK_CURRENT.condition}</Text>
                <Text style={s.tempBig}>{MOCK_CURRENT.temp}°C</Text>
                <Text style={s.feelsLike}>Feels like {MOCK_CURRENT.feels}°C</Text>
              </View>
              <View style={s.currentIconWrap}>
                <Feather name={MOCK_CURRENT.icon} size={54} color={C.sky} />
              </View>
            </View>

            <View style={s.wStatsRow}>
              <WeatherStat icon="droplet"  label="Humidity" value={`${MOCK_CURRENT.humidity}%`} color={C.sky}   />
              <View style={s.wStatDiv} />
              <WeatherStat icon="wind"     label="Wind"     value={`${MOCK_CURRENT.wind} km/h`} color={C.textSec}/>
              <View style={s.wStatDiv} />
              <WeatherStat icon="sun"      label="UV Index" value={String(MOCK_CURRENT.uv)}      color={C.amber} />
            </View>

            {/* Irrigation advisory */}
            <View style={s.advisory}>
              <Feather name="info" size={14} color={C.brand} />
              <Text style={s.advisoryTxt}>
                {MOCK_CURRENT.humidity > 70
                  ? 'High humidity — consider reducing irrigation today.'
                  : MOCK_CURRENT.temp > 35
                  ? 'High temperature — increase irrigation frequency.'
                  : 'Conditions are optimal for scheduled irrigation.'}
              </Text>
            </View>
          </View>

          {/* ── 7-Day Forecast ────────────────────────────────────── */}
          <View style={s.sectionHead}>
            <View style={s.sectionBar} />
            <Feather name="calendar" size={14} color={C.brand} />
            <Text style={s.sectionTitle}>7-DAY FORECAST</Text>
          </View>

          <View style={s.forecastCard}>
            {MOCK_FORECAST.map((day, i) => (
              <View key={day.day} style={[s.forecastRow, i < MOCK_FORECAST.length - 1 && s.forecastRowBorder]}>
                <Text style={s.forecastDay}>{day.day}</Text>
                <Feather name={day.icon} size={18} color={day.icon === 'sun' ? C.amber : day.icon === 'cloud-rain' ? C.sky : C.textSec} />
                <View style={{ flex: 1, paddingHorizontal: 10 }}>
                  <View style={s.rainRow}>
                    <Feather name="cloud-rain" size={10} color={rainColor(day.rain)} />
                    <Text style={[s.rainPct, { color: rainColor(day.rain) }]}>{day.rain}%</Text>
                  </View>
                </View>
                <Text style={s.forecastLow}>{day.low}°</Text>
                <Text style={s.forecastHigh}>{day.high}°</Text>
              </View>
            ))}
          </View>

          <View style={s.footerRow}>
            <Feather name="cloud" size={10} color={C.textMuted} />
            <Text style={s.footer}>Weather data  •  Updated periodically</Text>
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
  scroll:      { padding: 16, paddingBottom: 40 },

  currentCard: { backgroundColor: C.card, borderRadius: 24, borderWidth: 1, borderColor: 'rgba(56,189,248,0.2)', padding: 20, marginBottom: 20, gap: 16 },
  currentTop:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  conditionLabel:{ fontSize: 13, fontWeight: '600', color: C.textSec, marginBottom: 4 },
  tempBig:     { fontSize: 56, fontWeight: '900', color: C.textPri, letterSpacing: -2 },
  feelsLike:   { fontSize: 12, color: C.textSec, marginTop: 2 },
  currentIconWrap:{ width: 90, height: 90, borderRadius: 24, backgroundColor: 'rgba(56,189,248,0.1)', alignItems: 'center', justifyContent: 'center' },

  wStatsRow: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', padding: 14 },
  wStat:     { flex: 1, alignItems: 'center', gap: 4 },
  wStatVal:  { fontSize: 16, fontWeight: '800' },
  wStatLbl:  { fontSize: 9, fontWeight: '700', color: C.textMuted, textTransform: 'uppercase', letterSpacing: 0.8 },
  wStatDiv:  { width: 1, backgroundColor: 'rgba(255,255,255,0.07)' },

  advisory:    { flexDirection: 'row', alignItems: 'flex-start', gap: 8, backgroundColor: 'rgba(16,185,129,0.08)', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(16,185,129,0.2)', padding: 12 },
  advisoryTxt: { fontSize: 12, color: C.textSec, lineHeight: 18, flex: 1 },

  sectionHead:  { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  sectionBar:   { width: 4, height: 18, backgroundColor: C.brand, borderRadius: 4 },
  sectionTitle: { fontSize: 11, fontWeight: '800', color: C.textSec, letterSpacing: 1.5, textTransform: 'uppercase' },

  forecastCard:     { backgroundColor: C.card, borderRadius: 18, borderWidth: 1, borderColor: C.border, overflow: 'hidden' },
  forecastRow:      { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, gap: 10 },
  forecastRowBorder:{ borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  forecastDay:      { fontSize: 12, fontWeight: '700', color: C.textPri, width: 36 },
  rainRow:          { flexDirection: 'row', alignItems: 'center', gap: 3 },
  rainPct:          { fontSize: 11, fontWeight: '700' },
  forecastLow:      { fontSize: 13, fontWeight: '700', color: C.textSec, width: 30, textAlign: 'right' },
  forecastHigh:     { fontSize: 14, fontWeight: '900', color: C.textPri, width: 34, textAlign: 'right' },

  footerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 16, marginBottom: 8 },
  footer:    { fontSize: 10, color: C.textMuted, fontWeight: '600', letterSpacing: 1 },
});
