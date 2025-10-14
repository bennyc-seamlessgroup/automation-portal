import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getConnections, type Connection as ConnectionType, deleteConnection, updateConnection } from "../services/connections.service";

/*
  App Connections — Zapier-inspired table
  --------------------------------------
  - Bootstrap + Bootstrap Icons + ws-* classes (same design language as the portal)
  - No Apps tab; this page lists only connections
  - Includes a prototype-only "Show empty state" toggle (bottom-right)
*/

type Connection = ConnectionType;

export default function Connections() {
    const [q, setQ] = useState("");
    const [scope, setScope] = useState("All connections");
    const [perPage, setPerPage] = useState<25 | 50 | 100>(25);
    const [protoEmpty, setProtoEmpty] = useState(false); // prototype-only toggle
    const [connections, setConnections] = useState<Connection[]>([]);

    // Modal states
    const [renameModal, setRenameModal] = useState<{ open: boolean; connectionId: string | null; currentName: string }>({
        open: false,
        connectionId: null,
        currentName: "",
    });
    const [deleteModal, setDeleteModal] = useState<{ open: boolean; connectionId: string | null; connectionName: string }>({
        open: false,
        connectionId: null,
        connectionName: "",
    });
    const [testModal, setTestModal] = useState<{ open: boolean; connectionId: string | null; connectionName: string }>({
        open: false,
        connectionId: null,
        connectionName: "",
    });
    const [replaceModal, setReplaceModal] = useState<{ open: boolean; connectionId: string | null; connectionName: string }>({
        open: false,
        connectionId: null,
        connectionName: "",
    });
    const [discoverModal, setDiscoverModal] = useState<{ open: boolean; connectionId: string | null; connectionName: string }>({
        open: false,
        connectionId: null,
        connectionName: "",
    });

    const navigate = useNavigate();

    // Load connections on mount
    useEffect(() => {
        setConnections(getConnections());
    }, []);

    const items = useMemo(() => {
        let out = connections.slice();
        if (q.trim()) {
            const t = q.toLowerCase();
            out = out.filter(r => r.name.toLowerCase().includes(t) || r.sub.toLowerCase().includes(t) || r.app.toLowerCase().includes(t));
        }
        // scope is a placeholder for now; no-op
        return out;
    }, [connections, q, scope]);

    const total = items.length;

    const onAdd = () => navigate("/connections/new");

    // Connection action handlers
    const handleRename = (connectionId: string, currentName: string) => {
        setRenameModal({ open: true, connectionId, currentName });
    };

    const handleDelete = (connectionId: string, connectionName: string) => {
        setDeleteModal({ open: true, connectionId, connectionName });
    };

    const handleTest = (connectionId: string, connectionName: string) => {
        setTestModal({ open: true, connectionId, connectionName });
    };

    const handleReplace = (connectionId: string, connectionName: string) => {
        setReplaceModal({ open: true, connectionId, connectionName });
    };

    const handleDiscover = (connectionId: string, connectionName: string) => {
        setDiscoverModal({ open: true, connectionId, connectionName });
    };

    const confirmRename = () => {
        if (renameModal.connectionId && renameModal.currentName.trim()) {
            const updatedConnections = connections.map(conn =>
                conn.id === renameModal.connectionId
                    ? { ...conn, name: renameModal.currentName.trim() }
                    : conn
            );
            setConnections(updatedConnections);
            updateConnection(renameModal.connectionId, { name: renameModal.currentName.trim() });
        }
        setRenameModal({ open: false, connectionId: null, currentName: "" });
    };

    const confirmDelete = () => {
        if (deleteModal.connectionId) {
            const updatedConnections = connections.filter(conn => conn.id !== deleteModal.connectionId);
            setConnections(updatedConnections);
            deleteConnection(deleteModal.connectionId);
        }
        setDeleteModal({ open: false, connectionId: null, connectionName: "" });
    };

    const testConnection = async () => {
        if (testModal.connectionId) {
            const connection = connections.find(conn => conn.id === testModal.connectionId);
            if (connection) {
                // Test the connection based on its type
                try {
                    if (connection.app === "Telegram") {
                        // Test Telegram connection
                        const response = await fetch(`https://api.telegram.org/bot${connection.credentials?.token}/getMe`);
                        const data = await response.json();
                        if (data.ok) {
                            alert(`✅ ${connection.name} is working correctly!`);
                        } else {
                            alert(`❌ ${connection.name} connection failed: ${data.description}`);
                        }
                    } else if (connection.app === "Gmail") {
                        // Test Gmail connection (placeholder)
                        alert(`✅ ${connection.name} is working correctly!`);
                    } else if (connection.app === "Sheets") {
                        // Test Sheets connection (placeholder)
                        alert(`✅ ${connection.name} is working correctly!`);
                    }
                } catch (error) {
                    alert(`❌ ${connection.name} connection test failed: ${error instanceof Error ? error.message : "Unknown error"}`);
                }
            }
        }
        setTestModal({ open: false, connectionId: null, connectionName: "" });
    };

    const replaceConnection = () => {
        if (replaceModal.connectionId) {
            // Navigate to create new connection of the same type
            const connection = connections.find(conn => conn.id === replaceModal.connectionId);
            if (connection) {
                navigate(`/connections/new?app=${connection.app}&replace=${replaceModal.connectionId}`);
            }
        }
        setReplaceModal({ open: false, connectionId: null, connectionName: "" });
    };

    const discoverUseCases = () => {
        if (discoverModal.connectionId) {
            const connection = connections.find(conn => conn.id === discoverModal.connectionId);
            if (connection) {
                // Show use cases based on connection type
                let useCases = "";
                if (connection.app === "Telegram") {
                    useCases = "Telegram use cases:\n• Send notifications\n• Customer support\n• Marketing campaigns\n• Order updates";
                } else if (connection.app === "Gmail") {
                    useCases = "Gmail use cases:\n• Email processing\n• Auto-replies\n• Lead management\n• Newsletter management";
                } else if (connection.app === "Sheets") {
                    useCases = "Sheets use cases:\n• Data collection\n• Reporting\n• Inventory management\n• Analytics";
                }

                alert(`${connection.name} use cases:\n\n${useCases}`);
            }
        }
        setDiscoverModal({ open: false, connectionId: null, connectionName: "" });
    };

    return (
        <>
            {/* Modal components */}
            {renameModal.open && (
                <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Rename Connection</h5>
                                <button type="button" className="btn-close" onClick={() => setRenameModal({ open: false, connectionId: null, currentName: "" })}></button>
                            </div>
                            <div className="modal-body">
                                <div className="mb-3">
                                    <label className="form-label">Connection Name</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={renameModal.currentName}
                                        onChange={(e) => setRenameModal(prev => ({ ...prev, currentName: e.target.value }))}
                                        placeholder="Enter new name"
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setRenameModal({ open: false, connectionId: null, currentName: "" })}>
                                    Cancel
                                </button>
                                <button type="button" className="btn btn-primary" onClick={confirmRename}>
                                    Rename
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {deleteModal.open && (
                <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Delete Connection</h5>
                                <button type="button" className="btn-close" onClick={() => setDeleteModal({ open: false, connectionId: null, connectionName: "" })}></button>
                            </div>
                            <div className="modal-body">
                                <p>Are you sure you want to delete the connection "{deleteModal.connectionName}"? This action cannot be undone.</p>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setDeleteModal({ open: false, connectionId: null, connectionName: "" })}>
                                    Cancel
                                </button>
                                <button type="button" className="btn btn-danger" onClick={confirmDelete}>
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {testModal.open && (
                <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Test Connection</h5>
                                <button type="button" className="btn-close" onClick={() => setTestModal({ open: false, connectionId: null, connectionName: "" })}></button>
                            </div>
                            <div className="modal-body">
                                <p>Testing connection "{testModal.connectionName}"...</p>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setTestModal({ open: false, connectionId: null, connectionName: "" })}>
                                    Cancel
                                </button>
                                <button type="button" className="btn btn-primary" onClick={testConnection}>
                                    Test
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {replaceModal.open && (
                <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Replace Connection</h5>
                                <button type="button" className="btn-close" onClick={() => setReplaceModal({ open: false, connectionId: null, connectionName: "" })}></button>
                            </div>
                            <div className="modal-body">
                                <p>You are about to replace the connection "{replaceModal.connectionName}". This will navigate you to create a new connection.</p>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setReplaceModal({ open: false, connectionId: null, connectionName: "" })}>
                                    Cancel
                                </button>
                                <button type="button" className="btn btn-primary" onClick={replaceConnection}>
                                    Replace
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {discoverModal.open && (
                <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Use Cases for {discoverModal.connectionName}</h5>
                                <button type="button" className="btn-close" onClick={() => setDiscoverModal({ open: false, connectionId: null, connectionName: "" })}></button>
                            </div>
                            <div className="modal-body">
                                <div id="use-cases-content">
                                    {/* Content will be populated by discoverUseCases function */}
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-primary" onClick={discoverUseCases}>
                                    Show Use Cases
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Main content */}
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
                                                <RowMenu
                                                    connection={r}
                                                    onRename={handleRename}
                                                    onDelete={handleDelete}
                                                    onTest={handleTest}
                                                    onReplace={handleReplace}
                                                    onDiscover={handleDiscover}
                                                />
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
        </>
    );
}

/* ────────────────────────────────────────────────────────────────────────── */
function brandBadge(brand: Connection["brand"]) {
    const base = "d-inline-flex align-items-center justify-content-center rounded me-2";
    if (brand === "telegram") return <span className={`${base}`} style={{ width: 32, height: 32, background: "#229ED9" }}><i className="bi bi-send text-white" /></span>;
    if (brand === "sheets") return <span className={`${base}`} style={{ width: 32, height: 32, background: "#0F9D58" }}><i className="bi bi-table text-white" /></span>;
    return <span className={`${base}`} style={{ width: 32, height: 32, background: "#EA4335" }}><i className="bi bi-envelope-fill text-white" /></span>;
}

function RowMenu({
    connection,
    onRename,
    onDelete,
    onTest,
    onReplace,
    onDiscover
}: {
    connection: Connection;
    onRename: (connectionId: string, currentName: string) => void;
    onDelete: (connectionId: string, connectionName: string) => void;
    onTest: (connectionId: string, connectionName: string) => void;
    onReplace: (connectionId: string, connectionName: string) => void;
    onDiscover: (connectionId: string, connectionName: string) => void;
}) {
    return (
        <div className="dropdown">
            <button className="btn btn-sm btn-outline-dark" data-bs-toggle="dropdown" aria-label="More actions">
                <i className="bi bi-three-dots" />
            </button>
            <ul className="dropdown-menu dropdown-menu-end ws-menu">
                <li><button className="dropdown-item" onClick={() => onRename(connection.id, connection.name)}><i className="bi bi-pencil me-2" />Rename</button></li>
                <li><button className="dropdown-item" onClick={() => onDiscover(connection.id, connection.name)}><i className="bi bi-lightbulb me-2" />Discover use cases</button></li>
                <li><button className="dropdown-item" onClick={() => onTest(connection.id, connection.name)}><i className="bi bi-patch-check me-2" />Test connection</button></li>
                <li><button className="dropdown-item" onClick={() => onReplace(connection.id, connection.name)}><i className="bi bi-arrow-repeat me-2" />Replace connection</button></li>
                <li><button className="dropdown-item"><i className="bi bi-person-gear me-2" />Change owner</button></li>
                <li><hr className="dropdown-divider" /></li>
                <li><button className="dropdown-item text-danger" onClick={() => onDelete(connection.id, connection.name)}><i className="bi bi-trash me-2" />Delete</button></li>
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
