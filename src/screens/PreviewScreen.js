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
  const { isPremium, unlockPremium, generationCount, canGenerate, getOfferType, dismissOffer } = usePremium();
  const qrRef = useRef(null);
  const [saved, setSaved] = useState(false);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [offerType, setOfferType] = useState('none');

  const getFileName = () => {
    let name = '';
    if (payload) {
      name = payload
        .replace(/^https?:\/\//i, '')
        .replace(/^mailto:/i, '')
        .replace(/^tel:/i, '')
        .replace(/^WIFI:.*S:([^;]*).*/i, '$1')
        .replace(/[^a-zA-Z0-9._-]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
        .substring(0, 40);
    }
    return `QRFlare-${name || type || 'code'}`;
  };

  // All customization is always active — everyone gets full experience
  const [template, setTemplate] = useState('clean');
  const [fg, setFg] = useState('#05050C');
  const [bg, setBg] = useState('#FFFFFF');
  const [logo, setLogo] = useState(null);

  const handleUnlock = () => {
    unlockPremium();
    setShowOfferModal(false);
  };

  const handleDismissOffer = () => {
    dismissOffer();
    setShowOfferModal(false);
  };

  const pickLogo = useCallback(async () => {
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
  }, []);

  const handleDownload = useCallback(() => {
    if (!qrRef.current) return;
    qrRef.current.toDataURL((dataURL) => {
      if (Platform.OS === 'web') {
        const qrImg = new window.Image();
        qrImg.onload = () => {
          const padding = 40;
          const canvas = document.createElement('canvas');
          canvas.width = qrImg.width + padding * 2;
          canvas.height = qrImg.height + padding * 2;
          const ctx = canvas.getContext('2d');
          ctx.fillStyle = bg;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(qrImg, padding, padding);

          const finalize = () => {
            if (!isPremium) {
              ctx.fillStyle = '#CCCCCC';
              ctx.font = '12px sans-serif';
              ctx.textAlign = 'center';
              ctx.fillText('Made with QR Flare', canvas.width / 2, canvas.height - 12);
            }
            const link = document.createElement('a');
            link.href = canvas.toDataURL('image/png');
            link.download = `${getFileName()}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            setSaved(true);
            if (!isPremium) {
              const offer = getOfferType();
              if (offer !== 'none') {
                setTimeout(() => { setOfferType(offer); setShowOfferModal(true); }, 800);
              }
            }
          };

          // Draw logo on top if present
          if (logo) {
            const logoImg = new window.Image();
            logoImg.crossOrigin = 'anonymous';
            logoImg.onload = () => {
              const logoSize = 40;
              const logoPad = 4;
              const cx = canvas.width / 2;
              const cy = padding + qrImg.height / 2;
              // White background behind logo
              ctx.fillStyle = bg;
              ctx.beginPath();
              ctx.roundRect(cx - logoSize/2 - logoPad, cy - logoSize/2 - logoPad, logoSize + logoPad*2, logoSize + logoPad*2, 14);
              ctx.fill();
              // Draw logo
              ctx.drawImage(logoImg, cx - logoSize/2, cy - logoSize/2, logoSize, logoSize);
              finalize();
            };
            logoImg.onerror = () => finalize();
            logoImg.src = logo;
          } else {
            finalize();
          }
        };
        qrImg.src = `data:image/png;base64,${dataURL}`;
      } else {
        setSaved(true);
      }
    });
  }, [type, bg, isPremium, logo, getOfferType]);

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
          <TemplateWrapper template={template} bg={bg} fg={fg}>
            <View style={{ position: 'relative', alignItems: 'center', justifyContent: 'center' }}>
              <QRCode
                value={payload || ' '}
                size={220}
                backgroundColor={bg}
                color={fg}
                ecl="H"
                getRef={(ref) => (qrRef.current = ref)}
              />
              {logo && (
                <View style={{
                  position: 'absolute',
                  backgroundColor: bg,
                  padding: 4,
                  borderRadius: 10,
                  shadowColor: '#000',
                  shadowOpacity: 0.2,
                  shadowRadius: 8,
                  elevation: 5,
                }}>
                  <Image
                    source={{ uri: logo }}
                    style={{ width: 40, height: 40, borderRadius: 8 }}
                    resizeMode="contain"
                  />
                </View>
              )}
            </View>
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

      {/* Customization Section — fully open */}
      <View style={styles.customizeHeader}>
        <Text style={styles.customizeTitle}>Customize</Text>
      </View>

      {/* Templates */}
      <Text style={styles.sectionLabel}>Template</Text>
      <View style={styles.row}>
        {TEMPLATES.map((t) => {
          const active = template === t.key;
          return (
            <Pressable
              key={t.key}
              onPress={() => setTemplate(t.key)}
              style={[
                styles.chip,
                active && styles.chipActive,
              ]}
            >
              <Text
                style={[
                  styles.chipText,
                  active && styles.chipTextActive,
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
      <Pressable style={styles.logoPick} onPress={pickLogo}>
        {logo ? (
          <Image source={{ uri: logo }} style={styles.logoImg} />
        ) : (
          <View style={styles.logoPlaceholder}>
            <Text style={styles.logoPlus}>+</Text>
            <Text style={styles.logoText}>Upload Logo</Text>
            <Text style={styles.logoFormats}>PNG, JPG, SVG</Text>
          </View>
        )}
      </Pressable>
      {logo && (
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
            onPress={() => setFg(c)}
            style={[
              styles.swatch,
              { backgroundColor: c },
              fg === c && styles.swatchActive,
            ]}
          />
        ))}
      </View>

      <Text style={styles.sectionLabel}>Background</Text>
      <View style={styles.row}>
        {BG_COLORS.map((c) => (
          <Pressable
            key={c}
            onPress={() => setBg(c)}
            style={[
              styles.swatch,
              { backgroundColor: c },
              bg === c && styles.swatchActive,
            ]}
          />
        ))}
      </View>

      <View style={{ height: 20 }} />

      <View style={{ height: 40 }} />

      {/* Offer Modal — shown after download based on generation count */}
      {showOfferModal && (
        <Pressable
          style={styles.modalOverlay}
          onPress={offerType === 'subscription' ? undefined : () => setShowOfferModal(false)}
        >
          <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
            <LinearGradient
              colors={flareGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.modalGlow}
            />
            <View style={styles.modalInner}>
              {offerType === 'onetimeoffer' ? (
                <>
                  <Text style={styles.modalTag}>YOU'VE USED 3 OF 3 FREE QR CODES</Text>
                  <Text style={styles.modalTitle}>Don't Lose Access</Text>
                  <Text style={styles.modalDesc}>
                    You've been creating amazing QR codes — unlock unlimited generations and keep all your customization features forever.
                  </Text>
                  <View style={{ height: 8 }} />
                  <View style={styles.modalFeatures}>
                    <Text style={styles.modalFeature}>&#10003;  Unlimited QR codes forever</Text>
                    <Text style={styles.modalFeature}>&#10003;  All templates & colors</Text>
                    <Text style={styles.modalFeature}>&#10003;  Logo branding</Text>
                    <Text style={styles.modalFeature}>&#10003;  No watermark</Text>
                  </View>
                  <View style={{ height: 20 }} />
                  <FlareButton title="Unlock Forever — $4.99" onPress={handleUnlock} />
                  <View style={{ height: 12 }} />
                  <Pressable onPress={handleDismissOffer}>
                    <Text style={styles.modalDismiss}>Let me try one more</Text>
                  </Pressable>
                </>
              ) : (
                <>
                  <Text style={styles.modalTag}>FINAL OFFER</Text>
                  <Text style={styles.modalTitle}>Your Free Codes{'\n'}Are Gone</Text>
                  <Text style={styles.modalDesc}>
                    You've used all your free generations. Subscribe now to keep creating unlimited customized QR codes.
                  </Text>
                  <View style={{ height: 8 }} />
                  <View style={styles.modalFeatures}>
                    <Text style={styles.modalFeature}>&#10003;  Unlimited QR codes</Text>
                    <Text style={styles.modalFeature}>&#10003;  Full customization</Text>
                    <Text style={styles.modalFeature}>&#10003;  Cancel anytime</Text>
                  </View>
                  <View style={{ height: 20 }} />
                  <FlareButton title="Subscribe — $0.99/mo" onPress={handleUnlock} />
                  <Text style={styles.subscribeNote}>Cancel anytime · Billed monthly</Text>
                </>
              )}
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
  // Post-download prompt
  postDownloadCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: colors.bgElevated,
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  postDownloadCheck: {
    fontSize: 36,
    color: colors.success,
    marginBottom: 10,
  },
  postDownloadTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  postDownloadDesc: {
    color: colors.textDim,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  subscribeNote: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    textAlign: 'center',
    marginTop: 12,
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
