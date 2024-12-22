// firebaseConfig.js

// Import Firebase modules (v9+ modular approach)
import { initializeApp } from "firebase/app";
import { getMessaging } from "firebase/messaging";

// Your Firebase configuration object
const firebaseConfig = {
  apiKey: "AIzaSyBDVcdUNdiMAzAznttQVOd4366sxEh3q-s",
  authDomain: "edusphere-4c675.firebaseapp.com",
  projectId: "edusphere-4c675",
  storageBucket: "edusphere-4c675.appspot.com",
  messagingSenderId: "236428100090",
  appId: "1:236428100090:web:ee77c1f11bc8cd12052443",
  measurementId: "G-VEYKFV6MWB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get Firebase Cloud Messaging instance
const messaging = getMessaging(app);

export { messaging };  // Export messaging instance
export default firebaseConfig; // Export the config for later use
