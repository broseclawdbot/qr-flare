import React, { useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
  Pressable,
  Image,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { LinearGradient } from 'expo-linear-gradient';
import FlareButton from '../components/FlareButton';
import { colors, flareGradient, flareTints } from '../theme/colors';
import { usePremium } from '../context/PremiumContext';

const TEMPLATES = [
  { key: 'clean', label: 'Clean' },
  { key: 'instagram', label: 'Instagram' },
  { key: 'card', label: 'Biz Card' },
  { key: 'poster', label: 'Scan Me' },
  { key: 'wifi', label: 'Wi-Fi' },
];

const FG_COLORS = ['#05050C', '#22D3EE', '#A855F7', '#F472B6', '#2DD4BF'];
const BG_COLORS = ['#FFFFFF', '#F5F5F7', '#05050C', '#FEF3C7', '#E0F2FE'];

export default function PreviewScreen({ route, navigation }) {
  const { payload, type } = route.params || {};
  const { isPremium, unlockPremium } = usePremium();
  const qrRef = useRef(null);
  const [saved, setSaved] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Customization state — always visible, but only active for premium
  const [template, setTemplate] = useState('clean');
  const [fg, setFg] = useState('#05050C');
  const [bg, setBg] = useState('#FFFFFF');
  const [logo, setLogo] = useState(null);

  const actualFg = isPremium ? fg : '#05050C';
  const actualBg = isPremium ? bg : '#FFFFFF';
  const actualTemplate = isPremium ? template : 'clean';
  const actualLogo = isPremium ? logo : null;

  const promptUpgrade = () => setShowUpgradeModal(true);
  const handleUnlock = () => {
    unlockPremium();
    setShowUpgradeModal(false);
  };

  const pickLogo = useCallback(async () => {
    if (!isPremium) { promptUpgrade(); return; }
    if (Platform.OS === 'web') {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (ev) => setLogo(ev.target.result);
          reader.readAsDataURL(file);
        }
      };
      input.click();
    } else {
      try {
        const ImagePicker = require('expo-image-picker');
        const res = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!res.granted) return;
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 1,
        });
        if (!result.canceled && result.assets?.[0]) {
          setLogo(result.assets[0].uri);
        }
      } catch (e) {
        console.log('ImagePicker error:', e);
      }
    }
  }, [isPremium, navigation]);

  const handleDownload = useCallback(() => {
    if (!qrRef.current) return;
    qrRef.current.toDataURL((dataURL) => {
      if (Platform.OS === 'web') {
        const img = new window.Image();
        img.onload = () => {
          const padding = 40;
          const canvas = document.createElement('canvas');
          canvas.width = img.width + padding * 2;
          canvas.height = img.height + padding * 2;
          const ctx = canvas.getContext('2d');
          ctx.fillStyle = actualBg;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, padding, padding);
          if (!isPremium) {
            ctx.fillStyle = '#CCCCCC';
            ctx.font = '12px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('Made with QR Flare', canvas.width / 2, canvas.height - 12);
          }
          const link = document.createElement('a');
          link.href = canvas.toDataURL('image/png');
          link.download = `qr-flare-${type || 'code'}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          setSaved(true);
        };
        img.src = `data:image/png;base64,${dataURL}`;
      } else {
        setSaved(true);
      }
    });
  }, [type, actualBg, isPremium]);

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

      {/* QR Preview Card */}
      <View style={styles.glowWrap}>
        <LinearGradient
          colors={flareGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.glow}
        />
        <View style={styles.card}>
          <TemplateWrapper template={actualTemplate} bg={actualBg} fg={actualFg}>
            <QRCode
              value={payload || ' '}
              size={220}
              backgroundColor={actualBg}
              color={actualFg}
              logo={actualLogo ? { uri: actualLogo } : undefined}
              logoSize={70}
              logoBackgroundColor={actualBg}
              logoBorderRadius={12}
              logoMargin={6}
              getRef={(ref) => (qrRef.current = ref)}
            />
          </TemplateWrapper>
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

      <View style={{ height: 28 }} />

      {/* Download */}
      <FlareButton
        title={saved ? 'Saved!' : (isPremium ? 'Download Premium PNG' : 'Download Free PNG')}
        onPress={handleDownload}
      />

      <View style={{ height: 28 }} />

      {/* Customization Section — always visible */}
      <View style={styles.customizeHeader}>
        <Text style={styles.customizeTitle}>Customize</Text>
        {!isPremium && (
          <Pressable
            style={styles.unlockChip}
            onPress={() => navigation.navigate('Upgrade')}
          >
            <Text style={styles.unlockChipText}>UNLOCK</Text>
          </Pressable>
        )}
      </View>

      {!isPremium && (
        <Text style={styles.lockedHint}>
          Preview the options below — upgrade to apply them to your QR code
        </Text>
      )}

      {/* Templates */}
      <Text style={styles.sectionLabel}>Template</Text>
      <View style={styles.row}>
        {TEMPLATES.map((t) => {
          const active = template === t.key;
          return (
            <Pressable
              key={t.key}
              onPress={() => {
                if (!isPremium) { promptUpgrade(); return; }
                setTemplate(t.key);
              }}
              style={[
                styles.chip,
                active && isPremium && styles.chipActive,
                !isPremium && styles.chipLocked,
              ]}
            >
              <Text
                style={[
                  styles.chipText,
                  active && isPremium && styles.chipTextActive,
                ]}
              >
                {t.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Logo */}
      <Text style={styles.sectionLabel}>Logo</Text>
      <Pressable style={[styles.logoPick, !isPremium && styles.logoLocked]} onPress={pickLogo}>
        {logo && isPremium ? (
          <Image source={{ uri: logo }} style={styles.logoImg} />
        ) : (
          <View style={styles.logoPlaceholder}>
            <Text style={styles.logoPlus}>{isPremium ? '+' : '\u{1F512}'}</Text>
            <Text style={styles.logoText}>{isPremium ? 'Upload Logo' : 'Premium'}</Text>
            {isPremium && <Text style={styles.logoFormats}>PNG, JPG, SVG</Text>}
          </View>
        )}
      </Pressable>
      {logo && isPremium && (
        <Pressable onPress={() => setLogo(null)} style={styles.removeLogo}>
          <Text style={styles.removeLogoText}>Remove Logo</Text>
        </Pressable>
      )}

      {/* Colors */}
      <Text style={styles.sectionLabel}>Foreground</Text>
      <View style={styles.row}>
        {FG_COLORS.map((c) => (
          <Pressable
            key={c}
            onPress={() => {
              if (!isPremium) { promptUpgrade(); return; }
              setFg(c);
            }}
            style={[
              styles.swatch,
              { backgroundColor: c },
              fg === c && isPremium && styles.swatchActive,
              !isPremium && styles.swatchLocked,
            ]}
          />
        ))}
      </View>

      <Text style={styles.sectionLabel}>Background</Text>
      <View style={styles.row}>
        {BG_COLORS.map((c) => (
          <Pressable
            key={c}
            onPress={() => {
              if (!isPremium) { promptUpgrade(); return; }
              setBg(c);
            }}
            style={[
              styles.swatch,
              { backgroundColor: c },
              bg === c && isPremium && styles.swatchActive,
              !isPremium && styles.swatchLocked,
            ]}
          />
        ))}
      </View>

      <View style={{ height: 20 }} />

      {!isPremium && (
        <FlareButton
          title="Unlock All Customization — $4.99"
          onPress={promptUpgrade}
        />
      )}

      <View style={{ height: 40 }} />

      {/* Upgrade Modal Overlay */}
      {showUpgradeModal && (
        <Pressable style={styles.modalOverlay} onPress={() => setShowUpgradeModal(false)}>
          <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
            <LinearGradient
              colors={flareGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.modalGlow}
            />
            <View style={styles.modalInner}>
              <Text style={styles.modalTag}>PREMIUM</Text>
              <Text style={styles.modalTitle}>Unlock Customization</Text>
              <Text style={styles.modalDesc}>
                Get unlimited QR codes, custom colors, templates, and logo branding.
              </Text>
              <View style={{ height: 8 }} />
              <View style={styles.modalFeatures}>
                <Text style={styles.modalFeature}>&#10003;  Unlimited generations</Text>
                <Text style={styles.modalFeature}>&#10003;  5 premium templates</Text>
                <Text style={styles.modalFeature}>&#10003;  Custom colors</Text>
                <Text style={styles.modalFeature}>&#10003;  Add your logo</Text>
                <Text style={styles.modalFeature}>&#10003;  No watermark</Text>
              </View>
              <View style={{ height: 20 }} />
              <FlareButton title="Unlock Premium — $4.99" onPress={handleUnlock} />
              <View style={{ height: 12 }} />
              <Pressable onPress={() => setShowUpgradeModal(false)}>
                <Text style={styles.modalDismiss}>Maybe later</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      )}
    </ScrollView>
  );
}

function TemplateWrapper({ template, bg, fg, children }) {
  if (template === 'clean') {
    return <View style={[tpl.clean, { backgroundColor: bg }]}>{children}</View>;
  }
  if (template === 'instagram') {
    return (
      <LinearGradient
        colors={['#F58529', '#DD2A7B', '#8134AF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={tpl.instagram}
      >
        <View style={{ backgroundColor: bg, padding: 18, borderRadius: 14 }}>
          {children}
        </View>
        <Text style={tpl.igHandle}>@yourbrand</Text>
      </LinearGradient>
    );
  }
  if (template === 'card') {
    return (
      <View style={[tpl.card, { backgroundColor: bg }]}>
        <View style={{ flex: 1, paddingRight: 14 }}>
          <Text style={[tpl.cardName, { color: fg }]}>Your Name</Text>
          <Text style={[tpl.cardRole, { color: fg, opacity: 0.65 }]}>Founder</Text>
          <View style={{ height: 8 }} />
          <Text style={[tpl.cardMeta, { color: fg, opacity: 0.65 }]}>yourbrand.com</Text>
        </View>
        {children}
      </View>
    );
  }
  if (template === 'poster') {
    return (
      <View style={[tpl.poster, { backgroundColor: bg }]}>
        <Text style={[tpl.posterTitle, { color: fg }]}>SCAN ME</Text>
        <View style={{ height: 14 }} />
        {children}
        <View style={{ height: 12 }} />
        <Text style={[tpl.posterSub, { color: fg, opacity: 0.65 }]}>Point camera to open</Text>
      </View>
    );
  }
  return (
    <View style={[tpl.wifi, { backgroundColor: bg }]}>
      <Text style={[tpl.wifiTitle, { color: fg }]}>Wi-Fi</Text>
      <View style={{ height: 12 }} />
      {children}
      <View style={{ height: 12 }} />
      <Text style={[tpl.wifiSub, { color: fg, opacity: 0.65 }]}>Point camera to connect</Text>
    </View>
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
    padding: 24,
    alignItems: 'center',
    width: '100%',
  },
  typeTag: {
    marginTop: 18,
    color: colors.textDim,
    letterSpacing: 3,
    fontWeight: '800',
    fontSize: 11,
  },
  hintText: {
    marginTop: 10,
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  // Customize section
  customizeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 4,
  },
  customizeTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.4,
  },
  unlockChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: '#A855F722',
    borderWidth: 1,
    borderColor: colors.accentPurple,
  },
  unlockChipText: {
    color: '#E9D5FF',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.4,
  },
  lockedHint: {
    color: colors.textMuted,
    fontSize: 13,
    alignSelf: 'flex-start',
    marginBottom: 10,
    lineHeight: 18,
  },
  sectionLabel: {
    alignSelf: 'flex-start',
    color: colors.accentCyan,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 2.2,
    textTransform: 'uppercase',
    marginTop: 22,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    alignSelf: 'flex-start',
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: 999,
    backgroundColor: colors.bgElevated,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: {
    backgroundColor: '#A855F722',
    borderColor: colors.accentPurple,
  },
  chipLocked: {
    opacity: 0.5,
  },
  chipText: {
    color: colors.textDim,
    fontWeight: '700',
    fontSize: 13,
    letterSpacing: 0.6,
  },
  chipTextActive: { color: '#fff' },
  swatch: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ffffff22',
  },
  swatchActive: {
    borderColor: '#fff',
    shadowColor: '#fff',
    shadowOpacity: 0.6,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
  },
  swatchLocked: {
    opacity: 0.4,
  },
  logoPick: {
    width: 120,
    height: 120,
    borderRadius: 18,
    backgroundColor: colors.bgElevated,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  logoLocked: {
    opacity: 0.5,
  },
  logoImg: { width: '100%', height: '100%', borderRadius: 18 },
  logoPlaceholder: {
    alignItems: 'center',
    gap: 4,
  },
  logoPlus: {
    fontSize: 24,
  },
  logoText: {
    color: colors.textDim,
    fontWeight: '700',
    fontSize: 12,
    letterSpacing: 0.6,
  },
  logoFormats: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
  removeLogo: {
    alignSelf: 'flex-start',
    marginTop: 10,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: '#F43F5E22',
  },
  removeLogoText: {
    color: colors.danger,
    fontSize: 12,
    fontWeight: '700',
  },
  // Modal
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    zIndex: 100,
  },
  modalCard: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 28,
    padding: 2.5,
    shadowColor: '#A855F7',
    shadowOpacity: 0.6,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 12 },
  },
  modalGlow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 28,
  },
  modalInner: {
    backgroundColor: '#0F0F1C',
    borderRadius: 26,
    padding: 28,
    alignItems: 'center',
  },
  modalTag: {
    color: colors.accentCyan,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 2.6,
    marginBottom: 12,
  },
  modalTitle: {
    color: '#fff',
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  modalDesc: {
    color: colors.textDim,
    fontSize: 14,
    marginTop: 10,
    textAlign: 'center',
    lineHeight: 20,
  },
  modalFeatures: {
    alignSelf: 'flex-start',
    gap: 8,
    width: '100%',
    paddingHorizontal: 8,
  },
  modalFeature: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  modalDismiss: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '700',
    paddingVertical: 8,
  },
});

const tpl = StyleSheet.create({
  clean: { padding: 24, borderRadius: 22, alignItems: 'center' },
  instagram: { padding: 22, borderRadius: 22, alignItems: 'center' },
  igHandle: { marginTop: 14, fontWeight: '800', fontSize: 14, color: '#fff', letterSpacing: 0.5 },
  card: { flexDirection: 'row', alignItems: 'center', padding: 20, borderRadius: 20, minWidth: 320 },
  cardName: { fontSize: 20, fontWeight: '900', letterSpacing: -0.3 },
  cardRole: { fontSize: 12, marginTop: 3, fontWeight: '600' },
  cardMeta: { fontSize: 11, fontWeight: '600' },
  poster: { padding: 26, borderRadius: 22, alignItems: 'center' },
  posterTitle: { fontSize: 28, fontWeight: '900', letterSpacing: 3 },
  posterSub: { fontSize: 11, letterSpacing: 1.5, fontWeight: '700' },
  wifi: { padding: 26, borderRadius: 22, alignItems: 'center' },
  wifiTitle: { fontSize: 22, fontWeight: '900', letterSpacing: 1 },
  wifiSub: { fontSize: 11, fontWeight: '700', letterSpacing: 0.8 },
});
