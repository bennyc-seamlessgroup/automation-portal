import { APP_CATALOG } from "./catalog";
import type { AppKey, AppSpec, CategoryKey } from "./types";

export function uid(prefix = "n") {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

export function getAppSpec(key: AppKey): AppSpec {
  const spec = APP_CATALOG.find((a) => a.key === key);
  if (!spec) throw new Error(`Unknown app key: ${key}`);
  return spec;
}

export function categoryOf(appKey: AppKey): CategoryKey {
  switch (appKey) {
    case "gmailSend":
    case "gmailSearch":
    case "slackPost":
    case "calendarCreate":
    case "sheetsAddRow":
    case "driveUpload":
    case "outlookSend":
    case "telegramSend":
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
  }
}
