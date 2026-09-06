import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

export const SimulatedMap = ({
  worker,
  workerName,
  userAddress,
  customerArea,
  onArrival,
  durationMs,
  durationSeconds,
  autoStart = true,
  mode = 'tracking', // 'tracking' | 'preview' | 'worker_accept'
  showWorkerAcceptControls = false,
  onAcceptJob,
  onDeclineJob,
  jobEarnings = 320,
  customerDistance = '1.2 km',
  serviceName = 'Artisan Service'
}) => {
  // Normalize duration
  const effectiveDurationMs = durationMs || (durationSeconds ? durationSeconds * 1000 : 12000);

  // Normalize worker object
  const normalizedWorker = worker || {
    name: workerName || 'Ravi Kumar (Worker)',
    skill: 'Verified Artisan',
    eta_minutes: 6,
    distance_km: 1.2,
    cooperative: 'District Cooperative Federation'
  };

  const [mapWidth, setMapWidth] = useState(360);
  const [mapHeight, setMapHeight] = useState(240);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [mapLayer, setMapLayer] = useState('street'); // 'street' | 'satellite'

  const progressAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const [eta, setEta] = useState(normalizedWorker?.eta_minutes || 6);
  const [distance, setDistance] = useState(normalizedWorker?.distance_km || 1.2);
  const [hasArrived, setHasArrived] = useState(false);
  const [currentTurn, setCurrentTurn] = useState('Route to customer doorstep calculated');
  const [speed, setSpeed] = useState('32 km/h');

  const TURN_BY_TURN_STEPS = [
    { at: 0.0, turn: 'Departed from Lajpat Nagar Artisan Stand', speed: '24 km/h' },
    { at: 0.25, turn: 'Navigating via Inner Ring Road Flyover', speed: '36 km/h' },
    { at: 0.55, turn: 'Approaching Customer Sector Gate 3', speed: '28 km/h' },
    { at: 0.82, turn: 'Entering Street • 100m to Destination', speed: '16 km/h' },
    { at: 1.0, turn: 'Arrived at customer doorstep! 🎉', speed: '0 km/h' }
  ];

  // Radar Pulse Animation
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.4,
          duration: 1200,
          useNativeDriver: Platform.OS !== 'web'
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: Platform.OS !== 'web'
        })
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  // Moving Vehicle Animation
  useEffect(() => {
    if (!autoStart || mode === 'preview' || mode === 'worker_accept') {
      progressAnim.setValue(0.18); // Staging preview
      return;
    }

    progressAnim.setValue(0);
    setHasArrived(false);

    const animation = Animated.timing(progressAnim, {
      toValue: 1,
      duration: effectiveDurationMs,
      useNativeDriver: false
    });

    const listenerId = progressAnim.addListener(({ value }) => {
      const initialDist = normalizedWorker?.distance_km || 1.2;
      const initialEta = normalizedWorker?.eta_minutes || 6;

      const currentDist = Math.max(0, initialDist * (1 - value)).toFixed(1);
      const currentEta = Math.max(1, Math.ceil(initialEta * (1 - value)));

      setDistance(currentDist);
      setEta(currentEta);

      // Match turn step
      for (let i = TURN_BY_TURN_STEPS.length - 1; i >= 0; i--) {
        if (value >= TURN_BY_TURN_STEPS[i].at) {
          setCurrentTurn(TURN_BY_TURN_STEPS[i].turn);
          setSpeed(TURN_BY_TURN_STEPS[i].speed);
          break;
        }
      }

      if (value >= 0.98 && !hasArrived) {
        setHasArrived(true);
        setCurrentTurn('Arrived at customer doorstep! 🎉');
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
  }, [autoStart, mode, effectiveDurationMs]);

  const handleFastForward = () => {
    progressAnim.setValue(1);
    setDistance('0.0');
    setEta(0);
    setHasArrived(true);
    setCurrentTurn('Arrived at customer doorstep! 🎉');
    if (onArrival) {
      onArrival();
    }
  };

  const handleResetRoute = () => {
    progressAnim.setValue(0);
    setDistance(normalizedWorker?.distance_km || 1.2);
    setEta(normalizedWorker?.eta_minutes || 6);
    setHasArrived(false);
    setCurrentTurn('Departed from Lajpat Nagar Artisan Stand');
  };

  // Safe coordinates calculated relative to container layout
  const maxSafeX = Math.max(120, mapWidth - 65);
  const maxSafeY = Math.max(120, mapHeight - 55);

  const markerX = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [28, maxSafeX]
  });

  const markerY = progressAnim.interpolate({
    inputRange: [0, 0.35, 0.7, 1],
    outputRange: [30, Math.min(110, maxSafeY * 0.55), Math.min(85, maxSafeY * 0.42), maxSafeY]
  });

  const isWorkerAcceptMode = mode === 'worker_accept' || showWorkerAcceptControls;

  return (
    <View
      style={styles.container}
      onLayout={(e) => {
        const { width: w, height: h } = e.nativeEvent.layout;
        if (w > 0) setMapWidth(w);
        if (h > 0) setMapHeight(h);
      }}
    >
      {/* Turn-by-Turn Navigation Header */}
      <View style={styles.navigationHeader}>
        <View style={styles.navIconBox}>
          <Ionicons
            name={hasArrived ? 'flag' : isWorkerAcceptMode ? 'navigate-circle' : 'navigate'}
            size={18}
            color="#FFFFFF"
          />
        </View>
        <View style={styles.navTextCol}>
          <Text style={styles.turnTitle} numberOfLines={1}>
            {isWorkerAcceptMode ? 'WORKER CONVENIENCE ROUTE & DISPATCH RADAR' : currentTurn}
          </Text>
          <View style={styles.navMetaRow}>
            <Text style={styles.navSpeedText}>
              {isWorkerAcceptMode ? 'Pickup to Jobsite Distance' : `Speed: ${speed}`}
            </Text>
            <Text style={styles.navDot}>•</Text>
            <Text style={styles.navPlateText}>
              {isWorkerAcceptMode ? `${customerDistance || `${distance} km`} away (~${eta} mins)` : 'Artisan EV DL 3S CD 8492'}
            </Text>
          </View>
        </View>

        {/* Map Type Toggle */}
        <TouchableOpacity
          style={styles.layerToggleBtn}
          onPress={() => setMapLayer((prev) => (prev === 'street' ? 'satellite' : 'street'))}
          activeOpacity={0.7}
        >
          <Ionicons
            name={mapLayer === 'street' ? 'map' : 'earth'}
            size={14}
            color="#FFFFFF"
          />
          <Text style={styles.layerToggleText}>
            {mapLayer === 'street' ? 'Street' : 'Sat'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Realistic Interactive Map Canvas */}
      <View
        style={[
          styles.mapCanvas,
          mapLayer === 'satellite' ? styles.mapCanvasSatellite : styles.mapCanvasStreet
        ]}
      >
        {/* Road Grid Matrix */}
        <View style={[styles.roadHorizontal, { top: 40 }]} />
        <View style={[styles.roadHorizontal, { top: 120 }]} />
        <View style={[styles.roadHorizontal, { top: 180 }]} />

        <View style={[styles.roadVertical, { left: '18%' }]} />
        <View style={[styles.roadVertical, { left: '50%' }]} />
        <View style={[styles.roadVertical, { left: '82%' }]} />

        {/* Sector Landmark Badges */}
        <View style={[styles.sectorBadge, { top: 12, left: 12 }]}>
          <Ionicons name="business-outline" size={10} color="#64748B" />
          <Text style={styles.sectorLabel}>Artisan Co-op Stand</Text>
        </View>

        <View style={[styles.sectorBadge, { top: 90, right: 14 }]}>
          <Ionicons name="subway-outline" size={10} color="#64748B" />
          <Text style={styles.sectorLabel}>Metro Hub Gate 2</Text>
        </View>

        <View style={[styles.sectorBadge, { bottom: 12, left: 16 }]}>
          <Ionicons name="home-outline" size={10} color="#64748B" />
          <Text style={styles.sectorLabel}>{customerArea || 'Customer Area Block B'}</Text>
        </View>

        {/* Origin / Cooperative Hub Staging Pin */}
        <View style={[styles.originPin, { left: 18, top: 22 }]}>
          <View style={styles.originCircle}>
            <Ionicons name="construct" size={14} color="#FFFFFF" />
          </View>
          <View style={styles.pinTag}>
            <Text style={styles.pinTagText}>Your Stand</Text>
          </View>
        </View>

        {/* Customer Destination Pin */}
        <View style={[styles.destinationPin, { right: 20, bottom: 20 }]}>
          <Animated.View
            style={[
              styles.radarPulse,
              {
                transform: [{ scale: pulseAnim }]
              }
            ]}
          />
          <View style={styles.homePinCircle}>
            <Ionicons name="location" size={18} color="#FFFFFF" />
          </View>
          <View style={styles.pinTagDestination}>
            <Text style={styles.pinTagDestText} numberOfLines={1}>
              {userAddress || customerArea || 'Customer Location'}
            </Text>
          </View>
        </View>

        {/* Live Moving Vehicle / Worker GPS Marker */}
        <Animated.View
          style={[
            styles.vehicleMarker,
            {
              transform: [{ translateX: markerX }, { translateY: markerY }]
            }
          ]}
        >
          <View style={styles.vehicleCircle}>
            <Ionicons
              name={normalizedWorker?.skill === 'Driver' ? 'car' : 'bicycle'}
              size={18}
              color="#FFFFFF"
            />
          </View>
          <View style={styles.driverTag}>
            <Text style={styles.driverTagText} numberOfLines={1}>
              {normalizedWorker?.name?.split(' ')[0] || 'Artisan'}
            </Text>
          </View>
        </Animated.View>

        {/* Zoom Controls Overlay */}
        <View style={styles.zoomControlBox}>
          <TouchableOpacity
            style={styles.zoomBtn}
            onPress={() => setZoomLevel((z) => Math.min(z + 0.2, 1.6))}
            activeOpacity={0.7}
          >
            <Ionicons name="add" size={14} color={colors.textPrimary} />
          </TouchableOpacity>
          <View style={styles.zoomDivider} />
          <TouchableOpacity
            style={styles.zoomBtn}
            onPress={() => setZoomLevel((z) => Math.max(z - 0.2, 0.8))}
            activeOpacity={0.7}
          >
            <Ionicons name="remove" size={14} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Live Distance & Status Bar */}
      <View style={styles.statusBar}>
        <View style={styles.statusCol}>
          <View style={styles.statusLiveBadge}>
            <View
              style={[
                styles.statusDot,
                { backgroundColor: hasArrived ? colors.success : colors.warning }
              ]}
            />
            <Text style={styles.statusLabel}>
              {isWorkerAcceptMode
                ? 'JOB DISPATCH RADAR'
                : hasArrived
                ? 'ARTISAN ARRIVED'
                : 'LIVE GPS ROUTE'}
            </Text>
          </View>
          <Text style={styles.statusValue}>
            {hasArrived
              ? 'At Customer Doorstep'
              : `${distance} km • ETA ${eta} mins`}
          </Text>
        </View>

        {/* Controls based on mode */}
        {isWorkerAcceptMode ? (
          <View style={styles.workerAcceptBadgeRow}>
            <View style={styles.payoutChip}>
              <Text style={styles.payoutChipLabel}>EARNING</Text>
              <Text style={styles.payoutChipVal}>₹{jobEarnings}</Text>
            </View>
            {onAcceptJob && (
              <TouchableOpacity
                style={styles.workerAcceptBtn}
                onPress={onAcceptJob}
                activeOpacity={0.85}
              >
                <Ionicons name="checkmark-circle" size={14} color="#FFFFFF" />
                <Text style={styles.workerAcceptBtnText}>Accept Job</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View style={styles.statusActionsRow}>
            {!hasArrived && (
              <TouchableOpacity
                style={styles.fastForwardBtn}
                onPress={handleFastForward}
                activeOpacity={0.8}
              >
                <Ionicons name="play-forward" size={13} color={colors.primary} />
                <Text style={styles.fastForwardText}>Fast Forward</Text>
              </TouchableOpacity>
            )}
            {hasArrived && (
              <TouchableOpacity
                style={styles.resetBtn}
                onPress={handleResetRoute}
                activeOpacity={0.8}
              >
                <Ionicons name="refresh" size={12} color={colors.textSecondary} />
                <Text style={styles.resetBtnText}>Replay</Text>
              </TouchableOpacity>
            )}
          </View>
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
    position: 'relative',
    marginVertical: 8
  },
  navigationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryDark,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.12)'
  },
  navIconBox: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 9
  },
  navTextCol: {
    flex: 1,
    marginRight: 8
  },
  turnTitle: {
    fontSize: 12,
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
  layerToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8
  },
  layerToggleText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: 3
  },
  mapCanvas: {
    height: 220,
    width: '100%',
    position: 'relative',
    overflow: 'hidden'
  },
  mapCanvasStreet: {
    backgroundColor: '#E8ECF0'
  },
  mapCanvasSatellite: {
    backgroundColor: '#1E293B'
  },
  roadHorizontal: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#D1D5DB'
  },
  roadVertical: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 18,
    backgroundColor: '#FFFFFF',
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#D1D5DB'
  },
  sectorBadge: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  sectorLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#64748B',
    marginLeft: 3,
    textTransform: 'uppercase',
    letterSpacing: 0.3
  },
  originPin: {
    position: 'absolute',
    alignItems: 'center',
    zIndex: 10
  },
  originCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF'
  },
  pinTag: {
    backgroundColor: colors.surface,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
    marginTop: 2,
    borderWidth: 1,
    borderColor: colors.border
  },
  pinTagText: {
    fontSize: 8,
    fontWeight: '800',
    color: colors.primary
  },
  destinationPin: {
    position: 'absolute',
    alignItems: 'center',
    zIndex: 10
  },
  radarPulse: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(16, 185, 129, 0.25)',
    top: -4
  },
  homePinCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4
  },
  pinTagDestination: {
    backgroundColor: colors.surface,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 3,
    borderWidth: 1,
    borderColor: colors.border
  },
  pinTagDestText: {
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
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
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
  zoomControlBox: {
    position: 'absolute',
    right: 12,
    top: 12,
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    zIndex: 15
  },
  zoomBtn: {
    width: 26,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center'
  },
  zoomDivider: {
    height: 1,
    backgroundColor: colors.border
  },
  statusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border
  },
  statusCol: {
    flex: 1,
    marginRight: 8
  },
  statusLiveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    marginRight: 5
  },
  statusLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.textSecondary,
    letterSpacing: 0.5
  },
  statusValue: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textPrimary
  },
  statusActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  fastForwardBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primarySubtle,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border
  },
  fastForwardText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.primary,
    marginLeft: 3
  },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSecondary,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border
  },
  resetBtnText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.textSecondary,
    marginLeft: 3
  },
  workerAcceptBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  payoutChip: {
    backgroundColor: colors.successLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignItems: 'flex-end'
  },
  payoutChipLabel: {
    fontSize: 8,
    fontWeight: '800',
    color: colors.successDark
  },
  payoutChipVal: {
    fontSize: 12,
    fontWeight: '900',
    color: colors.successDark
  },
  workerAcceptBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.success,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
    shadowColor: colors.success,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3
  },
  workerAcceptBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
    marginLeft: 4
  }
});

export default SimulatedMap;
