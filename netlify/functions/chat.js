// netlify/functions/chat.js  (CommonJS)

exports.handler = async (event) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };

  // Preflight
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: corsHeaders, body: "" };
  }

  // Only POST
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

    const body = event.body ? JSON.parse(event.body) : {};
    const userText = body.userText || "";
    const messages = Array.isArray(body.messages) ? body.messages : [];
    const cards = Array.isArray(body.cards) ? body.cards : [];
    const sprintDay = body.sprintDay;

    const SYSTEM_INSTRUCTIONS =
      "Du bist Karriere-XL Avatar Coach (Kurzname: KXL-Coach). Karriere ist Training, nicht Kurs.\n" +
      "Denke entlang SRIM: Skills, Impact, Relationships, Mindset.\n" +
      "Arbeite in 14-Tage-Sprints (Tag 1 Deep Day, Tag 7 Review, Tag 14 Review & Commit).\n" +
      "Ziel jeder Antwort: 1 konkreter Next Step (5–15 Min), sofort trainierbar, messbar.\n\n" +
      "OUTPUT-FORMAT (IMMER GENAU SO)\n" +
      "1. Kurzantwort (1–3 Sätze)\n" +
      "2. SRIM-Einordnung (Primär + optional Sekundär)\n" +
      "3. Nächster Schritt (5–15 Min)\n" +
      "4. Mini-Plan (Jetzt sofort / Heute / Diese Woche)\n" +
      "5. Optional: 2 Alternativen (nur wenn User unsicher ist)\n" +
      "6. Next Best Cards (1–3) im Format:\n" +
      "   - Karte: [Titel] — Zweck: [1 Satz] — Link: [TALENTCARDS_LINK_HIER]\n" +
      "7. Mini-Check (0–10 oder Done/Not Done)\n\n" +
      "Regeln: keine Links erfinden (nur Platzhalter oder vorhandene Links aus cards). Max 1 Emoji.";

    // Kartenkatalog für ID-Auswahl
    const safeCards = cards.slice(0, 200).map((c) => ({
      id: String(c.id || ""),
      srim: String(c.srim || ""),
      title: String(c.title || ""),
      purpose: String(c.purpose || ""),
      link: String(c.link || "[TALENTCARDS_LINK_HIER]"),
    })).filter((c) => c.id && c.title);

    const catalogText = safeCards
      .map((c) => `- ${c.id} | ${c.srim} | ${c.title} | ${c.purpose}`)
      .join("\n");

    const selectionRules =
      "Wähle 1–3 Karten-IDs ausschließlich aus diesem Katalog. Erfinde keine IDs.\n" +
      "Katalog:\n" +
      (catalogText || "- (leer)");

    const input =
      messages.length > 0
        ? messages
        : [{ role: "user", content: userText || "Hi" }];

    const schema =
      "Gib am Ende NUR gültiges JSON zurück (keinen Fließtext davor/danach).\n" +
      "Schema:\n" +
      "{\n" +
      '  "short": "1–3 Sätze Kurzantwort",\n' +
      '  "srimPrimary": "Skills|Impact|Relationships|Mindset",\n' +
      '  "srimSecondary": "Skills|Impact|Relationships|Mindset|null",\n' +
      '  "nextStep": "konkret 5–15 Min, messbar",\n' +
      '  "planNow": "Jetzt sofort …",\n' +
      '  "planToday": "Heute …",\n' +
      '  "planWeek": "Diese Woche …",\n' +
      '  "alternatives": ["optional", "max 2"],\n' +
      '  "cardIds": ["S-01","I-01"],\n' +
      '  "miniCheck": "0–10 Frage oder Done/Not Done"\n' +
      "}";

    const r = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4.1",
        input,
        instructions: `${SYSTEM_INSTRUCTIONS}\n\nSprintDay: ${sprintDay ?? "n/a"}\n\n${selectionRules}\n\n${schema}`,
        temperature: Number(process.env.OPENAI_TEMPERATURE || 0.35),
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

    const raw =
      data?.output_text ||
      (data?.output || [])
        .flatMap((o) => o?.content || [])
        .find((c) => c?.type === "output_text")?.text ||
      "";

    let j;
    try {
      j = JSON.parse(raw);
    } catch {
      // fallback: wenn KI kein JSON liefert
      return {
        statusCode: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        body: JSON.stringify({ reply: raw || "No reply" }),
      };
    }

    const byId = new Map(safeCards.map((c) => [c.id, c]));
    const picked = Array.isArray(j.cardIds) ? j.cardIds.slice(0, 3) : [];
    const pickedCards = picked.map((id) => byId.get(id)).filter(Boolean);

    const lines = [];
    lines.push("1. Kurzantwort");
    lines.push(j.short || "Okay – wir machen das trainierbar.");
    lines.push("");
    lines.push("2. SRIM-Einordnung");
    lines.push(
      `Primär: **${j.srimPrimary || "Skills"}**` +
        (j.srimSecondary && j.srimSecondary !== "null"
          ? ` · Sekundär: **${j.srimSecondary}**`
          : "")
    );
    lines.push("");
    lines.push("3. Nächster Schritt (5–15 Min)");
    lines.push(j.nextStep || "10 Minuten Fokus-Output erstellen.");
    lines.push("");
    lines.push("4. Mini-Plan");
    lines.push(`- **Jetzt sofort:** ${j.planNow || "Timer 10 Min, starten."}`);
    lines.push(`- **Heute:** ${j.planToday || "1 Mini-Output sichern."}`);
    lines.push(`- **Diese Woche:** ${j.planWeek || "3 Wiederholungen planen."}`);
    lines.push("");

    if (Array.isArray(j.alternatives) && j.alternatives.length) {
      lines.push("5. Optional: 2 Alternativen");
      j.alternatives.slice(0, 2).forEach((a) => lines.push(`- ${a}`));
      lines.push("");
    }

    lines.push("6. Next Best Cards (1–3)");
    if (pickedCards.length) {
      pickedCards.forEach((c) => {
        lines.push(`- **Karte:** ${c.title} — **Zweck:** ${c.purpose} — **Link:** ${c.link}`);
      });
    } else {
      safeCards.slice(0, 2).forEach((c) => {
        lines.push(`- **Karte:** ${c.title} — **Zweck:** ${c.purpose} — **Link:** ${c.link}`);
      });
    }
    lines.push("");
    lines.push("7. Mini-Check");
    lines.push(j.miniCheck || "Done/Not Done — machst du den Schritt jetzt?");

    const reply = lines.join("\n");

    return {
      statusCode: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      body: JSON.stringify({ reply }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: String(err) }),
    };
  }
};
