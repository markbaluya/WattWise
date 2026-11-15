import { useMemo, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Alert, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import { useTheme } from '@/hooks/use-theme';
import { useRouter } from 'expo-router';
import { useApp, Appliance } from '@/contexts/AppContext';
import { calcApplianceEnergy, formatNumber, formatPeso } from '@/utils/energy';

const EMOJI_MAP: Record<string, string> = {
  'Air Conditioner': '❄️',
  'Refrigerator': '🧊',
  'Television': '📺',
  'Washing Machine': '🧺',
  'Electric Fan': '🌀',
  'Rice Cooker': '🍚',
  'Computer': '💻',
  'Lighting': '💡',
  'Microwave': '📦',
  'Electric Iron': '🔥',
  'Water Heater': '🚿',
  'Laptop': '💻',
  'Desktop Computer': '🖥️',
};

const CATEGORIES = ['All', 'Kitchen', 'Living', 'Laundry'];

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  Kitchen: ['refrigerator', 'fridge', 'rice cooker', 'microwave', 'kettle', 'oven', 'toaster', 'blender'],
  Living: ['television', 'tv', 'fan', 'air conditioner', 'aircon', 'computer', 'laptop', 'light', 'console', 'router'],
  Laundry: ['washing machine', 'dryer', 'iron'],
};

