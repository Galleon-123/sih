import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, TextInput
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useWorker } from '../context/WorkerContext';
import LANGUAGES from '../data/languages.json';

export const Screen01_LanguageSelection = ({ navigation }) => {
  const { updateWorker, setLanguage, language, isLoggedIn } = useWorker();
  const [selected, setSelected] = useState(language || 'en');
  const [search, setSearch] = useState('');
  const [filterTab, setFilterTab] = useState('popular'); // 'popular' | 'all'

  const filteredLanguages = LANGUAGES.filter((l) => {
    const matchesSearch = !search || 
      l.name.toLowerCase().includes(search.toLowerCase()) || 
      l.nativeName.toLowerCase().includes(search.toLowerCase());
    if (filterTab === 'popular' && !search) {
      return (l.isPrimary || l.isPopular) && matchesSearch;
    }
    return matchesSearch;
  });

  const handleContinue = async () => {
    await setLanguage(selected);
    if (navigation.canGoBack() && isLoggedIn) {
      navigation.goBack();
    } else {
      navigation.navigate('MobileLogin');
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.heroSection}>
          <View style={styles.logoCircle}>
            <Ionicons name="construct" size={36} color={colors.textInverse} />
          </View>
          <Text style={styles.appName}>UniServ Worker</Text>
          <Text style={styles.tagline}>India's Cooperative Artisan Platform</Text>
        </View>

        <Text style={styles.heading}>Select Your Language / भाषा चुनें</Text>
        <Text style={styles.subheading}>Available in all 23 Scheduled Indian Languages for cooperative workers across India.</Text>

        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color={colors.textMuted} style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search language (e.g. Hindi, Tamil, Bangla)..."
            placeholderTextColor={colors.textMuted}
            value={search}
            onChangeText={setSearch}
          />
          {search ? (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          ) : null}
        </View>

        {!search && (
          <View style={styles.tabRow}>
            <TouchableOpacity
              style={[styles.tabBtn, filterTab === 'popular' && styles.tabBtnActive]}
              onPress={() => setFilterTab('popular')}
            >
              <Text style={[styles.tabBtnText, filterTab === 'popular' && styles.tabBtnTextActive]}>
                Popular (9)
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tabBtn, filterTab === 'all' && styles.tabBtnActive]}
              onPress={() => setFilterTab('all')}
            >
              <Text style={[styles.tabBtnText, filterTab === 'all' && styles.tabBtnTextActive]}>
                All 23 Languages
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.langGrid}>
          {filteredLanguages.map((lang) => (
            <TouchableOpacity
              key={lang.code}
              style={[styles.langCard, selected === lang.code && styles.langCardSelected]}
              onPress={() => setSelected(lang.code)}
              activeOpacity={0.8}
            >
              {selected === lang.code && (
                <View style={styles.checkBadge}>
                  <Ionicons name="checkmark" size={12} color={colors.textInverse} />
                </View>
              )}
              <Text style={styles.langFlag}>{lang.flag || '🇮🇳'}</Text>
              <Text style={[styles.langNative, selected === lang.code && styles.langNativeSelected]}>
                {lang.nativeName}
              </Text>
              <Text style={[styles.langEnglish, selected === lang.code && styles.langEnglishSelected]}>
                {lang.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.continueBtn} onPress={handleContinue} activeOpacity={0.85}>
          <Text style={styles.continueBtnText}>Continue / आगे बढ़ें</Text>
          <Ionicons name="arrow-forward" size={18} color={colors.textInverse} style={{ marginLeft: 8 }} />
        </TouchableOpacity>

        <View style={styles.footer}>
          <Ionicons name="shield-checkmark-outline" size={14} color={colors.textMuted} />
          <Text style={styles.footerText}>Ministry of Cooperation · MSCS Act 2002 Compliant</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { paddingHorizontal: 20, paddingTop: 28, paddingBottom: 36 },
  heroSection: { alignItems: 'center', marginBottom: 24 },
  logoCircle: {
    width: 68, height: 68, borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 12,
  },
  appName: { fontSize: 24, fontWeight: '800', color: colors.textPrimary, letterSpacing: -0.5 },
  tagline: { fontSize: 13, color: colors.textSecondary, marginTop: 4 },
  heading: { fontSize: 19, fontWeight: '700', color: colors.textPrimary, marginBottom: 4 },
  subheading: { fontSize: 13, color: colors.textSecondary, marginBottom: 16, lineHeight: 18 },
  searchBar: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.surface, borderRadius: 12,
    paddingHorizontal: 12, paddingVertical: 10,
    borderWidth: 1, borderColor: colors.border,
    marginBottom: 14,
  },
  searchInput: { flex: 1, fontSize: 13, color: colors.textPrimary },
  tabRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  tabBtn: {
    paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20,
    backgroundColor: colors.surfaceSecondary, borderWidth: 1, borderColor: colors.border,
  },
  tabBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  tabBtnText: { fontSize: 12, fontWeight: '600', color: colors.textSecondary },
  tabBtnTextActive: { color: colors.textInverse },
  langGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 20 },
  langCard: {
    width: '48%', backgroundColor: colors.surface,
    borderRadius: 14, padding: 14, marginBottom: 10,
    borderWidth: 1.5, borderColor: colors.border,
    alignItems: 'center', position: 'relative',
  },
  langCardSelected: { borderColor: colors.primary, backgroundColor: colors.primarySubtle },
  checkBadge: {
    position: 'absolute', top: 8, right: 8,
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  langFlag: { fontSize: 22, marginBottom: 4 },
  langNative: { fontSize: 15, fontWeight: '700', color: colors.textPrimary, marginBottom: 2, textAlign: 'center' },
  langNativeSelected: { color: colors.primaryDark },
  langEnglish: { fontSize: 12, color: colors.textMuted, textAlign: 'center' },
  langEnglishSelected: { color: colors.primary },
  continueBtn: {
    backgroundColor: colors.primary, borderRadius: 14,
    paddingVertical: 14, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25, shadowRadius: 8, elevation: 4,
    marginBottom: 20,
  },
  continueBtnText: { color: colors.textInverse, fontSize: 16, fontWeight: '700' },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  footerText: { fontSize: 11, color: colors.textMuted, fontWeight: '500' },
});

export default Screen01_LanguageSelection;
