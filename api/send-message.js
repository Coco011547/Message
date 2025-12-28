
// api/send.js
const ALLOWED_ORIGINS = new Set([
  "https://github.com/Coco011547",
  "https://github.com/Coco011547/Message", // if using project pages
]);

function setCors(res, origin) {
  // Allow only your GitHub Pages origin(s). Using "*" is easier but less secure. [1](https://stackoverflow.com/questions/75980211/env-variables-not-being-accessed-in-deployment-in-github-pages-vite-react-ap)
  if (origin && ALLOWED_ORIGINS.has(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }

  res.setHeader("Vary", "Origin"); // ensures caches separate by origin
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  // If you do NOT use cookies/auth headers, do NOT set Allow-Credentials. [1](https://stackoverflow.com/questions/75980211/env-variables-not-being-accessed-in-deployment-in-github-pages-vite-react-ap)
}

module.exports = async (req, res) => {
  const origin = req.headers.origin;

  // Handle CORS preflight (browser sends OPTIONS before POST for JSON)
  if (req.method === "OPTIONS") {
    setCors(res, origin);
    return res.status(200).end();
  }

  // Set CORS for real request too
  setCors(res, origin);

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  // Your logic here (Twilio send, etc.)
  // ...
  return res.status(200).json({ ok: true });
};
