export type CategoryKey = "apps" | "ai" | "flow" | "utilities" | "products" | "custom";

export type AppKey =
  // Apps (Gmail)
  | "gmailWatchEmails" | "gmailSend" | "gmailSearch" | "slackPost" | "calendarCreate" | "sheetsAddRow" | "driveUpload" | "outlookSend" | "telegramSend"
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
  tabs: Array<{
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
