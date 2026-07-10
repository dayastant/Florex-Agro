import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { authService } from '../apiservice/api';

const C = {
  bg:      '#080d10',
  card:    '#0f1923',
  border:  'rgba(255,255,255,0.08)',
  inputBg: '#131f2a',
  brand:   '#10b981',
  danger:  '#ef4444',
  textPri: '#e2e8f0',
  textSec: '#94a3b8',
  textMuted:'#475569',
};

export default function ForgotPasswordScreen() {
  const [email, setEmail]     = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent]       = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const router = useRouter();

  const handleSend = async () => {
    if (!email) { setError('Please enter your email address.'); return; }
    setLoading(true); setError(null);
    try {
      await authService.forgotPassword(email);
      setSent(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Could not send reset link. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={s.root}>
      <View style={s.inner}>

        {/* Back button */}
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Feather name="arrow-left" size={20} color={C.brand} />
          <Text style={s.backTxt}>Back to Login</Text>
        </TouchableOpacity>

        {/* Icon */}
        <View style={s.iconWrap}>
          <Feather name="key" size={32} color={C.brand} />
        </View>

        {sent ? (
          // ── Success state ──────────────────────────────────────────
          <View style={s.successCard}>
            <View style={s.successIconWrap}>
              <Feather name="check-circle" size={40} color={C.brand} />
            </View>
            <Text style={s.successTitle}>Reset Link Sent</Text>
            <Text style={s.successSub}>
              We sent a password reset link to{'\n'}
              <Text style={{ color: C.brand }}>{email}</Text>
            </Text>
            <Text style={s.successNote}>
              Check your inbox and follow the instructions. The link expires in 15 minutes.
            </Text>
            <TouchableOpacity onPress={() => router.replace('/login')} style={s.submitBtn}>
              <Feather name="log-in" size={16} color="#fff" />
              <Text style={s.submitText}>Back to Login</Text>
            </TouchableOpacity>
          </View>
        ) : (
          // ── Form ──────────────────────────────────────────────────
          <>
            <Text style={s.title}>Forgot Password</Text>
            <Text style={s.sub}>Enter your registered email and we'll send a secure reset link.</Text>

            <View style={s.formCard}>
              {error && (
                <View style={s.errorBox}>
                  <Feather name="alert-circle" size={14} color="#fca5a5" />
                  <Text style={s.errorText}>{error}</Text>
                </View>
              )}

              <View style={s.fieldWrap}>
                <Text style={s.fieldLabel}>EMAIL ADDRESS</Text>
                <View style={s.inputRow}>
                  <Feather name="mail" size={16} color={C.textMuted} style={s.inputIcon} />
                  <TextInput
                    style={s.input}
                    placeholder="your@email.com"
                    placeholderTextColor={C.textMuted}
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    selectionColor={C.brand}
                  />
                </View>
              </View>

              <TouchableOpacity
                onPress={handleSend}
                disabled={loading}
                activeOpacity={0.8}
                style={[s.submitBtn, loading && { opacity: 0.7 }]}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <>
                    <Feather name="send" size={16} color="#fff" />
                    <Text style={s.submitText}>Send Reset Link</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  root:  { flex: 1, backgroundColor: C.bg },
  inner: { flex: 1, paddingHorizontal: 24, paddingTop: 64, paddingBottom: 40 },

  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 32 },
  backTxt: { fontSize: 14, fontWeight: '700', color: C.brand },

  iconWrap: {
    width: 72, height: 72, borderRadius: 20,
    backgroundColor: 'rgba(16,185,129,0.12)', borderWidth: 1.5, borderColor: 'rgba(16,185,129,0.3)',
    alignItems: 'center', justifyContent: 'center', marginBottom: 20,
  },
  title:    { fontSize: 26, fontWeight: '900', color: C.textPri, marginBottom: 8 },
  sub:      { fontSize: 13, color: C.textSec, lineHeight: 20, marginBottom: 28 },

  formCard: { backgroundColor: C.card, borderRadius: 20, borderWidth: 1, borderColor: C.border, padding: 20 },
  errorBox: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(239,68,68,0.1)', borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)', borderRadius: 12, padding: 12, marginBottom: 16 },
  errorText:{ color: '#fca5a5', fontSize: 12, fontWeight: '600', flex: 1 },

  fieldWrap:  { marginBottom: 20 },
  fieldLabel: { fontSize: 10, fontWeight: '800', color: C.textMuted, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 8 },
  inputRow:   { flexDirection: 'row', alignItems: 'center', backgroundColor: C.inputBg, borderWidth: 1, borderColor: C.border, borderRadius: 14 },
  inputIcon:  { paddingLeft: 14 },
  input:      { flex: 1, paddingHorizontal: 12, paddingVertical: 13, fontSize: 14, color: C.textPri },

  submitBtn:  { backgroundColor: C.brand, borderRadius: 14, paddingVertical: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  submitText: { color: '#fff', fontSize: 15, fontWeight: '800', letterSpacing: 0.5 },

  // Success state
  successCard:    { backgroundColor: C.card, borderRadius: 24, borderWidth: 1, borderColor: 'rgba(16,185,129,0.25)', padding: 28, alignItems: 'center', gap: 12 },
  successIconWrap:{ width: 80, height: 80, borderRadius: 24, backgroundColor: 'rgba(16,185,129,0.12)', alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  successTitle:   { fontSize: 22, fontWeight: '900', color: C.textPri },
  successSub:     { fontSize: 14, color: C.textSec, textAlign: 'center', lineHeight: 22 },
  successNote:    { fontSize: 12, color: C.textMuted, textAlign: 'center', lineHeight: 18 },
});
