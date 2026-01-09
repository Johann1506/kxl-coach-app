export type Srim = "Skills" | "Impact" | "Relationships" | "Mindset";
export type CardPhase = "Drill" | "Toolcard" | "Review" | "DeepDay";

export type KxlCard = {
  id: string;
  srim: Srim;
  title: string;
  purpose: string;
  link: string;

  phase?: CardPhase;
  durationMin?: number;
  difficulty?: 1 | 2 | 3;

  triggers?: string[];
  keywords?: string[];
  tags?: string[];

  whenToUse?: string;
  how?: string[];
  check?: string;

  fallbackIds?: string[];
  evidence?: string[];
};

export const CARDS: KxlCard[] = [
  {
    id: "S-01",
    srim: "Skills",
    title: "Kernsatz in 10 Sekunden",
    purpose: "Du formulierst für wen + Ergebnis + wodurch du anders bist.",
    link: "[TALENTCARDS_LINK_HIER]",
    phase: "Drill",
    durationMin: 10,
    difficulty: 1,
    triggers: ["kernsatz", "positionierung", "profil", "usp", "pitch"],
    keywords: ["für wen", "ergebnis", "anders", "klarheit"],
    tags: ["positioning", "clarity"],
    whenToUse: "Wenn dein Pitch beliebig klingt oder du dich klar positionieren willst.",
    how: [
      "Schreibe 3 Varianten: Für wen + Ergebnis + wodurch.",
      "Lies jede Variante laut (10 Sek).",
      "Wähle die klarste, streiche 30% Wörter."
    ],
    check: "0–10: Wie klar in 10 Sekunden?"
  },
  {
    id: "R-01",
    srim: "Relationships",
    title: "Meeting-Entry: 10-Sek-Claim",
    purpose: "Du kommst rein, ohne zu kämpfen.",
    link: "[TALENTCARDS_LINK_HIER]",
    phase: "Drill",
    durationMin: 5,
    difficulty: 1,
    triggers: ["meeting", "übergangen", "komme nicht rein", "unterbrochen"],
    keywords: ["entry", "claim", "turn-taking"],
    tags: ["meetings", "influence"],
    whenToUse: "Wenn du im Meeting übergangen wirst oder zu spät reinkommst.",
    how: [
      "Sag: „Ich mache den Punkt in 10 Sekunden.“",
      "Dann 1 Satz Kernpunkt.",
      "Pause 1 Sek, Blickkontakt."
    ],
    check: "0–10: Wie stabil war mein Entry?"
  },
  {
    id: "R-02",
    srim: "Relationships",
    title: "Stakeholder-Frage: Entscheidung klären",
    purpose: "Du lenkst Gespräche auf Entscheidungspfad statt Meinung.",
    link: "[TALENTCARDS_LINK_HIER]",
    phase: "Toolcard",
    durationMin: 10,
    difficulty: 1,
    triggers: ["stakeholder", "entscheidung", "abstimmung", "freigabe"],
    keywords: ["decider", "influencer", "blocker", "frage"],
    tags: ["stakeholder", "decision"],
    whenToUse: "Wenn unklar ist, wer entscheidet und wann.",
    how: [
      "Frage: „Wer entscheidet am Ende – und wann?“",
      "Frage: „Wer muss vorher gehört werden?“",
      "Notiere 3 Namen + nächster Schritt."
    ],
    check: "Done/Not Done: Entscheidungspfad notiert?"
  },
  {
    id: "I-01",
    srim: "Impact",
    title: "1 KPI für diese Woche",
    purpose: "Du machst Wirkung messbar statt gefühlt.",
    link: "[TALENTCARDS_LINK_HIER]",
    phase: "Toolcard",
    durationMin: 10,
    difficulty: 1,
    triggers: ["kpi", "wirkung", "impact", "sichtbar", "ergebnis"],
    keywords: ["messbar", "zahl", "woche"],
    tags: ["impact", "metrics"],
    whenToUse: "Wenn du zeigen willst, dass du Ergebnisse lieferst.",
    how: [
      "Wähle 1 Zahl, die diese Woche zählt.",
      "Definiere Zielwert + Messpunkt.",
      "Plane 1 Aktion, die die Zahl bewegt."
    ],
    check: "0–10: Wie messbar ist mein Impact?"
  },
  {
    id: "M-01",
    srim: "Mindset",
    title: "Anti-Prokrastination: 5-Min-Start",
    purpose: "Du startest trotz Widerstand.",
    link: "[TALENTCARDS_LINK_HIER]",
    phase: "Drill",
    durationMin: 5,
    difficulty: 1,
    triggers: ["prokrastination", "aufschieben", "starten", "blockiert"],
    keywords: ["5-min", "start", "reibung"],
    tags: ["momentum"],
    whenToUse: "Wenn du zu lange überlegst statt zu starten.",
    how: [
      "Definiere Mini-Schritt (5 Minuten).",
      "Timer 5 Minuten, nur anfangen.",
      "Stop nach 5 Min oder weiter, wenn’s läuft."
    ],
    check: "Done/Not Done: 5-Min-Start gemacht?"
  },
  {
    id: "S-02",
    srim: "Skills",
    title: "Voice: Pace & Pause",
    purpose: "Mehr Autorität durch Tempo-Kontrolle.",
    link: "[TALENTCARDS_LINK_HIER]",
    phase: "Drill",
    durationMin: 5,
    difficulty: 1,
    triggers: ["hastig", "tempo", "stimme", "schnell sprechen"],
    keywords: ["pause", "pace", "ruhe"],
    tags: ["presence", "voice"],
    whenToUse: "Wenn du zu schnell sprichst und Wirkung verlierst.",
    how: [
      "Lies deinen Kernsatz.",
      "Nach jedem Punkt: 1 Sek Pause.",
      "3×, jedes Mal 10% langsamer."
    ],
    check: "0–10: Verständlichkeit?"
  },
  {
    id: "I-02",
    srim: "Impact",
    title: "1 Ergebnis-Mail in 6 Zeilen",
    purpose: "Du machst Fortschritt sichtbar für Entscheider.",
    link: "[TALENTCARDS_LINK_HIER]",
    phase: "Toolcard",
    durationMin: 10,
    difficulty: 1,
    triggers:
