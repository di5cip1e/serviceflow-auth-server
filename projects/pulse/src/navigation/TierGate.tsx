// TierGate Component
// Feature gating for subscription tiers

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';
import { SubscriptionTier } from '../data/mockData';

interface TierGateProps {
  feature: string;
  requiredTier: SubscriptionTier;
  userTier: SubscriptionTier;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onUpgrade?: () => void;
}

const tierHierarchy: SubscriptionTier[] = ['free', 'pro', 'businessPro'];

export const TierGate: React.FC<TierGateProps> = ({
  feature,
  requiredTier,
  userTier,
  children,
  fallback,
  onUpgrade,
}) => {
  const userTierIndex = tierHierarchy.indexOf(userTier);
  const requiredTierIndex = tierHierarchy.indexOf(requiredTier);
  
  const hasAccess = userTierIndex >= requiredTierIndex;

  if (hasAccess) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <TierLockedView
      feature={feature}
      requiredTier={requiredTier}
      userTier={userTier}
      onUpgrade={onUpgrade}
    />
  );
};

// Locked state component
export const TierLockedView: React.FC<{
  feature: string;
  requiredTier: SubscriptionTier;
  userTier: SubscriptionTier;
  onUpgrade?: () => void;
}> = ({
  feature,
  requiredTier,
  userTier,
  onUpgrade,
}) => {
  const getTierName = (tier: SubscriptionTier) => {
    switch (tier) {
      case 'pro':
        return 'Pro Profile';
      case 'businessPro':
        return 'Business Pro';
      default:
        return 'Free';
    }
  };

  const getTierPrice = (tier: SubscriptionTier) => {
    switch (tier) {
      case 'pro':
        return '$4.99/month';
      case 'businessPro':
        return '$14.99/month';
      default:
        return 'Free';
    }
  };

  const getTierIcon = (tier: SubscriptionTier) => {
    switch (tier) {
      case 'pro':
        return '⭐';
      case 'businessPro':
        return '💼';
      default:
        return '🆓';
    }
  };

  const getUpgradeTier = (currentTier: SubscriptionTier): SubscriptionTier => {
    if (currentTier === 'free') return 'pro';
    return 'businessPro';
  };

  const upgradeTo = getUpgradeTier(userTier);

  return (
    <View style={styles.lockedContainer}>
      <View style={styles.lockedIcon}>
        <Text style={styles.lockedEmoji}>🔒</Text>
      </View>
      <Text style={styles.lockedTitle}>{feature}</Text>
      <Text style={styles.lockedSubtitle}>
        Available on {getTierName(requiredTier)} tier
      </Text>
      
      <View style={styles.tierComparison}>
        <View style={styles.tierColumn}>
          <Text style={styles.tierLabel}>Your Tier</Text>
          <View style={styles.tierBadge}>
            <Text style={styles.tierBadgeIcon}>{getTierIcon(userTier)}</Text>
            <Text style={styles.tierBadgeText}>{getTierName(userTier)}</Text>
          </View>
        </View>
        <Text style={styles.tierArrow}>→</Text>
        <View style={styles.tierColumn}>
          <Text style={styles.tierLabel}>Required</Text>
          <View style={[styles.tierBadge, styles.tierBadgeRequired]}>
            <Text style={styles.tierBadgeIcon}>{getTierIcon(requiredTier)}</Text>
            <Text style={styles.tierBadgeText}>{getTierName(requiredTier)}</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity
        style={styles.upgradeButton}
        onPress={onUpgrade}
      >
        <Text style={styles.upgradeButtonText}>
          Upgrade to {getTierName(upgradeTo)}
        </Text>
        <Text style={styles.upgradePrice}>{getTierPrice(upgradeTo)}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.laterButton}>
        <Text style={styles.laterButtonText}>Maybe Later</Text>
      </TouchableOpacity>
    </View>
  );
};

