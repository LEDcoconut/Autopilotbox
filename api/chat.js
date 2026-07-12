// Serverless proxy for Featherless chat completions.
// The real API key lives only in the Vercel project's environment variables
// (Settings -> Environment Variables -> FEATHERLESS_API_KEY) and never reaches
// the browser or the git repo.
export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const apiKey = process.env.FEATHERLESS_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: "Server misconfigured: FEATHERLESS_API_KEY is not set" });
    return;
  }

  try {
    const upstream = await fetch("https://api.featherless.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + apiKey
      },
      body: JSON.stringify(req.body)
    });

    const text = await upstream.text();
    res.status(upstream.status);
    res.setHeader("Content-Type", "application/json");
    res.send(text);
  } catch (err) {
    res.status(502).json({ error: "Upstream request to Featherless failed", detail: String(err) });
  }
}
