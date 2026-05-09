// OCEANChart Component
// Radar chart for Big Five personality dimensions

import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CHART_SIZE = Math.min(SCREEN_WIDTH - 80, 280);
const CENTER = CHART_SIZE / 2;
const RADIUS = (CHART_SIZE - 40) / 2;

interface OCEANChartProps {
  openness: number;
  conscientiousness: number;
  extroversion: number;
  agreeableness: number;
  neuroticism: number;
  showLabels?: boolean;
  comparisonData?: {
    openness: number;
    conscientiousness: number;
    extroversion: number;
    agreeableness: number;
    neuroticism: number;
  };
}

const dimensionLabels = ['Openness', 'Conscientious', 'Extroversion', 'Agreeable', 'Neuroticism'];
const dimensionColors = [
  colors.ocean.openness,
  colors.ocean.conscientiousness,
  colors.ocean.extroversion,
  colors.ocean.agreeableness,
  colors.ocean.neuroticism,
];

export const OCEANChart: React.FC<OCEANChartProps> = ({
  openness,
  conscientiousness,
  extroversion,
  agreeableness,
  neuroticism,
  showLabels = true,
  comparisonData,
}) => {
  const values = [openness, conscientiousness, extroversion, agreeableness, neuroticism];
  const comparisonValues = comparisonData 
    ? [comparisonData.openness, comparisonData.conscientiousness, comparisonData.extroversion, comparisonData.agreeableness, comparisonData.neuroticism]
    : [];

  // Calculate points for polygon
  const getPoints = (dataValues: number[]) => {
    return dataValues.map((value, index) => {
      const angle = (index * 2 * Math.PI) / 5 - Math.PI / 2;
      const radius = (value / 100) * RADIUS;
      return {
        x: CENTER + radius * Math.cos(angle),
        y: CENTER + radius * Math.sin(angle),
      };
    });
  };

  const mainPoints = getPoints(values);
  const comparisonPoints = comparisonValues.length > 0 ? getPoints(comparisonValues) : [];

  // Create SVG-like path
  const createPath = (points: { x: number; y: number }[]) => {
    return points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';
  };

  // Generate grid circles
  const gridCircles = [20, 40, 60, 80, 100].map(percent => (
    <View
      key={percent}
      style={[
        styles.gridCircle,
        {
          width: (percent / 100) * CHART_SIZE,
          height: (percent / 100) * CHART_SIZE,
          borderRadius: (percent / 100) * RADIUS,
          left: (CHART_SIZE - (percent / 100) * CHART_SIZE) / 2,
          top: (CHART_SIZE - (percent / 100) * CHART_SIZE) / 2,
        },
      ]}
    />
  ));

  // Generate axis lines
  const axisLines = values.map((_, index) => {
    const angle = (index * 2 * Math.PI) / 5 - Math.PI / 2;
    return (
      <View
        key={index}
        style={[
          styles.axisLine,
          {
            width: 2,
            height: RADIUS,
            left: CENTER,
            top: CENTER,
            transform: [
              { rotate: `${(index * 360) / 5 - 90}deg` },
              { translateY: -RADIUS / 2 },
            ],
          },
        ]}
      />
    );
  });

  return (
    <View style={styles.container}>
      <View style={styles.chartContainer}>
        {/* Grid circles */}
        {gridCircles}
        
        {/* Axis lines */}
        {axisLines}

        {/* Main data polygon (simplified using overlapping circles for React Native) */}
        <View style={styles.polygonContainer}>
          {mainPoints.map((point, index) => (
            <View
              key={`main-${index}`}
              style={[
                styles.dataPoint,
                {
                  left: point.x - 8,
                  top: point.y - 8,
                  backgroundColor: colors.primary,
                },
              ]}
            />
          ))}
          {/* Connecting lines using Views */}
          <View style={styles.connectingLines}>
            {mainPoints.map((point, index) => {
              const nextPoint = mainPoints[(index + 1) % mainPoints.length];
              const dx = nextPoint.x - point.x;
              const dy = nextPoint.y - point.y;
              const length = Math.sqrt(dx * dx + dy * dy);
              const angle = Math.atan2(dy, dx) * (180 / Math.PI);
              
              return (
                <View
                  key={`line-${index}`}
                  style={[
                    styles.connectionLine,
                    {
                      width: length,
                      left: point.x,
                      top: point.y,
                      transform: [{ rotate: `${angle}deg` }],
                      backgroundColor: colors.primary,
                      opacity: 0.6,
                    },
                  ]}
                />
              );
            })}
          </View>
        </View>

        {/* Comparison data */}
        {comparisonPoints.length > 0 && (
          <View style={styles.polygonContainer}>
            {comparisonPoints.map((point, index) => (
              <View
                key={`comp-${index}`}
                style={[
                  styles.dataPoint,
                  {
                    left: point.x - 6,
                    top: point.y - 6,
                    width: 12,
                    height: 12,
                    backgroundColor: colors.secondary,
                  },
                ]}
              />
            ))}
          </View>
        )}

        {/* Labels */}
        {showLabels && values.map((value, index) => {
          const angle = (index * 2 * Math.PI) / 5 - Math.PI / 2;
          const labelRadius = RADIUS + 25;
          const x = CENTER + labelRadius * Math.cos(angle);
          const y = CENTER + labelRadius * Math.sin(angle);
          
          return (
            <View
              key={`label-${index}`}
              style={[
                styles.label,
                {
                  left: x - 50,
                  top: y - 10,
                  width: 100,
                },
              ]}
            >
              <Text style={[styles.labelText, { color: dimensionColors[index] }]}>
                {dimensionLabels[index]}
              </Text>
              <Text style={styles.labelValue}>{Math.round(value)}</Text>
            </View>
          );
        })}
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.primary }]} />
          <Text style={styles.legendText}>Your Profile</Text>
        </View>
        {comparisonValues.length > 0 && (
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: colors.secondary }]} />
            <Text style={styles.legendText}>Contact</Text>
          </View>
        )}
      </View>
    </View>
  );
};

