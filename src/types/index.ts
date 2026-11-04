export type QueueTier = 'regular' | 'fast_track_coin' | 'fast_track_5k' | 'vip_10k';

export type ItemAvailability = 'paid' | 'off_sale' | 'free' | 'limited';

export interface RobloxItem {
  id: string;
  name: string;
  type: string;
  priceRobux: number;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary' | 'Limited';
  icon: string;
  color?: string;
  creatorName?: string;
  availability: ItemAvailability;
  statusLabel: string; // e.g. "65 R$", "Tidak Dijual (Off-Sale / Event)", "Gratis", "Limited"
}

export interface RobloxAccount {
  username: string;
  displayName: string;
  userId: number;
  avatarUrl: string; // Real 720x720 PNG full body render from thumbnails.roblox.com
  headshotUrl?: string; // Real 150x150 PNG headshot
  friendsCount: number;
  followersCount: number;
  followingCount: number;
  joinYear: number;
  items: RobloxItem[];
  totalRobux: number;
  estimatedRupiah: number;
  starRating: number; // 1.0 to 5.0
  ratingBreakdown: {
    style: number; // 1-5
    rarity: number; // 1-5
    richFlex: number; // 1-5
    originality: number; // 1-5
  };
  styleCategory: string;
  roastComment: string;
  praiseComment: string;
  vipDetailedReview: string;
}

export interface QueueItem {
  id: string;
  username: string;
  requesterTikTok: string;
  tier: QueueTier;
  timestamp: number;
  giftType?: string;
  amount?: number;
  accountData?: RobloxAccount;
  status: 'waiting' | 'reviewing' | 'completed';
}

export interface LiveChatMessage {
  id: string;
  user: string;
  avatarUrl: string;
  message: string;
  badge?: string;
  isGift?: boolean;
  giftName?: string;
  timestamp: number;
}

export interface TTSConfig {
  voiceRate: number; // 0.8 - 1.2
  voicePitch: number; // 0.8 - 1.3
  voiceVolume: number; // 0 - 1
  selectedVoiceName: string;
  reviewStyle: 'santai' | 'roasting' | 'sultan_vip' | 'hype';
  templateIntro: string;
  templateSocial: string;
  templateItems: string;
  templateRating: string;
  templateVIPExtra: string;
}
