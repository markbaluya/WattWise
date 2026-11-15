import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useTheme } from '@/hooks/use-theme';
import { useRouter } from 'expo-router';
import { useApp } from '@/contexts/AppContext';

export default function ElectricityRate() {
  const colors = useTheme();
  const router = useRouter();
  const { settings, updateSettings } = useApp();
  const [rate, setRate] = useState(String(settings.electricityRate));
  const [budget, setBudget] = useState(String(settings.monthlyBudget));

  const handleSave = () => {
    const r = parseFloat(rate);
    const b = parseFloat(budget);
    if (isNaN(r) || r <= 0) {
      Alert.alert('Validation', 'Please enter a valid electricity rate.');
      return;
    }
    updateSettings({ electricityRate: r, monthlyBudget: isNaN(b) ? settings.monthlyBudget : b });
    Alert.alert('Success', 'Electricity rate updated.', [
      { text: 'OK', onPress: () => router.back() },
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={[styles.back, { color: colors.text }]}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={[styles.header, { color: colors.text }]}>Electricity Rate</Text>

        <View style={[styles.rateCard, { backgroundColor: colors.backgroundElement }]}>
          <Text style={[styles.rateLabel, { color: colors.textSecondary }]}>Current Rate</Text>
          <Text style={[styles.rateValue, { color: colors.cyan }]}>₱{settings.electricityRate.toFixed(2)}</Text>
          <Text style={[styles.rateUnit, { color: colors.textSecondary }]}>per kWh</Text>
        </View>

        <Text style={[styles.label, { color: colors.textSecondary }]}>New Rate (₱/kWh)</Text>
        <View style={[styles.field, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}>
          <TextInput value={rate} onChangeText={setRate} keyboardType="numeric" style={[styles.input, { color: colors.text }]} />
        </View>

        <Text style={[styles.label, { color: colors.textSecondary }]}>Monthly Budget (₱)</Text>
        <View style={[styles.field, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}>
          <TextInput value={budget} onChangeText={setBudget} keyboardType="numeric" style={[styles.input, { color: colors.text }]} />
        </View>

        <View style={[styles.infoCard, { backgroundColor: colors.backgroundElement }]}>
          <Text style={[styles.infoTitle, { color: colors.text }]}>Note:</Text>
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>Electricity rates depend on your provider and billing period. Check your latest bill for the exact rate.</Text>
        </View>

        <TouchableOpacity style={[styles.btn, { backgroundColor: colors.green }]} onPress={handleSave}>
          <Text style={styles.btnText}>Save Rate</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.cancelBtn, { borderColor: colors.border }]} onPress={() => router.back()}>
          <Text style={[styles.cancelText, { color: colors.text }]}>Cancel</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 24, paddingTop: 60, paddingBottom: 100 },
  back: { fontSize: 18, marginBottom: 16 },
  header: { fontSize: 24, fontWeight: '700', marginBottom: 24 },
  rateCard: { borderRadius: 20, padding: 24, marginBottom: 24, alignItems: 'center' },
  rateLabel: { fontSize: 13, marginBottom: 8 },
  rateValue: { fontSize: 40, fontWeight: '700', marginBottom: 4 },
  rateUnit: { fontSize: 14 },
  label: { fontSize: 13, marginBottom: 8, marginTop: 12 },
  field: { height: 56, borderRadius: 16, borderWidth: 1, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16 },
  input: { flex: 1, fontSize: 15 },
  infoCard: { borderRadius: 16, padding: 16, marginTop: 16, marginBottom: 16 },
  infoTitle: { fontSize: 13, fontWeight: '600', marginBottom: 4 },
  infoText: { fontSize: 12, lineHeight: 18 },
  btn: { height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginTop: 8 },
  btnText: { color: '#0B1020', fontSize: 16, fontWeight: '700' },
  cancelBtn: { height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center', borderWidth: 1, marginTop: 12 },
  cancelText: { fontSize: 16, fontWeight: '600' },
});