import type { AppSpec } from '../types';

export class TelegramSend {
  static readonly appKey = 'telegram';
  static readonly appName = 'Telegram';
  static readonly appColor = '#0088cc';
  static readonly appIcon = '/src/assets/icons/icon_telegram.png';

  static getActions(): AppSpec[] {
    return [
      {
        key: 'telegramSend',
        name: 'Telegram — Send message',
        color: TelegramSend.appColor,
        icon: TelegramSend.appIcon,
        description: 'Send messages to Telegram chats or channels using your bot',
        version: 1,
        fields: [
          {
            key: 'botToken',
            label: 'Bot Token',
            placeholder: 'Connected Telegram bot token'
          },
          {
            key: 'chatId',
            label: 'Chat ID',
            type: 'select',
            options: ['Personal Chat', 'Group Chat', 'Channel'],
            required: true
          },
          {
            key: 'messageText',
            label: 'Message Text',
            placeholder: 'Message to send',
            type: 'textarea',
            required: true
          }
        ],
        // Data inputs that can accept variables from other nodes (like Gmail)
        dataInputs: [
          {
            key: 'body_plain',
            label: 'Body Plain',
            type: 'string',
            description: 'Plain text body from Gmail email (use {Gmail Node Name.body_plain})',
            required: false
          },
          {
            key: 'subject',
            label: 'Subject',
            type: 'string',
            description: 'Subject from Gmail email (use {Gmail Node Name.subject})',
            required: false
          },
          {
            key: 'from_name',
            label: 'From Name',
            type: 'string',
            description: 'Sender name from Gmail email (use {Gmail Node Name.from_name})',
            required: false
          },
          {
            key: 'from_email',
            label: 'From Email',
            type: 'string',
            description: 'Sender email from Gmail email (use {Gmail Node Name.from_email})',
            required: false
          },
          {
            key: 'body_html',
            label: 'Body Html',
            type: 'string',
            description: 'HTML body from Gmail email (use {Gmail Node Name.body_html})',
            required: false
          }
        ],
        inspector: {
          steps: [
            { id: 1, title: "Connect", description: "Connect your Telegram bot", tab: "connect" },
            { id: 2, title: "Configure", description: "Set up your message settings", tab: "configure" },
            { id: 3, title: "Test", description: "Test your Telegram message", tab: "test" }
          ],
          defaultTab: "connect",
          headerTitle: "Telegram – Send message",
          tabs: [
            { key: "connect", label: "Connect", required: true },
            { key: "configure", label: "Configure", required: true },
            { key: "test", label: "Test", required: false }
          ],
          connections: {
            type: "token",
            service: "telegram",
            fields: [
              {
                key: "botToken",
                label: "Bot Token",
                type: "password",
                placeholder: "Enter your Telegram bot token",
                required: true
              }
            ]
          },
          validation: {
            botToken: {
              required: true,
              pattern: "^[0-9]+:.*$"
            },
            chatId: {
              required: true,
              custom: (value: any) => !value || value === "Select Chat..." ? "Please select a chat to send the message to." : true
            },
            messageText: {
              required: true,
              custom: (value: any) => !value || value.trim() === "" ? "Please enter a message to send." : true
            }
          }
        }
      }
    ];
  }
}
