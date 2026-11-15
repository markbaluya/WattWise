/**
 * WattWise gradient identity.
 *
 * Primary brand gradient: Cyan -> Blue -> Violet -> Purple.
 * These stops are shared by the Dashboard bill card, the AI assistant button,
 * the Chatbot header/bubbles/input, so every gradient screen feels related.
 */
export const BRAND_GRADIENT = ['#00C5E8', '#3987FF', '#7657F5', '#9B5DE5'] as const;

/** Balanced stops so no single color dominates the blend. */
export const BRAND_GRADIENT_LOCATIONS = [0, 0.38, 0.72, 1] as const;

export const BRAND_GRADIENT_START = { x: 0, y: 0 };
export const BRAND_GRADIENT_END = { x: 1, y: 1 };

/** User chat bubbles: cyan -> blue -> violet. */
export const USER_MESSAGE_GRADIENT = ['#00C5E8', '#3987FF', '#7657F5'] as const;

/** AI chat bubbles: soft tinted blends that keep text readable. */
export const AI_MESSAGE_GRADIENT_LIGHT = ['#F2FBFE', '#F1F5FF', '#F6F0FF'] as const;
export const AI_MESSAGE_GRADIENT_DARK = ['#18253F', '#1D2A4C', '#242050'] as const;

/** Chatbot screen background washes (used as a subtle full-screen tint). */
export const CHAT_BACKGROUND_DARK = ['#0B1020', '#0F1830', '#151E33'] as const;
export const CHAT_BACKGROUND_LIGHT = ['#F5F7FB', '#EFF4FF', '#F8F3FF'] as const;

/** Small accent strip used on AI message bubbles. */
export const AI_ACCENT_GRADIENT = ['#00C5E8', '#3987FF', '#7657F5'] as const;

/**
 * Primary action buttons (e.g. Dashboard "Calculate Bill"): a natural
 * green -> cyan -> blue blend. Evenly spaced stops keep the transition smooth
 * instead of reading as three separate color blocks.
 */
export const BILL_BUTTON_GRADIENT = ['#8AF52E', '#00C5E8', '#3987FF'] as const;
export const BILL_BUTTON_GRADIENT_LOCATIONS = [0, 0.5, 1] as const;
