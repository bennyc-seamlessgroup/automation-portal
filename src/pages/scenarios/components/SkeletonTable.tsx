import React from 'react';

const SkeletonRow: React.FC = () => {
  const skeletonStyle = {
    background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
    backgroundSize: '200% 100%',
    animation: 'skeleton-loading 1.5s ease-in-out infinite',
    borderRadius: '4px',
    display: 'block'
  };

  return (
    <tr>
      {/* Name column */}
      <td style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        <div style={{ ...skeletonStyle, height: '20px', width: '80%' }} />
      </td>

      {/* Apps column */}
      <td className="text-secondary text-center">
        <div style={{ ...skeletonStyle, height: '16px', width: '60px', margin: '0 auto' }} />
      </td>

      {/* Last modified column */}
      <td className="text-secondary">
        <div style={{ ...skeletonStyle, height: '14px', width: '70%' }} />
      </td>

      {/* Status column */}
      <td className="text-center">
        <div style={{ ...skeletonStyle, height: '20px', width: '40px', margin: '0 auto' }} />
      </td>

      {/* Owner column */}
      <td className="text-center">
        <div style={{
          ...skeletonStyle,
          height: '24px',
          width: '24px',
          borderRadius: '50%',
          margin: '0 auto'
        }} />
      </td>

      {/* Actions column */}
      <td className="text-center">
        <div style={{ ...skeletonStyle, height: '16px', width: '16px', margin: '0 auto' }} />
      </td>
    </tr>
  );
};

const SkeletonTable: React.FC<{ rows?: number }> = ({ rows = 5 }) => {
  return (
    <div className="card ws-card">
      <div className="table-responsive ws-table-wrap">
        <table className="table align-middle mb-0 ws-table" style={{ tableLayout: "fixed" }}>
          <thead>
            <tr>
              <th style={{ width: "auto", minWidth: 200 }}>Name</th>
              <th style={{ width: 140, textAlign: "center" }}>Apps</th>
              <th style={{ width: 120, textAlign: "center" }}>Last modified</th>
              <th style={{ width: 80, textAlign: "center" }}>Status</th>
              <th style={{ width: 80, textAlign: "center" }}>Owner</th>
              <th style={{ width: 44, textAlign: "center" }} />
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rows }, (_, index) => (
              <SkeletonRow key={index} />
            ))}
          </tbody>
        </table>
      </div>

      <style>{`
        @keyframes skeleton-loading {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
      `}</style>
    </div>
  );
};

export default SkeletonTable;
