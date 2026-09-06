import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { workerTypes } from '../data/workerTypes';
import { useWorker } from '../context/WorkerContext';

export const Screen05_CertificationCheck = ({ navigation }) => {
  const { updateWorker, t } = useWorker();
  const [selectedTrade, setSelectedTrade] = useState('electrician');

  const handleCertified = async () => {
    await updateWorker({ tradeType: selectedTrade, isCertified: true });
    navigation.navigate('UploadCertificates');
  };

  const handleNotCertified = async () => {
    await updateWorker({ tradeType: selectedTrade, isCertified: false });
    navigation.navigate('AssessmentToken');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>

        <View style={styles.header}>
          <View style={styles.iconCircle}>
            <Ionicons name="ribbon" size={28} color={colors.primary} />
          </View>
          <Text style={styles.title}>{t('certCheckTitle', 'Your Trade & Certification')}</Text>
          <Text style={styles.subtitle}>{t('certCheckSub', 'Select your primary trade and tell us about your certification status.')}</Text>
        </View>

        <Text style={styles.sectionLabel}>{t('selectTrade', 'Select Your Primary Trade')}</Text>
        <View style={styles.tradeGrid}>
          {workerTypes.map((w) => (
            <TouchableOpacity
              key={w.id}
              style={[styles.tradeCard, selectedTrade === w.id && styles.tradeCardSelected]}
              onPress={() => setSelectedTrade(w.id)}
              activeOpacity={0.8}
            >
              {selectedTrade === w.id && (
                <View style={styles.tradeBadge}>
                  <Ionicons name="checkmark" size={10} color={colors.textInverse} />
                </View>
              )}
              <View style={[styles.tradeIcon, { backgroundColor: w.color + '20' }]}>
                <Ionicons name={w.icon} size={22} color={w.color} />
              </View>
              <Text style={[styles.tradeLabel, selectedTrade === w.id && styles.tradeLabelSelected]}>
                {t(`trade${w.id.charAt(0).toUpperCase() + w.id.slice(1)}`, w.label)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.questionText}>{t('certCheckTitle', 'Are you certified in your trade?')}</Text>
        <Text style={styles.questionSubtext}>
          A formal certification means you have completed an ITI, NSDC, or recognized cooperative training program.
        </Text>

        <TouchableOpacity style={styles.certifiedBtn} onPress={handleCertified} activeOpacity={0.85}>
          <View style={styles.certifiedBtnIcon}>
            <Ionicons name="checkmark-circle" size={28} color={colors.success} />
          </View>
          <View style={styles.certifiedBtnContent}>
            <Text style={styles.certifiedBtnTitle}>{t('hasCertificate', 'Yes, I am Certified')}</Text>
            <Text style={styles.certifiedBtnSubtitle}>{t('uploadCertBtn', 'Upload your trade certificate for verification')}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.notCertifiedBtn} onPress={handleNotCertified} activeOpacity={0.85}>
          <View style={styles.certifiedBtnIcon}>
            <Ionicons name="school" size={28} color={colors.warning} />
          </View>
          <View style={styles.certifiedBtnContent}>
            <Text style={styles.notCertifiedBtnTitle}>{t('noCertificate', 'No, I Need Assessment')}</Text>
            <Text style={styles.notCertifiedBtnSubtitle}>{t('getAssessmentToken', 'Get a practical assessment token assigned by the cooperative')}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
        </TouchableOpacity>

        <View style={styles.infoBox}>
          <Ionicons name="information-circle-outline" size={16} color={colors.primary} />
          <Text style={styles.infoText}>
            Both paths lead to full worker verification. Certified workers get faster approval; assessment workers are scheduled for a practical test.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 30 },
  back: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: colors.border, marginBottom: 20,
  },
  header: { marginBottom: 24 },
  iconCircle: {
    width: 56, height: 56, borderRadius: 18, backgroundColor: colors.primarySubtle,
    alignItems: 'center', justifyContent: 'center', marginBottom: 14,
  },
  title: { fontSize: 22, fontWeight: '800', color: colors.textPrimary },
  subtitle: { fontSize: 13, color: colors.textSecondary, marginTop: 6, lineHeight: 18 },
  sectionLabel: { fontSize: 14, fontWeight: '700', color: colors.textPrimary, marginBottom: 12 },
  tradeGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 24 },
  tradeCard: {
    width: '31%', backgroundColor: colors.surface, borderRadius: 14, padding: 12,
    alignItems: 'center', borderWidth: 1.5, borderColor: colors.border, marginBottom: 10,
    position: 'relative',
  },
  tradeCardSelected: { borderColor: colors.primary, backgroundColor: colors.primarySubtle },
  tradeBadge: {
    position: 'absolute', top: 6, right: 6, width: 18, height: 18,
    borderRadius: 9, backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  tradeIcon: { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  tradeLabel: { fontSize: 11, fontWeight: '600', color: colors.textSecondary, textAlign: 'center' },
  tradeLabelSelected: { color: colors.primary, fontWeight: '700' },
  questionText: { fontSize: 18, fontWeight: '700', color: colors.textPrimary, marginBottom: 6 },
  questionSubtext: { fontSize: 13, color: colors.textSecondary, lineHeight: 18, marginBottom: 20 },
  certifiedBtn: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface,
    borderRadius: 18, padding: 16, marginBottom: 12,
    borderWidth: 2, borderColor: colors.success,
    shadowColor: colors.success, shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1, shadowRadius: 6, elevation: 2,
  },
  certifiedBtnIcon: { marginRight: 14 },
  certifiedBtnContent: { flex: 1 },
  certifiedBtnTitle: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  certifiedBtnSubtitle: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  notCertifiedBtn: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface,
    borderRadius: 18, padding: 16, marginBottom: 20,
    borderWidth: 2, borderColor: colors.warning,
    shadowColor: colors.warning, shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1, shadowRadius: 6, elevation: 2,
  },
  notCertifiedBtnTitle: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  notCertifiedBtnSubtitle: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  infoBox: {
    flexDirection: 'row', backgroundColor: colors.primarySubtle,
    borderRadius: 14, padding: 12, borderWidth: 1, borderColor: colors.border,
  },
  infoText: { fontSize: 12, color: colors.textSecondary, marginLeft: 8, flex: 1, lineHeight: 17 },
});

export default Screen05_CertificationCheck;
