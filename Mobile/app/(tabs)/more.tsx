import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { authService, getLoggedUser } from '../../apiservice/api';

const { width: SCREEN_W } = Dimensions.get('window');
const COLS    = 3;
const GAP     = 12;
const PADDING = 16;
const TILE_W  = (SCREEN_W - PADDING * 2 - GAP * (COLS - 1)) / COLS;

const C = {
  bg:       '#080d10',
  card:     '#0f1923',
  cardDeep: '#0b1420',
  border:   'rgba(255,255,255,0.07)',
  brand:    '#10b981',
  sky:      '#38bdf8',
  amber:    '#f59e0b',
  danger:   '#ef4444',
  purple:   '#a78bfa',
  rose:     '#fb7185',
  teal:     '#2dd4bf',
  textPri:  '#e2e8f0',
  textSec:  '#94a3b8',
  textMuted:'#475569',
};

interface MenuItem {
  label: string;
  icon:  React.ComponentProps<typeof Feather>['name'];
  color: string;
  bg:    string;
  route: string;
}

const MENU: MenuItem[] = [
  { label: 'Water Tanks',  icon: 'database',    color: C.sky,    bg: 'rgba(56,189,248,0.12)',   route: '/(tabs)/water'         },
  { label: 'Sensors',      icon: 'cpu',          color: C.purple, bg: 'rgba(167,139,250,0.12)', route: '/(tabs)/sensors'        },
  { label: 'Manual',       icon: 'play-circle',  color: C.brand,  bg: 'rgba(16,185,129,0.12)',  route: '/irrigation/manual'     },
  { label: 'Schedules',    icon: 'clock',        color: C.amber,  bg: 'rgba(245,158,11,0.12)',  route: '/irrigation/schedules'  },
  { label: 'Weather',      icon: 'cloud',        color: C.teal,   bg: 'rgba(45,212,191,0.12)',  route: '/weather'               },
  { label: 'Alerts',       icon: 'bell',         color: C.rose,   bg: 'rgba(251,113,133,0.12)', route: '/notifications'         },
  { label: 'Reports',      icon: 'bar-chart-2',  color: C.brand,  bg: 'rgba(16,185,129,0.12)',  route: '/reports'               },
  { label: 'Profile',      icon: 'user',         color: C.purple, bg: 'rgba(167,139,250,0.12)', route: '/profile'               },
  { label: 'Settings',     icon: 'settings',     color: C.textSec,bg: 'rgba(148,163,184,0.1)',  route: '/settings'              },
  { label: 'Help',         icon: 'help-circle',  color: C.amber,  bg: 'rgba(245,158,11,0.1)',   route: '/help'                  },
];

function Tile({ item, onPress }: { item: MenuItem; onPress: () => void }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.72}
      style={[s.tile, { width: TILE_W }]}
    >
      <View style={[s.tileIconWrap, { backgroundColor: item.bg, borderColor: item.color + '40' }]}>
        <Feather name={item.icon} size={24} color={item.color} />
      </View>
      <Text style={s.tileLbl} numberOfLines={1}>{item.label}</Text>
    </TouchableOpacity>
  );
}

