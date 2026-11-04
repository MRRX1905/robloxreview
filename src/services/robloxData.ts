import { RobloxAccount, RobloxItem } from '../types';

export const CATALOG_ITEMS: RobloxItem[] = [
  { id: '1', name: 'Dominus Aureus', type: 'Hat', priceRobux: 150000, rarity: 'Limited', icon: '👑', color: '#f59e0b', availability: 'limited', statusLabel: '150.000 R$ (Limited)' },
  { id: '2', name: 'Valkyrie Helm', type: 'Hat', priceRobux: 50000, rarity: 'Limited', icon: '🪖', color: '#38bdf8', availability: 'limited', statusLabel: '50.000 R$ (Limited)' },
  { id: '3', name: 'Headless Horseman', type: 'Bundle', priceRobux: 31000, rarity: 'Limited', icon: '🎃', color: '#ea580c', availability: 'off_sale', statusLabel: 'Tidak Dijual (Off-Sale)' },
  { id: '4', name: 'Korblox Deathspeaker', type: 'Bundle', priceRobux: 17000, rarity: 'Legendary', icon: '💀', color: '#6366f1', availability: 'paid', statusLabel: '17.000 R$' },
  { id: '5', name: 'Super Super Happy Face', type: 'Face', priceRobux: 85000, rarity: 'Limited', icon: '😄', color: '#fbbf24', availability: 'limited', statusLabel: '85.000 R$ (Limited)' },
  { id: '6', name: 'Silver King Crown', type: 'Hat', priceRobux: 4500, rarity: 'Legendary', icon: '👑', color: '#e2e8f0', availability: 'paid', statusLabel: '4.500 R$' },
  { id: '7', name: 'Neon Cyber Katana', type: 'Back', priceRobux: 1200, rarity: 'Epic', icon: '⚔️', color: '#06b6d4', availability: 'paid', statusLabel: '1.200 R$' },
  { id: '8', name: 'Gyaru Sukuna Messy Hair', type: 'Hair', priceRobux: 65, rarity: 'Rare', icon: '💇', color: '#1e293b', availability: 'paid', statusLabel: '65 R$' },
  { id: '9', name: 'Murder Mystery 2 - Knife Crown', type: 'Hat', priceRobux: 0, rarity: 'Common', icon: '🗡️', color: '#ef4444', availability: 'off_sale', statusLabel: 'Tidak Dijual (Off-Sale / Event)' },
  { id: '10', name: 'Pastel Angel Wings', type: 'Back', priceRobux: 350, rarity: 'Epic', icon: '🪽', color: '#f472b6', availability: 'paid', statusLabel: '350 R$' },
  { id: '11', name: 'Golden Chain Necklace', type: 'Neck', priceRobux: 250, rarity: 'Rare', icon: '✨', color: '#eab308', availability: 'paid', statusLabel: '250 R$' },
  { id: '12', name: 'Retro 80s Cyber Glasses', type: 'Face', priceRobux: 90, rarity: 'Rare', icon: '🕶️', color: '#ec4899', availability: 'paid', statusLabel: '90 R$' },
  { id: '13', name: 'Classic Bacon Hair', type: 'Hair', priceRobux: 0, rarity: 'Common', icon: '🥓', color: '#b45309', availability: 'free', statusLabel: 'Gratis (Starter)' },
  { id: '14', name: 'Roblox Baseball Cap', type: 'Hat', priceRobux: 0, rarity: 'Common', icon: '🧢', color: '#2563eb', availability: 'free', statusLabel: 'Gratis (Free)' },
];

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

