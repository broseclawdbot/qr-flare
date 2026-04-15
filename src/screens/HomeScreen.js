import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import QRCode from 'react-native-qrcode-svg';
import FlareButton from '../components/FlareButton';
import Logo from '../components/Logo';
import { colors, flareTints } from '../theme/colors';
import { usePremium } from '../context/PremiumContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const SHOWCASE_TEMPLATES = [
  { key: 'clean', label: 'Clean', bg: '#FFFFFF', fg: '#05050C' },
  { key: 'instagram', label: 'Instagram', bg: '#FFFFFF', fg: '#DD2A7B', gradient: ['#F58529', '#DD2A7B', '#8134AF'] },
  { key: 'poster', label: 'Scan Me', bg: '#05050C', fg: '#22D3EE' },
  { key: 'card', label: 'Biz Card', bg: '#F5F5F7', fg: '#A855F7' },
  { key: 'wifi', label: 'Wi-Fi', bg: '#FEF3C7', fg: '#05050C' },
];

function TemplateCard({ item }) {
  return (
    <View style={showcaseStyles.card}>
      {item.gradient ? (
        <LinearGradient colors={item.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={showcaseStyles.cardInner}>
          <View style={{ backgroundColor: item.bg, padding: 10, borderRadius: 10 }}>
            <QRCode value="https://qrflare.app" size={110} backgroundColor={item.bg} color={item.fg} />
          </View>
          <Text style={[showcaseStyles.cardLabel, { color: '#fff' }]}>{item.label}</Text>
        </LinearGradient>
      ) : (
        <View style={[showcaseStyles.cardInner, { backgroundColor: item.bg }]}>
          <QRCode value="https://qrflare.app" size={110} backgroundColor={item.bg} color={item.fg} />
          <Text style={[showcaseStyles.cardLabel, { color: item.fg }]}>{item.label}</Text>
        </View>
      )}
    </View>
  );
}

function ScrollingShowcase() {
  const scrollAnim = useRef(new Animated.Value(0)).current;
  const CARD_HEIGHT = 185;
  const TOTAL_HEIGHT = SHOWCASE_TEMPLATES.length * CARD_HEIGHT;

  useEffect(() => {
    const animate = () => {
      scrollAnim.setValue(0);
      Animated.timing(scrollAnim, {
        toValue: -TOTAL_HEIGHT,
        duration: SHOWCASE_TEMPLATES.length * 3000,
        useNativeDriver: true,
      }).start(() => animate());
    };
    animate();
    return () => scrollAnim.stopAnimation();
  }, []);

  const items = [...SHOWCASE_TEMPLATES, ...SHOWCASE_TEMPLATES];

  return (
    <View style={showcaseStyles.container}>
      <Animated.View
        style={[
          showcaseStyles.track,
          { transform: [{ translateY: scrollAnim }] },
        ]}
      >
        {items.map((item, i) => (
          <TemplateCard key={`${item.key}-${i}`} item={item} />
        ))}
      </Animated.View>
      <LinearGradient
        colors={[colors.bg, 'transparent']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={showcaseStyles.fadeTop}
        pointerEvents="none"
      />
      <LinearGradient
        colors={['transparent', colors.bg]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={showcaseStyles.fadeBottom}
        pointerEvents="none"
      />
    </View>
  );
}

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
          <View style={styles.heroRow}>
            <View style={styles.heroText}>
              <Text style={styles.headline}>Create{'\n'}QR Codes{'\n'}<Text style={styles.headlineAccent}>Fast.</Text></Text>
            </View>
            <View style={styles.heroShowcase}>
              <ScrollingShowcase />
            </View>
          </View>
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

const showcaseStyles = StyleSheet.create({
  container: {
    height: 220,
    overflow: 'hidden',
    borderRadius: 20,
  },
  track: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  card: {
    width: '100%',
    marginVertical: 5,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#A855F7',
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  cardInner: {
    padding: 20,
    alignItems: 'center',
    borderRadius: 18,
    gap: 10,
  },
  cardLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  fadeTop: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 30,
  },
  fadeBottom: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 30,
  },
});

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
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  heroText: {
    flex: 1,
  },
  heroShowcase: {
    flex: 1,
  },
  headline: {
    color: colors.text,
    fontSize: 46,
    fontWeight: '900',
    lineHeight: 50,
    letterSpacing: -1.5,
  },
  headlineAccent: {
    color: colors.accentPink,
  },
  sub: {
    color: colors.textDim,
    fontSize: 16,
    marginTop: 16,
    lineHeight: 22,
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
