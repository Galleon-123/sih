import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Animated,
  TouchableOpacity,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

export const SplashScreen = ({ stageText = 'Initializing UniServ Cooperative Hub...', onSkip }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.85)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: Platform.OS !== 'web'
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: Platform.OS !== 'web'
      })
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.contentBox,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }]
          }
        ]}
      >
        {/* Brand Icon Shield */}
        <View style={styles.logoCircle}>
          <Ionicons name="shield-checkmark" size={48} color="#FFFFFF" />
        </View>

        <Text style={styles.brandTitle}>UniServ</Text>
        <View style={styles.badgeRow}>
          <Text style={styles.badgeText}>GOVT REGISTERED COOPERATIVE FEDERATION</Text>
        </View>

        <Text style={styles.tagline}>
          Fair Artisan Wages • Seva Suraksha Warranty • Zero Commission
        </Text>

        {/* Loading Spinner & Status Stage */}
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={styles.stageText}>{stageText}</Text>
        </View>

        {/* Quick Skip button in case of slow network */}
        {onSkip && (
          <TouchableOpacity style={styles.skipBtn} onPress={onSkip} activeOpacity={0.8}>
            <Text style={styles.skipBtnText}>Continue to App</Text>
            <Ionicons name="arrow-forward" size={14} color={colors.primary} style={{ marginLeft: 4 }} />
          </TouchableOpacity>
        )}
      </Animated.View>

      {/* Footer Assurance */}
      <View style={styles.footerWrap}>
        <Ionicons name="ribbon-outline" size={14} color={colors.textSecondary} />
        <Text style={styles.footerText}>
          Backed by NCCT &amp; District Labour Cooperative Society
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background || '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24
  },
  contentBox: {
    alignItems: 'center',
    maxWidth: 380,
    width: '100%'
  },
  logoCircle: {
    width: 88,
    height: 88,
    borderRadius: 28,
    backgroundColor: colors.primary || '#1E3A8A',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary || '#1E3A8A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    marginBottom: 18
  },
  brandTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: colors.textPrimary || '#0F172A',
    letterSpacing: -0.5
  },
  badgeRow: {
    backgroundColor: colors.primarySubtle || '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 8,
    borderWidth: 1,
    borderColor: colors.border || '#E2E8F0'
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.primary || '#1E3A8A',
    letterSpacing: 0.8
  },
  tagline: {
    fontSize: 13,
    color: colors.textSecondary || '#64748B',
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 18,
    paddingHorizontal: 12
  },
  loadingWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 32,
    backgroundColor: colors.surface || '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border || '#E2E8F0',
    shadowColor: colors.shadowColor || '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2
  },
  stageText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textPrimary || '#0F172A',
    marginLeft: 10
  },
  skipBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: colors.primarySubtle || '#EFF6FF',
    borderWidth: 1,
    borderColor: colors.border || '#E2E8F0'
  },
  skipBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary || '#1E3A8A'
  },
  footerWrap: {
    position: 'absolute',
    bottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  footerText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary || '#64748B'
  }
});

export default SplashScreen;
