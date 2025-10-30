import type { AppSpec } from '../types';

export class GmailWatchEmails {
  static readonly appKey = 'gmail';
  static readonly appName = 'Gmail';
  static readonly appColor = '#ef4444';
  // 🎨 ICON SYSTEM: Image icons vs Emoji icons
  // ===========================================
  // - Image icons: Use absolute path like '/src/assets/icons/icon_gmail.png'
  // - Emoji icons: Use emoji character like '✉️' or '💬'
  // - UI automatically detects and renders appropriately
  // - Image icons provide professional branding
  static readonly appIcon = '/src/assets/icons/icon_gmail.png';

  static getTriggers(): AppSpec[] {
    return [
      {
        key: 'gmailWatchEmails',
        name: 'Gmail — Watch emails',
        color: GmailWatchEmails.appColor,
        icon: GmailWatchEmails.appIcon,
        description: 'Monitor your Gmail inbox for new emails and trigger workflows based on email content',
        version: 1,
        fields: [
          {
            key: 'mailbox',
            label: 'Folder/Label to watch',
            type: 'select',
            options: ['All Mails', 'Inbox', 'Sent', 'Chat', 'Starred', 'Important', 'Trash', 'Draft', 'Spam', 'Unread'],
            required: true
          },
          {
            key: 'gmailCriteria',
            label: 'Criteria',
            type: 'select',
            options: ['All Messages', 'Only Read Messages', 'Only Unread Messages']
          }
        ],
        // Email data outputs that other nodes can use
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
          headerTitle: "Gmail – Watch emails",
          tabs: [
            { key: "connect", label: "Connect", required: true },
            { key: "configure", label: "Configure", required: true },
            { key: "test", label: "Test", required: false }
          ],
          connections: {
            type: "oauth",
            service: "gmail",
            fields: [
              {
                key: "account",
                label: "Gmail Account",
                type: "select",
                placeholder: "Select connected Gmail account",
                required: true
              }
            ]
          },
          validation: {
            mailbox: {
              required: true,
              custom: (value: any) => !value ? "Please select a folder or label to watch before continuing." : true
            }
          },
          // 🔧 CUSTOM FIELD RENDERING
          // ========================
          // For complex fields that need custom rendering beyond standard form inputs
          // Currently not needed for Gmail Watch, but structure maintained for consistency
          customFields: {
            // Future custom fields can be added here if needed
          }
        }
      }
    ];
  }
}
