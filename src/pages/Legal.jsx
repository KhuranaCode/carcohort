import { Link } from 'react-router-dom';

function Page({ title, updated, children, credits }) {
  return (
    <section className="container-x max-w-3xl py-16">
      <span className="chip bg-white/10 text-accent-300">{credits ? 'Photo credits and licences' : 'Prototype notice - not a legal agreement'}</span>
      <h1 className="mt-4 text-4xl font-extrabold text-ink-900">{title}</h1>
      <p className="mt-2 text-xs text-slate-500">{credits ? `Photo list as of ${updated}.` : `Describes this build as of ${updated}. It is written from what the code actually does, not from legal advice.`}</p>
      <div className="mt-8 space-y-6 text-sm leading-relaxed text-slate-600 [&_a]:text-accent-300 [&_a]:underline [&_h2]:mt-8 [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-ink-900 [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5">
        {children}
      </div>
      <p className="mt-10 text-xs text-slate-500">
        <Link className="underline hover:text-brand-500" to="/terms">Terms</Link> · <Link className="underline hover:text-brand-500" to="/privacy">Privacy</Link> · <Link className="underline hover:text-brand-500" to="/security">Security</Link> · <Link className="underline hover:text-brand-500" to="/credits">Photo credits</Link>
      </p>
    </section>
  );
}

import { CREDITS, SHOWN } from '../photos.js';
import { MODELS3D } from '../three/models.js';

const UPDATED = 'October 2026';

export function Terms() {
  return (
    <Page title="Terms of use" updated={UPDATED}>
      <p>CarCohort is an interactive concept prototype. These terms describe how to treat it. They are not a contract with a registered company, because no operating company details have been published for this prototype.</p>
      <h2>What this is</h2>
      <ul>
        <li>Vehicles, prices, dealerships, groups, offers, ratings and member counts are fictional sample data.</li>
        <li>Prices are indicative demo figures. They are not quotes, offers to sell, or advice.</li>
        <li>Joining a group, reserving an offer or sending a quote request does not buy anything, does not take payment and does not contact any real dealership.</li>
        <li>Photographs are real vehicle photos from Wikimedia Commons (see Photo credits). Each shows one specific vehicle and model year, which may differ from a listed variant.</li>
      </ul>
      <h2>Your use</h2>
      <ul>
        <li>Do not enter real personal, financial or identity details. Use a made-up name.</li>
        <li>Do not try to disrupt the service or access data that is not yours.</li>
      </ul>
      <h2>No guarantees</h2>
      <p>The prototype is provided as is. Savings are never guaranteed, and nothing here says a group deal will happen or that any dealer will respond.</p>
      <h2>Operator and governing law</h2>
      <p>Not yet defined. Operator name, contact address and governing law need to be supplied by the owner before any real launch.</p>
    </Page>
  );
}

export function Privacy() {
  return (
    <Page title="Privacy notice" updated={UPDATED}>
      <h2>What the app collects</h2>
      <ul>
        <li>Demo sign-in: a name you type and a role (buyer or dealer). There is no password, phone number or email.</li>
        <li>Your activity: groups you join, offers you reserve, price alerts, and quote requests (vehicle, variant, city, budget, delivery date).</li>
      </ul>
      <h2>Where it is stored</h2>
      <ul>
        <li><b>Browser only (static or hosted preview):</b> the data above stays in your browser (local storage when available, otherwise memory for that visit). Nothing is sent to a CarCohort server because none runs in that mode.</li>
        <li><b>With the optional local server (npm start):</b> your name and the activity above are also sent to that server and saved in a plain JSON file (server/db.json) on whoever runs it. Entries are not encrypted and have no automatic expiry.</li>
      </ul>
      <h2>Who can see it</h2>
      <p>The server does not include other people's reservations or quote requests in the public catalogue response. But there is no real login, so anyone who knows the exact name used can request the records saved under that name. Group member counts and dealer offers are visible to everyone. Treat anything you enter as non-private.</p>
      <h2>Third parties</h2>
      <ul>
        <li>The page loads fonts from Google Fonts, so your browser sends your IP address and browser details to Google when it loads.</li>
        <li>No analytics, advertising trackers or payment processors are included in this build.</li>
        <li>The app sets no cookies of its own.</li>
      </ul>
      <h2>Deleting your data</h2>
      <p>Clear this site's storage in your browser to remove local data. Data saved on a local server can be removed by deleting that server's db.json. No public deletion request channel exists yet because there is no operator contact.</p>
      <h2>Operator</h2>
      <p>Data controller identity, contact details, retention periods and any legal basis statements are not defined. The owner must supply them before collecting real personal data.</p>
    </Page>
  );
}

