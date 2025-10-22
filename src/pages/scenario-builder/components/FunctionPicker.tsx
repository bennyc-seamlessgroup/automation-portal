import { useEffect, useMemo, useState, useContext } from "react";

import { categoryOf } from "../utils";
import type { AppKey, CategoryKey } from "../types";
import { Badge } from "./Badge";
import AppSkeletonGrid from "./AppSkeletonGrid";
import { AppsContext } from "../../../state/AppsContext.context";

type FunctionPickerProps = {
  open: boolean;
  onPick: (key: AppKey) => void;
  onClose: () => void;
  initialCategory?: CategoryKey;
};

export function FunctionPicker({ open, onPick, onClose, initialCategory = "apps" }: FunctionPickerProps) {
  const [active, setActive] = useState<CategoryKey>(initialCategory);
  const [activeApp, setActiveApp] = useState<string>("");
  const [q, setQ] = useState("");
  const { apps, isLoading, refresh } = useContext(AppsContext) || { apps: [], isLoading: false, refresh: async () => {} };

  // Debug logging - only log when data actually changes
  useEffect(() => {
    console.log('[FunctionPicker] Context data changed:', { appsCount: apps.length, isLoading, open, sampleApps: apps.slice(0, 2) });
  }, [apps.length, isLoading, open]);

  useEffect(() => {
    if (open) {
      console.log(`[FunctionPicker] 📂 Opening picker with ${apps.length} cached apps`);
      setActive(initialCategory);
      setActiveApp("");
      setQ("");
      // Use cached app data - no need to refresh on every open
      // Refresh only when refresh button is clicked
    }
  }, [open, initialCategory, apps.length]);

  const items = useMemo(
    () =>
      apps.map((a) => ({
        ...a,
        _category: categoryOf(a.key),
        _tags: [
          a.key === "webhook" ? "Trigger" : undefined,
          // 📝 TAG ASSIGNMENT FOR VERSIONS
          // ==============================
          // When adding V2 (or V3, V4, etc.) of apps, ensure they get the same tags as V1
          // Examples:
          // - gmailWatchEmails (V1) → Trigger tag
          // - gmailWatchEmailsV2 (V2) → Trigger tag (same as V1)
          // - telegramSend (V1) → Action tag
          // - telegramSendV2 (V2) → Action tag (same as V1)
          a.key === "gmailWatchEmails" || a.key === "gmailWatchEmailsV2" ? "Trigger" : undefined,
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
            "telegramSendV2",
          ].includes(a.key)
            ? "Action"
            : undefined,
          a.key.startsWith("prod") ? "Product" : undefined,
          a.key.startsWith("ai") ? "AI" : undefined,
          a.key.startsWith("custom") ? "Custom" : undefined,
        ].filter(Boolean) as string[],
      })),
    [apps]
  );

  // 🔄 APP GROUPING LOGIC
  // ======================
  // This section groups apps by their base name for display in the middle column.
  // When adding new apps or new versions (V2, V3, V4, etc.), this logic handles:
  // 1. Extracting base app name from keys like "gmailWatchEmailsV2" → "gmail"
  // 2. Grouping multiple versions under the same parent app
  // 3. Displaying user-friendly names in the middle column
  //
  // TO ADD A NEW VERSION OF AN EXISTING APP:
  // 1. Add the new AppKey to types.ts (e.g., "gmailWatchEmailsV3")
  // 2. Update categoryOf() in utils.ts to include the new key
  // 3. Add the new app to the appropriate AppGroup class (e.g., GmailApp.getAllSpecs())
  // 4. Update the _tags array above to include the new version key with same tags as V1
  // 5. The grouping logic here will automatically handle it (works for V2, V3, V4, etc.)
  //
  // TO ADD A COMPLETELY NEW APP:
  // 1. Add new AppKey to types.ts
  // 2. Update categoryOf() in utils.ts
  // 3. Create new AppGroup class or add to existing one
  // 4. Update catalog.ts to include the new app group
  // 5. Add app to the appropriate category filter in apps.local.ts
  // 6. Add app key to the _tags array above for proper badge display
  // Get unique app names for the selected category
  const appsInCategory = useMemo(() => {
    const categoryApps = items.filter((item) => item._category === active);
    const appGroups = categoryApps.reduce((acc, item) => {
      // Extract base app name (without version suffix like V2, V3, V4, etc.)
      let baseAppName: string = item.key;
      if (baseAppName.includes('V')) {
        // For versioned apps (V2, V3, V4, etc.), extract base name
        baseAppName = baseAppName.replace(/V\d+$/, '').split(/Watch|Send|Search|Post|Create|Add|Upload/)[0];
      } else {
        // For regular apps, extract base name
        baseAppName = baseAppName.split(/Watch|Send|Search|Post|Create|Add|Upload/)[0];
      }

      // Use base app name for grouping
      const appName = baseAppName;
      const displayName = baseAppName.charAt(0).toUpperCase() + baseAppName.slice(1);

      if (!acc[appName]) {
        acc[appName] = { displayName, functions: [] };
      }
      acc[appName].functions.push(item);
      return acc;
    }, {} as Record<string, { displayName: string; functions: typeof items }>);

    return Object.entries(appGroups).map(([appName, { displayName, functions }]) => ({
      name: appName,
      displayName,
      functions,
      count: functions.length,
    }));
  }, [items, active]);

  // 🔄 APP FILTERING LOGIC
  // ======================
  // This section handles filtering apps when a user clicks on an app group in the middle column.
  // It ensures that when "Gmail" is selected, both V1 and V2 (and V3, V4, etc.) functions are shown.
  //
  // TO UPDATE FOR NEW VERSIONS:
  // Update the filtering logic below to match the grouping logic above (already handles V2, V3, V4, etc.)
  const filtered = useMemo(() => {
    const qx = q.trim().toLowerCase();
    let filteredItems = items.filter((f) => f._category === active);

    // Filter by selected app if one is active
    if (activeApp) {
      filteredItems = filteredItems.filter((f) => {
        let baseAppName: string = f.key;
        if (baseAppName.includes('V')) {
          baseAppName = baseAppName.replace(/V\d+$/, '').split(/Watch|Send|Search|Post|Create|Add|Upload/)[0];
        } else {
          baseAppName = baseAppName.split(/Watch|Send|Search|Post|Create|Add|Upload/)[0];
        }
        return baseAppName === activeApp;
      });
    }

    // Apply search filter
    if (qx) {
      filteredItems = filteredItems.filter(
        (f) =>
          f.name.toLowerCase().includes(qx) ||
          f.key.toLowerCase().includes(qx) ||
          f._tags.some((t) => t.toLowerCase().includes(qx))
      );
    }

    return filteredItems;
  }, [items, active, activeApp, q]);

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
          width: "min(1100px,90vw)",
          height: "min(580px,85vh)",
          background: "#fff",
          borderRadius: 16,
          boxShadow: "0 20px 40px rgba(0,0,0,.25)",
          display: "grid",
          gridTemplateColumns: "240px 180px 1fr",
          overflow: "hidden",
        }}
      >
        <aside style={{ background: "#fafafa", borderRight: "1px solid #e5e7eb", padding: 16 }}>
          <div style={{ fontWeight: 600, fontSize: 13, color: "#374151", marginBottom: 12 }}>Browse</div>
          {(["apps", "ai", "flow", "utilities", "products", "custom"] as CategoryKey[]).map((c) => {
            const count = items.filter((i) => i._category === c).length;
            const selected = c === active;
            return (
              <button
                key={c}
                onClick={() => {
                  setActive(c);
                  setActiveApp(""); // Reset app selection when category changes
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  width: "100%",
                  padding: "10px 12px",
                  marginBottom: 6,
                  borderRadius: 8,
                  border: `1px solid ${selected ? "#3b82f6" : "transparent"}`,
                  background: selected ? "#eff6ff" : "transparent",
                  cursor: "pointer",
                  fontSize: 13,
                  fontWeight: selected ? 500 : 400,
                  color: selected ? "#1d4ed8" : "#64748b",
                  transition: "all 0.2s ease",
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
                <span style={{
                  fontSize: 11,
                  padding: "2px 8px",
                  borderRadius: 12,
                  background: selected ? "#dbeafe" : "#f1f5f9",
                  color: selected ? "#1d4ed8" : "#64748b",
                  fontWeight: 500
                }}>
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
                borderRadius: 8,
                border: "1px solid #e5e7eb",
                padding: "10px 12px",
                background: "#fff",
                cursor: "pointer",
                fontSize: 13,
                color: "#64748b",
                fontWeight: 500,
              }}
            >
              Close
            </button>
          </div>
        </aside>

        {/* Middle column - Apps within category */}
        <aside style={{ background: "#fafafa", borderRight: "1px solid #e5e7eb", padding: 16 }}>
          <div style={{ fontWeight: 600, fontSize: 13, color: "#374151", marginBottom: 12 }}>
            {{
              apps: "Apps",
              ai: "AI Tools",
              flow: "Flow Controls",
              utilities: "Utilities",
              products: "Products",
              custom: "Custom",
            }[active]}
          </div>
          {appsInCategory.length > 0 ? (
            appsInCategory.map((app) => {
              const selected = app.name === activeApp;
              return (
                <button
                  key={app.name}
                  onClick={() => setActiveApp(app.name)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    width: "100%",
                    padding: "8px 10px",
                    marginBottom: 4,
                    borderRadius: 6,
                    border: `1px solid ${selected ? "#3b82f6" : "transparent"}`,
                    background: selected ? "#eff6ff" : "transparent",
                    cursor: "pointer",
                    fontSize: 12,
                    fontWeight: selected ? 500 : 400,
                    color: selected ? "#1d4ed8" : "#64748b",
                    transition: "all 0.2s ease",
                  }}
                >
                  <span style={{ flex: 1, textAlign: "left" }}>
                    {app.displayName}
                  </span>
                  <span style={{
                    fontSize: 10,
                    padding: "1px 6px",
                    borderRadius: 10,
                    background: selected ? "#dbeafe" : "#f1f5f9",
                    color: selected ? "#1d4ed8" : "#64748b",
                    fontWeight: 500
                  }}>
                    {app.count}
                  </span>
                </button>
              );
            })
          ) : (
            <div style={{ fontSize: 12, color: "#94a3b8", padding: 8 }}>
              No apps in this category
            </div>
          )}
        </aside>

        <section style={{ padding: 16, display: "flex", flexDirection: "column", height: "100%" }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 12 }}>
            <div style={{ position: "relative", flex: 1 }}>
              <input
                autoFocus
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search functions..."
                style={{
                  width: "100%",
                  padding: "10px 12px 10px 36px",
                  borderRadius: 8,
                  border: "1px solid #e5e7eb",
                  outline: "none",
                  fontSize: 13,
                  background: "#fff",
                }}
              />
              <i className="bi bi-search" style={{ position: "absolute", top: 10, left: 10, color: "#94a3b8" }} aria-hidden="true" />
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <span style={{ fontSize: 12, color: "#64748b" }}>
                {isLoading ? "Loading..." : `${filtered.length} result${filtered.length === 1 ? "" : "s"}`}
              </span>
              <button
                onClick={() => refresh()}
                disabled={isLoading}
                style={{
                  padding: "8px 12px",
                  borderRadius: 6,
                  border: "1px solid #e5e7eb",
                  background: "#fff",
                  cursor: isLoading ? "not-allowed" : "pointer",
                  opacity: isLoading ? 0.5 : 1,
                  fontSize: 12,
                  color: "#64748b",
                }}
                title="Refresh app list"
              >
                <i className="bi bi-arrow-clockwise" style={{ marginRight: 4 }} />
                Refresh
              </button>
            </div>
          </div>
          <div style={{ overflow: "auto", border: "1px solid #e5e7eb", borderRadius: 8, padding: 8, flex: 1 }}>
            {isLoading ? (
              <AppSkeletonGrid count={6} />
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 10 }}>
                {filtered.map((f) => (
                  <button
                    key={f.key}
                    onClick={() => onPick(f.key)}
                    style={{
                      textAlign: "left",
                      border: "1px solid #e5e7eb",
                      borderRadius: 8,
                      padding: 12,
                      background: "#fff",
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      gap: 8,
                      transition: "all 0.2s ease",
                      position: "relative",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "#3b82f6";
                      e.currentTarget.style.background = "#f8fafc";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "#e5e7eb";
                      e.currentTarget.style.background = "#fff";
                    }}
                  >
                    {/* 🔄 VERSION BADGE - Lower right corner of card */}
                    {f.version && (
                      <div
                        style={{
                          position: "absolute",
                          bottom: 8,
                          right: 8,
                          background: f.version === 1 ? "#6b7280" : "#3b82f6",
                          color: "white",
                          fontSize: 10,
                          fontWeight: "bold",
                          borderRadius: "50%",
                          width: 20,
                          height: 20,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          border: "2px solid white",
                          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                        }}
                        title={`Version ${f.version}`}
                      >
                        V{f.version}
                      </div>
                    )}
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
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
                          flexShrink: 0,
                        }}
                      >
                        {f.icon ?? ""}
                      </span>
                      <div style={{ flex: 1 }}>
                        {/* 🔄 VERSION BADGE - Lower right corner of card
                         * Shows version badges for all versions (V1, V2, V3, etc.)
                         * V1 uses gray color, V2+ uses blue color to be less obvious
                         * This helps users distinguish between versions without cluttering names
                         * TO ADD VERSION SUPPORT FOR NEW APPS:
                         * 1. Ensure the AppSpec includes version field
                         * 2. The badge logic above will automatically display it
                         */}
                        <div style={{ fontWeight: 600, fontSize: 13, color: "#1f2937", marginBottom: 4 }}>
                          {f.name}
                        </div>
                        {f.description && (
                          <div style={{ fontSize: 11, color: "#6b7280", lineHeight: 1.4, marginBottom: 6 }}>
                            {f.description}
                          </div>
                        )}
                        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                          {f._tags.map((t) => (
                            <Badge key={t}>{t}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
          <div style={{ marginTop: 8, fontSize: 11, color: "#94a3b8" }}>
            Tip: Press <kbd>Esc</kbd> to close. Click a card to attach the function to your node.
          </div>
        </section>
      </div>
    </div>
  );
}

