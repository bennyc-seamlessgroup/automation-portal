import type { AppSpec } from '../types';
import { TelegramSend } from './TelegramSend';

export class TelegramApp {
  static readonly appKey = 'telegram';
  static readonly appName = 'Telegram';
  static readonly appColor = '#0088cc';
  static readonly appIcon = '💬';

  // Grouping class - aggregates all Telegram functionality
  static getAllSpecs(): AppSpec[] {
    return [
      ...TelegramSend.getActions()
    ];
  }

  // Expose individual app classes for configuration phases
  static getTelegramSendApp() {
    return TelegramSend;
  }
}
