"use client";

import React, { useState, useEffect } from "react";
import { FaSearch, FaSpinner } from "react-icons/fa";
import rehypeFormat from "rehype-format";
import rehypeStringify from "rehype-stringify";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";
import { useUser } from "@clerk/nextjs";

interface BotResponse {
  bot: string;
}

const processor = unified()
  .use(remarkParse)
  .use(remarkRehype)
  .use(rehypeFormat)
  .use(rehypeStringify);

const GPT3Search: React.FC = () => {
  const { user, isLoaded } = useUser();
  const [input, setInput] = useState("");
  const [results, setResults] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const userId = user ? user.id : "anonymous";

  const MAX_ANONYMOUS_ATTEMPTS = 5;
  const MAX_LOGGED_IN_ATTEMPTS = 10;

  const [promptCount, setPromptCount] = useState(0);

  useEffect(() => {
    // Initialize user attempts on component mount
    const storedAttempts = localStorage.getItem(`attempts_${userId}`);
    if (storedAttempts) {
      setPromptCount(parseInt(storedAttempts, 10));
    } else {
      localStorage.setItem(`attempts_${userId}`, "0");
      setPromptCount(0);
    }
  }, [userId, isLoaded]);

  const hasCrossedLimit = () => {
    const maxAttempts = user ? MAX_LOGGED_IN_ATTEMPTS : MAX_ANONYMOUS_ATTEMPTS;
    return promptCount >= maxAttempts;
  };

  const incrementAttempts = () => {
    const newCount = promptCount + 1;
    setPromptCount(newCount);
    localStorage.setItem(`attempts_${userId}`, newCount.toString());
  };

  const resetAttempts = () => {
    setPromptCount(0);
    localStorage.setItem(`attempts_${userId}`, "0");
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check if the user has crossed the limit
    if (hasCrossedLimit()) {
      alert(
        "You have reached the limit of prompts. Please sign up or purchase a subscription."
      );
      return; // Prevent further execution if limit exceeded
    }

    setLoading(true);
    const userInput = input;
    setInput(""); // Clear input

    try {
      // Fetch response only if not exceeded the limit
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: userInput }),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data: BotResponse = await response.json();
      console.log("Response data:", data);

      if (data.bot) {
        const htmlContent = await processMarkdown(data.bot);
        setResults([htmlContent, ...results]);
        incrementAttempts(); // Increment attempts after a successful search
      } else {
        console.error("No bot response in data:", data);
      }
    } catch (error) {
      console.error("Error fetching data from API:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoaded && user) {
      resetAttempts(); // Reset attempts for authenticated users
    }
  }, [isLoaded, user]);

  const processMarkdown = async (markdownContent: string) => {
    const file = await processor.process(markdownContent);
    return String(file);
  };

  return (
    <div className="w-full h-screen relative mt-10">
     
      <div
        className="absolute inset-0 bg-cover bg-center rounded-2xl mx-h-[600px]"
        style={{ backgroundImage: "url(reshot-icon-namaste-FNKJ7G32XH.svg)" }}
      >
        <div className="absolute inset-0 bg-zinc-500 opacity-50 rounded-2xl"></div>
        <div className="relative z-10 h-full flex flex-col items-center justify-center p-4">
          <div className="text-center text-wrap p-4 md:p-6 mb-6 ring-1 rounded-lg bg-gradient-to-r from-lime-200 to-purple-200 font-mono shadow-lg animate-fade-in">
            <p className="text-2xl md:text-3xl text-slate-700 font-bold">
              AI Powered Chat
            </p>
            <p className="text-base md:text-xl text-slate-700 mt-2">
              Experience the power of generative AI technology.
              <br />
              Ask anything and get answers to complex questions...!! Try Now...
            </p>
          </div>

          <form
            onSubmit={handleSearch}
            className="w-full max-w-lg flex items-center space-x-2 mb-4"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your query..."
              className="flex-1 p-3 border border-gray-300 min-w-5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <button
              type="submit"
              className="bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 transition duration-200 flex items-center"
            >
              {loading ? <FaSpinner className="animate-spin" /> : <FaSearch />}
            </button>
          </form>

          <div className="w-full max-w-lg">
            {results.map((result, index) => (
              <div
                key={index}
                className="p-4 mb-2 border prose text-slate-500 border-gray-300 text-wrap text-justify overflow-hidden rounded-lg bg-white shadow-md"
              >
                <div dangerouslySetInnerHTML={{ __html: result }} />
              </div>
            ))}
          </div>

          {hasCrossedLimit() && (
            <div className="mt-4 text-center text-wrap">
              <div className="bg-gradient-to-r from-purple-500 to-lime-500 p-2 mb-2 rounded-lg">
                <p className="text-lime-100 font-bold mb-2">
                  You have reached the limit of prompts.
                </p>
              </div>
              <button
                className="bg-green-500 text-white p-2 mb-2 rounded-lg hover:bg-green-600 transition duration-200"
                onClick={() => (window.location.href = "/signup")}
              >
                Sign Up
              </button>
              <button
                className="bg-yellow-500 text-white p-2 rounded-lg hover:bg-yellow-600 transition duration-200 ml-2"
                onClick={() => (window.location.href = "/upgrade")}
              >
                Purchase Subscription
              </button>
            </div>
          )}
        </div>
      </div>
      </div>

  );
};

export default GPT3Search;
