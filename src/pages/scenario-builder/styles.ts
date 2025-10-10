import { NODE_H, NODE_W, PLUS_GAP, PLUS_SIZE } from "./constants";

export const builderStyles = {
  canvasWrap: { position: "relative" as const, flex: 1 },

  roundNode: {
    width: NODE_W, height: NODE_H, borderRadius: "50%",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)", border: "1px solid #e5e7eb",
    background: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
    position: "relative" as const, textAlign: "center" as const, padding: 4,
  },
  dashed: { borderStyle: "dashed", borderColor: "#c7d2fe", background: "#fbfdff" },
  chip: { position: "absolute" as const, top: -8, left: "50%", transform: "translateX(-50%)",
    fontSize: 11, color: "#fff", borderRadius: 12, padding: "1px 6px", whiteSpace: "nowrap" as const },
  plusOnNode: { position: "absolute" as const, left: "50%", bottom: -(PLUS_GAP + PLUS_SIZE / 2),
    marginLeft: -(PLUS_SIZE / 2), width: PLUS_SIZE, height: PLUS_SIZE, borderRadius: "50%",
    background: "#fff", border: "1px solid #e5e7eb", boxShadow: "0 2px 8px rgba(0,0,0,0.08)", cursor: "pointer", zIndex: 2 },

  settingsDrawer: {
    position: "fixed" as const, top: 0, right: 0, width: 360, height: "100%",
    background: "#fff", borderLeft: "1px solid #e5e7eb", boxShadow: "-4px 0 16px rgba(0,0,0,0.06)",
    transform: "translateX(0)", transition: "transform 180ms ease", display: "flex", flexDirection: "column" as const,
  },
  settingsDrawerHidden: { transform: "translateX(100%)" },
  headerRow: { display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "12px 16px", borderBottom: "1px solid #e5e7eb", fontWeight: 600 },
  formLabel: { fontSize: 12, color: "#6b7280" },
  input: { marginTop: 6, width: "100%", border: "1px solid #e5e7eb", borderRadius: 8, padding: "8px 10px", fontSize: 13 },
  select: { marginTop: 6, width: "100%", border: "1px solid #e5e7eb", borderRadius: 8, padding: "8px 10px", fontSize: 13, background: "#fff" },
  delBtn: { marginTop: 12, background: "#ef4444", color: "#fff", border: "none", padding: "8px 12px", borderRadius: 8, fontSize: 13, cursor: "pointer" },

  headerOverlay: {
    position: "absolute" as const, top: 12, left: 12, background: "#fff", border: "1px solid #e5e7eb",
    borderRadius: 12, boxShadow: "0 2px 10px rgba(0,0,0,0.06)", padding: "8px 12px",
    display: "flex", alignItems: "center", gap: 10, zIndex: 10,
  },
  backBtn: { display: "flex", alignItems: "center", gap: 6, background: "transparent", border: "none", cursor: "pointer", color: "#374151", fontSize: 13 },
  nameBtn: { background: "transparent", border: "none", cursor: "pointer", color: "#111827", fontSize: 14, fontWeight: 600 },
  nameInput: { border: "1px solid #e5e7eb", borderRadius: 8, padding: "6px 8px", fontSize: 14 },

  /* Top action bar (Zapier-like) */
  topActionBar: {
    position: "absolute" as const, right: 12, top: 12, zIndex: 10,
    display: "flex", gap: 8, alignItems: "center", background: "#fff",
    border: "1px solid #e5e7eb", borderRadius: 999, padding: "6px 8px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
  },
  pillBtn: { border: "1px solid #e5e7eb", background: "#fff", padding: "6px 10px", borderRadius: 999, cursor: "pointer", fontSize: 13 },

  /* Bottom action bar (Make-like) */
  bottomBar: {
    position: "absolute" as const, left: "50%", transform: "translateX(-50%)", bottom: 80, zIndex: 10,
    background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, padding: 8, boxShadow: "0 6px 16px rgba(0,0,0,0.12)",
    display: "flex", alignItems: "center", gap: 10,
  },
  bottomGroup: { display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" },
  divider: { width: 1, height: 24, background: "#e5e7eb" },
  toggleWrap: { display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 10px", borderRadius: 999, background: "#f9fafb", border: "1px solid #e5e7eb", whiteSpace: "nowrap" },
  tinyBtn: { border: "1px solid #e5e7eb", background: "#fff", padding: "6px 8px", borderRadius: 8, cursor: "pointer", fontSize: 13 },
  menuWrap: { position: "relative" as const },
  menuList: { position: "absolute" as const, right: 0, bottom: "110%", background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, boxShadow: "0 8px 24px rgba(0,0,0,0.15)", overflow: "hidden" },
  menuItem: { padding: "8px 12px", fontSize: 13, cursor: "pointer", whiteSpace: "nowrap" as const, background: "#fff", borderBottom: "1px solid #f3f4f6" },
};

