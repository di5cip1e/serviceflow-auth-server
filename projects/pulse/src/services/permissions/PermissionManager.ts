/**
 * PermissionManager - Request message access, call log access, and handle permission denials
 */

export type PermissionType = 'messages' | 'call_logs' | 'contacts' | 'notifications' | 'location';

export interface PermissionState {
  type: PermissionType;
  granted: boolean;
  denied: boolean;
  grantedAt: string | null;
  deniedAt: string | null;
  lastRequested: string | null;
  explanationShown: boolean;
}

export interface PermissionRequest {
  type: PermissionType;
  rationale: string;
  required: boolean;
  onGranted?: () => void;
  onDenied?: () => void;
}

export interface PermissionSettings {
  messages: boolean;
  callLogs: boolean;
  contacts: boolean;
  notifications: boolean;
  location: boolean;
}

const PERMISSION_STORAGE_KEY = 'pulse_permission_states';

const PERMISSION_RATIONALES: Record<PermissionType, string> = {
  messages: 'PULSE needs access to your messages to analyze communication patterns and provide personalized insights.',
  call_logs: 'PULSE needs access to your call logs to understand your calling habits and identify important contacts.',
  contacts: 'PULSE needs access to your contacts to link communication data with people in your life.',
  notifications: 'PULSE needs access to notifications to provide real-time insights and smart replies.',
  location: 'PULSE needs access to your location to provide location-based context and recommendations.',
};

const PERMISSION_NAMES: Record<PermissionType, string> = {
  messages: 'Messages',
  call_logs: 'Call History',
  contacts: 'Contacts',
  notifications: 'Notifications',
  location: 'Location',
};

export class PermissionManager {
  private localStorage: Storage;
  private permissionStates: Map<PermissionType, PermissionState>;
  private listeners: Set<(states: Map<PermissionType, PermissionState>) => void> = new Set();

  constructor(localStorage: Storage = localStorage) {
    this.localStorage = localStorage;
    this.permissionStates = this.loadStates();
  }

