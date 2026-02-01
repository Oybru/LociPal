// Palace List Screen - Shows all saved memory palaces
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, Palace } from '../types';
import { usePalaceStore } from '../stores/palaceStore';

type Props = NativeStackScreenProps<RootStackParamList, 'PalaceList'>;

const THEME_COLORS: Record<string, string> = {
  medieval: '#8b4513',
  gothic: '#2f1f2f',
  asian: '#c41e3a',
  middle_eastern: '#daa520',
  renaissance: '#4a7c59',
  ancient_greek: '#e8e8e8',
  egyptian: '#c4a35a',
  nordic: '#4682b4',
};

export default function PalaceListScreen({ navigation }: Props) {
  const { palaces, deletePalace, setCurrentPalace } = usePalaceStore();

  const handlePalacePress = (palace: Palace) => {
    setCurrentPalace(palace.id);
    navigation.navigate('PalaceView', { palaceId: palace.id });
  };

  const handleDeletePalace = (palace: Palace) => {
    Alert.alert(
      'Delete Palace',
      `Are you sure you want to delete "${palace.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deletePalace(palace.id),
        },
      ]
    );
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const renderPalaceItem = ({ item }: { item: Palace }) => (
    <TouchableOpacity
      style={[
        styles.palaceCard,
        { borderLeftColor: THEME_COLORS[item.theme] || '#e94560' },
      ]}
      onPress={() => handlePalacePress(item)}
      onLongPress={() => handleDeletePalace(item)}
    >
      <View style={styles.palaceInfo}>
        <Text style={styles.palaceName}>{item.name}</Text>
        <Text style={styles.palaceTheme}>{item.theme.replace('_', ' ')}</Text>
        <Text style={styles.palaceMeta}>
          {item.totems.length} totem{item.totems.length !== 1 ? 's' : ''} •{' '}
          {formatDate(item.updatedAt)}
        </Text>
      </View>
      <View style={styles.arrowContainer}>
        <Text style={styles.arrow}>▶</Text>
      </View>
    </TouchableOpacity>
  );

  const EmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateIcon}>🏰</Text>
      <Text style={styles.emptyStateTitle}>No Palaces Yet</Text>
      <Text style={styles.emptyStateText}>
        Create your first memory palace to start memorizing!
      </Text>
      <TouchableOpacity
        style={styles.createButton}
        onPress={() => navigation.navigate('CreatePalace')}
      >
        <Text style={styles.createButtonText}>+ Create Palace</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>My Palaces</Text>
        <TouchableOpacity onPress={() => navigation.navigate('CreatePalace')}>
          <Text style={styles.addButton}>+</Text>
        </TouchableOpacity>
      </View>

      {palaces.length === 0 ? (
        <EmptyState />
      ) : (
        <FlatList
          data={palaces}
          renderItem={renderPalaceItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      <Text style={styles.hint}>Long press to delete a palace</Text>
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
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a4e',
  },
  backButton: {
    color: '#e94560',
    fontSize: 16,
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  addButton: {
    color: '#e94560',
    fontSize: 32,
    fontWeight: 'bold',
  },
  listContent: {
    padding: 20,
  },
  palaceCard: {
    backgroundColor: '#16213e',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  palaceInfo: {
    flex: 1,
  },
  palaceName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  palaceTheme: {
    color: '#a0a0a0',
    fontSize: 14,
    textTransform: 'capitalize',
    marginBottom: 4,
  },
  palaceMeta: {
    color: '#666',
    fontSize: 12,
  },
  arrowContainer: {
    paddingLeft: 10,
  },
  arrow: {
    color: '#e94560',
    fontSize: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyStateIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  emptyStateTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptyStateText: {
    color: '#a0a0a0',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  createButton: {
    backgroundColor: '#e94560',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 4,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  hint: {
    color: '#4a4a4a',
    fontSize: 12,
    textAlign: 'center',
    paddingBottom: 20,
  },
});
