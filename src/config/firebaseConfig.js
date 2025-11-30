// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Paste your Firebase config here (from Firebase Console → Project Settings → SDK setup)
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAfPRx33THebQQruQ2KXrkwvVB9Woq9QvU",
  authDomain: "aurevia-505f9.firebaseapp.com",
  projectId: "aurevia-505f9",
  storageBucket: "aurevia-505f9.firebasestorage.app",
  messagingSenderId: "302400804059",
  appId: "1:302400804059:web:9e4fd0383e2a84d33e68fe",
  measurementId: "G-KN8K6Q89FH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const provider = new GoogleAuthProvider();
