// screens/Dashboard/components/ChartCard.js
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BarChart } from 'react-native-chart-kit';

const { width } = Dimensions.get('window');

const ChartCard = ({ 
  title, 
  data, 
  color = '#3B82F6',
  subtitle,
  isLoading = false 
}) => {
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const scaleAnim = React.useRef(new Animated.Value(0.9)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const chartData = {
    labels: data?.labels || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        data: data?.values || [0, 0, 0, 0, 0, 0, 0],
      },
    ],
  };

  const chartConfig = {
    backgroundColor: 'transparent',
    backgroundGradientFrom: 'transparent',
    backgroundGradientTo: 'transparent',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(100, 116, 139, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: color,
    },
  };

  if (isLoading) {
    return (
      <Animated.View 
        style={[
          styles.container,
          styles.loadingContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }]
          }
        ]}
      >
        <View style={styles.loadingContent}>
          <View style={styles.loadingTitle} />
          <View style={styles.loadingChart} />
          <View style={styles.loadingLegend} />
        </View>
      </Animated.View>
    );
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }]
        }
      ]}
    >
      <LinearGradient
        colors={['#FFFFFF', '#F8FAFC']}
        style={styles.gradientBackground}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{title}</Text>
            {subtitle && (
              <Text style={styles.subtitle}>{subtitle}</Text>
            )}
          </View>
          <View style={[styles.indicator, { backgroundColor: color }]} />
        </View>

        {/* Chart */}
        <View style={styles.chartContainer}>
          <BarChart
            data={chartData}
            width={width - 80}
            height={180}
            chartConfig={chartConfig}
            verticalLabelRotation={0}
            fromZero
            showBarTops
            showValuesOnTopOfBars
            withInnerLines={false}
            withVerticalLabels={true}
            withHorizontalLabels={true}
            withDots={false}
            withShadow={false}
            style={styles.chart}
          />
        </View>

        {/* Legend */}
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: color }]} />
            <Text style={styles.legendText}>This Week</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: color + '40' }]} />
            <Text style={styles.legendText}>Last Week</Text>
          </View>
        </View>

        {/* Decorative Elements */}
        <View style={[styles.decorativeCircle, { backgroundColor: color + '15' }]} />
      </LinearGradient>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
    overflow: 'hidden',
    marginBottom: 20,
  },
  loadingContainer: {
    backgroundColor: '#F1F5F9',
  },
  gradientBackground: {
    padding: 20,
    position: 'relative',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
  },
  indicator: {
    width: 4,
    height: 24,
    borderRadius: 2,
  },
  chartContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  chart: {
    borderRadius: 16,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  decorativeCircle: {
    position: 'absolute',
    top: -20,
    right: -20,
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  // Loading states
  loadingContent: {
    padding: 20,
  },
  loadingTitle: {
    width: '60%',
    height: 18,
    backgroundColor: '#E2E8F0',
    borderRadius: 9,
    marginBottom: 20,
  },
  loadingChart: {
    width: '100%',
    height: 180,
    backgroundColor: '#E2E8F0',
    borderRadius: 16,
    marginBottom: 16,
  },
  loadingLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
  },
});

export default ChartCard;
