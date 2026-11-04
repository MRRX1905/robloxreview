// Utility to extract Roblox username directly from TikTok live chat comments

const IGNORED_WORDS = new Set([
  'bang', 'bng', 'kak', 'kk', 'min', 'admin', 'bro', 'om', 'gan',
  'review', 'riview', 'cekan', 'cek', 'lihat', 'intip',
  'akun', 'account', 'acc', 'id', 'roblox', 'rblx',
  'dong', 'dunk', 'dng', 'plis', 'please', 'pls', 'tolong',
  'ku', 'punyaku', 'gua', 'gue', 'aku', 'saya', 'punya',
  'cepet', 'fast', 'track', 'vip', 'donasi', 'gift',
  'halo', 'hai', 'p', 'tes', 'test', 'ada', 'itu',
  'ya', 'udah', 'tuh', 'nih', 'kalo', 'bisa', 'game',
]);

export function extractRobloxUsername(rawComment: string): string | null {
  if (!rawComment || typeof rawComment !== 'string') return null;

  // Remove command prefixes if any (!review, /review, #review)
  let cleaned = rawComment
    .replace(/^[!/#](review|cek|roblox|akun)\s*/i, '')
    .trim();

  // If starts with @, strip the @
  if (cleaned.startsWith('@')) {
    cleaned = cleaned.slice(1);
  }

  // Split into words
  const tokens = cleaned.split(/\s+/);

  // If it's a single word with 3-20 characters that matches valid Roblox naming pattern
  if (tokens.length === 1) {
    const candidate = tokens[0].replace(/[^a-zA-Z0-9_]/g, '');
    if (isValidRobloxUsername(candidate)) {
      return candidate;
    }
  }

  // Otherwise, filter out stop words and look for the best candidate
  for (const token of tokens) {
    const candidate = token.replace(/[^a-zA-Z0-9_]/g, '');
    const lower = candidate.toLowerCase();
    if (!IGNORED_WORDS.has(lower) && isValidRobloxUsername(candidate)) {
      return candidate;
    }
  }

  // Fallback: check whole trimmed cleaned string
  const cleanCandidate = cleaned.replace(/[^a-zA-Z0-9_]/g, '');
  if (isValidRobloxUsername(cleanCandidate)) {
    return cleanCandidate;
  }

  return null;
}

export function isValidRobloxUsername(name: string): boolean {
  if (!name) return false;
  // Roblox usernames: 3-20 characters, letters, numbers, and single underscores (not at ends)
  if (name.length < 3 || name.length > 20) return false;
  return /^[a-zA-Z0-9]+([_]?[a-zA-Z0-9]+)*$/.test(name);
}
