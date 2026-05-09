import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GCPCard, GCPAvatar, GCPMoodSlider, GCPProgressBar } from '../../components/base';

const DashboardScreen = ({ navigation }: any) => {
  const [moodValue, setMoodValue] = React.useState(7);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <GCPAvatar name="Derek" size="medium" status="online" />
            <View style={styles.headerText}>
              <Text style={styles.greeting}>Welcome back,</Text>
              <Text style={styles.name}>Derek</Text>
            </View>
          </View>
          <TouchableOpacity 
            style={styles.askGcpButton}
            onPress={() => navigation.navigate('AskGCP')}
          >
            <Text style={styles.askGcpText}>Ask GCP</Text>
          </TouchableOpacity>
        </View>

        {/* Mood Card */}
        <GCPCard style={styles.moodCard}>
          <Text style={styles.sectionTitle}>How are you feeling today?</Text>
          <GCPMoodSlider value={moodValue} onChange={setMoodValue} />
          <Text style={styles.journalPrompt}>
            Today's prompt: What made you smile today?
          </Text>
        </GCPCard>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <GCPCard style={styles.statCard}>
            <Text style={styles.statValue}>1,247</Text>
            <Text style={styles.statLabel}>Messages</Text>
          </GCPCard>
          <GCPCard style={styles.statCard}>
            <Text style={styles.statValue}>24</Text>
            <Text style={styles.statLabel}>Contacts</Text>
          </GCPCard>
          <GCPCard style={styles.statCard}>
            <Text style={styles.statValue}>78%</Text>
            <Text style={styles.statLabel}>Health</Text>
          </GCPCard>
        </View>

        {/* Recent Insights */}
        <View style={styles.insightsSection}>
          <Text style={styles.sectionTitle}>Recent Insights</Text>
          <GCPCard style={styles.insightCard}>
            <Text style={styles.insightEmoji}>💡</Text>
            <Text style={styles.insightText}>
              You're most communicative between 10am-2pm. Consider scheduling important conversations during this window.
            </Text>
          </GCPCard>
          <GCPCard style={styles.insightCard}>
            <Text style={styles.insightEmoji}>📈</Text>
            <Text style={styles.insightText}>
              Your relationship with Sarah has improved by 12% this month.
            </Text>
          </GCPCard>
        </View>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerText: {
    marginLeft: 12,
  },
  greeting: {
    fontSize: 14,
    color: '#6B7280',
  },
  name: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
  },
  askGcpButton: {
    backgroundColor: '#6366F1',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  askGcpText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  moodCard: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  journalPrompt: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
    paddingVertical: 16,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#6366F1',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  insightsSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  insightCard: {
    flexDirection: 'row',
    marginBottom: 8,
    padding: 12,
  },
  insightEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  insightText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
});

export default DashboardScreen;
