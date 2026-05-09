// CampaignsScreen - Bulk messaging
// Business Pro Tier Feature

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GCPCard, GCPButton, GCPProgressBar, GCPChip } from '../../components/base';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

// Mock data
const mockActiveCampaigns = [
  {
    id: '1',
    name: 'Q1 Product Launch',
    status: 'sending',
    progress: 156,
    total: 200,
    startTime: '9:00 AM',
    endTime: '9:15 AM',
  },
];

const mockScheduledCampaigns = [
  {
    id: '2',
    name: "Valentine's Day Promo",
    audience: 150,
    scheduledTime: '9:00 AM',
    scheduledDate: 'Feb 14',
  },
  {
    id: '3',
    name: 'Spring Sale Announcement',
    audience: 200,
    scheduledTime: '10:00 AM',
    scheduledDate: 'Mar 20',
  },
];

const mockPastCampaigns = [
  {
    id: '4',
    name: 'Holiday Sale 2024',
    sentTo: 189,
    delivered: 185,
    successRate: 98,
    status: 'completed',
  },
  {
    id: '5',
    name: 'New Feature Announcement',
    sentTo: 247,
    delivered: 247,
    successRate: 100,
    status: 'completed',
  },
  {
    id: '6',
    name: 'Customer Feedback Request',
    sentTo: 150,
    delivered: 142,
    successRate: 95,
    status: 'completed',
  },
];

