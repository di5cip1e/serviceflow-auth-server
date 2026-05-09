/**
 * PrivacyService - Privacy features including incognito mode, data export, deletion, and contact anonymization
 */

export interface PrivacySettings {
  incognitoMode: boolean;
  incognitoSince: string | null;
  autoDeleteAfterDays: number | null;
  anonymizeContacts: boolean;
  allowAnalytics: boolean;
  dataRetentionDays: number;
}

export interface ExportData {
  profiles: unknown[];
  settings: Record<string, unknown>;
  analytics: Record<string, unknown>;
  exportedAt: string;
  version: string;
  deviceId: string;
}

export interface DeletionResult {
  success: boolean;
  deletedItems: string[];
  errors: string[];
  completedAt: string;
}

export interface AnonymizedContact {
  id: string;
  displayName: string;
  phoneNumber?: string;
  email?: string;
  originalName: string;
  isAnonymized: boolean;
}

const DEFAULT_SETTINGS: PrivacySettings = {
  incognitoMode: false,
  incognitoSince: null,
  autoDeleteAfterDays: null,
  anonymizeContacts: false,
  allowAnalytics: true,
  dataRetentionDays: 365,
};

const STORAGE_KEY = 'pulse_privacy_settings';
const CONTACTS_KEY = 'pulse_contacts';

export class PrivacyService {
  private localStorage: Storage;
  private settings: PrivacySettings;
  private listeners: Set<(settings: PrivacySettings) => void> = new Set();

  constructor(localStorage: Storage = localStorage) {
    this.localStorage = localStorage;
    this.settings = this.loadSettings();
  }

