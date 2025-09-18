import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

/*
  Webhooks — Make/Zapier-inspired management page
  -----------------------------------------------
  - Bootstrap + Bootstrap Icons + ws-* classes (same as the rest of the portal)
  - Inline empty state hero with “Open Scenario Builder”
  - Prototype-only toggle (bottom-right) to show the empty state
*/

type HookStatus = "active" | "disabled" | "error";

type Webhook = {
    id: string;
    name: string;
    url: string;
    requests: number;        // number of recent requests or scenarios referencing
    lastUsed: string;        // e.g., "2 hours ago"
    status: HookStatus;
};

const HOOKS: Webhook[] = [
    {
        id: "whk_1",
        name: "New lead inbound",
        url: "https://api.example.com/hooks/new-lead-3f8a",
        requests: 42,
        lastUsed: "2 hours ago",
        status: "active",
    },
    {
        id: "whk_2",
        name: "Form submission",
        url: "https://api.example.com/hooks/form-sub-91ac",
        requests: 8,
        lastUsed: "yesterday",
        status: "disabled",
    },
    {
        id: "whk_3",
        name: "Error events",
        url: "https://api.example.com/hooks/err-evt-2c1e",
        requests: 0,
        lastUsed: "—",
        status: "error",
    },
];

export default function WebhooksPage() {
    const [q, setQ] = useState("");
    const [perPage, setPerPage] = useState<25 | 50 | 100>(25);
    const [protoEmpty, setProtoEmpty] = useState(false); // prototype-only

    const navigate = useNavigate();

    const items = useMemo(() => {
        let out = HOOKS.slice();
        if (q.trim()) {
            const t = q.toLowerCase();
            out = out.filter((h) => h.name.toLowerCase().includes(t) || h.url.toLowerCase().includes(t));
        }
        return out;
    }, [q]);

    const total = items.length;

    const onCreate = () => navigate("/webhooks/new");

    return (
        <div className="container-fluid py-3">
            {/* Header */}
            <div className="d-flex flex-wrap align-items-center justify-content-between mb-3 gap-2">
                <h1 className="h4 mb-0">Webhooks</h1>
                <div className="d-flex align-items-center gap-2">
                    <div className="input-group input-group-sm" style={{ minWidth: 320 }}>
                        <span className="input-group-text"><i className="bi bi-search" /></span>
                        <input className="form-control" placeholder="Search" value={q} onChange={(e) => setQ(e.target.value)} />
                    </div>
                    <button className="btn btn-primary px-3 d-inline-flex align-items-center text-nowrap" onClick={onCreate}>
                        <i className="bi bi-plus-lg me-1" /> Create webhook
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
                                    <th>URL</th>
                                    <th>Requests</th>
                                    <th>Last used</th>
                                    <th>Status</th>
                                    <th style={{ width: 44 }} />
                                </tr>
                            </thead>
                            <tbody>
                                {items.map((h) => (
                                    <tr key={h.id}>
                                        <td className="fw-semibold">{h.name}</td>
                                        <td className="text-truncate" style={{ maxWidth: 420 }}>
                                            <code className="small">{h.url}</code>
                                            <button className="btn btn-sm btn-link ms-2 p-0 align-baseline" onClick={() => copy(h.url)} title="Copy URL">
                                                <i className="bi bi-clipboard" />
                                            </button>
                                        </td>
                                        <td className="text-secondary">{h.requests}</td>
                                        <td className="text-secondary">{h.lastUsed}</td>
                                        <td>
                                            <StatusPill status={h.status} />
                                        </td>
                                        <td className="text-end"><RowMenu /></td>
                                    </tr>
                                ))}
                                {items.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="text-center text-secondary py-5">No webhooks match your search.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Footer */}
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

            {/* Floating prototype toggle */}
            <div className="position-fixed bottom-0 end-0 p-3" style={{ zIndex: 1060 }}>
                <button className="btn btn-outline-dark d-inline-flex align-items-center shadow-sm" onClick={() => setProtoEmpty((p) => !p)}>
                    <i className="bi bi-toggle2-on me-1" /> {protoEmpty ? "Show list" : "Show empty state"}
                </button>
            </div>
        </div>
    );
}

/* ────────────────────────────────────────────────────────────────────────── */
function StatusPill({ status }: { status: HookStatus }) {
    const label = status === "active" ? "Active" : status === "disabled" ? "Disabled" : "Error";
    const icon = status === "active" ? "bi-check-circle" : status === "disabled" ? "bi-slash-circle" : "bi-exclamation-triangle";
    const color = status === "active" ? "bg-light text-success border" : status === "disabled" ? "bg-light text-secondary border" : "bg-light text-danger border";
    return <span className={`badge rounded-pill ${color}`}><i className={`bi ${icon} me-1`} />{label}</span>;
}

function RowMenu() {
    return (
        <div className="dropdown">
            <button className="btn btn-sm btn-outline-dark" data-bs-toggle="dropdown" aria-label="More actions">
                <i className="bi bi-three-dots" />
            </button>
            <ul className="dropdown-menu dropdown-menu-end ws-menu">
                <li><button className="dropdown-item"><i className="bi bi-clipboard me-2" />Copy URL</button></li>
                <li><button className="dropdown-item"><i className="bi bi-journal-text me-2" />View logs</button></li>
                <li><button className="dropdown-item"><i className="bi bi-pencil me-2" />Edit</button></li>
                <li><button className="dropdown-item"><i className="bi bi-shield-lock me-2" />Rotate secret</button></li>
                <li><hr className="dropdown-divider" /></li>
                <li><button className="dropdown-item text-danger"><i className="bi bi-trash me-2" />Delete</button></li>
            </ul>
        </div>
    );
}

function EmptyHero() {
    return (
        <div className="py-4">
            <div className="text-center text-secondary mb-3">You haven't created any webhooks yet</div>
            <div className="card ws-card p-4">
                <div className="d-flex flex-column align-items-center text-center p-3">
                    <div className="rounded-circle bg-danger-subtle text-danger d-flex align-items-center justify-content-center mb-3" style={{ width: 88, height: 88 }}>
                        <i className="bi bi-diagram-3" style={{ fontSize: 36 }} />
                    </div>
                    <h3 className="h5 fw-semibold mb-2">Send data to trigger scenarios instantly</h3>
                    <p className="text-secondary" style={{ maxWidth: 760 }}>
                        Webhooks let you send data to this workspace over HTTP by calling a unique URL from an external app or service, or from another scenario. Use the webhook module inside the Scenario Builder to create a trigger.
                    </p>
                    <a href="#" className="btn btn-primary d-inline-flex align-items-center">
                        <i className="bi bi-box-arrow-up-right me-1" /> Open Scenario Builder
                    </a>
                    <div className="mt-3">
                        <a href="#" className="link-primary text-decoration-none">Learn more about using <span className="fw-semibold">Webhooks</span></a>
                    </div>
                </div>
            </div>
        </div>
    );
}

/* utils */
function copy(text: string) {
    try {
        navigator.clipboard?.writeText(text);
    } catch (e) {
        // noop for prototype
    }
}
