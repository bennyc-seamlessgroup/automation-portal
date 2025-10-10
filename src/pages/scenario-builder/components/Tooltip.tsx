import type { ReactNode } from "react";

type TooltipProps = {
  id: string;
  text: string;
  hoveredId: string | null;
  onHover: (id: string | null) => void;
  children: ReactNode;
};

export function Tooltip({ children, text, id, hoveredId, onHover }: TooltipProps) {
  const show = hoveredId === id;
  return (
    <div
      style={{ position: "relative", display: "inline-block" }}
      onMouseEnter={() => onHover(id)}
      onMouseLeave={() => onHover(null)}
    >
      {children}
      {show && (
        <div
          style={{
            position: "absolute",
            bottom: "100%",
            left: "50%",
            transform: "translateX(-50%)",
            background: "rgba(0, 0, 0, 0.8)",
            color: "white",
            padding: "4px 8px",
            borderRadius: 4,
            fontSize: 12,
            whiteSpace: "nowrap",
            zIndex: 1000,
            pointerEvents: "none",
            marginBottom: 4,
          }}
        >
          {text}
        </div>
      )}
    </div>
  );
}
