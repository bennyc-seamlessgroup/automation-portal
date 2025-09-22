import React, { createContext, useContext, useMemo, useState, useCallback, useEffect } from "react";
import type { Scenario } from "./scenarios";
import { listScenarios, upsertScenario, deleteScenario, getScenario } from "./scenarios";

type Ctx = {
  scenarios: Scenario[];
  refresh: () => void;
  save: (s: Scenario) => void;
  remove: (id: string) => void;
  get: (id: string) => Scenario | undefined;
};

const ScenariosContext = createContext<Ctx | null>(null);

export const ScenariosProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);

  const refresh = useCallback(() => setScenarios(listScenarios()), []);
  const save = useCallback((s: Scenario) => { upsertScenario(s); refresh(); }, [refresh]);
  const remove = useCallback((id: string) => { deleteScenario(id); refresh(); }, [refresh]);
  const get = useCallback((id: string) => getScenario(id), []);

  useEffect(() => { refresh(); }, [refresh]);

  const value = useMemo(() => ({ scenarios, refresh, save, remove, get }), [scenarios, refresh, save, remove, get]);
  return <ScenariosContext.Provider value={value}>{children}</ScenariosContext.Provider>;
};

export function useScenarios() {
  const ctx = useContext(ScenariosContext);
  if (!ctx) throw new Error("useScenarios must be used within ScenariosProvider");
  return ctx;
}
