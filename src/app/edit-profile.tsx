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
import { getInitials } from '@/utils/profile';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function EditProfile() {
  const colors = useTheme();
  const router = useRouter();
  const { currentUser, updateProfile } = useAuth();

  const [name, setName] = useState(currentUser?.name ?? '');
  const [email, setEmail] = useState(currentUser?.email ?? '');
  const [phone, setPhone] = useState(currentUser?.phone ?? '');
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
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

  const handleSave = async () => {
    setError('');
    setSaved(false);

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedPhone = phone.trim();

    if (!trimmedName) {
      setError('Full name is required and cannot be empty.');
      return;
    }
    if (trimmedEmail && !EMAIL_PATTERN.test(trimmedEmail)) {
      setError('Enter a valid email address, or leave the field blank.');
      return;
    }

    setSaving(true);
    try {
      await updateProfile({ name: trimmedName, email: trimmedEmail, phone: trimmedPhone });
      setName(trimmedName);
      setEmail(trimmedEmail);
      setPhone(trimmedPhone);
      setSaved(true);
      // Give the confirmation a moment to be seen, then return to the profile.
      backTimer.current = setTimeout(goBack, 900);
    } catch {
      setError('Could not save your profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <TouchableOpacity style={styles.backRow} onPress={goBack} accessibilityRole="button">
          <Ionicons name="chevron-back" size={20} color={colors.text} />
          <Text style={[styles.back, { color: colors.text }]}>Back</Text>
        </TouchableOpacity>
        <Text style={[styles.header, { color: colors.text }]}>Edit Profile</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Your details are saved on this device and shown across the app.
        </Text>

        <View style={styles.avatarSection}>
          <View style={[styles.avatar, { backgroundColor: colors.cyan }]}>
            <Text style={[styles.avatarText, { color: colors.background }]}>
              {getInitials(name || currentUser?.name || '')}
            </Text>
          </View>
          <Text style={[styles.avatarHint, { color: colors.textSecondary }]}>
            Your initials update with your name.
          </Text>
        </View>

        {error ? (
          <View style={[styles.banner, { backgroundColor: colors.backgroundElement, borderColor: '#FF6B6B' }]}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}
        {saved ? (
          <View style={[styles.banner, { backgroundColor: colors.backgroundElement, borderColor: colors.green }]}>
            <Text style={[styles.successText, { color: colors.green }]}>
              Profile updated. Returning to your profile…
            </Text>
          </View>
        ) : null}

        <Text style={[styles.label, { color: colors.textSecondary }]}>Full Name</Text>
        <View style={[styles.field, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}>
          <TextInput
            value={name}
            onChangeText={(v) => {
              setName(v);
              setSaved(false);
              setError('');
            }}
            placeholder="Enter your full name"
            placeholderTextColor={colors.textSecondary}
            style={[styles.input, { color: colors.text }]}
            accessibilityLabel="Full name"
          />
        </View>

        <Text style={[styles.label, { color: colors.textSecondary }]}>Email Address (optional)</Text>
        <View style={[styles.field, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}>
          <TextInput
            value={email}
            onChangeText={(v) => {
              setEmail(v);
              setSaved(false);
              setError('');
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholder="you@email.com"
            placeholderTextColor={colors.textSecondary}
            style={[styles.input, { color: colors.text }]}
            accessibilityLabel="Email address"
          />
        </View>

        <Text style={[styles.label, { color: colors.textSecondary }]}>Phone Number (optional)</Text>
        <View style={[styles.field, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}>
          <TextInput
            value={phone}
            onChangeText={(v) => {
              setPhone(v);
              setSaved(false);
              setError('');
            }}
            keyboardType="phone-pad"
            placeholder="+63 912 345 6789"
            placeholderTextColor={colors.textSecondary}
            style={[styles.input, { color: colors.text }]}
            accessibilityLabel="Phone number"
          />
        </View>

        <TouchableOpacity
          style={[styles.btn, { backgroundColor: colors.green, opacity: saving ? 0.7 : 1 }]}
          onPress={handleSave}
          disabled={saving}
          accessibilityRole="button"
        >
          {saving ? (
            <ActivityIndicator color="#0B1020" />
          ) : (
            <Text style={styles.btnText}>Save Changes</Text>
          )}
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
  subtitle: { fontSize: 13, lineHeight: 19, marginBottom: 20 },
  avatarSection: { alignItems: 'center', marginBottom: 20 },
  avatar: { width: 96, height: 96, borderRadius: 48, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  avatarText: { fontSize: 32, fontWeight: '700' },
  avatarHint: { fontSize: 11 },
  banner: { borderRadius: 12, borderWidth: 1, padding: 12, marginBottom: 8 },
  errorText: { color: '#FF6B6B', fontSize: 13, lineHeight: 18 },
  successText: { fontSize: 13, fontWeight: '600', lineHeight: 18 },
  label: { fontSize: 13, marginBottom: 8, marginTop: 12 },
  field: { height: 56, borderRadius: 16, borderWidth: 1, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16 },
  input: { flex: 1, fontSize: 15 },
  btn: { height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginTop: 24 },
  btnText: { color: '#0B1020', fontSize: 16, fontWeight: '700' },
  cancelBtn: { height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center', borderWidth: 1, marginTop: 12 },
  cancelText: { fontSize: 16, fontWeight: '600' },
});
