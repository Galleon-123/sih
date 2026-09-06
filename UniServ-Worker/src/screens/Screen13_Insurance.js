import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useWorker } from '../context/WorkerContext';

const COVERAGE_ITEMS = [
  { id: 'death', label: 'Accidental Death', amount: '₹5,00,000', icon: 'shield-outline' },
  { id: 'disability', label: 'Permanent Disability', amount: '₹3,00,000', icon: 'body-outline' },
  { id: 'medical', label: 'Medical Hospitalization', amount: '₹1,00,000', icon: 'medkit-outline' },
  { id: 'equipment', label: 'Equipment Damage', amount: '₹25,000', icon: 'construct-outline' },
  { id: 'income', label: 'Income Loss (accident)', amount: '₹5,000/month', icon: 'wallet-outline' },
];

export const Screen13_Insurance = ({ navigation }) => {
  const { worker, t } = useWorker();
  const isActive = worker?.insurance?.status === 'active';

  const coverageList = [
    { id: 'death', label: t('accidentalDeath', 'Accidental Death'), amount: '₹5,00,000', icon: 'shield-outline' },
    { id: 'disability', label: t('permanentDisability', 'Permanent Disability'), amount: '₹3,00,000', icon: 'body-outline' },
    { id: 'medical', label: t('medicalHospitalization', 'Medical Hospitalization'), amount: '₹1,00,000', icon: 'medkit-outline' },
    { id: 'equipment', label: t('equipmentDamage', 'Equipment Damage'), amount: '₹25,000', icon: 'construct-outline' },
    { id: 'income', label: t('incomeLoss', 'Income Loss (accident)'), amount: '₹5,000/month', icon: 'wallet-outline' },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.pageTitle}>{t('insurance', 'Insurance')}</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={[styles.statusCard, isActive ? styles.statusCardActive : styles.statusCardExpired]}>
          <View style={styles.statusTop}>
            <View style={styles.statusIconWrap}>
              <Ionicons
                name={isActive ? 'shield-checkmark' : 'shield-outline'}
                size={36}
                color={isActive ? colors.success : colors.danger}
              />
            </View>
            <View>
              <Text style={styles.statusTitle}>
                {t('insurance', 'Insurance')} {isActive ? t('active', 'Active') : t('expired', 'Expired')}
              </Text>
              <Text style={styles.statusSub}>
                {isActive ? t('fullyCovered', 'You are fully covered') : t('renewCoverage', 'Please renew your coverage')}
              </Text>
            </View>
          </View>
          <View style={styles.policyDetails}>
            <View style={styles.policyRow}>
              <Text style={styles.policyLabel}>{t('policyNumber', 'Policy Number')}</Text>
              <Text style={styles.policyValue}>{worker?.insurance?.policyNo || 'UWCI-2026-08871'}</Text>
            </View>
            <View style={styles.policyRow}>
              <Text style={styles.policyLabel}>{t('validUntil', 'Valid Until')}</Text>
              <Text style={styles.policyValue}>{worker?.insurance?.validUntil || '2027-03-31'}</Text>
            </View>
            <View style={styles.policyRow}>
              <Text style={styles.policyLabel}>{t('coverageType', 'Coverage Type')}</Text>
              <Text style={styles.policyValue}>{t('comprehensiveWorker', 'Comprehensive Worker')}</Text>
            </View>
            <View style={styles.policyRow}>
              <Text style={styles.policyLabel}>{t('premiumSource', 'Premium Source')}</Text>
              <Text style={styles.policyValue}>{t('welfareFund', 'Welfare Fund')}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>{t('coverageDetails', 'Coverage Details')}</Text>
        {coverageList.map((item) => (
          <View key={item.id} style={styles.coverageCard}>
            <View style={styles.coverageIcon}>
              <Ionicons name={item.icon} size={20} color={colors.primary} />
            </View>
            <View style={{ flex: 1, marginLeft: 14 }}>
              <Text style={styles.coverageLabel}>{item.label}</Text>
              <Text style={styles.coverageAmount}>{item.amount}</Text>
            </View>
            <View style={styles.coveredBadge}>
              <Ionicons name="checkmark" size={12} color={colors.success} />
              <Text style={styles.coveredText}>{t('covered', 'Covered')}</Text>
            </View>
          </View>
        ))}

        <View style={styles.welfareNote}>
          <Ionicons name="information-circle-outline" size={16} color={colors.primary} />
          <Text style={styles.welfareNoteText}>
            {t('insuranceNote', 'Your insurance premium is paid automatically from your Welfare Fund contributions. No additional payment required.')}
          </Text>
        </View>

        <Text style={styles.sectionTitle}>{t('actions', 'Actions')}</Text>
        <TouchableOpacity style={styles.claimBtn} activeOpacity={0.85}>
          <Ionicons name="document-text-outline" size={20} color={colors.textInverse} />
          <Text style={styles.claimBtnText}>{t('fileClaim', 'File a Claim')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.contactBtn} activeOpacity={0.8}>
          <Ionicons name="headset-outline" size={20} color={colors.primary} />
          <Text style={styles.contactBtnText}>{t('contactCoordinator', 'Contact Insurance Coordinator')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.downloadBtn} activeOpacity={0.7}>
          <Ionicons name="download-outline" size={18} color={colors.textSecondary} />
          <Text style={styles.downloadBtnText}>{t('downloadPolicy', 'Download Policy Document')}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 30 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  back: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border,
  },
  pageTitle: { fontSize: 18, fontWeight: '800', color: colors.textPrimary },
  statusCard: {
    borderRadius: 24, padding: 22, marginBottom: 20,
    borderWidth: 2,
  },
  statusCardActive: { backgroundColor: colors.successLight, borderColor: colors.success },
  statusCardExpired: { backgroundColor: colors.dangerLight, borderColor: colors.danger },
  statusTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 18 },
  statusIconWrap: {
    width: 60, height: 60, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.6)',
    alignItems: 'center', justifyContent: 'center', marginRight: 14,
  },
  statusTitle: { fontSize: 20, fontWeight: '800', color: colors.textPrimary },
  statusSub: { fontSize: 13, color: colors.textSecondary, marginTop: 3 },
  policyDetails: { backgroundColor: 'rgba(255,255,255,0.5)', borderRadius: 14, padding: 14 },
  policyRow: {
    flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8,
    borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  policyLabel: { fontSize: 13, color: colors.textMuted, fontWeight: '600' },
  policyValue: { fontSize: 13, color: colors.textPrimary, fontWeight: '700' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.textPrimary, marginBottom: 12 },
  coverageCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface,
    borderRadius: 16, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: colors.border,
  },
  coverageIcon: {
    width: 42, height: 42, borderRadius: 12, backgroundColor: colors.primarySubtle,
    alignItems: 'center', justifyContent: 'center',
  },
  coverageLabel: { fontSize: 14, fontWeight: '600', color: colors.textPrimary },
  coverageAmount: { fontSize: 13, color: colors.primary, fontWeight: '700', marginTop: 2 },
  coveredBadge: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.successLight,
    borderRadius: 10, paddingHorizontal: 8, paddingVertical: 4, gap: 3,
  },
  coveredText: { fontSize: 11, fontWeight: '700', color: colors.success },
  welfareNote: {
    flexDirection: 'row', backgroundColor: colors.primarySubtle, borderRadius: 14,
    padding: 12, marginBottom: 20, marginTop: 4, borderWidth: 1, borderColor: colors.border,
  },
  welfareNoteText: { fontSize: 12, color: colors.textSecondary, marginLeft: 8, flex: 1, lineHeight: 17 },
  claimBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.primary, borderRadius: 14, paddingVertical: 16, marginBottom: 10, gap: 8,
  },
  claimBtnText: { fontSize: 15, fontWeight: '700', color: colors.textInverse },
  contactBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.primarySubtle, borderRadius: 14, paddingVertical: 14, marginBottom: 10,
    borderWidth: 1.5, borderColor: colors.primary, gap: 8,
  },
  contactBtnText: { fontSize: 14, fontWeight: '700', color: colors.primary },
  downloadBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.surface, borderRadius: 14, paddingVertical: 14,
    borderWidth: 1, borderColor: colors.border, gap: 8,
  },
  downloadBtnText: { fontSize: 14, fontWeight: '600', color: colors.textSecondary },
});

export default Screen13_Insurance;
