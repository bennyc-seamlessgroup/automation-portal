export type CategoryKey = "apps" | "ai" | "flow" | "utilities" | "products" | "custom";

// 🔑 APP KEY DEFINITIONS
// ====================
// This is the central registry of all app keys in the system.
// When adding new apps or new versions, ALWAYS update this type first.
//
// NAMING CONVENTION:
// - Base apps: "appNameFunction" (e.g., "gmailWatchEmails")
// - Versioned apps: "appNameFunctionV2", "appNameFunctionV3", etc.
// - New apps: follow the pattern "providerFunction" (e.g., "slackPost", "telegramSend")
//
// TO ADD A NEW VERSION OF AN EXISTING APP:
// 1. Add the new key here (e.g., | "gmailWatchEmailsV3")
// 2. Update categoryOf() in utils.ts to include the new key
// 3. Add to the appropriate AppGroup class (e.g., GmailApp.getAllSpecs())
// 4. Update apps.local.ts category filtering if needed
//
// TO ADD A COMPLETELY NEW APP:
// 1. Add the new key here following naming convention
// 2. Update categoryOf() in utils.ts to assign correct category
// 3. Create new AppGroup class or add to existing one
// 4. Update catalog.ts to include the new app group
// 5. Update apps.local.ts category filtering
// 6. Add to FunctionPicker _tags array if needed (for badges)
export type AppKey =
  // Apps (Gmail)
  | "gmailWatchEmails" | "gmailWatchEmailsV2" | "gmailSend" | "gmailSearch" | "slackPost" | "calendarCreate" | "sheetsAddRow" | "driveUpload" | "outlookSend" | "telegramSend" | "telegramSendV2"
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

// Data flow types
export type DataOutput = {
  key: string;
  label: string;
  type: "string" | "number" | "boolean" | "array" | "object";
  description?: string;
};

export type DataInput = {
  key: string;
  label: string;
  type: "string" | "number" | "boolean" | "array" | "object";
  description?: string;
  required?: boolean;
};

export type RFData = {
  label: string;
  appKey?: AppKey;
  values?: Record<string, any>;
  // Inspector state persistence
  connected?: boolean;
  configured?: boolean;
  currentStep?: 1 | 2 | 3;
  currentTab?: "connect" | "configure" | "test";
  hasTested?: boolean;
  selectedConnectionId?: string;
};

export type InspectorStep = {
  id: number;
  title: string;
  description: string;
  tab: "connect" | "configure" | "test";
};

export type InspectorConfig = {
  steps: InspectorStep[];
  defaultTab?: "connect" | "configure" | "test";
  headerTitle?: string;
  tabs?: Array<{
    key: "connect" | "configure" | "test";
    label: string;
    required?: boolean;
  }>;
  connections?: {
    type: "oauth" | "token" | "credentials";
    service?: string;
    fields?: Array<{
      key: string;
      label: string;
      type: "text" | "password" | "select";
      placeholder?: string;
      options?: string[];
      required?: boolean;
    }>;
  };
  validation?: {
    [fieldKey: string]: {
      required?: boolean;
      pattern?: string;
      custom?: (value: any) => boolean | string;
    };
  };
  customFields?: {
    [fieldKey: string]: {
      render?: (props: any) => React.ReactNode;
      component?: string;
    };
  };
};

export type AppSpec = {
  key: AppKey;
  name: string;
  color: string;
  icon?: string;
  // 📝 OPTIONAL FIELDS FOR ENHANCED UX
  // ==================================
  // These fields enhance the user experience but are optional
  description?: string; // 💡 Shows helpful description in function picker cards
  version?: number; // 🔢 Enables version tracking (V1, V2, V3, etc.)
  fields: {
    key: string;
    label: string;
    placeholder?: string;
    type?: "text" | "number" | "select" | "textarea" | "multiselect";
    options?: string[];
    required?: boolean;
    validation?: {
      pattern?: string;
      min?: number;
      max?: number;
    };
  }[];
  // Data flow capabilities
  dataOutputs?: DataOutput[];
  dataInputs?: DataInput[];
  inspector?: InspectorConfig;
};
