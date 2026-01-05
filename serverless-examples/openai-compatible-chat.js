/**
 * Example serverless function (Node 18+).
 * This is a TEMPLATE. Replace MODEL + endpoint as needed.
 *
 * Input (POST JSON):
 *  { userText, messages, sprintDay, cards }
 * Output:
 *  { reply }
 */
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { userText, messages = [], sprintDay, cards } = req.body || {};
  if (!userText) return res.status(400).json({ error: "Missing userText" });

  // IMPORTANT: Keep your key on the server
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "Missing OPENAI_API_KEY" });

  const system = `You are KXL-Coach. Always follow the user's SYSTEM INSTRUCTIONS and OUTPUT FORMAT strictly.`;
  const prompt = [
    { role: "system", content: system },
    ...messages,
    { role: "user", content: userText }
  ];

  // OpenAI-compatible Chat Completions
  const r = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: prompt,
      temperature: 0.4
    })
  });

  if (!r.ok) {
    const t = await r.text().catch(() => "");
    return res.status(500).json({ error: "Upstream error", detail: t });
  }

  const data = await r.json();
  const reply = data?.choices?.[0]?.message?.content ?? "No reply";
  return res.status(200).json({ reply });
}
