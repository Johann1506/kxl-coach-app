# KXL Coach App (Prototype)

Eine kleine React+Vite+Tailwind App für den KXL-Coach Dialog.
- Läuft **ohne API** im Demo-Mode (offline)
- Optional: echter LLM-Dialog über ein Backend (VITE_CHAT_ENDPOINT)

## 1) Starten
```bash
npm install
npm run dev
```

## 2) Echter KI-Dialog (optional)
Setze eine Umgebungsvariable in `.env`:

```
VITE_CHAT_ENDPOINT=https://DEIN-ENDPUNKT/api/chat
```

Dann implementierst du am Server eine Route, die JSON annimmt:
- Input: `{ userText, messages, sprintDay, cards }`
- Output: `{ reply: string }`

## 3) Serverless Beispiel (OpenAI-kompatibel)
Siehe `serverless-examples/openai-compatible-chat.js` (Template).
WICHTIG: API-Keys niemals im Frontend speichern.
