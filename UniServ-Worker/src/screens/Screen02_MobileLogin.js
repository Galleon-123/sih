import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  SafeAreaView, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { signInWithPhoneNumber } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/firebase';
import { colors } from '../theme/colors';
import { useWorker } from '../context/WorkerContext';

export const Screen02_MobileLogin = ({ navigation }) => {
  const { t } = useWorker();
  const [phone, setPhone]           = useState('');
  const [otpSent, setOtpSent]       = useState(false);
  const [digits, setDigits]         = useState(['', '', '', '', '', '']);
  const [timer, setTimer]           = useState(30);
  const [error, setError]           = useState('');
  const [loading, setLoading]       = useState(false);

  const confirmRef = useRef(null);
  const refs = [0,1,2,3,4,5].map(() => useRef(null));

  useEffect(() => {
    let interval;
    if (otpSent && timer > 0) {
      interval = setInterval(() => setTimer((p) => p - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [otpSent, timer]);

  const sendOtp = async () => {
    if (phone.replace(/[^0-9]/g, '').length < 10) {
      setError('Enter a valid 10-digit mobile number');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const fullNumber = '+91' + phone.replace(/[^0-9]/g, '');
      confirmRef.current = await signInWithPhoneNumber(auth, fullNumber);
      setOtpSent(true);
      setTimer(30);
    } catch (err) {
      setError(err.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDigit = (val, idx) => {
    setError('');
    const next = [...digits];
    next[idx] = val;
    setDigits(next);
    if (val && idx < 5) refs[idx + 1].current?.focus();
  };

  const handleKey = (e, idx) => {
    if (e.nativeEvent.key === 'Backspace' && !digits[idx] && idx > 0)
      refs[idx - 1].current?.focus();
  };

  const verify = async () => {
    const code = digits.join('');
    if (code.length < 6) { setError('Enter the complete 6-digit code'); return; }
    if (!confirmRef.current) { setError('Session expired — request a new OTP'); return; }
    setLoading(true);
    setError('');
    try {
      await confirmRef.current.confirm(code);
      const uid = auth.currentUser?.uid;
      const snap = await getDoc(doc(db, 'workers', uid));
      const profile = snap.exists() ? snap.data() : null;
      if (profile?.name && profile?.trade) {
        navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
      } else {
        navigation.navigate('NameEntry');
      }
    } catch (err) {
      setError('Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
          </TouchableOpacity>

          <View style={styles.header}>
            <View style={styles.iconCircle}>
              <Ionicons name="phone-portrait" size={30} color={colors.primary} />
            </View>
            <Text style={styles.title}>Worker Registration</Text>
            <Text style={styles.subtitle}>
              {otpSent ? `OTP sent to +91 ${phone}` : 'Enter your mobile number to begin registration'}
            </Text>
          </View>

          <View style={styles.card}>
            {!otpSent ? (
              <View>
                <Text style={styles.label}>Mobile Number</Text>
                <View style={styles.phoneRow}>
                  <View style={styles.prefix}>
                    <Text style={styles.flag}>🇮🇳</Text>
                    <Text style={styles.code}>+91</Text>
                  </View>
                  <TextInput
                    style={styles.phoneInput}
                    placeholder="10-digit number"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="number-pad"
                    maxLength={10}
                    value={phone}
                    onChangeText={(v) => { setPhone(v); setError(''); }}
                  />
                </View>
                {error ? <Text style={styles.error}>{error}</Text> : null}
                <TouchableOpacity style={styles.btn} onPress={sendOtp} disabled={loading}>
                  {loading ? <ActivityIndicator color="#FFF" />
                    : <Text style={styles.btnText}>Send OTP</Text>}
                </TouchableOpacity>
              </View>
            ) : (
              <View>
                <View style={styles.smsBanner}>
                  <Ionicons name="chatbubble-ellipses" size={14} color={colors.primary} />
                  <Text style={styles.smsBannerText}>Check your SMS inbox for the 6-digit code</Text>
                </View>
                <Text style={styles.label}>Enter OTP</Text>
                <View style={styles.otpRow}>
                  {[0,1,2,3,4,5].map((idx) => (
                    <TextInput
                      key={idx}
                      ref={refs[idx]}
                      style={[styles.otpBox, digits[idx] && styles.otpFilled, error && styles.otpError]}
                      keyboardType="number-pad"
                      maxLength={1}
                      value={digits[idx]}
                      onChangeText={(v) => handleDigit(v, idx)}
                      onKeyPress={(e) => handleKey(e, idx)}
                    />
                  ))}
                </View>
                {error ? <Text style={styles.error}>{error}</Text> : null}
                <TouchableOpacity style={styles.btn} onPress={verify} disabled={loading}>
                  {loading ? <ActivityIndicator color="#FFF" />
                    : <Text style={styles.btnText}>Verify & Continue</Text>}
                </TouchableOpacity>
                <View style={styles.resendRow}>
                  {timer > 0
                    ? <Text style={styles.timer}>Resend in {timer}s</Text>
                    : <TouchableOpacity onPress={sendOtp}><Text style={styles.resendLink}>Resend OTP</Text></TouchableOpacity>
                  }
                  <TouchableOpacity onPress={() => { setOtpSent(false); setDigits(['','','','','','']); }}>
                    <Text style={styles.changeNum}>Change Number</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe:        { flex: 1, backgroundColor: colors.background },
  scroll:      { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 30 },
  back:        { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border, marginBottom: 20 },
  header:      { marginBottom: 24 },
  iconCircle:  { width: 60, height: 60, borderRadius: 20, backgroundColor: colors.primarySubtle, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  title:       { fontSize: 24, fontWeight: '800', color: colors.textPrimary },
  subtitle:    { fontSize: 13, color: colors.textSecondary, marginTop: 6 },
  card:        { backgroundColor: colors.surface, borderRadius: 22, padding: 20, borderWidth: 1, borderColor: colors.border, elevation: 2, marginBottom: 20 },
  label:       { fontSize: 13, fontWeight: '700', color: colors.textPrimary, marginBottom: 8 },
  phoneRow:    { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: colors.border, borderRadius: 14, backgroundColor: colors.surfaceSecondary, height: 52, paddingHorizontal: 12, marginBottom: 16 },
  prefix:      { flexDirection: 'row', alignItems: 'center', paddingRight: 10, borderRightWidth: 1, borderRightColor: colors.border },
  flag:        { fontSize: 18, marginRight: 6 },
  code:        { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  phoneInput:  { flex: 1, fontSize: 16, color: colors.textPrimary, fontWeight: '600', paddingLeft: 12, height: '100%' },
  smsBanner:   { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.primarySubtle, borderRadius: 12, padding: 10, marginBottom: 14, gap: 8, borderWidth: 1, borderColor: colors.primaryLight },
  smsBannerText: { fontSize: 12, color: colors.primary, fontWeight: '600' },
  otpRow:      { flexDirection: 'row', justifyContent: 'space-between', gap: 6, marginBottom: 16 },
  otpBox:      { flex: 1, height: 50, borderRadius: 12, backgroundColor: colors.surfaceSecondary, borderWidth: 1.5, borderColor: colors.border, textAlign: 'center', fontSize: 20, fontWeight: '800', color: colors.primary },
  otpFilled:   { borderColor: colors.primaryLight, backgroundColor: colors.primarySubtle },
  otpError:    { borderColor: colors.danger },
  error:       { fontSize: 12, color: colors.danger, marginBottom: 12, fontWeight: '600' },
  btn:         { backgroundColor: colors.primary, paddingVertical: 15, borderRadius: 14, alignItems: 'center', justifyContent: 'center', elevation: 3 },
  btnText:     { fontSize: 15, fontWeight: '700', color: '#FFF' },
  resendRow:   { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 },
  timer:       { fontSize: 12, color: colors.textMuted },
  resendLink:  { fontSize: 12, fontWeight: '700', color: colors.primaryLight },
  changeNum:   { fontSize: 12, fontWeight: '600', color: colors.textSecondary },
});

export default Screen02_MobileLogin;
