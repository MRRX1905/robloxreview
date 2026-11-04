import React, { useState } from 'react';
import {
  Play,
  Square,
  SkipForward,
  Plus,
  Volume2,
  Settings,
  Heart,
  Crown,
  Zap,
  Radio,
  CheckCircle,
  MessageSquare,
  Sparkles,
  RefreshCw,
  Send,
  Trash2,
  Tv,
  Key,
  ExternalLink,
} from 'lucide-react';
import { QueueItem, QueueTier, TTSConfig } from '../types';
import { extractRobloxUsername } from '../utils/robloxParser';

interface StreamerControlPanelProps {
  tiktokUsername: string;
  onSetTiktokUsername: (username: string) => void;
  isConnected: boolean;
  isConnecting?: boolean;
  connectionNotice?: string;
  onToggleConnect: (signApiKey?: string) => void;
  queue: QueueItem[];
  currentQueueItem: QueueItem | null;
  onNextQueue: () => void;
  onAddManualQueue: (username: string, tier: QueueTier) => void;
  onRemoveQueueItem: (id: string) => void;
  onPromoteQueueItem: (id: string, tier: QueueTier) => void;
  isSpeaking: boolean;
  onPlayCurrentTTS: () => void;
  onStopTTS: () => void;
  ttsConfig: TTSConfig;
  onUpdateTTSConfig: (newConfig: Partial<TTSConfig>) => void;
  onOpenConfigModal: () => void;
  onTriggerSimulatedGift: (tier: QueueTier, simulatedUsername: string) => void;
  onSimulateComment: (comment: string, user: string) => void;
  onPlaySound: (type: 'fast_track' | 'vip' | 'ding' | 'pop') => void;
  isViewSplit: boolean;
  onToggleViewMode: () => void;
}

