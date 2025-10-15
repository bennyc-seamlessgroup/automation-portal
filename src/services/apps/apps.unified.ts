// src/services/apps/apps.unified.ts
import type { AppSpec, AppListParams, AppListResult, AppsService } from "../../types/apps";
import { STORAGE_MODE } from "../../config/featureFlag";

export const service: AppsService = {
  async list(params: AppListParams = {}): Promise<AppListResult> {
    console.log(`[AppsService] list() called with params:`, params);
    return STORAGE_MODE === "api"
      ? (await import("./apps.api")).service.list(params)
      : (await import("./apps.local")).listApps(params);
  },

  async get(id: string): Promise<AppSpec | undefined> {
    console.log(`[AppsService] get() called with id: ${id}`);
    if (STORAGE_MODE === "api") {
      const { service: apiService } = await import("./apps.api");
      return apiService.get?.(id);
    } else {
      const { getApp } = await import("./apps.local");
      return getApp(id);
    }
  },
};
