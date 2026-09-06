import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useBooking } from '../context/BookingContext';
import { useUser } from '../context/UserContext';
import Header from '../components/Header';

export const Screen12_BulkPaymentScreen = ({ navigation }) => {
  const { activeBooking, setPaymentMethod } = useBooking();
  const { t } = useUser();

  const [paymentOption, setPaymentOption] = useState('milestone1'); // 'milestone1' | 'full'
  const [selectedMethod, setSelectedMethod] = useState('upi');
  const [isProcessing, setIsProcessing] = useState(false);

  const totalProjectCost = activeBooking?.total_project_cost || 24000;
  const advanceAmount = activeBooking?.advance_amount || Math.round(totalProjectCost * 0.4);
  const midMilestone = activeBooking?.mid_milestone || Math.round(totalProjectCost * 0.35);
  const finalMilestone = activeBooking?.final_milestone || (totalProjectCost - advanceAmount - midMilestone);
  const advancePercent = activeBooking?.advance_percent || 40;
  const crewSize = activeBooking?.crew_size || 4;
  const estimatedDays = activeBooking?.estimated_days || 2;
  const scaleLabel = activeBooking?.scale_label || 'Bulk Project';
  const materialLabel = activeBooking?.material_label || 'Standard Co-op Sourcing';

  const amountToPay = paymentOption === 'milestone1' ? advanceAmount : totalProjectCost;

  const handlePayEscrow = () => {
    setIsProcessing(true);
    let methodTitle = 'SBI MSCS Direct NEFT/RTGS Transfer';
    if (selectedMethod === 'upi') methodTitle = 'SBI MSCS Escrow Instant UPI';
    else if (selectedMethod === 'card') methodTitle = 'SBI MSCS Escrow Corporate Card';
    else if (selectedMethod === 'netbanking') methodTitle = 'SBI MSCS Escrow NetBanking';

    try {
      if (typeof setPaymentMethod === 'function') {
        setPaymentMethod(methodTitle);
      }
    } catch (e) {
      console.warn('Set payment method fallback:', e);
    }

    setTimeout(() => {
      setIsProcessing(false);
      navigation.navigate('BulkProjectSuccess');
    }, 800);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title="Project Escrow Deposit"
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Bulk Project Hero Card */}
        <View style={styles.projectHeroCard}>
          <View style={styles.projectHeaderRow}>
            <View style={styles.projectIconCircle}>
              <Ionicons name="business" size={24} color="#FFFFFF" />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <View style={styles.escrowBadge}>
                <Ionicons name="shield-checkmark" size={12} color={colors.successDark} />
                <Text style={styles.escrowBadgeText}>SBI MSCS ESCROW PROTECTED</Text>
              </View>
              <Text style={styles.projectTitle}>{scaleLabel}</Text>
              <Text style={styles.projectSub}>{materialLabel}</Text>
            </View>
          </View>

          <View style={styles.projectMetricsRow}>
            <View style={styles.projectMetricItem}>
              <Text style={styles.projectMetricLabel}>SQUAD SIZE</Text>
              <Text style={styles.projectMetricVal}>{crewSize} Master Artisans</Text>
            </View>
            <View style={styles.projectMetricDivider} />
            <View style={styles.projectMetricItem}>
              <Text style={styles.projectMetricLabel}>DURATION</Text>
              <Text style={styles.projectMetricVal}>{estimatedDays} Days Deployment</Text>
            </View>
            <View style={styles.projectMetricDivider} />
            <View style={styles.projectMetricItem}>
              <Text style={styles.projectMetricLabel}>TOTAL ESTIMATE</Text>
              <Text style={[styles.projectMetricVal, { color: colors.primary }]}>₹{totalProjectCost.toLocaleString()}</Text>
            </View>
          </View>
        </View>

        {/* Payment Choice Selector (Milestone 1 Advance vs 100% Full Escrow) */}
        <View style={styles.choiceCard}>
          <Text style={styles.sectionTitle}>SELECT ESCROW DEPOSIT OPTION</Text>

          <TouchableOpacity
            style={[styles.choiceOption, paymentOption === 'milestone1' && styles.choiceOptionSelected]}
            onPress={() => setPaymentOption('milestone1')}
            activeOpacity={0.85}
          >
            <View style={[styles.radioCircle, paymentOption === 'milestone1' && styles.radioCircleSelected]}>
              {paymentOption === 'milestone1' && <View style={styles.radioInnerDot} />}
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <View style={styles.choiceOptionHeader}>
                <Text style={styles.choiceOptionTitle}>Milestone 1 Advance ({advancePercent}%)</Text>
                <View style={styles.recommendedPill}>
                  <Text style={styles.recommendedPillText}>RECOMMENDED</Text>
                </View>
              </View>
              <Text style={styles.choiceOptionSub}>
                Locks artisan squad & funds wholesale raw material depot reserve.
              </Text>
            </View>
            <Text style={styles.choiceOptionAmount}>₹{advanceAmount.toLocaleString()}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.choiceOption, paymentOption === 'full' && styles.choiceOptionSelected]}
            onPress={() => setPaymentOption('full')}
            activeOpacity={0.85}
          >
            <View style={[styles.radioCircle, paymentOption === 'full' && styles.radioCircleSelected]}>
              {paymentOption === 'full' && <View style={styles.radioInnerDot} />}
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <View style={styles.choiceOptionHeader}>
                <Text style={styles.choiceOptionTitle}>Full Project Escrow (100%)</Text>
              </View>
              <Text style={styles.choiceOptionSub}>
                Total amount held in SBI Escrow. Released automatically as each stage is verified.
              </Text>
            </View>
            <Text style={styles.choiceOptionAmount}>₹{totalProjectCost.toLocaleString()}</Text>
          </TouchableOpacity>
        </View>

        {/* 3-Stage Milestone Escrow Schedule Card */}
        <View style={styles.milestoneCard}>
          <View style={styles.milestoneCardHeader}>
            <Ionicons name="list" size={16} color={colors.primary} />
            <Text style={styles.milestoneCardTitle}>3-STAGE ESCROW DISBURSEMENT SCHEDULE</Text>
          </View>

          <View style={styles.milestoneList}>
            {/* Stage 1 */}
            <View style={styles.milestoneRow}>
              <View style={[styles.milestoneNumCircle, { backgroundColor: colors.primary }]}>
                <Text style={styles.milestoneNumText}>1</Text>
              </View>
              <View style={styles.milestoneContent}>
                <View style={styles.milestoneHeaderRow}>
                  <Text style={styles.milestoneName}>Milestone 1: Advance & Procurement ({advancePercent}%)</Text>
                  <Text style={[styles.milestoneVal, { color: colors.primary }]}>₹{advanceAmount.toLocaleString()}</Text>
                </View>
                <Text style={styles.milestoneDetail}>
                  Payable now into SBI Escrow. Unlocks wholesale material sourcing and crew blocking.
                </Text>
              </View>
            </View>

            {/* Stage 2 */}
            <View style={styles.milestoneRow}>
              <View style={[styles.milestoneNumCircle, { backgroundColor: '#F59E0B' }]}>
                <Text style={styles.milestoneNumText}>2</Text>
              </View>
              <View style={styles.milestoneContent}>
                <View style={styles.milestoneHeaderRow}>
                  <Text style={styles.milestoneName}>Milestone 2: Mid-Stage Quality Audit (35%)</Text>
                  <Text style={styles.milestoneVal}>₹{midMilestone.toLocaleString()}</Text>
                </View>
                <Text style={styles.milestoneDetail}>
                  Disbursed only after physical progress check by Ward Coordinator.
                </Text>
              </View>
            </View>

            {/* Stage 3 */}
            <View style={styles.milestoneRow}>
              <View style={[styles.milestoneNumCircle, { backgroundColor: colors.successDark }]}>
                <Text style={styles.milestoneNumText}>3</Text>
              </View>
              <View style={styles.milestoneContent}>
                <View style={styles.milestoneHeaderRow}>
                  <Text style={styles.milestoneName}>Milestone 3: Final Sign-off ({100 - advancePercent - 35}%)</Text>
                  <Text style={styles.milestoneVal}>₹{finalMilestone.toLocaleString()}</Text>
                </View>
                <Text style={styles.milestoneDetail}>
                  Released strictly after customer completion OTP handshake & 7-day warranty activation.
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Govt SBI MSCS Escrow Account Trust Card */}
        <View style={styles.trustCard}>
          <View style={styles.trustHeader}>
            <Ionicons name="lock-closed" size={16} color={colors.successDark} />
            <Text style={styles.trustTitle}>GOVERNMENT SBI MSCS ESCROW TRUST ACCOUNT</Text>
          </View>
          <Text style={styles.trustDesc}>
            Funds are deposited into the Central Multi-State Cooperative Society (MSCS) Trust Escrow Account at State Bank of India (SBI). Artisans are compensated strictly upon verified milestone sign-offs.
          </Text>
          <View style={styles.trustAccountBox}>
            <Text style={styles.trustAccountKey}>ESCROW TRUST BENEFICIARY:</Text>
            <Text style={styles.trustAccountVal}>SBI-MSCS-COOP-SERVICES-ESCROW-8839</Text>
          </View>
        </View>

        {/* Payment Gateway Options */}
        <View style={styles.methodCard}>
          <Text style={styles.sectionTitle}>SELECT PAYMENT METHOD</Text>

          {/* UPI */}
          <TouchableOpacity
            style={[styles.methodOption, selectedMethod === 'upi' && styles.methodOptionSelected]}
            onPress={() => setSelectedMethod('upi')}
            activeOpacity={0.8}
          >
            <View style={styles.methodIconBox}>
              <Ionicons name="phone-portrait" size={18} color={colors.primary} />
            </View>
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.methodTitle}>Instant UPI (GPay / PhonePe / Paytm / BHIM)</Text>
              <Text style={styles.methodSub}>Zero transaction fees • Instant Escrow Credit</Text>
            </View>
            <Ionicons
              name={selectedMethod === 'upi' ? 'radio-button-on' : 'radio-button-off'}
              size={20}
              color={selectedMethod === 'upi' ? colors.primary : colors.textMuted}
            />
          </TouchableOpacity>

          {/* Corporate / Personal Cards */}
          <TouchableOpacity
            style={[styles.methodOption, selectedMethod === 'card' && styles.methodOptionSelected]}
            onPress={() => setSelectedMethod('card')}
            activeOpacity={0.8}
          >
            <View style={styles.methodIconBox}>
              <Ionicons name="card" size={18} color={colors.primary} />
            </View>
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.methodTitle}>Credit / Debit Cards (RuPay, Visa, Mastercard)</Text>
              <Text style={styles.methodSub}>Corporate card & GST invoice supported</Text>
            </View>
            <Ionicons
              name={selectedMethod === 'card' ? 'radio-button-on' : 'radio-button-off'}
              size={20}
              color={selectedMethod === 'card' ? colors.primary : colors.textMuted}
            />
          </TouchableOpacity>

          {/* NetBanking */}
          <TouchableOpacity
            style={[styles.methodOption, selectedMethod === 'netbanking' && styles.methodOptionSelected]}
            onPress={() => setSelectedMethod('netbanking')}
            activeOpacity={0.8}
          >
            <View style={styles.methodIconBox}>
              <Ionicons name="globe" size={18} color={colors.primary} />
            </View>
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.methodTitle}>NetBanking / Direct NEFT Escrow Transfer</Text>
              <Text style={styles.methodSub}>SBI, HDFC, ICICI, Axis, PNB & Co-op Banks</Text>
            </View>
            <Ionicons
              name={selectedMethod === 'netbanking' ? 'radio-button-on' : 'radio-button-off'}
              size={20}
              color={selectedMethod === 'netbanking' ? colors.primary : colors.textMuted}
            />
          </TouchableOpacity>
        </View>

        {/* Cooperative Bulk Wage & Material Allocation */}
        <View style={styles.allocationCard}>
          <Text style={styles.allocationTitle}>COOPERATIVE PROJECT FUND ALLOCATION</Text>
          <View style={styles.allocationBar}>
            <View style={[styles.allocSegment, { width: '50%', backgroundColor: colors.primary }]} />
            <View style={[styles.allocSegment, { width: '38%', backgroundColor: colors.successDark }]} />
            <View style={[styles.allocSegment, { width: '8%', backgroundColor: '#F59E0B' }]} />
            <View style={[styles.allocSegment, { width: '4%', backgroundColor: colors.cooperativePurple }]} />
          </View>
          <View style={styles.allocLegendGrid}>
            <View style={styles.allocLegendItem}>
              <View style={[styles.allocDot, { backgroundColor: colors.primary }]} />
              <Text style={styles.allocLegendText}>50% Wholesale Material Depot</Text>
            </View>
            <View style={styles.allocLegendItem}>
              <View style={[styles.allocDot, { backgroundColor: colors.successDark }]} />
              <Text style={styles.allocLegendText}>38% Master Artisan Squad Wages</Text>
            </View>
            <View style={styles.allocLegendItem}>
              <View style={[styles.allocDot, { backgroundColor: '#F59E0B' }]} />
              <Text style={styles.allocLegendText}>8% Ward Quality & Warranty Fund</Text>
            </View>
            <View style={styles.allocLegendItem}>
              <View style={[styles.allocDot, { backgroundColor: colors.cooperativePurple }]} />
              <Text style={styles.allocLegendText}>4% Co-op Infrastructure & Tax</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Sticky Bottom Deposit Action */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.payBtn}
          onPress={handlePayEscrow}
          disabled={isProcessing}
          activeOpacity={0.85}
        >
          {isProcessing ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <View style={styles.payBtnRow}>
              <Ionicons name="lock-closed" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
              <Text style={styles.payBtnText}>
                Deposit Escrow • ₹{amountToPay.toLocaleString()}
              </Text>
              <Ionicons name="arrow-forward" size={18} color="#FFFFFF" style={{ marginLeft: 8 }} />
            </View>
          )}
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
    paddingBottom: 100
  },
  projectHeroCard: {
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
  projectHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  projectIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center'
  },
  escrowBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 4
  },
  escrowBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.successDark,
    marginLeft: 4
  },
  projectTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textPrimary
  },
  projectSub: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2
  },
  projectMetricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 14,
    padding: 12,
    marginTop: 14
  },
  projectMetricItem: {
    flex: 1,
    alignItems: 'center'
  },
  projectMetricLabel: {
    fontSize: 8,
    fontWeight: '800',
    color: colors.textSecondary,
    letterSpacing: 0.5
  },
  projectMetricVal: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.textPrimary,
    marginTop: 2
  },
  projectMetricDivider: {
    width: 1,
    height: 24,
    backgroundColor: colors.border
  },
  choiceCard: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 14
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 0.5,
    marginBottom: 12
  },
  choiceOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1.5,
    borderColor: colors.border,
    marginBottom: 10
  },
  choiceOptionSelected: {
    backgroundColor: '#EFF6FF',
    borderColor: colors.primary
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.textMuted,
    alignItems: 'center',
    justifyContent: 'center'
  },
  radioCircleSelected: {
    borderColor: colors.primary
  },
  radioInnerDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary
  },
  choiceOptionHeader: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  choiceOptionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.textPrimary
  },
  recommendedPill: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 6
  },
  recommendedPillText: {
    fontSize: 8,
    fontWeight: '800',
    color: colors.successDark
  },
  choiceOptionSub: {
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 2,
    lineHeight: 14
  },
  choiceOptionAmount: {
    fontSize: 14,
    fontWeight: '900',
    color: colors.primary,
    marginLeft: 8
  },
  milestoneCard: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 14
  },
  milestoneCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14
  },
  milestoneCardTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 0.5,
    marginLeft: 6
  },
  milestoneList: {
    gap: 14
  },
  milestoneRow: {
    flexDirection: 'row',
    alignItems: 'flex-start'
  },
  milestoneNumCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
    marginRight: 12
  },
  milestoneNumText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#FFFFFF'
  },
  milestoneContent: {
    flex: 1
  },
  milestoneHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  milestoneName: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.textPrimary
  },
  milestoneVal: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.textPrimary
  },
  milestoneDetail: {
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 2,
    lineHeight: 14
  },
  trustCard: {
    backgroundColor: '#F0FDF4',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1.5,
    borderColor: colors.success,
    marginBottom: 14
  },
  trustHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6
  },
  trustTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.successDark,
    letterSpacing: 0.5,
    marginLeft: 6
  },
  trustDesc: {
    fontSize: 11,
    color: colors.textSecondary,
    lineHeight: 16,
    marginBottom: 10
  },
  trustAccountBox: {
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: colors.border
  },
  trustAccountKey: {
    fontSize: 8,
    fontWeight: '800',
    color: colors.textSecondary
  },
  trustAccountVal: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.primary,
    marginTop: 2
  },
  methodCard: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 14
  },
  methodOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.border,
    marginBottom: 10
  },
  methodOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: '#EFF6FF'
  },
  methodIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.primarySubtle,
    alignItems: 'center',
    justifyContent: 'center'
  },
  methodTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary
  },
  methodSub: {
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 1
  },
  allocationCard: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 14
  },
  allocationTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 0.5,
    marginBottom: 10
  },
  allocationBar: {
    flexDirection: 'row',
    height: 10,
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 12
  },
  allocSegment: {
    height: '100%'
  },
  allocLegendGrid: {
    gap: 6
  },
  allocLegendItem: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  allocDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8
  },
  allocLegendText: {
    fontSize: 10,
    color: colors.textSecondary,
    fontWeight: '600'
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
  payBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 15,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4
  },
  payBtnRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  payBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF'
  }
});

export default Screen12_BulkPaymentScreen;
