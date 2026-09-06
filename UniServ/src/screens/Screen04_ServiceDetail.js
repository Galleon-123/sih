import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useUser } from '../context/UserContext';
import Header from '../components/Header';

export const Screen04_ServiceDetail = ({ route, navigation }) => {
  const { service } = route.params || {};
  const { t } = useUser();

  const hasWarranty = service?.has_seva_suraksha !== false;

  const handleBookNow = () => {
    navigation.navigate('BookingForm', { service, bookingType: 'now' });
  };

  const handleSchedule = () => {
    navigation.navigate('BookingForm', { service, bookingType: 'scheduled' });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title={service?.name || 'Service Detail'}
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Service Hero Card */}
        <View style={styles.heroCard}>
          <View style={styles.heroTop}>
            <View style={styles.iconCircle}>
              <Text style={styles.serviceEmoji}>{service?.icon || '🔧'}</Text>
            </View>
            <View style={styles.heroTitleCol}>
              <Text style={styles.serviceName}>{service?.name}</Text>
              <View style={styles.metaRow}>
                <View style={styles.ratingBadge}>
                  <Ionicons name="star" size={12} color="#F59E0B" />
                  <Text style={styles.ratingText}>4.8</Text>
                  <Text style={styles.ratingCount}>(1.2k+ jobs)</Text>
                </View>
                <Text style={styles.metaDot}>•</Text>
                <Text style={styles.durationText}>{service?.duration || '30-45 mins'}</Text>
              </View>
            </View>
          </View>

          <Text style={styles.serviceDesc}>{service?.description}</Text>

          {/* Pricing Box */}
          <View style={styles.pricingBox}>
            <View>
              <Text style={styles.pricingLabel}>{t('standardBaseRate')}</Text>
              <Text style={styles.pricingSub}>{t('fixedPricing')}</Text>
            </View>
            <Text style={styles.pricingAmount}>₹{service?.start_price || 99}</Text>
          </View>
        </View>

        {/* What's Included */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>{t('whatsIncluded')}</Text>
          <View style={styles.checklist}>
            {(service?.included || [
              'Complete inspection & issue diagnosis',
              'Labour for minor repairs and tightening',
              'Post-repair testing',
              hasWarranty ? '7-Day Seva Suraksha warranty protection' : 'Eco-friendly post-service cleanup'
            ]).map((item, index) => (
              <View key={index} style={styles.checkRow}>
                <Ionicons name="checkmark-circle" size={18} color={colors.success} />
                <Text style={styles.checkText}>{item}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Step-by-Step Process */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>{t('stepByStep')}</Text>
          <View style={styles.stepsList}>
            {(service?.sample_steps || [
              'Artisan arrives at your doorstep with toolkit and verified ID.',
              'Share Start OTP handshake to authorize work.',
              'Artisan completes service with genuine supplies.',
              'Inspect completed work, share Completion OTP, and settle invoice.'
            ]).map((step, index) => (
              <View key={index} style={styles.stepRow}>
                <View style={styles.stepNumCircle}>
                  <Text style={styles.stepNumText}>{index + 1}</Text>
                </View>
                <Text style={styles.stepText}>{step}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Safety & Protocol */}
        <View style={styles.sectionCard}>
          <View style={styles.safetyHeader}>
            <Ionicons name="shield" size={18} color={colors.primary} />
            <Text style={styles.safetyTitle}>{t('safetyProtocol')}</Text>
          </View>
          <Text style={styles.safetyDesc}>
            {service?.safety_note || 'All artisans carry registered cooperative ID and follow certified safety guidelines.'}
          </Text>
        </View>

        {/* Conditional Cooperative Guarantee Card */}
        {hasWarranty ? (
          <View style={styles.coopAssuranceCard}>
            <Ionicons name="shield-checkmark" size={20} color={colors.success} />
            <View style={styles.coopAssuranceTextCol}>
              <Text style={styles.coopAssuranceTitle}>{t('coopAssurance')} (Seva Suraksha)</Text>
              <Text style={styles.coopAssuranceDesc}>
                Includes 7-day free rework warranty. Standard rate card fixed by Government Registered Cooperative Society.
              </Text>
            </View>
          </View>
        ) : (
          <View style={[styles.coopAssuranceCard, { backgroundColor: colors.primarySubtle }]}>
            <Ionicons name="people" size={20} color={colors.primary} />
            <View style={styles.coopAssuranceTextCol}>
              <Text style={[styles.coopAssuranceTitle, { color: colors.primary }]}>{t('coopAssurance')}</Text>
              <Text style={[styles.coopAssuranceDesc, { color: colors.primaryText }]}>
                Standardized fair wages fixed by local Women/Labour Cooperative. 80% direct artisan compensation.
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Sticky Bottom Action Buttons */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.scheduleBtn} onPress={handleSchedule} activeOpacity={0.8}>
          <Ionicons name="calendar-outline" size={16} color={colors.primary} />
          <Text style={styles.scheduleBtnText}>{t('scheduleLater')}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.bookNowBtn} onPress={handleBookNow} activeOpacity={0.85}>
          <Text style={styles.bookNowBtnText}>{t('bookNow')} • ₹{service?.start_price || 99}</Text>
          <Ionicons name="arrow-forward" size={16} color="#FFFFFF" style={{ marginLeft: 4 }} />
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
    paddingBottom: 90
  },
  heroCard: {
    backgroundColor: colors.surface,
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 14,
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12
  },
  iconCircle: {
    width: 54,
    height: 54,
    borderRadius: 16,
    backgroundColor: colors.primarySubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12
  },
  serviceEmoji: {
    fontSize: 26
  },
  heroTitleCol: {
    flex: 1
  },
  serviceName: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.warningLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6
  },
  ratingText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.warningDark,
    marginLeft: 3
  },
  ratingCount: {
    fontSize: 10,
    color: colors.textSecondary,
    marginLeft: 2
  },
  metaDot: {
    marginHorizontal: 6,
    color: colors.textMuted
  },
  durationText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600'
  },
  serviceDesc: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: 14
  },
  pricingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceSecondary,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border
  },
  pricingLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary
  },
  pricingSub: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 1
  },
  pricingAmount: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.primary
  },
  sectionCard: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 14
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 12
  },
  checklist: {
    gap: 10
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  checkText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: 10,
    flex: 1,
    lineHeight: 16
  },
  stepsList: {
    gap: 12
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start'
  },
  stepNumCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.primarySubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    marginTop: 1
  },
  stepNumText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.primary
  },
  stepText: {
    fontSize: 12,
    color: colors.textSecondary,
    flex: 1,
    lineHeight: 16
  },
  safetyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6
  },
  safetyTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.primary,
    marginLeft: 6
  },
  safetyDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 16
  },
  coopAssuranceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.successLight,
    padding: 14,
    borderRadius: 16,
    marginBottom: 10
  },
  coopAssuranceTextCol: {
    marginLeft: 10,
    flex: 1
  },
  coopAssuranceTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.successDark
  },
  coopAssuranceDesc: {
    fontSize: 11,
    color: colors.successDark,
    marginTop: 1,
    lineHeight: 15
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    flexDirection: 'row',
    gap: 10
  },
  scheduleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.primaryLight
  },
  scheduleBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
    marginLeft: 4
  },
  bookNowBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 14,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3
  },
  bookNowBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF'
  }
});

export default Screen04_ServiceDetail;