export default function ApplianceSelector() {
  const colors = useTheme();
  const router = useRouter();
  const { appliances, addAppliance, updateAppliance, removeAppliance, calculateAll, settings } = useApp();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [watts, setWatts] = useState('');
  const [qty, setQty] = useState('1');
  const [hours, setHours] = useState('8');
  const [days, setDays] = useState(String(settings.calcPeriod));
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  const resetForm = () => {
    setName('');
    setWatts('');
    setQty('1');
    setHours('8');
    setDays(String(settings.calcPeriod));
    setEditingId(null);
    setShowForm(false);
  };

  const openAddForm = () => {
    resetForm();
    setShowForm(true);
  };

  const formPreview = useMemo(
    () =>
      calcApplianceEnergy(
        {
          watts: parseFloat(watts) || 0,
          quantity: parseInt(qty, 10) || 0,
          hours: parseFloat(hours) || 0,
          days: parseInt(days, 10) || 0,
        },
        settings.electricityRate
      ),
    [watts, qty, hours, days, settings.electricityRate]
  );

  const handleSave = () => {
    const w = parseFloat(watts);
    const q = parseInt(qty, 10);
    const h = parseFloat(hours);
    const d = parseInt(days, 10);

    if (!name.trim()) {
      Alert.alert('Check the name', 'Please enter an appliance name.');
      return;
    }
    if (!Number.isFinite(w) || w <= 0) {
      Alert.alert('Check the wattage', 'Power rating must be a number greater than 0 W.');
      return;
    }
    if (!Number.isFinite(q) || q < 1) {
      Alert.alert('Check the quantity', 'Quantity must be at least 1.');
      return;
    }
    if (!Number.isFinite(h) || h <= 0 || h > 24) {
      Alert.alert('Check the hours', 'Hours of use per day must be between 0 and 24.');
      return;
    }
    if (!Number.isFinite(d) || d < 1 || d > 31) {
      Alert.alert('Check the days', 'Days of use must be between 1 and 31.');
      return;
    }

    const emoji = EMOJI_MAP[name.trim()] || '⚡';
    if (editingId) {
      updateAppliance(editingId, { name: name.trim(), watts: w, quantity: q, hours: h, days: d, emoji });
    } else {
      addAppliance({ id: Date.now().toString(), name: name.trim(), watts: w, quantity: q, hours: h, days: d, emoji });
    }
    resetForm();
  };

  const handleEdit = (a: Appliance) => {
    setEditingId(a.id);
    setName(a.name);
    setWatts(String(a.watts));
    setQty(String(a.quantity));
    setHours(String(a.hours));
    setDays(String(a.days));
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete Appliance', 'Remove this appliance from your estimate?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => removeAppliance(id) },
    ]);
  };

  const filtered = appliances.filter((a) => {
    const matchesSearch = a.name.toLowerCase().includes(search.trim().toLowerCase());
    const keywords = CATEGORY_KEYWORDS[category];
    const matchesCategory = !keywords || keywords.some((k) => a.name.toLowerCase().includes(k));
    return matchesSearch && matchesCategory;
  });

  const totalConsumption = appliances.reduce((s, a) => s + calcApplianceEnergy(a, settings.electricityRate).monthlyKwh, 0);
  const totalCost = appliances.reduce((s, a) => s + calcApplianceEnergy(a, settings.electricityRate).monthlyCost, 0);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={[styles.header, { color: colors.text }]}>Choose Appliances</Text>

        <View style={[styles.searchBar, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}>
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search appliances..."
            placeholderTextColor={colors.textSecondary}
            style={[styles.searchInput, { color: colors.text }]}
          />
        </View>

        <View style={styles.catRow}>
          {CATEGORIES.map((c) => (
            <TouchableOpacity
              key={c}
              style={[styles.catChip, { backgroundColor: category === c ? colors.cyan : colors.backgroundElement }]}
              onPress={() => setCategory(c)}
            >
              <Text style={[styles.catText, { color: category === c ? '#0B1020' : colors.textSecondary }]}>{c}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {filtered.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              {appliances.length === 0 ? 'No appliances yet' : 'No matching appliances'}
            </Text>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              {appliances.length === 0
                ? 'Add each appliance you use with its wattage, quantity and daily hours.'
                : 'Try a different search or category.'}
            </Text>
          </View>
        ) : (
          <View style={styles.list}>
            {filtered.map((a) => {
              const energy = calcApplianceEnergy(a, settings.electricityRate);
              return (
                <View key={a.id} style={[styles.card, { backgroundColor: colors.backgroundElement }]}>
                  <View style={[styles.imgBox, { backgroundColor: colors.backgroundSelected, justifyContent: 'center', alignItems: 'center' }]}>
                    <Text style={styles.imgEmoji}>{a.emoji}</Text>
                  </View>
                  <View style={styles.textCol}>
                    <Text style={[styles.name, { color: colors.text }]}>{a.name}</Text>
                    <Text style={[styles.sub, { color: colors.textSecondary }]}>
                      {formatNumber(a.watts, 0)} W · {a.quantity} unit{a.quantity === 1 ? '' : 's'} · {formatNumber(a.hours, a.hours % 1 === 0 ? 0 : 1)} h/day · {a.days} days
                    </Text>
                    <Text style={[styles.usage, { color: colors.cyan }]}>
                      {formatNumber(energy.monthlyKwh, 2)} kWh · {formatPeso(energy.monthlyCost, 2)} / {a.days} days
                    </Text>
                  </View>
                  <View style={styles.actions}>
                    <TouchableOpacity onPress={() => handleEdit(a)}>
                      <Text style={[styles.actionText, { color: colors.cyan }]}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDelete(a.id)}>
                      <Text style={[styles.actionText, { color: '#FF6B6B' }]}>Del</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        <View style={[styles.totalCard, { backgroundColor: colors.backgroundElement }]}>
          <View>
            <Text style={[styles.totalLabel, { color: colors.textSecondary }]}>Total Estimated Consumption</Text>
            <Text style={[styles.totalValue, { color: colors.text }]}>{formatNumber(totalConsumption, 1)} kWh</Text>
          </View>
          <View style={styles.totalRight}>
            <Text style={[styles.totalLabel, { color: colors.textSecondary }]}>Estimated Cost</Text>
            <Text style={[styles.totalValue, { color: colors.text }]}>{formatPeso(totalCost, 2)}</Text>
          </View>
        </View>
        <Text style={[styles.hint, { color: colors.textSecondary }]}>
          {appliances.length} appliance{appliances.length === 1 ? '' : 's'} · {formatPeso(settings.electricityRate, 2)}/kWh · {settings.calcPeriod} days (from Settings)
        </Text>

        <TouchableOpacity style={[styles.addBtn, { backgroundColor: colors.cyan }]} onPress={openAddForm}>
          <Text style={styles.addBtnText}>+ Add Appliance</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.calcBtn, { backgroundColor: colors.green, opacity: appliances.length === 0 ? 0.5 : 1 }]}
          onPress={() => {
            if (appliances.length === 0) {
              Alert.alert('No appliances', 'Add at least one appliance before calculating.');
              return;
            }
            calculateAll();
            router.push('/bill-breakdown');
          }}
        >
          <Text style={styles.calcBtnText}>Calculate Bill</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal visible={showForm} animationType="slide" transparent>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.background }]}>
            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              <Text style={[styles.modalTitle, { color: colors.text }]}>{editingId ? 'Edit Appliance' : 'Add Appliance'}</Text>

              <Text style={[styles.label, { color: colors.textSecondary }]}>Appliance name</Text>
              <TextInput value={name} onChangeText={setName} placeholder="e.g. Electric Fan" placeholderTextColor={colors.textSecondary} style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.backgroundElement }]} />

              <Text style={[styles.label, { color: colors.textSecondary }]}>Power rating (watts)</Text>
              <TextInput value={watts} onChangeText={setWatts} placeholder="e.g. 100" keyboardType="numeric" placeholderTextColor={colors.textSecondary} style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.backgroundElement }]} />

              <Text style={[styles.label, { color: colors.textSecondary }]}>Quantity (number of units)</Text>
              <TextInput value={qty} onChangeText={setQty} placeholder="1" keyboardType="numeric" placeholderTextColor={colors.textSecondary} style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.backgroundElement }]} />

              <Text style={[styles.label, { color: colors.textSecondary }]}>Hours of use per day</Text>
              <TextInput value={hours} onChangeText={setHours} placeholder="8 (default — change to match your usage)" keyboardType="numeric" placeholderTextColor={colors.textSecondary} style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.backgroundElement }]} />
              <Text style={[styles.helper, { color: colors.textSecondary }]}>Default is 8 hours. Set the real hours you use this appliance.</Text>

              <Text style={[styles.label, { color: colors.textSecondary }]}>Days of use</Text>
              <TextInput value={days} onChangeText={setDays} placeholder={`${settings.calcPeriod} (from Settings)`} keyboardType="numeric" placeholderTextColor={colors.textSecondary} style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.backgroundElement }]} />
              <Text style={[styles.helper, { color: colors.textSecondary }]}>Default is your calculation period ({settings.calcPeriod} days).</Text>

              <View style={[styles.previewCard, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}>
                <Text style={[styles.previewLabel, { color: colors.textSecondary }]}>Estimated for this appliance</Text>
                <Text style={[styles.previewValue, { color: colors.text }]}>
                  {formatNumber(formPreview.monthlyKwh, 2)} kWh · {formatPeso(formPreview.monthlyCost, 2)}
                </Text>
                <Text style={[styles.previewSub, { color: colors.textSecondary }]}>
                  at {formatPeso(settings.electricityRate, 2)}/kWh
                </Text>
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity style={[styles.modalBtn, { backgroundColor: colors.backgroundElement }]} onPress={resetForm}>
                  <Text style={[styles.modalBtnText, { color: colors.text }]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.modalBtn, { backgroundColor: colors.green }]} onPress={handleSave}>
                  <Text style={[styles.modalBtnText, { color: '#0B1020' }]}>Save</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 24, paddingBottom: 100 },
  header: { fontSize: 24, fontWeight: '700', marginBottom: 16 },
  searchBar: { height: 56, borderRadius: 20, borderWidth: 1, justifyContent: 'center', paddingHorizontal: 16, marginBottom: 16 },
  searchInput: { fontSize: 15, padding: 0 },
  catRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  catChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  catText: { fontSize: 12, fontWeight: '500' },
  list: { gap: 12, marginBottom: 16 },
  card: { flexDirection: 'row', alignItems: 'center', borderRadius: 20, padding: 16, gap: 12 },
  imgBox: { width: 44, height: 44, borderRadius: 10 },
  imgEmoji: { fontSize: 22 },
  textCol: { flex: 1 },
  name: { fontSize: 15, fontWeight: '500' },
  sub: { fontSize: 11, marginTop: 3, lineHeight: 15 },
  usage: { fontSize: 11, marginTop: 3, fontWeight: '600' },
  actions: { flexDirection: 'row', gap: 12 },
  actionText: { fontSize: 13, fontWeight: '600' },
  emptyCard: { borderRadius: 20, borderWidth: 1, padding: 20, marginBottom: 16 },
  emptyTitle: { fontSize: 15, fontWeight: '600', marginBottom: 6 },
  emptyText: { fontSize: 12, lineHeight: 18 },
  totalCard: { borderRadius: 20, padding: 16, marginBottom: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalRight: { alignItems: 'flex-end' },
  totalLabel: { fontSize: 11, marginBottom: 4 },
  totalValue: { fontSize: 16, fontWeight: '700' },
  hint: { fontSize: 11, marginBottom: 16 },
  addBtn: { borderRadius: 16, height: 48, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  addBtnText: { color: '#0B1020', fontSize: 15, fontWeight: '600' },
  calcBtn: { borderRadius: 32, height: 64, justifyContent: 'center', alignItems: 'center' },
  calcBtnText: { color: '#0B1020', fontSize: 16, fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 24 },
  modalCard: { borderRadius: 24, padding: 24, maxHeight: '90%' },
  modalTitle: { fontSize: 20, fontWeight: '700', marginBottom: 8 },
  label: { fontSize: 12, marginBottom: 6, marginTop: 12 },
  input: { height: 48, borderRadius: 12, borderWidth: 1, paddingHorizontal: 16, fontSize: 15 },
  helper: { fontSize: 10, marginTop: 6, lineHeight: 14 },
  previewCard: { borderRadius: 14, borderWidth: 1, padding: 14, marginTop: 16 },
  previewLabel: { fontSize: 11, marginBottom: 4 },
  previewValue: { fontSize: 17, fontWeight: '700' },
  previewSub: { fontSize: 10, marginTop: 2 },
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 20 },
  modalBtn: { flex: 1, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  modalBtnText: { fontSize: 15, fontWeight: '600' },
});
