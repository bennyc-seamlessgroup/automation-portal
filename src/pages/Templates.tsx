import { useMemo, useState } from "react";

type Template = {
    id: string;
    title: string;
    summary: string;
    apps: string[];       // ids from APPS
    tags: string[];       // categories
    badge?: "New" | "Popular" | "Featured";
    runs?: string;        // social proof (e.g., "12k+ used")
    image?: string;       // optional hero/cover (placeholder here)
};

const APPS = [
    { id: "openai", name: "OpenAI", icon: "bi-cpu" },
    { id: "sheets", name: "Google Sheets", icon: "bi-table" },
    { id: "gmail", name: "Gmail", icon: "bi-envelope" },
    { id: "slack", name: "Slack", icon: "bi-slack" },
    { id: "webhook", name: "Webhooks", icon: "bi-rss" },
];

const CATEGORIES = [
    "All", "AI & Content", "CRM", "Marketing", "Support", "E-commerce", "Files",
    "Spreadsheets", "Messaging", "Dev & Webhooks"
];

const TEMPLATES: Template[] = [
    {
        id: "t1",
        title: "Generate blog outline from prompt and save to Google Sheets",
        summary: "Turn ideas into structured outlines and log them in Sheets.",
        apps: ["openai", "sheets"],
        tags: ["AI & Content", "Spreadsheets"],
        badge: "Featured",
        runs: "8.2k used"
    },
    {
        id: "t2",
        title: "Email new form submissions and add to Sheets",
        summary: "When a form is submitted, send an email and keep a record.",
        apps: ["gmail", "sheets"],
        tags: ["Marketing", "Spreadsheets"],
        badge: "Popular",
        runs: "12k used"
    },
    {
        id: "t3",
        title: "Summarize support tickets and notify Slack",
        summary: "Auto-summarize tickets and alert a channel.",
        apps: ["openai", "slack"],
        tags: ["AI & Content", "Support", "Messaging"],
        badge: "New",
        runs: "2.1k used"
    },
    {
        id: "t4",
        title: "Catch webhook and append to Google Sheets",
        summary: "Ingest events from anywhere via webhook and store rows.",
        apps: ["webhook", "sheets"],
        tags: ["Dev & Webhooks", "Spreadsheets"],
        runs: "5.4k used"
    },
    {
        id: "t5",
        title: "Draft reply emails with AI",
        summary: "Auto-draft responses for incoming emails you can approve.",
        apps: ["gmail", "openai"],
        tags: ["AI & Content", "Support"],
        badge: "Popular",
        runs: "9.7k used"
    },
];

type Tab = "Featured" | "Popular" | "New";

