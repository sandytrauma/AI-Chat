"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { UserButton, useUser } from "@clerk/nextjs";
import userImage from "/public/assets/user.svg";
import Image from "next/image";
import {
  db,
  ref,
  set,
  query,
  orderByChild,
  limitToLast,
  get,
  update,
} from "../services/firebaseConfig";
import { FaCircleNotch } from "react-icons/fa";
import Link from "next/link";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Home, LineChart, Menu } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import rehypeFormat from "rehype-format";
import rehypeStringify from "rehype-stringify";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";
import ChatInput from "./ChatInput"; // Import ChatInput component

const POLL_INTERVAL = 5000; // Poll every 5 seconds
const PROMPT_LIMIT = 10; // Limit to 10 prompts

const processor = unified()
  .use(remarkParse)
  .use(remarkRehype)
  .use(rehypeFormat)
  .use(rehypeStringify);

const generateUniqueId = () =>
  `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;

const ChatContainer: React.FC = () => {
  const { user, isLoaded, isSignedIn } = useUser();
  const [messages, setMessages] = useState<
    { id: string; isAi: boolean; content: string; htmlContent?: string }[]
  >([]);
  const [promptCount, setPromptCount] = useState(0);
  const endOfMessagesRef = useRef<HTMLDivElement>(null);
  const messagesRef = ref(db, "messages");
  const userRef = ref(db, `users/${user?.id || "anonymous"}`);
  const containerRef = useRef<HTMLDivElement>(null);

  const fetchMessages = useCallback(async () => {
    const messagesQuery = query(
      messagesRef,
      orderByChild("id"),
      limitToLast(50)
    );
    const snapshot = await get(messagesQuery);
    const messagesData: {
      [key: string]: { id: string; isAi: boolean; content: string };
    } = snapshot.val();
    const loadedMessages = Object.values(messagesData || {});
    const messagesWithHtml = await Promise.all(
      loadedMessages.map(async (msg) => {
        const htmlContent = await processMarkdown(msg.content);
        return { ...msg, htmlContent };
      })
    );
    setMessages(messagesWithHtml);
  }, [messagesRef]);

  const fetchPromptCount = useCallback(async () => {
    const snapshot = await get(userRef);
    const userData = snapshot.val();
    setPromptCount(userData?.promptCount || 0);
  }, [userRef]);

  const handleUserSubmit = async (userInput: string) => {
    if (promptCount >= PROMPT_LIMIT) {
      alert("You have reached the limit of 10 prompts. Please upgrade to Pro.");
      window.location.href = "/upgrade";
      return;
    }

    const newMessageId = generateUniqueId();
    const newMessage = { id: newMessageId, isAi: false, content: userInput };
    
    await set(ref(db, `messages/${newMessageId}`), newMessage);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: userInput }),
      });
      const data = await response.json();

      const aiMessage = {
        id: generateUniqueId(),
        isAi: true,
        content: data.bot,
      };
      await set(ref(db, `messages/${aiMessage.id}`), aiMessage);

      // Update prompt count
      const newPromptCount = promptCount + 1;
      setPromptCount(newPromptCount);
      await update(userRef, { promptCount: newPromptCount });
    } catch (error) {
      console.error("Error:", error);
      const errorMessage = {
        id: generateUniqueId(),
        isAi: true,
        content: "Something went wrong. Please try again.",
      };
      await set(ref(db, `messages/${errorMessage.id}`), errorMessage);
    }
  };

  useEffect(() => {
    fetchMessages();
    fetchPromptCount();
    const intervalId = setInterval(fetchMessages, POLL_INTERVAL);
    return () => {
      clearInterval(intervalId);
    };
  }, [fetchMessages, fetchPromptCount]);

  const processMarkdown = async (markdownContent: string) => {
    const file = await processor.process(markdownContent);
    return String(file);
  };

  if (!isLoaded)
    return (
      <div className="flex items-center justify-center h-screen w-screen">
        <FaCircleNotch className="animate-spin text-gray-600" size={50} />
      </div>
    );

  return (
    <div className="flex flex-col lg:flex-row h-screen overflow-hidden m-5">
      {/* Sidebar */}
      <div className="hidden lg:flex lg:w-64 flex-col bg-gradient-to-b from-slate-700 to-slate-400 shadow-lg md:rounded-l-md">
        <div className="flex flex-col gap-4 p-4">
          <div className="flex h-14 items-center border-b border-teal-400 px-4 lg:h-[60px] lg:px-6">
            {isSignedIn ? (
              <div className="flex w-full items-center space-x-2 mt-4 text-white">
                <UserButton />
                <div>
                  <p className="text-sm font-medium hover:text-purple-300">
                    {user.fullName || "User"}
                  </p>
                  <p className="text-xs">
                    {user.emailAddresses[0]?.emailAddress || "No email"}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex justify-end w-full gap-2">
                <Link href="/sign-in">
                  <Button
                    variant="secondary"
                    className="text-sm text-purple-900 mt-4"
                  >
                    Sign-in
                  </Button>
                </Link>
                <Link href="/sign-up">
                  <Button
                    variant="secondary"
                    className="text-sm text-purple-900 mt-4"
                  >
                    Sign-up
                  </Button>
                </Link>
              </div>
            )}
          </div>

          <nav className="flex-1 grid items-start px-2 text-sm font-medium lg:px-4">
            <Link
              href="/dashboard"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-white transition-all hover:text-purple-200"
            >
              <Home className="h-4 w-4" />
              Dashboard
            </Link>
            <Link
              href="#"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-white transition-all hover:text-purple-200"
            >
              <LineChart className="h-4 w-4" />
              Usage
            </Link>
          </nav>
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
                      {user.fullName || "User"}
                    </p>
                    <p className="text-xs text-slate-500">
                      {user.emailAddresses[0]?.emailAddress || "No email"}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex justify-end w-full">
                <Link href="/sign-in">
                  <Button
                    variant="secondary"
                    className="text-sm text-gray-100 mt-4"
                  >
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
      <div className="flex-1 flex flex-col h-screen">
        <div className="text-center p-4 ring-1 rounded-t-md md:rounded-tr-md bg-gradient-to-r from-emerald-400 to-amber-400 font-mono">
          <p className="text-sm prose md:text-xl text-white">
            AI Powered Chat for you, where you can experience the power of
            generative AI technology.
            <br />
            Ask anything and get answers to complex questions...!! Try Now...
          </p>
        </div>
        <div className="flex-1 flex flex-col bg-muted overflow-y-scroll" ref={containerRef}>
          <div className="flex-1 p-4">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.isAi ? "justify-start" : "justify-end"} space-x-2 mb-2`}>
                <Image
                  height={32}
                  width={32}
                  priority
                  src={msg.isAi ? "/assets/bot.svg" : userImage}
                  alt={msg.isAi ? "Bot" : "User"}
                  className="rounded-full top-0"
                />
                <div
                  className={`relative p-2 rounded-lg max-w-lg overflow-y-scroll whitespace-no-wrap ${
                    msg.isAi ? "bg-gray-200 text-md text-wrap text-justify prose text-gray-800" : "bg-blue-500 text-white"
                  }`}
                >
                  <div dangerouslySetInnerHTML={{ __html: msg.htmlContent || "" }} />
                </div>
              </div>
            ))}
            <div ref={endOfMessagesRef} />
          </div>

          {/* Use ChatInput component */}
          <ChatInput onSubmit={handleUserSubmit} />
        </div>
      </div>
    </div>
  );
};

export default ChatContainer;
  