// Familiar Component - Animated owl companion that flies around the isometric grid
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { View, StyleSheet, Animated, Easing, Image, ImageSourcePropType, Vibration } from 'react-native';
import { IsometricPosition, PathNode } from '../../types';
import { FamiliarType, getFamiliar } from '../../config/familiarsConfig';

// --- Owl sprite frames ---

// Idle: breathing-idle/south (4 frames)
const OWL_IDLE: ImageSourcePropType[] = [
  require('../../assets/generated/familiars/animations/breathing-idle/south/frame_000.png'),
  require('../../assets/generated/familiars/animations/breathing-idle/south/frame_001.png'),
  require('../../assets/generated/familiars/animations/breathing-idle/south/frame_002.png'),
  require('../../assets/generated/familiars/animations/breathing-idle/south/frame_003.png'),
];

// Flying: 16 frames per direction (static requires for Metro bundler)
const OWL_FLY_EAST: ImageSourcePropType[] = [
  require('../../assets/generated/familiars/animations/custom-Flapping wings and flying/east/frame_000.png'),
  require('../../assets/generated/familiars/animations/custom-Flapping wings and flying/east/frame_001.png'),
  require('../../assets/generated/familiars/animations/custom-Flapping wings and flying/east/frame_002.png'),
  require('../../assets/generated/familiars/animations/custom-Flapping wings and flying/east/frame_003.png'),
  require('../../assets/generated/familiars/animations/custom-Flapping wings and flying/east/frame_004.png'),
  require('../../assets/generated/familiars/animations/custom-Flapping wings and flying/east/frame_005.png'),
  require('../../assets/generated/familiars/animations/custom-Flapping wings and flying/east/frame_006.png'),
  require('../../assets/generated/familiars/animations/custom-Flapping wings and flying/east/frame_007.png'),
  require('../../assets/generated/familiars/animations/custom-Flapping wings and flying/east/frame_008.png'),
  require('../../assets/generated/familiars/animations/custom-Flapping wings and flying/east/frame_009.png'),
  require('../../assets/generated/familiars/animations/custom-Flapping wings and flying/east/frame_010.png'),
  require('../../assets/generated/familiars/animations/custom-Flapping wings and flying/east/frame_011.png'),
  require('../../assets/generated/familiars/animations/custom-Flapping wings and flying/east/frame_012.png'),
  require('../../assets/generated/familiars/animations/custom-Flapping wings and flying/east/frame_013.png'),
  require('../../assets/generated/familiars/animations/custom-Flapping wings and flying/east/frame_014.png'),
  require('../../assets/generated/familiars/animations/custom-Flapping wings and flying/east/frame_015.png'),
];
const OWL_FLY_NORTH: ImageSourcePropType[] = [
  require('../../assets/generated/familiars/animations/custom-Flapping wings and flying/north/frame_000.png'),
  require('../../assets/generated/familiars/animations/custom-Flapping wings and flying/north/frame_001.png'),
  require('../../assets/generated/familiars/animations/custom-Flapping wings and flying/north/frame_002.png'),
  require('../../assets/generated/familiars/animations/custom-Flapping wings and flying/north/frame_003.png'),
  require('../../assets/generated/familiars/animations/custom-Flapping wings and flying/north/frame_004.png'),
  require('../../assets/generated/familiars/animations/custom-Flapping wings and flying/north/frame_005.png'),
  require('../../assets/generated/familiars/animations/custom-Flapping wings and flying/north/frame_006.png'),
  require('../../assets/generated/familiars/animations/custom-Flapping wings and flying/north/frame_007.png'),
  require('../../assets/generated/familiars/animations/custom-Flapping wings and flying/north/frame_008.png'),
  require('../../assets/generated/familiars/animations/custom-Flapping wings and flying/north/frame_009.png'),
  require('../../assets/generated/familiars/animations/custom-Flapping wings and flying/north/frame_010.png'),
  require('../../assets/generated/familiars/animations/custom-Flapping wings and flying/north/frame_011.png'),
  require('../../assets/generated/familiars/animations/custom-Flapping wings and flying/north/frame_012.png'),
  require('../../assets/generated/familiars/animations/custom-Flapping wings and flying/north/frame_013.png'),
  require('../../assets/generated/familiars/animations/custom-Flapping wings and flying/north/frame_014.png'),
  require('../../assets/generated/familiars/animations/custom-Flapping wings and flying/north/frame_015.png'),
];
const OWL_FLY_SOUTH: ImageSourcePropType[] = [
  require('../../assets/generated/familiars/animations/custom-Flapping wings and flying/south/frame_000.png'),
  require('../../assets/generated/familiars/animations/custom-Flapping wings and flying/south/frame_001.png'),
  require('../../assets/generated/familiars/animations/custom-Flapping wings and flying/south/frame_002.png'),
  require('../../assets/generated/familiars/animations/custom-Flapping wings and flying/south/frame_003.png'),
  require('../../assets/generated/familiars/animations/custom-Flapping wings and flying/south/frame_004.png'),
  require('../../assets/generated/familiars/animations/custom-Flapping wings and flying/south/frame_005.png'),
  require('../../assets/generated/familiars/animations/custom-Flapping wings and flying/south/frame_006.png'),
  require('../../assets/generated/familiars/animations/custom-Flapping wings and flying/south/frame_007.png'),
  require('../../assets/generated/familiars/animations/custom-Flapping wings and flying/south/frame_008.png'),
  require('../../assets/generated/familiars/animations/custom-Flapping wings and flying/south/frame_009.png'),
  require('../../assets/generated/familiars/animations/custom-Flapping wings and flying/south/frame_010.png'),
  require('../../assets/generated/familiars/animations/custom-Flapping wings and flying/south/frame_011.png'),
  require('../../assets/generated/familiars/animations/custom-Flapping wings and flying/south/frame_012.png'),
  require('../../assets/generated/familiars/animations/custom-Flapping wings and flying/south/frame_013.png'),
  require('../../assets/generated/familiars/animations/custom-Flapping wings and flying/south/frame_014.png'),
  require('../../assets/generated/familiars/animations/custom-Flapping wings and flying/south/frame_015.png'),
];
const OWL_FLY_NW: ImageSourcePropType[] = [
  require('../../assets/generated/familiars/animations/custom-Flapping wings and flying/north-west/frame_000.png'),
  require('../../assets/generated/familiars/animations/custom-Flapping wings and flying/north-west/frame_001.png'),
  require('../../assets/generated/familiars/animations/custom-Flapping wings and flying/north-west/frame_002.png'),
  require('../../assets/generated/familiars/animations/custom-Flapping wings and flying/north-west/frame_003.png'),
  require('../../assets/generated/familiars/animations/custom-Flapping wings and flying/north-west/frame_004.png'),
  require('../../assets/generated/familiars/animations/custom-Flapping wings and flying/north-west/frame_005.png'),
  require('../../assets/generated/familiars/animations/custom-Flapping wings and flying/north-west/frame_006.png'),
  require('../../assets/generated/familiars/animations/custom-Flapping wings and flying/north-west/frame_007.png'),
  require('../../assets/generated/familiars/animations/custom-Flapping wings and flying/north-west/frame_008.png'),
  require('../../assets/generated/familiars/animations/custom-Flapping wings and flying/north-west/frame_009.png'),
  require('../../assets/generated/familiars/animations/custom-Flapping wings and flying/north-west/frame_010.png'),
  require('../../assets/generated/familiars/animations/custom-Flapping wings and flying/north-west/frame_011.png'),
  require('../../assets/generated/familiars/animations/custom-Flapping wings and flying/north-west/frame_012.png'),
  require('../../assets/generated/familiars/animations/custom-Flapping wings and flying/north-west/frame_013.png'),
  require('../../assets/generated/familiars/animations/custom-Flapping wings and flying/north-west/frame_014.png'),
  require('../../assets/generated/familiars/animations/custom-Flapping wings and flying/north-west/frame_015.png'),
];

