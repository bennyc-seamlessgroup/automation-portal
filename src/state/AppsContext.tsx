// src/state/AppsContext.tsx
import React, {
  useMemo,
  useState,
  useCallback,
  useEffect,
} from "react";
import { AppsContext } from "./AppsContext.context";
import type { AppSpec } from "../pages/scenario-builder/types";
import { getAppsService } from "../services/apps";
import { load, saveAll } from "../services/apps/_store.local";

// Temporary hardcoded data for testing
const TEMPORARY_APPS: AppSpec[] = [
  {
    key: 'gmailWatchEmails',
    name: 'Gmail — Watch emails',
    color: '#ef4444',
    icon: '✉️',
    fields: [
      {
        key: 'mailbox',
        label: 'Email Category',
        type: 'select',
        options: ['Inbox', 'Sent', 'Chat', 'Starred', 'Important', 'Trash', 'Draft', 'Spam', 'Unread']
      }
    ]
  },
  {
    key: 'telegramSend',
    name: 'Telegram — Send message',
    color: '#229ED9',
    icon: '✈️',
    fields: [
      {
        key: 'chatId',
        label: 'Chat ID',
        placeholder: 'Chat ID or username'
      },
      {
        key: 'message',
        label: 'Message',
        placeholder: 'Message to send'
      }
    ]
  }
];

export { AppsContext };

export const AppsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [apps, setApps] = useState<AppSpec[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const preload = useCallback(async () => {
    try {
      console.log('[AppsContext] Background preloading apps...');

      setIsLoading(true);

      // First try to load from localStorage
      let cachedApps = load();
      console.log('[AppsContext] Loaded from localStorage:', cachedApps.length, 'apps');

      // If we have cached data, use it immediately
      if (cachedApps && cachedApps.length > 0) {
        setApps(cachedApps);
        console.log('[AppsContext] Using cached apps, no API call needed');
      } else {
        // If no cached data, load from service and cache it
        console.log('[AppsContext] No cached data, loading from service');
        try {
          const appsService = getAppsService();
          const result = await appsService.list({});
          console.log('[AppsContext] Preload result:', result);
          setApps(result.items);
          saveAll(result.items); // Cache for future use
        } catch (error) {
          console.warn('[AppsContext] Service failed, using temporary data:', error);
          setApps(TEMPORARY_APPS);
          saveAll(TEMPORARY_APPS); // Cache fallback data
        }
      }
    } catch (error) {
      console.error('Failed to preload apps:', error);
      setApps([]);
    } finally {
      setIsLoading(false);
    }
  }, []); // Remove appsService dependency since it's a singleton

  const refresh = useCallback(async (params?: { category?: string; search?: string }) => {
    try {
      console.log('[AppsContext] Loading apps...');

      setIsLoading(true);

      // Load fresh data from service
      const appsService = getAppsService();
      const result = await appsService.list(params || {});
      console.log('[AppsContext] Refresh result:', result);
      setApps(result.items);
      saveAll(result.items); // Update cache
    } catch (error) {
      console.error('Failed to load apps:', error);
      setApps([]);
    } finally {
      setIsLoading(false);
    }
  }, []); // Remove appsService dependency since it's a singleton

  // Listen for storage events to sync across tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'ap.apps.v1' && e.newValue) {
        try {
          const newApps = JSON.parse(e.newValue);
          if (Array.isArray(newApps)) {
            console.log('[AppsContext] Storage updated, syncing apps:', newApps.length);
            setApps(newApps);
          }
        } catch (error) {
          console.error('[AppsContext] Failed to parse storage update:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  useEffect(() => {
    // Don't auto-refresh on mount to prevent race conditions
    // Data will be loaded when explicitly requested (e.g., when FunctionPicker opens)
    console.log('[AppsContext] Context initialized, waiting for explicit refresh');
  }, []);

  const value = useMemo(
    () => ({ apps, isLoading, refresh, preload }),
    [apps, isLoading, refresh, preload]
  );
  return (
    <AppsContext.Provider value={value}>
      {children}
    </AppsContext.Provider>
  );
};
