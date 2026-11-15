import { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, useThemeMode } from '@/hooks/use-theme';
import { useRouter } from 'expo-router';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import { API_BASE_URL } from '@/config/api';
import { MarkdownText } from '@/components/markdown-text';
import { GradientBorder, TypingDots } from '@/components/gradient';
import { getDatasetInformation, getDailyConsumption } from '@/services/datasetService';
import {
  Conversation,
  StoredMessage,
  createConversationId,
  formatConversationTime,
  lastMessagePreview,
  loadConversations,
  makeConversationTitle,
  saveConversations,
  sortConversations,
} from '@/services/chatStorage';
import {
  AI_ACCENT_GRADIENT,
  AI_MESSAGE_GRADIENT_DARK,
  AI_MESSAGE_GRADIENT_LIGHT,
  BRAND_GRADIENT,
  BRAND_GRADIENT_LOCATIONS,
  CHAT_BACKGROUND_DARK,
  CHAT_BACKGROUND_LIGHT,
  USER_MESSAGE_GRADIENT,
} from '@/constants/gradient';

type Msg = StoredMessage;

const AI_ACCENT_LIGHT = '#A78BFA';

function fallbackResponse(input: string, appliances: any[], rate: number): string {
  const q = input.toLowerCase();
  if (q.includes('reduce') || q.includes('save') || q.includes('tip')) {
    return '[Fallback] To reduce your bill: 1) Limit AC usage to 8h/day. 2) Turn off unused appliances. 3) Use energy-efficient units. 4) Avoid standby power. Your aircon is likely your biggest consumer.';
  }
  if (q.includes('most') || q.includes('highest') || q.includes('consum')) {
    const sorted = [...appliances].sort((a, b) => b.watts - a.watts);
    return `[Fallback] Your highest-wattage appliance is ${sorted[0]?.name} at ${sorted[0]?.watts}W. Consider reducing its usage hours to save energy.`;
  }
  if (q.includes('air conditioner') || q.includes('aircon') || q.includes('ac')) {
    const ac = appliances.find((a) => a.name.toLowerCase().includes('air'));
    if (ac) {
      const kwh = (ac.watts * ac.quantity * ac.hours * ac.days) / 1000;
      const cost = kwh * rate;
      return `[Fallback] Your air conditioner uses ${ac.watts}W. At ${ac.hours}h/day for ${ac.days} days, that's ${kwh.toFixed(1)} kWh, costing about ₱${cost.toFixed(0)}/month.`;
    }
    return '[Fallback] Add an air conditioner to your appliances to get its cost estimate.';
  }
  if (q.includes('bill') || q.includes('total') || q.includes('cost')) {
    const total = appliances.reduce((s, a) => s + (a.watts * a.quantity * a.hours * a.days) / 1000 * rate, 0);
    return `[Fallback] Your estimated monthly bill is ₱${total.toFixed(0)} at ₱${rate}/kWh. Add or edit appliances to refine this.`;
  }
  if (q.includes('breakdown') || q.includes('explain')) {
    return '[Fallback] Bill breakdown shows each appliance\'s wattage × quantity × hours × days ÷ 1000 = monthly kWh, then × rate = cost. Check the Bill Breakdown screen for details.';
  }
  return '[Fallback] I can help with electricity consumption, appliance wattage, estimated bills, and energy-saving tips. Try asking about your bill or a specific appliance.';
}

const SUGGESTED = [
  'How much is my electricity bill?',
  'Which appliance consumes the most?',
  'How much does my air conditioner cost?',
  'Explain my bill breakdown.',
  'Give me energy-saving tips.',
];

