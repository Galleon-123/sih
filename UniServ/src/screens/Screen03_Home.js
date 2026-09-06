import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useUser } from '../context/UserContext';
import { useBooking } from '../context/BookingContext';
import Header from '../components/Header';
import ServiceCard from '../components/ServiceCard';
import LanguageSelectorModal from '../components/LanguageSelectorModal';
import servicesData from '../data/services.json';

export const Screen03_Home = ({ navigation }) => {
  const { user, language, setLanguage, updateUserProfile, t } = useUser();
  const { createBooking } = useBooking();

  const [searchQuery, setSearchQuery] = useState('');
  const [langModalVisible, setLangModalVisible] = useState(false);
  const [addressModalVisible, setAddressModalVisible] = useState(false);
  const [sosModalVisible, setSosModalVisible] = useState(false);
  const [editableAddress, setEditableAddress] = useState(user?.address || '');

  // Emergency SOS categories (Removed gas leak as requested)
  const SOS_CATEGORIES = [
    { id: 'sos1', title: t('sosPlumbing'), icon: 'water', serviceId: 's1', color: colors.primary },
    { id: 'sos2', title: t('sosElectrical'), icon: 'flash', serviceId: 's2', color: colors.warningDark },
    { id: 'sos3', title: t('sosLocksmith'), icon: 'key', serviceId: 's4', color: colors.cooperativePurple }
  ];

  // Keyword to service matching
  const KEYWORD_MAP = {
    tap: 's1',
    leak: 's1',
    plumb: 's1',
    pipe: 's1',
    flush: 's1',
    water: 's1',
    socket: 's2',
    electric: 's2',
    mcb: 's2',
    wire: 's2',
    light: 's2',
    fan: 's2',
    power: 's2',
    clean: 's3',
    dust: 's3',
    wash: 's3',
    sweep: 's3',
    wood: 's4',
    carpenter: 's4',
    door: 's4',
    table: 's4',
    lock: 's4',
    hinge: 's4',
    paint: 's5',
    wall: 's5',
    color: 's5',
    care: 's6',
    elder: 's6',
    nurse: 's6',
    patient: 's6',
    ac: 's7',
    fridge: 's7',
    machine: 's7',
    appliance: 's7',
    technician: 's7',
    tech: 's7',
    motor: 's7',
    inverter: 's7',
    tv: 's7',
    microwave: 's7',
    domestic: 's8',
    maid: 's8',
    cook: 's8',
    help: 's8',
    dish: 's8',
    vessel: 's8',
    househelp: 's8',
    laundry: 's8',
    driver: 's9',
    drive: 's9',
    car: 's9',
    chauffeur: 's9',
    trip: 's9',
    valet: 's9',
    garden: 's10',
    gardener: 's10',
    plant: 's10',
    lawn: 's10',
    grass: 's10',
    pot: 's10',
    prun: 's10',
    tree: 's10'
  };

  const filteredServices = servicesData.filter((service) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;

    if (service.name.toLowerCase().includes(q) || service.description.toLowerCase().includes(q)) {
      return true;
    }

    for (const [kw, serviceId] of Object.entries(KEYWORD_MAP)) {
      if (q.includes(kw) && service.id === serviceId) {
        return true;
      }
    }
    return false;
  });

  const handleSelectService = (service) => {
    navigation.navigate('ServiceDetail', { service });
  };

  const handleSelectSosCategory = (sosItem) => {
    setSosModalVisible(false);
    const targetService = servicesData.find((s) => s.id === sosItem.serviceId) || servicesData[0];
    navigation.navigate('BookingForm', {
      service: targetService,
      bookingType: 'emergency',
      emergencyIssue: sosItem.title
    });
  };

  const handleSaveAddress = () => {
    updateUserProfile({ address: editableAddress });
    setAddressModalVisible(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Universal Top Header */}
      <Header
        onLocationPress={() => {
          setEditableAddress(user?.address || '');
          setAddressModalVisible(true);
        }}
        onLanguagePress={() => setLangModalVisible(true)}
        onEmergencyPress={() => setSosModalVisible(true)}
        showEmergency={true}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Emergency Assistance Hero Banner */}
        <TouchableOpacity
          style={styles.emergencyHero}
          onPress={() => setSosModalVisible(true)}
          activeOpacity={0.85}
        >
          <View style={styles.emergencyLeft}>
            <View style={styles.emergencyTag}>
              <Ionicons name="flash" size={12} color="#FFFFFF" />
              <Text style={styles.emergencyTagText}>{t('urgentDispatch')}</Text>
            </View>
            <Text style={styles.emergencyTitle}>Need Fast Emergency Help?</Text>
            <Text style={styles.emergencySubtitle}>
              On-call certified plumbers & electricians arriving in &lt; 15 mins.
            </Text>
          </View>
          <View style={styles.emergencyActionBtn}>
            <Ionicons name="shield-alert" size={16} color={colors.danger} />
            <Text style={styles.emergencyActionText}>Book SOS</Text>
          </View>
        </TouchableOpacity>

        {/* Community & Society Bulk Services Banner (NEW FEATURE) */}
        <TouchableOpacity
          style={styles.communityBanner}
          onPress={() => navigation.navigate('Community')}
          activeOpacity={0.85}
        >
          <View style={styles.communityLeft}>
            <View style={styles.communityIconCircle}>
              <Ionicons name="business" size={24} color="#FFFFFF" />
            </View>
            <View style={styles.communityTextCol}>
              <View style={styles.communityBadgeRow}>
                <Text style={styles.communityBadge}>HOUSING SOCIETY & RWA HUB</Text>
                <View style={styles.ncctPill}>
                  <Text style={styles.ncctPillText}>NCCT Verified</Text>
                </View>
              </View>
              <Text style={styles.communityTitle}>Community & Bulk Services</Text>
              <Text style={styles.communityDesc}>
                Water tank cleaning, society electrical audit, solar washing & large artisan teams.
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.primary} />
        </TouchableOpacity>

        {/* Search Bar */}
        <View style={styles.searchBox}>
          <Ionicons name="search" size={20} color={colors.primary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder={t('searchPlaceholder')}
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            clearButtonMode="while-editing"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        {/* Section Heading */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t('allServices')}</Text>
          <Text style={styles.sectionSubtitle}>{t('standardRates')}</Text>
        </View>

        {/* Services Grid (2 Columns) */}
        {filteredServices.length === 0 ? (
          <View style={styles.emptySearch}>
            <Ionicons name="search-outline" size={40} color={colors.textMuted} />
            <Text style={styles.emptyTitle}>No matching services found</Text>
            <Text style={styles.emptySub}>Try searching "tap", "electrician", "cleaning", or "carpenter"</Text>
          </View>
        ) : (
          <View style={styles.grid}>
            {filteredServices.map((service) => (
              <View key={service.id} style={styles.gridItem}>
                <ServiceCard service={service} onPress={handleSelectService} />
              </View>
            ))}
          </View>
        )}

        {/* Seva Suraksha Guarantee Hub Banner */}
        <TouchableOpacity
          style={styles.sevaBanner}
          onPress={() => navigation.navigate('SevaSuraksha')}
          activeOpacity={0.85}
        >
          <View style={styles.sevaLeft}>
            <View style={styles.shieldIconCircle}>
              <Ionicons name="shield-checkmark" size={24} color="#FFFFFF" />
            </View>
            <View style={styles.sevaTextCol}>
              <Text style={styles.sevaTitle}>{t('sevaSurakshaPolicy')}</Text>
              <Text style={styles.sevaDesc}>{t('sevaSurakshaSub')}</Text>
            </View>
          </View>
          <Ionicons name="arrow-forward-circle" size={24} color={colors.primary} />
        </TouchableOpacity>

        {/* Cooperative Fair Wage Promise */}
        <View style={styles.fairPromiseCard}>
          <View style={styles.fairIconCircle}>
            <Ionicons name="heart-circle" size={26} color={colors.success} />
          </View>
          <View style={styles.fairTextCol}>
            <Text style={styles.fairTitle}>80% Worker Wage Guarantee</Text>
            <Text style={styles.fairDesc}>
              Unlike private platforms taking 30–40% commission cuts, UniServ directs 80% directly into artisan cooperative accounts.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* SOS Emergency Category Selection Modal */}
      <Modal visible={sosModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.sosModalCard}>
            <View style={styles.sosModalHeader}>
              <View style={styles.sosHeaderIcon}>
                <Ionicons name="flash" size={22} color="#FFFFFF" />
              </View>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.sosModalTitle}>{t('emergencySosTitle')}</Text>
                <Text style={styles.sosModalSub}>{t('emergencySosSubtitle')}</Text>
              </View>
              <TouchableOpacity onPress={() => setSosModalVisible(false)} style={styles.closeBtn}>
                <Ionicons name="close" size={22} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.sosGrid}>
              {SOS_CATEGORIES.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.sosOptionCard}
                  onPress={() => handleSelectSosCategory(item)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.sosIconBox, { backgroundColor: item.color + '15' }]}>
                    <Ionicons name={item.icon} size={24} color={item.color} />
                  </View>
                  <Text style={styles.sosOptionTitle}>{item.title}</Text>
                  <View style={styles.sosBadge}>
                    <Text style={styles.sosBadgeText}>&lt; 15 mins dispatch • +₹100</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Address Modal */}
      <Modal visible={addressModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.addressModalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Change Service Location</Text>
              <TouchableOpacity onPress={() => setAddressModalVisible(false)}>
                <Ionicons name="close" size={22} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.addressInput}
              value={editableAddress}
              onChangeText={setEditableAddress}
              placeholder="Enter full street address"
              multiline
              numberOfLines={3}
            />
            <TouchableOpacity style={styles.saveAddressBtn} onPress={handleSaveAddress}>
              <Text style={styles.saveAddressBtnText}>Update Address</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Language Selector Modal */}
      <LanguageSelectorModal
        visible={langModalVisible}
        onClose={() => setLangModalVisible(false)}
        currentLanguage={language}
        onSelectLanguage={(l) => setLanguage(l)}
      />
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
    paddingBottom: 30
  },
  emergencyHero: {
    backgroundColor: colors.dangerDark,
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    shadowColor: colors.danger,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4
  },
  emergencyLeft: {
    flex: 1,
    marginRight: 12
  },
  emergencyTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 6
  },
  emergencyTagText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    marginLeft: 4,
    letterSpacing: 0.5
  },
  emergencyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 2
  },
  emergencySubtitle: {
    fontSize: 11,
    color: '#FEE2E2',
    lineHeight: 15
  },
  emergencyActionBtn: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10
  },
  emergencyActionText: {
    color: colors.danger,
    fontSize: 12,
    fontWeight: '800',
    marginLeft: 4
  },
  communityBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.primarySubtle,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1.5,
    borderColor: colors.primaryLight,
    marginBottom: 14
  },
  communityLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8
  },
  communityIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12
  },
  communityTextCol: {
    flex: 1
  },
  communityBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2
  },
  communityBadge: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 0.5
  },
  ncctPill: {
    backgroundColor: colors.successLight,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
    marginLeft: 6
  },
  ncctPillText: {
    fontSize: 8,
    fontWeight: '800',
    color: colors.successDark
  },
  communityTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textPrimary
  },
  communityDesc: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 1,
    lineHeight: 14
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 48,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 18,
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2
  },
  searchIcon: {
    marginRight: 10
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: colors.textPrimary,
    fontWeight: '500'
  },
  sectionHeader: {
    marginBottom: 12
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary
  },
  sectionSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 1
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16
  },
  gridItem: {
    width: '48%',
    marginBottom: 12
  },
  emptySearch: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 36,
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 8
  },
  emptySub: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2
  },
  sevaBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1.5,
    borderColor: colors.primaryLight,
    marginBottom: 12,
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2
  },
  sevaLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10
  },
  shieldIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12
  },
  sevaTextCol: {
    flex: 1
  },
  sevaTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textPrimary
  },
  sevaDesc: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
    lineHeight: 15
  },
  fairPromiseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.successLight,
    borderRadius: 16,
    padding: 14,
    marginBottom: 20
  },
  fairIconCircle: {
    marginRight: 10
  },
  fairTextCol: {
    flex: 1
  },
  fairTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.successDark
  },
  fairDesc: {
    fontSize: 11,
    color: colors.successDark,
    marginTop: 2,
    lineHeight: 15
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    paddingHorizontal: 20
  },
  sosModalCard: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 20
  },
  sosModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18
  },
  sosHeaderIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.danger,
    alignItems: 'center',
    justifyContent: 'center'
  },
  sosModalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary
  },
  sosModalSub: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 1
  },
  closeBtn: {
    padding: 4
  },
  sosGrid: {
    gap: 10
  },
  sosOptionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border
  },
  sosIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12
  },
  sosOptionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
    flex: 1
  },
  sosBadge: {
    backgroundColor: colors.dangerLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6
  },
  sosBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.danger
  },
  addressModalCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 20
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary
  },
  addressInput: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 12,
    padding: 12,
    fontSize: 13,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 70,
    marginBottom: 14
  },
  saveAddressBtn: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center'
  },
  saveAddressBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF'
  }
});

export default Screen03_Home;
