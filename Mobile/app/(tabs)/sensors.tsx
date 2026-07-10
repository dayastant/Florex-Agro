import { Feather } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { hardwareService, userService } from '../../apiservice/api';

const C = {
  bg:       '#080d10',
  card:     '#0f1923',
  surface:  '#131f2a',
  border:   'rgba(255,255,255,0.07)',
  brand:    '#10b981',
  sky:      '#38bdf8',
  amber:    '#f59e0b',
  danger:   '#ef4444',
  purple:   '#a78bfa',
  textPri:  '#e2e8f0',
  textSec:  '#94a3b8',
  textMuted:'#475569',
};

// ─── Small animated bar ────────────────────────────────────────────────────
function MiniBar({ pct, color }: { pct: number; color: string }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.spring(anim, { toValue: pct, useNativeDriver: false, damping: 16, stiffness: 80 }).start();
  }, [pct]);
  const width = anim.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] });
  return (
    <View style={s.miniTrack}>
      <Animated.View style={[s.miniFill, { width, backgroundColor: color }]} />
    </View>
  );
}

// ─── Sensor card ──────────────────────────────────────────────────────────
function SensorCard({ sensor }: { sensor: any }) {
  const battery   = sensor.batteryPercentage ?? 100;
  const signal    = sensor.signalStrength    ?? 85;
  const isOffline = sensor.status === 'Offline';
  const isLowBat  = battery < 30;

  const batColor = isLowBat    ? C.danger : battery > 60 ? C.brand : C.amber;
  const sigColor = signal > 70 ? C.brand  : signal > 40  ? C.amber : C.danger;
  const stColor  = isOffline   ? C.danger : C.brand;

  const pulse = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (!isOffline) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, { toValue: 1.35, duration: 800, useNativeDriver: true }),
          Animated.timing(pulse, { toValue: 1,    duration: 800, useNativeDriver: true }),
        ])
      ).start();
    }
  }, [isOffline]);

  return (
    <View style={[s.sensorCard, { borderLeftColor: stColor }]}>
      <View style={s.sensorTop}>
        <View style={{ flex: 1 }}>
          <Text style={s.sensorSerial}>{sensor.deviceSerial}</Text>
          <Text style={s.sensorMeta}>{sensor.sensorType}  •  v{sensor.firmwareVersion ?? '1.0.4'}</Text>
        </View>
        <View style={[s.onlineBadge, {
          backgroundColor: isOffline ? 'rgba(239,68,68,0.12)' : 'rgba(16,185,129,0.12)',
          borderColor:     isOffline ? C.danger : C.brand,
        }]}>
          <Animated.View style={[s.onlineDot, { backgroundColor: stColor, transform: [{ scale: isOffline ? 1 : pulse }] }]} />
          <Text style={[s.onlineText, { color: stColor }]}>{isOffline ? 'OFFLINE' : 'ONLINE'}</Text>
        </View>
      </View>

      {/* Battery row */}
      <View style={s.metaRow}>
        <Feather name="battery" size={12} color={batColor} style={s.metaIcon} />
        <MiniBar pct={battery} color={batColor} />
        <Text style={[s.metaVal, { color: batColor }]}>{battery}%</Text>
      </View>

      {/* Signal row */}
      <View style={s.metaRow}>
        <Feather name="wifi" size={12} color={sigColor} style={s.metaIcon} />
        <MiniBar pct={signal} color={sigColor} />
        <Text style={[s.metaVal, { color: sigColor }]}>{signal}%</Text>
      </View>
    </View>
  );
}

