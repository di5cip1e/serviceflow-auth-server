// MultiAccountScreen - Manage multiple accounts
// Business Pro Tier Feature

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GCPCard, GCPButton, GCPAvatar, GCPChip } from '../../components/base';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

// Mock data
const mockAccounts = [
  {
    id: '1',
    phone: '+1 555-0100',
    label: 'Personal',
    isActive: true,
    lastActive: 'Just now',
  },
  {
    id: '2',
    phone: '+1 555-0200',
    label: 'Business',
    isActive: false,
    lastActive: '2 hours ago',
  },
  {
    id: '3',
    phone: '+1 555-0300',
    label: 'Work',
    isActive: false,
    lastActive: 'Yesterday',
  },
];

const MultiAccountScreen = ({ navigation }: any) => {
  const activeAccount = mockAccounts.find(a => a.isActive);
  const linkedAccounts = mockAccounts.filter(a => !a.isActive);

  const handleSwitchAccount = (accountId: string) => {
    // Switch account logic
  };

  const handleAddAccount = () => {
    // Add account logic
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Accounts</Text>
          <TouchableOpacity onPress={handleAddAccount}>
            <Text style={styles.addButton}>+ Add</Text>
          </TouchableOpacity>
        </View>

        {/* Active Account */}
        <Text style={styles.sectionLabel}>Active Account</Text>
        <GCPCard style={styles.activeAccountCard}>
          <View style={styles.accountHeader}>
            <View style={styles.accountIcon}>
              <Text style={styles.accountIconText}>📱</Text>
            </View>
            <View style={styles.accountInfo}>
              <Text style={styles.accountPhone}>{activeAccount?.phone}</Text>
              <Text style={styles.accountLabel}>{activeAccount?.label}</Text>
            </View>
            <View style={styles.activeIndicator}>
              <View style={styles.activeDot} />
              <Text style={styles.activeText}>● Using now</Text>
            </View>
          </View>
          <View style={styles.accountFooter}>
            <Text style={styles.lastActive}>Last active: {activeAccount?.lastActive}</Text>
          </View>
        </GCPCard>

        {/* Linked Accounts */}
        <Text style={styles.sectionLabel}>Linked Accounts</Text>
        <View style={styles.linkedAccountsContainer}>
          {linkedAccounts.map((account) => (
            <GCPCard key={account.id} style={styles.linkedAccountCard}>
              <View style={styles.accountHeader}>
                <View style={styles.accountIcon}>
                  <Text style={styles.accountIconText}>📱</Text>
                </View>
                <View style={styles.accountInfo}>
                  <Text style={styles.accountPhone}>{account.phone}</Text>
                  <Text style={styles.accountLabel}>{account.label}</Text>
                </View>
              </View>
              <View style={styles.linkedAccountActions}>
                <Text style={styles.lastActive}>Last active: {account.lastActive}</Text>
                <GCPButton
                  title="Switch"
                  onPress={() => handleSwitchAccount(account.id)}
                  variant="ghost"
                  size="small"
                />
              </View>
            </GCPCard>
          ))}
        </View>

        {/* Add Account Button */}
        <View style={styles.addAccountSection}>
          <TouchableOpacity style={styles.addAccountButton} onPress={handleAddAccount}>
            <Text style={styles.addAccountIcon}>+</Text>
            <Text style={styles.addAccountText}>Add New Account</Text>
          </TouchableOpacity>
        </View>

        {/* Account Settings */}
        <GCPCard style={styles.settingsCard}>
          <Text style={styles.sectionTitle}>Account Settings</Text>
          <View style={styles.settingItem}>
            <Text style={styles.settingText}>• Separate profiles per account</Text>
          </View>
          <View style={styles.settingItem}>
            <Text style={styles.settingText}>• Cross-account search</Text>
          </View>
          <View style={styles.settingItem}>
            <Text style={styles.settingText}>• Unified notifications</Text>
          </View>
          <View style={styles.settingItem}>
            <Text style={styles.settingText}>• Shared contact discovery</Text>
          </View>
        </GCPCard>

        {/* Pro Feature Badge */}
        <View style={styles.proBadge}>
          <Text style={styles.proBadgeText}>Business Pro Feature</Text>
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
  sectionLabel: {
    ...typography.label,
    paddingHorizontal: spacing.base,
    marginBottom: spacing.sm,
    marginTop: spacing.base,
  },
  activeAccountCard: {
    marginHorizontal: spacing.base,
    marginBottom: spacing.base,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  accountHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  accountIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primaryLight + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  accountIconText: {
    fontSize: 24,
  },
  accountInfo: {
    flex: 1,
    marginLeft: spacing.base,
  },
  accountPhone: {
    ...typography.h4,
  },
  accountLabel: {
    ...typography.bodySmall,
    marginTop: spacing.xxs,
  },
  activeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.success,
    marginRight: spacing.xs,
  },
  activeText: {
    ...typography.caption,
    color: colors.success,
  },
  accountFooter: {
    marginTop: spacing.base,
    paddingTop: spacing.base,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  lastActive: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  linkedAccountsContainer: {
    paddingHorizontal: spacing.base,
    gap: spacing.sm,
  },
  linkedAccountCard: {
    marginBottom: spacing.sm,
  },
  linkedAccountActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  addAccountSection: {
    paddingHorizontal: spacing.base,
    marginBottom: spacing.base,
  },
  addAccountButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.base,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.border,
    borderRadius: spacing.radiusMd,
  },
  addAccountIcon: {
    fontSize: 24,
    color: colors.primary,
    marginRight: spacing.sm,
  },
  addAccountText: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600',
  },
  settingsCard: {
    marginHorizontal: spacing.base,
    marginBottom: spacing.base,
  },
  sectionTitle: {
    ...typography.h4,
    marginBottom: spacing.base,
  },
  settingItem: {
    paddingVertical: spacing.sm,
  },
  settingText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  proBadge: {
    alignItems: 'center',
    paddingBottom: spacing.xxxl,
  },
  proBadgeText: {
    ...typography.caption,
    color: colors.tierBusiness,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
});

export default MultiAccountScreen;
