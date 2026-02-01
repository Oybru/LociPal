// FamiliarPicker - Modal for selecting your companion familiar
import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
} from 'react-native';
import { FamiliarType, FamiliarConfig, getAllFamiliars } from '../../config/familiarsConfig';

interface FamiliarPickerProps {
  visible: boolean;
  currentFamiliar: FamiliarType;
  onSelect: (familiarId: FamiliarType) => void;
  onClose: () => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function FamiliarPicker({
  visible,
  currentFamiliar,
  onSelect,
  onClose,
}: FamiliarPickerProps) {
  const slideAnim = useRef(new Animated.Value(0)).current;
  const familiars = getAllFamiliars();

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 1,
        useNativeDriver: true,
        friction: 8,
      }).start();
    } else {
      slideAnim.setValue(0);
    }
  }, [visible]);

  const handleSelect = (familiarId: FamiliarType) => {
    onSelect(familiarId);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} onPress={onClose} activeOpacity={1} />

        <Animated.View
          style={[
            styles.container,
            {
              transform: [
                {
                  translateY: slideAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [300, 0],
                  }),
                },
              ],
            },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Choose Your Familiar</Text>
            <Text style={styles.headerSubtitle}>Select a companion for your journey</Text>
          </View>

          {/* Familiar Grid */}
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.familiarGrid}
            showsVerticalScrollIndicator={false}
          >
            {familiars.map((familiar) => (
              <FamiliarCard
                key={familiar.id}
                familiar={familiar}
                isSelected={currentFamiliar === familiar.id}
                onSelect={() => handleSelect(familiar.id)}
              />
            ))}
          </ScrollView>

          {/* Close button */}
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeText}>Close</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}

// Individual Familiar Card
function FamiliarCard({
  familiar,
  isSelected,
  onSelect,
}: {
  familiar: FamiliarConfig;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isSelected) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: false,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 1500,
            useNativeDriver: false,
          }),
        ])
      ).start();
    } else {
      glowAnim.setValue(0);
    }
  }, [isSelected]);

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <TouchableOpacity
      style={[
        styles.familiarCard,
        isSelected && styles.familiarCardSelected,
      ]}
      onPress={onSelect}
      activeOpacity={0.8}
    >
      {/* Glow effect for selected */}
      {isSelected && (
        <Animated.View
          style={[
            styles.selectedGlow,
            {
              backgroundColor: familiar.colors.glow,
              opacity: glowOpacity,
            },
          ]}
        />
      )}

      {/* Emoji avatar */}
      <View
        style={[
          styles.avatarCircle,
          {
            backgroundColor: familiar.colors.primary + '30',
            borderColor: isSelected ? familiar.colors.glow : familiar.colors.primary + '50',
          },
        ]}
      >
        <Text style={styles.avatarEmoji}>{familiar.emoji}</Text>
      </View>

      {/* Info */}
      <View style={styles.familiarInfo}>
        <Text style={styles.familiarName}>{familiar.name}</Text>
        <Text style={styles.familiarTitle}>{familiar.title}</Text>
        <Text style={styles.familiarDesc} numberOfLines={2}>
          {familiar.description}
        </Text>
      </View>

      {/* Selected indicator */}
      {isSelected && (
        <View style={[styles.selectedBadge, { backgroundColor: familiar.colors.glow }]}>
          <Text style={styles.selectedBadgeText}>Active</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  container: {
    backgroundColor: '#1a1a2e',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    minHeight: 400,
    paddingBottom: 20,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#888',
    marginTop: 4,
  },
  scrollView: {
    flex: 1,
    minHeight: 200,
  },
  familiarGrid: {
    padding: 16,
    paddingBottom: 24,
  },
  familiarCard: {
    flexDirection: 'row',
    backgroundColor: '#2a2a4e',
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: '#333',
    overflow: 'hidden',
    marginBottom: 12,
  },
  familiarCardSelected: {
    borderColor: '#4ecdc4',
  },
  selectedGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  avatarCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  avatarEmoji: {
    fontSize: 36,
  },
  familiarInfo: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'center',
  },
  familiarName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  familiarTitle: {
    fontSize: 12,
    color: '#4ecdc4',
    marginTop: 2,
  },
  familiarDesc: {
    fontSize: 12,
    color: '#888',
    marginTop: 6,
    lineHeight: 16,
  },
  selectedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  selectedBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#1a1a2e',
  },
  closeButton: {
    marginHorizontal: 16,
    marginTop: 8,
    paddingVertical: 14,
    backgroundColor: '#333',
    borderRadius: 12,
    alignItems: 'center',
  },
  closeText: {
    color: '#888',
    fontSize: 16,
    fontWeight: '600',
  },
});
