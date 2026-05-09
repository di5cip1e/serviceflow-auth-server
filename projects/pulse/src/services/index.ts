/**
 * P.U.L.S.E. Services Index
 * Export all security, backup, privacy, permissions, background, subscription, CRM, campaigns, and analytics services
 */

// Subscription Services
export { subscriptionService } from './subscription/SubscriptionService';
export { FeatureFlags, hasFeatureAccess, getRequiredTier, getFeaturesByCategory, getAvailableFeatures, getLockedFeatures, getFeaturesUnlockedByTier, canUpgradeToTier, canDowngradeToTier, getNextTier, getAllCategories, getFeatureInfo } from './subscription/FeatureFlags';
export { TierGating, checkFeatureAccess, checkMultipleFeatures, generateUpgradePrompt, isInTrialPeriod, getTrialDaysRemaining, isSubscriptionExpired, getTierPricing, getTierDisplayName, getTierBadgeColor } from './subscription/TierGating';
export { StoreIntegration, GooglePlayStore, AppStore, getStore, initializeStore } from './subscription/StoreIntegration';
export type { SubscriptionTier, SubscriptionStatus, TrialConfig, TierPricing, FeatureInfo, UpgradePromptConfig, GatedFeatureResult, StoreProduct, PurchaseResult, ValidationResult } from './subscription';

// CRM Services
export { crmService } from './crm/CRMServices';
export type { CRMPipeline, PipelineStage, Lead, Activity, ActivityType, DealSummary } from './crm/CRMServices';

// Campaign Services
export { campaignService } from './campaigns/CampaignService';
export type { Campaign, CampaignStatus, AudienceTarget, CampaignSchedule, CampaignContent, CampaignMetrics, CampaignTemplate, CampaignStats } from './campaigns/CampaignService';

// Analytics Services
export { analyticsService } from './analytics/AnalyticsService';
export type { ResponseMetrics, EngagementScore, AnalyticsReport, ReportType, DateRange } from './analytics/AnalyticsService';

// Security Services
export { EncryptionService, encryptionService } from './security/EncryptionService';
export type { EncryptionConfig, EncryptedData, KeyDerivationOptions } from './security/EncryptionService';

// Backup Services
export { GoogleDriveService } from './backup/GoogleDriveService';
export type { DriveFile, BackupMetadata, DriveAuthConfig, SyncStatus } from './backup/GoogleDriveService';

export { BackupManager } from './backup/BackupManager';
export type { BackupSchedule, BackupOptions, ConflictResolution, BackupState, LocalBackupData } from './backup/BackupManager';

// Privacy Services
export { PrivacyService } from './privacy/PrivacyService';
export type { PrivacySettings, ExportData, DeletionResult, AnonymizedContact } from './privacy/PrivacyService';

// Permissions Services
export { PermissionManager } from './permissions/PermissionManager';
export type { PermissionType, PermissionState, PermissionRequest, PermissionSettings } from './permissions/PermissionManager';

// Background Services
export { BackgroundService } from './background/BackgroundService';
export type { BackgroundTask, SyncConfig, BatteryOptimizationResult, NotificationListenerStatus, NotificationListenerCallbacks } from './background/BackgroundService';
