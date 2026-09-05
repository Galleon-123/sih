import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  SafeAreaView, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { signInWithPhoneNumber } from 'firebase/auth';
import { auth } from '../firebase/firebase';
import { colors } from '../theme/colors';
import { useUser } from '../context/UserContext';

export const Screen02_OTPLogin = ({ navigation }) => {
  const { checkUserExists, t } = useUser();

  const [phoneNumber, setPhoneNumber]   = useState('');
  const [isOtpSent, setIsOtpSent]       = useState(false);
  const [otpDigits, setOtpDigits]       = useState(['', '', '', '', '', '']);
  const [timer, setTimer]               = useState(30);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading]           = useState(false);

  const confirmRef = useRef(null);
  const inputRefs  = [useRef(null), useRef(null), useRef(null), useRef(null), useRef(null), useRef(null)];

  useEffect(() => {
    let interval;
    if (isOtpSent && timer > 0) {
      interval = setInterval(() => setTimer((p) => p - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isOtpSent, timer]);

  // ── Send real SMS OTP via Firebase ───────────────────────────
  const handleSendOtp = async () => {
    const clean = phoneNumber.replace(/[^0-9]/g, '');
    if (clean.length < 10) {
      setErrorMessage('Please enter a valid 10-digit mobile number');
      return;
    }
    setLoading(true);
    setErrorMessage('');
    try {
      const fullNumber = '+91' + clean;
      confirmRef.current = await signInWithPhoneNumber(auth, fullNumber);
      setIsOtpSent(true);
      setTimer(30);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDigitChange = (value, index) => {
    setErrorMessage('');
    const newDigits = [...otpDigits];
    newDigits[index] = value;
    setOtpDigits(newDigits);
    if (value && index < 5) inputRefs[index + 1].current?.focus();
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !otpDigits[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  // ── Verify OTP with Firebase ─────────────────────────────────
  const handleVerifyOtp = async () => {
    const code = otpDigits.join('');
    if (code.length < 6) {
      setErrorMessage('Please enter the complete 6-digit code');
      return;
    }
    if (!confirmRef.current) {
      setErrorMessage('Session expired — please request a new OTP');
      return;
    }
    setLoading(true);
    setErrorMessage('');
    try {
      await confirmRef.current.confirm(code);
      const phone = phoneNumber.replace(/[^0-9]/g, '');
      const exists = await checkUserExists(phone);
      navigation.reset({
        index: 0,
        routes: [{ name: exists ? 'MainTabs' : 'Registration', params: exists ? undefined : { phone } }],
      });
    } catch (err) {
      setErrorMessage('Invalid verification code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
          </TouchableOpacity>

          <View style={styles.contentHeader}>
            <View style={styles.iconCircle}>
              <Ionicons name="phone-portrait" size={30} color={colors.primary} />
            </View>
            <Text style={styles.title}>{t('mobileVerification', 'Mobile Verification')}</Text>
            <Text style={styles.subtitle}>
              {isOtpSent ? `OTP sent to +91 ${phoneNumber}` : 'Enter your mobile number to continue'}
            </Text>
          </View>

          <View style={styles.formCard}>
            {!isOtpSent ? (
              <View>
                <Text style={styles.inputLabel}>{t('mobileNumber', 'Mobile Number')}</Text>
                <View style={styles.phoneInputRow}>
                  <View style={styles.countryCodeWrap}>
                    <Text style={styles.flagEmoji}>🇮🇳</Text>
                    <Text style={styles.countryCodeText}>+91</Text>
                  </View>
                  <TextInput
                    style={styles.phoneInput}
                    placeholder="Enter 10-digit number"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="number-pad"
                    maxLength={10}
                    value={phoneNumber}
                    onChangeText={(v) => { setPhoneNumber(v); setErrorMessage(''); }}
                  />
                </View>
                {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
                <TouchableOpacity style={styles.primaryActionBtn} onPress={handleSendOtp} activeOpacity={0.85} disabled={loading}>
                  {loading ? <ActivityIndicator color="#FFF" /> : (
                    <><Text style={styles.actionBtnText}>{t('sendOtp', 'Send OTP')}</Text>
                      <Ionicons name="arrow-forward" size={16} color="#FFF" style={{ marginLeft: 6 }} /></>
                  )}
                </TouchableOpacity>
              </View>
            ) : (
              <View>
                <View style={styles.otpHelperBanner}>
                  <View style={styles.otpHelperRow}>
                    <Ionicons name="shield-checkmark" size={16} color={colors.primary} />
                    <Text style={styles.otpHelperTitle}>OTP sent via SMS</Text>
                  </View>
                  <Text style={styles.otpCodeNotice}>Check your SMS inbox for the 6-digit verification code.</Text>
                </View>

                <Text style={styles.inputLabel}>{t('enterOtp', 'Enter OTP')}</Text>
                <View style={styles.otpGrid}>
                  {[0,1,2,3,4,5].map((index) => (
                    <TextInput
                      key={index}
                      ref={inputRefs[index]}
                      style={[styles.otpBox, otpDigits[index] && styles.otpBoxFilled, errorMessage && styles.otpBoxError]}
                      keyboardType="number-pad"
                      maxLength={1}
                      value={otpDigits[index]}
                      onChangeText={(v) => handleDigitChange(v, index)}
                      onKeyPress={(e) => handleKeyPress(e, index)}
                    />
                  ))}
                </View>

                {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

                <TouchableOpacity style={styles.primaryActionBtn} onPress={handleVerifyOtp} activeOpacity={0.85} disabled={loading}>
                  {loading ? <ActivityIndicator color="#FFF" /> : (
                    <><Text style={styles.actionBtnText}>{t('verifyProceed', 'Verify & Proceed')}</Text>
                      <Ionicons name="checkmark-circle" size={16} color="#FFF" style={{ marginLeft: 6 }} /></>
                  )}
                </TouchableOpacity>

                <View style={styles.resendRow}>
                  {timer > 0
                    ? <Text style={styles.timerText}>{t('resendIn', 'Resend in')} {timer}s</Text>
                    : <TouchableOpacity onPress={handleSendOtp} activeOpacity={0.7}>
                        <Text style={styles.resendLinkText}>{t('resendOtp', 'Resend OTP')}</Text>
                      </TouchableOpacity>
                  }
                  <TouchableOpacity onPress={() => { setIsOtpSent(false); setOtpDigits(['','','','','','']); }} activeOpacity={0.7}>
                    <Text style={styles.changePhoneText}>{t('changeNumber', 'Change Number')}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>

          <View style={styles.guaranteeBox}>
            <Ionicons name="shield-checkmark" size={16} color={colors.primary} />
            <Text style={styles.guaranteeText}>
              UniServ protects user data privacy under Cooperative Board cybersecurity protocols.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea:         { flex: 1, backgroundColor: colors.background },
  scrollContent:    { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 30 },
  backBtn:          { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border, marginBottom: 20 },
  contentHeader:    { marginBottom: 24 },
  iconCircle:       { width: 60, height: 60, borderRadius: 20, backgroundColor: colors.primarySubtle, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  title:            { fontSize: 24, fontWeight: '800', color: colors.textPrimary, letterSpacing: -0.3 },
  subtitle:         { fontSize: 13, color: colors.textSecondary, marginTop: 6, lineHeight: 18 },
  formCard:         { backgroundColor: colors.surface, borderRadius: 22, padding: 20, borderWidth: 1, borderColor: colors.border, elevation: 2, marginBottom: 20 },
  inputLabel:       { fontSize: 13, fontWeight: '700', color: colors.textPrimary, marginBottom: 8 },
  phoneInputRow:    { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: colors.border, borderRadius: 14, backgroundColor: colors.surfaceSecondary, height: 52, paddingHorizontal: 12, marginBottom: 16 },
  countryCodeWrap:  { flexDirection: 'row', alignItems: 'center', paddingRight: 10, borderRightWidth: 1, borderRightColor: colors.border },
  flagEmoji:        { fontSize: 18, marginRight: 6 },
  countryCodeText:  { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  phoneInput:       { flex: 1, fontSize: 16, color: colors.textPrimary, fontWeight: '600', paddingLeft: 12, height: '100%' },
  otpHelperBanner:  { backgroundColor: colors.primarySubtle, borderRadius: 14, padding: 12, marginBottom: 16, borderWidth: 1, borderColor: colors.primaryLight },
  otpHelperRow:     { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  otpHelperTitle:   { fontSize: 12, fontWeight: '700', color: colors.primary, marginLeft: 6 },
  otpCodeNotice:    { fontSize: 13, color: colors.textSecondary },
  otpGrid:          { flexDirection: 'row', justifyContent: 'space-between', gap: 6, marginBottom: 16 },
  otpBox:           { flex: 1, height: 54, borderRadius: 14, backgroundColor: colors.surfaceSecondary, borderWidth: 1.5, borderColor: colors.border, textAlign: 'center', fontSize: 20, fontWeight: '800', color: colors.primary },
  otpBoxFilled:     { borderColor: colors.primaryLight, backgroundColor: colors.primarySubtle },
  otpBoxError:      { borderColor: colors.danger, backgroundColor: colors.dangerLight },
  errorText:        { fontSize: 12, color: colors.danger, marginBottom: 12, fontWeight: '600' },
  primaryActionBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary, paddingVertical: 15, borderRadius: 14, shadowColor: colors.primary, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.25, shadowRadius: 6, elevation: 3 },
  actionBtnText:    { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },
  resendRow:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginTop: 16 },
  timerText:        { fontSize: 12, color: colors.textMuted },
  resendLinkText:   { fontSize: 12, fontWeight: '700', color: colors.primaryLight },
  changePhoneText:  { fontSize: 12, fontWeight: '600', color: colors.textSecondary },
  guaranteeBox:     { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surfaceSecondary, padding: 12, borderRadius: 14, borderWidth: 1, borderColor: colors.border },
  guaranteeText:    { fontSize: 11, color: colors.textSecondary, marginLeft: 8, flex: 1, lineHeight: 15 },
});

export default Screen02_OTPLogin;
