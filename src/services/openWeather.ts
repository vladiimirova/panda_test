import type { CitySuggestion, CurrentWeather, ForecastResponse } from '../types/weather';

const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY as string | undefined;
const API_BASE_URL = 'https://api.openweathermap.org';

function ensureApiKey() {
  if (!API_KEY || API_KEY === 'your_api_key_here') {
    throw new Error('Додай VITE_OPENWEATHER_API_KEY у файл .env.');
  }
}

async function request<T>(url: URL): Promise<T> {
  ensureApiKey();

  url.searchParams.set('appid', API_KEY as string);

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('OpenWeatherMap повернув помилку запиту.');
  }

  return response.json() as Promise<T>;
}

export async function searchCities(query: string): Promise<CitySuggestion[]> {
  const url = new URL('/geo/1.0/direct', API_BASE_URL);
  url.searchParams.set('q', query.trim());
  url.searchParams.set('limit', '5');

  return request<CitySuggestion[]>(url);
}

export async function getCurrentWeather(city: CitySuggestion): Promise<CurrentWeather> {
  const url = new URL('/data/2.5/weather', API_BASE_URL);
  url.searchParams.set('lat', String(city.lat));
  url.searchParams.set('lon', String(city.lon));
  url.searchParams.set('units', 'metric');
  url.searchParams.set('lang', 'uk');

  return request<CurrentWeather>(url);
}

export async function getForecast(city: CitySuggestion): Promise<ForecastResponse> {
  const url = new URL('/data/2.5/forecast', API_BASE_URL);
  url.searchParams.set('lat', String(city.lat));
  url.searchParams.set('lon', String(city.lon));
  url.searchParams.set('units', 'metric');
  url.searchParams.set('lang', 'uk');

  return request<ForecastResponse>(url);
}
