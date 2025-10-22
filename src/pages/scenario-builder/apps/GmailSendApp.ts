import type { AppSpec } from '../types';

export class GmailSendApp {
  static readonly appKey = 'gmail';
  static readonly appName = 'Gmail';
  static readonly appColor = '#ef4444';
  static readonly appIcon = '/src/assets/icons/icon_gmail.png';

  static getActions(): AppSpec[] {
    return [
      {
        key: 'gmailSend',
        name: 'Gmail — Send Email',
        color: GmailSendApp.appColor,
        icon: GmailSendApp.appIcon,
        description: 'Send emails through your Gmail account',
        version: 1,
        fields: [
          { key: 'to', label: 'To', placeholder: 'user@example.com' },
          { key: 'subject', label: 'Subject', placeholder: 'Hello' },
          { key: 'text', label: 'Body', placeholder: 'Message...' }
        ]
      }
    ];
  }
}
