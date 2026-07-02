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

    return parsedBlocks.slice(0, 5);
  } catch {
    return [{ id: 1 }];
  }
}

export function saveWeatherBlocks(blocks: StoredWeatherBlock[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(blocks));
}
