// CRMDashboardScreen - Client relationship management
// Business Pro Tier Feature

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GCPCard, GCPButton, GCPAvatar, GCPChip, GCPProgressBar } from '../../components/base';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

// Mock data
const mockPipeline = {
  hot: 5,
  warm: 12,
  cold: 8,
  stages: [
    { name: 'Lead', progress: 40 },
    { name: 'Prospect', progress: 55 },
    { name: 'Close', progress: 78 },
  ],
};

const mockFollowUps = [
  { name: 'Sarah Chen', status: 'hot', reason: 'No contact in 5 days', time: 'Today' },
  { name: 'Mike Torres', status: 'warm', reason: 'Proposal due today', time: 'Today' },
  { name: 'Jordan Lee', status: 'cold', reason: 'Meeting scheduled', time: 'Tomorrow' },
];

const mockActivity = [
  { type: 'message', name: 'Sarah Chen', action: 'New message received', time: '10 min ago' },
  { type: 'view', name: 'Client X', action: 'Proposal viewed', time: '1 hour ago' },
  { type: 'meeting', name: 'Mike Torres', action: 'Meeting accepted', time: '2 hours ago' },
  { type: 'message', name: 'Jordan Lee', action: 'New message received', time: '3 hours ago' },
];

const CRMDashboardScreen = ({ navigation }: any) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'hot': return colors.success;
      case 'warm': return colors.warning;
      case 'cold': return colors.error;
      default: return colors.textSecondary;
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'message': return '💬';
      case 'view': return '👁️';
      case 'meeting': return '📅';
      default: return '📌';
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>CRM Dashboard</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerIcon}>
              <Text style={styles.headerIconText}>🔍</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Pipeline Overview */}
        <GCPCard style={styles.pipelineCard}>
          <Text style={styles.sectionTitle}>Pipeline Overview</Text>
          
          {/* Status Counts */}
          <View style={styles.pipelineCounts}>
            <View style={styles.pipelineItem}>
              <View style={[styles.pipelineDot, { backgroundColor: colors.success }]} />
              <Text style={styles.pipelineLabel}>Hot</Text>
              <Text style={styles.pipelineCount}>{mockPipeline.hot}</Text>
            </View>
            <View style={styles.pipelineItem}>
              <View style={[styles.pipelineDot, { backgroundColor: colors.warning }]} />
              <Text style={styles.pipelineLabel}>Warm</Text>
              <Text style={styles.pipelineCount}>{mockPipeline.warm}</Text>
            </View>
            <View style={styles.pipelineItem}>
              <View style={[styles.pipelineDot, { backgroundColor: colors.error }]} />
              <Text style={styles.pipelineLabel}>Cold</Text>
              <Text style={styles.pipelineCount}>{mockPipeline.cold}</Text>
            </View>
          </View>

          {/* Stage Progress */}
          <View style={styles.stageContainer}>
            {mockPipeline.stages.map((stage, index) => (
              <View key={index} style={styles.stageItem}>
                <View style={styles.stageHeader}>
                  <Text style={styles.stageName}>{stage.name}</Text>
                  <Text style={styles.stagePercent}>{stage.progress}%</Text>
                </View>
                <View style={styles.stageBar}>
                  <View 
                    style={[
                      styles.stageFill, 
                      { width: `${stage.progress}%` }
                    ]} 
                  />
                </View>
              </View>
            ))}
          </View>
        </GCPCard>

        {/* Today's Follow-ups */}
        <GCPCard style={styles.followUpsCard}>
          <Text style={styles.sectionTitle}>Today's Follow-ups</Text>
          {mockFollowUps.map((followUp, index) => (
            <View key={index} style={styles.followUpItem}>
              <View style={styles.followUpStatus}>
                <View 
                  style={[
                    styles.statusDot, 
                    { backgroundColor: getStatusColor(followUp.status) }
                  ]} 
                />
              </View>
              <View style={styles.followUpInfo}>
                <Text style={styles.followUpName}>{followUp.name}</Text>
                <Text style={styles.followUpReason}>{followUp.reason}</Text>
              </View>
              <Text style={styles.followUpTime}>{followUp.time}</Text>
            </View>
          ))}
        </GCPCard>

        {/* Recent Activity */}
        <GCPCard style={styles.activityCard}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          {mockActivity.map((activity, index) => (
            <View key={index} style={styles.activityItem}>
              <Text style={styles.activityIcon}>{getActivityIcon(activity.type)}</Text>
              <View style={styles.activityInfo}>
                <Text style={styles.activityName}>{activity.name}</Text>
                <Text style={styles.activityAction}>{activity.action}</Text>
              </View>
              <Text style={styles.activityTime}>{activity.time}</Text>
            </View>
          ))}
        </GCPCard>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <GCPButton
            title="New Contact"
            onPress={() => {}}
            variant="primary"
            size="medium"
            style={styles.actionButton}
          />
          <GCPButton
            title="Campaign"
            onPress={() => navigation.navigate('Campaigns')}
            variant="secondary"
            size="medium"
            style={styles.actionButton}
          />
          <GCPButton
            title="Export"
            onPress={() => {}}
            variant="ghost"
            size="medium"
            style={styles.actionButton}
          />
          <GCPButton
            title="Report"
            onPress={() => navigation.navigate('BusinessAnalytics')}
            variant="ghost"
            size="medium"
            style={styles.actionButton}
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
  headerActions: {
    flexDirection: 'row',
    gap: spacing.sm,
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
  pipelineCard: {
    marginHorizontal: spacing.base,
    marginBottom: spacing.base,
  },
  sectionTitle: {
    ...typography.h4,
    marginBottom: spacing.base,
  },
  pipelineCounts: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.xl,
    paddingVertical: spacing.base,
    backgroundColor: colors.background,
    borderRadius: spacing.radiusMd,
  },
  pipelineItem: {
    alignItems: 'center',
  },
  pipelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginBottom: spacing.xs,
  },
  pipelineLabel: {
    ...typography.label,
    marginBottom: spacing.xxs,
  },
  pipelineCount: {
    ...typography.number,
    color: colors.textPrimary,
  },
  stageContainer: {
    gap: spacing.md,
  },
  stageItem: {
    marginBottom: spacing.sm,
  },
  stageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  stageName: {
    ...typography.label,
  },
  stagePercent: {
    ...typography.body,
    fontWeight: '600',
  },
  stageBar: {
    height: 8,
    backgroundColor: colors.background,
    borderRadius: 4,
    overflow: 'hidden',
  },
  stageFill: {
    height: '100%',
    backgroundColor: colors.tierBusiness,
    borderRadius: 4,
  },
  followUpsCard: {
    marginHorizontal: spacing.base,
    marginBottom: spacing.base,
  },
  followUpItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  followUpStatus: {
    marginRight: spacing.sm,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  followUpInfo: {
    flex: 1,
  },
  followUpName: {
    ...typography.body,
    fontWeight: '600',
  },
  followUpReason: {
    ...typography.bodySmall,
    marginTop: spacing.xxs,
  },
  followUpTime: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  activityCard: {
    marginHorizontal: spacing.base,
    marginBottom: spacing.base,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  activityIcon: {
    fontSize: 20,
    marginRight: spacing.sm,
  },
  activityInfo: {
    flex: 1,
  },
  activityName: {
    ...typography.body,
  },
  activityAction: {
    ...typography.bodySmall,
    marginTop: spacing.xxs,
  },
  activityTime: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.base,
    paddingBottom: spacing.xxxl,
    gap: spacing.sm,
  },
  actionButton: {
    width: '48%',
  },
});

export default CRMDashboardScreen;
