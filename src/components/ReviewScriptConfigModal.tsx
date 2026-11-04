import React, { useState } from 'react';
import { X, Volume2, Sparkles, Sliders, RotateCcw, Check } from 'lucide-react';
import { TTSConfig } from '../types';
import { DEFAULT_TTS_CONFIG } from '../services/ttsService';

interface ReviewScriptConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: TTSConfig;
  availableVoices: SpeechSynthesisVoice[];
  onSaveConfig: (newConfig: TTSConfig) => void;
}

export const ReviewScriptConfigModal: React.FC<ReviewScriptConfigModalProps> = ({
  isOpen,
  onClose,
  config,
  availableVoices,
  onSaveConfig,
}) => {
  const [localConfig, setLocalConfig] = useState<TTSConfig>({ ...config });
  const [showSavedFeedback, setShowSavedFeedback] = useState(false);

  if (!isOpen) return null;

  const handleApplyPreset = (style: TTSConfig['reviewStyle']) => {
    if (style === 'roasting') {
      setLocalConfig((prev) => ({
        ...prev,
        reviewStyle: 'roasting',
        templateIntro: 'Waduh waduh! Ada akun misterius dari {username}! Siap-siap kena roasting jujur ya!',
        templateSocial: 'Teman ada {friends}, followers {followers}, yang dia follow ada {following}. Lumayan aktif di warnet kayaknya.',
        templateItems: 'Pakai {item_count} aksesoris dengan modal {total_robux} Robux. Tapi kombinasinya unik banget nih.',
        templateRating: 'Skor keseluruhan untuk avatar {username} dapet {star_rating} dari 5 bintang! Lumayan lah ya.',
      }));
    } else if (style === 'sultan_vip') {
      setLocalConfig((prev) => ({
        ...prev,
        reviewStyle: 'sultan_vip',
        templateIntro: 'Perhatian semuanya! Sambut kedatangan akun sultan terhormat {username}!',
        templateSocial: 'Akun berkelas dengan {friends} teman dan {followers} pengikut setia!',
        templateItems: 'Avatar ini berbalut {item_count} item mewah bernilai {total_robux} Robux!',
        templateRating: 'Rating luar biasa untuk {username} adalah {star_rating} dari 5 bintang emas berkilau!',
      }));
    } else {
      setLocalConfig((prev) => ({
        ...prev,
        reviewStyle: 'santai',
        templateIntro: DEFAULT_TTS_CONFIG.templateIntro,
        templateSocial: DEFAULT_TTS_CONFIG.templateSocial,
        templateItems: DEFAULT_TTS_CONFIG.templateItems,
        templateRating: DEFAULT_TTS_CONFIG.templateRating,
      }));
    }
  };

  const handleSave = () => {
    onSaveConfig(localConfig);
    setShowSavedFeedback(true);
    setTimeout(() => {
      setShowSavedFeedback(false);
      onClose();
    }, 600);
  };

  const handleReset = () => {
    setLocalConfig({ ...DEFAULT_TTS_CONFIG });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden text-slate-100">
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-indigo-400" />
            <h3 className="font-bold text-base text-white">
              Konfigurasi Suara & Teks Review
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          {/* Preset Styles */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Preset Gaya Review
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleApplyPreset('santai')}
                className={`p-2.5 rounded-xl border text-left transition ${
                  localConfig.reviewStyle === 'santai'
                    ? 'bg-indigo-600/30 border-indigo-500 text-indigo-200'
                    : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div className="font-bold text-xs flex items-center gap-1">
                  🌟 Santai & Ramah
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  Natural & menyenangkan
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleApplyPreset('roasting')}
                className={`p-2.5 rounded-xl border text-left transition ${
                  localConfig.reviewStyle === 'roasting'
                    ? 'bg-rose-600/30 border-rose-500 text-rose-200'
                    : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div className="font-bold text-xs flex items-center gap-1">
                  🔥 Roasting / Lucu
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  Bikin penonton ketawa
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleApplyPreset('sultan_vip')}
                className={`p-2.5 rounded-xl border text-left transition ${
                  localConfig.reviewStyle === 'sultan_vip'
                    ? 'bg-amber-600/30 border-amber-500 text-amber-200'
                    : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div className="font-bold text-xs flex items-center gap-1">
                  👑 Sultan & Flex
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  Pujian mewah & formal
                </div>
              </button>
            </div>
          </div>

          {/* Voice Engine Settings */}
          <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-white">
              <Volume2 className="w-4 h-4 text-emerald-400" />
              <span>Pengaturan Suara Robot (Web Speech TTS)</span>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">
                Pilih Suara (Voice)
              </label>
              <select
                value={localConfig.selectedVoiceName}
                onChange={(e) =>
                  setLocalConfig({ ...localConfig, selectedVoiceName: e.target.value })
                }
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none"
              >
                <option value="">Otomatis (Paling Cocok / Bahasa Indonesia)</option>
                {availableVoices.map((v) => (
                  <option key={v.name} value={v.name}>
                    {v.name} ({v.lang}) {v.default ? '★' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between text-xs text-slate-300 mb-1">
                  <span>Kecepatan Bicara</span>
                  <span className="font-bold text-indigo-400">{localConfig.voiceRate}x</span>
                </div>
                <input
                  type="range"
                  min="0.7"
                  max="1.5"
                  step="0.05"
                  value={localConfig.voiceRate}
                  onChange={(e) =>
                    setLocalConfig({ ...localConfig, voiceRate: parseFloat(e.target.value) })
                  }
                  className="w-full accent-indigo-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-300 mb-1">
                  <span>Nada Suara (Pitch)</span>
                  <span className="font-bold text-indigo-400">{localConfig.voicePitch}x</span>
                </div>
                <input
                  type="range"
                  min="0.7"
                  max="1.4"
                  step="0.05"
                  value={localConfig.voicePitch}
                  onChange={(e) =>
                    setLocalConfig({ ...localConfig, voicePitch: parseFloat(e.target.value) })
                  }
                  className="w-full accent-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Template Text Customization */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Template Teks Bacaan Otomatis
              </span>
              <span className="text-[10px] text-slate-400">
                Variabel: {'{username}'}, {'{friends}'}, {'{followers}'}, {'{star_rating}'}
              </span>
            </div>

            <div>
              <label className="block text-[11px] text-slate-400 mb-1">
                Teks Pembuka (Intro)
              </label>
              <textarea
                rows={2}
                value={localConfig.templateIntro}
                onChange={(e) =>
                  setLocalConfig({ ...localConfig, templateIntro: e.target.value })
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] text-slate-400 mb-1">
                Teks Data Sosial (Teman & Followers)
              </label>
              <textarea
                rows={2}
                value={localConfig.templateSocial}
                onChange={(e) =>
                  setLocalConfig({ ...localConfig, templateSocial: e.target.value })
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] text-slate-400 mb-1">
                Teks Penilaian Bintang (Rating 1 - 5)
              </label>
              <textarea
                rows={2}
                value={localConfig.templateRating}
                onChange={(e) =>
                  setLocalConfig({ ...localConfig, templateRating: e.target.value })
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
          <button
            type="button"
            onClick={handleReset}
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Pengaturan Awal</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:bg-slate-800 transition"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1.5 transition shadow"
            >
              {showSavedFeedback ? (
                <>
                  <Check className="w-3.5 h-3.5" /> Tersimpan!
                </>
              ) : (
                'Simpan Konfigurasi'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
