import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView,
  ScrollView, TextInput, Modal, Animated, Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useJob } from '../context/JobContext';
import { useWorker } from '../context/WorkerContext';
import SimulatedMap from '../components/SimulatedMap';

const JOB_STAGES = [
  { id: 'travelling', labelKey: 'enRoute', label: 'En Route', icon: 'car-outline' },
  { id: 'arrived', labelKey: 'arrived', label: 'Doorstep', icon: 'location' },
  { id: 'working', labelKey: 'workActive', label: 'Work Active', icon: 'construct-outline' },
  { id: 'completed', labelKey: 'signOff', label: 'Sign-Off', icon: 'checkmark-circle' },
];

const PROCUREMENT_TRADES = ['electrician', 'technician'];

function formatTime(secs) {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export const Screen09_ActiveJob = ({ navigation }) => {
  const { t } = useWorker();
  const {
    activeJob, jobStatus, updateJobStatus, completeJob,
    submitExtraWork, extraWorkRequest, approveExtraWork,
    elapsedSeconds, procurementPaused, procurementResumeOtp, overtimeApplied,
    pauseForProcurement, resumeFromProcurement, triggerSimulatedOvertime,
    acceptElapsed, isTravelPaused, pauseTravel, resumeTravel,
    helperRequest, requestHelperWorker, approveHelperRequest,
    waitRequest, waitElapsed, startWaitTime, endWaitTime, acknowledgeWaitRequest,
  } = useJob();

  const [startOtp, setStartOtp] = useState('');
  const [completionOtp, setCompletionOtp] = useState('');
  const [resumeOtp, setResumeOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [resumeError, setResumeError] = useState('');
  const [showExtraModal, setShowExtraModal] = useState(false);
  const [extraDesc, setExtraDesc] = useState('');
  const [extraCost, setExtraCost] = useState('');
  const [generatedResumeOtp, setGeneratedResumeOtp] = useState(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [helperMessage, setHelperMessage] = useState('');
  const [showHelperModal, setShowHelperModal] = useState(false);

  if (!activeJob) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <Ionicons name="briefcase-outline" size={56} color={colors.textMuted} />
          <Text style={{ marginTop: 14, color: colors.textPrimary, fontSize: 17, fontWeight: '700' }}>{t('noActiveJob', 'No Active Job')}</Text>
          <Text style={{ marginTop: 6, color: colors.textMuted, fontSize: 13, textAlign: 'center' }}>{t('noActiveJobDesc', 'You do not have any job currently in progress.')}</Text>
          <TouchableOpacity
            style={[styles.primaryBtn, { marginTop: 20 }]}
            onPress={() => navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] })}
          >
            <Text style={styles.primaryBtnText}>{t('backToHome', 'Back to Dashboard')}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const currentStageIndex = JOB_STAGES.findIndex((s) => s.id === jobStatus);
  const demoStartOtp = activeJob.start_otp || '4821';
  const demoCompletionOtp = activeJob.completion_otp || '9182';
  const canProcurementPause = PROCUREMENT_TRADES.includes(activeJob.serviceType);

  const handleStartOtp = () => {
    if (startOtp === demoStartOtp || startOtp === '1234' || startOtp === '4821' || startOtp === '7842') {
      setOtpError('');
      updateJobStatus('working');
    } else {
      setOtpError(`Incorrect OTP. Ask the customer for their 4-digit code (Demo: ${demoStartOtp})`);
    }
  };

  const handleCompleteOtp = () => {
    if (completionOtp === demoCompletionOtp || completionOtp === '1234' || completionOtp === '9182' || completionOtp === '7842') {
      setOtpError('');
      const snapshot = activeJob; // capture before async delay
      updateJobStatus('completed');
      setTimeout(() => {
        completeJob(snapshot);
        navigation.navigate('RatingScreen');
      }, 1200);
    } else {
      setOtpError(`Incorrect completion OTP. Ask customer after inspection (Demo: ${demoCompletionOtp})`);
    }
  };

  const handlePause = () => {
    const otp = pauseForProcurement();
    setGeneratedResumeOtp(otp);
  };

  const handleResume = () => {
    const ok = resumeFromProcurement(resumeOtp);
    if (ok) {
      setResumeError('');
      setResumeOtp('');
      setGeneratedResumeOtp(null);
    } else {
      setResumeError(`Incorrect OTP. Enter the 4-digit code (Demo: ${generatedResumeOtp || '4821'})`);
    }
  };

  const handleSubmitExtra = () => {
    if (!extraDesc.trim() || !extraCost) return;
    submitExtraWork({ description: extraDesc.trim(), additionalCost: parseInt(extraCost, 10) || 0 });
    setShowExtraModal(false);
    setExtraDesc('');
    setExtraCost('');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Top bar */}
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
          </TouchableOpacity>
          <View style={{ alignItems: 'center' }}>
            <Text style={styles.jobId}>{activeJob.id}</Text>
            <Text style={styles.tradeSubhead}>{t(activeJob.serviceType, activeJob.service)}</Text>
          </View>
          {jobStatus === 'travelling' ? (
            <TouchableOpacity style={styles.trackBtn} onPress={() => navigation.navigate('LiveTracking')} activeOpacity={0.8}>
              <Ionicons name="navigate" size={16} color={colors.primary} />
              <Text style={styles.trackBtnText}>{t('map', 'Map')}</Text>
            </TouchableOpacity>
          ) : (
            <View style={{ width: 44 }} />
          )}
        </View>

        {/* 4-Stage Lifecycle Stepper */}
        <View style={styles.timelineCard}>
          <Text style={styles.timelineTitle}>{t('coopServiceLifecycle', 'Cooperative Service Lifecycle')}</Text>
          <View style={styles.timeline}>
            {JOB_STAGES.map((stage, i) => {
              const isDone = i < currentStageIndex;
              const isActive = i === currentStageIndex;
              return (
                <View key={stage.id} style={styles.timelineItem}>
                  <View style={styles.timelineLeft}>
                    <View style={[
                      styles.timelineDot,
                      isDone && styles.timelineDotDone,
                      isActive && styles.timelineDotActive,
                    ]}>
                      <Ionicons
                        name={isDone ? 'checkmark' : stage.icon}
                        size={14}
                        color={isDone || isActive ? colors.textInverse : colors.textMuted}
                      />
                    </View>
                    {i < JOB_STAGES.length - 1 && (
                      <View style={[styles.timelineConnector, isDone && styles.timelineConnectorDone]} />
                    )}
                  </View>
                  <Text style={[
                    styles.timelineLabel,
                    isDone && styles.timelineLabelDone,
                    isActive && styles.timelineLabelActive,
                  ]}>
                    {t(stage.labelKey, stage.label)}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Customer & Location Details Card */}
        <View style={styles.customerCard}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <Text style={styles.customerCardTitle}>{t('customerDestination', 'Customer & Destination')}</Text>
            <View style={{ flexDirection: 'row', gap: 6 }}>
              {activeJob.is_bulk_project && (
                <View style={styles.bulkTag}>
                  <Ionicons name="business-outline" size={11} color="#7c3aed" />
                  <Text style={styles.bulkTagText}>{t('bulkEscrow', 'Bulk Escrow')}</Text>
                </View>
              )}
              {activeJob.worker_count > 1 && (
                <View style={styles.crewTag}>
                  <Ionicons name="people-outline" size={11} color="#059669" />
                  <Text style={styles.crewTagText}>{activeJob.worker_count}-{t('crewSquad', 'Crew Squad')}</Text>
                </View>
              )}
            </View>
          </View>

          <View style={styles.customerRow}>
            <View style={styles.customerAvatar}>
              <Ionicons name="person" size={20} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.customerName}>{activeJob.customerName}</Text>
              <Text style={styles.customerPhone}>{activeJob.customerPhone || '+91 98765 43210'}</Text>
            </View>
            <TouchableOpacity style={styles.callBtn} activeOpacity={0.8}>
              <Ionicons name="call" size={18} color={colors.primary} />
            </TouchableOpacity>
          </View>

          <View style={styles.addressRow}>
            <Ionicons name="location-outline" size={15} color={colors.textMuted} style={{ marginTop: 2 }} />
            <Text style={styles.addressText}>{activeJob.customerAddress || activeJob.customerArea + ', New Delhi'}</Text>
          </View>

          <View style={styles.issueRow}>
            <Ionicons name="alert-circle-outline" size={15} color={colors.textMuted} style={{ marginTop: 2 }} />
            <Text style={styles.issueText}>{activeJob.issue}</Text>
          </View>

          {/* Diagnostics summary */}
          {(activeJob.trade_subtype || activeJob.trade_scope || activeJob.trade_details) && (
            <View style={styles.diagSummaryBox}>
              <Text style={styles.diagSummaryTitle}>{t('diagnosticAnswers', 'Diagnostic Answers:')}</Text>
              <Text style={styles.diagSummaryItem}>• {activeJob.trade_subtype || 'Standard Diagnosis'}</Text>
              {activeJob.trade_scope ? <Text style={styles.diagSummaryItem}>• {activeJob.trade_scope}</Text> : null}
              {activeJob.trade_details ? <Text style={styles.diagSummaryItem}>• {activeJob.trade_details}</Text> : null}
            </View>
          )}

          {/* Voice note & photo attachments preview during job */}
          {activeJob.voice_note && (
            <View style={styles.activeVoiceBox}>
              <Ionicons name="mic" size={16} color={colors.primary} />
              <Text style={styles.activeVoiceText}>{t('customerVoiceDiagnostic', 'Customer voice diagnostic')} ({activeJob.voice_note.duration || '0:18'})</Text>
              <TouchableOpacity
                style={styles.voicePlayMini}
                onPress={() => setIsPlayingAudio(!isPlayingAudio)}
              >
                <Ionicons name={isPlayingAudio ? 'pause' : 'play'} size={14} color={colors.textInverse} />
              </TouchableOpacity>
            </View>
          )}
          {activeJob.attachments && activeJob.attachments.length > 0 && (
            <View style={styles.activeAttachBox}>
              <Text style={styles.attachTitle}>{t('photosFromCustomer', 'Photos from Customer:')}</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 6 }}>
                {activeJob.attachments.map((att) => (
                  <TouchableOpacity
                    key={att.id}
                    style={styles.attachThumb}
                    onPress={() => setPreviewImage(att.uri)}
                  >
                    <Image source={{ uri: att.uri }} style={{ width: 60, height: 48, borderRadius: 6 }} />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>

        {/* STAGE 1: TRAVELLING -> REACHED DOORSTEP */}
        {jobStatus === 'travelling' && (
          <View>
            {/* Accept-time elapsed + pause strip */}
            <View style={[styles.acceptTimerCard, isTravelPaused && styles.acceptTimerPaused]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <View style={[styles.timerLiveDot, isTravelPaused && styles.timerPausedDot]} />
                  <Text style={styles.acceptTimerLabel}>
                    {isTravelPaused ? t('travelPaused', 'Travel Paused') : t('travelTime', 'Travel Time')}
                  </Text>
                </View>
                <Text style={[styles.acceptTimerValue, isTravelPaused && { color: colors.warningDark }]}>
                  {formatTime(acceptElapsed || 0)}
                </Text>
              </View>
              <TouchableOpacity
                style={[styles.travelPauseBtn, isTravelPaused && styles.travelResumeBtn]}
                onPress={isTravelPaused ? resumeTravel : pauseTravel}
                activeOpacity={0.8}
              >
                <Ionicons name={isTravelPaused ? 'play-circle-outline' : 'pause-circle-outline'} size={16} color={isTravelPaused ? colors.success : colors.warningDark} />
                <Text style={[styles.travelPauseBtnText, isTravelPaused && { color: colors.success }]}>
                  {isTravelPaused ? t('resumeTravel', 'Resume Travel') : t('pauseTravel', 'Pause (Waiting / Traffic)')}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.stageActionCard}>
              <Ionicons name="car-sport" size={32} color={colors.primary} />
              <Text style={styles.stageActionTitle}>{t('enRouteCustomer', 'En Route to Customer')}</Text>
              <Text style={styles.stageActionSub}>{t('enRouteSub', "Follow GPS navigation. When you arrive at the customer's doorstep, tap below to request the Start OTP.")}</Text>
              
              <View style={{ width: '100%', marginBottom: 14 }}>
                <SimulatedMap
                  userAddress={activeJob.customerAddress}
                  customerArea={activeJob.customerArea}
                  serviceName={activeJob.service}
                  autoStart={true}
                  mode="tracking"
                  onArrival={() => updateJobStatus('arrived')}
                />
              </View>

              <TouchableOpacity
                style={styles.primaryActionBtn}
                onPress={() => updateJobStatus('arrived')}
                activeOpacity={0.85}
              >
                <Ionicons name="location" size={18} color={colors.textInverse} />
                <Text style={styles.primaryActionBtnText}>{t('arrivedDoorstep', 'I Have Arrived at Doorstep')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* STAGE 2: ARRIVED -> ENTER START OTP HANDSHAKE */}
        {jobStatus === 'arrived' && (
          <View>
          {/* Wait Time Tracker — customer not ready */}
          <View style={[styles.waitCard, waitRequest?.status === 'waiting' && styles.waitCardActive]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <Ionicons name="time-outline" size={20} color={waitRequest?.status === 'waiting' ? '#d97706' : colors.textSecondary} />
              <Text style={styles.waitCardTitle}>{t('doorstepWaitTimer', 'Doorstep Wait Timer')}</Text>
              {waitRequest?.status === 'ended' && (
                <View style={styles.waitEndedBadge}>
                  <Text style={styles.waitEndedBadgeText}>
                    {waitRequest.billable ? `⚡ ${formatTime(waitRequest.elapsed)} — ${t('billable', 'Billable')}` : `✓ ${formatTime(waitRequest.elapsed)} — ${t('free', 'Free')}`}
                  </Text>
                </View>
              )}
            </View>
            <Text style={styles.waitCardSub}>
              {waitRequest?.status === 'waiting'
                ? t('waitTimerRunning', 'Timer running — customer has been notified you are waiting.')
                : waitRequest?.status === 'ended'
                ? t('waitEnded', 'Wait ended. ') + (waitRequest.billable ? `₹${Math.max(0, Math.floor((waitRequest.elapsed - 300) / 60)) * 10} wait charge will be added.` : t('under5Min', 'Under 5 min — no extra charge.'))
                : t('customerNotResponding', 'Customer not responding? Start the wait timer — they will be notified.')}
            </Text>

            {waitRequest?.status === 'waiting' && (
              <Text style={styles.waitTimerDisplay}>{formatTime(waitElapsed)}</Text>
            )}

            {!waitRequest && (
              <TouchableOpacity style={styles.waitStartBtn} onPress={startWaitTime} activeOpacity={0.8}>
                <Ionicons name="timer-outline" size={16} color='#92400e' />
                <Text style={styles.waitStartBtnText}>{t('startWaitTimer', 'Start Wait Timer')}</Text>
              </TouchableOpacity>
            )}
            {waitRequest?.status === 'waiting' && (
              <View style={{ gap: 8 }}>
                <TouchableOpacity style={styles.waitEndBtn} onPress={endWaitTime} activeOpacity={0.8}>
                  <Ionicons name="checkmark-circle-outline" size={16} color={colors.success} />
                  <Text style={styles.waitEndBtnText}>{t('customerReadyEndWait', 'Customer Ready — End Wait')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.demoApproveBtn} onPress={acknowledgeWaitRequest} activeOpacity={0.7}>
                  <Text style={styles.demoApproveText}>⚡ {t('simulateCustomerAck', 'Simulate Customer Acknowledged')}</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          <View style={styles.otpCard}>
            <View style={styles.otpIconCircle}>
              <Ionicons name="key" size={26} color={colors.primary} />
            </View>
            <Text style={styles.otpCardTitle}>{t('physicalStartOtp', 'Physical Start OTP Handshake')}</Text>
            <Text style={styles.otpCardSub}>
              {t('startOtpSub', 'Verify customer identity and ask for their 4-digit Start OTP to begin the job timer.')}
            </Text>
            <View style={styles.demoBadge}>
              <Text style={styles.demoBadgeText}>{t('customerStartOtp', 'Customer Start OTP:')} <Text style={{ fontWeight: '900', color: colors.primary }}>{demoStartOtp}</Text></Text>
            </View>

            <TextInput
              style={styles.otpInput}
              placeholder={t('enterStartOtp', 'Enter 4-digit Start OTP')}
              placeholderTextColor={colors.textMuted}
              keyboardType="number-pad"
              maxLength={4}
              value={startOtp}
              onChangeText={(v) => { setStartOtp(v); setOtpError(''); }}
            />
            {otpError ? <Text style={styles.errorText}>{otpError}</Text> : null}

            <TouchableOpacity
              style={styles.startJobBtn}
              onPress={handleStartOtp}
              activeOpacity={0.85}
            >
              <Ionicons name="play" size={18} color={colors.textInverse} />
              <Text style={styles.startJobBtnText}>{t('verifyOtpBeginWork', 'Verify OTP & Begin Work')}</Text>
            </TouchableOpacity>
          </View>
          </View>
        )}

        {/* STAGE 3: WORK IN PROGRESS */}
        {jobStatus === 'working' && (
          <View>
            {/* Live Timer & Stopwatch Card */}
            <View style={[styles.timerMonitorCard, procurementPaused && styles.timerPausedCard]}>
              <View style={styles.timerMonitorHeader}>
                <View style={styles.timerHeaderLeft}>
                  <View style={[styles.timerLiveDot, procurementPaused && styles.timerPausedDot]} />
                  <Text style={styles.timerMonitorTitle}>
                    {procurementPaused ? t('timerPausedProcurement', 'Timer Paused (Phase I Procurement)') : t('activeLaborStopwatch', 'Active Labor Stopwatch')}
                  </Text>
                </View>
                {overtimeApplied && (
                  <View style={styles.otBadge}>
                    <Text style={styles.otBadgeText}>{t('overtimeActiveBadge', '+₹100 Overtime Active')}</Text>
                  </View>
                )}
              </View>

              <Text style={[styles.stopwatchText, procurementPaused && { color: colors.warningDark }]}>
                {formatTime(elapsedSeconds)}
              </Text>
              <Text style={styles.stopwatchSub}>
                {procurementPaused
                  ? t('timerFrozenDesc', 'Timer is safely frozen. Zero charges accumulated while procuring parts.')
                  : t('sevaSurakshaDesc', 'Covered under Seva Suraksha statutory warranty guarantee.')}
              </Text>

              {/* Overtime Alert Banner (Phase II) */}
              {overtimeApplied && (
                <View style={styles.overtimeAlertBox}>
                  <Ionicons name="time" size={18} color="#92400e" />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.overtimeAlertTitle}>{t('overtimeAlertTitle', 'Automatic 2-Hour Overtime Applied (+₹100)')}</Text>
                    <Text style={styles.overtimeAlertSub}>{t('overtimeAlertSub', 'Labor exceeded 120 minutes. +₹100 fair wage surcharge automatically added to final settlement.')}</Text>
                  </View>
                </View>
              )}

              {/* Demo Button to Trigger 2-Hour Overtime for hackathon reviewers */}
              {!overtimeApplied && (
                <TouchableOpacity
                  style={styles.demoOtBtn}
                  onPress={triggerSimulatedOvertime}
                  activeOpacity={0.75}
                >
                  <Ionicons name="flash-outline" size={13} color={colors.textSecondary} />
                  <Text style={styles.demoOtBtnText}>⚡ {t('simulateOvertime', 'Simulate 2-Hour Overtime Trigger (+₹100)')}</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Phase I: Part Procurement Pause Controls (Electrician & Technician) */}
            {canProcurementPause && (
              <View style={styles.phaseCard}>
                <View style={styles.phaseHeader}>
                  <Ionicons name="hardware-chip-outline" size={20} color={colors.primary} />
                  <Text style={styles.phaseTitle}>{t('partProcurementProtocol', 'Phase I: Part Procurement Protocol')}</Text>
                </View>
                <Text style={styles.phaseSub}>
                  {t('partProcurementSub', 'For electrical & appliance parts requiring external market procurement. Freezes billing timer.')}
                </Text>

                {!procurementPaused ? (
                  <TouchableOpacity
                    style={styles.procurePauseBtn}
                    onPress={handlePause}
                    activeOpacity={0.85}
                  >
                    <Ionicons name="pause-circle-outline" size={18} color="#784b00" />
                    <Text style={styles.procurePauseBtnText}>{t('pauseStopwatchProcure', 'Pause Stopwatch to Procure Parts')}</Text>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.resumeBox}>
                    <View style={styles.resumeOtpInfo}>
                      <Text style={styles.resumeOtpLabel}>{t('resumeOtpCustomer', 'Resume OTP (Shared with Customer):')}</Text>
                      <Text style={styles.resumeOtpValue}>{generatedResumeOtp || '4821'}</Text>
                    </View>
                    <Text style={styles.resumePrompt}>
                      {t('resumePrompt', 'When you return with the parts, ask the customer for the 4-digit Resume OTP:')}
                    </Text>
                    <TextInput
                      style={styles.resumeInput}
                      placeholder={t('enterResumeOtp', 'Enter 4-digit Resume OTP')}
                      placeholderTextColor={colors.textMuted}
                      keyboardType="number-pad"
                      maxLength={4}
                      value={resumeOtp}
                      onChangeText={(v) => { setResumeOtp(v); setResumeError(''); }}
                    />
                    {resumeError ? <Text style={styles.errorText}>{resumeError}</Text> : null}
                    <TouchableOpacity
                      style={styles.resumeBtn}
                      onPress={handleResume}
                      activeOpacity={0.85}
                    >
                      <Ionicons name="play-circle" size={18} color={colors.textInverse} />
                      <Text style={styles.resumeBtnText}>{t('verifyOtpResume', 'Verify OTP & Resume Work')}</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}

            {/* Extra Scope Expansion Approval */}
            <View style={styles.extraWorkCard}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <Text style={styles.extraWorkTitle}>{t('extraWorkScope', 'Scope Expansion / Extra Work')}</Text>
                {extraWorkRequest ? (
                  <View style={[styles.extraStatusBadge, extraWorkRequest.status === 'approved' ? styles.extraApprove : styles.extraPending]}>
                    <Text style={[styles.extraStatusText, extraWorkRequest.status === 'approved' ? styles.extraApproveText : styles.extraPendingText]}>
                      {extraWorkRequest.status === 'approved' ? `✓ ${t('approved', 'Approved')} (+₹${extraWorkRequest.additionalCost})` : `⏳ ${t('awaitingApproval', 'Awaiting Customer Approval')}`}
                    </Text>
                  </View>
                ) : null}
              </View>

              {extraWorkRequest ? (
                <View style={styles.extraReqInfo}>
                  <Text style={styles.extraReqDesc}>{extraWorkRequest.description}</Text>
                  <Text style={styles.extraReqAmount}>{t('additional', 'Additional')}: ₹{extraWorkRequest.additionalCost}</Text>
                  {extraWorkRequest.status === 'pending' && (
                    <TouchableOpacity
                      style={styles.demoApproveBtn}
                      onPress={approveExtraWork}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.demoApproveText}>⚡ {t('simulateCustomerApproval', 'Simulate Customer Approval')}</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.addExtraBtn}
                  onPress={() => setShowExtraModal(true)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="add-circle-outline" size={18} color={colors.primary} />
                  <Text style={styles.addExtraBtnText}>{t('requestExtraScope', 'Request Extra Work Scope Approval')}</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Request Additional Worker */}
            <View style={styles.helperRequestCard}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <Ionicons name="people-outline" size={20} color={colors.primary} />
                <Text style={styles.helperRequestTitle}>{t('additionalWorkerRequest', 'Additional Worker Request')}</Text>
                {helperRequest && (
                  <View style={[styles.helperBadge, helperRequest.status === 'approved' ? styles.helperBadgeApproved : helperRequest.status === 'declined' ? styles.helperBadgeDeclined : styles.helperBadgePending]}>
                    <Text style={styles.helperBadgeText}>{helperRequest.status === 'approved' ? `✓ ${t('approved', 'Approved')}` : helperRequest.status === 'declined' ? `✗ ${t('declined', 'Declined')}` : `⏳ ${t('pending', 'Pending')}`}</Text>
                  </View>
                )}
              </View>
              {helperRequest ? (
                <View>
                  <Text style={styles.helperRequestMsg}>{helperRequest.message}</Text>
                  {helperRequest.status === 'pending' && (
                    <View>
                      <Text style={styles.helperWaitingText}>{t('waitingCustomerCoopApproval', 'Waiting for customer and cooperative approval...')}</Text>
                      <TouchableOpacity style={styles.demoApproveBtn} onPress={approveHelperRequest} activeOpacity={0.7}>
                        <Text style={styles.demoApproveText}>⚡ {t('simulateCustomerApproval', 'Simulate Customer Approval')}</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.helperRequestBtn}
                  onPress={() => setShowHelperModal(true)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="person-add-outline" size={16} color={colors.primary} />
                  <Text style={styles.helperRequestBtnText}>{t('requestCoopWorker', 'Request Co-op Second Worker')}</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* STAGE 4: FINISH WORK -> COMPLETION OTP HANDSHAKE */}
            <View style={styles.finishCard}>
              <View style={styles.finishHeader}>
                <Ionicons name="checkmark-done-circle" size={26} color={colors.success} />
                <Text style={styles.finishTitle}>{t('serviceCompletionSignOff', 'Service Completion Sign-Off')}</Text>
              </View>
              <Text style={styles.finishSub}>
                {t('completionOtpSub', 'Demonstrate completed repair to customer. When satisfied, ask for their 4-digit Completion OTP to finalize payment settlement.')}
              </Text>
              <View style={styles.demoBadge}>
                <Text style={styles.demoBadgeText}>{t('customerCompletionOtp', 'Customer Completion OTP:')} <Text style={{ fontWeight: '900', color: colors.success }}>{demoCompletionOtp}</Text></Text>
              </View>

              <TextInput
                style={[styles.otpInput, { borderColor: colors.success }]}
                placeholder={t('enterCompletionOtp', 'Enter 4-digit Completion OTP')}
                placeholderTextColor={colors.textMuted}
                keyboardType="number-pad"
                maxLength={4}
                value={completionOtp}
                onChangeText={(v) => { setCompletionOtp(v); setOtpError(''); }}
              />
              {otpError ? <Text style={styles.errorText}>{otpError}</Text> : null}

              <TouchableOpacity
                style={styles.completeJobBtn}
                onPress={handleCompleteOtp}
                activeOpacity={0.85}
              >
                <Ionicons name="shield-checkmark" size={18} color={colors.textInverse} />
                <Text style={styles.completeJobBtnText}>{t('verifyCompletionCloseJob', 'Verify Completion & Close Job')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* STAGE 4: COMPLETED BANNER */}
        {jobStatus === 'completed' && (
          <View style={styles.completedBanner}>
            <Ionicons name="checkmark-circle" size={48} color={colors.success} />
            <Text style={styles.completedTitle}>{t('jobCompletedSuccess', 'Job Successfully Completed!')}</Text>
            <Text style={styles.completedSub}>{t('jobCompletedSub', 'Payment has been disbursed to your cooperative wallet under 80/10/6/4 fair wage allocation.')}</Text>
          </View>
        )}

        {/* Extra Work Modal */}
        <Modal visible={showExtraModal} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>{t('requestExtraScope', 'Request Extra Work Scope Approval')}</Text>
              <Text style={styles.modalSub}>{t('extraScopePromptSub', 'Customer will receive an in-app prompt to approve or reject the line-item cost addition.')}</Text>

              <Text style={styles.inputLabel}>{t('scopeMaterialDesc', 'Scope / Material Description')}</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. Replaced 32A Main MCB + 5m copper wire"
                placeholderTextColor={colors.textMuted}
                value={extraDesc}
                onChangeText={setExtraDesc}
              />

              <Text style={styles.inputLabel}>{t('additionalAmount', 'Additional Amount (₹)')}</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. 250"
                placeholderTextColor={colors.textMuted}
                keyboardType="number-pad"
                value={extraCost}
                onChangeText={setExtraCost}
              />

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.modalCancelBtn}
                  onPress={() => setShowExtraModal(false)}
                >
                  <Text style={styles.modalCancelText}>{t('cancel', 'Cancel')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalSubmitBtn, (!extraDesc.trim() || !extraCost) && { opacity: 0.5 }]}
                  disabled={!extraDesc.trim() || !extraCost}
                  onPress={handleSubmitExtra}
                >
                  <Text style={styles.modalSubmitText}>{t('sendForApproval', 'Send for Approval')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Helper Request Modal */}
        <Modal visible={showHelperModal} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>{t('additionalWorkerRequest', 'Request Additional Worker')}</Text>
              <Text style={styles.modalSub}>{t('helperRequestSub', 'Customer and cooperative must approve. A second artisan from the same cooperative will be dispatched.')}</Text>
              <Text style={styles.inputLabel}>{t('reasonExtraHelp', 'Reason / Nature of Extra Help Needed')}</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. Heavy equipment needs two people, complex wiring scope..."
                placeholderTextColor={colors.textMuted}
                value={helperMessage}
                onChangeText={setHelperMessage}
                multiline
                numberOfLines={3}
              />
              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setShowHelperModal(false)}>
                  <Text style={styles.modalCancelText}>{t('cancel', 'Cancel')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalSubmitBtn, !helperMessage.trim() && { opacity: 0.5 }]}
                  disabled={!helperMessage.trim()}
                  onPress={() => {
                    requestHelperWorker(helperMessage.trim());
                    setShowHelperModal(false);
                    setHelperMessage('');
                  }}
                >
                  <Text style={styles.modalSubmitText}>{t('sendRequest', 'Send Request')}</Text>
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
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  back: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border },
  jobId: { fontSize: 16, fontWeight: '800', color: colors.textPrimary },
  tradeSubhead: { fontSize: 12, color: colors.textMuted, fontWeight: '600' },
  trackBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.primarySubtle, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  trackBtnText: { fontSize: 12, fontWeight: '700', color: colors.primary },
  timelineCard: { backgroundColor: colors.surface, borderRadius: 16, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: colors.border },
  timelineTitle: { fontSize: 13, fontWeight: '800', color: colors.textPrimary, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 },
  timeline: { flexDirection: 'row', justifyContent: 'space-between' },
  timelineItem: { flex: 1, alignItems: 'center' },
  timelineLeft: { flexDirection: 'row', alignItems: 'center', width: '100%' },
  timelineDot: { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.surfaceSecondary, borderWidth: 1.5, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', zIndex: 2 },
  timelineDotActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  timelineDotDone: { backgroundColor: colors.success, borderColor: colors.success },
  timelineConnector: { flex: 1, height: 2, backgroundColor: colors.border, position: 'absolute', left: 28, right: -14, top: 13, zIndex: 1 },
  timelineConnectorDone: { backgroundColor: colors.success },
  timelineLabel: { fontSize: 10, fontWeight: '600', color: colors.textMuted, marginTop: 6, textAlign: 'center' },
  timelineLabelActive: { color: colors.primary, fontWeight: '800' },
  timelineLabelDone: { color: colors.success, fontWeight: '700' },
  customerCard: { backgroundColor: colors.surface, borderRadius: 16, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: colors.border },
  customerCardTitle: { fontSize: 13, fontWeight: '800', color: colors.textPrimary, textTransform: 'uppercase', letterSpacing: 0.5 },
  bulkTag: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: '#ede9fe', paddingHorizontal: 7, paddingVertical: 3, borderRadius: 6 },
  bulkTagText: { fontSize: 10, fontWeight: '800', color: '#7c3aed' },
  crewTag: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: colors.successLight, paddingHorizontal: 7, paddingVertical: 3, borderRadius: 6 },
  crewTagText: { fontSize: 10, fontWeight: '800', color: colors.success },
  customerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  customerAvatar: { width: 42, height: 42, borderRadius: 12, backgroundColor: colors.primarySubtle, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  customerName: { fontSize: 15, fontWeight: '800', color: colors.textPrimary },
  customerPhone: { fontSize: 12, color: colors.textMuted, marginTop: 1 },
  callBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: colors.primarySubtle, alignItems: 'center', justifyContent: 'center' },
  addressRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 8 },
  addressText: { fontSize: 13, color: colors.textPrimary, flex: 1, lineHeight: 18 },
  issueRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 10 },
  issueText: { fontSize: 13, color: colors.textSecondary, flex: 1, lineHeight: 18, fontStyle: 'italic' },
  diagSummaryBox: { backgroundColor: colors.surfaceSecondary, borderRadius: 10, padding: 10, marginTop: 6 },
  diagSummaryTitle: { fontSize: 11, fontWeight: '800', color: colors.primaryDark, marginBottom: 4 },
  diagSummaryItem: { fontSize: 12, color: colors.textPrimary, lineHeight: 16 },
  activeVoiceBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f5f3ff', borderRadius: 10, padding: 10, marginTop: 8, gap: 8 },
  activeVoiceText: { fontSize: 12, color: colors.primary, flex: 1, fontWeight: '600' },
  voicePlayMini: { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  activeAttachBox: { marginTop: 10 },
  attachTitle: { fontSize: 11, fontWeight: '700', color: colors.textMuted },
  attachThumb: { marginRight: 8, borderRadius: 6, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
  stageActionCard: { backgroundColor: colors.surface, borderRadius: 16, padding: 22, alignItems: 'center', borderWidth: 1, borderColor: colors.primary, shadowColor: colors.primary, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3, marginBottom: 14 },
  stageActionTitle: { fontSize: 18, fontWeight: '800', color: colors.textPrimary, marginTop: 10, marginBottom: 6 },
  stageActionSub: { fontSize: 13, color: colors.textMuted, textAlign: 'center', lineHeight: 18, marginBottom: 18 },
  primaryActionBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: colors.primary, borderRadius: 14, paddingVertical: 14, width: '100%', shadowColor: colors.primary, shadowOpacity: 0.3, shadowRadius: 6, elevation: 3 },
  primaryActionBtnText: { color: colors.textInverse, fontSize: 15, fontWeight: '800' },
  otpCard: { backgroundColor: colors.surface, borderRadius: 16, padding: 20, alignItems: 'center', borderWidth: 1.5, borderColor: colors.primary, marginBottom: 14 },
  otpIconCircle: { width: 52, height: 52, borderRadius: 26, backgroundColor: colors.primarySubtle, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  otpCardTitle: { fontSize: 17, fontWeight: '800', color: colors.textPrimary, marginBottom: 4 },
  otpCardSub: { fontSize: 13, color: colors.textMuted, textAlign: 'center', lineHeight: 18, marginBottom: 12 },
  demoBadge: { backgroundColor: colors.primarySubtle, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, marginBottom: 14 },
  demoBadgeText: { fontSize: 12, color: colors.primaryDark },
  otpInput: { width: '100%', backgroundColor: colors.surfaceSecondary, borderWidth: 1.5, borderColor: colors.border, borderRadius: 12, paddingVertical: 12, paddingHorizontal: 16, fontSize: 18, fontWeight: '800', textAlign: 'center', color: colors.textPrimary, letterSpacing: 4, marginBottom: 8 },
  errorText: { color: colors.danger, fontSize: 12, fontWeight: '600', marginBottom: 10, textAlign: 'center' },
  startJobBtn: { width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: colors.primary, borderRadius: 12, paddingVertical: 14, marginTop: 6 },
  startJobBtnText: { color: colors.textInverse, fontSize: 15, fontWeight: '800' },
  timerMonitorCard: { backgroundColor: colors.surface, borderRadius: 16, padding: 18, borderWidth: 1.5, borderColor: colors.primary, marginBottom: 14 },
  timerPausedCard: { borderColor: colors.warning, backgroundColor: '#fffbeb' },
  timerMonitorHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  timerHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  timerLiveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.success },
  timerPausedDot: { backgroundColor: colors.warning },
  timerMonitorTitle: { fontSize: 13, fontWeight: '800', color: colors.textPrimary },
  otBadge: { backgroundColor: '#fef3c7', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  otBadgeText: { fontSize: 10, fontWeight: '800', color: '#92400e' },
  stopwatchText: { fontSize: 40, fontWeight: '900', color: colors.primary, textAlign: 'center', marginVertical: 6, fontVariant: ['tabular-nums'] },
  stopwatchSub: { fontSize: 12, color: colors.textMuted, textAlign: 'center' },
  overtimeAlertBox: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#fff7ed', borderWidth: 1, borderColor: '#fed7aa', borderRadius: 10, padding: 12, marginTop: 12 },
  overtimeAlertTitle: { fontSize: 12, fontWeight: '800', color: '#92400e' },
  overtimeAlertSub: { fontSize: 11, color: '#7c2d12', marginTop: 2, lineHeight: 15 },
  demoOtBtn: { alignSelf: 'center', flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 10, paddingHorizontal: 10, paddingVertical: 4, backgroundColor: colors.surfaceSecondary, borderRadius: 8 },
  demoOtBtnText: { fontSize: 11, color: colors.textSecondary, fontWeight: '600' },
  phaseCard: { backgroundColor: '#fffbeb', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#fde68a', marginBottom: 14 },
  phaseHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  phaseTitle: { fontSize: 14, fontWeight: '800', color: '#784b00' },
  phaseSub: { fontSize: 12, color: '#92400e', marginBottom: 12, lineHeight: 16 },
  procurePauseBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#fef3c7', borderWidth: 1, borderColor: '#f59e0b', borderRadius: 12, paddingVertical: 12 },
  procurePauseBtnText: { color: '#784b00', fontSize: 14, fontWeight: '700' },
  resumeBox: { backgroundColor: '#fff', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#fde68a' },
  resumeOtpInfo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  resumeOtpLabel: { fontSize: 12, color: colors.textMuted, fontWeight: '600' },
  resumeOtpValue: { fontSize: 16, fontWeight: '900', color: colors.primary },
  resumePrompt: { fontSize: 12, color: colors.textSecondary, marginBottom: 8 },
  resumeInput: { backgroundColor: colors.surfaceSecondary, borderWidth: 1, borderColor: colors.border, borderRadius: 10, paddingVertical: 10, paddingHorizontal: 14, fontSize: 16, fontWeight: '800', textAlign: 'center', letterSpacing: 4, marginBottom: 6 },
  resumeBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: colors.primary, borderRadius: 10, paddingVertical: 12, marginTop: 4 },
  resumeBtnText: { color: colors.textInverse, fontSize: 14, fontWeight: '700' },
  extraWorkCard: { backgroundColor: colors.surface, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: colors.border, marginBottom: 14 },
  extraWorkTitle: { fontSize: 13, fontWeight: '800', color: colors.textPrimary },
  extraStatusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  extraApprove: { backgroundColor: colors.successLight },
  extraPending: { backgroundColor: colors.warningLight },
  extraStatusText: { fontSize: 11, fontWeight: '800' },
  extraApproveText: { color: colors.success },
  extraPendingText: { color: colors.warningDark },
  extraReqInfo: { backgroundColor: colors.surfaceSecondary, borderRadius: 10, padding: 10, marginTop: 8 },
  extraReqDesc: { fontSize: 13, color: colors.textPrimary, fontWeight: '600' },
  extraReqAmount: { fontSize: 13, fontWeight: '800', color: colors.primary, marginTop: 2 },
  demoApproveBtn: { alignSelf: 'flex-start', marginTop: 8, backgroundColor: colors.primarySubtle, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  demoApproveText: { fontSize: 11, color: colors.primary, fontWeight: '700' },
  addExtraBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: colors.primarySubtle, borderRadius: 10, paddingVertical: 10, marginTop: 6 },
  addExtraBtnText: { color: colors.primary, fontSize: 13, fontWeight: '700' },
  finishCard: { backgroundColor: colors.surface, borderRadius: 16, padding: 18, borderWidth: 1.5, borderColor: colors.success, marginBottom: 14 },
  finishHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  finishTitle: { fontSize: 16, fontWeight: '800', color: colors.textPrimary },
  finishSub: { fontSize: 12, color: colors.textMuted, marginBottom: 10, lineHeight: 16 },
  completeJobBtn: { width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: colors.success, borderRadius: 12, paddingVertical: 14, marginTop: 6, shadowColor: colors.success, shadowOpacity: 0.3, shadowRadius: 6, elevation: 3 },
  completeJobBtnText: { color: colors.textInverse, fontSize: 15, fontWeight: '800' },
  completedBanner: { backgroundColor: '#ecfdf5', borderRadius: 16, padding: 24, alignItems: 'center', borderWidth: 1, borderColor: '#a7f3d0' },
  completedTitle: { fontSize: 18, fontWeight: '800', color: '#065f46', marginTop: 10, marginBottom: 4 },
  completedSub: { fontSize: 13, color: '#047857', textAlign: 'center', lineHeight: 18 },
  primaryBtn: { backgroundColor: colors.primary, borderRadius: 12, paddingVertical: 12, paddingHorizontal: 20 },
  primaryBtnText: { color: colors.textInverse, fontSize: 14, fontWeight: '700' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: colors.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 22 },
  modalTitle: { fontSize: 17, fontWeight: '800', color: colors.textPrimary, marginBottom: 4 },
  modalSub: { fontSize: 12, color: colors.textMuted, marginBottom: 16, lineHeight: 16 },
  inputLabel: { fontSize: 12, fontWeight: '700', color: colors.textSecondary, marginBottom: 6 },
  textInput: { backgroundColor: colors.surfaceSecondary, borderWidth: 1, borderColor: colors.border, borderRadius: 10, paddingVertical: 10, paddingHorizontal: 12, fontSize: 14, color: colors.textPrimary, marginBottom: 14 },
  modalActions: { flexDirection: 'row', gap: 10, marginTop: 8 },
  modalCancelBtn: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 10, borderWidth: 1, borderColor: colors.border },
  modalCancelText: { color: colors.textMuted, fontWeight: '700' },
  modalSubmitBtn: { flex: 1.5, paddingVertical: 12, alignItems: 'center', borderRadius: 10, backgroundColor: colors.primary },
  modalSubmitText: { color: '#fff', fontWeight: '700' },
  imageModalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center' },
  imageCloseBtn: { position: 'absolute', top: 40, right: 20, zIndex: 10, padding: 8 },
  fullImage: { width: '90%', height: '70%' },
  waitCard: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 14,
  },
  waitCardActive: {
    borderColor: '#fbbf24',
    backgroundColor: '#fffbeb',
  },
  waitCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  waitCardSub: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 10,
    lineHeight: 17,
  },
  waitTimerDisplay: {
    fontSize: 28,
    fontWeight: '900',
    color: '#d97706',
    textAlign: 'center',
    marginBottom: 10,
    fontVariant: ['tabular-nums'],
  },
  waitStartBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#fef3c7',
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#fde68a',
    alignSelf: 'flex-start',
  },
  waitStartBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#92400e',
  },
  waitEndBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#f0fdf4',
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#bbf7d0',
    alignSelf: 'flex-start',
  },
  waitEndBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.successDark,
  },
  waitEndedBadge: {
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  waitEndedBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.successDark,
  },
  acceptTimerCard: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 12,
  },
  acceptTimerPaused: {
    borderColor: colors.warning,
    backgroundColor: '#fffbeb',
  },
  acceptTimerLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  acceptTimerValue: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.textPrimary,
    fontVariant: ['tabular-nums'],
  },
  travelPauseBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#fef3c7',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#fde68a',
    alignSelf: 'flex-start',
  },
  travelResumeBtn: {
    backgroundColor: '#f0fdf4',
    borderColor: '#bbf7d0',
  },
  travelPauseBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.warningDark,
  },
  helperRequestCard: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
  },
  helperRequestTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  helperBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  helperBadgePending: { backgroundColor: '#fef3c7' },
  helperBadgeApproved: { backgroundColor: '#f0fdf4' },
  helperBadgeDeclined: { backgroundColor: '#fef2f2' },
  helperBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  helperRequestMsg: {
    fontSize: 13,
    color: colors.textPrimary,
    marginBottom: 6,
  },
  helperWaitingText: {
    fontSize: 12,
    color: colors.textMuted,
    fontStyle: 'italic',
  },
  helperRequestBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: colors.primarySubtle,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primaryLight,
    alignSelf: 'flex-start',
  },
  helperRequestBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
  },
});

export default Screen09_ActiveJob;
