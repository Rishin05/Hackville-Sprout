import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, EmailAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { getDatabase, ref as dbRef, set, get, push, onValue, off, DataSnapshot } from 'firebase/database';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Define interfaces for message and chat data
interface ChatMessage {
  id?: string;
  senderId: string;
  message: string;
  timestamp: number;
}

interface ChatData {
  participants: string[];
  createdAt: number;
  messages?: Record<string, ChatMessage>;
}

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
    const newChat: ChatData = {
      participants: [user1Id, user2Id],
      createdAt: Date.now()
    };
    await set(chatRef, newChat);
  }
  return chatId;
};

const sendMessage = async (chatId: string, senderId: string, message: string) => {
  const messagesRef = dbRef(database, `chats/${chatId}/messages`);
  const newMessage: Omit<ChatMessage, 'id'> = {
    senderId,
    message,
    timestamp: Date.now()
  };
  await push(messagesRef, newMessage);
};

const subscribeToChat = (chatId: string, callback: (messages: ChatMessage[]) => void) => {
  const messagesRef = dbRef(database, `chats/${chatId}/messages`);
  onValue(messagesRef, (snapshot: DataSnapshot) => {
    const messages: ChatMessage[] = [];
    snapshot.forEach((childSnapshot: DataSnapshot) => {
      messages.push({
        id: childSnapshot.key || undefined,
        ...(childSnapshot.val() as Omit<ChatMessage, 'id'>)
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
  unsubscribeFromChat,
  // Type exports
  type ChatMessage,
  type ChatData
};