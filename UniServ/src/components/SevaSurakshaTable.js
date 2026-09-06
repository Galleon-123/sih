import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

export const SEVA_SURAKSHA_SCENARIOS = [
  {
    id: 1,
    problem: 'No worker available nearby',
    icon: 'search',
    color: colors.primary,
    solution: 'Searches partner cooperative network, schedules earliest available slot, or auto-assigns priority waitlist.',
    tag: 'Network Auto-Expand'
  },
  {
    id: 2,
    problem: 'Worker cancels booking',
    icon: 'close-circle',
    color: colors.danger,
    solution: 'Instant automatic priority replacement search with zero cancellation penalty for customer.',
    tag: 'Auto Replacement'
  },
  {
    id: 3,
    problem: 'Worker is running late',
    icon: 'time',
    color: colors.warning,
    solution: 'Live revised ETA updates with 1-tap option to switch to another nearby available artisan.',
    tag: 'Dynamic ETA'
  },
  {
    id: 4,
    problem: 'Wrong person arrives at doorstep',
    icon: 'person-remove',
    color: colors.danger,
    solution: 'Do not share Start OTP! 1-tap identity mismatch report triggers immediate cooperative inspection.',
    tag: 'OTP Shield'
  },
  {
    id: 5,
    problem: 'Work cost increases during job',
    icon: 'calculator',
    color: colors.cooperativePurple,
    solution: 'Worker cannot charge extra unilaterally. Customer explicit in-app approval is strictly required.',
    tag: 'In-App Approval'
  },
  {
    id: 6,
    problem: 'Payment transaction fails',
    icon: 'card',
    color: colors.warning,
    solution: 'Automatic payment retry gateway, switch to cash on delivery, or instantaneous support escalation.',
    tag: 'Zero-Lock Payment'
  },
  {
    id: 7,
    problem: 'Poor work quality / recurring leak',
    icon: 'refresh-circle',
    color: colors.success,
    solution: '7-Day Seva Suraksha Warranty: Free re-inspection & rework by a senior master artisan.',
    tag: '7-Day Warranty'
  },
  {
    id: 8,
    problem: 'Safety concern or dispute',
    icon: 'shield-alert',
    color: colors.danger,
    solution: 'Direct 24/7 Cooperative Organiser hotline intervention and field supervisor escalation.',
    tag: 'Field Arbitration'
  },
  {
    id: 9,
    problem: 'Worker no-show after confirmation',
    icon: 'alert-circle',
    color: colors.danger,
    solution: 'Priority reassignment within 5 minutes + cooperative disciplinary review for delinquent worker.',
    tag: 'Disciplinary Trust'
  }
];

export const SevaSurakshaTable = ({ onReportIssue }) => {
  const [expandedId, setExpandedId] = useState(null);

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.shieldIconWrap}>
          <Ionicons name="shield-checkmark" size={24} color={colors.primary} />
        </View>
        <View style={styles.headerTextCol}>
          <Text style={styles.title}>Seva Suraksha Guarantee</Text>
          <Text style={styles.subtitle}>
            Cooperative-backed resolution framework for all 9 service edge cases.
          </Text>
        </View>
      </View>

      {/* Scenario Cards */}
      <View style={styles.list}>
        {SEVA_SURAKSHA_SCENARIOS.map((item) => {
          const isExpanded = expandedId === item.id;
          return (
            <TouchableOpacity
              key={item.id}
              style={[styles.scenarioCard, isExpanded && styles.scenarioCardActive]}
              onPress={() => toggleExpand(item.id)}
              activeOpacity={0.8}
            >
              <View style={styles.cardHeaderRow}>
                <View style={[styles.iconBox, { backgroundColor: item.color + '15' }]}>
                  <Ionicons name={item.icon} size={16} color={item.color} />
                </View>

                <View style={styles.cardTitleCol}>
                  <Text style={styles.problemText}>{item.problem}</Text>
                  <View style={[styles.tagPill, { backgroundColor: item.color + '12' }]}>
                    <Text style={[styles.tagText, { color: item.color }]}>{item.tag}</Text>
                  </View>
                </View>

                <Ionicons
                  name={isExpanded ? 'chevron-up' : 'chevron-down'}
                  size={18}
                  color={colors.textMuted}
                />
              </View>

              {/* Expanded Solution */}
              {isExpanded && (
                <View style={styles.expandedContent}>
                  <View style={styles.solutionRow}>
                    <Ionicons name="checkmark-circle" size={16} color={colors.success} style={{ marginTop: 2 }} />
                    <Text style={styles.solutionText}>{item.solution}</Text>
                  </View>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Bottom CTA */}
      {onReportIssue && (
        <TouchableOpacity
          style={styles.emergencyReportBtn}
          onPress={onReportIssue}
          activeOpacity={0.85}
        >
          <Ionicons name="warning" size={16} color="#FFFFFF" />
          <Text style={styles.emergencyReportText}>I Have An Issue Right Now</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight
  },
  shieldIconWrap: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.primarySubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12
  },
  headerTextCol: {
    flex: 1
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.textPrimary
  },
  subtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
    lineHeight: 16
  },
  list: {
    gap: 10
  },
  scenarioCard: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.borderLight
  },
  scenarioCardActive: {
    backgroundColor: colors.surface,
    borderColor: colors.primaryLight
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10
  },
  cardTitleCol: {
    flex: 1
  },
  problemText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary
  },
  tagPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
    marginTop: 3
  },
  tagText: {
    fontSize: 10,
    fontWeight: '800'
  },
  expandedContent: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight
  },
  solutionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start'
  },
  solutionText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: 8,
    flex: 1,
    lineHeight: 18,
    fontWeight: '500'
  },
  emergencyReportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.danger,
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 18,
    shadowColor: colors.danger,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3
  },
  emergencyReportText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: 8
  }
});

export default SevaSurakshaTable;
