// src/services/apps/apps.unified.ts
import type { AppSpec, AppListParams, AppListResult, AppsService } from "../../types/apps";
import { STORAGE_MODE } from "../../config/featureFlag";

// Direct function imports to avoid bundling issues
import { listApps, getApp } from "./apps.local";
import { saveAll, load } from "./_store.local";

export const service: AppsService = {
  async list(params: AppListParams = {}): Promise<AppListResult> {
    console.log(`[AppsService] list() called with params:`, params);

    if (STORAGE_MODE === "api") {
      // For API mode, fetch from API and cache the results
      console.log('[AppsService] Using API mode, fetching from API...');
      const { service: apiService } = await import("./apps.api");
      const result = await apiService.list(params);

      // Cache the API results for future use
      if (result.items && result.items.length > 0) {
        saveAll(result.items);
        console.log(`[AppsService] Cached ${result.items.length} apps from API`);
      }

      return result;
    } else {
      // For local mode, use the existing local implementation (which already handles caching)
      console.log('[AppsService] Using local mode');
      return listApps(params);
    }
  },

  async get(id: string): Promise<AppSpec | undefined> {
    console.log(`[AppsService] get() called with id: ${id}`);

    if (STORAGE_MODE === "api") {
      const { service: apiService } = await import("./apps.api");
      const result = await apiService.get?.(id);

      // Cache individual app results if successful
      if (result) {
        // For simplicity, we'll refresh the entire cache when getting individual apps
        // In a real implementation, you might want to update just this item
        const currentCache = load();
        const exists = currentCache.some(app => app.key === result.key);
        if (!exists) {
          saveAll([...currentCache, result]);
          console.log(`[AppsService] Added new app ${result.key} to cache`);
        }
      }

      return result;
    } else {
      return getApp(id);
    }
  },
};
