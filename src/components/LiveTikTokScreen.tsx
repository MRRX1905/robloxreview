import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Star,
  Users,
  UserCheck,
  UserPlus,
  Coins,
  Crown,
  Zap,
  Flame,
  Tag,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Lock,
  Gift,
  DollarSign,
  Gem,
  Layers,
} from 'lucide-react';
import { RobloxAccount, QueueItem, RobloxItem } from '../types';

interface LiveTikTokScreenProps {
  currentAccount: RobloxAccount | null;
  currentQueueItem: QueueItem | null;
  nextQueueItem: QueueItem | null;
  isSpeaking: boolean;
  speakingText: string;
  tiktokUsername: string;
  activeAlert: {
    title: string;
    sender: string;
    type: string;
    amount: string;
  } | null;
}

export const LiveTikTokScreen: React.FC<LiveTikTokScreenProps> = ({
  currentAccount,
  currentQueueItem,
  nextQueueItem,
  isSpeaking,
  speakingText,
  tiktokUsername,
  activeAlert,
}) => {
  const isSuperVip = currentQueueItem?.tier === 'vip_10k';
  const isFastTrack =
    currentQueueItem?.tier === 'fast_track_coin' || currentQueueItem?.tier === 'fast_track_5k';

  // 1-per-1 Item Pop-up Showcase State
  const [activeItemIndex, setActiveItemIndex] = useState<number>(0);
  const [isAutoPlay, setIsAutoPlay] = useState<boolean>(true);
  const [filterMode, setFilterMode] = useState<'all' | 'paid' | 'off_sale' | 'free'>('all');

  const items = currentAccount?.items || [];

  // Filter items if user filters by status
  const filteredItems = items.filter((item) => {
    if (filterMode === 'all') return true;
    if (filterMode === 'paid') return item.availability === 'paid' || item.availability === 'limited';
    if (filterMode === 'off_sale') return item.availability === 'off_sale';
    if (filterMode === 'free') return item.availability === 'free';
    return true;
  });

  const activeList = filteredItems.length > 0 ? filteredItems : items;
  const safeIndex = Math.min(activeItemIndex, Math.max(0, activeList.length - 1));
  const currentItem: RobloxItem | undefined = activeList[safeIndex];

  // Auto-advance pop-up item every 2.8s
  useEffect(() => {
    if (!isAutoPlay || activeList.length <= 1) return;
    const interval = setInterval(() => {
      setActiveItemIndex((prev) => (prev + 1) % activeList.length);
    }, 2800);

    return () => clearInterval(interval);
  }, [isAutoPlay, activeList.length]);

  // Reset index when account changes
  useEffect(() => {
    setActiveItemIndex(0);
  }, [currentAccount?.username]);

  const handlePrevItem = () => {
    setActiveItemIndex((prev) => (prev === 0 ? activeList.length - 1 : prev - 1));
  };

  const handleNextItem = () => {
    setActiveItemIndex((prev) => (prev + 1) % activeList.length);
  };

  const paidCount = items.filter((i) => i.availability === 'paid' || i.availability === 'limited').length;
  const offSaleCount = items.filter((i) => i.availability === 'off_sale').length;
  const freeCount = items.filter((i) => i.availability === 'free').length;

  return (
    <div className="relative w-full h-full bg-slate-950 text-white overflow-hidden select-none flex flex-col justify-between font-sans">
      {/* BACKGROUND STUDIO LIGHTING (CLEAN: NO 3D CANVAS, NO TOMATO DANCE) */}
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-slate-950 via-slate-900 to-black">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full bg-indigo-600/15 blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full bg-cyan-500/10 blur-2xl pointer-events-none" />
        <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-96 h-28 bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none opacity-40" />
      </div>

      {/* TOP HEADER: MINIMALIST STREAM STATUS (CLEAN: NO PROFILE PILL, NO TARGET, NO EMOTES, NO SOUND ICON) */}
      <div className="relative z-20 pt-3 px-3 flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 bg-black/60 border border-white/10 px-2.5 py-1 rounded-full backdrop-blur-md shadow-md">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse inline-block" />
            <span className="text-[11px] font-black tracking-wide text-white uppercase">
              LIVE REVIEW • @{tiktokUsername || 'youneedheave'}
            </span>
          </div>

          <div className="bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full tracking-wider flex items-center gap-1 shadow-md uppercase">
            <Flame className="w-3 h-3 fill-white" /> LIVE
          </div>
        </div>

        {/* FAST TRACK & NEXT IN QUEUE TICKER */}
        <div className="flex items-center justify-between gap-1.5 text-[10px]">
          <div className="flex items-center gap-1 bg-amber-500/20 border border-amber-400/40 text-amber-200 px-2 py-0.5 rounded-md font-bold shadow-sm">
            <span>⚡ Fast Track:</span>
            <span className="text-white">30 Koin / 5K / 10K Super VIP</span>
          </div>

          <div className="flex items-center gap-1 bg-indigo-950/80 border border-indigo-400/30 text-indigo-200 px-2 py-0.5 rounded-md font-medium truncate max-w-[170px]">
            <Zap className="w-3 h-3 text-yellow-300 shrink-0" />
            <span className="truncate">
              Berikutnya:{' '}
              <strong className="text-white">
                {nextQueueItem ? `@${nextQueueItem.username}` : 'Buka Antrean'}
              </strong>
            </span>
          </div>
        </div>
      </div>

      {/* CENTER: AUTHENTIC ROBLOX AVATAR RENDER (FROM THUMBNAILS.ROBLOX.COM) */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center min-h-0 py-1">
        {currentAccount?.avatarUrl ? (
          <div className="relative flex flex-col items-center justify-center w-full max-h-[34vh]">
            <div className="absolute w-48 h-48 rounded-full bg-indigo-500/20 blur-xl pointer-events-none" />

            <img
              src={currentAccount.avatarUrl}
              alt={currentAccount.username}
              className="relative z-10 max-h-[30vh] w-auto object-contain filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.85)] transition-all duration-300"
            />

            <div className="relative -mt-6 z-0 flex flex-col items-center">
              <div className="w-48 h-5 bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent blur-sm rounded-full" />
              <div className="w-36 h-1.5 bg-gradient-to-r from-cyan-400 via-indigo-400 to-cyan-400 rounded-full shadow-[0_0_15px_rgba(56,189,248,0.8)]" />
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center p-4">
            <div className="w-20 h-20 rounded-2xl bg-indigo-950/60 border border-indigo-500/30 flex items-center justify-center text-3xl mb-2 animate-pulse">
              🎮
            </div>
            <p className="text-xs text-zinc-300 font-bold">Memuat data avatar Roblox...</p>
          </div>
        )}
      </div>

      {/* ACTIVE GIFT / FAST TRACK POPUP ALERT */}
      {activeAlert && (
        <div className="absolute top-20 inset-x-3 z-40 animate-bounce">
          <div className="bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 p-[2px] rounded-2xl shadow-2xl">
            <div className="bg-slate-950/95 backdrop-blur-md px-3.5 py-2.5 rounded-2xl flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-400 to-rose-500 flex items-center justify-center text-xl shadow-lg shrink-0">
                {activeAlert.type === 'vip_10k' ? '👑' : '⚡'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[10px] font-black text-amber-300 uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> {activeAlert.title}
                </div>
                <div className="text-xs font-extrabold text-white truncate">
                  {activeAlert.sender}
                </div>
                <div className="text-[10px] text-zinc-300">
                  {activeAlert.amount} • <span className="text-emerald-400 font-bold">Prioritas Cepat!</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CURRENT TTS SPOKEN VOICE SUBTITLE */}
      {isSpeaking && speakingText && (
        <div className="relative z-30 mx-3 mb-1">
          <div className="bg-slate-950/90 border border-cyan-500/50 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-xl flex items-start gap-2">
            <div className="mt-0.5 shrink-0 flex items-center gap-0.5">
              <span className="w-1.5 h-3 bg-cyan-400 rounded-full animate-pulse" />
              <span className="w-1.5 h-4 bg-cyan-300 rounded-full animate-bounce" />
              <span className="w-1.5 h-2 bg-cyan-400 rounded-full animate-pulse" />
            </div>
            <p className="text-[11px] text-white leading-snug line-clamp-2 italic font-medium">
              "{speakingText}"
            </p>
          </div>
        </div>
      )}

      {/* BOTTOM SECTION: PROFILE CARD & POP-UP ITEM SHOWCASE (1 PER 1) */}
      <div className="relative z-20 p-2.5 flex flex-col gap-1.5 bg-gradient-to-t from-black via-black/95 to-transparent pt-2">
        {currentAccount ? (
          <div className="bg-slate-900/95 border border-white/15 backdrop-blur-md rounded-2xl p-2.5 shadow-2xl flex flex-col gap-2">
            {/* Header: Username, Display Name, Tier Badge, Star Rating */}
            <div className="flex items-center justify-between gap-1.5 border-b border-white/10 pb-1.5">
              <div className="flex items-center gap-2 min-w-0">
                {currentAccount.headshotUrl ? (
                  <img
                    src={currentAccount.headshotUrl}
                    alt={currentAccount.username}
                    className="w-9 h-9 rounded-xl bg-slate-800 object-cover border border-white/20 shadow shrink-0"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-sky-400 flex items-center justify-center text-sm font-black text-white shadow shrink-0">
                    🎮
                  </div>
                )}
                <div className="truncate">
                  <div className="flex items-center gap-1.5">
                    <span className="font-black text-xs text-white tracking-wide truncate">
                      @{currentAccount.username}
                    </span>
                    {isSuperVip && (
                      <span className="bg-amber-400 text-black text-[8px] font-black px-1.5 py-0.2 rounded flex items-center gap-0.5 shadow shrink-0">
                        <Crown className="w-2.5 h-2.5" /> SUPER VIP 10K
                      </span>
                    )}
                    {currentQueueItem?.tier === 'fast_track_coin' && (
                      <span className="bg-orange-500 text-white text-[8px] font-bold px-1.5 py-0.2 rounded flex items-center gap-0.5 shadow shrink-0">
                        ⚡ 30 COIN
                      </span>
                    )}
                    {currentQueueItem?.tier === 'fast_track_5k' && (
                      <span className="bg-emerald-500 text-white text-[8px] font-bold px-1.5 py-0.2 rounded flex items-center gap-0.5 shadow shrink-0">
                        ⚡ 5K FAST
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-[9px] text-zinc-400 truncate">
                    <span className="text-zinc-300 font-semibold truncate">
                      {currentAccount.displayName || currentAccount.username}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-0.5">
                      <Calendar className="w-2.5 h-2.5 text-zinc-500" /> {currentAccount.joinYear}
                    </span>
                    <span>•</span>
                    <span className="truncate text-indigo-300 font-medium">
                      {currentAccount.styleCategory}
                    </span>
                  </div>
                </div>
              </div>

              {/* Big Star Rating */}
              <div className="flex flex-col items-end shrink-0">
                <div className="flex items-center gap-0.5 text-amber-400">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-3 h-3 ${
                        star <= Math.round(currentAccount.starRating)
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-zinc-600'
                      }`}
                    />
                  ))}
                  <span className="ml-1 text-[11px] font-black text-amber-300">
                    {currentAccount.starRating.toFixed(1)}
                  </span>
                </div>
                <span className="text-[8px] text-zinc-400 uppercase tracking-wider font-semibold">
                  Score Avatar
                </span>
              </div>
            </div>

            {/* Social Counts: Friends, Followers, Following */}
            <div className="grid grid-cols-3 gap-1 py-1 text-center bg-black/50 rounded-lg">
              <div className="flex flex-col items-center">
                <span className="text-[8px] text-zinc-400 flex items-center gap-0.5">
                  <Users className="w-2 h-2" /> Teman
                </span>
                <span className="text-[11px] font-black text-white">
                  {currentAccount.friendsCount}
                  <span className="text-[8px] text-zinc-500">/200</span>
                </span>
              </div>
              <div className="flex flex-col items-center border-x border-white/10">
                <span className="text-[8px] text-zinc-400 flex items-center gap-0.5">
                  <UserPlus className="w-2 h-2" /> Followers
                </span>
                <span className="text-[11px] font-black text-sky-400">
                  {currentAccount.followersCount.toLocaleString('id-ID')}
                </span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-[8px] text-zinc-400 flex items-center gap-0.5">
                  <UserCheck className="w-2 h-2" /> Following
                </span>
                <span className="text-[11px] font-black text-white">
                  {currentAccount.followingCount}
                </span>
              </div>
            </div>

            {/* Total Robux & Rupiah Value Bar */}
            <div className="flex items-center justify-between bg-gradient-to-r from-emerald-950/80 via-slate-900 to-emerald-950/80 border border-emerald-500/40 rounded-lg px-2.5 py-1">
              <div className="flex items-center gap-1.5">
                <Coins className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="text-[10px] text-emerald-300 font-semibold">
                  Total Robux Outfit:{' '}
                  <strong className="text-emerald-200 font-black text-xs">
                    {currentAccount.totalRobux.toLocaleString('id-ID')} R$
                  </strong>
                </span>
              </div>
              <div className="flex items-center gap-1 text-[10px] font-bold text-amber-300">
                <Tag className="w-2.5 h-2.5" />
                <span>Rp {currentAccount.estimatedRupiah.toLocaleString('id-ID')}</span>
              </div>
            </div>

            {/* POP-UP RINCIAN ITEM SATU PER SATU (NO SCROLL LIST) */}
            <div className="bg-gradient-to-b from-slate-950 to-slate-900 border border-indigo-500/40 rounded-xl p-2.5 flex flex-col gap-2 shadow-xl">
              {/* Category Filter Pills & Pop-up Header */}
              <div className="flex items-center justify-between gap-1 border-b border-white/10 pb-1.5">
                <div className="flex items-center gap-1">
                  <span className="text-[10px] font-black text-indigo-300 uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-400" /> POP-UP ITEM
                  </span>
                  <span className="text-[9px] bg-indigo-500/20 text-indigo-200 px-1.5 py-0.2 rounded font-bold">
                    {safeIndex + 1} / {activeList.length}
                  </span>
                </div>

                {/* Filter category pills */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      setFilterMode('all');
                      setActiveItemIndex(0);
                    }}
                    className={`text-[8px] font-bold px-1.5 py-0.5 rounded transition ${
                      filterMode === 'all'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-black/40 text-zinc-400 hover:text-white'
                    }`}
                  >
                    Semua ({items.length})
                  </button>
                  <button
                    onClick={() => {
                      setFilterMode('paid');
                      setActiveItemIndex(0);
                    }}
                    className={`text-[8px] font-bold px-1.5 py-0.5 rounded transition ${
                      filterMode === 'paid'
                        ? 'bg-amber-500 text-black font-black'
                        : 'bg-black/40 text-amber-300 hover:text-white'
                    }`}
                  >
                    Berbayar ({paidCount})
                  </button>
                  <button
                    onClick={() => {
                      setFilterMode('off_sale');
                      setActiveItemIndex(0);
                    }}
                    className={`text-[8px] font-bold px-1.5 py-0.5 rounded transition ${
                      filterMode === 'off_sale'
                        ? 'bg-purple-600 text-white font-black'
                        : 'bg-black/40 text-purple-300 hover:text-white'
                    }`}
                  >
                    Tidak Dijual ({offSaleCount})
                  </button>
                  <button
                    onClick={() => {
                      setFilterMode('free');
                      setActiveItemIndex(0);
                    }}
                    className={`text-[8px] font-bold px-1.5 py-0.5 rounded transition ${
                      filterMode === 'free'
                        ? 'bg-emerald-600 text-white font-black'
                        : 'bg-black/40 text-emerald-300 hover:text-white'
                    }`}
                  >
                    Gratis ({freeCount})
                  </button>
                </div>
              </div>

              {/* SINGLE ITEM POP-UP SPOTLIGHT CARD (1 PER 1) */}
              {currentItem ? (
                <div className="relative overflow-hidden bg-black/70 border border-white/15 rounded-xl p-2.5 flex items-center justify-between gap-3 shadow-2xl">
                  {/* Item Thumbnail with Glowing Status Ring */}
                  <div className="relative shrink-0">
                    <div
                      className={`w-14 h-14 rounded-xl flex items-center justify-center p-1 border-2 shadow-lg ${
                        currentItem.availability === 'paid' || currentItem.availability === 'limited'
                          ? 'border-amber-400 bg-amber-950/50 shadow-[0_0_15px_rgba(245,158,11,0.4)]'
                          : currentItem.availability === 'off_sale'
                          ? 'border-purple-500 bg-purple-950/50 shadow-[0_0_15px_rgba(168,85,247,0.4)]'
                          : 'border-emerald-400 bg-emerald-950/50 shadow-[0_0_15px_rgba(52,211,153,0.3)]'
                      }`}
                    >
                      {currentItem.icon ? (
                        <img
                          src={currentItem.icon}
                          alt={currentItem.name}
                          className="w-full h-full object-contain rounded-lg"
                        />
                      ) : (
                        <span className="text-2xl">📦</span>
                      )}
                    </div>

                    {/* Corner availability indicator badge */}
                    <div className="absolute -top-1.5 -right-1.5">
                      {currentItem.availability === 'paid' && (
                        <span className="w-5 h-5 rounded-full bg-amber-400 text-black flex items-center justify-center text-[10px] shadow font-black">
                          R$
                        </span>
                      )}
                      {currentItem.availability === 'off_sale' && (
                        <span className="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center text-[10px] shadow font-black">
                          <Lock className="w-2.5 h-2.5" />
                        </span>
                      )}
                      {currentItem.availability === 'free' && (
                        <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] shadow font-black">
                          <Gift className="w-2.5 h-2.5" />
                        </span>
                      )}
                      {currentItem.availability === 'limited' && (
                        <span className="w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center text-[10px] shadow font-black">
                          <Gem className="w-2.5 h-2.5" />
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Item Description & Pricing */}
                  <div className="flex-1 min-w-0 flex flex-col gap-1">
                    <div className="truncate">
                      <h4 className="font-extrabold text-white text-xs leading-tight truncate">
                        {currentItem.name}
                      </h4>
                      <div className="flex items-center gap-1.5 text-[9px] text-zinc-400 mt-0.5">
                        <span className="text-indigo-300 font-semibold">{currentItem.type}</span>
                        <span>•</span>
                        <span>{currentItem.creatorName || 'Roblox'}</span>
                      </div>
                    </div>

                    {/* Prominent Distinction Badge: Berbayar vs Tidak Dijual vs Gratis */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {currentItem.availability === 'paid' && (
                        <div className="inline-flex items-center gap-1 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded-md shadow">
                          <Coins className="w-3 h-3 fill-slate-950" />
                          <span>{currentItem.priceRobux.toLocaleString('id-ID')} ROBUX</span>
                          <span className="text-[9px] font-bold text-amber-950 ml-1">
                            (Rp {(currentItem.priceRobux * 180).toLocaleString('id-ID')})
                          </span>
                        </div>
                      )}

                      {currentItem.availability === 'off_sale' && (
                        <div className="inline-flex items-center gap-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-black text-[10px] px-2 py-0.5 rounded-md shadow">
                          <Lock className="w-3 h-3" />
                          <span>TIDAK DIJUAL</span>
                          <span className="text-[8px] bg-black/40 px-1 py-0.2 rounded font-medium text-purple-200">
                            Off-Sale / Event Langka
                          </span>
                        </div>
                      )}

                      {currentItem.availability === 'free' && (
                        <div className="inline-flex items-center gap-1 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black text-[10px] px-2 py-0.5 rounded-md shadow">
                          <Gift className="w-3 h-3" />
                          <span>GRATIS</span>
                          <span className="text-[8px] bg-black/40 px-1 py-0.2 rounded font-medium text-emerald-200">
                            Starter / Free Catalog
                          </span>
                        </div>
                      )}

                      {currentItem.availability === 'limited' && (
                        <div className="inline-flex items-center gap-1 bg-gradient-to-r from-rose-600 to-amber-600 text-white font-black text-[10px] px-2 py-0.5 rounded-md shadow">
                          <Gem className="w-3 h-3" />
                          <span>LIMITED</span>
                          <span className="text-[8px] bg-black/40 px-1 py-0.2 rounded font-medium text-rose-200">
                            {currentItem.priceRobux > 0 ? `${currentItem.priceRobux} R$` : 'Koleksi'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Navigation Arrows & Play/Pause */}
                  <div className="flex flex-col items-center gap-1 shrink-0">
                    <button
                      onClick={handlePrevItem}
                      className="p-1 rounded-full bg-white/10 hover:bg-white/20 text-white transition shadow"
                      title="Item Sebelumnya"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setIsAutoPlay(!isAutoPlay)}
                      className={`p-1 rounded-full text-white transition shadow ${
                        isAutoPlay ? 'bg-indigo-600 hover:bg-indigo-500' : 'bg-slate-700 hover:bg-slate-600'
                      }`}
                      title={isAutoPlay ? 'Jeda Slideshow' : 'Putar Slideshow Otomatis'}
                    >
                      {isAutoPlay ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                    </button>
                    <button
                      onClick={handleNextItem}
                      className="p-1 rounded-full bg-white/10 hover:bg-white/20 text-white transition shadow"
                      title="Item Berikutnya"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 text-xs text-zinc-400">
                  Tidak ada item pada filter ini.
                </div>
              )}

              {/* Mini Item Dot Strip (Fast Tap to Inspect Any Item) */}
              <div className="flex items-center gap-1 overflow-x-auto py-0.5 px-0.5">
                {activeList.map((item, idx) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveItemIndex(idx);
                      setIsAutoPlay(false);
                    }}
                    className={`relative shrink-0 w-6 h-6 rounded-md overflow-hidden border transition-all ${
                      idx === safeIndex
                        ? 'border-indigo-400 ring-2 ring-indigo-400 scale-110 shadow-md'
                        : 'border-white/10 opacity-60 hover:opacity-100'
                    }`}
                  >
                    {item.icon ? (
                      <img src={item.icon} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-slate-800 text-[8px] flex items-center justify-center">
                        {idx + 1}
                      </div>
                    )}
                    {/* Tiny availability indicator dot */}
                    <span
                      className={`absolute bottom-0 right-0 w-1.5 h-1.5 rounded-full ${
                        item.availability === 'paid'
                          ? 'bg-amber-400'
                          : item.availability === 'off_sale'
                          ? 'bg-purple-500'
                          : 'bg-emerald-400'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-slate-900/90 border border-white/10 backdrop-blur-md rounded-2xl p-3 text-center">
            <p className="text-xs font-bold text-zinc-300">Menunggu komentar penonton berikutnya...</p>
            <p className="text-[10px] text-zinc-400 mt-1">
              Ketik username Roblox di live chat untuk langsung direview!
            </p>
          </div>
        )}

        {/* BOTTOM FAST TRACK PROMO BANNER */}
        <div className="bg-gradient-to-r from-orange-600/95 via-rose-600/95 to-amber-600/95 py-1 px-2 rounded-xl text-center text-[9px] font-black text-white shadow-lg flex items-center justify-center gap-1.5 tracking-wide">
          <span>🧡 Fast Track: 30 Koin (Love Oren)</span>
          <span>•</span>
          <span>⚡ 5K Sosialbuzz</span>
          <span>•</span>
          <span>👑 10K Super VIP</span>
        </div>
      </div>
    </div>
  );
};
