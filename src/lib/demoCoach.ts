import { Card, ChatMessage, SRIM } from "./types";

function pickSRIM(text: string): { primary: SRIM; secondary?: SRIM } {
  const t = text.toLowerCase();
  if (/(meeting|übergangen|chef|stakeholder|präsent|pitch|kernsatz|sprechen|stimme|kamera)/.test(t)) return { primary: "Impact", secondary: "Skills" };
  if (/(konflikt|kolleg|netzwerk|beziehung|feedback)/.test(t)) return { primary: "Relationships" };
  if (/(prokrast|stress|zweifel|angst|motivation|fokus)/.test(t)) return { primary: "Mindset" };
  return { primary: "Skills" };
}

function pickCards(cards: Card[], srim: SRIM): Card[] {
  const first = cards.filter(c => c.srim === srim);
  const rest = cards.filter(c => c.srim !== srim);
  return [...first, ...rest].slice(0, 3);
}

export function demoReply(userText: string, cards: Card[], sprintDay: number): string {
  const { primary, secondary } = pickSRIM(userText);
  const chosen = pickCards(cards, primary);

  const nextStep = primary === "Mindset"
    ? "Starte 10 Minuten „ugly start“: öffne das wichtigste Dokument und schreibe 10 Bulletpoints — ohne zu löschen."
    : primary === "Relationships"
      ? "Schreibe eine 2‑Minuten Follow-up Nachricht: Kontext + 1 Entscheidung + 1 Bitte."
      : primary === "Impact"
        ? "Formuliere in 7 Minuten deinen Kernsatz 1.0 (1 Satz: Ich helfe X, Y zu erreichen, indem Z)."
        : "Baue deinen 60‑Sekunden Pitch: 3 Sätze (Wer bin ich / wem helfe ich / welcher Nutzen).";

  const deepDayHint = (sprintDay === 1 || sprintDay === 7 || sprintDay === 14)
    ? "Heute ist ein Deep Day — wir machen es extra messbar."
    : "Mini-Training reicht — klein, aber sauber.";

  return [
    `1. Kurzantwort`,
    `Du bist dran, das Thema in Training zu verwandeln. ${deepDayHint}`,
    ``,
    `2. SRIM-Einordnung`,
    `Primär: **${primary}**${secondary ? ` · Sekundär: **${secondary}**` : ""}`,
    ``,
    `3. Nächster Schritt (5–15 Min)`,
    `${nextStep}`,
    ``,
    `4. Mini-Plan`,
    `- **Jetzt sofort:** Timer auf 10 Minuten, starten, nicht perfektionieren.`,
    `- **Heute:** 1 Mini‑Output speichern (Notiz / Draft / Screenshot).`,
    `- **Diese Woche:** 3 Wiederholungen einplanen (je 10–15 Min).`,
    ``,
    `6. Next Best Cards (1–3)`,
    ...chosen.map(c => `- **Karte:** ${c.title} — **Zweck:** ${c.purpose} — **Link:** ${c.link}`),
    ``,
    `7. Mini-Check`,
    `Done/Not Done — machst du den 10‑Minuten Step jetzt?`
  ].join("\n");
}

export function isDoneMessage(text: string) {
  const t = text.trim().toLowerCase();
  return ["done", "erledigt", "fertig", "gemacht"].some(x => t === x || t.includes(x));
}

export function buildFollowUpOnDone(cards: Card[]): string {
  const chosen = pickCards(cards, "Impact");
  return [
    `1. Kurzantwort`,
    `Stark — genau so sieht Training aus. ✅`,
    ``,
    `2. SRIM-Einordnung`,
    `Primär: **Impact** · Sekundär: **Skills**`,
    ``,
    `3. Nächster Schritt (5–15 Min)`,
    `Mach aus dem Output ein „Proof-Point“: 3 Belege/Beispiele notieren (was, Ergebnis, Kontext).`,
    ``,
    `4. Mini-Plan`,
    `- **Jetzt sofort:** 3 Proof-Points als Bulletpoints.`,
    `- **Heute:** 1 Person schicken (kurzer Status / Update).`,
    `- **Diese Woche:** 1 Mini‑Review (0–10) zu SRIM notieren.`,
    ``,
    `6. Next Best Cards (1–3)`,
    ...chosen.map(c => `- **Karte:** ${c.title} — **Zweck:** ${c.purpose} — **Link:** ${c.link}`),
    ``,
    `7. Mini-Check`,
    `0–10: Wie klar ist dein nächster Fokus jetzt?`
  ].join("\n");
}
