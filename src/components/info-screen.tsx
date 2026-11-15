import React, { ReactNode } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/use-theme';

export type InfoBlock = { heading: string; body: string };

type InfoScreenProps = {
  eyebrow?: string;
  title: string;
  intro?: string;
  icon?: React.ComponentProps<typeof Ionicons>['name'];
  blocks?: InfoBlock[];
  footer?: string;
  children?: ReactNode;
};

/**
 * Shared layout for the informational screens opened from Profile & Settings
 * (About, Help, Privacy, Terms, App Information, Account help).
 * Always renders a Back button so the user can never get stuck.
 */
export function InfoScreen({
  eyebrow,
  title,
  intro,
  icon,
  blocks = [],
  footer,
  children,
}: InfoScreenProps) {
  const colors = useTheme();
  const router = useRouter();

  const goBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/profile');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity
          style={styles.backRow}
          onPress={goBack}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          hitSlop={8}
        >
          <Ionicons name="chevron-back" size={20} color={colors.text} />
          <Text style={[styles.back, { color: colors.text }]}>Back</Text>
        </TouchableOpacity>

        {icon ? (
          <View style={[styles.iconRing, { backgroundColor: colors.backgroundElement }]}>
            <Ionicons name={icon} size={30} color={colors.cyan} />
          </View>
        ) : null}

        {eyebrow ? (
          <Text style={[styles.eyebrow, { color: colors.cyan }]}>{eyebrow}</Text>
        ) : null}
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
        {intro ? (
          <Text style={[styles.intro, { color: colors.textSecondary }]}>{intro}</Text>
        ) : null}

        {blocks.map((block) => (
          <View
            key={block.heading}
            style={[
              styles.card,
              { backgroundColor: colors.backgroundElement, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.cardHeading, { color: colors.text }]}>{block.heading}</Text>
            <Text style={[styles.cardBody, { color: colors.textSecondary }]}>{block.body}</Text>
          </View>
        ))}

        {children}

        {footer ? (
          <Text style={[styles.footer, { color: colors.textSecondary }]}>{footer}</Text>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 24, paddingTop: 60, paddingBottom: 64 },
  backRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 24, alignSelf: 'flex-start' },
  back: { fontSize: 16, fontWeight: '600' },
  iconRing: { width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  eyebrow: { fontSize: 11, fontWeight: '700', letterSpacing: 1.2, marginBottom: 6 },
  title: { fontSize: 28, fontWeight: '700', marginBottom: 10 },
  intro: { fontSize: 14, lineHeight: 21, marginBottom: 20 },
  card: { borderRadius: 18, borderWidth: 1, padding: 16, marginBottom: 12 },
  cardHeading: { fontSize: 14, fontWeight: '600', marginBottom: 6 },
  cardBody: { fontSize: 13, lineHeight: 20 },
  footer: { fontSize: 11, lineHeight: 17, marginTop: 12, fontStyle: 'italic' },
});
