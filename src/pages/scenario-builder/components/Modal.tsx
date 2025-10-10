import type { ReactNode } from "react";

import { builderStyles } from "../styles";

type ModalProps = {
  title: string;
  children: ReactNode;
  onClose: () => void;
};

export function Modal({ title, children, onClose }: ModalProps) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.35)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 60,
      }}
      onClick={onClose}
      onKeyDown={(e) => e.key === "Escape" && onClose()}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "min(680px,94vw)",
          maxHeight: "80vh",
          overflow: "auto",
          background: "#fff",
          borderRadius: 12,
          border: "1px solid #e5e7eb",
          boxShadow: "0 18px 36px rgba(0,0,0,0.2)",
        }}
      >
        <div style={{ padding: "12px 16px", borderBottom: "1px solid #e5e7eb", fontWeight: 600 }}>{title}</div>
        <div style={{ padding: 16 }}>{children}</div>
        <div style={{ padding: 12, borderTop: "1px solid #e5e7eb", display: "flex", justifyContent: "flex-end" }}>
          <button style={builderStyles.tinyBtn as any} onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
