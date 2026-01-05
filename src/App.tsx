import React, { useEffect, useMemo, useState } from "react";
import { ChatMessage, Card } from "./lib/types";
import { loadState, saveState, uid } from "./lib/storage";
import { getCoachReply } from "./lib/chatClient";
import { speak } from "./lib/voice";

const DEEP_DAYS = new Set([1, 7, 14]);

function classNames(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(" ");
}

function extractPlainForTTS(markdown: string) {
  // very light cleanup for speech
  return markdown
    .replace(/\*\*/g, "")
    .replace(/`+/g, "")
    .replace(/\[(.*?)\]\((.*?)\)/g, "$1")
    .trim();
}

export default function App() {
  const initial = useMemo(() => loadState(), []);
  const [messages, setMessages] = useState<ChatMessage[]>(initial.messages);
  const [cards, setCards] = useState<Card[]>(initial.cards);
  const [sprintDay, setSprintDay] = useState<number>(initial.sprintDay);
  const [srimScores, setSrimScores] = useState(initial.srimScores);
  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(initial.voiceEnabled);

  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    saveState({ messages, cards, sprintDay, srimScores, voiceEnabled });
  }, [messages, cards, sprintDay, srimScores, voiceEnabled]);

  const hasChat = messages.length > 0;

  async function send() {
    const text = input.trim();
    if (!text || busy) return;
    setError(null);
    setBusy(true);

    const userMsg: ChatMessage = { id: uid("u"), role: "user", content: text, ts: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");

    try {
      const reply = await getCoachReply({ userText: text, messages: [...messages, userMsg], cards, sprintDay });
      const assistantMsg: ChatMessage = { id: uid("a"), role: "assistant", content: reply, ts: Date.now() };
      setMessages(prev => [...prev, assistantMsg]);

      if (voiceEnabled) speak(extractPlainForTTS(reply));
    } catch (e: any) {
      setError(e?.message ?? "Unbekannter Fehler");
    } finally {
      setBusy(false);
    }
  }

  function reset() {
    setMessages([]);
    setError(null);
  }

  function exportTranscript() {
    const txt = messages
      .map(m => `# ${m.role.toUpperCase()}\n${m.content}\n`)
      .join("\n");
    const blob = new Blob([txt], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `kxl-coach-transcript-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function setCardLink(cardId: string, link: string) {
    setCards(prev => prev.map(c => (c.id === cardId ? { ...c, link } : c)));
  }

  const deepDay = DEEP_DAYS.has(sprintDay);

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <div className="mx-auto max-w-6xl p-4 md:p-6">
        <header className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-kxl-green/15 ring-1 ring-kxl-green/25 flex items-center justify-center">
              <span className="font-black text-kxl-dark">KXL</span>
            </div>
            <div>
              <div className="text-lg font-semibold leading-tight">KXL‑Coach (Dialog App)</div>
              <div className="text-sm text-slate-500">Karriere ist Training, nicht Kurs.</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={exportTranscript}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50"
              disabled={!hasChat}
              title="Chat als Textdatei exportieren"
            >
              Export
            </button>
            <button
              onClick={reset}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50"
              disabled={!hasChat}
            >
              Reset
            </button>
          </div>
        </header>

        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-[320px_1fr]">
          {/* Sidebar */}
          <aside className="rounded-2xl border border-slate-200 p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold">Sprint</div>
              <span className={classNames("text-xs rounded-full px-2 py-1 ring-1",
                deepDay ? "bg-kxl-green/15 ring-kxl-green/25 text-kxl-dark" : "bg-slate-50 ring-slate-200 text-slate-600"
              )}>
                {deepDay ? "Deep Day" : "Training"}
              </span>
            </div>

            <div className="mt-3">
              <label className="text-xs text-slate-500">Tag (1–14)</label>
              <div className="mt-1 flex items-center gap-2">
                <input
                  type="range"
                  min={1}
                  max={14}
                  value={sprintDay}
                  onChange={(e) => setSprintDay(parseInt(e.target.value, 10))}
                  className="w-full"
                />
                <div className="w-10 text-right text-sm font-semibold">{sprintDay}</div>
              </div>
              <div className="mt-1 text-xs text-slate-500">Deep Days: 1 · 7 · 14</div>
            </div>

            <div className="mt-5">
              <div className="text-sm font-semibold">SRIM Board</div>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {(["Skills","Impact","Relationships","Mindset"] as const).map(k => (
                  <div key={k} className="rounded-xl border border-slate-200 p-3">
                    <div className="text-xs text-slate-500">{k}</div>
                    <div className="mt-1 flex items-center gap-2">
                      <input
                        type="number"
                        min={0}
                        max={10}
                        value={srimScores[k]}
                        onChange={(e) => setSrimScores(s => ({ ...s, [k]: Math.max(0, Math.min(10, parseInt(e.target.value || "0", 10))) }))}
                        className="w-16 rounded-lg border border-slate-200 px-2 py-1 text-sm"
                      />
                      <div className="text-xs text-slate-500">/10</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-2 text-xs text-slate-500">Tipp: Nutze 0–10 als Mini-Review.</div>
            </div>

            <div className="mt-5 flex items-center justify-between">
              <div className="text-sm font-semibold">Voice</div>
              <button
                onClick={() => setVoiceEnabled(v => !v)}
                className={classNames(
                  "rounded-xl px-3 py-2 text-sm ring-1",
                  voiceEnabled ? "bg-kxl-green text-white ring-kxl-green" : "bg-slate-50 text-slate-700 ring-slate-200"
                )}
              >
                {voiceEnabled ? "An" : "Aus"}
              </button>
            </div>

            <div className="mt-5">
              <div className="text-sm font-semibold">Card Links (optional)</div>
              <div className="mt-2 space-y-2">
                {cards.map(c => (
                  <div key={c.id} className="rounded-xl border border-slate-200 p-2">
                    <div className="text-xs font-semibold">{c.id} · {c.title}</div>
                    <div className="mt-1 text-xs text-slate-500">{c.srim} — {c.purpose}</div>
                    <input
                      value={c.link}
                      onChange={(e) => setCardLink(c.id, e.target.value)}
                      className="mt-2 w-full rounded-lg border border-slate-200 px-2 py-1 text-xs"
                      placeholder="[TALENTCARDS_LINK_HIER] oder echter Link"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 text-xs text-slate-500">
              <div className="font-semibold text-slate-700">Hinweis</div>
              <div>Ohne API läuft die App im <span className="font-semibold">Demo‑Mode</span> (offline).</div>
              <div>Mit API: setze <span className="font-mono">VITE_CHAT_ENDPOINT</span>.</div>
            </div>
          </aside>

          {/* Chat */}
          <main className="rounded-2xl border border-slate-200 p-4 flex flex-col min-h-[70vh]">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold">Dialog</div>
              <span className="text-xs text-slate-500">{busy ? "KXL-Coach tippt…" : "bereit"}</span>
            </div>

            <div className="mt-3 flex-1 overflow-auto rounded-xl bg-slate-50 p-3">
              {!hasChat ? (
                <div className="text-sm text-slate-600">
                  <div className="font-semibold">Start</div>
                  <p className="mt-1">
                    Schreib dein Thema (z. B. „Ich werde in Meetings übergangen.“) — der Coach antwortet im KXL‑Format.
                  </p>
                  <div className="mt-3 grid gap-2">
                    {[
                      "Ich will meinen Kernsatz schärfen, aber er klingt beliebig.",
                      "In Meetings werde ich übergangen und komme nicht rein.",
                      "Ich prokrastiniere und starte zu spät."
                    ].map(s => (
                      <button
                        key={s}
                        onClick={() => setInput(s)}
                        className="text-left rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm hover:bg-slate-50"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {messages.map(m => (
                    <div key={m.id} className={classNames("max-w-[92%] rounded-2xl p-3 text-sm whitespace-pre-wrap",
                      m.role === "user"
                        ? "ml-auto bg-kxl-green text-white"
                        : "mr-auto bg-white border border-slate-200"
                    )}>
                      {m.content}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {error && (
              <div className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="mt-3 flex gap-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if ((e.ctrlKey || e.metaKey) && e.key === "Enter") send();
                }}
                placeholder="Dein Thema… (Strg/⌘ + Enter zum Senden)"
                className="min-h-[48px] flex-1 resize-none rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-kxl-green/40"
              />
              <button
                onClick={send}
                disabled={busy || !input.trim()}
                className={classNames(
                  "rounded-xl px-4 py-2 text-sm font-semibold",
                  busy || !input.trim()
                    ? "bg-slate-200 text-slate-500"
                    : "bg-kxl-green text-white hover:brightness-95"
                )}
              >
                Senden
              </button>
            </div>

            <div className="mt-2 text-xs text-slate-500">
              Demo‑Mode: Antworten sind regelbasiert. Mit API-Endpunkt wird echtes LLM genutzt.
            </div>
          </main>
        </div>

        <footer className="mt-6 text-xs text-slate-500">
          © {new Date().getFullYear()} Karriere‑XL · Prototype UI
        </footer>
      </div>
    </div>
  );
}
