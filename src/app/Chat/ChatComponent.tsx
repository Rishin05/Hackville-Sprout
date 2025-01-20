"use client"

import { useEffect, useState, useRef } from "react";
import { database } from "../../lib/firebase";
import { ref as dbRef, onValue, set, push } from "firebase/database";
import { auth } from "../../lib/firebase";
import { DataSnapshot } from 'firebase/database';

interface ChatProps {
  otherUserId: string;
  otherUserName: string;
  setShowChat: React.Dispatch<React.SetStateAction<boolean>>;
}

interface Message {
  id: string;
  text: string;
  senderId: string;
  timestamp: number;
  senderProfilePic?: string;
}

const Chat: React.FC<ChatProps> = ({ otherUserId, otherUserName, setShowChat }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState<string>("");
  const [isSending, setIsSending] = useState(false);
  const [otherUserProfile, setOtherUserProfile] = useState<string>("");
  const [currentUserProfile, setCurrentUserProfile] = useState<string>("");
  const userId = auth.currentUser?.uid;
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Fetch user profiles
  useEffect(() => {
    if (!userId) return;

    const otherUserRef = dbRef(database, `users/${otherUserId}`);
    const currentUserRef = dbRef(database, `users/${userId}`);

    onValue(otherUserRef, (snapshot) => {
      if (snapshot.exists()) {
        const userData = snapshot.val();
        setOtherUserProfile(userData.profilePicture || "");
      }
    });

    onValue(currentUserRef, (snapshot) => {
      if (snapshot.exists()) {
        const userData = snapshot.val();
        setCurrentUserProfile(userData.profilePicture || "");
      }
    });
  }, [userId, otherUserId]);

  useEffect(() => {
    if (!userId) return;

    // Only listen to one reference to prevent duplicate messages
    const chatRef = dbRef(database, `chats/${userId}/${otherUserId}`);

    const handleNewMessages = (snapshot: DataSnapshot) => {
      if (!snapshot.exists()) return;
      
      const messagesData: Message[] = [];
      snapshot.forEach((childSnapshot: DataSnapshot) => {
        messagesData.push({
          ...childSnapshot.val(),
          id: childSnapshot.key as string
        });
      });
    
      setMessages(messagesData.sort((a, b) => a.timestamp - b.timestamp));
    };

    const unsubscribe = onValue(chatRef, handleNewMessages);

    return () => unsubscribe();
  }, [userId, otherUserId]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const sendMessage = async () => {
    if (!messageInput.trim() || !userId || isSending) return;

    setIsSending(true);
    const trimmedMessage = messageInput.trim();
    setMessageInput("");

    try {
      const timestamp = Date.now();
      const message: Message = {
        id: `${timestamp}-${Math.random().toString(36).substr(2, 9)}`,
        text: trimmedMessage,
        senderId: userId,
        timestamp,
        senderProfilePic: userId === auth.currentUser?.uid ? currentUserProfile : otherUserProfile
      };

      const userMessagesRef = dbRef(database, `chats/${userId}/${otherUserId}`);
      const otherUserMessagesRef = dbRef(database, `chats/${otherUserId}/${userId}`);

      const newMessageRefUser = push(userMessagesRef);
      const newMessageRefOther = push(otherUserMessagesRef);

      await Promise.all([
        set(newMessageRefUser, message),
        set(newMessageRefOther, message)
      ]);

    } catch (error) {
      console.error("Error sending message:", error);
      setMessageInput(trimmedMessage);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col bg-[#EEF4C7] rounded-lg shadow-lg h-[80vh] w-96">
      <div className="p-4 border-b border-gray-300 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <img
            src={otherUserProfile || "/default-avatar.png"}
            alt={`${otherUserName}'s profile`}
            className="w-8 h-8 rounded-full object-cover"
          />
          <h2 className="text-xl font-semibold">Chat with {otherUserName}</h2>
        </div>
        <button
          onClick={() => setShowChat(false)}
          className="text-2xl text-gray-500 hover:text-gray-700"
        >
          ×
        </button>
      </div>

      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 max-h-[calc(80vh-130px)]"
      >
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex items-start gap-2 mb-3 ${
              message.senderId === userId ? 'flex-row-reverse' : 'flex-row'
            }`}
          >
            <img
              src={message.senderId === userId ? currentUserProfile || "/default-avatar.png" : otherUserProfile || "/default-avatar.png"}
              alt="Profile"
              className="w-8 h-8 rounded-full object-cover"
            />
            <div className="flex flex-col">
              <div
                className={`p-3 rounded-lg ${
                  message.senderId === userId
                    ? "bg-white"
                    : "bg-[#B8C659] text-white"
                }`}
              >
                <p className="break-words">{message.text}</p>
              </div>
              <span className={`text-xs text-gray-500 mt-1 ${
                message.senderId === userId ? 'text-right' : 'text-left'
              }`}>
                {formatTimestamp(message.timestamp)}
              </span>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-gray-300">
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isSending}
            className="flex-1 p-2 rounded-lg border border-gray-300"
            placeholder="Type a message..."
          />
          <button
            onClick={sendMessage}
            disabled={isSending}
            className={`text-black px-4 py-2 rounded ${
              isSending 
                ? "bg-gray-300 cursor-not-allowed" 
                : "bg-[#DBEC62] hover:bg-[#F8F27D]"
            }`}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;