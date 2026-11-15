import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useTheme } from '@/hooks/use-theme';
import { useRouter } from 'expo-router';
import { useApp } from '@/contexts/AppContext';
import { formatPeso } from '@/utils/energy';

export default function MonthlyBudget() {
  const colors = useTheme();
  const router = useRouter();
  const { settings, updateSettings, totals } = useApp();
  const [budget, setBudget] = useState(String(settings.monthlyBudget));

  const handleSave = () => {
    const b = parseFloat(budget);
    if (isNaN(b) || b <= 0) {
      Alert.alert('Validation', 'Please enter a valid budget.');
      return;
    }
    updateSettings({ monthlyBudget: b });
    Alert.alert('Success', 'Monthly budget updated.', [
      { text: 'OK', onPress: () => router.back() },
    ]);
  };

  const estimatedBill = totals.totalCost;
  const remaining = settings.monthlyBudget - estimatedBill;
  const pct = settings.monthlyBudget > 0 ? Math.min(estimatedBill / settings.monthlyBudget, 1) : 0;
  const status = pct >= 1 ? 'Over Budget' : pct >= 0.8 ? 'Near Budget Limit' : 'Within Budget';
  const statusColor = pct >= 1 ? '#FF6B6B' : pct >= 0.8 ? '#FFB020' : colors.green;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={[styles.back, { color: colors.text }]}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={[styles.header, { color: colors.text }]}>Monthly Budget</Text>

        <View style={[styles.budgetCard, { backgroundColor: colors.backgroundElement }]}>
          <Text style={[styles.budgetLabel, { color: colors.textSecondary }]}>Current Budget</Text>
          <Text style={[styles.budgetValue, { color: colors.cyan }]}>{formatPeso(settings.monthlyBudget)}</Text>
          <View style={[styles.progressBg, { backgroundColor: colors.border }]}>
            <View style={[styles.progressFill, { backgroundColor: statusColor, width: `${pct * 100}%` }]} />
          </View>
          <Text style={[styles.budgetInfo, { color: colors.textSecondary }]}>Estimated bill: {formatPeso(estimatedBill, 0)}  •  {status}</Text>
          <Text style={[styles.remaining, { color: colors.text }]}>Remaining: {formatPeso(Math.max(remaining, 0), 0)}</Text>
        </View>

        <Text style={[styles.label, { color: colors.textSecondary }]}>New Budget Amount (₱)</Text>
        <View style={[styles.field, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}>
          <TextInput value={budget} onChangeText={setBudget} keyboardType="numeric" style={[styles.input, { color: colors.text }]} />
        </View>

        <View style={[styles.statusCard, { backgroundColor: colors.backgroundElement }]}>
          <Text style={[styles.statusText, { color: statusColor }]}>Status: {status}</Text>
        </View>

        <TouchableOpacity style={[styles.btn, { backgroundColor: colors.green }]} onPress={handleSave}>
          <Text style={styles.btnText}>Save Budget</Text>
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
  budgetCard: { borderRadius: 20, padding: 24, marginBottom: 24 },
  budgetLabel: { fontSize: 13, marginBottom: 8 },
  budgetValue: { fontSize: 32, fontWeight: '700', marginBottom: 16 },
  progressBg: { height: 10, borderRadius: 5, overflow: 'hidden', marginBottom: 8 },
  progressFill: { height: 10, borderRadius: 5 },
  budgetInfo: { fontSize: 12, marginBottom: 4 },
  remaining: { fontSize: 14, fontWeight: '600' },
  label: { fontSize: 13, marginBottom: 8, marginTop: 12 },
  field: { height: 56, borderRadius: 16, borderWidth: 1, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16 },
  input: { flex: 1, fontSize: 15 },
  statusCard: { borderRadius: 16, padding: 16, marginTop: 16, marginBottom: 16 },
  statusText: { fontSize: 14, fontWeight: '600' },
  btn: { height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginTop: 8 },
  btnText: { color: '#0B1020', fontSize: 16, fontWeight: '700' },
  cancelBtn: { height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center', borderWidth: 1, marginTop: 12 },
  cancelText: { fontSize: 16, fontWeight: '600' },
});