// BusinessAnalyticsScreen - Analytics dashboard
// Business Pro Tier Feature

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GCPCard, GCPChip, GCPButton } from '../../components/base';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Mock data
const mockMetrics = [
  { label: 'Total Contacts', value: 247, change: 12, suffix: '' },
  { label: 'Active Conversations', value: 89, change: 8, suffix: '' },
  { label: 'Avg Response Time', value: 2.3, change: -15, suffix: 'h' },
  { label: 'Response Rate', value: 94, change: 3, suffix: '%' },
];

const mockEngagementData = [
  { month: 'Jan', value: 65 },
  { month: 'Feb', value: 72 },
  { month: 'Mar', value: 78 },
  { month: 'Apr', value: 85 },
  { month: 'May', value: 82 },
  { month: 'Jun', value: 89 },
];

const mockTopPerformers = [
  { name: 'Sarah Chen', score: 98, change: '+5' },
  { name: 'Mike Torres', score: 95, change: '+2' },
  { name: 'Jordan Lee', score: 92, change: '+8' },
  { name: 'Alex Kim', score: 88, change: '-3' },
];

const mockAtRisk = [
  { name: 'Alex Kim', reason: 'No contact in 14 days', status: 'cold' },
  { name: 'Taylor Swift', reason: 'Declining engagement', status: 'declining' },
];

