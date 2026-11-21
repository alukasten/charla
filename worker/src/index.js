import webpush from "web-push";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "content-type",
};

const SUB_KEY = "subscription";

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json", ...CORS_HEADERS },
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: CORS_HEADERS });
    }

    if (url.pathname === "/subscribe" && request.method === "POST") {
      let body;
      try {
        body = await request.json();
      } catch (e) {
        return json({ error: "invalid JSON" }, 400);
      }
      if (!body.subscription || typeof body.targetMinuteUTC !== "number") {
        return json({ error: "subscription and targetMinuteUTC required" }, 400);
      }
      const record = {
        subscription: body.subscription,
        targetMinuteUTC: body.targetMinuteUTC,
        lastSentDate: null,
      };
      await env.CHARLA_KV.put(SUB_KEY, JSON.stringify(record));
      return json({ ok: true });
    }

    if (url.pathname === "/unsubscribe" && request.method === "POST") {
      await env.CHARLA_KV.delete(SUB_KEY);
      return json({ ok: true });
    }

    // Manual trigger for testing: POST /test-send forces a push right now,
    // ignoring the scheduled time (but still only once per day via lastSentDate).
    if (url.pathname === "/test-send" && request.method === "POST") {
      try {
        const sent = await trySendReminder(env, { force: true });
        return json({ sent });
      } catch (err) {
        return json({ error: String((err && err.message) || err) }, 500);
      }
    }

    return json({ error: "not found" }, 404);
  },

  async scheduled(event, env, ctx) {
    ctx.waitUntil(trySendReminder(env, { force: false }));
  },
};

async function trySendReminder(env, { force }) {
  const raw = await env.CHARLA_KV.get(SUB_KEY);
  if (!raw) return false;
  const record = JSON.parse(raw);

  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);
  if (record.lastSentDate === todayStr) return false;

  if (!force) {
    const nowMinuteUTC = now.getUTCHours() * 60 + now.getUTCMinutes();
    const bucket = (m) => Math.floor(m / 15) * 15;
    if (bucket(nowMinuteUTC) !== bucket(record.targetMinuteUTC)) return false;
  }

  webpush.setVapidDetails(
    "mailto:charla-app@example.com",
    env.VAPID_PUBLIC_KEY,
    env.VAPID_PRIVATE_KEY
  );

  try {
    await webpush.sendNotification(
      record.subscription,
      JSON.stringify({ title: "Charla", body: "🔥 Zeit für dein Spanisch! Dein Streak wartet." })
    );
  } catch (err) {
    // Subscription expired/invalid (410 Gone) - drop it so we stop retrying.
    if (err && (err.statusCode === 404 || err.statusCode === 410)) {
      await env.CHARLA_KV.delete(SUB_KEY);
    }
    throw err;
  }

  record.lastSentDate = todayStr;
  await env.CHARLA_KV.put(SUB_KEY, JSON.stringify(record));
  return true;
}
