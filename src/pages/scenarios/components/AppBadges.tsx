/* Map of known app keys to pretty badges
 *
 * ICON RENDERING SYSTEM:
 * - Image paths (starting with '/'): Rendered as <img> tags with professional logos
 * - Emoji/text: Rendered as text content for fallback or simple icons
 * - Gmail apps: Use /src/assets/icons/icon_gmail.png
 * - Telegram apps: Use /src/assets/icons/icon_telegram.png
 * - Other apps: Use emoji icons (can be updated to logos later)
 *
 * BADGE STYLES:
 * - 22px circles with thin grey borders (#e5e7eb)
 * - 16px icons inside for proper scaling
 * - Subtle shadows for depth without being overwhelming
 * - Professional branding with logo images where available
 * - Consistent appearance across all app types
 */
const APP_BADGES: Record<string, { icon: string; color: string; title?: string }> = {
  // Apps - Gmail (all use professional Gmail logo)
  gmailSend: { icon: "/src/assets/icons/icon_gmail.png", color: "#ef4444", title: "Gmail — Send Email" },
  gmailSearch: { icon: "/src/assets/icons/icon_gmail.png", color: "#dc2626", title: "Gmail — Search Emails" },
  gmailWatchEmails: { icon: "/src/assets/icons/icon_gmail.png", color: "#ef4444", title: "Gmail — Watch Emails" },
  gmailWatchEmailsV2: { icon: "/src/assets/icons/icon_gmail.png", color: "#ef4444", title: "Gmail — Watch Emails V2" },

  // Apps - Telegram (all use professional Telegram logo)
  telegramSend: { icon: "/src/assets/icons/icon_telegram.png", color: "#0088cc", title: "Telegram — Send Message" },
  telegramSendV2: { icon: "/src/assets/icons/icon_telegram.png", color: "#0088cc", title: "Telegram — Send Message V2" },

  // Other apps (using emoji for now - can be updated to logos later)
  slackPost: { icon: "💬", color: "#22c55e", title: "Slack — Post" },
  calendarCreate: { icon: "📅", color: "#0ea5e9", title: "Google Calendar — Create Event" },
  sheetsAddRow: { icon: "📊", color: "#16a34a", title: "Google Sheets — Add Row" },
  driveUpload: { icon: "🗂️", color: "#f59e0b", title: "Google Drive — Upload" },
  outlookSend: { icon: "📧", color: "#2563eb", title: "Outlook — Send" },

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

  // Render image icons vs emoji/text icons
  const iconElement = icon.startsWith('/') ? (
    <img
      src={icon}
      alt={title}
      style={{
        width: 16,
        height: 16,
        objectFit: "contain",
      }}
    />
  ) : (
    icon
  );

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
        border: "1px solid #e5e7eb",
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
      }}
    >
      {iconElement}
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
          className="d-inline-flex align-items-center justify-content-center rounded-circle"
          style={{
            width: 22,
            height: 22,
            fontSize: 10,
            background: "#f8fafc",
            color: "#374151",
            border: "1px solid #e5e7eb",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
          }}
          title={clean.join(", ")}
        >
          +{clean.length - show.length}
        </span>
      )}
    </div>
  );
}
