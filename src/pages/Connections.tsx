import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

/*
  App Connections — Zapier-inspired table
  --------------------------------------
  - Bootstrap + Bootstrap Icons + ws-* classes (same design language as the portal)
  - No Apps tab; this page lists only connections
  - Includes a prototype-only "Show empty state" toggle (bottom-right)
*/

type Connection = {
    id: string;
    name: string;            // display name (e.g., account or bot)
    sub: string;             // secondary line, usually email/handle
    app: string;             // app name
    appVersion: string;      // version string
    scenarios: number;            // number of scenarios using this connection
    lastModified: string;    // e.g., "1 day ago"
    people: string[];        // initials of members with access
    brand: "telegram" | "sheets" | "gmail";
};

const ROWS: Connection[] = [
    { id: "c1", name: "Team Alerts Bot (@TeamAlerts01_bot)", sub: "TeamAlerts01_bot", app: "Telegram", appVersion: "1.3.1", scenarios: 1, lastModified: "1 day ago", people: ["BC"], brand: "telegram" },
    { id: "c2", name: "benny.cheung@seamlessgroup.com", sub: "benny.cheung@seamlessgroup.com", app: "Google Sheets", appVersion: "2.8.0", scenarios: 2, lastModified: "1 day ago", people: ["BC"], brand: "sheets" },
    { id: "c3", name: "g10260556001@gmail.com", sub: "g10260556001@gmail.com", app: "Gmail", appVersion: "2.5.1", scenarios: 1, lastModified: "1 day ago", people: ["BC"], brand: "gmail" },
];

