import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView,
  ScrollView, TextInput, Image, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { colors } from '../theme/colors';
import { useWorker } from '../context/WorkerContext';

const EXPERIENCE_OPTIONS = ['Less than 1 year', '1-2 years', '3-5 years', '5-10 years', 'More than 10 years'];

export const Screen05a_UploadCertificates = ({ navigation }) => {
  const { updateWorker, generateWorkerId, t } = useWorker();
  const [certImage, setCertImage] = useState(null);
  const [certName, setCertName] = useState('');
  const [issuingBody, setIssuingBody] = useState('');
  const [experience, setExperience] = useState('3-5 years');

  const pickCertificate = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant photo access.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.9,
    });
    if (!result.canceled && result.assets[0]) {
      setCertImage(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    const workerId = generateWorkerId ? generateWorkerId() : 'UW-2026-001';
    await updateWorker({
      workerId,
      certificates: [{ name: certName || 'Trade Certificate', uri: certImage, issuingBody }],
      experience,
      verificationStatus: 'pending',
    });
    navigation.navigate('PendingVerification');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>

        <View style={styles.header}>
          <View style={styles.iconCircle}>
            <Ionicons name="document-text" size={28} color={colors.primary} />
          </View>
          <Text style={styles.title}>{t('uploadCertBtn', 'Upload Certificates')}</Text>
          <Text style={styles.subtitle}>{t('certCheckSub', 'Upload your trade certification and provide details for verification.')}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>{t('tradeCertificate', 'Certificate Details')}</Text>
          <Text style={styles.label}>{t('tradeCertificate', 'Certificate Name')}</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. ITI Electrician Certificate"
            placeholderTextColor={colors.textMuted}
            value={certName}
            onChangeText={setCertName}
          />
          <Text style={styles.label}>Issuing Authority</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. ITI Delhi, NSDC, State Board"
            placeholderTextColor={colors.textMuted}
            value={issuingBody}
            onChangeText={setIssuingBody}
          />
        </View>

        <Text style={styles.sectionTitle}>{t('uploadCertBtn', 'Certificate Upload')}</Text>
        <TouchableOpacity
          style={[styles.uploadBox, certImage && styles.uploadBoxDone]}
          onPress={pickCertificate}
          activeOpacity={0.8}
        >
          {certImage ? (
            <View style={styles.uploadPreviewWrap}>
              <Image source={{ uri: certImage }} style={styles.certPreview} />
              <View style={styles.uploadedBadge}>
                <Ionicons name="checkmark-circle" size={18} color={colors.success} />
                <Text style={styles.uploadedText}>{t('uploaded', 'Certificate Uploaded')}</Text>
              </View>
              <Text style={styles.tapRetake}>Tap to change</Text>
            </View>
          ) : (
            <View style={styles.uploadEmptyWrap}>
              <Ionicons name="cloud-upload-outline" size={40} color={colors.primary} />
              <Text style={styles.uploadEmptyLabel}>{t('uploadCertBtn', 'Upload Certificate')}</Text>
              <Text style={styles.uploadEmptyHint}>JPG, PNG — Max 5MB</Text>
            </View>
          )}
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>{t('experience', 'Work Experience')}</Text>
        <View style={styles.experienceGrid}>
          {EXPERIENCE_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt}
              style={[styles.expChip, experience === opt && styles.expChipSelected]}
              onPress={() => setExperience(opt)}
              activeOpacity={0.8}
            >
              <Text style={[styles.expChipText, experience === opt && styles.expChipTextSelected]}>
                {opt}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.verificationNote}>
          <Ionicons name="time-outline" size={16} color={colors.warning} />
          <Text style={styles.verificationNoteText}>
            Your certificates will be reviewed by the cooperative organizer within 24-48 hours. You will receive an SMS notification.
          </Text>
        </View>

        <TouchableOpacity style={styles.btn} onPress={handleSubmit} activeOpacity={0.85}>
          <Text style={styles.btnText}>{t('proceedToPending', 'Submit for Verification')}</Text>
          <Ionicons name="checkmark-circle" size={16} color={colors.textInverse} style={{ marginLeft: 8 }} />
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
  label: { fontSize: 13, fontWeight: '700', color: colors.textPrimary, marginBottom: 8 },
  input: {
    backgroundColor: colors.surfaceSecondary, borderRadius: 14, paddingHorizontal: 14,
    paddingVertical: 13, fontSize: 15, color: colors.textPrimary,
    borderWidth: 1.5, borderColor: colors.border, marginBottom: 16,
  },
  uploadBox: {
    backgroundColor: colors.surface, borderRadius: 16, borderWidth: 1.5,
    borderColor: colors.border, borderStyle: 'dashed', minHeight: 140,
    alignItems: 'center', justifyContent: 'center', padding: 20, marginBottom: 20,
  },
  uploadBoxDone: { borderStyle: 'solid', borderColor: colors.success },
  uploadPreviewWrap: { alignItems: 'center', width: '100%' },
  certPreview: { width: '100%', height: 120, borderRadius: 12, marginBottom: 10 },
  uploadedBadge: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  uploadedText: { fontSize: 13, color: colors.success, fontWeight: '700', marginLeft: 6 },
  tapRetake: { fontSize: 11, color: colors.textMuted },
  uploadEmptyWrap: { alignItems: 'center' },
  uploadEmptyLabel: { fontSize: 15, fontWeight: '700', color: colors.textPrimary, marginTop: 10 },
  uploadEmptyHint: { fontSize: 12, color: colors.textMuted, marginTop: 4 },
  experienceGrid: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 20 },
  expChip: {
    backgroundColor: colors.surface, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8,
    borderWidth: 1.5, borderColor: colors.border, margin: 4,
  },
  expChipSelected: { backgroundColor: colors.primarySubtle, borderColor: colors.primary },
  expChipText: { fontSize: 13, color: colors.textSecondary, fontWeight: '600' },
  expChipTextSelected: { color: colors.primary, fontWeight: '700' },
  verificationNote: {
    flexDirection: 'row', backgroundColor: colors.warningLight, borderRadius: 14,
    padding: 12, marginBottom: 20, borderWidth: 1, borderColor: colors.warning,
  },
  verificationNoteText: { fontSize: 12, color: colors.warningDark, marginLeft: 8, flex: 1, lineHeight: 16 },
  btn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.primary, paddingVertical: 16, borderRadius: 14,
    shadowColor: colors.primary, shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25, shadowRadius: 6, elevation: 3,
  },
  btnText: { fontSize: 15, fontWeight: '700', color: colors.textInverse },
});

export default Screen05a_UploadCertificates;
