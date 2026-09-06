import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useUser } from '../context/UserContext';

export const WorkerTrustCard = ({
  worker,
  showMatchReason = true,
  showActions = true,
  onConfirm,
  onFindAnother,
  confirmLabel = 'Confirm & Start Tracking',
  findAnotherLabel = 'Show Next Available Worker'
}) => {
  const { t } = useUser();

  if (!worker) return null;

  return (
    <View style={styles.card}>
      {/* Top Profile Row */}
      <View style={styles.topRow}>
        <Image source={{ uri: worker.photo }} style={styles.avatar} />
        <View style={styles.profileInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{worker.name}</Text>
            <View style={styles.ratingBadge}>
              <Ionicons name="star" size={12} color="#F59E0B" />
              <Text style={styles.ratingText}>{worker.rating}</Text>
              <Text style={styles.ratingCount}>({worker.rating_count || 200}+)</Text>
            </View>
          </View>
          <Text style={styles.skillExp}>
            {worker.skill} • {worker.experience}
          </Text>
          <Text style={styles.cooperative}>{worker.cooperative}</Text>
        </View>
      </View>

      {/* Trust Badges */}
      <View style={styles.badgesRow}>
        {worker.kyc_verified && (
          <View style={[styles.badge, styles.badgeSuccess]}>
            <Ionicons name="checkmark-circle" size={12} color={colors.successDark} />
            <Text style={styles.badgeSuccessText}>{t('kycVerified')}</Text>
          </View>
        )}
        {worker.insurance && (
          <View style={[styles.badge, styles.badgePrimary]}>
            <Ionicons name="shield-checkmark" size={12} color={colors.primary} />
            <Text style={styles.badgePrimaryText}>{t('insured')}</Text>
          </View>
        )}
        {worker.badge && (
          <View style={[styles.badge, styles.badgePurple]}>
            <Ionicons name="ribbon" size={12} color={colors.cooperativePurple} />
            <Text style={styles.badgePurpleText}>{worker.badge}</Text>
          </View>
        )}
      </View>

      {/* Proximity & ETA Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statCol}>
          <Ionicons name="location-outline" size={16} color={colors.textSecondary} />
          <Text style={styles.statVal}>{worker.distance_km} km</Text>
          <Text style={styles.statLabel}>Distance</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statCol}>
          <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
          <Text style={styles.statVal}>{worker.eta_minutes} mins</Text>
          <Text style={styles.statLabel}>Estimated Arrival</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statCol}>
          <Ionicons name="construct-outline" size={16} color={colors.textSecondary} />
          <Text style={styles.statVal}>{worker.jobs_completed || 210}+</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
      </View>

      {/* AI Match Rationale Box */}
      {showMatchReason && worker.match_reason && (
        <View style={styles.matchReasonBox}>
          <Ionicons name="sparkles" size={16} color={colors.primary} style={styles.sparkleIcon} />
          <Text style={styles.matchReasonText}>
            <Text style={{ fontWeight: '800' }}>Algorithm Match:</Text> {worker.match_reason}
          </Text>
        </View>
      )}

      {/* Action Buttons */}
      {showActions && (
        <View style={styles.actionContainer}>
          {onConfirm && (
            <TouchableOpacity style={styles.confirmButton} onPress={onConfirm} activeOpacity={0.85}>
              <Text style={styles.confirmButtonText}>{confirmLabel}</Text>
              <Ionicons name="arrow-forward" size={16} color="#FFFFFF" style={{ marginLeft: 6 }} />
            </TouchableOpacity>
          )}
          {onFindAnother && (
            <TouchableOpacity style={styles.findAnotherButton} onPress={onFindAnother} activeOpacity={0.75}>
              <Ionicons name="refresh" size={14} color={colors.textSecondary} style={{ marginRight: 4 }} />
              <Text style={styles.findAnotherText}>{findAnotherLabel}</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 14,
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.surfaceSecondary,
    marginRight: 12
  },
  profileInfo: {
    flex: 1
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2
  },
  name: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
    flex: 1
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.warningLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.warningDark,
    marginLeft: 3
  },
  ratingCount: {
    fontSize: 10,
    color: colors.textSecondary,
    marginLeft: 2
  },
  skillExp: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500'
  },
  cooperative: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: '600',
    marginTop: 2
  },
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 12
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8
  },
  badgeSuccess: {
    backgroundColor: colors.successLight
  },
  badgeSuccessText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.successDark,
    marginLeft: 4
  },
  badgePrimary: {
    backgroundColor: colors.primarySubtle
  },
  badgePrimaryText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.primary,
    marginLeft: 4
  },
  badgePurple: {
    backgroundColor: '#EDE9FE'
  },
  badgePurpleText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.cooperativePurple,
    marginLeft: 4
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 14,
    paddingVertical: 10,
    marginTop: 12
  },
  statCol: {
    alignItems: 'center'
  },
  statVal: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.textPrimary,
    marginTop: 2
  },
  statLabel: {
    fontSize: 9,
    color: colors.textSecondary,
    marginTop: 1
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: colors.border
  },
  matchReasonBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.primarySubtle,
    borderRadius: 12,
    padding: 10,
    marginTop: 12,
    borderWidth: 1,
    borderColor: colors.border
  },
  sparkleIcon: {
    marginRight: 6,
    marginTop: 1
  },
  matchReasonText: {
    fontSize: 11,
    color: colors.primaryText,
    flex: 1,
    lineHeight: 15
  },
  actionContainer: {
    marginTop: 14,
    gap: 8
  },
  confirmButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 14,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3
  },
  confirmButtonText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF'
  },
  findAnotherButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8
  },
  findAnotherText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary
  }
});

export default WorkerTrustCard;
