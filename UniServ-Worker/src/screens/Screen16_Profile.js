import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useWorker } from '../context/WorkerContext';
import LANGUAGES from '../data/languages.json';

export const Screen16_Profile = ({ navigation }) => {
  const { worker, logout, language, t } = useWorker();

  const currentLangObj = LANGUAGES.find((l) => l.code === (language || worker?.language || 'en')) || LANGUAGES[0];

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
            navigation.reset({ index: 0, routes: [{ name: 'LanguageSelection' }] });
          },
        },
      ]
    );
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Ionicons
        key={i}
        name={i < Math.floor(rating) ? 'star' : i < rating ? 'star-half' : 'star-outline'}
        size={16}
        color={colors.warning}
      />
    ));
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.pageTitle}>{t('tabProfile', 'My Profile')}</Text>

        <View style={styles.profileCard}>
          <View style={styles.avatarWrap}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={40} color={colors.primary} />
            </View>
            <View style={styles.onlineBadge}>
              <View style={[styles.onlineDot, worker?.isOnline && styles.onlineDotActive]} />
            </View>
          </View>
          <Text style={styles.workerName}>{worker?.name || 'Ravi Kumar'}</Text>
          <View style={styles.tradeBadge}>
            <Ionicons name="flash" size={14} color={colors.textInverse} />
            <Text style={styles.tradeText}>{t(`trade${worker?.trade ? worker.trade.charAt(0).toUpperCase() + worker.trade.slice(1) : 'Electrician'}`, worker?.trade || 'Electrician')}</Text>
          </View>
          <View style={styles.starsRow}>
            {renderStars(worker?.rating || 4.7)}
            <Text style={styles.ratingText}>{worker?.rating || 4.7} ({worker?.jobsCompleted || 142} reviews)</Text>
          </View>
          <View style={styles.idRow}>
            <Text style={styles.idText}>{worker?.uid || 'UW-2026-001'}</Text>
            <Text style={styles.idSep}>·</Text>
            <Text style={styles.idText}>{worker?.cooperative || 'Delhi Electrical Workers Co-op'}</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{worker?.jobsCompleted || 142}</Text>
            <Text style={styles.statLabel}>{t('totalJobs', 'Total Jobs')}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>₹{((worker?.earnings?.total || 94500) / 1000).toFixed(0)}K</Text>
            <Text style={styles.statLabel}>{t('totalEarned', 'Total Earned')}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{worker?.experience || '5 years'}</Text>
            <Text style={styles.statLabel}>{t('experience', 'Experience')}</Text>
          </View>
        </View>

        <View style={styles.certSection}>
          <Text style={styles.sectionTitle}>{t('skillCertificates', 'Skill Certificates')}</Text>
          {worker?.isCertified ? (
            <View style={styles.certCard}>
              <View style={styles.certIcon}>
                <Ionicons name="ribbon" size={24} color={colors.success} />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.certName}>{t('tradeCertificate', 'Trade Certificate')}</Text>
                <Text style={styles.certIssuer}>{t('verifiedByOrganizer', 'Verified by Cooperative Organizer')}</Text>
              </View>
              <Ionicons name="checkmark-circle" size={22} color={colors.success} />
            </View>
          ) : worker?.assessmentToken ? (
            <View style={styles.assessmentCard}>
              <Ionicons name="time" size={20} color={colors.warning} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.assessmentTitle}>{t('practicalAssessment', 'Practical Assessment')}</Text>
                <Text style={styles.assessmentToken}>Token: {worker.assessmentToken}</Text>
                <Text style={styles.assessmentStatus}>{t('pendingAssessment', 'Pending assessment assignment')}</Text>
              </View>
            </View>
          ) : (
            <Text style={styles.noCerts}>{t('noCerts', 'No certificates uploaded yet.')}</Text>
          )}
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>{t('personalInfo', 'Personal Information')}</Text>
          <View style={styles.infoCard}>
            <InfoRow icon="call-outline" label={t('mobile', 'Mobile')} value={`+91 ${worker?.phone || '9811223344'}`} />
            <InfoRow icon="id-card-outline" label={t('aadhaar', 'Aadhaar')} value="XXXX XXXX 1234" />
            <InfoRow icon="business-outline" label={t('cooperative', 'Cooperative')} value={worker?.cooperative || 'Delhi Labour Co-op'} />
            <InfoRow icon="calendar-outline" label={t('memberSince', 'Member Since')} value="Sep 2026" />
            <InfoRow icon="location-outline" label={t('city', 'City')} value="New Delhi" last />
          </View>
        </View>

        <View style={styles.actionsSection}>
          <TouchableOpacity
            style={styles.languageBtnRow}
            onPress={() => navigation.navigate('LanguageSelection')}
            activeOpacity={0.8}
          >
            <View style={styles.langIconCircle}>
              <Ionicons name="language" size={18} color={colors.primary} />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.langRowTitle}>{t('appLanguage', 'App Language')} / भाषा बदलें</Text>
              <Text style={styles.langRowSub}>{currentLangObj.name} ({currentLangObj.nativeName})</Text>
            </View>
            <View style={styles.changeBadge}>
              <Text style={styles.changeBadgeText}>{t('changeLanguage', 'Change')}</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.editBtn} activeOpacity={0.85}>
            <Ionicons name="pencil-outline" size={18} color={colors.textInverse} />
            <Text style={styles.editBtnText}>{t('editProfile', 'Edit Profile')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingsRow} activeOpacity={0.7}>
            <Ionicons name="settings-outline" size={18} color={colors.textSecondary} />
            <Text style={styles.settingsText}>{t('settings', 'Settings')}</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingsRow} activeOpacity={0.7}>
            <Ionicons name="help-circle-outline" size={18} color={colors.textSecondary} />
            <Text style={styles.settingsText}>{t('helpSupport', 'Help & Support')}</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingsRow} activeOpacity={0.7}>
            <Ionicons name="document-text-outline" size={18} color={colors.textSecondary} />
            <Text style={styles.settingsText}>{t('termsPrivacy', 'Terms & Privacy')}</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.85}>
            <Ionicons name="log-out-outline" size={18} color={colors.danger} />
            <Text style={styles.logoutBtnText}>{t('logout', 'Logout')}</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.versionText}>{t('mscsCompliant', 'UniServ Worker v1.0.0 · Ministry of Cooperation')}</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const InfoRow = ({ icon, label, value, last }) => (
  <View style={[styles.infoRow, !last && styles.infoRowBorder]}>
    <Ionicons name={icon} size={16} color={colors.textMuted} />
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 },
  pageTitle: { fontSize: 22, fontWeight: '800', color: colors.textPrimary, marginBottom: 20 },
  profileCard: {
    backgroundColor: colors.surface, borderRadius: 24, padding: 24,
    alignItems: 'center', borderWidth: 1, borderColor: colors.border, marginBottom: 16,
    shadowColor: colors.shadowColor, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04, shadowRadius: 8, elevation: 2,
  },
  avatarWrap: { position: 'relative', marginBottom: 14 },
  avatar: {
    width: 80, height: 80, borderRadius: 40, backgroundColor: colors.primarySubtle,
    alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: colors.primary,
  },
  onlineBadge: {
    position: 'absolute', bottom: 2, right: 2, width: 20, height: 20,
    borderRadius: 10, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center',
  },
  onlineDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: colors.border },
  onlineDotActive: { backgroundColor: colors.success },
  workerName: { fontSize: 22, fontWeight: '800', color: colors.textPrimary, marginBottom: 8 },
  tradeBadge: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.primary,
    borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6, gap: 5, marginBottom: 10,
  },
  tradeText: { fontSize: 13, fontWeight: '700', color: colors.textInverse },
  starsRow: { flexDirection: 'row', alignItems: 'center', gap: 2, marginBottom: 8 },
  ratingText: { fontSize: 13, color: colors.textSecondary, fontWeight: '600', marginLeft: 6 },
  idRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  idText: { fontSize: 11, color: colors.textMuted, fontWeight: '600' },
  idSep: { fontSize: 11, color: colors.textMuted },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  statCard: {
    flex: 1, backgroundColor: colors.surface, borderRadius: 16, padding: 14,
    alignItems: 'center', borderWidth: 1, borderColor: colors.border, marginHorizontal: 3,
  },
  statValue: { fontSize: 18, fontWeight: '800', color: colors.textPrimary },
  statLabel: { fontSize: 10, color: colors.textMuted, fontWeight: '700', marginTop: 2, textAlign: 'center' },
  certSection: { marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.textPrimary, marginBottom: 12 },
  certCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.successLight,
    borderRadius: 16, padding: 14, borderWidth: 1, borderColor: colors.success,
  },
  certIcon: {
    width: 44, height: 44, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.5)',
    alignItems: 'center', justifyContent: 'center',
  },
  certName: { fontSize: 14, fontWeight: '700', color: colors.textPrimary },
  certIssuer: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  assessmentCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.warningLight,
    borderRadius: 16, padding: 14, borderWidth: 1, borderColor: colors.warning,
  },
  assessmentTitle: { fontSize: 14, fontWeight: '700', color: colors.textPrimary },
  assessmentToken: { fontSize: 13, fontWeight: '800', color: colors.primary, marginTop: 2 },
  assessmentStatus: { fontSize: 11, color: colors.textMuted, marginTop: 2 },
  noCerts: { fontSize: 13, color: colors.textMuted, fontStyle: 'italic' },
  infoSection: { marginBottom: 16 },
  infoCard: {
    backgroundColor: colors.surface, borderRadius: 22, padding: 16,
    borderWidth: 1, borderColor: colors.border,
  },
  infoRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 11 },
  infoRowBorder: { borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  infoLabel: { fontSize: 13, color: colors.textMuted, fontWeight: '600', marginLeft: 10, flex: 1 },
  infoValue: { fontSize: 13, color: colors.textPrimary, fontWeight: '700', maxWidth: '55%', textAlign: 'right' },
  actionsSection: { marginBottom: 16 },
  languageBtnRow: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.primarySubtle,
    borderRadius: 16, padding: 14, marginBottom: 12, borderWidth: 1.5, borderColor: colors.primary,
  },
  langIconCircle: {
    width: 38, height: 38, borderRadius: 19, backgroundColor: colors.surface,
    alignItems: 'center', justifyContent: 'center',
  },
  langRowTitle: { fontSize: 14, fontWeight: '700', color: colors.primary },
  langRowSub: { fontSize: 12, color: colors.textSecondary, marginTop: 2, fontWeight: '500' },
  changeBadge: {
    backgroundColor: colors.primary, paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 8,
  },
  changeBadgeText: { fontSize: 12, fontWeight: '700', color: colors.textInverse },
  editBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.primary, borderRadius: 14, paddingVertical: 15, marginBottom: 10, gap: 8,
  },
  editBtnText: { fontSize: 15, fontWeight: '700', color: colors.textInverse },
  settingsRow: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface,
    borderRadius: 14, padding: 16, marginBottom: 8, borderWidth: 1, borderColor: colors.border,
    gap: 12,
  },
  settingsText: { flex: 1, fontSize: 14, fontWeight: '600', color: colors.textPrimary },
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.dangerLight, borderRadius: 14, paddingVertical: 15,
    borderWidth: 1.5, borderColor: colors.danger, gap: 8, marginTop: 4,
  },
  logoutBtnText: { fontSize: 15, fontWeight: '700', color: colors.danger },
  versionText: { fontSize: 11, color: colors.textMuted, textAlign: 'center', marginTop: 8 },
});

export default Screen16_Profile;