// Casting: "custom-Casting a mighty spell, magic sparkling" / south (16 frames)
const OWL_CAST_SOUTH: ImageSourcePropType[] = [
  require('../../assets/generated/familiars/animations/custom-Casting a mighty spell, magic sparkling/south/frame_000.png'),
  require('../../assets/generated/familiars/animations/custom-Casting a mighty spell, magic sparkling/south/frame_001.png'),
  require('../../assets/generated/familiars/animations/custom-Casting a mighty spell, magic sparkling/south/frame_002.png'),
  require('../../assets/generated/familiars/animations/custom-Casting a mighty spell, magic sparkling/south/frame_003.png'),
  require('../../assets/generated/familiars/animations/custom-Casting a mighty spell, magic sparkling/south/frame_004.png'),
  require('../../assets/generated/familiars/animations/custom-Casting a mighty spell, magic sparkling/south/frame_005.png'),
  require('../../assets/generated/familiars/animations/custom-Casting a mighty spell, magic sparkling/south/frame_006.png'),
  require('../../assets/generated/familiars/animations/custom-Casting a mighty spell, magic sparkling/south/frame_007.png'),
  require('../../assets/generated/familiars/animations/custom-Casting a mighty spell, magic sparkling/south/frame_008.png'),
  require('../../assets/generated/familiars/animations/custom-Casting a mighty spell, magic sparkling/south/frame_009.png'),
  require('../../assets/generated/familiars/animations/custom-Casting a mighty spell, magic sparkling/south/frame_010.png'),
  require('../../assets/generated/familiars/animations/custom-Casting a mighty spell, magic sparkling/south/frame_011.png'),
  require('../../assets/generated/familiars/animations/custom-Casting a mighty spell, magic sparkling/south/frame_012.png'),
  require('../../assets/generated/familiars/animations/custom-Casting a mighty spell, magic sparkling/south/frame_013.png'),
  require('../../assets/generated/familiars/animations/custom-Casting a mighty spell, magic sparkling/south/frame_014.png'),
  require('../../assets/generated/familiars/animations/custom-Casting a mighty spell, magic sparkling/south/frame_015.png'),
];