export const StreamerControlPanel: React.FC<StreamerControlPanelProps> = ({
  tiktokUsername,
  onSetTiktokUsername,
  isConnected,
  isConnecting = false,
  connectionNotice = '',
  onToggleConnect,
  queue,
  currentQueueItem,
  onNextQueue,
  onAddManualQueue,
  onRemoveQueueItem,
  onPromoteQueueItem,
  isSpeaking,
  onPlayCurrentTTS,
  onStopTTS,
  ttsConfig,
  onUpdateTTSConfig,
  onOpenConfigModal,
  onTriggerSimulatedGift,
  onSimulateComment,
  onPlaySound,
  isViewSplit,
  onToggleViewMode,
}) => {
  const [inputUsername, setInputUsername] = useState('');
  const [selectedTier, setSelectedTier] = useState<QueueTier>('regular');
  const [commentInput, setCommentInput] = useState('mrafiumri');
  const [commenterName, setCommenterName] = useState('penonton_tiktok');
  const [tempTiktok, setTempTiktok] = useState(tiktokUsername);
  const [signApiKey, setSignApiKey] = useState('');
  const [showAdvancedConnector, setShowAdvancedConnector] = useState(false);

  const handleSimulateChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) return;
    onSimulateComment(commentInput.trim(), commenterName.trim() || 'user_live');
    setCommentInput('');
  };

  const handleManualAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputUsername.trim()) return;
    onAddManualQueue(inputUsername.trim(), selectedTier);
    setInputUsername('');
  };

  const detectedFromInput = extractRobloxUsername(commentInput);

  return (
    <div className="flex flex-col h-full bg-slate-900 border-l border-slate-800 text-slate-100 overflow-y-auto">
      {/* 1. TOP HEADER & TIKTOK LIVE CONNECTION BAR */}
      <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center font-black text-white shadow">
              <Radio className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="font-bold text-sm text-white">Streamer Studio Control</h2>
                <a
                  href="https://github.com/zerodytrash/TikTok-Live-Connector"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-0.5 bg-black/60 hover:bg-black/90 text-zinc-300 hover:text-white px-1.5 py-0.2 rounded text-[9px] border border-white/10 transition"
                  title="Powered by zerodytrash/TikTok-Live-Connector"
                >
                  <span>TikTok-Live-Connector</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>
              <p className="text-[11px] text-slate-400">Review Roblox Otomatis Real-time</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onToggleViewMode}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all border ${
                isViewSplit
                  ? 'bg-indigo-600/30 border-indigo-500/50 text-indigo-300'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
              }`}
            >
              <Tv className="w-3.5 h-3.5" />
              <span>{isViewSplit ? 'Layar 9:16 Saja' : 'Mode Split Studio'}</span>
            </button>
            <button
              onClick={onOpenConfigModal}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
              title="Konfigurasi Teks Bacaan & Formula Rating"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* TIKTOK LIVE CONNECTION BAR (POWERED BY zerodytrash/TikTok-Live-Connector) */}
        <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-slate-300 flex items-center gap-1.5">
              <span className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
              TikTok-Live-Connector:
            </span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                isConnected
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : isConnecting
                  ? 'bg-sky-500/20 text-sky-300'
                  : 'bg-amber-500/20 text-amber-300'
              }`}
            >
              {isConnecting
                ? 'Menghubungkan...'
                : isConnected
                ? '🟢 Terhubung Webcast'
                : 'Mode Siaga'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <span className="absolute left-3 top-2 text-slate-500 text-xs">@</span>
              <input
                type="text"
                value={tempTiktok}
                onChange={(e) => setTempTiktok(e.target.value)}
                placeholder="username tiktok live (cth: youneedheave)"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-7 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <button
              onClick={() => {
                onSetTiktokUsername(tempTiktok);
                onToggleConnect(signApiKey);
              }}
              disabled={isConnecting}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow flex items-center gap-1.5 ${
                isConnected
                  ? 'bg-rose-600 hover:bg-rose-700 text-white'
                  : 'bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white'
              }`}
            >
              {isConnecting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Connecting...</span>
                </>
              ) : isConnected ? (
                'Putuskan'
              ) : (
                'Connect Live'
              )}
            </button>
          </div>

          {/* Advanced EulerStream Key & Options toggle */}
          <div className="flex items-center justify-between text-[10px] pt-1">
            <button
              type="button"
              onClick={() => setShowAdvancedConnector(!showAdvancedConnector)}
              className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium"
            >
              <Key className="w-3 h-3" />
              <span>{showAdvancedConnector ? 'Sembunyikan Pengaturan API Key' : 'Opsi EulerStream API Key (Opsional)'}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setTempTiktok('youneedheave');
                onSetTiktokUsername('youneedheave');
              }}
              className="text-slate-400 hover:text-white underline font-semibold"
            >
              Set @youneedheave
            </button>
          </div>

          {showAdvancedConnector && (
            <div className="bg-black/50 p-2.5 rounded-lg border border-white/10 flex flex-col gap-1.5 text-xs">
              <label className="text-[10px] font-bold text-slate-300">
                EulerStream signApiKey (Opsional untuk kuota khusus):
              </label>
              <input
                type="text"
                value={signApiKey}
                onChange={(e) => setSignApiKey(e.target.value)}
                placeholder="Masukkan API Key EulerStream (jika ada)"
                className="bg-slate-950 border border-slate-700 rounded p-1.5 text-xs text-white focus:outline-none"
              />
              <span className="text-[9px] text-slate-400">
                * Default gratis tanpa API key sudah langsung berjalan via pool umum tiktok-live-connector.
              </span>
            </div>
          )}

          {connectionNotice && (
            <div
              className={`p-2 rounded-lg text-[11px] leading-snug border flex items-center gap-1.5 ${
                isConnected
                  ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-200'
                  : 'bg-amber-950/40 border-amber-500/30 text-amber-200'
              }`}
            >
              <span>{isConnected ? '🟢' : 'ℹ️'}</span>
              <span>{connectionNotice}</span>
            </div>
          )}
        </div>
      </div>

      <div className="p-4 flex-1 flex flex-col gap-4 overflow-y-auto">
        {/* 2. AUTO ROBLOX COMMENT INGESTION */}
        <div className="bg-slate-950/70 p-3.5 rounded-xl border border-indigo-500/30 shadow">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-white">
              <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
              <span>Input Komentar Live (Cek Akun & Langsung Bacakan)</span>
            </div>
            <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full font-medium">
              Webcast Parser
            </span>
          </div>

          <form onSubmit={handleSimulateChat} className="flex flex-col gap-2">
            <div className="grid grid-cols-3 gap-2">
              <input
                type="text"
                value={commenterName}
                onChange={(e) => setCommenterName(e.target.value)}
                placeholder="Pengirim (cth: penonton)"
                className="col-span-1 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none"
              />
              <input
                type="text"
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                placeholder="Komentar (cth: review mrafiumri dong bang)"
                className="col-span-2 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
              />
            </div>

            {detectedFromInput && (
              <div className="flex items-center justify-between bg-emerald-950/50 border border-emerald-500/40 px-2.5 py-1 rounded-lg text-xs">
                <span className="text-emerald-300 text-[11px] flex items-center gap-1">
                  <CheckCircle className="w-3 h-3 text-emerald-400" />
                  Terdeteksi Roblox: <strong>@{detectedFromInput}</strong>
                </span>
                <span className="text-[10px] text-emerald-400 font-bold uppercase">
                  ⚡ Siap Langsung Dibacakan
                </span>
              </div>
            )}

            <div className="flex items-center gap-2">
              <button
                type="submit"
                className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold py-1.5 px-3 rounded-lg flex items-center justify-center gap-1.5 transition shadow"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Kirim Komentar Live</span>
              </button>
            </div>
          </form>

          {/* Quick preset Roblox username buttons */}
          <div className="mt-2.5 pt-2 border-t border-slate-800 flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] text-slate-400">Tes Akun Cepat:</span>
            {['mrafiumri', 'DenisDaily', 'Builderman', 'KreekCraft'].map((name) => (
              <button
                key={name}
                type="button"
                onClick={() => onSimulateComment(name, 'viewer_tiktok')}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[10px] font-bold px-2 py-0.5 rounded-md border border-slate-700 transition"
              >
                @{name}
              </button>
            ))}
          </div>
        </div>

        {/* 3. CURRENT ACTIVE REVIEW STATUS & TTS ACTIONS */}
        <div className="bg-slate-950/80 p-3.5 rounded-xl border border-indigo-500/30 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Sedang Ditampilkan di Layar 9:16
            </span>
            <div className="flex items-center gap-1">
              {isSpeaking ? (
                <button
                  onClick={onStopTTS}
                  className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 transition"
                >
                  <Square className="w-3 h-3" /> Stop Suara
                </button>
              ) : (
                <button
                  onClick={onPlayCurrentTTS}
                  disabled={!currentQueueItem}
                  className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 transition"
                >
                  <Volume2 className="w-3 h-3" /> Bacakan Ulang
                </button>
              )}
              <button
                onClick={onNextQueue}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 transition border border-slate-700"
              >
                <SkipForward className="w-3 h-3" /> Berikutnya
              </button>
            </div>
          </div>

          {currentQueueItem ? (
            <div className="flex items-center justify-between bg-slate-900 p-2.5 rounded-lg border border-slate-800">
              <div className="flex items-center gap-2.5">
                {currentQueueItem.accountData?.headshotUrl ? (
                  <img
                    src={currentQueueItem.accountData.headshotUrl}
                    alt=""
                    className="w-10 h-10 rounded-lg bg-slate-800 object-cover border border-white/20 shrink-0"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center font-bold text-indigo-300 text-sm">
                    🎮
                  </div>
                )}
                <div>
                  <div className="font-extrabold text-sm text-white flex items-center gap-1.5">
                    @{currentQueueItem.username}
                    {currentQueueItem.tier === 'vip_10k' && (
                      <span className="bg-amber-400 text-black text-[9px] font-black px-1.5 rounded">
                        SUPER VIP 10K
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Display:{' '}
                    <span className="text-slate-200 font-medium">
                      {currentQueueItem.accountData?.displayName || currentQueueItem.username}
                    </span>{' '}
                    • {currentQueueItem.accountData?.joinYear}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-black text-amber-400 block">
                  ⭐ {currentQueueItem.accountData?.starRating} / 5.0
                </span>
                <span className="text-[10px] text-emerald-400 font-bold">
                  {currentQueueItem.accountData?.totalRobux.toLocaleString('id-ID')} R$
                </span>
              </div>
            </div>
          ) : (
            <div className="text-center py-4 bg-slate-900/50 rounded-lg border border-slate-800/80 text-slate-400 text-xs">
              Antrean kosong. Ketik komentar live di atas untuk mereview.
            </div>
          )}
        </div>

        {/* 4. FAST TRACK DONATION SIMULATOR SHORTCUTS */}
        <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
          <div className="text-xs font-bold text-white mb-2 flex items-center justify-between">
            <span>⚡ Jalur Cepat (Fast Track & Super VIP)</span>
            <span className="text-[10px] text-slate-400">Pemicu Gift</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => onTriggerSimulatedGift('fast_track_coin', 'bocil_koin30')}
              className="bg-orange-500/15 hover:bg-orange-500/25 border border-orange-500/40 p-2.5 rounded-xl text-left transition flex flex-col gap-1 group"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm">🧡</span>
                <span className="text-[9px] font-bold bg-orange-500 text-white px-1.5 rounded">
                  30 COIN
                </span>
              </div>
              <span className="text-xs font-bold text-orange-200">Love Oren</span>
              <span className="text-[10px] text-slate-400">Potong antrean cepat</span>
            </button>

            <button
              onClick={() => onTriggerSimulatedGift('fast_track_5k', 'gamer_saweria5k')}
              className="bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 p-2.5 rounded-xl text-left transition flex flex-col gap-1 group"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm">⚡</span>
                <span className="text-[9px] font-bold bg-emerald-500 text-white px-1.5 rounded">
                  Rp 5.000
                </span>
              </div>
              <span className="text-xs font-bold text-emerald-200">Sosialbuzz 5K</span>
              <span className="text-[10px] text-slate-400">Jalur Prioritas</span>
            </button>

            <button
              onClick={() => onTriggerSimulatedGift('vip_10k', 'mrafiumri')}
              className="bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 p-2.5 rounded-xl text-left transition flex flex-col gap-1 group ring-1 ring-amber-400/30"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm">👑</span>
                <span className="text-[9px] font-black bg-amber-400 text-black px-1.5 rounded">
                  Rp 10.000
                </span>
              </div>
              <span className="text-xs font-black text-amber-200">Super VIP 10K</span>
              <span className="text-[10px] text-slate-400">Pop-up Item Lengkap</span>
            </button>
          </div>
        </div>

        {/* 5. MANUAL ADD QUEUE */}
        <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
          <div className="text-xs font-bold text-white mb-2">
            Tambah Manual Username Roblox
          </div>
          <form onSubmit={handleManualAdd} className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={inputUsername}
                onChange={(e) => setInputUsername(e.target.value)}
                placeholder="Username Roblox (cth: mrafiumri)"
                className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none"
              />
              <select
                value={selectedTier}
                onChange={(e) => setSelectedTier(e.target.value as QueueTier)}
                className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-200 focus:outline-none"
              >
                <option value="regular">Biasa (Free)</option>
                <option value="fast_track_coin">🧡 Love Oren (30 Coin)</option>
                <option value="fast_track_5k">⚡ 5K Fast Track</option>
                <option value="vip_10k">👑 10K Super VIP</option>
              </select>
            </div>
            <button
              type="submit"
              className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-xs font-bold py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition"
            >
              <Plus className="w-3.5 h-3.5" /> Tambah ke Antrean
            </button>
          </form>
        </div>

        {/* 6. QUEUE LIST BY TIERS */}
        <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 flex-1 flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-white">
              Daftar Antrean Akun ({queue.length})
            </span>
            <span className="text-[10px] text-slate-400">
              Prioritas: VIP 10K &gt; Fast Track &gt; Biasa
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 max-h-56">
            {queue.length === 0 ? (
              <div className="text-center py-6 text-slate-500 text-xs">
                Belum ada antrean akun roblox
              </div>
            ) : (
              queue.map((item, index) => (
                <div
                  key={item.id}
                  className={`flex items-center justify-between p-2 rounded-lg border text-xs ${
                    item.tier === 'vip_10k'
                      ? 'bg-amber-950/30 border-amber-500/40 text-amber-200'
                      : item.tier === 'fast_track_coin' || item.tier === 'fast_track_5k'
                      ? 'bg-orange-950/30 border-orange-500/40 text-orange-200'
                      : 'bg-slate-900 border-slate-800 text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-500 text-[11px] w-4">
                      #{index + 1}
                    </span>
                    <div>
                      <div className="font-bold text-white flex items-center gap-1">
                        @{item.username}
                        {item.tier === 'vip_10k' && (
                          <span className="bg-amber-400 text-black text-[9px] font-black px-1 rounded">
                            VIP 10K
                          </span>
                        )}
                        {item.tier === 'fast_track_coin' && (
                          <span className="bg-orange-500 text-white text-[9px] font-bold px-1 rounded">
                            30 COIN
                          </span>
                        )}
                        {item.tier === 'fast_track_5k' && (
                          <span className="bg-emerald-500 text-white text-[9px] font-bold px-1 rounded">
                            5K
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400">
                        Dari live @{item.requesterTikTok}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    {item.tier !== 'vip_10k' && (
                      <button
                        onClick={() => onPromoteQueueItem(item.id, 'vip_10k')}
                        title="Promosikan ke Super VIP"
                        className="p-1 hover:bg-amber-500/20 text-amber-400 rounded"
                      >
                        <Crown className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      onClick={() => onRemoveQueueItem(item.id)}
                      title="Hapus dari antrean"
                      className="p-1 hover:bg-rose-500/20 text-rose-400 rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 7. SOUND EFFECTS & ALERTS */}
        <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
          <div className="text-xs font-bold text-white mb-2">
            <span>🔊 Sound Alerts</span>
          </div>

          <div className="grid grid-cols-4 gap-1.5">
            <button
              onClick={() => onPlaySound('pop')}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold py-1.5 rounded-lg border border-slate-700 transition text-center"
            >
              🔔 Pop
            </button>
            <button
              onClick={() => onPlaySound('ding')}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold py-1.5 rounded-lg border border-slate-700 transition text-center"
            >
              ⭐ Ding
            </button>
            <button
              onClick={() => onPlaySound('fast_track')}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold py-1.5 rounded-lg border border-slate-700 transition text-center"
            >
              ⚡ Fast Track
            </button>
            <button
              onClick={() => onPlaySound('vip')}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold py-1.5 rounded-lg border border-slate-700 transition text-center"
            >
              👑 Fanfare
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
