'use client';

import React, { useState, useRef, useEffect } from 'react';
import { InteractiveRobotSpline } from '@/components/ui/interactive-3d-robot';
import { NoteEBadge } from '@/components/ui/note-e-badge';
import { Sparkles, Send } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
}

export function SmartAISection() {
  const ROBOT_SCENE_URL = "https://prod.spline.design/PyzDhpQ9E5f1E3MT/scene.splinecode";
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hey! I am Note E, your AI assistant. How can I help you today?",
      sender: 'ai'
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const prevMessageCountRef = useRef(messages.length);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    // Only scroll if a new message was added
    if (messages.length > prevMessageCountRef.current) {
      scrollToBottom();
      prevMessageCountRef.current = messages.length;
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user'
    };

    setMessages(prev => [...prev, userMessage]);
    const questionText = inputValue;
    setInputValue('');

    // Add a temporary "thinking" message
    const thinkingId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, {
      id: thinkingId,
      text: "Thinking...",
      sender: 'ai'
    }]);

    try {
      const response = await fetch('/api/chat/public', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: questionText })
      });

      if (!response.ok) throw new Error('Failed to get response');

      const data = await response.json();
      
      // Replace thinking message with actual response
      setMessages(prev => prev.map(msg => 
        msg.id === thinkingId 
          ? { ...msg, text: data.response || "I couldn't generate a response." }
          : msg
      ));
    } catch (error) {
      console.error('Chat error:', error);
      // Replace thinking message with error
      setMessages(prev => prev.map(msg => 
        msg.id === thinkingId 
          ? { ...msg, text: "Sorry, I'm having trouble connecting right now. Please try again!" }
          : msg
      ));
    }
  };

  const quickQuestions = [
    "What features do you offer?",
    "How much does it cost?",
    "How do I get started?"
  ];

  return (
    <section className="relative w-full h-screen overflow-hidden bg-gradient-to-b from-neutral-50 to-white dark:from-black dark:to-neutral-900">
      {/* 3D Robot Background */}
      <div className="absolute inset-0 z-0">
        <InteractiveRobotSpline
          scene={ROBOT_SCENE_URL}
          className="w-full h-full"
        />
      </div>

      {/* Content Overlay */}
      <div className="relative z-10 pt-12 md:pt-20 lg:pt-24 px-4 md:px-8 h-full">
        <div className="max-w-7xl mx-auto h-full flex flex-col">
          {/* Badge + Heading — center on mobile, shift right on desktop so robot stays visible */}
          <div className="flex flex-col items-center md:items-end text-center md:text-right mb-8 md:mb-12 md:mr-8 lg:mr-16">
            <NoteEBadge />

            {/* Heading and Description */}
            <div className="mt-6 max-w-2xl md:max-w-md bg-white/80 dark:bg-black/60 backdrop-blur-lg rounded-2xl px-6 py-4 shadow-2xl border border-white/40 dark:border-white/10">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-neutral-900 dark:text-white drop-shadow-2xl mb-3 leading-tight">
                Ask Note E Anything
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-neutral-700 dark:text-white/90 drop-shadow-lg">
                Your intelligent companion for all things SmartNote AI
              </p>
            </div>
          </div>

          {/* Chat Interface on the left side - hidden on mobile, visible on larger screens */}
          <div className="hidden lg:block absolute left-8 top-1/2 -translate-y-1/2 w-[450px]">
            <div className="bg-neutral-800/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-neutral-700 overflow-hidden">
              {/* Chat Header */}
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-4">
                <h3 className="text-xl font-bold text-white">Ask Note E</h3>
              </div>

              {/* Chat Messages */}
              <div className="h-[400px] overflow-y-auto p-6 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                        message.sender === 'user'
                          ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                          : 'bg-neutral-700/80 text-white'
                      }`}
                    >
                      {message.sender === 'ai' && (
                        <div className="flex items-center gap-2 mb-2">
                          <Sparkles className="h-4 w-4 text-purple-400" />
                          <span className="text-xs font-semibold text-purple-400">Note E</span>
                        </div>
                      )}
                      <p className="text-sm leading-relaxed">{message.text}</p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Questions */}
              <div className="px-6 pb-4 flex flex-wrap gap-2">
                {quickQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setInputValue(question);
                      handleSubmit(new Event('submit') as any);
                    }}
                    className="px-3 py-1.5 text-xs bg-neutral-700 hover:bg-neutral-600 text-white rounded-full transition-colors"
                  >
                    {question}
                  </button>
                ))}
              </div>

              {/* Input Area */}
              <form onSubmit={handleSubmit} className="p-4 border-t border-neutral-700">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Ask me about features, pricing, or..."
                    className="flex-1 bg-neutral-700/50 text-white placeholder-neutral-400 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <button
                    type="submit"
                    disabled={!inputValue.trim()}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg px-4 py-2 hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
