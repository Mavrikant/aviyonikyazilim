import {morse} from './veri';

/** VOR/DME tanıtım tonu 1020 Hz'dir; NDB'lerde de yaygın olarak bu ton kullanılır. */
const TONE_HZ = 1020;
/**
 * Bir "nokta" süresi (s). ICAO Annex 10 Cilt I (3.1.3.9.4, 3.5.3.6.3): nokta 0,1–0,160 s,
 * çizgi tipik olarak 3 nokta, nokta/çizgi arası 1 nokta ±%10, harfler arası en az 3 nokta;
 * hız "yaklaşık 7 kelime/dakika". 0,15 s aralık içinde kalır ve ~8 kelime/dakikaya karşılık gelir.
 */
const UNIT = 0.15;
const RAMP = 0.005; // tıkırtıyı önlemek için ses açılış/kapanış rampası

let ctx: AudioContext | null = null;

/**
 * Tanıtım kodunu Mors olarak çalar. Her harf başladığında `onLetter(i)`, bitince
 * `onLetter(-1)` çağrılır. Dönen fonksiyon çalmayı durdurur.
 */
export function playMorse(ident: string, onLetter: (index: number) => void): () => void {
  ctx ??= new AudioContext();
  const audio = ctx;
  void audio.resume();

  const gain = audio.createGain();
  gain.gain.value = 0;
  gain.connect(audio.destination);
  const osc = audio.createOscillator();
  osc.type = 'sine';
  osc.frequency.value = TONE_HZ;
  osc.connect(gain);

  const start = audio.currentTime + 0.05;
  let t = start;
  const timers: number[] = [];
  morse(ident).forEach(({code}, i) => {
    timers.push(window.setTimeout(() => onLetter(i), (t - audio.currentTime) * 1000));
    [...code].forEach((symbol, j) => {
      const len = (symbol === '.' ? 1 : 3) * UNIT;
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.25, t + RAMP);
      gain.gain.setValueAtTime(0.25, t + len - RAMP);
      gain.gain.linearRampToValueAtTime(0, t + len);
      t += len + (j < code.length - 1 ? UNIT : 0);
    });
    t += 3 * UNIT;
  });

  osc.start(start);
  osc.stop(t);
  timers.push(window.setTimeout(() => onLetter(-1), (t - audio.currentTime) * 1000));

  let stopped = false;
  return () => {
    if (stopped) return;
    stopped = true;
    timers.forEach((id) => window.clearTimeout(id));
    gain.gain.cancelScheduledValues(audio.currentTime);
    gain.gain.setValueAtTime(0, audio.currentTime);
    try {
      osc.stop();
    } catch {
      // zaten durmuş
    }
    osc.disconnect();
    gain.disconnect();
    onLetter(-1);
  };
}
