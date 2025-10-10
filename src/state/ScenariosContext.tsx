import React, {
  useMemo,
  useState,
  useCallback,
  useEffect,
} from "react";
import { ScenariosContext } from "./ScenariosContext.context";
import type { Scenario } from "../types/scenarios";
import { getScenariosService } from "../services/scenarios";

export const ScenariosProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const scenariosService = getScenariosService();

  const refresh = useCallback(async () => {
    try {
      const result = await scenariosService.list({});
      setScenarios(result.items);
    } catch (error) {
      console.error('Failed to load scenarios:', error);
      setScenarios([]);
    }
  }, [scenariosService]);

  const save = useCallback(
    async (s: Scenario) => {
      try {
        await scenariosService.save(s);
        await refresh();
      } catch (error) {
        console.error('Failed to save scenario:', error);
      }
    },
    [scenariosService, refresh]
  );

  const remove = useCallback(
    async (id: string) => {
      try {
        await scenariosService.remove(id);
        await refresh();
      } catch (error) {
        console.error('Failed to remove scenario:', error);
      }
    },
    [scenariosService, refresh]
  );

  const get = useCallback(async (id: string) => {
    try {
      return await scenariosService.get(id);
    } catch (error) {
      console.error('Failed to get scenario:', error);
      return undefined;
    }
  }, [scenariosService]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const value = useMemo(
    () => ({ scenarios, refresh, save, remove, get }),
    [scenarios, refresh, save, remove, get]
  );
  return (
    <ScenariosContext.Provider value={value}>
      {children}
    </ScenariosContext.Provider>
  );
};
