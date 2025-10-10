import type { AppSpec } from './types';

export const APP_CATALOG: AppSpec[] = [
  /* ========= APPS ========= */
  { key: "gmailSend", name: "Gmail — Send Email", color: "#ef4444", icon: "✉️", fields: [
    { key: "to", label: "To", placeholder: "user@example.com" },
    { key: "subject", label: "Subject", placeholder: "Hello" },
    { key: "text", label: "Body", placeholder: "Message..." },
  ]},
  { key: "gmailSearch", name: "Gmail — Search Emails", color: "#dc2626", icon: "🔎", fields: [
    { key: "channel", label: "Channel", placeholder: "#general" },
    { key: "text", label: "Text", placeholder: "Hi team!" },
  ]},
  { key: "calendarCreate", name: "Google Calendar — Create Event", color: "#0ea5e9", icon: "\u{1F5D5}", fields: [
    { key: "summary", label: "Title", placeholder: "Team Sync" },
    { key: "start", label: "Start ISO", placeholder: "2025-09-20T10:00:00Z" },
    { key: "end", label: "End ISO", placeholder: "2025-09-20T11:00:00Z" },
  ]},
  { key: "sheetsAddRow", name: "Google Sheets — Add Row", color: "#16a34a", icon: "\u{1F5DC}", fields: [
    { key: "values", label: "Values (JSON)", placeholder: `{"email":"user@x.com"}` },
  ]},
  { key: "driveUpload", name: "Google Drive — Upload File", color: "#f59e0b", icon: "📄", fields: [
    { key: "path", label: "Path", placeholder: "/reports/q3.pdf" },
    { key: "content", label: "Content (base64)", placeholder: "..." },
  ]},
  { key: "outlookSend", name: "Outlook — Send Email", color: "#2563eb", icon: "📧", fields: [
    { key: "to", label: "To", placeholder: "user@example.com" },
    { key: "subject", label: "Subject", placeholder: "Hello" },
    { key: "text", label: "Body", placeholder: "Message..." },
  ]},
  { key: "telegramSend", name: "Telegram — Send Message", color: "#38bdf8", icon: "📨", fields: [
    { key: "chatId", label: "Chat ID", placeholder: "@mychannel" },
    { key: "text", label: "Text", placeholder: "Ping!" },
  ]},

  /* ========= AI ========= */
  { key: "aiSummarize", name: "AI — Summarize", color: "#8b5cf6", icon: "🤖", fields: [
    { key: "text", label: "Text", placeholder: "Paste text to summarize" }
  ]},
  { key: "aiExtract", name: "AI — Extract Entities", color: "#7c3aed", icon: "🧩", fields: [
    { key: "schema", label: "JSON Schema", placeholder: `{"name":"string","email":"string"}` }
  ]},
  { key: "aiClassify", name: "AI — Classify", color: "#6d28d9", icon: "🏷️", fields: [
    { key: "labels", label: "Labels (comma)", placeholder: "spam, not spam" },
    { key: "text", label: "Text", placeholder: "Classify thisâ€¦" },
  ]},
  { key: "aiTranslate", name: "AI — Translate", color: "#5b21b6", icon: "🌐", fields: [
    { key: "target", label: "Target Lang", placeholder: "zh-TW" },
    { key: "text", label: "Text", placeholder: "Hello world" },
  ]},
  { key: "aiTranscribe", name: "AI — Transcribe Audio", color: "#4c1d95", icon: "🎙️", fields: [
    { key: "audioB64", label: "Audio (base64)", placeholder: "â€¦" }
  ]},
  { key: "aiSearch", name: "AI — Semantic Search", color: "#9333ea", icon: "🔍", fields: [
    { key: "index", label: "Index", placeholder: "knowledge-base" },
    { key: "query", label: "Query", placeholder: "How to refund?" },
  ]},

  /* ========= FLOW CONTROLS ========= */
  { key: "delay", name: "Delay", color: "#eab308", icon: "â±ï¸", fields: [
    { key: "ms", label: "Milliseconds", type: "number", placeholder: "1000" }
  ]},
  { key: "schedule", name: "Schedule", color: "#f59e0b", icon: "ðŸ—“ï¸", fields: [
    { key: "cron", label: "CRON", placeholder: "0 9 * * 1" },
  ]},
  { key: "paths", name: "Paths", color: "#f97316", icon: "ðŸ›£ï¸", fields: [
    { key: "rules", label: "Rules (JSON)", placeholder: `[{"if":"payload.ok"}]` }
  ]},
  { key: "filter", name: "Filter", color: "#fb7185", icon: "ðŸ§°", fields: [
    { key: "condition", label: "Condition", placeholder: "amount > 100" }
  ]},
  { key: "loop", name: "Loop", color: "#f43f5e", icon: "ðŸ”", fields: [
    { key: "items", label: "Items (JSON Array)", placeholder: `[{ "id":1}]` }
  ]},
  { key: "humanLoop", name: "Human in the Loop", color: "#ef4444", icon: "ðŸ™‹", fields: [
    { key: "instructions", label: "Instructions", placeholder: "Approve this task" }
  ]},

  /* ========= UTILITIES ========= */
  { key: "webhook", name: "Webhook (Trigger)", color: "#f97316", icon: "ðŸª", fields: [
    { key: "path", label: "Path", placeholder: "/incoming/lead" },
    { key: "secret", label: "Secret (optional)", placeholder: "******" },
  ]},
  { key: "http", name: "HTTP Request", color: "#0ea5e9", icon: "ðŸŒ", fields: [
    { key: "method", label: "Method", type: "select", options: ["GET", "POST", "PUT", "PATCH", "DELETE"] },
    { key: "url", label: "URL", placeholder: "https://api.example.com" },
    { key: "body", label: "Body (JSON)", placeholder: `{ "name": "Alice" }` },
  ]},
  { key: "formatter", name: "Formatter", color: "#8b5cf6", icon: "ðŸ§®", fields: [
    { key: "template", label: "Template", placeholder: "Hello {{name}}" }
  ]},
  { key: "code", name: "Code (JS)", color: "#10b981", icon: "ðŸ§ª", fields: [
    { key: "script", label: "Script", placeholder: "return { ok: true }" }
  ]},
  { key: "emailParser", name: "Email Parser", color: "#ea580c", icon: "âœ‚ï¸", fields: [
    { key: "pattern", label: "Pattern", placeholder: "Extract order # from body" }
  ]},
  { key: "files", name: "Files", color: "#64748b", icon: "ðŸ“", fields: [
    { key: "op", label: "Operation", type: "select", options: ["read", "write", "delete"] }
  ]},

  /* ========= PRODUCTS ========= */
  { key: "prodTablesQuery", name: "Tables â€” Query", color: "#06b6d4", icon: "ðŸ“‹", fields: [
    { key: "table", label: "Table", placeholder: "contacts" },
    { key: "where", label: "Where (JSON)", placeholder: `{"email":{"$exists":true}}` },
  ]},
  { key: "prodTablesInsert", name: "Tables â€” Insert", color: "#0891b2", icon: "âž•", fields: [
    { key: "table", label: "Table", placeholder: "contacts" },
    { key: "values", label: "Values (JSON)", placeholder: `{"name":"Benny"}` },
  ]},
  { key: "prodTablesUpdate", name: "Tables â€” Update", color: "#0ea5a4", icon: "âœï¸", fields: [
    { key: "table", label: "Table", placeholder: "contacts" },
    { key: "where", label: "Where (JSON)", placeholder: `{"id":123}` },
    { key: "values", label: "Values (JSON)", placeholder: `{"email":"new@example.com"}` },
  ]},
  { key: "prodInterfacesOpen", name: "Interfaces â€” Open Page", color: "#14b8a6", icon: "ðŸ§­", fields: [
    { key: "url", label: "URL", placeholder: "https://portal/app" }
  ]},
  { key: "prodChatbotsSend", name: "Chatbots â€” Send Message", color: "#22c55e", icon: "ðŸ¤–", fields: [
    { key: "botId", label: "Bot ID", placeholder: "bot_123" },
    { key: "text", label: "Text", placeholder: "Hello!" },
  ]},
  { key: "prodAgentsRun", name: "Agents â€” Run Task", color: "#84cc16", icon: "ðŸ› ï¸", fields: [
    { key: "agentId", label: "Agent ID", placeholder: "agent_42" },
    { key: "input", label: "Input", placeholder: "Summarize this page" },
  ]},

  /* ========= CUSTOM ========= */
  { key: "customWebhook", name: "Custom â€” Webhook", color: "#f97316", icon: "ðŸ§·", fields: [
    { key: "url", label: "URL", placeholder: "https://your.api/webhook" }
  ]},
  { key: "customAction", name: "Custom â€” Action", color: "#f43f5e", icon: "ðŸ§±", fields: [
    { key: "endpoint", label: "Endpoint", placeholder: "/v1/do" },
    { key: "payload", label: "Payload (JSON)", placeholder: `{"id":1}` },
  ]},
  { key: "customAuth", name: "Custom â€” Auth", color: "#fb7185", icon: "ðŸ”", fields: [
    { key: "type", label: "Type", type: "select", options: ["Bearer", "API Key"] },
    { key: "value", label: "Value", placeholder: "sk-..." },
  ]},
  { key: "customHeaders", name: "Custom â€” Headers", color: "#fda4af", icon: "ðŸ§¾", fields: [
    { key: "headers", label: "Headers (JSON)", placeholder: `{"X-Org":"ACME"}` }
  ]},
  { key: "customScript", name: "Custom â€” Script", color: "#a855f7", icon: "ðŸ“œ", fields: [
    { key: "script", label: "Script", placeholder: "function run(payload){ return payload }" }
  ]},
];

