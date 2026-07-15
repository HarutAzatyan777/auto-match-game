/**
 * src/store/useGameStore.js
 *
 * Global state store for the Match-3 car restoration game.
 * Zustand handles local state; Firestore is the source of truth
 * for persistence across sessions and devices.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { worlds } from '../config/levels';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const USERS_COLLECTION = 'users';

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

const useGameStore = create(
  persist(
    (set, get) => ({
      // ── State ────────────────────────────────────────────────────────────────

      playerBalance: 0,
      score: 0,
      currentLevel: 1,
      currentWorldIndex: 0,
      currentLevelIndex: 0,
      tools: 0,
      repairProgress: 0,
      activeTab: 'board',
      isLoading: false,
      error: null,

      // Meta-game currency & progression
      stars: 0,
      unlockedParts: [],
      carConfig: [
        { id: 'engine', name: 'V8 Engine', cost: 1, type: 'internal' },
        { id: 'wheels', name: 'Alloy Wheels', cost: 2, type: 'external' },
        { id: 'paint', name: 'Custom Paint', cost: 3, type: 'external' }
      ],

      // ── Synchronous actions ──────────────────────────────────────────────────

      addTools: (amount) => {
        if (amount <= 0) return;
        set((state) => ({ tools: state.tools + amount }));
      },

      addScore: (amount) => {
        if (amount <= 0) return;
        set((state) => ({
          score: state.score + amount,
          playerBalance: state.playerBalance + amount,
        }));
      },

      spendScore: (amount) => {
        if (amount <= 0) return false;
        const { score } = get();
        if (score < amount) return false;
        set((state) => ({
          score: state.score - amount,
          playerBalance: state.playerBalance - amount,
        }));
        return true;
      },

      setRepairProgress: (progress) => {
        set({ repairProgress: progress });
      },

      incrementLevel: () => {
        set((state) => ({ currentLevel: state.currentLevel + 1 }));
      },

      advanceLevel: () => {
        set((state) => {
          const activeWorld = worlds[state.currentWorldIndex];
          const nextLevelIndex = state.currentLevelIndex + 1;
          
          let nextWorldIndex = state.currentWorldIndex;
          let finalLevelIndex = nextLevelIndex;

          if (nextLevelIndex >= activeWorld.levels.length) {
            nextWorldIndex = (state.currentWorldIndex + 1) % worlds.length;
            finalLevelIndex = 0;
          }

          return {
            currentWorldIndex: nextWorldIndex,
            currentLevelIndex: finalLevelIndex,
            currentLevel: state.currentLevel + 1,
          };
        });
      },

      setActiveTab: (tab) => set({ activeTab: tab }),

      spendTools: (amount) => {
        const current = get().tools;
        if (current < amount) return false;
        set({ tools: current - amount });
        return true;
      },

      spendBalance: (amount) => {
        if (amount <= 0) return false;
        const { playerBalance } = get();
        if (playerBalance < amount) return false;
        set((state) => ({
          playerBalance: state.playerBalance - amount,
          score: state.playerBalance - amount,
        }));
        return true;
      },

      // Meta-game currency progression actions
      addStars: (amount) => {
        if (amount <= 0) return;
        set((state) => ({ stars: state.stars + amount }));
      },

      unlockPart: (partId, cost) => {
        const currentStars = get().stars;
        if (currentStars < cost) return false;
        set((state) => ({
          stars: currentStars - cost,
          unlockedParts: [...state.unlockedParts, partId]
        }));
        return true;
      },

      // ── Async Firestore actions ──────────────────────────────────────────────

      syncWithFirestore: async (userId) => {
        if (!userId) {
          console.warn('[useGameStore] syncWithFirestore called without a userId.');
          return;
        }

        set({ isLoading: true, error: null });

        try {
          const userRef = doc(db, USERS_COLLECTION, String(userId));
          const userSnap = await getDoc(userRef);

          if (!userSnap.exists()) {
            throw new Error(`No Firestore document found for user "${userId}".`);
          }

          const data = userSnap.data();

          set({
            playerBalance: data.balance ?? 0,
            score: data.balance ?? 0,
            currentLevel: data.level ?? 1,
            currentWorldIndex: data.worldIndex ?? 0,
            currentLevelIndex: data.levelIndex ?? 0,
            tools: data.tools ?? 0,
            repairProgress: data.repairProgress ?? 0,
            stars: data.stars ?? 0,
            unlockedParts: data.unlockedParts ?? [],
            isLoading: false,
          });
        } catch (err) {
          console.error('[useGameStore] syncWithFirestore failed:', err);
          set({ isLoading: false, error: err.message });
        }
      },

      saveProgressToFirestore: async (userId) => {
        if (!userId) {
          console.warn(
            '[useGameStore] saveProgressToFirestore called without a userId.',
          );
          return;
        }

        set({ isLoading: true, error: null });

        try {
          const { score, currentLevel, tools, repairProgress, currentWorldIndex, currentLevelIndex, stars, unlockedParts } = get();
          const userRef = doc(db, USERS_COLLECTION, String(userId));

          await updateDoc(userRef, {
            balance: score,
            level: currentLevel,
            tools,
            repairProgress,
            worldIndex: currentWorldIndex,
            levelIndex: currentLevelIndex,
            stars,
            unlockedParts,
            lastSeenAt: serverTimestamp(),
          });

          set({ isLoading: false });
        } catch (err) {
          console.error('[useGameStore] saveProgressToFirestore failed:', err);
          set({ isLoading: false, error: err.message });
        }
      },
    }),
    {
      name: 'auto-match-game-store',
      partialize: (state) => ({
        playerBalance: state.playerBalance,
        score: state.score,
        currentLevel: state.currentLevel,
        currentWorldIndex: state.currentWorldIndex,
        currentLevelIndex: state.currentLevelIndex,
        tools: state.tools,
        repairProgress: state.repairProgress,
        stars: state.stars,
        unlockedParts: state.unlockedParts,
      }),
    }
  )
);

export default useGameStore;
