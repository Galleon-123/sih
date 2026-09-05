import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

const RATING_CATEGORIES = [
  { key: 'punctuality', label: 'Customer Punctuality', icon: 'time-outline' },
  { key: 'cooperation', label: 'Cooperation & Respect', icon: 'handshake-outline' },
  { key: 'payment', label: 'Payment Smoothness', icon: 'wallet-outline' },
];

function StarRow({ value, onChange }) {
  return (
    <View style={styles.starRow}>
      {[1, 2, 3, 4, 5].map((star) => (
        <TouchableOpacity key={star} onPress={() => onChange(star)} activeOpacity={0.7}>
          <Ionicons
            name={star <= value ? 'star' : 'star-outline'}
            size={32}
            color={star <= value ? '#F59E0B' : colors.border}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
}

export const Screen_RatingScreen = ({ navigation }) => {
  const [ratings, setRatings] = useState({ punctuality: 0, cooperation: 0, payment: 0 });
  const [submitted, setSubmitted] = useState(false);

  const setRating = (key, val) => setRatings((prev) => ({ ...prev, [key]: val }));
  const allRated = Object.values(ratings).every((v) => v > 0);
  const avg = allRated ? (Object.values(ratings).reduce((a, b) => a + b, 0) / 3).toFixed(1) : null;

  const handleSubmit = () => setSubmitted(true);

  if (submitted) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.successContainer}>
          <View style={styles.successIcon}>
            <Ionicons name="checkmark-circle" size={64} color={colors.success} />
          </View>
          <Text style={styles.successTitle}>Rating Submitted!</Text>
          <Text style={styles.successSub}>
            You rated this customer {avg}★. Your feedback helps maintain a high-quality cooperative ecosystem.
          </Text>
          <TouchableOpacity
            style={styles.doneBtn}
            onPress={() => navigation.navigate('Home')}
            activeOpacity={0.85}
          >
            <Text style={styles.doneBtnText}>Back to Home</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <Ionicons name="star" size={28} color={colors.textInverse} />
          </View>
          <Text style={styles.title}>Rate the Customer</Text>
          <Text style={styles.subtitle}>Job completed! Share your experience to help fellow cooperative workers.</Text>
        </View>

        {RATING_CATEGORIES.map((cat) => (
          <View key={cat.key} style={styles.categoryCard}>
            <View style={styles.catHeader}>
              <View style={styles.catIcon}>
                <Ionicons name={cat.icon} size={20} color={colors.primary} />
              </View>
              <Text style={styles.catLabel}>{cat.label}</Text>
            </View>
            <StarRow value={ratings[cat.key]} onChange={(v) => setRating(cat.key, v)} />
          </View>
        ))}

        <TouchableOpacity
          style={[styles.submitBtn, !allRated && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={!allRated}
          activeOpacity={0.85}
        >
          <Ionicons name="checkmark-circle-outline" size={20} color={colors.textInverse} />
          <Text style={styles.submitBtnText}>Submit Rating</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.skipBtn}
          onPress={() => navigation.navigate('Home')}
          activeOpacity={0.7}
        >
          <Text style={styles.skipBtnText}>Skip for now</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 40 },
  header: {
    alignItems: 'center', marginBottom: 28,
  },
  headerIcon: {
    width: 72, height: 72, borderRadius: 36, backgroundColor: '#F59E0B',
    alignItems: 'center', justifyContent: 'center', marginBottom: 16,
    shadowColor: '#F59E0B', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3, shadowRadius: 12, elevation: 5,
  },
  title: { fontSize: 24, fontWeight: '900', color: colors.textPrimary, marginBottom: 8, textAlign: 'center' },
  subtitle: { fontSize: 14, color: colors.textSecondary, textAlign: 'center', lineHeight: 20 },
  categoryCard: {
    backgroundColor: colors.surface, borderRadius: 20, padding: 20,
    borderWidth: 1, borderColor: colors.border, marginBottom: 14,
  },
  catHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  catIcon: {
    width: 38, height: 38, borderRadius: 10, backgroundColor: colors.primarySubtle,
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  catLabel: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  starRow: { flexDirection: 'row', gap: 8 },
  submitBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#F59E0B', borderRadius: 16, paddingVertical: 16, gap: 10,
    shadowColor: '#F59E0B', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25, shadowRadius: 8, elevation: 4,
    marginBottom: 12,
  },
  submitBtnDisabled: { backgroundColor: colors.border, shadowOpacity: 0 },
  submitBtnText: { fontSize: 16, fontWeight: '700', color: colors.textInverse },
  skipBtn: { alignItems: 'center', paddingVertical: 10 },
  skipBtnText: { fontSize: 13, color: colors.textMuted, fontWeight: '600' },
  successContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  successIcon: { marginBottom: 20 },
  successTitle: { fontSize: 26, fontWeight: '900', color: colors.textPrimary, marginBottom: 12 },
  successSub: { fontSize: 14, color: colors.textSecondary, textAlign: 'center', lineHeight: 22, marginBottom: 32 },
  doneBtn: {
    backgroundColor: colors.primary, borderRadius: 16, paddingVertical: 16, paddingHorizontal: 40,
    alignItems: 'center',
  },
  doneBtnText: { fontSize: 16, fontWeight: '700', color: colors.textInverse },
});

export default Screen_RatingScreen;
