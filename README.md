# CarCohort

> **REPOSITORY STATE (23 Oct 2026): the folders and individual files in this tree are an EARLIER, OUTDATED snapshot and may not run as-is.** Tree sync is in progress.
>
> The canonical, tested source (commit `203e6ab`; build clean, 8/8 API tests + headless-DOM smoke passing) is the verified archive in this repo root: **`carcohort-source-203e6ab-codeonly.tar.gz.b64`**. SHA-256 of the decoded archive: `783954e11da7d2e6cb7d0764a8a431d3b5114229fd09b28e1757c3fa1f70aa45`.
>
> Restore:
> ```
> base64 -d carcohort-source-203e6ab-codeonly.tar.gz.b64 > carcohort-source-203e6ab-codeonly.tar.gz
> tar -xzf carcohort-source-203e6ab-codeonly.tar.gz -d carcohort
> cd carcohort && npm install && npm run dev   # plus: node server/index.js
> ```
>
> This is a code-only archive: it excludes the hero image (`public/hero-carcohort.png`, ~2 MB, upload pending). `29-carcohort-source-3b78dfc.tar.gz` is an older snapshot kept for history; the archive above is newer and authoritative.


**India's group vehicle-buying platform - working prototype.** Buying a car or bike in India is a negotiation you're set up to lose: one buyer has no leverage against a showroom. CarCohort groups buyers who want the same vehicle in the same city, tells dealerships *"20 ready buyers - what's your best on-road price?"*, and puts every competing offer side by side.

Dealers get ready demand. Buyers get the leverage of twenty. Everyone keeps their own vehicle.

> **This is an interactive prototype.** Every group, dealer, offer and price in the
> app is fictional sample data. No real dealerships are partnered, no real
> transactions happen, and savings are never guaranteed.

## What the prototype does

- **Buyer quote requests** - pick a vehicle (car, bike, scooter, EV), exact variant tier, registration city, budget and requested delivery date. Dealers would be invited to bid against that exact request.
- **Live buying groups** - sample groups across Mumbai, Delhi NCR, Bengaluru, Pune and Chandigarh. Joining is free and non-binding.
- **Dealer competition** - dealerships bid a single final on-road price plus inclusions (insurance, warranty, accessories); the lowest comparable offer surfaces first, with charges and delivery terms visible.
- **Offer reservation** - free, non-binding, no payment on-platform; the proposed live flow routes VIN + pre-delivery-inspection verification before any money moves at the dealership.
- **Buyer dashboard + dealer portal** - join groups, track offers, place bids.
- **Not car sharing** - every buyer owns their own vehicle, registered in their own name.

## Architecture

- **Frontend**: React 18 + Vite + Tailwind CSS 3 + React Router 6 (hash routing)
- **Backend**: Node + Express API (`server/`), JSON-file persistence (`server/db.json`) - joins, dealer offers, reservations and buyer requests persist across restarts and browsers
- **Seed data**: one source of truth in `src/data.js`, shared by client and server
- **Tests**: `node:test` API suite (8 tests: bootstrap, idempotent join/leave, offer validation + persistence, reservation integrity, 404s, buyer requests) plus a headless-DOM smoke walk (group detail, reserve flow, dashboard, compare)

## Run it

```bash
npm install
npm run build     # build the frontend into dist/
npm start         # serves API + built app on http://localhost:3001

# development (two terminals):
npm run server    # API on :3001
npm run dev       # Vite dev server with /api proxy

npm test          # run the API test suite
```

## Prototype vs production

| Works in the prototype | Deliberately not built yet |
| --- | --- |
| Full browse/request/join/bid/reserve flows | Real dealer partnerships or outreach |
| Multi-browser persistence via local server | Real auth (OTP/KYC) - demo sign-in only |
| Variant, budget, delivery-date requests | Payments of any kind |
| Dealer bid submission + comparison | Live RTO/insurance quote integrations |
| Proposed PDI/VIN trust flow (described) | Verified inspection operations |

## License

MIT - see [LICENSE](LICENSE).
