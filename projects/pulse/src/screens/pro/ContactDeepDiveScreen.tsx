// ContactDeepDiveScreen - Full contact analytics
// Pro Tier Feature

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GCPCard, GCPButton, GCPAvatar, GCPChip, GCPProgressBar } from '../../components/base';
import { OCEANDimensionBar } from '../../components/features/OCEANChart';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

// Mock contact data
const mockContact = {
  id: '1',
  name: 'Sarah Chen',
  phone: '+1 555-0123',
  lastContact: '2 hours ago',
  avatar: 'SC',
  tags: ['Close Friend', 'Work'],
  ocean: {
    openness: 72,
    conscientiousness: 65,
    extroversion: 78,
    agreeableness: 71,
    neuroticism: 38,
  },
  communicationStyle: {
    preferred: 'Casual, emoji-rich',
    responseTime: 'Quick (< 30 min)',
    initiationBalance: '60% you / 40% them',
  },
  bridgeTip: 'They value directness. Consider being more straightforward.',
  recentMessages: [
    { id: '1', content: "Hey! Are we still on for lunch?", time: '12:34 PM', from: 'them', platform: 'WhatsApp' },
    { id: '2', content: "Yes! Looking forward to it 🎉", time: '12:36 PM', from: 'you', platform: 'WhatsApp' },
    { id: '3', content: "Great! See you at 1pm", time: '12:38 PM', from: 'them', platform: 'WhatsApp' },
  ],
};

