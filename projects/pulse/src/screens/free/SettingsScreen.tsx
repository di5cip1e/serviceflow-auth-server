import React from 'react';
import { View, Text, StyleSheet, Switch } from 'react-native';
import { GCPCard, GCPButton } from '../../components';

export default function SettingsScreen() {
  const [notifications, setNotifications] = React.useState(true);
  const [darkMode, setDarkMode] = React.useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>
      
      <GCPCard style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        <View style={styles.row}>
          <Text>Push Notifications</Text>
          <Switch value={notifications} onValueChange={setNotifications} />
        </View>
      </GCPCard>

      <GCPCard style={styles.section}>
        <Text style={styles.sectionTitle}>Appearance</Text>
        <View style={styles.row}>
          <Text>Dark Mode</Text>
          <Switch value={darkMode} onValueChange={setDarkMode} />
        </View>
      </GCPCard>

      <GCPCard style={styles.section}>
        <Text style={styles.sectionTitle}>Data</Text>
        <GCPButton title="Backup to Google Drive" variant="secondary" />
        <GCPButton title="Export Data" variant="secondary" />
      </GCPCard>

      <GCPCard style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <GCPButton title="Manage Subscription" variant="primary" />
      </GCPCard>

      <Text style={styles.version}>P.U.L.S.E v1.0.0</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  section: { marginBottom: 16, padding: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  version: { textAlign: 'center', color: '#999', marginTop: 20 },
});
