require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { GoogleGenAI } = require('@google/genai');

const app = express();
app.disable('x-powered-by');

// Only allow configured browser origins when ALLOWED_ORIGINS is set. Native
// mobile clients send no Origin header, so they keep working either way.
const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);
const corsOptions = allowedOrigins.length
  ? {
      origin(origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
        return callback(new Error('Not allowed by CORS'));
      },
    }
  : {};
app.use(cors(corsOptions));

// Cap request bodies to avoid memory/abuse issues.
app.use(express.json({ limit: '256kb' }));

// Basic hardening headers.
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'no-referrer');
  next();
});

// ---------------------------------------------------------------------------
// Rate limiting (in-memory, per IP)
// ---------------------------------------------------------------------------
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX = Number(process.env.RATE_LIMIT_MAX || 30);
const rateHits = new Map();
const sessions = new Map(); // token -> { expiresAt }

// A real bcrypt hash used to compare against when no account exists yet, so a
// missing username and a wrong password take similar time (no user enumeration).
const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', 12);

function rateLimit(req, res, next) {
  const key = req.ip || req.socket?.remoteAddress || 'unknown';
  const now = Date.now();
  const entry = rateHits.get(key);
  if (!entry || now > entry.reset) {
    rateHits.set(key, { count: 1, reset: now + RATE_LIMIT_WINDOW_MS });
    return next();
  }
  entry.count += 1;
  if (entry.count > RATE_LIMIT_MAX) {
    return res
      .status(429)
      .json({ error: 'Too many requests. Please slow down and try again shortly.' });
  }
  return next();
}

const cleanup = setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateHits) {
    if (now > entry.reset) rateHits.delete(key);
  }
  for (const [token, session] of sessions) {
    if (now > session.expiresAt) sessions.delete(token);
  }
}, RATE_LIMIT_WINDOW_MS);
cleanup.unref?.();

// ---------------------------------------------------------------------------
// Admin account storage (bcrypt hash only; never the plaintext password)
// ---------------------------------------------------------------------------
const DATA_DIR = path.join(__dirname, '.data');
const DATA_FILE = path.join(DATA_DIR, 'admin.json');
const SESSION_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours
const BCRYPT_ROUNDS = 12;
const MIN_PASSWORD_LENGTH = 8;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function readAdmin() {
  try {
    const parsed = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    if (parsed && typeof parsed.passwordHash === 'string' && parsed.passwordHash) {
      return parsed;
    }
  } catch {
    // No admin provisioned yet.
  }
  return null;
}

function writeAdmin(admin) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(admin, null, 2), { mode: 0o600 });
}

function publicUser(admin) {
  return {
    username: admin.username,
    role: admin.role,
    name: admin.profile?.name || '',
    email: admin.profile?.email || '',
    phone: admin.profile?.phone || '',
  };
}

function isValidPassword(pw) {
  return typeof pw === 'string' && pw.length >= MIN_PASSWORD_LENGTH && pw.length <= 200;
}

// ---------------------------------------------------------------------------
// Auth middleware
// ---------------------------------------------------------------------------
function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7).trim() : '';
  if (!token) return res.status(401).json({ error: 'Unauthorized.' });
  const session = sessions.get(token);
  if (!session || session.expiresAt < Date.now()) {
    if (session) sessions.delete(token);
    return res.status(401).json({ error: 'Unauthorized.' });
  }
  const admin = readAdmin();
  if (!admin) return res.status(401).json({ error: 'Unauthorized.' });
  req.admin = admin;
  req.sessionToken = token;
  return next();
}

// ---------------------------------------------------------------------------
// Auth routes
// ---------------------------------------------------------------------------
app.get('/api/auth/status', (req, res) => {
  res.json({ setupRequired: !readAdmin() });
});

