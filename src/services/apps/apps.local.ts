// src/services/apps/apps.local.ts
import type { AppSpec, AppListParams, AppListResult } from "../../types/apps";
import { APP_CATALOG } from "../../pages/scenario-builder/catalog";
import { saveAll } from "./_store.local";

// 🔄 DATA LOADING & CACHING
// ========================
// This service handles loading app data for the function picker.
// It loads from APP_CATALOG and caches in localStorage for performance.
//
// CACHING BEHAVIOR:
// - Loads fresh data from APP_CATALOG on first call
// - Caches data in localStorage for subsequent calls
// - If cache exists, uses cached data (this was causing V2 not to show!)
//
// TO FIX CACHING ISSUES (like when adding new apps):
// 1. Clear localStorage: localStorage.removeItem('ap.apps.v1')
// 2. Or modify this file to always load fresh data (current implementation)
// 3. Or update the cache key in _store.local.ts
//
// CATEGORY FILTERING:
// The categoryMap below determines which apps appear in each category.
// Update this when adding new apps to ensure they're properly categorized.
export async function listApps(params: AppListParams = {}): Promise<AppListResult> {
  console.log('[AppsLocal] listApps called with params:', params);

  // Always load fresh data from APP_CATALOG (no cache for development)
  console.log('[AppsLocal] Loading fresh data from APP_CATALOG');
  let items = [...APP_CATALOG];
  saveAll(items); // Cache the fresh data
  console.log('[AppsLocal] Cached', items.length, 'apps to localStorage');

  console.log('[AppsLocal] APP_CATALOG length:', APP_CATALOG.length);
  console.log('[AppsLocal] APP_CATALOG sample keys:', APP_CATALOG.map(app => app.key));
  console.log('[AppsLocal] Gmail apps:', APP_CATALOG.filter(app => app.key.includes('gmail')).map(app => `${app.key}: ${app.name}`));

  // Simulate API delay for list operation (15 seconds)
  await new Promise(resolve => setTimeout(resolve, 15000));

  // Filter by category if provided
  if (params.category) {
    // 📂 CATEGORY MAPPING
    // ==================
    // This map determines which apps appear in each category tab.
    // When adding new apps, update this map to include them in the right category.
    //
    // TO ADD A NEW APP TO A CATEGORY:
    // 1. Add AppKey to types.ts
    // 2. Update categoryOf() in utils.ts to assign the category
    // 3. Add the app's base name to the appropriate array below
    // 4. Example: 'slack': ['slack'] for Slack apps
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
