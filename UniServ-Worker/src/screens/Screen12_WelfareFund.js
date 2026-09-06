import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useWorker } from '../context/WorkerContext';

const BENEFITS = [
  { id: 'insurance', label: 'Insurance', status: 'Active', icon: 'shield-checkmark', color: colors.success, bg: colors.successLight },
  { id: 'training', label: 'Training Support', status: 'Eligible', icon: 'school', color: colors.primary, bg: colors.primarySubtle },
  { id: 'emergency', label: 'Emergency Assistance', status: 'Available', icon: 'medkit', color: colors.warning, bg: colors.warningLight },
  { id: 'safety', label: 'Safety Equipment', status: 'Provided', icon: 'construct', color: colors.cooperative, bg: colors.cooperativeLight },
];

export const Screen12_WelfareFund = ({ navigation }) => {
  const { worker, t } = useWorker();

  const benefitsList = [
    { id: 'insurance', label: t('insurance', 'Insurance'), status: t('active', 'Active'), icon: 'shield-checkmark', color: colors.success, bg: colors.successLight },
    { id: 'training', label: t('trainingSupport', 'Training Support'), status: t('eligible', 'Eligible'), icon: 'school', color: colors.primary, bg: colors.primarySubtle },
    { id: 'emergency', label: t('emergencyAssistance', 'Emergency Assistance'), status: t('available', 'Available'), icon: 'medkit', color: colors.warning, bg: colors.warningLight },
    { id: 'safety', label: t('safetyEquipment', 'Safety Equipment'), status: t('provided', 'Provided'), icon: 'construct', color: colors.cooperative, bg: colors.cooperativeLight },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.pageTitle}>{t('welfareFund', 'Worker Welfare Fund')}</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.fundCard}>
          <View style={styles.fundHeader}>
            <View>
              <Text style={styles.fundLabel}>{t('cooperativeFundBalance', 'Cooperative Fund Balance')}</Text>
              <Text style={styles.fundAmount}>₹50,000</Text>
            </View>
            <View style={styles.fundIcon}>
              <Ionicons name="heart" size={28} color={colors.textInverse} />
            </View>
          </View>
          <View style={styles.fundNote}>
            <Ionicons name="information-circle-outline" size={14} color='rgba(255,255,255,0.8)' />
            <Text style={styles.fundNoteText}>{t('pooledFundDesc', 'Pooled fund managed by Delhi Labour Cooperative Society')}</Text>
          </View>
        </View>

        <View style={styles.contributionsCard}>
          <Text style={styles.sectionTitle}>{t('myWelfareContributions', 'My Welfare Contributions')}</Text>
          <View style={styles.contribRow}>
            <View style={styles.contribItem}>
              <Text style={styles.contribValue}>₹{worker?.welfare?.thisMonth || 180}</Text>
              <Text style={styles.contribLabel}>{t('thisMonth', 'This Month')}</Text>
            </View>
            <View style={styles.contribDivider} />
            <View style={styles.contribItem}>
              <Text style={styles.contribValue}>₹{worker?.welfare?.total?.toLocaleString() || '2,400'}</Text>
              <Text style={styles.contribLabel}>{t('totalContributed', 'Total Contributed')}</Text>
            </View>
            <View style={styles.contribDivider} />
            <View style={styles.contribItem}>
              <Text style={styles.contribValue}>₹50</Text>
              <Text style={styles.contribLabel}>{t('perJob', 'Per Job (10%)')}</Text>
            </View>
          </View>
        </View>

        <View style={styles.recentCard}>
          <Text style={styles.sectionTitle}>{t('recentContributions', 'Recent Contributions')}</Text>
          {[
            { label: t('todayJobContribution', "Today's job (Electrical Repair)"), amount: 50 },
            { label: t('thisWeekJobs', 'This week (4 jobs)'), amount: 200 },
            { label: t('lastWeekJobs', 'Last week (5 jobs)'), amount: 250 },
          ].map((item, i) => (
            <View key={i} style={styles.recentRow}>
              <View style={styles.recentDot} />
              <Text style={styles.recentLabel}>{item.label}</Text>
              <Text style={styles.recentAmount}>₹{item.amount}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>{t('yourBenefits', 'Your Benefits')}</Text>
        {benefitsList.map((b) => (
          <View key={b.id} style={[styles.benefitCard, { borderLeftColor: b.color }]}>
            <View style={[styles.benefitIcon, { backgroundColor: b.bg }]}>
              <Ionicons name={b.icon} size={22} color={b.color} />
            </View>
            <View style={{ flex: 1, marginLeft: 14 }}>
              <Text style={styles.benefitLabel}>{b.label}</Text>
              <View style={styles.benefitStatusRow}>
                <Ionicons name="checkmark-circle" size={14} color={colors.success} />
                <Text style={styles.benefitStatus}>{b.status}</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.learnMoreBtn} activeOpacity={0.7}>
              <Text style={styles.learnMoreText}>{t('details', 'Details')}</Text>
            </TouchableOpacity>
          </View>
        ))}

        <View style={styles.howItWorksCard}>
          <Text style={styles.howTitle}>{t('howFundWorks', 'How the Welfare Fund Works')}</Text>
          {[
            { step: '1', text: t('fundStep1', 'Customer pays for service (e.g. ₹500)') },
            { step: '2', text: t('fundStep2', '₹50 is automatically allocated to the Welfare & Healthcare Fund (10%)') },
            { step: '3', text: t('fundStep3', 'You receive ₹400 in your wallet (80%)') },
            { step: '4', text: t('fundStep4', 'Fund is used for insurance, training, and emergency support') },
            { step: '5', text: t('fundStep5', 'All eligible workers benefit from the pooled fund') },
          ].map((item) => (
            <View key={item.step} style={styles.howRow}>
              <View style={styles.howStepBadge}>
                <Text style={styles.howStep}>{item.step}</Text>
              </View>
              <Text style={styles.howText}>{item.text}</Text>
            </View>
          ))}
        </View>

        <View style={styles.withdrawalNote}>
          <Ionicons name="lock-closed" size={16} color={colors.danger} />
          <Text style={styles.withdrawalNoteText}>
            <Text style={{ fontWeight: '700' }}>{t('important', 'Important')}: </Text>
            {t('welfareNote', 'Welfare fund contributions cannot be withdrawn like regular earnings. They are pooled to provide collective benefits to all cooperative workers.')}
          </Text>
        </View>
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
  fundCard: {
    backgroundColor: colors.success, borderRadius: 24, padding: 22, marginBottom: 16,
    shadowColor: colors.success, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25, shadowRadius: 12, elevation: 5,
  },
  fundHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 },
  fundLabel: { fontSize: 13, color: 'rgba(255,255,255,0.8)', fontWeight: '600', marginBottom: 4 },
  fundAmount: { fontSize: 34, fontWeight: '900', color: colors.textInverse },
  fundIcon: {
    width: 52, height: 52, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  fundNote: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  fundNoteText: { fontSize: 11, color: 'rgba(255,255,255,0.7)', flex: 1 },
  contributionsCard: {
    backgroundColor: colors.surface, borderRadius: 22, padding: 20,
    borderWidth: 1, borderColor: colors.border, marginBottom: 16,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.textPrimary, marginBottom: 14 },
  contribRow: { flexDirection: 'row', alignItems: 'center' },
  contribItem: { flex: 1, alignItems: 'center' },
  contribValue: { fontSize: 20, fontWeight: '900', color: colors.textPrimary },
  contribLabel: { fontSize: 10, color: colors.textMuted, fontWeight: '600', marginTop: 2, textAlign: 'center' },
  contribDivider: { width: 1, height: 40, backgroundColor: colors.border },
  recentCard: {
    backgroundColor: colors.surface, borderRadius: 22, padding: 20,
    borderWidth: 1, borderColor: colors.border, marginBottom: 16,
  },
  recentRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  recentDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.success, marginRight: 10 },
  recentLabel: { flex: 1, fontSize: 13, color: colors.textSecondary },
  recentAmount: { fontSize: 14, fontWeight: '700', color: colors.success },
  benefitCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface,
    borderRadius: 16, padding: 14, marginBottom: 10,
    borderWidth: 1, borderColor: colors.border, borderLeftWidth: 4,
  },
  benefitIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  benefitLabel: { fontSize: 14, fontWeight: '700', color: colors.textPrimary },
  benefitStatusRow: { flexDirection: 'row', alignItems: 'center', marginTop: 3, gap: 4 },
  benefitStatus: { fontSize: 12, color: colors.success, fontWeight: '700' },
  learnMoreBtn: {
    backgroundColor: colors.surfaceSecondary, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5,
  },
  learnMoreText: { fontSize: 11, fontWeight: '700', color: colors.textSecondary },
  howItWorksCard: {
    backgroundColor: colors.surface, borderRadius: 22, padding: 20,
    borderWidth: 1, borderColor: colors.border, marginBottom: 16, marginTop: 8,
  },
  howTitle: { fontSize: 15, fontWeight: '700', color: colors.textPrimary, marginBottom: 14 },
  howRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  howStepBadge: {
    width: 26, height: 26, borderRadius: 13, backgroundColor: colors.primarySubtle,
    alignItems: 'center', justifyContent: 'center', marginRight: 12, flexShrink: 0,
  },
  howStep: { fontSize: 12, fontWeight: '800', color: colors.primary },
  howText: { fontSize: 13, color: colors.textSecondary, flex: 1, lineHeight: 18 },
  withdrawalNote: {
    flexDirection: 'row', backgroundColor: colors.dangerLight, borderRadius: 14,
    padding: 14, borderWidth: 1, borderColor: colors.danger,
  },
  withdrawalNoteText: { fontSize: 12, color: colors.textSecondary, marginLeft: 10, flex: 1, lineHeight: 17 },
});

export default Screen12_WelfareFund;
