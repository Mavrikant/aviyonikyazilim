import {usePluginData} from '@docusaurus/useGlobalData';
import type {HomepageData, Part} from '@site/plugins/homepage-data';

export type {HomepageData, Part};

/** plugins/homepage-data.ts tarafından build sırasında üretilen ana sayfa verisi. */
export default function useHomepageData(): HomepageData {
  return usePluginData('homepage-data') as HomepageData;
}

/**
 * Kısımları iki sütuna, satır sayıları en dengeli olacak noktadan böler
 * (kısım başlığı yaklaşık 1,5 satır sayılır; kısımlar bölünmez).
 */
export function splitParts(parts: Part[]): [Part[], Part[]] {
  const weights = parts.map((part) => part.chapters.length + 1.5);
  const total = weights.reduce((sum, w) => sum + w, 0);
  let best = 0;
  let bestDiff = Infinity;
  let running = 0;
  weights.forEach((w, i) => {
    running += w;
    const diff = Math.abs(total - 2 * running);
    if (diff < bestDiff) {
      bestDiff = diff;
      best = i + 1;
    }
  });
  return [parts.slice(0, best), parts.slice(best)];
}

/** "2026-07-03" → "3 Temmuz 2026" (sunucu ve istemcide aynı çıktı için UTC). */
export function formatLongDate(isoDate: string): string {
  return new Intl.DateTimeFormat('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${isoDate}T00:00:00Z`));
}
