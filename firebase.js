// Firebase SDK Initialization
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD6DjKDwMFcL4zGqd0oRJLOUR3uV_nwKrQ",
  authDomain: "ethobot-en.firebaseapp.com",
  projectId: "ethobot-en",
  storageBucket: "ethobot-en.firebasestorage.app",
  messagingSenderId: "769052364945",
  appId: "1:769052364945:web:ed71ed3570c61ec050ef30",
  measurementId: "G-H088VZE0RE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

export { db, analytics }; 