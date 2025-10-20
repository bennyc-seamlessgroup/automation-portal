import type { ReactNode } from "react";

import { builderStyles } from "../styles";

type DrawerProps = {
  open: boolean;
  title?: string;
  onClose: () => void;
  children: ReactNode;
};

export function Drawer({ open, children, onClose, title = "Settings" }: DrawerProps) {
  return (
    <div style={{ ...builderStyles.settingsDrawer, ...(open ? {} : builderStyles.settingsDrawerHidden) }}>
      <div style={builderStyles.headerRow}>
        <div>{title}</div>
        <button
          onClick={onClose}
          style={{
            fontSize: 13,
            color: "#6b7280",
            background: "transparent",
            border: "none",
            cursor: "pointer",
          }}
        >
          Close
        </button>
      </div>
      <div style={{
        padding: 16,
        overflow: "auto",
        flex: 1,
        display: "flex",
        flexDirection: "column",
        height: "100%"
      }}>
        {children}
      </div>
    </div>
  );
}
