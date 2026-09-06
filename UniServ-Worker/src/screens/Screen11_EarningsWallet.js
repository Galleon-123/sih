import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Modal, TextInput, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Rect, Text as SvgText } from 'react-native-svg';
import { colors } from '../theme/colors';
import { useWorker } from '../context/WorkerContext';
import { useJob } from '../context/JobContext';
import { MOCK_WEEKLY_EARNINGS } from '../data/mockJobs';

const BarChart = ({ data, maxAmount }) => {
  const width = 280;
  const height = 100;
  const barWidth = 28;
  const gap = (width - data.length * barWidth) / (data.length + 1);

  return (
    <Svg width={width} height={height + 20}>
      {data.map((item, i) => {
        const barHeight = (item.amount / maxAmount) * height;
        const x = gap + i * (barWidth + gap);
        const y = height - barHeight;
        return (
          <React.Fragment key={item.day}>
            <Rect x={x} y={y} width={barWidth} height={barHeight} fill={colors.primary} rx="6" />
            <SvgText x={x + barWidth / 2} y={height + 14} textAnchor="middle" fill={colors.textMuted} fontSize="10" fontWeight="600">
              {item.day}
            </SvgText>
          </React.Fragment>
        );
      })}
    </Svg>
  );
};

export const Screen11_EarningsWallet = ({ navigation }) => {
  const { worker, updateWorker, t } = useWorker();
  const { jobHistory } = useJob();
  const [period, setPeriod] = useState('weekly');
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState('2000');
  const [payoutSuccess, setPayoutSuccess] = useState(false);

  const availableBalance = (worker?.earnings?.thisMonth || 8200) - 1400;
  const maxAmount = Math.max(...MOCK_WEEKLY_EARNINGS.map((d) => d.amount));

  const handleRequestPayout = () => {
    const amt = parseInt(payoutAmount, 10) || 0;
    if (amt <= 0 || amt > availableBalance) {
      Alert.alert('Invalid Amount', `Please enter an amount between ₹100 and ₹${availableBalance}`);
      return;
    }
    setPayoutSuccess(true);
    setTimeout(() => {
      setPayoutSuccess(false);
      setShowPayoutModal(false);
      Alert.alert('Payout Processed', `₹${amt} has been transferred to your registered UPI ID.`);
    }, 1500);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.pageTitle}>{t('walletTitle', 'Earnings & Cooperative Wallet')}</Text>

        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <View style={styles.balanceHeader}>
            <View>
              <Text style={styles.balanceLabel}>{t('availableBalance', 'Available for Instant Payout')}</Text>
              <Text style={styles.balanceAmount}>₹{availableBalance.toLocaleString()}</Text>
            </View>
            <View style={styles.walletIcon}>
              <Ionicons name="wallet" size={28} color={colors.textInverse} />
            </View>
          </View>
          <TouchableOpacity
            style={styles.payoutBtn}
            onPress={() => setShowPayoutModal(true)}
            activeOpacity={0.85}
          >
            <Ionicons name="arrow-up-circle" size={18} color={colors.textInverse} />
            <Text style={styles.payoutBtnText}>{t('withdrawFunds', 'Request Instant Bank / UPI Payout')}</Text>
          </TouchableOpacity>
          <View style={styles.upiRow}>
            <Ionicons name="shield-checkmark" size={14} color="rgba(255,255,255,0.8)" />
            <Text style={styles.upiText}>{t('cooperativeShareNotice', 'Cooperative MSCS Direct Settlement · No Commission Extraction')}</Text>
          </View>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>{t('jobsToday', 'TODAY')}</Text>
            <Text style={styles.statValue}>₹{worker?.earnings?.today || 450}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>{t('thisMonth', 'THIS MONTH')}</Text>
            <Text style={styles.statValue}>₹{worker?.earnings?.thisMonth?.toLocaleString() || '8,200'}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>{t('totalEarned', 'LIFETIME')}</Text>
            <Text style={styles.statValue}>₹{worker?.earnings?.total ? (worker.earnings.total / 1000).toFixed(0) + 'K' : '94.5K'}</Text>
          </View>
        </View>

        {/* Weekly/Monthly Earnings Trend */}
        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>Earnings Trend</Text>
            <View style={styles.periodToggle}>
              <TouchableOpacity
                style={[styles.periodBtn, period === 'weekly' && styles.periodBtnActive]}
                onPress={() => setPeriod('weekly')}
              >
                <Text style={[styles.periodBtnText, period === 'weekly' && styles.periodBtnTextActive]}>Weekly</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.periodBtn, period === 'monthly' && styles.periodBtnActive]}
                onPress={() => setPeriod('monthly')}
              >
                <Text style={[styles.periodBtnText, period === 'monthly' && styles.periodBtnTextActive]}>Monthly</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.chartWrap}>
            <BarChart data={MOCK_WEEKLY_EARNINGS} maxAmount={maxAmount} />
          </View>
        </View>

        {/* 80/10/6/4 Fair Wage Architecture Card */}
        <View style={styles.breakdownCard}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <Ionicons name="pie-chart" size={18} color={colors.primary} />
            <Text style={styles.breakdownTitle}>80/10/6/4 Fair Wage Transparency</Text>
          </View>
          <Text style={styles.breakdownExample}>Every rupee paid by the customer is distributed under MSCS statutory rules:</Text>

          <View style={styles.splitRow}>
            <View style={[styles.splitBar, { backgroundColor: colors.success, flex: 8 }]} />
            <View style={[styles.splitBar, { backgroundColor: '#10B981', flex: 1 }]} />
            <View style={[styles.splitBar, { backgroundColor: colors.cooperative, flex: 0.6 }]} />
            <View style={[styles.splitBar, { backgroundColor: colors.primary, flex: 0.4 }]} />
          </View>

          <View style={styles.splitLegend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: colors.success }]} />
              <View style={{ flex: 1 }}>
                <Text style={styles.legendText}>80% — Direct Artisan Wages</Text>
                <Text style={styles.legendSub}>Deposited directly to your bank account with zero middleman cuts.</Text>
              </View>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
              <View style={{ flex: 1 }}>
                <Text style={styles.legendText}>10% — Worker Healthcare & Accident Fund</Text>
                <Text style={styles.legendSub}>Funds your active health cover, OPD, and retirement pension.</Text>
              </View>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: colors.cooperative }]} />
              <View style={{ flex: 1 }}>
                <Text style={styles.legendText}>6% — District Cooperative Reserve & Tool Depot</Text>
                <Text style={styles.legendSub}>Funds communal heavy equipment, diagnostic tool banks, and skill centers.</Text>
              </View>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: colors.primary }]} />
              <View style={{ flex: 1 }}>
                <Text style={styles.legendText}>4% — Platform & Seva Suraksha Pool</Text>
                <Text style={styles.legendSub}>Funds real-time GPS server infrastructure & 30-day warranty coverage.</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Transaction History */}
        <Text style={styles.sectionTitle}>Completed Job Settlements</Text>
        {jobHistory.map((job) => (
          <View key={job.id} style={styles.txCard}>
            <View style={styles.txIcon}>
              <Ionicons name="flash-outline" size={18} color={colors.primary} />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.txService}>{job.service}</Text>
              <Text style={styles.txMeta}>{job.customerArea} · {job.date}</Text>
              {job.overtimeApplied && (
                <Text style={styles.otTagText}>+₹100 Overtime (2+ hrs)</Text>
              )}
            </View>
            <View style={styles.txRight}>
              <Text style={styles.txAmount}>+₹{job.amount}</Text>
              <View style={[styles.txStatus, job.status === 'paid' ? styles.paidStatus : styles.pendingStatus]}>
                <Text style={[styles.txStatusText, job.status === 'paid' ? styles.paidText : styles.pendingText]}>
                  {job.status === 'paid' ? '80% Credited' : 'Pending'}
                </Text>
              </View>
            </View>
          </View>
        ))}

        {/* Payout Modal */}
        <Modal visible={showPayoutModal} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Request Instant Payout</Text>
              <Text style={styles.modalSub}>
                Available Balance: <Text style={{ fontWeight: '800', color: colors.success }}>₹{availableBalance.toLocaleString()}</Text>
              </Text>

              <Text style={styles.inputLabel}>Payout Amount (₹)</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter amount"
                placeholderTextColor={colors.textMuted}
                keyboardType="number-pad"
                value={payoutAmount}
                onChangeText={setPayoutAmount}
              />

              <View style={styles.payoutAccountBox}>
                <Ionicons name="card" size={20} color={colors.primary} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.payoutAccTitle}>State Bank of India (Co-op Salary)</Text>
                  <Text style={styles.payoutAccSub}>A/C: **** 4821 · UPI: 9876543210@sbi</Text>
                </View>
                <Ionicons name="checkmark-circle" size={18} color={colors.success} />
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.modalCancelBtn}
                  onPress={() => setShowPayoutModal(false)}
                >
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalSubmitBtn}
                  onPress={handleRequestPayout}
                  disabled={payoutSuccess}
                >
                  <Text style={styles.modalSubmitText}>
                    {payoutSuccess ? 'Processing...' : 'Transfer to Bank'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 36 },
  pageTitle: { fontSize: 22, fontWeight: '800', color: colors.textPrimary, marginBottom: 16 },
  balanceCard: {
    backgroundColor: colors.primary, borderRadius: 22, padding: 20, marginBottom: 16,
    shadowColor: colors.primary, shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3, shadowRadius: 16, elevation: 6,
  },
  balanceHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 },
  balanceLabel: { fontSize: 12, color: 'rgba(255,255,255,0.8)', fontWeight: '600', marginBottom: 4 },
  balanceAmount: { fontSize: 32, fontWeight: '900', color: colors.textInverse },
  walletIcon: { width: 50, height: 50, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  payoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 12, paddingVertical: 12, gap: 8, marginBottom: 12 },
  payoutBtnText: { fontSize: 14, fontWeight: '700', color: colors.textInverse },
  upiRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  upiText: { fontSize: 11, color: 'rgba(255,255,255,0.85)', fontWeight: '500' },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  statCard: { flex: 1, backgroundColor: colors.surface, borderRadius: 14, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: colors.border, marginHorizontal: 3 },
  statLabel: { fontSize: 10, color: colors.textMuted, fontWeight: '800', marginBottom: 4 },
  statValue: { fontSize: 15, fontWeight: '800', color: colors.textPrimary },
  chartCard: { backgroundColor: colors.surface, borderRadius: 18, padding: 18, borderWidth: 1, borderColor: colors.border, marginBottom: 16 },
  chartHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  chartTitle: { fontSize: 14, fontWeight: '800', color: colors.textPrimary },
  periodToggle: { flexDirection: 'row', backgroundColor: colors.surfaceSecondary, borderRadius: 16, padding: 2 },
  periodBtn: { borderRadius: 14, paddingHorizontal: 10, paddingVertical: 4 },
  periodBtnActive: { backgroundColor: colors.surface },
  periodBtnText: { fontSize: 11, fontWeight: '600', color: colors.textMuted },
  periodBtnTextActive: { color: colors.primary, fontWeight: '700' },
  chartWrap: { alignItems: 'center', marginTop: 4 },
  breakdownCard: { backgroundColor: colors.surface, borderRadius: 18, padding: 18, borderWidth: 1, borderColor: colors.border, marginBottom: 16 },
  breakdownTitle: { fontSize: 14, fontWeight: '800', color: colors.textPrimary },
  breakdownExample: { fontSize: 12, color: colors.textMuted, marginBottom: 12 },
  splitRow: { flexDirection: 'row', height: 10, borderRadius: 5, overflow: 'hidden', marginBottom: 14 },
  splitBar: { height: '100%' },
  splitLegend: { gap: 10 },
  legendItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  legendDot: { width: 10, height: 10, borderRadius: 5, marginTop: 4 },
  legendText: { fontSize: 12, fontWeight: '700', color: colors.textPrimary },
  legendSub: { fontSize: 11, color: colors.textMuted, marginTop: 1, lineHeight: 15 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: colors.textPrimary, marginBottom: 12 },
  txCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: colors.border },
  txIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.primarySubtle, alignItems: 'center', justifyContent: 'center' },
  txService: { fontSize: 14, fontWeight: '700', color: colors.textPrimary },
  txMeta: { fontSize: 11, color: colors.textMuted, marginTop: 1 },
  otTagText: { fontSize: 10, color: '#b45309', fontWeight: '700', marginTop: 2 },
  txRight: { alignItems: 'flex-end' },
  txAmount: { fontSize: 15, fontWeight: '800', color: colors.success },
  txStatus: { borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2, marginTop: 3 },
  paidStatus: { backgroundColor: colors.successLight },
  pendingStatus: { backgroundColor: colors.warningLight },
  txStatusText: { fontSize: 10, fontWeight: '700' },
  paidText: { color: colors.success },
  pendingText: { color: colors.warningDark },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: colors.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 22 },
  modalTitle: { fontSize: 17, fontWeight: '800', color: colors.textPrimary, marginBottom: 4 },
  modalSub: { fontSize: 13, color: colors.textMuted, marginBottom: 16 },
  inputLabel: { fontSize: 12, fontWeight: '700', color: colors.textSecondary, marginBottom: 6 },
  textInput: { backgroundColor: colors.surfaceSecondary, borderWidth: 1, borderColor: colors.border, borderRadius: 10, paddingVertical: 10, paddingHorizontal: 12, fontSize: 16, fontWeight: '700', color: colors.textPrimary, marginBottom: 14 },
  payoutAccountBox: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.surfaceSecondary, padding: 12, borderRadius: 10, marginBottom: 18 },
  payoutAccTitle: { fontSize: 12, fontWeight: '700', color: colors.textPrimary },
  payoutAccSub: { fontSize: 11, color: colors.textMuted, marginTop: 1 },
  modalActions: { flexDirection: 'row', gap: 10 },
  modalCancelBtn: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 10, borderWidth: 1, borderColor: colors.border },
  modalCancelText: { color: colors.textMuted, fontWeight: '700' },
  modalSubmitBtn: { flex: 1.5, paddingVertical: 12, alignItems: 'center', borderRadius: 10, backgroundColor: colors.primary },
  modalSubmitText: { color: '#fff', fontWeight: '700' },
});

export default Screen11_EarningsWallet;
