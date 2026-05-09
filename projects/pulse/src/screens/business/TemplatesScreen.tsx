// TemplatesScreen - Message templates
// Business Pro Tier Feature

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GCPCard, GCPButton, GCPChip } from '../../components/base';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

// Mock data
const mockTemplates = [
  {
    id: '1',
    name: 'Initial Outreach',
    category: 'Sales',
    content: 'Hi {{name}}, thanks for connecting! I\'d love to learn more about {{company}} and how we might be able to help.',
    usageCount: 45,
  },
  {
    id: '2',
    name: 'Follow-up',
    category: 'Follow-up',
    content: 'Hi {{name}}, just checking in on our previous conversation. Would you have 15 minutes this week to chat?',
    usageCount: 32,
  },
  {
    id: '3',
    name: 'Meeting Request',
    category: 'Sales',
    content: 'Hi {{name}}, would you have 15 minutes for a quick call? I\'d love to discuss {{product}} and how it might help {{company}}.',
    usageCount: 28,
  },
  {
    id: '4',
    name: 'Thank You',
    category: 'Support',
    content: 'Hi {{name}}, thank you so much for your time today! I really enjoyed our conversation about {{product}}.',
    usageCount: 21,
  },
  {
    id: '5',
    name: 'Re-engagement',
    category: 'Follow-up',
    content: 'Hi {{name}}, it\'s been a while since we connected. I wanted to reach out and see if {{product}} might be helpful for {{company}} now.',
    usageCount: 15,
  },
];

const mockVariables = [
  '{{name}}',
  '{{company}}',
  '{{meeting_time}}',
  '{{product}}',
  '{{next_step}}',
];

const TemplatesScreen = ({ navigation }: any) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const categories = ['All', 'Sales', 'Support', 'Follow-up'];

  const filteredTemplates = selectedCategory === 'All' 
    ? mockTemplates 
    : mockTemplates.filter(t => t.category === selectedCategory);

  const handleNewTemplate = () => {
    // Create new template
  };

  const handleUseTemplate = (templateId: string) => {
    // Use template in compose
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Templates</Text>
          <TouchableOpacity onPress={handleNewTemplate}>
            <Text style={styles.addButton}>+ New</Text>
          </TouchableOpacity>
        </View>

        {/* Category Filter */}
        <View style={styles.categoryContainer}>
          {categories.map((category) => (
            <GCPChip
              key={category}
              label={category}
              selected={selectedCategory === category}
              onPress={() => setSelectedCategory(category)}
            />
          ))}
        </View>

        {/* Template List */}
        <View style={styles.templateList}>
          {filteredTemplates.map((template) => (
            <TouchableOpacity 
              key={template.id} 
              onPress={() => handleUseTemplate(template.id)}
            >
              <GCPCard style={styles.templateCard}>
                <View style={styles.templateHeader}>
                  <View style={styles.templateIcon}>
                    <Text style={styles.templateIconText}>📝</Text>
                  </View>
                  <View style={styles.templateInfo}>
                    <Text style={styles.templateName}>{template.name}</Text>
                    <View style={styles.templateMeta}>
                      <GCPChip 
                        label={template.category} 
                        size="small"
                      />
                      <Text style={styles.usageCount}>Used: {template.usageCount} times</Text>
                    </View>
                  </View>
                </View>
                <View style={styles.templateContent}>
                  <Text style={styles.templateText} numberOfLines={2}>
                    {template.content}
                  </Text>
                </View>
                <View style={styles.templateActions}>
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => {}}
                  >
                    <Text style={styles.actionButtonText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => {}}
                  >
                    <Text style={styles.actionButtonText}>Duplicate</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => handleUseTemplate(template.id)}
                  >
                    <Text style={[styles.actionButtonText, styles.useText]}>Use</Text>
                  </TouchableOpacity>
                </View>
              </GCPCard>
            </TouchableOpacity>
          ))}
        </View>

        {/* Template Variables Reference */}
        <GCPCard style={styles.variablesCard}>
          <Text style={styles.sectionTitle}>Template Variables</Text>
          <View style={styles.variablesContainer}>
            {mockVariables.map((variable, index) => (
              <View key={index} style={styles.variableItem}>
                <Text style={styles.variableText}>{variable}</Text>
              </View>
            ))}
          </View>
          <Text style={styles.variablesNote}>
            Variables will be automatically replaced when using the template
          </Text>
        </GCPCard>

        {/* Add New Template Button */}
        <View style={styles.addSection}>
          <GCPButton
            title="Create New Template"
            onPress={handleNewTemplate}
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
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    paddingHorizontal: spacing.base,
    marginBottom: spacing.base,
  },
  templateList: {
    paddingHorizontal: spacing.base,
    gap: spacing.sm,
  },
  templateCard: {
    marginBottom: spacing.sm,
  },
  templateHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  templateIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryLight + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  templateIconText: {
    fontSize: 18,
  },
  templateInfo: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  templateName: {
    ...typography.h4,
    marginBottom: spacing.xs,
  },
  templateMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  usageCount: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  templateContent: {
    backgroundColor: colors.background,
    padding: spacing.sm,
    borderRadius: spacing.radiusSm,
    marginBottom: spacing.sm,
  },
  templateText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  templateActions: {
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
    color: colors.textSecondary,
  },
  useText: {
    color: colors.primary,
    fontWeight: '600',
  },
  variablesCard: {
    marginHorizontal: spacing.base,
    marginBottom: spacing.base,
  },
  sectionTitle: {
    ...typography.h4,
    marginBottom: spacing.base,
  },
  variablesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  variableItem: {
    backgroundColor: colors.background,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: spacing.radiusSm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  variableText: {
    ...typography.mono,
    color: colors.primary,
  },
  variablesNote: {
    ...typography.caption,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  addSection: {
    paddingHorizontal: spacing.base,
    paddingBottom: spacing.xxxl,
  },
});

export default TemplatesScreen;
