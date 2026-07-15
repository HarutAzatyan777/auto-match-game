/**
 * src/config/firebase.js
 *
 * Initialises Firebase and exports the shared app, auth, and db instances.
 * Uses the modular (tree-shakeable) SDK so only the sub-packages you import
 * are included in the production bundle.
 *
 * Usage:
 *   import { auth, db } from '@/config/firebase';
 */

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// ---------------------------------------------------------------------------
// Validate that all required env vars are present at startup so you get a
// clear error in development instead of a cryptic Firebase runtime failure.
// ---------------------------------------------------------------------------
const REQUIRED_ENV_VARS = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
  'VITE_FIREBASE_MEASUREMENT_ID',
];

const missing = REQUIRED_ENV_VARS.filter((key) => !import.meta.env[key]);

if (missing.length > 0) {
  throw new Error(
    `[firebase.js] Missing required environment variable(s):\n  ${missing.join('\n  ')}\n` +
      'Copy .env.example → .env and fill in your Firebase project values.',
  );
}

// ---------------------------------------------------------------------------
// Firebase configuration object – values come exclusively from .env
// ---------------------------------------------------------------------------
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// ---------------------------------------------------------------------------
// Initialise the Firebase app (singleton – safe to import from multiple files)
// ---------------------------------------------------------------------------
const app = initializeApp(firebaseConfig);

// ---------------------------------------------------------------------------
// Service instances
// ---------------------------------------------------------------------------

/** Firebase Authentication instance */
const auth = getAuth(app);

/** Cloud Firestore instance */
const db = getFirestore(app);

export { app, auth, db };
