// Create Palace Screen - Select theme and name for new palace
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, PalaceTheme } from '../types';
import { usePalaceStore } from '../stores/palaceStore';

type Props = NativeStackScreenProps<RootStackParamList, 'CreatePalace'>;

interface ThemeOption {
  id: PalaceTheme;
  name: string;
  description: string;
  color: string;
  icon: string;
}

const THEMES: ThemeOption[] = [
  {
    id: 'medieval',
    name: 'Medieval Castle',
    description: 'Stone walls, torches, and royal chambers',
    color: '#8b4513',
    icon: '🏰',
  },
  {
    id: 'gothic',
    name: 'Gothic Cathedral',
    description: 'Stained glass, arches, and shadowy halls',
    color: '#2f1f2f',
    icon: '⛪',
  },
  {
    id: 'asian',
    name: 'Asian Temple',
    description: 'Zen gardens, paper screens, and pagodas',
    color: '#c41e3a',
    icon: '🏯',
  },
  {
    id: 'middle_eastern',
    name: 'Middle Eastern Palace',
    description: 'Ornate tiles, fountains, and golden domes',
    color: '#daa520',
    icon: '🕌',
  },
  {
    id: 'renaissance',
    name: 'Renaissance Villa',
    description: 'Art galleries, marble, and grand staircases',
    color: '#4a7c59',
    icon: '🎨',
  },
  {
    id: 'ancient_greek',
    name: 'Ancient Greek',
    description: 'Columns, amphitheaters, and olive groves',
    color: '#e8e8e8',
    icon: '🏛️',
  },
  {
    id: 'egyptian',
    name: 'Egyptian Temple',
    description: 'Hieroglyphics, pyramids, and sacred chambers',
    color: '#c4a35a',
    icon: '🔺',
  },
  {
    id: 'nordic',
    name: 'Nordic Hall',
    description: 'Viking longhouses, runes, and great halls',
    color: '#4682b4',
    icon: '⚔️',
  },
];

export default function CreatePalaceScreen({ navigation }: Props) {
  const [name, setName] = useState('');
  const [selectedTheme, setSelectedTheme] = useState<PalaceTheme | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const { createPalace } = usePalaceStore();

  const handleCreate = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a name for your palace');
      return;
    }
    if (!selectedTheme) {
      Alert.alert('Error', 'Please select a theme for your palace');
      return;
    }

    setIsCreating(true);
    try {
      const palace = await createPalace(name.trim(), selectedTheme, selectedTheme);
      navigation.replace('PalaceView', { palaceId: palace.id });
    } catch (error) {
      console.error('Create palace error:', error);
      Alert.alert(
        'Error',
        `Failed to create palace: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
      setIsCreating(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.title}>New Palace</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Name Input */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Palace Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter a memorable name..."
            placeholderTextColor="#666"
            value={name}
            onChangeText={setName}
            maxLength={50}
          />
        </View>

        {/* Theme Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Choose Theme</Text>
          <View style={styles.themesGrid}>
            {THEMES.map((theme) => (
              <TouchableOpacity
                key={theme.id}
                style={[
                  styles.themeCard,
                  { borderColor: theme.color },
                  selectedTheme === theme.id && styles.themeCardSelected,
                  selectedTheme === theme.id && { backgroundColor: theme.color + '40' },
                ]}
                onPress={() => setSelectedTheme(theme.id)}
              >
                <Text style={styles.themeIcon}>{theme.icon}</Text>
                <Text style={styles.themeName}>{theme.name}</Text>
                <Text style={styles.themeDescription}>{theme.description}</Text>
                {selectedTheme === theme.id && (
                  <View style={[styles.checkmark, { backgroundColor: theme.color }]}>
                    <Text style={styles.checkmarkText}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Create Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.createButton,
            (!name.trim() || !selectedTheme) && styles.createButtonDisabled,
          ]}
          onPress={handleCreate}
          disabled={!name.trim() || !selectedTheme || isCreating}
        >
          <Text style={styles.createButtonText}>
            {isCreating ? 'Creating...' : 'Create Palace'}
          </Text>
        </TouchableOpacity>
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
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#16213e',
    borderRadius: 8,
    padding: 16,
    color: '#fff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#2a2a4e',
  },
  themesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  themeCard: {
    width: '47%',
    marginHorizontal: '1.5%',
    marginBottom: 12,
    backgroundColor: '#16213e',
    borderRadius: 8,
    padding: 12,
    borderWidth: 2,
    position: 'relative',
  },
  themeCardSelected: {
    borderWidth: 3,
  },
  themeIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  themeName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  themeDescription: {
    color: '#a0a0a0',
    fontSize: 11,
    lineHeight: 14,
  },
  checkmark: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#2a2a4e',
  },
  createButton: {
    backgroundColor: '#e94560',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  createButtonDisabled: {
    backgroundColor: '#4a4a4a',
  },
  createButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
