# Pretext Watchboard

Pretext Watchboard is a MAL-inspired social tracker for TV shows and movies. It
lets people maintain a public watch list, sign in with a demo account, inspect
friends' shelves, add/remove friends, post in spoiler-safe community boards,
and discover titles that break algorithm silos.

The static site lives in [`docs/`](docs/) and is already wired to the existing
GitHub Pages workflow in
[`.github/workflows/deploy-pages.yml`](.github/workflows/deploy-pages.yml).

## Features

- MAL-style personal shelf with status, score, progress, notes, and IMDb links
- Login + account creation for a local demo session
- Public profile browsing so you can open other people's lists
- Friend graph actions: add/remove friends and compare shared titles
- Community boards with channels, linked titles, likes, and comments
- Anti-silo recommendation rail that blends friend shelves, outer-circle picks,
  genre novelty, and IMDb/chart signals
- Live TV chart rail powered by the TVMaze API with direct IMDb title links
- Custom title composer for adding new movies or shows that are not in the seed
  catalog
- Responsive "Pretext" style UI with text-forward editorial cards

## Demo accounts

Use any of these handles to sign in immediately:

- `nova` / password `nova`
- `milo` / password `milo`
- `zoya` / password `zoya`
- `arya` / password `arya`
- `ken` / password `ken`

You can also create a new local demo account from the login card.

## Local preview

```bash
cd /Users/ameyakulkarni/Desktop/Insurance
python3 -m http.server 4173 --directory docs
```

Open [http://localhost:4173](http://localhost:4173).

## GitHub Pages deployment

This repo already deploys the [`docs/`](docs/) folder through GitHub Actions.

1. Push `main` to GitHub.
2. In the repository settings, set GitHub Pages source to `GitHub Actions`.
3. The workflow publishes the latest contents of [`docs/`](docs/).

## Important static-hosting note

GitHub Pages is static hosting, so this implementation uses browser
`localStorage` for demo auth, shelves, friendships, and board posts. That means
data is persisted per browser/device, not in a shared cloud database.

If you want production-grade multi-user sync, the frontend is ready to be wired
to Firebase Auth + Firestore, Supabase Auth + Postgres, or another hosted API.

## Existing Python code

The original server-utilization Python agent code is still present under
[`src/server_utilization_agent`](src/server_utilization_agent/) and untouched by
the frontend rewrite. Only the GitHub Pages site in [`docs/`](docs/) and this
README were repurposed for Pretext Watchboard.
