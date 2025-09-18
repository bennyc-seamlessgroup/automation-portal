import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ScenarioCard from "../components/ScenarioCard";

/* ──────────────────────────────────────────────────────────────────────────
   [DEBUG] Minimal helpers: emitDebugPayload + DebugPayloadUI
   - Bottom-center toggle (persisted with localStorage)
   - Modal showing copyable JSON
   - Does not alter your layout
   ────────────────────────────────────────────────────────────────────────── */
type DebugEvent = { action: string; payload: Record<string, unknown>; ts: string };

function emitDebugPayload(action: string, payload: Record<string, unknown>) {
  window.dispatchEvent(
    new CustomEvent("__debug_payload__", {
      detail: { action, payload, ts: new Date().toISOString() } as DebugEvent,
    })
  );
}

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

  // Bottom-center toggle (fixed)
  return (
    <>
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
/* ────────────────────────────────────────────────────────────────────────── */

type Status = "running" | "stopped" | "error";
type Scenario = {
    id: string;
    title: string;
    meta: string;
    status: Status;
    owner: string;         // initials
    lastModified: string;  // e.g. "22 hours ago"
};

const ALL_SCENARIOS: Scenario[] = [
    { id: "1", title: "Weekly Email Summary Automation", meta: "Every Mon 9:00 · 3 modules", status: "running", owner: "BC", lastModified: "22 hours ago" },
    { id: "2", title: "Untitled Zap", meta: "Manual · 1 module", status: "stopped", owner: "BC", lastModified: "23 hours ago" },
    { id: "3", title: "When new form submitted, generate image, add to Table", meta: "Form → AI → Table · 3 modules", status: "stopped", owner: "BC", lastModified: "1 day ago" },
    { id: "4", title: "When a new WhatsApp message is sent or received, add a new row to a Google Sheet", meta: "Webhook → Sheets · 2 modules", status: "running", owner: "BC", lastModified: "1 day ago" },
];

type ViewMode = "grid" | "list";

export default function Scenarios() {
    const [view, setView] = useState<ViewMode>("list");
    const [q, setQ] = useState("");
    const [statusFilter, setStatusFilter] = useState<Status | "All">("All");
    // Prototype-only toggle for the inline empty hero
    const [protoEmpty, setProtoEmpty] = useState(false);

    // pagination
    const [page, setPage] = useState(1);
    const pageSize: 25 | 50 | 100 = 25;

    const navigate = useNavigate();

    const items = useMemo(() => {
        let out = ALL_SCENARIOS;
        if (statusFilter !== "All") out = out.filter((s) => s.status === statusFilter);
        if (q.trim()) {
            const t = q.toLowerCase();
            out = out.filter((s) => s.title.toLowerCase().includes(t) || s.meta.toLowerCase().includes(t));
        }
        return out;
    }, [q, statusFilter]);

    const total = items.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const pageItems = items.slice((page - 1) * pageSize, page * pageSize);

    const onCreate = () => {
        // [DEBUG] emit creation intent
        emitDebugPayload("scenarios.create.navigate", { to: "/scenarios/new" });
        navigate("/scenarios/new");
    };
    const onRefresh = () => {
        setPage(1);
        // [DEBUG] refresh intent
        emitDebugPayload("scenarios.refresh", { page: 1, q, statusFilter });
    };

    const gotoEdit = (id: string) => {
        // [DEBUG] open editor
        emitDebugPayload("scenarios.openEditor", { scenarioId: id, from: view });
        // Stub route; wire to your editor route when ready
        navigate(`/scenarios/${id}/edit`);
    };

    return (
        <div className="container-fluid py-3">
            {/* Header strip */}
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
                                            // [DEBUG] filter change
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
                </div>

                {/* Right side: view toggle + search + create */}
                <div className="d-flex align-items-center gap-2">
                    <div className="btn-group" role="group" aria-label="View">
                        <button
                            className={`btn btn-sm ${view === "grid" ? "btn-dark" : "btn-outline-dark"}`}
                            onClick={() => {
                                setView("grid");
                                // [DEBUG] view change
                                emitDebugPayload("scenarios.view.change", { to: "grid" });
                            }}
                            title="Grid"
                        >
                            <i className="bi bi-grid-3x3-gap" />
                        </button>
                        <button
                            className={`btn btn-sm ${view === "list" ? "btn-dark" : "btn-outline-dark"}`}
                            onClick={() => {
                                setView("list");
                                // [DEBUG] view change
                                emitDebugPayload("scenarios.view.change", { to: "list" });
                            }}
                            title="List"
                        >
                            <i className="bi bi-list-ul" />
                        </button>
                    </div>

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
                                // [DEBUG] search as-you-type (ok for prototype)
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

            {/* Body — show inline empty hero when toggled, else normal content */}
            {protoEmpty ? (
                <EmptyHero />
            ) : view === "grid" ? (
                <GridView items={pageItems} gotoEdit={gotoEdit} />
            ) : (
                <ListView items={pageItems} gotoEdit={gotoEdit} />
            )}

            {/* Footer */}
            <div className="d-flex flex-wrap justify-content-between align-items-center mt-3 gap-2">
                <small className="text-secondary">
                    {total === 0 ? "No scenarios" : `1–${Math.min(page * pageSize, total)} of ${total}`}
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
                                        // [DEBUG] pagination
                                        emitDebugPayload("scenarios.page.change", { page: next });
                                    }}
                                >
                                    Prev
                                </button>
                            </li>
                            <li className={`page-item ${page === 1 ? "active" : ""}`}>
                                <button
                                    className="page-link"
                                    onClick={() => {
                                        setPage(1);
                                        emitDebugPayload("scenarios.page.change", { page: 1 });
                                    }}
                                >
                                    1
                                </button>
                            </li>
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

            {/* Floating prototype toggle (kept out of layout) */}
            <div className="position-fixed bottom-0 end-0 p-3" style={{ zIndex: 1060 }}>
                <button
                    className="btn btn-outline-dark d-inline-flex align-items-center shadow-sm"
                    onClick={() => {
                        const next = !protoEmpty;
                        setProtoEmpty(next);
                        // [DEBUG] prototype empty toggle
                        emitDebugPayload("scenarios.prototypeEmpty.toggle", { to: next });
                    }}
                    title="Prototype: toggle empty state"
                >
                    <i className="bi bi-toggle2-on me-1" />
                    {protoEmpty ? "Show sample data" : "Show empty state"}
                </button>
            </div>

            {/* [DEBUG] Mount the debug UI once per page */}
            <DebugPayloadUI />
        </div>
    );
}

