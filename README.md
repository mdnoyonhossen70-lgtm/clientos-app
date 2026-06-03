# ClientOS

ClientOS is a personal client acquisition operating system for freelance web developers. It tracks daily outreach, lead pipeline movement, streaks, analytics, and practical AI-style insights from your own activity.

## Stack

- React + TypeScript + Vite
- Tailwind CSS with local shadcn-style UI primitives
- Supabase Auth and Database
- React Router
- TanStack Query
- Recharts
- Framer Motion

## Local Setup

Install Node.js 20 or newer, then run:

```bash
npm install
npm run dev
```

The app runs at `http://localhost:5173`.

## Environment Variables

Create `.env.local` from `.env.example`:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Without these variables, ClientOS still opens in local demo mode and stores data in `localStorage`. With Supabase configured, auth and database sync are enabled.

## Supabase Setup

1. Create a free Supabase project.
2. Open the SQL editor and run `supabase/schema.sql`.
3. In Authentication, enable Email provider.
4. To enable Google login, create Google OAuth credentials and add them in Supabase Authentication providers.
5. Add your deployed Netlify URL to Supabase Authentication URL configuration:
   - Site URL: `https://your-site.netlify.app`
   - Redirect URLs: `https://your-site.netlify.app/*`

## Netlify Deployment

This repository is optimized for static Netlify deployment.

1. Push the project to GitHub.
2. In Netlify, choose "Add new site" then "Import an existing project".
3. Select the GitHub repository.
4. Build settings are already defined in `netlify.toml`:
   - Build command: `npm run build`
   - Publish directory: `dist`
5. Add the environment variables from `.env.example` in Netlify site settings.
6. Deploy.

The `public/_redirects` file and `netlify.toml` both include SPA routing support for React Router.

## Data Model

For simple maintenance, ClientOS stores the personal workspace as one JSON document in Supabase:

- `app_state.user_id`
- `app_state.state`
- `app_state.updated_at`

Row level security ensures each user can only access their own state. This keeps Version 1 fast to deploy and easy to evolve into normalized tables later.

## Product Scope

Version 1 includes:

- Dashboard with daily completion, progress ring, streaks, weekly score, and monthly score
- Daily activity tracker with custom categories, goals, notes, increment, decrement, and reset
- Drag-and-drop Kanban CRM with lead fields and status movement
- Activity timeline generated from user actions
- Analytics with outreach, conversations, leads, proposals, wins, conversion rate, and source performance
- Local AI insights generated from activity and CRM data
- Mobile bottom navigation and responsive layouts
