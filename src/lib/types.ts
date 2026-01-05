export type Role = "system" | "user" | "assistant";

export type ChatMessage = {
  id: string;
  role: Role;
  content: string;
  ts: number;
};

export type SRIM = "Skills" | "Impact" | "Relationships" | "Mindset";

export type Card = {
  id: string;
  title: string;
  srim: SRIM;
  purpose: string;
  link: string; // keep placeholders by default
};