// Simplified horizontal bar chart version for profiles
export const OCEANDimensionBar: React.FC<{
  label: string;
  value: number;
  color: string;
  comparisonValue?: number;
}> = ({ label, value, color, comparisonValue }) => {
  return (
    <View style={styles.barContainer}>
      <View style={styles.barHeader}>
        <Text style={styles.barLabel}>{label}</Text>
        <Text style={styles.barValue}>{Math.round(value)}</Text>
      </View>
      <View style={styles.barTrack}>
        <View
          style={[
            styles.barFill,
            { width: `${value}%`, backgroundColor: color },
          ]}
        />
        {comparisonValue !== undefined && (
          <View
            style={[
              styles.comparisonMarker,
              { left: `${comparisonValue}%` },
            ]}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  chartContainer: {
    width: CHART_SIZE,
    height: CHART_SIZE,
    position: 'relative',
  },
  gridCircle: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'transparent',
  },
  axisLine: {
    position: 'absolute',
    backgroundColor: colors.border,
  },
  polygonContainer: {
    position: 'absolute',
    width: CHART_SIZE,
    height: CHART_SIZE,
  },
  connectingLines: {
    position: 'absolute',
    width: CHART_SIZE,
    height: CHART_SIZE,
  },
  connectionLine: {
    position: 'absolute',
    height: 2,
    transformOrigin: 'left center',
  },
  dataPoint: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.white,
  },
  label: {
    position: 'absolute',
    alignItems: 'center',
  },
  labelText: {
    ...typography.label,
    fontWeight: '600',
  },
  labelValue: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xl,
    marginTop: spacing.md,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    ...typography.bodySmall,
  },
  // Bar styles
  barContainer: {
    marginBottom: spacing.md,
  },
  barHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  barLabel: {
    ...typography.label,
  },
  barValue: {
    ...typography.body,
    fontWeight: '600',
  },
  barTrack: {
    height: 8,
    backgroundColor: colors.background,
    borderRadius: 4,
    overflow: 'visible',
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
  },
  comparisonMarker: {
    position: 'absolute',
    top: -4,
    width: 3,
    height: 16,
    backgroundColor: colors.secondary,
    borderRadius: 1,
    marginLeft: -1.5,
  },
});