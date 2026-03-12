# IPTV Web App

A clean, fast, browser-based IPTV player that lets you manage and watch M3U playlist streams directly in your browser — no installs, no accounts.

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss&logoColor=white)
![PWA](https://img.shields.io/badge/PWA-ready-5A0FC8?logo=pwa&logoColor=white)

---

## Features

- **Multiple M3U sources** — Add any number of remote M3U/M3U8 URLs or load local `.m3u` files from disk
- **Per-source toggle** — Enable or disable individual playlist sources without deleting them
- **Unified channel list** — Channels from all active sources are merged and sorted alphabetically
- **Search & filter** — Live search with a clear button; filter by Favorites
- **Favorites** — Star channels and access them in a dedicated tab, persisted across sessions
- **HTML5 video player** — Plays streams natively using the browser's `<video>` element
- **Virtualized list** — Renders thousands of channels smoothly with `@tanstack/react-virtual`
- **Persistent cache** — TanStack Query cache survives page reloads via IndexedDB (24 h TTL)
- **Local file storage** — Local M3U files are stored in IndexedDB (no 5 MB localStorage limit)
- **PWA** — Installable on desktop and mobile, works offline for cached data
- **Responsive** — Mobile-first layout: player stacks above channel list on small screens
- **Dark mode** — Dark-only UI with Tailwind CSS 4 and shadcn/ui components

## Screenshots

> _Player view with sidebar channel list_

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) ≥ 18
- [pnpm](https://pnpm.io/) ≥ 9

### Installation

```bash
git clone https://github.com/karelric/iptvhub.git
cd iptv-webapp
pnpm install
```

### Development

```bash
pnpm dev
```

Opens at `http://localhost:5173`.

### Production build

```bash
pnpm build
pnpm preview
```

---

## Usage

1. Open the app and go to **Settings**.
2. Add one or more M3U playlist URLs, or click **Choose .m3u file…** to load a local file.
3. Toggle sources on/off with the switch next to each entry.
4. Return to the home screen — channels load automatically and are sorted alphabetically.
5. Click a channel to start playback; star channels to save them as favorites.

---

## Tech Stack

| Layer             | Library                                            |
| ----------------- | -------------------------------------------------- |
| UI framework      | React 19                                           |
| Language          | TypeScript 5 (strict)                              |
| Styling           | Tailwind CSS 4 + shadcn/ui (Base UI)               |
| Data fetching     | TanStack Query v5                                  |
| Cache persistence | `@tanstack/react-query-persist-client` + IndexedDB |
| Virtualization    | `@tanstack/react-virtual` v3                       |
| M3U parsing       | `@iptv/playlist`                                   |
| Routing           | React Router v7                                    |
| PWA               | Workbox                                            |
| Icons             | Lucide React                                       |
| Font              | Geist Variable                                     |

---

## Project Structure

```
src/
  App.tsx                  # Root layout (AppHeader + Routes)
  components/
    AppHeader.tsx          # Top navigation bar
    ChannelTile.tsx        # Single channel list item
    DisclaimerBanner.tsx   # First-visit disclaimer overlay + reusable DisclaimerText
    ui/                    # shadcn/ui components
  hooks/
    useChannels.ts         # Fetch + merge channels from all active M3U sources
    useFavorites.ts        # Favorites Set persisted to localStorage
    useM3uUrls.ts          # URL list + disabled state persisted to localStorage
  lib/
    localM3u.ts            # IndexedDB helpers for local M3U file storage
    utils.ts               # shadcn cn() utility
  pages/
    HomePage.tsx           # Sidebar channel list + video player
    SettingsPage.tsx       # Manage M3U playlist sources
```

---

## Disclaimer

This application is a neutral tool for playing M3U streams. It does not host, distribute, or endorse any content. Each user is solely responsible for ensuring they have the right to access the streams they configure. The developers accept no liability for unauthorized use, copyright infringement, or access to restricted content.

---

## License

MIT
