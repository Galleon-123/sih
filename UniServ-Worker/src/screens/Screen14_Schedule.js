import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Switch
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useWorker } from '../context/WorkerContext';
import { MOCK_UPCOMING_BOOKINGS } from '../data/mockJobs';

const generateWeekDates = () => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const result = [];
  const today = new Date();
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const dayName = days[d.getDay()];
    const dateNum = d.getDate();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(dateNum).padStart(2, '0');
    const fullDate = `${yyyy}-${mm}-${dd}`;
    result.push({
      dayName,
      date: dateNum,
      fullDate,
      isToday: i === 0,
    });
  }
  return result;
};

const safeFormatDate = (dateStr) => {
  if (!dateStr) return { day: '1', month: 'Jan' };
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return { day: '1', month: 'Jan' };
  return {
    day: d.getDate(),
    month: d.toLocaleDateString('en-IN', { month: 'short' }),
  };
};

export const Screen14_Schedule = () => {
  const { t } = useWorker();
  const SLOTS = [
    { id: 'morning', label: t('morning', 'Morning'), time: '6 AM – 12 PM', icon: 'sunny-outline' },
    { id: 'afternoon', label: t('afternoon', 'Afternoon'), time: '12 PM – 6 PM', icon: 'partly-sunny-outline' },
    { id: 'evening', label: t('evening', 'Evening'), time: '6 PM – 10 PM', icon: 'moon-outline' },
  ];
  const dates = generateWeekDates();
  const [selectedDate, setSelectedDate] = useState(dates[0].fullDate);
  const [availability, setAvailability] = useState({ morning: true, afternoon: true, evening: false });
  const [offDays, setOffDays] = useState([]);

  const toggleOffDay = (date) => {
    setOffDays((prev) =>
      prev.includes(date) ? prev.filter((d) => d !== date) : [...prev, date]
    );
  };

  const toggleSlot = (slot) => {
    setAvailability((prev) => ({ ...prev, [slot]: !prev[slot] }));
  };

  const upcomingForDate = MOCK_UPCOMING_BOOKINGS.filter((b) => b.date === selectedDate);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.pageTitle}>{t('mySchedule', 'My Schedule')}</Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateStrip} contentContainerStyle={{ paddingHorizontal: 4 }}>
          {dates.map((d) => (
            <TouchableOpacity
              key={d.fullDate}
              style={[
                styles.dateCard,
                selectedDate === d.fullDate && styles.dateCardSelected,
                offDays.includes(d.fullDate) && styles.dateCardOff,
              ]}
              onPress={() => setSelectedDate(d.fullDate)}
              activeOpacity={0.8}
            >
              <Text style={[
                styles.dayName,
                selectedDate === d.fullDate && styles.dayNameSelected,
                offDays.includes(d.fullDate) && styles.dayNameOff,
              ]}>
                {d.dayName}
              </Text>
              <Text style={[
                styles.dateNum,
                selectedDate === d.fullDate && styles.dateNumSelected,
                offDays.includes(d.fullDate) && styles.dateNumOff,
              ]}>
                {d.date}
              </Text>
              {d.isToday && <View style={styles.todayDot} />}
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.availabilityCard}>
          <View style={styles.availabilityHeader}>
            <Text style={styles.sectionTitle}>{t('availability', 'Availability on')} {selectedDate}</Text>
            <TouchableOpacity
              style={[styles.offDayBtn, offDays.includes(selectedDate) && styles.offDayBtnActive]}
              onPress={() => toggleOffDay(selectedDate)}
              activeOpacity={0.8}
            >
              <Text style={[styles.offDayBtnText, offDays.includes(selectedDate) && styles.offDayBtnTextActive]}>
                {offDays.includes(selectedDate) ? `🚫 ${t('dayOff', 'Day Off')}` : t('markOffDay', 'Mark Off Day')}
              </Text>
            </TouchableOpacity>
          </View>
          {offDays.includes(selectedDate) ? (
            <View style={styles.offDayBanner}>
              <Ionicons name="moon" size={18} color={colors.textMuted} />
              <Text style={styles.offDayBannerText}>{t('offDayNote', 'You have marked this day as off. You will not receive job requests.')}</Text>
            </View>
          ) : (
            SLOTS.map((slot) => (
              <View key={slot.id} style={styles.slotRow}>
                <View style={styles.slotIcon}>
                  <Ionicons name={slot.icon} size={18} color={availability[slot.id] ? colors.primary : colors.textMuted} />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.slotLabel}>{slot.label}</Text>
                  <Text style={styles.slotTime}>{slot.time}</Text>
                </View>
                <Switch
                  value={availability[slot.id]}
                  onValueChange={() => toggleSlot(slot.id)}
                  trackColor={{ false: colors.border, true: colors.primarySubtle }}
                  thumbColor={availability[slot.id] ? colors.primary : colors.textMuted}
                />
              </View>
            ))
          )}
        </View>

        <Text style={styles.sectionTitle}>{t('upcomingBookings', 'Upcoming Bookings')}</Text>
        {MOCK_UPCOMING_BOOKINGS.map((booking) => (
          <View key={booking.id} style={styles.bookingCard}>
            <View style={styles.bookingDateBadge}>
              <Text style={styles.bookingDateText}>{safeFormatDate(booking.date).day}</Text>
              <Text style={styles.bookingMonthText}>
                {safeFormatDate(booking.date).month}
              </Text>
            </View>
            <View style={{ flex: 1, marginLeft: 14 }}>
              <Text style={styles.bookingService}>{booking.service}</Text>
              <View style={styles.bookingMeta}>
                <Ionicons name="location-outline" size={12} color={colors.textMuted} />
                <Text style={styles.bookingMetaText}>{booking.customerArea}</Text>
                <Ionicons name="time-outline" size={12} color={colors.textMuted} style={{ marginLeft: 8 }} />
                <Text style={styles.bookingMetaText}>{booking.time}</Text>
              </View>
            </View>
            <Text style={styles.bookingEarning}>₹{booking.estimatedEarning}</Text>
          </View>
        ))}

        {MOCK_UPCOMING_BOOKINGS.length === 0 && (
          <View style={styles.noBookings}>
            <Ionicons name="calendar-outline" size={40} color={colors.textMuted} />
            <Text style={styles.noBookingsText}>{t('noUpcomingBookings', 'No upcoming bookings')}</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { paddingTop: 16, paddingBottom: 30 },
  pageTitle: { fontSize: 22, fontWeight: '800', color: colors.textPrimary, marginBottom: 16, paddingHorizontal: 20 },
  dateStrip: { marginBottom: 16 },
  dateCard: {
    width: 56, marginHorizontal: 4, backgroundColor: colors.surface, borderRadius: 16,
    padding: 10, alignItems: 'center', borderWidth: 1.5, borderColor: colors.border,
  },
  dateCardSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  dateCardOff: { backgroundColor: colors.surfaceTertiary, borderColor: colors.border, opacity: 0.6 },
  dayName: { fontSize: 11, fontWeight: '600', color: colors.textMuted },
  dayNameSelected: { color: 'rgba(255,255,255,0.8)' },
  dayNameOff: { color: colors.textMuted },
  dateNum: { fontSize: 20, fontWeight: '800', color: colors.textPrimary },
  dateNumSelected: { color: colors.textInverse },
  dateNumOff: { color: colors.textMuted },
  todayDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: colors.danger, marginTop: 2 },
  availabilityCard: {
    backgroundColor: colors.surface, borderRadius: 22, padding: 20,
    borderWidth: 1, borderColor: colors.border, marginHorizontal: 20, marginBottom: 16,
  },
  availabilityHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.textPrimary, paddingHorizontal: 20, marginBottom: 12 },
  offDayBtn: {
    backgroundColor: colors.surfaceSecondary, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6,
    borderWidth: 1, borderColor: colors.border,
  },
  offDayBtnActive: { backgroundColor: colors.warningLight, borderColor: colors.warning },
  offDayBtnText: { fontSize: 12, fontWeight: '700', color: colors.textSecondary },
  offDayBtnTextActive: { color: colors.warningDark },
  offDayBanner: {
    flexDirection: 'row', backgroundColor: colors.surfaceSecondary,
    borderRadius: 14, padding: 14, gap: 10,
  },
  offDayBannerText: { fontSize: 13, color: colors.textSecondary, flex: 1, lineHeight: 18 },
  slotRow: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: colors.borderLight,
  },
  slotIcon: {
    width: 36, height: 36, borderRadius: 10, backgroundColor: colors.surfaceSecondary,
    alignItems: 'center', justifyContent: 'center',
  },
  slotLabel: { fontSize: 14, fontWeight: '700', color: colors.textPrimary },
  slotTime: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  bookingCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface,
    borderRadius: 16, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: colors.border,
    marginHorizontal: 20,
  },
  bookingDateBadge: {
    width: 46, height: 52, backgroundColor: colors.primarySubtle,
    borderRadius: 12, alignItems: 'center', justifyContent: 'center',
  },
  bookingDateText: { fontSize: 20, fontWeight: '900', color: colors.primary },
  bookingMonthText: { fontSize: 10, fontWeight: '700', color: colors.primary },
  bookingService: { fontSize: 14, fontWeight: '700', color: colors.textPrimary, marginBottom: 4 },
  bookingMeta: { flexDirection: 'row', alignItems: 'center' },
  bookingMetaText: { fontSize: 11, color: colors.textMuted, marginLeft: 2 },
  bookingEarning: { fontSize: 16, fontWeight: '800', color: colors.success },
  noBookings: { alignItems: 'center', paddingVertical: 40, paddingHorizontal: 20 },
  noBookingsText: { fontSize: 15, color: colors.textMuted, marginTop: 12 },
});

export default Screen14_Schedule;
