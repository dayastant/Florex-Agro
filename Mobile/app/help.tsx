import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const C = {
  bg:'#080d10', card:'#0f1923', border:'rgba(255,255,255,0.07)',
  brand:'#10b981', textPri:'#e2e8f0', textSec:'#94a3b8', textMuted:'#475569',
};

const FAQS = [
  {
    q: 'How do I start manual irrigation?',
    a: 'Go to More → Manual Irrigation. Select your farm and zone, choose a duration, then tap Start Irrigation. You can stop it anytime.',
  },
  {
    q: 'How are zones controlled automatically?',
    a: 'Set a schedule under More → Schedules. You can configure start time, duration, and which days of the week the irrigation runs.',
  },
  {
    q: 'What does the "AUTO" valve mode do?',
    a: 'AUTO mode lets the system control the valve based on soil moisture thresholds and scheduled events. The valve opens/closes automatically.',
  },
  {
    q: 'Why is my sensor showing offline?',
    a: 'A sensor may go offline due to loss of WiFi connectivity, low battery, or hardware failure. Check signal strength in the Sensors screen.',
  },
  {
    q: 'How do I add a new irrigation zone?',
    a: 'Go to My Farms → tap a farm → Farm Details → Irrigation Zones → tap the + button. Fill in zone name, crop type, soil type, and area.',
  },
  {
    q: 'How often is sensor data updated?',
    a: 'Sensor readings are updated every few minutes. Pull down any screen to manually refresh the latest data from the server.',
  },
  {
    q: 'How do I change my login password?',
    a: 'Go to More → Profile → Change Password, or use the Forgot Password link on the login screen to receive a reset email.',
  },
  {
    q: 'Who do I contact for technical support?',
    a: 'Contact FloraX support at support@florax.com or call +94-77-FLORAX. Support is available Monday–Friday, 8 AM–6 PM.',
  },
];

function FaqItem({ item }: { item: typeof FAQS[0] }) {
  const [open, setOpen] = useState(false);
  return (
    <View style={s.faqItem}>
      <TouchableOpacity onPress={() => setOpen(o => !o)} activeOpacity={0.8} style={s.faqQ}>
        <Text style={s.faqQText}>{item.q}</Text>
        <Feather name={open ? 'chevron-up' : 'chevron-down'} size={16} color={C.brand} />
      </TouchableOpacity>
      {open && <Text style={s.faqA}>{item.a}</Text>}
    </View>
  );
}

export default function HelpScreen() {
  const router = useRouter();

  return (
    <View style={s.root}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Feather name="arrow-left" size={20} color={C.brand} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={s.headerTitle}>Help & FAQ</Text>
          <Text style={s.headerSub}>SUPPORT CENTER</Text>
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* Hero */}
        <View style={s.hero}>
          <View style={s.heroIcon}>
            <Feather name="help-circle" size={32} color={C.brand} />
          </View>
          <Text style={s.heroTitle}>How can we help?</Text>
          <Text style={s.heroSub}>Find answers to common questions about FloraX Smart Irrigation.</Text>
        </View>

        {/* FAQs */}
        <Text style={s.groupLabel}>FREQUENTLY ASKED QUESTIONS</Text>
        <View style={s.faqCard}>
          {FAQS.map((faq, i) => (
            <View key={i}>
              <FaqItem item={faq} />
              {i < FAQS.length - 1 && <View style={s.divider} />}
            </View>
          ))}
        </View>

        {/* Contact */}
        <Text style={s.groupLabel}>CONTACT SUPPORT</Text>
        <View style={s.card}>
          <View style={s.contactRow}>
            <View style={s.contactIcon}>
              <Feather name="mail" size={18} color={C.brand} />
            </View>
            <View>
              <Text style={s.contactLabel}>Email Support</Text>
              <Text style={s.contactValue}>support@florax.com</Text>
            </View>
          </View>
          <View style={s.divider} />
          <View style={s.contactRow}>
            <View style={s.contactIcon}>
              <Feather name="phone" size={18} color={C.brand} />
            </View>
            <View>
              <Text style={s.contactLabel}>Phone Support</Text>
              <Text style={s.contactValue}>+94-77-FLORAX</Text>
            </View>
          </View>
          <View style={s.divider} />
          <View style={s.contactRow}>
            <View style={s.contactIcon}>
              <Feather name="clock" size={18} color={C.brand} />
            </View>
            <View>
              <Text style={s.contactLabel}>Business Hours</Text>
              <Text style={s.contactValue}>Mon–Fri, 8 AM – 6 PM</Text>
            </View>
          </View>
        </View>

        <View style={s.footerRow}>
          <Feather name="feather" size={10} color={C.textMuted} />
          <Text style={s.footer}>FloraX Smart Agriculture  •  v1.0.0</Text>
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

  hero:      { alignItems: 'center', gap: 10, paddingVertical: 24 },
  heroIcon:  { width: 70, height: 70, borderRadius: 20, backgroundColor: 'rgba(16,185,129,0.12)', borderWidth: 1.5, borderColor: 'rgba(16,185,129,0.3)', alignItems: 'center', justifyContent: 'center' },
  heroTitle: { fontSize: 22, fontWeight: '800', color: C.textPri },
  heroSub:   { fontSize: 13, color: C.textSec, textAlign: 'center', lineHeight: 20, maxWidth: 280 },

  groupLabel: { fontSize: 10, fontWeight: '800', color: C.textMuted, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 10, marginTop: 8 },

  faqCard:    { backgroundColor: C.card, borderRadius: 18, borderWidth: 1, borderColor: C.border, overflow: 'hidden', marginBottom: 16 },
  faqItem:    { padding: 16 },
  faqQ:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 },
  faqQText:   { flex: 1, fontSize: 13, fontWeight: '700', color: C.textPri, lineHeight: 19 },
  faqA:       { fontSize: 12, color: C.textSec, lineHeight: 18, marginTop: 10 },
  divider:    { height: 1, backgroundColor: 'rgba(255,255,255,0.05)' },

  card:        { backgroundColor: C.card, borderRadius: 18, borderWidth: 1, borderColor: C.border, paddingHorizontal: 16, marginBottom: 16 },
  contactRow:  { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14 },
  contactIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(16,185,129,0.12)', borderWidth: 1, borderColor: 'rgba(16,185,129,0.2)', alignItems: 'center', justifyContent: 'center' },
  contactLabel:{ fontSize: 11, color: C.textMuted, fontWeight: '600', marginBottom: 2 },
  contactValue:{ fontSize: 14, color: C.textPri, fontWeight: '700' },

  footerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 8 },
  footer:    { fontSize: 10, color: C.textMuted, fontWeight: '600', letterSpacing: 1, textTransform: 'uppercase' },
});