const ContactDeepDiveScreen = ({ navigation, route }: any) => {
  const contact = route?.params?.contact || mockContact;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title} numberOfLines={1}>{contact.name}</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerIcon}>
              <Text style={styles.headerIconText}>📊</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerIcon}>
              <Text style={styles.headerIconText}>📝</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Contact Info Card */}
        <GCPCard style={styles.contactCard}>
          <View style={styles.contactHeader}>
            <GCPAvatar name={contact.name} size="large" />
            <View style={styles.contactInfo}>
              <Text style={styles.contactName}>{contact.name}</Text>
              <Text style={styles.contactPhone}>{contact.phone}</Text>
              <Text style={styles.contactLast}>Last: {contact.lastContact}</Text>
            </View>
          </View>
          <View style={styles.tagsContainer}>
            {contact.tags.map((tag: string, index: number) => (
              <GCPChip key={index} label={tag} />
            ))}
          </View>
        </GCPCard>

        {/* OCEAN Profile */}
        <GCPCard style={styles.oceanCard}>
          <Text style={styles.sectionTitle}>OCEAN Profile</Text>
          <OCEANDimensionBar
            label="Openness"
            value={contact.ocean.openness}
            color={colors.ocean.openness}
          />
          <OCEANDimensionBar
            label="Conscientiousness"
            value={contact.ocean.conscientiousness}
            color={colors.ocean.conscientiousness}
          />
          <OCEANDimensionBar
            label="Extroversion"
            value={contact.ocean.extroversion}
            color={colors.ocean.extroversion}
          />
          <OCEANDimensionBar
            label="Agreeableness"
            value={contact.ocean.agreeableness}
            color={colors.ocean.agreeableness}
          />
          <OCEANDimensionBar
            label="Neuroticism"
            value={contact.ocean.neuroticism}
            color={colors.ocean.neuroticism}
          />
        </GCPCard>

        {/* Communication Style */}
        <GCPCard style={styles.commStyleCard}>
          <Text style={styles.sectionTitle}>Communication Style</Text>
          <View style={styles.commStyleItem}>
            <Text style={styles.commStyleLabel}>Prefers:</Text>
            <Text style={styles.commStyleValue}>{contact.communicationStyle.preferred}</Text>
          </View>
          <View style={styles.commStyleItem}>
            <Text style={styles.commStyleLabel}>Response:</Text>
            <Text style={styles.commStyleValue}>{contact.communicationStyle.responseTime}</Text>
          </View>
          <View style={styles.commStyleItem}>
            <Text style={styles.commStyleLabel}>Initiation:</Text>
            <Text style={styles.commStyleValue}>{contact.communicationStyle.initiationBalance}</Text>
          </View>
        </GCPCard>

        {/* Bridge Tip */}
        <GCPCard style={styles.bridgeCard}>
          <View style={styles.bridgeHeader}>
            <Text style={styles.bridgeIcon}>💡</Text>
            <Text style={styles.bridgeTitle}>Bridge Tip</Text>
          </View>
          <Text style={styles.bridgeText}>{contact.bridgeTip}</Text>
        </GCPCard>

        {/* Message History Timeline */}
        <View style={styles.timelineSection}>
          <Text style={styles.sectionTitle}>Message History</Text>
          <View style={styles.timeline}>
            {contact.recentMessages.map((message: any, index: number) => (
              <View 
                key={message.id} 
                style={[
                  styles.messageItem,
                  message.from === 'you' ? styles.messageRight : styles.messageLeft
                ]}
              >
                <View style={[
                  styles.messageBubble,
                  message.from === 'you' ? styles.bubbleRight : styles.bubbleLeft
                ]}>
                  <Text style={styles.messageContent}>{message.content}</Text>
                  <View style={styles.messageMeta}>
                    <Text style={styles.messageTime}>{message.time}</Text>
                    <Text style={styles.messagePlatform}>{message.platform}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <GCPButton
            title="Messages"
            onPress={() => {}}
            variant="primary"
            size="small"
          />
          <GCPButton
            title="Calls"
            onPress={() => {}}
            variant="ghost"
            size="small"
          />
          <GCPButton
            title="Compare"
            onPress={() => navigation.navigate('Comparison', { contact })}
            variant="ghost"
            size="small"
          />
          <GCPButton
            title="Trends"
            onPress={() => navigation.navigate('Trends')}
            variant="ghost"
            size="small"
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
  contactCard: {
    marginHorizontal: spacing.base,
    marginBottom: spacing.base,
  },
  contactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contactInfo: {
    marginLeft: spacing.base,
    flex: 1,
  },
  contactName: {
    ...typography.h4,
  },
  contactPhone: {
    ...typography.bodySmall,
    marginTop: spacing.xxs,
  },
  contactLast: {
    ...typography.caption,
    marginTop: spacing.xxs,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.base,
  },
  oceanCard: {
    marginHorizontal: spacing.base,
    marginBottom: spacing.base,
  },
  sectionTitle: {
    ...typography.h4,
    marginBottom: spacing.base,
  },
  commStyleCard: {
    marginHorizontal: spacing.base,
    marginBottom: spacing.base,
  },
  commStyleItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  commStyleLabel: {
    ...typography.label,
  },
  commStyleValue: {
    ...typography.body,
    flex: 1,
    textAlign: 'right',
  },
  bridgeCard: {
    marginHorizontal: spacing.base,
    marginBottom: spacing.base,
    backgroundColor: colors.primaryLight + '15',
  },
  bridgeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  bridgeIcon: {
    fontSize: 20,
    marginRight: spacing.sm,
  },
  bridgeTitle: {
    ...typography.label,
    color: colors.primary,
  },
  bridgeText: {
    ...typography.body,
    color: colors.textPrimary,
  },
  timelineSection: {
    marginHorizontal: spacing.base,
    marginBottom: spacing.base,
  },
  timeline: {
    gap: spacing.md,
  },
  messageItem: {
    marginVertical: spacing.xs,
  },
  messageLeft: {
    alignItems: 'flex-start',
  },
  messageRight: {
    alignItems: 'flex-end',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: spacing.md,
    borderRadius: spacing.radiusLg,
  },
  bubbleLeft: {
    backgroundColor: colors.surface,
    borderBottomLeftRadius: spacing.xs,
  },
  bubbleRight: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: spacing.xs,
  },
  messageContent: {
    ...typography.body,
    color: colors.textPrimary,
  },
  messageMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
    gap: spacing.base,
  },
  messageTime: {
    ...typography.caption,
  },
  messagePlatform: {
    ...typography.caption,
    color: colors.primary,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: spacing.base,
    paddingBottom: spacing.xxxl,
  },
});

export default ContactDeepDiveScreen;
