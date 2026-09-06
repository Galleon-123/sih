import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Linking } from 'react-native';

const BASE = '/sih';

const APPS = [
  { label: 'User App', href: `${BASE}/app/`, active: true },
  { label: 'Worker App', href: `${BASE}/worker/` },
  { label: 'Organizer Portal', href: `${BASE}/organizer/` },
];

export default function WebAppBar() {
  if (Platform.OS !== 'web') return null;

  return (
    <View style={styles.bar}>
      <Text style={styles.brand}>UniServ</Text>
      <View style={styles.links}>
        {APPS.map((app) => (
          <TouchableOpacity
            key={app.label}
            onPress={() => Linking.openURL(app.href)}
            style={[styles.link, app.active && styles.linkActive]}
          >
            <Text style={[styles.linkText, app.active && styles.linkTextActive]}>
              {app.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e3a8a',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 12,
  },
  brand: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 16,
    marginRight: 8,
  },
  links: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  link: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  linkActive: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  linkText: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 13,
    fontWeight: '500',
  },
  linkTextActive: {
    color: '#fff',
    fontWeight: '700',
  },
});