function now() {
  const d = new Date();
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function Chatbot() {
  const colors = useTheme();
  const { mode } = useThemeMode();
  const router = useRouter();
  const { appliances, settings } = useApp();
  const { currentUser, getAuthHeader } = useAuth();
  const username = currentUser?.username ?? null;

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [menuTarget, setMenuTarget] = useState<Conversation | null>(null);
  const [renaming, setRenaming] = useState<Conversation | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const scrollRef = useRef<any>(null);

  const aiBubble = mode === 'dark' ? AI_MESSAGE_GRADIENT_DARK : AI_MESSAGE_GRADIENT_LIGHT;
  const chatBackground = mode === 'dark' ? CHAT_BACKGROUND_DARK : CHAT_BACKGROUND_LIGHT;

  // The conversation currently on screen (if any). Messages are derived from the
  // saved conversation so opening one restores its full history in order.
  const activeConversation = conversations.find((c) => c.id === activeId) ?? null;
  const messages: Msg[] = activeConversation?.messages ?? [];

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const loaded = await loadConversations(username ?? '');
      if (cancelled) return;
      setConversations(loaded);
    })();
    return () => {
      cancelled = true;
    };
  }, [username]);

  const persist = async (list: Conversation[]) => {
    if (!username) return;
    await saveConversations(username, list);
  };

  const scrollToEnd = () => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const send = async (text: string) => {
    if (!text.trim() || loading) return;
    const trimmed = text.trim();
    const userMsg: Msg = { role: 'user', text: trimmed, time: now() };
    // History sent to the model is everything BEFORE this new user message;
    // the backend appends the current message itself.
    const history = messages.map((m) => ({ role: m.role, text: m.text }));

    // Persist the user message first (creates a conversation if this is the
    // first message of a new chat, so it appears in Recent immediately).
    const ts = new Date().toISOString();
    let convId = activeId;
    let base: Conversation[];
    if (convId) {
      base = conversations.map((c) =>
        c.id === convId ? { ...c, updatedAt: ts, messages: [...c.messages, userMsg] } : c
      );
    } else {
      convId = createConversationId();
      base = [
        {
          id: convId,
          title: makeConversationTitle(trimmed),
          createdAt: ts,
          updatedAt: ts,
          messages: [userMsg],
        },
        ...conversations,
      ];
    }
    const withUser = sortConversations(base);
    setConversations(withUser);
    setActiveId(convId);
    setInput('');
    setError(null);
    setLoading(true);
    void persist(withUser);

    const datasetInfo = getDatasetInformation();
    const dailyData = getDailyConsumption();
    const appData = {
      appliances: appliances.map((a) => ({
        name: a.name,
        watts: a.watts,
        quantity: a.quantity,
        hours: a.hours,
        days: a.days,
      })),
      electricityRate: settings.electricityRate,
      dataset: {
        name: datasetInfo.name,
        household: datasetInfo.household,
        appliances: datasetInfo.appliances,
        samplePeriod: datasetInfo.samplePeriod,
        totalReadings: datasetInfo.totalReadings,
        samplingInterval: datasetInfo.samplingInterval,
        dailyConsumption: dailyData.slice(0, 3).map((d) => ({
          date: d.date,
          kwh: d.aggregateKwh,
          appliances: d.appliances.map((a) => ({ name: a.name, kwh: a.kwh })),
        })),
        note: datasetInfo.note,
      },
    };

    const appendAi = async (reply: string) => {
      const aiMsg: Msg = { role: 'ai', text: reply, time: now() };
      const withAi = sortConversations(
        withUser.map((c) =>
          c.id === convId
            ? { ...c, updatedAt: new Date().toISOString(), messages: [...c.messages, aiMsg] }
            : c
        )
      );
      setConversations(withAi);
      void persist(withAi);
    };

    try {
      const authHeader = await getAuthHeader();
      const res = await fetch(`${API_BASE_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader },
        body: JSON.stringify({ message: trimmed, history, appData }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Server error (${res.status})`);
      }
      const data = await res.json();
      await appendAi(data.reply);
    } catch (err: any) {
      console.warn('Gemini backend unavailable, using fallback:', err.message);
      setError('Could not reach AI service. Showing fallback response.');
      await appendAi(fallbackResponse(trimmed, appliances, settings.electricityRate));
    } finally {
      setLoading(false);
      scrollToEnd();
    }
  };

  const openConversation = (c: Conversation) => {
    setActiveId(c.id);
    setError(null);
    scrollToEnd();
  };

  const newChat = () => {
    setActiveId(null);
    setError(null);
    setInput('');
  };

  const startRename = () => {
    if (!menuTarget) return;
    setRenaming(menuTarget);
    setRenameValue(menuTarget.title);
  };

  const confirmRename = () => {
    if (!renaming) return;
    const title = renameValue.trim() || renaming.title;
    const next = conversations.map((c) => (c.id === renaming.id ? { ...c, title } : c));
    setConversations(next);
    void persist(next);
    closeMenus();
  };

  const confirmDelete = () => {
    const target = menuTarget;
    if (!target) return;
    Alert.alert('Delete conversation', `Delete "${target.title}"? This cannot be undone.`, [
      { text: 'Cancel', style: 'cancel', onPress: () => setMenuTarget(null) },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          const next = conversations.filter((c) => c.id !== target.id);
          setConversations(next);
          void persist(next);
          if (activeId === target.id) setActiveId(null);
          setMenuTarget(null);
        },
      },
    ]);
  };

  const closeMenus = () => {
    setMenuTarget(null);
    setRenaming(null);
    setRenameValue('');
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      <LinearGradient
        colors={chatBackground}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.35, y: 1 }}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />

      <View style={styles.headerWrap}>
        <LinearGradient
          colors={BRAND_GRADIENT}
          locations={BRAND_GRADIENT_LOCATIONS}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            hitSlop={8}
          >
            <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.avatarGlow}>
            <LinearGradient
              colors={BRAND_GRADIENT}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.avatar}
            >
              <Ionicons name="sparkles" size={18} color="#FFFFFF" />
            </LinearGradient>
          </View>
          <View style={styles.headerText}>
            <Text style={styles.title}>WattWise AI Assistant</Text>
            <View style={styles.statusRow}>
              <View style={styles.statusDot} />
              <Text style={styles.status}>Online</Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={newChat}
            style={styles.newChatBtn}
            accessibilityRole="button"
            accessibilityLabel="Start a new chat"
          >
            <Ionicons name="add" size={16} color="#FFFFFF" />
            <Text style={styles.newChatText}>New Chat</Text>
          </TouchableOpacity>
        </LinearGradient>
      </View>

      <ScrollView
        ref={scrollRef}
        style={styles.scrollContainer}
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        {messages.length === 0 && (
          <>
            <View style={[styles.welcomeCard, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}>
              <LinearGradient
                colors={BRAND_GRADIENT}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.welcomeAvatar}
              >
                <Ionicons name="sparkles" size={22} color="#FFFFFF" />
              </LinearGradient>
              <Text style={[styles.greeting, { color: colors.text }]}>Hi! I&apos;m WattWise AI.</Text>
              <Text style={[styles.desc, { color: colors.textSecondary }]}>
                I can help you calculate electricity costs, understand your appliances, and discover ways to save energy.
              </Text>
            </View>
            <Text style={[styles.tryLabel, { color: colors.textSecondary }]}>TRY ASKING</Text>
            {SUGGESTED.map((q, i) => (
              <TouchableOpacity
                key={i}
                style={[styles.suggested, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}
                onPress={() => send(q)}
              >
                <Text style={[styles.suggestedText, { color: colors.text }]}>{q}</Text>
                <Ionicons name="chevron-forward" size={18} color={AI_ACCENT_LIGHT} />
              </TouchableOpacity>
            ))}

            {conversations.length > 0 && (
              <View style={styles.recentWrap}>
                <Text style={[styles.tryLabel, { color: colors.textSecondary, marginTop: 8 }]}>RECENT</Text>
                {conversations.map((c) => (
                  <TouchableOpacity
                    key={c.id}
                    style={[styles.recentCard, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}
                    onPress={() => openConversation(c)}
                    activeOpacity={0.85}
                  >
                    <View style={styles.recentMain}>
                      <Text style={[styles.recentTitle, { color: colors.text }]} numberOfLines={1}>
                        {c.title}
                      </Text>
                      <Text style={[styles.recentPreview, { color: colors.textSecondary }]} numberOfLines={1}>
                        {lastMessagePreview(c)}
                      </Text>
                      <Text style={[styles.recentTime, { color: colors.textSecondary }]}>
                        {formatConversationTime(c.updatedAt)}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => setMenuTarget(c)}
                      style={styles.recentMenu}
                      hitSlop={8}
                      accessibilityRole="button"
                      accessibilityLabel={`Options for ${c.title}`}
                    >
                      <Ionicons name="ellipsis-horizontal" size={18} color={colors.textSecondary} />
                    </TouchableOpacity>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </>
        )}
        {messages.map((m, i) => (
          <View key={i} style={[styles.msgRow, m.role === 'user' ? styles.userRow : styles.aiRow]}>
            {m.role === 'ai' && (
              <LinearGradient colors={BRAND_GRADIENT} style={styles.msgAvatar}>
                <Ionicons name="sparkles" size={12} color="#FFFFFF" />
              </LinearGradient>
            )}
            {m.role === 'user' ? (
              <LinearGradient
                colors={USER_MESSAGE_GRADIENT}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.bubble, styles.userBubble]}
              >
                <Text style={[styles.bubbleText, { color: '#FFFFFF' }]}>{m.text}</Text>
                <Text style={[styles.timeText, { color: 'rgba(255,255,255,0.8)' }]}>{m.time}</Text>
              </LinearGradient>
            ) : (
              <LinearGradient
                colors={aiBubble}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.bubble, styles.aiBubble]}
              >
                <LinearGradient colors={AI_ACCENT_GRADIENT} style={styles.aiAccentBar} />
                <MarkdownText content={m.text} color={colors.text} secondaryColor={colors.textSecondary} cyanColor={colors.cyan} />
                <Text style={[styles.timeText, { color: colors.textSecondary }]}>{m.time}</Text>
              </LinearGradient>
            )}
          </View>
        ))}
        {loading && (
          <View style={[styles.msgRow, styles.aiRow]}>
            <LinearGradient colors={BRAND_GRADIENT} style={styles.msgAvatar}>
              <Ionicons name="sparkles" size={12} color="#FFFFFF" />
            </LinearGradient>
            <LinearGradient
              colors={aiBubble}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.bubble, styles.aiBubble]}
            >
              <LinearGradient colors={AI_ACCENT_GRADIENT} style={styles.aiAccentBar} />
              <TypingDots />
            </LinearGradient>
          </View>
        )}
        {error && (
          <View style={[styles.errorBox, { backgroundColor: colors.backgroundElement, borderColor: '#FF6B6B' }]}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
      </ScrollView>

      <View style={[styles.inputBar, { backgroundColor: colors.background }]}>
        <GradientBorder
          colors={BRAND_GRADIENT}
          radius={26}
          borderWidth={1.5}
          innerColor={colors.backgroundElement}
          style={styles.inputField}
        >
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Ask WattWise anything..."
            placeholderTextColor={colors.textSecondary}
            style={[styles.input, { color: colors.text }]}
            cursorColor={colors.cyan}
            selectionColor={colors.cyan}
            onSubmitEditing={() => send(input)}
          />
        </GradientBorder>
        <View style={styles.sendGlow}>
          <TouchableOpacity
            onPress={() => send(input)}
            disabled={loading}
            accessibilityRole="button"
            accessibilityLabel="Send message"
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={BRAND_GRADIENT}
              locations={BRAND_GRADIENT_LOCATIONS}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.sendBtn}
            >
              <Ionicons name="arrow-up" size={20} color="#FFFFFF" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>

      <Modal
        visible={!!menuTarget || !!renaming}
        transparent
        animationType="fade"
        onRequestClose={closeMenus}
      >
        <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={closeMenus}>
          <TouchableOpacity
            activeOpacity={1}
            style={[styles.sheet, { backgroundColor: colors.backgroundElement }]}
          >
            {renaming ? (
              <View>
                <Text style={[styles.sheetTitle, { color: colors.text }]}>Rename conversation</Text>
                <TextInput
                  value={renameValue}
                  onChangeText={setRenameValue}
                  placeholder="Conversation title"
                  placeholderTextColor={colors.textSecondary}
                  style={[
                    styles.renameInput,
                    { color: colors.text, borderColor: colors.border, backgroundColor: colors.background },
                  ]}
                  cursorColor={colors.cyan}
                  selectionColor={colors.cyan}
                  autoFocus
                  onSubmitEditing={confirmRename}
                />
                <View style={styles.sheetActions}>
                  <TouchableOpacity
                    style={[styles.sheetBtn, { backgroundColor: colors.background }]}
                    onPress={closeMenus}
                  >
                    <Text style={[styles.sheetBtnText, { color: colors.textSecondary }]}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.sheetBtn, styles.sheetBtnPrimary]}
                    onPress={confirmRename}
                  >
                    <Text style={[styles.sheetBtnText, { color: '#0B1020' }]}>Save</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View>
                <Text style={[styles.sheetTitle, { color: colors.text }]} numberOfLines={1}>
                  {menuTarget?.title}
                </Text>
                <TouchableOpacity style={styles.menuRow} onPress={startRename}>
                  <Ionicons name="create-outline" size={20} color={colors.cyan} />
                  <Text style={[styles.menuRowText, { color: colors.text }]}>Rename</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.menuRow} onPress={confirmDelete}>
                  <Ionicons name="trash-outline" size={20} color="#FF6B6B" />
                  <Text style={[styles.menuRowText, { color: '#FF6B6B' }]}>Delete</Text>
                </TouchableOpacity>
              </View>
            )}
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerWrap: {
    paddingHorizontal: 16,
    paddingTop: 40,
    shadowColor: '#00C5E8',
    shadowOpacity: 0.35,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 10,
    zIndex: 5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 24,
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 10,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.16)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarGlow: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.22)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#00C5E8',
    shadowOpacity: 0.8,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
    elevation: 8,
  },
  avatar: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  headerText: { flex: 1 },
  title: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#8AF52E',
    shadowColor: '#8AF52E',
    shadowOpacity: 0.9,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
  },
  status: { color: 'rgba(255,255,255,0.85)', fontSize: 12 },
  newChatBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  newChatText: { color: '#FFFFFF', fontSize: 12, fontWeight: '600' },
  scrollContainer: { flex: 1 },
  scroll: { padding: 20, paddingBottom: 20 },
  welcomeCard: { borderRadius: 24, borderWidth: 1, padding: 24, marginBottom: 20, alignItems: 'center' },
  welcomeAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#7657F5',
    shadowOpacity: 0.5,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 10,
  },
  greeting: { fontSize: 22, fontWeight: '700', marginBottom: 8 },
  desc: { fontSize: 14, lineHeight: 20, textAlign: 'center' },
  tryLabel: { fontSize: 11, fontWeight: '600', marginBottom: 12, letterSpacing: 0.5 },
  suggested: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
    minHeight: 52,
  },
  suggestedText: { flex: 1, fontSize: 14, marginRight: 8 },
  recentWrap: { marginBottom: 8 },
  recentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    marginBottom: 10,
  },
  recentMain: { flex: 1, marginRight: 8 },
  recentTitle: { fontSize: 14, fontWeight: '600', marginBottom: 2 },
  recentPreview: { fontSize: 12, marginBottom: 4 },
  recentTime: { fontSize: 11 },
  recentMenu: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  msgRow: { flexDirection: 'row', marginBottom: 12, alignItems: 'flex-end' },
  userRow: { justifyContent: 'flex-end' },
  aiRow: { justifyContent: 'flex-start' },
  msgAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  bubble: { borderRadius: 20, padding: 14, maxWidth: '78%' },
  userBubble: { borderBottomRightRadius: 6 },
  aiBubble: { borderBottomLeftRadius: 6, overflow: 'hidden' },
  aiAccentBar: { position: 'absolute', left: 0, top: 12, bottom: 12, width: 3, borderRadius: 2 },
  bubbleText: { fontSize: 14, lineHeight: 20 },
  timeText: { fontSize: 10, marginTop: 6, textAlign: 'right' },
  errorBox: { padding: 12, borderRadius: 12, marginBottom: 12, borderWidth: 1 },
  errorText: { color: '#FF6B6B', fontSize: 13 },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(128,140,165,0.2)',
  },
  inputField: { flex: 1, height: 50 },
  input: { flex: 1, fontSize: 14, paddingHorizontal: 18 },
  sendGlow: {
    borderRadius: 26,
    shadowColor: '#7657F5',
    shadowOpacity: 0.55,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 10,
  },
  sendBtn: { width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center' },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    padding: 24,
  },
  sheet: { borderRadius: 20, padding: 20 },
  sheetTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
  menuRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12 },
  menuRowText: { fontSize: 15, fontWeight: '600' },
  renameInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    marginBottom: 16,
  },
  sheetActions: { flexDirection: 'row', gap: 10, justifyContent: 'flex-end' },
  sheetBtn: { paddingHorizontal: 18, paddingVertical: 10, borderRadius: 12 },
  sheetBtnPrimary: { backgroundColor: '#8AF52E' },
  sheetBtnText: { fontSize: 14, fontWeight: '700' },
});