// Full screen upgrade modal
export const UpgradeModal: React.FC<{
  visible: boolean;
  feature: string;
  onClose: () => void;
  onUpgrade: () => void;
}> = ({ visible, feature, onClose, onUpgrade }) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <TouchableOpacity style={styles.modalClose} onPress={onClose}>
            <Text style={styles.modalCloseText}>✕</Text>
          </TouchableOpacity>

          <View style={styles.modalIcon}>
            <Text style={styles.modalEmoji}>🔓</Text>
          </View>
          
          <Text style={styles.modalTitle}>Unlock {feature}</Text>
          <Text style={styles.modalText}>
            This feature is available on Pro Profile and Business Pro tiers.
          </Text>

          <View style={styles.tierCards}>
            <View style={styles.tierCard}>
              <Text style={styles.tierCardIcon}>⭐</Text>
              <Text style={styles.tierCardTitle}>Pro Profile</Text>
              <Text style={styles.tierCardPrice}>$4.99/mo</Text>
              <Text style={styles.tierCardFeatures}>
                • Deep Big Five{'\n'}
                • Contact Comparison{'\n'}
                • Compatibility Scores{'\n'}
                • 30/60/90 Day Trends
              </Text>
              <TouchableOpacity
                style={[styles.tierCardButton, styles.tierCardButtonPro]}
                onPress={() => {
                  onUpgrade();
                  onClose();
                }}
              >
                <Text style={styles.tierCardButtonText}>Select Pro</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.tierCard}>
              <Text style={styles.tierCardIcon}>💼</Text>
              <Text style={styles.tierCardTitle}>Business Pro</Text>
              <Text style={styles.tierCardPrice}>$14.99/mo</Text>
              <Text style={styles.tierCardFeatures}>
                • Everything in Pro{'\n'}
                • Multi-Account{'\n'}
                • CRM Dashboard{'\n'}
                • Campaigns & Analytics
              </Text>
              <TouchableOpacity
                style={[styles.tierCardButton, styles.tierCardButtonBusiness]}
                onPress={() => {
                  onUpgrade();
                  onClose();
                }}
              >
                <Text style={styles.tierCardButtonText}>Select Business</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// Hook for checking tier access
export const useTierAccess = (userTier: SubscriptionTier) => {
  const canAccessPro = userTier !== 'free';
  const canAccessBusiness = userTier === 'businessPro';

  return {
    canAccessPro,
    canAccessBusiness,
    isFree: userTier === 'free',
    isPro: userTier === 'pro',
    isBusinessPro: userTier === 'businessPro',
  };
};

const styles = StyleSheet.create({
  lockedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  lockedIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.warning + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  lockedEmoji: {
    fontSize: 36,
  },
  lockedTitle: {
    ...typography.h2,
    marginBottom: spacing.sm,
  },
  lockedSubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
  },
  tierComparison: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  tierColumn: {
    alignItems: 'center',
  },
  tierLabel: {
    ...typography.caption,
    marginBottom: spacing.sm,
  },
  tierBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    borderRadius: spacing.radiusFull,
    gap: spacing.sm,
  },
  tierBadgeRequired: {
    backgroundColor: colors.primary + '20',
  },
  tierBadgeIcon: {
    fontSize: 16,
  },
  tierBadgeText: {
    ...typography.bodySmall,
    fontWeight: '600',
  },
  tierArrow: {
    ...typography.h2,
    color: colors.textTertiary,
    marginHorizontal: spacing.lg,
  },
  upgradeButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.md,
    borderRadius: spacing.radiusMd,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  upgradeButtonText: {
    ...typography.button,
    color: colors.white,
  },
  upgradePrice: {
    ...typography.caption,
    color: colors.white,
    opacity: 0.8,
  },
  laterButton: {
    padding: spacing.md,
  },
  laterButtonText: {
    ...typography.body,
    color: colors.textTertiary,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.base,
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: spacing.radiusLg,
    padding: spacing.xl,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  modalClose: {
    position: 'absolute',
    top: spacing.base,
    right: spacing.base,
    padding: spacing.sm,
  },
  modalCloseText: {
    fontSize: 20,
    color: colors.textSecondary,
  },
  modalIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  modalEmoji: {
    fontSize: 36,
  },
  modalTitle: {
    ...typography.h2,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  modalText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  tierCards: {
    width: '100%',
    gap: spacing.md,
  },
  tierCard: {
    backgroundColor: colors.background,
    borderRadius: spacing.radiusMd,
    padding: spacing.base,
    alignItems: 'center',
  },
  tierCardIcon: {
    fontSize: 24,
    marginBottom: spacing.sm,
  },
  tierCardTitle: {
    ...typography.h4,
    marginBottom: spacing.xs,
  },
  tierCardPrice: {
    ...typography.h3,
    color: colors.primary,
    marginBottom: spacing.md,
  },
  tierCardFeatures: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  tierCardButton: {
    width: '100%',
    paddingVertical: spacing.md,
    borderRadius: spacing.radiusSm,
    alignItems: 'center',
  },
  tierCardButtonPro: {
    backgroundColor: colors.secondary,
  },
  tierCardButtonBusiness: {
    backgroundColor: colors.tierBusiness,
  },
  tierCardButtonText: {
    ...typography.button,
    color: colors.white,
  },
});