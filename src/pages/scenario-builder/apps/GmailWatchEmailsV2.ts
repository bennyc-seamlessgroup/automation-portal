// src/pages/scenario-builder/apps/GmailWatchEmailsV2.ts
import type { AppSpec } from '../types';

export class GmailWatchEmailsV2 {
  static readonly appKey = 'gmail';
  static readonly appName = 'Gmail';
  static readonly appColor = '#ef4444';
  static readonly appIcon = '✉️';

  static getTriggers(): AppSpec[] {
    return [
      {
        key: 'gmailWatchEmailsV2',
        name: 'Gmail — Watch emails',
        color: GmailWatchEmailsV2.appColor,
        icon: GmailWatchEmailsV2.appIcon,
        description: 'Monitor your Gmail inbox for new emails and trigger workflows based on email content',
        version: 2,
        fields: [
          {
            key: 'mailbox',
            label: 'Folder to watch',
            type: 'select',
            options: ['All Mails', 'Inbox', 'Sent', 'Chat', 'Starred', 'Important', 'Trash', 'Draft', 'Spam', 'Unread'],
            required: true
          },
          {
            key: 'gmailCriteria',
            label: 'Criteria',
            type: 'select',
            options: ['All Messages', 'Only Read Messages', 'Only Unread Messages']
          },
          {
            key: 'apiVersion',
            label: 'API Version',
            type: 'select',
            options: ['V2 (Recommended)', 'V1 (Legacy)'],
            required: true
          }
        ],
        // Email data outputs that other nodes can use (same as V1 for compatibility)
        dataOutputs: [
          {
            key: 'body_plain',
            label: 'Body Plain',
            type: 'string',
            description: 'Plain text body content of the most recent email'
          },
          {
            key: 'subject',
            label: 'Subject',
            type: 'string',
            description: 'Subject line of the most recent email'
          },
          {
            key: 'from_name',
            label: 'From Name',
            type: 'string',
            description: 'Display name of the email sender'
          },
          {
            key: 'from_email',
            label: 'From Email',
            type: 'string',
            description: 'Email address of the sender'
          },
          {
            key: 'body_html',
            label: 'Body Html',
            type: 'string',
            description: 'HTML body content of the most recent email'
          }
        ],
        inspector: {
          steps: [
            { id: 1, title: "Connect", description: "Connect your Gmail account", tab: "connect" },
            { id: 2, title: "Configure", description: "Set up your email watching preferences", tab: "configure" },
            { id: 3, title: "Test", description: "Test your Gmail connection", tab: "test" }
          ],
          defaultTab: "connect",
          headerTitle: "Gmail – Watch emails V2",
        }
      }
    ];
  }
}
