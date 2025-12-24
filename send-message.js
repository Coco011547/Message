
// api/send-message.js
import twilio from 'twilio';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*'); // or your GitHub Pages URL
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    const { to, channel, body } = req.body || {};
    if (!to || !body || channel !== 'whatsapp_twilio') {
      return res.status(400).json({ error: 'Missing to/body or unsupported channel' });
    }

    const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_FROM } = process.env;
    const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

    const toWhatsApp = to.startsWith('whatsapp:') ? to    const toWhatsApp = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;
    const message = await client.messages.create({
      from: TWILIO_WHATSAPP_FROM,
      to: toWhatsApp,
      body,
    });

    return res.status(200).json({ id: message.sid, status: message.status });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Twilio send failed' });
  }
