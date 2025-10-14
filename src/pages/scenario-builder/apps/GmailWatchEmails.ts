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

export class GmailWatchEmails {
  static readonly appKey = 'gmail';
  static readonly appName = 'Gmail';
  static readonly appColor = '#ef4444';
  static readonly appIcon = '✉️';

  static getConfigurationPhases(appKey: string): ConfigurationPhase[] {
    if (appKey === 'gmailWatchEmails') {
      return [
        {
          key: 'connect',
          name: 'Connect',
          fields: [
            {
              key: 'label',
              label: 'Label',
              placeholder: 'Watch emails Trigger'
            },
            {
              key: 'connectAccount',
              label: 'Connect Gmail Account',
              type: 'button',
              action: 'connectGmail'
            }
          ]
        },
        {
          key: 'test',
          name: 'Test',
          fields: [
            {
              key: 'testDescription',
              label: 'Test Gmail Connection',
              type: 'text',
              placeholder: 'Test your Gmail connection to ensure it\'s working properly. We\'ll check for recent emails in your selected folder.'
            },
            {
              key: 'continue',
              label: 'Done',
              type: 'button',
              action: 'finish'
            }
          ]
        }
      ];
    }

    return [];
  }

  static getTriggers(): AppSpec[] {
    return [
      {
        key: 'gmailWatchEmails',
        name: 'Gmail — Watch emails',
        color: GmailWatchEmails.appColor,
        icon: GmailWatchEmails.appIcon,
        fields: [
          {
            key: 'mailbox',
            label: 'Email Category',
            type: 'select',
            options: ['Inbox', 'Sent', 'Chat', 'Starred', 'Important', 'Trash', 'Draft', 'Spam', 'Unread']
          },
          {
            key: 'account',
            label: 'Gmail Account',
            placeholder: 'Connected Gmail account'
          }
        ]
      }
    ];
  }
}
