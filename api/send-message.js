
// api/send-message.js
import twilio from 'twilio';

// Use '*' while testing; tighten later to your Pages origin (see notes below)
const ALLOWED_ORIGIN = '*';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { to, channel, body } = req.body || {};
    if (!to || !body || channel !== 'whatsapp_twilio') {
      return res.status(400).json({ error: 'Missing to/body or unsupported channel' });
    }

    const {
      TWILIO_ACCOUNT_SID,
      TWILIO_AUTH_TOKEN,
      TWILIO_WHATSAPP_FROM, // e.g., 'whatsapp:+14155238886' for sandbox
    } = process.env;

    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_WHATSAPP_FROM) {
      return res.status(500).json({ error: 'Twilio env not configured' });
    }

    const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
    const toWhatsApp = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;

    const message = await client.messages.create({
      from: TWILIO_WHATSAPP_FROM,
      to: toWhatsApp,
      body,
    });

    return res.status(200).json({ id: message.sid, status: message.status });
  } catch (err) {
    console.error('Twilio send error:', err?.message || err);
    return res.status(500).json({ error: err?.message || 'Twilio send failed' });
  }
}
