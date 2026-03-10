'use client';

import React, { useState } from 'react';
import ChatGPTInput from '@/components/ui/prompt-input-dynamic-grow';
import { Bot, Sparkles } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

export function AIChatSection() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hey! I am Note E, your AI assistant. How can I help you today?",
      sender: 'ai',
      timestamp: new Date()
    }
  ]);

  const handleSubmit = async (value: string) => {
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: value,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);

    // Simulate AI response (replace with actual AI API call)
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: getAIResponse(value),
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
    }, 1000);
  };

  // Simple response generator (replace with actual AI API)
  const getAIResponse = (question: string): string => {
    const lowerQuestion = question.toLowerCase();
    
    if (lowerQuestion.includes('feature') || lowerQuestion.includes('what can')) {
      return "smartDigitalNotes offers powerful features including AI-powered note-taking, smart search, auto-organization, notebook templates, and collaborative tools. You can create beautiful digital notebooks with the nostalgic feel of physical ones!";
    } else if (lowerQuestion.includes('price') || lowerQuestion.includes('cost')) {
      return "We offer a free tier to get started! Premium plans start at $9.99/month with advanced AI features, unlimited notebooks, and priority support.";
    } else if (lowerQuestion.includes('how') || lowerQuestion.includes('use')) {
      return "Getting started is easy! Sign up for a free account, create your first notebook from our templates, and start taking notes. Our AI assistant will help you organize and enhance your content automatically.";
    } else if (lowerQuestion.includes('ai') || lowerQuestion.includes('assistant')) {
      return "I'm Note E, your AI-powered assistant! I can help you with smart search, auto-categorization, content summaries, and answering questions about smartDigitalNotes features.";
    } else {
      return "That's a great question! smartDigitalNotes is designed to revolutionize your note-taking experience with AI-powered features. Would you like to know more about our features, pricing, or how to get started?";
    }
  };

  return (
    <section className="relative w-full py-16 md:py-24 bg-gradient-to-b from-white to-neutral-50 dark:from-neutral-900 dark:to-black">
      <div className="max-w-4xl mx-auto px-4 md:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 border rounded-full px-4 py-2 mb-4 bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800">
            <Bot className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            <span className="text-sm font-medium text-purple-600 dark:text-purple-400">AI Assistant</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 mb-4">
            Ask Note E Anything
          </h2>
          <p className="text-neutral-600 dark:text-neutral-400 text-lg">
            Your intelligent companion for all things smartDigitalNotes
          </p>
        </div>

        {/* Chat Messages */}
        <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-xl p-6 mb-8 max-h-96 overflow-y-auto">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    message.sender === 'user'
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                      : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-900 dark:text-white'
                  }`}
                >
                  {message.sender === 'ai' && (
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                      <span className="text-xs font-semibold text-purple-600 dark:text-purple-400">Note E</span>
                    </div>
                  )}
                  <p className="text-sm leading-relaxed">{message.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Input */}
        <div className="relative">
          <ChatGPTInput
            placeholder="Ask me about features, pricing, or how to get started..."
            onSubmit={handleSubmit}
            glowIntensity={0.6}
            expandOnFocus={true}
            showEffects={true}
            textColor="#0A1217"
            backgroundOpacity={0.95}
            menuOptions={[]}
          />
        </div>

        {/* Quick Questions */}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button
            onClick={() => handleSubmit("What features do you offer?")}
            className="px-4 py-2 text-sm bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-full hover:border-purple-400 dark:hover:border-purple-600 transition-colors text-neutral-700 dark:text-neutral-300"
          >
            What features do you offer?
          </button>
          <button
            onClick={() => handleSubmit("How much does it cost?")}
            className="px-4 py-2 text-sm bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-full hover:border-purple-400 dark:hover:border-purple-600 transition-colors text-neutral-700 dark:text-neutral-300"
          >
            How much does it cost?
          </button>
          <button
            onClick={() => handleSubmit("How do I get started?")}
            className="px-4 py-2 text-sm bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-full hover:border-purple-400 dark:hover:border-purple-600 transition-colors text-neutral-700 dark:text-neutral-300"
          >
            How do I get started?
          </button>
        </div>
      </div>
    </section>
  );
}
