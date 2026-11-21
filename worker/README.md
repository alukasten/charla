# Charla Reminder Worker

Cloudflare Worker backend for Charla's daily push-notification reminder.
Runs entirely on Cloudflare's free tier (KV + Cron Triggers).

## What it does

- `POST /subscribe` — saves the browser's push subscription + desired
  reminder time (single user, one KV record)
- `POST /unsubscribe` — removes it
- `POST /test-send` — sends a reminder immediately (for testing)
- A Cron Trigger runs every 15 minutes, checks whether it's time to send
  today's reminder, and sends it via Web Push if so (once per day)

## One-time setup (deploy)

1. `npm install` (installs `wrangler` + `web-push`)
2. `npx wrangler login` (or set `CLOUDFLARE_API_TOKEN` env var instead)
3. Create the KV namespace: `npx wrangler kv namespace create CHARLA_KV`
   — copy the returned `id` into `wrangler.toml` (`REPLACE_WITH_KV_NAMESPACE_ID`)
4. Set the VAPID keys as secrets (never commit these):
   ```
   npx wrangler secret put VAPID_PUBLIC_KEY
   npx wrangler secret put VAPID_PRIVATE_KEY
   ```
5. Deploy: `npx wrangler deploy`
6. Note the deployed URL (e.g. `https://charla-reminder.<your-subdomain>.workers.dev`)
   — this goes into `index.html`'s `REMINDER_WORKER_URL` constant.

## Local dev

`.dev.vars` (git-ignored) can hold `VAPID_PUBLIC_KEY`/`VAPID_PRIVATE_KEY` for
`npx wrangler dev --local`. Cron doesn't fire automatically in local dev —
trigger it manually with `curl http://localhost:8787/cdn-cgi/local/scheduled`.
