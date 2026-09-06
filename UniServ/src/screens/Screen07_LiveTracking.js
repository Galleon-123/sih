import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useBooking } from '../context/BookingContext';
import { useUser } from '../context/UserContext';
import Header from '../components/Header';
import SimulatedMap from '../components/SimulatedMap';
import BookingStatusStepper from '../components/BookingStatusStepper';

export const Screen07_LiveTracking = ({ route, navigation }) => {
  const {
    activeBooking,
    updateBookingStatus,
    triggerWorkerDelay,
    acceptWorkerDelay,
    findReplacementWorker
  } = useBooking();
  const { t } = useUser();

  const worker = activeBooking?.worker || route.params?.worker;
  const bookingId = activeBooking?.booking_id || 'BK84920';

  const [etaMinutes, setEtaMinutes] = useState(worker?.eta_minutes || 8);
  const [hasArrived, setHasArrived] = useState(false);
  const [callModalVisible, setCallModalVisible] = useState(false);
  const [chatModalVisible, setChatModalVisible] = useState(false);
  const [showDelayModal, setShowDelayModal] = useState(false);

  const isScheduledOrAdvance = activeBooking?.booking_type === 'scheduled' || !!activeBooking?.is_bulk_project || activeBooking?.scale_mode === 'bulk';

  // Trigger simulated delay only for IMMEDIATE / NOW bookings (after 4 seconds)
  useEffect(() => {
    if (isScheduledOrAdvance) return;
    const delayTimer = setTimeout(() => {
      if (!hasArrived && !activeBooking?.worker_delayed) {
        triggerWorkerDelay(10, 'Heavy traffic congestion near Ring Road junction');
        setShowDelayModal(true);
      }
    }, 4500);
    return () => clearTimeout(delayTimer);
  }, [isScheduledOrAdvance]);

  const handleArrival = () => {
    setHasArrived(true);
    setEtaMinutes(0);
    updateBookingStatus(3); // Worker Arrived
  };

  const handleProceedToOtp = () => {
    navigation.navigate('StartOTP', { worker });
  };

  const handleAcceptDelay = () => {
    acceptWorkerDelay();
    setEtaMinutes((prev) => prev + 10);
    setShowDelayModal(false);
    Alert.alert('Delay Accepted', 'Thank you for your patience. The artisan has been notified of your confirmation.');
  };

  const handleFindReplacement = () => {
    const replacement = findReplacementWorker();
    setShowDelayModal(false);
    Alert.alert(
      'Replacement Artisan Dispatched',
      `${replacement.name} (Nearby Cooperative Artisan, ETA 6 mins) has been assigned to your booking with zero penalty.`
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title={isScheduledOrAdvance ? `Scheduled Booking • ${bookingId}` : `Live Tracking • ${bookingId}`}
        showBack
        onBack={() => navigation.navigate('Home')}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Render Live Moving Map ONLY for immediate NOW / Emergency bookings. For Scheduled / Advance, render Scheduled Booking Appointment Hub Card */}
        {!isScheduledOrAdvance ? (
          <View style={styles.mapContainer}>
            <SimulatedMap
              worker={worker}
              workerName={worker?.name}
              userAddress={activeBooking?.address}
              onArrival={handleArrival}
              durationMs={12000}
            />
          </View>
        ) : (
          <View style={styles.scheduledHubHeroCard}>
            <View style={styles.scheduledHubHeader}>
              <View style={styles.scheduledHubIconCircle}>
                <Ionicons name="calendar" size={24} color="#FFFFFF" />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.scheduledHubTag}>OFFICIAL APPOINTMENT HUB</Text>
                <Text style={styles.scheduledHubTitle}>
                  {activeBooking?.is_bulk_project
                    ? `${activeBooking?.scale_label || 'Bulk Project'} Confirmed`
                    : `${activeBooking?.service?.name || 'Service'} Appointment Confirmed`}
                </Text>
                <Text style={styles.scheduledHubSub}>
                  Assigned to {worker?.cooperative || 'District Cooperative Federation'}
                </Text>
              </View>
            </View>

            <View style={styles.scheduledHubDivider} />

            <View style={styles.scheduledHubGrid}>
              <View style={styles.scheduledHubGridItem}>
                <Ionicons name="time" size={16} color={colors.primary} />
                <View style={{ marginLeft: 8 }}>
                  <Text style={styles.scheduledHubKey}>TARGET DATE &amp; TIME SLOT</Text>
                  <Text style={styles.scheduledHubVal}>
                    {activeBooking?.scheduled_date || 'Tomorrow'}, {activeBooking?.scheduled_time || '10:00 AM - 12:00 PM'}
                  </Text>
                </View>
              </View>

              <View style={styles.scheduledHubGridItem}>
                <Ionicons name="location" size={16} color={colors.primary} />
                <View style={{ marginLeft: 8, flex: 1 }}>
                  <Text style={styles.scheduledHubKey}>SERVICE LOCATION</Text>
                  <Text style={styles.scheduledHubVal} numberOfLines={2}>
                    {activeBooking?.address || 'Customer Premises'}
                  </Text>
                </View>
              </View>

              <View style={styles.scheduledHubGridItem}>
                <Ionicons name="people" size={16} color={colors.primary} />
                <View style={{ marginLeft: 8 }}>
                  <Text style={styles.scheduledHubKey}>ASSIGNED CREW</Text>
                  <Text style={styles.scheduledHubVal}>
                    {activeBooking?.is_bulk_project
                      ? `${activeBooking?.crew_size || 4} Master Artisans Squad (${activeBooking?.estimated_days || 2} Days)`
                      : `1 Verified Artisan (${worker?.name || 'Assigned Lead'})`}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Worker Delay Notification Card (ONLY FOR IMMEDIATE BOOKINGS) */}
        {!isScheduledOrAdvance && activeBooking?.worker_delayed && (
          <View style={styles.delayBanner}>
            <View style={styles.delayHeaderRow}>
              <Ionicons name="time" size={20} color={colors.warningDark} />
              <Text style={styles.delayTitle}>Artisan Running 10 Mins Late</Text>
            </View>
            <Text style={styles.delayDesc}>
              {worker?.name} is held up due to traffic. Would you like to wait or instantly switch to another nearby cooperative artisan?
            </Text>

            <View style={styles.delayActionButtons}>
              <TouchableOpacity
                style={styles.waitBtn}
                onPress={handleAcceptDelay}
                activeOpacity={0.8}
              >
                <Ionicons name="hourglass-outline" size={14} color="#FFFFFF" />
                <Text style={styles.waitBtnText}>Wait (+10 mins)</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.reassignBtn}
                onPress={handleFindReplacement}
                activeOpacity={0.8}
              >
                <Ionicons name="swap-horizontal" size={14} color={colors.primary} />
                <Text style={styles.reassignBtnText}>Find Another Worker</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Status Card: SCHEDULED / ADVANCE vs IMMEDIATE NOW */}
        {isScheduledOrAdvance ? (
          <View style={styles.statusHeroCardScheduled}>
            <View style={styles.statusHeaderRow}>
              <View style={styles.statusScheduledIcon}>
                <Ionicons name="shield-checkmark" size={20} color={colors.successDark} />
              </View>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.statusScheduledTag}>ADVANCE STATUS CONFIRMED</Text>
                <Text style={styles.statusScheduledTitle}>
                  {activeBooking?.is_bulk_project ? 'Escrow Protected Project' : 'Appointment Confirmed'}
                </Text>
              </View>
            </View>

            <View style={styles.scheduledInfoBox}>
              <View style={styles.scheduledRow}>
                <Ionicons name="notifications-outline" size={15} color={colors.successDark} />
                <Text style={styles.scheduledNoticeText}>
                  Our cooperative team will contact you 2 hours before arrival to coordinate entry.
                </Text>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.statusHeroCard}>
            <View style={styles.statusHeaderRow}>
              <View style={[styles.statusPulseDot, hasArrived && styles.statusDotArrived]} />
              <Text style={styles.statusMainText}>
                {hasArrived ? t('arrivedAtDoorstep') : t('artisanOnWay')}
              </Text>
            </View>
            <Text style={styles.statusSubText}>
              {hasArrived
                ? t('shareStartOtp')
                : `Arriving in ~${etaMinutes} mins with official toolkit.`}
            </Text>

            {/* Quick Skip to Arrival button */}
            {!hasArrived && (
              <TouchableOpacity style={styles.skipArrivalBtn} onPress={handleArrival}>
                <Ionicons name="play-forward" size={12} color={colors.primary} />
                <Text style={styles.skipArrivalText}>{t('skipToArrival')}</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Pre-Arrival Team Contact & Coordinator Details Card (FOR SCHEDULED & ADVANCE BOOKINGS) */}
        {isScheduledOrAdvance && (
          <View style={styles.teamContactCard}>
            <View style={styles.teamContactHeader}>
              <View style={styles.teamContactIconCircle}>
                <Ionicons name="call" size={16} color="#FFFFFF" />
              </View>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.teamContactTag}>OFFICIAL COOPERATIVE DISPATCH DESK</Text>
                <Text style={styles.teamContactTitle}>Our Team Will Contact You Before Arrival</Text>
              </View>
            </View>

            <Text style={styles.teamContactDesc}>
              Our cooperative squad and Ward Coordinator will call you 2 hours prior to the scheduled slot to confirm site entry, gate passes, and raw material unloading.
            </Text>

            {/* Assigned Coordinator / Supervisor Box */}
            <View style={styles.coordinatorBox}>
              <View style={styles.coordinatorAvatarCircle}>
                <Ionicons name="person" size={18} color={colors.primary} />
              </View>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.coordinatorName}>
                  {worker?.name ? `${worker.name} (Lead Supervisor)` : 'Ramesh Chand (Ward 14 Coordinator)'}
                </Text>
                <Text style={styles.coordinatorSub}>
                  {activeBooking?.service?.name || 'Service'} Cooperative Union • +91 98765 43210
                </Text>
              </View>
            </View>

            <View style={styles.teamContactActionsRow}>
              <TouchableOpacity
                style={styles.callCoordBtn}
                onPress={() => setCallModalVisible(true)}
                activeOpacity={0.85}
              >
                <Ionicons name="call" size={14} color="#FFFFFF" />
                <Text style={styles.callCoordBtnText}>Call Coordinator / Lead</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.chatCoordBtn}
                onPress={() => setChatModalVisible(true)}
                activeOpacity={0.85}
              >
                <Ionicons name="chatbubble-ellipses" size={14} color={colors.primary} />
                <Text style={styles.chatCoordBtnText}>Chat with Team</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Uber/Rapido Artisan & Vehicle Trust Card */}
        <View style={styles.workerDetailCard}>
          <View style={styles.workerMainRow}>
            <Image
              source={{ uri: worker?.photo || 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=300&q=80' }}
              style={styles.workerPhoto}
            />
            <View style={styles.workerInfoCol}>
              <View style={styles.nameBadgeRow}>
                <Text style={styles.workerName}>{worker?.name || 'Rajan Kumar'}</Text>
                <View style={styles.ratingBadge}>
                  <Ionicons name="star" size={11} color="#F59E0B" />
                  <Text style={styles.ratingText}>{worker?.rating || '4.8'}</Text>
                </View>
              </View>

              <Text style={styles.coopNameText}>
                {activeBooking?.is_bulk_project
                  ? `Lead Contractor • ${activeBooking?.crew_size || 4} Artisans Squad`
                  : (worker?.cooperative || 'Delhi Labour Cooperative')}
              </Text>

              <View style={styles.vehicleInfoRow}>
                <Ionicons name={activeBooking?.is_bulk_project ? 'bus' : 'bicycle'} size={14} color={colors.primary} />
                <Text style={styles.vehicleText}>
                  {activeBooking?.is_bulk_project
                    ? 'Cooperative Equipment Fleet Van • DL 1L AB 9821'
                    : 'Service EV Scooter • DL 3S CD 8492'}
                </Text>
              </View>
            </View>
          </View>

          {/* Safety PIN & Verification Code */}
          <View style={styles.safetyPinRow}>
            <View style={styles.pinBox}>
              <Text style={styles.pinLabel}>{t('safetyPin')}</Text>
              <Text style={styles.pinValue}>{activeBooking?.start_otp || '4821'}</Text>
            </View>
            <View style={styles.pinExplanation}>
              <Ionicons name="shield-checkmark" size={14} color={colors.successDark} />
              <Text style={styles.pinText}>Share this 4-digit code after physical arrival to begin</Text>
            </View>
          </View>

          {/* Action Buttons: Masked Call & Chat */}
          <View style={styles.workerActionsRow}>
            <TouchableOpacity
              style={styles.actionBtnCall}
              onPress={() => setCallModalVisible(true)}
              activeOpacity={0.8}
            >
              <Ionicons name="call" size={16} color="#FFFFFF" />
              <Text style={styles.actionBtnCallText}>{t('callArtisan')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionBtnChat}
              onPress={() => setChatModalVisible(true)}
              activeOpacity={0.8}
            >
              <Ionicons name="chatbubble-ellipses" size={16} color={colors.primary} />
              <Text style={styles.actionBtnChatText}>{t('chatArtisan')}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Specialized Trade Arrival Toolkit Card (360-degree Trade Insight) */}
        <View style={styles.toolkitCard}>
          <View style={styles.toolkitHeaderRow}>
            <Ionicons name="bag-check" size={16} color={colors.primary} />
            <Text style={styles.toolkitTitle}>CERTIFIED ON-SITE TOOLKIT &amp; READINESS</Text>
          </View>
          <Text style={styles.toolkitText}>
            {activeBooking?.service?.id === 's1'
              ? 'Arriving with pressure joint wrenches, Teflon thread seals, pipe clamps & spare rubber gaskets.'
              : activeBooking?.service?.id === 's2'
              ? 'Arriving with digital multimeter, 10kV insulated safety gloves, wire strippers & C-Curve MCBs.'
              : activeBooking?.service?.id === 's3'
              ? 'Arriving with pet-safe eco-cleaning formulations, microfiber pads & high-pressure scrub buffers.'
              : activeBooking?.service?.id === 's4'
              ? 'Arriving with precision carpentry saw, soft-close hydraulic channels, wood fillers & level meters.'
              : activeBooking?.service?.id === 's5'
              ? 'Arriving with low-VOC paint rollers, anti-damp putty scrapers, sandpaper & floor masking sheets.'
              : activeBooking?.service?.id === 's6'
              ? 'Arriving with digital BP/Sugar monitor, mobility support belt & geriatric first-aid credentials.'
              : activeBooking?.service?.id === 's7'
              ? 'Arriving with digital refrigerant manifold, Starting capacitor test kit & multi-brand PCB tools.'
              : activeBooking?.service?.id === 's8'
              ? 'Arriving with Mahila Shramik verified identity card, sanitized kitchen apron & household checklist.'
              : activeBooking?.service?.id === 's9'
              ? 'Commercial DL Verified • Equipped with FastTag, zero-alcohol clearance & route GPS navigation.'
              : 'Arriving with electric hedge shears, root aerators & organic neem-based vermicompost.'}
          </Text>
        </View>

        {/* Vertical Lifecycle Stepper */}
        <View style={styles.stepperCard}>
          <Text style={styles.stepperCardTitle}>Service Lifecycle Stage</Text>
          <BookingStatusStepper currentStep={hasArrived ? 3 : 2} compact={false} />
        </View>
      </ScrollView>

      {/* Masked Call Dialog Modal */}
      <Modal visible={callModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.callModalCard}>
            <View style={styles.callAvatarCircle}>
              <Ionicons name="call" size={32} color="#FFFFFF" />
            </View>
            <Text style={styles.callTitle}>Calling Masked Cooperative Line</Text>
            <Text style={styles.callWorkerName}>{worker?.name || 'Rajan Kumar'}</Text>
            <Text style={styles.callSub}>Number is masked for customer privacy (+91 11-4089-XXXX)</Text>

            <TouchableOpacity
              style={styles.endCallBtn}
              onPress={() => setCallModalVisible(false)}
            >
              <Ionicons name="call" size={18} color="#FFFFFF" style={{ transform: [{ rotate: '135deg' }] }} />
              <Text style={styles.endCallText}>End Call</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Chat Simulation Modal */}
      <Modal visible={chatModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.chatModalCard}>
            <View style={styles.chatHeader}>
              <Text style={styles.chatTitle}>Chat with {worker?.name}</Text>
              <TouchableOpacity onPress={() => setChatModalVisible(false)}>
                <Ionicons name="close" size={22} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <View style={styles.chatBubble}>
              <Text style={styles.chatMessage}>
                "Namaste! I am on my way with the official toolkit. I am near the metro station signal."
              </Text>
              <Text style={styles.chatTime}>Just now</Text>
            </View>
            <TouchableOpacity
              style={styles.chatReplyBtn}
              onPress={() => {
                Alert.alert('Message Sent', 'Your message has been sent to the artisan.');
                setChatModalVisible(false);
              }}
            >
              <Text style={styles.chatReplyText}>Quick Reply: "Please come to Flat 302 directly."</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Sticky Bottom Action */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.startOtpBtn, !hasArrived && !isScheduledOrAdvance && styles.startOtpBtnDisabled]}
          onPress={handleProceedToOtp}
          disabled={!hasArrived && !isScheduledOrAdvance}
          activeOpacity={0.85}
        >
          <Ionicons name={isScheduledOrAdvance ? "shield-checkmark" : "key"} size={18} color="#FFFFFF" />
          <Text style={styles.startOtpBtnText}>
            {isScheduledOrAdvance
              ? 'View Scheduled Job Handshake PIN'
              : (hasArrived ? t('viewStartOtp') : `Arriving in ~${etaMinutes} mins...`)}
          </Text>
        </TouchableOpacity>
      </View>
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
    paddingBottom: 90
  },
  scheduledHubHeroCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1.5,
    borderColor: colors.primary,
    marginBottom: 14,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3
  },
  scheduledHubHeader: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  scheduledHubIconCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center'
  },
  scheduledHubTag: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 0.5
  },
  scheduledHubTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
    marginTop: 2
  },
  scheduledHubSub: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2
  },
  scheduledHubDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 14
  },
  scheduledHubGrid: {
    gap: 12
  },
  scheduledHubGridItem: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  scheduledHubKey: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.textSecondary,
    letterSpacing: 0.5
  },
  scheduledHubVal: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 1
  },
  mapContainer: {
    height: 240,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 14
  },
  delayBanner: {
    backgroundColor: colors.warningLight,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1.5,
    borderColor: colors.warning,
    marginBottom: 14
  },
  delayHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4
  },
  delayTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.warningDark,
    marginLeft: 6
  },
  delayDesc: {
    fontSize: 11,
    color: colors.warningDark,
    lineHeight: 16,
    marginBottom: 10
  },
  delayActionButtons: {
    flexDirection: 'row',
    gap: 8
  },
  waitBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.warningDark,
    paddingVertical: 9,
    borderRadius: 10
  },
  waitBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
    marginLeft: 4
  },
  reassignBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.primary,
    paddingVertical: 9,
    borderRadius: 10
  },
  reassignBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.primary,
    marginLeft: 4
  },
  statusHeroCard: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 14,
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2
  },
  statusHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4
  },
  statusPulseDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
    marginRight: 8
  },
  statusDotArrived: {
    backgroundColor: colors.success
  },
  statusMainText: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textPrimary
  },
  statusSubText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
    lineHeight: 16
  },
  skipArrivalBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primarySubtle,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 10
  },
  skipArrivalText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.primary,
    marginLeft: 4
  },
  workerDetailCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 14
  },
  workerMainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14
  },
  workerPhoto: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.surfaceSecondary,
    marginRight: 12
  },
  workerInfoCol: {
    flex: 1
  },
  nameBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  workerName: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary
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
    fontSize: 11,
    fontWeight: '800',
    color: colors.warningDark,
    marginLeft: 3
  },
  coopNameText: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2
  },
  vehicleInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4
  },
  vehicleText: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: '600',
    marginLeft: 4
  },
  safetyPinRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 14,
    padding: 12,
    marginBottom: 14
  },
  pinBox: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 12
  },
  pinLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.textSecondary
  },
  pinValue: {
    fontSize: 16,
    fontWeight: '900',
    color: colors.primary,
    letterSpacing: 1
  },
  pinExplanation: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center'
  },
  pinText: {
    fontSize: 11,
    color: colors.textSecondary,
    marginLeft: 6,
    lineHeight: 15
  },
  workerActionsRow: {
    flexDirection: 'row',
    gap: 10
  },
  actionBtnCall: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.success,
    paddingVertical: 12,
    borderRadius: 12
  },
  actionBtnCallText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: 6
  },
  actionBtnChat: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 12,
    borderRadius: 12
  },
  actionBtnChatText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
    marginLeft: 6
  },
  toolkitCard: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1.5,
    borderColor: colors.primaryLight,
    marginBottom: 14
  },
  toolkitHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6
  },
  toolkitTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 0.5,
    marginLeft: 6
  },
  toolkitText: {
    fontSize: 11,
    color: colors.textSecondary,
    lineHeight: 16
  },
  stepperCard: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border
  },
  stepperCardTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 0.5,
    marginBottom: 10
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: colors.border
  },
  startOtpBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4
  },
  startOtpBtnDisabled: {
    backgroundColor: colors.borderDark,
    shadowOpacity: 0,
    elevation: 0
  },
  startOtpBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
    marginLeft: 8
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    paddingHorizontal: 20
  },
  callModalCard: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center'
  },
  callAvatarCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14
  },
  callTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary
  },
  callWorkerName: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary,
    marginVertical: 4
  },
  callSub: {
    fontSize: 11,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: 20
  },
  endCallBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.danger,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 16
  },
  endCallText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    marginLeft: 8
  },
  chatModalCard: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 20
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  chatTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary
  },
  chatBubble: {
    backgroundColor: colors.surfaceSecondary,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16
  },
  chatMessage: {
    fontSize: 13,
    color: colors.textPrimary,
    lineHeight: 18
  },
  chatTime: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 4,
    textAlign: 'right'
  },
  chatReplyBtn: {
    backgroundColor: colors.primarySubtle,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center'
  },
  chatReplyText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary
  },
  statusHeroCardScheduled: {
    backgroundColor: '#F0FDF4',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1.5,
    borderColor: colors.success,
    marginBottom: 14
  },
  statusScheduledIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primarySubtle,
    alignItems: 'center',
    justifyContent: 'center'
  },
  statusScheduledTag: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.successDark,
    letterSpacing: 0.5
  },
  statusScheduledTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textPrimary,
    marginTop: 2
  },
  scheduledInfoBox: {
    backgroundColor: colors.surface,
    padding: 12,
    borderRadius: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 8
  },
  scheduledRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  scheduledTimeText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
    marginLeft: 8
  },
  scheduledNoticeText: {
    fontSize: 11,
    color: colors.successDark,
    marginLeft: 8,
    flex: 1,
    lineHeight: 15,
    fontWeight: '600'
  },
  teamContactCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1.5,
    borderColor: colors.primary,
    marginBottom: 14
  },
  teamContactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6
  },
  teamContactIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center'
  },
  teamContactTag: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 0.5
  },
  teamContactTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.textPrimary
  },
  teamContactDesc: {
    fontSize: 11,
    color: colors.textSecondary,
    lineHeight: 16,
    marginVertical: 8
  },
  coordinatorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 10
  },
  coordinatorAvatarCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primarySubtle,
    alignItems: 'center',
    justifyContent: 'center'
  },
  coordinatorName: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.textPrimary
  },
  coordinatorSub: {
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 1
  },
  teamContactActionsRow: {
    flexDirection: 'row',
    gap: 8
  },
  callCoordBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 10,
    borderRadius: 10
  },
  callCoordBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
    marginLeft: 6
  },
  chatCoordBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.primary,
    paddingVertical: 10,
    borderRadius: 10
  },
  chatCoordBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.primary,
    marginLeft: 6
  }
});

export default Screen07_LiveTracking;