const CampaignsScreen = ({ navigation }: any) => {
  const [activeTab, setActiveTab] = useState<'active' | 'scheduled' | 'past'>('active');

  const handleNewCampaign = () => {
    // Create new campaign
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sending': return colors.primary;
      case 'completed': return colors.success;
      case 'scheduled': return colors.warning;
      default: return colors.textSecondary;
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
          <Text style={styles.title}>Campaigns</Text>
          <TouchableOpacity onPress={handleNewCampaign}>
            <Text style={styles.addButton}>+ New</Text>
          </TouchableOpacity>
        </View>

        {/* Active Campaigns */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Active Campaigns</Text>
          {mockActiveCampaigns.map((campaign) => (
            <GCPCard key={campaign.id} style={styles.campaignCard}>
              <View style={styles.campaignHeader}>
                <View style={styles.campaignIcon}>
                  <Text style={styles.campaignIconText}>📣</Text>
                </View>
                <View style={styles.campaignInfo}>
                  <Text style={styles.campaignName}>{campaign.name}</Text>
                  <View style={styles.campaignStatus}>
                    <View style={[styles.statusDot, { backgroundColor: getStatusColor(campaign.status) }]} />
                    <Text style={styles.statusText}>Status: {campaign.status}</Text>
                  </View>
                </View>
              </View>
              
              <View style={styles.progressSection}>
                <View style={styles.progressHeader}>
                  <Text style={styles.progressText}>
                    Progress: {campaign.progress}/{campaign.total}
                  </Text>
                  <Text style={styles.progressPercent}>
                    {Math.round((campaign.progress / campaign.total) * 100)}%
                  </Text>
                </View>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { width: `${(campaign.progress / campaign.total) * 100}%` }
                    ]} 
                  />
                </View>
              </View>

              <View style={styles.campaignTiming}>
                <Text style={styles.timingText}>
                  Sent: {campaign.startTime} · Completes: {campaign.endTime}
                </Text>
              </View>

              <View style={styles.campaignActions}>
                <TouchableOpacity style={styles.actionButton}>
                  <Text style={styles.actionButtonText}>Pause</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                  <Text style={styles.actionButtonText}>View Details</Text>
                </TouchableOpacity>
              </View>
            </GCPCard>
          ))}
        </View>

        {/* Scheduled Campaigns */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Scheduled</Text>
          {mockScheduledCampaigns.map((campaign) => (
            <GCPCard key={campaign.id} style={styles.campaignCard}>
              <View style={styles.campaignHeader}>
                <View style={styles.campaignIcon}>
                  <Text style={styles.campaignIconText}>📅</Text>
                </View>
                <View style={styles.campaignInfo}>
                  <Text style={styles.campaignName}>{campaign.name}</Text>
                  <View style={styles.campaignStatus}>
                    <View style={[styles.statusDot, { backgroundColor: colors.warning }]} />
                    <Text style={styles.statusText}>Scheduled</Text>
                  </View>
                </View>
              </View>

              <View style={styles.scheduleDetails}>
                <View style={styles.scheduleItem}>
                  <Text style={styles.scheduleLabel}>Audience:</Text>
                  <Text style={styles.scheduleValue}>{campaign.audience} contacts</Text>
                </View>
                <View style={styles.scheduleItem}>
                  <Text style={styles.scheduleLabel}>Scheduled:</Text>
                  <Text style={styles.scheduleValue}>{campaign.scheduledDate} at {campaign.scheduledTime}</Text>
                </View>
              </View>

              <View style={styles.campaignActions}>
                <TouchableOpacity style={styles.actionButton}>
                  <Text style={styles.actionButtonText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                  <Text style={styles.actionButtonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </GCPCard>
          ))}
        </View>

        {/* Past Campaigns */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Past Campaigns</Text>
          {mockPastCampaigns.map((campaign) => (
            <GCPCard key={campaign.id} style={styles.campaignCard}>
              <View style={styles.campaignHeader}>
                <View style={styles.campaignIcon}>
                  <Text style={styles.campaignIconText}>✅</Text>
                </View>
                <View style={styles.campaignInfo}>
                  <Text style={styles.campaignName}>{campaign.name}</Text>
                  <View style={styles.successBadge}>
                    <Text style={styles.successRate}>✅ {campaign.successRate}%</Text>
                  </View>
                </View>
              </View>

              <View style={styles.deliveryStats}>
                <Text style={styles.deliveryText}>
                  Sent to {campaign.sentTo} · {campaign.delivered} delivered
                </Text>
              </View>

              <View style={styles.campaignActions}>
                <TouchableOpacity style={styles.actionButton}>
                  <Text style={styles.actionButtonText}>View Report</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                  <Text style={styles.actionButtonText}>Duplicate</Text>
                </TouchableOpacity>
              </View>
            </GCPCard>
          ))}
        </View>

        {/* Create New Campaign Button */}
        <View style={styles.addSection}>
          <GCPButton
            title="Create New Campaign"
            onPress={handleNewCampaign}
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
  addButton: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600',
  },
  section: {
    marginBottom: spacing.base,
  },
  sectionLabel: {
    ...typography.label,
    paddingHorizontal: spacing.base,
    marginBottom: spacing.sm,
  },
  campaignCard: {
    marginHorizontal: spacing.base,
    marginBottom: spacing.sm,
  },
  campaignHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.base,
  },
  campaignIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primaryLight + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  campaignIconText: {
    fontSize: 20,
  },
  campaignInfo: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  campaignName: {
    ...typography.h4,
    marginBottom: spacing.xs,
  },
  campaignStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.xs,
  },
  statusText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  progressSection: {
    marginBottom: spacing.base,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  progressText: {
    ...typography.bodySmall,
  },
  progressPercent: {
    ...typography.body,
    fontWeight: '600',
    color: colors.primary,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.background,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  campaignTiming: {
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  timingText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  scheduleDetails: {
    marginBottom: spacing.base,
  },
  scheduleItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
  scheduleLabel: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  scheduleValue: {
    ...typography.body,
    fontWeight: '500',
  },
  successBadge: {
    alignSelf: 'flex-start',
  },
  successRate: {
    ...typography.body,
    fontWeight: '600',
    color: colors.success,
  },
  deliveryStats: {
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginBottom: spacing.sm,
  },
  deliveryText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  campaignActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
  },
  actionButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  actionButtonText: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: '500',
  },
  addSection: {
    paddingHorizontal: spacing.base,
    paddingBottom: spacing.xxxl,
  },
});

export default CampaignsScreen;
