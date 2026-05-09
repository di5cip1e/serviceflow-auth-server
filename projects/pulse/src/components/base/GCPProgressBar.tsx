import React from 'react';
import { View, Text, StyleSheet, ViewStyle, Animated } from 'react-native';

type ProgressVariant = 'linear' | 'circular';
type ProgressColor = 'primary' | 'success' | 'warning' | 'error';

interface GCPProgressBarProps {
  value: number;
  max?: number;
  variant?: ProgressVariant;
  color?: ProgressColor;
  showLabel?: boolean;
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
}

const getColorValue = (color: ProgressColor): string => {
  switch (color) {
    case 'primary': return '#6366F1';
    case 'success': return '#10B981';
    case 'warning': return '#F59E0B';
    case 'error': return '#EF4444';
  }
};

const getSizeValue = (size: 'small' | 'medium' | 'large'): number => {
  switch (size) {
    case 'small': return 4;
    case 'medium': return 8;
    case 'large': return 12;
  }
};

export const GCPProgressBar: React.FC<GCPProgressBarProps> = ({
  value,
  max = 100,
  variant = 'linear',
  color = 'primary',
  showLabel = false,
  size = 'medium',
  style,
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const colorValue = getColorValue(color);
  const height = getSizeValue(size);

  if (variant === 'circular') {
    return (
      <View style={[styles.circularContainer, style]}>
        <View style={styles.circularOuter}>
          <View 
            style={[
              styles.circularInner,
              { 
                borderColor: colorValue,
                borderWidth: height,
                borderLeftColor: 'transparent',
                borderBottomColor: percentage > 25 ? colorValue : 'transparent',
                borderRightColor: percentage > 50 ? colorValue : 'transparent',
                borderTopColor: percentage > 75 ? colorValue : 'transparent',
                transform: [{ rotate: `${(percentage / 100) * 360 - 45}deg` }],
              },
            ]} 
          />
          {showLabel && (
            <Text style={styles.circularLabel}>{Math.round(percentage)}%</Text>
          )}
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <View style={[styles.track, { height }]}>
        <View
          style={[
            styles.fill,
            {
              width: `${percentage}%`,
              backgroundColor: colorValue,
              height,
            },
          ]}
        />
      </View>
      {showLabel && (
        <Text style={styles.label}>{Math.round(percentage)}%</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  track: {
    flex: 1,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  fill: {
    borderRadius: 4,
  },
  label: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    minWidth: 40,
    textAlign: 'right',
  },
  circularContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  circularOuter: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circularInner: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  circularLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
});
