# Weather App

A responsive Vue 3 weather application built with Vite, OpenWeatherMap, and Chart.js. The project uses plain CSS only, without CSS frameworks or UI libraries.

## Features

- City search with autocomplete.
- Weather requests through `fetch`.
- Current weather card for the selected city.
- Hourly temperature chart for the current day with Chart.js, without `vue-chartjs`.
- Forecast switch between day and week views.
- Up to 5 independent weather blocks.
- Weather block removal with a confirmation modal.
- Favorites tab with cities saved in `localStorage`.
- Favorite city limit of 5 items with a modal warning.
- Default user weather based on IP city detection.
- Loading states for API requests.
- Ukrainian and English interface languages, including API response language.
- Day and night visual themes.
- Responsive layout with a 1200px main container and 360px minimum width.

## Tech Stack

- Vue 3
- TypeScript
- Vite
- Chart.js
- OpenWeatherMap API

## Getting Started

Install dependencies:

```bash
npm install
```

Create a local environment file from the example:

```bash
cp .env.example .env
```

Add your OpenWeatherMap API key:

```bash
VITE_OPENWEATHER_API_KEY=your_api_key_here
```

Run the development server:

```bash
npm run dev
```

Build the project:

```bash
npm run build
```

## Deployment

For Vercel, add the same environment variable in the project settings:

```bash
VITE_OPENWEATHER_API_KEY=your_api_key_here
```

After changing environment variables, redeploy the project so Vercel can rebuild the client bundle.
