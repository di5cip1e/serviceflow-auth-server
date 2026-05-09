import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';

type ChipVariant = 'default' | 'selected' | 'close';

interface GCPChipProps {
  label: string;
  onPress?: () => void;
  variant?: ChipVariant;
  selected?: boolean;
  onClose?: () => void;
  style?: ViewStyle;
}

export const GCPChip: React.FC<GCPChipProps> = ({
  label,
  onPress,
  variant = 'default',
  selected = false,
  onClose,
  style,
}) => {
  const isSelected = variant === 'selected' || selected;

  return (
    <TouchableOpacity
      style={[
        styles.chip,
        isSelected && styles.selected,
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[styles.label, isSelected && styles.selectedLabel]}>
        {label}
      </Text>
      {variant === 'close' && onClose && (
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Text style={styles.closeText}>×</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  selected: {
    backgroundColor: '#6366F1',
  },
  label: {
    fontSize: 14,
    color: '#374151',
  },
  selectedLabel: {
    color: '#fff',
  },
  closeButton: {
    marginLeft: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    lineHeight: 18,
  },
});
