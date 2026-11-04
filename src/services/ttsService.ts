import { RobloxAccount, QueueItem, TTSConfig } from '../types';

export const DEFAULT_TTS_CONFIG: TTSConfig = {
  voiceRate: 1.05,
  voicePitch: 1.0,
  voiceVolume: 1.0,
  selectedVoiceName: '',
  reviewStyle: 'santai',
  templateIntro: 'Halo semuanya! Saatnya kita review akun Roblox dari {username}. Mari kita intip profilnya!',
  templateSocial: 'Akun ini punya {friends} pertemanan, {followers} pengikut, dan mengikuti {following} akun.',
  templateItems: 'Avatar ini menggunakan {item_count} item aksesoris dengan total harga sekitar {total_robux} Robux.',
  templateRating: 'Penilaian keseluruhan untuk avatar {username} adalah {star_rating} dari 5 bintang!',
  templateVIPExtra: 'Spesial VIP 10 Ribu Rupiah! Rincian item: {items_detail}. Total estimasi nilai avatar mencapai {rupiah_estimate} Rupiah!',
};

class TTSService {
  private synth: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private availableVoices: SpeechSynthesisVoice[] = [];
  private isSpeaking: boolean = false;
  private onStateChangeCallbacks: Set<(isSpeaking: boolean, text: string) => void> = new Set();
  private currentText: string = '';

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.loadVoices();
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.loadVoices();
      }
    }
  }

  private loadVoices() {
    if (!this.synth) return;
    this.availableVoices = this.synth.getVoices();
  }

  public getVoices(): SpeechSynthesisVoice[] {
    if (!this.synth) return [];
    if (this.availableVoices.length === 0) {
      this.availableVoices = this.synth.getVoices();
    }
    return this.availableVoices;
  }

  public getIndonesianVoice(): SpeechSynthesisVoice | undefined {
    const voices = this.getVoices();
    return (
      voices.find((v) => v.lang.startsWith('id') || v.lang.includes('ID') || v.name.toLowerCase().includes('indonesia')) ||
      voices.find((v) => v.default) ||
      voices[0]
    );
  }

  public subscribeState(cb: (isSpeaking: boolean, currentText: string) => void) {
    this.onStateChangeCallbacks.add(cb);
    cb(this.isSpeaking, this.currentText);
    return () => {
      this.onStateChangeCallbacks.delete(cb);
    };
  }

  private notify(isSpeaking: boolean, text: string) {
    this.isSpeaking = isSpeaking;
    this.currentText = text;
    this.onStateChangeCallbacks.forEach((cb) => cb(isSpeaking, text));
  }

  public stop() {
    if (this.synth) {
      this.synth.cancel();
      this.notify(false, '');
    }
  }

  public buildReviewScript(account: RobloxAccount, queueItem: QueueItem, config: TTSConfig): string {
    const isVip = queueItem.tier === 'vip_10k';
    const isFastTrack = queueItem.tier === 'fast_track_coin' || queueItem.tier === 'fast_track_5k';

    let intro = '';
    if (isVip) {
      intro = `Panggilan spesial Super VIP 10 Ribu Rupiah! Bedah lengkap akun sultan ${account.displayName || account.username} dengan rincian item satu per satu di layar!`;
    } else if (isFastTrack) {
      intro = `Fast Track alert! Terima kasih dukungannya! Langsung kita review akun ${account.displayName || account.username}!`;
    } else {
      intro = config.templateIntro.replace('{username}', account.displayName || account.username);
    }

    const social = config.templateSocial
      .replace('{friends}', account.friendsCount.toString())
      .replace('{followers}', account.followersCount.toLocaleString('id-ID'))
      .replace('{following}', account.followingCount.toString());

    let itemsText = '';
    if (isVip) {
      const paidItems = account.items.filter((i) => i.availability === 'paid');
      const offSaleItems = account.items.filter((i) => i.availability === 'off_sale');
      const freeItems = account.items.filter((i) => i.availability === 'free');

      const parts: string[] = [];
      if (paidItems.length > 0) {
        const topPaid = paidItems.slice(0, 3).map((i) => `${i.name} seharga ${i.priceRobux} Robux`).join(', ');
        parts.push(`Item berbayar meliputi ${topPaid}`);
      }
      if (offSaleItems.length > 0) {
        const topOffSale = offSaleItems.slice(0, 2).map((i) => i.name).join(', ');
        parts.push(`serta item langka yang sudah tidak dijual di shop seperti ${topOffSale}`);
      }
      if (freeItems.length > 0) {
        parts.push(`dan ${freeItems.length} item aksesoris gratis`);
      }

      itemsText = `Perhatikan pop-up rincian item di layar: ${parts.join(', ')}. Total nilai outfit berbayar mencapai ${account.totalRobux.toLocaleString('id-ID')} Robux atau sekitar ${account.estimatedRupiah.toLocaleString('id-ID')} Rupiah!`;
    } else {
      itemsText = config.templateItems
        .replace('{item_count}', account.items.length.toString())
        .replace('{total_robux}', account.totalRobux.toLocaleString('id-ID'));
    }

    let commentary = '';
    if (config.reviewStyle === 'roasting') {
      commentary = account.roastComment;
    } else {
      commentary = account.praiseComment;
    }

    const rating = config.templateRating
      .replace('{username}', account.displayName || account.username)
      .replace('{star_rating}', account.starRating.toString());

    return `${intro} ${social} ${itemsText} ${commentary} ${rating}`;
  }

  public speak(
    text: string,
    config: TTSConfig,
    onComplete?: () => void
  ): Promise<void> {
    return new Promise((resolve) => {
      if (!this.synth) {
        console.warn('SpeechSynthesis is not supported on this browser.');
        resolve();
        onComplete?.();
        return;
      }

      this.synth.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      this.currentUtterance = utterance;

      // Select voice
      const voices = this.getVoices();
      let chosenVoice: SpeechSynthesisVoice | undefined;
      if (config.selectedVoiceName) {
        chosenVoice = voices.find((v) => v.name === config.selectedVoiceName);
      }
      if (!chosenVoice) {
        chosenVoice = this.getIndonesianVoice();
      }
      if (chosenVoice) {
        utterance.voice = chosenVoice;
      }

      utterance.rate = config.voiceRate;
      utterance.pitch = config.voicePitch;
      utterance.volume = config.voiceVolume;

      utterance.onstart = () => {
        this.notify(true, text);
      };

      utterance.onend = () => {
        this.notify(false, '');
        resolve();
        onComplete?.();
      };

      utterance.onerror = (e) => {
        console.warn('SpeechSynthesis notice:', (e as SpeechSynthesisErrorEvent).error || e);
        this.notify(false, '');
        resolve();
        onComplete?.();
      };

      this.synth.speak(utterance);
    });
  }
}

export const ttsService = new TTSService();
