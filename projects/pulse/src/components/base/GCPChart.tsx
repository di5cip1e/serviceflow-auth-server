import React from 'react';
import { View, Text, StyleSheet, Dimensions, ViewStyle } from 'react-native';
import { LineChart, BarChart, RadarChart } from 'react-native-chart-kit';

type ChartType = 'line' | 'bar' | 'radar';

interface GCPChartProps {
  type: ChartType;
  data: any;
  title?: string;
  style?: ViewStyle;
}

const screenWidth = Dimensions.get('window').width;

const chartConfig = {
  backgroundColor: '#fff',
  backgroundGradientFrom: '#fff',
  backgroundGradientTo: '#fff',
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(99, 102, 241, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
  style: {
    borderRadius: 12,
  },
  propsForDots: {
    r: '4',
    strokeWidth: '2',
    stroke: '#6366F1',
  },
};

export const GCPChart: React.FC<GCPChartProps> = ({
  type,
  data,
  title,
  style,
}) => {
  const renderChart = () => {
    switch (type) {
      case 'line':
        return (
          <LineChart
            data={data}
            width={screenWidth - 64}
            height={200}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
          />
        );
      case 'bar':
        return (
          <BarChart
            data={data}
            width={screenWidth - 64}
            height={200}
            chartConfig={chartConfig}
            style={styles.chart}
            yAxisLabel=""
            yAxisSuffix=""
          />
        );
      case 'radar':
        return (
          <RadarChart
            data={data}
            width={screenWidth - 64}
            height={250}
            chartConfig={chartConfig}
            style={styles.chart}
          />
        );
      default:
        return null;
    }
  };

  return (
    <View style={[styles.container, style]}>
      {title && <Text style={styles.title}>{title}</Text>}
      {renderChart()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  chart: {
    borderRadius: 12,
    marginLeft: -16,
  },
});
