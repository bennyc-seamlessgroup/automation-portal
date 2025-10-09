// src/services/scenarios/scenarios.api.ts
import {
    type Scenario,
    type ScenarioListParams,
    type ScenarioListResult,
    type ScenarioStatus,
    type ServiceError,
    DEFAULT_PAGE,
    DEFAULT_PAGE_SIZE,
    MAX_PAGE_SIZE,
  } from "../../types/scenarios";
  import type { ScenariosService } from "./index";
  import { http } from "../http/client";
  
  /* ============================================================================
   * API-backed ScenariosService
   * - Endpoints (adjust if your backend differs):
   *   GET    /scenarios?search=&status=&page=&pageSize=
   *   GET    /scenarios/:id
   *   POST   /scenarios
   *   PUT    /scenarios/:id
   *   PATCH  /scenarios/:id/status  body: { status }
   *   DELETE /scenarios/:id
   * - All dates are ISO strings from server
   * - This file only concerns transport & normalization; no UI logic here
   * ========================================================================== */
  
  const BASE = "/scenarios";
  
  /** Build a safe query string from list params */
  function toQuery(params: ScenarioListParams): string {
    const page = params.page && params.page > 0 ? params.page : DEFAULT_PAGE;
    const pageSizeRaw = params.pageSize ?? DEFAULT_PAGE_SIZE;
    const pageSize = Math.max(1, Math.min(pageSizeRaw, MAX_PAGE_SIZE));
  
    const q = new URLSearchParams();
    q.set("page", String(page));
    q.set("pageSize", String(pageSize));
    if (params.search && params.search.trim()) q.set("search", params.search.trim());
    if (params.status) q.set("status", params.status);
    return `?${q.toString()}`;
  }
  
  /** Normalize any server response to Scenario shape if your API differs slightly */
  function normalizeScenario(s: Scenario): Scenario {
    // Assuming server already returns correct shape; adjust mapping here if needed.
    return {
      ...s,
      id: String(s.id),
      title: String(s.title),
      status: s.status,
      owner: String(s.owner),
      createdAt: String(s.createdAt),
      updatedAt: String(s.updatedAt),
      meta: s.meta ?? undefined,
      tags: Array.isArray(s.tags) ? s.tags : undefined,
      graph: {
        name: s.graph?.name ?? undefined,
        notes: s.graph?.notes ?? undefined,
        nodes: Array.isArray(s.graph?.nodes) ? s.graph.nodes : [],
        edges: Array.isArray(s.graph?.edges) ? s.graph.edges : [],
      },
    };
  }
  
  function toServiceError(message: string, code: ServiceError["code"] = "UNKNOWN"): ServiceError {
    return { code, message };
  }
  
  export const service: ScenariosService = {
    async list(params: ScenarioListParams): Promise<ScenarioListResult> {
      const query = toQuery(params);
      const res = await http<ScenarioListResult>(`${BASE}${query}`, { method: "GET" });
      // Normalize items in case server fields drift
      return {
        ...res,
        items: (res.items ?? []).map(normalizeScenario),
        page: res.page ?? DEFAULT_PAGE,
        pageSize: res.pageSize ?? DEFAULT_PAGE_SIZE,
        total: res.total ?? (res.items?.length ?? 0),
      };
    },
  
    async get(id: string): Promise<Scenario> {
      if (!id) throw toServiceError("Missing scenario id", "VALIDATION_ERROR");
      const res = await http<Scenario>(`${BASE}/${encodeURIComponent(id)}`, { method: "GET" });
      return normalizeScenario(res);
    },
  
    async create(input: Partial<Scenario>): Promise<Scenario> {
      // Server should set id/createdAt/updatedAt; FE sends only the fields provided.
      const res = await http<Scenario>(`${BASE}`, {
        method: "POST",
        body: JSON.stringify(input),
      });
      return normalizeScenario(res);
    },
  
    async update(id: string, patch: Partial<Scenario>): Promise<Scenario> {
      if (!id) throw toServiceError("Missing scenario id", "VALIDATION_ERROR");
      const res = await http<Scenario>(`${BASE}/${encodeURIComponent(id)}`, {
        method: "PUT",
        body: JSON.stringify(patch),
      });
      return normalizeScenario(res);
    },
  
    async remove(id: string): Promise<void> {
      if (!id) throw toServiceError("Missing scenario id", "VALIDATION_ERROR");
      await http<void>(`${BASE}/${encodeURIComponent(id)}`, { method: "DELETE" });
    },
  
    async setStatus(id: string, status: ScenarioStatus): Promise<Scenario> {
      if (!id) throw toServiceError("Missing scenario id", "VALIDATION_ERROR");
      const res = await http<Scenario>(`${BASE}/${encodeURIComponent(id)}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      return normalizeScenario(res);
    },
  
    async save(record: Scenario): Promise<Scenario> {
      if (record.id) {
        return this.update(record.id, record);
      } else {
        return this.create(record);
      }
    },

    // Optional; wire only if your backend supports it
    async snapshot(_id: string, _note?: string): Promise<{ snapshotId: string }> {
      throw toServiceError("[API] snapshot not implemented");
    },
  };
  