import type { AppSpec } from '../types';

export class GmailSearchApp {
  static readonly appKey = 'gmail';
  static readonly appName = 'Gmail';
  static readonly appColor = '#ef4444';
  static readonly appIcon = '✉️';

  static getActions(): AppSpec[] {
    return [
      {
        key: 'gmailSearch',
        name: 'Gmail — Search Emails',
        color: GmailSearchApp.appColor,
        icon: GmailSearchApp.appIcon,
        fields: [
          { key: 'query', label: 'Search Query', placeholder: 'from:user@example.com' },
          { key: 'maxResults', label: 'Max Results', type: 'number', placeholder: '10' }
        ]
      }
    ];
  }
}
