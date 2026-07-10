import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert, KeyboardAvoidingView, Platform,
  ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import { getLoggedUser, userService } from '../apiservice/api';

const C = {
  bg:'#080d10', card:'#0f1923', border:'rgba(255,255,255,0.08)',
  inputBg:'#131f2a', brand:'#10b981', danger:'#ef4444', purple:'#7c3aed',
  textPri:'#e2e8f0', textSec:'#94a3b8', textMuted:'#475569',
};

const ROLE_LABELS: Record<string, { label: string; color: string }> = {
  '11111111-1111-1111-1111-111111111111': { label: 'Super Admin', color: C.danger  },
  '22222222-2222-2222-2222-222222222222': { label: 'Admin',       color: C.purple  },
  '33333333-3333-3333-3333-333333333333': { label: 'Technician',  color: '#38bdf8' },
  '44444444-4444-4444-4444-444444444444': { label: 'Farmer',      color: C.brand   },
};

function RowItem({ icon, label, value, color = C.textSec }: {
  icon: React.ComponentProps<typeof Feather>['name'];
  label: string; value: string; color?: string;
}) {
  return (
    <View style={s.rowItem}>
      <Feather name={icon} size={16} color={C.textMuted} style={{ width: 22 }} />
      <Text style={s.rowLabel}>{label}</Text>
      <Text style={[s.rowValue, { color }]}>{value}</Text>
    </View>
  );
}

