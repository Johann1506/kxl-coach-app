export const handler = async (event) => {
  // CORS (harmlos auch wenn gleiche Domain)
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: corsHeaders, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: corsHeaders,
      body: JSON.stringify({ error: "Use POST" }),
    };
  }

  try {
    const apiKey = process.env.OPENAI_API_KEY; // kommt aus Netlify Environment Variables
    if (!apiKey) {
      return {
        statusCode: 500,
        headers: corsHeaders,
        body: JSON.stringify({ error: "OPENAI_API_KEY is missing on Netlify" }),
      };
    }

    const { message, messages } = JSON.parse(event.body || "{}");

    // Minimaler Fallback, falls dein Frontend nur "message" schickt
    const userText =
      message ||
      (Array.isArray(messages) ? messages.map(m => `${m.role}: ${m.content}`).join("\n") : "") ||
      "Hi";

    const SYSTEM_INSTRUCTIONS = `
Du bist Karriere-XL Avatar Coach (Kurzname: KXL-Coach).
Karriere ist Training, nicht Kurs.
Denke entlang SRIM: Skills, Impact, Relationships, Mindset.
Arbeite in 14-Tage-Sprints: Tag 1 Deep Day, Tag 7 Review, Tag 14 Review & Commit.
Ziel jeder Antwort: 1 konkreter Next Step (5–15 Min), sofort trainierbar.

OUTPUT-FORMAT (IMMER):
1) Kurzantwort (1–3 Sätze)
2) SRIM-Einordnung (1 Zeile)
3) Nächster Schritt (5–15 Min)
4) Mini-Plan: Jetzt sofort / Heute / Diese Woche
5) Optional: 2 Alternativen (nur wenn User unsicher)
6) Next Best Cards (1–3) im Format:
   - Karte: [Titel] — Zweck: [1 Satz] — Link: [TALENTCARDS_LINK_HIER]
7) Mini-Check (0–10 oder Done/Not Done)

Link-Regeln: keine echten URLs erfinden, nur Platzhalter.
Ton: freundlich, klar, motivierend. Max 1 Emoji.
`;

    // OpenAI Responses API
    const r = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4.1",               // kannst du später ändern
        input: userText,
        instructions: SYSTEM_INSTRUCTIONS,
      }),
    });

    const data = await r.json();

    if (!r.ok) {
      return {
        statusCode: r.status,
        headers: corsHeaders,
        body: JSON.stringify({ error: data?.error || data }),
      };
    }

    // Text aus response.output ziehen
    const text =
      data?.output
        ?.flatMap((o) => o?.content || [])
        ?.find((c) => c?.type === "output_text")
        ?.text || "";

    return {
      statusCode: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: String(err) }),
    };
  }
};
