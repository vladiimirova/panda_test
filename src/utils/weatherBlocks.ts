import type { CitySuggestion } from '../types/weather';

const STORAGE_KEY = 'weather-blocks';

export interface StoredWeatherBlock {
  id: number;
  city?: CitySuggestion;
}

export function loadWeatherBlocks(): StoredWeatherBlock[] {
  const rawBlocks = localStorage.getItem(STORAGE_KEY);
  if (!rawBlocks) return [{ id: 1 }];

  try {
    const parsedBlocks = JSON.parse(rawBlocks);
    if (!Array.isArray(parsedBlocks) || parsedBlocks.length === 0) return [{ id: 1 }];

    const blocksWithCity = parsedBlocks
      .filter((block): block is StoredWeatherBlock => Boolean(block?.city))
      .slice(0, 5);

    return blocksWithCity.length ? blocksWithCity : [{ id: 1 }];
  } catch {
    return [{ id: 1 }];
  }
}

export function saveWeatherBlocks(blocks: StoredWeatherBlock[]) {
  const blocksWithCity = blocks.filter((block) => block.city);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(blocksWithCity));
}
