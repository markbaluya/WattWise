import { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, TextInput } from 'react-native';
import { useTheme } from '@/hooks/use-theme';
import { useApp } from '@/contexts/AppContext';
import { useRouter } from 'expo-router';
import { formatNumber, formatPeso } from '@/utils/energy';

export default function History() {
  const colors = useTheme();
  const router = useRouter();
  const { billHistory, deleteBill } = useApp();
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');

  const filtered = billHistory.filter((r) => {
    const d = new Date(r.date);
    const now = new Date();
    if (filter === 'This Month' && (d.getMonth() !== now.getMonth() || d.getFullYear() !== now.getFullYear())) return false;
    if (filter === 'Last Month') {
      const last = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      if (d.getMonth() !== last.getMonth() || d.getFullYear() !== last.getFullYear()) return false;
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      if (!r.date.toLowerCase().includes(q) && !String(r.period).includes(q)) return false;
    }
    return true;
  });

  const handleDelete = (id: string) => {
    Alert.alert('Delete Record', 'Are you sure you want to delete this record?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteBill(id) },
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={[styles.header, { color: colors.text }]}>Bill History</Text>
        <View style={styles.filterRow}>
          {['All', 'This Month', 'Last Month'].map((c) => (
            <TouchableOpacity
              key={c}
              style={[styles.chip, { backgroundColor: filter === c ? colors.cyan : colors.backgroundElement, borderColor: colors.border }]}
              onPress={() => setFilter(c)}
            >
              <Text style={[styles.chipText, { color: filter === c ? '#0B1020' : colors.textSecondary }]}>{c}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={[styles.searchBar, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}>
          <TextInput
            placeholder="Search by date or period..."
            placeholderTextColor={colors.textSecondary}
            style={[styles.searchInput, { color: colors.text }]}
            value={search}
            onChangeText={setSearch}
          />
        </View>
        {filtered.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No saved bills yet. Calculate and save a bill to see it here.
            </Text>
            <TouchableOpacity style={[styles.emptyBtn, { backgroundColor: colors.cyan }]} onPress={() => router.push('/appliance-selector')}>
              <Text style={styles.emptyBtnText}>Calculate a Bill</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.list}>
            {filtered.map((r) => (
              <TouchableOpacity
                key={r.id}
                style={[styles.card, { backgroundColor: colors.backgroundElement }]}
                onPress={() => router.push({ pathname: '/bill-history-detail', params: { id: r.id } })}
              >
                <View style={styles.textCol}>
                  <Text style={[styles.month, { color: colors.text }]}>{new Date(r.date).toLocaleDateString()}</Text>
                  <Text style={[styles.sub, { color: colors.textSecondary }]}>
                    {r.period} days · {formatNumber(r.totalConsumption, 1)} kWh · {r.calculations.length} appliances
                  </Text>
                </View>
                <View style={styles.rightCol}>
                  <Text style={[styles.amount, { color: colors.cyan }]}>{formatPeso(r.totalCost, 2)}</Text>
                  <TouchableOpacity onPress={() => handleDelete(r.id)}>
                    <Text style={styles.deleteText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 24, paddingBottom: 100 },
  header: { fontSize: 24, fontWeight: '700', marginBottom: 16 },
  filterRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 16, borderWidth: 1 },
  chipText: { fontSize: 12, fontWeight: '500' },
  searchBar: { height: 48, borderRadius: 16, borderWidth: 1, justifyContent: 'center', paddingHorizontal: 16, marginBottom: 16 },
  searchInput: { fontSize: 14, flex: 1, padding: 0 },
  list: { gap: 12 },
  card: { flexDirection: 'row', alignItems: 'center', borderRadius: 20, padding: 16, minHeight: 64 },
  textCol: { flex: 1 },
  month: { fontSize: 16, fontWeight: '500' },
  sub: { fontSize: 12, marginTop: 4 },
  rightCol: { alignItems: 'flex-end', gap: 4 },
  amount: { fontSize: 16, fontWeight: '700' },
  deleteText: { color: '#FF6B6B', fontSize: 11, fontWeight: '600' },
  emptyState: { padding: 40, alignItems: 'center' },
  emptyText: { fontSize: 14, textAlign: 'center', lineHeight: 20, marginBottom: 16 },
  emptyBtn: { paddingHorizontal: 20, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  emptyBtnText: { color: '#0B1020', fontSize: 14, fontWeight: '600' },
});
