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

## Notes

- The app is built for public use and can be deployed to Vercel or Netlify with minimal configuration.
- Keep environment files out of the repository with `.gitignore`.
