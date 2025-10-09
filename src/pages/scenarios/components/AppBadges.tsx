/* Map of known app keys to pretty badges (same as your current file) */
const APP_BADGES: Record<string, { icon: string; color: string; title?: string }> = {
  // Apps
  gmailSend: { icon: "✉️", color: "#ef4444", title: "Gmail — Send" },
  gmailSearch: { icon: "🔎", color: "#dc2626", title: "Gmail — Search" },
  slackPost: { icon: "💬", color: "#22c55e", title: "Slack — Post" },
  calendarCreate: { icon: "📅", color: "#0ea5e9", title: "Google Calendar — Create Event" },
  sheetsAddRow: { icon: "📊", color: "#16a34a", title: "Google Sheets — Add Row" },
  driveUpload: { icon: "🗂️", color: "#f59e0b", title: "Google Drive — Upload" },
  outlookSend: { icon: "📧", color: "#2563eb", title: "Outlook — Send" },
  telegramSend: { icon: "📨", color: "#38bdf8", title: "Telegram — Send" },

  // AI
  aiSummarize: { icon: "🪄", color: "#8b5cf6", title: "AI — Summarize" },
  aiExtract: { icon: "🧩", color: "#7c3aed", title: "AI — Extract" },
  aiClassify: { icon: "🏷️", color: "#6d28d9", title: "AI — Classify" },
  aiTranslate: { icon: "🌐", color: "#5b21b6", title: "AI — Translate" },
  aiTranscribe: { icon: "🎙️", color: "#4c1d95", title: "AI — Transcribe" },
  aiSearch: { icon: "🔍", color: "#9333ea", title: "AI — Search" },

  // Flow controls
  delay: { icon: "⏱️", color: "#eab308", title: "Delay" },
  schedule: { icon: "🗓️", color: "#f59e0b", title: "Schedule" },
  paths: { icon: "🛣️", color: "#f97316", title: "Paths" },
  filter: { icon: "🧰", color: "#fb7185", title: "Filter" },
  loop: { icon: "🔁", color: "#f43f5e", title: "Loop" },
  humanLoop: { icon: "🙋", color: "#ef4444", title: "Human in the Loop" },

  // Utilities
  webhook: { icon: "🪝", color: "#f97316", title: "Webhook" },
  http: { icon: "🌐", color: "#0ea5e9", title: "HTTP Request" },
  formatter: { icon: "🧮", color: "#8b5cf6", title: "Formatter" },
  code: { icon: "🧪", color: "#10b981", title: "Code (JS)" },
  emailParser: { icon: "✂️", color: "#ea580c", title: "Email Parser" },
  files: { icon: "📁", color: "#64748b", title: "Files" },

  // Products
  prodTablesQuery: { icon: "📋", color: "#06b6d4", title: "Tables — Query" },
  prodTablesInsert: { icon: "➕", color: "#0891b2", title: "Tables — Insert" },
  prodTablesUpdate: { icon: "✏️", color: "#0ea5a4", title: "Tables — Update" },
  prodInterfacesOpen: { icon: "🧭", color: "#14b8a6", title: "Interfaces — Open" },
  prodChatbotsSend: { icon: "🤖", color: "#22c55e", title: "Chatbots — Send" },
  prodAgentsRun: { icon: "🛠️", color: "#84cc16", title: "Agents — Run" },

  // Custom
  customWebhook: { icon: "🧷", color: "#f97316", title: "Custom — Webhook" },
  customAction: { icon: "🧱", color: "#f43f5e", title: "Custom — Action" },
  customAuth: { icon: "🔐", color: "#fb7185", title: "Custom — Auth" },
  customHeaders: { icon: "🧾", color: "#fda4af", title: "Custom — Headers" },
  customScript: { icon: "📜", color: "#a855f7", title: "Custom — Script" },
};

export function AppBadge({ k, fallbackLabel }: { k?: string; fallbackLabel?: string }) {
  const spec = k ? APP_BADGES[k] : undefined;
  const title = spec?.title || fallbackLabel || "App";
  const icon = spec?.icon || (fallbackLabel ? fallbackLabel.slice(0, 1).toUpperCase() : "⚙️");
  const bg = spec?.color || "#9ca3af";
  return (
    <span
      className="d-inline-flex align-items-center justify-content-center rounded-circle"
      title={title}
      style={{
        width: 22,
        height: 22,
        fontSize: 12,
        background: bg,
        color: "#fff",
      }}
    >
      {icon}
    </span>
  );
}

export function AppsInline({ keysOrLabels, max = 3 }: { keysOrLabels: (string | undefined)[]; max?: number }) {
  const clean = keysOrLabels.filter(Boolean) as string[];
  const over = clean.length > max;
  const show = clean.slice(0, max - (over ? 1 : 0)); // keep room for +N bubble
  return (
    <div className="d-inline-flex align-items-center gap-1" title={clean.join(", ")}>
      {show.map((k, i) => (
        <AppBadge key={`app-${i}`} k={(APP_BADGES as any)[k] ? k : undefined} fallbackLabel={k} />
      ))}
      {over && (
        <span
          className="d-inline-flex align-items-center justify-content-center rounded-circle border"
          style={{ width: 22, height: 22, fontSize: 10, background: "#eef2ff", color: "#4f46e5" }}
          title={clean.join(", ")}
        >
          +{clean.length - show.length}
        </span>
      )}
    </div>
  );
}
