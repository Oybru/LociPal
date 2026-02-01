// Totem Create Screen - Enter prompt and generate pixel art totem
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { usePalaceStore } from '../stores/palaceStore';
import { AIService } from '../services/aiService';

type Props = NativeStackScreenProps<RootStackParamList, 'TotemCreate'>;

// Sample prompts for inspiration
const PROMPT_SUGGESTIONS = [
  'A glowing crystal orb',
  'An ancient leather-bound book',
  'A golden key with runes',
  'A mysterious potion bottle',
  'A compass pointing north',
  'A feather quill pen',
  'A burning candle',
  'A small treasure chest',
];

export default function TotemCreateScreen({ navigation, route }: Props) {
  const { palaceId, position } = route.params;
  const { addTotem } = usePalaceStore();

  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      Alert.alert('Error', 'Please enter a description for your totem');
      return;
    }

    setIsGenerating(true);
    setGenerationProgress(0);

    try {
      // Progress animation - PixelLab takes about 30-90 seconds
      const progressInterval = setInterval(() => {
        setGenerationProgress((prev) => Math.min(prev + 1, 95));
      }, 1000);

      // Generate pixel art image using PixelLab API
      const imageUri = await AIService.generatePixelArt(prompt.trim());

      clearInterval(progressInterval);
      setGenerationProgress(100);

      // Create the totem
      const totem = await addTotem(palaceId, position, prompt.trim(), imageUri);

      // Navigate to the totem detail screen
      navigation.replace('TotemDetail', { palaceId, totemId: totem.id });
    } catch (error) {
      Alert.alert(
        'Generation Failed',
        'Failed to generate totem image. Please try again.',
        [{ text: 'OK' }]
      );
      setIsGenerating(false);
      setGenerationProgress(0);
    }
  };

  const handleSuggestionPress = (suggestion: string) => {
    setPrompt(suggestion);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} disabled={isGenerating}>
          <Text style={[styles.backButton, isGenerating && styles.disabledText]}>
            ← Cancel
          </Text>
        </TouchableOpacity>
        <Text style={styles.title}>Create Totem</Text>
        <View style={{ width: 60 }} />
      </View>

      <View style={styles.content}>
        {/* Position info */}
        <View style={styles.positionInfo}>
          <Text style={styles.positionText}>
            Placing at grid position: ({position.isoX}, {position.isoY})
          </Text>
        </View>

        {/* Prompt Input */}
        <View style={styles.inputSection}>
          <Text style={styles.sectionTitle}>Describe Your Totem</Text>
          <Text style={styles.sectionSubtitle}>
            Enter a description and AI will generate a pixel art representation
          </Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., A glowing crystal ball on a wooden stand"
            placeholderTextColor="#666"
            value={prompt}
            onChangeText={setPrompt}
            multiline
            maxLength={200}
            editable={!isGenerating}
          />
          <Text style={styles.charCount}>{prompt.length}/200</Text>
        </View>

        {/* Suggestions */}
        {!isGenerating && (
          <View style={styles.suggestionsSection}>
            <Text style={styles.suggestionsTitle}>Need inspiration?</Text>
            <View style={styles.suggestionsGrid}>
              {PROMPT_SUGGESTIONS.map((suggestion, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.suggestionChip}
                  onPress={() => handleSuggestionPress(suggestion)}
                >
                  <Text style={styles.suggestionText}>{suggestion}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Generation Progress */}
        {isGenerating && (
          <View style={styles.progressSection}>
            <ActivityIndicator size="large" color="#e94560" />
            <Text style={styles.progressText}>Generating pixel art...</Text>
            <View style={styles.progressBar}>
              <View
                style={[styles.progressFill, { width: `${generationProgress}%` }]}
              />
            </View>
            <Text style={styles.progressPercent}>{generationProgress}%</Text>
            <Text style={styles.progressHint}>
              AI is crafting your pixel art (30-90 seconds)
            </Text>
          </View>
        )}
      </View>

      {/* Generate Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.generateButton,
            (!prompt.trim() || isGenerating) && styles.generateButtonDisabled,
          ]}
          onPress={handleGenerate}
          disabled={!prompt.trim() || isGenerating}
        >
          <Text style={styles.generateButtonText}>
            {isGenerating ? 'Generating...' : 'Generate Totem'}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
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
  disabledText: {
    opacity: 0.5,
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
  positionInfo: {
    backgroundColor: '#16213e',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  positionText: {
    color: '#a0a0a0',
    fontSize: 14,
    textAlign: 'center',
  },
  inputSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  sectionSubtitle: {
    color: '#a0a0a0',
    fontSize: 14,
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#16213e',
    borderRadius: 8,
    padding: 16,
    color: '#fff',
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#2a2a4e',
  },
  charCount: {
    color: '#666',
    fontSize: 12,
    textAlign: 'right',
    marginTop: 4,
  },
  suggestionsSection: {
    marginBottom: 24,
  },
  suggestionsTitle: {
    color: '#a0a0a0',
    fontSize: 14,
    marginBottom: 12,
  },
  suggestionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  suggestionChip: {
    backgroundColor: '#16213e',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    margin: 4,
    borderWidth: 1,
    borderColor: '#2a2a4e',
  },
  suggestionText: {
    color: '#e94560',
    fontSize: 12,
  },
  progressSection: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  progressText: {
    color: '#fff',
    fontSize: 18,
    marginTop: 20,
    marginBottom: 16,
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#16213e',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#e94560',
  },
  progressPercent: {
    color: '#e94560',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 12,
  },
  progressHint: {
    color: '#666',
    fontSize: 12,
    marginTop: 8,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#2a2a4e',
  },
  generateButton: {
    backgroundColor: '#e94560',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  generateButtonDisabled: {
    backgroundColor: '#4a4a4a',
  },
  generateButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
