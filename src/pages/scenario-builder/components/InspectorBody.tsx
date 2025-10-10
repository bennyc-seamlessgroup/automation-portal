import { useState } from "react";
import type { Node } from "reactflow";

import type { AppKey, AppSpec, RFData } from "../types";
import { builderStyles } from "../styles";
import { getAppSpec } from "../utils";
import { TestNodeTab } from "./TestNodeTab";

type InspectorBodyProps = {
  node: Node<RFData>;
  onChangeNode: (node: Node<RFData>) => void;
  onDeleteNode: (id: string) => void;
};

export function InspectorBody({ node, onChangeNode, onDeleteNode }: InspectorBodyProps) {
  const isApp = node.type === "app";
  const data = (node.data || {}) as RFData;
  const spec: AppSpec | null = isApp ? getAppSpec(data.appKey as AppKey) : null;
  const setData = (patch: Partial<RFData>) =>
    onChangeNode({ ...node, data: { ...(node.data || {}), ...patch } });

  const [activeTab, setActiveTab] = useState<"settings" | "test">("settings");

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>Node Settings</h3>
      </div>

      <div style={{ display: "flex", borderBottom: "1px solid #e5e7eb", marginBottom: 16 }}>
        <button
          onClick={() => setActiveTab("settings")}
          style={{
            padding: "8px 16px",
            border: "none",
            background: "transparent",
            cursor: "pointer",
            fontSize: 14,
            fontWeight: activeTab === "settings" ? 600 : 400,
            color: activeTab === "settings" ? "#2563eb" : "#6b7280",
            borderBottom: activeTab === "settings" ? "2px solid #2563eb" : "2px solid transparent",
            transition: "all 0.2s ease",
          }}
        >
          Settings
        </button>
        <button
          onClick={() => setActiveTab("test")}
          style={{
            padding: "8px 16px",
            border: "none",
            background: "transparent",
            cursor: "pointer",
            fontSize: 14,
            fontWeight: activeTab === "test" ? 600 : 400,
            color: activeTab === "test" ? "#2563eb" : "#6b7280",
            borderBottom: activeTab === "test" ? "2px solid #2563eb" : "2px solid transparent",
            transition: "all 0.2s ease",
          }}
        >
          Test Node
        </button>
      </div>

      {activeTab === "settings" && (
        <>
          <div>
            <div style={builderStyles.formLabel}>Label</div>
            <input
              style={builderStyles.input}
              value={data.label ?? ""}
              onChange={(e) => setData({ label: e.target.value })}
              placeholder="Node label"
            />
          </div>
          {isApp && spec && (
            <div style={{ marginTop: 12 }}>
              <div style={{ ...builderStyles.formLabel, fontWeight: 600, color: "#374151" }}>{spec.name} Settings</div>
              {spec.fields.map((f) => (
                <div key={f.key} style={{ marginTop: 10 }}>
                  <div style={builderStyles.formLabel}>{f.label}</div>
                  {f.type === "select" ? (
                    <select
                      style={builderStyles.select as any}
                      value={(data.values?.[f.key] ?? "") as string}
                      onChange={(e) => setData({ values: { ...(data.values || {}), [f.key]: e.target.value } })}
                    >
                      <option value="">Select...</option>
                      {f.options?.map((o) => (
                        <option key={o} value={o}>
                          {o}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      style={builderStyles.input}
                      type={f.type === "number" ? "number" : "text"}
                      value={(data.values?.[f.key] ?? "") as string}
                      onChange={(e) => setData({ values: { ...(data.values || {}), [f.key]: e.target.value } })}
                      placeholder={f.placeholder}
                    />
                  )}
                </div>
              ))}
            </div>
          )}
          <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
            <button
              style={{
                ...builderStyles.delBtn,
                background: "#dc2626",
                color: "white",
                border: "1px solid #dc2626",
                flex: 1,
              }}
              onClick={() => {
                onDeleteNode(node.id);
              }}
            >
              Delete node
            </button>
          </div>
        </>
      )}

      {activeTab === "test" && <TestNodeTab node={node} spec={spec} />}
    </>
  );
}

