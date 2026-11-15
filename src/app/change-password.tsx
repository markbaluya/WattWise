import { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/use-theme';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';

export default function ChangePassword() {
  const colors = useTheme();
  const router = useRouter();
  const { changePassword } = useAuth();

  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);
  const backTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (backTimer.current) clearTimeout(backTimer.current);
    },
    []
  );

  const goBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/profile');
    }
  };

  const handleUpdate = async () => {
    setError('');
    setSuccess('');

    if (!currentPw || !newPw || !confirmPw) {
      setError('All fields are required.');
      return;
    }
    if (newPw.length < 8) {
      setError('New password must be at least 8 characters.');
      return;
    }
    if (newPw !== confirmPw) {
      setError('New passwords do not match.');
      return;
    }
    if (newPw === currentPw) {
      setError('Choose a new password that is different from the current one.');
      return;
    }

    setSaving(true);
    const result = await changePassword(currentPw, newPw);
    setSaving(false);

    if (!result.ok) {
      setError(result.error ?? 'Could not update the password.');
      return;
    }

    setCurrentPw('');
    setNewPw('');
    setConfirmPw('');
    setSuccess('Password updated. Use the new password the next time you log in.');
    backTimer.current = setTimeout(goBack, 1400);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <TouchableOpacity style={styles.backRow} onPress={goBack} accessibilityRole="button">
          <Ionicons name="chevron-back" size={20} color={colors.text} />
          <Text style={[styles.back, { color: colors.text }]}>Back</Text>
        </TouchableOpacity>
        <Text style={[styles.header, { color: colors.text }]}>Change Password</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Confirm your current password, then choose a new one. The change takes effect at your next login.
        </Text>

        {error ? (
          <View style={[styles.banner, { backgroundColor: colors.backgroundElement, borderColor: '#FF6B6B' }]}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}
        {success ? (
          <View style={[styles.banner, { backgroundColor: colors.backgroundElement, borderColor: colors.green }]}>
            <Text style={[styles.successText, { color: colors.green }]}>{success}</Text>
          </View>
        ) : null}

        <Text style={[styles.label, { color: colors.textSecondary }]}>Current Password</Text>
        <View style={[styles.field, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}>
          <TextInput
            value={currentPw}
            onChangeText={(v) => { setCurrentPw(v); setError(''); }}
            secureTextEntry={!showCurrent}
            placeholder="Enter current password"
            placeholderTextColor={colors.textSecondary}
            style={[styles.input, { color: colors.text }]}
            accessibilityLabel="Current password"
          />
          <TouchableOpacity onPress={() => setShowCurrent(!showCurrent)} accessibilityRole="button">
            <Text style={[styles.eye, { color: colors.textSecondary }]}>{showCurrent ? 'Hide' : 'Show'}</Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.label, { color: colors.textSecondary }]}>New Password</Text>
        <View style={[styles.field, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}>
          <TextInput
            value={newPw}
            onChangeText={(v) => { setNewPw(v); setError(''); }}
            secureTextEntry={!showNew}
            placeholder="At least 8 characters"
            placeholderTextColor={colors.textSecondary}
            style={[styles.input, { color: colors.text }]}
            accessibilityLabel="New password"
          />
          <TouchableOpacity onPress={() => setShowNew(!showNew)} accessibilityRole="button">
            <Text style={[styles.eye, { color: colors.textSecondary }]}>{showNew ? 'Hide' : 'Show'}</Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.label, { color: colors.textSecondary }]}>Confirm New Password</Text>
        <View style={[styles.field, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}>
          <TextInput
            value={confirmPw}
            onChangeText={(v) => { setConfirmPw(v); setError(''); }}
            secureTextEntry
            placeholder="Re-enter new password"
            placeholderTextColor={colors.textSecondary}
            style={[styles.input, { color: colors.text }]}
            accessibilityLabel="Confirm new password"
          />
        </View>

        <View style={[styles.reqCard, { backgroundColor: colors.backgroundElement }]}>
          <Text style={[styles.reqTitle, { color: colors.textSecondary }]}>Password requirements:</Text>
          <Text style={[styles.reqItem, { color: colors.textSecondary }]}>• At least 8 characters</Text>
          <Text style={[styles.reqItem, { color: colors.textSecondary }]}>• Different from the current password</Text>
          <Text style={[styles.reqItem, { color: colors.textSecondary }]}>• Both new fields must match</Text>
        </View>

        <TouchableOpacity
          style={[styles.btn, { backgroundColor: colors.green, opacity: saving ? 0.7 : 1 }]}
          onPress={handleUpdate}
          disabled={saving}
          accessibilityRole="button"
        >
          {saving ? <ActivityIndicator color="#0B1020" /> : <Text style={styles.btnText}>Update Password</Text>}
        </TouchableOpacity>
        <TouchableOpacity style={[styles.cancelBtn, { borderColor: colors.border }]} onPress={goBack} accessibilityRole="button">
          <Text style={[styles.cancelText, { color: colors.text }]}>Cancel</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 24, paddingTop: 60, paddingBottom: 100 },
  backRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 16, alignSelf: 'flex-start' },
  back: { fontSize: 16, fontWeight: '600' },
  header: { fontSize: 24, fontWeight: '700', marginBottom: 6 },
  subtitle: { fontSize: 13, lineHeight: 19, marginBottom: 12 },
  banner: { borderRadius: 12, borderWidth: 1, padding: 12, marginBottom: 8 },
  errorText: { color: '#FF6B6B', fontSize: 13, lineHeight: 18 },
  successText: { fontSize: 13, fontWeight: '600', lineHeight: 18 },
  label: { fontSize: 13, marginBottom: 8, marginTop: 12 },
  field: { height: 56, borderRadius: 16, borderWidth: 1, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16 },
  input: { flex: 1, fontSize: 15 },
  eye: { fontSize: 13, fontWeight: '600' },
  reqCard: { borderRadius: 16, padding: 16, marginTop: 16, marginBottom: 16 },
  reqTitle: { fontSize: 12, fontWeight: '600', marginBottom: 8 },
  reqItem: { fontSize: 12, marginBottom: 4 },
  btn: { height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginTop: 8 },
  btnText: { color: '#0B1020', fontSize: 16, fontWeight: '700' },
  cancelBtn: { height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center', borderWidth: 1, marginTop: 12 },
  cancelText: { fontSize: 16, fontWeight: '600' },
});
