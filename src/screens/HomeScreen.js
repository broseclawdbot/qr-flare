import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import FlareButton from '../components/FlareButton';
import Logo from '../components/Logo';
import { colors, flareTints } from '../theme/colors';
import { usePremium } from '../context/PremiumContext';

export default function HomeScreen({ navigation }) {
  const { isPremium } = usePremium();

  return (
    <SafeAreaView style={styles.safe}>
      {/* Ambient flares */}
      <LinearGradient
        colors={[flareTints.cyan, 'transparent']}
        style={[styles.flare, styles.flareTop]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      <LinearGradient
        colors={[flareTints.purple, 'transparent']}
        style={[styles.flare, styles.flareMid]}
        start={{ x: 0, y: 1 }}
        end={{ x: 1, y: 0 }}
      />
      <LinearGradient
        colors={[flareTints.pink, 'transparent']}
        style={[styles.flare, styles.flareBottom]}
        start={{ x: 1, y: 1 }}
        end={{ x: 0, y: 0 }}
      />

      <View style={styles.container}>
        <View style={styles.top}>
          <Logo size={18} />
          {isPremium && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>PREMIUM</Text>
            </View>
          )}
        </View>

        <View style={styles.center}>
          <Text style={styles.eyebrow}>QR · GENERATOR</Text>
          <Text style={styles.headline}>Create{'\n'}QR Codes{'\n'}<Text style={styles.headlineAccent}>Fast.</Text></Text>
          <Text style={styles.sub}>
            Sleek, branded, share-ready codes in seconds.
          </Text>
        </View>

        <View style={styles.actions}>
          <FlareButton
            title="Generate Free QR"
            onPress={() => navigation.navigate('Create')}
          />
          <View style={{ height: 14 }} />
          <FlareButton
            title={isPremium ? 'Branding Unlocked' : 'Unlock Branding'}
            variant="secondary"
            onPress={() => navigation.navigate('Upgrade')}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  container: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 24,
    paddingBottom: 44,
    justifyContent: 'space-between',
  },
  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#A855F722',
    borderWidth: 1,
    borderColor: '#A855F7',
  },
  badgeText: {
    color: '#E9D5FF',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.4,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
  },
  eyebrow: {
    color: colors.accentCyan,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 3,
    marginBottom: 18,
  },
  headline: {
    color: colors.text,
    fontSize: 56,
    fontWeight: '900',
    lineHeight: 60,
    letterSpacing: -1.5,
  },
  headlineAccent: {
    color: colors.accentPink,
  },
  sub: {
    color: colors.textDim,
    fontSize: 17,
    marginTop: 20,
    lineHeight: 24,
    maxWidth: 320,
  },
  actions: {},
  flare: {
    position: 'absolute',
    borderRadius: 500,
  },
  flareTop: {
    top: -180,
    right: -160,
    width: 440,
    height: 440,
  },
  flareMid: {
    top: 180,
    left: -200,
    width: 420,
    height: 420,
  },
  flareBottom: {
    bottom: -200,
    right: -160,
    width: 440,
    height: 440,
  },
});
