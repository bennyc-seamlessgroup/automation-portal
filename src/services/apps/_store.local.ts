// src/services/apps/_store.local.ts
import type { AppSpec } from "../../types/apps";

export const KEY_V1 = "ap.apps.v1";

export type DB = AppSpec[];

export function safeParse<T>(json: string | null, fallback: T): T {
  if (!json) return fallback;
  try { return JSON.parse(json) as T; } catch { return fallback; }
}

export function load(): DB {
  const data = safeParse<DB>(localStorage.getItem(KEY_V1), null as any);
  if (Array.isArray(data)) return data;

  // Seed empty if no data
  localStorage.setItem(KEY_V1, JSON.stringify([]));
  return [];
}

export function saveAll(db: DB) {
  const payload = JSON.stringify(db);
  localStorage.setItem(KEY_V1, payload);
  // Fire a storage event so other tabs/hooks can refresh
  window.dispatchEvent(new StorageEvent("storage", { key: KEY_V1, newValue: payload }));
}

export function clear() {
  localStorage.removeItem(KEY_V1);
}
