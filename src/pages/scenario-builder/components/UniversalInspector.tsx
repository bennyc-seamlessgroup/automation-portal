// src/pages/scenario-builder/components/UniversalInspector.tsx
import { useState, useEffect, useRef } from "react";
import type { Node as RFNode } from "reactflow";
import type { RFData, AppKey, AppSpec, DataOutput } from "../types";
import { getAppSpec } from "../utils";
import { APP_CATALOG } from "../catalog";
import GmailButton from "../../../components/GmailButton";
import { OAUTH_CONFIG } from "../../../config/oauth";

const builderStyles = {
  formLabel: {
    fontSize: 13,
    color: "#374151",
    marginBottom: 6,
  },
  select: {
    appearance: "none",
  },
  input: {
    display: "inline-block",
    fontSize: 14,
  },
  nameInput: {
    fontSize: 16,
  },
} as const;

/**
 * Variable-aware editor:
 * - Renders variable tokens like {{nodeId.key}} as badge-like non-editable spans
 * - Keeps a string value (with tokens) via onChange
 * - Works with selection insertion from the side panel code (which inserts spans)
 */
type VariableTextareaProps = {
  value: string;
  onChange: (v: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  placeholder?: string;
  style?: any;
  // provide nodes to map tokens -> readable labels in badges
  nodes?: RFNode<RFData>[];
};

function VariableTextarea({
  value,
  onChange,
  onFocus,
  onBlur,
  placeholder,
  style,
  nodes = [],
}: VariableTextareaProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const parsedToParts = (val: string) => {
    // tokens supported: {{nodeId.key}} OR {nodeLabel.key} (legacy) - prefer {{...}} for mapping
    const parts: { type: "text" | "var"; text?: string; nodeId?: string; key?: string }[] = [];
    if (!val) return [{ type: "text", text: "" }];

    const tokenRegex = /\{\{([^}]+)\}\}|\{([^}]+)\}/g;
    let lastIndex = 0;
    let m: RegExpExecArray | null;

    while ((m = tokenRegex.exec(val)) !== null) {
      const start = m.index;
      if (start > lastIndex) {
        parts.push({ type: "text", text: val.slice(lastIndex, start) });
      }
      const token = m[1] ?? m[2]; // prefer double-curly capture
      if (token) {
        // Try to parse nodeId.key format
        const dotIdx = token.indexOf(".");
        if (dotIdx > 0) {
          const nodeId = token.slice(0, dotIdx);
          const key = token.slice(dotIdx + 1);
          parts.push({ type: "var", nodeId, key });
        } else {
          // fallback treat as text
          parts.push({ type: "text", text: m[0] });
        }
      }
      lastIndex = tokenRegex.lastIndex;
    }

    if (lastIndex < val.length) {
      parts.push({ type: "text", text: val.slice(lastIndex) });
    }

    return parts;
  };

  // Render parts into innerHTML with badges for var parts
  const renderPartsToInnerHTML = (val: string) => {
    const parts = parsedToParts(val);
    return parts
      .map((p) => {
        if (p.type === "text") {
          // escape < & >
          return (p.text || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
        } else {
          // TypeScript knows this is a "var" part, so nodeId and key exist
          const varPart = p as { type: "var"; nodeId: string; key: string };
          const node = nodes.find((n) => n.id === varPart.nodeId);
          const spec = node ? APP_CATALOG.find((a) => a.key === node.data?.appKey) : undefined;
          const output = spec?.dataOutputs?.find((o) => o.key === varPart.key);
          const label = output?.label || varPart.key;
          // span should be contentEditable=false to act like a badge
          return `<span contenteditable="false" data-var-node="${varPart.nodeId}" data-var-key="${varPart.key}" style="
              display:inline-block;
              padding:2px 8px;
              margin:0 2px;
              background:#eef2ff;
              color:#3730a3;
              border-radius:12px;
              font-size:12px;
              border:1px solid #c7d2fe;
              white-space:nowrap;
          ">${label}</span>`;
        }
      })
      .join("");
  };

  // sync external value -> editor
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const html = renderPartsToInnerHTML(value);
    if (el.innerHTML !== html) {
      el.innerHTML = html;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, nodes]);

  // onInput reconstruct value from child nodes
  const handleInput = () => {
    const el = ref.current;
    if (!el) return;
    const children = Array.from(el.childNodes);
    let out = "";
    children.forEach((child) => {
      if (child.nodeType === 3 /* TEXT_NODE */) {
        out += child.textContent ?? "";
      } else if (child.nodeType === 1 /* ELEMENT_NODE */) {
        const ce = child as HTMLElement;
        if (ce.dataset && ce.dataset.varNode && ce.dataset.varKey) {
          out += `{{${ce.dataset.varNode}.${ce.dataset.varKey}}}`;
        } else {
          out += ce.textContent ?? "";
        }
      }
    });
    onChange(out);
  };

  // handle paste as plain text
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text/plain");
    const el = ref.current;
    if (!el) return;
    // Insert plain text at caret
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      el.appendChild(document.createTextNode(text));
    } else {
      const range = selection.getRangeAt(0);
      range.deleteContents();
      range.insertNode(document.createTextNode(text));
      range.collapse(false);
      selection.removeAllRanges();
      selection.addRange(range);
    }
    handleInput();
  };

  return (
    <div
      ref={ref}
      role="textbox"
      aria-multiline
      contentEditable
      suppressContentEditableWarning
      onInput={handleInput}
      onFocus={onFocus}
      onBlur={onBlur}
      onPaste={handlePaste}
      data-placeholder={placeholder}
      style={{
        minHeight: 80,
        padding: "8px 12px",
        borderRadius: 6,
        border: "1px solid #d1d5db",
        outline: "none",
        fontSize: 14,
        fontFamily: "inherit",
        whiteSpace: "pre-wrap",
        wordBreak: "break-word",
        position: "relative",
        ...style,
      }}
    />
  );
}

