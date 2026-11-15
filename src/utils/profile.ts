/** Two-letter avatar initials derived from a display name ("Rhea Santos" → "RS"). */
export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'WW';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/** First word of a display name, used for greetings. */
export function getFirstName(name: string): string {
  return name.trim().split(/\s+/)[0] || 'there';
}
