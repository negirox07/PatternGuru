# PatternGuru

An interactive, single-page reference for the nine classic Gang of Four (GoF) software
design patterns — Creational, Structural, and Behavioral — with runnable code in
TypeScript, Python, and Java, side-by-side pattern comparison, and knowledge quizzes.

**Live site:** [patternguru.netlify.app](https://patternguru.netlify.app/)

## Features

- **Full pattern catalog** — Singleton, Factory Method, Builder, Adapter, Decorator,
  Facade, Observer, Strategy, and State, each with intent, structure, trade-offs, and
  multi-language code samples.
- **Compare mode** — view two patterns side by side.
- **Knowledge quiz** — randomized questions drawn across the whole catalog, plus a
  short quiz at the end of every pattern page.
- **Personal notes** — a per-pattern scratchpad, saved to your browser (localStorage /
  IndexedDB), for your own project-specific notes.
- **Search, favorites, and recently-viewed** across the sidebar navigation.
- **Keyboard shortcuts and voice commands** — press `?` in the app for the full list.
- **Accessibility** — light, dark, and high-contrast themes, plus a dedicated
  print/PDF stylesheet for offline reading.
- **Guided tour** for first-time visitors.

## Tech stack

- [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Vite 6](https://vitejs.dev/) for dev server and bundling
- [Tailwind CSS 4](https://tailwindcss.com/) (via `@tailwindcss/vite`)
- [Motion](https://motion.dev/) for animation
- [Lucide](https://lucide.dev/) for icons

No backend and no API keys are required to run the app — all pattern content ships
statically in [src/data/patterns.ts](src/data/patterns.ts), and all user data (notes,
favorites, ratings, theme) stays in the browser's own storage.

## Run locally

**Prerequisites:** Node.js (18+)

```bash
npm install
npm run dev
```

The app runs at `http://localhost:3000`.

## Other scripts

| Command | Description |
|---|---|
| `npm run build` | Type-check and produce a production build in `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Type-check the project (`tsc --noEmit`) without emitting output |
| `npm run clean` | Remove `dist/` |

## Project structure

```
src/
  App.tsx                  Top-level layout, routing (hash-based), theme/state
  components/               UI components (pattern view, sidebar, quizzes, ads, etc.)
  data/
    patterns.ts              All pattern content: descriptions, code samples, metadata
    quizzes.ts                Quiz question banks
  utils/                    Small helpers (cookies, ratings, browser DB)
  adsConfig.ts               Google AdSense publisher/slot configuration
public/
  about.html, privacy-policy.html, terms.html, contact.html
                            Static, crawlable info pages (outside the SPA bundle)
  ads.txt, robots.txt, sitemap.xml
                            SEO / AdSense verification files
```

## Deployment

The site is deployed as a static build on [Netlify](https://www.netlify.com/). Any
static host that serves `dist/` and falls back unknown paths to `index.html` will work
just as well, since in-app navigation is hash-based (`/#singleton`, `/#builder`, …) and
does not require server-side routing — only the static pages under `public/` (like
`/about.html`) need to resolve as real files, which is the default behavior for
anything placed in `public/`.

## Contributing

Issues and pull requests are welcome — see
[github.com/negirox07/PatternGuru](https://github.com/negirox07/PatternGuru).
Additional language examples for existing patterns, or corrections to existing
explanations, are particularly useful contributions.

## License

No `LICENSE` file is currently published in this repository, so default copyright
applies. The site's [Terms of Use](public/terms.html) separately grants permission to
copy and adapt the pattern code samples themselves for any purpose, including
commercial use.
