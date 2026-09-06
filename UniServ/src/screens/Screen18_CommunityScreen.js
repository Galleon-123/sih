import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Modal,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useUser } from '../context/UserContext';
import { useBooking } from '../context/BookingContext';
import Header from '../components/Header';
import cooperativesData from '../data/cooperatives.json';

export const Screen18_CommunityScreen = ({ navigation }) => {
  const { user, t } = useUser();
  const { submitCommunityBulkRequest } = useBooking();

  const [selectedCoop, setSelectedCoop] = useState(cooperativesData[0]);
  const [selectedService, setSelectedService] = useState(cooperativesData[0].bulk_services[0]);
  const [quoteModalVisible, setQuoteModalVisible] = useState(false);
  const [callModalVisible, setCallModalVisible] = useState(false);

  // Dynamic Scale State for the chosen service
  const [societyScale, setSocietyScale] = useState('Medium (100–250 Flats)');
  const [tankCapacity, setTankCapacity] = useState('15,000 – 25,000 Litres');

  // Form state for society quote
  const [societyName, setSocietyName] = useState('Palm Heights Residents Welfare Association (RWA)');
  const [targetDate, setTargetDate] = useState('Sunday, 6 Sep 2026');
  const [contactName, setContactName] = useState(user?.name || 'Priya Sharma');
  const [contactPhone, setContactPhone] = useState(user?.phone || '9876543210');
  const [confirmedRequest, setConfirmedRequest] = useState(null);

  // Dynamic Math Calculator for Society Bulk Services
  const bulkMath = useMemo(() => {
    let crew = 4;
    let days = 1;
    let minCost = 3500;
    let maxCost = 6500;

    const servId = selectedService?.id;

    if (servId === 'bulk_1') { // Water Tank
      if (tankCapacity.includes('5,000')) {
        crew = 3; days = 1; minCost = 2999; maxCost = 4500;
      } else if (tankCapacity.includes('15,000')) {
        crew = 5; days = 1; minCost = 5500; maxCost = 8500;
      } else {
        crew = 8; days = 2; minCost = 11000; maxCost = 16500;
      }
    } else if (servId === 'bulk_2') { // Electrical Audit
      crew = 4; days = 2; minCost = 8500; maxCost = 14500;
    } else if (servId === 'bulk_3') { // Drainage
      crew = 6; days = 2; minCost = 12000; maxCost = 22000;
    } else if (servId === 'bulk_4') { // Solar Panel
      crew = 4; days = 1; minCost = 3500; maxCost = 6500;
    } else if (servId === 'bulk_5') { // Common Area Clean
      crew = 8; days = 1; minCost = 7500; maxCost = 13500;
    } else { // Exterior Painting
      crew = 10; days = 5; minCost = 35000; maxCost = 65000;
    }

    const midCost = Math.round((minCost + maxCost) / 2);
    const workerWage = Math.round(midCost * 0.8);
    const welfare = Math.round(midCost * 0.1);
    const coopOps = Math.round(midCost * 0.06);
    const platform = Math.round(midCost * 0.04);

    return { crew, days, minCost, maxCost, midCost, workerWage, welfare, coopOps, platform };
  }, [selectedService, societyScale, tankCapacity]);

  const handleOpenQuoteModal = (service) => {
    setSelectedService(service);
    setConfirmedRequest(null);
    setQuoteModalVisible(true);
  };

  const handleSubmitQuote = () => {
    if (!societyName.trim()) {
      Alert.alert('Society Name Required', 'Please enter your society or apartment complex name.');
      return;
    }

    const req = submitCommunityBulkRequest({
      society_name: societyName,
      service_title: `${selectedService.title} (${societyScale})`,
      cooperative: selectedCoop.name,
      contact_person: contactName,
      phone: contactPhone,
      target_date: targetDate,
      units_estimate: `${societyScale} • Est ₹${bulkMath.minCost.toLocaleString()} - ₹${bulkMath.maxCost.toLocaleString()}`
    });

    setConfirmedRequest(req);
  };

  const handleCallHead = () => {
    setCallModalVisible(true);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title="Community & Bulk Services"
        showBack
        onBack={() => navigation.navigate('Home')}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Banner Hero */}
        <View style={styles.heroCard}>
          <View style={styles.heroIconCircle}>
            <Ionicons name="business" size={26} color={colors.primary} />
          </View>
          <View style={styles.heroTextCol}>
            <Text style={styles.heroBadge}>RWA &amp; HOUSING SOCIETY BULK HUB</Text>
            <Text style={styles.heroTitle}>Deploy Certified Cooperative Fleets</Text>
            <Text style={styles.heroSub}>
              Direct connection with Government-Registered Labour Cooperative Federations for society-wide infrastructure and maintenance.
            </Text>
          </View>
        </View>

        {/* Matched Cooperative Federation Card */}
        <View style={styles.coopCard}>
          <View style={styles.coopHeaderRow}>
            <View style={styles.coopAvatarBox}>
              <Ionicons name="people-circle" size={32} color={colors.primary} />
            </View>
            <View style={{ flex: 1, marginLeft: 10 }}>
              <View style={styles.verifiedRow}>
                <Text style={styles.coopName}>{selectedCoop.name}</Text>
              </View>
              <Text style={styles.regNoText}>Reg: {selectedCoop.registration_no}</Text>
            </View>
          </View>

          {/* Federation Community Head Profile Card */}
          <View style={styles.headProfileCard}>
            <Image source={{ uri: selectedCoop.head_photo }} style={styles.headPhoto} />
            <View style={styles.headInfoCol}>
              <Text style={styles.headLabel}>COMMUNITY HEAD / WARD COORDINATOR</Text>
              <Text style={styles.headName}>{selectedCoop.head_name}</Text>
              <Text style={styles.headDesignation}>{selectedCoop.head_designation}</Text>
              
              <View style={styles.fleetRow}>
                <Ionicons name="shield-checkmark" size={14} color={colors.successDark} />
                <Text style={styles.fleetText}>{selectedCoop.fleet_size}</Text>
                <Text style={styles.dot}>•</Text>
                <Text style={styles.fleetText}>{selectedCoop.completed_bulk_contracts}+ Contracts Done</Text>
              </View>
            </View>
          </View>

          {/* Contact Details & Actions */}
          <View style={styles.contactDetailsBox}>
            <View style={styles.contactItem}>
              <Ionicons name="call" size={14} color={colors.primary} />
              <Text style={styles.contactText}>{selectedCoop.phone}</Text>
            </View>
            <View style={styles.contactItem}>
              <Ionicons name="location" size={14} color={colors.textSecondary} />
              <Text style={styles.contactText} numberOfLines={1}>{selectedCoop.office_address}</Text>
            </View>
          </View>

          {/* One Click Contact Actions */}
          <View style={styles.actionButtonsRow}>
            <TouchableOpacity style={styles.callBtn} onPress={handleCallHead} activeOpacity={0.85}>
              <Ionicons name="call" size={16} color="#FFFFFF" />
              <Text style={styles.callBtnText}>Call Community Head</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quoteBtn}
              onPress={() => handleOpenQuoteModal(selectedCoop.bulk_services[0])}
              activeOpacity={0.85}
            >
              <Ionicons name="calculator" size={16} color={colors.primary} />
              <Text style={styles.quoteBtnText}>Calculate &amp; Inquire</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Bulk Services Grid */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Available Society Bulk Services</Text>
          <Text style={styles.sectionSub}>Standardized cooperative rates with multi-artisan deployment</Text>
        </View>

        <View style={styles.servicesGrid}>
          {selectedCoop.bulk_services.map((serv) => (
            <View key={serv.id} style={styles.serviceCard}>
              <View style={styles.serviceTopRow}>
                <View style={styles.serviceIconBox}>
                  <Ionicons name={serv.icon} size={22} color={colors.primary} />
                </View>
                <View style={styles.capacityBadge}>
                  <Text style={styles.capacityText}>{serv.capacity}</Text>
                </View>
              </View>

              <Text style={styles.serviceTitle}>{serv.title}</Text>
              <Text style={styles.serviceDesc}>{serv.description}</Text>

              <View style={styles.serviceBottomRow}>
                <Text style={styles.priceEstimate}>{serv.base_estimate}</Text>
                <TouchableOpacity
                  style={styles.bookBulkBtn}
                  onPress={() => handleOpenQuoteModal(serv)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.bookBulkBtnText}>Estimate &amp; Book</Text>
                  <Ionicons name="arrow-forward" size={12} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Society Quote Request & AI Calculator Modal */}
      <Modal visible={quoteModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            {!confirmedRequest ? (
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.modalHeader}>
                  <View style={{ flex: 1, marginRight: 10 }}>
                    <Text style={styles.modalTitle}>Society Bulk Quote &amp; Calculator</Text>
                    <Text style={styles.modalSub}>{selectedService?.title}</Text>
                  </View>
                  <TouchableOpacity onPress={() => setQuoteModalVisible(false)}>
                    <Ionicons name="close" size={22} color={colors.textSecondary} />
                  </TouchableOpacity>
                </View>

                {/* Scale Customizer */}
                <Text style={styles.calcLabel}>1. Select Scale / Capacity</Text>
                {selectedService?.id === 'bulk_1' ? (
                  <View style={styles.chipsRow}>
                    {['5,000 – 10,000 L', '15,000 – 25,000 Litres', '30,000 – 50,000 L'].map((cap) => (
                      <TouchableOpacity
                        key={cap}
                        style={[styles.calcChip, tankCapacity === cap && styles.calcChipActive]}
                        onPress={() => setTankCapacity(cap)}
                      >
                        <Text style={[styles.calcChipText, tankCapacity === cap && styles.calcChipTextActive]}>
                          {cap}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                ) : (
                  <View style={styles.chipsRow}>
                    {['Small (20–50 Flats)', 'Medium (100–250 Flats)', 'Large (300+ Flats)'].map((sc) => (
                      <TouchableOpacity
                        key={sc}
                        style={[styles.calcChip, societyScale === sc && styles.calcChipActive]}
                        onPress={() => setSocietyScale(sc)}
                      >
                        <Text style={[styles.calcChipText, societyScale === sc && styles.calcChipTextActive]}>
                          {sc}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                {/* Real-time Math Output Card */}
                <View style={styles.calcResultCard}>
                  <View style={styles.metricsRow}>
                    <View style={styles.metricItem}>
                      <Ionicons name="people" size={16} color={colors.primary} />
                      <Text style={styles.metricItemVal}>{bulkMath.crew} Artisans</Text>
                      <Text style={styles.metricItemLabel}>Crew Size</Text>
                    </View>
                    <View style={styles.metricItem}>
                      <Ionicons name="time" size={16} color={colors.primary} />
                      <Text style={styles.metricItemVal}>{bulkMath.days} Days</Text>
                      <Text style={styles.metricItemLabel}>Duration</Text>
                    </View>
                    <View style={styles.metricItem}>
                      <Ionicons name="wallet" size={16} color={colors.successDark} />
                      <Text style={[styles.metricItemVal, { color: colors.successDark }]}>80% Direct</Text>
                      <Text style={styles.metricItemLabel}>Fair Wage</Text>
                    </View>
                  </View>

                  <View style={styles.calcCostBanner}>
                    <Text style={styles.calcCostLabel}>ESTIMATED COOPERATIVE PROJECT COST</Text>
                    <Text style={styles.calcCostVal}>
                      ₹{bulkMath.minCost.toLocaleString()} – ₹{bulkMath.maxCost.toLocaleString()}
                    </Text>
                  </View>
                </View>

                {/* Form Fields */}
                <Text style={styles.fieldLabel}>Society / RWA Name *</Text>
                <TextInput
                  style={styles.input}
                  value={societyName}
                  onChangeText={setSocietyName}
                  placeholder="e.g. Palm Heights RWA"
                />

                <Text style={styles.fieldLabel}>Preferred Site Inspection Date</Text>
                <TextInput
                  style={styles.input}
                  value={targetDate}
                  onChangeText={setTargetDate}
                  placeholder="e.g. Sunday, 6 Sep 2026"
                />

                <Text style={styles.fieldLabel}>RWA Representative Contact Name</Text>
                <TextInput
                  style={styles.input}
                  value={contactName}
                  onChangeText={setContactName}
                  placeholder="Full Name"
                />

                <Text style={styles.fieldLabel}>Mobile Number</Text>
                <TextInput
                  style={styles.input}
                  value={contactPhone}
                  onChangeText={setContactPhone}
                  keyboardType="phone-pad"
                />

                <TouchableOpacity
                  style={styles.submitQuoteBtn}
                  onPress={handleSubmitQuote}
                  activeOpacity={0.85}
                >
                  <Ionicons name="paper-plane" size={16} color="#FFFFFF" />
                  <Text style={styles.submitQuoteBtnText}>Request On-Site Inspection &amp; Quote</Text>
                </TouchableOpacity>
              </ScrollView>
            ) : (
              /* Confirmation Ticket */
              <View style={{ alignItems: 'center', paddingVertical: 14 }}>
                <View style={styles.successIconCircle}>
                  <Ionicons name="checkmark" size={32} color="#FFFFFF" />
                </View>
                <Text style={styles.confirmedTitle}>Inspection Request Registered!</Text>
                <Text style={styles.confirmedTicket}>Ticket #{confirmedRequest.id}</Text>
                <Text style={styles.confirmedDesc}>
                  Community Head <Text style={{ fontWeight: '800' }}>{selectedCoop.head_name}</Text> from {selectedCoop.name} will contact you shortly to confirm the on-site inspection.
                </Text>

                <View style={styles.confirmedDetailsCard}>
                  <Text style={styles.detailRow}>🏢 <Text style={{ fontWeight: '700' }}>Society:</Text> {confirmedRequest.society_name}</Text>
                  <Text style={styles.detailRow}>🔧 <Text style={{ fontWeight: '700' }}>Service:</Text> {confirmedRequest.service_title}</Text>
                  <Text style={styles.detailRow}>📅 <Text style={{ fontWeight: '700' }}>Target Date:</Text> {confirmedRequest.target_date}</Text>
                </View>

                <TouchableOpacity
                  style={styles.submitQuoteBtn}
                  onPress={() => setQuoteModalVisible(false)}
                >
                  <Text style={styles.submitQuoteBtnText}>Done</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* Simulated Call Modal */}
      <Modal visible={callModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { alignItems: 'center', paddingVertical: 24 }]}>
            <View style={styles.callRingCircle}>
              <Ionicons name="call" size={36} color="#FFFFFF" />
            </View>
            <Text style={styles.callingTitle}>Calling Cooperative Federation Head</Text>
            <Text style={styles.callingName}>{selectedCoop.head_name}</Text>
            <Text style={styles.callingDesignation}>{selectedCoop.head_designation}</Text>
            <Text style={styles.callingNumber}>{selectedCoop.phone}</Text>

            <View style={styles.callingSafetyBadge}>
              <Ionicons name="shield-checkmark" size={14} color={colors.successDark} />
              <Text style={styles.callingSafetyText}>Official Verified Cooperative Line</Text>
            </View>

            <TouchableOpacity
              style={styles.endCallBtn}
              onPress={() => setCallModalVisible(false)}
            >
              <Ionicons name="call" size={18} color="#FFFFFF" style={{ transform: [{ rotate: '135deg' }] }} />
              <Text style={styles.endCallText}>End Call</Text>
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
  heroCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16
  },
  heroIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: colors.primarySubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12
  },
  heroTextCol: {
    flex: 1
  },
  heroBadge: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 0.5
  },
  heroTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
    marginTop: 2
  },
  heroSub: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
    lineHeight: 15
  },
  coopCard: {
    backgroundColor: colors.surface,
    borderRadius: 22,
    padding: 18,
    borderWidth: 1.5,
    borderColor: colors.primaryLight,
    marginBottom: 20
  },
  coopHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12
  },
  coopAvatarBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.primarySubtle,
    alignItems: 'center',
    justifyContent: 'center'
  },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  coopName: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textPrimary
  },
  regNoText: {
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 1
  },
  headProfileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 16,
    padding: 12,
    marginBottom: 12
  },
  headPhoto: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: colors.border,
    marginRight: 12
  },
  headInfoCol: {
    flex: 1
  },
  headLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 0.5
  },
  headName: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textPrimary,
    marginTop: 1
  },
  headDesignation: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 1
  },
  fleetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4
  },
  fleetText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.successDark,
    marginLeft: 3
  },
  dot: {
    marginHorizontal: 4,
    color: colors.textMuted
  },
  contactDetailsBox: {
    gap: 4,
    marginBottom: 14
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  contactText: {
    fontSize: 11,
    color: colors.textSecondary,
    marginLeft: 6,
    flex: 1
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 10
  },
  callBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.success,
    paddingVertical: 12,
    borderRadius: 12
  },
  callBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
    marginLeft: 4
  },
  quoteBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primarySubtle,
    borderWidth: 1.5,
    borderColor: colors.primaryLight,
    paddingVertical: 12,
    borderRadius: 12
  },
  quoteBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.primary,
    marginLeft: 4
  },
  sectionHeader: {
    marginBottom: 12
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textPrimary
  },
  sectionSub: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2
  },
  servicesGrid: {
    gap: 12
  },
  serviceCard: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border
  },
  serviceTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  serviceIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.primarySubtle,
    alignItems: 'center',
    justifyContent: 'center'
  },
  capacityBadge: {
    backgroundColor: colors.surfaceSecondary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border
  },
  capacityText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textSecondary
  },
  serviceTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary
  },
  serviceDesc: {
    fontSize: 11,
    color: colors.textSecondary,
    lineHeight: 16,
    marginTop: 4
  },
  serviceBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight
  },
  priceEstimate: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.primary
  },
  bookBulkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8
  },
  bookBulkBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
    marginRight: 4
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    paddingHorizontal: 18
  },
  modalCard: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 20,
    maxHeight: '90%'
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary
  },
  modalSub: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '700',
    marginTop: 2
  },
  calcLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 6
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12
  },
  calcChip: {
    backgroundColor: colors.surfaceSecondary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border
  },
  calcChipActive: {
    backgroundColor: colors.primarySubtle,
    borderColor: colors.primary
  },
  calcChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary
  },
  calcChipTextActive: {
    color: colors.primary,
    fontWeight: '800'
  },
  calcResultCard: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 14
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10
  },
  metricItem: {
    alignItems: 'center',
    flex: 1
  },
  metricItemVal: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.textPrimary,
    marginTop: 2
  },
  metricItemLabel: {
    fontSize: 9,
    color: colors.textSecondary
  },
  calcCostBanner: {
    backgroundColor: colors.primarySubtle,
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primaryLight
  },
  calcCostLabel: {
    fontSize: 8,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 0.5
  },
  calcCostVal: {
    fontSize: 16,
    fontWeight: '900',
    color: colors.primary,
    marginTop: 1
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
    marginTop: 6
  },
  input: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 13,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.border
  },
  submitQuoteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 16
  },
  submitQuoteBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
    marginLeft: 6
  },
  successIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10
  },
  confirmedTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.textPrimary
  },
  confirmedTicket: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.primary,
    marginTop: 2
  },
  confirmedDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    marginVertical: 10,
    lineHeight: 17
  },
  confirmedDetailsCard: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 12,
    padding: 12,
    width: '100%',
    marginVertical: 10,
    gap: 6
  },
  detailRow: {
    fontSize: 12,
    color: colors.textPrimary
  },
  callRingCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14
  },
  callingTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary
  },
  callingName: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
    marginTop: 4
  },
  callingDesignation: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600'
  },
  callingNumber: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
    marginTop: 8
  },
  callingSafetyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.successLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 12
  },
  callingSafetyText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.successDark,
    marginLeft: 4
  },
  endCallBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.danger,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 14,
    marginTop: 20
  },
  endCallText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
    marginLeft: 6
  }
});

export default Screen18_CommunityScreen;
