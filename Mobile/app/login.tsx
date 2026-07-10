import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
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

const ROLES = [
  { label: 'Farmer',     email: 'farmer@florax.com',     password: 'farmer123' },
];

export default function LoginScreen() {
  const [email, setEmail]       = useState('farmer@florax.com');
  const [password, setPassword] = useState('farmer123');
  const [showPwd, setShowPwd]   = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) { setError('Please fill in all fields'); return; }
    setLoading(true); setError(null);
    try {
      const res = await authService.login(email, password);
      const user = res.data?.user;
      if (user && user.roleId !== '22222222-2222-2222-2222-222222222222') {
        authService.logout();
        setError('Access denied. Only Farmer accounts are authorized.');
        return;
      }
      router.replace('/(tabs)');
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={s.root}>
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">

        {/* Logo */}
        <View style={s.logoArea}>
          <View style={s.logoIcon}>
            <Feather name="feather" size={36} color={C.brand} />
          </View>
          <Text style={s.logoTitle}>FLORAX</Text>
          <Text style={s.logoSub}>Smart Agriculture Mobile</Text>
        </View>

        {/* Role quick-select */}
        <View style={s.roleRow}>
          {ROLES.map(r => (
            <TouchableOpacity
              key={r.label}
              onPress={() => { setEmail(r.email); setPassword(r.password); setError(null); }}
              style={[s.roleChip, email === r.email && s.roleChipActive]}
            >
              <Text style={[s.roleChipTxt, email === r.email && s.roleChipTxtActive]}>
                {r.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Form card */}
        <View style={s.formCard}>
          <Text style={s.formTitle}>Welcome Back</Text>
          <Text style={s.formSub}>Sign in to access your farm dashboard</Text>

          {error && (
            <View style={s.errorBox}>
              <Feather name="alert-circle" size={14} color="#fca5a5" />
              <Text style={s.errorText}>{error}</Text>
            </View>
          )}

          {/* Email */}
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

          {/* Password */}
          <View style={s.fieldWrap}>
            <Text style={s.fieldLabel}>PASSWORD</Text>
            <View style={s.inputRow}>
              <Feather name="lock" size={16} color={C.textMuted} style={s.inputIcon} />
              <TextInput
                style={[s.input, { flex: 1 }]}
                placeholder="••••••••"
                placeholderTextColor={C.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPwd}
                autoCapitalize="none"
                selectionColor={C.brand}
              />
              <TouchableOpacity onPress={() => setShowPwd(p => !p)} style={s.eyeBtn}>
                <Feather name={showPwd ? 'eye-off' : 'eye'} size={16} color={C.textMuted} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Forgot password */}
          <TouchableOpacity onPress={() => router.push('/forgot-password')} style={s.forgotRow}>
            <Text style={s.forgotTxt}>Forgot password?</Text>
          </TouchableOpacity>

          {/* Submit */}
          <TouchableOpacity
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.8}
            style={[s.submitBtn, loading && { opacity: 0.7 }]}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Feather name="log-in" size={16} color="#fff" />
                <Text style={s.submitText}>Sign In</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <Text style={s.footer}>Authorized Personnel Only  •  FloraX Tech</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  root:   { flex: 1, backgroundColor: C.bg },
  scroll: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 48 },

  logoArea: { alignItems: 'center', marginBottom: 28 },
  logoIcon: {
    width: 76, height: 76, borderRadius: 22,
    backgroundColor: 'rgba(16,185,129,0.12)', borderWidth: 1.5, borderColor: 'rgba(16,185,129,0.3)',
    justifyContent: 'center', alignItems: 'center', marginBottom: 14,
  },
  logoTitle:{ fontSize: 30, fontWeight: '900', color: C.textPri, letterSpacing: 5 },
  logoSub:  { fontSize: 11, fontWeight: '700', color: C.brand, letterSpacing: 1.5, textTransform: 'uppercase', marginTop: 4 },

  roleRow:        { flexDirection: 'row', gap: 8, marginBottom: 18 },
  roleChip:       { flex: 1, paddingVertical: 9, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', alignItems: 'center', backgroundColor: C.card },
  roleChipActive: { borderColor: C.brand, backgroundColor: 'rgba(16,185,129,0.12)' },
  roleChipTxt:    { fontSize: 12, fontWeight: '700', color: C.textMuted },
  roleChipTxtActive:{ color: C.brand },

  formCard: { backgroundColor: C.card, borderRadius: 24, borderWidth: 1, borderColor: C.border, padding: 24 },
  formTitle:{ fontSize: 20, fontWeight: '800', color: C.textPri, marginBottom: 4 },
  formSub:  { fontSize: 12, color: C.textSec, marginBottom: 22, lineHeight: 18 },

  errorBox: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(239,68,68,0.1)', borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)', borderRadius: 12, padding: 12, marginBottom: 16 },
  errorText:{ color: '#fca5a5', fontSize: 12, fontWeight: '600', flex: 1 },

  fieldWrap:  { marginBottom: 16 },
  fieldLabel: { fontSize: 10, fontWeight: '800', color: C.textMuted, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 8 },
  inputRow:   { flexDirection: 'row', alignItems: 'center', backgroundColor: C.inputBg, borderWidth: 1, borderColor: C.border, borderRadius: 14 },
  inputIcon:  { paddingLeft: 14 },
  input:      { flex: 1, paddingHorizontal: 12, paddingVertical: 13, fontSize: 14, color: C.textPri },
  eyeBtn:     { paddingRight: 14, paddingVertical: 13 },

  forgotRow: { alignItems: 'flex-end', marginBottom: 20, marginTop: -8 },
  forgotTxt: { fontSize: 12, fontWeight: '700', color: C.brand },

  submitBtn:  { backgroundColor: C.brand, borderRadius: 14, paddingVertical: 15, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' },
  submitText: { color: '#fff', fontSize: 15, fontWeight: '800', letterSpacing: 0.5 },

  footer: { textAlign: 'center', fontSize: 10, color: C.textMuted, fontWeight: '600', marginTop: 28, letterSpacing: 1, textTransform: 'uppercase' },
});
