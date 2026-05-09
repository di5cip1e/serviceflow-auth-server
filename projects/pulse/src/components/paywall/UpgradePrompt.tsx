/**
 * UpgradePrompt - Modal shown when user hits tier-gated feature
 */

import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Linking,
} from 'react-native';
import { SubscriptionTier, TierPricing } from '../../types';
import { subscriptionService } from '../../services/subscription/SubscriptionService';
import { getTierDisplayName, getTierBadgeColor } from '../../services/subscription/TierGating';

interface UpgradePromptProps {
  visible: boolean;
  featureName: string;
  requiredTier: SubscriptionTier;
  pricing?: TierPricing;
  unlockedFeatures?: string[];
  onClose: () => void;
  onUpgrade?: () => void;
  onDismiss?: () => void;
}

export const UpgradePrompt: React.FC<UpgradePromptProps> = ({
  visible,
  featureName,
  requiredTier,
  pricing,
  unlockedFeatures = [],
  onClose,
  onUpgrade,
  onDismiss,
}) => {
  const tierColor = getTierBadgeColor(requiredTier);
  const tierName = getTierDisplayName(requiredTier);
  
  const handleUpgrade = async () => {
    if (onUpgrade) {
      onUpgrade();
    } else {
      // Default: initiate purchase
      try {
        const platform = 'android'; // Would be dynamic
        const store = platform === 'ios' 
          ? require('../subscription/StoreIntegration').AppStore
          : require('../subscription/StoreIntegration').GooglePlayStore;
        
        const productId = pricing?.productIdGooglePlay || pricing?.productIdAppStore;
        if (productId) {
          const result = await store.purchaseProduct(productId);
          if (result.success) {
            await subscriptionService.upgradeSubscription(
              requiredTier,
              result.productId,
              result.transactionId
            );
          }
        }
      } catch (error) {
        console.error('Purchase error:', error);
      }
    }
    onClose();
  };

  const handleLearnMore = () => {
    // Open pricing page or documentation
    Linking.openURL('https://pulse.app/pricing');
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={[styles.badge, { backgroundColor: tierColor }]}>
              <Text style={styles.badgeText}>{tierName}</Text>
            </View>
            <Text style={styles.title}>Unlock {featureName}</Text>
            <Text style={styles.subtitle}>
              Upgrade to access this feature and more
            </Text>
          </View>

          {/* Pricing */}
          {pricing && pricing.monthlyPrice > 0 && (
            <View style={styles.pricingSection}>
              <Text style={styles.priceLabel}>Starting at</Text>
              <View style={styles.priceRow}>
                <Text style={styles.price}>${pricing.monthlyPrice.toFixed(2)}</Text>
                <Text style={styles.period}>/month</Text>
              </View>
              {pricing.yearlyPrice > 0 && (
                <Text style={styles.yearlyPrice}>
                  or ${(pricing.yearlyPrice / 12).toFixed(2)}/month billed yearly
                </Text>
              )}
            </View>
          )}

          {/* Features */}
          {unlockedFeatures.length > 0 && (
            <View style={styles.featuresSection}>
              <Text style={styles.featuresTitle}>You'll also get:</Text>
              {unlockedFeatures.slice(0, 5).map((feature, index) => (
                <View key={index} style={styles.featureItem}>
                  <Text style={styles.checkmark}>✓</Text>
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}
              {unlockedFeatures.length > 5 && (
                <Text style={styles.moreFeatures}>
                  +{unlockedFeatures.length - 5} more features
                </Text>
              )}
            </View>
          )}

          {/* CTA Buttons */}
          <View style={styles.buttons}>
            <TouchableOpacity
              style={[styles.upgradeButton, { backgroundColor: tierColor }]}
              onPress={handleUpgrade}
              activeOpacity={0.8}
            >
              <Text style={styles.upgradeButtonText}>
                Upgrade to {tierName}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.learnMoreButton}
              onPress={handleLearnMore}
            >
              <Text style={styles.learnMoreText}>Learn more</Text>
            </TouchableOpacity>
          </View>

          {/* Dismiss */}
          {onDismiss && (
            <TouchableOpacity
              style={styles.dismissButton}
              onPress={onDismiss}
            >
              <Text style={styles.dismissText}>
                Maybe later
              </Text>
            </TouchableOpacity>
          )}

          {/* Close */}
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
          >
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  container: {
    backgroundColor: '#1F2937',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 360,
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  badge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 16,
  },
  badgeText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  pricingSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  priceLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  price: {
    fontSize: 36,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  period: {
    fontSize: 16,
    color: '#9CA3AF',
    marginLeft: 4,
  },
  yearlyPrice: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  featuresSection: {
    width: '100%',
    marginBottom: 20,
  },
  featuresTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  checkmark: {
    color: '#10B981',
    fontSize: 16,
    marginRight: 8,
  },
  featureText: {
    fontSize: 14,
    color: '#D1D5DB',
  },
  moreFeatures: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  buttons: {
    width: '100%',
    gap: 12,
  },
  upgradeButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  upgradeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  learnMoreButton: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  learnMoreText: {
    color: '#9CA3AF',
    fontSize: 14,
  },
  dismissButton: {
    marginTop: 16,
    paddingVertical: 8,
  },
  dismissText: {
    color: '#6B7280',
    fontSize: 12,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    color: '#9CA3AF',
    fontSize: 16,
  },
});

export default UpgradePrompt;