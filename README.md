# Folio Studio

A responsive React + TypeScript software developer portfolio with a public-facing project gallery and a built-in editor at `/admin`.

## Getting started

```sh
npm install
npm run dev
```

Create a Supabase project and configure it as described in [Shared portfolio setup](#shared-portfolio-setup) before starting the app. Visit the local address printed by Vite for the portfolio, then open `/admin` and sign in with the configured admin account. Profile and project edits are stored in Supabase and are shared across devices; uploaded project photos are saved in Supabase Storage. The color theme follows the browser preference on first visit; the header toggle switches themes and remembers your choice.

## Publishing and storage

The portfolio data in Supabase is the shared source of truth. The public site loads it on page load, so edits appear on every device without rebuilding or redeploying the frontend. The starter profile and projects are examples; choose whether to import existing browser data or initialize the shared portfolio with the examples the first time you sign in. Browser-local legacy data is not deleted after import.

## Shared portfolio setup

1. Create a Supabase project.
2. In your hosted project's **Supabase Dashboard → SQL Editor** (not the local Supabase extension connection), run [`supabase/setup.sql`](./supabase/setup.sql) after replacing every `REPLACE_WITH_ADMIN_EMAIL` with your admin account email. If you're setting up this repository with the configured admin account, use the local, Git-ignored `supabase/setup.local.sql` instead. The script creates the shared portfolio table, row-level security policies, a public-read photo bucket with admin-only upload/delete policies, and refreshes the REST schema cache.
3. In **Authentication → Providers**, enable Email/password authentication and disable new user sign-ups. Create or invite your own admin user from the Supabase dashboard, using the same email entered in the SQL script. Do not make the site public signup-enabled.
4. Copy your Supabase project URL and its publishable/anon key from the project API settings. Never put the service-role key in this frontend.
5. For local development, create an untracked `.env.local` file in the repository root with:

   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-publishable-or-anon-key
   VITE_ADMIN_EMAIL=you@example.com
   ```

6. For GitHub Pages, add `VITE_SUPABASE_URL` and `VITE_ADMIN_EMAIL` under **Repository Settings → Secrets and variables → Actions → Variables**, and add `VITE_SUPABASE_ANON_KEY` under **Secrets**. The deploy workflow checks these are configured before building.
7. Add `https://joekesserwani.github.io` and `http://localhost:5173` to the Supabase Auth URL configuration as allowed redirect URLs. Push to `main` or run the deployment workflow after configuring the variables and secret.
8. Sign in at `https://joekesserwani.github.io/Portfolio/?admin`. If the shared portfolio is empty, choose **Import saved work** to transfer content/photos from the current browser after confirmation, or initialize it with the starter content. Import only works from the browser that contains the old IndexedDB data.

The Supabase anon/publishable key is intended to be visible in a static frontend. Row-level security and Storage policies enforce that only the configured admin email can change portfolio content or upload/delete photos.

If the site reports that `public.portfolio_content` is missing from the schema cache, the setup SQL has not successfully run on the hosted project yet. Run the full setup script in that project's SQL Editor; it sends a PostgREST schema reload notification at the end. Then refresh the portfolio page.

## Deploying to GitHub Pages

This repository includes a GitHub Actions workflow that builds the Vite app with the `/Portfolio/` base path and deploys the generated `dist` folder to GitHub Pages whenever changes are pushed to `main`. In the repository settings, set **Pages → Build and deployment → Source** to **GitHub Actions**. Configure the Supabase workflow variables and secret before deploying. The published app is available at `https://joekesserwani.github.io/Portfolio/`; open its admin page at `https://joekesserwani.github.io/Portfolio/?admin`. The query-string admin URL is used because GitHub Pages does not provide a server-side route fallback for `/admin`.

## Production build

```sh
npm run build
npm run preview
```
