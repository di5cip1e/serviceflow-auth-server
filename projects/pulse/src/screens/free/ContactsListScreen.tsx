import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GCPCard, GCPAvatar, GCPChip } from '../../components/base';
import type { Contact } from '../../types';

const mockContacts: Contact[] = [
  { id: '1', name: 'Sarah Chen', tags: ['Close Friend'], relationshipScore: 78, messageCount: 142, createdAt: '', updatedAt: '' },
  { id: '2', name: 'Mike Torres', tags: ['Work'], relationshipScore: 65, messageCount: 89, createdAt: '', updatedAt: '' },
  { id: '3', name: 'Jordan Lee', tags: ['Close Friend', 'Family'], relationshipScore: 82, messageCount: 234, createdAt: '', updatedAt: '' },
  { id: '4', name: 'Alex Kim', tags: ['Acquaintance'], relationshipScore: 41, messageCount: 12, createdAt: '', updatedAt: '' },
];

const ContactsListScreen = ({ navigation }: any) => {
  const [selectedFilter, setSelectedFilter] = React.useState('All');

  const getScoreColor = (score: number) => {
    if (score >= 70) return '#10B981';
    if (score >= 50) return '#F59E0B';
    return '#EF4444';
  };

  const renderContact = ({ item }: { item: Contact }) => (
    <TouchableOpacity onPress={() => navigation.navigate('ContactDetail', { contactId: item.id })}>
      <GCPCard style={styles.contactCard}>
        <View style={styles.contactRow}>
          <GCPAvatar name={item.name} size="medium" />
          <View style={styles.contactInfo}>
            <Text style={styles.contactName}>{item.name}</Text>
            <Text style={styles.contactMeta}>
              💬 {item.messageCount} messages
            </Text>
          </View>
          <View style={styles.scoreContainer}>
            <View style={[styles.scoreBadge, { backgroundColor: getScoreColor(item.relationshipScore) }]}>
              <Text style={styles.scoreText}>{item.relationshipScore}</Text>
            </View>
          </View>
        </View>
        {item.tags.length > 0 && (
          <View style={styles.tagsRow}>
            {item.tags.map((tag) => (
              <GCPChip key={tag} label={tag} selected />
            ))}
          </View>
        )}
      </GCPCard>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.filterContainer}>
        {['All', 'Close Friends', 'Family', 'Work'].map((filter) => (
          <GCPChip
            key={filter}
            label={filter}
            selected={selectedFilter === filter}
            onPress={() => setSelectedFilter(filter)}
          />
        ))}
      </View>
      <FlatList
        data={mockContacts}
        renderItem={renderContact}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  filterContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    paddingBottom: 8,
  },
  list: {
    padding: 16,
    paddingTop: 8,
  },
  contactCard: {
    marginBottom: 12,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contactInfo: {
    flex: 1,
    marginLeft: 12,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  contactMeta: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  scoreContainer: {
    alignItems: 'center',
  },
  scoreBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
  },
});

export default ContactsListScreen;
