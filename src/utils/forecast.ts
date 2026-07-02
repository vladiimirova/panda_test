import type { ChartPoint, ForecastItem } from '../types/weather';
import type { Language } from '../i18n';

export function buildTodayPoints(items: ForecastItem[], language: Language): ChartPoint[] {
  const [firstItem] = items;
  if (!firstItem) return [];

  const currentDate = getDateKey(firstItem.dt);

  return items
    .filter((item) => getDateKey(item.dt) === currentDate)
    .map((item) => ({
      label: formatHour(item.dt, language),
      temp: Math.round(item.main.temp),
    }));
}

export function buildWeekPoints(items: ForecastItem[], language: Language): ChartPoint[] {
  const grouped = items.reduce<Record<string, number[]>>((acc, item) => {
    const key = getDateKey(item.dt);
    acc[key] = acc[key] ?? [];
    acc[key].push(item.main.temp);
    return acc;
  }, {});

  return Object.entries(grouped)
    .slice(0, 5)
    .map(([date, temps]) => ({
      label: formatDay(date, language),
      temp: Math.round(temps.reduce((sum, temp) => sum + temp, 0) / temps.length),
    }));
}

function getDateKey(timestamp: number) {
  return new Date(timestamp * 1000).toISOString().slice(0, 10);
}

function formatHour(timestamp: number, language: Language) {
  return new Intl.DateTimeFormat(getLocale(language), {
    hour: '2-digit',
    minute: '2-digit',
  }).format(timestamp * 1000);
}

function formatDay(date: string, language: Language) {
  return new Intl.DateTimeFormat(getLocale(language), {
    weekday: 'short',
    day: '2-digit',
  }).format(new Date(`${date}T12:00:00`));
}

function getLocale(language: Language) {
  return language === 'uk' ? 'uk-UA' : 'en-US';
}
