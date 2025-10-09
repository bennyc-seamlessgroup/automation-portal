import type {
    Scenario,
    ScenarioListParams,
    ScenarioListResult,
    ScenarioStatus,
  } from "../../../types/scenarios"; // NOTE: plural to match your repo

  export const KEY_V1 = "ap.scenarios.v1";
  const LEGACY_KEYS = ["ap.scenarios"]; // migrate if found

  export type DB = Scenario[];

  export function safeParse<T>(json: string | null, fallback: T): T {
    if (!json) return fallback;
    try { return JSON.parse(json) as T; } catch { return fallback; }
  }

  export function load(): DB {
    // 1) prefer v1
    const v1 = safeParse<DB>(localStorage.getItem(KEY_V1), null as any);
    if (Array.isArray(v1)) return v1;

    // 2) migrate legacy (if present)
    for (const k of LEGACY_KEYS) {
      const legacy = safeParse<DB>(localStorage.getItem(k), null as any);
      if (Array.isArray(legacy)) {
        localStorage.setItem(KEY_V1, JSON.stringify(legacy));
        // keep legacy for downgrade-safety
        return legacy;
      }
    }
    // 3) seed empty
    localStorage.setItem(KEY_V1, JSON.stringify([]));
    return [];
  }

  export function saveAll(db: DB) {
    const payload = JSON.stringify(db);
    localStorage.setItem(KEY_V1, payload);
    // fire a storage event so other tabs/hooks can refresh
    window.dispatchEvent(new StorageEvent("storage", { key: KEY_V1, newValue: payload }));
  }

  export function genId() {
    if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
    return "scn_" + Math.random().toString(36).slice(2, 10);
  }

  export function byUpdatedDesc(a: Scenario, b: Scenario) {
    const ax = a.updatedAt ? Date.parse(a.updatedAt) : 0;
    const bx = b.updatedAt ? Date.parse(b.updatedAt) : 0;
    return bx - ax;
  }

  /** Minimal search that also peeks at graph node labels/appKeys */
  export function matchesQuery(s: Scenario, qx: string): boolean {
    if (!qx) return true;
    const title = s.title?.toLowerCase() || "";
    const meta = s.meta?.toLowerCase() || "";
    if (title.includes(qx) || meta.includes(qx)) return true;

    const nodes = (s as any)?.graph?.nodes;
    if (Array.isArray(nodes)) {
      return nodes.some((n: any) => {
        const label = n?.data?.label?.toString().toLowerCase();
        const appKey = n?.data?.appKey?.toString().toLowerCase();
        return (!!label && label.includes(qx)) || (!!appKey && appKey.includes(qx));
      });
    }
    return false;
  }

  export type {
    Scenario,
    ScenarioListParams,
    ScenarioListResult,
    ScenarioStatus,
  };
  