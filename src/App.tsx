import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  RobloxAccount,
  QueueItem,
  QueueTier,
  LiveChatMessage,
  TTSConfig,
} from './types';
import { fetchRealRobloxProfile, generateRobloxProfile } from './services/robloxData';
import { ttsService, DEFAULT_TTS_CONFIG } from './services/ttsService';
import { soundEffects } from './services/soundEffects';
import { extractRobloxUsername } from './utils/robloxParser';
import { LiveTikTokScreen } from './components/LiveTikTokScreen';
import { StreamerControlPanel } from './components/StreamerControlPanel';
import { ReviewScriptConfigModal } from './components/ReviewScriptConfigModal';

export default function App() {
  // TikTok Connection
  const [tiktokUsername, setTiktokUsername] = useState<string>('youneedheave');
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [connectionNotice, setConnectionNotice] = useState<string>('');

  // Queue & Current Account
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [currentQueueItem, setCurrentQueueItem] = useState<QueueItem | null>(null);
  const [currentAccount, setCurrentAccount] = useState<RobloxAccount | null>(null);

  // Live Chat Stream (Tracked in memory for processing)
  const [chatMessages, setChatMessages] = useState<LiveChatMessage[]>([]);

  // TTS State
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [speakingText, setSpeakingText] = useState<string>('');
  const [ttsConfig, setTtsConfig] = useState<TTSConfig>(DEFAULT_TTS_CONFIG);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);

  // UI State
  const [isViewSplit, setIsViewSplit] = useState<boolean>(true);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState<boolean>(false);
  const [activeAlert, setActiveAlert] = useState<{
    title: string;
    sender: string;
    type: string;
    amount: string;
  } | null>(null);

  // Refs for tracking async state without stale closures
  const isSpeakingRef = useRef<boolean>(false);
  isSpeakingRef.current = isSpeaking;

  const currentQueueItemRef = useRef<QueueItem | null>(null);
  currentQueueItemRef.current = currentQueueItem;

  const queueRef = useRef<QueueItem[]>(queue);
  queueRef.current = queue;

  // Load voices on mount
  useEffect(() => {
    const updateVoices = () => {
      const v = ttsService.getVoices();
      setAvailableVoices(v);
    };
    updateVoices();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }

    const unsubTTS = ttsService.subscribeState((speaking, text) => {
      setIsSpeaking(speaking);
      setSpeakingText(text);
    });

    return () => unsubTTS();
  }, []);

  // Sort queue by priority: VIP 10k > Fast Track > Regular, then FIFO
  const sortQueue = (items: QueueItem[]): QueueItem[] => {
    const tierPriority: Record<QueueTier, number> = {
      vip_10k: 1,
      fast_track_5k: 2,
      fast_track_coin: 3,
      regular: 4,
    };
    return [...items].sort((a, b) => {
      const prioA = tierPriority[a.tier];
      const prioB = tierPriority[b.tier];
      if (prioA !== prioB) return prioA - prioB;
      return a.timestamp - b.timestamp;
    });
  };

  // Play narration for given queue item & automatically advance on end
  const startReviewForItem = useCallback(
    async (item: QueueItem) => {
      setCurrentQueueItem(item);
      let account = item.accountData;
      if (!account || !account.avatarUrl) {
        account = await fetchRealRobloxProfile(item.username);
      }
      setCurrentAccount(account);

      // Sound alerts & confetti for VIP / Fast track
      if (item.tier === 'vip_10k') {
        soundEffects.playVipFanfare();
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
        });
        setActiveAlert({
          title: 'SUPER VIP 10.000 SOSIALBUZZ',
          sender: `@${item.requesterTikTok} (${item.username})`,
          type: 'vip_10k',
          amount: 'Rp 10.000',
        });
        setTimeout(() => setActiveAlert(null), 5000);
      } else if (item.tier === 'fast_track_coin' || item.tier === 'fast_track_5k') {
        soundEffects.playFastTrackAlert();
        setActiveAlert({
          title: item.tier === 'fast_track_coin' ? 'FAST TRACK 30 COIN (LOVE OREN)' : 'FAST TRACK 5.000 SOSIALBUZZ',
          sender: `@${item.requesterTikTok} (${item.username})`,
          type: 'fast_track',
          amount: item.tier === 'fast_track_coin' ? '30 Coin 🧡' : 'Rp 5.000 ⚡',
        });
        setTimeout(() => setActiveAlert(null), 4000);
      } else {
        soundEffects.playTomatoPop();
      }

      // Build Indonesian review speech & speak aloud
      const script = ttsService.buildReviewScript(account, item, ttsConfig);
      await ttsService.speak(script, ttsConfig, () => {
        soundEffects.playRatingDing(account!.starRating);
        // Automatically check if there is another queue item waiting
        setTimeout(() => {
          setQueue((prev) => {
            if (prev.length > 0) {
              const [next, ...rest] = prev;
              startReviewForItem(next);
              return rest;
            }
            return prev;
          });
        }, 1500);
      });
    },
    [ttsConfig]
  );

  // Advance to next queue item manually
  const advanceToNext = useCallback(() => {
    ttsService.stop();
    setQueue((prevQueue) => {
      if (prevQueue.length === 0) {
        return prevQueue;
      }
      const [nextItem, ...remaining] = prevQueue;
      setTimeout(() => {
        startReviewForItem(nextItem);
      }, 300);
      return remaining;
    });
  }, [startReviewForItem]);

  // Push new username into queue (fetches real Roblox API immediately!)
  const enqueueRobloxUser = useCallback(
    async (
      rawUsername: string,
      tier: QueueTier = 'regular',
      requesterTikTok: string = 'penonton_live',
      giftType?: string,
      amount?: number
    ) => {
      const username = rawUsername.trim().replace(/^@/, '');
      if (!username) return;

      // Fetch authentic real profile from Roblox API directly
      const accountData = await fetchRealRobloxProfile(username);

      const newItem: QueueItem = {
        id: `q-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        username: accountData.username || username,
        requesterTikTok,
        tier,
        timestamp: Date.now(),
        giftType,
        amount,
        accountData,
        status: 'waiting',
      };

      setQueue((prev) => {
        const sorted = sortQueue([...prev, newItem]);
        // If nothing is currently being reviewed or spoken, immediately review!
        if (!currentQueueItemRef.current && !isSpeakingRef.current) {
          const [first, ...rest] = sorted;
          setTimeout(() => startReviewForItem(first), 200);
          return rest;
        }
        return sorted;
      });
    },
    [startReviewForItem]
  );

  // Handle incoming live comments: detects Roblox username & immediately triggers review!
  const handleIncomingComment = useCallback(
    (rawComment: string, user: string = 'penonton') => {
      setChatMessages((prev) => [
        ...prev.slice(-30),
        {
          id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          user,
          avatarUrl: '',
          message: rawComment,
          timestamp: Date.now(),
        },
      ]);

      // REVISION 4: Check if there is a Roblox username and immediately trigger review!
      const detectedUsername = extractRobloxUsername(rawComment);
      if (detectedUsername) {
        enqueueRobloxUser(detectedUsername, 'regular', user);
      }
    },
    [enqueueRobloxUser]
  );

  // Connect to TikTok Live room
  const connectToTikTok = useCallback(async (targetUsername: string, signApiKey?: string) => {
    const cleanUser = targetUsername.trim().replace(/^@/, '');
    if (!cleanUser) return;
    setIsConnecting(true);
    setConnectionNotice(`Menghubungkan ke live @${cleanUser} via zerodytrash/TikTok-Live-Connector...`);

    try {
      const res = await fetch('/api/tiktok/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: cleanUser, signApiKey }),
      });
      const data = await res.json();
      setIsConnecting(false);

      if (data.success && data.liveState) {
        setIsConnected(true);
        setConnectionNotice(
          data.liveState.lastMessage ||
          `🟢 Terhubung ke Live @${cleanUser} via zerodytrash/TikTok-Live-Connector!`
        );
      } else {
        setIsConnected(true);
        setConnectionNotice(
          data.message || `Mode live streamer aktif untuk @${cleanUser}. Komentar penonton langsung direview.`
        );
      }
    } catch {
      setIsConnecting(false);
      setIsConnected(true);
      setConnectionNotice(`Mode live streamer aktif untuk @${cleanUser}.`);
    }
  }, []);

  const disconnectFromTikTok = useCallback(async () => {
    try {
      await fetch('/api/tiktok/disconnect', { method: 'POST' });
    } catch {
      // Ignore
    }
    setIsConnected(false);
    setConnectionNotice('Koneksi live dinonaktifkan.');
  }, []);

  // Subscribe to real Server-Sent Events (SSE) from TikTok Live connector
  useEffect(() => {
    let es: EventSource | null = null;
    try {
      es = new EventSource('/api/tiktok/events');

      es.addEventListener('chat', (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data);
          handleIncomingComment(data.message, data.user);
        } catch (e) {
          console.warn('Chat event error:', e);
        }
      });

      es.addEventListener('gift', (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data);
          const diamonds = Number(data.diamondCount) || 0;
          const user = data.user || 'sultan_tiktok';
          if (diamonds >= 100) {
            enqueueRobloxUser(user, 'vip_10k', user, data.giftName, diamonds);
          } else {
            enqueueRobloxUser(user, 'fast_track_coin', user, data.giftName, diamonds);
          }
        } catch (e) {
          console.warn('Gift event error:', e);
        }
      });

      es.addEventListener('status', (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data);
          if (data.connected && data.isLive) {
            setIsConnected(true);
          }
          if (data.lastMessage) {
            setConnectionNotice(data.lastMessage);
          }
        } catch (e) {
          console.warn('Status event error:', e);
        }
      });
    } catch (e) {
      console.warn('EventSource connection error:', e);
    }

    // Auto connect to @youneedheave
    connectToTikTok('youneedheave');

    return () => {
      if (es) es.close();
    };
  }, [connectToTikTok, handleIncomingComment, enqueueRobloxUser]);

  // Initial Hero Account: fetch real "mrafiumri" from Roblox directly on mount!
  useEffect(() => {
    async function loadInitialHero() {
      const initialUser = 'mrafiumri';
      const realProfile = await fetchRealRobloxProfile(initialUser);

      const initialItem: QueueItem = {
        id: 'hero-1',
        username: realProfile.username || initialUser,
        requesterTikTok: 'mrafiumri',
        tier: 'vip_10k', // showcase Super VIP on hero!
        timestamp: Date.now(),
        accountData: realProfile,
        status: 'reviewing',
      };

      setCurrentQueueItem(initialItem);
      setCurrentAccount(realProfile);

      // Seed queue with authentic users
      const secondProfile = await fetchRealRobloxProfile('DenisDaily');
      const secondItem: QueueItem = {
        id: 'q-demo-2',
        username: secondProfile.username || 'DenisDaily',
        requesterTikTok: 'andi_gamer',
        tier: 'fast_track_coin',
        timestamp: Date.now() + 1000,
        accountData: secondProfile,
        status: 'waiting',
      };

      setQueue([secondItem]);
    }

    loadInitialHero();
  }, []);

  // Fast track trigger helper
  const handleTriggerSimulatedGift = (tier: QueueTier, simulatedUsername: string) => {
    enqueueRobloxUser(simulatedUsername, tier, 'viewer_vip_tiktok');
  };

  // Sound trigger helper
  const handlePlaySound = (type: 'fast_track' | 'vip' | 'ding' | 'pop') => {
    if (type === 'fast_track') soundEffects.playFastTrackAlert();
    else if (type === 'vip') soundEffects.playVipFanfare();
    else if (type === 'ding') soundEffects.playRatingDing(4);
    else if (type === 'pop') soundEffects.playTomatoPop();
  };

  const nextQueueItem = queue.length > 0 ? queue[0] : null;

  return (
    <div className="flex w-screen h-screen bg-slate-950 overflow-hidden font-sans select-none">
      {/* 9:16 LIVE TIKTOK BROADCAST SCREEN (CLEAN: NO CHAT, NO HEARTS, REAL ROBLOX AVATAR) */}
      <div
        className={`relative flex items-center justify-center p-2 transition-all duration-300 ${
          isViewSplit ? 'w-full lg:w-[480px] xl:w-[520px] shrink-0' : 'w-full'
        } h-full bg-black/90`}
      >
        <div className="relative w-full max-w-[420px] aspect-[9/16] max-h-full rounded-2xl overflow-hidden shadow-2xl border border-white/10 ring-1 ring-white/5">
          <LiveTikTokScreen
            currentAccount={currentAccount}
            currentQueueItem={currentQueueItem}
            nextQueueItem={nextQueueItem}
            isSpeaking={isSpeaking}
            speakingText={speakingText}
            tiktokUsername={tiktokUsername}
            activeAlert={activeAlert}
          />

          {/* Toggle button if split is hidden */}
          {!isViewSplit && (
            <button
              onClick={() => setIsViewSplit(true)}
              className="absolute top-4 right-4 z-40 bg-indigo-600/90 hover:bg-indigo-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg border border-indigo-400/40 backdrop-blur-md flex items-center gap-1.5"
            >
              <span>⚙️ Buka Studio Panel</span>
            </button>
          )}
        </div>
      </div>

      {/* STREAMER STUDIO CONTROL ROOM (Visible in Split Mode) */}
      {isViewSplit && (
        <div className="hidden lg:flex flex-1 h-full min-w-0">
          <StreamerControlPanel
            tiktokUsername={tiktokUsername}
            onSetTiktokUsername={(u) => setTiktokUsername(u)}
            isConnected={isConnected}
            isConnecting={isConnecting}
            connectionNotice={connectionNotice}
            onToggleConnect={(key) => {
              if (isConnected) {
                disconnectFromTikTok();
              } else {
                connectToTikTok(tiktokUsername, key);
              }
            }}
            queue={queue}
            currentQueueItem={currentQueueItem}
            onNextQueue={advanceToNext}
            onAddManualQueue={(user, tier) => enqueueRobloxUser(user, tier, 'manual_streamer')}
            onRemoveQueueItem={(id) => setQueue((prev) => prev.filter((i) => i.id !== id))}
            onPromoteQueueItem={(id, tier) => {
              setQueue((prev) =>
                sortQueue(prev.map((i) => (i.id === id ? { ...i, tier } : i)))
              );
            }}
            isSpeaking={isSpeaking}
            onPlayCurrentTTS={() => {
              if (currentQueueItem && currentAccount) {
                const script = ttsService.buildReviewScript(currentAccount, currentQueueItem, ttsConfig);
                ttsService.speak(script, ttsConfig, () => {
                  soundEffects.playRatingDing(currentAccount.starRating);
                });
              }
            }}
            onStopTTS={() => ttsService.stop()}
            ttsConfig={ttsConfig}
            onUpdateTTSConfig={(c) => setTtsConfig((prev) => ({ ...prev, ...c }))}
            onOpenConfigModal={() => setIsConfigModalOpen(true)}
            onTriggerSimulatedGift={handleTriggerSimulatedGift}
            onSimulateComment={handleIncomingComment}
            onPlaySound={handlePlaySound}
            isViewSplit={isViewSplit}
            onToggleViewMode={() => setIsViewSplit(!isViewSplit)}
          />
        </div>
      )}

      {/* SCRIPT CONFIG MODAL */}
      <ReviewScriptConfigModal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        config={ttsConfig}
        availableVoices={availableVoices}
        onSaveConfig={(newConfig) => setTtsConfig(newConfig)}
      />
    </div>
  );
}
