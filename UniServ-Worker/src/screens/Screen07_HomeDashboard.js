import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView,
  ScrollView, Animated, Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useWorker } from '../context/WorkerContext';
import { useJob } from '../context/JobContext';

const getGreeting = (t) => {
  const h = new Date().getHours();
  if (h < 12) return t('goodMorning', 'Good Morning');
  if (h < 17) return t('goodAfternoon', 'Good Afternoon');
  return t('goodEvening', 'Good Evening');
};

export const Screen07_HomeDashboard = ({ navigation }) => {
  const { worker, toggleOnline, t } = useWorker();
  const { pendingRequest, simulateJobRequest } = useJob();
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const dynamicQuickActions = [
    { id: 'jobs', label: t('acceptJobs', 'Accept Jobs'), icon: 'briefcase', color: colors.primary, bg: colors.primarySubtle, screen: 'Jobs' },
    { id: 'schedule', label: t('mySchedule', 'My Schedule'), icon: 'calendar', color: colors.success, bg: colors.successLight, screen: 'Schedule' },
    { id: 'earnings', label: t('earningsWallet', 'Earnings Wallet'), icon: 'wallet', color: '#7C3AED', bg: '#EDE9FE', screen: 'Earnings' },
    { id: 'welfare', label: t('welfareFund', 'Welfare Fund'), icon: 'heart', color: colors.warning, bg: colors.warningLight, screen: null },
  ];

  useEffect(() => {
    if (pendingRequest) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.05, duration: 600, useNativeDriver: Platform.OS !== 'web' }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: Platform.OS !== 'web' }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [pendingRequest]);

  const handleQuickAction = (action) => {
    if (action.screen) {
      navigation.navigate(action.screen);
    } else if (action.id === 'welfare') {
      navigation.navigate('WelfareFund');
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}>
          <View>
            <Text style={styles.greeting}>{getGreeting(t)},</Text>
            <Text style={styles.workerName}>{worker?.name?.split(' ')[0] || 'Worker'} 👋</Text>
          </View>
          <View style={styles.topBarRight}>
            <TouchableOpacity
              style={styles.notifBtn}
              onPress={() => {
                navigation.navigate('LanguageSelection');
              }}
              activeOpacity={0.7}
              accessibilityLabel="Switch Account / Login"
            >
              <Ionicons name="log-out-outline" size={20} color={colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.notifBtn} activeOpacity={0.7}>
              <Ionicons name="notifications-outline" size={22} color={colors.textPrimary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.onlineToggle, worker?.isOnline && styles.onlineToggleActive]}
              onPress={toggleOnline}
              activeOpacity={0.8}
            >
              <View style={[styles.onlineDot, worker?.isOnline && styles.onlineDotActive]} />
              <Text style={[styles.onlineText, worker?.isOnline && styles.onlineTextActive]}>
                {worker?.isOnline ? t('online', 'Online') : t('offline', 'Offline')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Ionicons name="briefcase" size={18} color={colors.primary} />
            <Text style={styles.statValue}>3</Text>
            <Text style={styles.statLabel}>{t('jobsToday', 'Jobs Today')}</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="wallet" size={18} color={colors.success} />
            <Text style={[styles.statValue, { color: colors.success }]}>₹{worker?.earnings?.today || 450}</Text>
            <Text style={styles.statLabel}>{t('todayEarnings', "Today's Earnings")}</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="star" size={18} color={colors.warning} />
            <Text style={[styles.statValue, { color: colors.warning }]}>{worker?.rating || 4.7}</Text>
            <Text style={styles.statLabel}>{t('rating', 'Rating')}</Text>
          </View>
        </View>

        {pendingRequest ? (
          <Animated.View style={[styles.jobBanner, { transform: [{ scale: pulseAnim }] }]}>
            <View style={styles.jobBannerLeft}>
              <View style={styles.pulseDot} />
              <View>
                <Text style={styles.jobBannerTitle}>{t('newJobRequestAlert', 'New Job Request!')}</Text>
                <Text style={styles.jobBannerSub}>{pendingRequest.service} · {pendingRequest.customerArea}</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.viewJobBtn}
              onPress={() => navigation.navigate('Jobs')}
              activeOpacity={0.85}
            >
              <Text style={styles.viewJobBtnText}>{t('confirm', 'View')}</Text>
            </TouchableOpacity>
          </Animated.View>
        ) : worker?.isOnline ? (
          <View style={styles.waitingBanner}>
            <Ionicons name="radio-outline" size={20} color={colors.primary} />
            <Text style={styles.waitingText}>{t('listeningJobs', 'Listening for new job requests...')}</Text>
          </View>
        ) : (
          <View style={styles.offlineBanner}>
            <Ionicons name="moon-outline" size={20} color={colors.textMuted} />
            <Text style={styles.offlineText}>{t('offlineBanner', 'You are offline. Go online to receive jobs.')}</Text>
          </View>
        )}

        {!pendingRequest && worker?.isOnline && (
          <TouchableOpacity style={styles.simulateBtn} onPress={simulateJobRequest} activeOpacity={0.8}>
            <Ionicons name="flash" size={14} color={colors.textInverse} />
            <Text style={styles.simulateBtnText}>{t('simulateJob', 'Simulate Job Request (Demo)')}</Text>
          </TouchableOpacity>
        )}

        <Text style={styles.sectionTitle}>{t('quickActions', 'Quick Actions')}</Text>
        <View style={styles.actionsGrid}>
          {dynamicQuickActions.map((a) => (
            <TouchableOpacity
              key={a.id}
              style={styles.actionCard}
              onPress={() => handleQuickAction(a)}
              activeOpacity={0.8}
            >
              <View style={[styles.actionIcon, { backgroundColor: a.bg }]}>
                <Ionicons name={a.icon} size={24} color={a.color} />
              </View>
              <Text style={styles.actionLabel}>{a.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.demandCard}>
          <View style={styles.demandHeader}>
            <Ionicons name="flame" size={18} color={colors.danger} />
            <Text style={styles.demandTitle}>{t('demandAlert', 'Demand Alert')}</Text>
            <TouchableOpacity
              style={styles.heatmapBtn}
              onPress={() => navigation.navigate('DemandHeatmap')}
              activeOpacity={0.7}
            >
              <Text style={styles.heatmapBtnText}>{t('viewHeatmap', 'View Heatmap')}</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.demandText}>
            {t('highDemandAlert', 'High demand for artisans in your area right now.')}
          </Text>
          <View style={styles.demandChips}>
            <View style={styles.demandChip}><Text style={styles.demandChipText}>🔥 Lajpat Nagar</Text></View>
            <View style={styles.demandChip}><Text style={styles.demandChipText}>🔥 GK-I</Text></View>
            <View style={[styles.demandChip, { backgroundColor: colors.warningLight }]}>
              <Text style={[styles.demandChipText, { color: colors.warningDark }]}>⚡ Hauz Khas</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.insuranceChip, worker?.insurance?.status === 'active' && styles.insuranceChipActive]}
          onPress={() => navigation.navigate('Insurance')}
          activeOpacity={0.8}
        >
          <Ionicons
            name={worker?.insurance?.status === 'active' ? 'shield-checkmark' : 'shield-outline'}
            size={18}
            color={worker?.insurance?.status === 'active' ? colors.success : colors.textMuted}
          />
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={styles.insuranceTitle}>
              {worker?.insurance?.status === 'active' ? t('insuranceActive', 'Insurance: Active') : t('insuranceExpired', 'Insurance: Expired')}
            </Text>
            <Text style={styles.insuranceSub}>
              Policy {worker?.insurance?.policyNo || 'UWCI-2026-08871'} · {t('validUntil', 'Valid until')} {worker?.insurance?.validUntil || '2027-03-31'}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 30 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  greeting: { fontSize: 13, color: colors.textMuted, fontWeight: '600' },
  workerName: { fontSize: 22, fontWeight: '800', color: colors.textPrimary },
  topBarRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  notifBtn: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border,
  },
  onlineToggle: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface,
    borderRadius: 20, paddingHorizontal: 12, paddingVertical: 8,
    borderWidth: 1.5, borderColor: colors.border,
  },
  onlineToggleActive: { backgroundColor: colors.successLight, borderColor: colors.success },
  onlineDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.textMuted, marginRight: 6 },
  onlineDotActive: { backgroundColor: colors.success },
  onlineText: { fontSize: 13, fontWeight: '700', color: colors.textMuted },
  onlineTextActive: { color: colors.successDark },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  statCard: {
    flex: 1, backgroundColor: colors.surface, borderRadius: 16, padding: 14,
    alignItems: 'center', borderWidth: 1, borderColor: colors.border, marginHorizontal: 3,
  },
  statValue: { fontSize: 18, fontWeight: '800', color: colors.textPrimary, marginTop: 4 },
  statLabel: { fontSize: 10, color: colors.textMuted, fontWeight: '600', marginTop: 2, textAlign: 'center' },
  jobBanner: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: colors.danger, borderRadius: 18, padding: 16, marginBottom: 12,
  },
  jobBannerLeft: { flexDirection: 'row', alignItems: 'center' },
  pulseDot: {
    width: 10, height: 10, borderRadius: 5, backgroundColor: colors.textInverse,
    marginRight: 12, opacity: 0.9,
  },
  jobBannerTitle: { fontSize: 15, fontWeight: '800', color: colors.textInverse },
  jobBannerSub: { fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  viewJobBtn: {
    backgroundColor: colors.textInverse, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8,
  },
  viewJobBtnText: { fontSize: 13, fontWeight: '700', color: colors.danger },
  waitingBanner: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.primarySubtle,
    borderRadius: 14, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: colors.border,
  },
  waitingText: { fontSize: 13, color: colors.primary, fontWeight: '600', marginLeft: 10 },
  offlineBanner: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surfaceSecondary,
    borderRadius: 14, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: colors.border,
  },
  offlineText: { fontSize: 13, color: colors.textMuted, fontWeight: '600', marginLeft: 10 },
  simulateBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.primary, borderRadius: 10, paddingVertical: 10, marginBottom: 16,
  },
  simulateBtnText: { fontSize: 12, fontWeight: '700', color: colors.textInverse, marginLeft: 6 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.textPrimary, marginBottom: 12 },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 16 },
  actionCard: {
    width: '48%', backgroundColor: colors.surface, borderRadius: 16, padding: 16,
    alignItems: 'center', borderWidth: 1, borderColor: colors.border, marginBottom: 10,
  },
  actionIcon: { width: 50, height: 50, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  actionLabel: { fontSize: 13, fontWeight: '700', color: colors.textPrimary },
  demandCard: {
    backgroundColor: colors.surface, borderRadius: 18, padding: 16,
    borderWidth: 1, borderColor: colors.border, marginBottom: 14,
  },
  demandHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  demandTitle: { fontSize: 15, fontWeight: '700', color: colors.textPrimary, marginLeft: 6, flex: 1 },
  heatmapBtn: { backgroundColor: colors.primarySubtle, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5 },
  heatmapBtnText: { fontSize: 11, fontWeight: '700', color: colors.primary },
  demandText: { fontSize: 13, color: colors.textSecondary, lineHeight: 18, marginBottom: 10 },
  demandChips: { flexDirection: 'row', gap: 8 },
  demandChip: {
    backgroundColor: colors.dangerLight, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5,
  },
  demandChipText: { fontSize: 12, fontWeight: '700', color: colors.danger },
  insuranceChip: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface,
    borderRadius: 16, padding: 14, borderWidth: 1, borderColor: colors.border,
  },
  insuranceChipActive: { borderColor: colors.success, backgroundColor: colors.successLight },
  insuranceTitle: { fontSize: 14, fontWeight: '700', color: colors.textPrimary },
  insuranceSub: { fontSize: 11, color: colors.textMuted, marginTop: 2 },
});

export default Screen07_HomeDashboard;
