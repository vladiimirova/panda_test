import type { ChartPoint, ForecastItem } from '../types/weather';

export function buildTodayPoints(items: ForecastItem[]): ChartPoint[] {
  const [firstItem] = items;
  if (!firstItem) return [];

  const currentDate = getDateKey(firstItem.dt);

  return items
    .filter((item) => getDateKey(item.dt) === currentDate)
    .map((item) => ({
      label: formatHour(item.dt),
      temp: Math.round(item.main.temp),
    }));
}

export function buildWeekPoints(items: ForecastItem[]): ChartPoint[] {
  const grouped = items.reduce<Record<string, number[]>>((acc, item) => {
    const key = getDateKey(item.dt);
    acc[key] = acc[key] ?? [];
    acc[key].push(item.main.temp);
    return acc;
  }, {});

  return Object.entries(grouped)
    .slice(0, 5)
    .map(([date, temps]) => ({
      label: formatDay(date),
      temp: Math.round(temps.reduce((sum, temp) => sum + temp, 0) / temps.length),
    }));
}

function getDateKey(timestamp: number) {
  return new Date(timestamp * 1000).toISOString().slice(0, 10);
}

function formatHour(timestamp: number) {
  return new Intl.DateTimeFormat('uk-UA', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(timestamp * 1000);
}

function formatDay(date: string) {
  return new Intl.DateTimeFormat('uk-UA', {
    weekday: 'short',
    day: '2-digit',
  }).format(new Date(`${date}T12:00:00`));
}
