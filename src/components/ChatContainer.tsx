"use client";
import { useEffect, useRef, useState, useCallback } from 'react';
import { UserButton, useUser } from '@clerk/nextjs';
import ReactMarkdown from 'react-markdown';
import bot from '/public/assets/bot.svg';
import userImage from '/public/assets/user.svg';
import Image from 'next/image';
import { db, ref, set, query, orderByChild, limitToLast, get } from '../services/firebaseConfig';
import { FaCircleNotch } from "react-icons/fa";
import Link from "next/link";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Home, LineChart, Menu } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from '@/lib/utils';

const POLL_INTERVAL = 5000; // Poll every 5 seconds

const generateUniqueId = () => `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;

const ChatContainer: React.FC = () => {
  const { user, isLoaded, isSignedIn } = useUser();
  const [messages, setMessages] = useState<{ id: string; isAi: boolean; content: string }[]>([]);
  const [input, setInput] = useState('');
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const [shouldScroll, setShouldScroll] = useState(true);

  const endOfMessagesRef = useRef<HTMLDivElement>(null);
  const messagesRef = ref(db, 'messages');
  const containerRef = useRef<HTMLDivElement>(null);

  const fetchMessages = useCallback(async () => {
    const messagesQuery = query(messagesRef, orderByChild('id'), limitToLast(50));
    const snapshot = await get(messagesQuery);
    const messagesData: { [key: string]: { id: string; isAi: boolean; content: string } } = snapshot.val();
    const loadedMessages = Object.values(messagesData || {});
    setMessages(loadedMessages);
  }, [messagesRef]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newMessageId = generateUniqueId();
    const newMessage = { id: newMessageId, isAi: false, content: input };
    const userInput = input;
    setInput('');

    await set(ref(db, `messages/${newMessageId}`), newMessage);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: userInput }),
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
    fetchMessages();

    const intervalId = setInterval(fetchMessages, POLL_INTERVAL);
    return () => {
      clearInterval(intervalId);
    };
  }, [fetchMessages]);

  useEffect(() => {
    if (shouldScroll && !isUserScrolling) {
      endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [shouldScroll, isUserScrolling, messages]);

  useEffect(() => {
    const handleScroll = () => {
      const container = containerRef.current;
      if (!container) return;

      const isAtBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + 1;
      setIsUserScrolling(!isAtBottom);
      setShouldScroll(isAtBottom);
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
    }

    return () => {
      if (container) {
        container.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);

  useEffect(() => {
    // Determine if auto-scrolling should be enabled
    if (messages.length > 0) {
      setShouldScroll(true);
    }
  }, [messages]);

  if (!isLoaded) return (
    <div className="flex items-center justify-center h-screen w-screen">
      <FaCircleNotch className="animate-spin text-gray-600" size={50} />
    </div>
  );

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="hidden border-r bg-muted/40 md:block bg-teal-800">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link href="/">
              <Image
                src="/Chat4U.png"
                width={48}
                height={48}
                alt='logo'
                className="mr-2 rounded-full"
              />
            </Link>
            {isSignedIn ? (
              <div className={cn("flex w-full items-center justify-end space-x-2 mt-4")}>
                <div className="flex items-center gap-2 text-slate-200">
                  <UserButton />
                  <div className="text-slate-200">
                    <p className="text-sm font-medium hover:text-teal-300">
                      {user.fullName || 'User'}
                    </p>
                    <p className="text-xs text-slate-200">
                      {user.emailAddresses[0]?.emailAddress || 'No email'}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex justify-end w-full gap-2">
                <Link href="/sign-in">
                  <Button variant="secondary" className="text-sm text-teal-900 mt-4">
                    Sign-in
                  </Button>
                </Link>
                <Link href="/sign-up">
                  <Button variant="secondary" className="text-sm text-teal-900 mt-4">
                    Sign-up
                  </Button>
                </Link>
              </div>
            )}
          </div>

          <div>
            <div className="flex-1">
              <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
                <Link
                  href="/dashboard"
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-slate-100 transition-all hover:text-teal-200"
                >
                  <Home className="h-4 w-4" />
                  Dashboard
                </Link>
                <Link
                  href="#"
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-slate-100 transition-all hover:text-teal-200"
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
                  Unlock all features and get unlimited access to our support team.
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

      {/* Mobile Menu */}
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="shrink-0 md:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="flex flex-col">
          <nav className="grid gap-2 text-lg font-medium">
            <Link
              href="/"
              className="flex items-center gap-2 text-lg font-semibold"
            >
              <Image
                src="/Chat4U.png"
                width={68}
                height={68}
                alt='logo'
                className="mr-2 rounded-full"
              />
            </Link>
            <Link
              href="/dashboard"
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
            {isSignedIn ? (
              <div className={cn("flex w-full items-center justify-start space-x-2 mb-4")}>
                <div className="flex items-center gap-2 text-slate-500">
                  <UserButton />
                  <div className="text-slate-500">
                    <p className="text-sm font-medium hover:text-teal-300">
                      {user.fullName || 'User'}
                    </p>
                    <p className="text-xs text-slate-500">
                      {user.emailAddresses[0]?.emailAddress || 'No email'}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex justify-end w-full">
                <Link href="/sign-in">
                  <Button variant="secondary" className="text-sm text-gray-100 mt-4">
                    Sign-in
                  </Button>
                </Link>
              </div>
            )}
            <Card>
              <CardHeader>
                <CardTitle>Upgrade to Pro</CardTitle>
                <CardDescription>
                  Unlock all features and get unlimited access to our support team.
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

      {/* Chat Area */}
      <div className="flex-1 flex flex-col p-4 bg-gray-100">
        <div className="hidden md:block lg:block text-center p-2 mb-2 ring-1 rounded-md bg-gradient-to-r from-purple-500 to-red-400 font-mono">
          <p className="text-xl text-slate-100">AI Powered Chat for you, where you can experience the power of generative AI technology.<br />
            Ask anything and get answers to complex questions...!! Try Now...</p>
        </div>
        <div className="flex-1 flex flex-col overflow-hidden">
          <div ref={containerRef} className="flex-1 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-md p-4">
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
                  className={`p-3 rounded-lg max-w-auto ${msg.isAi ? 'bg-gray-200 text-gray-800' : 'bg-blue-500 text-white'
                    }`}
                >
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
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
