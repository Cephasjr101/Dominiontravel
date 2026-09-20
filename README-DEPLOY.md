# Dominion Travel — Multi-vertical Affiliate MVP (Deploy Guide)

Covers: flights, hotels, tours & activities, car rentals, airport transfers (+ visa guidance).
Affiliate stack: Travelpayouts dashboard + Viator + Booking.com deep links + WhatsApp close.
All sign-up-able from Ghana; no keys are required for the site to work on day one.

## 1) Replace before launch (search "REPLACE" / "YOUR_")
- Domain: replace `dominion-flights.example.com` in index.html, robots.txt, sitemap.xml, js/main.js
- `index.html`: data-marker="YOUR_TP_MARKER" (Travelpayouts dashboard), data-pid="YOUR_VIATOR_PID"
- `js/main.js`: analytics domain; `YOUR_BOOKING_AID` in the cars route

## 2) Wire your dashboard IDs (5 minutes each)
1. Travelpayouts → Tools/Widgets → copy each widget's code → paste into the matching
   `.widget-slot` div or into `loadWidgets()` in js/main.js (flights injector is already
   written as the example). Widgets load only after cookie consent (GDPR-friendly).
2. Viator → Partner dashboard → widget code → `tp-tours` slot.
3. No Travelpayouts yet? The quick-search forms already work via deep links — launch today.

## 3) Deploy
GitHub → Netlify/Vercel → add domain → Force HTTPS. `_headers` ships HSTS + CSP + hardening.

## 4) Secrets
Never put API secrets in these files. If you later call APIs with custom code, proxy via
a serverless function and keep keys in host env vars.

## 5) Analytics
Plausible snippet loads ONLY after consent. Replace the data-domain, or swap for GA4
inside the same consent gate.

## Already done
SEO meta + OG/Twitter cards, JSON-LD (TravelAgency + offers), robots.txt, sitemap.xml,
alt text on all images, compressed WebP hero (21 KB), lazy widgets, custom 404, honeypot +
time-trap spam protection, full date validation per form type, consent-gated widgets,
privacy/terms/refund pages, favicons + PWA manifest, keyboard-accessible tabs & forms
(arrow keys, focus-visible, role=alert), contrast-checked palette, mobile responsive,
single primary CTA per section, minimal data collection (nothing stored server-side).

## Post-launch
PageSpeed audit, broken-link check, submit sitemap to Search Console, apply for
Travelpayouts & Viator if you haven't, connect Paystack/Flutterwave for deposits.