export default function ProfileScreen() {
  const router  = useRouter();
  const user    = getLoggedUser();
  const initials= (user?.fullName ?? 'U').split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2);
  const roleInfo= ROLE_LABELS[user?.roleId ?? ''] ?? { label: 'Farmer', color: C.brand };

  const [editing, setEditing] = useState(false);
  const [fullName, setFullName]= useState(user?.fullName ?? '');
  const [phone, setPhone]     = useState(user?.phone ?? '');
  const [saving, setSaving]   = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      if (user?.id) await userService.updateProfile(user.id, { fullName, phone });
      setEditing(false);
      Alert.alert('Saved', 'Profile updated successfully.');
    } catch { Alert.alert('Error', 'Could not update profile.'); }
    finally { setSaving(false); }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={s.root}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Feather name="arrow-left" size={20} color={C.brand} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={s.headerTitle}>Profile</Text>
          <Text style={s.headerSub}>YOUR ACCOUNT</Text>
        </View>
        <TouchableOpacity onPress={() => setEditing(e => !e)} style={s.editBtn}>
          <Feather name={editing ? 'x' : 'edit-2'} size={16} color={C.brand} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* Avatar + role */}
        <View style={s.avatarSection}>
          <View style={s.avatar}>
            <Text style={s.avatarTxt}>{initials}</Text>
          </View>
          <Text style={s.displayName}>{user?.fullName ?? 'FloraX User'}</Text>
          <View style={[s.roleBadge, { backgroundColor: roleInfo.color + '18', borderColor: roleInfo.color + '40' }]}>
            <Feather name="shield" size={12} color={roleInfo.color} />
            <Text style={[s.roleLabel, { color: roleInfo.color }]}>{roleInfo.label}</Text>
          </View>
        </View>

        {/* Profile details */}
        {!editing ? (
          <View style={s.card}>
            <RowItem icon="user"   label="Full Name" value={user?.fullName ?? '—'} />
            <View style={s.divider} />
            <RowItem icon="mail"   label="Email"     value={user?.email    ?? '—'} />
            <View style={s.divider} />
            <RowItem icon="phone"  label="Phone"     value={user?.phone    ?? '—'} />
            <View style={s.divider} />
            <RowItem icon="shield" label="Role"      value={roleInfo.label}  color={roleInfo.color} />
          </View>
        ) : (
          <View style={s.card}>
            <Text style={s.fieldLabel}>FULL NAME</Text>
            <View style={s.inputRow}>
              <Feather name="user" size={16} color={C.textMuted} style={s.inputIcon} />
              <TextInput style={s.input} value={fullName} onChangeText={setFullName} selectionColor={C.brand} placeholderTextColor={C.textMuted} />
            </View>
            <Text style={[s.fieldLabel, { marginTop: 16 }]}>PHONE</Text>
            <View style={s.inputRow}>
              <Feather name="phone" size={16} color={C.textMuted} style={s.inputIcon} />
              <TextInput style={s.input} value={phone} onChangeText={setPhone} keyboardType="phone-pad" selectionColor={C.brand} placeholderTextColor={C.textMuted} />
            </View>
            <TouchableOpacity onPress={handleSave} disabled={saving} style={[s.saveBtn, saving && { opacity: 0.7 }]}>
              <Feather name="save" size={16} color="#fff" />
              <Text style={s.saveBtnTxt}>{saving ? 'Saving…' : 'Save Changes'}</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Actions */}
        <View style={s.actionsCard}>
          <TouchableOpacity style={s.actionRow}>
            <Feather name="lock" size={16} color={C.textSec} />
            <Text style={s.actionLabel}>Change Password</Text>
            <Feather name="chevron-right" size={14} color={C.textMuted} />
          </TouchableOpacity>
          <View style={s.divider} />
          <TouchableOpacity onPress={() => router.push('/settings' as any)} style={s.actionRow}>
            <Feather name="settings" size={16} color={C.textSec} />
            <Text style={s.actionLabel}>App Settings</Text>
            <Feather name="chevron-right" size={14} color={C.textMuted} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
  editBtn:     { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(16,185,129,0.1)', borderWidth: 1, borderColor: 'rgba(16,185,129,0.2)', alignItems: 'center', justifyContent: 'center' },
  scroll:      { padding: 16, paddingBottom: 48 },

  avatarSection:{ alignItems: 'center', gap: 10, paddingVertical: 24 },
  avatar:       { width: 80, height: 80, borderRadius: 22, backgroundColor: 'rgba(16,185,129,0.15)', borderWidth: 2, borderColor: 'rgba(16,185,129,0.35)', alignItems: 'center', justifyContent: 'center' },
  avatarTxt:    { fontSize: 28, fontWeight: '900', color: C.brand },
  displayName:  { fontSize: 22, fontWeight: '800', color: C.textPri },
  roleBadge:    { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20, borderWidth: 1 },
  roleLabel:    { fontSize: 12, fontWeight: '800', letterSpacing: 0.5 },

  card:        { backgroundColor: C.card, borderRadius: 20, borderWidth: 1, borderColor: C.border, padding: 20, marginBottom: 16 },
  rowItem:     { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 4 },
  rowLabel:    { flex: 1, fontSize: 13, color: C.textSec, fontWeight: '600' },
  rowValue:    { fontSize: 13, fontWeight: '700' },
  divider:     { height: 1, backgroundColor: 'rgba(255,255,255,0.05)', marginVertical: 10 },
  fieldLabel:  { fontSize: 10, fontWeight: '800', color: C.textMuted, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 8 },
  inputRow:    { flexDirection: 'row', alignItems: 'center', backgroundColor: C.inputBg, borderWidth: 1, borderColor: C.border, borderRadius: 12 },
  inputIcon:   { paddingLeft: 12 },
  input:       { flex: 1, paddingHorizontal: 10, paddingVertical: 12, fontSize: 14, color: C.textPri },
  saveBtn:     { marginTop: 20, backgroundColor: C.brand, borderRadius: 12, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  saveBtnTxt:  { color: '#fff', fontSize: 14, fontWeight: '800' },

  actionsCard: { backgroundColor: C.card, borderRadius: 20, borderWidth: 1, borderColor: C.border, paddingHorizontal: 20 },
  actionRow:   { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 16 },
  actionLabel: { flex: 1, fontSize: 14, fontWeight: '700', color: C.textPri },
});
