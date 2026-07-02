import type { CitySuggestion } from '../types/weather';

interface IpApiResponse {
  city?: string;
  region?: string;
  country_code?: string;
  latitude?: number;
  longitude?: number;
}

export async function getUserCityByIp(): Promise<CitySuggestion | null> {
  const response = await fetch('https://ipapi.co/json/');
  if (!response.ok) return null;

  const data = (await response.json()) as IpApiResponse;
  if (!data.city || !data.country_code || !data.latitude || !data.longitude) return null;

  return {
    name: data.city,
    state: data.region,
    country: data.country_code,
    lat: data.latitude,
    lon: data.longitude,
  };
}
