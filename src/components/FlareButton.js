import React from 'react';
import { Pressable, Text, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, flareGradient } from '../theme/colors';

export default function FlareButton({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  icon = null,
}) {
  if (variant === 'primary') {
    return (
      <Pressable
        onPress={onPress}
        disabled={disabled}
        style={({ pressed }) => [
          styles.primaryWrap,
          disabled && { opacity: 0.4 },
          pressed && !disabled && { transform: [{ scale: 0.985 }], opacity: 0.95 },
        ]}
      >
        <LinearGradient
          colors={flareGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.primary}
        >
          <View style={styles.row}>
            {icon}
            <Text style={styles.primaryText}>{title}</Text>
          </View>
        </LinearGradient>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.secondary,
        disabled && { opacity: 0.4 },
        pressed && !disabled && { opacity: 0.75 },
      ]}
    >
      <View style={styles.row}>
        {icon}
        <Text style={styles.secondaryText}>{title}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  primaryWrap: {
    borderRadius: 20,
    overflow: 'hidden',
    width: '100%',
    shadowColor: '#A855F7',
    shadowOpacity: 0.55,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
  },
  primary: {
    paddingVertical: 20,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryText: {
    color: '#05050C',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  secondary: {
    paddingVertical: 19,
    paddingHorizontal: 24,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.bgElevated,
    width: '100%',
  },
  secondaryText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
});
