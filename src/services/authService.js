/**
 * src/services/authService.js
 *
 * Handles Firebase authentication for Telegram Mini App users.
 *
 * Flow:
 *  1. Sign in anonymously via Firebase Auth (creates a persistent UID).
 *  2. Look up the user's Firestore document (keyed by Telegram user ID).
 *  3. If it doesn't exist yet, create it with default game stats.
 *  4. Return the full user data object.
 */

import { signInAnonymously } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const USERS_COLLECTION = 'users';

/** Initial game stats applied to every brand-new player. */
const DEFAULT_STATS = {
  level: 1,
  balance: 0,
  currentEnergy: 100,
};

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

/**
 * Authenticate a Telegram user with Firebase and ensure their Firestore
 * document exists.
 *
 * @param {Object} telegramUserData - The user object from Telegram WebApp
 *   (e.g. `window.Telegram.WebApp.initDataUnsafe.user`).
 * @param {number|string} telegramUserData.id - Unique Telegram user ID (used
 *   as the Firestore document key).
 * @param {string} [telegramUserData.first_name]
 * @param {string} [telegramUserData.last_name]
 * @param {string} [telegramUserData.username]
 * @param {string} [telegramUserData.language_code]
 *
 * @returns {Promise<Object>} The user's Firestore document data, merged with
 *   the Telegram profile fields.
 *
 * @throws {Error} Re-throws Firebase errors so callers can handle them.
 */
export async function authenticateTelegramUser(telegramUserData) {
  if (!telegramUserData?.id) {
    throw new Error(
      '[authService] telegramUserData.id is required but was not provided.',
    );
  }

  // ── Step 1: Anonymous Firebase Auth sign-in ──────────────────────────────
  // signInAnonymously is idempotent for the same browser session; Firebase
  // returns the cached credential if the user is already signed in.
  const { user: firebaseUser } = await signInAnonymously(auth);

  // ── Step 2: Look up the Firestore user document ──────────────────────────
  const userId = String(telegramUserData.id);
  const userRef = doc(db, USERS_COLLECTION, userId);
  const userSnap = await getDoc(userRef);

  // ── Step 3: Create document if first visit ───────────────────────────────
  if (!userSnap.exists()) {
    const newUser = {
      // Telegram profile (safe subset – avoid storing sensitive fields)
      telegramId: userId,
      firstName: telegramUserData.first_name ?? null,
      lastName: telegramUserData.last_name ?? null,
      username: telegramUserData.username ?? null,
      languageCode: telegramUserData.language_code ?? null,

      // Firebase UID for server-side rule matching
      firebaseUid: firebaseUser.uid,

      // Game stats
      ...DEFAULT_STATS,

      // Timestamps
      createdAt: serverTimestamp(),
      lastSeenAt: serverTimestamp(),
    };

    await setDoc(userRef, newUser);

    return newUser;
  }

  // ── Step 4: Return existing user data ────────────────────────────────────
  // Optionally update lastSeenAt on every login so you can track activity.
  // Uncomment the block below if you want that behaviour:
  //
  // await updateDoc(userRef, { lastSeenAt: serverTimestamp() });

  return userSnap.data();
}
