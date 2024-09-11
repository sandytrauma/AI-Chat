"use client";
import { useEffect, useRef, useState } from 'react';
import { UserButton, useUser } from '@clerk/nextjs';
import bot from '/public/assets/bot.svg';
import userImage from '/public/assets/user.svg';
import defaultProfile from '/public/assets/default-profile.svg';
import Image from 'next/image';
import { db, ref, set, query, orderByChild, limitToLast, get } from '../services/firebaseConfig';
import { FaCircleNotch } from "react-icons/fa";
import Link from "next/link"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

import { Button } from "@/components/ui/button"

import {

  Home,
  LineChart,
  Menu,

  Package2,


} from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const POLL_INTERVAL = 5000; // Poll every 5 seconds

const generateUniqueId = () => `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;

const ChatContainer: React.FC = () => {
  const { user, isLoaded, isSignedIn } = useUser();
  const [messages, setMessages] = useState<{ id: string; isAi: boolean; content: string }[]>([]);
  const [input, setInput] = useState('');

  const endOfMessagesRef = useRef<HTMLDivElement>(null);
  const messagesRef = ref(db, 'messages');

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

  if (!isLoaded) return (
    <div className="flex items-center justify-center h-screen w-screen">
      <FaCircleNotch className="animate-spin text-gray-600" size={50} />
    </div>
  );

  return (
    <div className="flex h-screen">
      <div className="hidden border-r bg-muted/40 md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">

            <div className="text-center">
              <UserButton />
            </div>
            {isSignedIn ? (
              <div className="flex items-center space-x-2 mt-4">
                <Image
                  height={40}
                  width={40}
                  src={defaultProfile}
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
          <div>
            <div className="flex-1">
              <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
                <Link
                  href="#"
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                >
                  <Home className="h-4 w-4" />
                  Dashboard
                </Link>

                <Link
                  href="#"
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                >
                  <LineChart className="h-4 w-4" />
                  Usage
                </Link>
              </nav>              
            </div>            
          </div>
          <div className="mt-auto p-4">
                <Card x-chunk="dashboard-02-chunk-0">
                  <CardHeader className="p-2 pt-0 md:p-4">
                    <CardTitle>Upgrade to Pro</CardTitle>
                    <CardDescription>
                      Unlock all features and get unlimited access to our support
                      team.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-2 pt-0 md:p-4 md:pt-0">
                    <Button size="sm" className="w-full">
                      Upgrade
                    </Button>
                  </CardContent>
                </Card>
              </div>
        </div>
      </div>
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="shrink-0 md:hidden"
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="flex flex-col">
          <nav className="grid gap-2 text-lg font-medium">
            <Link
              href="#"
              className="flex items-center gap-2 text-lg font-semibold"
            >
              <Package2 className="h-6 w-6" />
              <span className="sr-only">Acme Inc</span>
            </Link>
            <Link
              href="#"
              className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground"
            >
              <Home className="h-5 w-5" />
              Dashboard
            </Link>
            
            <Link
              href="#"
              className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground"
            >
              <LineChart className="h-5 w-5" />
              Usage
            </Link>
          </nav>
          <div className="mt-auto">
            <Card>
              <CardHeader>
                <CardTitle>Upgrade to Pro</CardTitle>
                <CardDescription>
                  Unlock all features and get unlimited access to our
                  support team.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button size="sm" className="w-full">
                  Upgrade
                </Button>
              </CardContent>
            </Card>
          </div>
        </SheetContent>
      </Sheet>

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