/* ──────────────────────────────────────────────────────────────────────────
   Grid view
   ────────────────────────────────────────────────────────────────────────── */
function GridView({ items, gotoEdit }: { items: Scenario[]; gotoEdit: (id: string) => void }) {
    return (
        <div className="row g-3">
            {items.map((c) => (
                <div className="col-12 col-sm-6 col-lg-4 col-xxl-3" key={c.id}>
                    <ScenarioCard
                        icon={pickIcon(c)}
                        title={c.title}
                        meta={c.meta}
                        status={c.status}
                        actions={
                            <>
                                <button className="btn btn-sm btn-outline-dark flex-fill" onClick={() => gotoEdit(c.id)}>
                                    <i className="bi bi-pencil-square me-1" />
                                    Edit
                                </button>
                                <ActionsDropdown scenarioId={c.id} />
                            </>
                        }
                    />
                </div>
            ))}
            {items.length === 0 && <EmptyState />}
        </div>
    );
}

/* ──────────────────────────────────────────────────────────────────────────
   List view (Zapier-like)
   ────────────────────────────────────────────────────────────────────────── */
function ListView({ items, gotoEdit }: { items: Scenario[]; gotoEdit: (id: string) => void }) {
    return (
        <div className="card ws-card">
            <div className="table-responsive ws-table-wrap">
                <table className="table align-middle mb-0 ws-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Apps</th>
                            <th>Last modified</th>
                            <th>Status</th>
                            <th style={{ width: 60, textAlign: "right" }}>Owner</th>
                            <th style={{ width: 44 }} />
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((s) => (
                            <tr key={s.id}>
                                <td>
                                    {/* title is clickable to open editor */}
                                    <button className="btn btn-link p-0 text-start fw-semibold ws-link" onClick={() => gotoEdit(s.id)}>
                                        {s.title}
                                    </button>
                                    <div className="text-secondary small">{s.meta}</div>
                                </td>
                                <td className="text-secondary">
                                    <i className="bi bi-envelope me-1" />
                                    <i className="bi bi-hdd-stack me-1" />
                                    <i className="bi bi-diagram-3" />
                                </td>
                                <td className="text-secondary">{s.lastModified}</td>
                                <td>
                                    <div className="form-check form-switch m-0">
                                        <input
                                            className="form-check-input"
                                            type="checkbox"
                                            defaultChecked={s.status === "running"}
                                            onChange={(e) => {
                                                // [DEBUG] status toggle in list
                                                emitDebugPayload("scenarios.toggleStatus", {
                                                    scenarioId: s.id,
                                                    to: e.target.checked ? "running" : "stopped",
                                                });
                                            }}
                                        />
                                    </div>
                                </td>
                                <td className="text-end">
                                    <span className="badge rounded-circle text-bg-primary ws-owner">{s.owner}</span>
                                </td>
                                <td className="text-end">
                                    <ActionsDropdown scenarioId={s.id} />
                                </td>
                            </tr>
                        ))}
                        {items.length === 0 && (
                            <tr>
                                <td colSpan={7} className="text-center text-secondary py-5">No scenarios match your filters.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

/* ────────────────────────────────────────────────────────────────────────── */
function ActionsDropdown({ scenarioId }: { scenarioId?: string }) {
    return (
        <div className="dropdown">
            <button className="btn btn-sm btn-outline-dark" data-bs-toggle="dropdown" aria-label="More actions">
                <i className="bi bi-three-dots" />
            </button>
            <ul className="dropdown-menu dropdown-menu-end ws-menu">
                <li>
                    <button className="dropdown-item" onClick={() => emitDebugPayload("scenarios.rename.open", { scenarioId })}>
                        <i className="bi bi-pencil me-2" />Rename
                    </button>
                </li>
                <li>
                    <button className="dropdown-item" onClick={() => emitDebugPayload("scenarios.history.open", { scenarioId })}>
                        <i className="bi bi-clock-history me-2" />View history
                    </button>
                </li>
                <li>
                    <button className="dropdown-item" onClick={() => emitDebugPayload("scenarios.duplicate", { scenarioId })}>
                        <i className="bi bi-layers me-2" />Duplicate
                    </button>
                </li>
                <li>
                    <button className="dropdown-item disabled" aria-disabled="true" onClick={() => emitDebugPayload("scenarios.changeOwner.disabled", { scenarioId })}>
                        <i className="bi bi-person-gear me-2" />Change owner
                    </button>
                </li>
                <li><hr className="dropdown-divider" /></li>
                <li>
                    <button className="dropdown-item" onClick={() => emitDebugPayload("scenarios.moveToProject", { scenarioId })}>
                        <i className="bi bi-collection me-2" />Move to project
                    </button>
                </li>
                <li>
                    <button className="dropdown-item" onClick={() => emitDebugPayload("scenarios.moveToFolder", { scenarioId })}>
                        <i className="bi bi-folder-symlink me-2" />Move to folder
                    </button>
                </li>
                <li><hr className="dropdown-divider" /></li>
                <li>
                    <button className="dropdown-item text-danger" onClick={() => emitDebugPayload("scenarios.delete", { scenarioId })}>
                        <i className="bi bi-trash me-2" />Delete
                    </button>
                </li>
            </ul>
        </div>
    );
}

function EmptyHero() {
    return (
        <div className="py-4">
            <div className="text-center text-secondary mb-3">You haven't created any scenarios yet</div>
            <div className="card ws-card p-4">
                <div className="d-flex flex-column align-items-center text-center p-3">
                    {/* Icon cluster */}
                    <div className="position-relative mb-3" style={{ width: 104, height: 84 }}>
                        <div className="rounded-circle bg-primary-subtle text-primary d-flex align-items-center justify-content-center" style={{ width: 64, height: 64, position: "absolute", left: 20, top: 10 }}>
                            <i className="bi bi-plus-lg" style={{ fontSize: 28 }} />
                        </div>
                        <div className="rounded-circle bg-success-subtle text-success d-flex align-items-center justify-content-center" style={{ width: 28, height: 28, position: "absolute", left: 62, top: 0 }}>
                            <i className="bi bi-check2" />
                        </div>
                        <div className="rounded-circle bg-primary-subtle text-primary d-flex align-items-center justify-content-center" style={{ width: 36, height: 36, position: "absolute", left: 70, top: 40 }}>
                            <i className="bi bi-envelope" />
                        </div>
                    </div>

                    <h3 className="h5 fw-semibold mb-2">Create your first Scenario</h3>
                    <p className="text-secondary" style={{ maxWidth: 720 }}>
                        In order to automate your tasks, you need to create a scenario. Open the builder to create your first scenario or browse our templates for an easy start.
                    </p>

                    <div className="d-flex gap-2 mt-1">
                        <a href="#" className="btn btn-primary d-inline-flex align-items-center"
                           onClick={(e)=>{ e.preventDefault(); emitDebugPayload("scenarios.builder.open", { source: "emptyHero" }); }}>
                            <i className="bi bi-box-arrow-up-right me-1" />
                            <span>Open Scenario Builder</span>
                        </a>
                        <a href="#" className="btn btn-outline-dark d-inline-flex align-items-center"
                           onClick={(e)=>{ e.preventDefault(); emitDebugPayload("templates.browse.open", { source: "emptyHero" }); }}>
                            <i className="bi bi-grid me-1" />
                            <span>Browse Templates</span>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}

function EmptyState() {
    return (
        <div className="text-center text-secondary py-5">
            Nothing to show yet.
        </div>
    );
}

/* ────────────────────────────────────────────────────────────────────────── */
function capitalize(s: string) {
    return s.charAt(0).toUpperCase() + s.slice(1);
}
function pickIcon(s: Scenario) {
    switch (s.status) {
        case "running": return "bi-arrows-move";
        case "stopped": return "bi-bag-check";
        case "error": return "bi-exclamation-octagon";
        default: return "bi-diagram-3";
    }
}
