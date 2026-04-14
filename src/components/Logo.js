import React from 'react';
import { Text, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { flareGradient, colors } from '../theme/colors';

/**
 * Wordmark for QR Flare.
 * A prismatic gradient "F" chip paired with bold QR FLARE lockup.
 */
export default function Logo({ size = 22, showMark = true }) {
  return (
    <View style={styles.row}>
      {showMark && (
        <View
          style={[
            styles.markShadow,
            { width: size * 2, height: size * 2, borderRadius: size * 0.55 },
          ]}
        >
          <LinearGradient
            colors={flareGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[
              styles.mark,
              { width: size * 2, height: size * 2, borderRadius: size * 0.55 },
            ]}
          >
            <Text
              style={[
                styles.markText,
                { fontSize: size * 1.1, lineHeight: size * 1.25 },
              ]}
            >
              F
            </Text>
          </LinearGradient>
        </View>
      )}
      <Text style={[styles.word, { fontSize: size }]}>
        QR <Text style={styles.wordAccent}>FLARE</Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  markShadow: {
    shadowColor: '#A855F7',
    shadowOpacity: 0.9,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 0 },
    elevation: 10,
  },
  mark: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  markText: {
    color: '#05050C',
    fontWeight: '900',
    letterSpacing: -1,
  },
  word: {
    color: colors.text,
    fontWeight: '900',
    letterSpacing: 3,
  },
  wordAccent: {
    color: colors.text,
    fontWeight: '900',
  },
});
