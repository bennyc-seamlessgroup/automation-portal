import type { Scenario } from "../../../types/scenarios";
import { AppsInline } from "./AppBadges";
import { formatRelativeDate } from "../utils/format";
import ActionsDropdown from "./ActionsDropdown";

export default function ListView({
  items,
  gotoEdit,
  onToggleStatus,
  onDelete,
}: {
  items: Scenario[];
  gotoEdit: (id: string) => void;
  onToggleStatus: (s: Scenario, toRunning: boolean) => void;
  onDelete: (id: string) => void;
}) {
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
            {items.map((s) => (
              <tr key={s.id}>
                <td style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  <button
                    className="btn btn-link p-0 text-start fw-semibold ws-link"
                    onClick={() => gotoEdit(s.id)}
                    style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "100%", display: "block" }}
                    title={s.title}
                  >
                    {s.title}
                  </button>
                </td>

                {/* APPS */}
                <td className="text-secondary text-center">
                  {(() => {
                    const nodes: any[] = Array.isArray((s as any).graph?.nodes) ? (s as any).graph.nodes : [];
                    const appKeysOrLabels: (string | undefined)[] = nodes
                      .filter((n) => n && (n.type === "app" || n.type === "App"))
                      .map((n) => n.data?.appKey || n.data?.label || "App");

                    return <AppsInline keysOrLabels={appKeysOrLabels} max={3} />;
                  })()}
                </td>

                <td className="text-secondary">
                  {formatRelativeDate(s.updatedAt)}
                </td>
                <td className="text-center">
                  <div className="form-check form-switch m-0 d-flex justify-content-center">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      defaultChecked={s.status === "running"}
                      onChange={(e) => onToggleStatus(s, e.target.checked)}
                    />
                  </div>
                </td>
                <td className="text-center">
                  <span className="badge rounded-circle text-bg-primary ws-owner">{s.owner}</span>
                </td>
                <td className="text-center">
                  <ActionsDropdown scenarioId={s.id} onDelete={() => onDelete(s.id)} />
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center text-secondary py-5">
                  No scenarios match your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
