import type { AppSpec } from '../types';
import { TelegramSend } from './TelegramSend';
import { TelegramSendV2 } from './TelegramSendV2';

export class TelegramApp {
  static readonly appKey = 'telegram';
  static readonly appName = 'Telegram';
  static readonly appColor = '#0088cc';
  static readonly appIcon = '💬';

  // Grouping class - aggregates all Telegram functionality
  static getAllSpecs(): AppSpec[] {
    return [
      ...TelegramSend.getActions(),
      ...TelegramSendV2.getActions()
    ];
  }

  // Expose individual app classes for configuration phases
  static getTelegramSendApp() {
    return TelegramSend;
  }

  static getTelegramSendV2App() {
    return TelegramSendV2;
  }
}
