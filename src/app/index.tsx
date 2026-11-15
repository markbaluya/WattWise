import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/use-theme';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';

export default function Index() {
  const colors = useTheme();
  const { isLoggedIn, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (isLoggedIn) {
      router.replace('/(tabs)/dashboard');
    } else {
      router.replace('/login');
    }
  }, [isLoading, isLoggedIn, router]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.logo, { color: colors.text }]}>WattWise</Text>
      <ActivityIndicator size="large" color={colors.cyan} style={{ marginTop: 24 }} />
      <Text style={[styles.sub, { color: colors.textSecondary }]}>Loading...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  logo: { fontSize: 32, fontWeight: '700' },
  sub: { marginTop: 16, fontSize: 14 },
});
