/**
 * GoogleDriveService - OAuth authentication and file operations for Google Drive backup
 */

import { EncryptionService, EncryptedData } from '../security/EncryptionService';

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime: string;
  size?: string;
}

export interface BackupMetadata {
  id: string;
  createdAt: string;
  version: string;
  size: number;
  checksum: string;
  deviceId: string;
}

export interface DriveAuthConfig {
  clientId: string;
  redirectUri: string;
  scopes: string[];
}

export interface SyncStatus {
  lastSync: string | null;
  status: 'idle' | 'syncing' | 'error' | 'success';
  progress: number;
  error?: string;
  pendingChanges: number;
}

const DEFAULT_CONFIG: DriveAuthConfig = {
  clientId: '',
  redirectUri: 'urn:ietf:wg:oauth:2.0:oob',
  scopes: [
    'https://www.googleapis.com/auth/drive.file',
    'https://www.googleapis.com/auth/drive.appdata',
  ],
};

const BACKUP_FOLDER_NAME = 'PULSE_Backup';
const BACKUP_FILE_PREFIX = 'pulse_backup_';
const METADATA_FILE_NAME = 'pulse_backup_metadata.json';

export class GoogleDriveService {
  private config: DriveAuthConfig;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private encryptionService: EncryptionService;
  private deviceId: string;
  private folderId: string | null = null;

