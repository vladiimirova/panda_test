import type { CitySuggestion } from '../types/weather';

const STORAGE_KEY = 'weather-favorites';

export function getCityKey(city: CitySuggestion) {
  return `${city.name}-${city.country}-${city.lat}-${city.lon}`;
}

export function loadFavorites(): CitySuggestion[] {
  const rawFavorites = localStorage.getItem(STORAGE_KEY);
  if (!rawFavorites) return [];

  try {
    const parsedFavorites = JSON.parse(rawFavorites);
    return Array.isArray(parsedFavorites) ? parsedFavorites : [];
  } catch {
    return [];
  }
}

export function saveFavorites(favorites: CitySuggestion[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
}
