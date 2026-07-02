export interface CitySuggestion {
  name: string;
  local_names?: Record<string, string>;
  lat: number;
  lon: number;
  country: string;
  state?: string;
}

export interface CurrentWeather {
  name: string;
  sys: {
    country: string;
  };
  main: {
    temp: number;
    feels_like: number;
    humidity: number;
    pressure: number;
  };
  weather: Array<{
    id: number;
    main: string;
    description: string;
    icon: string;
  }>;
  wind: {
    speed: number;
  };
}

export interface ForecastResponse {
  list: ForecastItem[];
  city: {
    name: string;
    country: string;
    timezone: number;
  };
}

export interface ForecastItem {
  dt: number;
  dt_txt: string;
  main: {
    temp: number;
  };
}

export interface ChartPoint {
  label: string;
  temp: number | null;
}

export type ForecastMode = 'day' | 'week';