const BusinessAnalyticsScreen = ({ navigation }: any) => {
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month');

  const maxValue = Math.max(...mockEngagementData.map(d => d.value));

  const handleExport = () => {
    // Export logic
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Analytics</Text>
          <TouchableOpacity onPress={() => setDateRange('month')}>
            <Text style={styles.dateButton}>📅</Text>
          </TouchableOpacity>
        </View>

        {/* Date Range Selector */}
        <View style={styles.dateRangeContainer}>
          <GCPChip 
            label="Week" 
            selected={dateRange === 'week'} 
            onPress={() => setDateRange('week')}
          />
          <GCPChip 
            label="Month" 
            selected={dateRange === 'month'} 
            onPress={() => setDateRange('month')}
          />
          <GCPChip 
            label="Quarter" 
            selected={dateRange === 'quarter'} 
            onPress={() => setDateRange('quarter')}
          />
          <GCPChip 
            label="Year" 
            selected={dateRange === 'year'} 
            onPress={() => setDateRange('year')}
          />
        </View>

        {/* Key Metrics */}
        <View style={styles.metricsGrid}>
          {mockMetrics.map((metric, index) => (
            <GCPCard key={index} style={styles.metricCard}>
              <Text style={styles.metricLabel}>{metric.label}</Text>
              <View style={styles.metricValueRow}>
                <Text style={styles.metricValue}>
                  {metric.value}{metric.suffix}
                </Text>
                <Text style={[
                  styles.metricChange,
                  metric.change > 0 ? styles.changePositive : styles.changeNegative
                ]}>
                  {metric.change > 0 ? '+' : ''}{metric.change}%
                </Text>
              </View>
            </GCPCard>
          ))}
        </View>

        {/* Engagement Over Time Chart */}
        <GCPCard style={styles.chartCard}>
          <Text style={styles.sectionTitle}>Engagement Over Time</Text>
          
          {/* Simple bar chart */}
          <View style={styles.chartContainer}>
            <View style={styles.chartYAxis}>
              <Text style={styles.yAxisLabel}>{maxValue}</Text>
              <Text style={styles.yAxisLabel}>{Math.round(maxValue / 2)}</Text>
              <Text style={styles.yAxisLabel}>0</Text>
            </View>
            <View style={styles.chartBars}>
              {mockEngagementData.map((item, index) => {
                const height = (item.value / maxValue) * 100;
                return (
                  <View key={index} style={styles.barWrapper}>
                    <View 
                      style={[
                        styles.chartBar, 
                        { height: `${height}%` }
                      ]} 
                    />
                    <Text style={styles.chartLabel}>{item.month}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        </GCPCard>

        {/* Top Performers */}
        <GCPCard style={styles.performersCard}>
          <Text style={styles.sectionTitle}>Top Performers</Text>
          {mockTopPerformers.map((performer, index) => (
            <View key={index} style={styles.performerItem}>
              <Text style={styles.performerRank}>{index + 1}.</Text>
              <View style={styles.performerInfo}>
                <Text style={styles.performerName}>{performer.name}</Text>
                <View style={styles.performerScoreBar}>
                  <View 
                    style={[
                      styles.performerScoreFill, 
                      { width: `${performer.score}%` }
                    ]} 
                  />
                </View>
              </View>
              <View style={styles.performerScoreContainer}>
                <Text style={styles.performerScore}>{performer.score}</Text>
                <Text style={[
                  styles.performerChange,
                  performer.change.startsWith('+') ? styles.changePositive : styles.changeNegative
                ]}>
                  {performer.change}
                </Text>
              </View>
            </View>
          ))}
        </GCPCard>

        {/* At-Risk Relationships */}
        <GCPCard style={styles.atRiskCard}>
          <Text style={styles.sectionTitle}>At-Risk Relationships</Text>
          {mockAtRisk.map((contact, index) => (
            <View key={index} style={styles.atRiskItem}>
              <View style={styles.atRiskIcon}>
                <Text style={styles.warningIcon}>⚠️</Text>
              </View>
              <View style={styles.atRiskInfo}>
                <Text style={styles.atRiskName}>{contact.name}</Text>
                <Text style={styles.atRiskReason}>{contact.reason}</Text>
              </View>
            </View>
          ))}
        </GCPCard>

        {/* Export Button */}
        <View style={styles.exportSection}>
          <GCPButton
            title="Export Report"
            onPress={handleExport}
            variant="primary"
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
    ...typography.h2,
  },
  dateButton: {
    fontSize: 20,
  },
  dateRangeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.base,
    marginBottom: spacing.base,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.base,
    gap: spacing.sm,
  },
  metricCard: {
    width: '48%',
    marginBottom: spacing.sm,
  },
  metricLabel: {
    ...typography.caption,
    marginBottom: spacing.xs,
  },
  metricValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  metricValue: {
    ...typography.number,
    marginRight: spacing.sm,
  },
  metricChange: {
    ...typography.bodySmall,
    fontWeight: '600',
  },
  changePositive: {
    color: colors.success,
  },
  changeNegative: {
    color: colors.error,
  },
  chartCard: {
    marginHorizontal: spacing.base,
    marginBottom: spacing.base,
  },
  sectionTitle: {
    ...typography.h4,
    marginBottom: spacing.base,
  },
  chartContainer: {
    flexDirection: 'row',
    height: 180,
  },
  chartYAxis: {
    width: 30,
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingRight: spacing.xs,
  },
  yAxisLabel: {
    ...typography.caption,
  },
  chartBars: {
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
  chartBar: {
    width: 28,
    backgroundColor: colors.tierBusiness,
    borderRadius: 4,
    marginBottom: spacing.xs,
  },
  chartLabel: {
    ...typography.caption,
  },
  performersCard: {
    marginHorizontal: spacing.base,
    marginBottom: spacing.base,
  },
  performerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  performerRank: {
    ...typography.body,
    fontWeight: '600',
    width: 24,
    color: colors.textSecondary,
  },
  performerInfo: {
    flex: 1,
    marginHorizontal: spacing.sm,
  },
  performerName: {
    ...typography.body,
    marginBottom: spacing.xs,
  },
  performerScoreBar: {
    height: 6,
    backgroundColor: colors.background,
    borderRadius: 3,
  },
  performerScoreFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
  performerScoreContainer: {
    alignItems: 'flex-end',
  },
  performerScore: {
    ...typography.body,
    fontWeight: '600',
  },
  performerChange: {
    ...typography.caption,
  },
  atRiskCard: {
    marginHorizontal: spacing.base,
    marginBottom: spacing.base,
  },
  atRiskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  atRiskIcon: {
    marginRight: spacing.sm,
  },
  warningIcon: {
    fontSize: 18,
  },
  atRiskInfo: {
    flex: 1,
  },
  atRiskName: {
    ...typography.body,
    fontWeight: '600',
  },
  atRiskReason: {
    ...typography.bodySmall,
    marginTop: spacing.xxs,
  },
  exportSection: {
    paddingHorizontal: spacing.base,
    paddingBottom: spacing.xxxl,
  },
});

export default BusinessAnalyticsScreen;
