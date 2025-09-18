import { useMemo, useState } from "react";

/*
  DataStores — Zapier/Make-inspired data stores hub
  -------------------------------------------------
  - Follows the same Bootstrap+Icons + "ws-*" design language used in Scenarios/Templates
  - Route already wired in App.tsx at "/data-stores"
*/

type StoreType = "Table" | "Key-Value" | "Vector DB" | "File";

type Store = {
    id: string;
    name: string;
    type: StoreType;
    records: number;            // e.g., rows / keys / vectors / files count
    source?: string;            // e.g., "Internal", "Google Sheets", "Airtable", "S3"
    lastUpdated: string;        // e.g., "2 hours ago"
    status: "ready" | "syncing" | "error";
    owner: string;              // initials for badge
};

const ALL_STORES: Store[] = [
    { id: "s1", name: "Customer Contacts", type: "Table", records: 1243, source: "Internal", lastUpdated: "2 hours ago", status: "ready", owner: "BC" },
    { id: "s2", name: "Product Catalog", type: "Table", records: 312, source: "Airtable", lastUpdated: "yesterday", status: "ready", owner: "BC" },
    { id: "s3", name: "KV Cache (OpenAI)", type: "Key-Value", records: 9821, source: "Internal", lastUpdated: "5 min ago", status: "syncing", owner: "BC" },
    { id: "s4", name: "Embeddings - Docs", type: "Vector DB", records: 154_200, source: "Internal", lastUpdated: "3 days ago", status: "ready", owner: "BC" },
    { id: "s5", name: "File Drop (S3)", type: "File", records: 87, source: "S3", lastUpdated: "1 hour ago", status: "error", owner: "BC" },
];

const TYPES: ("All" | StoreType)[] = ["All", "Table", "Key-Value", "Vector DB", "File"];

