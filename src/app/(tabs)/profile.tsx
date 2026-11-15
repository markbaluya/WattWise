import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/use-theme';
import { useThemeContext } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';
import { useApp } from '@/contexts/AppContext';
import { getInitials } from '@/utils/profile';

const APPEARANCE_OPTIONS = [
  { pref: 'dark', label: 'Dark', icon: 'moon-outline' },
  { pref: 'light', label: 'Light', icon: 'sunny-outline' },
  { pref: 'system', label: 'System', icon: 'phone-portrait-outline' },
] as const;

const OTHER_ITEMS = [
  { label: 'About WattWise', icon: 'information-circle-outline', route: '/about' },
  { label: 'Help & Support', icon: 'help-buoy-outline', route: '/help-support' },
  { label: 'Privacy Policy', icon: 'shield-checkmark-outline', route: '/privacy-policy' },
  { label: 'Terms & Conditions', icon: 'document-text-outline', route: '/terms' },
  { label: 'App Information', icon: 'phone-portrait-outline', route: '/app-info' },
] as const;

export default function Profile() {
  const colors = useTheme();
  const { preference, setPreference } = useThemeContext();
  const { currentUser, logout } = useAuth();
  const { settings, updateSettings } = useApp();
  const router = useRouter();

  const name = currentUser?.name ?? 'WattWise user';
  const email = currentUser?.email ?? '';
  const phone = currentUser?.phone ?? '';

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={[styles.header, { color: colors.text }]}>Profile and Settings</Text>

        <View style={[styles.profileCard, { backgroundColor: colors.backgroundElement }]}>
          <View style={[styles.avatar, { backgroundColor: colors.cyan }]}>
            <Text style={[styles.avatarText, { color: colors.background }]}>{getInitials(name)}</Text>
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={[styles.name, { color: colors.text }]}>{name}</Text>
            <Text style={[styles.email, { color: colors.textSecondary }]}>
              {email || 'No email saved'}
            </Text>
            {phone ? (
              <Text style={[styles.email, { color: colors.textSecondary }]}>{phone}</Text>
            ) : null}
            <View style={[styles.roleBadge, { backgroundColor: colors.backgroundSelected }]}>
              <Ionicons name="shield-checkmark" size={11} color={colors.cyan} />
              <Text style={[styles.roleText, { color: colors.cyan }]}>
                Administrator · @{currentUser?.username ?? 'admin'}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={[styles.editBtn, { borderColor: colors.cyan }]}
            onPress={() => router.push('/edit-profile')}
            accessibilityRole="button"
            accessibilityLabel="Edit profile"
          >
            <Text style={[styles.editBtnText, { color: colors.cyan }]}>Edit</Text>
          </TouchableOpacity>
        </View>

        {/* ACCOUNT */}
        <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>ACCOUNT</Text>
        <View style={[styles.card, { backgroundColor: colors.backgroundElement }]}>
          <TouchableOpacity style={styles.row} onPress={() => router.push('/edit-profile')} accessibilityRole="button">
            <Ionicons name="person-outline" size={19} color={colors.cyan} style={styles.rowIcon} />
            <Text style={[styles.rowLabel, { color: colors.text }]}>Edit Profile</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
          </TouchableOpacity>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <TouchableOpacity style={styles.row} onPress={() => router.push('/change-password')} accessibilityRole="button">
            <Ionicons name="lock-closed-outline" size={19} color={colors.cyan} style={styles.rowIcon} />
            <Text style={[styles.rowLabel, { color: colors.text }]}>Change Password</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* APPEARANCE */}
        <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>APPEARANCE</Text>
        <View style={[styles.card, { backgroundColor: colors.backgroundElement }]}>
          <View style={styles.appearanceRow}>
            {APPEARANCE_OPTIONS.map((opt) => {
              const isSelected = preference === opt.pref;
              return (
                <TouchableOpacity
                  key={opt.pref}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isSelected }}
                  style={[
                    styles.appearanceCard,
                    {
                      backgroundColor: colors.background,
                      borderColor: isSelected ? colors.cyan : colors.border,
                      borderWidth: isSelected ? 2 : 1,
                    },
                  ]}
                  onPress={() => setPreference(opt.pref)}
                >
                  <Ionicons name={opt.icon} size={22} color={isSelected ? colors.cyan : colors.textSecondary} />
                  <Text style={[styles.appearanceLabel, { color: colors.text }]}>{opt.label}</Text>
                  {isSelected && <View style={[styles.selectedDot, { backgroundColor: colors.cyan }]} />}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* ELECTRICITY SETTINGS */}
        <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>ELECTRICITY SETTINGS</Text>
        <View style={[styles.card, { backgroundColor: colors.backgroundElement }]}>
          <TouchableOpacity style={styles.row} onPress={() => router.push('/electricity-rate')} accessibilityRole="button">
            <Ionicons name="flash-outline" size={19} color={colors.cyan} style={styles.rowIcon} />
            <Text style={[styles.rowLabel, { color: colors.text }]}>Electricity Rate</Text>
            <Text style={[styles.rowValue, { color: colors.cyan }]}>₱{settings.electricityRate}/kWh</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
          </TouchableOpacity>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <TouchableOpacity style={styles.row} onPress={() => router.push('/monthly-budget')} accessibilityRole="button">
            <Ionicons name="wallet-outline" size={19} color={colors.cyan} style={styles.rowIcon} />
            <Text style={[styles.rowLabel, { color: colors.text }]}>Monthly Budget</Text>
            <Text style={[styles.rowValue, { color: colors.cyan }]}>₱{settings.monthlyBudget}</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
          </TouchableOpacity>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <TouchableOpacity style={styles.row} onPress={() => router.push('/calculation-period')} accessibilityRole="button">
            <Ionicons name="calendar-outline" size={19} color={colors.cyan} style={styles.rowIcon} />
            <Text style={[styles.rowLabel, { color: colors.text }]}>Calculation Period</Text>
            <Text style={[styles.rowValue, { color: colors.cyan }]}>{settings.calcPeriod} days</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* NOTIFICATIONS */}
        <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>NOTIFICATIONS</Text>
        <View style={[styles.card, { backgroundColor: colors.backgroundElement }]}>
          <View style={styles.row}>
            <Ionicons name="notifications-outline" size={19} color={colors.cyan} style={styles.rowIcon} />
            <Text style={[styles.rowLabel, { color: colors.text }]}>Bill Notifications</Text>
            <Switch
              value={settings.billNotifications}
              onValueChange={(v) => updateSettings({ billNotifications: v })}
              trackColor={{ false: colors.border, true: colors.cyan }}
            />
          </View>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <View style={styles.row}>
            <Ionicons name="leaf-outline" size={19} color={colors.cyan} style={styles.rowIcon} />
            <Text style={[styles.rowLabel, { color: colors.text }]}>Energy-Saving Reminders</Text>
            <Switch
              value={settings.energyReminders}
              onValueChange={(v) => updateSettings({ energyReminders: v })}
              trackColor={{ false: colors.border, true: colors.cyan }}
            />
          </View>
        </View>

        {/* OTHER */}
        <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>OTHER</Text>
        <View style={[styles.card, { backgroundColor: colors.backgroundElement }]}>
          {OTHER_ITEMS.map((item) => (
            <View key={item.label}>
              <TouchableOpacity
                style={styles.row}
                onPress={() => router.push(item.route)}
                accessibilityRole="button"
                accessibilityLabel={item.label}
              >
                <Ionicons name={item.icon} size={19} color={colors.cyan} style={styles.rowIcon} />
                <Text style={[styles.rowLabel, { color: colors.text }]}>{item.label}</Text>
                <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
              </TouchableOpacity>
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
            </View>
          ))}
          <TouchableOpacity style={styles.row} onPress={handleLogout} accessibilityRole="button">
            <Ionicons name="log-out-outline" size={19} color="#FF6B6B" style={styles.rowIcon} />
            <Text style={[styles.rowLabel, { color: '#FF6B6B' }]}>Logout</Text>
            <Ionicons name="chevron-forward" size={18} color="#FF6B6B" />
          </TouchableOpacity>
        </View>

        <Text style={[styles.version, { color: colors.textSecondary }]}>WattWise 1.0.0</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 24, paddingTop: 60, paddingBottom: 110 },
  header: { fontSize: 24, fontWeight: '700', marginBottom: 16 },
  profileCard: { flexDirection: 'row', alignItems: 'center', borderRadius: 20, padding: 16, marginBottom: 20 },
  avatar: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 20, fontWeight: '700' },
  name: { fontSize: 17, fontWeight: '700' },
  email: { fontSize: 12, marginTop: 2 },
  roleBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start', borderRadius: 8, paddingHorizontal: 6, paddingVertical: 3, marginTop: 6 },
  roleText: { fontSize: 10, fontWeight: '600' },
  editBtn: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 14, borderWidth: 1 },
  editBtnText: { fontSize: 12, fontWeight: '600' },
  sectionLabel: { fontSize: 11, fontWeight: '600', marginBottom: 8, letterSpacing: 0.5 },
  card: { borderRadius: 20, marginBottom: 20, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16, minHeight: 50 },
  rowIcon: { marginRight: 12 },
  rowLabel: { flex: 1, fontSize: 15 },
  rowValue: { fontSize: 13, marginRight: 6 },
  divider: { height: 1, marginHorizontal: 16 },
  appearanceRow: { flexDirection: 'row', gap: 8, padding: 12 },
  appearanceCard: { flex: 1, borderRadius: 16, paddingVertical: 12, paddingHorizontal: 8, alignItems: 'center', gap: 4 },
  appearanceLabel: { fontSize: 11, fontWeight: '600', textAlign: 'center' },
  selectedDot: { width: 8, height: 8, borderRadius: 4, marginTop: 2 },
  version: { fontSize: 11, textAlign: 'center', marginTop: 4 },
});
