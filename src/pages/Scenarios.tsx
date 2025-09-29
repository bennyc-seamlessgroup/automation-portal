// src/pages/Scenarios.tsx
import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// 🧠 Shared data layer
import { useScenarios } from "../state/ScenariosContext";
import type { Scenario } from "../state/scenarios";

/* ──────────────────────────────────────────────────────────────────────────
   BRAND/TOOL BADGES (colorful icons for Apps column)
   - Keys align with ScenarioBuilder.tsx appKey values when present.
   - Fallback badge is neutral if no known key is found.
   ────────────────────────────────────────────────────────────────────────── */
 // AppKey type reserved for future cross-file imports if needed

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

function AppBadge({ k, fallbackLabel }: { k?: string; fallbackLabel?: string }) {
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

function AppsInline({ keysOrLabels, max = 3 }: { keysOrLabels: (string | undefined)[]; max?: number }) {
  const clean = keysOrLabels.filter(Boolean) as string[];
  const over = clean.length > max;
  const show = clean.slice(0, max - (over ? 1 : 0)); // keep room for +N bubble
  return (
    <div className="d-inline-flex align-items-center gap-1" title={clean.join(", ")}>
      {show.map((k, i) => (
        <AppBadge key={`app-${i}`} k={APP_BADGES[k] ? k : undefined} fallbackLabel={k} />
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

/* Relative date formatter for Last modified */
function formatRelativeDate(iso?: string, fallback?: string) {
  if (!iso) return fallback || "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return fallback || "";

  const today = new Date();
  const startOfDay = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate());
  const a = startOfDay(today).getTime();
  const b = startOfDay(d).getTime();
  const diffDays = Math.floor((a - b) / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) return "Today";
  if (diffDays === 1) return "1 day ago";
  if (diffDays <= 7) return `${diffDays} days ago`;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

/* ──────────────────────────────────────────────────────────────────────────
   DEBUG HELPERS
   - emitDebugPayload: dispatches a debug event with payload data
   - DebugPayloadUI: bottom-center toggle + modal to preview JSON payloads
   ────────────────────────────────────────────────────────────────────────── */
type DebugEvent = { action: string; payload: Record<string, unknown>; ts: string };

function emitDebugPayload(action: string, payload: Record<string, unknown>) {
  window.dispatchEvent(
    new CustomEvent("__debug_payload__", {
      detail: { action, payload, ts: new Date().toISOString() } as DebugEvent,
    })
  );
}

/** UI for showing backend payload previews (toggle + modal) */
function DebugPayloadUI() {
  const STORAGE_KEY = "debugPayloadEnabled";
  const [enabled, setEnabled] = useState<boolean>(() => {
    try { return localStorage.getItem(STORAGE_KEY) !== "0"; } catch { return true; }
  });
  const [open, setOpen] = useState(false);
  const [event, setEvent] = useState<DebugEvent | null>(null);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, enabled ? "1" : "0"); } catch {}
  }, [enabled]);

  useEffect(() => {
    const onDebug = (e: Event) => {
      if (!enabled) return;
      const ce = e as CustomEvent<DebugEvent>;
      setEvent(ce.detail);
      setOpen(true);
      // eslint-disable-next-line no-console
      console.log("[DEBUG-PAYLOAD]", ce.detail);
    };
    window.addEventListener("__debug_payload__", onDebug as EventListener);
    return () => window.removeEventListener("__debug_payload__", onDebug as EventListener);
  }, [enabled]);

  const copy = async () => {
    if (!event) return;
    const json = JSON.stringify(event, null, 2);
    try {
      await navigator.clipboard.writeText(json);
      alert("Copied JSON to clipboard.");
    } catch {
      alert("Copy failed. Please copy manually.");
    }
  };

  return (
    <>
      {/* Bottom-center toggle */}
      <div
        className="position-fixed bottom-0 start-50 translate-middle-x mb-3"
        style={{ zIndex: 1061, pointerEvents: "none" }}
      >
        <div
          className="d-inline-flex align-items-center gap-2 px-3 py-1 rounded-pill shadow-sm border bg-white"
          style={{ pointerEvents: "auto" }}
        >
          <small className="text-secondary">Payload Preview</small>
          <button
            className={`btn btn-sm ${enabled ? "btn-dark" : "btn-outline-dark"}`}
            onClick={() => setEnabled((v) => !v)}
            title="Toggle payload preview"
          >
            {enabled ? "On" : "Off"}
          </button>
        </div>
      </div>

      {/* Modal */}
      {open && event && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100"
          style={{ background: "rgba(0,0,0,0.45)", zIndex: 1062 }}
          role="dialog"
          aria-modal="true"
          onClick={() => setOpen(false)}
        >
          <div
            className="card shadow"
            style={{
              width: "min(860px, 96vw)",
              maxHeight: "80vh",
              overflow: "hidden",
              position: "absolute",
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="card-header d-flex justify-content-between align-items-center">
              <div>
                <div className="fw-semibold">Backend Payload Preview</div>
                <small className="text-secondary">
                  Action: <span className="fw-semibold">{event.action}</span> ·{" "}
                  {new Date(event.ts).toLocaleString()}
                </small>
              </div>
              <div className="d-flex align-items-center gap-2">
                <button className="btn btn-outline-dark btn-sm" onClick={copy}>
                  Copy JSON
                </button>
                <button className="btn btn-dark btn-sm" onClick={() => setOpen(false)}>
                  Close
                </button>
              </div>
            </div>
            <div className="card-body p-0" style={{ background: "#f8fafc" }}>
              <pre className="m-0 p-3" style={{ maxHeight: "60vh", overflow: "auto", fontSize: 12 }}>
                {JSON.stringify(event, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   TYPES
   ────────────────────────────────────────────────────────────────────────── */
type Status = "running" | "stopped" | "error";

/* ──────────────────────────────────────────────────────────────────────────
   MAIN PAGE: Scenarios (List-only)
   - Lists scenarios with search, status filter, pagination
   - Uses table view (Zapier-style). Grid view removed per request.
   ────────────────────────────────────────────────────────────────────────── */
export default function Scenarios() {
  // Filters + pagination
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState<Status | "All">("All");
  const [page, setPage] = useState(1);
  const pageSize: 10 | 25 | 50 | 100 = 10;

  // Data + nav
  const navigate = useNavigate();
  const { scenarios, save, remove } = useScenarios();

  // Derived: filtered items
  const items = useMemo(() => {
    let out = scenarios;
    if (statusFilter !== "All") out = out.filter((s) => s.status === statusFilter);
    if (q.trim()) {
      const t = q.toLowerCase();
      out = out.filter((s) => s.title.toLowerCase().includes(t) || s.meta.toLowerCase().includes(t));
    }
    return out;
  }, [q, statusFilter, scenarios]);

  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const pageItems = items.slice((page - 1) * pageSize, page * pageSize);

  /* ── Actions (kept close together) ────────────────────────────────────── */
  /** Navigate to new scenario builder */
  const onCreate = () => {
    emitDebugPayload("scenarios.create.navigate", { to: "/scenarios/new" });
    navigate("/scenarios/new");
  };

  /** Reset to first page and emit a refresh payload (placeholder) */
  const onRefresh = () => {
    setPage(1);
    emitDebugPayload("scenarios.refresh", { page: 1, q, statusFilter });
  };

  /** Clear localStorage data used by the app and refresh */
  const onClearLocal = () => {
    try {
      localStorage.removeItem("ap.scenarios.v1");
      localStorage.removeItem("automationPortal.scenarioBuilder.initialNode.v5");
      localStorage.removeItem("automationPortal.scenarioBuilder.versions");
      emitDebugPayload("scenarios.local.clear", { keys: [
        "ap.scenarios.v1",
        "automationPortal.scenarioBuilder.initialNode.v5",
        "automationPortal.scenarioBuilder.versions",
      ]});
      onRefresh();
      alert("Local storage cleared for scenarios and builder drafts.");
    } catch (e) {
      // eslint-disable-next-line no-alert
      alert("Failed to clear local storage. See console for details.");
      // eslint-disable-next-line no-console
      console.error(e);
    }
  };

  /** Open a scenario in editor view */
  const gotoEdit = (id: string) => {
    emitDebugPayload("scenarios.openEditor", { scenarioId: id, from: "list" });
    navigate(`/scenarios/${id}/edit`);
  };

  /** Toggle running/stopped; persists via shared store */
  const onToggleStatus = (s: Scenario, toRunning: boolean) => {
    const next: Scenario = { ...s, status: toRunning ? "running" : "stopped" };
    emitDebugPayload("scenarios.toggleStatus", { scenarioId: s.id, to: next.status });
    save(next);
  };

  /** Delete scenario via shared store */
  const onDelete = (id: string) => {
    emitDebugPayload("scenarios.delete", { scenarioId: id });
    remove(id);
  };

  /* ── Render ───────────────────────────────────────────────────────────── */
  return (
    <div className="container-fluid py-3">
      {/* Header: filters + search + create */}
      <div className="d-flex flex-wrap align-items-center justify-content-between mb-3 gap-2">
        <div className="d-flex align-items-center gap-2">
          <h1 className="h4 mb-0">Scenarios</h1>

          {/* Status filter */}
          <div className="dropdown">
            <button className="btn btn-outline-dark btn-sm dropdown-toggle" data-bs-toggle="dropdown">
              <i className="bi bi-funnel me-1" />
              {statusFilter === "All" ? "All statuses" : capitalize(statusFilter)}
            </button>
            <ul className="dropdown-menu">
              {(["All", "running", "stopped", "error"] as const).map((st) => (
                <li key={st}>
                  <button
                    className="dropdown-item"
                    onClick={() => {
                      setStatusFilter(st as any);
                      setPage(1);
                      emitDebugPayload("scenarios.filter.status", { status: st === "All" ? null : st });
                    }}
                  >
                    {st === "All" ? "All statuses" : capitalize(st as Status)}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Refresh */}
          <button className="btn btn-outline-dark btn-sm" onClick={onRefresh} title="Refresh">
            <i className="bi bi-arrow-clockwise" />
          </button>
        <button className="btn btn-outline-danger btn-sm" onClick={onClearLocal} title="Clear local storage">
          <i className="bi bi-trash3" />
        </button>
        </div>

        {/* Search + create */}
        <div className="d-flex align-items-center gap-2">
          <div className="input-group input-group-sm" style={{ minWidth: 320 }}>
            <span className="input-group-text"><i className="bi bi-search" /></span>
            <input
              className="form-control"
              placeholder="Search by name or webhook"
              value={q}
              onChange={(e) => {
                const value = e.target.value;
                setQ(value);
                setPage(1);
                emitDebugPayload("scenarios.search", { q: value });
              }}
            />
          </div>

          <button className="btn btn-primary px-4 d-inline-flex align-items-center" onClick={onCreate}>
            <i className="bi bi-plus-lg me-1" />
            Create
          </button>
        </div>
      </div>

      {/* Body: empty hero or list view */}
      {items.length === 0 ? (
        <EmptyHero />
      ) : (
        <ListView
          items={pageItems}
          gotoEdit={gotoEdit}
          onToggleStatus={onToggleStatus}
          onDelete={onDelete}
        />
      )}

      {/* Footer: pagination & counters */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mt-3 gap-2">
        <small className="text-secondary">
          {total === 0 ? "No scenarios" : `${(page - 1) * pageSize + 1}–${Math.min(page * pageSize, total)} of ${total}`}
        </small>

        <div className="d-flex align-items-center gap-2">
          <nav aria-label="Scenario pagination">
            <ul className="pagination pagination-sm mb-0">
              <li className={`page-item ${page === 1 ? "disabled" : ""}`}>
                <button
                  className="page-link"
                  onClick={() => {
                    const next = Math.max(1, page - 1);
                    setPage(next);
                    emitDebugPayload("scenarios.page.change", { page: next });
                  }}
                >
                  Prev
                </button>
              </li>

              {/* Dynamic page numbers */}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <li key={pageNum} className={`page-item ${page === pageNum ? "active" : ""}`}>
                  <button
                    className="page-link"
                    onClick={() => {
                      setPage(pageNum);
                      emitDebugPayload("scenarios.page.change", { page: pageNum });
                    }}
                  >
                    {pageNum}
                  </button>
                </li>
              ))}

              <li className={`page-item ${page === totalPages ? "disabled" : ""}`}>
                <button
                  className="page-link"
                  onClick={() => {
                    const next = Math.min(totalPages, page + 1);
                    setPage(next);
                    emitDebugPayload("scenarios.page.change", { page: next });
                  }}
                >
                  Next
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      {/* Debug UI */}
      <DebugPayloadUI />
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   LIST VIEW (Zapier-like)
   - Table layout with owner, status switch, actions menu
   ────────────────────────────────────────────────────────────────────────── */
function ListView({
  items,
  gotoEdit,
  onToggleStatus,
  onDelete,
}: {
  items: Scenario[];
  gotoEdit: (id: string) => void;
  onToggleStatus: (s: Scenario, toRunning: boolean) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="card ws-card">
      <div className="table-responsive ws-table-wrap">
        <table className="table align-middle mb-0 ws-table" style={{ tableLayout: "fixed" }}>
          <thead>
            <tr>
              <th style={{ width: "auto", minWidth: 200 }}>Name</th>
              <th style={{ width: 140, textAlign: "center" }}>Apps</th>
              <th style={{ width: 120, textAlign: "center" }}>Last modified</th>
              <th style={{ width: 80, textAlign: "center" }}>Status</th>
              <th style={{ width: 80, textAlign: "center" }}>Owner</th>
              <th style={{ width: 44, textAlign: "center" }} />
            </tr>
          </thead>
          <tbody>
            {items.map((s) => (
              <tr key={s.id}>
                <td style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {/* title is clickable to open editor */}
                  <button
                    className="btn btn-link p-0 text-start fw-semibold ws-link"
                    onClick={() => gotoEdit(s.id)}
                    style={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      maxWidth: "100%",
                      display: "block",
                    }}
                    title={s.title}
                  >
                    {s.title}
                  </button>
                </td>

                {/* BEAUTIFIED APPS CELL */}
                <td className="text-secondary text-center">
                  {(() => {
                    const nodes: any[] = Array.isArray((s as any).graph?.nodes) ? (s as any).graph.nodes : [];

                    // Prefer appKey when available; otherwise fall back to label
                    const appKeysOrLabels: (string | undefined)[] = nodes
                      .filter((n) => n && (n.type === "app" || n.type === "App"))
                      .map((n) => n.data?.appKey || n.data?.label || "App");

                    return <AppsInline keysOrLabels={appKeysOrLabels} max={3} />;
                  })()}
                </td>

                <td className="text-secondary">
                  {formatRelativeDate(s.updatedAt, s.lastModified)}
                </td>
                <td className="text-center">
                  <div className="form-check form-switch m-0 d-flex justify-content-center">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      defaultChecked={s.status === "running"}
                      onChange={(e) => onToggleStatus(s, e.target.checked)}
                    />
                  </div>
                </td>
                <td className="text-center">
                  <span className="badge rounded-circle text-bg-primary ws-owner">{s.owner}</span>
                </td>
                <td className="text-center">
                  <ActionsDropdown scenarioId={s.id} onDelete={() => onDelete(s.id)} />
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center text-secondary py-5">
                  No scenarios match your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   ACTIONS DROPDOWN (per-row)
   - Rename, history, duplicate, move, delete
   ────────────────────────────────────────────────────────────────────────── */
function ActionsDropdown({ scenarioId, onDelete }: { scenarioId?: string; onDelete?: () => void }) {
  const { get, save } = useScenarios();

  const onRename = () => {
    if (!scenarioId) return;
    const s = get(scenarioId);
    if (!s) return;
    const nextTitle = window.prompt("Rename scenario", s.title || "Untitled Scenario");
    if (nextTitle == null) return; // cancelled
    const newTitle = nextTitle.trim();
    if (!newTitle || newTitle === s.title) return;
    const updated = {
      ...s,
      title: newTitle,
      graph: s.graph ? { ...s.graph, name: newTitle } : s.graph,
    };
    save(updated);
    emitDebugPayload("scenarios.rename", { scenarioId, title: newTitle });
  };

  const onDuplicate = () => {
    if (!scenarioId) return;
    const s = get(scenarioId);
    if (!s) return;

    // Create a duplicate with new ID and updated title
    const duplicated: Scenario = {
      ...s,
      id: crypto.randomUUID(),
      title: `${s.title} (Copy)`,
      lastModified: "just now",
      graph: s.graph ? { ...s.graph, name: `${s.title} (Copy)` } : s.graph,
    };

    save(duplicated);
    emitDebugPayload("scenarios.duplicate", {
      originalId: scenarioId,
      newId: duplicated.id,
      newTitle: duplicated.title,
    });
  };

  return (
    <div className="dropdown">
      <button className="btn btn-sm btn-outline-dark" data-bs-toggle="dropdown" aria-label="More actions">
        <i className="bi bi-three-dots" />
      </button>
      <ul className="dropdown-menu dropdown-menu-end ws-menu">
        <li>
          <button className="dropdown-item" onClick={onRename}>
            <i className="bi bi-pencil me-2" />
            Rename
          </button>
        </li>
        <li>
          <button
            className="dropdown-item"
            onClick={() => emitDebugPayload("scenarios.history.open", { scenarioId })}
          >
            <i className="bi bi-clock-history me-2" />
            View history
          </button>
        </li>
        <li>
          <button className="dropdown-item" onClick={onDuplicate}>
            <i className="bi bi-layers me-2" />
            Duplicate
          </button>
        </li>
        <li>
          <button
            className="dropdown-item disabled"
            aria-disabled="true"
            onClick={() => emitDebugPayload("scenarios.changeOwner.disabled", { scenarioId })}
          >
            <i className="bi bi-person-gear me-2" />
            Change owner
          </button>
        </li>
        <li>
          <hr className="dropdown-divider" />
        </li>
        <li>
          <button
            className="dropdown-item text-danger"
            onClick={() => {
              if (onDelete) onDelete();
            }}
          >
            <i className="bi bi-trash me-2" />
            Delete
          </button>
        </li>
      </ul>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   EMPTY STATES
   - EmptyHero: shown when there are no scenarios yet
   - EmptyState: fallback “nothing to show” (kept for completeness)
   ────────────────────────────────────────────────────────────────────────── */
function EmptyHero() {
  return (
    <div className="py-4">
      <div className="text-center text-secondary mb-3">You haven't created any scenarios yet</div>
      <div className="card ws-card p-4">
        <div className="d-flex flex-column align-items-center text-center p-3">
          {/* Icon cluster */}
          <div className="position-relative mb-3" style={{ width: 104, height: 84 }}>
            <div
              className="rounded-circle bg-primary-subtle text-primary d-flex align-items-center justify-content-center"
              style={{ width: 64, height: 64, position: "absolute", left: 20, top: 10 }}
            >
              <i className="bi bi-plus-lg" style={{ fontSize: 28 }} />
            </div>
            <div
              className="rounded-circle bg-success-subtle text-success d-flex align-items-center justify-content-center"
              style={{ width: 28, height: 28, position: "absolute", left: 62, top: 0 }}
            >
              <i className="bi bi-check2" />
            </div>
            <div
              className="rounded-circle bg-primary-subtle text-primary d-flex align-items-center justify-content-center"
              style={{ width: 36, height: 36, position: "absolute", left: 70, top: 40 }}
            >
              <i className="bi bi-envelope" />
            </div>
          </div>

          <h3 className="h5 fw-semibold mb-2">Create your first Scenario</h3>
          <p className="text-secondary" style={{ maxWidth: 720 }}>
            In order to automate your tasks, you need to create a scenario. Open the builder to create your first scenario or browse our templates for an easy start.
          </p>

          <div className="d-flex gap-2 mt-1">
            <a
              href="#"
              className="btn btn-primary d-inline-flex align-items-center"
              onClick={(e) => {
                e.preventDefault();
                emitDebugPayload("scenarios.builder.open", { source: "emptyHero" });
              }}
            >
              <i className="bi bi-box-arrow-up-right me-1" />
              <span>Open Scenario Builder</span>
            </a>
            <a
              href="#"
              className="btn btn-outline-dark d-inline-flex align-items-center"
              onClick={(e) => {
                e.preventDefault();
                emitDebugPayload("templates.browse.open", { source: "emptyHero" });
              }}
            >
              <i className="bi bi-grid me-1" />
              <span>Browse Templates</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   UTILS
   ────────────────────────────────────────────────────────────────────────── */
function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
