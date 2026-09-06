import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useBooking } from '../context/BookingContext';
import { useUser } from '../context/UserContext';
import Header from '../components/Header';

export const MyBookingsScreen = ({ navigation }) => {
  const { activeBooking, pastBookings } = useBooking();
  const { t } = useUser();

  const handleResumeActive = () => {
    if (!activeBooking) return;
    if (activeBooking.statusIndex === 1 || activeBooking.statusIndex === 2) {
      navigation.navigate('LiveTracking');
    } else if (activeBooking.statusIndex === 3) {
      navigation.navigate('StartOTP');
    } else if (activeBooking.statusIndex === 4) {
      navigation.navigate('JobInProgress');
    } else if (activeBooking.statusIndex === 5) {
      navigation.navigate('Payment');
    } else {
      navigation.navigate('LiveTracking');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title={t('tabBookings')} />

      <FlatList
        data={pastBookings}
        keyExtractor={(item) => item.booking_id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View>
            {/* Active Booking Card if exists */}
            {activeBooking && (
              <View style={styles.activeCard}>
                <View style={styles.activeTopRow}>
                  <View style={styles.activeBadge}>
                    <View style={styles.activePulseDot} />
                    <Text style={styles.activeBadgeText}>ACTIVE SERVICE</Text>
                  </View>
                  <Text style={styles.bookingIdText}>{activeBooking.booking_id}</Text>
                </View>

                <View style={styles.activeBodyRow}>
                  <View style={styles.serviceIconWrap}>
                    <Text style={{ fontSize: 22 }}>{activeBooking.service?.icon || '🔧'}</Text>
                  </View>
                  <View style={styles.activeTextCol}>
                    <Text style={styles.activeServiceName}>{activeBooking.service?.name || 'Service'}</Text>
                    <Text style={styles.activeWorkerName}>
                      Artisan: {activeBooking.worker?.name || 'Assigned Worker'}
                    </Text>
                    <Text style={styles.activeStatusText}>
                      Status: <Text style={{ fontWeight: '700', color: colors.primary }}>{activeBooking.status}</Text>
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.resumeBtn}
                  onPress={handleResumeActive}
                  activeOpacity={0.85}
                >
                  <Text style={styles.resumeBtnText}>Resume Active Tracking</Text>
                  <Ionicons name="arrow-forward" size={16} color="#FFFFFF" style={{ marginLeft: 4 }} />
                </TouchableOpacity>
              </View>
            )}

            <Text style={styles.pastTitle}>Past Completed Bookings</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.pastCard}>
            <View style={styles.pastTopRow}>
              <View style={styles.pastServiceInfo}>
                <Text style={styles.pastIcon}>{item.service?.icon || '⚡'}</Text>
                <View style={{ marginLeft: 10 }}>
                  <Text style={styles.pastServiceName}>{item.service?.name}</Text>
                  <Text style={styles.pastDate}>{item.date || 'Recent'}</Text>
                </View>
              </View>
              <View style={styles.priceBadge}>
                <Text style={styles.priceText}>₹{item.total_amount}</Text>
              </View>
            </View>

            <View style={styles.workerRow}>
              <Text style={styles.workerLabel}>
                Artisan: <Text style={styles.workerVal}>{item.worker?.name}</Text>
              </Text>
              <View style={styles.ratingBadge}>
                <Ionicons name="star" size={12} color="#F59E0B" />
                <Text style={styles.ratingVal}>{item.rating || 5}.0</Text>
              </View>
            </View>

            <View style={styles.pastFooterRow}>
              <View style={styles.statusChip}>
                <Ionicons name="checkmark-circle" size={12} color={colors.successDark} />
                <Text style={styles.statusChipText}>{item.status}</Text>
              </View>
              <Text style={styles.coopSocietyText}>{item.worker?.cooperative || 'Delhi Labour Cooperative'}</Text>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 40
  },
  activeCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1.5,
    borderColor: colors.primaryLight,
    marginBottom: 20,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3
  },
  activeTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  activeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primarySubtle,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6
  },
  activePulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
    marginRight: 6
  },
  activeBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.primary
  },
  bookingIdText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary
  },
  activeBodyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14
  },
  serviceIconWrap: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: colors.primarySubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12
  },
  activeTextCol: {
    flex: 1
  },
  activeServiceName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary
  },
  activeWorkerName: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2
  },
  activeStatusText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2
  },
  resumeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 12
  },
  resumeBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF'
  },
  pastTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 12
  },
  pastCard: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 12,
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2
  },
  pastTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10
  },
  pastServiceInfo: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  pastIcon: {
    fontSize: 22
  },
  pastServiceName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary
  },
  pastDate: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 1
  },
  priceBadge: {
    backgroundColor: colors.surfaceSecondary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8
  },
  priceText: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.primary
  },
  workerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    marginBottom: 10
  },
  workerLabel: {
    fontSize: 12,
    color: colors.textSecondary
  },
  workerVal: {
    fontWeight: '600',
    color: colors.textPrimary
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  ratingVal: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
    marginLeft: 3
  },
  pastFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.successLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6
  },
  statusChipText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.successDark,
    marginLeft: 4
  },
  coopSocietyText: {
    fontSize: 10,
    color: colors.textMuted
  }
});

export default MyBookingsScreen;
