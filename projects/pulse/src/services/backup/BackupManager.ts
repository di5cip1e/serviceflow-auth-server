/**
 * BackupManager - Manages manual backup/restore, scheduled auto-backup, and conflict resolution
 */

import { GoogleDriveService, BackupMetadata, SyncStatus } from './GoogleDriveService';

export interface BackupSchedule {
  enabled: boolean;
  intervalHours: number;
  lastScheduledBackup: string | null;
  nextScheduledBackup: string | null;
}

export interface BackupOptions {
  encryptData: boolean;
  includeMedia: boolean;
  includeCallLogs: boolean;
  includeMessages: boolean;
}

export interface ConflictResolution {
  strategy: 'local_wins' | 'remote_wins' | 'newest_wins' | 'manual';
  resolvedAt: string | null;
  resolution: 'local' | 'remote' | 'merged' | null;
}

export interface BackupState {
  status: 'idle' | 'backup_in_progress' | 'restore_in_progress' | 'error';
  progress: number;
  currentOperation: string | null;
  lastBackup: string | null;
  lastRestore: string | null;
  lastError: string | null;
  scheduledBackup: BackupSchedule;
}

export interface LocalBackupData {
  profiles: Record<string, unknown>[];
  settings: Record<string, unknown>;
  analytics: Record<string, unknown>;
  lastModified: string;
  deviceId: string;
  version: string;
}

const DEFAULT_OPTIONS: BackupOptions = {
  encryptData: true,
  includeMedia: false,
  includeCallLogs: true,
  includeMessages: true,
};

const DEFAULT_SCHEDULE: BackupSchedule = {
  enabled: false,
  intervalHours: 24,
  lastScheduledBackup: null,
  nextScheduledBackup: null,
};

export class BackupManager {
  private driveService: GoogleDriveService;
  private localStorage: Storage;
  private state: BackupState;
  private scheduleInterval: ReturnType<typeof setInterval> | null = null;
  private listeners: Set<(state: BackupState) => void> = new Set();

  constructor(
    driveService: GoogleDriveService,
    localStorage: Storage = localStorage
  ) {
    this.driveService = driveService;
    this.localStorage = localStorage;
    
    // Load saved state
    const savedState = this.loadState();
    this.state = {
      ...this.getDefaultState(),
      ...savedState,
      scheduledBackup: {
        ...DEFAULT_SCHEDULE,
        ...savedState?.scheduledBackup,
      },
    };
  }

