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
  const scenariosService = getScenariosService();

  const preload = useCallback(async () => {
    try {
      console.log('[ScenariosContext] Background preloading scenarios...');

      // TEMPORARY: Add 2s delay for previewing loading animations
      // TODO: Remove this artificial delay in production
      // Alternative approach: Consider implementing a loading state management system
      // that shows skeletons based on actual network requests rather than artificial delays
      await new Promise(resolve => setTimeout(resolve, 2000));

      setIsLoading(true);
      const result = await scenariosService.list({});
      setScenarios(result.items);
    } catch (error) {
      console.error('Failed to preload scenarios:', error);
      setScenarios([]);
    } finally {
      setIsLoading(false);
    }
  }, [scenariosService]);

  const refresh = useCallback(async () => {
    try {
      // Load scenarios if we're on a scenarios-related page or dashboard
      if (typeof window !== 'undefined') {
        const path = window.location.pathname;
        if (path === '/login' || (!path.includes('/scenarios') && !path.includes('/dashboard'))) {
          console.log('[ScenariosContext] Skipping scenarios load - not on scenarios/dashboard page');
          return;
        }
      }

      console.log('[ScenariosContext] Loading scenarios...');

      // TEMPORARY: Add 2s delay for previewing loading animations
      // TODO: Remove this artificial delay in production
      // Alternative approach: Consider implementing a loading state management system
      // that shows skeletons based on actual network requests rather than artificial delays
      await new Promise(resolve => setTimeout(resolve, 2000));

      setIsLoading(true);
      const result = await scenariosService.list({});
      setScenarios(result.items);
    } catch (error) {
      console.error('Failed to load scenarios:', error);
      setScenarios([]);
    } finally {
      setIsLoading(false);
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
