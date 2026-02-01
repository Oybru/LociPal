// Crystal Ball - The Recall Engine UI
// Displays a random totem and tests user's memory
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Modal,
  Animated,
  Easing,
  TextInput,
} from 'react-native';
import { Totem } from '../../types';

interface CrystalBallProps {
  visible: boolean;
  totems: Totem[];
  onClose: () => void;
  onRecallSuccess: (totem: Totem, manaEarned: number) => void;
  onRecallFail: (totem: Totem) => void;
}

type RecallPhase = 'showing' | 'hidden' | 'reveal' | 'result';

export default function CrystalBall({
  visible,
  totems,
  onClose,
  onRecallSuccess,
  onRecallFail,
}: CrystalBallProps) {
  const [currentTotem, setCurrentTotem] = useState<Totem | null>(null);
  const [phase, setPhase] = useState<RecallPhase>('showing');
  const [userAnswer, setUserAnswer] = useState('');
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [streak, setStreak] = useState(0);

  // Animations
  const orbGlow = useRef(new Animated.Value(0.5)).current;
  const mistOpacity = useRef(new Animated.Value(0)).current;
  const cardScale = useRef(new Animated.Value(0)).current;
  const resultScale = useRef(new Animated.Value(0)).current;

  // Pulsing glow animation
  useEffect(() => {
    if (visible) {
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(orbGlow, {
            toValue: 1,
            duration: 1500,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(orbGlow, {
            toValue: 0.5,
            duration: 1500,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      );
      pulseAnimation.start();
      return () => pulseAnimation.stop();
    }
  }, [visible]);

  // Select random totem when opened
  useEffect(() => {
    if (visible && totems.length > 0) {
      const randomTotem = totems[Math.floor(Math.random() * totems.length)];
      setCurrentTotem(randomTotem);
      setPhase('showing');
      setUserAnswer('');
      setIsCorrect(null);

      // Show totem briefly, then hide
      Animated.sequence([
        Animated.timing(cardScale, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.delay(3000), // Show for 3 seconds
        Animated.timing(mistOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setPhase('hidden');
      });
    }
  }, [visible, totems]);

  const handleSubmitAnswer = () => {
    if (!currentTotem || !userAnswer.trim()) return;

    setPhase('reveal');

    // Check if answer matches (fuzzy matching)
    const correct = checkAnswer(userAnswer, currentTotem);
    setIsCorrect(correct);

    // Reveal animation
    Animated.sequence([
      Animated.timing(mistOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(resultScale, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setPhase('result');

      if (correct) {
        const manaEarned = calculateMana(streak + 1);
        setStreak(s => s + 1);
        onRecallSuccess(currentTotem, manaEarned);
      } else {
        setStreak(0);
        onRecallFail(currentTotem);
      }
    });
  };

  const checkAnswer = (answer: string, totem: Totem): boolean => {
    const normalizedAnswer = answer.toLowerCase().trim();
    const title = totem.content.title.toLowerCase();
    const description = totem.content.description.toLowerCase();
    const prompt = totem.prompt.toLowerCase();

    // Check for partial matches
    return (
      title.includes(normalizedAnswer) ||
      normalizedAnswer.includes(title) ||
      description.includes(normalizedAnswer) ||
      prompt.includes(normalizedAnswer) ||
      normalizedAnswer.split(' ').some(word =>
        title.includes(word) || prompt.includes(word)
      )
    );
  };

  const calculateMana = (currentStreak: number): number => {
    // Base mana + streak bonus
    return 10 + (currentStreak - 1) * 5;
  };

  const handleNextOrClose = () => {
    if (isCorrect) {
      // Try another if correct
      setPhase('showing');
      setUserAnswer('');
      setIsCorrect(null);
      cardScale.setValue(0);
      resultScale.setValue(0);

      const randomTotem = totems[Math.floor(Math.random() * totems.length)];
      setCurrentTotem(randomTotem);

      Animated.sequence([
        Animated.timing(cardScale, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.delay(3000),
        Animated.timing(mistOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start(() => setPhase('hidden'));
    } else {
      // Close on failure
      onClose();
      setStreak(0);
    }
  };

  if (!visible || !currentTotem) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>The Scrying Orb</Text>
            <View style={styles.streakBadge}>
              <Text style={styles.streakText}>🔥 {streak}</Text>
            </View>
          </View>

          {/* Crystal Ball */}
          <View style={styles.orbContainer}>
            <Animated.View
              style={[
                styles.orbGlow,
                { opacity: orbGlow },
              ]}
            />
            <View style={styles.orb}>
              {/* Totem Card */}
              <Animated.View
                style={[
                  styles.totemCard,
                  { transform: [{ scale: cardScale }] },
                ]}
              >
                {currentTotem.imageUri ? (
                  <Image
                    source={{ uri: currentTotem.imageUri }}
                    style={styles.totemImage}
                    resizeMode="contain"
                  />
                ) : (
                  <View style={styles.totemPlaceholder}>
                    <Text style={styles.totemEmoji}>🔮</Text>
                  </View>
                )}
              </Animated.View>

              {/* Mist Overlay */}
              <Animated.View
                style={[
                  styles.mist,
                  { opacity: mistOpacity },
                ]}
              >
                <Text style={styles.mistText}>?</Text>
              </Animated.View>
            </View>
          </View>

          {/* Input Area */}
          {phase === 'hidden' && (
            <View style={styles.inputArea}>
              <Text style={styles.promptText}>
                What memory does this totem hold?
              </Text>
              <TextInput
                style={styles.input}
                placeholder="Enter what you remember..."
                placeholderTextColor="#666"
                value={userAnswer}
                onChangeText={setUserAnswer}
                onSubmitEditing={handleSubmitAnswer}
                autoFocus
              />
              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleSubmitAnswer}
              >
                <Text style={styles.submitText}>Reveal Truth</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Result */}
          {phase === 'result' && (
            <Animated.View
              style={[
                styles.resultArea,
                { transform: [{ scale: resultScale }] },
              ]}
            >
              <Text style={[
                styles.resultText,
                isCorrect ? styles.successText : styles.failText,
              ]}>
                {isCorrect ? '✨ Correct!' : '💫 Not quite...'}
              </Text>

              <View style={styles.answerReveal}>
                <Text style={styles.answerLabel}>The totem holds:</Text>
                <Text style={styles.answerText}>
                  {currentTotem.content.title || currentTotem.prompt}
                </Text>
              </View>

              {isCorrect && (
                <View style={styles.manaEarned}>
                  <Text style={styles.manaText}>
                    +{calculateMana(streak)} Mana 💎
                  </Text>
                </View>
              )}

              <TouchableOpacity
                style={[
                  styles.nextButton,
                  isCorrect ? styles.successButton : styles.closeButton,
                ]}
                onPress={handleNextOrClose}
              >
                <Text style={styles.nextText}>
                  {isCorrect ? 'Continue Scrying' : 'Return to Palace'}
                </Text>
              </TouchableOpacity>
            </Animated.View>
          )}

          {/* Close Button */}
          <TouchableOpacity style={styles.closeX} onPress={onClose}>
            <Text style={styles.closeXText}>×</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(10, 20, 40, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: '#16213e',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#4ecdc4',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4ecdc4',
  },
  streakBadge: {
    backgroundColor: '#e94560',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  streakText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  orbContainer: {
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
  },
  orbGlow: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: '#4ecdc4',
  },
  orb: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: '#0a1628',
    borderWidth: 4,
    borderColor: '#4ecdc4',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  totemCard: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  totemImage: {
    width: '100%',
    height: '100%',
  },
  totemPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
    borderRadius: 8,
  },
  totemEmoji: {
    fontSize: 48,
  },
  mist: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(78, 205, 196, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mistText: {
    fontSize: 64,
    color: '#fff',
    fontWeight: 'bold',
  },
  inputArea: {
    width: '100%',
    alignItems: 'center',
  },
  promptText: {
    color: '#a0a0a0',
    fontSize: 16,
    marginBottom: 12,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    backgroundColor: '#0a1628',
    borderRadius: 8,
    padding: 16,
    color: '#fff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#4ecdc4',
    marginBottom: 16,
  },
  submitButton: {
    backgroundColor: '#4ecdc4',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 8,
  },
  submitText: {
    color: '#0a1628',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resultArea: {
    width: '100%',
    alignItems: 'center',
  },
  resultText: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  successText: {
    color: '#4ecdc4',
  },
  failText: {
    color: '#e94560',
  },
  answerReveal: {
    backgroundColor: '#0a1628',
    padding: 16,
    borderRadius: 8,
    width: '100%',
    marginBottom: 16,
  },
  answerLabel: {
    color: '#666',
    fontSize: 12,
    marginBottom: 4,
  },
  answerText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  manaEarned: {
    marginBottom: 16,
  },
  manaText: {
    color: '#ffd700',
    fontSize: 20,
    fontWeight: 'bold',
  },
  nextButton: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 8,
  },
  successButton: {
    backgroundColor: '#4ecdc4',
  },
  closeButton: {
    backgroundColor: '#e94560',
  },
  nextText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  closeX: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeXText: {
    color: '#666',
    fontSize: 28,
  },
});
