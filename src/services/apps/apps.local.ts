// src/services/apps/apps.local.ts
import type { AppSpec, AppListParams, AppListResult } from "../../types/apps";
import { APP_CATALOG } from "../../pages/scenario-builder/catalog";
import { load, saveAll } from "./_store.local";

export async function listApps(params: AppListParams = {}): Promise<AppListResult> {
  console.log('[AppsLocal] listApps called with params:', params);

  // First check if we have cached data in localStorage
  let items = load();
  console.log('[AppsLocal] Loaded from localStorage:', items.length, 'items');

  // If no cached data or data is empty, load from APP_CATALOG and cache it
  if (!items || items.length === 0) {
    console.log('[AppsLocal] No cached data, loading from APP_CATALOG');
    items = [...APP_CATALOG];
    saveAll(items); // Cache the data
    console.log('[AppsLocal] Cached', items.length, 'apps to localStorage');
  }

  console.log('[AppsLocal] APP_CATALOG length:', APP_CATALOG.length);
  console.log('[AppsLocal] APP_CATALOG sample:', APP_CATALOG.slice(0, 3));

  // Simulate API delay for list operation (15 seconds)
  await new Promise(resolve => setTimeout(resolve, 15000));

  // Filter by category if provided
  if (params.category) {
    const categoryMap: Record<string, string[]> = {
      'apps': ['gmail', 'telegram'],
      'ai': ['ai'],
      'flow': ['flow'],
      'utilities': ['utilities'],
      'products': ['prod'],
      'custom': ['custom'],
    };

    const categories = categoryMap[params.category] || [];
    if (categories.length > 0) {
      items = items.filter(item => categories.some(cat => item.key.startsWith(cat)));
      console.log('[AppsLocal] Filtered to', items.length, 'apps for category:', params.category);
    }
  }

  // Filter by search term if provided
  if (params.search) {
    const searchLower = params.search.toLowerCase();
    items = items.filter(item =>
      item.name.toLowerCase().includes(searchLower) ||
      item.key.toLowerCase().includes(searchLower)
    );
    console.log('[AppsLocal] Filtered to', items.length, 'apps for search:', params.search);
  }

  const result = {
    items,
    total: items.length,
    page: params.page || 1,
    pageSize: params.pageSize || 50,
  };

  console.log('[AppsLocal] Returning result:', result);
  return result;
}

export async function getApp(id: string): Promise<AppSpec | undefined> {
  // Simulate API delay for get operation (6 seconds)
  await new Promise(resolve => setTimeout(resolve, 6000));
  return APP_CATALOG.find(app => app.key === id);
}

export async function refreshAppsFromAPI(): Promise<AppSpec[]> {
  console.log('[AppsLocal] Refreshing apps from APP_CATALOG');

  // Simulate API delay for refresh operation (6 seconds)
  await new Promise(resolve => setTimeout(resolve, 6000));

  // Load fresh data from APP_CATALOG
  const freshItems = [...APP_CATALOG];
  console.log('[AppsLocal] Fresh data loaded:', freshItems.length, 'items');

  // Save to localStorage
  saveAll(freshItems);
  console.log('[AppsLocal] Fresh data cached to localStorage');

  return freshItems;
}

export const service = {
  list: listApps,
  get: getApp,
  refreshFromAPI: refreshAppsFromAPI,
};
