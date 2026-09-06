import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useWorker } from '../context/WorkerContext';

const STEPS = [
  { id: 'submitted', label: 'Application Submitted', icon: 'checkmark-circle', status: 'done' },
  { id: 'review', label: 'Cooperative Verification', icon: 'time', status: 'pending' },
  { id: 'activation', label: 'Account Activation', icon: 'ellipse-outline', status: 'waiting' },
];

export const Screen06_PendingVerification = ({ navigation }) => {
  const { worker, updateWorker, t } = useWorker();

  const simulateVerified = async () => {
    await updateWorker({ verificationStatus: 'verified' });
    navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.headerSection}>
          <View style={styles.greetingRow}>
            <Text style={styles.greeting}>{t('goodMorning', 'Welcome')}, {worker?.name?.split(' ')[0] || 'Worker'}</Text>
            <Text style={styles.wave}>👋</Text>
          </View>
          <View style={styles.applicationChip}>
            <Ionicons name="id-card-outline" size={14} color={colors.primary} />
            <Text style={styles.applicationId}>Application: {worker?.workerId || 'UW-2026-001'}</Text>
          </View>
        </View>

        <View style={styles.statusCard}>
          <Text style={styles.statusCardTitle}>{t('pendingTitle', 'Verification Status')}</Text>
          {STEPS.map((step, i) => (
            <View key={step.id} style={styles.stepRow}>
              <View style={styles.stepLeft}>
                <View style={[
                  styles.stepIcon,
                  step.status === 'done' && styles.stepIconDone,
                  step.status === 'pending' && styles.stepIconPending,
                ]}>
                  <Ionicons
                    name={step.icon}
                    size={18}
                    color={
                      step.status === 'done' ? colors.textInverse :
                      step.status === 'pending' ? colors.warning :
                      colors.textMuted
                    }
                  />
                </View>
                {i < STEPS.length - 1 && (
                  <View style={[styles.stepConnector, step.status === 'done' && styles.stepConnectorDone]} />
                )}
              </View>
              <View style={styles.stepContent}>
                <Text style={[
                  styles.stepLabel,
                  step.status === 'done' && styles.stepLabelDone,
                  step.status === 'pending' && styles.stepLabelPending,
                ]}>
                  {step.status === 'done' ? '✓ ' : step.status === 'pending' ? '⏳ ' : '○ '}
                  {step.label}
                </Text>
              </View>
            </View>
          ))}
          <View style={styles.statusMessageBox}>
            <Ionicons name="information-circle-outline" size={16} color={colors.primary} />
            <Text style={styles.statusMessage}>{t('pendingSub', 'Your application is being reviewed by the cooperative.')}</Text>
          </View>
        </View>

        <View style={styles.detailsCard}>
          <Text style={styles.detailsTitle}>{t('personalInfo', 'Application Details')}</Text>
          <DetailRow label={t('fullName', 'Name')} value={worker?.name || '—'} />
          <DetailRow label={t('mobile', 'Mobile')} value={`+91 ${worker?.phone || '9811223344'}`} />
          <DetailRow label={t('selectTrade', 'Trade')} value={worker?.tradeType?.charAt(0).toUpperCase() + worker?.tradeType?.slice(1) || '—'} />
          <DetailRow label={t('tradeCertificate', 'Certification')} value={worker?.isCertified ? 'Certified Worker' : 'Practical Assessment Required'} />
          {!worker?.isCertified && worker?.assessmentToken && (
            <DetailRow label={t('yourAssessmentToken', 'Assessment Token')} value={worker.assessmentToken} highlight />
          )}
          <DetailRow label={t('cooperative', 'Cooperative')} value={worker?.cooperative || 'Delhi Cooperative'} />
        </View>

        {!worker?.isCertified && worker?.assessmentToken && (
          <View style={styles.tokenReminder}>
            <View style={styles.tokenReminderHeader}>
              <Ionicons name="ticket-outline" size={18} color={colors.primary} />
              <Text style={styles.tokenReminderTitle}>{t('yourAssessmentToken', 'Assessment Token')}</Text>
            </View>
            <Text style={styles.tokenReminderCode}>{worker.assessmentToken}</Text>
            <Text style={styles.tokenReminderHint}>{t('tokenInstructions', 'Keep this token ready for your practical assessment.')}</Text>
          </View>
        )}

        <View style={styles.estimateBox}>
          <Ionicons name="timer-outline" size={16} color={colors.warning} />
          <Text style={styles.estimateText}>
            Estimated verification time: 24-48 hours. You will receive an SMS notification once verified.
          </Text>
        </View>

        <TouchableOpacity style={styles.demoBtn} onPress={simulateVerified} activeOpacity={0.85}>
          <Ionicons name="flash" size={16} color={colors.textInverse} />
          <Text style={styles.demoBtnText}>{t('fastTrackDemo', 'Demo: Skip to Verified (Testing Only)')}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.supportRow} activeOpacity={0.7}>
          <Ionicons name="headset-outline" size={16} color={colors.primary} />
          <Text style={styles.supportText}>{t('helpSupport', 'Contact Cooperative Support')}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const DetailRow = ({ label, value, highlight }) => (
  <View style={styles.detailRow}>
    <Text style={styles.detailLabel}>{label}</Text>
    <Text style={[styles.detailValue, highlight && styles.detailValueHighlight]}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 30 },
  headerSection: { marginBottom: 24 },
  greetingRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  greeting: { fontSize: 26, fontWeight: '800', color: colors.textPrimary },
  wave: { fontSize: 24, marginLeft: 8 },
  applicationChip: {
    flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start',
    backgroundColor: colors.primarySubtle, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6,
    borderWidth: 1, borderColor: colors.border,
  },
  applicationId: { fontSize: 13, fontWeight: '700', color: colors.primary, marginLeft: 6 },
  statusCard: {
    backgroundColor: colors.surface, borderRadius: 22, padding: 20,
    borderWidth: 1, borderColor: colors.border,
    shadowColor: colors.shadowColor, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04, shadowRadius: 8, elevation: 2, marginBottom: 16,
  },
  statusCardTitle: { fontSize: 16, fontWeight: '700', color: colors.textPrimary, marginBottom: 20 },
  stepRow: { flexDirection: 'row', marginBottom: 0 },
  stepLeft: { alignItems: 'center', marginRight: 16, width: 36 },
  stepIcon: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: colors.surfaceTertiary,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: colors.border,
  },
  stepIconDone: { backgroundColor: colors.success, borderColor: colors.success },
  stepIconPending: { backgroundColor: colors.warningLight, borderColor: colors.warning },
  stepConnector: { width: 2, flex: 1, backgroundColor: colors.border, marginVertical: 4 },
  stepConnectorDone: { backgroundColor: colors.success },
  stepContent: { flex: 1, paddingTop: 8, paddingBottom: 20 },
  stepLabel: { fontSize: 14, fontWeight: '600', color: colors.textMuted },
  stepLabelDone: { color: colors.textPrimary, fontWeight: '700' },
  stepLabelPending: { color: colors.warning, fontWeight: '700' },
  statusMessageBox: {
    flexDirection: 'row', backgroundColor: colors.primarySubtle,
    borderRadius: 12, padding: 12, marginTop: 8,
    borderWidth: 1, borderColor: colors.border,
  },
  statusMessage: { fontSize: 13, color: colors.textSecondary, marginLeft: 8, flex: 1 },
  detailsCard: {
    backgroundColor: colors.surface, borderRadius: 22, padding: 20,
    borderWidth: 1, borderColor: colors.border, marginBottom: 16,
  },
  detailsTitle: { fontSize: 15, fontWeight: '700', color: colors.textPrimary, marginBottom: 14 },
  detailRow: {
    flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: colors.borderLight,
  },
  detailLabel: { fontSize: 13, color: colors.textMuted, fontWeight: '600' },
  detailValue: { fontSize: 13, color: colors.textPrimary, fontWeight: '700', maxWidth: '60%', textAlign: 'right' },
  detailValueHighlight: { color: colors.primary },
  tokenReminder: {
    backgroundColor: colors.primarySubtle, borderRadius: 18, padding: 20,
    borderWidth: 2, borderColor: colors.primary, alignItems: 'center', marginBottom: 16,
  },
  tokenReminderHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  tokenReminderTitle: { fontSize: 14, fontWeight: '700', color: colors.primary, marginLeft: 8 },
  tokenReminderCode: { fontSize: 30, fontWeight: '900', color: colors.primary, letterSpacing: 4, marginBottom: 6 },
  tokenReminderHint: { fontSize: 12, color: colors.textSecondary, textAlign: 'center' },
  estimateBox: {
    flexDirection: 'row', backgroundColor: colors.warningLight, borderRadius: 14,
    padding: 12, marginBottom: 20, borderWidth: 1, borderColor: colors.warning,
  },
  estimateText: { fontSize: 12, color: colors.warningDark, marginLeft: 8, flex: 1, lineHeight: 16 },
  demoBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.success, paddingVertical: 15, borderRadius: 14,
    marginBottom: 12,
  },
  demoBtnText: { fontSize: 14, fontWeight: '700', color: colors.textInverse, marginLeft: 8 },
  supportRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 8 },
  supportText: { fontSize: 13, color: colors.primary, fontWeight: '600', marginLeft: 8 },
});

export default Screen06_PendingVerification;
