// src/state/AppsContext.context.ts
import React from "react";
import type { AppSpec } from "../pages/scenario-builder/types";

export type AppsContextType = {
  apps: AppSpec[];
  isLoading: boolean;
  refresh: (params?: { category?: string; search?: string }) => Promise<void>;
  preload: () => Promise<void>;
  lastRefresh?: number;
};

export const AppsContext = React.createContext<AppsContextType | null>(null);
