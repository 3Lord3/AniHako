# AniHako

A web app for anime built on the public [YummyAnime](https://yani.tv) API.
A single frontend covers most of what a fan could need: a browsable catalogue,
a built-in player, personal lists with statistics, friends — plus a few toys
like a swipe matcher, a tournament and a tier list, just for messing around
with what you've already watched.

The interface is **Russian-only for now** (English is planned) and adapts from
phone to desktop, with light and dark themes.

[English](README.md) · [Русский](README.ru.md)

---

## What it does

**Catalogue and home**
- Home: a carousel of the current season plus a weekly schedule of ongoing
  titles with per-day episode counts.
- Catalogue: instant search with debounce, filters by genres, years, rating,
  status and kind, sorting, grid/list view.

**Anime page**
- Description, characteristics and viewing order (sequels and related titles).
- A built-in player with episode lists and dubbing/translation switchers.

**Account**
- Registration and login with hCaptcha, JWT sessions.
- Profile: nickname, linked accounts, roles.
- Lists "watching / planned / completed / paused / dropped", marking watched
  episodes, favourites and per-status statistics.

**Friends**
- Add and remove friends, browse them by category, handle incoming requests.

**The toys**
- **AniMatch** — a swipe matcher: swipe right to add to your list, left to
  skip, fed from a stream of random titles.
- **AniTournament** — a double-elimination tournament built from your
  completed titles.
- **AniTier** — a drag-and-drop tier list: drop your completed anime into
  tiers, with your own colours and names.

## Stack

- React 19 + TypeScript + Vite
- TanStack Query + Axios (the API layer retries requests itself after an
  hCaptcha challenge)
- React Router v7, lazy-loaded pages (`React.lazy`)
- Tailwind CSS 4 + shadcn/ui, light/dark themes
- Framer Motion, `@dnd-kit`, Embla carousel
- ESLint, Vitest + Testing Library
- Deployed on Netlify (`netlify.toml` included)

## Getting started

Requires Node.js 20+.

```sh
npm install
npm run dev        # http://localhost:5173
```

The app needs an application token to talk to the API. Copy `.env.example` to
`.env` and fill in `VITE_APP_TOKEN`:

```sh
cp .env.example .env
```

`VITE_HCAPTCHA_SITE_KEY` is optional, used when the backend answers a mutating
request with a captcha challenge. Note that hCaptcha does not work on the
`localhost` hostname — open the dev server on `http://127.0.0.1:5173` instead.

### Scripts

```sh
npm run dev          # dev server
npm run build        # type-check + build into dist/
npm run lint         # ESLint
npm run test:run     # Vitest, single run
npm run preview      # preview the production build
```

### Environment variables

| Variable | Required | Description |
|---|---|---|
| `VITE_APP_TOKEN` | yes | Application token for the YummyAnime API |
| `VITE_HCAPTCHA_SITE_KEY` | no | hCaptcha site key for the captcha challenge |

## Structure

```
src/
├── api/            # API clients (auth, anime, list, friends, users)
├── components/     # UI and feature components (shadcn/ui in components/ui)
├── hooks/          # feature logic, separated from the presentation
├── lib/            # helpers (dates, image URLs, tier/tournament logic)
├── pages/          # pages, code-split
├── types/          # domain types
└── App.tsx         # routing and route guards
```

Logic (hooks) is deliberately kept apart from UI (components) — the same data
flows are reused across desktop and mobile layouts.

## Development

- `npm run lint` and `npm run test:run` should stay green before a PR.
- New API calls go through `src/api/` so the captcha-retry layer applies
  uniformly.
- Keep route pages lazy-loaded (`React.lazy`) to preserve the code split.

## License

Licensed under the **GNU GPL v3** (see [LICENSE](LICENSE)): GNU General Public
License version 3. It's a copyleft license — any use, modification and
distribution of the code requires derivative works to be distributed under the
same license and with source code.
