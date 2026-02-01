// Home Screen - LociPals title screen with pixel art aesthetic
import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { usePalaceStore } from '../stores/palaceStore';
import { DatabaseService } from '../services/database';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

const { width, height } = Dimensions.get('window');

// Pixel-style button component
function PixelButton({
  onPress,
  label,
  variant = 'primary',
}: {
  onPress: () => void;
  label: string;
  variant?: 'primary' | 'secondary' | 'accent';
}) {
  const colors = {
    primary: {
      bg: '#ff6b35',
      border: '#ffA060',
      shadow: '#8b2500',
      text: '#1a1a2e',
    },
    secondary: {
      bg: '#ff5722',
      border: '#ff8a50',
      shadow: '#7a1800',
      text: '#1a1a2e',
    },
    accent: {
      bg: '#e64a19',
      border: '#ff7043',
      shadow: '#6d1b00',
      text: '#1a1a2e',
    },
  };

  const c = colors[variant];

  return (
    <TouchableOpacity
      style={[
        styles.pixelButton,
        {
          backgroundColor: c.bg,
          borderColor: c.border,
          shadowColor: c.shadow,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {/* Inner highlight for 3D effect */}
      <View style={[styles.buttonHighlight, { borderColor: c.border }]} />

      {/* Text with pixel shadow */}
      <Text style={[styles.pixelButtonText, { color: c.text }]}>
        {label}
      </Text>

      {/* Bottom shadow bar for pixel effect */}
      <View style={[styles.buttonShadow, { backgroundColor: c.shadow }]} />
    </TouchableOpacity>
  );
}

export default function HomeScreen({ navigation }: Props) {
  const { loadPalaces } = usePalaceStore();

  useEffect(() => {
    // Initialize database and load palaces on mount
    const init = async () => {
      await DatabaseService.init();
      await loadPalaces();
    };
    init();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Dark blue night scene background */}
      <View style={styles.background}>
        {/* Twinkling stars */}
        {[...Array(50)].map((_, i) => (
          <View
            key={i}
            style={[
              styles.star,
              {
                left: Math.random() * width,
                top: Math.random() * height * 0.7,
                opacity: 0.4 + Math.random() * 0.6,
                width: 1 + Math.random() * 2,
                height: 1 + Math.random() * 2,
              },
            ]}
          />
        ))}
        {/* Larger accent stars */}
        {[...Array(8)].map((_, i) => (
          <View
            key={`big-${i}`}
            style={[
              styles.bigStar,
              {
                left: Math.random() * width,
                top: Math.random() * height * 0.5,
                opacity: 0.6 + Math.random() * 0.4,
              },
            ]}
          />
        ))}
      </View>

      {/* Logo */}
      <View style={styles.logoContainer}>
        <Image
          source={require('../../assets/locipals-logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      {/* Menu Buttons */}
      <View style={styles.menuContainer}>
        <PixelButton
          label="ENTER PALACE"
          variant="primary"
          onPress={() => navigation.navigate('PalaceList')}
        />

        <PixelButton
          label="CREATE PALACE"
          variant="secondary"
          onPress={() => navigation.navigate('CreatePalace')}
        />

        <PixelButton
          label="ATLANTIS TEST"
          variant="accent"
          onPress={() => navigation.navigate('AtlantisTest')}
        />
      </View>

      {/* Familiar decoration */}
      <View style={styles.familiarDecor}>
        <Text style={styles.familiarEmoji}>✨</Text>
      </View>

      {/* Version info */}
      <Text style={styles.version}>v1.0.0</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a1a',
  },
  background: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: '#0d1020',
  },
  star: {
    position: 'absolute',
    backgroundColor: '#fff',
    borderRadius: 10,
  },
  bigStar: {
    position: 'absolute',
    width: 4,
    height: 4,
    backgroundColor: '#ffd700',
    borderRadius: 2,
    shadowColor: '#ffd700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 4,
  },
  logoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 40,
  },
  logo: {
    width: width * 0.85,
    height: 140,
  },
  menuContainer: {
    paddingHorizontal: 32,
    paddingBottom: 80,
    gap: 16,
  },
  pixelButton: {
    position: 'relative',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderWidth: 4,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 6,
    // Retro shadow effect
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 0,
    elevation: 8,
  },
  buttonHighlight: {
    position: 'absolute',
    top: 2,
    left: 2,
    right: 2,
    height: 3,
    borderTopWidth: 2,
    borderRadius: 1,
    opacity: 0.5,
  },
  buttonShadow: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 4,
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
  },
  pixelButtonText: {
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 4,
    textTransform: 'uppercase',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 0,
  },
  familiarDecor: {
    position: 'absolute',
    bottom: 100,
    right: 30,
  },
  familiarEmoji: {
    fontSize: 28,
    opacity: 0.5,
  },
  version: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    color: '#334',
    fontSize: 11,
    letterSpacing: 1,
  },
});
