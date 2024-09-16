"use client";
import { useEffect, useRef, useState, useCallback } from 'react';
import { UserButton, useUser } from '@clerk/nextjs';

import userImage from '/public/assets/user.svg';
import Image from 'next/image';
import { db, ref, set, query, orderByChild, limitToLast, get, update } from '../services/firebaseConfig';
import { FaCircleNotch } from "react-icons/fa";
import Link from "next/link";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Home, LineChart, Menu } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from '@/lib/utils';
import rehypeFormat from 'rehype-format';
import rehypeStringify from 'rehype-stringify';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import { unified } from 'unified';


const POLL_INTERVAL = 5000; // Poll every 5 seconds
const PROMPT_LIMIT = 10; // Limit to 10 prompts

const processor = unified()
  .use(remarkParse)          // Parse Markdown into an abstract syntax tree (AST)
  .use(remarkRehype)         // Transform Markdown AST to HTML AST
  .use(rehypeFormat)         // Format HTML for better readability
  .use(rehypeStringify);     // Convert HTML AST to HTML string

const generateUniqueId = () => `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;

const ChatContainer: React.FC = () => {
  const { user, isLoaded, isSignedIn } = useUser();
  const [messages, setMessages] = useState<{ id: string; isAi: boolean; content: string; htmlContent?: string }[]>([]);
  const [input, setInput] = useState('');
  const [shouldScroll, setShouldScroll] = useState(true);
  const [promptCount, setPromptCount] = useState(0);

  const endOfMessagesRef = useRef<HTMLDivElement>(null);
  const messagesRef = ref(db, 'messages');
  const userRef = ref(db, `users/${user?.id}`);
  const containerRef = useRef<HTMLDivElement>(null);

  const fetchMessages = useCallback(async () => {
    const messagesQuery = query(messagesRef, orderByChild('id'), limitToLast(50));
    const snapshot = await get(messagesQuery);
    const messagesData: { [key: string]: { id: string; isAi: boolean; content: string } } = snapshot.val();
    const loadedMessages = Object.values(messagesData || {});
    const messagesWithHtml = await Promise.all(loadedMessages.map(async (msg) => {
      const htmlContent = await processMarkdown(msg.content);
      return { ...msg, htmlContent };
    }));
    setMessages(messagesWithHtml);
  }, [messagesRef]);

  const fetchPromptCount = useCallback(async () => {
    if (user) {
      const snapshot = await get(userRef);
      const userData = snapshot.val();
      setPromptCount(userData?.promptCount || 0);
    }
  }, [user, userRef]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (promptCount >= PROMPT_LIMIT) {
      alert('You have reached the limit of 10 prompts. Please upgrade to Pro.');
      window.location.href = '/upgrade'; // Redirect to upgrade page
      return;
    }

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

      // Update prompt count
      const newPromptCount = promptCount + 1;
      setPromptCount(newPromptCount);
      await update(userRef, { promptCount: newPromptCount });
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = { id: generateUniqueId(), isAi: true, content: 'Something went wrong. Please try again.' };
      await set(ref(db, `messages/${errorMessage.id}`), errorMessage);
    }
  };

  useEffect(() => {
    fetchMessages();
    fetchPromptCount();
    setPromptCount(0);

    const intervalId = setInterval(fetchMessages, POLL_INTERVAL);
    return () => {
      clearInterval(intervalId);
    };
  }, [fetchMessages, fetchPromptCount]);

  useEffect(() => {
    if (shouldScroll) {
      endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [shouldScroll, messages]);

  useEffect(() => {
    // Determine if auto-scrolling should be enabled
    if (messages.length > 0) {
      setShouldScroll(false);
    }
  }, [messages]);

  const processMarkdown = async (markdownContent: string) => {
    const file = await processor.process(markdownContent);
    return String(file);
  };

  if (!isLoaded) return (
    <div className="flex items-center justify-center h-screen w-screen">
      <FaCircleNotch className="animate-spin text-gray-600" size={50} />
    </div>
  );

  return (
    <div className="flex flex-col lg:flex-row lg:divide-x h-screen overflow-y-scroll mb-24 m-5">
      {/* Sidebar */}
      <div className="hidden lg:block lg:w-64 md:w-64 lg:rounded-l-md bg-teal-950">
        <div className="flex h-full flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            {isSignedIn ? (
              <div className={cn("flex w-full items-center space-x-2 mt-4")}>
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
            className="shrink-0 fixed lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="flex flex-col w-64">
          <nav className="grid gap-2 text-lg font-medium">
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
                <Link href="/upgrade">
                  <Button size="sm" className="w-full">
                    Upgrade
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </SheetContent>
      </Sheet>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col mt-4 rounded-md lg:flex-1 lg:pl-4 lg:pr-4 lg:overflow-hidden lg:rounded-r-md bg-teal-950 lg:p-2">
        <div className="hidden lg:block text-center p-2 mb-2 ring-1 rounded-md bg-gradient-to-r from-purple-500 to-red-400 font-mono">
          <p className="text-xl text-slate-100">AI Powered Chat for you, where you can experience the power of generative AI technology.<br />
            Ask anything and get answers to complex questions...!! Try Now...</p>
        </div>
        <div className="flex-1 flex flex-col bg-zinc-900 bg-muted md:rounded-md overflow-hidden">
          <div ref={containerRef} className="flex-1 overflow-x-scroll border border-gray-200 rounded-lg shadow-md p-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.isAi ? 'justify-start' : 'justify-end'} space-x-2 mb-2`}
              >
                <Image
                  height={32}
                  width={32}                  
                  src={msg.isAi ? "/assets/bot.svg": userImage || "/assets/user.svg" }
                  alt={msg.isAi ? 'Bot' : 'User'}
                  className="rounded-full top-0"
                />
                <div
                  className={`p-3 rounded-lg max-w-xl overflow-y-scroll whitespace-pre-wrap ${msg.isAi ? 'bg-gray-200 text-lg prose text-gray-800 hover:bg-teal-300 hover:text-zinc-700 cursor-pointer'  : 'bg-blue-500 text-white'
                    }`}
                  dangerouslySetInnerHTML={{ __html: msg.htmlContent || '' }}
                />
              </div>
            ))}
            <div ref={endOfMessagesRef} />
          </div>

          <form onSubmit={handleSubmit} className="flex items-center space-x-2 mt-4 p-4 bg-white border-t border-gray-200">
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
