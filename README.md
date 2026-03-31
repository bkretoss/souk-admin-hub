# Souk IT - Admin Hub

Admin dashboard for the Souk IT marketplace. Built with Vite, React, TypeScript, MUI, and Supabase.

## Tech Stack

- Vite + React + TypeScript
- Material UI (MUI)
- Tailwind CSS
- Supabase (auth + database)
- React Router v6
- TanStack Query

## Getting Started

```sh
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build
```

## Deployment

The project includes a `vercel.json` configured for SPA routing fallback — all routes redirect to `index.html` so hard refreshes on any `/admin/*` route work correctly.