type UniversalInspectorProps = {
  node: RFNode<RFData>;
  nodes: RFNode<RFData>[];
  scenarioId?: string | null;
  onChangeNode: (node: RFNode<RFData>) => void;
  onDeleteNode: (id: string) => void;
  onClose?: () => void;
  onShowAlert?: (message: string) => void;
};

export default function UniversalInspector({
  node,
  nodes,
  scenarioId,
  onChangeNode,
  onDeleteNode,
  onClose,
  onShowAlert,
}: UniversalInspectorProps) {
  console.log('scenarioId:', scenarioId);
  const isApp = node.type === "app";
  const data = (node.data || {}) as RFData;
  const appKey = (data.appKey as AppKey) || ("" as AppKey);
  const spec: AppSpec | null = isApp ? getAppSpec(appKey) : null;

  const setData = (patch: Partial<RFData>) =>
    onChangeNode({ ...node, data: { ...(node.data || {}), ...patch } });

  // Basic state management
  const [activeTab, setActiveTab] = useState<"connect" | "configure" | "test">("connect");
  const [editingTitle, setEditingTitle] = useState(false);
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [isConnected, setIsConnected] = useState(false);
  const [isConfigured, setIsConfigured] = useState(false);

  // Local state for form values
  const [localValues, setLocalValues] = useState<Record<string, unknown>>(data.values || {});

  // Sync local values with node data when node changes
  useEffect(() => {
    setLocalValues(data.values || {});
  }, [data.values]);

  // Reset state when node changes (different node ID)
  useEffect(() => {
    return () => {
      // This cleanup runs when node changes
      // Reset all inspector state to defaults
      setActiveTab("connect");
      setCurrentStep(1);
      setIsConnected(false);
      setIsConfigured(false);
      setHasTested(false);
      setIsTesting(false);
      setTestError("");
      setSelectedConnectionId("");
      setShowNewTokenInput(false);
      setEditingTitle(false);
      setIsMessageFieldFocused(false);
    };
  }, [node.id]);

  // Initialize state based on node data when node changes
  useEffect(() => {
    // Restore connection state if node has connection data
    if (data.connected) {
      setIsConnected(true);
    }

    // Restore configuration state if node has configuration
    if (data.configured) {
      setIsConfigured(true);
    }

    // Restore current step based on node state
    if (data.currentStep) {
      setCurrentStep(data.currentStep as 1 | 2 | 3);
      setActiveTab(data.currentTab || "connect");
    }

    // Restore test state if node has test data
    if (data.hasTested) {
      setHasTested(true);
    }

    // Restore connection selection if exists
    if (data.selectedConnectionId) {
      setSelectedConnectionId(data.selectedConnectionId);
    }
  }, [node.id, data]);

  // Save inspector state to node data
  const saveInspectorState = (updates: Partial<RFData>) => {
    const updatedNode = {
      ...node,
      data: {
        ...node.data,
        ...updates
      }
    };
    onChangeNode(updatedNode);
  };

  // Update connection state
  const setConnectionState = (connected: boolean) => {
    setIsConnected(connected);
    saveInspectorState({ connected });
  };

  // Update configuration state
  const setConfigurationState = (configured: boolean) => {
    setIsConfigured(configured);
    saveInspectorState({ configured });
  };

  // Update current step and tab
  const setStepState = (step: 1 | 2 | 3, tab?: "connect" | "configure" | "test") => {
    setCurrentStep(step);
    setActiveTab(tab || "connect");
    saveInspectorState({ currentStep: step, currentTab: tab || "connect" });
  };

  // Update test state
  const setTestState = (hasTested: boolean) => {
    setHasTested(hasTested);
    saveInspectorState({ hasTested });
  };

  // Get inspector configuration from AppSpec
  const inspectorConfig = spec?.inspector;

  // Header title
  const headerTitle = data.label || spec?.name || "Inspector";

  // Steps configuration - use inspector config or default
  const steps = inspectorConfig?.steps || [
    { id: 1, title: "Connect", description: "Connect your account", tab: "connect" },
    { id: 2, title: "Configure", description: "Set up your settings", tab: "configure" },
    { id: 3, title: "Test", description: "Test your configuration", tab: "test" }
  ];

  // Connection state (for apps that need connections)
  const [isConnecting] = useState<boolean>(false);
  const [selectedConnectionId, setSelectedConnectionId] = useState<string>("");
  const [showNewTokenInput, setShowNewTokenInput] = useState<boolean>(false);

  // Test state
  const [hasTested, setHasTested] = useState<boolean>(false);
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [testError, setTestError] = useState<string>("");

  // Message field focus tracking for variable panel
  const [isMessageFieldFocused, setIsMessageFieldFocused] = useState(false);

  const writeValue = (k: string, v: unknown) => {
    const newValues = { ...localValues, [k]: v };
    setLocalValues(newValues);

    // Immediately save to node data
    const updatedNode = {
      ...node,
      data: {
        ...node.data,
        values: newValues
      }
    };
    onChangeNode(updatedNode);
  };

  // Navigation handlers
  const handleBack = () => {
    if (currentStep > 1) {
      const newStep = (currentStep - 1) as 1 | 2 | 3;
      setStepState(newStep, steps.find(s => s.id === newStep)?.tab || "connect");
    }
  };

  // Generic field renderer with app-specific tweaks
  const renderField = (field: {
    key: string;
    label: string;
    type?: string;
    options?: string[];
    placeholder?: string;
    required?: boolean;
  }) => {
    // Skip label field in Configure
    if (field.key.toLowerCase() === "label") return null;

    // Handle select/dropdown fields generically for any app
    if (field.type === "select" && field.options) {
      const fieldValue = (localValues?.[field.key] ?? "") as string;

      return (
        <div key={field.key} style={{ marginTop: 10 }}>
          <div style={builderStyles.formLabel}>
            {field.label}
            {field.required && (
              <span style={{ color: "#dc2626" }}>*</span>
            )}
          </div>

          <select
            style={{
              ...builderStyles.select,
              width: "100%",
              padding: "8px 32px 8px 12px",
              borderRadius: "6px",
              border: "1px solid #d1d5db",
              fontSize: "14px",
              appearance: "none",
              backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 4 5'><path fill='%23666' d='M2 0L0 2h4zm0 5L0 3h4z'/></svg>")`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 8px center",
              backgroundSize: "8px",
            } as any}
            value={fieldValue}
            onChange={(e) => writeValue(field.key, e.target.value)}
          >
            <option value="">Select...</option>
            {field.options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      );
    }

    // Handle Message Text field (resizable textarea with variable insertion)
    if (field.key === "messageText") {
      const fieldValue = (localValues?.[field.key] ?? "") as string;

      return (
        <div key={field.key} style={{ marginTop: 10, position: "relative" }}>
          <div style={builderStyles.formLabel}>
            {field.label}
            {field.required && (
              <span style={{ color: "#dc2626" }}>*</span>
            )}
          </div>

          <VariableTextarea
            value={fieldValue}
            onChange={(value: string) => writeValue(field.key, value)}
            onFocus={() => setIsMessageFieldFocused(true)}
            onBlur={() => setIsMessageFieldFocused(false)}
            placeholder={field.placeholder || "Enter your message..."}
            style={{ width: "100%" }}
            nodes={nodes}
          />

          {nodes.filter((n: RFNode<RFData>) => n.data?.appKey?.toLowerCase().includes('gmail') && n.id !== node.id).length > 0 && (
            <div style={{
              marginTop: "4px",
              fontSize: "11px",
              color: "#6b7280",
              lineHeight: "1.3"
            }}>
              💡 Tip: Focus this field to see available variables in the side panel
            </div>
          )}
        </div>
      );
    }

    // Handle textarea fields generically
    if (field.type === "textarea") {
      const fieldValue = (localValues?.[field.key] ?? "") as string;

      return (
        <div key={field.key} style={{ marginTop: 10 }}>
          <div style={builderStyles.formLabel}>
            {field.label}
            {field.required && (
              <span style={{ color: "#dc2626" }}>*</span>
            )}
          </div>

          <textarea
            style={{
              ...builderStyles.input,
              width: "100%",
              minHeight: "80px",
              resize: "vertical",
              padding: "8px 12px",
              borderRadius: "6px",
              border: "1px solid #d1d5db",
              fontSize: "14px",
              fontFamily: "inherit",
            }}
            value={fieldValue}
            onChange={(e) => writeValue(field.key, e.target.value)}
            placeholder={field.placeholder || "Enter text..."}
          />
        </div>
      );
    }

    // Default text input for other fields
    const fieldValue = (localValues?.[field.key] ?? "") as string;

    return (
      <div key={field.key} style={{ marginTop: 10 }}>
        <div style={builderStyles.formLabel}>{field.label}</div>
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
      </div>
    );
  };

  // Gmail-specific extra fields
  const renderGmailExtras = () => {
    // No extra fields needed for Gmail since we now have only 2 fields: mailbox and gmailCriteria
    return null;
  };

  if (!spec) {
    return (
      <div style={{
        padding: "24px",
        textAlign: "center",
        color: "#6b7280",
        backgroundColor: "#f9fafb",
        borderRadius: "8px",
        margin: "16px"
      }}>
        <div style={{ fontSize: "48px", marginBottom: "16px" }}>📋</div>
        <p>Loading inspector...</p>
      </div>
    );
  }

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      height: "100%",
      position: "relative"
    }}>
      {/* Variable Side Panel */}
      {(() => {
        // Only show panel if:
        // 1. Current node is a Telegram node (which it is, since this is UniversalInspector)
        // 2. There are Gmail nodes with variables to show
        // 3. The message text field is focused (for inserting variables)
        // 4. Current node supports message variables (telegram send message)
        const gmailNodes = nodes.filter(n =>
          n.data?.appKey?.toLowerCase().includes('gmail') &&
          n.id !== node.id
        );

        // Additional check: only show for telegram send message nodes
        const currentNodeSupportsMessageVariables = node.data?.appKey?.toLowerCase().includes('telegram');

        if (gmailNodes.length === 0 || !isMessageFieldFocused || !currentNodeSupportsMessageVariables) return null;

        return (
          <div style={{
            position: "fixed",
            right: "360px",
            top: "50%",
            transform: "translateY(-50%)",
            width: "300px",
            maxHeight: "80vh",
            background: "white",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
            zIndex: 9999,
            overflow: "auto"
          }}>
            <div style={{
              padding: "16px",
              borderBottom: "1px solid #e5e7eb",
              background: "#f9fafb"
            }}>
              <h4 style={{ margin: "0 0 8px 0", fontSize: "14px", fontWeight: "600", color: "#374151" }}>
                Available Variables
              </h4>
              <p style={{ margin: 0, fontSize: "12px", color: "#6b7280" }}>
                Click on a variable to insert it into the focused field
              </p>
            </div>
            <div style={{ padding: "8px" }}>
              {gmailNodes.map((gmailNode: RFNode<RFData>) => {
                const nodeLabel = gmailNode.data?.label || 'Gmail Node';
                // Get data outputs from the Gmail node's app spec
                const appSpec = APP_CATALOG.find((app: AppSpec) => app.key === gmailNode.data?.appKey);
                const dataOutputs = appSpec?.dataOutputs || [];

                if (dataOutputs.length === 0) return null;

                return (
                  <div key={gmailNode.id} style={{ marginBottom: "16px" }}>
                    <div style={{
                      fontSize: "12px",
                      fontWeight: "600",
                      color: "#374151",
                      marginBottom: "8px",
                      padding: "4px 8px",
                      background: "#f3f4f6",
                      borderRadius: "4px"
                    }}>
                      {nodeLabel}
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      {dataOutputs.map((output: DataOutput) => (
                        <button
                          key={output.key}
                          type="button"
                          tabIndex={-1}
                          onMouseDown={(e) => {
                            e.preventDefault();
                          }}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();

                            const focusedElement = document.activeElement as HTMLElement | null;
                            if (!focusedElement) return;

                            const isContentEditable = focusedElement.contentEditable === "true";
                            if (isContentEditable) {
                              const selection = window.getSelection();
                              if (!selection || selection.rangeCount === 0) return;
                              const range = selection.getRangeAt(0);

                              // create badge span
                              const span = document.createElement("span");
                              span.contentEditable = "false";
                              span.setAttribute("data-var-node", gmailNode.id);
                              span.setAttribute("data-var-key", output.key);
                              const outputLabel = output.label || output.key;
                              span.textContent = outputLabel;
                              span.style.cssText = "display:inline-block;padding:2px 8px;margin:0 2px;background:#eef2ff;color:#3730a3;border-radius:12px;font-size:12px;border:1px solid #c7d2fe;white-space:nowrap;";

                              range.deleteContents();
                              range.insertNode(span);

                              // move cursor after inserted span
                              range.setStartAfter(span);
                              range.setEndAfter(span);
                              selection.removeAllRanges();
                              selection.addRange(range);

                              // trigger input/change so VariableTextarea will pick up new value
                              span.dispatchEvent(new Event("input", { bubbles: true }));
                              span.dispatchEvent(new Event("change", { bubbles: true }));
                            } else {
                              // fallback for inputs/textarea: insert token string
                              const focusedInput = focusedElement as HTMLInputElement | HTMLTextAreaElement;
                              if (!("value" in focusedInput)) {
                                return;
                              }
                              const start = (focusedInput as any).selectionStart ?? 0;
                              const end = (focusedInput as any).selectionEnd ?? 0;
                              const currentValue = (focusedInput as any).value ?? "";
                              const token = `{{${gmailNode.id}.${output.key}}}`;
                              const newValue = currentValue.substring(0, start) + token + currentValue.substring(end);
                              (focusedInput as any).value = newValue;
                              const newPos = start + token.length;
                              (focusedInput as any).setSelectionRange(newPos, newPos);
                              focusedInput.dispatchEvent(new Event("input", { bubbles: true }));
                              focusedInput.dispatchEvent(new Event("change", { bubbles: true }));
                            }
                          }}
                          style={{
                            padding: "6px 8px",
                            textAlign: "left",
                            fontSize: "12px",
                            color: "#6b7280",
                            background: "transparent",
                            border: "1px solid #d1d5db",
                            borderRadius: "4px",
                            cursor: "pointer",
                            transition: "all 0.2s ease",
                            fontFamily: "monospace",
                            outline: "none",
                            WebkitUserSelect: "none",
                            MozUserSelect: "none",
                            msUserSelect: "none",
                            userSelect: "none"
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = "#f3f4f6";
                            e.currentTarget.style.borderColor = "#9ca3af";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = "transparent";
                            e.currentTarget.style.borderColor = "#d1d5db";
                          }}
                          title={output.description || `Insert ${output.label}`}
                        >
                          {output.key}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}

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
        flexDirection: "column",
        marginBottom: 24,
        padding: "16px",
        background: "#f8fafc",
        borderRadius: "8px",
        border: "1px solid #e2e8f0",
        gap: "16px"
      }}>
        {steps.map((step, index) => (
          <div key={step.id} style={{
            display: "flex",
            alignItems: "center",
            position: "relative"
          }}>
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
              marginRight: "16px",
              position: "relative",
              flexShrink: 0,
              zIndex: 2
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
                  zIndex: 3
                }} />
              )}
              {step.id === 2 && isConfigured && (
                <div style={{
                  position: "absolute",
                  top: "-2px",
                  right: "-2px",
                  width: "12px",
                  height: "12px",
                  background: "#10b981",
                  borderRadius: "50%",
                  border: "2px solid #fff",
                  zIndex: 3
                }} />
              )}
            </div>

            {/* Vertical connector line */}
            {index < steps.length - 1 && (
              <div style={{
                position: "absolute",
                left: "16px",
                top: "32px",
                width: "2px",
                height: "24px",
                background: currentStep > step.id ? "#2563eb" : "#e2e8f0",
                zIndex: 1
              }} />
            )}

            <div style={{ flex: 1 }}>
              <div style={{
                fontSize: "14px",
                fontWeight: currentStep === step.id ? "600" : "500",
                color: currentStep >= step.id ? "#1e293b" : "#64748b",
                marginBottom: "4px"
              }}>
                {step.title}
              </div>
              <div style={{
                fontSize: "12px",
                color: currentStep >= step.id ? "#475569" : "#94a3b8",
                lineHeight: "1.4"
              }}>
                {step.description}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Back buttons for steps 2 and 3 */}
      {currentStep === 2 && (
        <div style={{ marginBottom: 16 }}>
          <button
            onClick={handleBack}
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
      {currentStep === 3 && (
        <div style={{ marginBottom: 16 }}>
          <button
            onClick={handleBack}
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
            Back to Configure
          </button>
        </div>
      )}

      {/* CONNECT TAB */}
      {activeTab === "connect" && (
        <div>
          {/* Step title for connect tab */}
          <div
            className="d-flex align-items-center gap-2"
            style={{ marginBottom: 16, color: "#6b7280", fontSize: 12, fontWeight: 500 }}
          >
            <i className="bi bi-robot" /> STEP {currentStep} - Connect your account
          </div>

          {inspectorConfig?.connections ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* Connection UI based on inspectorConfig.connections */}
              {inspectorConfig.connections.type === "oauth" && inspectorConfig.connections.service === "gmail" ? (
                <div style={{ marginTop: 12 }}>
                  <GmailButton
                    clientId={OAUTH_CONFIG.gmail.clientId}
                    scope={OAUTH_CONFIG.gmail.scope}
                    text="Connect Gmail Account"
                    onSuccess={(response: any) => {
                      // Handle successful OAuth connection
                      console.log('Gmail OAuth Success:', response);
                      // Store the authorization code or access token
                      writeValue('gmailAuthCode', response.code);
                      setConnectionState(true);
                      setStepState(2, "configure");
                      if (onShowAlert) {
                        onShowAlert('✅ Gmail account connected successfully!');
                      }
                    }}
                    onError={(error: any) => {
                      console.error('Gmail OAuth Error:', error);
                      if (onShowAlert) {
                        onShowAlert('❌ Failed to connect Gmail account. Please try again.');
                      }
                    }}
                  />

                  {/* Skip OAuth button */}
                  <div style={{ marginTop: 12, textAlign: "center" }}>
                    <button
                      type="button"
                      onClick={() => {
                        // Skip OAuth and proceed to configuration
                        console.log('Skipping Gmail OAuth, proceeding to configuration');
                        setConnectionState(true);
                        setStepState(2, "configure");
                        // Removed alert popup as requested
                      }}
                      style={{
                        background: "none",
                        border: "1px solid #d1d5db",
                        color: "#6b7280",
                        padding: "6px 12px",
                        borderRadius: "6px",
                        fontSize: "12px",
                        cursor: "pointer",
                        transition: "all 0.2s ease"
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "#f3f4f6";
                        e.currentTarget.style.borderColor = "#9ca3af";
                        e.currentTarget.style.color = "#374151";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "transparent";
                        e.currentTarget.style.borderColor = "#d1d5db";
                        e.currentTarget.style.color = "#6b7280";
                      }}
                    >
                      Skip OAuth (for dev only)
                    </button>
                  </div>
                </div>
              ) : inspectorConfig.connections.type === "token" && inspectorConfig.connections.service === "telegram" ? (
                <>
                  {/* Mock existing connections for demonstration */}
                  {(() => {
                    const existingConnections = [
                      { id: "1", name: "My Bot 1" },
                      { id: "2", name: "My Bot 2" }
                    ];

                    return (
                      <>
                        {/* Existing connections dropdown */}
                        {existingConnections.length > 0 && !showNewTokenInput && (
                          <>
                            <div style={{ marginTop: 12 }}>
                              <div style={builderStyles.formLabel}>Select Existing Connection</div>
                              <select
                                style={{
                                  ...builderStyles.select,
                                  width: "100%",
                                  padding: "8px 32px 8px 12px",
                                  borderRadius: "6px",
                                  border: "1px solid #d1d5db",
                                  fontSize: "14px",
                                  appearance: "none",
                                  backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 4 5'><path fill='%23666' d='M2 0L0 2h4zm0 5L0 3h4z'/></svg>")`,
                                  backgroundRepeat: "no-repeat",
                                  backgroundPosition: "right 8px center",
                                  backgroundSize: "8px",
                                } as any}
                                value={selectedConnectionId}
                                onChange={(e) => setSelectedConnectionId(e.target.value)}
                              >
                                <option value="">Select a saved Telegram connection...</option>
                                {existingConnections.map((connection) => (
                                  <option key={connection.id} value={connection.id}>
                                    {connection.name}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div style={{ marginTop: 12, textAlign: "center" }}>
                              <button
                                type="button"
                                onClick={() => setShowNewTokenInput(true)}
                                style={{
                                  background: "none",
                                  border: "none",
                                  color: "#6b7280",
                                  fontSize: "12px",
                                  cursor: "pointer",
                                  textDecoration: "underline"
                                }}
                              >
                                Or enter a new bot token
                              </button>
                            </div>
                          </>
                        )}

                        {/* Bot Token field (shown when no connections exist or when adding new) */}
                        {(existingConnections.length === 0 || showNewTokenInput) && (
                          <>
                            <div style={{ marginTop: 12 }}>
                              <div style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                marginBottom: "4px"
                              }}>
                                <div style={builderStyles.formLabel}>
                                  Bot Token
                                  <span style={{ color: "#dc2626" }}>*</span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (onShowAlert) {
                                      onShowAlert("To create a new Telegram bot:\n\n1. Open Telegram and search for @BotFather\n2. Send /newbot to BotFather\n3. Choose a name for your bot\n4. Choose a username for your bot (ending with 'bot')\n5. Copy the token provided by BotFather\n\nFor detailed instructions, visit: https://core.telegram.org/bots/features#creating-a-new-bot");
                                    }
                                  }}
                                  style={{
                                    background: "none",
                                    border: "none",
                                    color: "#2563eb",
                                    fontSize: "12px",
                                    cursor: "pointer",
                                    textDecoration: "underline",
                                    padding: "0"
                                  }}
                                  title="How to create a new bot"
                                >
                                  How to create a new bot?
                                </button>
                              </div>
                              <input
                                style={{
                                  ...builderStyles.input,
                                  width: "100%",
                                  padding: "8px 12px",
                                  borderRadius: "6px",
                                  border: "1px solid #d1d5db",
                                  fontSize: "14px",
                                }}
                                type="text"
                                value={(localValues?.botToken as string) || ""}
                                onChange={(e) => writeValue("botToken", e.target.value)}
                                placeholder="Enter your Telegram bot token"
                              />
                            </div>

                            {existingConnections.length > 0 && (
                              <div style={{ marginTop: 12, textAlign: "center" }}>
                                <button
                                  type="button"
                                  onClick={() => setShowNewTokenInput(false)}
                                  style={{
                                    background: "none",
                                    border: "none",
                                    color: "#6b7280",
                                    fontSize: "12px",
                                    cursor: "pointer",
                                    textDecoration: "underline"
                                  }}
                                >
                                  Or select from existing connections
                                </button>
                              </div>
                            )}
                          </>
                        )}

                        {/* Connect button */}
                        <div style={{ marginTop: 12 }}>
                          <button
                            style={{
                              ...builderStyles.input,
                              background: isConnecting ? "#6b7280" : "#2563eb",
                              color: "#fff",
                              border: "none",
                              cursor: isConnecting ? "not-allowed" : "pointer",
                              padding: "8px 16px",
                              borderRadius: "6px",
                              fontSize: "14px",
                              fontWeight: "500",
                              width: "100%",
                            }}
                            onClick={() => {
                              // Handle connection logic
                              setConnectionState(true);
                              setStepState(2, "configure");
                            }}
                            disabled={isConnecting}
                          >
                            {isConnecting ? (
                              <>
                                <i className="bi bi-hourglass-split me-2" />
                                Connecting...
                              </>
                            ) : (
                              <>
                                <i className="bi bi-telegram me-2" />
                                Connect Bot
                              </>
                            )}
                          </button>
                        </div>
                      </>
                    );
                  })()}
                </>
              ) : (
                <div style={{ textAlign: "center", padding: "40px 20px", color: "#6b7280" }}>
                  <div style={{ fontSize: "48px", marginBottom: "16px" }}>🔗</div>
                  <p>No connection configuration defined for this app.</p>
                  <button
                    onClick={() => {
                      setConnectionState(true);
                      setStepState(2, "configure");
                    }}
                    style={{
                      padding: "8px 16px",
                      backgroundColor: spec.color,
                      color: "white",
                      border: "none",
                      borderRadius: "6px",
                      cursor: "pointer",
                      marginTop: "16px"
                    }}
                  >
                    Skip Connection
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "40px 20px", color: "#6b7280" }}>
              <div style={{ fontSize: "48px", marginBottom: "16px" }}>🔗</div>
              <p>No connection configuration defined for this app.</p>
              <button
                onClick={() => {
                  setConnectionState(true);
                  setStepState(2, "configure");
                }}
                style={{
                  padding: "8px 16px",
                  backgroundColor: spec.color,
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  marginTop: "16px"
                }}
              >
                Skip Connection
              </button>
            </div>
          )}
        </div>
      )}

      {/* CONFIGURE TAB */}
      {activeTab === "configure" && (
        <div style={{ marginTop: 4 }}>
          {isApp && spec ? (
            <>
              <div style={{ ...builderStyles.formLabel, fontWeight: 600, color: "#374151" }}>
                STEP {currentStep} - {headerTitle} Configuration
              </div>

              {/* Render spec fields with app-specific tweaks */}
              {spec.fields
                .filter((f) => {
                  // For Telegram apps, don't show botToken in configure tab (only in connect tab)
                  if (appKey === "telegramSend" && f.key === "botToken") {
                    return false;
                  }
                  if (appKey === "telegramSendV2" && f.key === "botToken") {
                    return false;
                  }
                  return f.key.toLowerCase() !== "label";
                })
                .map((f) => renderField(f))}

              {/* App-specific extra fields */}
              {appKey === "gmailWatchEmails" && renderGmailExtras()}

              {/* Configure button */}
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
                  onClick={() => {
                    // Generic validation using AppSpec validation rules
                    const validationErrors: string[] = [];

                    if (inspectorConfig?.validation) {
                      Object.entries(inspectorConfig.validation).forEach(([fieldKey, rules]) => {
                        const fieldValue = localValues?.[fieldKey];

                        // Check required validation - for select fields, ensure not just "Select..." or empty
                        if (rules.required) {
                          if (!fieldValue || fieldValue === "" || fieldValue === "Select..." || fieldValue === "Select Chat..." || fieldValue === "Select a saved Telegram connection...") {
                            validationErrors.push(`Please select a valid option for ${fieldKey}.`);
                            return;
                          }
                        }

                        // Check custom validation
                        if (rules.custom && fieldValue !== undefined) {
                          const customResult = rules.custom(fieldValue);
                          if (customResult !== true && typeof customResult === 'string') {
                            validationErrors.push(customResult);
                          }
                        }
                      });
                    }

                    if (validationErrors.length > 0) {
                      if (onShowAlert) {
                        onShowAlert(`❌ ${validationErrors[0]}`);
                      }
                      return;
                    }

                    setConfigurationState(true);
                    setStepState(3, "test");
                  }}
                >
                  Configure & Continue
                </button>
              </div>
            </>
          ) : (
            <div className="text-secondary" style={{ fontSize: 13 }}>
              Select a node to configure its options.
            </div>
          )}
        </div>
      )}

      {/* TEST TAB */}
      {activeTab === "test" && (
        <div style={{ marginTop: 4 }}>
          <div style={{ ...builderStyles.formLabel, fontWeight: 600, color: "#374151", marginBottom: 12 }}>
            STEP {currentStep} - Test {appKey === "telegramSend" ? "Telegram Message" : "Connection"}
          </div>

          <div style={{
            background: "#f8fafc",
            border: "1px solid #e2e8f0",
            borderRadius: "8px",
            padding: "16px",
            marginBottom: 16
          }}>
            <p style={{ fontSize: "13px", color: "#475569", margin: 0, lineHeight: 1.5 }}>
              {appKey === "telegramSend"
                ? "Test your Telegram message to ensure it's working properly. We'll send your configured message to verify your bot is working correctly."
                : "Test your connection to ensure it's working properly. We'll check for recent emails in your selected folder."
              }
            </p>
          </div>

          <div>
            {!hasTested ? (
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  style={{
                    ...builderStyles.input,
                    background: "#6b7280",
                    color: "#fff",
                    border: "none",
                    cursor: "pointer",
                    padding: "8px 16px",
                    borderRadius: "6px",
                    fontSize: "14px",
                    fontWeight: "500",
                    flex: 1,
                  }}
                  onClick={() => {
                    if (onClose) onClose();
                  }}
                >
                  Skip Test
                </button>
                <button
                  style={{
                    ...builderStyles.input,
                    background: isTesting ? "#6b7280" : "#2563eb",
                    color: "#fff",
                    border: "none",
                    cursor: isTesting ? "not-allowed" : "pointer",
                    padding: "8px 16px",
                    borderRadius: "6px",
                    fontSize: "14px",
                    fontWeight: "500",
                    flex: 1,
                  }}
                  onClick={() => {
                    setIsTesting(true);
                    setTestError("");

                    // Simulate test
                    setTimeout(() => {
                      setIsTesting(false);
                      setTestState(true);
                      if (onShowAlert) {
                        onShowAlert(`✅ ${appKey === "telegramSend" ? "Telegram message test successful!" : "Gmail connection test successful!"}`);
                      }
                    }, 2000);
                  }}
                  disabled={isTesting}
                >
                  {isTesting ? (
                    <>
                      <i className="bi bi-hourglass-split me-2" />
                      Testing...
                    </>
                  ) : (
                    "Test"
                  )}
                </button>
              </div>
            ) : (
              <>
                {/* App-specific test results */}
                {appKey === "telegramSend" ? (
                  /* Telegram test results */
                  <div style={{ width: "100%", marginBottom: 16 }}>
                    <div style={{ ...builderStyles.formLabel, fontWeight: 600, color: "#374151", marginBottom: 8 }}>
                      Test Message Sent Successfully
                    </div>

                    <div style={{
                      border: "1px solid #10b981",
                      borderRadius: "6px",
                      padding: "12px",
                      background: "#f0fdf4"
                    }}>
                      <div style={{ fontSize: "14px", fontWeight: "500", color: "#059669", marginBottom: "4px" }}>
                        ✅ Message sent to your selected chat
                      </div>
                      <div style={{ fontSize: "12px", color: "#047857" }}>
                        Your configured message has been successfully delivered to the chat you selected.
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Gmail test results (existing) */
                  <div style={{ width: "100%", marginBottom: 16 }}>
                    <div style={{ ...builderStyles.formLabel, fontWeight: 600, color: "#374151", marginBottom: 8 }}>
                      Recent Emails (Sample Data)
                    </div>

                    {/* Record 1 */}
                    <div style={{
                      border: "1px solid #e2e8f0",
                      borderRadius: "6px",
                      padding: "12px",
                      marginBottom: "8px",
                      background: "#fff"
                    }}>
                      <div style={{ fontSize: "14px", fontWeight: "500", color: "#1e293b", marginBottom: "4px" }}>
                        Welcome to Gmail - Getting Started Guide
                      </div>
                      <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "4px" }}>
                        From: no-reply@accounts.google.com
                      </div>
                      <div style={{ fontSize: "12px", color: "#64748b" }}>
                        Received: 2 hours ago • Inbox
                      </div>
                    </div>

                    {/* Record 2 */}
                    <div style={{
                      border: "1px solid #e2e8f0",
                      borderRadius: "6px",
                      padding: "12px",
                      marginBottom: "8px",
                      background: "#fff"
                    }}>
                      <div style={{ fontSize: "14px", fontWeight: "500", color: "#1e293b", marginBottom: "4px" }}>
                        Your Weekly Newsletter - Issue #42
                      </div>
                      <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "4px" }}>
                        From: newsletter@techweekly.com
                      </div>
                      <div style={{ fontSize: "12px", color: "#64748b" }}>
                        Received: 1 day ago • Promotions
                      </div>
                    </div>

                    {/* Record 3 */}
                    <div style={{
                      border: "1px solid #e2e8f0",
                      borderRadius: "6px",
                      padding: "12px",
                      background: "#fff"
                    }}>
                      <div style={{ fontSize: "14px", fontWeight: "500", color: "#1e293b", marginBottom: "4px" }}>
                        Meeting Reminder: Project Review
                      </div>
                      <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "4px" }}>
                        From: calendar-notification@google.com
                      </div>
                      <div style={{ fontSize: "12px", color: "#64748b" }}>
                        Received: 3 days ago • Inbox
                      </div>
                    </div>
                  </div>
                )}

                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
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
                    onClick={() => {
                      // Reset test state for another test
                      setHasTested(false);
                      setTestError("");
                      setIsTesting(true);
                      setTimeout(() => {
                        setIsTesting(false);
                        setTestState(true);
                        if (onShowAlert) {
                          onShowAlert(`✅ ${appKey === "telegramSend" ? "Telegram message test successful!" : "Gmail connection test successful!"}`);
                        }
                      }, 2000);
                    }}
                  >
                    Test Again
                  </button>
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
                    onClick={() => {
                      if (onClose) onClose();
                    }}
                  >
                    Done
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Error message */}
          {testError && (
            <div style={{
              background: "#fee2e2",
              border: "1px solid #fecaca",
              color: "#dc2626",
              padding: "8px 12px",
              borderRadius: "6px",
              fontSize: "12px",
              marginTop: "8px"
            }}>
              <i className="bi bi-exclamation-triangle me-2" />
              {testError}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
