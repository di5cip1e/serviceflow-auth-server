// AIPanel Component
// Slide-up AI assistant panel for P.U.L.S.E

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Animated,
  Dimensions,
  ScrollView,
  Modal,
} from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const PANEL_HEIGHT = SCREEN_HEIGHT * 0.6;

interface AISuggestion {
  id: string;
  type: 'tone' | 'suggestion' | 'snooze' | 'insight' | 'bridge';
  message: string;
  confidence?: number;
  isEditable?: boolean;
  options?: string[];
  onAction?: (action: string) => void;
}

interface AIPanelProps {
  visible: boolean;
  onClose: () => void;
  suggestions?: AISuggestion[];
  contactName?: string;
  tier?: 'free' | 'pro' | 'businessPro';
}

export const AIPanel: React.FC<AIPanelProps> = ({
  visible,
  onClose,
  suggestions = [],
  contactName,
  tier = 'free',
}) => {
  const slideAnim = useRef(new Animated.Value(PANEL_HEIGHT)).current;
  const [query, setQuery] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  // Mock suggestions based on tier
  const defaultSuggestions: AISuggestion[] = tier === 'free'
    ? [
        {
          id: '1',
          type: 'tone',
          message: contactName 
            ? `${contactName} seems in a good mood today`
            : 'Conversation tone is positive',
          confidence: 0.85,
        },
        {
          id: '2',
          type: 'suggestion',
          message: 'Looking forward to it! 🎉',
          isEditable: true,
        },
        {
          id: '3',
          type: 'snooze',
          message: 'Snooze this conversation...',
          options: ['1hr', '3hr', 'Tomorrow', 'Custom'],
        },
      ]
    : [
        {
          id: '1',
          type: 'tone',
          message: contactName 
            ? `${contactName} seems in a good mood today`
            : 'Conversation tone is positive',
          confidence: 0.92,
        },
        {
          id: '2',
          type: 'insight',
          message: contactName 
            ? `${contactName} typically responds within 30 minutes. Quick responder!`
            : 'Average response time: 2.3 hours',
        },
        {
          id: '3',
          type: 'suggestion',
          message: 'Looking forward to it! 🎉',
          isEditable: true,
        },
        {
          id: '4',
          type: 'bridge',
          message: 'They value directness. Consider being more straightforward.',
        },
        {
          id: '5',
          type: 'snooze',
          message: 'Snooze notifications...',
          options: ['1hr', '3hr', 'Tomorrow', 'Custom'],
        },
      ];

  const displaySuggestions = suggestions.length > 0 ? suggestions : defaultSuggestions;

  const handleSlideIn = () => {
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 65,
      friction: 11,
    }).start();
  };

  const handleSlideOut = () => {
    Animated.timing(slideAnim, {
      toValue: PANEL_HEIGHT,
      duration: 250,
      useNativeDriver: true,
    }).start(() => onClose());
  };

  React.useEffect(() => {
    if (visible) {
      handleSlideIn();
    } else {
      handleSlideOut();
    }
  }, [visible]);

  const getSuggestionIcon = (type: AISuggestion['type']) => {
    switch (type) {
      case 'tone':
        return '🎭';
      case 'suggestion':
        return '💡';
      case 'snooze':
        return '⏰';
      case 'insight':
        return '📊';
      case 'bridge':
        return '🌉';
      default:
        return '🤖';
    }
  };

  const getSuggestionColor = (type: AISuggestion['type']) => {
    switch (type) {
      case 'tone':
        return colors.ocean.extroversion;
      case 'suggestion':
        return colors.primary;
      case 'snooze':
        return colors.warning;
      case 'insight':
        return colors.ocean.conscientiousness;
      case 'bridge':
        return colors.ocean.agreeableness;
      default:
        return colors.secondary;
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleSlideOut}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={handleSlideOut}
      >
        <Animated.View
          style={[
            styles.panel,
            { transform: [{ translateY: slideAnim }] },
          ]}
        >
          {/* Handle */}
          <TouchableOpacity 
            style={styles.handleContainer}
            onPress={() => setIsExpanded(!isExpanded)}
          >
            <View style={styles.handle} />
            <View style={styles.header}>
              <Text style={styles.headerTitle}>🤖 P.U.L.S.E</Text>
              <Text style={styles.headerSubtitle}>
                {tier === 'free' ? 'Basic AI Assistant' : 'Advanced AI'}
              </Text>
            </View>
          </TouchableOpacity>

          {/* Content */}
          <ScrollView 
            style={styles.content}
            showsVerticalScrollIndicator={false}
          >
            {/* Suggestions */}
            {displaySuggestions.map((suggestion) => (
              <View 
                key={suggestion.id}
                style={[
                  styles.suggestionCard,
                  { borderLeftColor: getSuggestionColor(suggestion.type) },
                ]}
              >
                <View style={styles.suggestionHeader}>
                  <Text style={styles.suggestionIcon}>
                    {getSuggestionIcon(suggestion.type)}
                  </Text>
                  <Text style={styles.suggestionType}>
                    {suggestion.type.charAt(0).toUpperCase() + suggestion.type.slice(1)}
                  </Text>
                  {suggestion.confidence && (
                    <Text style={styles.confidence}>
                      {Math.round(suggestion.confidence * 100)}% confidence
                    </Text>
                  )}
                </View>
                
                <Text style={styles.suggestionMessage}>
                  {suggestion.message}
                </Text>

                {/* Action buttons */}
                {suggestion.type === 'suggestion' && suggestion.isEditable && (
                  <View style={styles.suggestionActions}>
                    <TouchableOpacity style={styles.actionButton}>
                      <Text style={styles.actionButtonText}>Insert</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.actionButton, styles.actionButtonSecondary]}>
                      <Text style={[styles.actionButtonText, styles.actionButtonTextSecondary]}>
                        Edit
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.actionButton, styles.actionButtonGhost]}>
                      <Text style={[styles.actionButtonText, styles.actionButtonTextGhost]}>
                        Dismiss
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}

                {suggestion.type === 'snooze' && suggestion.options && (
                  <View style={styles.snoozeOptions}>
                    {suggestion.options.map((option) => (
                      <TouchableOpacity
                        key={option}
                        style={styles.snoozeButton}
                        onPress={() => suggestion.onAction?.(option)}
                      >
                        <Text style={styles.snoozeButtonText}>{option}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            ))}

            {/* Ask P.U.L.S.E Input */}
            <View style={styles.askSection}>
              <Text style={styles.askTitle}>Ask P.U.L.S.E</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Ask anything about this conversation..."
                  placeholderTextColor={colors.textTertiary}
                  value={query}
                  onChangeText={setQuery}
                />
                <TouchableOpacity style={styles.sendButton}>
                  <Text style={styles.sendButtonText}>➤</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Upgrade Prompt for Free Tier */}
            {tier === 'free' && (
              <View style={styles.upgradeCard}>
                <Text style={styles.upgradeIcon}>🔓</Text>
                <Text style={styles.upgradeTitle}>Unlock Advanced AI</Text>
                <Text style={styles.upgradeText}>
                  Get deeper insights, bridge tips, and advanced sentiment analysis with Pro.
                </Text>
                <TouchableOpacity style={styles.upgradeButton}>
                  <Text style={styles.upgradeButtonText}>Upgrade to Pro</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
};

// Compact AI indicator for chat screen
export const AIIndicator: React.FC<{
  onPress: () => void;
  hasSuggestions?: boolean;
}> = ({ onPress, hasSuggestions }) => {
  return (
    <TouchableOpacity style={styles.aiIndicator} onPress={onPress}>
      <Text style={styles.aiIndicatorIcon}>🤖</Text>
      {hasSuggestions && <View style={styles.aiIndicatorBadge} />}
    </TouchableOpacity>
  );
};

// AI Chat Modal (full screen)
export const AIChatModal: React.FC<{
  visible: boolean;
  onClose: () => void;
}> = ({ visible, onClose }) => {
  return (
    <Modal visible={visible} animationType="slide">
      <View style={styles.chatModal}>
        <View style={styles.chatHeader}>
          <Text style={styles.chatHeaderTitle}>🤖 P.U.L.S.E</Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.closeButton}>✕</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.chatBody}>
          <Text style={styles.chatPlaceholder}>
            Start a conversation with P.U.L.S.E...
          </Text>
        </View>
        <View style={styles.chatInputArea}>
          <TextInput
            style={styles.chatInput}
            placeholder="Message P.U.L.S.E..."
            placeholderTextColor={colors.textTertiary}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
  },
  panel: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: spacing.bottomSheetRadius,
    borderTopRightRadius: spacing.bottomSheetRadius,
    maxHeight: PANEL_HEIGHT,
    minHeight: 200,
  },
  handleContainer: {
    alignItems: 'center',
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  handle: {
    width: 40,
    height: spacing.bottomSheetHandle,
    backgroundColor: colors.border,
    borderRadius: 2,
    marginBottom: spacing.md,
  },
  header: {
    alignItems: 'center',
  },
  headerTitle: {
    ...typography.h3,
  },
  headerSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.screenPadding,
  },
  suggestionCard: {
    backgroundColor: colors.background,
    borderRadius: spacing.radiusMd,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderLeftWidth: 3,
  },
  suggestionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  suggestionIcon: {
    fontSize: 16,
  },
  suggestionType: {
    ...typography.label,
    flex: 1,
  },
  confidence: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  suggestionMessage: {
    ...typography.body,
  },
  suggestionActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  actionButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    borderRadius: spacing.radiusSm,
  },
  actionButtonSecondary: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionButtonGhost: {
    backgroundColor: 'transparent',
  },
  actionButtonText: {
    ...typography.buttonSmall,
    color: colors.white,
  },
  actionButtonTextSecondary: {
    color: colors.textPrimary,
  },
  actionButtonTextGhost: {
    color: colors.textTertiary,
  },
  snoozeOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  snoozeButton: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    borderRadius: spacing.radiusFull,
    borderWidth: 1,
    borderColor: colors.border,
  },
  snoozeButtonText: {
    ...typography.bodySmall,
  },
  askSection: {
    marginTop: spacing.lg,
    marginBottom: spacing.xxl,
  },
  askTitle: {
    ...typography.h4,
    marginBottom: spacing.md,
  },
  inputContainer: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderRadius: spacing.radiusMd,
    paddingLeft: spacing.md,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    ...typography.body,
    paddingVertical: spacing.md,
  },
  sendButton: {
    backgroundColor: colors.primary,
    width: 44,
    height: 44,
    borderRadius: spacing.radiusMd,
    justifyContent: 'center',
    alignItems: 'center',
    margin: spacing.xs,
  },
  sendButtonText: {
    color: colors.white,
    fontSize: 18,
  },
  upgradeCard: {
    backgroundColor: colors.primaryLight + '20',
    borderRadius: spacing.radiusMd,
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  upgradeIcon: {
    fontSize: 32,
    marginBottom: spacing.sm,
  },
  upgradeTitle: {
    ...typography.h4,
    marginBottom: spacing.sm,
  },
  upgradeText: {
    ...typography.bodySmall,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  upgradeButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: spacing.radiusMd,
  },
  upgradeButtonText: {
    ...typography.button,
    color: colors.white,
  },
  // AI Indicator styles
  aiIndicator: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.secondary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  aiIndicatorIcon: {
    fontSize: 20,
  },
  aiIndicatorBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.success,
    borderWidth: 2,
    borderColor: colors.surface,
  },
  // Chat modal styles
  chatModal: {
    flex: 1,
    backgroundColor: colors.background,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.screenPadding,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  chatHeaderTitle: {
    ...typography.h3,
  },
  closeButton: {
    fontSize: 24,
    color: colors.textSecondary,
    padding: spacing.sm,
  },
  chatBody: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatPlaceholder: {
    ...typography.body,
    color: colors.textTertiary,
  },
  chatInputArea: {
    padding: spacing.screenPadding,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  chatInput: {
    backgroundColor: colors.background,
    borderRadius: spacing.radiusMd,
    padding: spacing.md,
    ...typography.body,
  },
});