import type { AppSpec } from '../types';

export type ConfigurationPhase = {
  key: string;
  name: string;
  fields: {
    key: string;
    label: string;
    placeholder?: string;
    type?: "text" | "number" | "select" | "button";
    options?: string[];
    action?: string; // For buttons, the action to trigger
  }[];
};

export class TelegramSend {
  static readonly appKey = 'telegram';
  static readonly appName = 'Telegram';
  static readonly appColor = '#0088cc';
  static readonly appIcon = '💬';

  static getConfigurationPhases(appKey: string): ConfigurationPhase[] {
    if (appKey === 'telegramSend') {
      return [
        {
          key: 'connect',
          name: 'Connect',
          fields: [
            {
              key: 'botToken',
              label: 'Bot Token',
              placeholder: 'Enter your Telegram bot token',
              type: 'text'
            },
            {
              key: 'connectBot',
              label: 'Connect Telegram Bot',
              type: 'button',
              action: 'connectTelegram'
            }
          ]
        },
        {
          key: 'configure',
          name: 'Configure',
          fields: [
            {
              key: 'chatId',
              label: 'Chat ID',
              type: 'select',
              options: ['Select Chat...', 'Personal Chat', 'Group Chat', 'Channel']
            },
            {
              key: 'messageText',
              label: 'Message Text',
              placeholder: 'Enter the message to send',
              type: 'text'
            },
            {
              key: 'continue',
              label: 'Continue to Test',
              type: 'button',
              action: 'continueToTest'
            }
          ]
        }
      ];
    }

    return [];
  }

  static getActions(): AppSpec[] {
    return [
      {
        key: 'telegramSend',
        name: 'Telegram — Send message',
        color: TelegramSend.appColor,
        icon: TelegramSend.appIcon,
        fields: [
          {
            key: 'botToken',
            label: 'Bot Token',
            placeholder: 'Connected Telegram bot token'
          },
          {
            key: 'chatId',
            label: 'Chat ID *',
            type: 'select',
            options: ['Personal Chat', 'Group Chat', 'Channel']
          },
          {
            key: 'messageText',
            label: 'Message Text *',
            placeholder: 'Message to send'
          }
        ]
      }
    ];
  }
}
