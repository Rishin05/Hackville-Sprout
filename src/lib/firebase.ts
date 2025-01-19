import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, EmailAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { getDatabase, ref as dbRef, set, get, push, onValue, off } from 'firebase/database';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Use environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const database = getDatabase(app);
const firestore = getFirestore(app);
const storage = getStorage(app);

const googleAuthProvider = new GoogleAuthProvider();
const emailAuthProvider = new EmailAuthProvider();

// Chat utility functions
const createChat = async (user1Id: string, user2Id: string) => {
  const chatId = [user1Id, user2Id].sort().join('_');
  const chatRef = dbRef(database, `chats/${chatId}`);
  
  // Check if chat exists
  const chatSnapshot = await get(chatRef);
  if (!chatSnapshot.exists()) {
    await set(chatRef, {
      participants: [user1Id, user2Id],
      createdAt: Date.now()
    });
  }
  return chatId;
};

const sendMessage = async (chatId: string, senderId: string, message: string) => {
  const messagesRef = dbRef(database, `chats/${chatId}/messages`);
  await push(messagesRef, {
    senderId,
    message,
    timestamp: Date.now()
  });
};

const subscribeToChat = (chatId: string, callback: (messages: any[]) => void) => {
  const messagesRef = dbRef(database, `chats/${chatId}/messages`);
  onValue(messagesRef, (snapshot) => {
    const messages: any[] = [];
    snapshot.forEach((childSnapshot) => {
      messages.push({
        id: childSnapshot.key,
        ...childSnapshot.val()
      });
    });
    callback(messages);
  });
};

const unsubscribeFromChat = (chatId: string) => {
  const messagesRef = dbRef(database, `chats/${chatId}/messages`);
  off(messagesRef);
};

export {
  auth,
  database,
  googleAuthProvider,
  emailAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  firestore,
  doc,
  setDoc,
  storage,
  // Chat exports
  createChat,
  sendMessage,
  subscribeToChat,
  unsubscribeFromChat
};
