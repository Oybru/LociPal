// TotemPicker - Modal for selecting a totem sprite with live search
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Animated,
  Dimensions,
} from 'react-native';
import { SpriteAsset, SpriteCategory, SPRITE_CATEGORIES } from '../../config/assetRegistry';
import { searchSprites, SearchResult, getSuggestionsForConcept } from '../../utils/spriteSearch';

interface TotemPickerProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (sprite: SpriteAsset, customTitle?: string) => void;
  initialConcept?: string; // Pre-fill search with what user wants to remember
}

const SCREEN_WIDTH = Dimensions.get('window').width;
const GRID_COLUMNS = 4;
const SPRITE_SIZE = (SCREEN_WIDTH - 80) / GRID_COLUMNS;

export default function TotemPicker({
  visible,
  onClose,
  onSelect,
  initialConcept = '',
}: TotemPickerProps) {
  const [searchQuery, setSearchQuery] = useState(initialConcept);
  const [selectedCategory, setSelectedCategory] = useState<SpriteCategory | 'all'>('all');
  const [results, setResults] = useState<SearchResult[]>([]);

  const slideAnim = useRef(new Animated.Value(0)).current;

  // Update search results when query or category changes
  useEffect(() => {
    if (selectedCategory === 'all') {
      if (searchQuery.trim()) {
        setResults(searchSprites(searchQuery, 20));
      } else {
        // Show suggestions based on initial concept, or popular items
        setResults(initialConcept
          ? getSuggestionsForConcept(initialConcept, 20)
          : searchSprites('', 20)
        );
      }
    } else {
      setResults(searchSprites(searchQuery, 20, selectedCategory));
    }
  }, [searchQuery, selectedCategory, initialConcept]);

  // Reset state when modal opens
  useEffect(() => {
    if (visible) {
      setSearchQuery(initialConcept);
      Animated.spring(slideAnim, {
        toValue: 1,
        useNativeDriver: true,
        friction: 8,
      }).start();
    } else {
      slideAnim.setValue(0);
    }
  }, [visible, initialConcept]);

  const handleSpritePress = useCallback((sprite: SpriteAsset) => {
    onSelect(sprite, sprite.name);
    onClose();
  }, [onSelect, onClose]);

  const categories: (SpriteCategory | 'all')[] = ['all', 'common', 'nature', 'fantasy', 'knowledge', 'treasures', 'misc'];

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
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
            <TouchableOpacity onPress={onClose} style={styles.backButton}>
              <Text style={styles.backText}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Choose a Totem</Text>
            <View style={styles.backButton} />
          </View>

          {/* Search Input */}
              <View style={styles.searchContainer}>
                <TextInput
                  style={styles.searchInput}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder="Search for a symbol... (e.g., book, key, star)"
                  placeholderTextColor="#666"
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity
                    style={styles.clearButton}
                    onPress={() => setSearchQuery('')}
                  >
                    <Text style={styles.clearText}>✕</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Category Tabs */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.categoryScroll}
                contentContainerStyle={styles.categoryContainer}
              >
                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.categoryTab,
                      selectedCategory === cat && styles.categoryTabActive,
                    ]}
                    onPress={() => setSelectedCategory(cat)}
                  >
                    <Text style={styles.categoryEmoji}>
                      {cat === 'all' ? '🔮' : SPRITE_CATEGORIES[cat].emoji}
                    </Text>
                    <Text
                      style={[
                        styles.categoryText,
                        selectedCategory === cat && styles.categoryTextActive,
                      ]}
                    >
                      {cat === 'all' ? 'All' : SPRITE_CATEGORIES[cat].name.split(' ')[0]}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Results Grid */}
              <ScrollView
                style={styles.resultsScroll}
                contentContainerStyle={styles.resultsGrid}
              >
                {results.length > 0 ? (
                  results.map((result) => (
                    <TouchableOpacity
                      key={result.sprite.id}
                      style={styles.spriteItem}
                      onPress={() => handleSpritePress(result.sprite)}
                    >
                      <View
                        style={[
                          styles.spriteCircle,
                          { backgroundColor: SPRITE_CATEGORIES[result.sprite.category].color + '30' },
                        ]}
                      >
                        {result.sprite.spriteSource ? (
                          <Image
                            source={result.sprite.spriteSource}
                            style={styles.spriteImage}
                            resizeMode="contain"
                          />
                        ) : (
                          <Text style={styles.spriteEmoji}>{result.sprite.emoji}</Text>
                        )}
                      </View>
                      <Text style={styles.spriteName} numberOfLines={1}>
                        {result.sprite.name}
                      </Text>
                      {result.matchedOn === 'tag' && searchQuery && (
                        <Text style={styles.matchedTag}>
                          {result.sprite.tags.find(t => t.includes(searchQuery.toLowerCase()))}
                        </Text>
                      )}
                    </TouchableOpacity>
                  ))
                ) : (
                  <View style={styles.noResults}>
                    <Text style={styles.noResultsEmoji}>🔍</Text>
                    <Text style={styles.noResultsText}>No matching totems found</Text>
                    <Text style={styles.noResultsHint}>Try a different search term</Text>
                  </View>
                )}
              </ScrollView>

              {/* Hint */}
              <View style={styles.hintContainer}>
                <Text style={styles.hintText}>
                  Tip: Choose a totem that reminds you of what you want to remember
                </Text>
              </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#1a1a2e',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    minHeight: '70%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backText: {
    color: '#4ecdc4',
    fontSize: 24,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    backgroundColor: '#2a2a4e',
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    paddingVertical: 12,
  },
  clearButton: {
    padding: 8,
  },
  clearText: {
    color: '#666',
    fontSize: 16,
  },
  categoryScroll: {
    maxHeight: 60,
  },
  categoryContainer: {
    paddingHorizontal: 12,
    gap: 8,
  },
  categoryTab: {
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#2a2a4e',
    marginHorizontal: 4,
  },
  categoryTabActive: {
    backgroundColor: '#4ecdc4',
  },
  categoryEmoji: {
    fontSize: 18,
  },
  categoryText: {
    color: '#888',
    fontSize: 10,
    marginTop: 2,
  },
  categoryTextActive: {
    color: '#1a1a2e',
    fontWeight: 'bold',
  },
  resultsScroll: {
    flex: 1,
  },
  resultsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12,
  },
  spriteItem: {
    width: SPRITE_SIZE,
    alignItems: 'center',
    padding: 8,
  },
  spriteCircle: {
    width: SPRITE_SIZE - 24,
    height: SPRITE_SIZE - 24,
    borderRadius: (SPRITE_SIZE - 24) / 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#333',
  },
  spriteEmoji: {
    fontSize: 28,
  },
  spriteImage: {
    width: 40,
    height: 40,
  },
  spriteName: {
    color: '#ccc',
    fontSize: 11,
    marginTop: 4,
    textAlign: 'center',
  },
  matchedTag: {
    color: '#4ecdc4',
    fontSize: 9,
    marginTop: 2,
  },
  noResults: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    width: '100%',
  },
  noResultsEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  noResultsText: {
    color: '#888',
    fontSize: 16,
  },
  noResultsHint: {
    color: '#666',
    fontSize: 14,
    marginTop: 8,
  },
  hintContainer: {
    padding: 16,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  hintText: {
    color: '#666',
    fontSize: 12,
    textAlign: 'center',
  },
});
