"use client";

import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import React, { useState, useEffect } from 'react';
import { FaSearch, FaSpinner } from 'react-icons/fa';

interface BotResponse {
  bot: string;
}

const GPT3Search: React.FC = () => {
  const [input, setInput] = useState('');
  const [results, setResults] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [promptCount, setPromptCount] = useState(0);
  const [isSubscribed, setIsSubscribed] = useState(false); // Replace with actual subscription check
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Default to not authenticated
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

    if (promptCount >= 5 && hasCrossedLimit() && !isSubscribed) {
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
        setResults([...results, data.bot]);
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
    setIsAuthenticated(authenticated);
  
    if (authenticated) {
      resetAttempts();
    } else {
      alert('Authentication failed. Please try again.');
    }
  };

  useEffect(() => {
    handleAuthentication();
    setIsAuthenticated(false);
  }, []);

  return (
    <div className="w-full h-full  relative mb-24">   
      <div className="absolute inset-0 bg-cover bg-center rounded-2xl mx-h-[400px]" style={{ backgroundImage: 'url(/Chat4U.png)' }}>
        
      </div>
      <div className="absolute inset-0 bg-zinc-500 opacity-20 rounded-2xl"></div>
      <div className="relative z-10 h-full flex flex-col items-center justify-center p-4">
        <div className="text-center p-6 mb-6 ring-1 rounded-lg bg-gradient-to-r from-lime-200 to-purple-200 font-mono shadow-lg animate-fade-in">
          <p className="text-3xl text-slate-700 font-bold">AI Powered Chat</p>
          <p className="text-xl text-slate-700 mt-2">Experience the power of generative AI technology.<br />
            Ask anything and get answers to complex questions...!! Try Now...</p>
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
            <div key={index} className="p-4 mb-2 border text-slate-500 border-gray-300 rounded-lg bg-white shadow-md">
              {result}
            </div>
          ))}
        </div>

        {promptCount >= 5 && !isSubscribed && (
          <div className="mt-4 text-center">
            <p className="text-red-500 mb-2">You have reached the limit of 5 prompts.</p>
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
