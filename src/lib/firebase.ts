import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, EmailAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { getDatabase, ref as dbRef, set, get, push, onValue, off } from 'firebase/database';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyAxmhWeGecS816SvrohLyUr4bjEOI4rvU0",
  authDomain: "sprout-44502.firebaseapp.com",
  databaseURL: "https://sprout-44502-default-rtdb.firebaseio.com",
  projectId: "sprout-44502",
  storageBucket: "sprout-44502.firebasestorage.app",
  messagingSenderId: "803164210419",
  appId: "1:803164210419:web:dbeccf6c9fa3f504842386"
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