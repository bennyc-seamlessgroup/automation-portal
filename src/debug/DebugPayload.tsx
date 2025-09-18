import React, { useEffect, useState } from "react";

// @ts-ignore – attach a global helper for convenience
(window as any).emitDebug = (action: string, payload: Record<string, unknown>) =>
    emitDebugPayload(action, payload);

type DebugEvent = {
  action: string;
  payload: Record<string, unknown>;
  ts: string;
};

// Call this wherever an action happens or a value is stored.
// Example: emitDebugPayload("scenarios.run", { scenarioId, mode: "run" })
export function emitDebugPayload(action: string, payload: Record<string, unknown>) {
  window.dispatchEvent(
    new CustomEvent("__debug_payload__", {
      detail: { action, payload, ts: new Date().toISOString() } as DebugEvent,
    })
  );
}

export function DebugPayloadUI() {
  const STORAGE_KEY = "debugPayloadEnabled";
  const [enabled, setEnabled] = useState<boolean>(() => {
    const v = localStorage.getItem(STORAGE_KEY);
    return v ? v === "1" : true; // default ON
  });
  const [open, setOpen] = useState(false);
  const [event, setEvent] = useState<DebugEvent | null>(null);

  // persist toggle per user
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, enabled ? "1" : "0");
  }, [enabled]);

  // listen for debug payload events
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
      // eslint-disable-next-line no-alert
      alert("Copied JSON to clipboard.");
    } catch {
      // eslint-disable-next-line no-alert
      alert("Copy failed. Please copy manually.");
    }
  };

  return (
    <>
      {/* Bottom toggle — fixed; won’t shift your existing UI */}
      <div className="fixed inset-x-0 bottom-3 z-[60] flex justify-center pointer-events-none">
        <div className="pointer-events-auto rounded-full border border-gray-200 bg-white/90 backdrop-blur px-3 py-1.5 shadow-md flex items-center gap-2">
          <span className="text-xs text-gray-600">Payload Preview</span>
          <button
            onClick={() => setEnabled(v => !v)}
            className={`relative inline-flex h-6 w-10 items-center rounded-full transition ${
              enabled ? "bg-black" : "bg-gray-300"
            }`}
            aria-label="Toggle payload preview"
            title="Toggle payload preview"
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${
                enabled ? "translate-x-5" : "translate-x-1"
              }`}
            />
          </button>
        </div>
      </div>

      {/* Modal */}
      {open && event && (
        <div
          className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center bg-black/40 p-3"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full sm:max-w-2xl rounded-2xl bg-white shadow-xl overflow-hidden">
            <div className="px-5 py-4 border-b flex items-center justify-between">
              <div className="min-w-0">
                <h3 className="text-base font-semibold leading-6 text-gray-900">
                  Backend Payload Preview
                </h3>
                <p className="mt-0.5 text-xs text-gray-500">
                  Action: <span className="font-medium">{event.action}</span> ·{" "}
                  {new Date(event.ts).toLocaleString()}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={copy}
                  className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 hover:bg-gray-50"
                >
                  Copy JSON
                </button>
                <button
                  onClick={() => setOpen(false)}
                  className="px-3 py-1.5 text-sm rounded-lg bg-gray-900 text-white hover:bg-black"
                >
                  Close
                </button>
              </div>
            </div>
            <pre className="m-0 max-h-[60vh] overflow-auto p-5 text-xs leading-relaxed bg-gray-50">
{JSON.stringify(event, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </>
  );
}
