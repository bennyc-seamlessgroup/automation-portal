// src/services/apps/index.ts
import type { AppSpec, AppListParams, AppListResult } from "../../types/apps";
import { service } from "./apps.unified";

export interface AppsService {
  list(params?: AppListParams): Promise<AppListResult>;
  get?(id: string): Promise<AppSpec | undefined>;
}

/** Singleton accessor — UI/hook will call this, not the providers directly */
export function getAppsService(): AppsService {
  return service;
}

export type {
  AppSpec,
  AppListParams,
  AppListResult,
} from "../../types/apps";
