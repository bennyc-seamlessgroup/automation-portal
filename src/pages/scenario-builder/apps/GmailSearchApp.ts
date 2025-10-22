import type { AppSpec } from '../types';

export class GmailSearchApp {
  static readonly appKey = 'gmail';
  static readonly appName = 'Gmail';
  static readonly appColor = '#ef4444';
  static readonly appIcon = '/src/assets/icons/icon_gmail.png';

  static getActions(): AppSpec[] {
    return [
      {
        key: 'gmailSearch',
        name: 'Gmail — Search Emails',
        color: GmailSearchApp.appColor,
        icon: GmailSearchApp.appIcon,
        description: 'Search through your Gmail messages using queries',
        version: 1,
        fields: [
          { key: 'query', label: 'Search Query', placeholder: 'from:user@example.com' },
          { key: 'maxResults', label: 'Max Results', type: 'number', placeholder: '10' }
        ]
      }
    ];
  }
}
