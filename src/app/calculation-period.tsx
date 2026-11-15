import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useTheme } from '@/hooks/use-theme';
import { useRouter } from 'expo-router';
import { useApp } from '@/contexts/AppContext';

const PERIODS = ['7 Days', '15 Days', '30 Days', 'Custom Period'];

export default function CalculationPeriod() {
  const colors = useTheme();
  const router = useRouter();
  const { settings, updateSettings } = useApp();
  const [selected, setSelected] = useState('30 Days');
  const [startDate, setStartDate] = useState('Jan 1, 2026');
  const [endDate, setEndDate] = useState('Jan 30, 2026');

  const handleSave = () => {
    const days = selected === '7 Days' ? 7 : selected === '15 Days' ? 15 : selected === '30 Days' ? 30 : settings.calcPeriod;
    updateSettings({ calcPeriod: days });
    Alert.alert('Success', 'Calculation period saved.', [
      { text: 'OK', onPress: () => router.back() },
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={[styles.back, { color: colors.text }]}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={[styles.header, { color: colors.text }]}>Calculation Period</Text>
        <Text style={[styles.desc, { color: colors.textSecondary }]}>Choose the period used to estimate electricity consumption and your monthly bill.</Text>

        <View style={styles.periodList}>
          {PERIODS.map((p) => (
            <TouchableOpacity
              key={p}
              style={[styles.periodCard, { backgroundColor: selected === p ? colors.cyan : colors.backgroundElement, borderColor: selected === p ? colors.cyan : colors.border }]}
              onPress={() => setSelected(p)}
            >
              <Text style={[styles.periodLabel, { color: selected === p ? '#0B1020' : colors.text }]}>{p}</Text>
              {selected === p && <View style={[styles.selectedDot, { backgroundColor: '#0B1020' }]} />}
            </TouchableOpacity>
          ))}
        </View>

        {selected === 'Custom Period' && (
          <View style={[styles.dateCard, { backgroundColor: colors.backgroundElement }]}>
            <View style={styles.dateRow}>
              <View style={styles.dateField}>
                <Text style={[styles.dateLabel, { color: colors.textSecondary }]}>Start Date</Text>
                <View style={[styles.dateInput, { backgroundColor: colors.background, borderColor: colors.border }]}>
                  <Text style={[styles.dateText, { color: colors.text }]}>{startDate}</Text>
                </View>
              </View>
              <View style={styles.dateField}>
                <Text style={[styles.dateLabel, { color: colors.textSecondary }]}>End Date</Text>
                <View style={[styles.dateInput, { backgroundColor: colors.background, borderColor: colors.border }]}>
                  <Text style={[styles.dateText, { color: colors.text }]}>{endDate}</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        <TouchableOpacity style={[styles.btn, { backgroundColor: colors.green }]} onPress={handleSave}>
          <Text style={styles.btnText}>Save Period</Text>
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
  header: { fontSize: 24, fontWeight: '700', marginBottom: 8 },
  desc: { fontSize: 14, marginBottom: 24, lineHeight: 20 },
  periodList: { gap: 12, marginBottom: 24 },
  periodCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderRadius: 16, borderWidth: 1, padding: 16, height: 56 },
  periodLabel: { fontSize: 15, fontWeight: '600' },
  selectedDot: { width: 12, height: 12, borderRadius: 6 },
  dateCard: { borderRadius: 16, padding: 16, marginBottom: 24 },
  dateRow: { flexDirection: 'row', gap: 12 },
  dateField: { flex: 1 },
  dateLabel: { fontSize: 12, marginBottom: 8 },
  dateInput: { height: 44, borderRadius: 10, borderWidth: 1, justifyContent: 'center', paddingHorizontal: 12 },
  dateText: { fontSize: 13 },
  btn: { height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginTop: 8 },
  btnText: { color: '#0B1020', fontSize: 16, fontWeight: '700' },
  cancelBtn: { height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center', borderWidth: 1, marginTop: 12 },
  cancelText: { fontSize: 16, fontWeight: '600' },
});