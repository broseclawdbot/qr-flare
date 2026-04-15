import React, { useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
  Platform,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { LinearGradient } from 'expo-linear-gradient';
import FlareButton from '../components/FlareButton';
import { colors, flareTints } from '../theme/colors';

// Web helper to capture a DOM element as PNG
const captureElementAsPNG = (element) => {
  return new Promise((resolve) => {
    if (!element) { resolve(null); return; }
    const node = element._nativeTag || element;
    // Use html2canvas-like approach with SVG foreignObject
    const rect = node.getBoundingClientRect ? node.getBoundingClientRect() : { width: 400, height: 400 };
    const canvas = document.createElement('canvas');
    const scale = 2; // 2x for retina
    canvas.width = rect.width * scale;
    canvas.height = rect.height * scale;
    const ctx = canvas.getContext('2d');
    ctx.scale(scale, scale);
    // Draw background
    ctx.fillStyle = '#0F0F1C';
    ctx.fillRect(0, 0, rect.width, rect.height);
    // Serialize the element to SVG
    const svgData = new XMLSerializer().serializeToString(
      (() => {
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', rect.width);
        svg.setAttribute('height', rect.height);
        const fo = document.createElementNS('http://www.w3.org/2000/svg', 'foreignObject');
        fo.setAttribute('width', '100%');
        fo.setAttribute('height', '100%');
        fo.appendChild(node.cloneNode(true));
        svg.appendChild(fo);
        return svg;
      })()
    );
    const img = new window.Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = () => resolve(null);
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  });
};

const TEMPLATES = [
  { key: 'clean', label: 'Clean Frame' },
  { key: 'instagram', label: 'Instagram' },
  { key: 'card', label: 'Business Card' },
  { key: 'poster', label: 'Scan Me' },
  { key: 'wifi', label: 'Wi-Fi' },
];

const FG_COLORS = ['#05050C', '#22D3EE', '#A855F7', '#F472B6', '#2DD4BF'];
const BG_COLORS = ['#FFFFFF', '#F5F5F7', '#05050C', '#FEF3C7', '#E0F2FE'];

export default function CustomizeScreen({ route }) {
  const { payload, type } = route.params || {};
  const qrRef = useRef(null);

  const [template, setTemplate] = useState('clean');
  const [fg, setFg] = useState('#05050C');
  const [bg, setBg] = useState('#FFFFFF');
  const [logo, setLogo] = useState(null);
  const [saved, setSaved] = useState(false);

  const pickLogo = useCallback(async () => {
    if (Platform.OS === 'web') {
      // Use native file input on web
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
        const link = document.createElement('a');
        link.href = `data:image/png;base64,${dataURL}`;
        link.download = `qr-flare-premium-${type || 'code'}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setSaved(true);
      } else {
        setSaved(true);
      }
    });
  }, [type]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <LinearGradient
        colors={[flareTints.cyan, 'transparent']}
        style={styles.ambient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <View style={styles.previewShell}>
        <TemplateWrapper template={template} bg={bg} fg={fg}>
          <QRCode
            value={payload || ' '}
            size={200}
            backgroundColor={bg}
            color={fg}
            logo={logo ? { uri: logo } : undefined}
            logoSize={70}
            logoBackgroundColor={bg}
            logoBorderRadius={12}
            logoMargin={6}
            getRef={(ref) => (qrRef.current = ref)}
          />
        </TemplateWrapper>
      </View>

      <Text style={styles.sectionLabel}>Template</Text>
      <View style={styles.row}>
        {TEMPLATES.map((t) => {
          const active = template === t.key;
          return (
            <Pressable
              key={t.key}
              onPress={() => setTemplate(t.key)}
              style={[styles.chip, active && styles.chipActive]}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>
                {t.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

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

      <View style={{ height: 32 }} />
      <FlareButton title={saved ? "Saved!" : "Download Premium QR"} onPress={handleDownload} />
    </ScrollView>
  );
}

function TemplateWrapper({ template, bg, fg, children }) {
  if (template === 'clean') {
    return (
      <View style={[tpl.clean, { backgroundColor: bg }]}>{children}</View>
    );
  }
  if (template === 'instagram') {
    return (
      <LinearGradient
        colors={['#F58529', '#DD2A7B', '#8134AF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={tpl.instagram}
      >
        <View style={{ backgroundColor: bg, padding: 22, borderRadius: 16 }}>
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
          <Text style={[tpl.cardRole, { color: fg, opacity: 0.65 }]}>
            Founder
          </Text>
          <View style={{ height: 8 }} />
          <Text style={[tpl.cardMeta, { color: fg, opacity: 0.65 }]}>
            yourbrand.com
          </Text>
        </View>
        {children}
      </View>
    );
  }
  if (template === 'poster') {
    return (
      <View style={[tpl.poster, { backgroundColor: bg }]}>
        <Text style={[tpl.posterTitle, { color: fg }]}>SCAN ME</Text>
        <View style={{ height: 18 }} />
        {children}
        <View style={{ height: 16 }} />
        <Text style={[tpl.posterSub, { color: fg, opacity: 0.65 }]}>
          Point camera · Tap link
        </Text>
      </View>
    );
  }
  // wifi
  return (
    <View style={[tpl.wifi, { backgroundColor: bg }]}>
      <Text style={[tpl.wifiTitle, { color: fg }]}>Wi-Fi</Text>
      <View style={{ height: 14 }} />
      {children}
      <View style={{ height: 14 }} />
      <Text style={[tpl.wifiSub, { color: fg, opacity: 0.65 }]}>
        Point camera to connect
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 28,
    paddingBottom: 80,
    alignItems: 'center',
  },
  ambient: {
    position: 'absolute',
    top: -140,
    left: -120,
    width: 460,
    height: 460,
    borderRadius: 460,
  },
  previewShell: {
    padding: 8,
    borderRadius: 32,
    backgroundColor: colors.bgElevated,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    shadowColor: '#A855F7',
    shadowOpacity: 0.4,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
  sectionLabel: {
    alignSelf: 'flex-start',
    color: colors.accentCyan,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 2.2,
    textTransform: 'uppercase',
    marginTop: 28,
    marginBottom: 14,
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
    shadowColor: colors.accentPurple,
    shadowOpacity: 0.55,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
  },
  chipText: {
    color: colors.textDim,
    fontWeight: '700',
    fontSize: 13,
    letterSpacing: 0.6,
  },
  chipTextActive: { color: '#fff' },
  swatch: {
    width: 48,
    height: 48,
    borderRadius: 14,
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
  logoPick: {
    width: 130,
    height: 130,
    borderRadius: 18,
    backgroundColor: colors.bgElevated,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  logoImg: { width: '100%', height: '100%', borderRadius: 18 },
  logoPlaceholder: {
    alignItems: 'center',
    gap: 4,
  },
  logoPlus: {
    color: colors.accentCyan,
    fontSize: 28,
    fontWeight: '300',
  },
  logoText: {
    color: colors.textDim,
    fontWeight: '700',
    fontSize: 13,
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
});

const tpl = StyleSheet.create({
  clean: {
    padding: 30,
    borderRadius: 26,
    alignItems: 'center',
  },
  instagram: {
    padding: 26,
    borderRadius: 26,
    alignItems: 'center',
  },
  igHandle: {
    marginTop: 16,
    fontWeight: '800',
    fontSize: 14,
    color: '#fff',
    letterSpacing: 0.5,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 24,
    borderRadius: 22,
    minWidth: 340,
  },
  cardName: { fontSize: 22, fontWeight: '900', letterSpacing: -0.3 },
  cardRole: { fontSize: 13, marginTop: 3, fontWeight: '600' },
  cardMeta: { fontSize: 12, fontWeight: '600' },
  poster: {
    padding: 30,
    borderRadius: 26,
    alignItems: 'center',
  },
  posterTitle: {
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: 3,
  },
  posterSub: { fontSize: 12, letterSpacing: 1.5, fontWeight: '700' },
  wifi: {
    padding: 30,
    borderRadius: 26,
    alignItems: 'center',
  },
  wifiTitle: { fontSize: 24, fontWeight: '900', letterSpacing: 1 },
  wifiSub: { fontSize: 12, fontWeight: '700', letterSpacing: 0.8 },
});
