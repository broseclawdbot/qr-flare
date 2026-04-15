import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import ViewShot from 'react-native-view-shot';
import { LinearGradient } from 'expo-linear-gradient';
import FlareButton from '../components/FlareButton';
import { colors, flareGradient, flareTints } from '../theme/colors';
import { usePremium } from '../context/PremiumContext';

export default function PreviewScreen({ route, navigation }) {
  const { payload, type } = route.params || {};
  const { isPremium } = usePremium();
  const shotRef = useRef(null);
  const [saved, setSaved] = useState(false);

  const handleDownload = async () => {
    try {
      if (Platform.OS === 'web') {
        // On web, use canvas to download
        const uri = await shotRef.current.capture();
        const link = document.createElement('a');
        link.href = uri;
        link.download = `qr-flare-${type || 'code'}.png`;
        link.click();
        setSaved(true);
      } else {
        const MediaLibrary = require('expo-media-library');
        const { status } = await MediaLibrary.requestPermissionsAsync();
        if (status !== 'granted') return;
        const uri = await shotRef.current.capture();
        const asset = await MediaLibrary.createAssetAsync(uri);
        try { await MediaLibrary.createAlbumAsync('QR Flare', asset, false); } catch (_) {}
        setSaved(true);
      }
    } catch (e) {
      console.log('Download error:', e);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <LinearGradient
        colors={[flareTints.purple, 'transparent']}
        style={styles.ambient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <Text style={styles.eyebrow}>YOUR QR</Text>
      <Text style={styles.title}>Preview</Text>

      <View style={{ height: 28 }} />

      <View style={styles.glowWrap}>
        <LinearGradient
          colors={flareGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.glow}
        />
        <View style={styles.card}>
          <ViewShot
            ref={shotRef}
            options={{ format: 'png', quality: 1, result: 'tmpfile' }}
            style={styles.qrBox}
          >
            <QRCode
              value={payload || ' '}
              size={240}
              backgroundColor="#FFFFFF"
              color="#05050C"
            />
          </ViewShot>
          <Text style={styles.typeTag}>{(type || 'qr').toUpperCase()}</Text>
          {type === 'email' && (
            <Text style={styles.hintText}>
              Requires a mail app (Mail, Gmail, etc.) on the scanning device
            </Text>
          )}
          {type === 'phone' && (
            <Text style={styles.hintText}>
              Opens the phone dialer when scanned
            </Text>
          )}
        </View>
      </View>

      <View style={{ height: 36 }} />

      <FlareButton title={saved ? "Saved!" : "Download Free PNG"} onPress={handleDownload} />
      <View style={{ height: 14 }} />
      <FlareButton
        title={isPremium ? 'Customize' : 'Customize · Locked'}
        variant="secondary"
        onPress={() => {
          if (isPremium) {
            navigation.navigate('Customize', { payload, type });
          } else {
            navigation.navigate('Upgrade');
          }
        }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 28,
    alignItems: 'center',
    paddingBottom: 80,
  },
  ambient: {
    position: 'absolute',
    top: -140,
    left: -100,
    width: 500,
    height: 500,
    borderRadius: 500,
  },
  eyebrow: {
    color: colors.accentCyan,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 2.4,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  title: {
    color: colors.text,
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: -0.8,
    alignSelf: 'flex-start',
  },
  glowWrap: {
    width: '100%',
    padding: 2.5,
    borderRadius: 32,
    shadowColor: '#A855F7',
    shadowOpacity: 0.6,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 12 },
    elevation: 16,
  },
  glow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 32,
  },
  card: {
    backgroundColor: colors.bgElevated,
    borderRadius: 30,
    padding: 32,
    alignItems: 'center',
    width: '100%',
  },
  qrBox: {
    backgroundColor: '#fff',
    padding: 22,
    borderRadius: 20,
  },
  typeTag: {
    marginTop: 22,
    color: colors.textDim,
    letterSpacing: 3,
    fontWeight: '800',
    fontSize: 11,
  },
  hintText: {
    marginTop: 12,
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
