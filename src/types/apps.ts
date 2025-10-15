// src/types/apps.ts
import type { AppKey } from "../pages/scenario-builder/types";

export interface AppSpec {
  key: AppKey;
  name: string;
  icon?: string;
  color: string;
  description?: string;
  category?: string;
  tags?: string[];
  fields: {
    key: string;
    label: string;
    placeholder?: string;
    type?: "text" | "number" | "select";
    options?: string[];
  }[];
}

export interface AppListParams {
  category?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface AppListResult {
  items: AppSpec[];
  total: number;
  page?: number;
  pageSize?: number;
}

export interface AppsService {
  list(params?: AppListParams): Promise<AppListResult>;
  get?(id: string): Promise<AppSpec | undefined>;
}

export interface ServiceError {
  code: "VALIDATION_ERROR" | "NOT_FOUND" | "NETWORK_ERROR" | "UNKNOWN";
  message: string;
}

// Pagination defaults (matching scenarios pattern)
export const DEFAULT_PAGE = 1;
export const DEFAULT_PAGE_SIZE = 50;
export const MAX_PAGE_SIZE = 100;
