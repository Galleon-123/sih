import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { BOOKING_STATUSES } from '../context/BookingContext';

const STATUS_DESCRIPTIONS = [
  'Request broadcasted to verified cooperative workers',
  'Artisan assigned & acknowledged the job',
  'Worker in transit to your registered address',
  'Worker reached doorstep — share Start OTP',
  'Service active & covered under Seva Suraksha',
  'Mutual sign-off & warranty protection activated'
];

export const BookingStatusStepper = ({ currentStep = 0, compact = false }) => {
  return (
    <View style={[styles.container, compact && styles.compactContainer]}>
      {BOOKING_STATUSES.map((status, index) => {
        const isCompleted = index < currentStep;
        const isCurrent = index === currentStep;
        const isFuture = index > currentStep;
        const isLast = index === BOOKING_STATUSES.length - 1;

        return (
          <View key={status} style={styles.stepRow}>
            {/* Indicator Column */}
            <View style={styles.indicatorCol}>
              <View
                style={[
                  styles.nodeCircle,
                  isCompleted && styles.nodeCompleted,
                  isCurrent && styles.nodeCurrent,
                  isFuture && styles.nodeFuture
                ]}
              >
                {isCompleted ? (
                  <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                ) : isCurrent ? (
                  <View style={styles.currentInnerDot} />
                ) : (
                  <View style={styles.futureInnerDot} />
                )}
              </View>

              {!isLast && (
                <View
                  style={[
                    styles.connectorLine,
                    isCompleted ? styles.connectorCompleted : styles.connectorFuture
                  ]}
                />
              )}
            </View>

            {/* Label Column */}
            <View style={[styles.labelCol, !isLast && styles.labelColPadding]}>
              <View style={styles.titleRow}>
                <Text
                  style={[
                    styles.stepTitle,
                    isCompleted && styles.stepTitleCompleted,
                    isCurrent && styles.stepTitleCurrent,
                    isFuture && styles.stepTitleFuture
                  ]}
                >
                  {status}
                </Text>
                {isCurrent && (
                  <View style={styles.liveTag}>
                    <Text style={styles.liveTagText}>CURRENT</Text>
                  </View>
                )}
              </View>

              {!compact && (
                <Text
                  style={[
                    styles.stepDesc,
                    isCurrent ? styles.stepDescCurrent : styles.stepDescMuted
                  ]}
                >
                  {STATUS_DESCRIPTIONS[index]}
                </Text>
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    padding: 18,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border
  },
  compactContainer: {
    padding: 12
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start'
  },
  indicatorCol: {
    alignItems: 'center',
    width: 28,
    marginRight: 12
  },
  nodeCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2
  },
  nodeCompleted: {
    backgroundColor: colors.success
  },
  nodeCurrent: {
    backgroundColor: colors.primarySubtle,
    borderWidth: 2,
    borderColor: colors.primaryLight
  },
  nodeFuture: {
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1.5,
    borderColor: colors.borderDark
  },
  currentInnerDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primaryLight
  },
  futureInnerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.textMuted
  },
  connectorLine: {
    width: 2,
    minHeight: 28,
    flex: 1,
    marginVertical: 2
  },
  connectorCompleted: {
    backgroundColor: colors.success
  },
  connectorFuture: {
    backgroundColor: colors.border
  },
  labelCol: {
    flex: 1
  },
  labelColPadding: {
    paddingBottom: 16
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: '600'
  },
  stepTitleCompleted: {
    color: colors.textPrimary
  },
  stepTitleCurrent: {
    color: colors.primary,
    fontWeight: '700'
  },
  stepTitleFuture: {
    color: colors.textMuted
  },
  stepDesc: {
    fontSize: 12,
    marginTop: 2,
    lineHeight: 16
  },
  stepDescCurrent: {
    color: colors.textSecondary
  },
  stepDescMuted: {
    color: colors.textMuted
  },
  liveTag: {
    backgroundColor: colors.primarySubtle,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.primaryLight
  },
  liveTagText: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.primary
  }
});

export default BookingStatusStepper;
