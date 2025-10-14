export type CategoryKey = "apps" | "ai" | "flow" | "utilities" | "products" | "custom";

export type AppKey =
  // Apps (Gmail)
  | "gmailNewEmail" | "gmailSend" | "gmailSearch" | "slackPost" | "calendarCreate" | "sheetsAddRow" | "driveUpload" | "outlookSend" | "telegramSend"
  // AI
  | "aiSummarize" | "aiExtract" | "aiClassify" | "aiTranslate" | "aiTranscribe" | "aiSearch"
  // Flow controls
  | "delay" | "schedule" | "paths" | "filter" | "loop" | "humanLoop"
  // Utilities
  | "webhook" | "http" | "formatter" | "code" | "emailParser" | "files"
  // Products
  | "prodTablesQuery" | "prodTablesInsert" | "prodTablesUpdate" | "prodInterfacesOpen" | "prodChatbotsSend" | "prodAgentsRun"
  // Custom
  | "customWebhook" | "customAction" | "customAuth" | "customHeaders" | "customScript";

export type RFData = {
  label: string;
  appKey?: AppKey;
  values?: Record<string, any>;
};

export type AppSpec = {
  key: AppKey;
  name: string;
  color: string;
  icon?: string;
  fields: {
    key: string;
    label: string;
    placeholder?: string;
    type?: "text" | "number" | "select";
    options?: string[];
  }[];
};
