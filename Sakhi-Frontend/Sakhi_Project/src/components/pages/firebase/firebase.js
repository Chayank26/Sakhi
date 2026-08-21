import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAJXGxsSY2oQXfnhNIsvUNNEpIDL5fF7FQ",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "sakhi-8cba1.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "sakhi-8cba1",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "sakhi-8cba1.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "563751055888",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:563751055888:web:8047b9f7303ec84fb1d095",
};

// Initialize Firebase safely without throwing uncaught errors
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

let auth;
try {
  auth = getAuth(app);
} catch (error) {
  console.warn("Firebase Auth initialization fallback:", error);
}

export { auth };