# Landed in India

This repository now includes a static GitHub Pages app in `docs/` that helps a user:

- search supported Indian and global stores for a product
- compare domestic offers against imported offers
- estimate landed import cost in India
- switch between light mode and dark mode
- store saved deals, settings, search history, and the latest scan in local storage

The older Python server-utilization prototype is still present under `src/`, but the GitHub Pages frontend is the main user-facing experience in this repo.

## Pages app

The site lives in `docs/` and is built as a browser-only app so it can run on GitHub Pages without a private backend.

### What it does

- scans multiple supported sources
  - Amazon India
  - Croma
  - eBay
  - AliExpress
- converts foreign prices to INR using Frankfurter exchange rates
- estimates India landed cost with configurable shipping, insurance, handling fee, and duty mode
- saves watchlist items and search history in the browser

### How the import estimate works

The default calculator uses an India import estimate for personal buys at `42.08%` of the assessable value, with an alternate `77.28%` gift mode and a custom override. This is meant as a planning estimate, not customs-clearance or legal advice. Final duty can still vary by product category, courier, exemptions, and customs classification.

### Local preview

```bash
cd /Users/ameyakulkarni/Desktop/Insurance
python3 -m http.server 4173
```

Then open:

- `http://localhost:4173/docs/`

## GitHub Pages deployment

The repository already includes a Pages workflow at `.github/workflows/deploy-pages.yml`.

To deploy:

1. Push the repo to GitHub.
2. In repository settings, enable GitHub Pages and set the source to `GitHub Actions`.
3. Push to `main` or run the workflow manually.

The workflow publishes the contents of `docs/`.

## Notes

- This is still a static-hosted app, so it does not run a private scraping backend.
- Search quality depends on the supported sources returning readable pages through the browser-safe proxy chain.
- All saved data is local to the browser unless you add a real backend later.

## Legacy code

The earlier Python project remains in place:

- `src/server_utilization_agent/`
- `tests/`
- `configs/`

Those files are untouched by the new Pages app and can still be used independently if needed.
