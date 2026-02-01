// Two-panel totem detail overlay — Card (left) + Info (right)
import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  Animated,
  PanResponder,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Crypto from 'expo-crypto';
import { TotemContent, TotemImage } from '../../types';
import { TotemWithSprite } from '../../data/sampleTotems';
import { SPRITE_BY_ID } from '../../config/assetRegistry';

interface TotemDetailPanelProps {
  totem: TotemWithSprite;
  onClose: () => void;
  onSave: (totemId: string, updates: Partial<TotemContent>) => void;
}

export function TotemDetailPanel({ totem, onClose, onSave }: TotemDetailPanelProps) {
  // Editable content (local copies)
  const [notes, setNotes] = useState(totem.content.notes);
  const [images, setImages] = useState<TotemImage[]>(totem.content.images);


  // Card interaction — 3D pivot rotation
  const rotY = useRef(new Animated.Value(0)).current; // horizontal drag → rotate around Y axis
  const rotX = useRef(new Animated.Value(0)).current; // vertical drag → rotate around X axis
  const cardScale = useRef(new Animated.Value(1)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  // Track rotation offset for setValue in onPanResponderMove
  const rotOffset = useRef({ x: 0, y: 0 });
  // Baseline gesture delta — prevents snap when PanResponder claims after threshold
  const gestureBaseline = useRef<{ dx: number; dy: number } | null>(null);

  // Reset state when a different totem is opened
  useEffect(() => {
    setNotes(totem.content.notes);
    setImages(totem.content.images);
    rotY.setValue(0);
    rotX.setValue(0);
    rotOffset.current = { x: 0, y: 0 };
  }, [totem.id]);

  // Fade-in on mount
  useEffect(() => {
    Animated.timing(overlayOpacity, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, []);

  // Card PanResponder — drag to 3D pivot-rotate around center
  const MAX_ROT = 30; // max degrees of tilt
  const SENSITIVITY = 0.25; // degrees per pixel dragged

  const panResponder = useRef(
    PanResponder.create({
      // Don't steal taps — let buttons/inputs handle them
      onStartShouldSetPanResponder: () => false,
      // Claim any drag gesture for card rotation
      onMoveShouldSetPanResponder: (_, gs) =>
        Math.abs(gs.dx) > 5 || Math.abs(gs.dy) > 5,
      onPanResponderGrant: () => {
        Animated.spring(cardScale, { toValue: 0.97, useNativeDriver: true }).start();
        rotOffset.current = {
          x: (rotX as any)._value || 0,
          y: (rotY as any)._value || 0,
        };
        // Will capture baseline on first move to avoid snap
        gestureBaseline.current = null;
      },
      onPanResponderMove: (_, gs) => {
        // Capture baseline on first move so rotation starts from zero
        if (!gestureBaseline.current) {
          gestureBaseline.current = { dx: gs.dx, dy: gs.dy };
        }
        const dx = gs.dx - gestureBaseline.current.dx;
        const dy = gs.dy - gestureBaseline.current.dy;
        const newRotY = Math.max(-MAX_ROT, Math.min(MAX_ROT,
          rotOffset.current.y + dx * SENSITIVITY));
        const newRotX = Math.max(-MAX_ROT, Math.min(MAX_ROT,
          rotOffset.current.x - dy * SENSITIVITY));
        rotY.setValue(newRotY);
        rotX.setValue(newRotX);
      },
      onPanResponderRelease: () => {
        Animated.spring(cardScale, { toValue: 1, useNativeDriver: true }).start();
        Animated.spring(rotY, { toValue: 0, useNativeDriver: true }).start();
        Animated.spring(rotX, { toValue: 0, useNativeDriver: true }).start();
        rotOffset.current = { x: 0, y: 0 };
        gestureBaseline.current = null;
      },
    })
  ).current;

  const cardTransform = {
    transform: [
      { perspective: 800 },
      { rotateY: rotY.interpolate({
          inputRange: [-MAX_ROT, MAX_ROT],
          outputRange: [`-${MAX_ROT}deg`, `${MAX_ROT}deg`],
        }) },
      { rotateX: rotX.interpolate({
          inputRange: [-MAX_ROT, MAX_ROT],
          outputRange: [`-${MAX_ROT}deg`, `${MAX_ROT}deg`],
        }) },
      { scale: cardScale },
    ],
  };

  // Save helpers
  const handleSaveNotes = useCallback(() => {
    onSave(totem.id, { notes });
  }, [totem.id, notes, onSave]);

  const handleAddImage = useCallback(async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      const newImage: TotemImage = {
        id: Crypto.randomUUID(),
        uri: result.assets[0].uri,
      };
      const updated = [...images, newImage];
      setImages(updated);
      onSave(totem.id, { images: updated });
    }
  }, [images, totem.id, onSave]);

  const handleRemoveImage = useCallback((imageId: string) => {
    const updated = images.filter(i => i.id !== imageId);
    setImages(updated);
    onSave(totem.id, { images: updated });
  }, [images, totem.id, onSave]);

  const handleClose = useCallback(() => {
    // Persist notes on close
    onSave(totem.id, { notes, images });
    onClose();
  }, [totem.id, notes, images, onSave, onClose]);

  // Sprite rendering
  const spriteAsset = totem.spriteId ? SPRITE_BY_ID[totem.spriteId] : null;

  return (
    <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoider}
      >
        <View style={{ flex: 1 }} {...panResponder.panHandlers}>
        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Interactive card — top of screen */}
          <View style={styles.cardSection}>
            <Animated.View
              style={[styles.card, cardTransform]}
            >
              <View style={styles.cardIconArea}>
                {spriteAsset?.spriteSource ? (
                  <Image
                    source={spriteAsset.spriteSource}
                    style={styles.cardSprite}
                    resizeMode="contain"
                  />
                ) : (
                  <Text style={styles.cardEmoji}>
                    {totem.emoji || '?'}
                  </Text>
                )}
              </View>
              <View style={styles.cardLabelBar}>
                <Text style={styles.cardLabelText} numberOfLines={1}>
                  {totem.content.title}
                </Text>
              </View>
            </Animated.View>
          </View>

          {/* Notes — below card */}
          <Text style={styles.sectionTitle}>Memory Notes</Text>
          <TextInput
            style={styles.notesInput}
            value={notes}
            onChangeText={setNotes}
            placeholder="Enter memory notes..."
            placeholderTextColor="#666"
            multiline
            textAlignVertical="top"
            onBlur={handleSaveNotes}
          />

          {/* Image attachments */}
          <Text style={styles.sectionTitle}>Images</Text>
          <View style={styles.imagesRow}>
            {images.map(img => (
              <View key={img.id} style={styles.imageThumbContainer}>
                <Image source={{ uri: img.uri }} style={styles.imageThumb} />
                <TouchableOpacity
                  style={styles.removeImageBtn}
                  onPress={() => handleRemoveImage(img.id)}
                >
                  <Text style={styles.removeBtnText}>x</Text>
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity style={styles.addImageBtn} onPress={handleAddImage}>
              <Text style={styles.addImageText}>+</Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: 56 }} />
        </ScrollView>
        </View>

        {/* Back button — bottom right, above Android nav bar */}
        <TouchableOpacity style={styles.backButton} onPress={handleClose}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    zIndex: 1000,
  },
  keyboardAvoider: {
    flex: 1,
  },

  // Single scrollable layout
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  scrollContent: {
    paddingBottom: 12,
  },

  // Card inline section — top of screen
  cardSection: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  card: {
    width: 280,
    height: 360,
    backgroundColor: '#16213e',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#4ecdc4',
    shadowColor: '#4ecdc4',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 14,
    elevation: 10,
  },
  cardIconArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0f0f23',
  },
  cardSprite: {
    width: 160,
    height: 160,
  },
  cardEmoji: {
    fontSize: 96,
  },
  cardLabelBar: {
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#4ecdc4',
  },
  cardLabelText: {
    color: '#0a1628',
    fontSize: 17,
    fontWeight: 'bold',
    paddingHorizontal: 12,
  },

  // Back button — bottom right
  backButton: {
    position: 'absolute',
    bottom: Platform.OS === 'android' ? 24 : 16,
    right: 20,
    backgroundColor: '#4ecdc4',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    zIndex: 1010,
  },
  backButtonText: {
    color: '#0a1628',
    fontSize: 32,
    fontWeight: 'bold',
  },

  sectionTitle: {
    fontSize: 14,
    color: '#4ecdc4',
    fontWeight: 'bold',
    marginBottom: 6,
    marginTop: 12,
  },

  // Notes
  notesInput: {
    backgroundColor: '#0f0f23',
    borderRadius: 8,
    padding: 12,
    color: '#fff',
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#2a2a4e',
    minHeight: 80,
    textAlignVertical: 'top',
  },

  // Images
  imagesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  imageThumbContainer: {
    width: 80,
    height: 80,
    position: 'relative',
  },
  imageThumb: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  removeImageBtn: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#e94560',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addImageBtn: {
    width: 80,
    height: 80,
    backgroundColor: '#0f0f23',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#2a2a4e',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addImageText: {
    color: '#666',
    fontSize: 28,
  },

  removeBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
