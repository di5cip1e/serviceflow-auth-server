/**
 * TierComparison - Side-by-side tier comparison screen
 */

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Linking,
} from 'react-native';
import { SubscriptionTier, TIER_PRICING, ALL_FEATURES } from '../../types';
import { subscriptionService } from '../../services/subscription/SubscriptionService';
import { getTierDisplayName, getTierBadgeColor } from '../../services/subscription/TierGating';

interface TierComparisonProps {
  onSelectTier?: (tier: SubscriptionTier) => void;
  onClose?: () => void;
  highlightedTier?: SubscriptionTier;
}

interface TierCardProps {
  tier: SubscriptionTier;
  monthlyPrice: number;
  yearlyPrice: number;
  features: string[];
  isCurrentTier: boolean;
  isPopular?: boolean;
  onSelect: () => void;
  disabled?: boolean;
}

const TierCard: React.FC<TierCardProps> = ({
  tier,
  monthlyPrice,
  yearlyPrice,
  features,
  isCurrentTier,
  isPopular,
  onSelect,
  disabled,
}) => {
  const tierColor = getTierBadgeColor(tier);
  const tierName = getTierDisplayName(tier);

  return (
    <View style={[styles.tierCard, isPopular && styles.popularCard]}>
      {isPopular && (
        <View style={styles.popularBadge}>
          <Text style={styles.popularText}>Most Popular</Text>
        </View>
      )}
      
      <View style={styles.tierHeader}>
        <View style={[styles.tierBadge, { backgroundColor: tierColor }]}>
          <Text style={styles.tierBadgeText}>{tierName}</Text>
        </View>
        
        {isCurrentTier && (
          <View style={styles.currentBadge}>
            <Text style={styles.currentText}>Current</Text>
          </View>
        )}
      </View>

      <View style={styles.pricingSection}>
        {monthlyPrice === 0 ? (
          <Text style={styles.freePrice}>Free</Text>
        ) : (
          <>
            <Text style={styles.price}>${monthlyPrice.toFixed(2)}</Text>
            <Text style={styles.period}>/month</Text>
            {yearlyPrice > 0 && (
              <Text style={styles.yearlyPrice}>
                ${(yearlyPrice / 12).toFixed(2)}/mo billed yearly
              </Text>
            )}
          </>
        )}
      </View>

      <View style={styles.featuresList}>
        {features.map((feature, index) => (
          <View key={index} style={styles.featureRow}>
            <Text style={styles.checkIcon}>✓</Text>
            <Text style={styles.featureText}>{feature}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity
        style={[
          styles.selectButton,
          { backgroundColor: tierColor },
          isCurrentTier && styles.currentButton,
          disabled && styles.disabledButton,
        ]}
        onPress={onSelect}
        disabled={disabled || isCurrentTier}
        activeOpacity={0.8}
      >
        <Text style={styles.selectButtonText}>
          {isCurrentTier ? 'Current Plan' : disabled ? 'Upgrade to Unlock' : 'Select'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export const TierComparison: React.FC<TierComparisonProps> = ({
  onSelectTier,
  onClose,
  highlightedTier,
}) => {
  const currentTier = subscriptionService.getCurrentTier();

  const getFeaturesForTier = (tier: SubscriptionTier): string[] => {
    return ALL_FEATURES
      .filter(f => f.requiredTier === tier)
      .slice(0, 6) // Show top 6 features
      .map(f => f.name);
  };

  const handleSelectTier = (tier: SubscriptionTier) => {
    if (onSelectTier) {
      onSelectTier(tier);
    } else {
      // Default: initiate purchase
      const pricing = TIER_PRICING.find(p => p.tier === tier);
      if (pricing && pricing.monthlyPrice > 0) {
        // Would trigger purchase flow
        console.log(`Initiating purchase for ${tier}`);
      }
    }
  };

  const handleLearnMore = () => {
    Linking.openURL('https://pulse.app/pricing');
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Choose Your Plan</Text>
        <Text style={styles.subtitle}>
          Unlock more features with Pro and Business Pro
        </Text>
      </View>

      {/* Tier Cards */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.cardsContainer}
      >
        {/* Free Tier */}
        <TierCard
          tier="free"
          monthlyPrice={TIER_PRICING[0].monthlyPrice}
          yearlyPrice={TIER_PRICING[0].yearlyPrice}
          features={getFeaturesForTier('free')}
          isCurrentTier={currentTier === 'free'}
          onSelect={() => handleSelectTier('free')}
        />

        {/* Pro Tier */}
        <TierCard
          tier="pro"
          monthlyPrice={TIER_PRICING[1].monthlyPrice}
          yearlyPrice={TIER_PRICING[1].yearlyPrice}
          features={getFeaturesForTier('pro')}
          isCurrentTier={currentTier === 'pro'}
          isPopular
          onSelect={() => handleSelectTier('pro')}
          disabled={currentTier === 'free'}
        />

        {/* Business Pro Tier */}
        <TierCard
          tier="businessPro"
          monthlyPrice={TIER_PRICING[2].monthlyPrice}
          yearlyPrice={TIER_PRICING[2].yearlyPrice}
          features={getFeaturesForTier('businessPro')}
          isCurrentTier={currentTier === 'businessPro'}
          onSelect={() => handleSelectTier('businessPro')}
          disabled={currentTier === 'free' || currentTier === 'pro'}
        />
      </ScrollView>

      {/* Feature Comparison Table */}
      <View style={styles.comparisonSection}>
        <Text style={styles.comparisonTitle}>Feature Comparison</Text>
        
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderText, styles.featureNameCol]}>Feature</Text>
          <Text style={[styles.tableHeaderText, styles.tierCol]}>Free</Text>
          <Text style={[styles.tableHeaderText, styles.tierCol]}>Pro</Text>
          <Text style={[styles.tableHeaderText, styles.tierCol]}>Business</Text>
        </View>

        <ScrollView style={styles.tableBody}>
          {/* Group features by category */}
          {['Messaging', 'AI', 'Profile', 'CRM', 'Campaigns', 'Analytics'].map(category => {
            const categoryFeatures = ALL_FEATURES.filter(f => f.category === category);
            if (categoryFeatures.length === 0) return null;
            
            return (
              <View key={category} style={styles.categoryGroup}>
                <Text style={styles.categoryTitle}>{category}</Text>
                {categoryFeatures.map(feature => (
                  <View key={feature.key} style={styles.tableRow}>
                    <Text style={[styles.tableCell, styles.featureNameCol]} numberOfLines={1}>
                      {feature.name}
                    </Text>
                    <View style={[styles.tableCell, styles.tierCol]}>
                      {feature.requiredTier === 'free' ? (
                        <Text style={styles.checkMark}>✓</Text>
                      ) : (
                        <Text style={styles.crossMark}>—</Text>
                      )}
                    </View>
                    <View style={[styles.tableCell, styles.tierCol]}>
                      {['pro', 'businessPro'].includes(feature.requiredTier) ? (
                        feature.requiredTier === 'pro' ? (
                          <Text style={styles.checkMark}>✓</Text>
                        ) : (
                          <Text style={styles.crossMark}>—</Text>
                        )
                      ) : (
                        <Text style={styles.checkMark}>✓</Text>
                      )}
                    </View>
                    <View style={[styles.tableCell, styles.tierCol]}>
                      <Text style={styles.checkMark}>✓</Text>
                    </View>
                  </View>
                ))}
              </View>
            );
          })}
        </ScrollView>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity onPress={handleLearnMore}>
          <Text style={styles.footerLink}>View full feature comparison</Text>
        </TouchableOpacity>
        
        <Text style={styles.footerText}>
          Subscriptions auto-renew. Cancel anytime.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  header: {
    padding: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  cardsContainer: {
    paddingHorizontal: 16,
    gap: 16,
  },
  tierCard: {
    backgroundColor: '#1F2937',
    borderRadius: 16,
    padding: 20,
    width: 200,
    borderWidth: 1,
    borderColor: '#374151',
  },
  popularCard: {
    borderColor: '#8B5CF6',
    borderWidth: 2,
  },
  popularBadge: {
    position: 'absolute',
    top: -12,
    left: '50%',
    marginLeft: -60,
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  popularText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  tierHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  tierBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  tierBadgeText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 12,
  },
  currentBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  currentText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '500',
  },
  pricingSection: {
    alignItems: 'center',
    marginBottom: 16,
  },
  freePrice: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  price: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  period: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  yearlyPrice: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  featuresList: {
    marginBottom: 16,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  checkIcon: {
    color: '#10B981',
    fontSize: 12,
    marginRight: 6,
  },
  featureText: {
    fontSize: 11,
    color: '#D1D5DB',
    flex: 1,
  },
  selectButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  currentButton: {
    backgroundColor: '#374151',
  },
  disabledButton: {
    opacity: 0.5,
  },
  selectButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  comparisonSection: {
    flex: 1,
    padding: 16,
  },
  comparisonTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
    textAlign: 'center',
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
    paddingBottom: 8,
    marginBottom: 8,
  },
  tableHeaderText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9CA3AF',
    textAlign: 'center',
  },
  featureNameCol: {
    flex: 2,
    textAlign: 'left',
  },
  tierCol: {
    flex: 1,
  },
  tableBody: {
    flex: 1,
  },
  categoryGroup: {
    marginBottom: 16,
  },
  categoryTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B5CF6',
    marginBottom: 8,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#1F2937',
  },
  tableCell: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkMark: {
    color: '#10B981',
    fontSize: 14,
  },
  crossMark: {
    color: '#4B5563',
    fontSize: 14,
  },
  footer: {
    padding: 16,
    alignItems: 'center',
  },
  footerLink: {
    color: '#3B82F6',
    fontSize: 14,
    marginBottom: 8,
  },
  footerText: {
    color: '#6B7280',
    fontSize: 12,
    textAlign: 'center',
  },
});

export default TierComparison;