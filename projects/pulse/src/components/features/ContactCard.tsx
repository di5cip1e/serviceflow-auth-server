// ContactCard Component
// Displays a contact in list with avatar, name, relationship score, and metadata

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { RelationshipScore } from './RelationshipScore';

interface ContactCardProps {
  name: string;
  avatar?: string;
  lastMessage?: string;
  lastContact: string;
  relationshipScore: number;
  messageCount: number;
  tags?: string[];
  onPress?: () => void;
  isPriority?: boolean;
}

export const ContactCard: React.FC<ContactCardProps> = ({
  name,
  avatar,
  lastMessage,
  lastContact,
  relationshipScore,
  messageCount,
  tags = [],
  onPress,
  isPriority = false,
}) => {
  const getScoreColor = (score: number) => {
    if (score >= 75) return colors.scoreExcellent;
    if (score >= 50) return colors.scoreGood;
    if (score >= 25) return colors.scoreFair;
    return colors.scorePoor;
  };

  return (
    <TouchableOpacity
      style={[styles.container, isPriority && styles.priorityContainer]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Avatar */}
      <View style={styles.avatarContainer}>
        {avatar ? (
          <Image source={{ uri: avatar }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarInitial}>
              {name.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
        {isPriority && <View style={styles.priorityBadge} />}
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.nameContainer}>
            {isPriority && <Text style={styles.star}>⭐ </Text>}
            <Text style={styles.name} numberOfLines={1}>
              {name}
            </Text>
          </View>
          <Text style={styles.lastContact}>{lastContact}</Text>
        </View>

        {lastMessage && (
          <Text style={styles.lastMessage} numberOfLines={1}>
            {lastMessage}
          </Text>
        )}

        <View style={styles.footer}>
          <View style={styles.tags}>
            {tags.slice(0, 2).map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
          <View style={styles.stats}>
            <Text style={styles.statText}>💬 {messageCount}</Text>
            <RelationshipScore score={relationshipScore} size="small" />
          </View>
        </View>
      </View>

      {/* Arrow */}
      <View style={styles.arrow}>
        <Text style={styles.arrowText}>▶</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: spacing.radiusMd,
    padding: spacing.cardPadding,
    marginHorizontal: spacing.screenPadding,
    marginVertical: spacing.gapXs,
    shadowColor: colors.shadow.sm,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  priorityContainer: {
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: spacing.md,
  },
  avatar: {
    width: spacing.avatarLg,
    height: spacing.avatarLg,
    borderRadius: spacing.radiusFull,
  },
  avatarPlaceholder: {
    width: spacing.avatarLg,
    height: spacing.avatarLg,
    borderRadius: spacing.radiusFull,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    ...typography.h3,
    color: colors.white,
  },
  priorityBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.success,
    borderWidth: 2,
    borderColor: colors.surface,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  star: {
    fontSize: 12,
  },
  name: {
    ...typography.h4,
    flex: 1,
  },
  lastContact: {
    ...typography.caption,
    marginLeft: spacing.sm,
  },
  lastMessage: {
    ...typography.bodySmall,
    marginBottom: spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tags: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  tag: {
    backgroundColor: colors.background,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: spacing.radiusSm,
  },
  tagText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  statText: {
    ...typography.caption,
  },
  arrow: {
    marginLeft: spacing.sm,
  },
  arrowText: {
    color: colors.textTertiary,
    fontSize: 12,
  },
});