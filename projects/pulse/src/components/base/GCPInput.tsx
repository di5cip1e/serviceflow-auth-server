import React from 'react';
import { View, TextInput, Text, StyleSheet, ViewStyle, TextInputProps } from 'react-native';

type InputVariant = 'default' | 'error' | 'success';

interface GCPInputProps extends TextInputProps {
  label?: string;
  error?: string;
  success?: string;
  variant?: InputVariant;
  containerStyle?: ViewStyle;
}

export const GCPInput: React.FC<GCPInputProps> = ({
  label,
  error,
  success,
  variant = 'default',
  containerStyle,
  style,
  ...props
}) => {
  const getBorderColor = () => {
    if (error || variant === 'error') return '#EF4444';
    if (success || variant === 'success') return '#10B981';
    return '#D1D5DB';
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[
          styles.input,
          { borderColor: getBorderColor() },
          style,
        ]}
        placeholderTextColor="#9CA3AF"
        {...props}
      />
      {error && <Text style={styles.error}>{error}</Text>}
      {success && <Text style={styles.success}>{success}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1F2937',
    backgroundColor: '#fff',
  },
  error: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
  },
  success: {
    fontSize: 12,
    color: '#10B981',
    marginTop: 4,
  },
});
