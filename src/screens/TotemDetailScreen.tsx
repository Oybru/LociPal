// Totem Detail Screen - Split view: totem image + associated content
import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  Linking,
  Alert,
  Dimensions,
  Animated,
  PanResponder,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Crypto from 'expo-crypto';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, TotemLink, TotemImage } from '../types';
import { usePalaceStore } from '../stores/palaceStore';

const uuidv4 = () => Crypto.randomUUID();

type Props = NativeStackScreenProps<RootStackParamList, 'TotemDetail'>;

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function TotemDetailScreen({ navigation, route }: Props) {
  const { palaceId, totemId } = route.params;
  const { palaces, updateTotemContent, deleteTotem } = usePalaceStore();

  const palace = palaces.find((p) => p.id === palaceId);
  const totem = palace?.totems.find((t) => t.id === totemId);

  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(totem?.content.title || '');
  const [description, setDescription] = useState(totem?.content.description || '');
  const [notes, setNotes] = useState(totem?.content.notes || '');
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [newLinkLabel, setNewLinkLabel] = useState('');

  // Card scale animation using standard Animated (simple and cross-platform)
  const cardScale = useRef(new Animated.Value(1)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        Animated.spring(cardScale, { toValue: 0.95, useNativeDriver: true }).start();
      },
      onPanResponderRelease: () => {
        Animated.spring(cardScale, { toValue: 1, useNativeDriver: true }).start();
      },
    })
  ).current;

  const animatedCardStyle = {
    transform: [{ scale: cardScale }],
  };

  if (!palace || !totem) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Totem not found</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleSave = async () => {
    await updateTotemContent(palaceId, totemId, {
      title,
      description,
      notes,
    });
    setIsEditing(false);
  };

  const handleAddLink = async () => {
    if (!newLinkUrl.trim()) {
      Alert.alert('Error', 'Please enter a URL');
      return;
    }

    const newLink: TotemLink = {
      id: uuidv4(),
      url: newLinkUrl.trim(),
      label: newLinkLabel.trim() || newLinkUrl.trim(),
    };

    await updateTotemContent(palaceId, totemId, {
      links: [...totem.content.links, newLink],
    });

    setNewLinkUrl('');
    setNewLinkLabel('');
  };

  const handleRemoveLink = async (linkId: string) => {
    await updateTotemContent(palaceId, totemId, {
      links: totem.content.links.filter((l) => l.id !== linkId),
    });
  };

  const handleAddImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const newImage: TotemImage = {
        id: uuidv4(),
        uri: result.assets[0].uri,
      };

      await updateTotemContent(palaceId, totemId, {
        images: [...totem.content.images, newImage],
      });
    }
  };

  const handleRemoveImage = async (imageId: string) => {
    await updateTotemContent(palaceId, totemId, {
      images: totem.content.images.filter((i) => i.id !== imageId),
    });
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Totem',
      'Are you sure you want to delete this totem and all its content?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteTotem(palaceId, totemId);
            navigation.goBack();
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Totem Details</Text>
        <TouchableOpacity onPress={handleDelete}>
          <Text style={styles.deleteButton}>🗑</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.splitContainer}>
        {/* Left side: Totem Card (interactive) */}
        <View style={styles.cardSection}>
          <Animated.View
            style={[styles.card, animatedCardStyle]}
            {...panResponder.panHandlers}
          >
            {totem.imageUri ? (
              <Image source={{ uri: totem.imageUri }} style={styles.cardImage} />
            ) : (
              <View style={styles.placeholderImage}>
                <Text style={styles.placeholderText}>🔮</Text>
              </View>
            )}
            <View style={styles.cardLabel}>
              <Text style={styles.cardLabelText} numberOfLines={1}>
                {totem.content.title || totem.prompt || 'Untitled'}
              </Text>
            </View>
          </Animated.View>
          <Text style={styles.cardHint}>Drag to rotate</Text>
        </View>

        {/* Right side: Content */}
        <ScrollView style={styles.contentSection} showsVerticalScrollIndicator={false}>
          {/* Title & Description */}
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Title</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={title}
                onChangeText={setTitle}
                placeholder="What does this represent?"
                placeholderTextColor="#666"
              />
            ) : (
              <Text style={styles.fieldValue}>
                {totem.content.title || 'Tap edit to add a title'}
              </Text>
            )}
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Description</Text>
            {isEditing ? (
              <TextInput
                style={[styles.input, styles.multilineInput]}
                value={description}
                onChangeText={setDescription}
                placeholder="What are you memorizing?"
                placeholderTextColor="#666"
                multiline
              />
            ) : (
              <Text style={styles.fieldValue}>
                {totem.content.description || 'Tap edit to add a description'}
              </Text>
            )}
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Notes</Text>
            {isEditing ? (
              <TextInput
                style={[styles.input, styles.multilineInput]}
                value={notes}
                onChangeText={setNotes}
                placeholder="Additional notes..."
                placeholderTextColor="#666"
                multiline
              />
            ) : (
              <Text style={styles.fieldValue}>
                {totem.content.notes || 'No notes yet'}
              </Text>
            )}
          </View>

          {/* Links */}
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Links</Text>
            {totem.content.links.map((link) => (
              <View key={link.id} style={styles.linkItem}>
                <TouchableOpacity
                  style={styles.linkButton}
                  onPress={() => Linking.openURL(link.url)}
                >
                  <Text style={styles.linkText} numberOfLines={1}>
                    {link.label}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleRemoveLink(link.id)}
                  style={styles.removeButton}
                >
                  <Text style={styles.removeButtonText}>×</Text>
                </TouchableOpacity>
              </View>
            ))}
            {isEditing && (
              <View style={styles.addLinkContainer}>
                <TextInput
                  style={[styles.input, styles.linkInput]}
                  value={newLinkUrl}
                  onChangeText={setNewLinkUrl}
                  placeholder="URL"
                  placeholderTextColor="#666"
                />
                <TextInput
                  style={[styles.input, styles.linkInput]}
                  value={newLinkLabel}
                  onChangeText={setNewLinkLabel}
                  placeholder="Label (optional)"
                  placeholderTextColor="#666"
                />
                <TouchableOpacity style={styles.addLinkButton} onPress={handleAddLink}>
                  <Text style={styles.addLinkButtonText}>Add Link</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Images */}
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Attached Images</Text>
            <View style={styles.imagesGrid}>
              {totem.content.images.map((image) => (
                <View key={image.id} style={styles.imageContainer}>
                  <Image source={{ uri: image.uri }} style={styles.attachedImage} />
                  <TouchableOpacity
                    style={styles.removeImageButton}
                    onPress={() => handleRemoveImage(image.id)}
                  >
                    <Text style={styles.removeButtonText}>×</Text>
                  </TouchableOpacity>
                </View>
              ))}
              {isEditing && (
                <TouchableOpacity style={styles.addImageButton} onPress={handleAddImage}>
                  <Text style={styles.addImageText}>+</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Prompt used */}
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>AI Prompt</Text>
            <Text style={styles.promptText}>{totem.prompt}</Text>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </View>

      {/* Edit/Save Button */}
      <View style={styles.footer}>
        {isEditing ? (
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Save Changes</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => setIsEditing(true)}
          >
            <Text style={styles.editButtonText}>Edit Content</Text>
          </TouchableOpacity>
        )}
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
  },
  backButton: {
    color: '#e94560',
    fontSize: 16,
  },
  title: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  deleteButton: {
    fontSize: 20,
  },
  splitContainer: {
    flex: 1,
    flexDirection: SCREEN_WIDTH > SCREEN_HEIGHT ? 'row' : 'column',
  },
  cardSection: {
    flex: SCREEN_WIDTH > SCREEN_HEIGHT ? 1 : 0.4,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: 160,
    height: 200,
    backgroundColor: '#16213e',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#e94560',
    shadowColor: '#e94560',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  cardImage: {
    width: '100%',
    height: '80%',
    resizeMode: 'cover',
  },
  placeholderImage: {
    width: '100%',
    height: '80%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0f0f23',
  },
  placeholderText: {
    fontSize: 48,
  },
  cardLabel: {
    height: '20%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e94560',
  },
  cardLabelText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    paddingHorizontal: 8,
  },
  cardHint: {
    color: '#666',
    fontSize: 12,
    marginTop: 12,
  },
  contentSection: {
    flex: 1,
    padding: 20,
  },
  field: {
    marginBottom: 20,
  },
  fieldLabel: {
    color: '#e94560',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  fieldValue: {
    color: '#a0a0a0',
    fontSize: 16,
    lineHeight: 22,
  },
  input: {
    backgroundColor: '#0f0f23',
    borderRadius: 8,
    padding: 12,
    color: '#fff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#2a2a4e',
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  linkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  linkButton: {
    flex: 1,
    backgroundColor: '#0f0f23',
    padding: 12,
    borderRadius: 8,
    marginRight: 8,
  },
  linkText: {
    color: '#4fc3f7',
    fontSize: 14,
  },
  removeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e94560',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  addLinkContainer: {
    marginTop: 8,
  },
  linkInput: {
    marginBottom: 8,
  },
  addLinkButton: {
    backgroundColor: '#533483',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  addLinkButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  imagesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  imageContainer: {
    width: 80,
    height: 80,
    margin: 4,
    position: 'relative',
  },
  attachedImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#e94560',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addImageButton: {
    width: 80,
    height: 80,
    margin: 4,
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
    fontSize: 32,
  },
  promptText: {
    color: '#666',
    fontSize: 14,
    fontStyle: 'italic',
  },
  footer: {
    padding: 20,
    backgroundColor: '#16213e',
  },
  editButton: {
    backgroundColor: '#533483',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  editButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  saveButton: {
    backgroundColor: '#e94560',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 100,
  },
});
