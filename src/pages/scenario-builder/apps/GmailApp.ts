import type { AppSpec } from '../types';
import { GmailWatchEmails } from './GmailWatchEmails';
import { GmailSendApp } from './GmailSendApp';
import { GmailSearchApp } from './GmailSearchApp';

export class GmailApp {
  static readonly appKey = 'gmail';
  static readonly appName = 'Gmail';
  static readonly appColor = '#ef4444';
  static readonly appIcon = '✉️';

  // Grouping class - aggregates all Gmail functionality
  static getAllSpecs(): AppSpec[] {
    return [
      ...GmailWatchEmails.getTriggers(),
      ...GmailSendApp.getActions(),
      ...GmailSearchApp.getActions()
    ];
  }

  // Expose individual app classes for configuration phases
  static getGmailWatchEmailsApp() {
    return GmailWatchEmails;
  }

  static getGmailSendApp() {
    return GmailSendApp;
  }

  static getGmailSearchApp() {
    return GmailSearchApp;
  }
}
