
export type LogEntry = {
  id: string;
  timestamp: Date;
  type: "info" | "success" | "warning" | "error";
  message: string;
  details?: unknown;
};

type LogWindowProps = {
  entries: LogEntry[];
  isOpen: boolean;
  onToggle: () => void;
  onClear: () => void;
};

function getTypeIcon(type: LogEntry["type"]) {
  switch (type) {
    case "success":
      return "OK";
    case "warning":
      return "WARN";
    case "error":
      return "ERR";
    default:
      return "INFO";
  }
}

function formatTime(date: Date) {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

export function LogWindow({ entries, isOpen, onToggle, onClear }: LogWindowProps) {
  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: "64px",
        right: 0,
        height: isOpen ? "300px" : "40px",
        background: "#fff",
        borderTop: "1px solid #e5e7eb",
        boxShadow: "0 -4px 16px rgba(0,0,0,0.06)",
        transition: "height 0.3s ease",
        zIndex: 50,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "8px 16px",
          borderBottom: "1px solid #e5e7eb",
          background: "#f9fafb",
          cursor: "pointer",
        }}
        onClick={onToggle}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 12, fontWeight: 600 }}>LOG</span>
          <span style={{ fontSize: 14, fontWeight: 600, color: "#374151" }}>Activity Log</span>
          <span
            style={{
              fontSize: 12,
              background: "#e5e7eb",
              color: "#6b7280",
              padding: "2px 6px",
              borderRadius: 12,
            }}
          >
            {entries.length}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {isOpen && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClear();
              }}
              style={{
                background: "transparent",
                border: "1px solid #d1d5db",
                borderRadius: 4,
                padding: "4px 8px",
                fontSize: 12,
                color: "#6b7280",
                cursor: "pointer",
              }}
            >
              Clear
            </button>
          )}
          <span style={{ fontSize: 12, color: "#6b7280" }}>{isOpen ? "^" : "v"}</span>
        </div>
      </div>

      {isOpen && (
        <div style={{ flex: 1, overflow: "auto", padding: "8px 0" }}>
          {entries.length === 0 ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                color: "#9ca3af",
                fontSize: 14,
              }}
            >
              No activity yet
            </div>
          ) : (
            <div style={{ padding: "0 16px" }}>
              {entries.map((entry) => (
                <div
                  key={entry.id}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 8,
                    padding: "6px 0",
                    borderBottom: "1px solid #f3f4f6",
                  }}
                >
                  <span style={{ fontSize: 14, marginTop: 2 }}>{getTypeIcon(entry.type)}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 2 }}>
                      {formatTime(entry.timestamp)}
                    </div>
                    <div style={{ fontSize: 13, color: "#374151", lineHeight: 1.4 }}>{entry.message}</div>
                    {entry.details != null && (
                      <details style={{ marginTop: 4 }}>
                        <summary
                          style={{
                            fontSize: 11,
                            color: "#6b7280",
                            cursor: "pointer",
                          }}
                        >
                          Details
                        </summary>
                        <pre
                          style={{
                            fontSize: 10,
                            color: "#6b7280",
                            background: "#f9fafb",
                            padding: 4,
                            borderRadius: 4,
                            margin: "4px 0 0 0",
                            overflow: "auto",
                            whiteSpace: "pre-wrap",
                          }}
                        >
                          {JSON.stringify(entry.details, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

