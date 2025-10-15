interface AppSkeletonGridProps {
  count: number;
}

export default function AppSkeletonGrid({ count }: AppSkeletonGridProps) {
  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 10 }}>
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            style={{
              border: "1px solid #e5e7eb",
              borderRadius: 12,
              padding: 12,
              background: "#fff",
              display: "flex",
              flexDirection: "column",
              gap: 6,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  background: "#f3f4f6",
                  animation: "pulse 1.5s ease-in-out infinite",
                }}
              />
              <div
                style={{
                  height: 16,
                  flex: 1,
                  background: "#f3f4f6",
                  borderRadius: 4,
                  animation: "pulse 1.5s ease-in-out infinite",
                }}
              />
            </div>
            <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
              {[1, 2].map((j) => (
                <div
                  key={j}
                  style={{
                    height: 20,
                    width: 40 + Math.random() * 20,
                    background: "#f3f4f6",
                    borderRadius: 12,
                    animation: "pulse 1.5s ease-in-out infinite",
                  }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
    </>
  );
}
