import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useBooking } from '../context/BookingContext';
import { useUser } from '../context/UserContext';
import Header from '../components/Header';

export const Screen14_RatingScreen = ({ navigation }) => {
  const { activeBooking, submitRating } = useBooking();
  const { t } = useUser();
  const worker = activeBooking?.worker;

  const [rating, setRating] = useState(5);
  const [selectedTags, setSelectedTags] = useState(['On time', 'Skilled & Clean']);
  const [reviewText, setReviewText] = useState('Excellent work. Solved the water pipe leak cleanly.');

  const TAGS = [
    'On time',
    'Skilled & Clean',
    'Professional',
    'Fair pricing',
    'Wore Safety Gear',
    'Friendly',
    'Good advice'
  ];

  const toggleTag = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSubmit = () => {
    try {
      if (typeof submitRating === 'function') {
        submitRating(rating, selectedTags, reviewText);
      }
    } catch (err) {
      console.warn('Rating submit error:', err);
    }
    
    // Cleanly redirect back to Home Tab
    navigation.reset({
      index: 0,
      routes: [{ name: 'MainTabs' }]
    });
  };

  const getRatingLabel = (stars) => {
    switch (stars) {
      case 5:
        return 'Outstanding Service! 🌟';
      case 4:
        return 'Great Experience! 👍';
      case 3:
        return 'Average Service 😐';
      case 2:
        return 'Needs Improvement ⚠️';
      default:
        return 'Poor Experience ❌';
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title="Rate & Review"
        showBack
        onBack={() => navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] })}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Worker Summary Hero */}
        <View style={styles.workerHero}>
          <Image
            source={{ uri: worker?.photo || 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=300&q=80' }}
            style={styles.workerPhoto}
          />
          <Text style={styles.workerName}>{worker?.name || 'Rajan Kumar'}</Text>
          <Text style={styles.workerSociety}>{worker?.cooperative || 'Delhi Labour Cooperative'}</Text>
        </View>

        {/* 5-Star Selector Card */}
        <View style={styles.ratingCard}>
          <Text style={styles.ratingCardTitle}>How was your service experience?</Text>

          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity
                key={star}
                onPress={() => setRating(star)}
                activeOpacity={0.7}
                style={styles.starTouch}
              >
                <Ionicons
                  name={star <= rating ? 'star' : 'star-outline'}
                  size={36}
                  color={star <= rating ? '#F59E0B' : colors.textMuted}
                />
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.ratingLabelText}>{getRatingLabel(rating)}</Text>
        </View>

        {/* Compliment Tags Card */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>WHAT DID YOU LIKE MOST?</Text>
          <View style={styles.tagsContainer}>
            {TAGS.map((tag) => {
              const isSelected = selectedTags.includes(tag);
              return (
                <TouchableOpacity
                  key={tag}
                  style={[styles.tagPill, isSelected && styles.tagPillSelected]}
                  onPress={() => toggleTag(tag)}
                  activeOpacity={0.75}
                >
                  <Text style={[styles.tagText, isSelected && styles.tagTextSelected]}>
                    {tag}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Written Review */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>{t('writeReview')}</Text>
          <TextInput
            style={styles.textArea}
            value={reviewText}
            onChangeText={setReviewText}
            placeholder="Share your experience to help the cooperative..."
            placeholderTextColor={colors.textMuted}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>
      </ScrollView>

      {/* Sticky Bottom Submit Button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.submitBtn}
          onPress={handleSubmit}
          activeOpacity={0.85}
        >
          <Text style={styles.submitBtnText}>{t('submitReview')}</Text>
          <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" style={{ marginLeft: 6 }} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 90
  },
  workerHero: {
    alignItems: 'center',
    marginBottom: 18
  },
  workerPhoto: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.surfaceSecondary,
    marginBottom: 10
  },
  workerName: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary
  },
  workerSociety: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2
  },
  ratingCard: {
    backgroundColor: colors.surface,
    borderRadius: 22,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 14,
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2
  },
  ratingCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 14
  },
  starsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 10
  },
  starTouch: {
    padding: 2
  },
  ratingLabelText: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.primary
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 14
  },
  cardLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 0.5,
    marginBottom: 10
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  tagPill: {
    backgroundColor: colors.surfaceSecondary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border
  },
  tagPillSelected: {
    backgroundColor: colors.primarySubtle,
    borderColor: colors.primaryLight
  },
  tagText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600'
  },
  tagTextSelected: {
    color: colors.primary,
    fontWeight: '700'
  },
  textArea: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 70
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: colors.border
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4
  },
  submitBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF'
  }
});

export default Screen14_RatingScreen;
