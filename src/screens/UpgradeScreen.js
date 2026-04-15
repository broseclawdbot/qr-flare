import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import FlareButton from '../components/FlareButton';
import { colors, flareGradient, flareTints } from '../theme/colors';
import { usePremium } from '../context/PremiumContext';

const FEATURES = [
  {
    title: 'Unlimited QR codes',
    desc: 'No more 3-per-session limit. Generate as many as you need.',
    color: colors.accentTeal,
  },
  {
    title: 'Add your logo',
    desc: 'Drop a brand mark in the center of any QR.',
    color: colors.accentCyan,
  },
  {
    title: '5 premium templates',
    desc: 'Beautiful, ready-to-share layouts.',
    color: colors.accentPurple,
  },
  {
    title: 'Custom colors',
    desc: 'Match foreground + background to your brand.',
    color: colors.accentPink,
  },
];

export default function UpgradeScreen({ navigation }) {
  const { isPremium, unlockPremium, lockPremium } = usePremium();
  const [justUnlocked, setJustUnlocked] = useState(false);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <LinearGradient
        colors={[flareTints.pink, 'transparent']}
        style={styles.ambient}
        start={{ x: 1, y: 0 }}
        end={{ x: 0, y: 1 }}
      />

      <View style={styles.heroWrap}>
        <LinearGradient
          colors={flareGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroGlow}
        />
        <View style={styles.hero}>
          <Text style={styles.heroTag}>PREMIUM</Text>
          <Text style={styles.heroTitle}>Make Your QR{'\n'}Stand Out.</Text>
          <Text style={styles.heroSub}>
            Premium branding tools for QR Flare.
          </Text>
        </View>
      </View>

      <View style={styles.features}>
        {FEATURES.map((f) => (
          <View key={f.title} style={styles.feature}>
            <View
              style={[
                styles.dot,
                {
                  backgroundColor: f.color,
                  shadowColor: f.color,
                },
              ]}
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.featureTitle}>{f.title}</Text>
              <Text style={styles.featureDesc}>{f.desc}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={{ height: 20 }} />

      {isPremium || justUnlocked ? (
        <>
          <View style={styles.unlockedBadge}>
            <Text style={styles.unlockedEmoji}>&#10003;</Text>
            <Text style={styles.unlockedText}>PREMIUM UNLOCKED</Text>
            <Text style={styles.unlockedSub}>
              Unlimited QR codes, logos, templates, and colors are now yours.
            </Text>
          </View>
          <View style={{ height: 14 }} />
          <FlareButton title="Start Creating" onPress={() => navigation.navigate('Create')} />
          <View style={{ height: 10 }} />
          <FlareButton title="Customize a QR" variant="secondary" onPress={() => navigation.navigate('Create')} />
        </>
      ) : (
        <>
          <FlareButton
            title="Unlock Premium — $4.99"
            onPress={() => {
              unlockPremium();
              setJustUnlocked(true);
            }}
          />
          <Text style={styles.note}>
            One-time purchase · Unlock all features forever
          </Text>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 28,
    paddingBottom: 80,
  },
  ambient: {
    position: 'absolute',
    top: -160,
    right: -160,
    width: 500,
    height: 500,
    borderRadius: 500,
  },
  heroWrap: {
    borderRadius: 30,
    padding: 2.5,
    marginBottom: 28,
    shadowColor: '#F472B6',
    shadowOpacity: 0.55,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 12 },
    elevation: 14,
  },
  heroGlow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 30,
  },
  hero: {
    borderRadius: 28,
    padding: 30,
    backgroundColor: '#0F0F1C',
  },
  heroTag: {
    color: colors.accentCyan,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 2.6,
    marginBottom: 14,
  },
  heroTitle: {
    color: '#fff',
    fontSize: 38,
    fontWeight: '900',
    lineHeight: 42,
    letterSpacing: -1,
  },
  heroSub: {
    color: colors.textDim,
    fontSize: 15,
    marginTop: 12,
  },
  features: {
    gap: 12,
  },
  feature: {
    flexDirection: 'row',
    gap: 16,
    backgroundColor: colors.bgElevated,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'flex-start',
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 6,
    shadowOpacity: 0.9,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
    elevation: 6,
  },
  featureTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  featureDesc: {
    color: colors.textDim,
    fontSize: 13,
    marginTop: 4,
    lineHeight: 18,
  },
  note: {
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 16,
    fontSize: 11,
    letterSpacing: 1,
    fontWeight: '700',
  },
  unlockedBadge: {
    backgroundColor: '#2DD4BF15',
    borderWidth: 1,
    borderColor: colors.success,
    borderRadius: 24,
    paddingVertical: 28,
    paddingHorizontal: 24,
    alignItems: 'center',
    width: '100%',
  },
  unlockedEmoji: {
    fontSize: 32,
    color: colors.success,
    marginBottom: 10,
  },
  unlockedText: {
    color: colors.success,
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 2,
  },
  unlockedSub: {
    color: colors.textDim,
    fontSize: 13,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 18,
  },
});
