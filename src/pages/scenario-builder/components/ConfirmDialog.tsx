import type { KeyboardEvent } from "react";

import { builderStyles } from "../styles";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmStyle?: "danger" | "primary";
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDialog({
  open,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmStyle = "danger",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape") onCancel();
    if (e.key === "Enter") onConfirm();
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.35)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 70,
      }}
      onClick={onCancel}
      onKeyDown={handleKeyDown}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "min(400px,90vw)",
          background: "#fff",
          borderRadius: 12,
          border: "1px solid #e5e7eb",
          boxShadow: "0 18px 36px rgba(0,0,0,0.2)",
        }}
      >
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #e5e7eb" }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: "#111827" }}>{title}</h3>
        </div>
        <div style={{ padding: "16px 20px" }}>
          <p style={{ margin: 0, fontSize: 14, color: "#374151", lineHeight: 1.5 }}>{message}</p>
        </div>
        <div
          style={{
            padding: "12px 20px",
            borderTop: "1px solid #e5e7eb",
            display: "flex",
            justifyContent: "flex-end",
            gap: 8,
          }}
        >
          <button
            style={{
              ...builderStyles.tinyBtn,
              background: "#f3f4f6",
              borderColor: "#d1d5db",
              color: "#374151",
            } as any}
            onClick={onCancel}
          >
            {cancelText}
          </button>
          <button
            style={{
              ...builderStyles.tinyBtn,
              background: confirmStyle === "danger" ? "#dc2626" : "#2563eb",
              borderColor: confirmStyle === "danger" ? "#dc2626" : "#2563eb",
              color: "#fff",
            } as any}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
