import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  SafeAreaView, ScrollView, Image, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { colors } from '../theme/colors';
import { useWorker } from '../context/WorkerContext';

export const Screen04_eKYC = ({ navigation }) => {
  const { updateWorker } = useWorker();
  const [aadhaar, setAadhaar] = useState('');
  const [aadhaarFront, setAadhaarFront] = useState(null);
  const [aadhaarBack, setAadhaarBack] = useState(null);
  const [selfie, setSelfie] = useState(null);
  const [error, setError] = useState('');

  const pickImage = async (setter, label) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant photo access to upload documents.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setter(result.assets[0].uri);
    }
  };

  const takeSelfie = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant camera access to take a selfie.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
      cameraType: ImagePicker.CameraType.front,
    });
    if (!result.canceled && result.assets[0]) {
      setSelfie(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (aadhaar.replace(/\s/g, '').length < 12) {
      setError('Enter a valid 12-digit Aadhaar number');
      return;
    }
    setError('');
    await updateWorker({ aadhaarNumber: aadhaar, aadhaarFront, aadhaarBack, selfie });
    navigation.navigate('CertificationCheck');
  };

  const formatAadhaar = (val) => {
    const clean = val.replace(/\D/g, '').slice(0, 12);
    return clean.replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  const UploadBox = ({ label, icon, image, onPress, required }) => (
    <TouchableOpacity style={[styles.uploadBox, image && styles.uploadBoxDone]} onPress={onPress} activeOpacity={0.8}>
      {image ? (
        <View style={styles.uploadDone}>
          <Image source={{ uri: image }} style={styles.uploadPreview} />
          <View style={styles.uploadDoneBadge}>
            <Ionicons name="checkmark-circle" size={20} color={colors.success} />
            <Text style={styles.uploadDoneText}>Uploaded</Text>
          </View>
        </View>
      ) : (
        <View style={styles.uploadEmpty}>
          <View style={styles.uploadIcon}>
            <Ionicons name={icon} size={26} color={colors.primary} />
          </View>
          <Text style={styles.uploadLabel}>{label}</Text>
          {required && <Text style={styles.uploadRequired}>Required</Text>}
          <Text style={styles.uploadHint}>Tap to upload</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>

        <View style={styles.header}>
          <View style={styles.iconCircle}>
            <Ionicons name="id-card" size={28} color={colors.primary} />
          </View>
          <Text style={styles.title}>eKYC Verification</Text>
          <Text style={styles.subtitle}>Upload your Aadhaar card and a selfie for identity verification.</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Aadhaar Number</Text>
          <TextInput
            style={styles.input}
            placeholder="XXXX XXXX XXXX"
            placeholderTextColor={colors.textMuted}
            keyboardType="number-pad"
            maxLength={14}
            value={aadhaar}
            onChangeText={(v) => { setAadhaar(formatAadhaar(v)); setError(''); }}
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}
        </View>

        <Text style={styles.sectionTitle}>Document Upload</Text>
        <View style={styles.uploadRow}>
          <UploadBox
            label="Aadhaar Front"
            icon="card-outline"
            image={aadhaarFront}
            onPress={() => pickImage(setAadhaarFront, 'Aadhaar Front')}
            required
          />
          <UploadBox
            label="Aadhaar Back"
            icon="card"
            image={aadhaarBack}
            onPress={() => pickImage(setAadhaarBack, 'Aadhaar Back')}
            required
          />
        </View>

        <Text style={styles.sectionTitle}>Live Selfie</Text>
        <TouchableOpacity style={[styles.selfieBox, selfie && styles.selfieBoxDone]} onPress={takeSelfie} activeOpacity={0.8}>
          {selfie ? (
            <View style={styles.selfieDone}>
              <Image source={{ uri: selfie }} style={styles.selfiePreview} />
              <View style={styles.selfieBadge}>
                <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                <Text style={styles.selfieText}>Selfie Captured</Text>
              </View>
              <Text style={styles.selfieRetake}>Tap to retake</Text>
            </View>
          ) : (
            <View style={styles.selfieEmpty}>
              <Ionicons name="camera" size={36} color={colors.primary} />
              <Text style={styles.selfieLabel}>Take Selfie</Text>
              <Text style={styles.selfieHint}>Use front camera in good lighting</Text>
            </View>
          )}
        </TouchableOpacity>

        <View style={styles.securityNote}>
          <Ionicons name="lock-closed" size={14} color={colors.success} />
          <Text style={styles.securityText}>
            Your documents are encrypted and used only for cooperative verification. They are never shared with third parties.
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.btn, (!aadhaarFront || !selfie) && styles.btnDisabled]}
          onPress={handleSubmit}
          activeOpacity={0.85}
          disabled={!aadhaarFront || !selfie}
        >
          <Text style={styles.btnText}>Submit KYC</Text>
          <Ionicons name="arrow-forward" size={16} color={colors.textInverse} style={{ marginLeft: 8 }} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.skipBtn} onPress={handleSubmit} activeOpacity={0.7}>
          <Text style={styles.skipText}>Skip for now (Demo Mode)</Text>
        </TouchableOpacity>
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
  card: {
    backgroundColor: colors.surface, borderRadius: 22, padding: 20,
    borderWidth: 1, borderColor: colors.border, marginBottom: 20,
  },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: colors.textPrimary, marginBottom: 12 },
  input: {
    backgroundColor: colors.surfaceSecondary, borderRadius: 14, paddingHorizontal: 14,
    paddingVertical: 13, fontSize: 16, color: colors.textPrimary,
    borderWidth: 1.5, borderColor: colors.border, letterSpacing: 2,
  },
  error: { fontSize: 12, color: colors.danger, marginTop: 8, fontWeight: '600' },
  uploadRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  uploadBox: {
    width: '48%', backgroundColor: colors.surface, borderRadius: 16,
    borderWidth: 1.5, borderColor: colors.border, borderStyle: 'dashed',
    minHeight: 120, alignItems: 'center', justifyContent: 'center', padding: 12,
  },
  uploadBoxDone: { borderStyle: 'solid', borderColor: colors.success },
  uploadEmpty: { alignItems: 'center' },
  uploadIcon: {
    width: 48, height: 48, borderRadius: 14, backgroundColor: colors.primarySubtle,
    alignItems: 'center', justifyContent: 'center', marginBottom: 8,
  },
  uploadLabel: { fontSize: 13, fontWeight: '700', color: colors.textPrimary },
  uploadRequired: { fontSize: 10, color: colors.warning, fontWeight: '700', marginTop: 2 },
  uploadHint: { fontSize: 11, color: colors.textMuted, marginTop: 4 },
  uploadDone: { alignItems: 'center', width: '100%' },
  uploadPreview: { width: '100%', height: 80, borderRadius: 10, marginBottom: 8 },
  uploadDoneBadge: { flexDirection: 'row', alignItems: 'center' },
  uploadDoneText: { fontSize: 12, color: colors.success, fontWeight: '700', marginLeft: 4 },
  selfieBox: {
    backgroundColor: colors.surface, borderRadius: 16, borderWidth: 1.5,
    borderColor: colors.border, borderStyle: 'dashed', minHeight: 140,
    alignItems: 'center', justifyContent: 'center', padding: 20, marginBottom: 16,
  },
  selfieBoxDone: { borderStyle: 'solid', borderColor: colors.success },
  selfieEmpty: { alignItems: 'center' },
  selfieLabel: { fontSize: 15, fontWeight: '700', color: colors.textPrimary, marginTop: 8 },
  selfieHint: { fontSize: 12, color: colors.textMuted, marginTop: 4 },
  selfieDone: { alignItems: 'center', width: '100%' },
  selfiePreview: { width: 100, height: 100, borderRadius: 50, marginBottom: 8 },
  selfieBadge: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  selfieText: { fontSize: 13, color: colors.success, fontWeight: '700', marginLeft: 4 },
  selfieRetake: { fontSize: 11, color: colors.textMuted },
  securityNote: {
    flexDirection: 'row', backgroundColor: colors.successLight,
    borderRadius: 12, padding: 12, marginBottom: 20,
    borderWidth: 1, borderColor: colors.success,
  },
  securityText: { fontSize: 11, color: colors.successDark, marginLeft: 8, flex: 1, lineHeight: 16 },
  btn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.primary, paddingVertical: 16, borderRadius: 14,
    shadowColor: colors.primary, shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25, shadowRadius: 6, elevation: 3, marginBottom: 12,
  },
  btnDisabled: { backgroundColor: colors.border },
  btnText: { fontSize: 15, fontWeight: '700', color: colors.textInverse },
  skipBtn: { alignItems: 'center', paddingVertical: 10 },
  skipText: { fontSize: 13, color: colors.textMuted, fontWeight: '600' },
});

export default Screen04_eKYC;