export default function Templates() {
    const [q, setQ] = useState("");
    const [tab, setTab] = useState<Tab>("Featured");
    const [appFilter, setAppFilter] = useState<string>("All");
    const [catFilter, setCatFilter] = useState<string>("All");
    const [sort, setSort] = useState<"Relevance" | "Most used" | "Newest">("Relevance");
    const [preview, setPreview] = useState<Template | null>(null);

    const filtered = useMemo(() => {
        let out = TEMPLATES.slice();

        // tab gates
        if (tab === "Featured") out = out.filter(t => t.badge === "Featured" || t.badge === "Popular" || t.badge === "New");
        if (tab === "Popular") out = out.filter(t => t.badge === "Popular");
        if (tab === "New") out = out.filter(t => t.badge === "New");

        // search
        if (q.trim()) {
            const t = q.toLowerCase();
            out = out.filter(tpl =>
                tpl.title.toLowerCase().includes(t) ||
                tpl.summary.toLowerCase().includes(t) ||
                tpl.tags.join(" ").toLowerCase().includes(t)
            );
        }

        // filters
        if (appFilter !== "All") out = out.filter(t => t.apps.includes(appFilter));
        if (catFilter !== "All") out = out.filter(t => t.tags.includes(catFilter));

        // sort (simple client sort)
        if (sort === "Most used") {
            out.sort((a, b) => numUsed(b.runs) - numUsed(a.runs));
        } else if (sort === "Newest") {
            out.sort((a, b) => (b.badge === "New" ? 1 : 0) - (a.badge === "New" ? 1 : 0));
        }

        return out;
    }, [q, tab, appFilter, catFilter, sort]);

    return (
        <div className="container-fluid py-3">
            {/* Hero / header row */}
            <div className="card ws-card mb-3">
                <div className="p-3 p-md-4">
                    <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
                        <div>
                            <h1 className="h4 mb-1">Templates</h1>
                            <div className="text-secondary">Kickstart common workflows in seconds</div>
                        </div>
                        <div className="d-flex flex-wrap align-items-center gap-2">
                            {/* Search */}
                            <div className="input-group input-group-sm" style={{ minWidth: 320 }}>
                                <span className="input-group-text"><i className="bi bi-search" /></span>
                                <input
                                    className="form-control"
                                    placeholder="Search templates (e.g., Gmail, Slack, AI)"
                                    value={q}
                                    onChange={(e) => setQ(e.target.value)}
                                />
                            </div>

                            {/* App filter */}
                            <div className="dropdown">
                                <button className="btn btn-outline-dark btn-sm dropdown-toggle" data-bs-toggle="dropdown">
                                    <i className="bi bi-app-indicator me-1" />
                                    {appFilter === "All" ? "All apps" : appName(appFilter)}
                                </button>
                                <ul className="dropdown-menu dropdown-menu-end">
                                    <li><button className="dropdown-item" onClick={() => setAppFilter("All")}>All apps</button></li>
                                    <li><hr className="dropdown-divider" /></li>
                                    {APPS.map(a => (
                                        <li key={a.id}>
                                            <button className="dropdown-item d-flex align-items-center gap-2" onClick={() => setAppFilter(a.id)}>
                                                <i className={`bi ${a.icon}`} />{a.name}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Category filter */}
                            <div className="dropdown">
                                <button className="btn btn-outline-dark btn-sm dropdown-toggle" data-bs-toggle="dropdown">
                                    <i className="bi bi-grid me-1" />
                                    {catFilter === "All" ? "All categories" : catFilter}
                                </button>
                                <ul className="dropdown-menu dropdown-menu-end">
                                    {CATEGORIES.map(c => (
                                        <li key={c}>
                                            <button className="dropdown-item" onClick={() => setCatFilter(c)}>{c}</button>
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
                                <ul className="dropdown-menu dropdown-menu-end">
                                    {(["Relevance", "Most used", "Newest"] as const).map(s => (
                                        <li key={s}><button className="dropdown-item" onClick={() => setSort(s)}>{s}</button></li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <ul className="nav nav-tabs mt-3">
                        {(["Featured", "Popular", "New"] as const).map(t => (
                            <li className="nav-item" key={t}>
                                <button
                                    className={`nav-link ${tab === t ? "active" : ""}`}
                                    onClick={() => setTab(t)}
                                >
                                    {t}
                                </button>
                            </li>
                        ))}
                    </ul>

                    {/* Category chips row (scrollable) */}
                    <div className="d-flex gap-2 mt-3 overflow-auto pb-1">
                        {CATEGORIES.map(c => (
                            <button
                                key={c}
                                className={`btn btn-chip ${catFilter === c ? "active" : ""}`}
                                onClick={() => setCatFilter(c)}
                            >
                                {c}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Grid */}
            <div className="row g-3">
                {filtered.map(t => (
                    <div className="col-12 col-sm-6 col-lg-4 col-xxl-3" key={t.id}>
                        <TemplateCard tpl={t} onPreview={() => setPreview(t)} />
                    </div>
                ))}
                {filtered.length === 0 && (
                    <div className="text-center text-secondary py-5">No templates found.</div>
                )}
            </div>

            {/* Footer / pagination (stub) */}
            <div className="d-flex justify-content-between align-items-center mt-3">
                <small className="text-secondary">{filtered.length} templates</small>
                <nav aria-label="Templates pagination">
                    <ul className="pagination pagination-sm mb-0">
                        <li className="page-item disabled"><span className="page-link">Prev</span></li>
                        <li className="page-item active"><span className="page-link">1</span></li>
                        <li className="page-item"><a className="page-link" href="#">2</a></li>
                        <li className="page-item"><a className="page-link" href="#">Next</a></li>
                    </ul>
                </nav>
            </div>

            {/* Preview Modal */}
            <div className="modal fade" id="tplPreview" tabIndex={-1} aria-hidden="true">
                {/* Bootstrap toggles this via data attributes; we're using imperative open via JS below */}
            </div>

            {preview && <PreviewModal tpl={preview} onClose={() => setPreview(null)} />}
        </div>
    );
}

/* ────────────────────────────────────────────────────────────────────────── */

function TemplateCard({ tpl, onPreview }: { tpl: Template; onPreview: () => void }) {
    return (
        <div className="card ws-card h-100">
            <div className="card-body d-flex flex-column">
                {/* badge & apps */}
                <div className="d-flex justify-content-between align-items-start mb-2">
                    <div className="d-flex align-items-center gap-2">
                        {tpl.badge && <span className={`badge rounded-pill tpl-badge ${tpl.badge.toLowerCase()}`}>{tpl.badge}</span>}
                        {tpl.runs && <small className="text-secondary">{tpl.runs}</small>}
                    </div>
                    <div className="text-secondary">
                        {tpl.apps.slice(0, 3).map(a => <i key={a} className={`bi ${appIcon(a)} ms-2`} />)}
                    </div>
                </div>

                {/* title + summary */}
                <h2 className="h6 mb-1">{tpl.title}</h2>
                <p className="text-secondary small flex-grow-1">{tpl.summary}</p>

                {/* tags */}
                <div className="d-flex flex-wrap gap-1 mb-3">
                    {tpl.tags.map(t => <span key={t} className="badge rounded-pill bg-light text-dark border">{t}</span>)}
                </div>

                {/* actions */}
                <div className="d-flex align-items-center gap-2 mt-auto">
                    <button className="btn btn-primary btn-sm flex-fill" onClick={onPreview}>
                        <i className="bi bi-eye me-1" />
                        Preview
                    </button>
                    <div className="dropdown">
                        <button className="btn btn-outline-dark btn-sm dropdown-toggle" data-bs-toggle="dropdown">
                            Use template
                        </button>
                        <ul className="dropdown-menu dropdown-menu-end">
                            <li><button className="dropdown-item"><i className="bi bi-plus-circle me-2" />Create scenario</button></li>
                            <li><button className="dropdown-item"><i className="bi bi-box-arrow-up-right me-2" />Open in builder</button></li>
                        </ul>
                    </div>
                    <div className="dropdown">
                        <button className="btn btn-outline-dark btn-sm" data-bs-toggle="dropdown" aria-label="More">
                            <i className="bi bi-three-dots" />
                        </button>
                        <ul className="dropdown-menu dropdown-menu-end">
                            <li><button className="dropdown-item"><i className="bi bi-bookmark me-2" />Save</button></li>
                            <li><button className="dropdown-item"><i className="bi bi-share me-2" />Share</button></li>
                            <li><hr className="dropdown-divider" /></li>
                            <li><button className="dropdown-item text-danger"><i className="bi bi-flag me-2" />Report</button></li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}

function PreviewModal({ tpl, onClose }: { tpl: Template; onClose: () => void }) {
    // Bootstrap modal via data API
    // We'll just render a simple centered card overlay look (no JS dependency).
    return (
        <div className="tpl-overlay" onClick={onClose}>
            <div className="tpl-dialog card ws-card" onClick={(e) => e.stopPropagation()}>
                <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                        <h3 className="h5 mb-0">{tpl.title}</h3>
                        <button className="btn btn-outline-dark btn-sm" onClick={onClose}><i className="bi bi-x-lg" /></button>
                    </div>
                    <p className="text-secondary">{tpl.summary}</p>

                    <div className="mb-3">
                        <strong className="me-2">Apps:</strong>
                        {tpl.apps.map(a => (
                            <span key={a} className="badge bg-light text-dark border me-1"><i className={`bi ${appIcon(a)} me-1`} />{appName(a)}</span>
                        ))}
                    </div>

                    <div className="d-flex align-items-center gap-2">
                        <button className="btn btn-primary">
                            <i className="bi bi-plus-circle me-1" />
                            Use this template
                        </button>
                        <button className="btn btn-outline-dark">Open in builder</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

/* utils */
function appIcon(id: string) {
    return APPS.find(a => a.id === id)?.icon ?? "bi-app";
}
function appName(id: string) {
    return APPS.find(a => a.id === id)?.name ?? id;
}
function numUsed(s?: string) {
    if (!s) return 0;
    // "12k used" → 12000 ; "2.1k used" → 2100
    const m = s.toLowerCase().match(/([\d.]+)k/);
    if (m) return Math.round(parseFloat(m[1]) * 1000);
    const n = parseInt(s);
    return Number.isNaN(n) ? 0 : n;
}