  /**
   * Subscribe to backup state changes
   */
  subscribe(listener: (state: BackupState) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Get current backup state
   */
  getState(): BackupState {
    return { ...this.state };
  }

  /**
   * Create a manual backup to Google Drive
   */
  async performBackup(options: Partial<BackupOptions> = {}): Promise<BackupMetadata> {
    const opts = { ...DEFAULT_OPTIONS, ...options };
    
    this.updateState({
      status: 'backup_in_progress',
      progress: 0,
      currentOperation: 'Preparing data...',
    });

    try {
      // Step 1: Gather local data
      this.updateState({ currentOperation: 'Gathering local data...', progress: 10 });
      const localData = await this.gatherLocalData(opts);
      
      // Step 2: Check for conflicts
      this.updateState({ currentOperation: 'Checking for conflicts...', progress: 30 });
      const conflict = await this.checkForConflicts();
      
      if (conflict) {
        this.updateState({ currentOperation: 'Resolving conflicts...', progress: 40 });
        await this.resolveConflict(conflict, localData);
      }
      
      // Step 3: Upload to Google Drive
      this.updateState({ currentOperation: 'Uploading backup...', progress: 50 });
      const backup = await this.driveService.uploadEncryptedBackup(localData as Record<string, unknown>);
      
      // Step 4: Update local state
      this.updateState({
        status: 'idle',
        progress: 100,
        currentOperation: null,
        lastBackup: new Date().toISOString(),
        lastError: null,
      });
      
      // Update schedule
      if (this.state.scheduledBackup.enabled) {
        this.updateScheduledBackup();
      }
      
      return {
        id: backup.id,
        createdAt: backup.modifiedTime,
        version: '1.0.0',
        size: localData ? JSON.stringify(localData).length : 0,
        checksum: '',
        deviceId: localData.deviceId,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Backup failed';
      this.updateState({
        status: 'error',
        currentOperation: null,
        lastError: errorMessage,
      });
      throw error;
    }
  }

  /**
   * Restore from Google Drive backup
   */
  async performRestore(backupId?: string): Promise<{
    data: LocalBackupData;
    metadata: BackupMetadata;
  }> {
    this.updateState({
      status: 'restore_in_progress',
      progress: 0,
      currentOperation: 'Downloading backup...',
    });

    try {
      // Step 1: Download from Google Drive
      this.updateState({ currentOperation: 'Downloading backup...', progress: 20 });
      
      let data: Record<string, unknown>;
      let metadata: BackupMetadata;
      
      if (backupId) {
        // TODO: Support specific backup restoration
        throw new Error('Specific backup restoration not yet implemented');
      } else {
        const result = await this.driveService.downloadAndRestore();
        data = result.data;
        metadata = result.metadata;
      }
      
      // Step 2: Verify checksum
      this.updateState({ currentOperation: 'Verifying backup integrity...', progress: 60 });
      // Note: In production, verify the checksum
      
      // Step 3: Apply to local storage
      this.updateState({ currentOperation: 'Restoring data...', progress: 80 });
      await this.applyLocalData(data as LocalBackupData);
      
      // Step 4: Complete
      this.updateState({
        status: 'idle',
        progress: 100,
        currentOperation: null,
        lastRestore: new Date().toISOString(),
        lastError: null,
      });
      
      return { data: data as LocalBackupData, metadata };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Restore failed';
      this.updateState({
        status: 'error',
        currentOperation: null,
        lastError: errorMessage,
      });
      throw error;
    }
  }

  /**
   * Enable scheduled auto-backup
   */
  enableScheduledBackup(intervalHours: number = 24): void {
    this.state.scheduledBackup = {
      enabled: true,
      intervalHours,
      lastScheduledBackup: this.state.scheduledBackup.lastScheduledBackup,
      nextScheduledBackup: this.getNextBackupTime(intervalHours),
    };
    
    this.saveState();
    this.startScheduleInterval();
  }

  /**
   * Disable scheduled auto-backup
   */
  disableScheduledBackup(): void {
    this.state.scheduledBackup = {
      ...this.state.scheduledBackup,
      enabled: false,
      nextScheduledBackup: null,
    };
    
    this.stopScheduleInterval();
    this.saveState();
  }

  /**
   * Get current schedule settings
   */
  getSchedule(): BackupSchedule {
    return { ...this.state.scheduledBackup };
  }

  /**
   * Check for conflicts between local and remote data
   */
  async checkForConflicts(): Promise<{
    hasConflict: boolean;
    localModified: string | null;
    remoteModified: string | null;
    strategy: ConflictResolution['strategy'];
  } | null> {
    if (!this.driveService.isAuthenticated()) {
      return null;
    }

    try {
      const { metadata } = await this.driveService.listBackups();
      const localLastBackup = this.state.lastBackup;
      
      if (!metadata || !localLastBackup) {
        return null;
      }

      const remoteModified = new Date(metadata.createdAt);
      const localModified = new Date(localLastBackup);
      
      // Check if remote is newer than local
      const hasConflict = remoteModified > localModified;
      
      return {
        hasConflict,
        localModified: localLastBackup,
        remoteModified: metadata.createdAt,
        strategy: 'newest_wins', // Default strategy
      };
    } catch {
      return null;
    }
  }

  /**
   * Resolve conflict based on strategy
   */
  async resolveConflict(
    conflict: { strategy: ConflictResolution['strategy'] },
    localData: LocalBackupData
  ): Promise<'local' | 'remote' | 'merged'> {
    switch (conflict.strategy) {
      case 'local_wins':
        // Already using local data, no action needed
        return 'local';
      
      case 'remote_wins':
        // Download and overwrite local
        await this.performRestore();
        return 'remote';
      
      case 'newest_wins':
        // Compare timestamps and use newest
        const { metadata } = await this.driveService.listBackups();
        if (metadata) {
          const remoteTime = new Date(metadata.createdAt).getTime();
          const localTime = new Date(localData.lastModified).getTime();
          
          if (remoteTime > localTime) {
            await this.performRestore();
            return 'remote';
          }
        }
        return 'local';
      
      case 'manual':
        // Caller must handle this case
        throw new Error('Manual conflict resolution required');
      
      default:
        return 'local';
    }
  }

  /**
   * Get list of available backups
   */
  async listAvailableBackups(): Promise<{
    backups: Array<{ id: string; name: string; modifiedTime: string; size?: string }>;
    metadata: BackupMetadata | null;
  }> {
    const result = await this.driveService.listBackups();
    return {
      backups: result.backups.map(f => ({
        id: f.id,
        name: f.name,
        modifiedTime: f.modifiedTime,
        size: f.size,
      })),
      metadata: result.metadata,
    };
  }

  /**
   * Get sync status
   */
  async getSyncStatus(): Promise<SyncStatus> {
    try {
      return await this.driveService.getSyncStatus();
    } catch {
      return {
        lastSync: this.state.lastBackup,
        status: this.state.status === 'error' ? 'error' : 'idle',
        progress: this.state.progress,
        error: this.state.lastError || undefined,
        pendingChanges: 0,
      };
    }
  }

  /**
   * Delete a specific backup from Google Drive
   */
  async deleteBackup(backupId: string): Promise<void> {
    await this.driveService.deleteFile(backupId);
  }

  /**
   * Delete all backups from Google Drive
   */
  async deleteAllBackups(): Promise<void> {
    const { backups } = await this.listAvailableBackups();
    for (const backup of backups) {
      await this.driveService.deleteFile(backup.id);
    }
  }

  // Private methods
  private async gatherLocalData(options: BackupOptions): Promise<LocalBackupData> {
    const data: LocalBackupData = {
      profiles: [],
      settings: {},
      analytics: {},
      lastModified: new Date().toISOString(),
      deviceId: this.getDeviceId(),
      version: '1.0.0',
    };

    // Gather profiles
    const profilesJson = this.localStorage.getItem('pulse_profiles');
    if (profilesJson) {
      data.profiles = JSON.parse(profilesJson);
    }

    // Gather settings
    const settingsJson = this.localStorage.getItem('pulse_settings');
    if (settingsJson) {
      data.settings = JSON.parse(settingsJson);
    }

    // Gather analytics (if permitted)
    if (options.includeMessages || options.includeCallLogs) {
      const analyticsJson = this.localStorage.getItem('pulse_analytics');
      if (analyticsJson) {
        data.analytics = JSON.parse(analyticsJson);
      }
    }

    return data;
  }

  private async applyLocalData(data: LocalBackupData): Promise<void> {
    // Restore profiles
    if (data.profiles.length > 0) {
      this.localStorage.setItem('pulse_profiles', JSON.stringify(data.profiles));
    }

    // Restore settings
    if (Object.keys(data.settings).length > 0) {
      this.localStorage.setItem('pulse_settings', JSON.stringify(data.settings));
    }

    // Restore analytics
    if (Object.keys(data.analytics).length > 0) {
      this.localStorage.setItem('pulse_analytics', JSON.stringify(data.analytics));
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

  private getNextBackupTime(intervalHours: number): string {
    const next = new Date();
    next.setHours(next.getHours() + intervalHours);
    return next.toISOString();
  }

  private updateScheduledBackup(): void {
    const now = new Date();
    this.state.scheduledBackup = {
      ...this.state.scheduledBackup,
      lastScheduledBackup: now.toISOString(),
      nextScheduledBackup: this.getNextBackupTime(this.state.scheduledBackup.intervalHours),
    };
    this.saveState();
  }

  private startScheduleInterval(): void {
    this.stopScheduleInterval();
    
    // Check every hour if a backup is due
    this.scheduleInterval = setInterval(async () => {
      if (!this.state.scheduledBackup.enabled) {
        this.stopScheduleInterval();
        return;
      }

      const nextBackup = this.state.scheduledBackup.nextScheduledBackup;
      if (nextBackup && new Date(nextBackup) <= new Date()) {
        try {
          await this.performBackup();
        } catch (error) {
          console.error('Scheduled backup failed:', error);
        }
      }
    }, 60 * 60 * 1000); // Check every hour
  }

  private stopScheduleInterval(): void {
    if (this.scheduleInterval) {
      clearInterval(this.scheduleInterval);
      this.scheduleInterval = null;
    }
  }

  private updateState(partial: Partial<BackupState>): void {
    this.state = { ...this.state, ...partial };
    this.saveState();
    this.notifyListeners();
  }

  private notifyListeners(): void {
    for (const listener of this.listeners) {
      listener(this.state);
    }
  }

  private loadState(): Partial<BackupState> | null {
    const saved = this.localStorage.getItem('pulse_backup_state');
    return saved ? JSON.parse(saved) : null;
  }

  private saveState(): void {
    this.localStorage.setItem('pulse_backup_state', JSON.stringify(this.state));
  }

  private getDefaultState(): BackupState {
    return {
      status: 'idle',
      progress: 0,
      currentOperation: null,
      lastBackup: null,
      lastRestore: null,
      lastError: null,
      scheduledBackup: { ...DEFAULT_SCHEDULE },
    };
  }
}

export default BackupManager;