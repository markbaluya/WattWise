import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '@/hooks/use-theme';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';

export default function Login() {
  const colors = useTheme();
  const router = useRouter();
  const { login, setup, setupRequired, isLoading } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [setupError, setSetupError] = useState('');
  const [setupSuccess, setSetupSuccess] = useState('');
  const [settingUp, setSettingUp] = useState(false);

  const handleLogin = async () => {
    setError('');
    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password.');
      return;
    }
    setLoading(true);
    const result = await login(username.trim(), password);
    setLoading(false);
    if (result.ok) {
      router.replace('/(tabs)/dashboard');
    } else {
      setError(result.error || 'Invalid username or password.');
    }
  };

  const handleSetup = async () => {
    setSetupError('');
    setSetupSuccess('');
    if (newPw.length < 8) {
      setSetupError('Password must be at least 8 characters.');
      return;
    }
    if (newPw !== confirmPw) {
      setSetupError('Passwords do not match.');
      return;
    }
    setSettingUp(true);
    const result = await setup(newPw);
    setSettingUp(false);
    if (!result.ok) {
      setSetupError(result.error || 'Could not create the password.');
      return;
    }
    setNewPw('');
    setConfirmPw('');
    setSetupSuccess('Administrator password created. Please sign in.');
  };

  if (isLoading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.cyan} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={[styles.container, { backgroundColor: colors.background }]}>
          <Text style={[styles.logo, { color: colors.text }]}>WattWise</Text>
          <Text style={[styles.tagline, { color: colors.cyan }]}>Track Smart. Save Smart.</Text>

          {setupRequired ? (
            <>
              <Text style={[styles.title, { color: colors.text }]}>Set Up Administrator</Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                No administrator password exists yet. Create one to secure this device. Only a
                secure hash is stored on the server — never the password itself.
              </Text>

              {setupError ? (
                <View style={[styles.errorBox, { backgroundColor: colors.backgroundElement, borderColor: '#FF6B6B' }]}>
                  <Text style={styles.errorText}>{setupError}</Text>
                </View>
              ) : null}
              {setupSuccess ? (
                <View style={[styles.errorBox, { backgroundColor: colors.backgroundElement, borderColor: colors.green }]}>
                  <Text style={[styles.successText, { color: colors.green }]}>{setupSuccess}</Text>
                </View>
              ) : null}

              <Text style={[styles.label, { color: colors.textSecondary }]}>New Password</Text>
              <View style={[styles.field, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}>
                <TextInput
                  value={newPw}
                  onChangeText={(v) => {
                    setNewPw(v);
                    setSetupError('');
                  }}
                  placeholder="At least 8 characters"
                  placeholderTextColor={colors.textSecondary}
                  secureTextEntry={!showNew}
                  autoCapitalize="none"
                  style={[styles.input, { color: colors.text }]}
                />
                <TouchableOpacity onPress={() => setShowNew(!showNew)}>
                  <Text style={[styles.eye, { color: colors.textSecondary }]}>{showNew ? 'Hide' : 'Show'}</Text>
                </TouchableOpacity>
              </View>

              <Text style={[styles.label, { color: colors.textSecondary }]}>Confirm Password</Text>
              <View style={[styles.field, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}>
                <TextInput
                  value={confirmPw}
                  onChangeText={(v) => {
                    setConfirmPw(v);
                    setSetupError('');
                  }}
                  placeholder="Re-enter password"
                  placeholderTextColor={colors.textSecondary}
                  secureTextEntry
                  autoCapitalize="none"
                  style={[styles.input, { color: colors.text }]}
                />
              </View>

              <TouchableOpacity
                style={[styles.btn, { backgroundColor: colors.green, opacity: settingUp ? 0.6 : 1 }]}
                onPress={handleSetup}
                disabled={settingUp}
              >
                <Text style={styles.btnText}>{settingUp ? 'Creating...' : 'Create Password'}</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={[styles.title, { color: colors.text }]}>Welcome Back</Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                Sign in to access your WattWise dashboard.
              </Text>

              {error ? (
                <View style={[styles.errorBox, { backgroundColor: colors.backgroundElement, borderColor: '#FF6B6B' }]}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              <Text style={[styles.label, { color: colors.textSecondary }]}>Username</Text>
              <View style={[styles.field, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}>
                <TextInput
                  value={username}
                  onChangeText={setUsername}
                  placeholder="Enter username"
                  placeholderTextColor={colors.textSecondary}
                  autoCapitalize="none"
                  style={[styles.input, { color: colors.text }]}
                />
              </View>

              <Text style={[styles.label, { color: colors.textSecondary }]}>Password</Text>
              <View style={[styles.field, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}>
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="••••••••"
                  placeholderTextColor={colors.textSecondary}
                  secureTextEntry={!showPw}
                  style={[styles.input, { color: colors.text }]}
                />
                <TouchableOpacity onPress={() => setShowPw(!showPw)}>
                  <Text style={[styles.eye, { color: colors.textSecondary }]}>{showPw ? 'Hide' : 'Show'}</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[styles.btn, { backgroundColor: colors.green, opacity: loading ? 0.6 : 1 }]}
                onPress={handleLogin}
                disabled={loading}
              >
                <Text style={styles.btnText}>{loading ? 'Signing in...' : 'Log In'}</Text>
              </TouchableOpacity>

              <View style={[styles.footer]}>
                <Text style={[styles.footerText, { color: colors.textSecondary }]}>
                  Single administrator account.{' '}
                </Text>
                <TouchableOpacity onPress={() => router.push('/register')}>
                  <Text style={[styles.link, { color: colors.cyan }]}>Account help</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 1 },
  container: { flex: 1, justifyContent: 'center', padding: 24 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  logo: { fontSize: 24, fontWeight: '700', marginBottom: 4 },
  tagline: { fontSize: 13, marginBottom: 24 },
  title: { fontSize: 30, fontWeight: '700', marginBottom: 8 },
  subtitle: { fontSize: 14, marginBottom: 24, lineHeight: 20 },
  label: { fontSize: 13, marginBottom: 8, marginTop: 12 },
  field: { height: 56, borderRadius: 16, borderWidth: 1, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16 },
  input: { flex: 1, fontSize: 15 },
  eye: { fontSize: 13, fontWeight: '600' },
  btn: { height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', marginTop: 24 },
  btnText: { color: '#0B1020', fontSize: 16, fontWeight: '700' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  footerText: { fontSize: 14 },
  link: { fontSize: 14, fontWeight: '600' },
  errorBox: { padding: 12, borderRadius: 12, borderWidth: 1, marginBottom: 12 },
  errorText: { color: '#FF6B6B', fontSize: 13 },
  successText: { fontSize: 13, fontWeight: '600' },
});