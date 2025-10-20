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
  const [isLoading, setIsLoading] = useState(false);

  const preload = useCallback(async () => {
    try {
      console.log('[ScenariosContext] Background preloading scenarios...');

      setIsLoading(true);
      const scenariosService = getScenariosService();
      const result = await scenariosService.list({});
      setScenarios(result.items);
    } catch (error) {
      console.error('Failed to preload scenarios:', error);
      setScenarios([]);
    } finally {
      setIsLoading(false);
    }
  }, []); // Remove scenariosService dependency since it's a singleton

  const refresh = useCallback(async () => {
    try {
      console.log('[ScenariosContext] Loading scenarios...');

      setIsLoading(true);
      const scenariosService = getScenariosService();
      const result = await scenariosService.list({});
      setScenarios(result.items);
    } catch (error) {
      console.error('Failed to load scenarios:', error);
      setScenarios([]);
    } finally {
      setIsLoading(false);
    }
  }, []); // Remove scenariosService dependency since it's a singleton

  const save = useCallback(
    async (s: Scenario) => {
      try {
        const scenariosService = getScenariosService();
        await scenariosService.save(s);
        // Note: Removed automatic refresh() call - components should handle refreshing if needed
      } catch (error) {
        console.error('Failed to save scenario:', error);
      }
    },
    []
  );

  const remove = useCallback(
    async (id: string) => {
      try {
        const scenariosService = getScenariosService();
        await scenariosService.remove(id);
        // Note: Removed automatic refresh() call - components should handle refreshing if needed
      } catch (error) {
        console.error('Failed to remove scenario:', error);
      }
    },
    []
  );

  const get = useCallback(async (id: string) => {
    try {
      const scenariosService = getScenariosService();
      return await scenariosService.get(id);
    } catch (error) {
      console.error('Failed to get scenario:', error);
      return undefined;
    }
  }, []);

  useEffect(() => {
    // Data will be loaded when explicitly requested (e.g., when Scenarios component mounts)
    // No auto-loading on context mount to prevent duplicate API calls
    console.log('[ScenariosContext] Context initialized, waiting for explicit refresh');
  }, []);

  const value = useMemo(
    () => ({ scenarios, isLoading, refresh, save, remove, get, preload }),
    [scenarios, isLoading, refresh, save, remove, get, preload]
  );
  return (
    <ScenariosContext.Provider value={value}>
      {children}
    </ScenariosContext.Provider>
  );
};

export { ScenariosContext };
