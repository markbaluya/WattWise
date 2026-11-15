import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/hooks/use-theme';
import { useRouter } from 'expo-router';
import { useApp } from '@/contexts/AppContext';
import { formatNumber, formatPeso } from '@/utils/energy';

export default function BillBreakdown() {
  const colors = useTheme();
  const router = useRouter();
  const { settings, totals, saveBill } = useApp();

  const rate = settings.electricityRate;
  const period = settings.calcPeriod;
  const hasAppliances = totals.items.length > 0;

  const handleSave = () => {
    if (!hasAppliances) {
      router.push('/appliance-selector');
      return;
    }
    saveBill();
    router.push('/history');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={[styles.header, { color: colors.text }]}>Bill Breakdown</Text>

        <View style={[styles.heroCard, { backgroundColor: colors.cyan }]}>
          <Text style={styles.heroLabel}>Total Estimated Bill</Text>
          <Text style={styles.heroAmount}>{formatPeso(totals.totalCost, 2)}</Text>
          <Text style={styles.heroMeta}>
            {totals.applianceCount} appliance{totals.applianceCount === 1 ? '' : 's'} · {period} days · {formatPeso(rate, 2)}/kWh
          </Text>
        </View>

        <View style={styles.summaryRow}>
          <View style={[styles.summaryCard, { backgroundColor: colors.backgroundElement }]}>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Total Consumption</Text>
            <Text style={[styles.summaryValue, { color: colors.text }]}>{formatNumber(totals.totalKwh, 1)} kWh</Text>
          </View>
          <View style={[styles.summaryCard, { backgroundColor: colors.backgroundElement }]}>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Total Power</Text>
            <Text style={[styles.summaryValue, { color: colors.text }]}>{formatNumber(totals.totalWatts, 0)} W</Text>
          </View>
        </View>

        {!hasAppliances ? (
          <View style={[styles.emptyCard, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>Nothing to calculate yet</Text>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              Add at least one appliance so WattWise can compute your estimated monthly bill.
            </Text>
          </View>
        ) : (
          <View style={styles.list}>
            {totals.items.map((c) => (
              <View key={c.id} style={[styles.card, { backgroundColor: colors.backgroundElement }]}>
                <View style={[styles.imgBox, { backgroundColor: colors.backgroundSelected }]}>
                  <Text style={styles.imgEmoji}>{c.emoji}</Text>
                </View>
                <View style={styles.textCol}>
                  <Text style={[styles.name, { color: colors.text }]}>{c.name}</Text>
                  <Text style={[styles.sub, { color: colors.textSecondary }]}>
                    {formatNumber(c.watts, 0)} W × {c.quantity} · {formatNumber(c.hours, c.hours % 1 === 0 ? 0 : 1)} h/day × {c.days} days
                  </Text>
                  <Text style={[styles.consumption, { color: colors.textSecondary }]}>
                    {formatNumber(c.monthlyKwh, 2)} kWh/month
                  </Text>
                </View>
                <Text style={[styles.cost, { color: colors.text }]}>{formatPeso(c.monthlyCost, 2)}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={[styles.totalRow, { backgroundColor: colors.cyan }]}>
          <Text style={styles.totalLabel}>Total Estimated</Text>
          <Text style={styles.totalValue}>{formatPeso(totals.totalCost, 2)} / {period} days</Text>
        </View>

        <View style={[styles.formulaCard, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}>
          <Text style={[styles.formulaTitle, { color: colors.text }]}>How it's calculated</Text>
          <Text style={[styles.formula, { color: colors.textSecondary }]}>Monthly kWh = (W × qty × hrs/day × days) ÷ 1000</Text>
          <Text style={[styles.formula, { color: colors.textSecondary }]}>Estimated cost = Monthly kWh × {formatPeso(rate, 2)}/kWh</Text>
          <Text style={[styles.formula, { color: colors.textSecondary }]}>Rate and period come from Profile &amp; Settings.</Text>
          <Text style={[styles.formulaNote, { color: colors.textSecondary }]}>
            This is an estimate. Actual bills may vary with real usage and other charges.
          </Text>
        </View>

        <TouchableOpacity style={[styles.saveBtn, { backgroundColor: colors.green }]} onPress={handleSave}>
          <Text style={styles.saveBtnText}>{hasAppliances ? 'Save to History' : 'Add Appliances'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.editBtn, { borderColor: colors.border }]} onPress={() => router.push('/appliance-selector')}>
          <Text style={[styles.editBtnText, { color: colors.cyan }]}>Edit Appliances</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={[styles.backLink, { color: colors.textSecondary }]}>← Back to Dashboard</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 24, paddingBottom: 100 },
  header: { fontSize: 24, fontWeight: '700', marginBottom: 16 },
  heroCard: { borderRadius: 28, padding: 24, marginBottom: 16 },
  heroLabel: { color: '#0B1020', fontSize: 13, fontWeight: '500' },
  heroAmount: { color: '#0B1020', fontSize: 40, fontWeight: '700', marginVertical: 8 },
  heroMeta: { color: '#0B1020', fontSize: 12 },
  summaryRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  summaryCard: { flex: 1, borderRadius: 16, padding: 14 },
  summaryLabel: { fontSize: 11, marginBottom: 4 },
  summaryValue: { fontSize: 16, fontWeight: '700' },
  list: { gap: 12, marginBottom: 16 },
  card: { flexDirection: 'row', alignItems: 'center', borderRadius: 20, padding: 16, gap: 12 },
  imgBox: { width: 44, height: 44, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  imgEmoji: { fontSize: 22 },
  textCol: { flex: 1 },
  name: { fontSize: 15, fontWeight: '600' },
  sub: { fontSize: 11, marginTop: 3 },
  consumption: { fontSize: 11, marginTop: 3 },
  cost: { fontSize: 15, fontWeight: '700' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderRadius: 24, padding: 20, marginBottom: 16 },
  totalLabel: { color: '#0B1020', fontSize: 14, fontWeight: '600' },
  totalValue: { color: '#0B1020', fontSize: 14, fontWeight: '700' },
  formulaCard: { borderRadius: 20, borderWidth: 1, padding: 16, marginBottom: 16 },
  formulaTitle: { fontSize: 13, fontWeight: '600', marginBottom: 8 },
  formula: { fontSize: 11, marginBottom: 4, lineHeight: 16 },
  formulaNote: { fontSize: 10, marginTop: 8, lineHeight: 14, fontStyle: 'italic' },
  emptyCard: { borderRadius: 20, borderWidth: 1, padding: 20, marginBottom: 16 },
  emptyTitle: { fontSize: 16, fontWeight: '600', marginBottom: 6 },
  emptyText: { fontSize: 12, lineHeight: 18 },
  saveBtn: { borderRadius: 32, height: 64, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  saveBtnText: { color: '#0B1020', fontSize: 16, fontWeight: '600' },
  editBtn: { borderRadius: 26, height: 52, justifyContent: 'center', alignItems: 'center', borderWidth: 1, marginBottom: 12 },
  editBtnText: { fontSize: 15, fontWeight: '600' },
  backLink: { fontSize: 13, textAlign: 'center', marginTop: 8 },
});
