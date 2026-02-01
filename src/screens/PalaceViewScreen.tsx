// Palace View Screen - Isometric view of the memory palace with totems
import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Alert,
  ScrollView,
  Animated,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, Totem } from '../types';
import { usePalaceStore } from '../stores/palaceStore';
import { snapToGrid, TILE_WIDTH, TILE_HEIGHT } from '../utils/isometric';
import IsometricGrid from '../components/isometric/IsometricGrid';
import TotemSprite from '../components/totem/TotemSprite';

type Props = NativeStackScreenProps<RootStackParamList, 'PalaceView'>;

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Grid configuration
const GRID_WIDTH = 10;
const GRID_HEIGHT = 10;

export default function PalaceViewScreen({ navigation, route }: Props) {
  const { palaceId } = route.params;
  const { palaces, setCurrentPalace } = usePalaceStore();
  const palace = palaces.find((p) => p.id === palaceId);

  const [isPlacingMode, setIsPlacingMode] = useState(false);
  const [selectedTotemId, setSelectedTotemId] = useState<string | null>(null);

  React.useEffect(() => {
    if (palace) {
      setCurrentPalace(palace.id);
    }
  }, [palace]);

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleTotemPress = useCallback((totem: Totem) => {
    setSelectedTotemId(totem.id);
    navigation.navigate('TotemDetail', { palaceId, totemId: totem.id });
  }, [palaceId, navigation]);

  const handleGridPress = useCallback((screenX: number, screenY: number) => {
    if (!isPlacingMode) return;

    const position = snapToGrid(screenX, screenY);

    // Check bounds
    if (
      position.isoX < 0 ||
      position.isoX >= GRID_WIDTH ||
      position.isoY < 0 ||
      position.isoY >= GRID_HEIGHT
    ) {
      Alert.alert('Invalid Position', 'Please tap within the palace bounds.');
      return;
    }

    // Navigate to totem creation
    setIsPlacingMode(false);
    navigation.navigate('TotemCreate', { palaceId, position });
  }, [isPlacingMode, palaceId, navigation]);

  if (!palace) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Palace not found</Text>
        <TouchableOpacity onPress={handleBackPress}>
          <Text style={styles.backButton}>← Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Sort totems by z-index for proper depth rendering
  const sortedTotems = [...palace.totems].sort((a, b) => a.zIndex - b.zIndex);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackPress}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title} numberOfLines={1}>
          {palace.name}
        </Text>
        <TouchableOpacity
          style={[styles.addButton, isPlacingMode && styles.addButtonActive]}
          onPress={() => setIsPlacingMode(!isPlacingMode)}
        >
          <Text style={styles.addButtonText}>{isPlacingMode ? '×' : '+'}</Text>
        </TouchableOpacity>
      </View>

      {/* Placing mode indicator */}
      {isPlacingMode && (
        <View style={styles.placingIndicator}>
          <Text style={styles.placingText}>Tap on the grid to place a totem</Text>
        </View>
      )}

      {/* Isometric View */}
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.isometricContainer}
      >
        <View style={styles.gridWrapper}>
          {/* Background grid */}
          <IsometricGrid
            width={GRID_WIDTH}
            height={GRID_HEIGHT}
            onTilePress={handleGridPress}
            isPlacingMode={isPlacingMode}
          />

          {/* Totems */}
          {sortedTotems.map((totem) => (
            <TotemSprite
              key={totem.id}
              totem={totem}
              onPress={() => handleTotemPress(totem)}
              isSelected={selectedTotemId === totem.id}
            />
          ))}
        </View>
      </ScrollView>

      {/* Bottom info bar */}
      <View style={styles.infoBar}>
        <Text style={styles.infoText}>
          {palace.totems.length} totem{palace.totems.length !== 1 ? 's' : ''} •{' '}
          {palace.theme.replace('_', ' ')}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#16213e',
    zIndex: 100,
  },
  backButton: {
    color: '#e94560',
    fontSize: 16,
  },
  title: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e94560',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonActive: {
    backgroundColor: '#ff6b6b',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  placingIndicator: {
    backgroundColor: '#e94560',
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  placingText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  scrollContainer: {
    flex: 1,
  },
  isometricContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  gridWrapper: {
    position: 'relative',
  },
  infoBar: {
    backgroundColor: '#16213e',
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  infoText: {
    color: '#a0a0a0',
    fontSize: 14,
    textTransform: 'capitalize',
  },
  errorText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 100,
  },
});
