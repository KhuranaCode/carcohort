# CarCohort

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
- **Tests**: `node:test` API suite (7 tests: bootstrap, idempotent join/leave, offer validation + persistence, reservation integrity, 404s, buyer requests)

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