export default function DataStores() {
    const [view, setView] = useState<"grid" | "list">("list");
    const [q, setQ] = useState("");
    const [typeFilter, setTypeFilter] = useState<(typeof TYPES)[number]>("All");
    const [sort, setSort] = useState<"Recently updated" | "Name A–Z" | "Record count">("Recently updated");
    const [protoEmpty, setProtoEmpty] = useState(false);

    const items = useMemo(() => {
        let out = ALL_STORES.slice();
        if (q.trim()) {
            const t = q.toLowerCase();
            out = out.filter(s => s.name.toLowerCase().includes(t) || (s.source ?? "").toLowerCase().includes(t));
        }
        if (typeFilter !== "All") out = out.filter(s => s.type === typeFilter);
        if (sort === "Name A–Z") out.sort((a, b) => a.name.localeCompare(b.name));
        if (sort === "Record count") out.sort((a, b) => b.records - a.records);
        // "Recently updated" is default (pretend current order already reflects it)
        return out;
    }, [q, typeFilter, sort]);

    const total = items.length;

    return (
        <div className="container-fluid py-3">
            {/* Header strip */}
            <div className="d-flex flex-wrap align-items-center justify-content-between mb-3 gap-2">
                <div className="d-flex align-items-center gap-2">
                    <h1 className="h4 mb-0">Data Stores</h1>

                    {/* Type filter */}
                    <div className="dropdown">
                        <button className="btn btn-outline-dark btn-sm dropdown-toggle" data-bs-toggle="dropdown">
                            <i className="bi bi-filter me-1" />
                            {typeFilter === "All" ? "All types" : typeFilter}
                        </button>
                        <ul className="dropdown-menu">
                            {TYPES.map(t => (
                                <li key={t}>
                                    <button className="dropdown-item" onClick={() => setTypeFilter(t)}>
                                        {t === "All" ? "All types" : t}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Sort */}
                    <div className="dropdown">
                        <button className="btn btn-outline-dark btn-sm dropdown-toggle" data-bs-toggle="dropdown">
                            <i className="bi bi-sort-down me-1" />
                            {sort}
                        </button>
                        <ul className="dropdown-menu">
                            {(["Recently updated", "Name A–Z", "Record count"] as const).map(s => (
                                <li key={s}><button className="dropdown-item" onClick={() => setSort(s)}>{s}</button></li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Right side: view toggle + search + create */}
                <div className="d-flex align-items-center gap-2">
                    <div className="btn-group" role="group" aria-label="View">
                        <button
                            className={`btn btn-sm ${view === "grid" ? "btn-dark" : "btn-outline-dark"}`}
                            onClick={() => setView("grid")}
                            title="Grid"
                        >
                            <i className="bi bi-grid-3x3-gap" />
                        </button>
                        <button
                            className={`btn btn-sm ${view === "list" ? "btn-dark" : "btn-outline-dark"}`}
                            onClick={() => setView("list")}
                            title="List"
                        >
                            <i className="bi bi-list-ul" />
                        </button>
                    </div>

                    <div className="input-group input-group-sm" style={{ minWidth: 320 }}>
                        <span className="input-group-text"><i className="bi bi-search" /></span>
                        <input
                            className="form-control"
                            placeholder="Search by name or source"
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                        />
                    </div>

                    <button className="btn btn-primary px-4 d-inline-flex align-items-center text-nowrap">
                        <i className="bi bi-plus-lg me-1" />
                        Add Data Store
                    </button>
                </div>
            </div>

            {/* Body */}
            {protoEmpty || items.length === 0 ? (
                <EmptyHero />
            ) : view === "grid" ? (
                <GridView items={items} />
            ) : (
                <ListView items={items} />
            )}

            {/* Footer */}
            <div className="d-flex flex-wrap justify-content-between align-items-center mt-3 gap-2">
                <small className="text-secondary">{total === 0 ? "No data stores" : `${total} data store${total === 1 ? "" : "s"}`}</small>
            </div>
            <div className="position-fixed bottom-0 end-0 p-3" style={{ zIndex: 1060 }}>
                <button className="btn btn-outline-dark d-inline-flex align-items-center shadow-sm" onClick={() => setProtoEmpty(p => !p)} title="Prototype: toggle empty state">
                    <i className="bi bi-toggle2-on me-1" />
                    {protoEmpty ? "Show sample data" : "Show empty state"}
                </button>
            </div>
        </div>
    );
}

/* ──────────────────────────────────────────────────────────────────────────
   Grid view — Make.com-style cards
   ────────────────────────────────────────────────────────────────────────── */
function GridView({ items }: { items: Store[] }) {
    return (
        <div className="row g-3">
            {items.map((s) => (
                <div className="col-12 col-sm-6 col-lg-4 col-xxl-3" key={s.id}>
                    <div className="card ws-card h-100">
                        <div className="card-body d-flex flex-column">
                            {/* Name & type */}
                            <div className="d-flex justify-content-between align-items-start mb-2">
                                <div>
                                    <div className="d-flex align-items-center gap-2">
                                        <i className={`bi ${iconForType(s.type)} text-secondary`} />
                                        <h2 className="h6 mb-0">{s.name}</h2>
                                    </div>
                                    <div className="text-secondary small">
                                        {s.type} · {formatRecords(s.records)}
                                        {s.source ? ` · ${s.source}` : ""}
                                    </div>
                                </div>
                                <StatusPill status={s.status} />
                            </div>

                            {/* meta */}
                            <p className="text-secondary small mb-3">Updated {s.lastUpdated}</p>

                            {/* actions */}
                            <div className="d-flex align-items-center gap-2 mt-auto">
                                <button className="btn btn-sm btn-outline-dark flex-fill">
                                    <i className="bi bi-box-arrow-up-right me-1" /> Open
                                </button>
                                <div className="dropdown">
                                    <button className="btn btn-sm btn-outline-dark" data-bs-toggle="dropdown" aria-label="More">
                                        <i className="bi bi-three-dots" />
                                    </button>
                                    <ul className="dropdown-menu dropdown-menu-end ws-menu">
                                        <li><button className="dropdown-item"><i className="bi bi-arrow-repeat me-2" />Sync now</button></li>
                                        <li><button className="dropdown-item"><i className="bi bi-gear me-2" />Settings</button></li>
                                        <li><hr className="dropdown-divider" /></li>
                                        <li><button className="dropdown-item text-danger"><i className="bi bi-trash me-2" />Delete</button></li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
            {items.length === 0 && <EmptyState />}
        </div>
    );
}

/* ──────────────────────────────────────────────────────────────────────────
   List view — Zapier-style table
   ────────────────────────────────────────────────────────────────────────── */
function ListView({ items }: { items: Store[] }) {
    return (
        <div className="card ws-card">
            <div className="table-responsive ws-table-wrap">
                <table className="table align-middle mb-0 ws-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Type</th>
                            <th>Records</th>
                            <th>Source</th>
                            <th>Last updated</th>
                            <th>Status</th>
                            <th style={{ width: 60, textAlign: "right" }}>Owner</th>
                            <th style={{ width: 44 }} />
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((s) => (
                            <tr key={s.id}>
                                <td>
                                    <div className="d-flex align-items-center gap-2">
                                        <i className={`bi ${iconForType(s.type)} text-secondary`} />
                                        <button className="btn btn-link p-0 text-start fw-semibold ws-link">{s.name}</button>
                                    </div>
                                </td>
                                <td className="text-secondary">{s.type}</td>
                                <td className="text-secondary">{formatRecords(s.records)}</td>
                                <td className="text-secondary">{s.source ?? "—"}</td>
                                <td className="text-secondary">{s.lastUpdated}</td>
                                <td><StatusPill status={s.status} /></td>
                                <td className="text-end"><span className="badge rounded-circle text-bg-primary ws-owner">{s.owner}</span></td>
                                <td className="text-end">
                                    <div className="dropdown">
                                        <button className="btn btn-sm btn-outline-dark" data-bs-toggle="dropdown" aria-label="More actions">
                                            <i className="bi bi-three-dots" />
                                        </button>
                                        <ul className="dropdown-menu dropdown-menu-end ws-menu">
                                            <li><button className="dropdown-item"><i className="bi bi-box-arrow-up-right me-2" />Open</button></li>
                                            <li><button className="dropdown-item"><i className="bi bi-arrow-repeat me-2" />Sync now</button></li>
                                            <li><button className="dropdown-item"><i className="bi bi-gear me-2" />Settings</button></li>
                                            <li><hr className="dropdown-divider" /></li>
                                            <li><button className="dropdown-item text-danger"><i className="bi bi-trash me-2" />Delete</button></li>
                                        </ul>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {items.length === 0 && (
                            <tr>
                                <td colSpan={8} className="text-center text-secondary py-5">No data stores match your filters.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function EmptyHero() {
    return (
        <div className="py-4">
            <div className="text-center text-secondary mb-3">You haven't added any data stores yet</div>
            <div className="card ws-card p-4">
                <div className="d-flex flex-column align-items-center text-center p-3">
                    <div className="rounded-circle bg-primary-subtle text-primary d-flex align-items-center justify-content-center mb-3" style={{ width: 88, height: 88 }}>
                        <i className="bi bi-database" style={{ fontSize: 36 }} />
                    </div>
                    <h3 className="h5 fw-semibold mb-2">Achieve more with built-in data storage</h3>
                    <p className="text-secondary" style={{ maxWidth: 720 }}>
                        Data stores are built-in databases inside this workspace that store and read information within a scenario, but also between multiple scenarios. <strong>Click 'Add Data Store'</strong> in the top-right corner to create a data store.
                    </p>
                    <a className="link-primary text-decoration-none" href="#" onClick={(e) => e.preventDefault()}>Learn more about using <span className="fw-semibold">Data Stores</span></a>
                </div>
            </div>
        </div>
    );
}

function EmptyState() {
    return (
        <div className="text-center text-secondary py-5">Nothing to show yet.</div>
    );
}

function StatusPill({ status }: { status: Store["status"] }) {
    const label = status === "ready" ? "Ready" : status === "syncing" ? "Syncing" : "Error";
    const icon = status === "ready" ? "bi-check-circle" : status === "syncing" ? "bi-arrow-repeat" : "bi-exclamation-triangle";
    const color = status === "ready" ? "bg-light text-success border" : status === "syncing" ? "bg-light text-primary border" : "bg-light text-danger border";
    return <span className={`badge rounded-pill ${color}`}><i className={`bi ${icon} me-1`} />{label}</span>;
}

/* utils */
function iconForType(t: StoreType) {
    switch (t) {
        case "Table": return "bi-table";
        case "Key-Value": return "bi-hdd-stack";
        case "Vector DB": return "bi-diagram-3";
        case "File": return "bi-file-earmark";
    }
}
function formatRecords(n: number) {
    if (n < 1000) return `${n}`;
    if (n < 10000) return `${(n / 1000).toFixed(1)}k`;
    if (n < 1_000_000) return `${Math.round(n / 1000)}k`;
    return `${(n / 1_000_000).toFixed(1)}M`;
}
