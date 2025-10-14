import type { AppSpec } from './types';
import { GmailApp } from './apps/GmailApp';
import { TelegramApp } from './apps/TelegramApp';

// Import other app classes as they are created
// import { SlackApp } from './apps/SlackApp';
// import { CalendarApp } from './apps/CalendarApp';
// etc.

// TODO: Add other app classes here as they are implemented

function generateAppCatalog(): AppSpec[] {
  const allSpecs: AppSpec[] = [];

  // Add Gmail app specs
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
