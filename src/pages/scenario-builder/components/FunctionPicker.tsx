import { useEffect, useMemo, useState } from "react";

import { APP_CATALOG } from "../catalog";
import { categoryOf } from "../utils";
import type { AppKey, CategoryKey } from "../types";
import { Badge } from "./Badge";

type FunctionPickerProps = {
  open: boolean;
  onPick: (key: AppKey) => void;
  onClose: () => void;
  initialCategory?: CategoryKey;
};

export function FunctionPicker({ open, onPick, onClose, initialCategory = "apps" }: FunctionPickerProps) {
  const [active, setActive] = useState<CategoryKey>(initialCategory);
  const [q, setQ] = useState("");

  useEffect(() => {
    if (open) {
      setActive(initialCategory);
      setQ("");
    }
  }, [open, initialCategory]);

  const items = useMemo(
    () =>
      APP_CATALOG.map((a) => ({
        ...a,
        _category: categoryOf(a.key),
        _tags: [
          a.key === "webhook" ? "Trigger" : undefined,
          a.key === "gmailWatchEmails" ? "Trigger" : undefined,
          a.key === "delay" ? "Flow" : undefined,
          ["http", "formatter", "code", "files", "emailParser"].includes(a.key) ? "Utility" : undefined,
          [
            "gmailSend",
            "gmailSearch",
            "slackPost",
            "calendarCreate",
            "sheetsAddRow",
            "driveUpload",
            "outlookSend",
            "telegramSend",
          ].includes(a.key)
            ? "Action"
            : undefined,
          a.key.startsWith("prod") ? "Product" : undefined,
          a.key.startsWith("ai") ? "AI" : undefined,
          a.key.startsWith("custom") ? "Custom" : undefined,
        ].filter(Boolean) as string[],
      })),
    []
  );

  const filtered = useMemo(() => {
    const qx = q.trim().toLowerCase();
    return items.filter(
      (f) =>
        f._category === active &&
        (!qx || f.name.toLowerCase().includes(qx) || f._tags.some((t) => t.toLowerCase().includes(qx)))
    );
  }, [items, active, q]);

  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.35)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 50,
      }}
      onClick={onClose}
      onKeyDown={(e) => e.key === "Escape" && onClose()}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "min(980px,96vw)",
          height: "min(620px,90vh)",
          background: "#fff",
          borderRadius: 16,
          boxShadow: "0 20px 40px rgba(0,0,0,.25)",
          display: "grid",
          gridTemplateColumns: "260px 1fr",
          overflow: "hidden",
        }}
      >
        <aside style={{ background: "#fafafa", borderRight: "1px solid #eee", padding: 16 }}>
          <div style={{ fontWeight: 700, fontSize: 14, opacity: 0.6, marginBottom: 8 }}>Browse</div>
          {(["apps", "ai", "flow", "utilities", "products", "custom"] as CategoryKey[]).map((c) => {
            const count = items.filter((i) => i._category === c).length;
            const selected = c === active;
            return (
              <button
                key={c}
                onClick={() => setActive(c)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  width: "100%",
                  padding: "10px 12px",
                  marginBottom: 6,
                  borderRadius: 10,
                  border: `1px solid ${selected ? "#dbeafe" : "transparent"}`,
                  background: selected ? "#eef2ff" : "transparent",
                  cursor: "pointer",
                }}
              >
                <span style={{ flex: 1, textAlign: "left" }}>
                  {{
                    apps: "Apps",
                    ai: "AI",
                    flow: "Flow controls",
                    utilities: "Utilities",
                    products: "Products",
                    custom: "Custom",
                  }[c]}
                </span>
                <span style={{ fontSize: 12, padding: "2px 8px", borderRadius: 999, background: "#f3f4f6" }}>
                  {count}
                </span>
              </button>
            );
          })}
          <div style={{ marginTop: 16 }}>
            <button
              onClick={onClose}
              style={{
                width: "100%",
                borderRadius: 10,
                border: "1px solid #e5e7eb",
                padding: "10px 12px",
                background: "#fff",
                cursor: "pointer",
              }}
            >
              Close
            </button>
          </div>
        </aside>
        <section style={{ padding: 16, display: "flex", flexDirection: "column", height: "100%" }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 12 }}>
            <div style={{ position: "relative", flex: 1 }}>
              <input
                autoFocus
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search apps, tools, or actions..."
                style={{
                  width: "100%",
                  padding: "10px 12px 10px 36px",
                  borderRadius: 10,
                  border: "1px solid #e5e7eb",
                  outline: "none",
                }}
              />
              <i className="bi bi-search" style={{ position: "absolute", top: 10, left: 10, opacity: 0.6 }} aria-hidden="true" />
            </div>
            <span style={{ fontSize: 13, opacity: 0.6 }}>
              {filtered.length} result{filtered.length === 1 ? "" : "s"}
            </span>
          </div>
          <div style={{ overflow: "auto", border: "1px solid #eee", borderRadius: 12, padding: 8, flex: 1 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 10 }}>
              {filtered.map((f) => (
                <button
                  key={f.key}
                  onClick={() => onPick(f.key)}
                  style={{
                    textAlign: "left",
                    border: "1px solid #e5e7eb",
                    borderRadius: 12,
                    padding: 12,
                    background: "#fff",
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    gap: 6,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        background: f.color,
                        color: "#fff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 16,
                      }}
                    >
                      {f.icon ?? ""}
                    </span>
                    <div style={{ fontWeight: 600 }}>{f.name}</div>
                  </div>
                  <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
                    {f._tags.map((t) => (
                      <Badge key={t}>{t}</Badge>
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </div>
          <div style={{ marginTop: 8, fontSize: 12, opacity: 0.6 }}>
            Tip: Press <kbd>Esc</kbd> to close. Click a card to attach the function to your node.
          </div>
        </section>
      </div>
    </div>
  );
}

