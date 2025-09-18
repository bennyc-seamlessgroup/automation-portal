import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ReactFlow, {
  ReactFlowProvider,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useEdgesState,
  useNodesState,
  MarkerType,
  ConnectionMode,
  Handle,
  Position,
  type OnConnect,
  type NodeProps,
  type NodeTypes,
} from "reactflow";
import type { Node, Edge, Connection } from "reactflow";
import "reactflow/dist/style.css";

/** TYPES */
type CategoryKey = "apps" | "ai" | "flow" | "utilities" | "products" | "custom";

type AppKey =
  // Apps (≥5)
  | "gmailSend" | "gmailSearch" | "slackPost" | "calendarCreate" | "sheetsAddRow" | "driveUpload" | "outlookSend" | "telegramSend"
  // AI (≥5)
  | "aiSummarize" | "aiExtract" | "aiClassify" | "aiTranslate" | "aiTranscribe" | "aiSearch"
  // Flow controls (≥5)
  | "delay" | "schedule" | "paths" | "filter" | "loop" | "humanLoop"
  // Utilities (≥5)
  | "webhook" | "http" | "formatter" | "code" | "emailParser" | "files"
  // Products (≥5)
  | "prodTablesQuery" | "prodTablesInsert" | "prodTablesUpdate" | "prodInterfacesOpen" | "prodChatbotsSend" | "prodAgentsRun"
  // Custom (≥5)
  | "customWebhook" | "customAction" | "customAuth" | "customHeaders" | "customScript";

type RFData = {
  label: string;
  appKey?: AppKey;
  values?: Record<string, any>;
};

/** GEOMETRY */
const NODE_W = 96;
const NODE_H = 96;
const ICON_W = 64;
const ICON_H = 64;

const PLUS_SIZE = 28;
const PLUS_GAP = 4;
const ADD_NEXT_EVENT = "rf:add-next";

type AppSpec = {
  key: AppKey;
  name: string;
  color: string;
  icon?: string;
  fields: { key: string; label: string; placeholder?: string; type?: "text" | "number" | "select"; options?: string[] }[];
};

