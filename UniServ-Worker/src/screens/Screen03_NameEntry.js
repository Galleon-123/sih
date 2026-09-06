import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  SafeAreaView, KeyboardAvoidingView, Platform, ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useWorker } from '../context/WorkerContext';

const STEPS = ['Phone', 'Name', 'KYC', 'Certification', 'Done'];

export const Screen03_NameEntry = ({ navigation }) => {
  const { updateWorker, t } = useWorker();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState('');

  const handleContinue = async () => {
    if (!firstName.trim()) { setError('Please enter your first name'); return; }
    if (!lastName.trim()) { setError('Please enter your last name'); return; }
    setError('');
    await updateWorker({ name: `${firstName.trim()} ${lastName.trim()}` });
    navigation.navigate('eKYC');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
          </TouchableOpacity>

          <View style={styles.progressRow}>
            {STEPS.map((s, i) => (
              <View key={s} style={styles.stepWrap}>
                <View style={[styles.stepDot, i < 2 && styles.stepDotDone, i === 1 && styles.stepDotActive]}>
                  {i < 1
                    ? <Ionicons name="checkmark" size={12} color={colors.textInverse} />
                    : <Text style={[styles.stepNum, i === 1 && styles.stepNumActive]}>{i + 1}</Text>
                  }
                </View>
                {i < STEPS.length - 1 && <View style={[styles.stepLine, i < 1 && styles.stepLineDone]} />}
              </View>
            ))}
          </View>

          <View style={styles.header}>
            <View style={styles.iconCircle}>
              <Ionicons name="person" size={28} color={colors.primary} />
            </View>
            <Text style={styles.title}>{t('fullName', 'Your Name')}</Text>
            <Text style={styles.subtitle}>{t('onboardingSub', 'Enter your full name as it appears on your Aadhaar card.')}</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.label}>{t('fullName', 'First Name')}</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Ravi"
              placeholderTextColor={colors.textMuted}
              value={firstName}
              onChangeText={(v) => { setFirstName(v); setError(''); }}
              autoCapitalize="words"
            />
            <Text style={styles.label}>Last Name</Text>
            <TextInput
              style={[styles.input, { marginBottom: 0 }]}
              placeholder="e.g. Kumar"
              placeholderTextColor={colors.textMuted}
              value={lastName}
              onChangeText={(v) => { setLastName(v); setError(''); }}
              autoCapitalize="words"
            />
            {error ? <Text style={styles.error}>{error}</Text> : null}
          </View>

          <View style={styles.infoBox}>
            <Ionicons name="information-circle-outline" size={16} color={colors.primary} />
            <Text style={styles.infoText}>
              Your name will be verified against your Aadhaar in the next step. Please enter it exactly as shown on your ID.
            </Text>
          </View>

          <TouchableOpacity style={styles.btn} onPress={handleContinue} activeOpacity={0.85}>
            <Text style={styles.btnText}>{t('proceedToKyc', 'Continue to KYC')}</Text>
            <Ionicons name="arrow-forward" size={16} color={colors.textInverse} style={{ marginLeft: 8 }} />
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 30 },
  back: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: colors.border, marginBottom: 16,
  },
  progressRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  stepWrap: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  stepDot: {
    width: 28, height: 28, borderRadius: 14, backgroundColor: colors.surfaceTertiary,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: colors.border,
  },
  stepDotDone: { backgroundColor: colors.primary, borderColor: colors.primary },
  stepDotActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  stepNum: { fontSize: 12, fontWeight: '700', color: colors.textMuted },
  stepNumActive: { color: colors.textInverse },
  stepLine: { flex: 1, height: 2, backgroundColor: colors.border, marginHorizontal: 4 },
  stepLineDone: { backgroundColor: colors.primary },
  header: { marginBottom: 24 },
  iconCircle: {
    width: 56, height: 56, borderRadius: 18, backgroundColor: colors.primarySubtle,
    alignItems: 'center', justifyContent: 'center', marginBottom: 14,
  },
  title: { fontSize: 22, fontWeight: '800', color: colors.textPrimary },
  subtitle: { fontSize: 13, color: colors.textSecondary, marginTop: 6, lineHeight: 18 },
  card: {
    backgroundColor: colors.surface, borderRadius: 22, padding: 20,
    borderWidth: 1, borderColor: colors.border,
    shadowColor: colors.shadowColor, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04, shadowRadius: 8, elevation: 2, marginBottom: 16,
  },
  label: { fontSize: 13, fontWeight: '700', color: colors.textPrimary, marginBottom: 8 },
  input: {
    backgroundColor: colors.surfaceSecondary, borderRadius: 14, paddingHorizontal: 14,
    paddingVertical: 13, fontSize: 15, color: colors.textPrimary,
    borderWidth: 1.5, borderColor: colors.border, marginBottom: 16,
  },
  error: { fontSize: 12, color: colors.danger, marginTop: 8, fontWeight: '600' },
  infoBox: {
    flexDirection: 'row', backgroundColor: colors.primarySubtle,
    borderRadius: 14, padding: 12, marginBottom: 20,
    borderWidth: 1, borderColor: colors.border,
  },
  infoText: { fontSize: 12, color: colors.textSecondary, marginLeft: 8, flex: 1, lineHeight: 17 },
  btn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.primary, paddingVertical: 16, borderRadius: 14,
    shadowColor: colors.primary, shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25, shadowRadius: 6, elevation: 3,
  },
  btnText: { fontSize: 15, fontWeight: '700', color: colors.textInverse },
});

export default Screen03_NameEntry;
