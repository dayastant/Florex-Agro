import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';

const C = {
  bg:'#080d10', card:'#0f1923', border:'rgba(255,255,255,0.07)',
  brand:'#10b981', danger:'#ef4444', textPri:'#e2e8f0', textSec:'#94a3b8', textMuted:'#475569',
};

function ToggleSetting({ icon, label, sub, value, onChange }: {
  icon: React.ComponentProps<typeof Feather>['name'];
  label: string; sub?: string;
  value: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <View style={s.settingRow}>
      <Feather name={icon} size={18} color={C.textSec} style={{ width: 26 }} />
      <View style={{ flex: 1 }}>
        <Text style={s.settingLabel}>{label}</Text>
        {sub && <Text style={s.settingSub}>{sub}</Text>}
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: 'rgba(255,255,255,0.1)', true: 'rgba(16,185,129,0.35)' }}
        thumbColor={value ? C.brand : '#334155'}
      />
    </View>
  );
}

function LinkSetting({ icon, label, sub, onPress }: {
  icon: React.ComponentProps<typeof Feather>['name'];
  label: string; sub?: string; onPress?: () => void;
}) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={s.settingRow}>
      <Feather name={icon} size={18} color={C.textSec} style={{ width: 26 }} />
      <View style={{ flex: 1 }}>
        <Text style={s.settingLabel}>{label}</Text>
        {sub && <Text style={s.settingSub}>{sub}</Text>}
      </View>
      <Feather name="chevron-right" size={14} color={C.textMuted} />
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  const router = useRouter();
  const [pushNotif, setPushNotif]     = useState(true);
  const [lowWaterAlert, setLowWater]  = useState(true);
  const [sensorAlert, setSensorAlert] = useState(true);
  const [scheduleAlert, setSchedule]  = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [haptics, setHaptics]         = useState(true);

  return (
    <View style={s.root}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Feather name="arrow-left" size={20} color={C.brand} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={s.headerTitle}>Settings</Text>
          <Text style={s.headerSub}>APP CONFIGURATION</Text>
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* Notifications */}
        <Text style={s.groupLabel}>NOTIFICATIONS</Text>
        <View style={s.card}>
          <ToggleSetting icon="bell"   label="Push Notifications" sub="Enable all push alerts"      value={pushNotif}     onChange={setPushNotif}     />
          <View style={s.divider} />
          <ToggleSetting icon="droplet" label="Low Water Alerts"  sub="Alert when tank drops below 25%" value={lowWaterAlert} onChange={setLowWater} />
          <View style={s.divider} />
          <ToggleSetting icon="cpu"    label="Sensor Alerts"      sub="Alert on sensor offline events" value={sensorAlert}  onChange={setSensorAlert}   />
          <View style={s.divider} />
          <ToggleSetting icon="clock"  label="Schedule Reminders" sub="Remind before schedule starts"  value={scheduleAlert} onChange={setSchedule}    />
        </View>

        {/* App */}
        <Text style={s.groupLabel}>APPLICATION</Text>
        <View style={s.card}>
          <ToggleSetting icon="refresh-cw" label="Auto-Refresh"  sub="Refresh data every 30 seconds" value={autoRefresh} onChange={setAutoRefresh} />
          <View style={s.divider} />
          <ToggleSetting icon="activity"   label="Haptic Feedback" sub="Vibrate on controls"          value={haptics}    onChange={setHaptics}     />
          <View style={s.divider} />
          <LinkSetting   icon="server"     label="API Endpoint"   sub="172.20.97.36:5222" />
        </View>

        {/* About */}
        <Text style={s.groupLabel}>ABOUT</Text>
        <View style={s.card}>
          <LinkSetting icon="help-circle"   label="Help & FAQ"    onPress={() => router.push('/help' as any)} />
          <View style={s.divider} />
          <LinkSetting icon="info"          label="App Version"   sub="FloraX v1.0.0 (Build 100)" />
          <View style={s.divider} />
          <LinkSetting icon="shield"        label="Privacy Policy" />
        </View>

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
  scroll:      { padding: 16, paddingBottom: 48 },

  groupLabel: { fontSize: 10, fontWeight: '800', color: C.textMuted, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 10, marginTop: 8 },
  card:       { backgroundColor: C.card, borderRadius: 18, borderWidth: 1, borderColor: C.border, paddingHorizontal: 16, marginBottom: 16 },
  settingRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14 },
  settingLabel:{ fontSize: 14, fontWeight: '700', color: C.textPri },
  settingSub:  { fontSize: 11, color: C.textMuted, marginTop: 1 },
  divider:    { height: 1, backgroundColor: 'rgba(255,255,255,0.05)' },
});
