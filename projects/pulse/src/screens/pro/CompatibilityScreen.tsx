// CompatibilityScreen - Detailed relationship analysis
// Pro Tier Feature

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GCPCard, GCPAvatar, GCPButton, GCPChip } from '../../components/base';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Mock data
const mockContact = {
  name: 'Sarah Chen',
  compatibility: 82,
};

const mockHistory = [
  { month: 'Jan', score: 75 },
  { month: 'Feb', score: 78 },
  { month: 'Mar', score: 80 },
  { month: 'Apr', score: 79 },
  { month: 'May', score: 81 },
  { month: 'Jun', score: 82 },
];

const mockStrengths = [
  'Similar communication styles',
  'Complementary energy levels',
  'Balanced give-and-take',
  'Shared interests',
];

const mockChallenges = [
  'Their spontaneity may frustrate you',
  'Different social preferences',
  'Response time expectations vary',
];

const CompatibilityScreen = ({ navigation, route }: any) => {
  const [timeRange, setTimeRange] = useState<'30' | '60' | '90'>('30');

  const getCompatibilityRating = (score: number): { label: string; color: string } => {
    if (score >= 75) return { label: 'Excellent Match', color: colors.scoreExcellent };
    if (score >= 50) return { label: 'Good Match', color: colors.scoreGood };
    return { label: 'Challenging', color: colors.scoreFair };
  };

  const rating = getCompatibilityRating(mockContact.compatibility);

  // Find min/max for chart scaling
  const scores = mockHistory.map(h => h.score);
  const minScore = Math.min(...scores) - 5;
  const maxScore = Math.max(...scores) + 5;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Compatibility: {mockContact.name}</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Main Score */}
        <GCPCard style={styles.scoreCard}>
          <View style={styles.scoreContainer}>
            <Text style={styles.heartIcon}>💜</Text>
            <Text style={styles.scoreValue}>{mockContact.compatibility}%</Text>
            <Text style={[styles.scoreLabel, { color: rating.color }]}>
              {rating.label}
            </Text>
          </View>
        </GCPCard>

        {/* Strengths */}
        <GCPCard style={styles.listCard}>
          <Text style={styles.sectionTitle}>Strengths</Text>
          {mockStrengths.map((strength, index) => (
            <View key={index} style={styles.listItem}>
              <Text style={styles.checkIcon}>✓</Text>
              <Text style={styles.listText}>{strength}</Text>
            </View>
          ))}
        </GCPCard>

        {/* Challenges */}
        <GCPCard style={styles.listCard}>
          <Text style={styles.sectionTitle}>Challenges</Text>
          {mockChallenges.map((challenge, index) => (
            <View key={index} style={styles.listItem}>
              <Text style={styles.warningIcon}>⚠️</Text>
              <Text style={styles.listText}>{challenge}</Text>
            </View>
          ))}
        </GCPCard>

        {/* Historical Trend Graph */}
        <GCPCard style={styles.trendCard}>
          <View style={styles.trendHeader}>
            <Text style={styles.sectionTitle}>Historical Trend</Text>
            <View style={styles.timeRangeSelector}>
              <GCPChip 
                label="30D" 
                selected={timeRange === '30'} 
                onPress={() => setTimeRange('30')}
              />
              <GCPChip 
                label="60D" 
                selected={timeRange === '60'} 
                onPress={() => setTimeRange('60')}
              />
              <GCPChip 
                label="90D" 
                selected={timeRange === '90'} 
                onPress={() => setTimeRange('90')}
              />
            </View>
          </View>
          
          {/* Custom Chart */}
          <View style={styles.chartContainer}>
            <View style={styles.chartArea}>
              {/* Y-axis labels */}
              <View style={styles.yAxis}>
                <Text style={styles.yAxisLabel}>{maxScore}</Text>
                <Text style={styles.yAxisLabel}>{Math.round((maxScore + minScore) / 2)}</Text>
                <Text style={styles.yAxisLabel}>{minScore}</Text>
              </View>
              
              {/* Chart bars */}
              <View style={styles.barsContainer}>
                {mockHistory.map((item, index) => {
                  const heightPercent = ((item.score - minScore) / (maxScore - minScore)) * 100;
                  return (
                    <View key={index} style={styles.barWrapper}>
                      <View 
                        style={[
                          styles.bar,
                          { height: `${heightPercent}%` }
                        ]} 
                      />
                      <Text style={styles.barLabel}>{item.month}</Text>
                    </View>
                  );
                })}
              </View>
            </View>
          </View>
          
          <Text style={styles.trendInsight}>Relationship improving over 6 months</Text>
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
          <View style={styles.buttonSpacer} />
          <GCPButton
            title="Messages"
            onPress={() => {}}
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
    flex: 1,
    textAlign: 'center',
    marginHorizontal: spacing.sm,
  },
  placeholder: {
    width: 32,
  },
  scoreCard: {
    marginHorizontal: spacing.base,
    marginBottom: spacing.base,
    alignItems: 'center',
  },
  scoreContainer: {
    alignItems: 'center',
  },
  heartIcon: {
    fontSize: 40,
    marginBottom: spacing.sm,
  },
  scoreValue: {
    ...typography.numberLarge,
    color: colors.primary,
  },
  scoreLabel: {
    ...typography.h4,
    marginTop: spacing.xs,
  },
  listCard: {
    marginHorizontal: spacing.base,
    marginBottom: spacing.base,
  },
  sectionTitle: {
    ...typography.h4,
    marginBottom: spacing.base,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  checkIcon: {
    ...typography.body,
    color: colors.success,
    marginRight: spacing.sm,
    fontWeight: '600',
  },
  warningIcon: {
    marginRight: spacing.sm,
  },
  listText: {
    ...typography.body,
    flex: 1,
  },
  trendCard: {
    marginHorizontal: spacing.base,
    marginBottom: spacing.base,
  },
  trendHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.base,
  },
  timeRangeSelector: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  chartContainer: {
    marginVertical: spacing.base,
  },
  chartArea: {
    flexDirection: 'row',
    height: 150,
  },
  yAxis: {
    width: 30,
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingRight: spacing.xs,
  },
  yAxisLabel: {
    ...typography.caption,
  },
  barsContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    borderLeftWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  barWrapper: {
    alignItems: 'center',
    flex: 1,
  },
  bar: {
    width: 30,
    backgroundColor: colors.primary,
    borderRadius: 4,
    marginBottom: spacing.xs,
  },
  barLabel: {
    ...typography.caption,
  },
  trendInsight: {
    ...typography.bodySmall,
    textAlign: 'center',
    marginTop: spacing.base,
    color: colors.success,
  },
  actionButtons: {
    paddingHorizontal: spacing.base,
    paddingBottom: spacing.xxxl,
  },
  buttonSpacer: {
    height: spacing.sm,
  },
});

export default CompatibilityScreen;
