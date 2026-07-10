import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator, Alert, KeyboardAvoidingView, Platform,
  ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import { farmService } from '../../../../../apiservice/api';

const C = {
  bg:'#080d10', card:'#0f1923', border:'rgba(255,255,255,0.08)',
  inputBg:'#131f2a', brand:'#10b981', danger:'#ef4444',
  textPri:'#e2e8f0', textSec:'#94a3b8', textMuted:'#475569',
};

const SOIL_TYPES = ['Clay', 'Sandy', 'Loamy', 'Silty', 'Peaty', 'Chalky'];

export default function EditZoneScreen() {
  const { id, zoneId } = useLocalSearchParams<{ id: string; zoneId: string }>();
  const router = useRouter();

  const [zoneName, setZoneName] = useState('');
  const [cropType, setCropType] = useState('');
  const [soilType, setSoilType] = useState('');
  const [area, setArea]         = useState('');
  const [loadingData, setLoadingData] = useState(true);
  const [saving, setSaving]     = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError]       = useState<string | null>(null);

  useEffect(() => {
    const fetch = async () => {
      if (!zoneId) return;
      try {
        const res  = await farmService.getZone(zoneId);
        const zone = res.data ?? res;
        setZoneName(zone.zoneName ?? '');
        setCropType(zone.cropType ?? '');
        setSoilType(zone.soilType ?? '');
        setArea(zone.area != null ? String(zone.area) : '');
      } catch { setError('Could not load zone data.'); }
      finally { setLoadingData(false); }
    };
    fetch();
  }, [zoneId]);

  const handleSave = async () => {
    if (!zoneName.trim()) { setError('Zone name is required.'); return; }
    setSaving(true); setError(null);
    try {
      await farmService.updateZone(zoneId!, {
        zoneName: zoneName.trim(),
        cropType: cropType.trim() || undefined,
        soilType: soilType || undefined,
        area: area ? parseFloat(area) : undefined,
      });
      Alert.alert('Saved', 'Zone updated successfully.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update zone.');
    } finally { setSaving(false); }
  };

  const handleDelete = () => {
    Alert.alert('Delete Zone', `Delete "${zoneName}"? This cannot be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          setDeleting(true);
          try {
            await farmService.deleteZone(zoneId!);
            router.back();
          } catch {
            setDeleting(false);
            Alert.alert('Error', 'Could not delete zone.');
          }
        },
      },
    ]);
  };

  if (loadingData) {
    return (
      <View style={[s.root, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={C.brand} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={s.root}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Feather name="arrow-left" size={20} color={C.brand} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={s.headerTitle}>Edit Zone</Text>
          <Text style={s.headerSub}>MODIFY ZONE SETTINGS</Text>
        </View>
        <TouchableOpacity onPress={handleDelete} disabled={deleting} style={s.deleteBtn}>
          {deleting
            ? <ActivityIndicator size="small" color={C.danger} />
            : <Feather name="trash-2" size={18} color={C.danger} />}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
        {error && (
          <View style={s.errorBox}>
            <Feather name="alert-circle" size={14} color="#fca5a5" />
            <Text style={s.errorText}>{error}</Text>
          </View>
        )}

        <View style={s.card}>
          {/* Zone Name */}
          <View style={s.field}>
            <Text style={s.label}>ZONE NAME <Text style={{ color: C.danger }}>*</Text></Text>
            <View style={s.inputRow}>
              <Feather name="grid" size={16} color={C.textMuted} style={s.inputIcon} />
              <TextInput
                style={s.input}
                placeholder="Zone name"
                placeholderTextColor={C.textMuted}
                value={zoneName}
                onChangeText={setZoneName}
                selectionColor={C.brand}
              />
            </View>
          </View>

          {/* Crop Type */}
          <View style={s.field}>
            <Text style={s.label}>CROP TYPE</Text>
            <View style={s.inputRow}>
              <Feather name="sun" size={16} color={C.textMuted} style={s.inputIcon} />
              <TextInput
                style={s.input}
                placeholder="e.g. Wheat, Rice"
                placeholderTextColor={C.textMuted}
                value={cropType}
                onChangeText={setCropType}
                selectionColor={C.brand}
              />
            </View>
          </View>

          {/* Soil Type */}
          <View style={s.field}>
            <Text style={s.label}>SOIL TYPE</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {SOIL_TYPES.map(type => (
                  <TouchableOpacity
                    key={type}
                    onPress={() => setSoilType(type === soilType ? '' : type)}
                    style={[s.soilChip, soilType === type && s.soilChipActive]}
                  >
                    <Text style={[s.soilChipTxt, soilType === type && s.soilChipTxtActive]}>{type}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Area */}
          <View style={s.field}>
            <Text style={s.label}>AREA (HECTARES)</Text>
            <View style={s.inputRow}>
              <Feather name="maximize-2" size={16} color={C.textMuted} style={s.inputIcon} />
              <TextInput
                style={s.input}
                placeholder="e.g. 2.5"
                placeholderTextColor={C.textMuted}
                value={area}
                onChangeText={setArea}
                keyboardType="decimal-pad"
                selectionColor={C.brand}
              />
              <Text style={s.inputSuffix}>ha</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          onPress={handleSave}
          disabled={saving}
          activeOpacity={0.8}
          style={[s.submitBtn, saving && { opacity: 0.7 }]}
        >
          {saving ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              <Feather name="save" size={16} color="#fff" />
              <Text style={s.submitTxt}>Save Changes</Text>
            </>
          )}
        </TouchableOpacity>
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
  deleteBtn:   { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(239,68,68,0.1)', borderWidth: 1, borderColor: 'rgba(239,68,68,0.25)', alignItems: 'center', justifyContent: 'center' },

  scroll:   { padding: 16, paddingBottom: 40 },
  errorBox: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(239,68,68,0.1)', borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)', borderRadius: 12, padding: 12, marginBottom: 16 },
  errorText:{ color: '#fca5a5', fontSize: 12, fontWeight: '600', flex: 1 },

  card:  { backgroundColor: C.card, borderRadius: 20, borderWidth: 1, borderColor: C.border, padding: 20, marginBottom: 16 },
  field: { marginBottom: 20 },
  label: { fontSize: 10, fontWeight: '800', color: C.textMuted, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 8 },
  inputRow:    { flexDirection: 'row', alignItems: 'center', backgroundColor: C.inputBg, borderWidth: 1, borderColor: C.border, borderRadius: 14 },
  inputIcon:   { paddingLeft: 14 },
  input:       { flex: 1, paddingHorizontal: 12, paddingVertical: 13, fontSize: 14, color: C.textPri },
  inputSuffix: { paddingRight: 14, fontSize: 12, fontWeight: '700', color: C.textMuted },

  soilChip:         { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', backgroundColor: 'rgba(255,255,255,0.04)' },
  soilChipActive:   { borderColor: C.brand, backgroundColor: 'rgba(16,185,129,0.12)' },
  soilChipTxt:      { fontSize: 12, fontWeight: '700', color: C.textSec },
  soilChipTxtActive:{ color: C.brand },

  submitBtn: { backgroundColor: C.brand, borderRadius: 14, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  submitTxt: { color: '#fff', fontSize: 15, fontWeight: '800' },
});
