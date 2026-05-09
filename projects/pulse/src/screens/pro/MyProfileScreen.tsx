// MyProfileScreen - User's Big Five personality display
// Pro Tier Feature

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GCPCard, GCPButton, GCPAvatar } from '../../components/base';
import { OCEANChart, OCEANDimensionBar } from '../../components/features/OCEANChart';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

// Mock user data
const mockUserProfile = {
  name: 'You',
  openness: 72,
  conscientiousness: 68,
  extroversion: 58,
  agreeableness: 75,
  neuroticism: 45,
  confidence: 85,
  updatedAt: 'Today',
};

const MyProfileScreen = ({ navigation }: any) => {
  const handleViewTraits = () => {
    // Navigate to trait detail
  };

  const handleComparison = () => {
    navigation.navigate('Comparison');
  };

  const handleInsights = () => {
    navigation.navigate('Trends');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>My Profile</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerIcon}>
              <Text style={styles.headerIconText}>📊</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerIcon}>
              <Text style={styles.headerIconText}>📥</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Profile Header */}
        <GCPCard style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <GCPAvatar name={mockUserProfile.name} size="large" status="online" />
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{mockUserProfile.name} (Pro Member)</Text>
              <Text style={styles.profileDate}>Updated: {mockUserProfile.updatedAt}</Text>
            </View>
          </View>
          
          {/* Confidence Indicator */}
          <View style={styles.confidenceContainer}>
            <View style={styles.confidenceHeader}>
              <Text style={styles.confidenceLabel}>Analysis Confidence</Text>
              <Text style={styles.confidenceValue}>{mockUserProfile.confidence}%</Text>
            </View>
            <View style={styles.confidenceBar}>
              <View 
                style={[
                  styles.confidenceFill, 
                  { width: `${mockUserProfile.confidence}%` }
                ]} 
              />
            </View>
          </View>
        </GCPCard>

        {/* OCEAN Radar Chart */}
        <GCPCard style={styles.chartCard}>
          <Text style={styles.sectionTitle}>Personality Profile</Text>
          <OCEANChart
            openness={mockUserProfile.openness}
            conscientiousness={mockUserProfile.conscientiousness}
            extroversion={mockUserProfile.extroversion}
            agreeableness={mockUserProfile.agreeableness}
            neuroticism={mockUserProfile.neuroticism}
            showLabels={true}
          />
        </GCPCard>

        {/* OCEAN Dimension Bars */}
        <GCPCard style={styles.dimensionsCard}>
          <Text style={styles.sectionTitle}>Dimension Breakdown</Text>
          <OCEANDimensionBar
            label="Openness"
            value={mockUserProfile.openness}
            color={colors.ocean.openness}
          />
          <OCEANDimensionBar
            label="Conscientiousness"
            value={mockUserProfile.conscientiousness}
            color={colors.ocean.conscientiousness}
          />
          <OCEANDimensionBar
            label="Extroversion"
            value={mockUserProfile.extroversion}
            color={colors.ocean.extroversion}
          />
          <OCEANDimensionBar
            label="Agreeableness"
            value={mockUserProfile.agreeableness}
            color={colors.ocean.agreeableness}
          />
          <OCEANDimensionBar
            label="Neuroticism"
            value={mockUserProfile.neuroticism}
            color={colors.ocean.neuroticism}
          />
        </GCPCard>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <GCPButton
            title="View 30 Traits"
            onPress={handleViewTraits}
            variant="primary"
            size="medium"
            fullWidth
          />
          <View style={styles.buttonSpacer} />
          <GCPButton
            title="Comparison"
            onPress={handleComparison}
            variant="secondary"
            size="medium"
            fullWidth
          />
          <View style={styles.buttonSpacer} />
          <GCPButton
            title="Insights"
            onPress={handleInsights}
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
    ...typography.h2,
  },
  headerActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
    fontSize: 18,
  },
  profileCard: {
    marginHorizontal: spacing.base,
    marginBottom: spacing.base,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  profileInfo: {
    marginLeft: spacing.base,
    flex: 1,
  },
  profileName: {
    ...typography.h4,
  },
  profileDate: {
    ...typography.bodySmall,
    marginTop: spacing.xxs,
  },
  confidenceContainer: {
    marginTop: spacing.sm,
  },
  confidenceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  confidenceLabel: {
    ...typography.label,
  },
  confidenceValue: {
    ...typography.body,
    fontWeight: '600',
    color: colors.primary,
  },
  confidenceBar: {
    height: 8,
    backgroundColor: colors.background,
    borderRadius: 4,
    overflow: 'hidden',
  },
  confidenceFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
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
    alignSelf: 'flex-start',
  },
  dimensionsCard: {
    marginHorizontal: spacing.base,
    marginBottom: spacing.base,
  },
  actionButtons: {
    paddingHorizontal: spacing.base,
    paddingBottom: spacing.xxxl,
  },
  buttonSpacer: {
    height: spacing.sm,
  },
});

export default MyProfileScreen;
