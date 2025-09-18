declare global {
    interface Window {
      emitDebug?: (action: string, payload: Record<string, unknown>) => void;
    }
  }
  export {};
  