import React from "react";

interface ScenarioBuilderLoadingProps {
  scenariosLoading: boolean;
  isInitialLoading: boolean;
}

export const ScenarioBuilderLoading: React.FC<ScenarioBuilderLoadingProps> = ({
  scenariosLoading,
  isInitialLoading
}) => {
  if (!scenariosLoading && !isInitialLoading) {
    return null;
  }

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: "rgba(255, 255, 255, 0.98)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 999999,
      fontSize: 18,
      color: "#6b7280"
    }}>
      <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 16
      }}>
        <div style={{
          width: 40,
          height: 40,
          border: "3px solid #e5e7eb",
          borderTop: "3px solid #3b82f6",
          borderRadius: "50%",
          animation: "spin 1s linear infinite"
        }} />
        <div>Loading Scenario Builder...</div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );
};
