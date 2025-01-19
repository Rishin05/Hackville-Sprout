"use client";

import { useState, useEffect } from 'react';
import { auth, createChat, sendMessage, subscribeToChat, unsubscribeFromChat } from '../../lib/firebase';

interface Message {
  id: string;
  senderId: string;
  message: string;
  timestamp: number;
}

interface ChatProps {
  otherUserId: string;
  otherUserName: string;
}

const Chat = ({ otherUserId, otherUserName }: ChatProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [chatId, setChatId] = useState<string | null>(null);

  useEffect(() => {
    const initializeChat = async () => {
      if (auth.currentUser && otherUserId) {
        const chatRoomId = await createChat(auth.currentUser.uid, otherUserId);
        setChatId(chatRoomId);
        
        // Subscribe to messages
        subscribeToChat(chatRoomId, (newMessages) => {
          setMessages(newMessages.sort((a, b) => a.timestamp - b.timestamp));
        });
      }
    };

    initializeChat();

    // Cleanup subscription on unmount
    return () => {
      if (chatId) {
        unsubscribeFromChat(chatId);
      }
    };
  }, [otherUserId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() && chatId && auth.currentUser) {
      await sendMessage(chatId, auth.currentUser.uid, newMessage.trim());
      setNewMessage('');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3>Chat with {otherUserName}</h3>
      </div>
      
      <div style={styles.messagesContainer}>
        {messages.map((msg) => (
          <div
            key={msg.id}
            style={{
              ...styles.message,
              ...(msg.senderId === auth.currentUser?.uid
                ? styles.sentMessage
                : styles.receivedMessage),
            }}
          >
            <p style={styles.messageText}>{msg.message}</p>
            <span style={styles.timestamp}>
              {new Date(msg.timestamp).toLocaleTimeString()}
            </span>
          </div>
        ))}
      </div>

      <form onSubmit={handleSendMessage} style={styles.form}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          style={styles.input}
        />
        <button type="submit" style={styles.button}>
          Send
        </button>
      </form>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column' as const,
    height: '400px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    margin: '20px 0',
  },
  header: {
    padding: '10px',
    borderBottom: '1px solid #ddd',
    backgroundColor: '#f8f9fa',
  },
  messagesContainer: {
    flex: 1,
    overflow: 'auto',
    padding: '10px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '10px',
  },
  message: {
    maxWidth: '70%',
    padding: '8px 12px',
    borderRadius: '12px',
    marginBottom: '5px',
  },
  sentMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#007bff',
    color: 'white',
  },
  receivedMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#e9ecef',
    color: 'black',
  },
  messageText: {
    margin: '0',
    wordBreak: 'break-word' as const,
  },
  timestamp: {
    fontSize: '0.75rem',
    opacity: 0.7,
    display: 'block',
    marginTop: '4px',
  },
  form: {
    display: 'flex',
    padding: '10px',
    borderTop: '1px solid #ddd',
    gap: '10px',
  },
  input: {
    flex: 1,
    padding: '8px',
    border: '1px solid #ddd',
    borderRadius: '4px',
  },
  button: {
    padding: '8px 16px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
};

export default Chat;