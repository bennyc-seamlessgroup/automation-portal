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
  const [hasLoadedInitially, setHasLoadedInitially] = useState(false);

  const preload = useCallback(async () => {
    // Don't preload if already loaded initially
    if (hasLoadedInitially) {
      console.log('[AppsContext] Apps already loaded initially, skipping preload');
      return;
    }

    try {
      console.log('[AppsContext] 🔄 Loading apps after user login...');

      setIsLoading(true);

      // Use the unified service (which handles both API and local logic)
      const appsService = getAppsService();
      const result = await appsService.list({});
      console.log(`[AppsContext] ✅ Service returned ${result.items.length} apps`);
      setApps(result.items);
      setHasLoadedInitially(true);
    } catch (error) {
      console.warn('[AppsContext] ❌ Service failed, using temporary fallback data:', error);
      setApps(TEMPORARY_APPS);
      setHasLoadedInitially(true);
    } finally {
      setIsLoading(false);
    }
  }, [hasLoadedInitially]);

  const refresh = useCallback(async (params?: { category?: string; search?: string }) => {
    try {
      console.log('[AppsContext] 🔄 Refreshing apps from service...');

      setIsLoading(true);

      // Use the unified service for refresh
      const appsService = getAppsService();
      const result = await appsService.list(params || {});
      console.log(`[AppsContext] ✅ Service returned ${result.items.length} apps`);
      setApps(result.items);
      setHasLoadedInitially(true);
    } catch (error) {
      console.error('[AppsContext] ❌ Service refresh failed:', error);

      // If service fails completely, use temporary fallback
      console.warn(`[AppsContext] 🔄 Service failed, using ${TEMPORARY_APPS.length} fallback apps`);
      setApps(TEMPORARY_APPS);
      setHasLoadedInitially(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

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
    // Apps are loaded on-demand after login via BackgroundPreloader
    console.log('[AppsContext] Context initialized, apps will load after user login');
  }, []);

  const value = useMemo(
    () => ({ apps, isLoading, refresh, preload, hasLoadedInitially }),
    [apps, isLoading, refresh, preload, hasLoadedInitially]
  );
  return (
    <AppsContext.Provider value={value}>
      {children}
    </AppsContext.Provider>
  );
};
