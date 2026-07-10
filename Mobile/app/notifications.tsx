import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const C = {
  bg:'#080d10', card:'#0f1923', border:'rgba(255,255,255,0.07)',
  brand:'#10b981', amber:'#f59e0b', danger:'#ef4444', purple:'#7c3aed', sky:'#38bdf8',
  textPri:'#e2e8f0', textSec:'#94a3b8', textMuted:'#475569',
};

type NotifType = 'info' | 'warning' | 'error' | 'success';
const MOCK_NOTIFS = [
  { id:'1', type:'warning' as NotifType, title:'Low Water Alert',         body:'Tank Alpha is below 25%. Refill required.', time:'2 min ago',  read:false },
  { id:'2', type:'success' as NotifType, title:'Irrigation Complete',     body:'North Field A — 30 min session finished.', time:'1 hr ago',   read:false },
  { id:'3', type:'error'   as NotifType, title:'Sensor Offline',          body:'Sensor SN-004 went offline.',             time:'3 hrs ago',  read:false },
  { id:'4', type:'info'    as NotifType, title:'Schedule Triggered',      body:'Auto-schedule started for East Block.',   time:'6 hrs ago',  read:true  },
  { id:'5', type:'success' as NotifType, title:'Zone Created',            body:'Greenhouse 2 zone added successfully.',   time:'Yesterday',  read:true  },
  { id:'6', type:'warning' as NotifType, title:'High Soil Moisture',      body:'South Field B moisture at 92%.',          time:'Yesterday',  read:true  },
];

const TYPE_META: Record<NotifType, { icon: React.ComponentProps<typeof Feather>['name']; color: string; bg: string }> = {
  warning:{ icon:'alert-triangle',  color: C.amber,  bg:'rgba(245,158,11,0.1)'  },
  error:  { icon:'x-circle',        color: C.danger, bg:'rgba(239,68,68,0.1)'   },
  success:{ icon:'check-circle',    color: C.brand,  bg:'rgba(16,185,129,0.1)'  },
  info:   { icon:'info',            color: C.sky,    bg:'rgba(56,189,248,0.1)'  },
};

function NotifCard({ notif, onRead }: { notif: any; onRead: (id: string) => void }) {
  const meta = TYPE_META[notif.type as NotifType];
  return (
    <TouchableOpacity onPress={() => onRead(notif.id)} activeOpacity={0.8} style={[s.notifCard, !notif.read && s.notifUnread]}>
      <View style={[s.notifIconWrap, { backgroundColor: meta.bg }]}>
        <Feather name={meta.icon} size={18} color={meta.color} />
      </View>
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={s.notifTitle}>{notif.title}</Text>
          {!notif.read && <View style={s.unreadDot} />}
        </View>
        <Text style={s.notifBody} numberOfLines={2}>{notif.body}</Text>
        <Text style={s.notifTime}>{notif.time}</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function NotificationsScreen() {
  const router = useRouter();
  const [notifs, setNotifs]       = useState(MOCK_NOTIFS);
  const [refreshing, setRefreshing]= useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 450, useNativeDriver: true }).start();
  }, []);

  const onRefresh   = () => { setRefreshing(true); setTimeout(() => setRefreshing(false), 600); };
  const markRead    = (id: string) => setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  const markAllRead = () => setNotifs(prev => prev.map(n => ({ ...n, read: true })));

  const unreadCount = notifs.filter(n => !n.read).length;

  return (
    <View style={s.root}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Feather name="arrow-left" size={20} color={C.brand} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={s.headerTitle}>Notifications</Text>
          <Text style={s.headerSub}>{unreadCount} UNREAD</Text>
        </View>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={markAllRead} style={s.markBtn}>
            <Feather name="check-square" size={16} color={C.brand} />
            <Text style={s.markBtnTxt}>All read</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        style={{ flex: 1 }} contentContainerStyle={s.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.brand} colors={[C.brand]} />}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fadeAnim, gap: 10 }}>
          {notifs.map(n => <NotifCard key={n.id} notif={n} onRead={markRead} />)}
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
  markBtn:     { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 6, backgroundColor: 'rgba(16,185,129,0.1)', borderRadius: 10, borderWidth: 1, borderColor: 'rgba(16,185,129,0.2)' },
  markBtnTxt:  { fontSize: 11, fontWeight: '700', color: C.brand },
  scroll:      { padding: 16, paddingBottom: 40 },

  notifCard:   { flexDirection: 'row', alignItems: 'flex-start', gap: 12, backgroundColor: C.card, borderRadius: 16, borderWidth: 1, borderColor: C.border, padding: 14 },
  notifUnread: { borderColor: 'rgba(16,185,129,0.25)', backgroundColor: '#101d26' },
  notifIconWrap:{ width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  notifTitle:  { fontSize: 13, fontWeight: '800', color: C.textPri, flex: 1 },
  notifBody:   { fontSize: 12, color: C.textSec, lineHeight: 17, marginTop: 3 },
  notifTime:   { fontSize: 10, color: C.textMuted, fontWeight: '600', marginTop: 5 },
  unreadDot:   { width: 8, height: 8, borderRadius: 4, backgroundColor: C.brand },
});
