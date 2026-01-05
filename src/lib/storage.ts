import { Card, ChatMessage } from "./types";
import { DEFAULT_CARDS } from "./cards";

const KEY = "kxl_coach_v1";

export type PersistedState = {
  messages: ChatMessage[];
  cards: Card[];
  sprintDay: number;
  srimScores: { Skills: number; Impact: number; Relationships: number; Mindset: number };
  voiceEnabled: boolean;
};

export function loadState(): PersistedState {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) throw new Error("no state");
    const parsed = JSON.parse(raw) as PersistedState;
    return {
      messages: parsed.messages ?? [],
      cards: parsed.cards?.length ? parsed.cards : DEFAULT_CARDS,
      sprintDay: parsed.sprintDay ?? 1,
      srimScores: parsed.srimScores ?? { Skills: 0, Impact: 0, Relationships: 0, Mindset: 0 },
      voiceEnabled: parsed.voiceEnabled ?? false,
    };
  } catch {
    return {
      messages: [],
      cards: DEFAULT_CARDS,
      sprintDay: 1,
      srimScores: { Skills: 0, Impact: 0, Relationships: 0, Mindset: 0 },
      voiceEnabled: false,
    };
  }
}

export function saveState(state: PersistedState) {
  localStorage.setItem(KEY, JSON.stringify(state));
}

export function uid(prefix = "m") {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}_${Date.now().toString(36)}`;
}
