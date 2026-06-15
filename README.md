# fifa26-predictor

A FIFA World Cup 2026 predictor web app built with Next.js and TypeScript.

## Features

- Full 32-team group stage schedule
- Live UTC match time formatting
- Predict upcoming match results
- Completed match display with disabled actions
- Group standings calculated from predictions
- Projected Round of 16 bracket from seeded group results
- Stats section for top players and match performance

## Quick start

```bash
cd /workspaces/fifa26-predictor
npm install
npm run dev
```

Open `http://localhost:3000` to view the app locally.

## Build for production

```bash
npm run build
npm start
```

## Deployment

### Vercel

1. Install the Vercel CLI (optional):
   ```bash
   npm install -g vercel
   ```
2. From the project root, run:
   ```bash
   vercel
   ```
3. Follow the prompts and choose the default settings for a Next.js app.

Vercel automatically detects Next.js projects and deploys with the correct build settings.

### Netlify

1. Create a new site in your Netlify dashboard and connect your GitHub repository.
2. Set the build command to:
   ```bash
   npm run build
   ```
3. Set the publish directory to:
   ```bash
   .next
   ```

For Netlify CLI deployment, you can use:

```bash
npm install -g netlify-cli
netlify deploy --prod --dir=.next
```

### Netlify: live-data proxy & caching (recommended)

This repo includes a Netlify serverless function at `netlify/functions/fetch-schedule.js` that proxies provider requests and uses Upstash Redis for short-term caching to avoid rate limits.

Environment variables to set in Netlify (Site → Settings → Build & deploy → Environment):

- `LIVE_API_PROVIDER` — `api-football` or `football-data`
- `LIVE_API_KEY` — your provider API key
- `UPSTASH_REDIS_REST_URL` — optional (for caching)
- `UPSTASH_REDIS_REST_TOKEN` — optional (for caching)

How it works:
- Client polls `/api/live/schedule` (provided by the Next.js API route) which will return mock data if no provider is configured.
- For lower latency and rate-limit safety on Netlify, call the Netlify function `/\.netlify/functions/fetch-schedule` instead. That function will return cached provider data if available.

Example client fetch (polling):

```js
const res = await fetch('/.netlify/functions/fetch-schedule');
const data = await res.json();
// use data.data
```

Note: Netlify's serverless functions are short-lived — use caching (Upstash) with a short TTL (10-30s) to provide near-real-time updates without hitting API limits.

## Notes

- The app is built for public use and can be deployed to Vercel or Netlify with minimal configuration.
- Keep environment files out of the repository with `.gitignore`.
