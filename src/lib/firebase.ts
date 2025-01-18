import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, EmailAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore'; // Import Firestore

// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAAwbDqegCjCpcPEo5IfHbY8zuUeop1i28",
  authDomain: "skillshare-bfe22.firebaseapp.com",
  projectId: "skillshare-bfe22",
  storageBucket: "skillshare-bfe22.firebasestorage.app",
  messagingSenderId: "440176173704",
  appId: "1:440176173704:web:c82b48fb411c84effd753d"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get Firebase services
const auth = getAuth(app);
const firestore = getFirestore(app); // Initialize Firestore

// Firebase Auth Providers
const googleAuthProvider = new GoogleAuthProvider();
const emailAuthProvider = new EmailAuthProvider();

// Export everything to use in your app
export { auth, googleAuthProvider, emailAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, firestore, doc, setDoc };
