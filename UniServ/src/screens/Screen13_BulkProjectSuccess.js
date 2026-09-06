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
  Platform,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useBooking } from '../context/BookingContext';
import { useUser } from '../context/UserContext';
import Header from '../components/Header';

export const Screen13_BulkProjectSuccess = ({ navigation }) => {
  const { activeBooking } = useBooking();
  const { t } = useUser();
  const [callModalVisible, setCallModalVisible] = useState(false);
  const [chatModalVisible, setChatModalVisible] = useState(false);

  const bookingId = activeBooking?.booking_id || 'BK84920';
  const scaleLabel = activeBooking?.scale_label || 'Full Property Bulk Project';
  const materialLabel = activeBooking?.material_label || 'Standard Cooperative Sourcing';
  const totalProjectCost = activeBooking?.total_project_cost || 24000;
  const advanceAmount = activeBooking?.advance_amount || activeBooking?.base_amount || Math.round(totalProjectCost * 0.4);
  const midMilestone = activeBooking?.mid_milestone || Math.round(totalProjectCost * 0.35);
  const finalMilestone = activeBooking?.final_milestone || (totalProjectCost - advanceAmount - midMilestone);
  const crewSize = activeBooking?.crew_size || 4;
  const estimatedDays = activeBooking?.estimated_days || 2;
  const supervisorName = activeBooking?.worker?.name || 'Manoj Verma (Master Contractor)';
  const scheduledDate = activeBooking?.scheduled_date || 'Tomorrow';
  const scheduledTime = activeBooking?.scheduled_time || '10:00 AM - 12:00 PM';
  const serviceName = activeBooking?.service?.name || 'Home Service';

  const handleDownloadContractPdf = () => {
    if (Platform.OS === 'web') {
      try {
        const contractHtml = `
          <!DOCTYPE html>
          <html>
          <head>
            <title>UniServ Cooperative Project Escrow Agreement - ${bookingId}</title>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px; color: #1E293B; }
              .header { border-bottom: 3px solid #1E3A8A; padding-bottom: 20px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: flex-start; }
              .title { font-size: 24px; font-weight: 800; color: #1E3A8A; margin: 0; }
              .badge { background: #ECFDF5; color: #047857; padding: 6px 12px; border-radius: 6px; font-weight: bold; font-size: 13px; border: 1px solid #059669; }
              .grid { margin: 20px 0; line-height: 1.8; }
              .milestones { background: #F8FAFC; border: 1px solid #CBD5E1; border-radius: 8px; padding: 16px; margin: 20px 0; }
              .milestone-item { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px dashed #E2E8F0; }
              .milestone-item:last-child { border-bottom: none; }
              .total { font-size: 20px; font-weight: 900; color: #1E3A8A; border-top: 2px solid #1E3A8A; padding-top: 14px; margin-top: 14px; }
              .footer { margin-top: 40px; font-size: 12px; color: #64748B; border-top: 1px dashed #CBD5E1; padding-top: 14px; text-align: center; }
            </style>
          </head>
          <body>
            <div class="header">
              <div>
                <h1 class="title">Ministry of Cooperation • NCCT</h1>
                <h2 style="font-size: 18px; color: #475569; margin: 4px 0 0;">Multi-Artisan Project Milestone Escrow Agreement</h2>
                <p style="margin: 4px 0 0; color: #64748B;">Contract Ref: COOP-PROJ-${bookingId}-2026</p>
              </div>
              <div>
                <span class="badge">MILESTONE 1 ADVANCE DEPOSITED</span>
              </div>
            </div>

            <div class="grid">
              <p><strong>Customer Name:</strong> Priya Sharma</p>
              <p><strong>Project Classification:</strong> ${scaleLabel} (${materialLabel})</p>
              <p><strong>Primary Service:</strong> ${serviceName} Cooperative Federation</p>
              <p><strong>Assigned Master Contractor:</strong> ${supervisorName}</p>
              <p><strong>Allocated Artisan Squad:</strong> ${crewSize} Certified Cooperative Artisans (${estimatedDays} Days Deployment)</p>
              <p><strong>Scheduled Target Window:</strong> ${scheduledDate} • ${scheduledTime}</p>
              <p><strong>Escrow Account:</strong> SBI Multi-State Cooperative Escrow Trust (SBI-MSCS-8839)</p>
            </div>

            <div class="milestones">
              <h3 style="margin-top: 0; color: #1E3A8A;">3-Stage Escrow Milestone Schedule</h3>
              <div class="milestone-item">
                <span><strong>Milestone 1 (Advance & Material Depot Procurement - 40%):</strong></span>
                <span style="color: #047857; font-weight: bold;">₹${advanceAmount}.00 (DEPOSITED & SECURED)</span>
              </div>
              <div class="milestone-item">
                <span><strong>Milestone 2 (Mid-Stage Rough Work & Quality Audit - 35%):</strong></span>
                <span>₹${midMilestone}.00 (Due on Physical Audit)</span>
              </div>
              <div class="milestone-item">
                <span><strong>Milestone 3 (Final Sign-off & 7-Day Warranty - 25%):</strong></span>
                <span>₹${finalMilestone}.00 (Due on Customer OTP)</span>
              </div>
            </div>

            <div class="total">
              Total Contract Project Value: ₹${totalProjectCost}.00
            </div>

            <div class="footer">
              <p>100% Transparent Cooperative Labor Platform • 80% Direct Artisan Wage Allocation • Central MSCS Trust Protected</p>
              <p>🛡️ Active 7-Day Seva Suraksha Workmanship & Rework Guarantee</p>
            </div>
            <script>window.print();</script>
          </body>
          </html>
        `;
        const blob = new Blob([contractHtml], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const win = window.open(url, '_blank');
        if (win) {
          win.focus();
        } else {
          const a = document.createElement('a');
          a.href = url;
          a.download = `UniServ_Project_Contract_${bookingId}.html`;
          a.click();
        }
      } catch (err) {
        console.warn('PDF export fallback:', err);
      }
    }
    Alert.alert('Contract Downloaded', `Official cooperative escrow project agreement for ${bookingId} is ready.`);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title="Project Escrow Confirmed"
        showBack
        onBack={() => navigation.navigate('Home')}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Success Hero Header */}
        <View style={styles.successHero}>
          <View style={styles.successIconCircle}>
            <Ionicons name="shield-checkmark" size={42} color="#FFFFFF" />
          </View>
          <Text style={styles.successTitle}>Project Advance Escrow Deposited</Text>
          <Text style={styles.paidAmountText}>₹{advanceAmount.toLocaleString()}</Text>
          <View style={styles.escrowStatusPill}>
            <Ionicons name="lock-closed" size={12} color={colors.successDark} />
            <Text style={styles.escrowStatusPillText}>Held in Govt SBI MSCS Escrow Account</Text>
          </View>
          <Text style={styles.bookingRefText}>Contract ID: COOP-PROJ-{bookingId}</Text>
        </View>

        {/* Pre-Arrival Team Contact Promise Card */}
        <View style={styles.teamPromiseCard}>
          <View style={styles.teamPromiseHeader}>
            <View style={styles.teamPromiseIconCircle}>
              <Ionicons name="call" size={18} color="#FFFFFF" />
            </View>
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.teamPromiseTag}>COOPERATIVE PRE-ARRIVAL GUARANTEE</Text>
              <Text style={styles.teamPromiseTitle}>Our Team Will Contact You Before Arrival</Text>
            </View>
          </View>

          <Text style={styles.teamPromiseDesc}>
            Our Lead Supervisor ({supervisorName}) and District Ward Coordinator will call you 2 hours before the scheduled time on your registered mobile number to coordinate site access, gate entry permits, and material depot unloading.
          </Text>

          <View style={styles.supervisorDetailBox}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=300&q=80' }}
              style={styles.supervisorPhoto}
            />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.supervisorName}>{supervisorName}</Text>
              <Text style={styles.supervisorRole}>Assigned Master Contractor • {crewSize} Artisans Squad</Text>
              <Text style={styles.supervisorContact}>Helpline: +91 98765 43210</Text>
            </View>
          </View>

          <View style={styles.supervisorActionRow}>
            <TouchableOpacity
              style={styles.callSupervisorBtn}
              onPress={() => setCallModalVisible(true)}
              activeOpacity={0.85}
            >
              <Ionicons name="call" size={15} color="#FFFFFF" />
              <Text style={styles.callSupervisorBtnText}>Call Project Lead</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.chatSupervisorBtn}
              onPress={() => setChatModalVisible(true)}
              activeOpacity={0.85}
            >
              <Ionicons name="chatbubble-ellipses" size={15} color={colors.primary} />
              <Text style={styles.chatSupervisorBtnText}>Chat with Team</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Confirmed Project Overview Card */}
        <View style={styles.projectOverviewCard}>
          <Text style={styles.sectionHeaderTitle}>PROJECT SPECIFICATIONS &amp; DISPATCH</Text>

          <View style={styles.specGrid}>
            <View style={styles.specRow}>
              <Text style={styles.specKey}>Project Scope:</Text>
              <Text style={styles.specVal}>{scaleLabel}</Text>
            </View>
            <View style={styles.specRow}>
              <Text style={styles.specKey}>Sourcing Option:</Text>
              <Text style={styles.specVal}>{materialLabel}</Text>
            </View>
            <View style={styles.specRow}>
              <Text style={styles.specKey}>Scheduled Slot:</Text>
              <Text style={[styles.specVal, { color: colors.primary }]}>{scheduledDate} • {scheduledTime}</Text>
            </View>
            <View style={styles.specRow}>
              <Text style={styles.specKey}>Artisan Squad:</Text>
              <Text style={styles.specVal}>{crewSize} Master Artisans ({estimatedDays} Days Tour)</Text>
            </View>
            <View style={styles.specRow}>
              <Text style={styles.specKey}>Material Sourcing:</Text>
              <Text style={[styles.specVal, { color: colors.successDark }]}>Wholesale Depot Stock Reserved 📦</Text>
            </View>
          </View>
        </View>

        {/* 3-Stage Milestone Escrow Tracker Card */}
        <View style={styles.escrowTrackerCard}>
          <View style={styles.escrowTrackerHeader}>
            <Ionicons name="shield-checkmark" size={16} color={colors.primary} />
            <Text style={styles.escrowTrackerTitle}>3-STAGE ESCROW MILESTONE TRACKER</Text>
          </View>

          <View style={styles.milestoneList}>
            {/* Stage 1 */}
            <View style={styles.milestoneItem}>
              <View style={[styles.milestoneIconCircle, { backgroundColor: colors.successDark }]}>
                <Ionicons name="checkmark" size={12} color="#FFFFFF" />
              </View>
              <View style={styles.milestoneTextBox}>
                <View style={styles.milestoneTopRow}>
                  <Text style={styles.milestoneTitle}>Milestone 1: Advance &amp; Sourcing</Text>
                  <Text style={[styles.milestoneAmount, { color: colors.successDark }]}>
                    ₹{advanceAmount.toLocaleString()} (Deposited)
                  </Text>
                </View>
                <Text style={styles.milestoneSub}>
                  Wholesale raw material reserve unlocked &amp; {crewSize} artisans blocked.
                </Text>
              </View>
            </View>

            {/* Stage 2 */}
            <View style={styles.milestoneItem}>
              <View style={[styles.milestoneIconCircle, { backgroundColor: '#F59E0B' }]}>
                <Text style={styles.milestoneNumText}>2</Text>
              </View>
              <View style={styles.milestoneTextBox}>
                <View style={styles.milestoneTopRow}>
                  <Text style={styles.milestoneTitle}>Milestone 2: Mid-Stage Quality Audit</Text>
                  <Text style={styles.milestoneAmount}>₹{midMilestone.toLocaleString()}</Text>
                </View>
                <Text style={styles.milestoneSub}>
                  Scheduled for release after physical mid-way audit by Ward Coordinator.
                </Text>
              </View>
            </View>

            {/* Stage 3 */}
            <View style={styles.milestoneItem}>
              <View style={[styles.milestoneIconCircle, { backgroundColor: colors.textMuted }]}>
                <Text style={styles.milestoneNumText}>3</Text>
              </View>
              <View style={styles.milestoneTextBox}>
                <View style={styles.milestoneTopRow}>
                  <Text style={styles.milestoneTitle}>Milestone 3: Final Sign-off &amp; Handover</Text>
                  <Text style={styles.milestoneAmount}>₹{finalMilestone.toLocaleString()}</Text>
                </View>
                <Text style={styles.milestoneSub}>
                  Released only upon customer completion OTP &amp; 7-day warranty activation.
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <TouchableOpacity
          style={styles.downloadPdfBtn}
          onPress={handleDownloadContractPdf}
          activeOpacity={0.8}
        >
          <Ionicons name="document-text" size={18} color={colors.primary} />
          <Text style={styles.downloadPdfBtnText}>Download Project Escrow Agreement (PDF)</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.homeBtn}
          onPress={() => navigation.navigate('Home')}
          activeOpacity={0.85}
        >
          <Ionicons name="home" size={18} color="#FFFFFF" />
          <Text style={styles.homeBtnText}>Return to Home Hub</Text>
          <Ionicons name="arrow-forward" size={16} color="#FFFFFF" style={{ marginLeft: 6 }} />
        </TouchableOpacity>
      </ScrollView>

      {/* Masked Call Dialog Modal */}
      <Modal visible={callModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.callRingCircle}>
              <Ionicons name="call" size={32} color="#FFFFFF" />
            </View>
            <Text style={styles.callingTitle}>Calling Project Supervisor</Text>
            <Text style={styles.callingName}>{supervisorName}</Text>
            <Text style={styles.callingSub}>{serviceName} Cooperative Federation • +91 98765 43210</Text>

            <TouchableOpacity
              style={styles.endCallBtn}
              onPress={() => setCallModalVisible(false)}
            >
              <Ionicons name="call" size={16} color="#FFFFFF" style={{ transform: [{ rotate: '135deg' }] }} />
              <Text style={styles.endCallText}>End Call</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Simulated Chat Modal */}
      <Modal visible={chatModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.chatHeader}>
              <Text style={styles.chatTitle}>Chat with {supervisorName}</Text>
              <TouchableOpacity onPress={() => setChatModalVisible(false)}>
                <Ionicons name="close" size={22} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <View style={styles.chatBubble}>
              <Text style={styles.chatMessage}>
                "Namaste! Your project advance has been received in SBI Escrow. Our squad and material van are scheduled to arrive at your site on {scheduledDate} at {scheduledTime}."
              </Text>
              <Text style={styles.chatTime}>Just now</Text>
            </View>
            <TouchableOpacity
              style={styles.chatReplyBtn}
              onPress={() => {
                Alert.alert('Message Sent', 'Your query has been dispatched to the Lead Supervisor.');
                setChatModalVisible(false);
              }}
            >
              <Text style={styles.chatReplyText}>Quick Reply: "Please call 2 hours prior to arrival."</Text>
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
    paddingTop: 14,
    paddingBottom: 40
  },
  successHero: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 22,
    padding: 20,
    borderWidth: 1.5,
    borderColor: colors.success,
    marginBottom: 14,
    shadowColor: colors.success,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3
  },
  successIconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: colors.successDark,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12
  },
  successTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
    textAlign: 'center'
  },
  paidAmountText: {
    fontSize: 28,
    fontWeight: '900',
    color: colors.primary,
    marginVertical: 4
  },
  escrowStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 6
  },
  escrowStatusPillText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.successDark,
    marginLeft: 6
  },
  bookingRefText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600'
  },
  teamPromiseCard: {
    backgroundColor: '#F0FDF4',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1.5,
    borderColor: colors.success,
    marginBottom: 14
  },
  teamPromiseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8
  },
  teamPromiseIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.successDark,
    alignItems: 'center',
    justifyContent: 'center'
  },
  teamPromiseTag: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.successDark,
    letterSpacing: 0.5
  },
  teamPromiseTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textPrimary
  },
  teamPromiseDesc: {
    fontSize: 11,
    color: colors.textSecondary,
    lineHeight: 16,
    marginBottom: 12
  },
  supervisorDetailBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 12
  },
  supervisorPhoto: {
    width: 44,
    height: 44,
    borderRadius: 22
  },
  supervisorName: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.textPrimary
  },
  supervisorRole: {
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 1
  },
  supervisorContact: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.primary,
    marginTop: 2
  },
  supervisorActionRow: {
    flexDirection: 'row',
    gap: 10
  },
  callSupervisorBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.successDark,
    paddingVertical: 11,
    borderRadius: 12
  },
  callSupervisorBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
    marginLeft: 6
  },
  chatSupervisorBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.primary,
    paddingVertical: 11,
    borderRadius: 12
  },
  chatSupervisorBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.primary,
    marginLeft: 6
  },
  projectOverviewCard: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 14
  },
  sectionHeaderTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 0.5,
    marginBottom: 12
  },
  specGrid: {
    gap: 8
  },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  specKey: {
    fontSize: 11,
    color: colors.textSecondary
  },
  specVal: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary
  },
  escrowTrackerCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1.5,
    borderColor: colors.primary,
    marginBottom: 14
  },
  escrowTrackerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12
  },
  escrowTrackerTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 0.5,
    marginLeft: 6
  },
  milestoneList: {
    gap: 12
  },
  milestoneItem: {
    flexDirection: 'row',
    alignItems: 'flex-start'
  },
  milestoneIconCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
    marginRight: 10
  },
  milestoneNumText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF'
  },
  milestoneTextBox: {
    flex: 1
  },
  milestoneTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  milestoneTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.textPrimary
  },
  milestoneAmount: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.textPrimary
  },
  milestoneSub: {
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 2,
    lineHeight: 14
  },
  downloadPdfBtn: {
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
  downloadPdfBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.primary,
    marginLeft: 8
  },
  homeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4
  },
  homeBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
    marginRight: 4
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    paddingHorizontal: 20
  },
  modalCard: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center'
  },
  callRingCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.successDark,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14
  },
  callingTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary
  },
  callingName: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
    marginTop: 4
  },
  callingSub: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
    marginBottom: 18
  },
  endCallBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.danger,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 14
  },
  endCallText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
    marginLeft: 6
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 14
  },
  chatTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textPrimary
  },
  chatBubble: {
    backgroundColor: colors.surfaceSecondary,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 14,
    width: '100%'
  },
  chatMessage: {
    fontSize: 12,
    color: colors.textPrimary,
    lineHeight: 17
  },
  chatTime: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 4,
    textAlign: 'right'
  },
  chatReplyBtn: {
    backgroundColor: colors.primarySubtle,
    padding: 12,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center'
  },
  chatReplyText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary
  }
});

export default Screen13_BulkProjectSuccess;
