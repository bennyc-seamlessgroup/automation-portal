import {
    load,
    byUpdatedDesc,
    matchesQuery,
  } from "./_store.local";
  import type { ScenarioListParams, ScenarioListResult } from "./_store.local";

  export function listScenariosLocal(params?: ScenarioListParams): ScenarioListResult {
    const { search = "", status = "all", page = 1, pageSize = 10 } = params || {};
    const qx = search.trim().toLowerCase();

    const db = load().slice().sort(byUpdatedDesc);
    const filtered = db.filter((s) => {
      const okQ = matchesQuery(s, qx);
      const okStatus = status === "all" || s.status === status;
      return okQ && okStatus;
    });

    const total = filtered.length;
    const current = Math.min(Math.max(1, page), Math.max(1, Math.ceil(total / pageSize)));
    const start = (current - 1) * pageSize;
    const items = filtered.slice(start, start + pageSize);

    return { items, total, page: current, pageSize };
  }