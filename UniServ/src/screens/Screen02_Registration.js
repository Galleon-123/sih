import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useUser } from '../context/UserContext';
import Header from '../components/Header';

export const Screen02_Registration = ({ route, navigation }) => {
  const { user, registerUser, t } = useUser();
  const phone = route.params?.phone || user?.phone || '9876543210';

  const [name, setName] = useState(user?.name || 'Priya Sharma');
  const [email, setEmail] = useState(user?.email || 'priya.sharma@example.com');
  
  // Hierarchical Address fields
  const [stateName, setStateName] = useState('Delhi');
  const [district, setDistrict] = useState('South Delhi');
  const [city, setCity] = useState('New Delhi');
  const [locality, setLocality] = useState('Block B, Lajpat Nagar');
  const [landmark, setLandmark] = useState('Near Metro Gate No. 2');
  const [house, setHouse] = useState('');
  const [pincode, setPincode] = useState('110024');
  const [addressTag, setAddressTag] = useState('Home');
  const [isGpsLoading, setIsGpsLoading] = useState(false);

  // 1-Click GPS Auto-Fill
  const handleAutoDetectGps = () => {
    setIsGpsLoading(true);
    setTimeout(() => {
      setStateName('Delhi (NCR)');
      setDistrict('South Delhi');
      setCity('New Delhi');
      setLocality('Lajpat Nagar IV, Ring Road Sector');
      setLandmark('Opposite Metro Station Gate 2');
      setPincode('110024');
      setIsGpsLoading(false);
      Alert.alert(
        'GPS Location Detected 📍',
        'State, district, city and street filled automatically. Please enter your Flat / House / Door number.'
      );
    }, 800);
  };

  const handleSaveProfile = async () => {
    if (!name.trim()) {
      Alert.alert('Name Required', 'Please enter your full name.');
      return;
    }
    if (!house.trim()) {
      Alert.alert('House / Door Number Needed', 'Please enter your house or flat number so the artisan reaches the exact doorstep.');
      return;
    }

    const fullAddress = `${house}, ${locality}, ${city}, ${stateName} - ${pincode}`;
    await registerUser({
      name,
      email,
      phone,
      state: stateName,
      district,
      city,
      locality,
      landmark,
      house,
      pincode,
      address: fullAddress,
      addressTag
    });

    navigation.reset({
      index: 0,
      routes: [{ name: 'MainTabs' }]
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title={t('completeProfile')}
        showBack={true}
        onBack={() => navigation.goBack()}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Header Hero */}
          <View style={styles.headerHero}>
            <View style={styles.iconCircle}>
              <Ionicons name="person-add" size={28} color={colors.primary} />
            </View>
            <Text style={styles.heading}>{t('completeProfile')}</Text>
            <Text style={styles.subheading}>{t('profileSubtext')}</Text>
          </View>

          {/* 1-Click GPS Quick Location Button */}
          <TouchableOpacity
            style={styles.gpsAutoFillBtn}
            onPress={handleAutoDetectGps}
            disabled={isGpsLoading}
            activeOpacity={0.8}
          >
            {isGpsLoading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <View style={styles.gpsRow}>
                <Ionicons name="navigate-circle" size={22} color="#FFFFFF" />
                <Text style={styles.gpsBtnText}>{t('useCurrentGps')}</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Personal Details Card */}
          <View style={styles.card}>
            <Text style={styles.cardLabel}>1. PERSONAL INFORMATION</Text>

            <Text style={styles.fieldLabel}>{t('fullName')} *</Text>
            <View style={styles.inputWrap}>
              <Ionicons name="person-outline" size={18} color={colors.primary} style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                value={name}
                onChangeText={setName}
                placeholder={t('fullNamePlaceholder')}
                placeholderTextColor={colors.textMuted}
              />
            </View>

            <Text style={[styles.fieldLabel, { marginTop: 12 }]}>{t('emailOptional')}</Text>
            <View style={styles.inputWrap}>
              <Ionicons name="mail-outline" size={18} color={colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                value={email}
                onChangeText={setEmail}
                placeholder={t('emailPlaceholder')}
                placeholderTextColor={colors.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <Text style={[styles.fieldLabel, { marginTop: 12 }]}>{t('mobileNumber')}</Text>
            <View style={[styles.inputWrap, { backgroundColor: colors.surfaceTertiary }]}>
              <Ionicons name="call-outline" size={18} color={colors.textSecondary} style={styles.inputIcon} />
              <Text style={styles.disabledPhoneText}>+91 {phone}</Text>
              <View style={styles.verifiedChip}>
                <Ionicons name="checkmark-circle" size={12} color={colors.successDark} />
                <Text style={styles.verifiedChipText}>Verified</Text>
              </View>
            </View>
          </View>

          {/* Hierarchical Service Address Card */}
          <View style={styles.card}>
            <Text style={styles.cardLabel}>2. HIERARCHICAL SERVICE ADDRESS</Text>

            {/* State & District */}
            <View style={styles.twoColRow}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={styles.fieldLabel}>{t('stateLabel')}</Text>
                <View style={styles.inputWrap}>
                  <TextInput
                    style={styles.textInput}
                    value={stateName}
                    onChangeText={setStateName}
                    placeholder="Delhi"
                    placeholderTextColor={colors.textMuted}
                  />
                </View>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.fieldLabel}>{t('districtLabel')}</Text>
                <View style={styles.inputWrap}>
                  <TextInput
                    style={styles.textInput}
                    value={district}
                    onChangeText={setDistrict}
                    placeholder="South Delhi"
                    placeholderTextColor={colors.textMuted}
                  />
                </View>
              </View>
            </View>

            {/* City & Pincode */}
            <View style={[styles.twoColRow, { marginTop: 12 }]}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={styles.fieldLabel}>{t('cityLabel')}</Text>
                <View style={styles.inputWrap}>
                  <TextInput
                    style={styles.textInput}
                    value={city}
                    onChangeText={setCity}
                    placeholder="New Delhi"
                    placeholderTextColor={colors.textMuted}
                  />
                </View>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.fieldLabel}>{t('pincodeLabel')}</Text>
                <View style={styles.inputWrap}>
                  <TextInput
                    style={styles.textInput}
                    value={pincode}
                    onChangeText={setPincode}
                    placeholder="110024"
                    keyboardType="number-pad"
                    maxLength={6}
                    placeholderTextColor={colors.textMuted}
                  />
                </View>
              </View>
            </View>

            {/* Locality & Landmark */}
            <Text style={[styles.fieldLabel, { marginTop: 12 }]}>{t('localityLabel')} *</Text>
            <View style={styles.inputWrap}>
              <Ionicons name="navigate-outline" size={18} color={colors.primary} style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                value={locality}
                onChangeText={setLocality}
                placeholder="e.g. Block B, Lajpat Nagar"
                placeholderTextColor={colors.textMuted}
              />
            </View>

            <Text style={[styles.fieldLabel, { marginTop: 12 }]}>{t('landmarkLabel')}</Text>
            <View style={styles.inputWrap}>
              <Ionicons name="flag-outline" size={18} color={colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                value={landmark}
                onChangeText={setLandmark}
                placeholder="e.g. Near Metro Gate No. 2"
                placeholderTextColor={colors.textMuted}
              />
            </View>

            {/* House / Flat (User entered) */}
            <Text style={[styles.fieldLabel, { marginTop: 12, color: colors.primary }]}>{t('flatDoorLabel')}</Text>
            <View style={[styles.inputWrap, { borderColor: colors.primaryLight, backgroundColor: colors.surface }]}>
              <Ionicons name="business-outline" size={18} color={colors.primary} style={styles.inputIcon} />
              <TextInput
                style={[styles.textInput, { fontWeight: '700' }]}
                value={house}
                onChangeText={setHouse}
                placeholder="e.g. Flat 302, Palm Heights"
                placeholderTextColor={colors.textMuted}
                autoFocus={house.length === 0}
              />
            </View>

            {/* Address Tag Selector */}
            <Text style={[styles.fieldLabel, { marginTop: 16 }]}>{t('saveAsTag')}</Text>
            <View style={styles.tagsRow}>
              {[
                { tag: 'Home', label: t('tagHome') },
                { tag: 'Work', label: t('tagWork') },
                { tag: 'Other', label: t('tagOther') }
              ].map((item) => {
                const isSelected = addressTag === item.tag;
                return (
                  <TouchableOpacity
                    key={item.tag}
                    style={[styles.tagPill, isSelected && styles.tagPillSelected]}
                    onPress={() => setAddressTag(item.tag)}
                    activeOpacity={0.75}
                  >
                    <Text style={[styles.tagPillText, isSelected && styles.tagPillTextSelected]}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Sticky Bottom Save Action */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.saveBtn}
          onPress={handleSaveProfile}
          activeOpacity={0.85}
        >
          <Text style={styles.saveBtnText}>{t('saveAndContinue')}</Text>
          <Ionicons name="arrow-forward" size={18} color="#FFFFFF" style={{ marginLeft: 6 }} />
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
    paddingTop: 16,
    paddingBottom: 90
  },
  headerHero: {
    alignItems: 'center',
    marginBottom: 16
  },
  iconCircle: {
    width: 54,
    height: 54,
    borderRadius: 18,
    backgroundColor: colors.primarySubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8
  },
  heading: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary
  },
  subheading: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 3,
    maxWidth: '90%'
  },
  gpsAutoFillBtn: {
    backgroundColor: colors.success,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: colors.success,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3
  },
  gpsRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  gpsBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
    marginLeft: 6
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2
  },
  cardLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 0.5,
    marginBottom: 12
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 6
  },
  twoColRow: {
    flexDirection: 'row'
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
    borderWidth: 1,
    borderColor: colors.border
  },
  inputIcon: {
    marginRight: 8
  },
  textInput: {
    flex: 1,
    fontSize: 13,
    color: colors.textPrimary,
    height: '100%',
    fontWeight: '500'
  },
  disabledPhoneText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary
  },
  verifiedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.successLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6
  },
  verifiedChipText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.successDark,
    marginLeft: 3
  },
  tagsRow: {
    flexDirection: 'row',
    gap: 10
  },
  tagPill: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1.5,
    borderColor: colors.border
  },
  tagPillSelected: {
    backgroundColor: colors.primarySubtle,
    borderColor: colors.primaryLight
  },
  tagPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary
  },
  tagPillTextSelected: {
    color: colors.primary,
    fontWeight: '800'
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
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 15,
    borderRadius: 16,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4
  },
  saveBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF'
  }
});

export default Screen02_Registration;
