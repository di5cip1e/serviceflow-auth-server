// RelationshipScore Component
// Displays relationship score as colored badge

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

interface RelationshipScoreProps {
  score: number;
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
}

export const RelationshipScore: React.FC<RelationshipScoreProps> = ({
  score,
  size = 'medium',
  showLabel = false,
}) => {
  const getScoreColor = (scoreValue: number) => {
    if (scoreValue >= 75) return colors.scoreExcellent;
    if (scoreValue >= 50) return colors.scoreGood;
    if (scoreValue >= 25) return colors.scoreFair;
    return colors.scorePoor;
  };

  const getScoreLabel = (scoreValue: number) => {
    if (scoreValue >= 75) return 'Excellent';
    if (scoreValue >= 50) return 'Good';
    if (scoreValue >= 25) return 'Fair';
    return 'Needs Work';
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          container: { width: 24, height: 24, borderRadius: 12 },
          text: { ...typography.caption, fontSize: 10 },
        };
      case 'large':
        return {
          container: { width: 48, height: 48, borderRadius: 24 },
          text: { ...typography.h3 },
        };
      default:
        return {
          container: { width: 32, height: 32, borderRadius: 16 },
          text: { ...typography.bodySmall, fontWeight: '600' },
        };
    }
  };

  const scoreColor = getScoreColor(score);
  const sizeStyles = getSizeStyles();

  return (
    <View style={styles.wrapper}>
      <View
        style={[
          styles.container,
          sizeStyles.container,
          { backgroundColor: scoreColor },
        ]}
      >
        <Text style={[styles.text, sizeStyles.text, { color: colors.white }]}>
          {score}
        </Text>
      </View>
      {showLabel && (
        <Text style={[styles.label, { color: scoreColor }]}>
          {getScoreLabel(score)}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: colors.white,
  },
  label: {
    ...typography.bodySmall,
    fontWeight: '500',
  },
});