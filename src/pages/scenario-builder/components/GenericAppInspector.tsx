import type { Node } from "reactflow";

import type { AppKey, AppSpec, RFData } from "../types";
import { builderStyles } from "../styles";
import { getAppSpec } from "../utils";

type GenericAppInspectorProps = {
  node: Node<RFData>;
  onChangeNode: (node: Node<RFData>) => void;
  onDeleteNode: (id: string) => void;
};

export function GenericAppInspector({ node, onChangeNode, onDeleteNode }: GenericAppInspectorProps) {
  const isApp = node.type === "app";
  const data = (node.data || {}) as RFData;
  const appKey = (data.appKey as AppKey) || ("" as AppKey);
  const spec: AppSpec | null = isApp ? getAppSpec(appKey) : null;

  const setData = (patch: Partial<RFData>) =>
    onChangeNode({ ...node, data: { ...(node.data || {}), ...patch } });

  // Header title
  const headerTitle = spec?.name ?? "Node Settings";

  // Safe values bag
  const values = (data.values || {}) as Record<string, unknown>;
  const writeValue = (k: string, v: unknown) =>
    setData({ values: { ...(values || {}), [k]: v } });

  // Generic field renderer
  const renderField = (field: {
    key: string;
    label: string;
    type?: string;
    options?: string[];
    placeholder?: string;
  }) => {
    const fieldValue = (values?.[field.key] ?? "") as string;

    return (
      <div key={field.key} style={{ marginTop: 10 }}>
        <div style={builderStyles.formLabel}>{field.label}</div>
        {field.type === "select" ? (
          <select
            style={{
              ...builderStyles.select,
              width: "100%",
              padding: "8px 12px",
              borderRadius: "6px",
              border: "1px solid #d1d5db",
              fontSize: "14px",
            } as any}
            value={fieldValue}
            onChange={(e) => writeValue(field.key, e.target.value)}
          >
            <option value="">Select...</option>
            {field.options?.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        ) : (
          <input
            style={{
              ...builderStyles.input,
              width: "100%",
              padding: "8px 12px",
              borderRadius: "6px",
              border: "1px solid #d1d5db",
              fontSize: "14px",
            }}
            type={field.type === "number" ? "number" : "text"}
            value={fieldValue}
            onChange={(e) => writeValue(field.key, e.target.value)}
            placeholder={field.placeholder}
          />
        )}
      </div>
    );
  };

  return (
    <>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>{headerTitle}</h3>
      </div>

      {/* Standard settings */}
      {isApp && spec ? (
        <>
          <div style={builderStyles.formLabel}>Label</div>
          <input
            style={{
              ...builderStyles.input,
              width: "100%",
              padding: "8px 12px",
              borderRadius: "6px",
              border: "1px solid #d1d5db",
              fontSize: "14px",
            }}
            value={data.label ?? ""}
            onChange={(e) => setData({ label: e.target.value })}
            placeholder="Node label"
          />

          <div style={{ marginTop: 12 }}>
            <div style={{ ...builderStyles.formLabel, fontWeight: 600, color: "#374151" }}>
              {spec.name} Settings
            </div>

            {spec.fields.map((f) => renderField(f))}
          </div>

          <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
            <button
              style={{
                ...builderStyles.delBtn,
                background: "#dc2626",
                color: "white",
                border: "1px solid #dc2626",
                flex: 1,
                padding: "8px 16px",
                borderRadius: "6px",
                fontSize: "14px",
                fontWeight: "500",
                cursor: "pointer",
              }}
              onClick={() => {
                onDeleteNode(node.id);
              }}
            >
              Delete node
            </button>
          </div>
        </>
      ) : (
        <div className="text-secondary" style={{ fontSize: 13 }}>
          Select an app node to configure its options.
        </div>
      )}
    </>
  );
}
