import React from "react";
import type { Scenario } from "../types/scenarios";

export type ScenariosContextType = {
  scenarios: Scenario[];
  refresh: () => Promise<void>;
  save: (s: Scenario) => Promise<void>;
  remove: (id: string) => Promise<void>;
  get: (id: string) => Promise<Scenario | undefined>;
};

export const ScenariosContext = React.createContext<ScenariosContextType | null>(null);
