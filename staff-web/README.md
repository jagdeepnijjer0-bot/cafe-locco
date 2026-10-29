# Café Locco — Staff Rewards web page

A single self-contained static page (`index.html`, no build step) for café staff
to award and redeem loyalty points by scanning the customer's rewards QR code.

## One required step before deploy
Open `index.html` and replace the placeholder with your Supabase **anon public**
key (safe to embed — it's a public key):

```js
const SUPABASE_ANON_KEY = "REPLACE_WITH_ANON_PUBLIC_KEY";
```
Get it from Supabase → Project Settings → API → `anon` `public`.
`SUPABASE_URL` is already set to the live project.

## Deploy (Vercel, zero config)
Deploy the `staff-web/` folder as a static site. On Vercel: new project →
set the **Root Directory** to `staff-web` → deploy. No framework, no build command.
HTTPS is automatic (required for the camera).

Then on the iPad: open the URL in Safari, allow the camera when prompted, and
"Add to Home Screen" to run it full-screen.

## How it works
Calls the already-deployed `rewards-staff` edge function
(`POST /functions/v1/rewards-staff`) with `{ action, ... }`:
`login` → `lookup` (shows name + balance + eligible tiers) → `award` / `redeem`.
The staff PIN is verified server-side; the returned `staff_token` is kept only in
`sessionStorage`. QR scanning uses `html5-qrcode@2.3.8` from a pinned CDN.
