import React from 'react';
import { View, Text, StyleSheet, Modal, TextInput, TouchableOpacity } from 'react-native';
import { GCPCard, GCPButton } from '../../components';

interface AskGCPModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function AskGCPModal({ visible, onClose }: AskGCPModalProps) {
  const [question, setQuestion] = React.useState('');

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <GCPCard style={styles.card}>
          <Text style={styles.title}>Ask P.U.L.S.E</Text>
          <TextInput
            style={styles.input}
            placeholder="Ask anything about your contacts..."
            value={question}
            onChangeText={setQuestion}
            multiline
          />
          <View style={styles.buttons}>
            <GCPButton title="Ask" variant="primary" onPress={() => {}} />
            <GCPButton title="Close" variant="ghost" onPress={onClose} />
          </View>
        </GCPCard>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  card: { padding: 20 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, minHeight: 80, marginBottom: 16 },
  buttons: { flexDirection: 'row', gap: 12 },
});
