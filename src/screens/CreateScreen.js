import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import FlareButton from '../components/FlareButton';
import { colors } from '../theme/colors';
import { usePremium } from '../context/PremiumContext';

const TYPES = [
  { key: 'url', label: 'URL' },
  { key: 'text', label: 'Text' },
  { key: 'email', label: 'Email' },
  { key: 'phone', label: 'Phone' },
  { key: 'wifi', label: 'Wi-Fi' },
];

export default function CreateScreen({ navigation }) {
  const [type, setType] = useState('url');
  const [value, setValue] = useState('');
  const [ssid, setSsid] = useState('');
  const [password, setPassword] = useState('');
  const [encryption, setEncryption] = useState('WPA');
  const { canGenerate, remainingGenerations, incrementGeneration, isPremium } = usePremium();

  const payload = useMemo(() => {
    switch (type) {
      case 'url':
        return value.trim();
      case 'text':
        return value;
      case 'email':
        return value.trim() ? `mailto:${value.trim()}` : '';
      case 'phone':
        return value.trim() ? `tel:${value.trim()}` : '';
      case 'wifi':
        if (!ssid) return '';
        return `WIFI:T:${encryption};S:${ssid};P:${password};;`;
      default:
        return value;
    }
  }, [type, value, ssid, password, encryption]);

  const hasPayload = payload && payload.length > 0;

  const placeholder = {
    url: 'https://yourbrand.com',
    text: 'Type anything…',
    email: 'hello@yourbrand.com',
    phone: '+1 555 123 4567',
  }[type];

  const handleGenerate = useCallback(() => {
    if (!canGenerate) {
      Alert.alert(
        'Free Limit Reached',
        'You\'ve used your 3 free QR codes. Upgrade to Premium for unlimited generations!',
        [
          { text: 'Upgrade', onPress: () => navigation.navigate('Upgrade') },
          { text: 'Cancel', style: 'cancel' },
        ]
      );
      return;
    }
    incrementGeneration();
    navigation.navigate('Preview', { payload, type });
  }, [canGenerate, incrementGeneration, payload, type, navigation]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1, backgroundColor: colors.bg }}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>New QR</Text>
        <Text style={styles.subtitle}>Pick a type, drop in content, generate.</Text>

        <Text style={styles.sectionLabel}>Type</Text>
        <View style={styles.types}>
          {TYPES.map((t) => {
            const active = type === t.key;
            return (
              <Pressable
                key={t.key}
                onPress={() => setType(t.key)}
                style={[styles.typeChip, active && styles.typeChipActive]}
              >
                <Text style={[styles.typeText, active && styles.typeTextActive]}>
                  {t.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.sectionLabel}>Content</Text>

        {type !== 'wifi' ? (
          <TextInput
            key={type}
            value={value}
            onChangeText={setValue}
            placeholder={placeholder}
            placeholderTextColor={colors.textMuted}
            style={styles.input}
            autoCapitalize={type === 'text' ? 'sentences' : 'none'}
            keyboardType={
              type === 'email'
                ? 'email-address'
                : type === 'phone'
                ? 'phone-pad'
                : 'default'
            }
            multiline={type === 'text'}
            autoCorrect={false}
          />
        ) : (
          <View>
            <TextInput
              value={ssid}
              onChangeText={setSsid}
              placeholder="Network name (SSID)"
              placeholderTextColor={colors.textMuted}
              style={styles.input}
              autoCapitalize="none"
            />
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Password"
              placeholderTextColor={colors.textMuted}
              style={[styles.input, { marginTop: 12 }]}
              autoCapitalize="none"
              secureTextEntry
            />
            <View style={[styles.types, { marginTop: 14 }]}>
              {['WPA', 'WEP', 'nopass'].map((e) => {
                const active = encryption === e;
                return (
                  <Pressable
                    key={e}
                    onPress={() => setEncryption(e)}
                    style={[styles.typeChip, active && styles.typeChipActive]}
                  >
                    <Text style={[styles.typeText, active && styles.typeTextActive]}>
                      {e}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        )}

        <View style={{ height: 36 }} />

        {!isPremium && (
          <Text style={styles.limitText}>
            {canGenerate
              ? `${remainingGenerations} free generation${remainingGenerations === 1 ? '' : 's'} remaining`
              : 'Free limit reached'}
          </Text>
        )}
        <FlareButton
          title={canGenerate ? 'Generate' : 'Upgrade to Generate'}
          disabled={!hasPayload}
          onPress={handleGenerate}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 28,
    paddingBottom: 80,
  },
  title: {
    color: colors.text,
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: -0.8,
  },
  subtitle: {
    color: colors.textDim,
    fontSize: 15,
    marginTop: 6,
    marginBottom: 28,
  },
  sectionLabel: {
    color: colors.accentCyan,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 2.2,
    textTransform: 'uppercase',
    marginBottom: 14,
    marginTop: 10,
  },
  types: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 28,
  },
  typeChip: {
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 999,
    backgroundColor: colors.bgElevated,
    borderWidth: 1,
    borderColor: colors.border,
  },
  typeChipActive: {
    backgroundColor: '#22D3EE18',
    borderColor: colors.accentCyan,
    shadowColor: colors.accentCyan,
    shadowOpacity: 0.5,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
  },
  typeText: {
    color: colors.textDim,
    fontWeight: '700',
    fontSize: 13,
    letterSpacing: 0.8,
  },
  typeTextActive: {
    color: '#fff',
  },
  input: {
    backgroundColor: colors.bgElevated,
    borderRadius: 18,
    paddingVertical: 20,
    paddingHorizontal: 20,
    color: colors.text,
    fontSize: 16,
    fontWeight: '500',
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 62,
  },
  limitText: {
    color: colors.accentPink,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    textAlign: 'center',
    marginBottom: 14,
  },
});
