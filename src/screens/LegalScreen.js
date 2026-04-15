import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { colors } from '../theme/colors';

const TERMS = `Terms of Service

Last Updated: April 15, 2026

1. Acceptance of Terms
By using QR Flare ("the App"), you agree to these Terms of Service. If you do not agree, do not use the App.

2. Service Description
QR Flare provides QR code generation and customization services. Free users receive 3 QR code generations. Premium features are available via one-time purchase ($4.99) or monthly subscription ($0.99/month).

3. Payments and Subscriptions
- One-time purchases are non-refundable after 7 days.
- Monthly subscriptions auto-renew until cancelled.
- You may cancel your subscription at any time through Stripe's customer portal.
- No refunds for partial months.

4. Usage Limits
- Free tier: 3 QR code generations per device.
- Premium tier: Unlimited QR code generations.
- Abuse of the service (automated generation, reselling) may result in account termination.

5. Intellectual Property
- QR codes you generate are yours to use commercially.
- The QR Flare brand, logo, and app design are owned by Volume Entertainment.
- Free-tier downloads may include a "Made with QR Flare" watermark.

6. Disclaimer
QR Flare is provided "as is" without warranties. We do not guarantee uninterrupted service. We are not responsible for the content encoded in your QR codes.

7. Limitation of Liability
Volume Entertainment shall not be liable for any indirect, incidental, or consequential damages arising from your use of the App.

8. Changes to Terms
We may update these terms at any time. Continued use of the App constitutes acceptance of updated terms.

9. Contact
For questions, contact: support@qrflare.app`;

const PRIVACY = `Privacy Policy

Last Updated: April 15, 2026

1. Information We Collect
- Device identifiers (anonymous ID for tracking free-tier usage)
- Payment information (processed securely by Stripe; we never see your full card details)
- QR code content is processed locally on your device and is not stored on our servers

2. How We Use Information
- To provide and improve QR code generation services
- To enforce free-tier usage limits
- To process payments via Stripe
- To communicate service updates

3. Data Storage
- QR code content stays on your device. We do not store the URLs, text, or other data you encode.
- Device identifiers are stored locally on your device.
- Payment records are maintained by Stripe under their privacy policy.

4. Third-Party Services
- Stripe (payment processing): https://stripe.com/privacy
- Vercel (hosting): https://vercel.com/legal/privacy-policy
- Expo (app distribution): https://expo.dev/privacy

5. Data Sharing
We do not sell, trade, or share your personal information with third parties except as required by law.

6. Children's Privacy
QR Flare is not directed at children under 13. We do not knowingly collect information from children.

7. Your Rights
You may request deletion of any data associated with your device by contacting us at support@qrflare.app.

8. Security
We use industry-standard security measures including HTTPS encryption and secure payment processing via Stripe.

9. Changes to Privacy Policy
We may update this policy at any time. Changes will be reflected by the "Last Updated" date.

10. Contact
For privacy concerns, contact: support@qrflare.app`;

export default function LegalScreen({ route }) {
  const [tab, setTab] = useState(route?.params?.tab || 'terms');

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.tabs}>
        <Pressable
          style={[styles.tab, tab === 'terms' && styles.tabActive]}
          onPress={() => setTab('terms')}
        >
          <Text style={[styles.tabText, tab === 'terms' && styles.tabTextActive]}>
            Terms of Service
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tab, tab === 'privacy' && styles.tabActive]}
          onPress={() => setTab('privacy')}
        >
          <Text style={[styles.tabText, tab === 'privacy' && styles.tabTextActive]}>
            Privacy Policy
          </Text>
        </Pressable>
      </View>

      <Text style={styles.body}>
        {tab === 'terms' ? TERMS : PRIVACY}
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 28,
    paddingBottom: 80,
  },
  tabs: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
  },
  tab: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: colors.bgElevated,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tabActive: {
    backgroundColor: '#22D3EE18',
    borderColor: colors.accentCyan,
  },
  tabText: {
    color: colors.textDim,
    fontWeight: '700',
    fontSize: 13,
  },
  tabTextActive: {
    color: '#fff',
  },
  body: {
    color: colors.textDim,
    fontSize: 14,
    lineHeight: 22,
  },
});