// ─── Team member row ──────────────────────────────────────────────────────
function TeamRow({ member, isLast }: { member: any; isLast: boolean }) {
  const isTech    = member.roleId === '88888888-8888-8888-8888-888888888888' || member.roleId === 'technician';
  const roleColor = isTech ? C.purple : C.sky;
  const initials  = (member.fullName ?? '?').split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2);
  const isActive  = member.status === 'Active';

  return (
    <>
      <View style={s.teamRow}>
        <View style={[s.avatar, { backgroundColor: roleColor + '1a', borderColor: roleColor + '40' }]}>
          <Text style={[s.avatarTxt, { color: roleColor }]}>{initials}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.memberName}>{member.fullName}</Text>
          <Text style={s.memberEmail}>{member.email}</Text>
        </View>
        <View style={s.memberRight}>
          <View style={[s.rolePill, { backgroundColor: roleColor + '18', borderColor: roleColor + '40' }]}>
            <Text style={[s.rolePillTxt, { color: roleColor }]}>{isTech ? 'TECH' : 'FARMER'}</Text>
          </View>
          <Text style={[s.memberStatus, { color: isActive ? C.brand : C.textMuted }]}>
            {member.status ?? '—'}
          </Text>
        </View>
      </View>
      {!isLast && <View style={s.teamDivider} />}
    </>
  );
}