// Direction mapping: 8 directions → frames array + whether to mirror horizontally
// east mirrored = west, north-west mirrored = north-east
type DirInfo = { frames: ImageSourcePropType[]; mirror: boolean };
const FLY_DIRECTIONS: Record<string, DirInfo> = {
  north:      { frames: OWL_FLY_NORTH, mirror: false },
  'north-east': { frames: OWL_FLY_NW, mirror: true },    // mirror of NW
  east:       { frames: OWL_FLY_EAST, mirror: false },
  'south-east': { frames: OWL_FLY_EAST, mirror: false },  // closest match
  south:      { frames: OWL_FLY_SOUTH, mirror: false },
  'south-west': { frames: OWL_FLY_EAST, mirror: true },   // mirror of east
  west:       { frames: OWL_FLY_EAST, mirror: true },      // mirror of east
  'north-west': { frames: OWL_FLY_NW, mirror: false },
};

// Determine the 8-direction from a movement delta
function getDirection(dx: number, dy: number): string {
  const angle = Math.atan2(dy, dx) * (180 / Math.PI); // -180 to 180, 0 = right
  // Map angle to 8 directions (each covers 45 degrees)
  if (angle >= -22.5 && angle < 22.5) return 'east';
  if (angle >= 22.5 && angle < 67.5) return 'south-east';
  if (angle >= 67.5 && angle < 112.5) return 'south';
  if (angle >= 112.5 && angle < 157.5) return 'south-west';
  if (angle >= 157.5 || angle < -157.5) return 'west';
  if (angle >= -157.5 && angle < -112.5) return 'north-west';
  if (angle >= -112.5 && angle < -67.5) return 'north';
  return 'north-east'; // -67.5 to -22.5
}

