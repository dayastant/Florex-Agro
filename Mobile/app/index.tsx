import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

const C = {
  bg:    '#080d10',
  brand: '#10b981',
  textPri: '#e2e8f0',
  textSec: '#94a3b8',
};

export default function SplashScreen() {
  const router = useRouter();
  const logoScale  = useRef(new Animated.Value(0.6)).current;
  const logoOpacity= useRef(new Animated.Value(0)).current;
  const textOpacity= useRef(new Animated.Value(0)).current;
  const ringScale  = useRef(new Animated.Value(0.7)).current;
  const ringOpacity= useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Logo entrance
    Animated.parallel([
      Animated.spring(logoScale,  { toValue: 1, damping: 12, stiffness: 100, useNativeDriver: true }),
      Animated.timing(logoOpacity,{ toValue: 1, duration: 500, useNativeDriver: true }),
    ]).start();

    // Ring pulse
    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(ringScale,  { toValue: 1.15, duration: 900, useNativeDriver: true }),
          Animated.timing(ringOpacity,{ toValue: 0,    duration: 900, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(ringScale,  { toValue: 0.7, duration: 0, useNativeDriver: true }),
          Animated.timing(ringOpacity,{ toValue: 0.6, duration: 0, useNativeDriver: true }),
        ]),
      ])
    ).start();

    // Text fade in after logo
    setTimeout(() => {
      Animated.timing(textOpacity, { toValue: 1, duration: 400, useNativeDriver: true }).start();
    }, 400);

    // Navigate to login after 2.2s
    const t = setTimeout(() => router.replace('/login'), 2200);
    return () => clearTimeout(t);
  }, []);

  return (
    <View style={s.root}>
      {/* Glow background */}
      <View style={s.glowBg} />

      {/* Pulse ring */}
      <Animated.View style={[s.ring, {
        opacity: ringOpacity,
        transform: [{ scale: ringScale }],
      }]} />

      {/* Logo icon */}
      <Animated.View style={[s.iconWrap, {
        opacity: logoOpacity,
        transform: [{ scale: logoScale }],
      }]}>
        <Feather name="feather" size={44} color={C.brand} />
      </Animated.View>

      {/* Text */}
      <Animated.View style={[s.textWrap, { opacity: textOpacity }]}>
        <Text style={s.appName}>FLORAX</Text>
        <Text style={s.tagline}>Smart Agriculture Platform</Text>
      </Animated.View>

      {/* Bottom version */}
      <Text style={s.version}>v1.0.0  •  FloraX Tech</Text>
    </View>
  );
}

const s = StyleSheet.create({
  root: {
    flex: 1, backgroundColor: C.bg,
    alignItems: 'center', justifyContent: 'center',
  },
  glowBg: {
    position: 'absolute',
    width: 280, height: 280, borderRadius: 140,
    backgroundColor: 'rgba(16,185,129,0.06)',
    top: '50%', left: '50%',
    marginTop: -180, marginLeft: -140,
  },
  ring: {
    position: 'absolute',
    width: 130, height: 130, borderRadius: 65,
    borderWidth: 2, borderColor: C.brand,
  },
  iconWrap: {
    width: 90, height: 90, borderRadius: 28,
    backgroundColor: 'rgba(16,185,129,0.12)',
    borderWidth: 1.5, borderColor: 'rgba(16,185,129,0.35)',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 28,
  },
  textWrap:  { alignItems: 'center', gap: 6 },
  appName:   { fontSize: 34, fontWeight: '900', color: C.textPri, letterSpacing: 8 },
  tagline:   { fontSize: 12, fontWeight: '600', color: C.brand, letterSpacing: 2, textTransform: 'uppercase' },
  version:   {
    position: 'absolute', bottom: 36,
    fontSize: 10, color: '#334155', fontWeight: '600', letterSpacing: 1,
  },
});
