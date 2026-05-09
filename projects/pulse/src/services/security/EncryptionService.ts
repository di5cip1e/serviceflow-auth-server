/**
 * EncryptionService - AES-256 encryption for sensitive data
 * Uses Web Crypto API for secure on-device encryption
 */

import { secureRandom, deriveKey, encrypt, decrypt } from './crypto-utils';

export interface EncryptionConfig {
  algorithm: 'AES-GCM';
  keyLength: 256;
  ivLength: 12;
  tagLength: 128;
  saltLength: 16;
}

export interface EncryptedData {
  ciphertext: string;      // Base64 encoded
  iv: string;              // Base64 encoded
  salt: string;            // Base64 encoded
  version: number;
}

export interface KeyDerivationOptions {
  password: string;
  salt?: Uint8Array;
  iterations?: number;
}

const DEFAULT_CONFIG: EncryptionConfig = {
  algorithm: 'AES-GCM',
  keyLength: 256,
  ivLength: 12,
  tagLength: 128,
  saltLength: 16,
};

export class EncryptionService {
  private config: EncryptionConfig;
  private cachedKey: CryptoKey | null = null;
  private keyPassword: string | null = null;

  constructor(config: Partial<EncryptionConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Derive an encryption key from user credentials
   * Uses PBKDF2 with SHA-256 for key derivation
   */
  async deriveKeyFromPassword(options: KeyDerivationOptions): Promise<CryptoKey> {
    const { password, salt, iterations = 100000 } = options;
    
    const encoder = new TextEncoder();
    const passwordBuffer = encoder.encode(password);
    
    // Use provided salt or generate a new one
    const saltBytes = salt || secureRandom(this.config.saltLength);
    
    // Import password as raw key
    const baseKey = await crypto.subtle.importKey(
      'raw',
      passwordBuffer,
      'PBKDF2',
      false,
      ['deriveKey']
    );
    
    // Derive the AES-GCM key
    const derivedKey = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: saltBytes,
        iterations,
        hash: 'SHA-256',
      },
      baseKey,
      {
        name: this.config.algorithm,
        length: this.config.keyLength,
      },
      false,
      ['encrypt', 'decrypt']
    );
    
    return derivedKey;
  }

  /**
   * Cache the derived key for session use
   */
  async setSessionKey(password: string, salt?: Uint8Array): Promise<string> {
    this.cachedKey = await this.deriveKeyFromPassword({ password, salt });
    this.keyPassword = password;
    
    // Return salt for storage if not provided
    if (salt) {
      return this.bufferToBase64(salt);
    }
    const newSalt = secureRandom(this.config.saltLength);
    return this.bufferToBase64(newSalt);
  }

  /**
   * Clear cached key from memory
   */
  clearSessionKey(): void {
    this.cachedKey = null;
    this.keyPassword = null;
  }

  /**
   * Encrypt sensitive data with AES-256-GCM
   */
  async encryptData(plaintext: string, key?: CryptoKey): Promise<EncryptedData> {
    const encryptionKey = key || this.cachedKey;
    
    if (!encryptionKey) {
      throw new Error('No encryption key available. Call setSessionKey first.');
    }
    
    // Generate random IV for each encryption
    const iv = secureRandom(this.config.ivLength);
    const salt = secureRandom(this.config.saltLength);
    
    const encoder = new TextEncoder();
    const plaintextBuffer = encoder.encode(plaintext);
    
    // Encrypt with AES-GCM
    const ciphertextBuffer = await crypto.subtle.encrypt(
      {
        name: this.config.algorithm,
        iv,
        tagLength: this.config.tagLength,
      },
      encryptionKey,
      plaintextBuffer
    );
    
    return {
      ciphertext: this.bufferToBase64(ciphertextBuffer),
      iv: this.bufferToBase64(iv),
      salt: this.bufferToBase64(salt),
      version: 1,
    };
  }

  /**
   * Decrypt data with AES-256-GCM
   */
  async decryptData(encryptedData: EncryptedData, key?: CryptoKey): Promise<string> {
    const encryptionKey = key || this.cachedKey;
    
    if (!encryptionKey) {
      throw new Error('No decryption key available. Call setSessionKey first.');
    }
    
    const ciphertextBuffer = this.base64ToBuffer(encryptedData.ciphertext);
    const iv = this.base64ToBuffer(encryptedData.iv);
    
    // Decrypt with AES-GCM
    const plaintextBuffer = await crypto.subtle.decrypt(
      {
        name: this.config.algorithm,
        iv,
        tagLength: this.config.tagLength,
      },
      encryptionKey,
      ciphertextBuffer
    );
    
    const decoder = new TextDecoder();
    return decoder.decode(plaintextBuffer);
  }

  /**
   * Encrypt profile data before storage
   */
  async encryptProfile(profileData: Record<string, unknown>): Promise<string> {
    const jsonString = JSON.stringify(profileData);
    const encrypted = await this.encryptData(jsonString);
    return JSON.stringify(encrypted);
  }

  /**
   * Decrypt profile data from storage
   */
  async decryptProfile(encryptedString: string): Promise<Record<string, unknown>> {
    const encrypted = JSON.parse(encryptedString) as EncryptedData;
    const decrypted = await this.decryptData(encrypted);
    return JSON.parse(decrypted);
  }

  /**
   * Hash a password for verification (not for encryption key derivation)
   */
  async hashPassword(password: string, salt?: Uint8Array): Promise<{ hash: string; salt: string }> {
    const saltBytes = salt || secureRandom(this.config.saltLength);
    
    const encoder = new TextEncoder();
    const passwordBuffer = encoder.encode(password);
    
    // Combine password and salt
    const combined = new Uint8Array(passwordBuffer.length + saltBytes.length);
    combined.set(passwordBuffer);
    combined.set(saltBytes, passwordBuffer.length);
    
    // Hash with SHA-256
    const hashBuffer = await crypto.subtle.digest('SHA-256', combined);
    
    return {
      hash: this.bufferToBase64(hashBuffer),
      salt: this.bufferToBase64(saltBytes),
    };
  }

  /**
   * Verify password against stored hash
   */
  async verifyPassword(password: string, storedHash: string, storedSalt: string): Promise<boolean> {
    const { hash } = await this.hashPassword(password, this.base64ToBuffer(storedSalt));
    return hash === storedHash;
  }

  /**
   * Generate a secure random token
   */
  generateSecureToken(length: number = 32): string {
    return this.bufferToBase64(secureRandom(length));
  }

  // Utility methods
  private bufferToBase64(buffer: Uint8Array | ArrayBuffer): string {
    const bytes = buffer instanceof ArrayBuffer ? new Uint8Array(buffer) : buffer;
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  private base64ToBuffer(base64: string): Uint8Array {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  }
}

// Crypto utilities module (would be separate file in real project)
export const crypto = {
  secureRandom: (length: number): Uint8Array => {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return array;
  },
  
  getRandomValues: (array: Uint8Array): Uint8Array => {
    return crypto.getRandomValues(array);
  },
};

// Re-export for internal use
function secureRandom(length: number): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(length));
}

// Default instance
export const encryptionService = new EncryptionService();