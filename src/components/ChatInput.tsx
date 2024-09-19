"use client";

import { useState } from "react";
import { Button } from "./ui/button";

interface ChatInputProps {
  onSubmit: (input: string) => void;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSubmit }) => {
  const [input, setInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onSubmit(input);
      setInput("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center p-4 bg-white border-t border-gray-200 sticky bottom-0">
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type your message..."
        className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        required
      />
      <Button
        type="submit"
        className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 transition duration-200"
      >
        Send
      </Button>
    </form>
  );
};

export default ChatInput;