const APP_CATALOG: AppSpec[] = [
  /* ========= APPS ========= */
  { key: "gmailSend", name: "Gmail — Send Email", color: "#ef4444", icon: "✉️", fields: [
    { key: "to", label: "To", placeholder: "user@example.com" },
    { key: "subject", label: "Subject", placeholder: "Hello" },
    { key: "text", label: "Body", placeholder: "Message..." },
  ]},
  { key: "gmailSearch", name: "Gmail — Search Emails", color: "#dc2626", icon: "🔎", fields: [
    { key: "query", label: "Query", placeholder: "from:me has:attachment" }
  ]},
  { key: "slackPost", name: "Slack — Post Message", color: "#22c55e", icon: "💬", fields: [
    { key: "channel", label: "Channel", placeholder: "#general" },
    { key: "text", label: "Text", placeholder: "Hi team!" },
  ]},
  { key: "calendarCreate", name: "Google Calendar — Create Event", color: "#0ea5e9", icon: "📅", fields: [
    { key: "summary", label: "Title", placeholder: "Team Sync" },
    { key: "start", label: "Start ISO", placeholder: "2025-09-20T10:00:00Z" },
    { key: "end", label: "End ISO", placeholder: "2025-09-20T11:00:00Z" },
  ]},
  { key: "sheetsAddRow", name: "Google Sheets — Add Row", color: "#16a34a", icon: "📊", fields: [
    { key: "sheet", label: "Sheet name", placeholder: "Leads" },
    { key: "values", label: "Values (JSON)", placeholder: `{"email":"user@x.com"}` },
  ]},
  { key: "driveUpload", name: "Google Drive — Upload File", color: "#f59e0b", icon: "🗂️", fields: [
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
  { key: "aiSummarize", name: "AI — Summarize", color: "#8b5cf6", icon: "🪄", fields: [
    { key: "text", label: "Text", placeholder: "Paste text to summarize" }
  ]},
  { key: "aiExtract", name: "AI — Extract Entities", color: "#7c3aed", icon: "🧩", fields: [
    { key: "schema", label: "JSON Schema", placeholder: `{"name":"string","email":"string"}` }
  ]},
  { key: "aiClassify", name: "AI — Classify", color: "#6d28d9", icon: "🏷️", fields: [
    { key: "labels", label: "Labels (comma)", placeholder: "spam, not spam" },
    { key: "text", label: "Text", placeholder: "Classify this…" },
  ]},
  { key: "aiTranslate", name: "AI — Translate", color: "#5b21b6", icon: "🌐", fields: [
    { key: "target", label: "Target Lang", placeholder: "zh-TW" },
    { key: "text", label: "Text", placeholder: "Hello world" },
  ]},
  { key: "aiTranscribe", name: "AI — Transcribe Audio", color: "#4c1d95", icon: "🎙️", fields: [
    { key: "audioB64", label: "Audio (base64)", placeholder: "…" }
  ]},
  { key: "aiSearch", name: "AI — Semantic Search", color: "#9333ea", icon: "🔍", fields: [
    { key: "index", label: "Index", placeholder: "knowledge-base" },
    { key: "query", label: "Query", placeholder: "How to refund?" },
  ]},

  /* ========= FLOW CONTROLS ========= */
  { key: "delay", name: "Delay", color: "#eab308", icon: "⏱️", fields: [
    { key: "ms", label: "Milliseconds", type: "number", placeholder: "1000" }
  ]},
  { key: "schedule", name: "Schedule", color: "#f59e0b", icon: "🗓️", fields: [
    { key: "cron", label: "CRON", placeholder: "0 9 * * 1" },
  ]},
  { key: "paths", name: "Paths", color: "#f97316", icon: "🛣️", fields: [
    { key: "rules", label: "Rules (JSON)", placeholder: `[{"if":"payload.ok"}]` }
  ]},
  { key: "filter", name: "Filter", color: "#fb7185", icon: "🧰", fields: [
    { key: "condition", label: "Condition", placeholder: "amount > 100" }
  ]},
  { key: "loop", name: "Loop", color: "#f43f5e", icon: "🔁", fields: [
    { key: "items", label: "Items (JSON Array)", placeholder: `[{ "id":1}]` }
  ]},
  { key: "humanLoop", name: "Human in the Loop", color: "#ef4444", icon: "🙋", fields: [
    { key: "instructions", label: "Instructions", placeholder: "Approve this task" }
  ]},

  /* ========= UTILITIES ========= */
  { key: "webhook", name: "Webhook (Trigger)", color: "#f97316", icon: "🪝", fields: [
    { key: "path", label: "Path", placeholder: "/incoming/lead" },
    { key: "secret", label: "Secret (optional)", placeholder: "******" },
  ]},
  { key: "http", name: "HTTP Request", color: "#0ea5e9", icon: "🌐", fields: [
    { key: "method", label: "Method", type: "select", options: ["GET", "POST", "PUT", "PATCH", "DELETE"] },
    { key: "url", label: "URL", placeholder: "https://api.example.com" },
    { key: "body", label: "Body (JSON)", placeholder: `{ "name": "Alice" }` },
  ]},
  { key: "formatter", name: "Formatter", color: "#8b5cf6", icon: "🧮", fields: [
    { key: "template", label: "Template", placeholder: "Hello {{name}}" }
  ]},
  { key: "code", name: "Code (JS)", color: "#10b981", icon: "🧪", fields: [
    { key: "script", label: "Script", placeholder: "return { ok: true }" }
  ]},
  { key: "emailParser", name: "Email Parser", color: "#ea580c", icon: "✂️", fields: [
    { key: "pattern", label: "Pattern", placeholder: "Extract order # from body" }
  ]},
  { key: "files", name: "Files", color: "#64748b", icon: "📁", fields: [
    { key: "op", label: "Operation", type: "select", options: ["read", "write", "delete"] }
  ]},

  /* ========= PRODUCTS ========= */
  { key: "prodTablesQuery", name: "Tables — Query", color: "#06b6d4", icon: "📋", fields: [
    { key: "table", label: "Table", placeholder: "contacts" },
    { key: "where", label: "Where (JSON)", placeholder: `{"email":{"$exists":true}}` },
  ]},
  { key: "prodTablesInsert", name: "Tables — Insert", color: "#0891b2", icon: "➕", fields: [
    { key: "table", label: "Table", placeholder: "contacts" },
    { key: "values", label: "Values (JSON)", placeholder: `{"name":"Benny"}` },
  ]},
  { key: "prodTablesUpdate", name: "Tables — Update", color: "#0ea5a4", icon: "✏️", fields: [
    { key: "table", label: "Table", placeholder: "contacts" },
    { key: "where", label: "Where (JSON)", placeholder: `{"id":123}` },
    { key: "values", label: "Values (JSON)", placeholder: `{"email":"new@example.com"}` },
  ]},
  { key: "prodInterfacesOpen", name: "Interfaces — Open Page", color: "#14b8a6", icon: "🧭", fields: [
    { key: "url", label: "URL", placeholder: "https://portal/app" }
  ]},
  { key: "prodChatbotsSend", name: "Chatbots — Send Message", color: "#22c55e", icon: "🤖", fields: [
    { key: "botId", label: "Bot ID", placeholder: "bot_123" },
    { key: "text", label: "Text", placeholder: "Hello!" },
  ]},
  { key: "prodAgentsRun", name: "Agents — Run Task", color: "#84cc16", icon: "🛠️", fields: [
    { key: "agentId", label: "Agent ID", placeholder: "agent_42" },
    { key: "input", label: "Input", placeholder: "Summarize this page" },
  ]},

  /* ========= CUSTOM ========= */
  { key: "customWebhook", name: "Custom — Webhook", color: "#f97316", icon: "🧷", fields: [
    { key: "url", label: "URL", placeholder: "https://your.api/webhook" }
  ]},
  { key: "customAction", name: "Custom — Action", color: "#f43f5e", icon: "🧱", fields: [
    { key: "endpoint", label: "Endpoint", placeholder: "/v1/do" },
    { key: "payload", label: "Payload (JSON)", placeholder: `{"id":1}` },
  ]},
  { key: "customAuth", name: "Custom — Auth", color: "#fb7185", icon: "🔐", fields: [
    { key: "type", label: "Type", type: "select", options: ["Bearer", "API Key"] },
    { key: "value", label: "Value", placeholder: "sk-..." },
  ]},
  { key: "customHeaders", name: "Custom — Headers", color: "#fda4af", icon: "🧾", fields: [
    { key: "headers", label: "Headers (JSON)", placeholder: `{"X-Org":"ACME"}` }
  ]},
  { key: "customScript", name: "Custom — Script", color: "#a855f7", icon: "📜", fields: [
    { key: "script", label: "Script", placeholder: "function run(payload){ return payload }" }
  ]},
];

const STORAGE_KEY = "automationPortal.scenarioBuilder.initialNode.v5";
const VERSIONS_KEY = "automationPortal.scenarioBuilder.versions";

/** STYLES */
const styles = {
  canvasWrap: { position: "relative" as const, flex: 1 },

  roundNode: {
    width: NODE_W, height: NODE_H, borderRadius: "50%",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)", border: "1px solid #e5e7eb",
    background: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
    position: "relative" as const, textAlign: "center" as const, padding: 4,
  },
  dashed: { borderStyle: "dashed", borderColor: "#c7d2fe", background: "#fbfdff" },
  chip: { position: "absolute" as const, top: -8, left: "50%", transform: "translateX(-50%)",
    fontSize: 11, color: "#fff", borderRadius: 12, padding: "1px 6px", whiteSpace: "nowrap" as const },
  plusOnNode: { position: "absolute" as const, left: "50%", bottom: -(PLUS_GAP + PLUS_SIZE / 2),
    marginLeft: -(PLUS_SIZE / 2), width: PLUS_SIZE, height: PLUS_SIZE, borderRadius: "50%",
    background: "#fff", border: "1px solid #e5e7eb", boxShadow: "0 2px 8px rgba(0,0,0,0.08)", cursor: "pointer", zIndex: 2 },

  settingsDrawer: {
    position: "fixed" as const, top: 0, right: 0, width: 360, height: "100%",
    background: "#fff", borderLeft: "1px solid #e5e7eb", boxShadow: "-4px 0 16px rgba(0,0,0,0.06)",
    transform: "translateX(0)", transition: "transform 180ms ease", display: "flex", flexDirection: "column" as const,
  },
  settingsDrawerHidden: { transform: "translateX(100%)" },
  headerRow: { display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "12px 16px", borderBottom: "1px solid #e5e7eb", fontWeight: 600 },
  formLabel: { fontSize: 12, color: "#6b7280" },
  input: { marginTop: 6, width: "100%", border: "1px solid #e5e7eb", borderRadius: 8, padding: "8px 10px", fontSize: 13 },
  select: { marginTop: 6, width: "100%", border: "1px solid #e5e7eb", borderRadius: 8, padding: "8px 10px", fontSize: 13, background: "#fff" },
  delBtn: { marginTop: 12, background: "#ef4444", color: "#fff", border: "none", padding: "8px 12px", borderRadius: 8, fontSize: 13, cursor: "pointer" },

  headerOverlay: {
    position: "absolute" as const, top: 12, left: 12, background: "#fff", border: "1px solid #e5e7eb",
    borderRadius: 12, boxShadow: "0 2px 10px rgba(0,0,0,0.06)", padding: "8px 12px",
    display: "flex", alignItems: "center", gap: 10, zIndex: 10,
  },
  backBtn: { display: "flex", alignItems: "center", gap: 6, background: "transparent", border: "none", cursor: "pointer", color: "#374151", fontSize: 13 },
  nameBtn: { background: "transparent", border: "none", cursor: "pointer", color: "#111827", fontSize: 14, fontWeight: 600 },
  nameInput: { border: "1px solid #e5e7eb", borderRadius: 8, padding: "6px 8px", fontSize: 14 },

  /* Top action bar (Zapier-like) */
  topActionBar: {
    position: "absolute" as const, right: 12, top: 12, zIndex: 10,
    display: "flex", gap: 8, alignItems: "center", background: "#fff",
    border: "1px solid #e5e7eb", borderRadius: 999, padding: "6px 8px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
  },
  pillBtn: { border: "1px solid #e5e7eb", background: "#fff", padding: "6px 10px", borderRadius: 999, cursor: "pointer", fontSize: 13 },

  /* Bottom action bar (Make-like) */
  bottomBar: {
    position: "absolute" as const, left: "50%", transform: "translateX(-50%)", bottom: 12, zIndex: 10,
    background: "#fff", border: "1px solid #e5e7eb", borderRadius: 999, padding: 8, boxShadow: "0 6px 16px rgba(0,0,0,0.12)",
    display: "flex", alignItems: "center", gap: 10,
  },
  bottomGroup: { display: "flex", alignItems: "center", gap: 10 },
  divider: { width: 1, height: 24, background: "#e5e7eb" },
  toggleWrap: { display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 10px", borderRadius: 999, background: "#f9fafb", border: "1px solid #e5e7eb" },
  tinyBtn: { border: "1px solid #e5e7eb", background: "#fff", padding: "6px 8px", borderRadius: 8, cursor: "pointer", fontSize: 13 },
  menuWrap: { position: "relative" as const },
  menuList: { position: "absolute" as const, right: 0, bottom: "110%", background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, boxShadow: "0 8px 24px rgba(0,0,0,0.15)", overflow: "hidden" },
  menuItem: { padding: "8px 12px", fontSize: 13, cursor: "pointer", whiteSpace: "nowrap" as const, background: "#fff", borderBottom: "1px solid #f3f4f6" },
};

/** UTILS */
function uid(prefix = "n") { return `${prefix}_${Math.random().toString(36).slice(2, 9)}`; }
function getAppSpec(key: AppKey): AppSpec {
  const spec = APP_CATALOG.find((a) => a.key === key)!; if (!spec) throw new Error(`Unknown app key: ${key}`); return spec;
}

function categoryOf(appKey: AppKey): CategoryKey {
  switch (appKey) {
    case "gmailSend": case "gmailSearch": case "slackPost": case "calendarCreate": case "sheetsAddRow":
    case "driveUpload": case "outlookSend": case "telegramSend": return "apps";
    case "aiSummarize": case "aiExtract": case "aiClassify": case "aiTranslate": case "aiTranscribe": case "aiSearch": return "ai";
    case "delay": case "schedule": case "paths": case "filter": case "loop": case "humanLoop": return "flow";
    case "webhook": case "http": case "formatter": case "code": case "emailParser": case "files": return "utilities";
    case "prodTablesQuery": case "prodTablesInsert": case "prodTablesUpdate": case "prodInterfacesOpen": case "prodChatbotsSend": case "prodAgentsRun": return "products";
    case "customWebhook": case "customAction": case "customAuth": case "customHeaders": case "customScript": return "custom";
  }
}

/** NODE SHELL */
function NodeShell({ id, color, label, children, showPlus = true, selected = false }: {
  id: string; color?: string; label: string; children?: React.ReactNode; showPlus?: boolean; selected?: boolean;
}) {
  return (
    <div style={{
      ...styles.roundNode,
      boxShadow: selected ? "0 0 0 3px rgba(99,102,241,0.35), 0 2px 8px rgba(0,0,0,0.08)" : styles.roundNode.boxShadow,
      border: selected ? "2px solid #6366f1" : styles.roundNode.border,
    }}>
      <Handle type="target" position={Position.Left} id="in" style={{ width: 8, height: 8, background: "#6366f1", border: "1px solid #fff" }} />
      <Handle type="source" position={Position.Right} id="out" style={{ width: 8, height: 8, background: "#34d399", border: "1px solid #fff" }} />
      <div style={{ ...styles.chip, background: color ?? "#111827" }}>{label}</div>
      {children}
      {showPlus && (
        <button aria-label="Add next module" style={styles.plusOnNode as any}
          onClick={(e) => { e.stopPropagation(); window.dispatchEvent(new CustomEvent(ADD_NEXT_EVENT, { detail: { id } })); }}>
          +
        </button>
      )}
    </div>
  );
}

/** NODES */
function InitialNode({ selected }: NodeProps<RFData>) {
  return (
    <div title="Click to choose your first module" style={{
      ...styles.roundNode, ...styles.dashed, cursor: "pointer",
      boxShadow: selected ? "0 0 0 3px rgba(99,102,241,0.35), 0 2px 8px rgba(0,0,0,0.08)" : styles.roundNode.boxShadow,
      border: selected ? "2px solid #6366f1" : styles.roundNode.border,
    }}>
      <Handle type="target" position={Position.Left} id="in" style={{ width: 8, height: 8, background: "#6366f1", border: "1px solid #fff" }} />
      <Handle type="source" position={Position.Right} id="out" style={{ width: 8, height: 8, background: "#34d399", border: "1px solid #fff" }} />
      <div style={{ ...styles.chip, background: "#6366f1" }}>Start here</div>
      <div style={{ fontSize: 26 }}>＋</div>
    </div>
  );
}
function AppNode({ id, data, selected }: NodeProps<RFData>) {
  const spec = getAppSpec(data.appKey as AppKey);
  return (
    <NodeShell id={id} color={spec.color} label={spec.name} selected={selected}>
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: 8 }}>
        <div title={spec.name} style={{
          width: ICON_W, height: ICON_H, borderRadius: "50%", background: spec.color, color: "white", fontSize: 30,
          display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
        }}>{spec.icon ?? ""}</div>
      </div>
    </NodeShell>
  );
}
const nodeTypes: NodeTypes = { initial: InitialNode, app: AppNode };

