// ComparisonScreen - Side-by-side profile comparison
// Pro Tier Feature

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GCPCard, GCPAvatar, GCPProgressBar, GCPButton } from '../../components/base';
import { OCEANChart, OCEANDimensionBar } from '../../components/features/OCEANChart';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

// Mock data
const mockUser = {
  name: 'You',
  openness: 72,
  conscientiousness: 68,
  extroversion: 58,
  agreeableness: 75,
  neuroticism: 45,
};

const mockContact = {
  name: 'Sarah Chen',
  openness: 78,
  conscientiousness: 76,
  extroversion: 82,
  agreeableness: 71,
  neuroticism: 38,
};

const ComparisonScreen = ({ navigation, route }: any) => {
  // Calculate compatibility
  const dimensions = ['openness', 'conscientiousness', 'extroversion', 'agreeableness', 'neuroticism'];
  const differences = dimensions.map(dim => mockUser[dim] - mockContact[dim]);
  const avgDiff = differences.reduce((a, b) => a + Math.abs(b), 0) / differences.length;
  const compatibility = Math.max(0, 100 - avgDiff);

  const getCompatibilityLabel = (score: number) => {
    if (score >= 75) return 'High Compatibility';
    if (score >= 50) return 'Moderate Compatibility';
    return 'Challenging Compatibility';
  };

  const getCompatibilityColor = (score: number) => {
    if (score >= 75) return colors.scoreExcellent;
    if (score >= 50) return colors.scoreGood;
    return colors.scoreFair;
  };

  const getDimensionWarnings = () => {
    return dimensions.map((dim, index) => {
      const diff = differences[index];
      const userLabel = dim.charAt(0).toUpperCase() + dim.slice(1);
      if (Math.abs(diff) >= 15) {
        return { dimension: userLabel, diff, warning: true, text: `Significant gap` };
      } else if (Math.abs(diff) >= 8) {
        return { dimension: userLabel, diff, warning: false, text: `Moderate difference` };
      }
      return { dimension: userLabel, diff, warning: false, text: `Similar` };
    });
  };

  const getCommunicationTips = () => {
    const tips = [];
    if (mockContact.extroversion - mockUser.extroversion > 15) {
      tips.push("They're more outgoing - match their energy in group settings");
    }
    if (mockContact.openness - mockUser.openness > 10) {
      tips.push("They're more spontaneous - loosen up with unplanned activities");
    }
    if (mockUser.neuroticism - mockContact.neuroticism > 10) {
      tips.push("They're more relaxed - try to not take things so seriously");
    }
    if (mockUser.conscientiousness - mockContact.conscientiousness > 10) {
      tips.push("They're more laid-back - provide structure when needed");
    }
    if (tips.length === 0) {
      tips.push("You have similar personality traits - communication should come naturally");
    }
    return tips;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Compare Profiles</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Comparison Header */}
        <View style={styles.comparisonHeader}>
          <View style={styles.profileColumn}>
            <GCPAvatar name="You" size="large" />
            <Text style={styles.profileName}>You</Text>
            <Text style={styles.profileScore}>{mockUser.openness}</Text>
            <Text style={styles.profileLabel}>Openness</Text>
          </View>
          <View style={styles.vsContainer}>
            <Text style={styles.vsText}>vs</Text>
          </View>
          <View style={styles.profileColumn}>
            <GCPAvatar name={mockContact.name} size="large" />
            <Text style={styles.profileName}>{mockContact.name}</Text>
            <Text style={styles.profileScore}>{mockContact.openness}</Text>
            <Text style={styles.profileLabel}>Openness</Text>
          </View>
        </View>

        {/* Compatibility Score */}
        <GCPCard style={styles.compatibilityCard}>
          <View style={styles.compatibilityHeader}>
            <Text style={styles.compatibilityScore}>{compatibility}%</Text>
            <Text style={styles.compatibilityLabel}>
              {getCompatibilityLabel(compatibility)}
            </Text>
          </View>
          <View style={styles.compatibilityBar}>
            <View 
              style={[
                styles.compatibilityFill, 
                { 
                  width: `${compatibility}%`,
                  backgroundColor: getCompatibilityColor(compatibility)
                }
              ]} 
            />
          </View>
        </GCPCard>

        {/* OCEAN Comparison Chart */}
        <GCPCard style={styles.chartCard}>
          <Text style={styles.sectionTitle}>Personality Comparison</Text>
          <OCEANChart
            openness={mockUser.openness}
            conscientiousness={mockUser.conscientiousness}
            extroversion={mockUser.extroversion}
            agreeableness={mockUser.agreeableness}
            neuroticism={mockUser.neuroticism}
            showLabels={true}
            comparisonData={{
              openness: mockContact.openness,
              conscientiousness: mockContact.conscientiousness,
              extroversion: mockContact.extroversion,
              agreeableness: mockContact.agreeableness,
              neuroticism: mockContact.neuroticism,
            }}
          />
        </GCPCard>

        {/* Dimension Differences */}
        <GCPCard style={styles.differencesCard}>
          <Text style={styles.sectionTitle}>Dimension Differences</Text>
          {getDimensionWarnings().map((item, index) => (
            <View key={index} style={styles.differenceItem}>
              <Text style={styles.dimensionLabel}>{item.dimension}:</Text>
              <View style={styles.differenceValue}>
                <Text style={[
                  styles.differenceDiff,
                  item.diff > 0 ? styles.diffPositive : styles.diffNegative
                ]}>
                  {item.diff > 0 ? '+' : ''}{item.diff}
                </Text>
                {item.warning && (
                  <Text style={styles.warningIcon}>⚠️</Text>
                )}
              </View>
              <Text style={[
                styles.differenceText,
                item.warning && styles.warningText
              ]}>
                ({item.text})
              </Text>
            </View>
          ))}
        </GCPCard>

        {/* Communication Tips */}
        <GCPCard style={styles.tipsCard}>
          <View style={styles.tipsHeader}>
            <Text style={styles.tipsIcon}>💡</Text>
            <Text style={styles.sectionTitle}>Communication Tips</Text>
          </View>
          {getCommunicationTips().map((tip, index) => (
            <View key={index} style={styles.tipItem}>
              <Text style={styles.tipBullet}>•</Text>
              <Text style={styles.tipText}>{tip}</Text>
            </View>
          ))}
        </GCPCard>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <GCPButton
            title="View Full Profile"
            onPress={() => navigation.navigate('ContactDeepDive')}
            variant="primary"
            size="medium"
            fullWidth
          />
          <View style={styles.buttonSpacer} />
          <GCPButton
            title="View Trends"
            onPress={() => navigation.navigate('Trends')}
            variant="ghost"
            size="medium"
            fullWidth
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.base,
  },
  backButton: {
    fontSize: 24,
    color: colors.textPrimary,
  },
  title: {
    ...typography.h3,
  },
  placeholder: {
    width: 32,
  },
  comparisonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.base,
    marginBottom: spacing.base,
  },
  profileColumn: {
    alignItems: 'center',
    flex: 1,
  },
  profileName: {
    ...typography.h4,
    marginTop: spacing.sm,
  },
  profileScore: {
    ...typography.number,
    color: colors.primary,
    marginTop: spacing.xs,
  },
  profileLabel: {
    ...typography.caption,
  },
  vsContainer: {
    paddingHorizontal: spacing.lg,
  },
  vsText: {
    ...typography.h4,
    color: colors.textTertiary,
  },
  compatibilityCard: {
    marginHorizontal: spacing.base,
    marginBottom: spacing.base,
    alignItems: 'center',
  },
  compatibilityHeader: {
    alignItems: 'center',
    marginBottom: spacing.base,
  },
  compatibilityScore: {
    ...typography.numberLarge,
    color: colors.primary,
  },
  compatibilityLabel: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  compatibilityBar: {
    width: '100%',
    height: 12,
    backgroundColor: colors.background,
    borderRadius: 6,
    overflow: 'hidden',
  },
  compatibilityFill: {
    height: '100%',
    borderRadius: 6,
  },
  chartCard: {
    marginHorizontal: spacing.base,
    marginBottom: spacing.base,
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  sectionTitle: {
    ...typography.h4,
    marginBottom: spacing.base,
  },
  differencesCard: {
    marginHorizontal: spacing.base,
    marginBottom: spacing.base,
  },
  differenceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  dimensionLabel: {
    ...typography.label,
    width: 120,
  },
  differenceValue: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 70,
  },
  differenceDiff: {
    ...typography.body,
    fontWeight: '600',
  },
  diffPositive: {
    color: colors.primary,
  },
  diffNegative: {
    color: colors.error,
  },
  warningIcon: {
    marginLeft: spacing.xs,
  },
  differenceText: {
    ...typography.bodySmall,
    flex: 1,
    textAlign: 'right',
  },
  warningText: {
    color: colors.warning,
  },
  tipsCard: {
    marginHorizontal: spacing.base,
    marginBottom: spacing.base,
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  tipsIcon: {
    fontSize: 20,
    marginRight: spacing.sm,
  },
  tipItem: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  tipBullet: {
    ...typography.body,
    marginRight: spacing.sm,
    color: colors.primary,
  },
  tipText: {
    ...typography.body,
    flex: 1,
  },
  actionButtons: {
    paddingHorizontal: spacing.base,
    paddingBottom: spacing.xxxl,
  },
  buttonSpacer: {
    height: spacing.sm,
  },
});

export default ComparisonScreen;