  /**
   * Subscribe to privacy settings changes
   */
  subscribe(listener: (settings: PrivacySettings) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Get current privacy settings
   */
  getSettings(): PrivacySettings {
    return { ...this.settings };
  }

  /**
   * Enable incognito mode - pauses all analysis and data collection
   */
  enableIncognitoMode(): PrivacySettings {
    this.settings = {
      ...this.settings,
      incognitoMode: true,
      incognitoSince: new Date().toISOString(),
    };
    this.saveSettings();
    this.notifyListeners();
    return this.getSettings();
  }

  /**
   * Disable incognito mode - resumes analysis and data collection
   */
  disableIncognitoMode(): PrivacySettings {
    this.settings = {
      ...this.settings,
      incognitoMode: false,
      incognitoSince: null,
    };
    this.saveSettings();
    this.notifyListeners();
    return this.getSettings();
  }

  /**
   * Check if incognito mode is active
   */
  isIncognitoMode(): boolean {
    return this.settings.incognitoMode;
  }

  /**
   * Get incognito mode duration
   */
  getIncognitoDuration(): number | null {
    if (!this.settings.incognitoSince) {
      return null;
    }
    const start = new Date(this.settings.incognitoSince);
    const now = new Date();
    return Math.floor((now.getTime() - start.getTime()) / 1000); // in seconds
  }

  /**
   * Set auto-delete period for old data
   */
  setAutoDeletePeriod(days: number | null): PrivacySettings {
    this.settings = {
      ...this.settings,
      autoDeleteAfterDays: days,
    };
    this.saveSettings();
    this.notifyListeners();
    return this.getSettings();
  }

  /**
   * Enable contact anonymization
   */
  enableContactAnonymization(): PrivacySettings {
    this.settings = {
      ...this.settings,
      anonymizeContacts: true,
    };
    this.saveSettings();
    this.notifyListeners();
    return this.getSettings();
  }

  /**
   * Disable contact anonymization
   */
  disableContactAnonymization(): PrivacySettings {
    this.settings = {
      ...this.settings,
      anonymizeContacts: false,
    };
    this.saveSettings();
    this.notifyListeners();
    return this.getSettings();
  }

  /**
   * Update analytics consent
   */
  setAnalyticsConsent(allowed: boolean): PrivacySettings {
    this.settings = {
      ...this.settings,
      allowAnalytics: allowed,
    };
    this.saveSettings();
    this.notifyListeners();
    return this.getSettings();
  }

  /**
   * Set data retention period
   */
  setDataRetentionPeriod(days: number): PrivacySettings {
    this.settings = {
      ...this.settings,
      dataRetentionDays: days,
    };
    this.saveSettings();
    this.notifyListeners();
    return this.getSettings();
  }

  /**
   * Export all user data - allows user to download all their data
   */
  async exportAllData(): Promise<ExportData> {
    const deviceId = this.getDeviceId();
    
    const exportData: ExportData = {
      profiles: [],
      settings: {},
      analytics: {},
      exportedAt: new Date().toISOString(),
      version: '1.0.0',
      deviceId,
    };

    // Export profiles
    const profilesJson = this.localStorage.getItem('pulse_profiles');
    if (profilesJson) {
      exportData.profiles = JSON.parse(profilesJson);
    }

    // Export settings
    const settingsJson = this.localStorage.getItem('pulse_settings');
    if (settingsJson) {
      exportData.settings = JSON.parse(settingsJson);
    }

    // Export analytics
    const analyticsJson = this.localStorage.getItem('pulse_analytics');
    if (analyticsJson) {
      exportData.analytics = JSON.parse(analyticsJson);
    }

    return exportData;
  }

  /**
   * Download exported data as JSON file
   */
  async downloadExport(): Promise<void> {
    const data = await this.exportAllData();
    const json = JSON.stringify(data, null, 2);
    
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `pulse_export_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * Wipe all data - completely delete all stored data
   */
  async deleteAllData(options: {
    preserveSettings?: boolean;
    preserveContacts?: boolean;
  } = {}): Promise<DeletionResult> {
    const deletedItems: string[] = [];
    const errors: string[] = [];

    try {
      // Delete profiles
      if (this.localStorage.getItem('pulse_profiles')) {
        this.localStorage.removeItem('pulse_profiles');
        deletedItems.push('profiles');
      }

      // Delete analytics
      if (this.localStorage.getItem('pulse_analytics')) {
        this.localStorage.removeItem('pulse_analytics');
        deletedItems.push('analytics');
      }

      // Delete backup state
      if (this.localStorage.getItem('pulse_backup_state')) {
        this.localStorage.removeItem('pulse_backup_state');
        deletedItems.push('backup_state');
      }

      // Optionally preserve settings
      if (!options.preserveSettings) {
        if (this.localStorage.getItem('pulse_settings')) {
          this.localStorage.removeItem('pulse_settings');
          deletedItems.push('settings');
        }
      }

      // Optionally preserve contacts
      if (!options.preserveContacts) {
        if (this.localStorage.getItem(CONTACTS_KEY)) {
          this.localStorage.removeItem(CONTACTS_KEY);
          deletedItems.push('contacts');
        }
      }

      // Clear privacy settings (keep incognito state)
      this.localStorage.removeItem(STORAGE_KEY);
      deletedItems.push('privacy_settings');

      // Reset to defaults but keep incognito state
      this.settings = {
        ...DEFAULT_SETTINGS,
        incognitoMode: this.settings.incognitoMode,
        incognitoSince: this.settings.incognitoSince,
      };

      return {
        success: true,
        deletedItems,
        errors,
        completedAt: new Date().toISOString(),
      };
    } catch (error) {
      errors.push(error instanceof Error ? error.message : 'Unknown error');
      return {
        success: false,
        deletedItems,
        errors,
        completedAt: new Date().toISOString(),
      };
    }
  }

  /**
   * Delete data older than specified days
   */
  async deleteOldData(olderThanDays: number): Promise<DeletionResult> {
    const cutoffTime = Date.now() - olderThanDays * 24 * 60 * 60 * 1000;
    const deletedItems: string[] = [];
    const errors: string[] = [];

    try {
      // Clean old analytics entries
      const analyticsJson = this.localStorage.getItem('pulse_analytics');
      if (analyticsJson) {
        const analytics = JSON.parse(analyticsJson);
        const cleaned = this.cleanOldEntries(analytics, cutoffTime);
        
        if (cleaned.length < analytics.length) {
          this.localStorage.setItem('pulse_analytics', JSON.stringify(cleaned));
          deletedItems.push('old_analytics');
        }
      }

      // Clean old profiles
      const profilesJson = this.localStorage.getItem('pulse_profiles');
      if (profilesJson) {
        const profiles = JSON.parse(profilesJson);
        const cleaned = profiles.filter((p: Record<string, unknown>) => {
          const modified = new Date(p.modifiedAt as string || 0).getTime();
          return modified > cutoffTime;
        });
        
        if (cleaned.length < profiles.length) {
          this.localStorage.setItem('pulse_profiles', JSON.stringify(cleaned));
          deletedItems.push('old_profiles');
        }
      }

      return {
        success: true,
        deletedItems,
        errors,
        completedAt: new Date().toISOString(),
      };
    } catch (error) {
      errors.push(error instanceof Error ? error.message : 'Unknown error');
      return {
        success: false,
        deletedItems,
        errors,
        completedAt: new Date().toISOString(),
      };
    }
  }

  /**
   * Anonymize contact - replaces real name with generated alias
   */
  anonymizeContact(contact: {
    id: string;
    name: string;
    phoneNumber?: string;
    email?: string;
  }): AnonymizedContact {
    const aliases = [
      'Contact A', 'Contact B', 'Contact C', 'Contact D', 'Contact E',
      'Person 1', 'Person 2', 'Person 3', 'Person 4', 'Person 5',
      'User X', 'User Y', 'User Z',
    ];
    
    // Generate deterministic alias based on contact ID
    const hash = this.hashString(contact.id);
    const aliasIndex = hash % aliases.length;
    
    return {
      id: contact.id,
      displayName: aliases[aliasIndex],
      phoneNumber: this.settings.anonymizeContacts ? undefined : contact.phoneNumber,
      email: this.settings.anonymizeContacts ? undefined : contact.email,
      originalName: contact.name,
      isAnonymized: this.settings.anonymizeContacts,
    };
  }

  /**
   * Anonymize multiple contacts
   */
  anonymizeContacts(contacts: Array<{
    id: string;
    name: string;
    phoneNumber?: string;
    email?: string;
  }>): AnonymizedContact[] {
    return contacts.map(c => this.anonymizeContact(c));
  }

  /**
   * Get anonymized display name for a contact
   */
  getAnonymizedDisplayName(contactId: string, originalName: string): string {
    if (!this.settings.anonymizeContacts) {
      return originalName;
    }
    
    const aliases = [
      'Contact A', 'Contact B', 'Contact C', 'Contact D', 'Contact E',
      'Person 1', 'Person 2', 'Person 3', 'Person 4', 'Person 5',
    ];
    
    const hash = this.hashString(contactId);
    return aliases[hash % aliases.length];
  }

  /**
   * Run data retention policy - delete old data based on settings
   */
  async runDataRetentionPolicy(): Promise<DeletionResult> {
    if (this.settings.autoDeleteAfterDays) {
      return this.deleteOldData(this.settings.autoDeleteAfterDays);
    }
    return {
      success: true,
      deletedItems: [],
      errors: [],
      completedAt: new Date().toISOString(),
    };
  }

  /**
   * Update settings
   */
  updateSettings(newSettings: Partial<PrivacySettings>): PrivacySettings {
    this.settings = { ...this.settings, ...newSettings };
    this.saveSettings();
    this.notifyListeners();
    return this.getSettings();
  }

  // Private methods
  private loadSettings(): PrivacySettings {
    const saved = this.localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
    }
    return { ...DEFAULT_SETTINGS };
  }

  private saveSettings(): void {
    this.localStorage.setItem(STORAGE_KEY, JSON.stringify(this.settings));
  }

  private notifyListeners(): void {
    for (const listener of this.listeners) {
      listener(this.settings);
    }
  }

  private getDeviceId(): string {
    let deviceId = this.localStorage.getItem('pulse_device_id');
    if (!deviceId) {
      deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      this.localStorage.setItem('pulse_device_id', deviceId);
    }
    return deviceId;
  }

  private cleanOldEntries(entries: unknown[], cutoffTime: number): unknown[] {
    if (!Array.isArray(entries)) {
      return [];
    }
    
    return entries.filter((entry: unknown) => {
      if (typeof entry !== 'object' || entry === null) {
        return false;
      }
      
      const record = entry as Record<string, unknown>;
      const timestamp = new Date(record.timestamp as string || record.date as string || 0).getTime();
      return timestamp > cutoffTime;
    });
  }

  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }
}

export default PrivacyService;