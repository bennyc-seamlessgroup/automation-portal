// src/config/featureFlags.ts
export type StorageMode = "local" | "api";

/** Read from Vite env; default to 'local' during migration */
const envMode = (import.meta as any)?.env?.VITE_STORAGE_MODE as StorageMode | undefined;

export const STORAGE_MODE: StorageMode = envMode === "api" ? "api" : "local";

/** Optional: API base URL (used later by API provider) */
export const API_BASE_URL: string =
  ((import.meta as any)?.env?.VITE_API_BASE_URL as string | undefined) || "/api";