/** DRAWER */
function Drawer({ open, children, onClose, title = "Settings" }: { open: boolean; children: React.ReactNode; onClose: () => void; title?: string; }) {
  return (
    <div style={{ ...styles.settingsDrawer, ...(open ? {} : styles.settingsDrawerHidden) }}>
      <div style={styles.headerRow}>
        <div>{title}</div>
        <button onClick={onClose} style={{ fontSize: 13, color: "#6b7280", background: "transparent", border: "none", cursor: "pointer" }}>Close</button>
      </div>
      <div style={{ padding: 16, overflow: "auto", flex: 1 }}>{children}</div>
    </div>
  );
}
function InspectorBody({ node, onChangeNode, onDeleteNode }: { node: Node<RFData>; onChangeNode: (n: Node<RFData>) => void; onDeleteNode: (id: string) => void; }) {
  const isApp = node.type === "app";
  const data = (node.data || {}) as RFData;
  const spec: AppSpec | null = isApp ? getAppSpec(data.appKey as AppKey) : null;
  const setData = (patch: Partial<RFData>) => onChangeNode({ ...node, data: { ...(node.data || {}), ...patch } });

  return (
    <>
      <div>
        <div style={styles.formLabel}>Label</div>
        <input style={styles.input} value={data.label ?? ""} onChange={(e) => setData({ label: e.target.value })} placeholder="Node label" />
      </div>
      {isApp && spec && (
        <div style={{ marginTop: 12 }}>
          <div style={{ ...styles.formLabel, fontWeight: 600, color: "#374151" }}>{spec.name} Settings</div>
          {spec.fields.map((f) => (
            <div key={f.key} style={{ marginTop: 10 }}>
              <div style={styles.formLabel}>{f.label}</div>
              {f.type === "select" ? (
                <select style={styles.select as any} value={(data.values?.[f.key] ?? "") as string}
                  onChange={(e) => setData({ values: { ...(data.values || {}), [f.key]: e.target.value } })}>
                  <option value="">Select…</option>
                  {f.options?.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              ) : (
                <input style={styles.input} type={f.type === "number" ? "number" : "text"}
                  value={(data.values?.[f.key] ?? "") as string}
                  onChange={(e) => setData({ values: { ...(data.values || {}), [f.key]: e.target.value } })}
                  placeholder={f.placeholder} />
              )}
            </div>
          ))}
        </div>
      )}
      <button style={styles.delBtn} onClick={() => onDeleteNode(node.id)}>Delete node</button>
    </>
  );
}

/** FUNCTION PICKER (two-pane) */
function Badge({ children }: { children: React.ReactNode }) {
  return <span style={{ display: "inline-block", fontSize: 12, padding: "2px 8px", borderRadius: 999, border: "1px solid #e5e7eb" }}>{children}</span>;
}
function FunctionPicker({ open, onPick, onClose, initialCategory = "apps" }: {
  open: boolean; onPick: (key: AppKey) => void; onClose: () => void; initialCategory?: CategoryKey;
}) {
  const [active, setActive] = useState<CategoryKey>(initialCategory);
  const [q, setQ] = useState("");
  useEffect(() => { if (open) { setActive(initialCategory); setQ(""); } }, [open, initialCategory]);

  const items = useMemo(() => APP_CATALOG.map(a => ({
    ...a,
    _category: categoryOf(a.key),
    _tags: [
      a.key === "webhook" ? "Trigger" : undefined,
      a.key === "delay" ? "Flow" : undefined,
      ["http", "formatter", "code", "files", "emailParser"].includes(a.key) ? "Utility" : undefined,
      ["gmailSend", "slackPost", "calendarCreate", "sheetsAddRow", "driveUpload", "outlookSend", "telegramSend"].includes(a.key) ? "Action" : undefined,
      a.key.startsWith("prod") ? "Product" : undefined,
      a.key.startsWith("ai") ? "AI" : undefined,
      a.key.startsWith("custom") ? "Custom" : undefined,
    ].filter(Boolean) as string[],
  })), []);
  const filtered = useMemo(() => {
    const qx = q.trim().toLowerCase();
    return items.filter(f => f._category === active && (!qx ||
      f.name.toLowerCase().includes(qx) || f._tags.some(t => t.toLowerCase().includes(qx))));
  }, [items, active, q]);
  if (!open) return null;

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}
         onClick={onClose} onKeyDown={(e)=>e.key==="Escape"&&onClose()}>
      <div onClick={(e)=>e.stopPropagation()} style={{
        width: "min(980px,96vw)", height: "min(620px,90vh)", background:"#fff", borderRadius:16,
        boxShadow:"0 20px 40px rgba(0,0,0,.25)", display:"grid", gridTemplateColumns:"260px 1fr", overflow:"hidden"
      }}>
        <aside style={{ background:"#fafafa", borderRight:"1px solid #eee", padding:16 }}>
          <div style={{ fontWeight:700, fontSize:14, opacity:.6, marginBottom:8 }}>Browse</div>
          {(["apps","ai","flow","utilities","products","custom"] as CategoryKey[]).map(c=>{
            const count = items.filter(i=>i._category===c).length; const sel = c===active;
            return (
              <button key={c} onClick={()=>setActive(c)} style={{
                display:"flex",alignItems:"center",gap:8,width:"100%",padding:"10px 12px",marginBottom:6,
                borderRadius:10,border:"1px solid "+(sel?"#dbeafe":"transparent"),background:sel?"#eef2ff":"transparent",cursor:"pointer"
              }}>
                <span style={{flex:1,textAlign:"left"}}>{{apps:"Apps",ai:"AI",flow:"Flow controls",utilities:"Utilities",products:"Products",custom:"Custom"}[c]}</span>
                <span style={{fontSize:12,padding:"2px 8px",borderRadius:999,background:"#f3f4f6"}}>{count}</span>
              </button>
            );
          })}
          <div style={{ marginTop:16 }}>
            <button onClick={onClose} style={{ width:"100%", borderRadius:10, border:"1px solid #e5e7eb", padding:"10px 12px", background:"#fff", cursor:"pointer" }}>Close</button>
          </div>
        </aside>
        <section style={{ padding:16, display:"flex", flexDirection:"column", height:"100%" }}>
          <div style={{ display:"flex", gap:8, alignItems:"center", marginBottom:12 }}>
            <div style={{ position:"relative", flex:1 }}>
              <input autoFocus value={q} onChange={(e)=>setQ(e.target.value)} placeholder="Search apps, tools, or actions…"
                     style={{ width:"100%", padding:"10px 12px 10px 36px", borderRadius:10, border:"1px solid #e5e7eb", outline:"none" }}/>
              <span style={{ position:"absolute", top:10, left:10, opacity:.6 }}>🔎</span>
            </div>
            <span style={{ fontSize:13, opacity:.6 }}>{filtered.length} result{filtered.length===1?"":"s"}</span>
          </div>
          <div style={{ overflow:"auto", border:"1px solid #eee", borderRadius:12, padding:8, flex:1 }}>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(260px, 1fr))", gap:10 }}>
              {filtered.map(f=>(
                <button key={f.key} onClick={()=>onPick(f.key)} style={{ textAlign:"left", border:"1px solid #e5e7eb", borderRadius:12, padding:12, background:"#fff", cursor:"pointer", display:"flex", flexDirection:"column", gap:6 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <span style={{ width:32, height:32, borderRadius:"50%", background:f.color, color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16 }}>{f.icon ?? ""}</span>
                    <div style={{ fontWeight:600 }}>{f.name}</div>
                  </div>
                  <div style={{ display:"flex", gap:6, marginTop:4 }}>{f._tags.map(t=><Badge key={t}>{t}</Badge>)}</div>
                </button>
              ))}
            </div>
          </div>
          <div style={{ marginTop:8, fontSize:12, opacity:.6 }}>Tip: Press <kbd>Esc</kbd> to close. Click a card to attach the function to your node.</div>
        </section>
      </div>
    </div>
  );
}

