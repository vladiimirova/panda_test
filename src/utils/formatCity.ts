import type { CitySuggestion } from '../types/weather';

export function formatCity(suggestion: CitySuggestion) {
  return [suggestion.name, suggestion.state, suggestion.country].filter(Boolean).join(', ');
}
