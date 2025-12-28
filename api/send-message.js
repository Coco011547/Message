
// api/send.js
const twilio = require("twilio");

// ✅ IMPORTANT: Origin is only scheme + host (no /Message)
const ALLOWED_ORIGINS = new Set([
  "https://coco011547.github.io",
]);

function setCors(res, origin) {
  if (origin && ALLOWED_ORIGINS.has(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  // Do NOT set Allow-Credentials unless you use cookies/auth headers. [1](https://digitalhumanities.hkust.edu.hk/tutorials/how-to-host-your-website-on-github-page/)
}

function isE164(num) {
  return typeof num === "string" && /^\+\d{8,15}$/.test(num.trim());
}
function isWhatsApp(addr) {
  return typeof addr === "string" && /^whatsapp:\+\d{8,15}$/.test(addr.trim());
}

async function readJson(req) {
  let raw = "";
  await new Promise((resolve) => {
    req.on("data", (c) => (raw += c));
    req.on("end", resolve);
  });
  return raw ? JSON.parse(raw) : {};
}

module.exports = async (req, res) => {
  const origin = req.headers.origin;

  // ✅ PRE-FLIGHT (must succeed or browser blocks POST) [1](https://digitalhumanities.hkust.edu.hk/tutorials/how-to-host-your-website-on-github-page/)
  if (req.method === "OPTIONS") {
    setCors(res, origin);
    return res.status(200).end();
  }

  // ✅ Actual request must also include CORS headers
  setCors(res, origin);

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { channel, to, body } = await readJson(req);
    if (!channel || !to || !body) {
      return res.status(400).json({ error: "Missing channel/to/body" });
    }

    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken  = process.env.TWILIO_AUTH_TOKEN;
    if (!accountSid || !authToken) {
      return res.status(500).json({ error: "Missing TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN" });
    }

    const client = twilio(accountSid, authToken);

    if (channel === "whatsapp_twilio") {
      const from = process.env.TWILIO_WHATSAPP_FROM; // e.g. whatsapp:+14155238886
      if (!isWhatsApp(from)) return res.status(500).json({ error: "Invalid TWILIO_WHATSAPP_FROM" });
      if (!isWhatsApp(to))   return res.status(400).json({ error: "Invalid WhatsApp to (whatsapp:+E164)" });

      const msg = await client.messages.create({ from, to, body });
      return res.status(200).json({ sid: msg.sid, status: msg.status });
    }

    if (channel === "sms") {
      const from = process.env.TWILIO_SMS_FROM; // e.g. +91...
      if (!isE164(from)) return res.status(500).json({ error: "Invalid TWILIO_SMS_FROM" });
      if (!isE164(to))   return res.status(400).json({ error: "Invalid SMS to (+E164)" });

      const msg = await client.messages.create({ from, to, body });
      return res.status(200).json({ sid: msg.sid, status: msg.status });
    }

    return res.status(400).json({ error: "Unknown channel" });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};
