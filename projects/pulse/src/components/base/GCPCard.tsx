import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';

interface GCPCardProps {
  children: React.ReactNode;
  elevated?: boolean;
  style?: ViewStyle;
}

export const GCPCard: React.FC<GCPCardProps> = ({
  children,
  elevated = true,
  style,
}) => {
  return (
    <View style={[
      styles.card,
      elevated && styles.elevated,
      style,
    ]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  elevated: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
});
