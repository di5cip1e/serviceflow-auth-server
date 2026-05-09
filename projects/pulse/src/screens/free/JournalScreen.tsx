import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { GCPCard, GCPMoodSlider } from '../../components';

export default function JournalScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Journal</Text>
      <GCPCard style={styles.card}>
        <Text style={styles.label}>How are you feeling today?</Text>
        <GCPMoodSlider />
      </GCPCard>
      <GCPCard style={styles.card}>
        <Text style={styles.label}>What's on your mind?</Text>
        <Text style={styles.placeholder}>Write your thoughts here...</Text>
      </GCPCard>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  card: { marginBottom: 16, padding: 16 },
  label: { fontSize: 16, fontWeight: '600', marginBottom: 12 },
  placeholder: { color: '#999' },
});