  /**
   * Subscribe to permission state changes
   */
  subscribe(listener: (states: Map<PermissionType, PermissionState>) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Get all permission states
   */
  getAllStates(): Map<PermissionType, PermissionState> {
    return new Map(this.permissionStates);
  }

  /**
   * Get specific permission state
   */
  getState(type: PermissionType): PermissionState | null {
    return this.permissionStates.get(type) || null;
  }

  /**
   * Check if a permission is granted
   */
  isGranted(type: PermissionType): boolean {
    return this.permissionStates.get(type)?.granted ?? false;
  }

  /**
   * Check if a permission was denied
   */
  isDenied(type: PermissionType): boolean {
    return this.permissionStates.get(type)?.denied ?? false;
  }

  /**
   * Check if we can request a permission (not denied permanently)
   */
  canRequest(type: PermissionType): boolean {
    const state = this.permissionStates.get(type);
    return !state?.denied;
  }

  /**
   * Request a specific permission
   */
  async requestPermission(
    type: PermissionType,
    options: {
      rationale?: string;
      required?: boolean;
      onGranted?: () => void;
      onDenied?: () => void;
    } = {}
  ): Promise<boolean> {
    const { rationale, required = false, onGranted, onDenied } = options;
    
    // Update last requested time
    this.updateState(type, { lastRequested: new Date().toISOString() });

    try {
      // Check if running in browser with Permission API
      if (navigator.permissions) {
        const result = await navigator.permissions.query({
          name: this.mapToPermissionName(type),
        } as PermissionDescriptor);

        if (result.state === 'granted') {
          this.grantPermission(type, onGranted);
          return true;
        } else if (result.state === 'denied') {
          this.denyPermission(type, onDenied);
          return false;
        }
      }

      // Fallback: request via prompt (browser) or native (React Native)
      const granted = await this.performPermissionRequest(type);
      
      if (granted) {
        this.grantPermission(type, onGranted);
      } else {
        this.denyPermission(type, onDenied);
      }
      
      return granted;
    } catch (error) {
      console.error(`Permission request failed for ${type}:`, error);
      
      // Handle case where permission API is not available
      // In production, this would trigger native permission request
      if (required) {
        this.denyPermission(type, onDenied);
      }
      
      return false;
    }
  }

  /**
   * Request multiple permissions
   */
  async requestPermissions(
    types: PermissionType[],
    options: {
      rationale?: string;
      required?: boolean;
      onGranted?: (type: PermissionType) => void;
      onDenied?: (type: PermissionType) => void;
    } = {}
  ): Promise<Map<PermissionType, boolean>> {
    const results = new Map<PermissionType, boolean>();
    
    for (const type of types) {
      const granted = await this.requestPermission(type, {
        ...options,
        onGranted: options.onGranted ? () => options.onGranted!(type) : undefined,
        onDenied: options.onDenied ? () => options.onDenied!(type) : undefined,
      });
      results.set(type, granted);
    }
    
    return results;
  }

  /**
   * Grant a permission manually (for testing or manual override)
   */
  grantPermission(type: PermissionType, callback?: () => void): void {
    this.updateState(type, {
      granted: true,
      denied: false,
      grantedAt: new Date().toISOString(),
      deniedAt: null,
    });
    
    callback?.();
    this.notifyListeners();
  }

  /**
   * Deny a permission
   */
  denyPermission(type: PermissionType, callback?: () => void): void {
    this.updateState(type, {
      granted: false,
      denied: true,
      grantedAt: null,
      deniedAt: new Date().toISOString(),
    });
    
    callback?.();
    this.notifyListeners();
  }

  /**
   * Reset a permission (clear denial, allow re-request)
   */
  resetPermission(type: PermissionType): void {
    this.updateState(type, {
      granted: false,
      denied: false,
      grantedAt: null,
      deniedAt: null,
      lastRequested: null,
    });
    this.notifyListeners();
  }

  /**
   * Get permission rationale text
   */
  getRationale(type: PermissionType): string {
    return PERMISSION_RATIONALES[type];
  }

  /**
   * Get human-readable permission name
   */
  getPermissionName(type: PermissionType): string {
    return PERMISSION_NAMES[type];
  }

  /**
   * Check if all required permissions are granted
   */
  hasRequiredPermissions(required: PermissionType[]): boolean {
    return required.every(type => this.isGranted(type));
  }

  /**
   * Get missing permissions
   */
  getMissingPermissions(required: PermissionType[]): PermissionType[] {
    return required.filter(type => !this.isGranted(type));
  }

  /**
   * Show explanation for why permission is needed
   */
  showExplanation(type: PermissionType): void {
    this.updateState(type, { explanationShown: true });
    this.notifyListeners();
  }

  /**
   * Handle permission denial gracefully - provide guidance
   */
  handleDenial(type: PermissionType): {
    message: string;
    guidance: string;
    canRetry: boolean;
  } {
    const state = this.permissionStates.get(type);
    const canRetry = state?.denied && !state.lastRequested; // Can retry if not recently denied

    return {
      message: `${PERMISSION_NAMES[type]} permission was denied.`,
      guidance: this.getDenialGuidance(type),
      canRetry,
    };
  }

  /**
   * Open system settings for permission
   */
  openSettings(): void {
    // In browser: open settings
    if (window.innerWidth) {
      // Browser-based: try to open settings
      window.open('chrome://settings', '_blank');
    }
    // In React Native: would use Linking.openSettings()
  }

  /**
   * Get summary of all permissions
   */
  getSummary(): {
    granted: PermissionType[];
    denied: PermissionType[];
    notRequested: PermissionType[];
  } {
    const granted: PermissionType[] = [];
    const denied: PermissionType[] = [];
    const notRequested: PermissionType[] = [];
    
    const allTypes: PermissionType[] = ['messages', 'call_logs', 'contacts', 'notifications', 'location'];
    
    for (const type of allTypes) {
      const state = this.permissionStates.get(type);
      
      if (state?.granted) {
        granted.push(type);
      } else if (state?.denied) {
        denied.push(type);
      } else {
        notRequested.push(type);
      }
    }
    
    return { granted, denied, notRequested };
  }

  // Private methods
  private async performPermissionRequest(type: PermissionType): Promise<boolean> {
    // This would be implemented differently for web vs React Native
    // For web: use Notification API, etc.
    // For React Native: use native modules
    
    switch (type) {
      case 'messages':
        // Would use Android's MessagePipe or similar
        return false;
        
      case 'call_logs':
        // Would use READ_CALL_LOG permission
        return false;
        
      case 'contacts':
        // Would use READ_CONTACTS permission
        if (navigator.permissions) {
          try {
            const result = await navigator.permissions.query({ name: 'contacts' as PermissionName });
            return result.state === 'granted';
          } catch {
            return false;
          }
        }
        return false;
        
      case 'notifications':
        // Would use Notification API
        if ('Notification' in window) {
          const result = await Notification.requestPermission();
          return result === 'granted';
        }
        return false;
        
      case 'location':
        // Would use Geolocation API
        if ('geolocation' in navigator) {
          return new Promise<boolean>((resolve) => {
            navigator.geolocation.getCurrentPosition(
              () => resolve(true),
              () => resolve(false),
              { timeout: 5000 }
            );
          });
        }
        return false;
        
      default:
        return false;
    }
  }

  private mapToPermissionName(type: PermissionType): PermissionName {
    const mapping: Record<PermissionType, PermissionName> = {
      messages: 'notifications', // Approximate
      call_logs: 'notifications',
      contacts: 'contacts',
      notifications: 'notifications',
      location: 'geolocation',
    };
    return mapping[type];
  }

  private updateState(type: PermissionType, updates: Partial<PermissionState>): void {
    const current = this.permissionStates.get(type) || {
      type,
      granted: false,
      denied: false,
      grantedAt: null,
      deniedAt: null,
      lastRequested: null,
      explanationShown: false,
    };
    
    this.permissionStates.set(type, { ...current, ...updates });
    this.saveStates();
  }

  private loadStates(): Map<PermissionType, PermissionState> {
    const saved = this.localStorage.getItem(PERMISSION_STORAGE_KEY);
    const states = saved ? JSON.parse(saved) : {};
    
    const map = new Map<PermissionType, PermissionState>();
    for (const [key, value] of Object.entries(states)) {
      map.set(key as PermissionType, value as PermissionState);
    }
    return map;
  }

  private saveStates(): void {
    const states: Record<string, PermissionState> = {};
    for (const [key, value] of this.permissionStates) {
      states[key] = value;
    }
    this.localStorage.setItem(PERMISSION_STORAGE_KEY, JSON.stringify(states));
  }

  private notifyListeners(): void {
    for (const listener of this.listeners) {
      listener(this.permissionStates);
    }
  }

  private getDenialGuidance(type: PermissionType): string {
    switch (type) {
      case 'messages':
        return 'To enable message access, go to Settings > Apps > PULSE > Permissions and allow Messages. Some features will be limited without this access.';
        
      case 'call_logs':
        return 'To enable call log access, go to Settings > Apps > PULSE > Permissions and allow Call Logs. You can still use PULSE with limited features.';
        
      case 'contacts':
        return 'To enable contacts, go to Settings > Apps > PULSE > Permissions and allow Contacts. This helps link your communications with people you know.';
        
      case 'notifications':
        return 'To enable notifications, go to Settings > Apps > PULSE > Permissions and allow Notifications. You can disable this anytime in settings.';
        
      case 'location':
        return 'To enable location, go to Settings > Apps > PULSE > Permissions and allow Location. Location data is only used for optional context features.';
        
      default:
        return 'Please enable this permission in your device settings to use this feature.';
    }
  }
}

export default PermissionManager;