import { APP_CATALOG } from "./catalog";
import type { AppKey, AppSpec, CategoryKey } from "./types";

export function uid(prefix = "n") {
  return `${prefix}_${crypto.randomUUID()}`;
}

export function getAppSpec(key: AppKey): AppSpec {
  const spec = APP_CATALOG.find((a) => a.key === key);
  if (!spec) throw new Error(`Unknown app key: ${key}`);
  return spec;
}

// 📂 CATEGORY ASSIGNMENT
// ====================
// This function determines which category each app belongs to in the function picker.
// The categories are: "apps", "ai", "flow", "utilities", "products", "custom"
//
// TO ADD A NEW APP TO A CATEGORY:
// 1. Add the new AppKey to types.ts first
// 2. Add a new case here: case "newAppKey": return "apps";
// 3. Update the category filtering in apps.local.ts if needed
// 4. Update FunctionPicker _tags array if you want badges
//
// TO ADD A NEW VERSION OF AN EXISTING APP:
// 1. Add the new AppKey to types.ts (e.g., "gmailWatchEmailsV3")
// 2. Add a case here: case "gmailWatchEmailsV3": return "apps";
// 3. Add to the appropriate AppGroup class (e.g., GmailApp.getAllSpecs())
//
// CATEGORY GUIDELINES:
// - apps: External integrations (Gmail, Slack, Telegram, etc.)
// - ai: AI-powered functions (summarize, extract, classify, etc.)
// - flow: Workflow control (delay, filter, loop, etc.)
// - utilities: General utilities (webhook, HTTP, code, etc.)
// - products: Internal product integrations
// - custom: User-created custom functions
export function categoryOf(appKey: AppKey): CategoryKey {
  switch (appKey) {
    case "gmailWatchEmails":
    case "gmailWatchEmailsV2":
    case "gmailSend":
    case "gmailSearch":
    case "slackPost":
      return "apps";
    case "telegramSend":
    case "telegramSendV2":
      return "apps";
    case "aiSummarize":
    case "aiExtract":
    case "aiClassify":
    case "aiTranslate":
    case "aiTranscribe":
    case "aiSearch":
      return "ai";
    case "delay":
    case "schedule":
    case "paths":
    case "filter":
    case "loop":
    case "humanLoop":
      return "flow";
    case "webhook":
    case "http":
    case "formatter":
    case "code":
    case "emailParser":
    case "files":
      return "utilities";
    case "prodTablesQuery":
    case "prodTablesInsert":
    case "prodTablesUpdate":
    case "prodInterfacesOpen":
    case "prodChatbotsSend":
    case "prodAgentsRun":
      return "products";
    case "customWebhook":
    case "customAction":
    case "customAuth":
    case "customHeaders":
    case "customScript":
      return "custom";
    default:
      return "apps"; // Default fallback
  }
}