  constructor(
    encryptionService: EncryptionService,
    config: Partial<DriveAuthConfig> = {},
    deviceId: string
  ) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.encryptionService = encryptionService;
    this.deviceId = deviceId;
  }

  /**
   * Generate OAuth URL for user authorization
   */
  getAuthUrl(): string {
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      response_type: 'code',
      scope: this.config.scopes.join(' '),
      access_type: 'offline',
      prompt: 'consent',
    });
    
    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  /**
   * Exchange authorization code for tokens
   * Note: This would normally call your backend to exchange the code
   */
  async exchangeCodeForTokens(code: string): Promise<{ accessToken: string; refreshToken: string }> {
    // In production, this would call your backend which handles the OAuth exchange
    // to keep client secrets secure
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: this.config.clientId,
        redirect_uri: this.config.redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    if (!response.ok) {
      throw new Error(`OAuth error: ${response.statusText}`);
    }

    const data = await response.json();
    this.accessToken = data.access_token;
    this.refreshToken = data.refresh_token;
    
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
    };
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken(): Promise<string> {
    if (!this.refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        refresh_token: this.refreshToken,
        client_id: this.config.clientId,
        grant_type: 'refresh_token',
      }),
    });

    if (!response.ok) {
      throw new Error(`Token refresh failed: ${response.statusText}`);
    }

    const data = await response.json();
    this.accessToken = data.access_token;
    
    return data.access_token;
  }

  /**
   * Set tokens directly (for restoring session)
   */
  setTokens(accessToken: string, refreshToken?: string): void {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken || null;
  }

  /**
   * Get current access token
   */
  getAccessToken(): string | null {
    return this.accessToken;
  }

  /**
   * Check if authenticated
   */
  isAuthenticated(): boolean {
    return this.accessToken !== null;
  }

  /**
   * Clear authentication tokens
   */
  clearAuth(): void {
    this.accessToken = null;
    this.refreshToken = null;
    this.folderId = null;
  }

  /**
   * Ensure backup folder exists, create if not
   */
  private async ensureBackupFolder(): Promise<string> {
    if (this.folderId) {
      return this.folderId;
    }

    // First, try to find existing folder
    const existingFolder = await this.listFiles(
      `name='${BACKUP_FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false`
    );

    if (existingFolder.files.length > 0) {
      this.folderId = existingFolder.files[0].id;
      return this.folderId;
    }

    // Create new folder
    const folder = await this.createFile({
      name: BACKUP_FOLDER_NAME,
      mimeType: 'application/vnd.google-apps.folder',
    });

    this.folderId = folder.id;
    return this.folderId;
  }

  /**
   * List files in Drive with optional query
   */
  async listFiles(query?: string): Promise<{ files: DriveFile[]; nextPageToken?: string }> {
    this.ensureAuthenticated();
    
    const params = new URLSearchParams({
      q: query || "trashed=false",
      fields: 'files(id,name,mimeType,modifiedTime,size),nextPageToken',
    });

    const response = await this.makeRequest(
      `https://www.googleapis.com/drive/v3/files?${params.toString()}`
    );

    return {
      files: response.files || [],
      nextPageToken: response.nextPageToken,
    };
  }

  /**
   * Create a new file in Drive
   */
  async createFile(metadata: {
    name: string;
    mimeType: string;
    parents?: string[];
    content?: Blob;
  }): Promise<DriveFile> {
    this.ensureAuthenticated();

    const formData = new FormData();
    
    // Metadata part
    const metadataBlob = new Blob([JSON.stringify(metadata)], {
      type: 'application/json',
    });
    formData.append('metadata', metadataBlob);

    // Content part if provided
    if (metadata.content) {
      formData.append('file', metadata.content);
    }

    const response = await fetch(
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to create file: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Update an existing file
   */
  async updateFile(fileId: string, content: Blob): Promise<DriveFile> {
    this.ensureAuthenticated();

    const response = await fetch(
      `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          'Content-Type': 'application/octet-stream',
        },
        body: content,
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to update file: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Download file content
   */
  async downloadFile(fileId: string): Promise<Blob> {
    this.ensureAuthenticated();

    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
      {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to download file: ${response.statusText}`);
    }

    return response.blob();
  }

  /**
   * Delete a file
   */
  async deleteFile(fileId: string): Promise<void> {
    this.ensureAuthenticated();

    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      }
    );

    if (!response.ok && response.status !== 204) {
      throw new Error(`Failed to delete file: ${response.statusText}`);
    }
  }

  /**
   * Upload encrypted backup to Google Drive
   */
  async uploadEncryptedBackup(data: Record<string, unknown>): Promise<DriveFile> {
    this.ensureAuthenticated();
    
    const folderId = await this.ensureBackupFolder();
    
    // Encrypt the data
    const encrypted = await this.encryptionService.encryptProfile(data);
    
    // Calculate checksum
    const checksum = await this.calculateChecksum(encrypted);
    
    // Create backup metadata
    const metadata: BackupMetadata = {
      id: this.generateBackupId(),
      createdAt: new Date().toISOString(),
      version: '1.0.0',
      size: encrypted.length,
      checksum,
      deviceId: this.deviceId,
    };
    
    // Create backup file
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupName = `${BACKUP_FILE_PREFIX}${timestamp}.json.enc`;
    
    const blob = new Blob([encrypted], { type: 'application/octet-stream' });
    
    const backupFile = await this.createFile({
      name: backupName,
      mimeType: 'application/octet-stream',
      parents: [folderId],
      content: blob,
    });
    
    // Also upload metadata separately
    await this.uploadMetadata(metadata, folderId);
    
    return backupFile;
  }

  /**
   * Upload backup metadata
   */
  private async uploadMetadata(metadata: BackupMetadata, folderId: string): Promise<void> {
    const metadataBlob = new Blob([JSON.stringify(metadata, null, 2)], {
      type: 'application/json',
    });

    // Check if metadata file exists
    const existing = await this.listFiles(
      `name='${METADATA_FILE_NAME}' and '${folderId}' in parents and trashed=false`
    );

    if (existing.files.length > 0) {
      await this.updateFile(existing.files[0].id, metadataBlob);
    } else {
      await this.createFile({
        name: METADATA_FILE_NAME,
        mimeType: 'application/json',
        parents: [folderId],
        content: metadataBlob,
      });
    }
  }

  /**
   * Download and restore from Google Drive backup
   */
  async downloadAndRestore(): Promise<{
    data: Record<string, unknown>;
    metadata: BackupMetadata;
  }> {
    this.ensureAuthenticated();
    
    const folderId = await this.ensureBackupFolder();
    
    // Find latest backup file
    const backups = await this.listFiles(
      `name contains '${BACKUP_FILE_PREFIX}' and '${folderId}' in parents and trashed=false`
    );
    
    if (backups.files.length === 0) {
      throw new Error('No backup found');
    }
    
    // Sort by modified time, get most recent
    const latestBackup = backups.files.sort((a, b) => 
      new Date(b.modifiedTime).getTime() - new Date(a.modifiedTime).getTime()
    )[0];
    
    // Download backup content
    const encryptedBlob = await this.downloadFile(latestBackup.id);
    const encrypted = await encryptedBlob.text();
    
    // Decrypt the data
    const decrypted = await this.encryptionService.decryptProfile(encrypted);
    
    // Get metadata
    const metadataFiles = await this.listFiles(
      `name='${METADATA_FILE_NAME}' and '${folderId}' in parents and trashed=false`
    );
    
    let metadata: BackupMetadata;
    if (metadataFiles.files.length > 0) {
      const metadataBlob = await this.downloadFile(metadataFiles.files[0].id);
      metadata = JSON.parse(await metadataBlob.text());
    } else {
      // Create metadata from backup file info
      metadata = {
        id: latestBackup.id,
        createdAt: latestBackup.modifiedTime,
        version: '1.0.0',
        size: parseInt(latestBackup.size || '0', 10),
        checksum: '',
        deviceId: this.deviceId,
      };
    }
    
    return { data: decrypted, metadata };
  }

  /**
   * Get list of available backups
   */
  async listBackups(): Promise<{ backups: DriveFile[]; metadata: BackupMetadata | null }> {
    this.ensureAuthenticated();
    
    const folderId = await this.ensureBackupFolder();
    
    const backups = await this.listFiles(
      `name contains '${BACKUP_FILE_PREFIX}' and '${folderId}' in parents and trashed=false`
    );
    
    // Get metadata
    const metadataFiles = await this.listFiles(
      `name='${METADATA_FILE_NAME}' and '${folderId}' in parents and trashed=false`
    );
    
    let metadata: BackupMetadata | null = null;
    if (metadataFiles.files.length > 0) {
      const metadataBlob = await this.downloadFile(metadataFiles.files[0].id);
      metadata = JSON.parse(await metadataBlob.text());
    }
    
    return { 
      backups: backups.files.sort((a, b) => 
        new Date(b.modifiedTime).getTime() - new Date(a.modifiedTime).getTime()
      ),
      metadata,
    };
  }

  /**
   * Get sync status
   */
  async getSyncStatus(): Promise<SyncStatus> {
    this.ensureAuthenticated();
    
    try {
      const { backups, metadata } = await this.listBackups();
      
      return {
        lastSync: metadata?.createdAt || null,
        status: 'success',
        progress: 100,
        pendingChanges: 0,
      };
    } catch (error) {
      return {
        lastSync: null,
        status: 'error',
        progress: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
        pendingChanges: 0,
      };
    }
  }

  // Helper methods
  private ensureAuthenticated(): void {
    if (!this.accessToken) {
      throw new Error('Not authenticated. Call setTokens or exchangeCodeForTokens first.');
    }
  }

  private async makeRequest(url: string, options: RequestInit = {}): Promise<unknown> {
    const response = await fetch(url, {
      ...options,
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      // Handle token expiration
      if (response.status === 401) {
        try {
          await this.refreshAccessToken();
          return this.makeRequest(url, options);
        } catch {
          throw new Error('Authentication failed. Please re-authenticate.');
        }
      }
      throw new Error(`API request failed: ${response.statusText}`);
    }

    return response.json();
  }

  private async calculateChecksum(data: string): Promise<string> {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    return this.bufferToBase64(hashBuffer);
  }

  private generateBackupId(): string {
    return `backup_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private bufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }
}

export default GoogleDriveService;