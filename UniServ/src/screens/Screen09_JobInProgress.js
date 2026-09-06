import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useBooking } from '../context/BookingContext';
import { useUser } from '../context/UserContext';
import Header from '../components/Header';
import BookingStatusStepper from '../components/BookingStatusStepper';
import PaymentBreakdown from '../components/PaymentBreakdown';

export const Screen09_JobInProgress = ({ route, navigation }) => {
  const {
    activeBooking,
    totalAmount,
    approveExtraWork,
    declineExtraWork,
    approveSecondWorker,
    declineSecondWorker,
    workerWaitRequest,
    waitElapsed,
    acknowledgeWorkerWait
  } = useBooking();
  const { t } = useUser();

  const worker = activeBooking?.worker || route.params?.worker;
  const secondWorker = activeBooking?.second_worker;
  const service = activeBooking?.service;
  const extraWorkDef = service?.extra_work;
  const helperDef = service?.helper_request;
  const helperAllowed = helperDef?.allowed !== false;

  const [secondsElapsed, setSecondsElapsed] = useState(145);
  const [isDispatchingHelper, setIsDispatchingHelper] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatWait = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const handleFinishJob = () => {
    navigation.navigate('CompletionOTP', { worker });
  };

  const handleApproveExtraParts = () => {
    approveExtraWork({
      title: extraWorkDef?.title || 'Component Replacement',
      amount: extraWorkDef?.amount || 150,
      description: extraWorkDef?.description || 'Additional spare parts approved by user',
      photo: extraWorkDef?.photo
    });
  };

  const handleDeclineExtraParts = () => {
    declineExtraWork();
  };

  const handleApproveHelper = () => {
    setIsDispatchingHelper(true);
    setTimeout(() => {
      approveSecondWorker({
        id: 'h2',
        name: 'Amit Verma',
        photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&q=80',
        role: helperDef?.role || 'Cooperative Assistant Artisan',
        rating: 4.8,
        phone: '+91 98112 34567',
        cooperative: 'Delhi Labour Cooperative Union'
      });
      setIsDispatchingHelper(false);
    }, 1000);
  };

  const handleDeclineHelper = () => {
    declineSecondWorker();
  };

  const isExtraApproved = activeBooking?.extra_work?.approved;
  const isExtraDeclined = activeBooking?.extra_work?.declined;
  const isHelperApproved = secondWorker || activeBooking?.helper_request?.status === 'approved';
  const isHelperDeclined = activeBooking?.helper_request?.status === 'declined';

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title={`${t('workInProgress')} • ${activeBooking?.booking_id || 'BK84920'}`}
        showBack
        onBack={() => navigation.navigate('Home')}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Active Timer Header */}
        <View style={styles.timerHeader}>
          <View style={styles.livePulseRow}>
            <View style={styles.pulseDot} />
            <Text style={styles.livePulseText}>{t('workInProgress')}</Text>
          </View>
          <Text style={styles.timerValue}>{formatTimer(secondsElapsed)}</Text>
          <Text style={styles.timerSubtext}>Active service in progress at your address</Text>
        </View>

        {/* Current Service Details & Dynamic Total Badge */}
        <View style={styles.serviceStatusCard}>
          <View style={styles.serviceRow}>
            <View style={styles.serviceIconCircle}>
              <Text style={styles.serviceEmoji}>{service?.icon || '🔧'}</Text>
            </View>
            <View style={styles.serviceCol}>
              <Text style={styles.serviceName}>{service?.name || 'Home Service'}</Text>
              <Text style={styles.serviceAddress} numberOfLines={1}>
                {activeBooking?.address || 'Flat 302, Palm Heights'}
              </Text>
            </View>
            <View style={styles.priceTag}>
              <Text style={styles.priceTagLabel}>CURRENT TOTAL</Text>
              <Text style={styles.priceTagText}>₹{totalAmount || activeBooking?.total_amount || 350}</Text>
            </View>
          </View>

          {/* Dynamic Itemized Badges */}
          <View style={styles.pillsRow}>
            <View style={styles.basePill}>
              <Text style={styles.basePillText}>Base: ₹{activeBooking?.base_amount || service?.start_price || 299}</Text>
            </View>
            {activeBooking?.emergency_surge > 0 && (
              <View style={[styles.basePill, { backgroundColor: '#FEE2E2' }]}>
                <Text style={[styles.basePillText, { color: colors.error }]}>+₹100 SOS Surge</Text>
              </View>
            )}
            {isExtraApproved && (
              <View style={[styles.basePill, { backgroundColor: colors.successLight }]}>
                <Text style={[styles.basePillText, { color: colors.successDark }]}>
                  +₹{activeBooking?.extra_work?.amount || extraWorkDef?.amount} Spares
                </Text>
              </View>
            )}
            {isHelperApproved && (
              <View style={[styles.basePill, { backgroundColor: '#EDE9FE' }]}>
                <Text style={[styles.basePillText, { color: colors.cooperativePurple }]}>
                  +₹{helperDef?.amount || 200} Helper
                </Text>
              </View>
            )}
            {activeBooking?.discount_applied > 0 && (
              <View style={[styles.basePill, { backgroundColor: '#DCFCE7' }]}>
                <Text style={[styles.basePillText, { color: colors.successDark }]}>-₹50 Discount</Text>
              </View>
            )}
          </View>
        </View>

        {/* Lead Worker Info Card */}
        <View style={styles.workerCard}>
          <Image
            source={{ uri: worker?.photo || 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=300&q=80' }}
            style={styles.workerPhoto}
          />
          <View style={styles.workerInfoCol}>
            <View style={styles.workerNameRow}>
              <Text style={styles.workerName}>{worker?.name || 'Rajan Kumar'}</Text>
              <View style={styles.leadBadge}>
                <Text style={styles.leadBadgeText}>Lead Artisan</Text>
              </View>
            </View>
            <Text style={styles.workerSociety}>{worker?.cooperative || 'Delhi Labour Cooperative'}</Text>
            <View style={styles.safetyVerifiedRow}>
              <Ionicons name="shield-checkmark" size={12} color={colors.successDark} />
              <Text style={styles.safetyVerifiedText}>Equipped with Certified Safety Gear</Text>
            </View>
          </View>
        </View>

        {/* Second Worker Card (Visible when approved) */}
        {secondWorker && (
          <View style={[styles.workerCard, { borderColor: colors.cooperativePurple, borderWidth: 1.5 }]}>
            <Image
              source={{ uri: secondWorker.photo }}
              style={styles.workerPhoto}
            />
            <View style={styles.workerInfoCol}>
              <View style={styles.workerNameRow}>
                <Text style={styles.workerName}>{secondWorker.name}</Text>
                <View style={[styles.leadBadge, { backgroundColor: '#EDE9FE' }]}>
                  <Text style={[styles.leadBadgeText, { color: colors.cooperativePurple }]}>2nd Assistant</Text>
                </View>
              </View>
              <Text style={styles.workerSociety}>{secondWorker.role}</Text>
              <View style={styles.safetyVerifiedRow}>
                <Ionicons name="checkmark-circle" size={12} color={colors.successDark} />
                <Text style={styles.safetyVerifiedText}>Cooperative Certified Helper • On Site</Text>
              </View>
            </View>
          </View>
        )}

        {/* Worker Waiting Notification Card */}
        {workerWaitRequest && workerWaitRequest.status !== null && (
          <View style={[styles.waitNotifCard, workerWaitRequest.status === 'waiting' && styles.waitNotifCardActive]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <Ionicons name="time" size={20} color={workerWaitRequest.status === 'waiting' ? '#d97706' : colors.textSecondary} />
              <Text style={styles.waitNotifTitle}>
                {workerWaitRequest.status === 'waiting' ? 'Worker Waiting at Doorstep' : 'Worker Wait Acknowledged'}
              </Text>
            </View>
            {workerWaitRequest.status === 'waiting' && (
              <Text style={styles.waitNotifTimer}>{formatWait(waitElapsed)}</Text>
            )}
            <Text style={styles.waitNotifSub}>
              {workerWaitRequest.status === 'waiting'
                ? 'Your artisan has arrived and is waiting. Waiting over 5 mins may incur a ₹10/min wait charge.'
                : 'You acknowledged the wait. The artisan will be with you shortly.'}
            </Text>
            {workerWaitRequest.status === 'waiting' && (
              <TouchableOpacity style={styles.waitAckBtn} onPress={acknowledgeWorkerWait} activeOpacity={0.8}>
                <Text style={styles.waitAckBtnText}>I'm Coming — Opening Door</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Bulk Project 3-Stage Escrow Milestone Tracker Card */}
        {activeBooking?.is_bulk_project && (
          <View style={styles.bulkEscrowLiveCard}>
            <View style={styles.bulkEscrowLiveHeader}>
              <Ionicons name="shield-checkmark" size={18} color={colors.primary} />
              <Text style={styles.bulkEscrowLiveTitle}>GOVT SBI MSCS ESCROW MILESTONE TRACKER</Text>
            </View>

            <Text style={styles.bulkEscrowLiveSub}>
              Project Scope: {activeBooking?.scale_label} ({activeBooking?.material_label}) • Total Est: ₹{activeBooking?.total_project_cost?.toLocaleString()}
            </Text>

            <View style={styles.milestoneProgressList}>
              {/* Milestone 1 */}
              <View style={styles.milestoneProgressItem}>
                <View style={styles.milestoneStatusDotDone}>
                  <Ionicons name="checkmark" size={10} color="#FFFFFF" />
                </View>
                <View style={styles.milestoneProgressContent}>
                  <View style={styles.milestoneProgressRow}>
                    <Text style={styles.milestoneProgressName}>Milestone 1: Advance &amp; Mobilization</Text>
                    <Text style={[styles.milestoneProgressAmount, { color: colors.successDark }]}>
                      ₹{activeBooking?.advance_amount?.toLocaleString()} (Disbursed)
                    </Text>
                  </View>
                  <Text style={styles.milestoneProgressDetail}>
                    Wholesale material depot purchase &amp; {activeBooking?.crew_size} artisans crew reserve.
                  </Text>
                </View>
              </View>

              {/* Milestone 2 */}
              <View style={styles.milestoneProgressItem}>
                <View style={styles.milestoneStatusDotActive} />
                <View style={styles.milestoneProgressContent}>
                  <View style={styles.milestoneProgressRow}>
                    <Text style={styles.milestoneProgressName}>Milestone 2: Mid-Progress Rough Work</Text>
                    <Text style={[styles.milestoneProgressAmount, { color: colors.warningDark }]}>
                      ₹{activeBooking?.mid_milestone?.toLocaleString()} (35% Escrow)
                    </Text>
                  </View>
                  <Text style={styles.milestoneProgressDetail}>
                    In Progress: Base layer, pipe/wiring roughing, surface prepping.
                  </Text>
                </View>
              </View>

              {/* Milestone 3 */}
              <View style={styles.milestoneProgressItem}>
                <View style={styles.milestoneStatusDotPending} />
                <View style={styles.milestoneProgressContent}>
                  <View style={styles.milestoneProgressRow}>
                    <Text style={styles.milestoneProgressName}>Milestone 3: Final Sign-off &amp; Warranty</Text>
                    <Text style={[styles.milestoneProgressAmount, { color: colors.textSecondary }]}>
                      ₹{activeBooking?.final_milestone?.toLocaleString()} (Locked)
                    </Text>
                  </View>
                  <Text style={styles.milestoneProgressDetail}>
                    Released only upon completion OTP handshake and quality audit.
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* ========================================================================= */}
        {/* 1. EXTRA SPARE PARTS / SCOPE CARD (VIEWED DIRECTLY WITHOUT CLICKING PLUS) */}
        {/* ========================================================================= */}
        {extraWorkDef && (
          <View style={[styles.requestCard, isExtraApproved && styles.requestCardApproved]}>
            <View style={styles.requestHeaderRow}>
              <View style={[styles.iconBox, { backgroundColor: '#E0F2FE' }]}>
                <Ionicons name="construct" size={20} color={colors.primary} />
              </View>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <View style={styles.incomingBadgeRow}>
                  <Text style={styles.incomingBadgeText}>WORKER ON-SITE DIAGNOSIS</Text>
                  <Text style={styles.extraAmountBadge}>+₹{extraWorkDef.amount}</Text>
                </View>
                <Text style={styles.requestTitle}>{extraWorkDef.title}</Text>
              </View>
            </View>

            <Text style={styles.requestDesc}>{extraWorkDef.description}</Text>

            {/* Photo Thumbnail if available */}
            {extraWorkDef.photo && (
              <View style={styles.photoThumbWrap}>
                <Image source={{ uri: extraWorkDef.photo }} style={styles.photoThumb} />
                <View style={styles.photoTag}>
                  <Ionicons name="camera" size={10} color="#FFFFFF" />
                  <Text style={styles.photoTagText}>Live Inspection Proof</Text>
                </View>
              </View>
            )}

            {/* Action States */}
            {isExtraApproved ? (
              <View style={styles.approvedStatusBox}>
                <Ionicons name="checkmark-circle" size={18} color={colors.successDark} />
                <Text style={styles.approvedStatusText}>
                  Approved: +₹{extraWorkDef.amount} added to invoice & transparent wage ledger.
                </Text>
                <TouchableOpacity onPress={handleDeclineExtraParts} style={styles.undoTouch}>
                  <Text style={styles.undoTouchText}>Undo</Text>
                </TouchableOpacity>
              </View>
            ) : isExtraDeclined ? (
              <View style={styles.declinedStatusBox}>
                <Ionicons name="close-circle" size={18} color={colors.textMuted} />
                <Text style={styles.declinedStatusText}>
                  Declined: Proceeding with standard base repair only.
                </Text>
                <TouchableOpacity onPress={handleApproveExtraParts} style={styles.undoTouch}>
                  <Text style={[styles.undoTouchText, { color: colors.primary }]}>Approve</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.actionButtonsRow}>
                <TouchableOpacity
                  style={styles.approveBtn}
                  onPress={handleApproveExtraParts}
                  activeOpacity={0.85}
                >
                  <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                  <Text style={styles.approveBtnText}>Approve Spare (+₹{extraWorkDef.amount})</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.declineBtn}
                  onPress={handleDeclineExtraParts}
                  activeOpacity={0.7}
                >
                  <Text style={styles.declineBtnText}>Decline</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {/* ========================================================================= */}
        {/* 2. ADDITIONAL ASSISTANT / HELPER REQUEST (REQUESTED BY WORKER, ACCEPTED BY USER) */}
        {/* ========================================================================= */}
        {helperAllowed && helperDef && (
          <View style={[styles.requestCard, isHelperApproved && styles.requestCardApproved]}>
            <View style={styles.requestHeaderRow}>
              <View style={[styles.iconBox, { backgroundColor: '#EDE9FE' }]}>
                <Ionicons name="people" size={20} color={colors.cooperativePurple} />
              </View>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <View style={styles.incomingBadgeRow}>
                  <Text style={[styles.incomingBadgeText, { color: colors.cooperativePurple }]}>
                    WORKER INCOMING REQUEST
                  </Text>
                  <Text style={[styles.extraAmountBadge, { color: colors.cooperativePurple }]}>
                    +₹{helperDef.amount || 200}
                  </Text>
                </View>
                <Text style={styles.requestTitle}>
                  {worker?.name || 'Lead Artisan'} is requesting a {helperDef.role || '2nd Assistant'}
                </Text>
              </View>
            </View>

            <Text style={styles.requestDesc}>{helperDef.reason}</Text>

            {/* Helper Action States */}
            {isDispatchingHelper ? (
              <View style={styles.loadingHelperBox}>
                <ActivityIndicator size="small" color={colors.cooperativePurple} />
                <Text style={styles.loadingHelperText}>Dispatching closest assistant from municipal ward...</Text>
              </View>
            ) : isHelperApproved ? (
              <View style={[styles.approvedStatusBox, { backgroundColor: '#EDE9FE' }]}>
                <Ionicons name="checkmark-circle" size={18} color={colors.cooperativePurple} />
                <Text style={[styles.approvedStatusText, { color: colors.cooperativePurple }]}>
                  2nd Worker Assigned (Amit Verma) • +₹{helperDef.amount || 200} added to invoice.
                </Text>
                <TouchableOpacity onPress={handleDeclineHelper} style={styles.undoTouch}>
                  <Text style={styles.undoTouchText}>Remove</Text>
                </TouchableOpacity>
              </View>
            ) : isHelperDeclined ? (
              <View style={styles.declinedStatusBox}>
                <Ionicons name="close-circle" size={18} color={colors.textMuted} />
                <Text style={styles.declinedStatusText}>
                  Declined: Lead artisan will complete task solo.
                </Text>
                <TouchableOpacity onPress={handleApproveHelper} style={styles.undoTouch}>
                  <Text style={[styles.undoTouchText, { color: colors.cooperativePurple }]}>Approve</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.actionButtonsRow}>
                <TouchableOpacity
                  style={[styles.approveBtn, { backgroundColor: colors.cooperativePurple }]}
                  onPress={handleApproveHelper}
                  activeOpacity={0.85}
                >
                  <Ionicons name="person-add" size={16} color="#FFFFFF" />
                  <Text style={styles.approveBtnText}>
                    Approve 2nd Worker (+₹{helperDef.amount || 200})
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.declineBtn}
                  onPress={handleDeclineHelper}
                  activeOpacity={0.7}
                >
                  <Text style={styles.declineBtnText}>Decline</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {/* Real-time Fair Wage Allocation Breakdown */}
        <View style={{ marginBottom: 16 }}>
          <PaymentBreakdown totalAmount={totalAmount || activeBooking?.total_amount || 350} />
        </View>

        {/* Lifecycle Stepper */}
        <View style={styles.stepperContainer}>
          <Text style={styles.stepperTitle}>Service Stage</Text>
          <BookingStatusStepper currentStep={4} compact={false} />
        </View>
      </ScrollView>

      {/* Sticky Bottom Finish Action */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.finishBtn}
          onPress={handleFinishJob}
          activeOpacity={0.85}
        >
          <Ionicons name="checkmark-done" size={20} color="#FFFFFF" />
          <Text style={styles.finishBtnText}>{t('finishJob')}</Text>
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
    paddingTop: 16,
    paddingBottom: 90
  },
  timerHeader: {
    backgroundColor: colors.surface,
    borderRadius: 22,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2
  },
  livePulseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.warningLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 8
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.warningDark,
    marginRight: 6
  },
  livePulseText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.warningDark,
    letterSpacing: 0.5
  },
  timerValue: {
    fontSize: 36,
    fontWeight: '900',
    color: colors.textPrimary,
    letterSpacing: 1
  },
  timerSubtext: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4
  },
  serviceStatusCard: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 14
  },
  serviceRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  serviceIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.primarySubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12
  },
  serviceEmoji: {
    fontSize: 22
  },
  serviceCol: {
    flex: 1
  },
  serviceName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary
  },
  serviceAddress: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2
  },
  priceTag: {
    backgroundColor: colors.surfaceSecondary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'flex-end'
  },
  priceTagLabel: {
    fontSize: 8,
    fontWeight: '800',
    color: colors.textSecondary,
    letterSpacing: 0.5
  },
  priceTagText: {
    fontSize: 16,
    fontWeight: '900',
    color: colors.primary
  },
  pillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border
  },
  basePill: {
    backgroundColor: colors.surfaceSecondary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border
  },
  basePillText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textSecondary
  },
  workerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 12
  },
  workerPhoto: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surfaceSecondary,
    marginRight: 12
  },
  workerInfoCol: {
    flex: 1
  },
  workerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  workerName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary
  },
  leadBadge: {
    backgroundColor: colors.primarySubtle,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6
  },
  leadBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.primary
  },
  workerSociety: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 1
  },
  safetyVerifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3
  },
  safetyVerifiedText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.successDark,
    marginLeft: 4
  },
  requestCard: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1.5,
    borderColor: colors.border,
    marginBottom: 14,
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2
  },
  requestCardApproved: {
    borderColor: colors.successLight,
    backgroundColor: '#F0FDF4'
  },
  requestHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center'
  },
  incomingBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2
  },
  incomingBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 0.5
  },
  extraAmountBadge: {
    fontSize: 13,
    fontWeight: '900',
    color: colors.primary
  },
  requestTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textPrimary
  },
  requestDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 17,
    marginBottom: 10
  },
  photoThumbWrap: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
    position: 'relative'
  },
  photoThumb: {
    width: '100%',
    height: 120,
    backgroundColor: colors.surfaceSecondary
  },
  photoTag: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6
  },
  photoTagText: {
    fontSize: 9,
    color: '#FFFFFF',
    fontWeight: '700',
    marginLeft: 4
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4
  },
  approveBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 12
  },
  approveBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
    marginLeft: 6
  },
  declineBtn: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center'
  },
  declineBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary
  },
  approvedStatusBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.successLight,
    padding: 10,
    borderRadius: 10,
    marginTop: 4
  },
  approvedStatusText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.successDark,
    marginLeft: 6,
    flex: 1
  },
  declinedStatusBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSecondary,
    padding: 10,
    borderRadius: 10,
    marginTop: 4
  },
  declinedStatusText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
    marginLeft: 6,
    flex: 1
  },
  undoTouch: {
    paddingHorizontal: 8,
    paddingVertical: 4
  },
  undoTouchText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.error
  },
  loadingHelperBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 12
  },
  loadingHelperText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.cooperativePurple,
    marginLeft: 8
  },
  stepperContainer: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border
  },
  stepperTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.textPrimary,
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
  finishBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 15,
    borderRadius: 16,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4
  },
  finishBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    marginLeft: 6
  },
  bulkEscrowLiveCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1.5,
    borderColor: colors.primary,
    marginBottom: 16
  },
  bulkEscrowLiveHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4
  },
  bulkEscrowLiveTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 0.5,
    marginLeft: 6
  },
  bulkEscrowLiveSub: {
    fontSize: 11,
    color: colors.textSecondary,
    marginBottom: 12
  },
  milestoneProgressList: {
    gap: 10
  },
  milestoneProgressItem: {
    flexDirection: 'row',
    alignItems: 'flex-start'
  },
  milestoneStatusDotDone: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.successDark,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
    marginRight: 10
  },
  milestoneStatusDotActive: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.warningDark,
    borderWidth: 2,
    borderColor: '#FEF3C7',
    marginTop: 2,
    marginRight: 10
  },
  milestoneStatusDotPending: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.border,
    marginTop: 2,
    marginRight: 10
  },
  milestoneProgressContent: {
    flex: 1
  },
  milestoneProgressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  milestoneProgressName: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.textPrimary
  },
  milestoneProgressAmount: {
    fontSize: 11,
    fontWeight: '800'
  },
  milestoneProgressDetail: {
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 2,
    lineHeight: 14
  },
  waitNotifCard: {
    backgroundColor: '#fffbeb',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#fde68a',
    marginBottom: 14,
  },
  waitNotifCardActive: {
    borderColor: '#f59e0b',
  },
  waitNotifTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#92400e',
  },
  waitNotifTimer: {
    fontSize: 26,
    fontWeight: '900',
    color: '#d97706',
    textAlign: 'center',
    marginVertical: 6,
    fontVariant: ['tabular-nums'],
  },
  waitNotifSub: {
    fontSize: 12,
    color: '#92400e',
    lineHeight: 17,
    marginBottom: 10,
  },
  waitAckBtn: {
    backgroundColor: '#f59e0b',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  waitAckBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#fff',
  },
});

export default Screen09_JobInProgress;
