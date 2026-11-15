import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useTheme } from '@/hooks/use-theme';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useApp } from '@/contexts/AppContext';

export default function BillHistoryDetail() {
  const colors = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { billHistory, deleteBill } = useApp();
  const record = billHistory.find((r) => r.id === id);

  if (!record) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.header, { color: colors.text }]}>Record not found</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={[styles.backLink, { color: colors.cyan }]}>← Back to History</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleDelete = () => {
    Alert.alert('Delete Record', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => { deleteBill(record.id); router.back(); } },
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={[styles.back, { color: colors.text }]}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={[styles.header, { color: colors.text }]}>Bill Details</Text>

        <View style={[styles.heroCard, { backgroundColor: colors.cyan }]}>
          <Text style={styles.heroLabel}>Estimated Bill</Text>
          <Text style={styles.heroAmount}>₱{record.totalCost.toFixed(0)}</Text>
          <Text style={styles.heroMeta}>{new Date(record.date).toLocaleString()} · ₱{record.rate}/kWh</Text>
        </View>

        <View style={[styles.infoCard, { backgroundColor: colors.backgroundElement }]}>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Period</Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>{record.period} days</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Total Consumption</Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>{record.totalConsumption.toFixed(1)} kWh</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Appliances</Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>{record.calculations.length}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Electricity Rate</Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>₱{record.rate}/kWh</Text>
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>Appliance Breakdown</Text>
        <View style={styles.list}>
          {record.calculations.map((c, i) => (
            <View key={i} style={[styles.card, { backgroundColor: colors.backgroundElement }]}>
              <View style={[styles.imgBox, { backgroundColor: colors.backgroundSelected, justifyContent: 'center', alignItems: 'center' }]}>
                <Text style={styles.imgEmoji}>{c.appliance.emoji}</Text>
              </View>
              <View style={styles.textCol}>
                <Text style={[styles.name, { color: colors.text }]}>{c.appliance.name}</Text>
                <Text style={[styles.sub, { color: colors.textSecondary }]}>{c.appliance.watts}W · {c.appliance.quantity} unit · {c.appliance.hours}h/day · {c.consumption.toFixed(1)} kWh</Text>
              </View>
              <Text style={[styles.cost, { color: colors.text }]}>₱{c.cost.toFixed(0)}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]} onPress={() => router.back()}>
          <Text style={[styles.actionText, { color: colors.cyan }]}>← Back to History</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.deleteBtn, { backgroundColor: '#FF6B6B20', borderColor: '#FF6B6B' }]} onPress={handleDelete}>
          <Text style={[styles.deleteText, { color: '#FF6B6B' }]}>Delete Record</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 24, paddingTop: 60, paddingBottom: 100 },
  back: { fontSize: 18, marginBottom: 16 },
  header: { fontSize: 24, fontWeight: '700', marginBottom: 16 },
  heroCard: { borderRadius: 28, padding: 24, marginBottom: 16 },
  heroLabel: { color: '#0B1020', fontSize: 13, fontWeight: '500' },
  heroAmount: { color: '#0B1020', fontSize: 40, fontWeight: '700', marginVertical: 8 },
  heroMeta: { color: '#0B1020', fontSize: 12 },
  infoCard: { borderRadius: 20, padding: 16, marginBottom: 16 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
  infoLabel: { fontSize: 13 },
  infoValue: { fontSize: 13, fontWeight: '600' },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 12 },
  list: { gap: 12, marginBottom: 16 },
  card: { flexDirection: 'row', alignItems: 'center', borderRadius: 20, padding: 16, height: 58, gap: 12 },
  imgBox: { width: 44, height: 44, borderRadius: 10 },
  imgEmoji: { fontSize: 22 },
  textCol: { flex: 1 },
  name: { fontSize: 15, fontWeight: '500' },
  sub: { fontSize: 11, marginTop: 4 },
  cost: { fontSize: 16, fontWeight: '700' },
  actionBtn: { borderRadius: 16, height: 48, justifyContent: 'center', alignItems: 'center', borderWidth: 1, marginBottom: 12 },
  actionText: { fontSize: 14, fontWeight: '600' },
  deleteBtn: { borderRadius: 16, height: 48, justifyContent: 'center', alignItems: 'center', borderWidth: 1, marginBottom: 12 },
  deleteText: { fontSize: 14, fontWeight: '600' },
  backLink: { fontSize: 13, textAlign: 'center', marginTop: 8 },
});