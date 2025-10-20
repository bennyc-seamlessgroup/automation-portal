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

      // TEMPORARY: Add 2s delay for previewing loading animations
      // TODO: Remove this artificial delay in production
      // Alternative approach: Consider implementing a loading state management system
      // that shows skeletons based on actual network requests rather than artificial delays
      await new Promise(resolve => setTimeout(resolve, 2000));

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

      // TEMPORARY: Add 2s delay for previewing loading animations
      // TODO: Remove this artificial delay in production
      // Alternative approach: Consider implementing a loading state management system
      // that shows skeletons based on actual network requests rather than artificial delays
      await new Promise(resolve => setTimeout(resolve, 2000));

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
        await refresh();
      } catch (error) {
        console.error('Failed to save scenario:', error);
      }
    },
    [refresh]
  );

  const remove = useCallback(
    async (id: string) => {
      try {
        const scenariosService = getScenariosService();
        await scenariosService.remove(id);
        await refresh();
      } catch (error) {
        console.error('Failed to remove scenario:', error);
      }
    },
    [refresh]
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
