import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView,
  ScrollView, Modal, Image, Animated
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useJob } from '../context/JobContext';

const DECLINE_REASONS = [
  'Too far away / Traffic congestion',
  'Already engaged in scheduled service',
  'Specialized tool / parts unavailable',
  'Personal emergency',
  'Outside assigned cooperative district',
];

export const Screen08_JobRequest = ({ navigation }) => {
  const { pendingRequest, countdown, acceptJob, declineJob, activeJob, jobHistory } = useJob();
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [selectedReason, setSelectedReason] = useState('');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [previewImage, setPreviewImage] = useState(null);

  const waveAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    let interval;
    if (isPlayingAudio) {
      interval = setInterval(() => {
        setAudioProgress((prev) => {
          if (prev >= 1) {
            setIsPlayingAudio(false);
            return 0;
          }
          return prev + 0.1;
        });
      }, 300);
      Animated.loop(
        Animated.sequence([
          Animated.timing(waveAnim, { toValue: 1.4, duration: 400, useNativeDriver: true }),
          Animated.timing(waveAnim, { toValue: 0.8, duration: 400, useNativeDriver: true }),
        ])
      ).start();
    } else {
      setAudioProgress(0);
      waveAnim.setValue(1);
    }
    return () => clearInterval(interval);
  }, [isPlayingAudio]);

  const toggleAudio = () => {
    setIsPlayingAudio(!isPlayingAudio);
  };

  const handleAccept = () => {
    acceptJob();
    navigation.navigate('ActiveJob');
  };

  const handleDecline = () => {
    if (selectedReason) {
      declineJob();
      setShowDeclineModal(false);
    }
  };

  const countdownColor = countdown > 30 ? colors.success : countdown > 10 ? colors.warning : colors.danger;

  if (!pendingRequest && !activeJob) {
    return (
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Text style={styles.pageTitle}>Job Requests</Text>
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Ionicons name="briefcase-outline" size={48} color={colors.textMuted} />
            </View>
            <Text style={styles.emptyTitle}>No Pending Requests</Text>
            <Text style={styles.emptySubtitle}>Go online from the Home dashboard to receive instant hyper-local cooperative dispatch requests.</Text>
          </View>
          {jobHistory.length > 0 && (
            <View style={{ marginTop: 24 }}>
              <Text style={styles.sectionTitle}>Recent Jobs</Text>
              {jobHistory.slice(0, 4).map((job) => (
                <View key={job.id} style={styles.historyCard}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.historyService}>{job.service}</Text>
                    <Text style={styles.historyMeta}>{job.customerArea} · {job.date}</Text>
                  </View>
                  <View style={styles.historyRight}>
                    <Text style={styles.historyAmount}>₹{job.amount}</Text>
                    <View style={[styles.historyStatus, job.status === 'paid' ? styles.paidStatus : styles.pendingStatus]}>
                      <Text style={[styles.historyStatusText, job.status === 'paid' ? styles.paidText : styles.pendingText]}>
                        {job.status === 'paid' ? '80% Paid' : 'Pending'}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (activeJob) {
    return (
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Text style={styles.pageTitle}>Active Job</Text>
          <View style={styles.activeJobCard}>
            <View style={styles.activeJobHeader}>
              <View style={styles.activeBadge}>
                <View style={styles.activeDot} />
                <Text style={styles.activeBadgeText}>Job In Progress</Text>
              </View>
              <Text style={styles.activeJobId}>{activeJob.id}</Text>
            </View>
            <Text style={styles.activeService}>{activeJob.service}</Text>
            <Text style={styles.activeCustomer}>{activeJob.customerName} · {activeJob.customerArea}</Text>
            <Text style={styles.activeAddress}>{activeJob.customerAddress}</Text>

            <TouchableOpacity
              style={styles.viewActiveBtn}
              onPress={() => navigation.navigate('ActiveJob')}
              activeOpacity={0.85}
            >
              <Text style={styles.viewActiveBtnText}>Continue to Job Monitor</Text>
              <Ionicons name="arrow-forward" size={16} color={colors.textInverse} />
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.pageTitle}>New Job Request</Text>

        <View style={styles.timerCard}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={styles.timerLabel}>Time to Respond</Text>
            <Text style={[styles.timerValue, { color: countdownColor }]}>{countdown}s</Text>
          </View>
          <View style={styles.timerBar}>
            <View style={[styles.timerProgress, { width: `${(countdown / 60) * 100}%`, backgroundColor: countdownColor }]} />
          </View>
        </View>

        <View style={styles.requestCard}>
          <View style={styles.serviceHeader}>
            <View style={styles.serviceIconBg}>
              <Ionicons name="flash" size={24} color={colors.primary} />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                <Text style={styles.serviceName}>{pendingRequest.service}</Text>
                {pendingRequest.is_bulk_project && (
                  <View style={styles.bulkBadge}>
                    <Ionicons name="business-outline" size={11} color="#7c3aed" />
                    <Text style={styles.bulkBadgeText}>Bulk Project</Text>
                  </View>
                )}
                {pendingRequest.worker_count > 1 && (
                  <View style={styles.crewBadge}>
                    <Ionicons name="people-outline" size={11} color="#059669" />
                    <Text style={styles.crewBadgeText}>{pendingRequest.worker_count}-Artisan Squad</Text>
                  </View>
                )}
              </View>
              <Text style={styles.serviceArea}>{pendingRequest.customerArea}</Text>
            </View>
            <View style={styles.distanceBadge}>
              <Ionicons name="location" size={12} color={colors.primary} />
              <Text style={styles.distanceText}>{pendingRequest.distance}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <Text style={styles.issueLabel}>Customer Reported Issue</Text>
          <Text style={styles.issueText}>{pendingRequest.issue}</Text>

          {/* Diagnostic Triage Answers */}
          {(pendingRequest.trade_subtype || pendingRequest.trade_scope || pendingRequest.trade_details) && (
            <View style={styles.diagnosticsCard}>
              <Text style={styles.diagnosticsTitle}>Trade Diagnostic Answers</Text>
              {pendingRequest.trade_subtype ? (
                <View style={styles.diagRow}>
                  <Text style={styles.diagQ}>Fault / Type</Text>
                  <Text style={styles.diagA}>{pendingRequest.trade_subtype}</Text>
                </View>
              ) : null}
              {pendingRequest.trade_scope ? (
                <View style={styles.diagRow}>
                  <Text style={styles.diagQ}>Scope / Load</Text>
                  <Text style={styles.diagA}>{pendingRequest.trade_scope}</Text>
                </View>
              ) : null}
              {pendingRequest.trade_details ? (
                <View style={styles.diagRow}>
                  <Text style={styles.diagQ}>Material / Parts</Text>
                  <Text style={styles.diagA}>{pendingRequest.trade_details}</Text>
                </View>
              ) : null}
            </View>
          )}

          {/* Driver specific details */}
          {pendingRequest.serviceType === 'driver' && (pendingRequest.driver_booking_mode || pendingRequest.car_seater_type) && (
            <View style={styles.driverCard}>
              <Text style={styles.diagnosticsTitle}>Mobility Trip Specifications</Text>
              {pendingRequest.driver_booking_mode ? (
                <View style={styles.diagRow}>
                  <Text style={styles.diagQ}>Booking Mode</Text>
                  <Text style={styles.diagA}>{pendingRequest.driver_booking_mode}</Text>
                </View>
              ) : null}
              {pendingRequest.car_seater_type ? (
                <View style={styles.diagRow}>
                  <Text style={styles.diagQ}>Vehicle Capacity</Text>
                  <Text style={styles.diagA}>{pendingRequest.car_seater_type}-Seater SUV / Sedan</Text>
                </View>
              ) : null}
              {pendingRequest.transmission_type ? (
                <View style={styles.diagRow}>
                  <Text style={styles.diagQ}>Transmission</Text>
                  <Text style={styles.diagA}>{pendingRequest.transmission_type}</Text>
                </View>
              ) : null}
              {pendingRequest.trip_type ? (
                <View style={styles.diagRow}>
                  <Text style={styles.diagQ}>Trip Package</Text>
                  <Text style={styles.diagA}>{pendingRequest.trip_type}</Text>
                </View>
              ) : null}
            </View>
          )}

          {/* Audio Voice Note from Customer */}
          {pendingRequest.voice_note && (
            <View style={styles.voiceNoteCard}>
              <View style={styles.voiceHeader}>
                <Ionicons name="mic" size={18} color={colors.primary} />
                <Text style={styles.voiceTitle}>Customer Voice Note Diagnostic</Text>
                <Text style={styles.voiceDuration}>{pendingRequest.voice_note.duration || '0:18'}</Text>
              </View>
              <View style={styles.voicePlayerRow}>
                <TouchableOpacity style={styles.playBtn} onPress={toggleAudio} activeOpacity={0.8}>
                  <Ionicons name={isPlayingAudio ? 'pause' : 'play'} size={18} color={colors.textInverse} />
                </TouchableOpacity>
                <View style={styles.waveContainer}>
                  {[4, 12, 18, 8, 16, 22, 14, 20, 6, 15, 19, 10, 17, 7, 13].map((h, idx) => (
                    <Animated.View
                      key={idx}
                      style={[
                        styles.waveBar,
                        {
                          height: isPlayingAudio ? h * (idx % 2 === 0 ? 1.2 : 0.8) : h,
                          backgroundColor: idx / 15 <= audioProgress ? colors.primary : colors.border,
                        },
                      ]}
                    />
                  ))}
                </View>
                <Text style={styles.listenLabel}>{isPlayingAudio ? 'Playing...' : 'Tap to listen'}</Text>
              </View>
            </View>
          )}

          {/* Photo Attachments from Customer */}
          {pendingRequest.attachments && pendingRequest.attachments.length > 0 && (
            <View style={styles.attachmentsCard}>
              <View style={styles.voiceHeader}>
                <Ionicons name="images-outline" size={18} color={colors.primary} />
                <Text style={styles.voiceTitle}>Diagnostic Photos ({pendingRequest.attachments.length})</Text>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
                {pendingRequest.attachments.map((att) => (
                  <TouchableOpacity
                    key={att.id}
                    style={styles.photoThumbWrap}
                    onPress={() => setPreviewImage(att.uri)}
                    activeOpacity={0.8}
                  >
                    <Image source={{ uri: att.uri }} style={styles.photoThumb} />
                    {att.label ? (
                      <View style={styles.thumbLabelBg}>
                        <Text style={styles.thumbLabelText}>{att.label}</Text>
                      </View>
                    ) : null}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Earnings Breakdown */}
          <View style={styles.earningBox}>
            <View style={{ flex: 1 }}>
              <Text style={styles.earningLabel}>Estimated Artisan Earning (80%)</Text>
              <Text style={styles.earningAmount}>₹{pendingRequest.estimatedEarning}</Text>
              <Text style={styles.earningSub}>Customer Total: ₹{pendingRequest.totalAmount || 400} (10% Welfare Fund incl.)</Text>
            </View>
            <View style={styles.earningTag}>
              <Ionicons name="shield-checkmark" size={14} color={colors.success} />
              <Text style={styles.earningTagText}>Guaranteed</Text>
            </View>
          </View>

          {/* Accept / Decline Action Buttons */}
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={styles.declineBtn}
              onPress={() => setShowDeclineModal(true)}
              activeOpacity={0.8}
            >
              <Ionicons name="close-circle-outline" size={18} color={colors.danger} />
              <Text style={styles.declineBtnText}>Decline</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.acceptBtn}
              onPress={handleAccept}
              activeOpacity={0.85}
            >
              <Ionicons name="checkmark-circle" size={18} color={colors.textInverse} />
              <Text style={styles.acceptBtnText}>Accept & Dispatch</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Decline Reason Modal */}
        <Modal visible={showDeclineModal} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Reason for Declining</Text>
              <Text style={styles.modalSub}>Helps the cooperative re-route to another nearest verified artisan.</Text>
              {DECLINE_REASONS.map((reason) => (
                <TouchableOpacity
                  key={reason}
                  style={[styles.reasonItem, selectedReason === reason && styles.reasonItemSelected]}
                  onPress={() => setSelectedReason(reason)}
                >
                  <Ionicons
                    name={selectedReason === reason ? 'radio-button-on' : 'radio-button-off'}
                    size={18}
                    color={selectedReason === reason ? colors.primary : colors.textMuted}
                  />
                  <Text style={[styles.reasonText, selectedReason === reason && styles.reasonTextSelected]}>
                    {reason}
                  </Text>
                </TouchableOpacity>
              ))}
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.modalCancelBtn}
                  onPress={() => setShowDeclineModal(false)}
                >
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalConfirmBtn, !selectedReason && { opacity: 0.5 }]}
                  disabled={!selectedReason}
                  onPress={handleDecline}
                >
                  <Text style={styles.modalConfirmText}>Confirm Decline</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Photo Preview Modal */}
        <Modal visible={!!previewImage} transparent animationType="fade">
          <View style={styles.imageModalOverlay}>
            <TouchableOpacity style={styles.imageCloseBtn} onPress={() => setPreviewImage(null)}>
              <Ionicons name="close" size={26} color="#fff" />
            </TouchableOpacity>
            {previewImage ? (
              <Image source={{ uri: previewImage }} style={styles.fullImage} resizeMode="contain" />
            ) : null}
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 36 },
  pageTitle: { fontSize: 22, fontWeight: '800', color: colors.textPrimary, marginBottom: 14 },
  emptyState: { backgroundColor: colors.surface, borderRadius: 16, padding: 32, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  emptyIcon: { width: 72, height: 72, borderRadius: 36, backgroundColor: colors.surfaceSecondary, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: colors.textPrimary, marginBottom: 6 },
  emptySubtitle: { fontSize: 13, color: colors.textMuted, textAlign: 'center', lineHeight: 18 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.textPrimary, marginBottom: 12 },
  historyCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: colors.border },
  historyService: { fontSize: 14, fontWeight: '700', color: colors.textPrimary },
  historyMeta: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  historyRight: { alignItems: 'flex-end' },
  historyAmount: { fontSize: 15, fontWeight: '800', color: colors.success },
  historyStatus: { borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2, marginTop: 4 },
  paidStatus: { backgroundColor: colors.successLight },
  pendingStatus: { backgroundColor: colors.warningLight },
  historyStatusText: { fontSize: 10, fontWeight: '700' },
  paidText: { color: colors.success },
  pendingText: { color: colors.warningDark },
  activeJobCard: { backgroundColor: colors.surface, borderRadius: 16, padding: 20, borderWidth: 1, borderColor: colors.primary, shadowColor: colors.primary, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3 },
  activeJobHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  activeBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.primarySubtle, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, gap: 6 },
  activeDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary },
  activeBadgeText: { fontSize: 12, fontWeight: '700', color: colors.primary },
  activeJobId: { fontSize: 12, fontWeight: '700', color: colors.textMuted },
  activeService: { fontSize: 18, fontWeight: '800', color: colors.textPrimary, marginBottom: 4 },
  activeCustomer: { fontSize: 14, color: colors.textSecondary, marginBottom: 2 },
  activeAddress: { fontSize: 12, color: colors.textMuted, marginBottom: 16 },
  viewActiveBtn: { backgroundColor: colors.primary, borderRadius: 12, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  viewActiveBtnText: { color: colors.textInverse, fontSize: 14, fontWeight: '700' },
  timerCard: { backgroundColor: colors.surface, borderRadius: 14, padding: 14, marginBottom: 14, borderWidth: 1, borderColor: colors.border },
  timerLabel: { fontSize: 12, fontWeight: '700', color: colors.textMuted },
  timerValue: { fontSize: 18, fontWeight: '900' },
  timerBar: { height: 6, backgroundColor: colors.surfaceSecondary, borderRadius: 3, marginTop: 8, overflow: 'hidden' },
  timerProgress: { height: '100%', borderRadius: 3 },
  requestCard: { backgroundColor: colors.surface, borderRadius: 18, padding: 18, borderWidth: 1, borderColor: colors.border, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  serviceHeader: { flexDirection: 'row', alignItems: 'center' },
  serviceIconBg: { width: 44, height: 44, borderRadius: 12, backgroundColor: colors.primarySubtle, alignItems: 'center', justifyContent: 'center' },
  serviceName: { fontSize: 16, fontWeight: '800', color: colors.textPrimary },
  bulkBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#ede9fe', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  bulkBadgeText: { fontSize: 10, fontWeight: '800', color: '#7c3aed' },
  crewBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.successLight, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  crewBadgeText: { fontSize: 10, fontWeight: '800', color: colors.success },
  serviceArea: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
  distanceBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: colors.primarySubtle, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  distanceText: { fontSize: 11, fontWeight: '700', color: colors.primary },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: 14 },
  issueLabel: { fontSize: 12, fontWeight: '700', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  issueText: { fontSize: 14, fontWeight: '600', color: colors.textPrimary, lineHeight: 20, marginBottom: 14 },
  diagnosticsCard: { backgroundColor: colors.surfaceSecondary, borderRadius: 12, padding: 12, marginBottom: 14 },
  diagnosticsTitle: { fontSize: 12, fontWeight: '800', color: colors.primaryDark, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 },
  diagRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.05)' },
  diagQ: { fontSize: 12, color: colors.textMuted, fontWeight: '600' },
  diagA: { fontSize: 12, color: colors.textPrimary, fontWeight: '700' },
  driverCard: { backgroundColor: '#f0f9ff', borderRadius: 12, padding: 12, marginBottom: 14, borderWidth: 1, borderColor: '#bae6fd' },
  voiceNoteCard: { backgroundColor: '#f5f3ff', borderRadius: 12, padding: 12, marginBottom: 14, borderWidth: 1, borderColor: '#ddd6fe' },
  voiceHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  voiceTitle: { fontSize: 12, fontWeight: '800', color: colors.primary, flex: 1 },
  voiceDuration: { fontSize: 11, fontWeight: '700', color: colors.textMuted },
  voicePlayerRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  playBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  waveContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', height: 30, gap: 3 },
  waveBar: { width: 3, borderRadius: 2 },
  listenLabel: { fontSize: 11, color: colors.textMuted, fontWeight: '600' },
  attachmentsCard: { backgroundColor: colors.surfaceSecondary, borderRadius: 12, padding: 12, marginBottom: 14 },
  photoThumbWrap: { marginRight: 10, borderRadius: 8, overflow: 'hidden', borderWidth: 1, borderColor: colors.border },
  photoThumb: { width: 80, height: 60 },
  thumbLabelBg: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.6)', paddingVertical: 2, paddingHorizontal: 4 },
  thumbLabelText: { color: '#fff', fontSize: 9, fontWeight: '700', textAlign: 'center' },
  earningBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ecfdf5', borderRadius: 14, padding: 14, marginBottom: 18, borderWidth: 1, borderColor: '#a7f3d0' },
  earningLabel: { fontSize: 11, fontWeight: '700', color: '#065f46', textTransform: 'uppercase' },
  earningAmount: { fontSize: 24, fontWeight: '900', color: '#059669', marginVertical: 2 },
  earningSub: { fontSize: 11, color: '#047857' },
  earningTag: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#d1fae5', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  earningTagText: { fontSize: 11, fontWeight: '800', color: '#065f46' },
  actionsRow: { flexDirection: 'row', gap: 12 },
  declineBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 13, borderRadius: 12, backgroundColor: '#fee2e2', borderWidth: 1, borderColor: '#fca5a5' },
  declineBtnText: { color: colors.danger, fontSize: 14, fontWeight: '700' },
  acceptBtn: { flex: 1.5, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 13, borderRadius: 12, backgroundColor: colors.primary, shadowColor: colors.primary, shadowOpacity: 0.25, shadowRadius: 6, elevation: 3 },
  acceptBtnText: { color: colors.textInverse, fontSize: 14, fontWeight: '800' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: colors.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 22 },
  modalTitle: { fontSize: 17, fontWeight: '800', color: colors.textPrimary, marginBottom: 4 },
  modalSub: { fontSize: 12, color: colors.textMuted, marginBottom: 16 },
  reasonItem: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: colors.border },
  reasonItemSelected: { backgroundColor: colors.primarySubtle, borderRadius: 8, paddingHorizontal: 8 },
  reasonText: { fontSize: 13, color: colors.textPrimary },
  reasonTextSelected: { color: colors.primaryDark, fontWeight: '700' },
  modalActions: { flexDirection: 'row', gap: 10, marginTop: 18 },
  modalCancelBtn: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 10, borderWidth: 1, borderColor: colors.border },
  modalCancelText: { color: colors.textMuted, fontWeight: '700' },
  modalConfirmBtn: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 10, backgroundColor: colors.danger },
  modalConfirmText: { color: '#fff', fontWeight: '700' },
  imageModalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center' },
  imageCloseBtn: { position: 'absolute', top: 40, right: 20, zIndex: 10, padding: 8 },
  fullImage: { width: '90%', height: '70%' },
});

export default Screen08_JobRequest;
