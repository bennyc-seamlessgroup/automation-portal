import { useEffect, useState } from "react";

export type DebugEvent = { action: string; payload: Record<string, unknown>; ts: string };

export function emitDebugPayload(action: string, payload: Record<string, unknown>) {
  window.dispatchEvent(
    new CustomEvent("__debug_payload__", {
      detail: { action, payload, ts: new Date().toISOString() } as DebugEvent,
    })
  );
}

export default function DebugPayloadUI() {
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
