import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GCPCard, GCPAvatar, GCPProgressBar, GCPChip } from '../../components/base';

const ContactDetailScreen = ({ route }: any) => {
  const { contactId } = route.params;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <GCPAvatar name="Sarah Chen" size="large" />
          <Text style={styles.name}>Sarah Chen</Text>
          <Text style={styles.phone}>+1 555-0123</Text>
          <Text style={styles.lastContact}>Last: 2 hours ago</Text>
        </View>

        {/* OCEAN Profile */}
        <GCPCard style={styles.section}>
          <Text style={styles.sectionTitle}>OCEAN Profile</Text>
          <View style={styles.oceanList}>
            {[
              { name: 'Openness', score: 72 },
              { name: 'Conscientiousness', score: 65 },
              { name: 'Extroversion', score: 78 },
              { name: 'Agreeableness', score: 71 },
              { name: 'Neuroticism', score: 38 },
            ].map((trait) => (
              <View key={trait.name} style={styles.oceanItem}>
                <Text style={styles.oceanLabel}>{trait.name}</Text>
                <View style={styles.oceanProgress}>
                  <GCPProgressBar value={trait.score} showLabel size="small" />
                </View>
              </View>
            ))}
          </View>
        </GCPCard>

        {/* Communication Style */}
        <GCPCard style={styles.section}>
          <Text style={styles.sectionTitle}>Communication Style</Text>
          <View style={styles.commStyleRow}>
            <GCPChip label="Casual" selected />
            <GCPChip label="Emoji-rich" selected />
          </View>
          <Text style={styles.commStyleText}>Prefers casual, emoji-rich messages</Text>
          <Text style={styles.commStyleText}>Response: Quick (less than 30 min)</Text>
          <Text style={styles.commStyleText}>Initiation: 60% you / 40% them</Text>
        </GCPCard>

        {/* Bridge Tip */}
        <GCPCard style={[styles.section, styles.tipCard]}>
          <Text style={styles.tipTitle}>💡 Bridge Tip</Text>
          <Text style={styles.tipText}>
            They value directness. Consider being more straightforward in your communication.
          </Text>
        </GCPCard>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 24,
    backgroundColor: '#fff',
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 16,
  },
  phone: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  lastContact: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  section: {
    marginHorizontal: 16,
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  oceanList: {},
  oceanItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  oceanLabel: {
    width: 120,
    fontSize: 14,
    color: '#374151',
  },
  oceanProgress: {
    flex: 1,
  },
  commStyleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  commStyleText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  tipCard: {
    backgroundColor: '#EEF2FF',
    borderColor: '#6366F1',
    borderWidth: 1,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6366F1',
    marginBottom: 8,
  },
  tipText: {
    fontSize: 14,
    color: '#4338CA',
    lineHeight: 20,
  },
});

export default ContactDetailScreen;