export function Security() {
  return (
    <Page title="Security notes" updated={UPDATED}>
      <p>This page lists what is actually in place and what is not. It is not a security guarantee and the build has not had an independent security review.</p>
      <h2>In place (local Express server only)</h2>
      <ul>
        <li>Content Security Policy, frame blocking, no-sniff, referrer and permissions headers on responses.</li>
        <li>Request body size limit and rejection of malformed JSON without error details.</li>
        <li>Per-address rate limits on API calls, and caps on stored joins, offers, reservations and requests.</li>
        <li>Server-side validation of names, prices, dates and identifiers; React escapes displayed text.</li>
        <li>The catalogue call no longer lists everyone's reservations and quote requests. This is data minimisation, not access control: the ?name= filter is a guessable string, so it does not stop another person reading a name's records.</li>
        <li>The server listens on the loopback address (127.0.0.1) by default. It should not be exposed publicly or used with real personal data until proper authentication and per-user access checks exist.</li>
      </ul>
      <h2>Not in place</h2>
      <ul>
        <li><b>No real authentication.</b> Anyone can use any name or choose the dealer role. Dealer offers are not verified.</li>
        <li>No encryption of stored data, no HTTPS handling by the app itself, no audit log, no backups.</li>
        <li>The rate limiter is in memory and per process.</li>
        <li>The static hosted preview has no server, so none of the server controls above apply there. Its protection comes from the host and the browser only.</li>
      </ul>
      <h2>Known dependency advisories</h2>
      <p>npm audit currently reports advisories in development tooling (Vite, esbuild) and in react-router and tailwindcss. Updating them requires major version changes that have not been tested in this build.</p>
      <h2>Reporting a problem</h2>
      <p>No security contact exists for this prototype yet. One must be added by the owner before any public launch.</p>
    </Page>
  );
}


export function Credits() {
  return (
    <Page title="Photo credits" updated={UPDATED} credits>
      <p>Vehicle photographs come from Wikimedia Commons. Each file is used under the licence shown, with the author credited. Images were resized and recompressed. The only other edit is listed per photo below (the Hector photo has its number plate blurred). Share-alike licences (CC BY-SA) require adaptations such as these resized copies to stay under the same licence. Photos show a specific vehicle and model year, which can differ from a current variant, so treat them as illustrations of the model, not of a listed variant. No manufacturer or owner endorses this prototype.</p>
      <p>Vehicles with no verified, openly licensed photo of the right model yet show a labelled placeholder instead of a different car.</p>
      <ul>
        {Object.entries(CREDITS).map(([k, c]) => (
          <li key={k}><b className="text-ink-900">{SHOWN[k] || k}</b>: "{c.title}" by {c.author}, {c.license}.{c.note ? <> <i>{c.note}</i></> : null} <a className="underline" href={c.page} target="_blank" rel="noreferrer noopener">Source page</a></li>
        ))}
      </ul>
      <h2>Interactive 3D models</h2>
      <p>The interactive 3D stages come from Sketchfab. Each model is used under the licence shown, with the author credited. The only edit is a size-optimised re-export (compressed geometry and textures). Models are fan-made interpretations, so details can differ from a current production vehicle - treat them as illustrations. No manufacturer or creator endorses this prototype.</p>
      <ul>
        {Object.entries(MODELS3D).map(([k, m]) => (
          <li key={k}><b className="text-ink-900">{m.display}</b>: "{m.title}" by {m.author}, {m.license}. <a className="underline" href={m.page} target="_blank" rel="noreferrer noopener">Source page</a></li>
        ))}
      </ul>
    </Page>
  );
}
