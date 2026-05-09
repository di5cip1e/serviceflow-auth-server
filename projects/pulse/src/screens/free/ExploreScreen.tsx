import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GCPCard, GCPProgressBar } from '../../components/base';

const ExploreScreen = ({ navigation }: any) => {
  const oceanDimensions = [
    { key: 'openness', name: 'Openness', score: 72, description: 'Creativity, curiosity, and openness to new experiences' },
    { key: 'conscientiousness', name: 'Conscientiousness', score: 68, description: 'Organization, responsibility, and self-discipline' },
    { key: 'extroversion', name: 'Extroversion', score: 58, description: 'Energy, sociability, and assertiveness' },
    { key: 'agreeableness', name: 'Agreeableness', score: 75, description: 'Trust, cooperation, and empathy' },
    { key: 'neuroticism', name: 'Neuroticism', score: 45, description: 'Emotional stability and resilience' },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.subtitle}>Your Big Five Profile</Text>
        
        {oceanDimensions.map((dimension) => (
          <TouchableOpacity 
            key={dimension.key}
            onPress={() => navigation.navigate('TraitDetail', { trait: dimension.key })}
          >
            <GCPCard style={styles.dimensionCard}>
              <View style={styles.dimensionHeader}>
                <Text style={styles.dimensionName}>{dimension.name}</Text>
                <Text style={styles.dimensionScore}>{dimension.score}</Text>
              </View>
              <GCPProgressBar value={dimension.score} color="primary" size="medium" />
              <Text style={styles.dimensionDesc}>{dimension.description}</Text>
            </GCPCard>
          </TouchableOpacity>
        ))}

        {/* Comparison Tool */}
        <TouchableOpacity onPress={() => navigation.navigate('Comparison', { contactId: '1' })}>
          <GCPCard style={styles.comparisonCard}>
            <Text style={styles.comparisonTitle}>Compare with Contact</Text>
            <Text style={styles.comparisonDesc}>See how your personality matches with others</Text>
          </GCPCard>
        </TouchableOpacity>

        {/* View Full Profile (Pro) */}
        <GCPCard style={styles.proCard}>
          <Text style={styles.proTitle}>🔓 Unlock 30 Traits</Text>
          <Text style={styles.proDesc}>Get detailed breakdown with 6 sub-traits per dimension</Text>
          <TouchableOpacity style={styles.upgradeButton}>
            <Text style={styles.upgradeText}>Upgrade to Pro</Text>
          </TouchableOpacity>
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
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    paddingHorizontal: 16,
    marginTop: 16,
    marginBottom: 16,
  },
  dimensionCard: {
    marginHorizontal: 16,
    marginBottom: 12,
  },
  dimensionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dimensionName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  dimensionScore: {
    fontSize: 24,
    fontWeight: '700',
    color: '#6366F1',
  },
  dimensionDesc: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 8,
  },
  comparisonCard: {
    marginHorizontal: 16,
    marginTop: 8,
    backgroundColor: '#EEF2FF',
    borderColor: '#6366F1',
    borderWidth: 1,
  },
  comparisonTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6366F1',
    marginBottom: 4,
  },
  comparisonDesc: {
    fontSize: 14,
    color: '#4338CA',
  },
  proCard: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 24,
    backgroundColor: '#FEF3C7',
    borderColor: '#F59E0B',
    borderWidth: 1,
  },
  proTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400E',
    marginBottom: 4,
  },
  proDesc: {
    fontSize: 14,
    color: '#B45309',
    marginBottom: 12,
  },
  upgradeButton: {
    backgroundColor: '#F59E0B',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  upgradeText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
});

export default ExploreScreen;
