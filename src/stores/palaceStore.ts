// Zustand store for managing palaces and totems
import { create } from 'zustand';
import * as Crypto from 'expo-crypto';
import { Palace, Totem, TotemContent, IsometricPosition, PalaceTheme } from '../types';
import { DatabaseService } from '../services/database';

// Use expo-crypto for UUID generation (more reliable in React Native)
const uuidv4 = () => Crypto.randomUUID();

interface PalaceStore {
  palaces: Palace[];
  currentPalace: Palace | null;
  isLoading: boolean;
  error: string | null;

  // Palace actions
  loadPalaces: () => Promise<void>;
  createPalace: (name: string, templateId: string, theme: PalaceTheme) => Promise<Palace>;
  deletePalace: (palaceId: string) => Promise<void>;
  setCurrentPalace: (palaceId: string) => void;
  updatePalace: (palaceId: string, updates: Partial<Palace>) => Promise<void>;

  // Totem actions
  addTotem: (
    palaceId: string,
    position: IsometricPosition,
    prompt: string,
    imageUri: string
  ) => Promise<Totem>;
  updateTotem: (palaceId: string, totemId: string, updates: Partial<Totem>) => Promise<void>;
  deleteTotem: (palaceId: string, totemId: string) => Promise<void>;
  updateTotemContent: (
    palaceId: string,
    totemId: string,
    content: Partial<TotemContent>
  ) => Promise<void>;
  moveTotem: (palaceId: string, totemId: string, newPosition: IsometricPosition) => Promise<void>;
}

export const usePalaceStore = create<PalaceStore>((set, get) => ({
  palaces: [],
  currentPalace: null,
  isLoading: false,
  error: null,

  loadPalaces: async () => {
    set({ isLoading: true, error: null });
    try {
      const palaces = await DatabaseService.getAllPalaces();
      set({ palaces, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  createPalace: async (name: string, templateId: string, theme: PalaceTheme) => {
    try {
      // Ensure database is initialized
      await DatabaseService.init();

      const now = Date.now();
      const palace: Palace = {
        id: uuidv4(),
        name,
        templateId,
        theme,
        createdAt: now,
        updatedAt: now,
        totems: [],
      };

      await DatabaseService.savePalace(palace);
      set((state) => ({ palaces: [...state.palaces, palace] }));
      return palace;
    } catch (error) {
      console.error('Failed to create palace:', error);
      throw error;
    }
  },

  deletePalace: async (palaceId: string) => {
    await DatabaseService.deletePalace(palaceId);
    set((state) => ({
      palaces: state.palaces.filter((p) => p.id !== palaceId),
      currentPalace: state.currentPalace?.id === palaceId ? null : state.currentPalace,
    }));
  },

  setCurrentPalace: (palaceId: string) => {
    const palace = get().palaces.find((p) => p.id === palaceId) || null;
    set({ currentPalace: palace });
  },

  updatePalace: async (palaceId: string, updates: Partial<Palace>) => {
    const palace = get().palaces.find((p) => p.id === palaceId);
    if (!palace) return;

    const updatedPalace = { ...palace, ...updates, updatedAt: Date.now() };
    await DatabaseService.savePalace(updatedPalace);

    set((state) => ({
      palaces: state.palaces.map((p) => (p.id === palaceId ? updatedPalace : p)),
      currentPalace: state.currentPalace?.id === palaceId ? updatedPalace : state.currentPalace,
    }));
  },

  addTotem: async (
    palaceId: string,
    position: IsometricPosition,
    prompt: string,
    imageUri: string
  ) => {
    const now = Date.now();
    const totem: Totem = {
      id: uuidv4(),
      palaceId,
      position,
      prompt,
      imageUri,
      createdAt: now,
      updatedAt: now,
      content: {
        title: '',
        description: '',
        links: [],
        images: [],
        notes: '',
      },
      scale: 1,
      zIndex: position.isoX + position.isoY,
    };

    const palace = get().palaces.find((p) => p.id === palaceId);
    if (!palace) throw new Error('Palace not found');

    const updatedPalace = {
      ...palace,
      totems: [...palace.totems, totem],
      updatedAt: now,
    };

    await DatabaseService.savePalace(updatedPalace);

    set((state) => ({
      palaces: state.palaces.map((p) => (p.id === palaceId ? updatedPalace : p)),
      currentPalace: state.currentPalace?.id === palaceId ? updatedPalace : state.currentPalace,
    }));

    return totem;
  },

  updateTotem: async (palaceId: string, totemId: string, updates: Partial<Totem>) => {
    const palace = get().palaces.find((p) => p.id === palaceId);
    if (!palace) return;

    const updatedTotems = palace.totems.map((t) =>
      t.id === totemId ? { ...t, ...updates, updatedAt: Date.now() } : t
    );

    const updatedPalace = { ...palace, totems: updatedTotems, updatedAt: Date.now() };
    await DatabaseService.savePalace(updatedPalace);

    set((state) => ({
      palaces: state.palaces.map((p) => (p.id === palaceId ? updatedPalace : p)),
      currentPalace: state.currentPalace?.id === palaceId ? updatedPalace : state.currentPalace,
    }));
  },

  deleteTotem: async (palaceId: string, totemId: string) => {
    const palace = get().palaces.find((p) => p.id === palaceId);
    if (!palace) return;

    const updatedPalace = {
      ...palace,
      totems: palace.totems.filter((t) => t.id !== totemId),
      updatedAt: Date.now(),
    };

    await DatabaseService.savePalace(updatedPalace);

    set((state) => ({
      palaces: state.palaces.map((p) => (p.id === palaceId ? updatedPalace : p)),
      currentPalace: state.currentPalace?.id === palaceId ? updatedPalace : state.currentPalace,
    }));
  },

  updateTotemContent: async (
    palaceId: string,
    totemId: string,
    content: Partial<TotemContent>
  ) => {
    const palace = get().palaces.find((p) => p.id === palaceId);
    if (!palace) return;

    const totem = palace.totems.find((t) => t.id === totemId);
    if (!totem) return;

    await get().updateTotem(palaceId, totemId, {
      content: { ...totem.content, ...content },
    });
  },

  moveTotem: async (palaceId: string, totemId: string, newPosition: IsometricPosition) => {
    await get().updateTotem(palaceId, totemId, {
      position: newPosition,
      zIndex: newPosition.isoX + newPosition.isoY,
    });
  },
}));
