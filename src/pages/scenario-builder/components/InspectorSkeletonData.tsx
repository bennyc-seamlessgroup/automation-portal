// src/pages/scenario-builder/components/InspectorSkeletonData.tsx
import React from "react";
import { builderStyles } from "../styles";

interface InspectorSkeletonDataProps {
  type: "gmail" | "telegram";
  rows?: number;
}

const InspectorSkeletonData: React.FC<InspectorSkeletonDataProps> = ({ type, rows = 3 }) => {
  const skeletonStyle = {
    background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
    backgroundSize: '200% 100%',
    animation: 'skeleton-loading 1.5s ease-in-out infinite',
    borderRadius: '4px',
    display: 'block'
  };

  if (type === "gmail") {
    return (
      <div style={{ marginBottom: 16 }}>
        <div style={{ ...builderStyles.formLabel, fontWeight: 600, color: "#374151", marginBottom: 8 }}>
          Recent Emails (Loading...)
        </div>

        {Array.from({ length: rows }, (_, index) => (
          <div
            key={index}
            style={{
              border: "1px solid #e2e8f0",
              borderRadius: "6px",
              padding: "12px",
              marginBottom: "8px",
              background: "#fff"
            }}
          >
            <div style={{ fontSize: "14px", fontWeight: "500", color: "#1e293b", marginBottom: "4px" }}>
              <div style={{ ...skeletonStyle, height: '16px', width: '70%' }} />
            </div>
            <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "4px" }}>
              <div style={{ ...skeletonStyle, height: '12px', width: '50%' }} />
            </div>
            <div style={{ fontSize: "12px", color: "#64748b" }}>
              <div style={{ ...skeletonStyle, height: '12px', width: '40%' }} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === "telegram") {
    return (
      <div style={{ marginBottom: 16 }}>
        <div style={{ ...builderStyles.formLabel, fontWeight: 600, color: "#374151", marginBottom: 8 }}>
          Test Message Preview (Loading...)
        </div>

        <div style={{
          background: "#f8fafc",
          border: "1px solid #e2e8f0",
          borderRadius: "8px",
          padding: "16px",
          marginBottom: 16
        }}>
          <div style={{ fontSize: "13px", color: "#475569", margin: 0, lineHeight: 1.5 }}>
            <div style={{ ...skeletonStyle, height: '14px', width: '80%', marginBottom: '8px' }} />
            <div style={{ ...skeletonStyle, height: '14px', width: '60%' }} />
          </div>
        </div>

        {Array.from({ length: rows }, (_, index) => (
          <div
            key={index}
            style={{
              border: "1px solid #e2e8f0",
              borderRadius: "6px",
              padding: "12px",
              marginBottom: "8px",
              background: "#fff",
              display: "flex",
              alignItems: "center",
              gap: "12px"
            }}
          >
            <div style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              backgroundColor: "#e2e8f0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}>
              <div style={{ ...skeletonStyle, height: '20px', width: '20px' }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "14px", fontWeight: "500", color: "#1e293b", marginBottom: "4px" }}>
                <div style={{ ...skeletonStyle, height: '16px', width: '60%' }} />
              </div>
              <div style={{ fontSize: "12px", color: "#64748b" }}>
                <div style={{ ...skeletonStyle, height: '12px', width: '40%' }} />
              </div>
            </div>
            <div style={{ fontSize: "12px", color: "#64748b" }}>
              <div style={{ ...skeletonStyle, height: '12px', width: '30px' }} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return null;
};

export default InspectorSkeletonData;