// ─── Spinning scan icon ───────────────────────────────────────────────────
function ScanSpinner() {
  const rot = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(Animated.timing(rot, { toValue: 1, duration: 700, useNativeDriver: true })).start();
  }, []);
  const rotate = rot.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  return (
    <Animated.View style={{ transform: [{ rotate }] }}>
      <Feather name="settings" size={16} color="#fff" />
    </Animated.View>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────
export default function SensorsScreen() {
  const [sensors, setSensors]       = useState<any[]>([]);
  const [team, setTeam]             = useState<any[]>([]);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [scanning, setScanning]     = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [error, setError]           = useState<string | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const loadData = async () => {
    try {
      setError(null);
      const [sensorsRes, teamRes] = await Promise.all([
        hardwareService.getSensors(),
        userService.getUsers(),
      ]);
      setSensors(sensorsRes.data || []);
      setTeam(teamRes.data || []);
    } catch {
      setError('Connection failed. Pull down to retry.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { loadData(); }, []);
  useEffect(() => {
    if (!loading) Animated.timing(fadeAnim, { toValue: 1, duration: 450, useNativeDriver: true }).start();
  }, [loading]);

  const onRefresh = () => { setRefreshing(true); loadData(); };

  const handleSweep = () => {
    setScanning(true);
    setScanResult(null);
    setTimeout(() => {
      setScanning(false);
      const on = sensors.filter(x => x.status === 'Online').length;
      setScanResult(`Swept ${sensors.length} nodes — ${on} Online, ${sensors.length - on} Offline.`);
    }, 1800);
  };

  const onlineCount  = sensors.filter(x => x.status === 'Online').length;
  const offlineCount = sensors.length - onlineCount;

  if (loading) {
    return (
      <View style={[s.root, { justifyContent: 'center', alignItems: 'center', gap: 16 }]}>
        <Feather name="radio" size={40} color={C.brand} />
        <Text style={s.loadText}>Syncing IoT Core…</Text>
      </View>
    );
  }

  return (
    <View style={s.root}>
      {/* ── Header ───────────────────────────────────────────────────── */}
      <View style={s.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <View style={s.logoWrap}>
            <Feather name="radio" size={18} color={C.brand} />
          </View>
          <View>
            <Text style={s.headerLogo}>FloraX</Text>
            <Text style={s.headerSub}>NETWORK & SENSORS</Text>
          </View>
        </View>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <View style={[s.miniPill, { borderColor: 'rgba(16,185,129,0.4)', backgroundColor: 'rgba(16,185,129,0.1)' }]}>
            <Text style={[s.miniPillNum, { color: C.brand }]}>{onlineCount}</Text>
            <Text style={s.miniPillLbl}>ON</Text>
          </View>
          <View style={[s.miniPill, { borderColor: 'rgba(239,68,68,0.4)', backgroundColor: 'rgba(239,68,68,0.1)' }]}>
            <Text style={[s.miniPillNum, { color: C.danger }]}>{offlineCount}</Text>
            <Text style={s.miniPillLbl}>OFF</Text>
          </View>
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
          {[
            { num: sensors.length, lbl: 'Sensors', clr: C.brand },
            { num: onlineCount,    lbl: 'Online',  clr: C.brand },
            { num: team.length,    lbl: 'Team',    clr: C.sky },
            { num: offlineCount,   lbl: 'Offline', clr: offlineCount > 0 ? C.danger : C.brand },
          ].map((item, i, arr) => (
            <React.Fragment key={item.lbl}>
              <View style={s.stripItem}>
                <Text style={[s.stripNum, { color: item.clr }]}>{item.num}</Text>
                <Text style={s.stripLbl}>{item.lbl}</Text>
              </View>
              {i < arr.length - 1 && <View style={s.stripDiv} />}
            </React.Fragment>
          ))}
        </View>

        <Animated.View style={{ opacity: fadeAnim }}>

          {/* Node Calibration */}
          <View style={s.sectionHead}>
            <View style={s.sectionBar} />
            <Feather name="search" size={14} color={C.brand} />
            <Text style={s.sectionTitle}>NODE CALIBRATION</Text>
          </View>

          <View style={s.card}>
            <Text style={s.cardTitle}>Hardware Diagnostics Scan</Text>
            <Text style={s.cardDesc}>Run instant sweep on WiFi signals and sensor registers.</Text>
            <TouchableOpacity
              onPress={handleSweep}
              disabled={scanning}
              activeOpacity={0.75}
              style={[s.sweepBtn, scanning && { opacity: 0.75 }]}
            >
              {scanning ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <ScanSpinner />
                  <Text style={s.sweepBtnTxt}>Scanning nodes…</Text>
                </View>
              ) : (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Feather name="search" size={14} color="#fff" />
                  <Text style={s.sweepBtnTxt}>Run Diagnostics Sweep</Text>
                </View>
              )}
            </TouchableOpacity>
            {scanResult && (
              <View style={s.scanResult}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Feather name="check-circle" size={14} color={C.brand} />
                  <Text style={s.scanResultTxt}>{scanResult}</Text>
                </View>
              </View>
            )}
          </View>

          {/* Deployed Sensors */}
          <View style={[s.sectionHead, { marginTop: 8 }]}>
            <View style={s.sectionBar} />
            <Feather name="cpu" size={14} color={C.brand} />
            <Text style={s.sectionTitle}>DEPLOYED SENSORS</Text>
          </View>

          {sensors.length > 0 ? (
            <View style={{ gap: 12, marginBottom: 16 }}>
              {sensors.map(sensor => <SensorCard key={sensor.id} sensor={sensor} />)}
            </View>
          ) : (
            <View style={s.emptyCard}>
              <Feather name="cpu" size={36} color={C.textMuted} />
              <Text style={s.emptyText}>No deployed sensors found.</Text>
            </View>
          )}

          {/* Field Directory */}
          <View style={[s.sectionHead, { marginTop: 8 }]}>
            <View style={s.sectionBar} />
            <Feather name="users" size={14} color={C.brand} />
            <Text style={s.sectionTitle}>FIELD DIRECTORY</Text>
          </View>

          {team.length > 0 ? (
            <View style={[s.card, { padding: 0, overflow: 'hidden' }]}>
              {team.map((member, idx) => (
                <View key={member.id} style={{ paddingHorizontal: 16, paddingVertical: 14 }}>
                  <TeamRow member={member} isLast={idx === team.length - 1} />
                </View>
              ))}
            </View>
          ) : (
            <View style={s.emptyCard}>
              <Feather name="user" size={36} color={C.textMuted} />
              <Text style={s.emptyText}>No team members registered.</Text>
            </View>
          )}

        </Animated.View>

        {/* Footer */}
        <View style={s.footerRow}>
          <Feather name="radio" size={10} color={C.textMuted} />
          <Text style={s.footer}>FloraX Smart Agriculture  •  IoT Network</Text>
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
  logoWrap:   { width: 38, height: 38, borderRadius: 12, backgroundColor: 'rgba(16,185,129,0.12)', borderWidth: 1, borderColor: 'rgba(16,185,129,0.25)', alignItems: 'center', justifyContent: 'center' },
  headerLogo: { fontSize: 22, fontWeight: '900', color: C.textPri, letterSpacing: -0.5 },
  headerSub:  { fontSize: 9,  fontWeight: '700', color: C.brand, letterSpacing: 1.5, marginTop: 1 },
  miniPill:   { borderRadius: 12, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 6, alignItems: 'center', minWidth: 44 },
  miniPillNum:{ fontSize: 16, fontWeight: '900' },
  miniPillLbl:{ fontSize: 8,  fontWeight: '700', color: C.textMuted, letterSpacing: 1 },

  scroll:      { padding: 16, paddingBottom: 40 },
  errorBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(239,68,68,0.1)', borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)', borderRadius: 12, padding: 12, marginBottom: 16 },
  errorText:   { color: '#fca5a5', fontSize: 12, fontWeight: '600', flex: 1 },

  strip:    { flexDirection: 'row', backgroundColor: C.card, borderRadius: 16, borderWidth: 1, borderColor: C.border, padding: 14, marginBottom: 20 },
  stripItem:{ flex: 1, alignItems: 'center' },
  stripNum: { fontSize: 22, fontWeight: '900' },
  stripLbl: { fontSize: 9, fontWeight: '700', color: C.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginTop: 2 },
  stripDiv: { width: 1, backgroundColor: 'rgba(255,255,255,0.07)', marginHorizontal: 4 },

  sectionHead:  { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  sectionBar:   { width: 3, height: 18, borderRadius: 2, backgroundColor: C.brand },
  sectionTitle: { fontSize: 11, fontWeight: '800', color: C.textSec, letterSpacing: 1.5, textTransform: 'uppercase' },

  card:      { backgroundColor: C.card, borderRadius: 18, borderWidth: 1, borderColor: C.border, padding: 18, marginBottom: 16 },
  cardTitle: { fontSize: 15, fontWeight: '800', color: C.textPri, marginBottom: 4 },
  cardDesc:  { fontSize: 12, color: C.textSec, marginBottom: 16, lineHeight: 18 },

  sweepBtn:    { backgroundColor: C.brand, borderRadius: 14, paddingVertical: 14, alignItems: 'center', justifyContent: 'center' },
  sweepBtnTxt: { color: '#fff', fontSize: 13, fontWeight: '800', letterSpacing: 0.5 },
  scanResult:  { marginTop: 14, backgroundColor: 'rgba(16,185,129,0.1)', borderWidth: 1, borderColor: 'rgba(16,185,129,0.25)', borderRadius: 12, padding: 12 },
  scanResultTxt:{ color: C.brand, fontSize: 12, fontWeight: '600', lineHeight: 18, flex: 1 },

  sensorCard:   { backgroundColor: C.card, borderRadius: 16, borderWidth: 1, borderColor: C.border, borderLeftWidth: 3, padding: 16 },
  sensorTop:    { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  sensorSerial: { fontSize: 14, fontWeight: '800', color: C.textPri },
  sensorMeta:   { fontSize: 10, color: C.textSec, marginTop: 2 },
  onlineBadge:  { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, borderWidth: 1 },
  onlineDot:    { width: 6, height: 6, borderRadius: 3 },
  onlineText:   { fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },
  metaRow:      { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
  metaIcon:     { width: 18 },
  miniTrack:    { flex: 1, height: 4, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' },
  miniFill:     { height: '100%', borderRadius: 2 },
  metaVal:      { fontSize: 11, fontWeight: '700', width: 36, textAlign: 'right' },

  teamRow:     { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar:      { width: 40, height: 40, borderRadius: 12, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
  avatarTxt:   { fontSize: 14, fontWeight: '800' },
  memberName:  { fontSize: 13, fontWeight: '700', color: C.textPri },
  memberEmail: { fontSize: 10, color: C.textSec, marginTop: 1 },
  memberRight: { alignItems: 'flex-end', gap: 4 },
  rolePill:    { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, borderWidth: 1 },
  rolePillTxt: { fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },
  memberStatus:{ fontSize: 9, fontWeight: '700', letterSpacing: 0.5 },
  teamDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.05)' },

  emptyCard: { backgroundColor: C.card, borderRadius: 18, padding: 36, alignItems: 'center', gap: 12, borderWidth: 1, borderColor: C.border, marginBottom: 16 },
  emptyText: { color: C.textSec, fontSize: 13, fontWeight: '600' },
  footerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 8, marginBottom: 16 },
  footer:    { fontSize: 10, color: C.textMuted, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' },
});
