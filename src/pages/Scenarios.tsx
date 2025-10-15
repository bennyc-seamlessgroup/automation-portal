// src/pages/Scenarios.tsx
import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Shared data layer (Phase 2-ready)
import { useScenarios } from "../state";
import type { Scenario } from "../types/scenarios";

// Extracted helpers/components
import DebugPayloadUI, {
  emitDebugPayload,
} from "./scenarios/debug/DebugPayloadUI";
import { capitalize } from "./scenarios/utils/format";

// Components (import individually since there's no barrel)
import EmptyHero from "./scenarios/components/EmptyHero";
import ListView from "./scenarios/components/ListView";

type Status = "running" | "stopped" | "error";

export default function Scenarios() {
  // Filters + pagination
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState<Status | "All">("All");
  const [page, setPage] = useState(1);
  const pageSize: 10 | 25 | 50 | 100 = 10;

  // Data + nav
  const navigate = useNavigate();
  const { scenarios, isLoading, save, remove, refresh } = useScenarios();

  // Track if this is the initial load
  const [hasLoadedInitially, setHasLoadedInitially] = useState(false);

  // Ensure scenarios are loaded when component mounts
  useEffect(() => {
    console.log('[Scenarios] Component mounted, calling refresh...');
    refresh().finally(() => {
      setHasLoadedInitially(true);
    });
  }, [refresh]);

  // Derived: filtered items
  const items = useMemo(() => {
    let out = scenarios;
    if (statusFilter !== "All")
      out = out.filter((s) => s.status === statusFilter);
    if (q.trim()) {
      const t = q.toLowerCase();
      out = out.filter(
        (s) =>
          s.title.toLowerCase().includes(t) ||
          (s.meta || "").toLowerCase().includes(t)
      );
    }
    return out;
  }, [q, statusFilter, scenarios]);

  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const pageItems = items.slice((page - 1) * pageSize, page * pageSize);

  /* Actions */
  const onCreate = () => {
    emitDebugPayload("scenarios.create.navigate", { to: "/scenarios/new" });
    navigate("/scenarios/new");
  };

  const onBrowseTemplates = () => {
    navigate("/templates");
  };

  const onRefresh = async () => {
    setPage(1);
    emitDebugPayload("scenarios.refresh", { page: 1, q, statusFilter });
    await refresh();
  };

  const onClearLocal = () => {
    try {
      localStorage.removeItem("ap.scenarios.v1");
      localStorage.removeItem(
        "automationPortal.scenarioBuilder.initialNode.v5"
      );
      localStorage.removeItem("automationPortal.scenarioBuilder.versions");
      emitDebugPayload("scenarios.local.clear", {
        keys: [
          "ap.scenarios.v1",
          "automationPortal.scenarioBuilder.initialNode.v5",
          "automationPortal.scenarioBuilder.versions",
        ],
      });
      onRefresh();
      alert("Local storage cleared for scenarios and builder drafts.");
    } catch (e) {
      alert("Failed to clear local storage. See console for details.");
      console.error(e);
    }
  };

  const gotoEdit = (id: string) => {
    emitDebugPayload("scenarios.openEditor", { scenarioId: id, from: "list" });
    navigate(`/scenarios/${id}/edit`);
  };

  const onToggleStatus = async (s: Scenario, toRunning: boolean) => {
    const next: Scenario = { ...s, status: toRunning ? "running" : "stopped" };
    emitDebugPayload("scenarios.toggleStatus", {
      scenarioId: s.id,
      to: next.status,
    });
    await save(next);
  };

  const onDelete = async (id: string) => {
    emitDebugPayload("scenarios.delete", { scenarioId: id });
    await remove(id);
  };

  return (
    <div className="container-fluid py-3">
      {/* Header: filters + search + create */}
      <div className="d-flex flex-wrap align-items-center justify-content-between mb-3 gap-2">
        <div className="d-flex align-items-center gap-2">
          <h1 className="h4 mb-0">Scenarios</h1>

          {/* Status filter */}
          <div className="dropdown">
            <button
              className="btn btn-outline-dark btn-sm dropdown-toggle"
              data-bs-toggle="dropdown"
            >
              <i className="bi bi-funnel me-1" />
              {statusFilter === "All"
                ? "All statuses"
                : capitalize(statusFilter)}
            </button>
            <ul className="dropdown-menu">
              {(["All", "running", "stopped", "error"] as const).map((st) => (
                <li key={st}>
                  <button
                    className="dropdown-item"
                    onClick={() => {
                      setStatusFilter(st);
                      setPage(1);
                      emitDebugPayload("scenarios.filter.status", {
                        status: st === "All" ? null : st,
                      });
                    }}
                  >
                    {st === "All" ? "All statuses" : capitalize(st as Status)}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Refresh & clear local */}
          <button
            className="btn btn-outline-dark btn-sm"
            onClick={onRefresh}
            title="Refresh"
          >
            <i className="bi bi-arrow-clockwise" />
          </button>
          <button
            className="btn btn-outline-danger btn-sm"
            onClick={onClearLocal}
            title="Clear local storage"
          >
            <i className="bi bi-trash3" />
          </button>
        </div>

        {/* Search + create */}
        <div className="d-flex align-items-center gap-2">
          <div className="input-group input-group-sm" style={{ minWidth: 320 }}>
            <span className="input-group-text">
              <i className="bi bi-search" />
            </span>
            <input
              className="form-control"
              placeholder="Search by name or webhook"
              value={q}
              onChange={(e) => {
                const value = e.target.value;
                setQ(value);
                setPage(1);
                emitDebugPayload("scenarios.search", { q: value });
              }}
            />
          </div>

          <button
            className="btn btn-primary px-4 d-inline-flex align-items-center"
            onClick={onCreate}
          >
            <i className="bi bi-plus-lg me-1" />
            Create
          </button>
        </div>
      </div>

      {/* Body */}
      {(!hasLoadedInitially || isLoading) ? (
        <ListView
          items={[]}
          gotoEdit={gotoEdit}
          onToggleStatus={onToggleStatus}
          onDelete={onDelete}
          isLoading={true}
        />
      ) : items.length === 0 ? (
        <EmptyHero
          onOpenScenarioBuilder={onCreate}
          onBrowseTemplates={onBrowseTemplates}
        />
      ) : (
        <ListView
          items={pageItems}
          gotoEdit={gotoEdit}
          onToggleStatus={onToggleStatus}
          onDelete={onDelete}
          isLoading={false}
        />
      )}

      {/* Footer: pagination */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mt-3 gap-2">
        <small className="text-secondary">
          {total === 0
            ? "No scenarios"
            : `${(page - 1) * pageSize + 1}–${Math.min(
                page * pageSize,
                total
              )} of ${total}`}
        </small>

        <div className="d-flex align-items-center gap-2">
          <nav aria-label="Scenario pagination">
            <ul className="pagination pagination-sm mb-0">
              <li className={`page-item ${page === 1 ? "disabled" : ""}`}>
                <button
                  className="page-link"
                  onClick={() => {
                    const next = Math.max(1, page - 1);
                    setPage(next);
                    emitDebugPayload("scenarios.page.change", { page: next });
                  }}
                >
                  Prev
                </button>
              </li>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (pageNum) => (
                  <li
                    key={pageNum}
                    className={`page-item ${page === pageNum ? "active" : ""}`}
                  >
                    <button
                      className="page-link"
                      onClick={() => {
                        setPage(pageNum);
                        emitDebugPayload("scenarios.page.change", {
                          page: pageNum,
                        });
                      }}
                    >
                      {pageNum}
                    </button>
                  </li>
                )
              )}

              <li
                className={`page-item ${page === totalPages ? "disabled" : ""}`}
              >
                <button
                  className="page-link"
                  onClick={() => {
                    const next = Math.min(totalPages, page + 1);
                    setPage(next);
                    emitDebugPayload("scenarios.page.change", { page: next });
                  }}
                >
                  Next
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      {/* Debug UI */}
      <DebugPayloadUI />
    </div>
  );
}
