// lib/firebase.js
//
// Initializes a single Firebase app instance and exposes the Realtime
// Database handle used by the live monitoring dashboard. All config
// values come from NEXT_PUBLIC_* env vars — see .env.local.example.
//
// Firebase RTDB rules for this project only need read access from the
// browser (the ESP32 writes with its own service account / device
// token), so no auth flow is wired up here. Add one if you later want
// to gate the dashboard behind a login.

import { initializeApp, getApps, getApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Reuse the existing app on Next.js hot-reloads instead of re-initializing.
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const db = getDatabase(app);
export default app;
