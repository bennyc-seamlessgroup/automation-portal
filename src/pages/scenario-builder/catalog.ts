import type { AppSpec } from './types';
import { GmailApp } from './apps/GmailApp';
import { TelegramApp } from './apps/TelegramApp';

// Import other app classes as they are created
// import { SlackApp } from './apps/SlackApp';
// import { CalendarApp } from './apps/CalendarApp';
// etc.

// TODO: Add other app classes here as they are implemented

// 🗂️ APP CATALOG GENERATION
// ========================
// This file aggregates all app definitions into a single APP_CATALOG array.
// The catalog is used by the apps service and function picker.
//
// TO ADD A NEW APP GROUP:
// 1. Create new AppGroup class (e.g., SlackApp.ts) with getAllSpecs() method
// 2. Import it here: import { SlackApp } from './apps/SlackApp';
// 3. Add it to the catalog: allSpecs.push(...SlackApp.getAllSpecs());
// 4. Update category filtering in apps.local.ts if needed
// 5. Update FunctionPicker _tags array if needed for badges
//
// TO ADD A NEW VERSION OF AN EXISTING APP:
// 1. Add the new AppKey to types.ts
// 2. Update categoryOf() in utils.ts
// 3. Add to the existing AppGroup class (e.g., GmailApp.getAllSpecs())
// 4. No changes needed here - it will automatically be included
//
// APP GROUPING PATTERN:
// - Each provider gets its own AppGroup class (GmailApp, TelegramApp, etc.)
// - Each AppGroup class has a getAllSpecs() method that returns AppSpec[]
// - All versions of the same app should be in the same AppGroup
function generateAppCatalog(): AppSpec[] {
  const allSpecs: AppSpec[] = [];

  // Add Gmail app specs (V1 and V2 through GmailApp)
  allSpecs.push(...GmailApp.getAllSpecs());

  // Add Telegram app specs
  allSpecs.push(...TelegramApp.getAllSpecs());

  // TODO: Add other app specs as they are implemented
  // allSpecs.push(...SlackApp.getAllSpecs());
  // allSpecs.push(...CalendarApp.getAllSpecs());
  // etc.

  return allSpecs;
}

export const APP_CATALOG: AppSpec[] = generateAppCatalog();
