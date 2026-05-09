import { NativeModules, NativeEventEmitter, Platform, PermissionsAndroid } from 'react-native';

const { PulseMessageModule } = NativeModules;

interface MessageEvent {
  id: string;
  sender: string;
  content: string;
  timestamp: number;
  platform: string;
  captureMethod: string;
  package?: string;
}

type MessageListener = (message: MessageEvent) => void;

/**
 * Service for capturing messages from various platforms
 * 
 * Provides a unified API for:
 * - Checking permission status
 * - Requesting permissions
 * - Starting/stopping message capture
 * - Listening for new messages
 */
class MessageCaptureService {
  private eventEmitter: NativeEventEmitter | null = null;
  private listeners: Map<string, MessageListener> = new Map();

  constructor() {
    if (Platform.OS === 'android' && PulseMessageModule) {
      this.eventEmitter = new NativeEventEmitter(PulseMessageModule);
    }
  }

  /**
   * Check if notification listener is enabled
   */
  async isNotificationListenerEnabled(): Promise<boolean> {
    if (Platform.OS !== 'android') return false;
    try {
      return await PulseMessageModule.isNotificationListenerEnabled();
    } catch {
      return false;
    }
  }

  /**
   * Request notification listener permission
   */
  async requestNotificationListenerPermission(): Promise<boolean> {
    if (Platform.OS !== 'android') return false;
    try {
      return await PulseMessageModule.requestNotificationListenerPermission();
    } catch {
      return false;
    }
  }

  /**
   * Check if accessibility service is enabled
   */
  async isAccessibilityEnabled(): Promise<boolean> {
    if (Platform.OS !== 'android') return false;
    try {
      return await PulseMessageModule.isAccessibilityEnabled();
    } catch {
      return false;
    }
  }

  /**
   * Request accessibility permission
   */
  async requestAccessibilityPermission(): Promise<boolean> {
    if (Platform.OS !== 'android') return false;
    try {
      return await PulseMessageModule.requestAccessibilityPermission();
    } catch {
      return false;
    }
  }

  /**
   * Check SMS permission status
   */
  async checkSmsPermission(): Promise<boolean> {
    if (Platform.OS !== 'android') return false;
    try {
      return await PulseMessageModule.checkSmsPermission();
    } catch {
      return false;
    }
  }

  /**
   * Request SMS permission
   */
  async requestSmsPermission(): Promise<boolean> {
    if (Platform.OS !== 'android') return false;
    try {
      return await PulseMessageModule.requestSmsPermission();
    } catch {
      return false;
    }
  }

  /**
   * Check call log permission
   */
  async checkCallLogPermission(): Promise<boolean> {
    if (Platform.OS !== 'android') return false;
    try {
      return await PulseMessageModule.checkCallLogPermission();
    } catch {
      return false;
    }
  }

  /**
   * Request call log permission
   */
  async requestCallLogPermission(): Promise<boolean> {
    if (Platform.OS !== 'android') return false;
    try {
      return await PulseMessageModule.requestCallLogPermission();
    } catch {
      return false;
    }
  }

  /**
   * Start periodic message sync
   */
  async startPeriodicSync(intervalHours: number = 1): Promise<boolean> {
    if (Platform.OS !== 'android') return false;
    try {
      return await PulseMessageModule.startPeriodicSync(intervalHours);
    } catch {
      return false;
    }
  }

  /**
   * Stop periodic message sync
   */
  async stopPeriodicSync(): Promise<boolean> {
    if (Platform.OS !== 'android') return false;
    try {
      return await PulseMessageModule.stopPeriodicSync();
    } catch {
      return false;
    }
  }

  /**
   * Trigger immediate sync
   */
  async syncNow(): Promise<boolean> {
    if (Platform.OS !== 'android') return false;
    try {
      return await PulseMessageModule.syncNow();
    } catch {
      return false;
    }
  }

  /**
   * Subscribe to new messages
   */
  subscribe(id: string, callback: MessageListener): void {
    this.listeners.set(id, callback);
    
    if (this.eventEmitter && this.listeners.size === 1) {
      this.eventEmitter.addListener('onNewMessage', this.handleMessage);
      this.eventEmitter.addListener('onAccessibilityMessage', this.handleMessage);
      this.eventEmitter.addListener('onSmsReceived', this.handleMessage);
    }
  }

  /**
   * Unsubscribe from messages
   */
  unsubscribe(id: string): void {
    this.listeners.delete(id);
    
    if (this.eventEmitter && this.listeners.size === 0) {
      this.eventEmitter.removeAllListeners('onNewMessage');
      this.eventEmitter.removeAllListeners('onAccessibilityMessage');
      this.eventEmitter.removeAllListeners('onSmsReceived');
    }
  }

  private handleMessage = (message: MessageEvent): void => {
    this.listeners.forEach((listener) => listener(message));
  };

  /**
   * Get list of supported platforms
   */
  async getSupportedPlatforms(): Promise<string[]> {
    if (Platform.OS !== 'android') return [];
    try {
      return await PulseMessageModule.getSupportedPlatforms();
    } catch {
      return ['sms', 'whatsapp', 'messenger', 'instagram', 'telegram', 'discord'];
    }
  }

  /**
   * Check all required permissions
   */
  async checkAllPermissions(): Promise<{
    notificationListener: boolean;
    accessibility: boolean;
    sms: boolean;
    callLog: boolean;
  }> {
    const [notificationListener, accessibility, sms, callLog] = await Promise.all([
      this.isNotificationListenerEnabled(),
      this.isAccessibilityEnabled(),
      this.checkSmsPermission(),
      this.checkCallLogPermission(),
    ]);

    return { notificationListener, accessibility, sms, callLog };
  }

  /**
   * Request all required permissions
   */
  async requestAllPermissions(): Promise<void> {
    await Promise.all([
      this.requestNotificationListenerPermission(),
      this.requestAccessibilityPermission(),
      this.requestSmsPermission(),
      this.requestCallLogPermission(),
    ]);
  }
}

export const messageCaptureService = new MessageCaptureService();
export type { MessageEvent, MessageListener };
