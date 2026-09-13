# AniHako

Anime web app built on the public [YummyAnime](https://yani.tv) API. One
frontend covers the basics: browse the catalogue, watch in the built-in player,
maintain personal lists with stats, add friends. Plus a few toys for your
completed titles: a swipe matcher, a tournament and a tier list.

The UI is **Russian-only for now** (English is planned). It adapts from phone to
desktop and ships with light and dark themes.

[English](README.md) · [Русский](README.ru.md)

## Features

**Catalogue and home**
- Home: carousel of the current season, weekly schedule of ongoing titles with
  per-day episode counts.
- Catalogue: debounced search, filters by genre / year / rating / status / kind,
  sorting, grid and list views.

**Anime page**
- Synopsis, characteristics, viewing order (sequels and related titles).
- Built-in player with episode lists and dubbing/translation switchers.

**Account**
- Registration and login with hCaptcha, JWT sessions.
- Profile: nickname, linked accounts, roles.
- Lists (watching / planned / completed / paused / dropped), watched-episode
  tracking, favourites and per-status stats.

**Friends**
- Add and remove friends, browse by category, handle incoming requests.

**Toys**
- AniMatch: swipe right to add to your list, left to skip.
- AniTournament: double-elimination bracket from your completed titles.
- AniTier: drag-and-drop tier list with your own tier names and colours.

## Stack

- React 19 + TypeScript + Vite
- TanStack Query + Axios (the API layer retries requests itself after an hCaptcha
  challenge)
- React Router v7, lazy-loaded pages
- Tailwind CSS 4 + shadcn/ui, light/dark themes
- Framer Motion, dnd-kit, Embla carousel
- ESLint, Vitest + Testing Library
- Deployed on Vercel (`vercel.json` included)

## Getting started

Requires Node.js 20+.

```sh
npm install
npm run dev        # http://localhost:5173
```

The app needs an app token to talk to the API. Copy `.env.example` to `.env` and
fill in `VITE_APP_TOKEN`:

```sh
cp .env.example .env
```

`VITE_HCAPTCHA_SITE_KEY` is optional, used when the backend bounds a mutating
request with a captcha challenge. Note that hCaptcha refuses the `localhost`
hostname, so open the dev server on `http://127.0.0.1:5173` instead.

### Scripts

```sh
npm run dev          # dev server
npm run build        # type-check + build into dist/
npm run lint         # ESLint
npm run test:run     # Vitest, single run
npm run preview      # preview the production build
```

### Environment variables

| Variable                | Required | Description                        |
|-------------------------|----------|------------------------------------|
| `VITE_APP_TOKEN`        | yes      | App token for the YummyAnime API   |
| `VITE_HCAPTCHA_SITE_KEY`| no       | hCaptcha site key for the captcha  |

## Structure

```
src/
├── api/            # API clients (auth, anime, list, friends, users)
├── components/     # UI and feature components (shadcn/ui in components/ui)
├── hooks/          # feature logic, separate from the presentation
├── lib/            # helpers (dates, image URLs, tier/tournament logic)
├── pages/          # pages, code-split
├── types/          # domain types
└── App.tsx         # routing and route guards
```

## Development

- `npm run lint` and `npm run test:run` should stay green before a PR.
- New API calls go through `src/api/` so the captcha-retry layer applies
  uniformly.
- Keep route pages lazy-loaded (`React.lazy`) to preserve the code split.

## License

GNU GPL v3. See the [LICENSE](LICENSE) file.