interface FamiliarProps {
  type: FamiliarType;
  targetPosition: IsometricPosition;
  happiness: number;
  evolutionLevel: number;
  onArrival?: () => void;
  walkPath?: PathNode[];
  isCasting?: boolean;
  onCastingComplete?: () => void;
}

interface ParticleProps {
  x: number;
  y: number;
  color: string;
  type: 'smoke' | 'sparkle' | 'bubble' | 'flame' | 'rune';
}

export default function Familiar({
  type,
  targetPosition,
  happiness,
  evolutionLevel,
  onArrival,
  walkPath,
  isCasting,
  onCastingComplete,
}: FamiliarProps) {
  const posX = useRef(new Animated.Value(targetPosition.screenX)).current;
  const posY = useRef(new Animated.Value(targetPosition.screenY)).current;
  const bobOffset = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;

  const [particles, setParticles] = useState<ParticleProps[]>([]);
  const [isMoving, setIsMoving] = useState(false);
  const [isCastingAnim, setIsCastingAnim] = useState(false);
  const [castFrameIndex, setCastFrameIndex] = useState(0);
  const castTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [flyDirection, setFlyDirection] = useState<string>('south');
  const [frameIndex, setFrameIndex] = useState(0);
  const prevPositionRef = useRef({ x: targetPosition.screenX, y: targetPosition.screenY });
  const frameTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const moveIdRef = useRef(0);
  const bobAnimRef = useRef<Animated.CompositeAnimation | null>(null);
  const walkPathRef = useRef<PathNode[] | null>(null);
  const walkStepRef = useRef(0);
  const zapOpacity = useRef(new Animated.Value(0)).current;
  const zapScale = useRef(new Animated.Value(0)).current;
  const zapFlashOpacity = useRef(new Animated.Value(0)).current;
  const stretchAnim = useRef(new Animated.Value(0)).current;

  const familiarConfig = getFamiliar(type);

  // Frame animation timer
  const startFrameAnimation = useCallback((moving: boolean) => {
    if (frameTimerRef.current) clearInterval(frameTimerRef.current);
    setFrameIndex(0);

    const frameCount = moving ? 16 : OWL_IDLE.length;
    const interval = moving ? 40 : 133;

    frameTimerRef.current = setInterval(() => {
      setFrameIndex(prev => (prev + 1) % frameCount);
    }, interval);
  }, []);

  // One-shot casting animation (plays 16 frames then returns to idle)
  const startCastingAnimation = useCallback((onComplete?: () => void) => {
    if (frameTimerRef.current) clearInterval(frameTimerRef.current);
    if (castTimerRef.current) clearInterval(castTimerRef.current);

    setCastFrameIndex(0);
    setIsCastingAnim(true);

    const CAST_FRAME_COUNT = 16;
    const CAST_INTERVAL = 60; // 60ms * 16 = ~960ms total
    let currentFrame = 0;

    castTimerRef.current = setInterval(() => {
      currentFrame++;
      if (currentFrame >= CAST_FRAME_COUNT) {
        if (castTimerRef.current) clearInterval(castTimerRef.current);
        castTimerRef.current = null;
        setIsCastingAnim(false);
        startFrameAnimation(false); // resume idle
        onComplete?.();
      } else {
        setCastFrameIndex(currentFrame);
      }
    }, CAST_INTERVAL);
  }, [startFrameAnimation]);

  // Shadow bob — only runs while flying
  const startBobbing = useCallback(() => {
    if (bobAnimRef.current) bobAnimRef.current.stop();
    bobAnimRef.current = Animated.loop(
      Animated.sequence([
        Animated.timing(bobOffset, {
          toValue: -3,
          duration: 1500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(bobOffset, {
          toValue: 3,
          duration: 1500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    bobAnimRef.current.start();
  }, [bobOffset]);

  const stopBobbing = useCallback(() => {
    if (bobAnimRef.current) {
      bobAnimRef.current.stop();
      bobAnimRef.current = null;
    }
    Animated.timing(bobOffset, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [bobOffset]);

  // Blue zap effect + haptic buzz + stretch when re-routing mid-movement
  const triggerZap = useCallback(() => {
    Vibration.vibrate(50);

    // Outer expanding ring
    zapOpacity.setValue(1);
    zapScale.setValue(0.3);

    // Inner bright flash
    zapFlashOpacity.setValue(1);

    Animated.parallel([
      // Outer ring expands and fades
      Animated.timing(zapOpacity, {
        toValue: 0,
        duration: 500,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(zapScale, {
        toValue: 2.5,
        duration: 500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      // Inner flash fades faster
      Animated.timing(zapFlashOpacity, {
        toValue: 0,
        duration: 250,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      // Stretch/squash: quick ramp up then ease back
      Animated.sequence([
        Animated.timing(stretchAnim, {
          toValue: 1,
          duration: 100,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(stretchAnim, {
          toValue: 0,
          duration: 250,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [zapOpacity, zapScale, zapFlashOpacity, stretchAnim]);

  // Cleanup on unmount
  useEffect(() => {
    startFrameAnimation(false);
    return () => {
      if (frameTimerRef.current) clearInterval(frameTimerRef.current);
      if (castTimerRef.current) clearInterval(castTimerRef.current);
      if (bobAnimRef.current) bobAnimRef.current.stop();
    };
  }, []);

  // Casting animation trigger — responds to isCasting prop
  useEffect(() => {
    if (isCasting && !isCastingAnim) {
      if (isMoving) {
        setIsMoving(false);
        stopBobbing();
      }
      startCastingAnimation(onCastingComplete);
    }
  }, [isCasting]);

  // Walk a single step from current position to next PathNode
  const walkStep = useCallback((from: PathNode, to: PathNode, thisMoveId: number, onComplete: () => void) => {
    const dx = to.screenX - from.screenX;
    const dy = to.screenY - from.screenY;
    const dir = getDirection(dx, dy);
    setFlyDirection(dir);

    prevPositionRef.current = { x: to.screenX, y: to.screenY };

    Animated.parallel([
      Animated.timing(posX, {
        toValue: to.screenX,
        duration: 233,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
      Animated.timing(posY, {
        toValue: to.screenY,
        duration: 233,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (moveIdRef.current === thisMoveId) {
        onComplete();
      }
    });
  }, [posX, posY]);

  // Walk path: step-by-step tile animation
  useEffect(() => {
    if (!walkPath || walkPath.length < 2) return;
    if (isCastingAnim) return; // don't interrupt casting

    // Re-route detection: zap + haptic if already mid-movement
    if (isMoving) {
      triggerZap();
    }

    // New path — increment move generation
    moveIdRef.current += 1;
    const thisMoveId = moveIdRef.current;

    walkPathRef.current = walkPath;
    walkStepRef.current = 0;

    // Don't snap to path start — continue from current visual position
    // This prevents the jump when re-clicking mid-movement

    setIsMoving(true);
    startFrameAnimation(true);
    startBobbing();
    spawnParticleTrail();

    // Begin stepping through path
    const advanceStep = (stepIdx: number) => {
      if (moveIdRef.current !== thisMoveId) return;
      const path = walkPathRef.current;
      if (!path || stepIdx >= path.length - 1) {
        // Arrived at destination
        if (moveIdRef.current === thisMoveId) {
          setIsMoving(false);
          startFrameAnimation(false);
          stopBobbing();
        }
        onArrival?.();
        return;
      }

      // First step: use current visual position for direction calculation
      const from = stepIdx === 0
        ? { ...path[0], screenX: prevPositionRef.current.x, screenY: prevPositionRef.current.y }
        : path[stepIdx];
      const to = path[stepIdx + 1];
      walkStepRef.current = stepIdx + 1;

      walkStep(from, to, thisMoveId, () => {
        advanceStep(stepIdx + 1);
      });
    };

    advanceStep(0);
  }, [walkPath]);

  // Fallback: single-target movement when no walkPath
  useEffect(() => {
    if (walkPath && walkPath.length >= 2) return; // walkPath handles movement

    const dx = targetPosition.screenX - prevPositionRef.current.x;
    const dy = targetPosition.screenY - prevPositionRef.current.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    prevPositionRef.current = { x: targetPosition.screenX, y: targetPosition.screenY };

    if (distance > 2) {
      moveIdRef.current += 1;
      const thisMoveId = moveIdRef.current;

      const dir = getDirection(dx, dy);
      setFlyDirection(dir);
      setIsMoving(true);
      startFrameAnimation(true);
      startBobbing();
      spawnParticleTrail();

      Animated.parallel([
        Animated.timing(posX, {
          toValue: targetPosition.screenX,
          duration: 533,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(posY, {
          toValue: targetPosition.screenY,
          duration: 533,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start(() => {
        if (moveIdRef.current === thisMoveId) {
          setIsMoving(false);
          startFrameAnimation(false);
          stopBobbing();
        }
        onArrival?.();
      });
    } else {
      posX.setValue(targetPosition.screenX);
      posY.setValue(targetPosition.screenY);
    }
  }, [targetPosition.screenX, targetPosition.screenY]);

  // Happy animation
  useEffect(() => {
    if (happiness > 80) {
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 1.2,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [happiness]);

  // Particle trail
  const spawnParticleTrail = () => {
    const newParticles: ParticleProps[] = [];
    const particleType = familiarConfig.particleType === 'rune' ? 'rune' : 'sparkle';

    for (let i = 0; i < 5; i++) {
      newParticles.push({
        x: targetPosition.screenX + (Math.random() - 0.5) * 20,
        y: targetPosition.screenY + (Math.random() - 0.5) * 20,
        color: familiarConfig.colors.particle,
        type: particleType,
      });
    }
    setParticles(prev => [...prev.slice(-20), ...newParticles]);
    setTimeout(() => {
      setParticles(prev => prev.slice(5));
    }, 1000);
  };

  // Determine current sprite frame set and mirror state
  const spriteSize = (48 + (evolutionLevel - 1) * 8) * 1.5;
  let activeFrames: ImageSourcePropType[];
  let mirrorX = false;
  let activeIndex: number;

  if (isCastingAnim) {
    activeFrames = OWL_CAST_SOUTH;
    mirrorX = false;
    activeIndex = castFrameIndex;
  } else if (isMoving) {
    const dirInfo = FLY_DIRECTIONS[flyDirection] || FLY_DIRECTIONS.south;
    activeFrames = dirInfo.frames;
    mirrorX = dirInfo.mirror;
    activeIndex = frameIndex % activeFrames.length;
  } else {
    activeFrames = OWL_IDLE;
    mirrorX = false;
    activeIndex = frameIndex % activeFrames.length;
  }

  // Scale up idle, casting, north, and south sprites by 1.3x (their source frames are smaller)
  const frameScale = (isCastingAnim || !isMoving || flyDirection === 'north' || flyDirection === 'south') ? 1.3 : 1.0;

  // Sprite Y offset: center on tile, shifted down by half tile height (32px)
  const spriteOffsetY = spriteSize * 0.65 - 32;

  return (
    <View style={styles.container}>
      {/* Particle Trail */}
      {particles.map((particle, index) => (
        <Particle key={index} {...particle} />
      ))}

      {/* Familiar Sprite — no bobbing, positioned on tile */}
      <Animated.View
        style={[
          styles.familiar,
          {
            width: spriteSize,
            height: spriteSize,
            transform: [
              { translateX: Animated.subtract(posX, spriteSize / 2) },
              { translateY: Animated.subtract(posY, spriteOffsetY) },
              { scale },
              { scaleX: stretchAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.35] }) },
              { scaleY: stretchAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 0.7] }) },
            ],
          },
        ]}
      >
        <View style={{ width: spriteSize, height: spriteSize, transform: [{ scaleX: mirrorX ? -1 : 1 }, { scale: frameScale }] }}>
          {/* Pre-render all frames stacked; only active frame is visible */}
          {activeFrames.map((frame, idx) => (
            <Image
              key={idx}
              source={frame}
              style={{
                width: spriteSize,
                height: spriteSize,
                position: idx === 0 ? 'relative' : 'absolute',
                top: 0,
                left: 0,
                opacity: idx === activeIndex ? 1 : 0,
              }}
              resizeMode="contain"
              fadeDuration={0}
            />
          ))}
        </View>
      </Animated.View>

      {/* Shadow on the ground — bobs only when flying */}
      <Animated.View
        style={[
          styles.shadow,
          {
            width: spriteSize * 0.525,
            height: spriteSize * 0.135,
            transform: [
              { translateX: Animated.subtract(posX, spriteSize * 0.2625) },
              { translateY: Animated.add(posY, 28) },
              { scaleX: bobOffset.interpolate({
                  inputRange: [-3, 3],
                  outputRange: [0.7, 1.1],
                }) },
              { scaleY: bobOffset.interpolate({
                  inputRange: [-3, 3],
                  outputRange: [0.7, 1.1],
                }) },
            ],
            opacity: bobOffset.interpolate({
              inputRange: [-3, 3],
              outputRange: [0.12, 0.35],
            }),
          },
        ]}
      />

      {/* Blue zap — inner flash + outer expanding ring */}
      <Animated.View
        style={[
          styles.zapFlash,
          {
            transform: [
              { translateX: Animated.subtract(posX, 30) },
              { translateY: Animated.subtract(posY, 10) },
            ],
            opacity: zapFlashOpacity,
          },
        ]}
        pointerEvents="none"
      />
      <Animated.View
        style={[
          styles.zapRing,
          {
            transform: [
              { translateX: Animated.subtract(posX, 40) },
              { translateY: Animated.subtract(posY, 20) },
              { scale: zapScale },
            ],
            opacity: zapOpacity,
          },
        ]}
        pointerEvents="none"
      />
    </View>
  );
}

// Individual Particle Component
function Particle({ x, y, color, type }: ParticleProps) {
  const opacity = useRef(new Animated.Value(1)).current;
  const particleY = useRef(new Animated.Value(y)).current;
  const particleScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(particleY, {
        toValue: type === 'smoke' ? y - 20 : y + 10,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(particleScale, {
        toValue: type === 'smoke' ? 1.5 : 0,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const particleStyle = type === 'smoke' ? styles.smokeParticle :
                        type === 'rune' ? styles.runeParticle : styles.sparkleParticle;

  return (
    <Animated.View
      style={[
        particleStyle,
        {
          backgroundColor: color,
          transform: [
            { translateX: x - 4 },
            { translateY: particleY },
            { scale: particleScale },
          ],
          opacity,
        },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
    zIndex: 9999,
  },
  familiar: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  spriteEmoji: {
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  shadow: {
    position: 'absolute',
    backgroundColor: '#000',
    borderRadius: 100,
  },
  zapFlash: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(180, 230, 255, 0.7)',
    shadowColor: '#4fc3f7',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 20,
  },
  zapRing: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: '#81d4fa',
    backgroundColor: 'rgba(100, 200, 255, 0.25)',
    shadowColor: '#29b6f6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 15,
  },
  smokeParticle: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  sparkleParticle: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  runeParticle: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 1,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
});
