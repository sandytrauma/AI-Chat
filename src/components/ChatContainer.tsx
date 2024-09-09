"use client";
import { useEffect, useRef, useState } from 'react';
import { UserButton, useUser } from '@clerk/nextjs';
import bot from '/public/assets/bot.svg';
import userImage from '/public/assets/user.svg';
import defaultProfile from '/public/assets/default-profile.svg';
import Image from 'next/image';
import { db, ref, set, query, orderByChild, limitToLast, get } from '../services/firebaseConfig';
import { FaCircleNotch } from "react-icons/fa";

const POLL_INTERVAL = 5000; // Poll every 5 seconds

const ChatContainer: React.FC = () => {
  const { user, isLoaded, isSignedIn } = useUser();
  const [messages, setMessages] = useState<{ id: string; isAi: boolean; content: string }[]>([]);
  const [input, setInput] = useState('');

  const endOfMessagesRef = useRef<HTMLDivElement>(null);
  const messagesRef = ref(db, 'messages');

  const generateUniqueId = () => `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;

  const fetchMessages = async () => {
    const messagesQuery = query(messagesRef, orderByChild('id'), limitToLast(100));
    const snapshot = await get(messagesQuery);
    const messagesData: { [key: string]: { id: string; isAi: boolean; content: string } } = snapshot.val();
    const loadedMessages = Object.values(messagesData || {});
    setMessages(loadedMessages);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newMessageId = generateUniqueId();
    const newMessage = { id: newMessageId, isAi: false, content: input };
    setInput('');

    // Save the new message to Firebase
    await set(ref(db, `messages/${newMessageId}`), newMessage);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: input }),
      });
      const data = await response.json();

      const aiMessage = { id: generateUniqueId(), isAi: true, content: data.bot };
      await set(ref(db, `messages/${aiMessage.id}`), aiMessage);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = { id: generateUniqueId(), isAi: true, content: 'Something went wrong. Please try again.' };
      await set(ref(db, `messages/${errorMessage.id}`), errorMessage);
    }
  };

  useEffect(() => {
    fetchMessages(); // Initial fetch

    const intervalId = setInterval(fetchMessages, POLL_INTERVAL); // Set up polling

    return () => {
      clearInterval(intervalId); // Clean up interval on component unmount
    };
  }, [fetchMessages]);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!isLoaded) return <div className="flex items-center justify-center h-screen w-screen">
    <FaCircleNotch className="animate-spin text-gray-600" size={50} />
  </div>

  return (
    <div className="flex h-screen">
 
  <div className="w-1/4 bg-gray-200 p-4 border-r border-gray-300">
    <h1 className="text-lg font-bold mb-4">Welcome to AI Chat, your personal assistant</h1>
    <div className="text-center">
      <UserButton />
    </div>
    {isSignedIn ? (
      <div className="flex items-center space-x-2 mt-4">
        <Image
          height={40}
          width={40}
          src={user.profileImage || defaultProfile} // Use defaultProfile if user.profileImage is not available
          alt="User"
          className="w-10 h-10 rounded-full"
        />
        <div>
          <p className="text-sm font-medium">{user.fullName || 'User'}</p>
          <p className="text-xs text-gray-600">
            {user.emailAddresses[0]?.emailAddress || 'No email'}
          </p>
        </div>
      </div>
    ) : (
      <p className="text-sm text-gray-600 mt-4">You need to sign in to see your details.</p>
    )}
  </div>


  <div className="flex-1 flex flex-col p-4 bg-gray-100">
    <div className="flex-1 flex flex-col overflow-hidden">
     
      <div className="flex-1 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-md p-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.isAi ? 'justify-start' : 'justify-end'} space-x-2 mb-2`}
          >
            <Image
              height={28}
              width={28}
              priority
              src={msg.isAi ? bot : userImage}
              alt={msg.isAi ? 'Bot' : 'User'}
              className="w-8 h-8 rounded-full"
            />
            <div
              className={`p-3 rounded-lg max-w-xs ${msg.isAi ? 'bg-gray-200 text-gray-800' : 'bg-blue-500 text-white'
                }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        <div ref={endOfMessagesRef} />
      </div>

      
      <form onSubmit={handleSubmit} className="flex items-center space-x-2 mt-4">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <button
          type="submit"
          className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 transition duration-200"
        >
          Send
        </button>
      </form>
    </div>
  </div>
</div>
  );
};

export default ChatContainer;