// Fallback deterministic profile generator if network is offline
export function generateRobloxProfile(rawUsername: string): RobloxAccount {
  const username = rawUsername.trim().replace(/^@/, '') || 'RobloxPlayer';
  const hash = hashString(username.toLowerCase());
  const joinYear = 2014 + (hash % 11);
  const friendsCount = Math.min(200, 15 + (hash % 186));
  const followersCount = 20 + (hash % 4500);
  const followingCount = 5 + ((hash >> 2) % 150);

  const itemCount = 3 + (hash % 4);
  const selectedItems: RobloxItem[] = [];
  const usedIndices = new Set<number>();

  for (let i = 0; i < itemCount; i++) {
    const itemIndex = ((hash * (i + 3) + i * 17) >>> 0) % CATALOG_ITEMS.length;
    if (!usedIndices.has(itemIndex)) {
      usedIndices.add(itemIndex);
      selectedItems.push(CATALOG_ITEMS[itemIndex]);
    }
  }

  const totalRobux = selectedItems.reduce((acc, item) => acc + item.priceRobux, 0);
  const estimatedRupiah = totalRobux * 180;

  let rawRating = 2.8;
  if (totalRobux > 50000) rawRating += 2.0;
  else if (totalRobux > 10000) rawRating += 1.5;
  else if (totalRobux > 1000) rawRating += 0.9;
  else if (totalRobux > 100) rawRating += 0.4;

  const starRating = Math.min(5.0, Math.max(1.0, Number((rawRating + (hash % 5) * 0.1).toFixed(1))));

  const categories = [
    'Sultan Mewah (Rich Flex)',
    'Aesthetic Soft Pastel',
    'Tryhard PvP Sweat',
    'Classic Retro Robloxian',
    'Bacon Trooper Legend',
    'Hypebeast Trendsetter',
  ];
  const styleCategory = categories[hash % categories.length];

  const roastComment = `Akun dari tahun ${joinYear} dengan ${friendsCount} teman dan ${followersCount} followers. Gayanya unik tapi kombinasinya lumayan heboh!`;
  const praiseComment = `Keren banget! Akun ${username} sejak ${joinYear} dengan total investasi ${totalRobux.toLocaleString('id-ID')} Robux! Terlihat sangat rapi dan berkelas!`;

  const itemBreakdownList = selectedItems
    .map((it) => `• ${it.name} (${it.type}): ${it.statusLabel}`)
    .join('\n');

  const vipDetailedReview = `[SUPER VIP 10K REVIEW KHUSUS UNTUK @${username}]\n` +
    `Status: Robloxian sejak ${joinYear}\n` +
    `Pertemanan: ${friendsCount}/200 | Followers: ${followersCount.toLocaleString('id-ID')} | Following: ${followingCount}\n` +
    `Kategori: ${styleCategory}\n` +
    `--- RINCIAN ITEM & HARGA ROBUX ---\n${itemBreakdownList}\n` +
    `----------------------------------\n` +
    `TOTAL OUTFIT: ${totalRobux.toLocaleString('id-ID')} ROBUX (Estimasi Rp ${estimatedRupiah.toLocaleString('id-ID')})\n` +
    `SKOR KESELURUHAN: ${starRating} / 5.0 ⭐\n` +
    `Catatan: ${praiseComment}`;

  const avatarUrl = `https://www.roblox.com/headshot-thumbnail/image?userId=${100000000 + (hash % 50000000)}&width=420&height=420&format=png`;

  return {
    username,
    displayName: username,
    userId: 100000000 + (hash % 899999999),
    avatarUrl,
    friendsCount,
    followersCount,
    followingCount,
    joinYear,
    items: selectedItems,
    totalRobux,
    estimatedRupiah,
    starRating,
    ratingBreakdown: {
      style: Math.min(5, Math.max(1, Math.round(starRating))),
      rarity: totalRobux > 10000 ? 5 : totalRobux > 1000 ? 4 : 3,
      richFlex: totalRobux > 20000 ? 5 : totalRobux > 2000 ? 4 : 2,
      originality: 4,
    },
    styleCategory,
    roastComment,
    praiseComment,
    vipDetailedReview,
  };
}

// REAL ROBLOX PROFILE FETCHER
export async function fetchRealRobloxProfile(rawUsername: string): Promise<RobloxAccount> {
  const clean = rawUsername.trim().replace(/^@/, '');
  if (!clean) {
    return generateRobloxProfile('RobloxPlayer');
  }

  try {
    const res = await fetch(`/api/roblox/profile/${encodeURIComponent(clean)}`);
    if (!res.ok) {
      console.warn(`Real Roblox fetch failed for "${clean}", using deterministic fallback`);
      return generateRobloxProfile(clean);
    }
    const data: RobloxAccount = await res.json();
    return data;
  } catch (err) {
    console.warn(`Network error fetching Roblox profile for "${clean}":`, err);
    return generateRobloxProfile(clean);
  }
}
