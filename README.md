# Folio Studio

A responsive React + TypeScript software developer portfolio with a public-facing project gallery and a built-in editor at `/admin`.

## Getting started

```sh
npm install
npm run dev
```

Visit the local address printed by Vite for the portfolio, then open `/admin` and enter the admin password to edit the introduction or add, update, and remove projects. Project galleries accept multiple image uploads; image data and portfolio edits are saved in IndexedDB in the current browser. The color theme follows the browser preference on first visit; the header toggle switches themes and remembers your choice.

## Publishing and storage

This starter is a browser-only app: admin edits are local to the browser and are not automatically shared with visitors or other devices. The developer-focused profile and example projects are starter content for a browser without a saved portfolio; replace them with your real details before publishing. Previously saved portfolios are preserved and are not overwritten when the starter examples change. The admin password prompt is only a client-side convenience; it is not secure authentication because the app and password check are delivered to the browser. For a live, multi-user portfolio, connect the editor to a hosted database and media store, protect the admin route with server-side authentication, and deploy the app with a server-side API.

## Deploying to GitHub Pages

This repository includes a GitHub Actions workflow that builds the Vite app with the `/Portfolio/` base path and deploys the generated `dist` folder to GitHub Pages whenever changes are pushed to `main`. In the repository settings, set **Pages → Build and deployment → Source** to **GitHub Actions**. The published app is available at `https://joekesserwani.github.io/Portfolio/`; open its admin page at `https://joekesserwani.github.io/Portfolio/?admin`. The query-string admin URL is used because GitHub Pages does not provide a server-side route fallback for `/admin`.

## Production build

```sh
npm run build
npm run preview
```
