import type { AppSpec } from '../types';
import { GmailWatchEmails } from './GmailWatchEmails';
import { GmailWatchEmailsV2 } from './GmailWatchEmailsV2';
import { GmailSendApp } from './GmailSendApp';
import { GmailSearchApp } from './GmailSearchApp';

// 📦 APP GROUP CLASS EXAMPLE
// =========================
// This is an example of how to structure an AppGroup class.
// Each provider (Gmail, Telegram, Slack, etc.) should have its own AppGroup class.
//
// CLASS NAMING: {ProviderName}App (e.g., GmailApp, TelegramApp, SlackApp)
// STATIC METHOD: getAllSpecs() - returns all AppSpec[] for this provider
// VERSION HANDLING: Include all versions (V1, V2, V3) in the same getAllSpecs()
//
// TO CREATE A NEW APP GROUP:
// 1. Create new class: export class NewProviderApp
// 2. Add static getAllSpecs() method that returns AppSpec[]
// 3. Import individual app classes (e.g., NewProviderWatchEmails, NewProviderSend)
// 4. Add to catalog.ts: import { NewProviderApp } from './apps/NewProviderApp';
// 5. Add to catalog: allSpecs.push(...NewProviderApp.getAllSpecs());
//
// TO ADD A NEW VERSION:
// 1. Create new app class (e.g., GmailWatchEmailsV3.ts)
// 2. Import it here: import { GmailWatchEmailsV3 } from './GmailWatchEmailsV3';
// 3. Add to getAllSpecs(): ...GmailWatchEmailsV3.getTriggers()
// 4. Add AppKey to types.ts: | "gmailWatchEmailsV3"
// 5. Update categoryOf() in utils.ts: case "gmailWatchEmailsV3":
export class GmailApp {
  static readonly appKey = 'gmail';
  static readonly appName = 'Gmail';
  static readonly appColor = '#ef4444';
  // 🎨 PROFESSIONAL ICON SYSTEM
  // ============================
  // All Gmail functions now use the professional Gmail icon image:
  // - Icon path: /src/assets/icons/icon_gmail.png
  // - UI components automatically detect image vs emoji icons
  // - Consistent branding across all Gmail functions
  // - Maintains backward compatibility with emoji icons
  static readonly appIcon = '/src/assets/icons/icon_gmail.png';

  // Grouping class - aggregates all Gmail functionality
  static getAllSpecs(): AppSpec[] {
    return [
      ...GmailWatchEmails.getTriggers(),
      ...GmailWatchEmailsV2.getTriggers(),
      ...GmailSendApp.getActions(),
      ...GmailSearchApp.getActions()
    ];
  }

  // Expose individual app classes for configuration phases
  static getGmailWatchEmailsApp() {
    return GmailWatchEmails;
  }

  static getGmailWatchEmailsV2App() {
    return GmailWatchEmailsV2;
  }

  static getGmailSendApp() {
    return GmailSendApp;
  }

  static getGmailSearchApp() {
    return GmailSearchApp;
  }
}
