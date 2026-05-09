// TrendsScreen - Historical analysis
// Pro Tier Feature

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GCPCard, GCPChip, GCPButton, GCPAvatar } from '../../components/base';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Mock data
const mockOceanTrends = [
  { dimension: 'Openness', current: 75, previous: 72, change: 3, color: colors.ocean.openness },
  { dimension: 'Conscientiousness', current: 67, previous: 68, change: -1, color: colors.ocean.conscientiousness },
  { dimension: 'Extroversion', current: 61, previous: 58, change: 3, color: colors.ocean.extroversion },
  { dimension: 'Agreeableness', current: 74, previous: 75, change: -1, color: colors.ocean.agreeableness },
  { dimension: 'Neuroticism', current: 42, previous: 45, change: -3, color: colors.ocean.neuroticism },
];

const mockTopRelationships = [
  { name: 'Sarah Chen', messages: 142, avatar: 'SC' },
  { name: 'Mike Torres', messages: 89, avatar: 'MT' },
  { name: 'Jordan Lee', messages: 67, avatar: 'JL' },
  { name: 'Alex Kim', messages: 45, avatar: 'AK' },
];

const mockMoodData = [
  { day: 'Mon', value: 7 },
  { day: 'Tue', value: 6 },
  { day: 'Wed', value: 8 },
  { day: 'Thu', value: 7 },
  { day: 'Fri', value: 8 },
  { day: 'Sat', value: 9 },
  { day: 'Sun', value: 7 },
];

const mockInsight = "You're becoming more outgoing and less anxious. Great progress!";

