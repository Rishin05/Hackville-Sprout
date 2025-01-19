import { useEffect, useState } from "react";
import { database } from "../../lib/firebase";
import { ref as dbRef, onValue, set } from "firebase/database";
import { auth } from "../../lib/firebase"; // Assuming auth is imported from firebase

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
}

const Chat: React.FC<ChatProps> = ({ otherUserId, otherUserName, setShowChat }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState<string>("");

  const [userId] = useState(auth.currentUser?.uid);

  useEffect(() => {
    if (!userId) return;

    // Listen to messages between current user and the other user
    const messagesRef = dbRef(database, `chats/${userId}/${otherUserId}`);
    const unsubscribe = onValue(messagesRef, (snapshot) => {
      const messagesData: Message[] = [];
      snapshot.forEach((childSnapshot) => {
        messagesData.push(childSnapshot.val());
      });
      setMessages(messagesData);
    });

    // Cleanup the listener when the component unmounts
    return () => unsubscribe();
  }, [userId, otherUserId]);

  const sendMessage = async () => {
    if (!messageInput.trim()) return;

    const message: Message = {
      id: Date.now().toString(), // Unique message ID (timestamp)
      text: messageInput.trim(),
      senderId: userId || "",
      timestamp: Date.now(),
    };

    if (userId) {
      // Send message to both users' chat
      await set(dbRef(database, `chats/${userId}/${otherUserId}/${message.id}`), message);
      await set(dbRef(database, `chats/${otherUserId}/${userId}/${message.id}`), message);
    }

    setMessageInput("");
  };

  return (
    <div className="flex flex-col bg-[#EEF4C7] rounded-lg shadow-lg h-full w-96">
      <div className="p-4 border-b border-gray-300 flex justify-between items-center">
        <h2 className="text-xl font-semibold">Chat with {otherUserName}</h2>
        <button
          onClick={() => setShowChat(false)}
          className="text-2xl text-gray-500 hover:text-gray-700"
        >
          ×
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.senderId === userId ? 'justify-end' : 'justify-start'} mb-3`}
          >
            <div
              className={`p-3 max-w-[70%] rounded-lg ${
                message.senderId === userId
                  ? "bg-white" // User's message with white bubble
                  : "bg-[#B8C659] text-white" // Other user's message with green bubble
              }`}
            >
              <p>{message.text}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-gray-300 flex items-center gap-3">
        <input
          type="text"
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          className="flex-1 p-2 rounded-lg border border-gray-300"
          placeholder="Type a message..."
        />
        <button
          onClick={sendMessage}
          className="text-black bg-[#DBEC62] px-4 py-2 rounded hover:bg-[#F8F27D]"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default Chat;
