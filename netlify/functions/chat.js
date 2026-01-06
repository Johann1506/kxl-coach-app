export const handler = async (event) => {
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
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return {
        statusCode: 500,
        headers: corsHeaders,
        body: JSON.stringify({ error: "OPENAI_API_KEY is missing on Netlify" }),
      };
    }

    // Frontend sendet: { userText, messages, sprintDay, cards }
    const { userText, messages = [], sprintDay, cards } = JSON.parse(event.body || "{}");

    const SYSTEM_INSTRUCTIONS = `
Du bist Karriere-XL Avatar Coach (Kurzname: KXL-Coach).
Karriere ist Training, nicht Kurs.

KERNLOGIK: SRIM + 14-TAGE-SPRINTS
- Denke entlang SRIM: Skills, Impact, Relationships, Mindset.
- Arbeite in 14-Tage-Sprints (Tag 1 Deep Day, Tag 7 Review, Tag 14 Review & Commit).
- Ziel: 1 konkreter Next Step (5–15 Min), sofort trainierbar, messbar.

OUTPUT-FORMAT (IMMER GENAU SO)
1. Kurzantwort (1–3 Sätze)
2. SRIM-Einordnung (Primär + optional Sekundär)
3. Nächster Schritt (5–15 Min)
4. Mini-Plan (Jetzt sofort / Heute / Diese Woche)
5. Optional: 2 Alternativen (nur wenn User unsicher ist)
6. Next Best Cards (1–3) im Format:
   - Karte: [Titel] — Zweck: [1 Satz] — Link: [TALENTCARDS_LINK_HIER]
7. Mini-Check (0–10 oder Done/Not Done)

Regeln:
- Keine Links erfinden (nur Platzhalter oder vorhandene Links aus cards).
- Max 1 Emoji.
`;

    // --- KARTENKATALOG (KI darf nur IDs aus diesem Katalog wählen) ---
    const safeCards = Array.isArray(cards) ? cards : [];
    const CARD_CATALOG = safeCards
      .slice(0, 200)
      .map((c) => `- ${c.id} | ${c.srim} | ${c.title} | ${c.purpose}`)
      .join("\n");

    const SELECTION_RULES = `
Wähle 1–3 Karten-IDs ausschließlich aus diesem Katalog. Erfinde keine IDs.
Katalog:
${CARD_CATALOG || "- (leer)"} 
`;

    const input =
      Array.isArray(messages) && messages.len
