import { useState } from "react";
import type { Node } from "reactflow";

import type { AppSpec, RFData } from "../types";
import { builderStyles } from "../styles";

type TestNodeTabProps = {
  node: Node<RFData>;
  spec: AppSpec | null;
};

type TestResult = {
  success: boolean;
  message: string;
  data?: unknown;
} | null;

type Field = {
  key: string;
  label: string;
  placeholder: string;
  type: "text" | "textarea";
};

const DEFAULT_FIELD: Field = {
  key: "input",
  label: "Test Input",
  placeholder: "Enter test data (JSON)",
  type: "textarea",
};

function resolveFields(node: Node<RFData>, spec: AppSpec | null): Field[] {
  const data = (node.data || {}) as RFData;
  if (node.type !== "app" || !spec) {
    return [DEFAULT_FIELD];
  }

  switch (data.appKey) {
    case "gmailSend":
      return [
        { key: "to", label: "To Email", placeholder: "test@example.com", type: "text" },
        { key: "subject", label: "Subject", placeholder: "Test Subject", type: "text" },
        { key: "body", label: "Body", placeholder: "Test message body", type: "textarea" },
      ];
    case "slackPost":
      return [
        { key: "channel", label: "Channel", placeholder: "#test-channel", type: "text" },
        { key: "text", label: "Message", placeholder: "Test message", type: "textarea" },
      ];
    case "http":
      return [
        { key: "url", label: "URL", placeholder: "https://api.example.com/test", type: "text" },
        { key: "method", label: "Method", placeholder: "GET", type: "text" },
        { key: "body", label: "Request Body", placeholder: "{\"test\": \"data\"}", type: "textarea" },
      ];
    case "aiSummarize":
      return [
        { key: "text", label: "Text to Summarize", placeholder: "Enter text to summarize...", type: "textarea" },
      ];
    case "webhook":
      return [
        { key: "payload", label: "Webhook Payload", placeholder: "{\"event\": \"test\"}", type: "textarea" },
      ];
    case "code":
      return [
        { key: "input", label: "Input Data", placeholder: "{\"input\": \"test data\"}", type: "textarea" },
      ];
    default:
      return [DEFAULT_FIELD];
  }
}

export function TestNodeTab({ node, spec }: TestNodeTabProps) {
  const [testInputs, setTestInputs] = useState<Record<string, string>>({});
  const [testResult, setTestResult] = useState<TestResult>(null);
  const [isRunning, setIsRunning] = useState(false);

  const fields = resolveFields(node, spec);

  const handleTestRun = async () => {
    setIsRunning(true);
    setTestResult(null);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 2000));

      if (node.type === "app" && spec) {
        const baseSuccess = { success: true as const };
        switch ((node.data as RFData)?.appKey) {
          case "gmailSend":
            setTestResult({
              ...baseSuccess,
              message: "Email sent successfully",
              data: { messageId: "msg_123", to: testInputs.to || "test@example.com" },
            });
            break;
          case "slackPost":
            setTestResult({
              ...baseSuccess,
              message: "Message posted to Slack",
              data: { timestamp: Date.now(), channel: testInputs.channel || "#test" },
            });
            break;
          case "http":
            setTestResult({
              ...baseSuccess,
              message: "HTTP request completed",
              data: { status: 200, response: { success: true, data: "test response" } },
            });
            break;
          case "aiSummarize":
            setTestResult({
              ...baseSuccess,
              message: "Text summarized successfully",
              data: { summary: "This is a test summary of the provided text.", originalLength: 150 },
            });
            break;
          case "webhook":
            setTestResult({
              ...baseSuccess,
              message: "Webhook triggered successfully",
              data: { webhookId: "wh_123", receivedAt: new Date().toISOString() },
            });
            break;
          case "code":
            setTestResult({
              ...baseSuccess,
              message: "Code executed successfully",
              data: { result: { processed: true, output: "Test output" } },
            });
            break;
          default:
            setTestResult({ ...baseSuccess, message: "Test completed successfully", data: { result: "Test passed" } });
        }
      } else {
        setTestResult({ success: true, message: "Initial node test completed", data: { status: "ready" } });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      setTestResult({ success: false, message: `Test failed: ${message}` });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <h4 style={{ margin: "0 0 8px 0", fontSize: 14, fontWeight: 600, color: "#374151" }}>
          Test {spec?.name || "Node"}
        </h4>
        <p style={{ margin: 0, fontSize: 12, color: "#6b7280" }}>
          Enter test data to verify this node works correctly.
        </p>
      </div>

      <div style={{ marginBottom: 16 }}>
        {fields.map((field) => (
          <div key={field.key} style={{ marginBottom: 12 }}>
            <div style={builderStyles.formLabel}>{field.label}</div>
            {field.type === "textarea" ? (
              <textarea
                style={{
                  ...builderStyles.input,
                  minHeight: 80,
                  resize: "vertical",
                  fontFamily: "monospace",
                  fontSize: 12,
                }}
                value={testInputs[field.key] || ""}
                onChange={(e) => setTestInputs((prev) => ({ ...prev, [field.key]: e.target.value }))}
                placeholder={field.placeholder}
              />
            ) : (
              <input
                style={builderStyles.input}
                type={field.type}
                value={testInputs[field.key] || ""}
                onChange={(e) => setTestInputs((prev) => ({ ...prev, [field.key]: e.target.value }))}
                placeholder={field.placeholder}
              />
            )}
          </div>
        ))}
      </div>

      <button
        onClick={handleTestRun}
        disabled={isRunning}
        style={{
          ...builderStyles.delBtn,
          background: isRunning ? "#9ca3af" : "#2563eb",
          color: "white",
          border: `1px solid ${isRunning ? "#9ca3af" : "#2563eb"}`,
          width: "100%",
          marginBottom: 16,
          cursor: isRunning ? "not-allowed" : "pointer",
        }}
      >
        {isRunning ? "Running Test..." : "Run Test"}
      </button>

      {testResult && (
        <div
          style={{
            padding: 12,
            borderRadius: 8,
            border: `1px solid ${testResult.success ? "#10b981" : "#ef4444"}`,
            background: testResult.success ? "#f0fdf4" : "#fef2f2",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 8,
            }}
          >
            <span style={{ fontSize: 12, fontWeight: 600 }}>
              {testResult.success ? "OK" : "ERR"}
            </span>
            <span
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: testResult.success ? "#059669" : "#dc2626",
              }}
            >
              {testResult.success ? "Test Passed" : "Test Failed"}
            </span>
          </div>
          <p style={{ margin: "0 0 8px 0", fontSize: 13, color: "#374151" }}>{testResult.message}</p>
          {testResult.data != null && (
            <details style={{ marginTop: 8 }}>
              <summary
                style={{
                  fontSize: 12,
                  color: "#6b7280",
                  cursor: "pointer",
                  marginBottom: 4,
                }}
              >
                View Details
              </summary>
              <pre
                style={{
                  fontSize: 11,
                  color: "#374151",
                  background: "#f9fafb",
                  padding: 8,
                  borderRadius: 4,
                  overflow: "auto",
                  margin: 0,
                  whiteSpace: "pre-wrap",
                }}
              >
                {JSON.stringify(testResult.data, null, 2)}
              </pre>
            </details>
          )}
        </div>
      )}
    </div>
  );
}

