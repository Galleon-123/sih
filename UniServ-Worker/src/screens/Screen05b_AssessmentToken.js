import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useWorker } from '../context/WorkerContext';

const ASSESSMENT_INSTRUCTIONS = [
  { icon: 'shirt-outline', text: 'Wear appropriate work clothing for your trade' },
  { icon: 'construct-outline', text: 'Bring your own basic tools if you have them' },
  { icon: 'id-card-outline', text: 'Carry this token and a valid photo ID' },
  { icon: 'time-outline', text: 'Arrive 15 minutes before your scheduled slot' },
  { icon: 'shield-checkmark-outline', text: 'Safety equipment will be provided at the center' },
];

export const Screen05b_AssessmentToken = ({ navigation }) => {
  const { updateWorker, generateAssessmentToken, generateWorkerId, worker } = useWorker();
  const [token, setToken] = useState('');
  const [workerId, setWorkerId] = useState('');

  useEffect(() => {
    const newToken = generateAssessmentToken();
    const newWorkerId = generateWorkerId();
    setToken(newToken);
    setWorkerId(newWorkerId);
    updateWorker({
      assessmentToken: newToken,
      workerId: newWorkerId,
      verificationStatus: 'pending',
    });
  }, []);

  const handleContinue = () => {
    navigation.navigate('PendingVerification');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.successCircle}>
            <Ionicons name="checkmark-circle" size={48} color={colors.success} />
          </View>
          <Text style={styles.headerTitle}>Assessment Scheduled!</Text>
          <Text style={styles.headerSubtitle}>
            Your registration is complete. Keep your assessment token safe.
          </Text>
        </View>

        <View style={styles.tokenCard}>
          <View style={styles.tokenCardHeader}>
            <Ionicons name="ticket-outline" size={20} color={colors.primary} />
            <Text style={styles.tokenCardHeaderText}>Your Assessment Token</Text>
          </View>
          <View style={styles.tokenDisplay}>
            <Text style={styles.tokenText}>{token}</Text>
          </View>
          <View style={styles.workerIdRow}>
            <Text style={styles.workerIdLabel}>Application ID:</Text>
            <Text style={styles.workerIdValue}>{workerId}</Text>
          </View>
          <View style={styles.tradeRow}>
            <Text style={styles.tradeLabel}>Trade:</Text>
            <View style={styles.tradeBadge}>
              <Text style={styles.tradeText}>{worker.tradeType?.toUpperCase() || 'ELECTRICIAN'}</Text>
            </View>
          </View>
        </View>

        <View style={styles.statusCard}>
          <Text style={styles.statusTitle}>What Happens Next?</Text>
          <View style={styles.statusStep}>
            <View style={styles.statusDot} />
            <Text style={styles.statusStepText}>The cooperative organizer will review your application</Text>
          </View>
          <View style={styles.statusStep}>
            <View style={styles.statusDot} />
            <Text style={styles.statusStepText}>An assessment slot will be assigned at your nearest cooperative center</Text>
          </View>
          <View style={styles.statusStep}>
            <View style={styles.statusDot} />
            <Text style={styles.statusStepText}>You will receive an SMS with the date, time and location</Text>
          </View>
          <View style={styles.statusStep}>
            <View style={[styles.statusDot, { backgroundColor: colors.success }]} />
            <Text style={styles.statusStepText}>After passing the assessment, your account will be activated</Text>
          </View>
        </View>

        <Text style={styles.instructionsTitle}>Assessment Day Instructions</Text>
        {ASSESSMENT_INSTRUCTIONS.map((item, i) => (
          <View key={i} style={styles.instructionRow}>
            <View style={styles.instructionIcon}>
              <Ionicons name={item.icon} size={18} color={colors.primary} />
            </View>
            <Text style={styles.instructionText}>{item.text}</Text>
          </View>
        ))}

        <View style={styles.smsNote}>
          <Ionicons name="chatbubble-ellipses" size={16} color={colors.primary} />
          <Text style={styles.smsNoteText}>
            The cooperative organizer will assign your assessment slot. You will be notified via SMS to your registered mobile number.
          </Text>
        </View>

        <TouchableOpacity style={styles.btn} onPress={handleContinue} activeOpacity={0.85}>
          <Text style={styles.btnText}>View Application Status</Text>
          <Ionicons name="arrow-forward" size={16} color={colors.textInverse} style={{ marginLeft: 8 }} />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { paddingHorizontal: 20, paddingTop: 32, paddingBottom: 30 },
  header: { alignItems: 'center', marginBottom: 28 },
  successCircle: {
    width: 80, height: 80, borderRadius: 40, backgroundColor: colors.successLight,
    alignItems: 'center', justifyContent: 'center', marginBottom: 16,
  },
  headerTitle: { fontSize: 24, fontWeight: '800', color: colors.textPrimary, textAlign: 'center' },
  headerSubtitle: { fontSize: 14, color: colors.textSecondary, textAlign: 'center', marginTop: 8, lineHeight: 20 },
  tokenCard: {
    backgroundColor: colors.surface, borderRadius: 22, padding: 24,
    borderWidth: 2, borderColor: colors.primary,
    shadowColor: colors.primary, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15, shadowRadius: 16, elevation: 6, marginBottom: 20,
  },
  tokenCardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  tokenCardHeaderText: { fontSize: 14, fontWeight: '700', color: colors.textPrimary, marginLeft: 8 },
  tokenDisplay: {
    backgroundColor: colors.primarySubtle, borderRadius: 14, paddingVertical: 20,
    alignItems: 'center', marginBottom: 16, borderWidth: 1.5, borderColor: colors.primary,
  },
  tokenText: {
    fontSize: 36, fontWeight: '900', color: colors.primary,
    letterSpacing: 4,
  },
  workerIdRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  workerIdLabel: { fontSize: 13, color: colors.textSecondary, fontWeight: '600', marginRight: 8 },
  workerIdValue: { fontSize: 13, color: colors.textPrimary, fontWeight: '800' },
  tradeRow: { flexDirection: 'row', alignItems: 'center' },
  tradeLabel: { fontSize: 13, color: colors.textSecondary, fontWeight: '600', marginRight: 8 },
  tradeBadge: {
    backgroundColor: colors.primary, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4,
  },
  tradeText: { fontSize: 12, fontWeight: '800', color: colors.textInverse, letterSpacing: 1 },
  statusCard: {
    backgroundColor: colors.surface, borderRadius: 18, padding: 18,
    borderWidth: 1, borderColor: colors.border, marginBottom: 20,
  },
  statusTitle: { fontSize: 15, fontWeight: '700', color: colors.textPrimary, marginBottom: 14 },
  statusStep: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  statusDot: {
    width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary,
    marginTop: 5, marginRight: 12, flexShrink: 0,
  },
  statusStepText: { fontSize: 13, color: colors.textSecondary, flex: 1, lineHeight: 18 },
  instructionsTitle: { fontSize: 14, fontWeight: '700', color: colors.textPrimary, marginBottom: 12 },
  instructionRow: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface,
    borderRadius: 12, padding: 12, marginBottom: 8,
    borderWidth: 1, borderColor: colors.border,
  },
  instructionIcon: {
    width: 36, height: 36, borderRadius: 10, backgroundColor: colors.primarySubtle,
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  instructionText: { fontSize: 13, color: colors.textSecondary, flex: 1, lineHeight: 17 },
  smsNote: {
    flexDirection: 'row', backgroundColor: colors.primarySubtle, borderRadius: 14,
    padding: 14, marginBottom: 20, marginTop: 8, borderWidth: 1, borderColor: colors.border,
  },
  smsNoteText: { fontSize: 12, color: colors.textSecondary, marginLeft: 10, flex: 1, lineHeight: 17 },
  btn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.primary, paddingVertical: 16, borderRadius: 14,
    shadowColor: colors.primary, shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25, shadowRadius: 6, elevation: 3,
  },
  btnText: { fontSize: 15, fontWeight: '700', color: colors.textInverse },
});

export default Screen05b_AssessmentToken;