app.post('/api/auth/setup', rateLimit, async (req, res) => {
  try {
    if (readAdmin()) {
      return res.status(403).json({ error: 'Administrator account already exists.' });
    }
    const { password } = req.body || {};
    if (!isValidPassword(password)) {
      return res
        .status(400)
        .json({ error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.` });
    }
    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    const nowIso = new Date().toISOString();
    writeAdmin({
      username: 'admin',
      role: 'admin',
      passwordHash,
      profile: { name: 'Administrator', email: '', phone: '' },
      createdAt: nowIso,
      updatedAt: nowIso,
    });
    return res.status(201).json({ ok: true });
  } catch (err) {
    console.error('Setup error:', err?.message || 'unknown error');
    return res.status(500).json({ error: 'Could not create the account.' });
  }
});

app.post('/api/auth/login', rateLimit, async (req, res) => {
  try {
    const { username, password } = req.body || {};
    const admin = readAdmin();
    // Always run a compare to keep timing similar whether or not the user exists.
    const hash = admin?.passwordHash || DUMMY_HASH;
    const passwordOk =
      typeof password === 'string' && (await bcrypt.compare(password, hash));
    const usernameOk =
      admin && typeof username === 'string' && username.trim().toLowerCase() === admin.username;

    if (!admin || !usernameOk || !passwordOk) {
      return res.status(401).json({ error: 'Invalid username or password.' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = Date.now() + SESSION_TTL_MS;
    sessions.set(token, { expiresAt });
    return res.json({ token, expiresAt: new Date(expiresAt).toISOString(), user: publicUser(admin) });
  } catch (err) {
    console.error('Login error:', err?.message || 'unknown error');
    return res.status(500).json({ error: 'Could not sign in.' });
  }
});

app.post('/api/auth/logout', requireAuth, (req, res) => {
  sessions.delete(req.sessionToken);
  res.json({ ok: true });
});

app.get('/api/auth/me', requireAuth, (req, res) => {
  res.json({ user: publicUser(req.admin) });
});

app.put('/api/auth/profile', requireAuth, async (req, res) => {
  try {
    const { name, email, phone } = req.body || {};
    if (typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ error: 'Full name is required.' });
    }
    if (email && !EMAIL_PATTERN.test(email)) {
      return res.status(400).json({ error: 'Enter a valid email address.' });
    }
    const admin = readAdmin();
    admin.profile = {
      name: name.trim().slice(0, 120),
      email: typeof email === 'string' ? email.trim().slice(0, 200) : '',
      phone: typeof phone === 'string' ? phone.trim().slice(0, 40) : '',
    };
    admin.updatedAt = new Date().toISOString();
    writeAdmin(admin);
    return res.json({ user: publicUser(admin) });
  } catch (err) {
    console.error('Profile update error:', err?.message || 'unknown error');
    return res.status(500).json({ error: 'Could not save your profile.' });
  }
});

app.post('/api/auth/change-password', requireAuth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body || {};
    const admin = readAdmin();
    const currentOk =
      typeof currentPassword === 'string' &&
      (await bcrypt.compare(currentPassword, admin.passwordHash));
    if (!currentOk) {
      return res.status(400).json({ error: 'Current password is incorrect.' });
    }
    if (!isValidPassword(newPassword)) {
      return res
        .status(400)
        .json({ error: `New password must be at least ${MIN_PASSWORD_LENGTH} characters.` });
    }
    if (newPassword === currentPassword) {
      return res
        .status(400)
        .json({ error: 'Choose a password different from the current one.' });
    }
    admin.passwordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
    admin.updatedAt = new Date().toISOString();
    writeAdmin(admin);
    // Keep the current session, invalidate any others.
    for (const [token, session] of sessions) {
      if (token !== req.sessionToken) sessions.delete(token);
    }
    return res.json({ ok: true });
  } catch (err) {
    console.error('Change password error:', err?.message || 'unknown error');
    return res.status(500).json({ error: 'Could not update the password.' });
  }
});

// ---------------------------------------------------------------------------
// Gemini AI
// ---------------------------------------------------------------------------
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error('GEMINI_API_KEY is not set in .env');
  process.exit(1);
}
const ai = new GoogleGenAI({ apiKey });

const SYSTEM_INSTRUCTION = `You are WattWise AI Assistant, an electricity consumption and energy-saving assistant for Philippine households.

Your responsibilities:
- Explain electricity consumption in simple language.
- Understand watts, kWh, and electricity rates.
- Analyze appliance consumption.
- Explain estimated electricity bills.
- Recommend ways to save electricity.
- Answer questions about Philippine household electricity.
- Use actual WattWise application data when available.
- Analyze the user's calculated consumption and bill history when provided.
- Explain calculations step by step when requested.

IMPORTANT ACCURACY RULES:
- Never invent electricity rates or appliance wattage. Only use values explicitly provided in the app data.
- Never pretend to have access to application data that was not provided.
- Ask for missing information when necessary.
- Clearly label estimates versus actual measurements.
- Do not claim to measure real-time electricity without hardware sensors.
- Always show the formula used: Energy (kWh) = (Watts x Quantity x Hours x Days) / 1000, then Cost = Energy x Rate.

When the user provides appliance data, reference it specifically. When they don't, ask for the missing details (wattage, hours, rate) before calculating.`;

const MAX_MESSAGE_CHARS = 4000;
const MAX_HISTORY_MESSAGES = 50;

function sanitizeHistory(history) {
  if (!Array.isArray(history)) return [];
  return history
    .filter(
      (m) =>
        m &&
        (m.role === 'user' || m.role === 'ai') &&
        typeof m.text === 'string' &&
        m.text.trim()
    )
    .slice(-MAX_HISTORY_MESSAGES)
    .map((m) => ({ role: m.role, text: m.text.slice(0, MAX_MESSAGE_CHARS) }));
}

function sanitizeAppData(appData) {
  const data = appData && typeof appData === 'object' && !Array.isArray(appData) ? appData : {};
  const appliances = Array.isArray(data.appliances) ? data.appliances.slice(0, 100) : [];
  const calculations = Array.isArray(data.calculations) ? data.calculations.slice(0, 100) : [];
  const rate = Number(data.electricityRate);
  return {
    appliances: appliances
      .filter((a) => a && typeof a.name === 'string')
      .map((a) => ({
        name: String(a.name).slice(0, 80),
        watts: Number(a.watts) || 0,
        quantity: Number(a.quantity) || 0,
        hours: Number(a.hours) || 0,
        days: Number(a.days) || 0,
      })),
    electricityRate: Number.isFinite(rate) && rate >= 0 ? rate : undefined,
    calculations: calculations
      .filter((c) => c && typeof c.name === 'string')
      .map((c) => ({
        name: String(c.name).slice(0, 80),
        consumption: Number(c.consumption) || 0,
        cost: Number(c.cost) || 0,
      })),
    dataset: data.dataset && typeof data.dataset === 'object' ? data.dataset : undefined,
  };
}

app.post('/api/chat', requireAuth, rateLimit, async (req, res) => {
  try {
    const { message, history, appData } = req.body || {};

    if (typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ error: 'Message is required.' });
    }
    const safeMessage = message.trim().slice(0, MAX_MESSAGE_CHARS);
    const safeHistory = sanitizeHistory(history);
    const data = sanitizeAppData(appData);

    let contextStr = '';
    if (data.appliances.length > 0) {
      contextStr += '\n\nUser\'s appliances:\n';
      data.appliances.forEach((a) => {
        contextStr += `- ${a.name}: ${a.watts}W, qty ${a.quantity}, ${a.hours}h/day, ${a.days} days/month\n`;
      });
    }
    if (data.electricityRate !== undefined) {
      contextStr += `\nElectricity rate: ₱${data.electricityRate}/kWh\n`;
    }
    if (data.calculations.length > 0) {
      contextStr += '\nCalculated results:\n';
      data.calculations.forEach((c) => {
        contextStr += `- ${c.name}: ${c.consumption.toFixed(2)} kWh, ₱${c.cost.toFixed(2)}\n`;
      });
    }
    if (data.dataset) {
      const d = data.dataset;
      contextStr += '\n\nHistorical Reference Data (REFIT - UK household, House 11):\n';
      contextStr += `Dataset: ${d.name}\n`;
      contextStr += `Period: ${d.samplePeriod} (${Number(d.totalReadings || 0).toLocaleString()} readings at ${d.samplingInterval})\n`;
      contextStr += `Appliances measured: ${Array.isArray(d.appliances) ? d.appliances.map((a) => a && a.name).filter(Boolean).join(', ') : ''}\n`;
      if (Array.isArray(d.dailyConsumption) && d.dailyConsumption.length > 0) {
        contextStr += 'Sample daily consumption:\n';
        d.dailyConsumption.slice(0, 10).forEach((day) => {
          contextStr += `  ${day.date}: ${Number(day.kwh || 0).toFixed(2)} kWh total. Appliances: ${Array.isArray(day.appliances) ? day.appliances.map((a) => `${a.name}=${Number(a.kwh || 0).toFixed(2)}kWh`).join(', ') : ''}\n`;
        });
      }
      contextStr += `Note: ${d.note}\n`;
      contextStr += 'IMPORTANT: These are historical measurements from a UK household, NOT from the user\'s home. When referencing, label them as "Historical Reference Data" and clarify they are from a UK household, not the user\'s own measurements. Use this data to provide helpful comparisons and energy-saving insights, but never claim it represents the user\'s actual consumption.\n';
    }

    const contents = [];
    contents.push({ role: 'user', parts: [{ text: SYSTEM_INSTRUCTION + contextStr }] });
    contents.push({ role: 'model', parts: [{ text: 'Understood. I am WattWise AI Assistant. I will help with electricity consumption, bills, and energy-saving tips using only the provided data.' }] });

    safeHistory.forEach((msg) => {
      contents.push({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }],
      });
    });

    contents.push({ role: 'user', parts: [{ text: safeMessage }] });

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents,
    });

    const reply = response.text || 'I could not generate a response. Please try again.';
    res.json({ reply });
  } catch (err) {
    console.error('Gemini API error:', err?.message || 'unknown error');
    res.status(500).json({ error: 'AI service unavailable. Please try again later.' });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'WattWise AI Backend' });
});

// JSON/body/CORS error handling.
app.use((err, req, res, next) => {
  if (err && err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Invalid request body.' });
  }
  if (err && err.type === 'entity.too.large') {
    return res.status(413).json({ error: 'Request body too large.' });
  }
  if (err && err.message === 'Not allowed by CORS') {
    return res.status(403).json({ error: 'Origin not allowed.' });
  }
  return res.status(500).json({ error: 'Server error.' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`WattWise backend running on http://0.0.0.0:${PORT}`);
  console.log(`Local access: http://localhost:${PORT}`);
  console.log(`Network access: http://<your-ip>:${PORT}`);
});