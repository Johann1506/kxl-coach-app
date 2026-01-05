import { Card, ChatMessage } from "./types";
import { demoReply, isDoneMessage, buildFollowUpOnDone } from "./demoCoach";

/**
 * Chat client strategy:
 * - If VITE_CHAT_ENDPOINT is set -> call your backend endpoint
 * - Otherwise -> demo mode (works offline, no keys needed)
 */
export async function getCoachReply(opts: {
  userText: string;
  messages: ChatMessage[];
  cards: Card[];
  sprintDay: number;
}): Promise<string> {
  const endpoint = import.meta.env.PROD
  ? "/api/chat"
  : (import.meta.env.VITE_CHAT_ENDPOINT as string | undefined);

  if (!endpoint) {
    if (isDoneMessage(opts.userText)) return buildFollowUpOnDone(opts.cards);
    return demoReply(opts.userText, opts.cards, opts.sprintDay);
  }

  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userText: opts.userText,
      messages: opts.messages.map(m => ({ role: m.role, content: m.content })),
      sprintDay: opts.sprintDay,
      cards: opts.cards,
    }),
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`Chat endpoint error: ${res.status} ${txt}`);
  }

  const data = (await res.json()) as { reply: string };
  return data.reply;
}
