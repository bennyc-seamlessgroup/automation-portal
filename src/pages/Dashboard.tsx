import { useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";

// ──────────────────────────────────────────────────────────────
// Dummy data – wire up later
// ──────────────────────────────────────────────────────────────
const recentScenarios = [
  { id: "1", title: "Weekly Email Summary", meta: "Every Mon 9:00 · 3 modules", status: "running" as const, owner: "BC", updatedAt: "2h ago" },
  { id: "2", title: "Lead → CRM Sync", meta: "On New Form · 5 modules", status: "stopped" as const, owner: "BC", updatedAt: "Yesterday" },
];

const quickLinks = [
  { label: "Create Scenario", to: "/scenarios/new", description: "Canvas builder for drag, drop & connect", icon: "bi-plus-circle" },
  { label: "Templates", to: "/templates", description: "Start fast with ready-made flows", icon: "bi-grid" },
  { label: "Connections", to: "/connections", description: "Connect Google, Slack, Stripe, more", icon: "bi-plug" },
  { label: "Webhooks", to: "/webhooks", description: "Catch external events to trigger flows", icon: "bi-link-45deg" },
];

const statusToBadge = (s: "running" | "stopped" | "error") => {
  if (s === "running") return <span className="badge rounded-pill bg-success">Running</span>;
  if (s === "stopped") return <span className="badge rounded-pill bg-secondary">Stopped</span>;
  return <span className="badge rounded-pill bg-danger">Error</span>;
};

export default function Dashboard() {
  const navigate = useNavigate();

  // New: guided onboarding input
  const [mode, setMode] = useState<"business" | "personal">("business");
  const [brief, setBrief] = useState("");
  const [role, setRole] = useState("");

  const suggestions = useMemo(
    () => (
      mode === "business"
        ? ["HR recruiting agency", "E‑commerce brand (Shopify)", "Real‑estate team", "Marketing agency", "Fintech ops"]
        : ["Personal finance assistant", "Travel planner", "Email clean‑up bot", "Family reminders", "Content writing buddy"]
    ),
    [mode]
  );

  const onGenerate = () => {
    // In the future: call your AI endpoint with { mode, brief, role }
    // For now, persist locally and jump to Templates where you can prefilter.
    try {
      localStorage.setItem("ap.dashboard.intent", JSON.stringify({ mode, brief, role, ts: Date.now() }));
    } catch {}
    navigate("/templates");
  };

  return (
    <div className="container-fluid py-3">
      {/* Welcome + Primary action */}
      <div className="card ws-card mb-3">
        <div className="p-3 p-md-4">
          <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-3">
            <div>
              <div className="d-inline-flex align-items-center gap-2 mb-1">
                <span className="badge rounded-pill bg-primary-subtle text-primary"><i className="bi bi-stars me-1"/>Welcome</span>
              </div>
              <h1 className="h4 mb-1">What should we automate?</h1>
              <div className="text-secondary">Tell us your use case and we’ll tailor templates, connections, and a starter scenario for you.</div>
            </div>
          </div>

          {/* Mode toggle */}
          <div className="btn-group mb-3" role="group" aria-label="Mode">
            <button
              className={`btn btn-sm ${mode === "business" ? "btn-dark" : "btn-outline-dark"}`}
              onClick={() => setMode("business")}
            >
              <i className="bi bi-briefcase me-1"/> Business
            </button>
            <button
              className={`btn btn-sm ${mode === "personal" ? "btn-dark" : "btn-outline-dark"}`}
              onClick={() => setMode("personal")}
            >
              <i className="bi bi-person me-1"/> Personal assistant
            </button>
          </div>

          {/* Intent input */}
          <div className="row g-3">
            {mode === "business" && (
              <div className="col-12 col-lg-4">
                <label className="form-label small text-secondary">Your role / team (optional)</label>
                <input
                  className="form-control"
                  placeholder="e.g., HR at a staffing firm"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                />
              </div>
            )}
            <div className="col-12 col-lg-8">
              <label className="form-label small text-secondary">Describe your needs</label>
              <textarea
                className="form-control"
                rows={mode === "business" ? 3 : 3}
                placeholder={
                  mode === "business"
                    ? "We want to parse incoming resumes, summarize with AI, send shortlist to Slack, and update a Google Sheet."
                    : "I want an assistant that files bills to a folder, summarizes emails daily, and reminds me of deadlines."
                }
                value={brief}
                onChange={(e) => setBrief(e.target.value)}
              />
              <div className="d-flex flex-wrap gap-2 mt-2">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    className="btn btn-light btn-sm"
                    onClick={() => setBrief((b) => (b ? `${b} ${s}` : s))}
                  >
                    <i className="bi bi-journal-plus me-1"/>{s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="d-flex flex-wrap align-items-center gap-2 mt-3">
            <button className="btn btn-primary" onClick={onGenerate}>
              <i className="bi bi-magic me-1"/> Generate tailored templates
            </button>
            <button className="btn btn-outline-dark" onClick={() => navigate("/scenarios/new")}>Open canvas</button>
            <small className="text-secondary">No setup yet — this only helps customize recommendations.</small>
          </div>
        </div>
      </div>

      {/* Quick links */}
      <section className="mb-3">
        <div className="row g-3">
          {quickLinks.map((q) => (
            <div className="col-12 col-sm-6 col-xl-3" key={q.label}>
              <div className="card ws-card h-100 hover-shadow" role="button" onClick={() => navigate(q.to)}>
                <div className="card-body d-flex align-items-start gap-3">
                  <div className="rounded-3 bg-light text-primary d-inline-flex align-items-center justify-content-center" style={{ width: 36, height: 36 }}>
                    <i className={`bi ${q.icon}`} />
                  </div>
                  <div className="flex-grow-1">
                    <div className="fw-semibold mb-1">{q.label}</div>
                    <div className="text-secondary small">{q.description}</div>
                  </div>
                  <i className="bi bi-chevron-right text-secondary ms-auto" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Recent scenarios */}
      <section>
        <div className="card ws-card">
          <div className="p-3 p-md-3 d-flex align-items-center justify-content-between">
            <div className="h6 mb-0">Recent scenarios</div>
            <button className="btn btn-outline-dark btn-sm" onClick={() => navigate("/scenarios")}>
              View all
            </button>
          </div>
          <div className="list-group list-group-flush">
            {recentScenarios.map((s) => (
              <div key={s.id} className="list-group-item d-flex align-items-center gap-3">
                <span className="badge rounded-circle text-bg-primary" style={{ width: 32, height: 32, lineHeight: "18px", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>{s.owner}</span>
                <div className="flex-grow-1">
                  <div className="fw-semibold">{s.title}</div>
                  <div className="text-secondary small">{s.meta}</div>
                </div>
                <div className="d-none d-md-block me-2">{statusToBadge(s.status)}</div>
                <div className="text-secondary small d-none d-sm-block me-3">{s.updatedAt}</div>
                <div className="btn-group">
                  <button className="btn btn-sm btn-outline-dark" onClick={() => navigate(`/scenarios/${s.id}/edit`)}>Open</button>
                  {s.status !== "running" ? (
                    <button className="btn btn-sm btn-primary">Run</button>
                  ) : (
                    <button className="btn btn-sm btn-danger">Stop</button>
                  )}
                </div>
              </div>
            ))}
            {recentScenarios.length === 0 && (
              <div className="list-group-item text-center text-secondary py-4">No recent activity yet.</div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
