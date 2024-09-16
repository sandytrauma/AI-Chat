"use client";

import React, { useState, useEffect } from 'react';
import { FaSearch, FaSpinner } from 'react-icons/fa';
import rehypeFormat from 'rehype-format';
import rehypeStringify from 'rehype-stringify';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import { unified } from 'unified';

interface BotResponse {
  bot: string;
}

const processor = unified()
  .use(remarkParse)          // Parse Markdown into an abstract syntax tree (AST)
  .use(remarkRehype)         // Transform Markdown AST to HTML AST
  .use(rehypeFormat)         // Format HTML for better readability
  .use(rehypeStringify);     // Convert HTML AST to HTML string

const GPT3Search: React.FC = () => {
  const [input, setInput] = useState('');
  const [results, setResults] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [promptCount, setPromptCount] = useState(0);

  const MAX_ATTEMPTS = 5;

  const getAttempts = () => {
    const attempts = localStorage.getItem('attempts');
    return attempts ? parseInt(attempts, 10) : 0;
  };

  const setAttempts = (attempts: number) => {
    localStorage.setItem('attempts', attempts.toString());
  };

  const hasCrossedLimit = () => {
    return getAttempts() >= MAX_ATTEMPTS;
  };

  const incrementAttempts = () => {
    const attempts = getAttempts();
    setAttempts(attempts + 1);
  };

  const resetAttempts = () => {
    setAttempts(0);
  };

  const authenticateUser = async () => {
    // Replace with actual authentication logic
    return true;
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (promptCount >= 5 && hasCrossedLimit()) {
      alert('You have reached the limit of 5 prompts. Please sign up or purchase a subscription.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: input }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data: BotResponse = await response.json();
      console.log('Response data:', data);

      if (data.bot) {
        // Convert the response from markdown to HTML
        const htmlContent = await processMarkdown(data.bot);
        // Add new result to the beginning of the results array
        setResults([htmlContent, ...results]);
        setPromptCount(promptCount + 1);
      } else {
        console.error('No bot response in data:', data);
      }
    } catch (error) {
      console.error('Error fetching data from API:', error);
    } finally {
      setLoading(false);
      incrementAttempts(); // Update attempts if the user returns without purchasing
    }
  };

  const handleAuthentication = async () => {
    const authenticated = await authenticateUser();

    if (authenticated) {
      resetAttempts();
    } else {
      alert('Authentication failed. Please try again.');
    }
  };

  useEffect(() => {
    handleAuthentication();
  }, []);

  const processMarkdown = async (markdownContent: string) => {
    const file = await processor.process(markdownContent);
    return String(file);
  };

  return (
    <div className="w-full h-full relative mb-24">
      <div className="absolute inset-0 bg-cover bg-center rounded-2xl mx-h-[400px]" style={{ backgroundImage: 'url(reshot-icon-namaste-FNKJ7G32XH.svg)' }}>
      </div>
      <div className="absolute inset-0 bg-zinc-500 opacity-50 rounded-2xl"></div>
      <div className="relative z-10 h-full flex flex-col items-center justify-center p-4">
        <div className="text-center p-6 mb-6 ring-1 rounded-lg bg-gradient-to-r from-lime-200 to-purple-200 font-mono shadow-lg animate-fade-in">
          <p className="text-3xl text-slate-700 font-bold">AI Powered Chat</p>
          <p className="text-xl text-slate-700 mt-2">
            Experience the power of generative AI technology.<br />
            Ask anything and get answers to complex questions...!! Try Now...
          </p>
        </div>

        <form onSubmit={handleSearch} className="w-full max-w-lg flex items-center space-x-2 mb-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your query..."
            className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            <div key={index} className="p-4 mb-2 border prose text-slate-500 border-gray-300 rounded-lg bg-white shadow-md">
              <div dangerouslySetInnerHTML={{ __html: result }} />
            </div>
          ))}
        </div>

        {promptCount >= 5 && (
          <div className="mt-4 text-center">
            <div className="bg-gradient-to-r from-purple-500 to-lime-500 p-2 mb-2 rounded-lg">
            <p className="text-lime-100 font-bold mb-2">You have reached the limit of 5 prompts.</p>
            </div>
            <button
              className="bg-green-500 text-white p-2 rounded-lg hover:bg-green-600 transition duration-200"
              onClick={() => window.location.href = '/signup'}
            >
              Sign Up
            </button>
            <button
              className="bg-yellow-500 text-white p-2 rounded-lg hover:bg-yellow-600 transition duration-200 ml-2"
              onClick={() => window.location.href = '/upgrade'}
            >
              Purchase Subscription
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default GPT3Search;
