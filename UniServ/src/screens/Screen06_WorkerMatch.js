import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useBooking } from '../context/BookingContext';
import { useUser } from '../context/UserContext';
import Header from '../components/Header';
import WorkerTrustCard from '../components/WorkerTrustCard';
import SimulatedMap from '../components/SimulatedMap';
import workersData from '../data/workers.json';

export const Screen06_WorkerMatch = ({ route, navigation }) => {
  const { service, bookingType } = route.params || {};
  const { activeBooking, assignWorker, totalAmount } = useBooking();
  const { t } = useUser();

  const [isSearching, setIsSearching] = useState(true);
  const [workerIndex, setWorkerIndex] = useState(0);
  const [workerModeActive, setWorkerModeActive] = useState(false);

  const matchingWorkers = workersData.filter(
    (w) => !service?.name || w.skill.toLowerCase() === service.name.toLowerCase()
  );
  const pool = matchingWorkers.length > 0 ? matchingWorkers : workersData;
  const currentWorker = pool[workerIndex % pool.length];

  const estimatedWage = Math.round((totalAmount || activeBooking?.total_amount || 350) * 0.8);

  useEffect(() => {
    setIsSearching(true);
    const timer = setTimeout(() => {
      setIsSearching(false);
    }, 1800);
    return () => clearTimeout(timer);
  }, [workerIndex]);

  const handleConfirmBooking = () => {
    assignWorker(currentWorker);
    navigation.navigate('LiveTracking', {
      worker: currentWorker,
      service
    });
  };

  const handleFindAnother = () => {
    setWorkerIndex((prev) => prev + 1);
  };

  const handleSimulateNoWorker = () => {
    navigation.navigate('NoWorkerAvailable', { service });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title="Worker Matching &amp; Job Dispatch"
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Notice Bar */}
        <View style={styles.noticeBar}>
          <Ionicons name="sparkles" size={14} color={colors.primary} />
          <Text style={styles.noticeText}>
            Cooperative Algorithm matching closest KYC-verified artisan
          </Text>
        </View>

        {isSearching ? (
          <View style={styles.searchingCard}>
            <View style={styles.radarCircle}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
            <Text style={styles.searchingTitle}>
              {activeBooking?.is_bulk_project
                ? 'Deploying Project Contractor & Squad'
                : t('findingArtisan')}
            </Text>
            <Text style={styles.searchingSubtitle}>
              {activeBooking?.is_bulk_project
                ? `Matching Master Contractor and ${activeBooking?.crew_size || 4} Certified Artisans for ${activeBooking?.scale_label || 'Full Property Project'}`
                : t('findingSub')}
            </Text>

            <View style={styles.checklist}>
              <View style={styles.checkItem}>
                <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                <Text style={styles.checkText}>
                  {activeBooking?.is_bulk_project
                    ? `Squad of ${activeBooking?.crew_size || 4} Master Artisans Assigned`
                    : 'Active State KYC Verified'}
                </Text>
              </View>
              <View style={styles.checkItem}>
                <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                <Text style={styles.checkText}>
                  {activeBooking?.is_bulk_project
                    ? `Milestone 1 Advance (₹${activeBooking?.advance_amount?.toLocaleString()}) Escrow Secured`
                    : 'Accident & Health Insurance Valid'}
                </Text>
              </View>
              <View style={styles.checkItem}>
                <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                <Text style={styles.checkText}>
                  {activeBooking?.is_bulk_project
                    ? 'Wholesale Co-op Depot Toolkits & Materials Verified'
                    : 'Equipped with Certified Toolkit'}
                </Text>
              </View>
            </View>
          </View>
        ) : (
          <View>
            {/* Matched Success Header with Worker Mode Toggle */}
            <View style={styles.matchedSuccessHeader}>
              <View style={styles.headerTopRow}>
                <View style={[styles.matchedBadge, activeBooking?.is_bulk_project && { backgroundColor: '#EDE9FE' }]}>
                  <Ionicons
                    name={activeBooking?.is_bulk_project ? 'people' : 'checkmark-done'}
                    size={16}
                    color={activeBooking?.is_bulk_project ? colors.cooperativePurple : colors.successDark}
                  />
                  <Text style={[styles.matchedBadgeText, activeBooking?.is_bulk_project && { color: colors.cooperativePurple }]}>
                    {activeBooking?.is_bulk_project ? 'MASTER CONTRACTOR & SQUAD READY' : t('optimalMatch')}
                  </Text>
                </View>

                {/* Worker View Toggle for convenient route inspection */}
                <TouchableOpacity
                  style={[styles.workerToggleBtn, workerModeActive && styles.workerToggleBtnActive]}
                  onPress={() => setWorkerModeActive(!workerModeActive)}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name={workerModeActive ? 'construct' : 'person-outline'}
                    size={13}
                    color={workerModeActive ? '#FFFFFF' : colors.primary}
                  />
                  <Text style={[styles.workerToggleText, workerModeActive && styles.workerToggleTextActive]}>
                    {workerModeActive ? 'Worker Radar' : 'Worker View'}
                  </Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.matchedHeading}>
                {activeBooking?.is_bulk_project ? 'Lead Project Contractor Assigned' : t('verifiedArtisanReady')}
              </Text>
              <Text style={styles.matchedSubtext}>
                {activeBooking?.is_bulk_project
                  ? `Review lead contractor profile, ${activeBooking?.crew_size} crew artisans, and transparent milestone advance.`
                  : 'Review artisan profile, live staging route, and transparent cooperative rate.'}
              </Text>
            </View>

            {/* LIVE LOCATION & ROUTE MAP IN JOB ACCEPT SECTION (FOR WORKER CONVENIENCE) */}
            <View style={styles.mapAcceptSection}>
              <View style={styles.mapHeaderBanner}>
                <View style={styles.mapHeaderLeft}>
                  <Ionicons name="navigate" size={16} color={colors.primary} />
                  <Text style={styles.mapHeaderTitle}>
                    {workerModeActive
                      ? 'ARTISAN DISPATCH & ROUTE ACCEPTANCE RADAR'
                      : 'LIVE COOPERATIVE ARTISAN ROUTE PREVIEW'}
                  </Text>
                </View>
                <View style={styles.mapEtaBadge}>
                  <Text style={styles.mapEtaText}>~{currentWorker?.eta_minutes || 8} min away</Text>
                </View>
              </View>

              <SimulatedMap
                worker={currentWorker}
                userAddress={activeBooking?.address}
                autoStart={true}
                mode={workerModeActive ? 'worker_accept' : 'preview'}
                showWorkerAcceptControls={workerModeActive}
                jobEarnings={estimatedWage}
                onAcceptJob={handleConfirmBooking}
              />

              <View style={styles.mapFooterDetails}>
                <View style={styles.mapFooterItem}>
                  <Ionicons name="business" size={14} color={colors.primary} />
                  <Text style={styles.mapFooterText} numberOfLines={1}>
                    From: {currentWorker?.cooperative || 'South Delhi Cooperative Depot'}
                  </Text>
                </View>
                <View style={styles.mapFooterItem}>
                  <Ionicons name="location" size={14} color={colors.successDark} />
                  <Text style={styles.mapFooterText} numberOfLines={1}>
                    To: {activeBooking?.address || 'Flat 302, Palm Heights, Lajpat Nagar'}
                  </Text>
                </View>
              </View>
            </View>

            {/* Bulk Project Milestone Header Card if Bulk */}
            {activeBooking?.is_bulk_project && (
              <View style={styles.bulkMatchCard}>
                <View style={styles.bulkMatchHeader}>
                  <Text style={styles.bulkMatchTitle}>{activeBooking?.scale_label || 'Project Scope'}</Text>
                  <View style={styles.bulkMatchBadge}>
                    <Text style={styles.bulkMatchBadgeText}>Advance Milestone 1</Text>
                  </View>
                </View>
                <Text style={styles.bulkMatchSub}>{activeBooking?.material_label || 'Standard Co-op'}</Text>
                <View style={styles.bulkMatchMetricsRow}>
                  <View style={styles.bulkMatchMetric}>
                    <Text style={styles.bulkMatchKey}>CREW</Text>
                    <Text style={styles.bulkMatchVal}>{activeBooking?.crew_size} Artisans</Text>
                  </View>
                  <View style={styles.bulkMatchMetric}>
                    <Text style={styles.bulkMatchKey}>DURATION</Text>
                    <Text style={styles.bulkMatchVal}>{activeBooking?.estimated_days} Days</Text>
                  </View>
                  <View style={styles.bulkMatchMetric}>
                    <Text style={styles.bulkMatchKey}>ADVANCE PAYABLE</Text>
                    <Text style={[styles.bulkMatchVal, { color: colors.primary }]}>₹{activeBooking?.advance_amount?.toLocaleString()}</Text>
                  </View>
                </View>
              </View>
            )}

            {/* Worker Trust & Acceptance Card */}
            <WorkerTrustCard
              worker={currentWorker}
              showMatchReason={true}
              showActions={true}
              onConfirm={handleConfirmBooking}
              onFindAnother={pool.length > 1 ? handleFindAnother : null}
              confirmLabel={
                activeBooking?.is_bulk_project
                  ? `Confirm Squad & Pay Advance (₹${activeBooking?.advance_amount?.toLocaleString()})`
                  : `Accept Artisan & Start Tracking • ${currentWorker?.eta_minutes || 8} min ETA`
              }
              findAnotherLabel={t('showNextWorker')}
            />

            {/* Seva Suraksha Assurance */}
            <View style={styles.guaranteeCard}>
              <Ionicons name="shield-checkmark" size={20} color={colors.primary} />
              <View style={styles.guaranteeTextCol}>
                <Text style={styles.guaranteeTitle}>
                  {activeBooking?.is_bulk_project ? 'Govt SBI MSCS Escrow Protection' : 'Price & Quality Protection'}
                </Text>
                <Text style={styles.guaranteeSub}>
                  {activeBooking?.is_bulk_project
                    ? '100% Advance is held in Govt SBI MSCS Cooperative Trust Escrow and disbursed only in verified stages.'
                    : 'No payment is processed until work is completed and verified with your OTP.'}
                </Text>
              </View>
            </View>

            {/* No Worker Nearby Fallback trigger */}
            <TouchableOpacity
              style={styles.noWorkerFallbackBtn}
              onPress={handleSimulateNoWorker}
              activeOpacity={0.7}
            >
              <Ionicons name="information-circle-outline" size={14} color={colors.textSecondary} />
              <Text style={styles.noWorkerFallbackText}>
                Need assistance if artisan is delayed? View Resolution Options
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 36
  },
  noticeBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primarySubtle,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.border
  },
  noticeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
    marginLeft: 6,
    flex: 1,
    flexShrink: 1
  },
  searchingCard: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    marginVertical: 20
  },
  radarCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: colors.primarySubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20
  },
  searchingTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
    textAlign: 'center'
  },
  searchingSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 18,
    maxWidth: '90%'
  },
  checklist: {
    marginTop: 24,
    gap: 10,
    alignSelf: 'stretch',
    backgroundColor: colors.surfaceSecondary,
    padding: 14,
    borderRadius: 14
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  checkText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textPrimary,
    marginLeft: 8,
    flex: 1,
    flexShrink: 1
  },
  matchedSuccessHeader: {
    marginBottom: 12
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6
  },
  matchedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.successLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6
  },
  matchedBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.successDark,
    marginLeft: 4
  },
  workerToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primarySubtle,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primaryLight
  },
  workerToggleBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary
  },
  workerToggleText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.primary,
    marginLeft: 4
  },
  workerToggleTextActive: {
    color: '#FFFFFF'
  },
  matchedHeading: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary
  },
  matchedSubtext: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
    lineHeight: 16
  },
  mapAcceptSection: {
    marginBottom: 14,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3
  },
  mapHeaderBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.primarySubtle,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  mapHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8
  },
  mapHeaderTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.primary,
    marginLeft: 6,
    letterSpacing: 0.4
  },
  mapEtaBadge: {
    backgroundColor: colors.surface,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border
  },
  mapEtaText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.primary
  },
  mapFooterDetails: {
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 4,
    borderTopWidth: 1,
    borderTopColor: colors.border
  },
  mapFooterItem: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  mapFooterText: {
    fontSize: 11,
    color: colors.textSecondary,
    marginLeft: 6,
    flex: 1,
    flexShrink: 1
  },
  guaranteeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primarySubtle,
    padding: 14,
    borderRadius: 16,
    marginTop: 8,
    marginBottom: 16
  },
  guaranteeTextCol: {
    marginLeft: 10,
    flex: 1,
    flexShrink: 1
  },
  guaranteeTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary
  },
  guaranteeSub: {
    fontSize: 11,
    color: colors.primaryText,
    marginTop: 1,
    lineHeight: 15
  },
  bulkMatchCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.border
  },
  bulkMatchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  bulkMatchTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textPrimary,
    flex: 1,
    marginRight: 6
  },
  bulkMatchBadge: {
    backgroundColor: '#EDE9FE',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6
  },
  bulkMatchBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.cooperativePurple
  },
  bulkMatchSub: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2
  },
  bulkMatchMetricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceSecondary,
    padding: 8,
    borderRadius: 10,
    marginTop: 10
  },
  bulkMatchMetric: {
    alignItems: 'center',
    flex: 1
  },
  bulkMatchKey: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.textSecondary
  },
  bulkMatchVal: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.textPrimary,
    marginTop: 1
  },
  noWorkerFallbackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceSecondary,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border
  },
  noWorkerFallbackText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
    marginLeft: 6,
    flexShrink: 1
  }
});

export default Screen06_WorkerMatch;
