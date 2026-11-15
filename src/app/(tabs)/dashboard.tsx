import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/use-theme';
import { useRouter } from 'expo-router';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import { getDatasetInformation } from '@/services/datasetService';
import { formatNumber, formatPeso } from '@/utils/energy';
import { getFirstName } from '@/utils/profile';
import { AiButton } from '@/components/ai-button';
import { GradientShimmer } from '@/components/gradient';
import {
  BILL_BUTTON_GRADIENT,
  BILL_BUTTON_GRADIENT_LOCATIONS,
  BRAND_GRADIENT,
  BRAND_GRADIENT_END,
  BRAND_GRADIENT_LOCATIONS,
  BRAND_GRADIENT_START,
} from '@/constants/gradient';

export default function Dashboard() {
  const colors = useTheme();
  const router = useRouter();
  const { appliances, settings, totals } = useApp();
  const { currentUser } = useAuth();

  const period = settings.calcPeriod;
  const rate = settings.electricityRate;
  const hasAppliances = appliances.length > 0;
  const firstName = getFirstName(currentUser?.name ?? '');

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={[styles.greeting, { color: colors.cyan }]}>Hi, {firstName}</Text>
        <Text style={[styles.header, { color: colors.text }]}>Dashboard</Text>

        <View style={styles.heroWrap}>
          <LinearGradient
            colors={BRAND_GRADIENT}
            locations={BRAND_GRADIENT_LOCATIONS}
            start={BRAND_GRADIENT_START}
            end={BRAND_GRADIENT_END}
            style={styles.heroCard}
          >
            <GradientShimmer />
            <View style={styles.heroTop}>
              <Text style={styles.heroLabel}>Monthly Estimated Bill</Text>
              <View style={styles.heroBadge}>
                <Text style={styles.heroBadgeText}>ESTIMATE</Text>
              </View>
            </View>
            <Text style={styles.heroAmount}>{formatPeso(totals.totalCost, 2)}</Text>
            <Text style={styles.heroNote}>Estimate only · actual bills may vary</Text>
            <View style={styles.heroMetaRow}>
              <View style={styles.heroMetaItem}>
                <Text style={styles.heroMetaLabel}>RATE</Text>
                <Text style={styles.heroMetaValue}>{formatPeso(rate, 2)}/kWh</Text>
              </View>
              <View style={styles.heroDivider} />
              <View style={styles.heroMetaItem}>
                <Text style={styles.heroMetaLabel}>PERIOD</Text>
                <Text style={styles.heroMetaValue}>{period} days</Text>
              </View>
              <View style={styles.heroDivider} />
              <View style={styles.heroMetaItem}>
                <Text style={styles.heroMetaLabel}>APPLIANCES</Text>
                <Text style={styles.heroMetaValue}>{totals.applianceCount}</Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: colors.backgroundElement }]}>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Consumption</Text>
            <Text style={[styles.statValue, { color: colors.text }]}>{formatNumber(totals.totalKwh, 1)} kWh</Text>
            <Text style={[styles.statSub, { color: colors.green }]}>per {period} days</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.backgroundElement }]}>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Appliances</Text>
            <Text style={[styles.statValue, { color: colors.text }]}>{totals.applianceCount}</Text>
            <Text style={[styles.statSub, { color: colors.cyan }]}>
              {totals.totalUnits} unit{totals.totalUnits === 1 ? '' : 's'} total
            </Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.backgroundElement }]}>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total Power</Text>
            <Text style={[styles.statValue, { color: colors.text }]}>{formatNumber(totals.totalWatts, 0)} W</Text>
            <Text style={[styles.statSub, { color: colors.textSecondary }]}>power rating</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.backgroundElement }]}>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Electricity Rate</Text>
            <Text style={[styles.statValue, { color: colors.text }]}>{formatPeso(rate, 2)}</Text>
            <Text style={[styles.statSub, { color: colors.textSecondary }]}>per kWh (Settings)</Text>
          </View>
        </View>

        <View style={[styles.periodRow, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}>
          <Text style={[styles.periodLabel, { color: colors.textSecondary }]}>Calculation period</Text>
          <Text style={[styles.periodValue, { color: colors.text }]}>{period} days</Text>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Appliance Breakdown</Text>
          <TouchableOpacity onPress={() => router.push('/appliance-selector')}>
            <Text style={[styles.sectionAction, { color: colors.cyan }]}>Manage</Text>
          </TouchableOpacity>
        </View>

        {!hasAppliances ? (
          <View style={[styles.emptyCard, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No appliances yet</Text>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              Add your appliances with their wattage, quantity and daily usage to see an accurate estimated bill.
            </Text>
            <TouchableOpacity
              style={[styles.emptyBtn, { backgroundColor: colors.cyan }]}
              onPress={() => router.push('/appliance-selector')}
            >
              <Text style={styles.emptyBtnText}>+ Add Appliance</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.applianceList}>
            {totals.items.map((a) => (
              <View key={a.id} style={[styles.applianceCard, { backgroundColor: colors.backgroundElement }]}>
                <View style={styles.applianceTop}>
                  <View style={[styles.imgBox, { backgroundColor: colors.backgroundSelected }]}>
                    <Text style={styles.imgEmoji}>{a.emoji}</Text>
                  </View>
                  <View style={styles.nameCol}>
                    <Text style={[styles.applianceName, { color: colors.text }]}>{a.name}</Text>
                    <Text style={[styles.applianceUsage, { color: colors.textSecondary }]}>
                      {formatNumber(a.hours, a.hours % 1 === 0 ? 0 : 1)} h/day · {a.days} days
                    </Text>
                  </View>
                  <Text style={[styles.applianceCost, { color: colors.text }]}>
                    {formatPeso(a.monthlyCost, 2)}
                  </Text>
                </View>
                <View style={[styles.divider, { backgroundColor: colors.border }]} />
                <View style={styles.detailRow}>
                  <View style={styles.detailCell}>
                    <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Power</Text>
                    <Text style={[styles.detailValue, { color: colors.text }]}>{formatNumber(a.watts, 0)} W</Text>
                  </View>
                  <View style={styles.detailCell}>
                    <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Quantity</Text>
                    <Text style={[styles.detailValue, { color: colors.text }]}>{a.quantity}</Text>
                  </View>
                  <View style={styles.detailCell}>
                    <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Usage</Text>
                    <Text style={[styles.detailValue, { color: colors.text }]}>{formatNumber(a.hours, a.hours % 1 === 0 ? 0 : 1)} h/day</Text>
                  </View>
                  <View style={styles.detailCell}>
                    <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Consumption</Text>
                    <Text style={[styles.detailValue, { color: colors.text }]}>{formatNumber(a.monthlyKwh, 1)} kWh</Text>
                  </View>
                </View>
              </View>
            ))}
            <View style={[styles.totalRow, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}>
              <Text style={[styles.totalLabel, { color: colors.text }]}>
                Total ({totals.applianceCount} appliance{totals.applianceCount === 1 ? '' : 's'})
              </Text>
              <Text style={[styles.totalValue, { color: colors.cyan }]}>
                {formatNumber(totals.totalKwh, 1)} kWh · {formatPeso(totals.totalCost, 2)}
              </Text>
            </View>
          </View>
        )}

        <View style={[styles.infoCard, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}>
          <Text style={[styles.infoTitle, { color: colors.text }]}>About this estimate</Text>
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            Your estimated bill is calculated using the wattage, quantity, and daily usage hours of your selected appliances. Actual electricity bills may vary depending on real usage and other charges.
          </Text>
          <Text style={[styles.formula, { color: colors.textSecondary }]}>
            kWh = (W × qty × hours/day × days) ÷ 1000 · Cost = kWh × {formatPeso(rate, 2)}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.calcBtnWrap}
          onPress={() => router.push('/appliance-selector')}
          accessibilityRole="button"
          accessibilityLabel="Calculate bill"
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={BILL_BUTTON_GRADIENT}
            locations={BILL_BUTTON_GRADIENT_LOCATIONS}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={styles.calcBtn}
          >
            <Ionicons name="calculator-outline" size={20} color="#FFFFFF" />
            <Text style={styles.calcBtnText}>Calculate Bill</Text>
          </LinearGradient>
        </TouchableOpacity>
        <Text style={[styles.calcHint, { color: colors.textSecondary }]}>
          Review your appliances and save the estimate to Bill History.
        </Text>

        <View style={[styles.datasetCard, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}>
          <Text style={[styles.datasetEyebrow, { color: colors.textSecondary }]}>NOT PART OF YOUR ESTIMATE</Text>
          <Text style={[styles.datasetTitle, { color: colors.text }]}>📊 Historical Reference (REFIT)</Text>
          <Text style={[styles.datasetSub, { color: colors.textSecondary }]}>
            UK Household · {getDatasetInformation().samplePeriod} · {getDatasetInformation().totalReadings.toLocaleString()} readings
          </Text>
          <Text style={[styles.datasetNote, { color: colors.textSecondary }]}>
            Real appliance consumption from a UK home (CC BY 4.0). Use as a benchmark for your own usage. Not your measurements.
          </Text>
        </View>

      </ScrollView>

      {/* Floating AI assistant button: pinned over the content and tab bar. */}
      <View style={styles.aiFloat} pointerEvents="box-none">
        <AiButton onPress={() => router.push('/chatbot')} size={64} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 24, paddingBottom: 170 },
  greeting: { fontSize: 13, fontWeight: '600', marginBottom: 2 },
  header: { fontSize: 24, fontWeight: '700', marginBottom: 16 },
  heroWrap: {
    borderRadius: 28,
    marginBottom: 16,
    shadowColor: '#3987FF',
    shadowOpacity: 0.45,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 10 },
    elevation: 14,
  },
  heroCard: { borderRadius: 28, padding: 24, overflow: 'hidden' },
  heroTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  heroLabel: { color: 'rgba(255,255,255,0.92)', fontSize: 13, fontWeight: '600', letterSpacing: 0.3 },
  heroBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  heroBadgeText: { color: '#FFFFFF', fontSize: 9, fontWeight: '700', letterSpacing: 1 },
  heroAmount: { color: '#FFFFFF', fontSize: 40, fontWeight: '800', marginBottom: 2 },
  heroNote: { color: 'rgba(255,255,255,0.8)', fontSize: 11, marginBottom: 14 },
  heroMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  heroMetaItem: { flex: 1, alignItems: 'center' },
  heroMetaLabel: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.6,
    marginBottom: 2,
  },
  heroMetaValue: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
  heroDivider: { width: 1, height: 24, backgroundColor: 'rgba(255,255,255,0.25)' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 20 },
  statCard: { flexBasis: '47%', flexGrow: 1, borderRadius: 20, padding: 16 },
  statLabel: { fontSize: 11, marginBottom: 4 },
  statValue: { fontSize: 18, fontWeight: '700', marginBottom: 4 },
  statSub: { fontSize: 11 },
  periodRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderRadius: 14, borderWidth: 1, paddingHorizontal: 16, paddingVertical: 12, marginBottom: 20 },
  periodLabel: { fontSize: 12 },
  periodValue: { fontSize: 13, fontWeight: '600' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '600' },
  sectionAction: { fontSize: 13, fontWeight: '600' },
  applianceList: { gap: 12, marginBottom: 16 },
  applianceCard: { borderRadius: 20, padding: 16 },
  applianceTop: { flexDirection: 'row', alignItems: 'center' },
  imgBox: { width: 44, height: 44, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  imgEmoji: { fontSize: 24 },
  nameCol: { flex: 1 },
  applianceName: { fontSize: 16, fontWeight: '600' },
  applianceUsage: { fontSize: 12, marginTop: 2 },
  applianceCost: { fontSize: 16, fontWeight: '700', marginLeft: 8 },
  divider: { height: StyleSheet.hairlineWidth, marginVertical: 12 },
  detailRow: { flexDirection: 'row', flexWrap: 'wrap', rowGap: 10 },
  detailCell: { width: '50%' },
  detailLabel: { fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 2 },
  detailValue: { fontSize: 13, fontWeight: '600' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderRadius: 16, borderWidth: 1, padding: 16 },
  totalLabel: { fontSize: 13, fontWeight: '600' },
  totalValue: { fontSize: 14, fontWeight: '700' },
  emptyCard: { borderRadius: 20, borderWidth: 1, padding: 20, marginBottom: 16 },
  emptyTitle: { fontSize: 16, fontWeight: '600', marginBottom: 6 },
  emptyText: { fontSize: 12, lineHeight: 18, marginBottom: 14 },
  emptyBtn: { height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  emptyBtnText: { color: '#0B1020', fontSize: 14, fontWeight: '600' },
  infoCard: { borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 16 },
  infoTitle: { fontSize: 13, fontWeight: '600', marginBottom: 6 },
  infoText: { fontSize: 12, lineHeight: 18 },
  formula: { fontSize: 11, lineHeight: 16, marginTop: 8 },
  datasetCard: { borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 16 },
  datasetEyebrow: { fontSize: 9, letterSpacing: 1, fontWeight: '700', marginBottom: 6 },
  datasetTitle: { fontSize: 14, fontWeight: '600', marginBottom: 4 },
  datasetSub: { fontSize: 11, marginBottom: 4 },
  datasetNote: { fontSize: 10, lineHeight: 14, fontStyle: 'italic' },
  calcBtnWrap: {
    borderRadius: 16,
    shadowColor: '#00C5E8',
    shadowOpacity: 0.45,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
  calcBtn: {
    flexDirection: 'row',
    gap: 8,
    borderRadius: 16,
    height: 54,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    overflow: 'hidden',
  },
  calcBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    textShadowColor: 'rgba(0,0,0,0.25)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  calcHint: { fontSize: 11, lineHeight: 16, textAlign: 'center', marginTop: 8, marginBottom: 20 },
  aiFloat: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    zIndex: 20,
    elevation: 20,
  },
});
