// Camera and panning hook for the isometric game view
// Handles: auto-follow, free panning, pinch-to-zoom, tap vs drag detection, refocus
import { useState, useRef, useCallback, useEffect } from 'react';
import { Animated, GestureResponderEvent, PanResponder } from 'react-native';
import { isoToScreen } from '../utils/isometric';
import { touchToTile } from '../utils/gameUtils';

const PAN_THRESHOLD = 15;
const MIN_ZOOM = 0.5;
const MAX_ZOOM = 2.5;

interface UseGameCameraOptions {
  familiarPosition: { isoX: number; isoY: number };
  gridCenterX: number;
  gridCenterY: number;
  gridWidth: number;
  gridHeight: number;
  onTileTap: (isoX: number, isoY: number) => void;
}

export function useGameCamera({
  familiarPosition,
  gridCenterX,
  gridCenterY,
  gridWidth,
  gridHeight,
  onTileTap,
}: UseGameCameraOptions) {
  const [isFreePanning, setIsFreePanning] = useState(false);

  const cameraOffset = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const zoomScale = useRef(new Animated.Value(1)).current;

  const touchCount = useRef(0);
  const lastPanOffset = useRef({ x: 0, y: 0 });
  const currentCameraOffsetRef = useRef({ x: 0, y: 0 });
  const currentZoomRef = useRef(1);
  const wasPanningRef = useRef(false);
  const touchStartPos = useRef({ x: 0, y: 0 });

  // Pinch tracking
  const initialPinchDistance = useRef(0);
  const baseZoomOnPinchStart = useRef(1);
  const isPinchingRef = useRef(false);

  const [currentCameraOffset, setCurrentCameraOffset] = useState({ x: 0, y: 0 });
  const [currentZoom, setCurrentZoom] = useState(1);

  // Track camera offset for touch handling (both state for React and ref for PanResponder)
  useEffect(() => {
    const listenerId = cameraOffset.addListener(({ x, y }) => {
      setCurrentCameraOffset({ x, y });
      currentCameraOffsetRef.current = { x, y };
    });
    return () => cameraOffset.removeListener(listenerId);
  }, [cameraOffset]);

  // Track zoom scale for touch handling
  useEffect(() => {
    const listenerId = zoomScale.addListener(({ value }) => {
      setCurrentZoom(value);
      currentZoomRef.current = value;
    });
    return () => zoomScale.removeListener(listenerId);
  }, [zoomScale]);

  // Refocus camera on familiar
  const refocusCamera = useCallback(() => {
    setIsFreePanning(false);
    const familiarScreenPos = isoToScreen(familiarPosition.isoX, familiarPosition.isoY);
    Animated.parallel([
      Animated.timing(cameraOffset.x, {
        toValue: -familiarScreenPos.x,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(cameraOffset.y, {
        toValue: -familiarScreenPos.y,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [familiarPosition.isoX, familiarPosition.isoY, cameraOffset]);

  // Auto-follow camera: update camera when familiar moves (only if not free panning)
  useEffect(() => {
    if (isFreePanning) return;

    const familiarScreenPos = isoToScreen(familiarPosition.isoX, familiarPosition.isoY);
    const targetOffsetX = -familiarScreenPos.x;
    const targetOffsetY = -familiarScreenPos.y;

    Animated.parallel([
      Animated.timing(cameraOffset.x, {
        toValue: targetOffsetX,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(cameraOffset.y, {
        toValue: targetOffsetY,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, [familiarPosition.isoX, familiarPosition.isoY, isFreePanning]);

  // Handle single tap on the grid area - converts touch to tile and calls callback
  const handleGridTap = useCallback((locationX: number, locationY: number) => {
    const tile = touchToTile(
      locationX,
      locationY,
      gridCenterX,
      gridCenterY,
      currentCameraOffset.x,
      currentCameraOffset.y,
      gridWidth,
      gridHeight,
      currentZoom
    );

    if (tile) {
      setIsFreePanning(false);
      onTileTap(tile.isoX, tile.isoY);
    }
  }, [gridCenterX, gridCenterY, currentCameraOffset, gridWidth, gridHeight, onTileTap, currentZoom]);

  // PanResponder for panning and pinch-to-zoom
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        const touches = evt.nativeEvent.touches;
        if (touches && touches.length >= 2) return true;
        const moved = Math.abs(gestureState.dx) > PAN_THRESHOLD || Math.abs(gestureState.dy) > PAN_THRESHOLD;
        return moved;
      },
      onPanResponderGrant: () => {
        lastPanOffset.current = { ...currentCameraOffsetRef.current };
        wasPanningRef.current = true;
        setIsFreePanning(true);
      },
      onPanResponderMove: (evt, gestureState) => {
        const touches = evt.nativeEvent.touches;

        if (touches && touches.length >= 2) {
          // Pinch-to-zoom
          const dx = touches[0].pageX - touches[1].pageX;
          const dy = touches[0].pageY - touches[1].pageY;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (initialPinchDistance.current === 0) {
            // First frame of pinch — record baseline
            initialPinchDistance.current = distance;
            baseZoomOnPinchStart.current = currentZoomRef.current;
            isPinchingRef.current = true;
          } else {
            const ratio = distance / initialPinchDistance.current;
            const newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, baseZoomOnPinchStart.current * ratio));
            zoomScale.setValue(newZoom);
          }
        } else if (!isPinchingRef.current) {
          // Single finger pan — divide by zoom so pan speed matches finger movement
          const zoom = currentZoomRef.current;
          const newX = lastPanOffset.current.x + gestureState.dx / zoom;
          const newY = lastPanOffset.current.y + gestureState.dy / zoom;
          cameraOffset.setValue({ x: newX, y: newY });
        }
      },
      onPanResponderRelease: () => {
        initialPinchDistance.current = 0;
        isPinchingRef.current = false;
        setTimeout(() => {
          wasPanningRef.current = false;
        }, 100);
      },
    })
  ).current;

  // Track touch for distinguishing tap vs pan
  const handleTouchStart = useCallback((event: GestureResponderEvent) => {
    touchCount.current = event.nativeEvent.touches?.length || 1;
    touchStartPos.current = {
      x: event.nativeEvent.locationX,
      y: event.nativeEvent.locationY,
    };
  }, []);

  const handleTouchEnd = useCallback((event: GestureResponderEvent) => {
    const touches = event.nativeEvent.touches?.length || 0;
    if (touchCount.current === 1 && touches === 0 && !wasPanningRef.current) {
      const { locationX, locationY } = event.nativeEvent;
      handleGridTap(locationX, locationY);
    }
    touchCount.current = touches;
  }, [handleGridTap]);

  return {
    cameraOffset,
    zoomScale,
    isFreePanning,
    refocusCamera,
    panHandlers: panResponder.panHandlers,
    handleTouchStart,
    handleTouchEnd,
  };
}
