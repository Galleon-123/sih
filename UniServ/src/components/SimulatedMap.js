import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableOpacity
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

const { width } = Dimensions.get('window');

export const SimulatedMap = ({
  worker,
  userAddress,
  onArrival,
  durationMs = 15000,
  autoStart = true
}) => {
  const progressAnim = useRef(new Animated.Value(0)).current;
  const [eta, setEta] = useState(worker?.eta_minutes || 10);
  const [distance, setDistance] = useState(worker?.distance_km || 1.2);
  const [hasArrived, setHasArrived] = useState(false);
  const [currentTurn, setCurrentTurn] = useState('Departed from South Delhi Cooperative Hub');
  const [speed, setSpeed] = useState('28 km/h');

  const TURN_BY_TURN_STEPS = [
    { at: 0.0, turn: 'Departed from Lajpat Nagar Cooperative Hub', speed: '24 km/h' },
    { at: 0.25, turn: 'Turning right towards Ring Road Flyover', speed: '32 km/h' },
    { at: 0.55, turn: 'Crossing Metro Station Pillar 42', speed: '28 km/h' },
    { at: 0.85, turn: 'Entering Block B Gate • Approaching Street', speed: '16 km/h' },
    { at: 1.0, turn: 'Arrived at your doorstep! 🎉', speed: '0 km/h' }
  ];

  useEffect(() => {
    if (!autoStart) return;

    progressAnim.setValue(0);
    setHasArrived(false);

    const animation = Animated.timing(progressAnim, {
      toValue: 1,
      duration: durationMs,
      useNativeDriver: false
    });

    const listenerId = progressAnim.addListener(({ value }) => {
      const initialDist = worker?.distance_km || 1.2;
      const initialEta = worker?.eta_minutes || 10;

      const currentDist = Math.max(0, initialDist * (1 - value)).toFixed(1);
      const currentEta = Math.max(1, Math.ceil(initialEta * (1 - value)));

      setDistance(currentDist);
      setEta(currentEta);

      // Find matching turn-by-turn instruction
      for (let i = TURN_BY_TURN_STEPS.length - 1; i >= 0; i--) {
        if (value >= TURN_BY_TURN_STEPS[i].at) {
          setCurrentTurn(TURN_BY_TURN_STEPS[i].turn);
          setSpeed(TURN_BY_TURN_STEPS[i].speed);
          break;
        }
      }

      if (value >= 0.98 && !hasArrived) {
        setHasArrived(true);
        setCurrentTurn('Arrived at your doorstep! 🎉');
        if (onArrival) {
          onArrival();
        }
      }
    });

    animation.start();

    return () => {
      progressAnim.removeListener(listenerId);
      animation.stop();
    };
  }, [autoStart]);

  const handleFastForward = () => {
    progressAnim.setValue(1);
    setDistance('0.0');
    setEta(0);
    setHasArrived(true);
    setCurrentTurn('Arrived at your doorstep! 🎉');
    if (onArrival) {
      onArrival();
    }
  };

  const markerX = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [35, width - 85]
  });

  const markerY = progressAnim.interpolate({
    inputRange: [0, 0.35, 0.7, 1],
    outputRange: [40, 130, 95, 175]
  });

  return (
    <View style={styles.container}>
      {/* Rapido/Uber Turn-by-Turn Header Ticker */}
      <View style={styles.navigationHeader}>
        <View style={styles.navIconBox}>
          <Ionicons name={hasArrived ? 'flag' : 'navigate'} size={18} color="#FFFFFF" />
        </View>
        <View style={styles.navTextCol}>
          <Text style={styles.turnTitle} numberOfLines={1}>
            {currentTurn}
          </Text>
          <View style={styles.navMetaRow}>
            <Text style={styles.navSpeedText}>Speed: {speed}</Text>
            <Text style={styles.navDot}>•</Text>
            <Text style={styles.navPlateText}>DL 3S CD 8492</Text>
          </View>
        </View>
      </View>

      {/* Realistic Simulated Map Grid Canvas */}
      <View style={styles.mapCanvas}>
        {/* Road Grid lines */}
        <View style={[styles.roadHorizontal, { top: 50 }]} />
        <View style={[styles.roadHorizontal, { top: 140 }]} />
        <View style={[styles.roadHorizontal, { top: 190 }]} />
        
        <View style={[styles.roadVertical, { left: '20%' }]} />
        <View style={[styles.roadVertical, { left: '55%' }]} />
        <View style={[styles.roadVertical, { left: '80%' }]} />

        {/* Sector Labels */}
        <Text style={[styles.sectorLabel, { top: 15, left: 15 }]}>Main Ring Road</Text>
        <Text style={[styles.sectorLabel, { top: 100, right: 25 }]}>Metro Station Sector</Text>
        <Text style={[styles.sectorLabel, { bottom: 15, left: 25 }]}>Lajpat Nagar Block B</Text>

        {/* Active Route Path */}
        <View style={styles.routePathLine} />

        {/* Home Destination Pin */}
        <View style={[styles.destinationPin, { right: 26, bottom: 35 }]}>
          <View style={styles.radarRing} />
          <View style={styles.homePinCircle}>
            <Ionicons name="home" size={16} color="#FFFFFF" />
          </View>
          <View style={styles.pinLabel}>
            <Text style={styles.pinLabelText} numberOfLines={1}>Your Location</Text>
          </View>
        </View>

        {/* Uber/Rapido style Vehicle Marker */}
        <Animated.View
          style={[
            styles.vehicleMarker,
            {
              transform: [{ translateX: markerX }, { translateY: markerY }]
            }
          ]}
        >
          <View style={styles.vehicleCircle}>
            <Ionicons name="bicycle" size={18} color="#FFFFFF" />
          </View>
          <View style={styles.driverTag}>
            <Text style={styles.driverTagText}>{worker?.name?.split(' ')[0] || 'Artisan'}</Text>
          </View>
        </Animated.View>
      </View>

      {/* Live Distance & ETA Bottom Bar */}
      <View style={styles.statusBar}>
        <View style={styles.statusCol}>
          <View style={styles.statusLiveBadge}>
            <View style={[styles.statusDot, { backgroundColor: hasArrived ? colors.success : colors.warning }]} />
            <Text style={styles.statusLabel}>
              {hasArrived ? 'ARTISAN ARRIVED' : 'LIVE GPS TRACKING'}
            </Text>
          </View>
          <Text style={styles.statusValue}>
            {hasArrived ? 'At Your Doorstep' : `${distance} km • ETA ${eta} mins`}
          </Text>
        </View>

        {!hasArrived && (
          <TouchableOpacity
            style={styles.fastForwardBtn}
            onPress={handleFastForward}
            activeOpacity={0.8}
          >
            <Ionicons name="play-forward" size={14} color={colors.primary} />
            <Text style={styles.fastForwardText}>Fast Forward</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: '#E5E9EC',
    position: 'relative'
  },
  navigationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryDark,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)'
  },
  navIconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10
  },
  navTextCol: {
    flex: 1
  },
  turnTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF'
  },
  navMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 1
  },
  navSpeedText: {
    fontSize: 10,
    color: '#93C5FD',
    fontWeight: '600'
  },
  navDot: {
    color: '#93C5FD',
    marginHorizontal: 4,
    fontSize: 10
  },
  navPlateText: {
    fontSize: 10,
    color: '#E2E8F0',
    fontWeight: '700'
  },
  mapCanvas: {
    height: 240,
    width: '100%',
    backgroundColor: '#E8ECF0',
    position: 'relative',
    overflow: 'hidden'
  },
  roadHorizontal: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 18,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#D3DAE1'
  },
  roadVertical: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 20,
    backgroundColor: '#FFFFFF',
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#D3DAE1'
  },
  sectorLabel: {
    position: 'absolute',
    fontSize: 9,
    fontWeight: '800',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  routePathLine: {
    position: 'absolute',
    top: 50,
    left: 45,
    right: 45,
    height: 130,
    borderWidth: 2.5,
    borderColor: colors.primaryLight,
    borderStyle: 'dashed',
    borderRadius: 28,
    opacity: 0.7
  },
  destinationPin: {
    position: 'absolute',
    alignItems: 'center',
    zIndex: 10
  },
  radarRing: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(5, 150, 105, 0.25)',
    top: -4
  },
  homePinCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4
  },
  pinLabel: {
    backgroundColor: colors.surface,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 4,
    borderWidth: 1,
    borderColor: colors.border
  },
  pinLabelText: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.textPrimary
  },
  vehicleMarker: {
    position: 'absolute',
    top: 0,
    left: 0,
    alignItems: 'center',
    zIndex: 20
  },
  vehicleCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 5
  },
  driverTag: {
    backgroundColor: colors.primaryDark,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 2
  },
  driverTagText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#FFFFFF'
  },
  statusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border
  },
  statusCol: {
    flex: 1
  },
  statusLiveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6
  },
  statusLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.textSecondary,
    letterSpacing: 0.5
  },
  statusValue: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textPrimary
  },
  fastForwardBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primarySubtle,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border
  },
  fastForwardText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
    marginLeft: 4
  }
});

export default SimulatedMap;
