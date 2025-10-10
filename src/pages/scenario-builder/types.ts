export type CategoryKey = "apps" | "ai" | "flow" | "utilities" | "products" | "custom";

export type AppKey =
  // Apps (�%�5)
  | "gmailSend" | "gmailSearch" | "slackPost" | "calendarCreate" | "sheetsAddRow" | "driveUpload" | "outlookSend" | "telegramSend"
  // AI (�%�5)
  | "aiSummarize" | "aiExtract" | "aiClassify" | "aiTranslate" | "aiTranscribe" | "aiSearch"
  // Flow controls (�%�5)
  | "delay" | "schedule" | "paths" | "filter" | "loop" | "humanLoop"
  // Utilities (�%�5)
  | "webhook" | "http" | "formatter" | "code" | "emailParser" | "files"
  // Products (�%�5)
  | "prodTablesQuery" | "prodTablesInsert" | "prodTablesUpdate" | "prodInterfacesOpen" | "prodChatbotsSend" | "prodAgentsRun"
  // Custom (�%�5)
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
