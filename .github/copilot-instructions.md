# IPTV Webapp — Project Guidelines

## Stack

- **React 19** + **TypeScript 5** (strict mode) + **Vite 7**
- **Tailwind CSS 4** via `@tailwindcss/vite` — no `tailwind.config.js`, configured through `src/index.css` with CSS variables
- **shadcn/ui** components in `src/components/ui/` — add via `pnpm dlx shadcn@latest add <component>`
- **`@iptv/playlist`** for M3U parsing (`parseM3U`, `M3uChannel` types)
- **TanStack Query** (`@tanstack/react-query`) for data fetching — `useChannels` uses `useQueries` to fetch multiple M3U sources in parallel
- **React Router v7** (`react-router-dom`) for client-side routing
- Package manager: **pnpm**

## Architecture

SPA with two routes:

- `/` — `HomePage`: sidebar channel list + video player
- `/settings` — `SettingsPage`: manage M3U playlist URLs

```
src/
  hooks/
    useChannels.ts    # useQueries over all M3U URLs; returns Channel[] with _key
    useFavorites.ts   # favorites Set<url> persisted to localStorage
    useM3uUrls.ts     # M3U URL list persisted to localStorage
  pages/
    HomePage.tsx
    SettingsPage.tsx
  components/
    ChannelTile.tsx
    ui/               # shadcn components
  lib/utils.ts
  App.tsx             # Routes only
  main.tsx            # BrowserRouter + QueryClientProvider + Toaster
```

## Key Conventions

- **Channel unique key**: `_key` field (`"${sourceIndex}-${channelIndex}"`) — use this as React `key`, never `tvgId` alone (duplicates across sources)
- **`M3uChannel` field names**: `groupTitle` (not `group.title`), `tvgLogo`, `tvgId`, `url`, `urls` — always verify against `node_modules/@iptv/playlist/dist/index.d.ts`
- **Path alias**: `@/` maps to `src/` — use in all imports
- **localStorage keys**: `iptv-m3u-urls` (array of strings), `iptv-favorites` (array of URLs)
- **TypeScript strict** — no `any`, no unused vars/params
- **ESLint flat config** (v9+, `eslint.config.js`) — run `pnpm lint` to check
- Prefer `useMemo` / `useCallback` for derived state and handlers passed as props

## Build & Dev

```bash
pnpm dev        # dev server with HMR
pnpm build      # tsc -b && vite build
pnpm lint       # eslint .
pnpm preview    # preview production build
```

## Tailwind Usage

Theme tokens are CSS variables defined in `src/index.css` (`--background`, `--foreground`). Extend the theme there, not via a separate config file.
