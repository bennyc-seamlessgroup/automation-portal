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
  // 🔢 VERSION TRACKING
  // ==================
  // Optional version field for API versioning (V1, V2, V3, etc.)
  version?: number;

  // 📝 FORM FIELDS
  // ==============
  // Define the configuration fields shown in the inspector
  fields: {
    key: string;
    label: string;
    placeholder?: string;
    // 🎨 FIELD TYPES
    // ==============
    // Available field types for configuration forms
    type?: "text" | "number" | "select" | "textarea" | "multiselect";
    options?: string[];
    required?: boolean;
    validation?: {
      pattern?: string;
      min?: number;
      max?: number;
    };
  }[];

  // 🔄 DATA FLOW CAPABILITIES
  // ========================
  // Optional fields for connecting apps together (data passing)
  dataOutputs?: Array<{
    key: string;
    label: string;
    type: "string" | "number" | "boolean" | "array" | "object";
    description?: string;
  }>;
  dataInputs?: Array<{
    key: string;
    label: string;
    type: "string" | "number" | "boolean" | "array" | "object";
    description?: string;
    required?: boolean;
  }>;

  // ⚙️ INSPECTOR CONFIGURATION
  // =========================
  // Optional configuration for the node inspector interface
  inspector?: {
    steps: Array<{
      id: number;
      title: string;
      description: string;
      tab: "connect" | "configure" | "test";
    }>;
    defaultTab?: "connect" | "configure" | "test";
    headerTitle?: string;
    tabs?: Array<{
      key: "connect" | "configure" | "test";
      label: string;
      required?: boolean;
    }>;
    connections?: {
      type: "oauth" | "token" | "credentials";
      service?: string;
      fields?: Array<{
        key: string;
        label: string;
        type: "text" | "password" | "select";
        placeholder?: string;
        options?: string[];
        required?: boolean;
      }>;
    };
    validation?: {
      [fieldKey: string]: {
        required?: boolean;
        pattern?: string;
        custom?: (value: any) => boolean | string;
      };
    };
  };
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