/** MAIN */
export default function ScenarioBuilder() {
  return (
    <ReactFlowProvider>
      <EditorShell />
    </ReactFlowProvider>
  );
}

function EditorShell() {
  const [nodes, setNodes, onNodesChange] = useNodesState<RFData>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<RFData>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [pickerFor, setPickerFor] = useState<{ sourceId: string | null; replaceId?: string | null } | null>(null);
  const rf = useRef<any>(null);
  const [scenarioName, setScenarioName] = useState<string>("New scenario");
  const [editingName, setEditingName] = useState<boolean>(false);

  // --- Run/test/schedule state ---
  const [scheduleEnabled, setScheduleEnabled] = useState(false);
  const [interval, setIntervalStr] = useState<"15m" | "1h" | "1d">("15m");
  const [savingFlash, setSavingFlash] = useState<null | string>(null);

  // --- Notes / settings / IO modals ---
  const [notes, setNotes] = useState<string>("");
  const [showExplain, setShowExplain] = useState(false);
  const [showIO, setShowIO] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [showVersions, setShowVersions] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);

  // --- Versions (snapshots) ---
  type Version = { id: string; name: string; ts: number; data: { nodes: Node<RFData>[]; edges: Edge<RFData>[]; name: string; notes: string; } };
  const [versions, setVersions] = useState<Version[]>(() => {
    try { return JSON.parse(localStorage.getItem(VERSIONS_KEY) || "[]"); } catch { return []; }
  });

  // --- Undo / Redo stacks ---
  const [undo, setUndo] = useState<{nodes:Node<RFData>[],edges:Edge<RFData>[]}[]>([]);
  const [redo, setRedo] = useState<{nodes:Node<RFData>[],edges:Edge<RFData>[]}[]>([]);
  const pushUndo = (n: Node<RFData>[], e: Edge<RFData>[]) => setUndo((u)=>[...u, {nodes:structuredClone(n), edges:structuredClone(e)}]);

  // anchored + clicks
  useEffect(() => {
    const onAddNext = (e: any) => { const sourceId = e?.detail?.id as string; if (sourceId) setPickerFor({ sourceId }); };
    window.addEventListener(ADD_NEXT_EVENT, onAddNext as EventListener);
    return () => window.removeEventListener(ADD_NEXT_EVENT, onAddNext as EventListener);
  }, []);

  // init with Initial node (centered)
  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const { nodes: n, edges: e, name, notes } = JSON.parse(saved);
        if (Array.isArray(n) && n.length > 0) {
          setNodes(n as Node<RFData>[]); setEdges(e as Edge<RFData>[]); if (typeof name === "string" && name.trim()) setScenarioName(name);
          if (typeof notes === "string") setNotes(notes);
          return;
        }
      } catch {}
    }
    const rect = (rf.current as HTMLElement | null)?.getBoundingClientRect?.();
    const cx = rect ? Math.max(0, Math.round(rect.width / 2 - NODE_W / 2)) : 240;
    const cy = rect ? Math.max(0, Math.round(rect.height / 2 - NODE_H / 2)) : 180;
    const initial: Node<RFData> = { id: "initial", type: "initial", position: { x: cx, y: cy }, data: { label: "Start" } };
    setNodes([initial]);
  }, [setNodes, setEdges]);

  // autosave
  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ nodes, edges, name: scenarioName, notes }));
  }, [nodes, edges, scenarioName, notes]);

  const onConnect: OnConnect = useCallback((params: Connection) => {
    pushUndo(nodes, edges);
    setEdges((eds) => addEdge({ id: uid("e"), ...params, markerEnd: { type: MarkerType.ArrowClosed } }, eds));
  }, [setEdges, nodes, edges]);

  const selectedNode = useMemo(() => nodes.find((n) => n.id === selectedId) || null, [nodes, selectedId]);
  const changeNode = (draft: Node<RFData>) => { pushUndo(nodes, edges); setNodes((nds) => (nds.map((n) => (n.id === draft.id ? { ...n, data: draft.data } : n)) as Node<RFData>[])); };
  const deleteNode = (id: string) => { pushUndo(nodes, edges);
    setEdges((eds) => eds.filter((e) => e.source !== id && e.target !== id));
    setNodes((nds) => nds.filter((n) => n.id !== id) as Node<RFData>[]); if (selectedId === id) setSelectedId(null);
  };

  // keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "z") { e.preventDefault(); handleUndo(); }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "y") { e.preventDefault(); handleRedo(); }
      if ((e.key === "Delete" || e.key === "Backspace") && selectedNode) { e.preventDefault(); deleteNode(selectedNode.id); }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") { e.preventDefault(); handleSave(); }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "enter") { e.preventDefault(); handleTestRun(); }
    };
    window.addEventListener("keydown", onKey); return () => window.removeEventListener("keydown", onKey);
  }, [selectedNode, nodes, edges]);

  // --- Actions ---
  function handleSave() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ nodes, edges, name: scenarioName, notes }));
    setSavingFlash("Saved");
    setTimeout(()=>setSavingFlash(null), 1200);
  }
  function handleTestRun() {
    alert("Test run: this would execute in dry-run mode.\n(Stub) Nodes: " + nodes.length + ", Edges: " + edges.length);
  }
  function handleRunOnce() {
    alert("Run once: executing the scenario now.\n(Stub)");
  }
  function handlePublish() {
    alert("Published (stub): expose this scenario for production runs.");
  }
  function handleUndo() {
    const last = undo[undo.length-1]; if (!last) return;
    setUndo(u=>u.slice(0,-1));
    setRedo(r=>[...r, {nodes:structuredClone(nodes), edges:structuredClone(edges)}]);
    setNodes(structuredClone(last.nodes)); setEdges(structuredClone(last.edges));
  }
  function handleRedo() {
    const last = redo[redo.length-1]; if (!last) return;
    setRedo(r=>r.slice(0,-1));
    setUndo(u=>[...u, {nodes:structuredClone(nodes), edges:structuredClone(edges)}]);
    setNodes(structuredClone(last.nodes)); setEdges(structuredClone(last.edges));
  }
  function autoAlign() {
    // naive left-to-right layout by BFS from initial
    const start = nodes.find(n=>n.type==="initial") ?? nodes[0];
    if (!start) return;
    const adj = new Map<string,string[]>();
    edges.forEach(e=>{ adj.set(e.source, [...(adj.get(e.source)||[]), e.target]); });
    const level = new Map<string,number>(); const order: string[] = [];
    const q = [start.id]; level.set(start.id,0);
    while(q.length){ const u = q.shift()!; order.push(u);
      for(const v of (adj.get(u)||[])){ if(!level.has(v)){ level.set(v,(level.get(u)??0)+1); q.push(v); } }
    }
    const spacingX = 220, spacingY = 140;
    const grouped = new Map<number,string[]>(); level.forEach((lv,id)=>grouped.set(lv,[...(grouped.get(lv)||[]), id]));
    const centerY = 200;
    const newNodes = nodes.map(n=>{
      const lv = level.get(n.id) ?? 0;
      const siblings = grouped.get(lv)||[];
      const idx = siblings.indexOf(n.id);
      const y = centerY + (idx - (siblings.length-1)/2)*spacingY;
      const x = 100 + lv*spacingX;
      return { ...n, position:{ x, y } };
    });
    pushUndo(nodes, edges);
    setNodes(newNodes as Node<RFData>[]);
  }

  function explainFlowText() {
    const nameOf = (id:string)=> (nodes.find(n=>n.id===id)?.data as RFData)?.label || nodes.find(n=>n.id===id)?.type || id;
    const outsOf = (id:string)=> edges.filter(e=>e.source===id).map(e=>e.target);
    const start = nodes.find(n=>n.type==="initial")?.id || nodes[0]?.id;
    const visited = new Set<string>(); const lines: string[] = [];
    function dfs(u:string, depth=0){
      if(!u || visited.has(u)) return; visited.add(u);
      const outs = outsOf(u); const label = nameOf(u);
      if(depth===0) lines.push(`Flow starts at **${label}**.`);
      outs.forEach((v)=>{
        const step = nameOf(v);
        lines.push(`→ Then ${step}.`);
        dfs(v, depth+1);
      });
      if(outs.length===0 && depth>0) lines.push(`→ Ends after **${label}**.`);
    }
    dfs(start,0);
    if(lines.length===0) return "Empty flow. Add modules to begin.";
    return lines.join("\n");
  }

  function exportBlueprint() {
    const data = { name: scenarioName, notes, nodes, edges, scheduleEnabled, interval };
    const blob = new Blob([JSON.stringify(data,null,2)], { type:"application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `${scenarioName.replace(/\s+/g,"_")}.blueprint.json`; a.click();
    URL.revokeObjectURL(url);
  }
  function importBlueprint(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const obj = JSON.parse(String(reader.result));
        if (obj.nodes && obj.edges) {
          pushUndo(nodes, edges);
          setNodes(obj.nodes); setEdges(obj.edges);
          if (obj.name) setScenarioName(obj.name);
          if (obj.notes) setNotes(obj.notes);
          if (typeof obj.scheduleEnabled === "boolean") setScheduleEnabled(obj.scheduleEnabled);
          if (obj.interval) setIntervalStr(obj.interval);
          handleSave();
        } else {
          alert("Invalid blueprint file.");
        }
      } catch {
        alert("Failed to parse blueprint.");
      }
    };
    reader.readAsText(file);
  }

  function snapshotVersion() {
    const v: Version = { id: uid("v"), name: `${scenarioName} – ${new Date().toLocaleString()}`, ts: Date.now(), data: { nodes, edges, name: scenarioName, notes } };
    const vs = [v, ...versions].slice(0, 20);
    setVersions(vs); localStorage.setItem(VERSIONS_KEY, JSON.stringify(vs));
  }
  function restoreVersion(v: Version) {
    pushUndo(nodes, edges);
    setNodes(structuredClone(v.data.nodes)); setEdges(structuredClone(v.data.edges));
    setScenarioName(v.data.name); setNotes(v.data.notes);
    setShowVersions(false);
  }

  // Custom tooltip component
  function Tooltip({ children, text, id }: { children: React.ReactNode; text: string; id: string }) {
    return (
      <div 
        style={{ position: "relative", display: "inline-block" }}
        onMouseEnter={() => setHoveredButton(id)}
        onMouseLeave={() => setHoveredButton(null)}
      >
        {children}
        {hoveredButton === id && (
          <div style={{
            position: "absolute",
            bottom: "100%",
            left: "50%",
            transform: "translateX(-50%)",
            background: "rgba(0, 0, 0, 0.8)",
            color: "white",
            padding: "4px 8px",
            borderRadius: "4px",
            fontSize: "12px",
            whiteSpace: "nowrap",
            zIndex: 1000,
            pointerEvents: "none",
            marginBottom: "4px",
            animation: "tooltipFadeIn 0.1s ease-in"
          }}>
            {text}
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{ display: "flex", height: "calc(100vh - 64px)", width: "100%" }}>
      <div style={styles.canvasWrap as any}>
        <div style={{ position: "absolute", inset: 0 }} ref={rf as any}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={(chs)=>{ pushUndo(nodes, edges); onNodesChange(chs); }}
            onEdgesChange={(chs)=>{ pushUndo(nodes, edges); onEdgesChange(chs); }}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            connectionMode={ConnectionMode.Loose}
            fitView
            onPaneClick={() => { setSelectedId(null); setDrawerOpen(false); }}
            onNodeClick={(_, n) => {
              if (n.type === "initial") { setPickerFor({ sourceId: null, replaceId: n.id }); }
              else { setSelectedId(n.id); setDrawerOpen(true); }
            }}
            proOptions={{ hideAttribution: true }}
          >
            {/* Top-left header overlay */}
            <div style={styles.headerOverlay as any}>
              <button aria-label="Back" onClick={() => window.history.back()} style={styles.backBtn as any}>
                <span style={{ fontSize: 16 }}>↩︎</span><span>Back</span>
              </button>
              {editingName ? (
                <input autoFocus value={scenarioName} onChange={(e) => setScenarioName(e.target.value)}
                  onBlur={() => setEditingName(false)} onKeyDown={(e) => { if (e.key === "Enter") setEditingName(false); }}
                  style={styles.nameInput as any}/>
              ) : (
                <button title="Click to rename" onClick={() => setEditingName(true)} style={styles.nameBtn as any}>{scenarioName}</button>
              )}
              {savingFlash && <span style={{ marginLeft: 8, fontSize: 12, color: "#16a34a" }}>✔ {savingFlash}</span>}
            </div>

            {/* Top action bar (Zapier-like) */}
            <div style={styles.topActionBar as any}>
              <Tooltip text="Undo" id="undo-btn">
                <button style={styles.pillBtn as any} onClick={handleUndo}>↩︎ Undo</button>
              </Tooltip>
              <Tooltip text="Redo" id="redo-btn">
                <button style={styles.pillBtn as any} onClick={handleRedo}>↪︎ Redo</button>
              </Tooltip>
              <Tooltip text="Test run" id="test-run-btn">
                <button style={styles.pillBtn as any} onClick={handleTestRun}>▶ Test run</button>
              </Tooltip>
              <Tooltip text="Publish" id="publish-btn">
                <button style={{ ...styles.pillBtn, background:"#eefcf3", borderColor:"#bbf7d0" } as any} onClick={handlePublish}>⚡ Publish</button>
              </Tooltip>
            </div>

            {/* Bottom action bar (Make-like) */}
            <div className="builder-bottom-bar">
              <div style={styles.bottomGroup as any}>
                <Tooltip text="Run once" id="run-once-btn">
                  <button style={{ ...styles.pillBtn, background:"#ede9fe", borderColor:"#ddd6fe" } as any} onClick={handleRunOnce}>▶ Run once</button>
                </Tooltip>
                <div style={styles.toggleWrap as any}>
                  <label style={{ display:"inline-flex",alignItems:"center",gap:6, cursor:"pointer" }}>
                    <input type="checkbox" checked={scheduleEnabled} onChange={(e)=>setScheduleEnabled(e.target.checked)}/>
                    <span>{scheduleEnabled ? "Scheduled" : "Every 15 minutes"}</span>
                  </label>
                  {scheduleEnabled && (
                    <select value={interval} onChange={(e)=>setIntervalStr(e.target.value as any)} style={{ border:"1px solid #e5e7eb", borderRadius:8, padding:"4px 6px", fontSize:12, background:"#fff" }}>
                      <option value="15m">Every 15 min</option>
                      <option value="1h">Every hour</option>
                      <option value="1d">Daily</option>
                    </select>
                  )}
                </div>
              </div>

              <div style={styles.divider as any} />

              <div style={styles.bottomGroup as any}>
                <Tooltip text="Save" id="save-btn">
                  <button style={styles.tinyBtn as any} onClick={handleSave}>💾</button>
                </Tooltip>
                <Tooltip text="Auto-align" id="auto-align-btn">
                  <button style={styles.tinyBtn as any} onClick={autoAlign}>🧲</button>
                </Tooltip>
                <Tooltip text="Explain flow" id="explain-btn">
                  <button style={styles.tinyBtn as any} onClick={()=>setShowExplain(true)}>💡</button>
                </Tooltip>
                <Tooltip text="Scenario I/O" id="io-btn">
                  <button style={styles.tinyBtn as any} onClick={()=>setShowIO(true)}>📥📤</button>
                </Tooltip>
                <Tooltip text="Settings" id="settings-btn">
                  <button style={styles.tinyBtn as any} onClick={()=>setShowSettings(true)}>⚙️</button>
                </Tooltip>
                <Tooltip text="Notes" id="notes-btn">
                  <button style={styles.tinyBtn as any} onClick={()=>setShowNotes(true)}>📝</button>
                </Tooltip>
                <Tooltip text="Versions" id="versions-btn">
                  <button style={styles.tinyBtn as any} onClick={()=>setShowVersions(true)}>🕘</button>
                </Tooltip>

                <div style={styles.menuWrap as any}>
                  <Tooltip text="More" id="more-btn">
                    <button style={styles.tinyBtn as any} onClick={()=>setMenuOpen(v=>!v)}>⋯</button>
                  </Tooltip>
                  {menuOpen && (
                    <div style={styles.menuList as any} onMouseLeave={()=>setMenuOpen(false)}>
                      <div style={styles.menuItem as any} onClick={()=>{ setMenuOpen(false); exportBlueprint(); }}>Export blueprint</div>
                      <label style={{ ...styles.menuItem, display:"block" } as any}>
                        Import blueprint
                        <input type="file" accept="application/json" style={{ display:"none" }}
                               onChange={(e)=>{ const f=e.target.files?.[0]; if(f){ setMenuOpen(false); importBlueprint(f);} }} />
                      </label>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <Background gap={24} />
            <MiniMap pannable zoomable />
            <Controls />
          </ReactFlow>
        </div>
      </div>

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        {selectedNode ? (
          <InspectorBody node={selectedNode as Node<RFData>} onChangeNode={changeNode} onDeleteNode={deleteNode} />
        ) : (
          <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af", fontSize: 14 }}>
            Select a node
          </div>
        )}
      </Drawer>

      <FunctionPicker
        open={!!pickerFor}
        onPick={(key) => {
          const spec = getAppSpec(key);
          const replaceId = pickerFor?.replaceId ?? null;
          const srcId = pickerFor?.sourceId ?? null;

          if (replaceId) {
            setNodes((nds) => (nds.map((n) =>
              n.id === replaceId ? { ...n, type: "app", data: { label: spec.name, appKey: key, values: {} } } : n
            ) as Node<RFData>[]));
            setPickerFor(null); setSelectedId(replaceId); setDrawerOpen(true); return;
          }

          const id = uid("app");
          const pos = srcId ? (nodes.find((n) => n.id === srcId)?.position ?? { x: 200, y: 200 }) : { x: 240, y: 180 };
          const newNode: Node<RFData> = { id, type: "app", position: { x: pos.x + 220, y: pos.y }, data: { label: spec.name, appKey: key, values: {} } };
          pushUndo(nodes, edges);
          setNodes((nds) => (nds.concat(newNode) as Node<RFData>[]));
          if (srcId) setEdges((eds) => addEdge({ id: uid("e"), source: srcId, target: id, markerEnd: { type: MarkerType.ArrowClosed }, animated: true }, eds));
          setPickerFor(null); setSelectedId(id); setDrawerOpen(true);
        }}
        onClose={() => setPickerFor(null)}
        initialCategory="apps"
      />

      {/* Explain Flow modal */}
      {showExplain && (
        <Modal onClose={()=>setShowExplain(false)} title="Explain Flow">
          <pre style={{ whiteSpace:"pre-wrap", fontSize:13, lineHeight:1.5 }}>{explainFlowText()}</pre>
        </Modal>
      )}

      {/* Inputs / Outputs modal (stub) */}
      {showIO && (
        <Modal onClose={()=>setShowIO(false)} title="Scenario Inputs & Outputs">
          <div style={{ fontSize:13, color:"#374151" }}>
            <p>Define external inputs and outputs for this scenario (stub UI).</p>
            <ul>
              <li>Inputs: environment vars, secrets, manual params</li>
              <li>Outputs: return payloads, files, webhooks</li>
            </ul>
          </div>
        </Modal>
      )}

      {/* Settings modal */}
      {showSettings && (
        <Modal onClose={()=>setShowSettings(false)} title="Scenario Settings">
          <div style={{ fontSize:13 }}>
            <div style={{ marginBottom:10 }}>
              <div style={styles.formLabel}>Scenario name</div>
              <input style={styles.input} value={scenarioName} onChange={(e)=>setScenarioName(e.target.value)} />
            </div>
            <div style={{ marginBottom:10 }}>
              <label style={{ display:"flex", alignItems:"center", gap:8 }}>
                <input type="checkbox" checked={scheduleEnabled} onChange={(e)=>setScheduleEnabled(e.target.checked)} />
                <span>Enable schedule</span>
              </label>
              {scheduleEnabled && (
                <select value={interval} onChange={(e)=>setIntervalStr(e.target.value as any)} style={{ ...styles.select, width:160 } as any}>
                  <option value="15m">Every 15 minutes</option>
                  <option value="1h">Every hour</option>
                  <option value="1d">Daily</option>
                </select>
              )}
            </div>
            <button style={{ ...styles.tinyBtn, padding:"8px 12px" } as any} onClick={()=>{ handleSave(); snapshotVersion(); }}>Save & snapshot</button>
          </div>
        </Modal>
      )}

      {/* Notes modal */}
      {showNotes && (
        <Modal onClose={()=>setShowNotes(false)} title="Notes">
          <textarea value={notes} onChange={(e)=>setNotes(e.target.value)} rows={10}
            style={{ width:"100%", border:"1px solid #e5e7eb", borderRadius:8, padding:10, fontSize:13 }} placeholder="Write notes for collaborators…" />
          <div style={{ marginTop:8, display:"flex", justifyContent:"flex-end", gap:8 }}>
            <button style={styles.tinyBtn as any} onClick={()=>setNotes("")}>Clear</button>
            <button style={styles.tinyBtn as any} onClick={handleSave}>Save</button>
          </div>
        </Modal>
      )}

      {/* Versions modal */}
      {showVersions && (
        <Modal onClose={()=>setShowVersions(false)} title="Versions">
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
            <div style={{ fontSize:13, color:"#374151" }}>Local snapshots (max 20)</div>
            <button style={styles.tinyBtn as any} onClick={snapshotVersion}>Create snapshot</button>
          </div>
          <div style={{ display:"grid", gap:8 }}>
            {versions.length===0 && <div style={{ fontSize:13, color:"#6b7280" }}>No versions yet.</div>}
            {versions.map(v=>(
              <div key={v.id} style={{ border:"1px solid #e5e7eb", borderRadius:8, padding:8, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                <div>
                  <div style={{ fontWeight:600, fontSize:13 }}>{v.name}</div>
                  <div style={{ fontSize:12, color:"#6b7280" }}>{new Date(v.ts).toLocaleString()}</div>
                </div>
                <div style={{ display:"flex", gap:8 }}>
                  <button style={styles.tinyBtn as any} onClick={()=>restoreVersion(v)}>Restore</button>
                  <button style={styles.tinyBtn as any} onClick={()=>{
                    const vs = versions.filter(x=>x.id!==v.id); setVersions(vs); localStorage.setItem(VERSIONS_KEY, JSON.stringify(vs));
                  }}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        </Modal>
      )}
    </div>
  );
}


/** Generic modal */
function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void; }) {
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.35)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:60 }}
         onClick={onClose} onKeyDown={(e)=>e.key==="Escape"&&onClose()}>
      <div onClick={(e)=>e.stopPropagation()} style={{ width:"min(680px,94vw)", maxHeight:"80vh", overflow:"auto", background:"#fff", borderRadius:12, border:"1px solid #e5e7eb", boxShadow:"0 18px 36px rgba(0,0,0,0.2)" }}>
        <div style={{ padding:"12px 16px", borderBottom:"1px solid #e5e7eb", fontWeight:600 }}>{title}</div>
        <div style={{ padding:16 }}>{children}</div>
        <div style={{ padding:12, borderTop:"1px solid #e5e7eb", display:"flex", justifyContent:"flex-end" }}>
          <button style={styles.tinyBtn as any} onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
