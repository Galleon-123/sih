import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useBooking } from '../context/BookingContext';
import { useUser } from '../context/UserContext';
import PaymentBreakdown from '../components/PaymentBreakdown';

export const Screen13_PaymentSuccess = ({ navigation }) => {
  const { activeBooking, totalAmount, computeTotal } = useBooking();
  const { t } = useUser();
  const [invoiceModalVisible, setInvoiceModalVisible] = useState(false);

  const amountPaid = computeTotal ? computeTotal(activeBooking) : (totalAmount || activeBooking?.total_amount || 500);
  const bookingId = activeBooking?.booking_id || 'BK84920';
  const serviceName = activeBooking?.service?.name || 'General Service';
  const workerName = activeBooking?.worker?.name || 'Rajan Kumar';
  const hasWarranty = activeBooking?.service?.has_seva_suraksha !== false;

  const handleRateExperience = () => {
    navigation.navigate('RatingScreen');
  };

  const handleDownloadInvoicePdf = () => {
    if (Platform.OS === 'web') {
      try {
        const invoiceContent = `
          <!DOCTYPE html>
          <html>
          <head>
            <title>UniServ Tax Invoice - ${bookingId}</title>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px; color: #1E293B; }
              .header { border-bottom: 2px solid #1E3A8A; padding-bottom: 20px; margin-bottom: 20px; display: flex; justify-content: space-between; }
              .title { font-size: 24px; font-weight: 800; color: #1E3A8A; margin: 0; }
              .badge { background: #ECFDF5; color: #047857; padding: 4px 8px; border-radius: 6px; font-weight: bold; font-size: 12px; }
              .grid { margin: 20px 0; line-height: 1.8; }
              .total { font-size: 22px; font-weight: 900; color: #1E3A8A; border-top: 1px solid #E2E8F0; padding-top: 14px; margin-top: 14px; }
              .footer { margin-top: 40px; font-size: 12px; color: #64748B; border-top: 1px dashed #CBD5E1; padding-top: 10px; }
            </style>
          </head>
          <body>
            <div class="header">
              <div>
                <h1 class="title">UniServ Cooperative Platform</h1>
                <p style="margin: 4px 0 0; color: #64748B;">Official Service & GST Tax Receipt</p>
              </div>
              <div>
                <span class="badge">PAID IN FULL</span>
              </div>
            </div>
            <div class="grid">
              <p><strong>Invoice Number:</strong> INV-${bookingId}-2026</p>
              <p><strong>Transaction Date:</strong> ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              <p><strong>Customer Name:</strong> Priya Sharma</p>
              <p><strong>Service Rendered:</strong> ${serviceName}</p>
              <p><strong>Lead Artisan:</strong> ${workerName}</p>
              <p><strong>Cooperative Society:</strong> Delhi Labour Cooperative Union</p>
              <p><strong>Payment Mode:</strong> ${activeBooking?.payment_method || 'Instant UPI'}</p>
            </div>
            <div class="total">
              Total Amount Settled: ₹${amountPaid}.00
            </div>
            <div class="footer">
              <p>Government Registered Cooperative Platform • 80% Direct Artisan Wage Guaranteed</p>
              ${hasWarranty ? '<p>🛡️ Active 7-Day Seva Suraksha Warranty Protection Included</p>' : ''}
            </div>
            <script>window.print();</script>
          </body>
          </html>
        `;
        const blob = new Blob([invoiceContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const win = window.open(url, '_blank');
        if (win) {
          win.focus();
        } else {
          const a = document.createElement('a');
          a.href = url;
          a.download = `UniServ_Invoice_${bookingId}.html`;
          a.click();
        }
      } catch (err) {
        console.warn('PDF export fallback:', err);
      }
    }
    Alert.alert('Invoice Ready', `Official tax invoice PDF for ${bookingId} has been generated.`);
    setInvoiceModalVisible(false);
  };

  const isScheduledOrAdvance = activeBooking?.booking_type === 'scheduled' || !!activeBooking?.is_bulk_project || activeBooking?.scale_mode === 'bulk';

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Success Checkmark Hero */}
        <View style={styles.successHero}>
          <View style={styles.successIconCircle}>
            <Ionicons name="checkmark-done" size={44} color="#FFFFFF" />
          </View>
          <Text style={styles.successTitle}>
            {isScheduledOrAdvance ? 'Advance Payment Confirmed' : t('paymentSuccessful')}
          </Text>
          <Text style={styles.paidAmountText}>₹{amountPaid}</Text>
          <View style={styles.txnPill}>
            <Text style={styles.txnPillText}>
              {isScheduledOrAdvance ? `Escrow Ref: SBI-MSCS-${bookingId}` : `Txn Ref: TXN-COOP-${bookingId}`}
            </Text>
          </View>
        </View>

        {/* Advance Payment Confirmation & Team Contact Assurance Banner */}
        {isScheduledOrAdvance && (
          <View style={styles.advanceContactCard}>
            <View style={styles.advanceContactHeader}>
              <View style={styles.advanceContactIconCircle}>
                <Ionicons name="call" size={18} color="#FFFFFF" />
              </View>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.advanceContactTag}>ADVANCE MILESTONE ESCROW SECURED</Text>
                <Text style={styles.advanceContactTitle}>Our Team Will Contact You Before Arrival</Text>
              </View>
            </View>

            <Text style={styles.advanceContactDesc}>
              Your advance payment of ₹{amountPaid} is securely held in the Govt-monitored SBI MSCS Cooperative Escrow Trust Account. Our cooperative dispatch team and Lead Supervisor will call you 2 hours before the scheduled time on your registered mobile number.
            </Text>

            <View style={styles.contactDetailsBox}>
              <Text style={styles.contactDetailsLabel}>FOR SCHEDULING DETAILS OR ASSISTANCE:</Text>
              <View style={styles.contactRow}>
                <Ionicons name="person-circle-outline" size={16} color={colors.primary} />
                <Text style={styles.contactRowText}>
                  Contact Person: {workerName ? `${workerName} (Lead Supervisor)` : 'Ramesh Chand (District Ward Coordinator)'}
                </Text>
              </View>
              <View style={styles.contactRow}>
                <Ionicons name="call-outline" size={16} color={colors.primary} />
                <Text style={styles.contactRowText}>
                  Helpline: +91 98765 43210 (Direct Co-op Federation Dispatch Desk)
                </Text>
              </View>
              <View style={styles.contactRow}>
                <Ionicons name="calendar-outline" size={16} color={colors.primary} />
                <Text style={styles.contactRowText}>
                  Scheduled Slot: {activeBooking?.scheduled_date || 'Target Date: Tomorrow'} • {activeBooking?.scheduled_time || '10:00 AM'}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* 7-Day Warranty ONLY if category is eligible for Seva Suraksha */}
        {hasWarranty ? (
          <View style={styles.warrantySummaryCard}>
            <View style={styles.warrantyHeaderRow}>
              <Ionicons name="shield-checkmark" size={20} color={colors.success} />
              <Text style={styles.warrantyTitle}>{t('warrantyActivated')}</Text>
            </View>
            <Text style={styles.warrantyDesc}>
              Your repair is fully protected under Seva Suraksha for 7 days. Free doorstep rework if any technical defect reoccurs.
            </Text>
          </View>
        ) : (
          <View style={[styles.warrantySummaryCard, { backgroundColor: colors.primarySubtle }]}>
            <View style={styles.warrantyHeaderRow}>
              <Ionicons name="sparkles" size={18} color={colors.primary} />
              <Text style={[styles.warrantyTitle, { color: colors.primary }]}>Cooperative Service Delivery Verified</Text>
            </View>
            <Text style={[styles.warrantyDesc, { color: colors.primaryText }]}>
              Service completed with standardized cooperative rates. Thank you for empowering local artisan cooperatives!
            </Text>
          </View>
        )}

        {/* The 80% Fair Wage Breakdown Card */}
        <View style={styles.breakdownWrap}>
          <PaymentBreakdown totalAmount={amountPaid} />
        </View>

        {/* Invoice Download Action */}
        <TouchableOpacity
          style={styles.invoiceBtn}
          onPress={() => setInvoiceModalVisible(true)}
          activeOpacity={0.8}
        >
          <Ionicons name="document-text-outline" size={18} color={colors.primary} />
          <Text style={styles.invoiceBtnText}>{t('downloadInvoice')}</Text>
        </TouchableOpacity>

        {/* Rate Experience Button */}
        <TouchableOpacity
          style={styles.rateBtn}
          onPress={handleRateExperience}
          activeOpacity={0.85}
        >
          <Ionicons name="star" size={18} color="#FFFFFF" />
          <Text style={styles.rateBtnText}>{t('rateExperience')}</Text>
          <Ionicons name="arrow-forward" size={16} color="#FFFFFF" style={{ marginLeft: 4 }} />
        </TouchableOpacity>
      </ScrollView>

      {/* Invoice Modal */}
      <Modal visible={invoiceModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.invoiceCard}>
            <View style={styles.invoiceHeader}>
              <View>
                <Text style={styles.invoiceBrand}>UniServ Cooperative Platform</Text>
                <Text style={styles.invoiceSub}>Official Service Tax Invoice</Text>
              </View>
              <TouchableOpacity onPress={() => setInvoiceModalVisible(false)}>
                <Ionicons name="close" size={22} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.invoiceBody}>
              <View style={styles.invoiceRow}>
                <Text style={styles.invoiceKey}>Invoice No:</Text>
                <Text style={styles.invoiceVal}>INV-{bookingId}-2026</Text>
              </View>
              <View style={styles.invoiceRow}>
                <Text style={styles.invoiceKey}>Date & Time:</Text>
                <Text style={styles.invoiceVal}>
                  {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}, {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
              <View style={styles.invoiceRow}>
                <Text style={styles.invoiceKey}>Service Category:</Text>
                <Text style={styles.invoiceVal}>{serviceName}</Text>
              </View>
              <View style={styles.invoiceRow}>
                <Text style={styles.invoiceKey}>Lead Artisan:</Text>
                <Text style={styles.invoiceVal}>{workerName}</Text>
              </View>
              <View style={styles.invoiceRow}>
                <Text style={styles.invoiceKey}>Cooperative Society:</Text>
                <Text style={styles.invoiceVal}>Delhi Labour Cooperative Union</Text>
              </View>

              <View style={styles.invoiceDivider} />

              <View style={styles.invoiceRow}>
                <Text style={styles.invoiceTotalKey}>Total Amount Settled:</Text>
                <Text style={styles.invoiceTotalVal}>₹{amountPaid}.00</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.downloadPdfBtn}
              onPress={handleDownloadInvoicePdf}
            >
              <Ionicons name="download-outline" size={18} color="#FFFFFF" />
              <Text style={styles.downloadPdfText}>{t('downloadInvoice')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    paddingTop: 24,
    paddingBottom: 40
  },
  successHero: {
    alignItems: 'center',
    marginBottom: 20
  },
  successIconCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.success,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
    marginBottom: 12
  },
  successTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.textPrimary
  },
  paidAmountText: {
    fontSize: 34,
    fontWeight: '900',
    color: colors.primary,
    marginTop: 4
  },
  txnPill: {
    backgroundColor: colors.surfaceSecondary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 6,
    borderWidth: 1,
    borderColor: colors.border
  },
  txnPillText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600'
  },
  warrantySummaryCard: {
    backgroundColor: colors.successLight,
    borderRadius: 18,
    padding: 16,
    marginBottom: 16
  },
  warrantyHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4
  },
  warrantyTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.successDark,
    marginLeft: 6
  },
  warrantyDesc: {
    fontSize: 11,
    color: colors.successDark,
    lineHeight: 16,
    marginTop: 2
  },
  breakdownWrap: {
    marginBottom: 16
  },
  invoiceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.primaryLight,
    marginBottom: 12
  },
  invoiceBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
    marginLeft: 6
  },
  rateBtn: {
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
  rateBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
    marginLeft: 6
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    paddingHorizontal: 20
  },
  invoiceCard: {
    backgroundColor: colors.surface,
    borderRadius: 22,
    padding: 20
  },
  invoiceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16
  },
  invoiceBrand: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary
  },
  invoiceSub: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2
  },
  invoiceBody: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 14,
    padding: 14,
    marginBottom: 16
  },
  invoiceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4
  },
  invoiceKey: {
    fontSize: 12,
    color: colors.textSecondary
  },
  invoiceVal: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary
  },
  invoiceDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 8
  },
  invoiceTotalKey: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.textPrimary
  },
  invoiceTotalVal: {
    fontSize: 15,
    fontWeight: '900',
    color: colors.primary
  },
  downloadPdfBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 12
  },
  downloadPdfText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: 6
  },
  advanceContactCard: {
    backgroundColor: '#F0FDF4',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1.5,
    borderColor: colors.success,
    marginBottom: 16
  },
  advanceContactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8
  },
  advanceContactIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.successDark,
    alignItems: 'center',
    justifyContent: 'center'
  },
  advanceContactTag: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.successDark,
    letterSpacing: 0.5
  },
  advanceContactTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textPrimary
  },
  advanceContactDesc: {
    fontSize: 11,
    color: colors.textSecondary,
    lineHeight: 16,
    marginBottom: 12
  },
  contactDetailsBox: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 8
  },
  contactDetailsLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.textSecondary,
    letterSpacing: 0.5
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  contactRowText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textPrimary,
    marginLeft: 6,
    flex: 1
  }
});

export default Screen13_PaymentSuccess;
