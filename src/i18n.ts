export type Language = 'uk' | 'en';

export const languages: Language[] = ['uk', 'en'];

export const translations = {
  uk: {
    app: {
      intro:
        'Введіть місто, виберіть варіант з автокомпліту та отримайте поточну погоду через OpenWeatherMap.',
      maxBlocks: 'Максимум 5 блоків погоди.',
      blockTitle: (index: number) => `Блок ${index}`,
      deleteMessage: (index: number) => `Видалити блок погоди #${index}?`,
      weatherTab: 'Погода',
      favoritesTab: 'Вибране',
      favoritesEmpty: 'Додайте місто в обране, щоб бачити його тут.',
      favoritesLimitTitle: 'Ліміт обраного',
      favoritesLimitMessage:
        'Для додавання видаліть місто з обраного, тому що максимум 5.',
      favoritesLimitConfirm: 'Зрозуміло',
      userCityLoading: 'Визначаємо ваше місто...',
      userCityError: 'Не вдалося визначити місто за IP. Виберіть місто вручну.',
    },
    language: {
      label: 'Мова',
      uk: 'Укр',
      en: 'Eng',
    },
    modal: {
      title: 'Підтвердження',
      confirm: 'Видалити',
      cancel: 'Скасувати',
    },
    search: {
      label: 'Місто',
      placeholder: 'Наприклад, Kyiv',
      submit: 'Знайти',
      loading: 'Шукаємо міста...',
    },
    forecast: {
      aria: 'Перемикання прогнозу',
      day: 'День',
      week: '5 днів',
    },
    card: {
      emptyCity: 'Місто поки не вибрано',
      title: 'Поточна погода',
      loading: 'Завантажуємо погоду...',
      humidity: 'Вологість',
      wind: 'Вітер',
      windUnit: 'м/с',
      empty: "Тут з'явиться погода після вибору міста.",
      addFavorite: 'Додати в обране',
      removeFavorite: 'Видалити з обраного',
    },
    chart: {
      title: 'Графік температури',
      dayTitle: 'Сьогодні по годинах',
      weekTitle: 'Середня за 5 днів',
      dayDataset: 'Температура по годинах',
      weekDataset: 'Середня температура',
      loading: 'Завантажуємо прогноз...',
      empty: "Графік з'явиться після вибору міста.",
      aria: 'Графік температури',
    },
    errors: {
      citySearch: 'Не вдалося знайти місто.',
      cityNotFound: 'Місто не знайдено.',
      weatherLoad: 'Не вдалося завантажити погоду.',
    },
    actions: {
      removeBlock: 'Видалити блок',
      favoriteCity: 'Обране місто',
    },
  },
  en: {
    app: {
      intro:
        'Enter a city, choose a suggestion, and get current weather from OpenWeatherMap.',
      maxBlocks: 'Maximum 5 weather blocks.',
      blockTitle: (index: number) => `Block ${index}`,
      deleteMessage: (index: number) => `Delete weather block #${index}?`,
      weatherTab: 'Weather',
      favoritesTab: 'Favorites',
      favoritesEmpty: 'Add a city to favorites to see it here.',
      favoritesLimitTitle: 'Favorites limit',
      favoritesLimitMessage:
        'Remove a city from favorites before adding another one because the maximum is 5.',
      favoritesLimitConfirm: 'Got it',
      userCityLoading: 'Detecting your city...',
      userCityError: 'Unable to detect your city by IP. Choose a city manually.',
    },
    language: {
      label: 'Language',
      uk: 'Укр',
      en: 'Eng',
    },
    modal: {
      title: 'Confirmation',
      confirm: 'Delete',
      cancel: 'Cancel',
    },
    search: {
      label: 'City',
      placeholder: 'For example, Kyiv',
      submit: 'Search',
      loading: 'Searching cities...',
    },
    forecast: {
      aria: 'Forecast switcher',
      day: 'Day',
      week: '5 days',
    },
    card: {
      emptyCity: 'No city selected yet',
      title: 'Current weather',
      loading: 'Loading weather...',
      humidity: 'Humidity',
      wind: 'Wind',
      windUnit: 'm/s',
      empty: 'Weather will appear here after city selection.',
      addFavorite: 'Add to favorites',
      removeFavorite: 'Remove from favorites',
    },
    chart: {
      title: 'Temperature chart',
      dayTitle: 'Today by hour',
      weekTitle: 'Average for 5 days',
      dayDataset: 'Hourly temperature',
      weekDataset: 'Average temperature',
      loading: 'Loading forecast...',
      empty: 'Chart will appear after city selection.',
      aria: 'Temperature chart',
    },
    errors: {
      citySearch: 'Unable to find cities.',
      cityNotFound: 'City not found.',
      weatherLoad: 'Unable to load weather.',
    },
    actions: {
      removeBlock: 'Remove block',
      favoriteCity: 'Favorite city',
    },
  },
};

export type Translation = (typeof translations)[Language];

export function getInitialLanguage(): Language {
  const savedLanguage = localStorage.getItem('weather-language');
  if (savedLanguage === 'uk' || savedLanguage === 'en') return savedLanguage;

  return 'uk';
}
