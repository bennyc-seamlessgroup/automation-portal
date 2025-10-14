import { useState, useEffect } from "react";
import type { Node } from "reactflow";

import type { AppKey, AppSpec, RFData } from "../types";
import { builderStyles } from "../styles";
import { getAppSpec } from "../utils";

type GmailInspectorProps = {
  node: Node<RFData>;
  onChangeNode: (node: Node<RFData>) => void;
  onDeleteNode: (id: string) => void;
  onClose?: () => void;
  onManualSave?: () => void;
};

export function GmailInspector({ node, onChangeNode, onDeleteNode, onClose, onManualSave }: GmailInspectorProps) {
  const isApp = node.type === "app";
  const data = (node.data || {}) as RFData;
  const appKey = (data.appKey as AppKey) || ("" as AppKey);
  const spec: AppSpec | null = isApp ? getAppSpec(appKey) : null;

  const setData = (patch: Partial<RFData>) =>
    onChangeNode({ ...node, data: { ...(node.data || {}), ...patch } });

  // Two tabs for Gmail: Connect / Configure
  const [activeTab, setActiveTab] = useState<"connect" | "configure">("connect");

  // Header title editing state
  const [editingTitle, setEditingTitle] = useState(false);

  // Step tracking for wizard-like experience
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [isConnected, setIsConnected] = useState(false);

  // Header title override for Gmail
  const headerTitle = data.label || "Gmail – Watch emails";

  // Step titles and descriptions
  const steps = [
    { id: 1, title: "Connect", description: "Connect your Gmail account" },
    { id: 2, title: "Configure", description: "Set up your email watching preferences" }
  ];

  const handleConnect = () => {
    setIsConnected(true);
    setCurrentStep(2);
    setActiveTab("configure");
  };

  const handleBackToConnect = () => {
    setCurrentStep(1);
    setActiveTab("connect");
  };

  // Local state for form values - separate from node data to avoid triggering unsaved changes
  const [localValues, setLocalValues] = useState<Record<string, unknown>>(data.values || {});

  // Sync local values with node data when node changes
  useEffect(() => {
    setLocalValues(data.values || {});
  }, [data.values]);

  const writeValue = (k: string, v: unknown) => {
    setLocalValues(prev => ({ ...prev, [k]: v }));
  };

  // Apply local values to node data when saving
  const saveSettings = () => {
    // Check if mail folder is selected (required field)
    const mailFolder = localValues["mailbox"] as string;
    if (!mailFolder || mailFolder.trim() === "") {
      alert("Please select a mail folder to watch before saving.");
      return;
    }

    // Apply all local values to node data and trigger save
    setData({ values: localValues });

    // Mark configuration as completed
    setCurrentStep(2); // Already on step 2, but ensure it's marked as completed

    // Trigger manual save if provided
    if (onManualSave) {
      onManualSave();
    }

    // Close the window
    if (onClose) {
      onClose();
    }
  };

  // Generic field renderer with Gmail-specific tweaks
  const renderField = (field: {
    key: string;
    label: string;
    type?: string;
    options?: string[];
    placeholder?: string;
  }) => {
    // Skip label field in Configure
    if (field.key.toLowerCase() === "label") return null;

    // Hide "Gmail account" field in Configure
    const normalizedLabel = field.label.trim().toLowerCase();
    if (normalizedLabel === "gmail account") return null;

    // Rename "Email Category" → "Mail folder to watch *" and add "All mail" option
    let displayLabel = field.label;
    let options = field.options ?? [];
    if (normalizedLabel === "email category") {
      displayLabel = "Mail folder to watch *";
      if (!options.map((o) => o.toLowerCase()).includes("all mail")) {
        options = [...options, "All mail"];
      }
    }

    const fieldValue = (localValues?.[field.key] ?? "") as string;

    return (
      <div key={field.key} style={{ marginTop: 10 }}>
        <div style={builderStyles.formLabel}>{displayLabel}</div>
        {field.type === "select" ? (
          <select
            style={{
              ...builderStyles.select,
              width: "100%",
              padding: "8px 32px 8px 12px", // Added right padding for arrow
              borderRadius: "6px",
              border: "1px solid #d1d5db",
              fontSize: "14px",
              appearance: "none", // Remove default styling
              backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 4 5'><path fill='%23666' d='M2 0L0 2h4zm0 5L0 3h4z'/></svg>")`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 8px center",
              backgroundSize: "8px",
            } as any}
            value={fieldValue}
            onChange={(e) => writeValue(field.key, e.target.value)}
          >
            <option value="">Select...</option>
            {options.map((option) => (
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

  // Gmail-specific extra fields
  const renderGmailExtras = () => {
    // Label selector
    const labelValue = (localValues["gmailLabel"] as string) ?? "";
    const labelOptions = [
      "Any label",
      "Starred",
      "Important",
      "Promotions",
      "Social",
      "Updates",
      "Forums",
    ];

    // Criteria selector
    const criteriaValue = (localValues["gmailCriteria"] as string) ?? "";
    const criteriaOptions = ["All Messages", "Only Read Messages", "Only Unread Messages"];

    return (
      <>
        {/* Label */}
        <div style={{ marginTop: 10 }}>
          <div style={builderStyles.formLabel}>Label</div>
          <select
            style={{
              ...builderStyles.select,
              width: "100%",
              padding: "8px 32px 8px 12px", // Added right padding for arrow
              borderRadius: "6px",
              border: "1px solid #d1d5db",
              fontSize: "14px",
              appearance: "none", // Remove default styling
              backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 4 5'><path fill='%23666' d='M2 0L0 2h4zm0 5L0 3h4z'/></svg>")`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 8px center",
              backgroundSize: "8px",
            } as any}
            value={labelValue}
            onChange={(e) => writeValue("gmailLabel", e.target.value)}
          >
            <option value="">Select...</option>
            {labelOptions.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </div>

        {/* Criteria */}
        <div style={{ marginTop: 10 }}>
          <div style={builderStyles.formLabel}>Criteria</div>
          <select
            style={{
              ...builderStyles.select,
              width: "100%",
              padding: "8px 32px 8px 12px", // Added right padding for arrow
              borderRadius: "6px",
              border: "1px solid #d1d5db",
              fontSize: "14px",
              appearance: "none", // Remove default styling
              backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 4 5'><path fill='%23666' d='M2 0L0 2h4zm0 5L0 3h4z'/></svg>")`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 8px center",
              backgroundSize: "8px",
            } as any}
            value={criteriaValue}
            onChange={(e) => writeValue("gmailCriteria", e.target.value)}
          >
            <option value="">Select...</option>
            {criteriaOptions.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </div>

        {/* Save Setting button */}
        <div style={{ marginTop: 16 }}>
          <button
            style={{
              ...builderStyles.input,
              background: "#16a34a",
              color: "#fff",
              border: "none",
              cursor: "pointer",
              padding: "8px 16px",
              borderRadius: "6px",
              fontSize: "14px",
              fontWeight: "500",
              width: "100%",
            }}
            onClick={saveSettings}
          >
            Save Setting
          </button>
        </div>
      </>
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
          position: "relative",
        }}
      >
        {editingTitle ? (
          <input
            autoFocus
            value={data.label || ""}
            onChange={(e) => setData({ label: e.target.value })}
            onBlur={() => setEditingTitle(false)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                setEditingTitle(false);
              }
            }}
            style={{
              ...builderStyles.nameInput,
              fontSize: 16,
              fontWeight: 600,
              border: "1px solid #e5e7eb",
              outline: "none",
              background: "transparent",
              padding: "6px 8px",
              margin: 0,
            }}
          />
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>{headerTitle}</h3>
            <button
              onClick={() => setEditingTitle(true)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "2px",
                borderRadius: "4px",
                color: "#6b7280",
                fontSize: "14px",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#f3f4f6";
                e.currentTarget.style.color = "#374151";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "none";
                e.currentTarget.style.color = "#6b7280";
              }}
              title="Edit title"
            >
              <i className="bi bi-pencil-square" />
            </button>
          </div>
        )}
        {/* Trash icon in top right corner */}
        <button
          onClick={() => onDeleteNode(node.id)}
          style={{
            position: "absolute",
            top: -4,
            right: -4,
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "4px",
            borderRadius: "4px",
            color: "#6b7280",
            fontSize: "16px",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#fee2e2";
            e.currentTarget.style.color = "#dc2626";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "none";
            e.currentTarget.style.color = "#6b7280";
          }}
          title="Delete node"
        >
          <i className="bi bi-trash" />
        </button>
      </div>

      {/* Step indicator */}
      <div style={{
        display: "flex",
        alignItems: "center",
        marginBottom: 24,
        padding: "16px",
        background: "#f8fafc",
        borderRadius: "8px",
        border: "1px solid #e2e8f0"
      }}>
        {steps.map((step, index) => (
          <div key={step.id} style={{ display: "flex", alignItems: "center", flex: 1, position: "relative" }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              background: currentStep >= step.id ? "#2563eb" : "#e2e8f0",
              color: currentStep >= step.id ? "#fff" : "#64748b",
              fontSize: "14px",
              fontWeight: "600",
              marginRight: "12px",
              position: "relative"
            }}>
              <span>{step.id}</span>
              {step.id === 1 && isConnected && (
                <div style={{
                  position: "absolute",
                  top: "-2px",
                  right: "-2px",
                  width: "12px",
                  height: "12px",
                  background: "#10b981",
                  borderRadius: "50%",
                  border: "2px solid #fff",
                  zIndex: 1
                }} />
              )}
              {step.id === 2 && (localValues["mailbox"] as string) && (localValues["mailbox"] as string).trim() !== "" && (
                <div style={{
                  position: "absolute",
                  top: "-2px",
                  right: "-2px",
                  width: "12px",
                  height: "12px",
                  background: "#10b981",
                  borderRadius: "50%",
                  border: "2px solid #fff",
                  zIndex: 1
                }} />
              )}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{
                fontSize: "14px",
                fontWeight: currentStep === step.id ? "600" : "500",
                color: currentStep >= step.id ? "#1e293b" : "#64748b",
                marginBottom: "2px"
              }}>
                {step.title}
              </div>
              <div style={{
                fontSize: "12px",
                color: currentStep >= step.id ? "#475569" : "#94a3b8"
              }}>
                {step.description}
              </div>
            </div>
            {index < steps.length - 1 && (
              <div style={{
                width: "40px",
                height: "2px",
                background: currentStep > step.id ? "#2563eb" : "#e2e8f0",
                margin: "0 16px"
              }} />
            )}
          </div>
        ))}
      </div>

      {/* Back button for step 2 */}
      {currentStep === 2 && (
        <div style={{ marginBottom: 16 }}>
          <button
            onClick={handleBackToConnect}
            style={{
              background: "none",
              border: "1px solid #d1d5db",
              color: "#6b7280",
              padding: "6px 12px",
              borderRadius: "6px",
              fontSize: "12px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px"
            }}
          >
            <i className="bi bi-arrow-left" />
            Back to Connect
          </button>
        </div>
      )}

      {/* Tab navigation - hidden, using step-based interface instead */}
      <div style={{ display: "none" }}>
        {(["connect", "configure"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            style={{
              padding: "8px 16px",
              border: "none",
              background: "transparent",
              cursor: "pointer",
              fontSize: 14,
              fontWeight: activeTab === t ? 600 : 400,
              color: activeTab === t ? "#2563eb" : "#6b7280",
              borderBottom: activeTab === t ? "2px solid #2563eb" : "2px solid transparent",
              transition: "all 0.2s ease",
            }}
          >
            {t === "connect" ? "Connect" : "Configure"}
          </button>
        ))}
      </div>

      {/* CONNECT TAB */}
      {activeTab === "connect" && (
        <div>
          {/* Gmail connect button */}
          <div style={{ marginTop: 12 }}>
            <div
              className="d-flex align-items-center gap-2"
              style={{ marginBottom: 6, color: "#6b7280", fontSize: 12 }}
            >
              <i className="bi bi-plug" /> Connect your Gmail account
            </div>
            <button
              style={{
                ...builderStyles.input,
                background: "#2563eb",
                color: "#fff",
                border: "none",
                cursor: "pointer",
                padding: "8px 16px",
                borderRadius: "6px",
                fontSize: "14px",
                fontWeight: "500",
                width: "100%",
              }}
              onClick={handleConnect}
            >
              <i className="bi bi-google me-2" />
              Connect Gmail
            </button>
          </div>
        </div>
      )}

      {/* CONFIGURE TAB */}
      {activeTab === "configure" && (
        <div style={{ marginTop: 4 }}>
          {isApp && spec ? (
            <>
              <div style={{ ...builderStyles.formLabel, fontWeight: 600, color: "#374151" }}>
                {headerTitle} Configuration
              </div>

              {/* Render spec fields with Gmail-specific tweaks */}
              {spec.fields
                .filter((f) => f.key.toLowerCase() !== "label")
                .map((f) => renderField(f))}

              {/* Gmail extras */}
              {renderGmailExtras()}
            </>
          ) : (
            <div className="text-secondary" style={{ fontSize: 13 }}>
              Select a Gmail node to configure its options.
            </div>
          )}
        </div>
      )}
    </>
  );
}
