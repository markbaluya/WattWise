import { Stack } from 'expo-router';
import { AuthProvider } from '@/contexts/AuthContext';
import { AppProvider } from '@/contexts/AppContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AuthGate } from '@/components/auth-gate';

export default function RootLayout() {
  return (
    <AuthProvider>
      <AppProvider>
        <ThemeProvider>
          <AuthGate>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="index" />
              <Stack.Screen name="login" />
              <Stack.Screen name="register" />
              <Stack.Screen name="forgot-password" />
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="appliance-selector" />
              <Stack.Screen name="bill-breakdown" />
              <Stack.Screen name="chatbot" />
              <Stack.Screen name="bill-history-detail" />
              <Stack.Screen name="edit-profile" />
              <Stack.Screen name="change-password" />
              <Stack.Screen name="electricity-rate" />
              <Stack.Screen name="monthly-budget" />
              <Stack.Screen name="calculation-period" />
              <Stack.Screen name="about" />
              <Stack.Screen name="help-support" />
              <Stack.Screen name="privacy-policy" />
              <Stack.Screen name="terms" />
              <Stack.Screen name="app-info" />
            </Stack>
          </AuthGate>
        </ThemeProvider>
      </AppProvider>
    </AuthProvider>
  );
}
