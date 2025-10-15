// src/services/apps/apps.api.ts
import type { AppSpec, AppListParams, AppListResult } from "../../types/apps";
import { http } from "../http/client";

/* ============================================================================
 * API-backed AppsService
 * - Endpoints (adjust if your backend differs):
 *   GET    /apps?category=&search=&page=&pageSize=
 *   GET    /apps/:id
 * - All responses normalized to AppSpec shape
 * ========================================================================== */

const BASE = "/apps";

/** Build a safe query string from list params */
function toQuery(params: AppListParams): string {
  const page = params.page && params.page > 0 ? params.page : 1;
  const pageSize = Math.max(1, Math.min(params.pageSize ?? 50, 100));

  const q = new URLSearchParams();
  q.set("page", String(page));
  q.set("pageSize", String(pageSize));
  if (params.category && params.category.trim()) q.set("category", params.category.trim());
  if (params.search && params.search.trim()) q.set("search", params.search.trim());
  return `?${q.toString()}`;
}

/** Normalize any server response to AppSpec shape if your API differs slightly */
function normalizeApp(a: AppSpec): AppSpec {
  return {
    ...a,
    key: a.key as any, // Cast to AppKey - server should return valid keys
    name: String(a.name),
    color: String(a.color),
    description: a.description ? String(a.description) : undefined,
    category: a.category ? String(a.category) : undefined,
    tags: Array.isArray(a.tags) ? a.tags : undefined,
    icon: a.icon ? String(a.icon) : undefined,
    fields: a.fields || [],
  };
}

export const service = {
  async list(params: AppListParams = {}): Promise<AppListResult> {
    console.log(`[AppsAPI] list() called with params:`, params);
    const query = toQuery(params);
    const res = await http<AppListResult>(`${BASE}${query}`, { method: "GET" });
    return {
      ...res,
      items: (res.items ?? []).map(normalizeApp),
      total: res.total ?? (res.items?.length ?? 0),
    };
  },

  async get(id: string): Promise<AppSpec | undefined> {
    if (!id) return undefined;
    try {
      const res = await http<AppSpec>(`${BASE}/${encodeURIComponent(id)}`, { method: "GET" });
      return normalizeApp(res);
    } catch (error) {
      // If not found, return undefined
      return undefined;
    }
  },
};