export default function Connections() {
    const [q, setQ] = useState("");
    const [scope, setScope] = useState("All connections");
    const [perPage, setPerPage] = useState<25 | 50 | 100>(25);
    const [protoEmpty, setProtoEmpty] = useState(false); // prototype-only toggle

    const navigate = useNavigate();

    const items = useMemo(() => {
        let out = ROWS.slice();
        if (q.trim()) {
            const t = q.toLowerCase();
            out = out.filter(r => r.name.toLowerCase().includes(t) || r.sub.toLowerCase().includes(t) || r.app.toLowerCase().includes(t));
        }
        // scope is a placeholder for now; no-op
        return out;
    }, [q, scope]);

    const total = items.length;

    const onAdd = () => navigate("/connections/new");

    return (
        <div className="container-fluid py-3">
            {/* Header */}
            <div className="d-flex flex-wrap align-items-center justify-content-between mb-3 gap-2">
                <div className="d-flex align-items-center gap-2">
                    <h1 className="h4 mb-0">App Connections</h1>

                    {/* Scope select (placeholder) */}
                    <div className="dropdown">
                        <button className="btn btn-outline-dark btn-sm dropdown-toggle" data-bs-toggle="dropdown">
                            {scope}
                        </button>
                        <ul className="dropdown-menu">
                            {(["All connections", "Owned by me", "Shared with me", "Needs attention"] as const).map(opt => (
                                <li key={opt}><button className="dropdown-item" onClick={() => setScope(opt)}>{opt}</button></li>
                            ))}
                        </ul>
                    </div>

                    {/* Filters (placeholder) */}
                    <div className="dropdown">
                        <button className="btn btn-outline-dark btn-sm d-inline-flex align-items-center" data-bs-toggle="dropdown">
                            <i className="bi bi-funnel me-1" /> Filters
                        </button>
                        <ul className="dropdown-menu">
                            <li className="dropdown-header">Status</li>
                            <li><button className="dropdown-item">Verified</button></li>
                            <li><button className="dropdown-item">Needs reauth</button></li>
                            <li><hr className="dropdown-divider" /></li>
                            <li className="dropdown-header">Access</li>
                            <li><button className="dropdown-item">Only me</button></li>
                            <li><button className="dropdown-item">Shared</button></li>
                        </ul>
                    </div>
                </div>

                <div className="d-flex align-items-center gap-2">
                    <div className="input-group input-group-sm" style={{ minWidth: 320 }}>
                        <span className="input-group-text"><i className="bi bi-search" /></span>
                        <input className="form-control" placeholder="Search by name" value={q} onChange={(e) => setQ(e.target.value)} />
                    </div>

                    <button className="btn btn-primary px-3 d-inline-flex align-items-center text-nowrap" onClick={onAdd}>
                        <i className="bi bi-plus-lg me-1" /> Add connection
                    </button>
                </div>
            </div>

            {/* Body */}
            {protoEmpty ? (
                <EmptyHero />
            ) : (
                <div className="card ws-card">
                    <div className="table-responsive ws-table-wrap">
                        <table className="table align-middle mb-0 ws-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>App</th>
                                    <th>Scenarios</th>
                                    <th>Last modified</th>
                                    <th>People with access</th>
                                    <th style={{ width: 44 }} />
                                </tr>
                            </thead>
                            <tbody>
                                {items.map((r) => (
                                    <tr key={r.id}>
                                        <td>
                                            <div className="d-flex align-items-center gap-2">
                                                {brandBadge(r.brand)}
                                                <div>
                                                    <div className="fw-semibold">{r.name}</div>
                                                    <div className="text-secondary small">{r.sub}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="text-secondary">
                                            {r.app}
                                            <div className="small">{r.appVersion}</div>
                                        </td>
                                        <td className="text-secondary">
                                            <i className="bi bi-diagram-3 me-1" /> {r.scenarios}
                                        </td>
                                        <td className="text-secondary">{r.lastModified}</td>
                                        <td>
                                            <div className="d-flex align-items-center gap-1">
                                                {r.people.map((p) => (
                                                    <span key={p} className="badge rounded-circle text-bg-primary ws-owner">{p}</span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="text-end">
                                            <RowMenu />
                                        </td>
                                    </tr>
                                ))}
                                {items.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="text-center text-secondary py-5">No connections match your filters.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Footer strip */}
                    <div className="d-flex justify-content-between align-items-center px-3 py-2 border-top">
                        <small className="text-secondary">{total === 0 ? "0 results" : `1–${Math.min(perPage, total)} of ${total}`}</small>
                        <div className="dropdown">
                            <button className="btn btn-sm btn-outline-dark dropdown-toggle" data-bs-toggle="dropdown">{perPage} per page</button>
                            <ul className="dropdown-menu dropdown-menu-end">
                                {[25, 50, 100].map((n) => (
                                    <li key={n}><button className="dropdown-item" onClick={() => setPerPage(n as 25 | 50 | 100)}>{n} per page</button></li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            )}

            {/* Floating prototype toggle (kept out of design) */}
            <div className="position-fixed bottom-0 end-0 p-3" style={{ zIndex: 1060 }}>
                <button className="btn btn-outline-dark d-inline-flex align-items-center shadow-sm" onClick={() => setProtoEmpty((p) => !p)}>
                    <i className="bi bi-toggle2-on me-1" /> {protoEmpty ? "Show sample data" : "Show empty state"}
                </button>
            </div>
        </div>
    );
}

/* ────────────────────────────────────────────────────────────────────────── */
function brandBadge(brand: Connection["brand"]) {
    const base = "d-inline-flex align-items-center justify-content-center rounded me-2";
    if (brand === "telegram") return <span className={`${base}`} style={{ width: 32, height: 32, background: "#229ED9" }}><i className="bi bi-send text-white" /></span>;
    if (brand === "sheets") return <span className={`${base}`} style={{ width: 32, height: 32, background: "#0F9D58" }}><i className="bi bi-table text-white" /></span>;
    return <span className={`${base}`} style={{ width: 32, height: 32, background: "#EA4335" }}><i className="bi bi-envelope-fill text-white" /></span>;
}

function RowMenu() {
    return (
        <div className="dropdown">
            <button className="btn btn-sm btn-outline-dark" data-bs-toggle="dropdown" aria-label="More actions">
                <i className="bi bi-three-dots" />
            </button>
            <ul className="dropdown-menu dropdown-menu-end ws-menu">
                <li><button className="dropdown-item"><i className="bi bi-pencil me-2" />Rename</button></li>
                <li><button className="dropdown-item"><i className="bi bi-lightbulb me-2" />Discover use cases</button></li>
                <li><button className="dropdown-item"><i className="bi bi-patch-check me-2" />Test connection</button></li>
                <li><button className="dropdown-item"><i className="bi bi-arrow-repeat me-2" />Replace connection</button></li>
                <li><button className="dropdown-item"><i className="bi bi-person-gear me-2" />Change owner</button></li>
                <li><hr className="dropdown-divider" /></li>
                <li><button className="dropdown-item text-danger"><i className="bi bi-trash me-2" />Delete</button></li>
            </ul>
        </div>
    );
}

function EmptyHero() {
    return (
        <div className="py-4">
            <div className="text-center text-secondary mb-3">You haven't added any connections yet</div>
            <div className="card ws-card p-4">
                <div className="d-flex flex-column align-items-center text-center p-3">
                    {/* Icon + headline */}
                    <div className="rounded-circle bg-primary-subtle text-primary d-flex align-items-center justify-content-center mb-3" style={{ width: 72, height: 72 }}>
                        <i className="bi bi-link-45deg" style={{ fontSize: 32 }} />
                    </div>
                    <h3 className="h5 fw-semibold mb-2">Connect your apps</h3>
                    <p className="text-secondary" style={{ maxWidth: 720 }}>
                        Connections let you securely link external apps to your automations. Add a connection to get started.
                    </p>
                    <div className="d-flex gap-2 mt-1">
                        <a href="#" className="btn btn-primary d-inline-flex align-items-center"><i className="bi bi-plus-lg me-1" /> Add connection</a>
                        <a href="#" className="btn btn-outline-dark d-inline-flex align-items-center"><i className="bi bi-journal-text me-1" /> Learn more</a>
                    </div>
                </div>
            </div>
        </div>
    );
}