const TrendsScreen = ({ navigation }: any) => {
  const [timeRange, setTimeRange] = useState<'30' | '60' | '90'>('30');

  const maxMessages = Math.max(...mockTopRelationships.map(r => r.messages));

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Trends & Insights</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerIcon}>
              <Text style={styles.headerIconText}>📅</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Time Range Selector */}
        <View style={styles.timeRangeContainer}>
          <GCPChip 
            label="30 Days" 
            selected={timeRange === '30'} 
            onPress={() => setTimeRange('30')}
          />
          <GCPChip 
            label="60 Days" 
            selected={timeRange === '60'} 
            onPress={() => setTimeRange('60')}
          />
          <GCPChip 
            label="90 Days" 
            selected={timeRange === '90'} 
            onPress={() => setTimeRange('90')}
          />
        </View>

        {/* Your Profile Evolution */}
        <GCPCard style={styles.evolutionCard}>
          <Text style={styles.sectionTitle}>Your Profile Evolution</Text>
          {mockOceanTrends.map((item, index) => (
            <View key={index} style={styles.evolutionItem}>
              <View style={styles.evolutionInfo}>
                <View style={[styles.evolutionDot, { backgroundColor: item.color }]} />
                <Text style={styles.evolutionDimension}>{item.dimension}</Text>
              </View>
              <View style={styles.evolutionBar}>
                <View 
                  style={[
                    styles.evolutionFill, 
                    { width: `${item.current}%`, backgroundColor: item.color }
                  ]} 
                />
              </View>
              <View style={styles.evolutionScore}>
                <Text style={styles.evolutionCurrent}>{item.current}</Text>
                <Text style={[
                  styles.evolutionChange,
                  item.change > 0 ? styles.changePositive : item.change < 0 ? styles.changeNegative : styles.changeNeutral
                ]}>
                  {item.change > 0 ? '+' : ''}{item.change}
                </Text>
              </View>
            </View>
          ))}
        </GCPCard>

        {/* Top Relationships */}
        <GCPCard style={styles.relationshipsCard}>
          <Text style={styles.sectionTitle}>Top Relationships (by engagement)</Text>
          {mockTopRelationships.map((contact, index) => (
            <TouchableOpacity key={index} style={styles.relationshipItem}>
              <Text style={styles.rankNumber}>{index + 1}.</Text>
              <GCPAvatar name={contact.name} size="small" />
              <View style={styles.relationshipInfo}>
                <Text style={styles.relationshipName}>{contact.name}</Text>
                <View style={styles.relationshipBar}>
                  <View 
                    style={[
                      styles.relationshipFill, 
                      { width: `${(contact.messages / maxMessages) * 100}%` }
                    ]} 
                  />
                </View>
              </View>
              <Text style={styles.messageCount}>{contact.messages} msgs</Text>
            </TouchableOpacity>
          ))}
        </GCPCard>

        {/* Mood Trend */}
        <GCPCard style={styles.moodCard}>
          <Text style={styles.sectionTitle}>Mood Trend</Text>
          
          {/* Mood Graph */}
          <View style={styles.moodGraph}>
            {mockMoodData.map((item, index) => {
              const height = (item.value / 10) * 100;
              return (
                <View key={index} style={styles.moodBarWrapper}>
                  <View style={styles.moodBarContainer}>
                    <View 
                      style={[
                        styles.moodBar,
                        { height: `${height}%` }
                      ]} 
                    />
                  </View>
                  <Text style={styles.moodDayLabel}>{item.day}</Text>
                </View>
              );
            })}
          </View>
          
          <View style={styles.moodSummary}>
            <Text style={styles.moodAvgLabel}>Avg: 7.2</Text>
            <Text style={styles.moodChange}>+0.5</Text>
          </View>
          
          {/* Mood Emoji Display */}
          <View style={styles.moodEmojiContainer}>
            <Text style={styles.moodEmoji}>
              {"    /\\_/\\   \n     ( o.o )  \n      > ^ <  "}
            </Text>
          </View>
        </GCPCard>

        {/* AI Insight */}
        <GCPCard style={styles.insightCard}>
          <View style={styles.insightHeader}>
            <Text style={styles.insightIcon}>🤖</Text>
            <Text style={styles.insightTitle}>Key Insight</Text>
          </View>
          <Text style={styles.insightText}>{mockInsight}</Text>
        </GCPCard>

        {/* Action Button */}
        <View style={styles.actionButtons}>
          <GCPButton
            title="View Details"
            onPress={() => {}}
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
    ...typography.h3,
    flex: 1,
    textAlign: 'center',
  },
  headerActions: {
    flexDirection: 'row',
  },
  headerIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  headerIconText: {
    fontSize: 16,
  },
  timeRangeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.base,
    marginBottom: spacing.base,
  },
  evolutionCard: {
    marginHorizontal: spacing.base,
    marginBottom: spacing.base,
  },
  sectionTitle: {
    ...typography.h4,
    marginBottom: spacing.base,
  },
  evolutionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  evolutionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 120,
  },
  evolutionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.sm,
  },
  evolutionDimension: {
    ...typography.label,
  },
  evolutionBar: {
    flex: 1,
    height: 8,
    backgroundColor: colors.background,
    borderRadius: 4,
    marginRight: spacing.sm,
  },
  evolutionFill: {
    height: '100%',
    borderRadius: 4,
  },
  evolutionScore: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 60,
  },
  evolutionCurrent: {
    ...typography.body,
    fontWeight: '600',
    marginRight: spacing.xs,
  },
  evolutionChange: {
    ...typography.caption,
  },
  changePositive: {
    color: colors.success,
  },
  changeNegative: {
    color: colors.error,
  },
  changeNeutral: {
    color: colors.textTertiary,
  },
  relationshipsCard: {
    marginHorizontal: spacing.base,
    marginBottom: spacing.base,
  },
  relationshipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  rankNumber: {
    ...typography.body,
    fontWeight: '600',
    width: 24,
    color: colors.textSecondary,
  },
  relationshipInfo: {
    flex: 1,
    marginHorizontal: spacing.sm,
  },
  relationshipName: {
    ...typography.body,
    marginBottom: spacing.xs,
  },
  relationshipBar: {
    height: 6,
    backgroundColor: colors.background,
    borderRadius: 3,
  },
  relationshipFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
  messageCount: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  moodCard: {
    marginHorizontal: spacing.base,
    marginBottom: spacing.base,
  },
  moodGraph: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: 120,
    marginBottom: spacing.base,
  },
  moodBarWrapper: {
    alignItems: 'center',
    flex: 1,
  },
  moodBarContainer: {
    flex: 1,
    width: 20,
    justifyContent: 'flex-end',
    backgroundColor: colors.background,
    borderRadius: 4,
  },
  moodBar: {
    width: '100%',
    backgroundColor: colors.mood.happy,
    borderRadius: 4,
  },
  moodDayLabel: {
    ...typography.caption,
    marginTop: spacing.xs,
  },
  moodSummary: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.base,
  },
  moodAvgLabel: {
    ...typography.body,
    fontWeight: '600',
    marginRight: spacing.sm,
  },
  moodChange: {
    ...typography.bodySmall,
    color: colors.success,
  },
  moodEmojiContainer: {
    alignItems: 'center',
    paddingVertical: spacing.base,
    backgroundColor: colors.background,
    borderRadius: spacing.radiusMd,
  },
  moodEmoji: {
    fontSize: 12,
    lineHeight: 14,
    fontFamily: 'monospace',
    color: colors.textSecondary,
  },
  insightCard: {
    marginHorizontal: spacing.base,
    marginBottom: spacing.base,
    backgroundColor: colors.secondaryLight + '15',
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  insightIcon: {
    fontSize: 20,
    marginRight: spacing.sm,
  },
  insightTitle: {
    ...typography.label,
    color: colors.secondary,
  },
  insightText: {
    ...typography.body,
    color: colors.textPrimary,
  },
  actionButtons: {
    paddingHorizontal: spacing.base,
    paddingBottom: spacing.xxxl,
  },
});

export default TrendsScreen;
