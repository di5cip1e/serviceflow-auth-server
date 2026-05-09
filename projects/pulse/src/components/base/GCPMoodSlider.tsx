import React from 'react';
import { View, Text, StyleSheet, PanResponder, Animated, ViewStyle } from 'react-native';

interface GCPMoodSliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  style?: ViewStyle;
}

const MOOD_EMOJIS = ['😢', '😕', '😐', '🙂', '😊', '😄', '😁', '🤩', '🥳', '🔥'];

export const GCPMoodSlider: React.FC<GCPMoodSliderProps> = ({
  value,
  onChange,
  min = 1,
  max = 10,
  style,
}) => {
  const [sliderWidth, setSliderWidth] = React.useState(0);
  const animatedValue = React.useRef(new Animated.Value(((value - min) / (max - min)))).current;

  const getPositionFromValue = (val: number): number => {
    return ((val - min) / (max - min)) * sliderWidth;
  };

  const getValueFromPosition = (position: number): number => {
    const clampedPosition = Math.max(0, Math.min(position, sliderWidth));
    return Math.round((clampedPosition / sliderWidth) * (max - min)) + min;
  };

  const panResponder = React.useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (_, gestureState) => {
        const newValue = getValueFromPosition(gestureState.x0);
        onChange(newValue);
        animatedValue.setValue(getPositionFromValue(newValue) / sliderWidth);
      },
      onPanResponderMove: (_, gestureState) => {
        const position = gestureState.moveX;
        const clampedPosition = Math.max(0, Math.min(position, sliderWidth));
        const newValue = getValueFromPosition(clampedPosition);
        onChange(newValue);
      },
    })
  ).current;

  const emojiIndex = value - 1;

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.emoji}>{MOOD_EMOJIS[emojiIndex]}</Text>
      <View
        style={styles.sliderContainer}
        onLayout={(e) => setSliderWidth(e.nativeEvent.layout.width)}
        {...panResponder.panHandlers}
      >
        <View style={styles.track}>
          <Animated.View
            style={[
              styles.fill,
              {
                width: animatedValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                }),
              },
            ]}
          />
        </View>
        <Animated.View
          style={[
            styles.thumb,
            {
              transform: [
                {
                  translateX: animatedValue.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, sliderWidth - 24],
                  }),
                },
              ],
            },
          ]}
        />
      </View>
      <View style={styles.labels}>
        <Text style={styles.label}>Low</Text>
        <Text style={styles.label}>High</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
  },
  emoji: {
    fontSize: 48,
    textAlign: 'center',
    marginBottom: 16,
  },
  sliderContainer: {
    height: 40,
    justifyContent: 'center',
    position: 'relative',
  },
  track: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: '#6366F1',
    borderRadius: 4,
  },
  thumb: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#6366F1',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  labels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  label: {
    fontSize: 12,
    color: '#6B7280',
  },
});