export default function MoreScreen() {
  const router = useRouter();
  const user   = getLoggedUser();
  const initials = (user?.fullName ?? 'U')
    .split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2);

  const handleLogout = () => { authService.logout(); router.replace('/login'); };

  return (
    <View style={s.root}>

      {/* ── Header ───────────────────────────────────────────────────── */}
      <View style={s.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <View style={s.logoWrap}>
            <Feather name="grid" size={18} color={C.brand} />
          </View>
          <View>
            <Text style={s.headerTitle}>More</Text>
            <Text style={s.headerSub}>QUICK ACCESS</Text>
          </View>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* ── User card ────────────────────────────────────────────── */}
        <TouchableOpacity
          onPress={() => router.push('/profile' as any)}
          activeOpacity={0.85}
          style={s.userCard}
        >
          <View style={s.avatarWrap}>
            <Text style={s.avatarTxt}>{initials}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.userName}>{user?.fullName ?? 'FloraX User'}</Text>
            <Text style={s.userEmail} numberOfLines={1}>{user?.email ?? 'Tap to edit profile'}</Text>
          </View>
          <View style={s.profileChevron}>
            <Feather name="chevron-right" size={16} color={C.brand} />
          </View>
        </TouchableOpacity>

        {/* ── Section label ─────────────────────────────────────────── */}
        <View style={s.secRow}>
          <View style={s.secBar} />
          <Text style={s.secLabel}>FEATURES</Text>
        </View>

        {/* ── Icon grid (3 columns, perfectly centered) ─────────────── */}
        <View style={s.grid}>
          {MENU.map(item => (
            <Tile
              key={item.label}
              item={item}
              onPress={() => router.push(item.route as any)}
            />
          ))}
        </View>

        {/* ── Sign out ──────────────────────────────────────────────── */}
        <TouchableOpacity
          onPress={handleLogout}
          activeOpacity={0.8}
          style={s.logoutBtn}
        >
          <View style={s.logoutIconWrap}>
            <Feather name="log-out" size={18} color={C.danger} />
          </View>
          <Text style={s.logoutTxt}>Sign Out</Text>
          <Feather name="chevron-right" size={16} color={C.danger} style={{ marginLeft: 'auto' }} />
        </TouchableOpacity>

        {/* ── Footer ───────────────────────────────────────────────── */}
        <View style={s.footerRow}>
          <Feather name="feather" size={10} color={C.textMuted} />
          <Text style={s.footer}>FloraX v1.0.0  •  Smart Agriculture</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root:  { flex: 1, backgroundColor: C.bg },

  header: {
    paddingTop: 56, paddingBottom: 16, paddingHorizontal: 20,
    backgroundColor: '#0a1520',
    borderBottomWidth: 1, borderBottomColor: 'rgba(16,185,129,0.18)',
  },
  logoWrap:    { width: 38, height: 38, borderRadius: 12, backgroundColor: 'rgba(16,185,129,0.12)', borderWidth: 1, borderColor: 'rgba(16,185,129,0.25)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 22, fontWeight: '900', color: C.textPri, letterSpacing: -0.5 },
  headerSub:   { fontSize: 9, fontWeight: '700', color: C.brand, letterSpacing: 1.5, marginTop: 1 },

  scroll: { paddingHorizontal: PADDING, paddingTop: 20, paddingBottom: 48 },

  // User card
  userCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: C.card,
    borderRadius: 20, borderWidth: 1, borderColor: 'rgba(16,185,129,0.22)',
    padding: 16, marginBottom: 24,
  },
  avatarWrap:    { width: 52, height: 52, borderRadius: 15, backgroundColor: 'rgba(16,185,129,0.14)', borderWidth: 1.5, borderColor: 'rgba(16,185,129,0.35)', alignItems: 'center', justifyContent: 'center' },
  avatarTxt:     { fontSize: 20, fontWeight: '900', color: C.brand },
  userName:      { fontSize: 16, fontWeight: '800', color: C.textPri },
  userEmail:     { fontSize: 11, color: C.textSec, marginTop: 2 },
  profileChevron:{ width: 30, height: 30, borderRadius: 9, backgroundColor: 'rgba(16,185,129,0.1)', borderWidth: 1, borderColor: 'rgba(16,185,129,0.2)', alignItems: 'center', justifyContent: 'center' },

  // Section label
  secRow:  { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  secBar:  { width: 4, height: 16, backgroundColor: C.brand, borderRadius: 4 },
  secLabel:{ fontSize: 11, fontWeight: '800', color: C.textSec, letterSpacing: 1.5, textTransform: 'uppercase' },

  // Grid
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GAP,
    marginBottom: 24,
    // Center incomplete last row
    justifyContent: 'flex-start',
  },

  // Each tile — icon on top, label below, perfectly centered
  tile: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: C.border,
    paddingVertical: 18,
    paddingHorizontal: 6,
    gap: 10,
  },
  tileIconWrap: {
    width: 52, height: 52, borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
  },
  tileLbl: {
    fontSize: 11, fontWeight: '700',
    color: C.textSec, textAlign: 'center',
    letterSpacing: 0.2,
  },

  // Logout
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: 'rgba(239,68,68,0.07)',
    borderWidth: 1, borderColor: 'rgba(239,68,68,0.22)',
    borderRadius: 16, padding: 16, marginBottom: 24,
  },
  logoutIconWrap: { width: 36, height: 36, borderRadius: 11, backgroundColor: 'rgba(239,68,68,0.12)', alignItems: 'center', justifyContent: 'center' },
  logoutTxt:      { fontSize: 14, fontWeight: '800', color: C.danger },

  footerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  footer:    { fontSize: 10, color: C.textMuted, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' },
});
