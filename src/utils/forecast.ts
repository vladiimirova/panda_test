import type { ChartPoint, ForecastItem } from '../types/weather';
import type { Language } from '../i18n';

export function buildDayPoints(
  items: ForecastItem[],
  language: Language,
  timezoneOffset: number,
): ChartPoint[] {
  if (!items.length) return [];

  const currentDate = getBestDayKey(items, timezoneOffset);
  const tempsByHour = items.reduce<Record<number, number>>((acc, item) => {
    if (getDateKey(item.dt, timezoneOffset) !== currentDate) return acc;

    acc[getLocalHour(item.dt, timezoneOffset)] = Math.round(item.main.temp);
    return acc;
  }, {});

  return buildDayHours().map((hour) => ({
    label: formatHourSlot(hour, language),
    temp: tempsByHour[hour % 24] ?? null,
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
      date,
    }));
}

function getDateKey(timestamp: number, timezoneOffset: number) {
  return new Date((timestamp + timezoneOffset) * 1000).toISOString().slice(0, 10);
}

function getBestDayKey(items: ForecastItem[], timezoneOffset: number) {
  const grouped = items.reduce<Record<string, number>>((acc, item) => {
    const key = getDateKey(item.dt, timezoneOffset);
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});

  const [bestDay] = Object.entries(grouped).sort(([, countA], [, countB]) => countB - countA)[0];
  return bestDay;
}

function getLocalHour(timestamp: number, timezoneOffset: number) {
  return new Date((timestamp + timezoneOffset) * 1000).getUTCHours();
}

function buildDayHours() {
  return [0, 3, 6, 9, 12, 15, 18, 21, 24];
}

function formatHourSlot(hour: number, language: Language) {
  return new Intl.DateTimeFormat(getLocale(language), {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC',
  }).format(Date.UTC(1970, 0, 1, hour));
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
