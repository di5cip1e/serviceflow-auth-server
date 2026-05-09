// MoodTracker Component
// Mood slider with emoji endpoints and optional journal entry

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

interface MoodTrackerProps {
  currentScore?: number;
  onScoreChange?: (score: number) => void;
  onJournalSubmit?: (text: string) => void;
  showJournal?: boolean;
  isEditable?: boolean;
}

const moodEmojis = ['😢', '😕', '😐', '🙂', '😊', '😄', '🤩'];
const moodLabels = ['Very Low', 'Low', 'Neutral', 'Okay', 'Good', 'Great', 'Amazing'];

export const MoodTracker: React.FC<MoodTrackerProps> = ({
  currentScore = 5,
  onScoreChange,
  onJournalSubmit,
  showJournal = true,
  isEditable = true,
}) => {
  const [score, setScore] = useState(currentScore);
  const [journalText, setJournalText] = useState('');
  const [showJournalInput, setShowJournalInput] = useState(false);

  const handleScoreChange = (newScore: number) => {
    if (!isEditable) return;
    setScore(newScore);
    onScoreChange?.(newScore);
  };

  const handleJournalSubmit = () => {
    if (journalText.trim()) {
      onJournalSubmit?.(journalText);
      setJournalText('');
      setShowJournalInput(false);
    }
  };

  const getCurrentEmoji = () => moodEmojis[Math.min(Math.max(0, score - 1), moodEmojis.length - 1)];
  const getCurrentLabel = () => moodLabels[Math.min(Math.max(0, score - 1), moodLabels.length - 1)];

  return (
    <View style={styles.container}>
      {/* Current Mood Display */}
      <View style={styles.currentMood}>
        <Text style={styles.currentEmoji}>{getCurrentEmoji()}</Text>
        <Text style={styles.currentLabel}>{getCurrentLabel()}</Text>
        <Text style={styles.currentScore}>{score}/10</Text>
      </View>

      {/* Mood Slider */}
      <View style={styles.sliderContainer}>
        <View style={styles.sliderTrack}>
          {/* Gradient background */}
          <View style={styles.gradientBackground} />
          
          {/* Slider thumb */}
          <View
            style={[
              styles.sliderThumb,
              { left: `${((score - 1) / 6) * 100}%` },
            ]}
          />
          
          {/* Touchable area */}
          {isEditable && (
            <View style={styles.sliderTouchArea}>
              {[1, 2, 3, 4, 5, 6, 7].map((value) => (
                <TouchableOpacity
                  key={value}
                  style={styles.sliderTouchPoint}
                  onPress={() => handleScoreChange(value)}
                  activeOpacity={0.7}
                />
              ))}
            </View>
          )}
        </View>

        {/* Emoji labels */}
        <View style={styles.emojiLabels}>
          {moodEmojis.map((emoji, index) => (
            <TouchableOpacity
              key={index}
              style={styles.emojiButton}
              onPress={() => isEditable && handleScoreChange(index + 1)}
              disabled={!isEditable}
            >
              <Text
                style={[
                  styles.emojiLabel,
                  score === index + 1 && styles.emojiLabelActive,
                ]}
              >
                {emoji}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Quick triggers */}
      {showJournal && isEditable && (
        <View style={styles.triggers}>
          <Text style={styles.triggerTitle}>What triggered this?</Text>
          <View style={styles.triggerChips}>
            {['Work', 'Social', 'Family', 'Health', 'Fitness', 'Self-care'].map(
              (trigger) => (
                <TouchableOpacity
                  key={trigger}
                  style={styles.triggerChip}
                  onPress={() => {
                    // Handle trigger selection
                  }}
                >
                  <Text style={styles.triggerChipText}>{trigger}</Text>
                </TouchableOpacity>
              )
            )}
          </View>
        </View>
      )}

      {/* Journal Entry */}
      {showJournal && (
        <View style={styles.journalSection}>
          <TouchableOpacity
            style={styles.journalToggle}
            onPress={() => setShowJournalInput(!showJournalInput)}
          >
            <Text style={styles.journalToggleText}>
              {showJournalInput ? 'Hide Journal' : 'Add Journal Entry'}
            </Text>
            <Text style={styles.journalToggleIcon}>
              {showJournalInput ? '▲' : '▼'}
            </Text>
          </TouchableOpacity>

          {showJournalInput && (
            <View style={styles.journalInputContainer}>
              <TextInput
                style={styles.journalInput}
                placeholder="How are you feeling? What's on your mind?"
                placeholderTextColor={colors.textTertiary}
                multiline
                numberOfLines={4}
                value={journalText}
                onChangeText={setJournalText}
                editable={isEditable}
              />
              <TouchableOpacity
                style={[
                  styles.submitButton,
                  !journalText.trim() && styles.submitButtonDisabled,
                ]}
                onPress={handleJournalSubmit}
                disabled={!journalText.trim() || !isEditable}
              >
                <Text style={styles.submitButtonText}>Save Entry</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

// Mood Calendar Day Component
export const MoodCalendarDay: React.FC<{
  date: string;
  score?: number;
  isToday?: boolean;
  isSelected?: boolean;
  onPress?: () => void;
}> = ({ date, score, isToday, isSelected, onPress }) => {
  const getMoodColor = (moodScore: number) => {
    if (moodScore <= 2) return colors.mood.sad;
    if (moodScore <= 5) return colors.mood.neutral;
    return colors.mood.happy;
  };

  const getMoodEmoji = (moodScore: number) => {
    if (moodScore <= 2) return '😢';
    if (moodScore <= 4) return '😐';
    if (moodScore <= 6) return '🙂';
    if (moodScore <= 8) return '😊';
    return '🤩';
  };

  return (
    <TouchableOpacity
      style={[
        styles.calendarDay,
        isToday && styles.calendarDayToday,
        isSelected && styles.calendarDaySelected,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text
        style={[
          styles.calendarDayText,
          isToday && styles.calendarDayTextToday,
        ]}
      >
        {date}
      </Text>
      {score !== undefined && (
        <Text style={styles.calendarDayEmoji}>
          {getMoodEmoji(score)}
        </Text>
      )}
    </TouchableOpacity>
  );
};

// Mood Stats Card
export const MoodStatsCard: React.FC<{
  averageMood: number;
  streak: number;
  totalEntries: number;
  trend: 'up' | 'down' | 'stable';
}> = ({ averageMood, streak, totalEntries, trend }) => {
  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return '📈';
      case 'down':
        return '📉';
      default:
        return '➡️';
    }
  };

  return (
    <View style={styles.statsCard}>
      <View style={styles.statItem}>
        <Text style={styles.statValue}>{averageMood.toFixed(1)}</Text>
        <Text style={styles.statLabel}>Avg Mood</Text>
      </View>
      <View style={styles.statDivider} />
      <View style={styles.statItem}>
        <Text style={styles.statValue}>🔥 {streak}</Text>
        <Text style={styles.statLabel}>Day Streak</Text>
      </View>
      <View style={styles.statDivider} />
      <View style={styles.statItem}>
        <Text style={styles.statValue}>{totalEntries}</Text>
        <Text style={styles.statLabel}>Total Entries</Text>
      </View>
      <View style={styles.statDivider} />
      <View style={styles.statItem}>
        <Text style={styles.statValue}>{getTrendIcon()}</Text>
        <Text style={styles.statLabel}>Trend</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: spacing.screenPadding,
  },
  currentMood: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  currentEmoji: {
    fontSize: 64,
    marginBottom: spacing.sm,
  },
  currentLabel: {
    ...typography.h3,
    marginBottom: spacing.xs,
  },
  currentScore: {
    ...typography.bodySmall,
  },
  sliderContainer: {
    marginBottom: spacing.xl,
  },
  sliderTrack: {
    height: 40,
    backgroundColor: colors.background,
    borderRadius: spacing.radiusFull,
    position: 'relative',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  gradientBackground: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: colors.mood.sad,
    opacity: 0.2,
    borderRadius: spacing.radiusFull,
  },
  sliderThumb: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    marginLeft: -16,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  sliderTouchArea: {
    position: 'absolute',
    flexDirection: 'row',
    left: 10,
    right: 10,
    justifyContent: 'space-between',
  },
  sliderTouchPoint: {
    width: 30,
    height: 40,
  },
  emojiLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.md,
  },
  emojiButton: {
    alignItems: 'center',
  },
  emojiLabel: {
    fontSize: 20,
    opacity: 0.5,
  },
  emojiLabelActive: {
    opacity: 1,
    transform: [{ scale: 1.2 }],
  },
  triggers: {
    marginBottom: spacing.lg,
  },
  triggerTitle: {
    ...typography.label,
    marginBottom: spacing.sm,
  },
  triggerChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  triggerChip: {
    backgroundColor: colors.background,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: spacing.radiusFull,
    borderWidth: 1,
    borderColor: colors.border,
  },
  triggerChipText: {
    ...typography.bodySmall,
  },
  journalSection: {
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    paddingTop: spacing.lg,
  },
  journalToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  journalToggleText: {
    ...typography.body,
    fontWeight: '500',
    color: colors.primary,
  },
  journalToggleIcon: {
    fontSize: 12,
    color: colors.primary,
  },
  journalInputContainer: {
    marginTop: spacing.md,
  },
  journalInput: {
    backgroundColor: colors.background,
    borderRadius: spacing.radiusMd,
    padding: spacing.md,
    minHeight: 100,
    textAlignVertical: 'top',
    ...typography.body,
  },
  submitButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: spacing.radiusMd,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  submitButtonDisabled: {
    backgroundColor: colors.textTertiary,
  },
  submitButtonText: {
    ...typography.button,
    color: colors.white,
  },
  // Calendar styles
  calendarDay: {
    width: 40,
    height: 40,
    borderRadius: spacing.radiusSm,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  calendarDayToday: {
    borderWidth: 2,
    borderColor: colors.primary,
  },
  calendarDaySelected: {
    backgroundColor: colors.primary,
  },
  calendarDayText: {
    ...typography.caption,
  },
  calendarDayTextToday: {
    color: colors.primary,
    fontWeight: '600',
  },
  calendarDayEmoji: {
    fontSize: 10,
  },
  // Stats card styles
  statsCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: spacing.radiusMd,
    padding: spacing.base,
    marginHorizontal: spacing.screenPadding,
    shadowColor: colors.shadow.sm,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    ...typography.h4,
    marginBottom: spacing.xs,
  },
  statLabel: {
    ...typography.caption,
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.divider,
    marginVertical: spacing.sm,
  },
});