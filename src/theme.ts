export type ThemeMode = 'day' | 'night';

export function getInitialTheme(): ThemeMode {
  const savedTheme = localStorage.getItem('weather-theme');
  if (savedTheme === 'day' || savedTheme === 'night') return savedTheme;

  return 'day';
}
