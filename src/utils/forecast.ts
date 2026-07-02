import type { ChartPoint, ForecastItem } from '../types/weather';
import type { Language } from '../i18n';

export function buildTodayPoints(
  items: ForecastItem[],
  language: Language,
  timezoneOffset: number,
): ChartPoint[] {
  if (!items.length) return [];

  const todayDate = getDateKey(Date.now() / 1000, timezoneOffset);
  const fallbackDate = getDateKey(items[0].dt, timezoneOffset);
  const currentDate = items.some((item) => getDateKey(item.dt, timezoneOffset) === todayDate)
    ? todayDate
    : fallbackDate;

  return items
    .filter((item) => getDateKey(item.dt, timezoneOffset) === currentDate)
    .map((item) => ({
      label: formatHour(item.dt, language, timezoneOffset),
      temp: Math.round(item.main.temp),
    }));
}

export function buildWeekPoints(
  items: ForecastItem[],
  language: Language,
  timezoneOffset: number,
): ChartPoint[] {
  const grouped = items.reduce<Record<string, number[]>>((acc, item) => {
    const key = getDateKey(item.dt, timezoneOffset);
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

function getDateKey(timestamp: number, timezoneOffset: number) {
  return new Date((timestamp + timezoneOffset) * 1000).toISOString().slice(0, 10);
}

function formatHour(timestamp: number, language: Language, timezoneOffset: number) {
  return new Intl.DateTimeFormat(getLocale(language), {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC',
  }).format((timestamp + timezoneOffset) * 1000);
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
