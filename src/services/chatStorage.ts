import AsyncStorage from '@react-native-async-storage/async-storage';

export type ChatRole = 'user' | 'ai';

export type StoredMessage = {
  role: ChatRole;
  text: string;
  /** Human readable clock time captured when the message was created. */
  time: string;
};

export type Conversation = {
  id: string;
  title: string;
  /** ISO timestamps so ordering survives app restarts. */
  createdAt: string;
  updatedAt: string;
  messages: StoredMessage[];
};

// History is scoped to the signed-in account so one profile never sees another
// profile's conversations. The app ships with a single administrator account,
// but keying by username keeps the data isolated if that ever changes.
const keyFor = (username: string) => `wattwise_chat_conversations_${username}`;

export function sortConversations(list: Conversation[]): Conversation[] {
  return [...list].sort((a, b) =>
    a.updatedAt < b.updatedAt ? 1 : a.updatedAt > b.updatedAt ? -1 : 0
  );
}

export function createConversationId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

/** Short, single-line title derived from the first user message. */
export function makeConversationTitle(text: string): string {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (!clean) return 'New conversation';
  return clean.length <= 42 ? clean : `${clean.slice(0, 42).trim()}…`;
}

export async function loadConversations(username: string): Promise<Conversation[]> {
  if (!username) return [];
  try {
    const raw = await AsyncStorage.getItem(keyFor(username));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return sortConversations(
      parsed.filter(
        (c): c is Conversation =>
          !!c &&
          typeof c.id === 'string' &&
          typeof c.title === 'string' &&
          typeof c.updatedAt === 'string' &&
          Array.isArray(c.messages)
      )
    );
  } catch {
    // Corrupt or unavailable storage: start with an empty history.
    return [];
  }
}

export async function saveConversations(
  username: string,
  conversations: Conversation[]
): Promise<boolean> {
  if (!username) return false;
  try {
    const sorted = sortConversations(conversations);
    if (sorted.length === 0) {
      await AsyncStorage.removeItem(keyFor(username));
    } else {
      await AsyncStorage.setItem(keyFor(username), JSON.stringify(sorted));
    }
    return true;
  } catch {
    // Surface the failure to the caller without crashing the chat.
    return false;
  }
}

export function formatConversationTime(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '';
  const diff = Math.max(0, Date.now() - then);
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString([], { month: 'short', day: 'numeric' });
}

export function lastMessagePreview(conversation: Conversation): string {
  const last = conversation.messages[conversation.messages.length - 1];
  if (!last) return 'No messages yet';
  const clean = last.text.replace(/\s+/g, ' ').trim();
  return clean.length <= 80 ? clean : `${clean.slice(0, 80)}…`;
}