import { useState, useEffect } from "react";
import type { Node } from "reactflow";
import { createTelegramConnection, getTelegramConnections, findTelegramConnectionByToken } from "../../../services/connections.service";

import type { AppKey, AppSpec, RFData } from "../types";
import { builderStyles } from "../styles";
import { getAppSpec } from "../utils";
import InspectorSkeletonData from "./InspectorSkeletonData";

type TelegramInspectorProps = {
  node: Node<RFData>;
  onChangeNode: (node: Node<RFData>) => void;
  onDeleteNode: (id: string) => void;
  onClose?: () => void;
  onShowAlert?: (message: string) => void;
};

export function TelegramInspector({ node, onChangeNode, onDeleteNode, onClose, onShowAlert }: TelegramInspectorProps) {
  const isApp = node.type === "app";
  const data = (node.data || {}) as RFData;
  const appKey = (data.appKey as AppKey) || ("" as AppKey);
  const spec: AppSpec | null = isApp ? getAppSpec(appKey) : null;

  const setData = (patch: Partial<RFData>) =>
    onChangeNode({ ...node, data: { ...(node.data || {}), ...patch } });

  // Three tabs for Telegram: Connect / Configure / Test
  const [activeTab, setActiveTab] = useState<"connect" | "configure" | "test">("connect");

  // Header title editing state
  const [editingTitle, setEditingTitle] = useState(false);

  // Step tracking for wizard-like experience
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [isConnected, setIsConnected] = useState(false);
  const [isConfigured, setIsConfigured] = useState(false);

  // Header title override for Telegram
  const headerTitle = data.label || "Telegram – Send message";

  // Step titles and descriptions
  const steps = [
    { id: 1, title: "Connect", description: "Connect your Telegram bot" },
    { id: 2, title: "Configure", description: "Set up your message settings" },
    { id: 3, title: "Test", description: "Test your Telegram message" }
  ];

  // Bot connection state
  const [botName, setBotName] = useState<string>("");
  const [isConnecting, setIsConnecting] = useState<boolean>(false);

  // Connection selection state
  const [existingConnections, setExistingConnections] = useState<any[]>([]);
  const [selectedConnectionId, setSelectedConnectionId] = useState<string>("");
  const [showNewTokenInput, setShowNewTokenInput] = useState<boolean>(false);

  // Chat selection state
  const [availableChats, setAvailableChats] = useState<Array<{id: string, name: string, type: string, username?: string}>>([]);
  const [isLoadingChats, setIsLoadingChats] = useState<boolean>(false);

  // Test state
  const [hasTested, setHasTested] = useState<boolean>(false);
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [isLoadingTestData, setIsLoadingTestData] = useState<boolean>(false);
  const [testError, setTestError] = useState<string>("");

  // Function to fetch bot information from Telegram API
  const fetchBotInfo = async (token: string) => {
    try {
      setIsConnecting(true);

      const response = await fetch(`https://api.telegram.org/bot${token}/getMe`);
      const data = await response.json();

      if (data.ok && data.result) {
        const botInfo = data.result;
        setBotName(botInfo.first_name || botInfo.username || "Bot");
        setIsConnected(true);
        setCurrentStep(2);
        setActiveTab("configure");

        // Save successful connection to connections list (only if it doesn't already exist)
        const existingConnection = findTelegramConnectionByToken(token);
        if (!existingConnection) {
          createTelegramConnection(token, botName, botInfo.username);
        }

        // Fetch available chats after connecting
        await fetchAvailableChats(token);
      } else {
        throw new Error(data.description || "Failed to connect to bot");
      }
    } catch (error) {
      console.error("Failed to connect to Telegram bot:", error);
      if (onShowAlert) {
        onShowAlert(`Failed to connect to bot: ${error instanceof Error ? error.message : "Unknown error"}`);
      }
    } finally {
      setIsConnecting(false);
    }
  };

  // Function to fetch available chats from Telegram API
  const fetchAvailableChats = async (token: string) => {
    try {
      setIsLoadingChats(true);

      // Get recent updates to find chats
      const response = await fetch(`https://api.telegram.org/bot${token}/getUpdates?limit=100`);
      const data = await response.json();

      if (data.ok && data.result) {
        const chats = new Map<string, {id: string, name: string, type: string, username?: string}>();

        // Extract unique chats from updates
        data.result.forEach((update: any) => {
          if (update.message) {
            const chat = update.message.chat;
            const chatId = chat.id.toString();
            const chatType = chat.type;

            if (!chats.has(chatId)) {
              let chatName = "";
              if (chatType === "private") {
                // Use first_name + last_name if available, otherwise use username
                chatName = `${chat.first_name || ""} ${chat.last_name || ""}`.trim() || chat.username || "Private Chat";
              } else if (chatType === "group") {
                chatName = chat.title || "Group Chat";
              } else if (chatType === "supergroup") {
                chatName = chat.title || "Super Group";
              } else if (chatType === "channel") {
                chatName = chat.title || chat.username || "Channel";
              }

              chats.set(chatId, {
                id: chatId,
                name: chatName,
                type: chatType,
                username: chat.username // Store the actual username
              });
            }
          }
        });

        setAvailableChats(Array.from(chats.values()));
      }
    } catch (error) {
      console.error("Failed to fetch chats:", error);
      // Don't show error for chat fetching - it's optional
    } finally {
      setIsLoadingChats(false);
    }
  };

  // Function to send test message via Telegram API
  const sendTestMessage = async () => {
    try {
      setIsTesting(true);
      setIsLoadingTestData(true);
      setTestError("");

      const botToken = (localValues?.botToken as string) || "";
      const chatId = (localValues?.chatId as string) || "";
      const messageText = (localValues?.messageText as string) || "";

      if (!botToken || !chatId || !messageText) {
        throw new Error("Missing required information for test");
      }

      // Send test message via Telegram API
      const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: `🤖 Test Message from Automation Portal\n\n"${messageText}"\n\n✅ Bot is working correctly!`,
          parse_mode: 'HTML'
        })
      });

      const data = await response.json();

      if (data.ok) {
        setHasTested(true);
        setIsLoadingTestData(false);
        if (onShowAlert) {
          onShowAlert("✅ Test message sent successfully! Check your Telegram chat.");
        }
      } else {
        throw new Error(data.description || "Failed to send test message");
      }
    } catch (error) {
      console.error("Failed to send test message:", error);
      setTestError(error instanceof Error ? error.message : "Failed to send test message");
      setIsLoadingTestData(false);
      if (onShowAlert) {
        onShowAlert(`❌ Failed to send test message: ${error instanceof Error ? error.message : "Unknown error"}`);
      }
    } finally {
      setIsTesting(false);
    }
  };

  const handleConnect = async () => {
    // Check if bot token is provided (use localValues instead of data.values for immediate feedback)
    const botToken = (localValues?.botToken as string) || "";
    if (!botToken || botToken.trim() === "") {
      if (onShowAlert) {
        onShowAlert("Please enter your Bot Token before connecting.");
      }
      return;
    }

    // Fetch bot information from Telegram API
    await fetchBotInfo(botToken);
  };

  const handleConfigure = () => {
    // Check if required fields are filled (use localValues for immediate feedback)
    const chatId = (localValues?.chatId as string) || "";
    const messageText = (localValues?.messageText as string) || "";

    if (!chatId || chatId.trim() === "" || chatId === "Select Chat...") {
      if (onShowAlert) {
        onShowAlert("Please select a Chat ID before continuing.");
      }
      return;
    }

    if (!messageText || messageText.trim() === "") {
      if (onShowAlert) {
        onShowAlert("Please enter a message text before continuing.");
      }
      return;
    }

    setIsConfigured(true);
    setCurrentStep(3);
    setActiveTab("test");
  };

  const handleBackToConnect = () => {
    setCurrentStep(1);
    setActiveTab("connect");
  };

  const handleBackToConfigure = () => {
    setCurrentStep(2);
    setActiveTab("configure");
  };

  // Load existing Telegram connections on mount
  useEffect(() => {
    const telegramConnections = getTelegramConnections();
    setExistingConnections(telegramConnections);

    // If we have a bot token in localValues, try to find the matching connection
    const currentToken = (localValues?.botToken as string) || "";
    if (currentToken) {
      const existingConnection = findTelegramConnectionByToken(currentToken);
      if (existingConnection) {
        setSelectedConnectionId(existingConnection.id);
      }
    }
  }, []);

  // Update local values when connection is selected
  useEffect(() => {
    if (selectedConnectionId) {
      const connection = existingConnections.find(c => c.id === selectedConnectionId);
      if (connection) {
        writeValue("botToken", connection.credentials?.token || "");
      }
    }
  }, [selectedConnectionId, existingConnections]);

  const [localValues, setLocalValues] = useState<Record<string, unknown>>(data.values || {});

  // Sync local values with node data when node changes
  useEffect(() => {
    setLocalValues(data.values || {});
  }, [data.values]);

  const writeValue = (k: string, v: unknown) => {
    const newValues = { ...localValues, [k]: v };
    setLocalValues(newValues);

    // Immediately save to node data
    const updatedNode = {
      ...node,
      data: {
        ...node.data,
        values: newValues
      }
    };
    onChangeNode(updatedNode);
  };

  // Generic field renderer with Telegram-specific tweaks
  const renderField = (field: {
    key: string;
    label: string;
    type?: string;
    options?: string[];
    placeholder?: string;
  }) => {
    // Skip label field in Configure
    if (field.key.toLowerCase() === "label") return null;

    // Hide "Bot Token" field in Configure (shown in Connect step)
    const normalizedLabel = field.label.trim().toLowerCase();
    if (normalizedLabel === "bot token") return null;

    // Handle Chat ID dropdown
    if (field.key === "chatId") {
      const fieldValue = (localValues?.[field.key] ?? "") as string;

      return (
        <div key={field.key} style={{ marginTop: 10 }}>
          <div style={builderStyles.formLabel}>
            {field.label}
            {field.label.includes("*") && (
              <span style={{ color: "#dc2626" }}>*</span>
            )}
          </div>

          {/* Chat selection dropdown */}
          <select
            style={{
              ...builderStyles.select,
              width: "100%",
              padding: "8px 32px 8px 12px",
              borderRadius: "6px",
              border: "1px solid #d1d5db",
              fontSize: "14px",
              appearance: "none",
              backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 4 5'><path fill='%23666' d='M2 0L0 2h4zm0 5L0 3h4z'/></svg>")`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 8px center",
              backgroundSize: "8px",
            } as any}
            value={fieldValue}
            onChange={(e) => writeValue(field.key, e.target.value)}
          >
            <option value="">Select Chat...</option>

            {/* Show chats with name and username */}
            {availableChats.map((chat) => {
              // For private chats, show name and username if available
              let displayName = chat.name;
              if (chat.type === "private" && chat.name !== "Private Chat") {
                // Show name and actual username if available
                displayName = chat.username ? `${chat.name} (@${chat.username})` : chat.name;
              } else if (chat.type === "channel" && chat.name !== "Channel") {
                // For channels, show title and username if available
                displayName = chat.username ? `${chat.name} (@${chat.username})` : chat.name;
              }

              return (
                <option key={chat.id} value={chat.id}>
                  {displayName} ({chat.type})
                </option>
              );
            })}
          </select>

          {/* Loading indicator */}
          {isLoadingChats && (
            <div style={{
              fontSize: "12px",
              color: "#6b7280",
              marginTop: "4px",
              display: "flex",
              alignItems: "center",
              gap: "4px"
            }}>
              <i className="bi bi-hourglass-split" />
              Loading chats...
            </div>
          )}

          {/* Chat count */}
          {availableChats.length > 0 && (
            <div style={{
              fontSize: "12px",
              color: "#6b7280",
              marginTop: "4px"
            }}>
              Found {availableChats.length} chat{availableChats.length !== 1 ? 's' : ''}
            </div>
          )}
        </div>
      );
    }

    // Handle Message Text field (resizable textarea)
    if (field.key === "messageText") {
      const fieldValue = (localValues?.[field.key] ?? "") as string;

      return (
        <div key={field.key} style={{ marginTop: 10 }}>
          <div style={builderStyles.formLabel}>
            {field.label}
            {field.label.includes("*") && (
              <span style={{ color: "#dc2626" }}>*</span>
            )}
          </div>
          <textarea
            style={{
              ...builderStyles.input,
              width: "100%",
              minHeight: "80px",
              resize: "vertical",
              padding: "8px 12px",
              borderRadius: "6px",
              border: "1px solid #d1d5db",
              fontSize: "14px",
              fontFamily: "inherit",
            }}
            value={fieldValue}
            onChange={(e) => writeValue(field.key, e.target.value)}
            placeholder={field.placeholder}
          />
        </div>
      );
    }

    // Default text input for other fields
    const fieldValue = (localValues?.[field.key] ?? "") as string;

    return (
      <div key={field.key} style={{ marginTop: 10 }}>
        <div style={builderStyles.formLabel}>{field.label}</div>
        <input
          style={{
            ...builderStyles.input,
            width: "100%",
            padding: "8px 12px",
            borderRadius: "6px",
            border: "1px solid #d1d5db",
            fontSize: "14px",
          }}
          type={field.type === "number" ? "number" : "text"}
          value={fieldValue}
          onChange={(e) => writeValue(field.key, e.target.value)}
          placeholder={field.placeholder}
        />
      </div>
    );
  };

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      height: "100%"
    }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
          position: "relative",
        }}
      >
        {editingTitle ? (
          <input
            autoFocus
            value={data.label || ""}
            onChange={(e) => setData({ label: e.target.value })}
            onBlur={() => setEditingTitle(false)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                setEditingTitle(false);
              }
            }}
            style={{
              ...builderStyles.nameInput,
              fontSize: 16,
              fontWeight: 600,
              border: "1px solid #e5e7eb",
              outline: "none",
              background: "transparent",
              padding: "6px 8px",
              margin: 0,
            }}
          />
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>{headerTitle}</h3>
            <button
              onClick={() => setEditingTitle(true)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "2px",
                borderRadius: "4px",
                color: "#6b7280",
                fontSize: "14px",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#f3f4f6";
                e.currentTarget.style.color = "#374151";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "none";
                e.currentTarget.style.color = "#6b7280";
              }}
              title="Edit title"
            >
              <i className="bi bi-pencil-square" />
            </button>
          </div>
        )}
        {/* Trash icon in top right corner */}
        <button
          onClick={() => onDeleteNode(node.id)}
          style={{
            position: "absolute",
            top: -4,
            right: -4,
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "4px",
            borderRadius: "4px",
            color: "#6b7280",
            fontSize: "16px",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#fee2e2";
            e.currentTarget.style.color = "#dc2626";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "none";
            e.currentTarget.style.color = "#6b7280";
          }}
          title="Delete node"
        >
          <i className="bi bi-trash" />
        </button>
      </div>

      {/* Step indicator */}
      <div style={{
        display: "flex",
        flexDirection: "column",
        marginBottom: 24,
        padding: "16px",
        background: "#f8fafc",
        borderRadius: "8px",
        border: "1px solid #e2e8f0",
        gap: "16px"
      }}>
        {steps.map((step, index) => (
          <div key={step.id} style={{
            display: "flex",
            alignItems: "center",
            position: "relative"
          }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              background: currentStep >= step.id ? "#2563eb" : "#e2e8f0",
              color: currentStep >= step.id ? "#fff" : "#64748b",
              fontSize: "14px",
              fontWeight: "600",
              marginRight: "16px",
              position: "relative",
              flexShrink: 0,
              zIndex: 2
            }}>
              <span>{step.id}</span>
              {step.id === 1 && isConnected && (
                <div style={{
                  position: "absolute",
                  top: "-2px",
                  right: "-2px",
                  width: "12px",
                  height: "12px",
                  background: "#10b981",
                  borderRadius: "50%",
                  border: "2px solid #fff",
                  zIndex: 3
                }} />
              )}
              {step.id === 2 && isConfigured && (
                <div style={{
                  position: "absolute",
                  top: "-2px",
                  right: "-2px",
                  width: "12px",
                  height: "12px",
                  background: "#10b981",
                  borderRadius: "50%",
                  border: "2px solid #fff",
                  zIndex: 3
                }} />
              )}
            </div>

            {/* Vertical connector line */}
            {index < steps.length - 1 && (
              <div style={{
                position: "absolute",
                left: "16px",
                top: "32px",
                width: "2px",
                height: "24px",
                background: currentStep > step.id ? "#2563eb" : "#e2e8f0",
                zIndex: 1
              }} />
            )}

            <div style={{ flex: 1 }}>
              <div style={{
                fontSize: "14px",
                fontWeight: currentStep === step.id ? "600" : "500",
                color: currentStep >= step.id ? "#1e293b" : "#64748b",
                marginBottom: "4px"
              }}>
                {step.title}
                {step.id === 1 && botName && (
                  <span style={{ color: "#10b981", marginLeft: "8px", fontWeight: "500" }}>
                    ✓ {botName}
                  </span>
                )}
              </div>
              <div style={{
                fontSize: "12px",
                color: currentStep >= step.id ? "#475569" : "#94a3b8",
                lineHeight: "1.4"
              }}>
                {step.description}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Compact step indicator - right after the main roadmap */}
      <div style={{
        margin: "24px 0",
        padding: "16px 20px",
        background: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)",
        border: "1px solid #bae6fd",
        borderRadius: "12px",
        textAlign: "center",
        boxShadow: "0 2px 8px rgba(59, 130, 246, 0.08)"
      }}>
        <div style={{
          fontSize: "14px",
          color: "#64748b",
          fontWeight: "500"
        }}>
          <span style={{
            color: "#2563eb",
            fontWeight: "700",
            fontSize: "16px",
            marginRight: "8px"
          }}>
            {currentStep}
          </span>
          <span>of {steps.length}</span>
          <span style={{
            margin: "0 12px",
            color: "#cbd5e1",
            fontWeight: "300"
          }}>•</span>
          <span style={{
            color: "#1e293b",
            fontWeight: "600"
          }}>
            {steps.find(s => s.id === currentStep)?.title || "Unknown"}
          </span>
        </div>
      </div>

      {/* Back buttons for steps 2 and 3 */}
      {currentStep === 2 && (
        <div style={{ marginBottom: 16 }}>
          <button
            onClick={handleBackToConnect}
            style={{
              background: "none",
              border: "1px solid #d1d5db",
              color: "#6b7280",
              padding: "6px 12px",
              borderRadius: "6px",
              fontSize: "12px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px"
            }}
          >
            <i className="bi bi-arrow-left" />
            Back to Connect
          </button>
        </div>
      )}
      {currentStep === 3 && (
        <div style={{ marginBottom: 16 }}>
          <button
            onClick={handleBackToConfigure}
            style={{
              background: "none",
              border: "1px solid #d1d5db",
              color: "#6b7280",
              padding: "6px 12px",
              borderRadius: "6px",
              fontSize: "12px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px"
            }}
          >
            <i className="bi bi-arrow-left" />
            Back to Configure
          </button>
        </div>
      )}

      {/* CONNECT TAB */}
      {activeTab === "connect" && (
        <div>
          {/* Existing connections dropdown */}
          {existingConnections.length > 0 && !showNewTokenInput && (
            <>
              <div style={{ marginTop: 12 }}>
                <div style={builderStyles.formLabel}>Select Existing Connection</div>
                <select
                  style={{
                    ...builderStyles.select,
                    width: "100%",
                    padding: "8px 32px 8px 12px",
                    borderRadius: "6px",
                    border: "1px solid #d1d5db",
                    fontSize: "14px",
                    appearance: "none",
                    backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 4 5'><path fill='%23666' d='M2 0L0 2h4zm0 5L0 3h4z'/></svg>")`,
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "right 8px center",
                    backgroundSize: "8px",
                  } as any}
                  value={selectedConnectionId}
                  onChange={(e) => setSelectedConnectionId(e.target.value)}
                >
                  <option value="">Select a saved Telegram connection...</option>
                  {existingConnections.map((connection) => (
                    <option key={connection.id} value={connection.id}>
                      {connection.name}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginTop: 12, textAlign: "center" }}>
                <button
                  type="button"
                  onClick={() => setShowNewTokenInput(true)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#6b7280",
                    fontSize: "12px",
                    cursor: "pointer",
                    textDecoration: "underline"
                  }}
                >
                  Or enter a new bot token
                </button>
              </div>
            </>
          )}

          {/* Bot Token field (shown when no connections exist or when adding new) */}
          {(existingConnections.length === 0 || showNewTokenInput) && (
            <>
              <div style={{ marginTop: 12 }}>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "4px"
                }}>
                  <div style={builderStyles.formLabel}>
                    Bot Token
                    <span style={{ color: "#dc2626" }}>*</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (onShowAlert) {
                        onShowAlert("To create a new Telegram bot:\n\n1. Open Telegram and search for @BotFather\n2. Send /newbot to BotFather\n3. Choose a name for your bot\n4. Choose a username for your bot (ending with 'bot')\n5. Copy the token provided by BotFather\n\nFor detailed instructions, visit: https://core.telegram.org/bots/features#creating-a-new-bot");
                      }
                    }}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#2563eb",
                      fontSize: "12px",
                      cursor: "pointer",
                      textDecoration: "underline",
                      padding: "0"
                    }}
                    title="How to create a new bot"
                  >
                    How to create a new bot?
                  </button>
                </div>
                <input
                  style={{
                    ...builderStyles.input,
                    width: "100%",
                    padding: "8px 12px",
                    borderRadius: "6px",
                    border: "1px solid #d1d5db",
                    fontSize: "14px",
                  }}
                  type="text"
                  value={(localValues?.botToken as string) || ""}
                  onChange={(e) => writeValue("botToken", e.target.value)}
                  placeholder="Enter your Telegram bot token"
                />
              </div>

              {existingConnections.length > 0 && (
                <div style={{ marginTop: 12, textAlign: "center" }}>
                  <button
                    type="button"
                    onClick={() => setShowNewTokenInput(false)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#6b7280",
                      fontSize: "12px",
                      cursor: "pointer",
                      textDecoration: "underline"
                    }}
                  >
                    Or select from existing connections
                  </button>
                </div>
              )}
            </>
          )}

          {/* Connect button */}
          <div style={{ marginTop: 12 }}>
            <div
              className="d-flex align-items-center gap-2"
              style={{ marginBottom: 6, color: "#6b7280", fontSize: 12 }}
            >
              <i className="bi bi-robot" /> Connect your Telegram bot
            </div>

            <button
              style={{
                ...builderStyles.input,
                background: isConnecting ? "#6b7280" : "#2563eb",
                color: "#fff",
                border: "none",
                cursor: isConnecting ? "not-allowed" : "pointer",
                padding: "8px 16px",
                borderRadius: "6px",
                fontSize: "14px",
                fontWeight: "500",
                width: "100%",
              }}
              onClick={handleConnect}
              disabled={isConnecting}
            >
              {isConnecting ? (
                <>
                  <i className="bi bi-hourglass-split me-2" />
                  Connecting...
                </>
              ) : (
                <>
                  <i className="bi bi-telegram me-2" />
                  Connect Bot
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* CONFIGURE TAB */}
      {activeTab === "configure" && (
        <div style={{ marginTop: 4 }}>
          {isApp && spec ? (
            <>
              <div style={{ ...builderStyles.formLabel, fontWeight: 600, color: "#374151" }}>
                {headerTitle} Configuration
              </div>

              {/* Render spec fields with Telegram-specific tweaks */}
              {spec.fields
                .filter((f) => f.key.toLowerCase() !== "label")
                .map((f) => renderField(f))}

              {/* Configure button */}
              <div style={{ marginTop: 16 }}>
                <button
                  style={{
                    ...builderStyles.input,
                    background: "#16a34a",
                    color: "#fff",
                    border: "none",
                    cursor: "pointer",
                    padding: "8px 16px",
                    borderRadius: "6px",
                    fontSize: "14px",
                    fontWeight: "500",
                    width: "100%",
                  }}
                  onClick={handleConfigure}
                >
                  Configure & Continue
                </button>
              </div>
            </>
          ) : (
            <div className="text-secondary" style={{ fontSize: 13 }}>
              Select a Telegram node to configure its options.
            </div>
          )}
        </div>
      )}

      {/* TEST TAB */}
      {activeTab === "test" && (
        <div style={{ marginTop: 4 }}>
          <div style={{ ...builderStyles.formLabel, fontWeight: 600, color: "#374151", marginBottom: 12 }}>
            Send Message to Telegram
          </div>

          <div style={{
            background: "#f8fafc",
            border: "1px solid #e2e8f0",
            borderRadius: "8px",
            padding: "16px",
            marginBottom: 16
          }}>
            <p style={{ fontSize: "13px", color: "#475569", margin: 0, lineHeight: 1.5 }}>
              To test Telegram, we need to create a new message in your selected chat. This will send the configured message to verify your bot is working correctly.
            </p>
          </div>

          <div style={{ display: "flex", gap: "8px" }}>
            {isLoadingTestData ? (
              <InspectorSkeletonData type="telegram" rows={2} />
            ) : !hasTested ? (
              <>
                <button
                  style={{
                    ...builderStyles.input,
                    background: "#6b7280",
                    color: "#fff",
                    border: "none",
                    cursor: "pointer",
                    padding: "8px 16px",
                    borderRadius: "6px",
                    fontSize: "14px",
                    fontWeight: "500",
                    flex: 1,
                  }}
                  onClick={() => {
                    if (onClose) onClose();
                  }}
                >
                  Skip Test
                </button>
                <button
                  style={{
                    ...builderStyles.input,
                    background: isTesting ? "#6b7280" : "#2563eb",
                    color: "#fff",
                    border: "none",
                    cursor: isTesting ? "not-allowed" : "pointer",
                    padding: "8px 16px",
                    borderRadius: "6px",
                    fontSize: "14px",
                    fontWeight: "500",
                    flex: 1,
                  }}
                  onClick={sendTestMessage}
                  disabled={isTesting}
                >
                  {isTesting ? (
                    <>
                      <i className="bi bi-hourglass-split me-2" />
                      Sending...
                    </>
                  ) : (
                    "Test"
                  )}
                </button>
              </>
            ) : (
              <>
                <button
                  style={{
                    ...builderStyles.input,
                    background: "#16a34a",
                    color: "#fff",
                    border: "none",
                    cursor: "pointer",
                    padding: "8px 16px",
                    borderRadius: "6px",
                    fontSize: "14px",
                    fontWeight: "500",
                    flex: 1,
                  }}
                  onClick={() => {
                    // Reset test state for another test
                    setHasTested(false);
                    setTestError("");
                    setIsLoadingTestData(true);
                    sendTestMessage();
                  }}
                >
                  Test Again
                </button>
                <button
                  style={{
                    ...builderStyles.input,
                    background: "#2563eb",
                    color: "#fff",
                    border: "none",
                    cursor: "pointer",
                    padding: "8px 16px",
                    borderRadius: "6px",
                    fontSize: "14px",
                    fontWeight: "500",
                    flex: 1,
                  }}
                  onClick={() => {
                    if (onClose) onClose();
                  }}
                >
                  Done
                </button>
              </>
            )}
          </div>

          {/* Error message */}
          {testError && (
            <div style={{
              background: "#fee2e2",
              border: "1px solid #fecaca",
              color: "#dc2626",
              padding: "8px 12px",
              borderRadius: "6px",
              fontSize: "12px",
              marginTop: "8px"
            }}>
              <i className="bi bi-exclamation-triangle me-2" />
              {testError}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
