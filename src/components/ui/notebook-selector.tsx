'use client'

import React, { useState, useEffect } from 'react';
import { BookOpen, Brain, Briefcase, Lightbulb, GraduationCap } from 'lucide-react';

interface NotebookOption {
  title: string;
  description: string;
  image: string;
  icon: React.ReactNode;
  color: string;
  pages: number;
}

interface NotebookSelectorProps {
  options?: NotebookOption[];
}

const defaultOptions: NotebookOption[] = [
  {
    title: "Personal Notes",
    description: "Daily thoughts & reflections",
    image: "https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=800&q=80",
    icon: <BookOpen size={24} className="text-white" />,
    color: "#8B4513",
    pages: 24
  },
  {
    title: "Work Projects",
    description: "Tasks, meetings & deadlines",
    image: "https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?auto=format&fit=crop&w=800&q=80",
    icon: <Briefcase size={24} className="text-white" />,
    color: "#2563eb",
    pages: 18
  },
  {
    title: "Research",
    description: "AI-powered knowledge base",
    image: "https://images.unsplash.com/photo-1456324504439-367cee3b3c32?auto=format&fit=crop&w=800&q=80",
    icon: <Brain size={24} className="text-white" />,
    color: "#059669",
    pages: 32
  },
  {
    title: "Ideas",
    description: "Creative sparks & inspiration",
    image: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=800&q=80",
    icon: <Lightbulb size={24} className="text-white" />,
    color: "#7c3aed",
    pages: 15
  },
  {
    title: "Study Notes",
    description: "Learning & course materials",
    image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=800&q=80",
    icon: <GraduationCap size={24} className="text-white" />,
    color: "#dc2626",
    pages: 42
  }
];

export function NotebookSelector({ options = defaultOptions }: NotebookSelectorProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [animatedOptions, setAnimatedOptions] = useState<number[]>([]);

  const handleOptionClick = (index: number) => {
    if (index !== activeIndex) {
      setActiveIndex(index);
    }
  };

  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];
    
    options.forEach((_, i) => {
      const timer = setTimeout(() => {
        setAnimatedOptions(prev => [...prev, i]);
      }, 180 * i);
      timers.push(timer);
    });
    
    return () => {
      timers.forEach(timer => clearTimeout(timer));
    };
  }, [options]);

  return (
    <div className="w-full max-w-[900px] mx-auto">
      {/* Options Container */}
      <div className="flex w-full h-[350px] md:h-[400px] items-stretch overflow-hidden rounded-2xl">
        {options.map((option, index) => (
          <div
            key={index}
            className="relative flex flex-col justify-end overflow-hidden transition-all duration-700 ease-in-out cursor-pointer"
            style={{
              backgroundImage: `url('${option.image}')`,
              backgroundSize: activeIndex === index ? 'auto 100%' : 'auto 120%',
              backgroundPosition: 'center',
              backfaceVisibility: 'hidden',
              opacity: animatedOptions.includes(index) ? 1 : 0,
              transform: animatedOptions.includes(index) ? 'translateX(0)' : 'translateX(-60px)',
              minWidth: '60px',
              minHeight: '100px',
              borderWidth: '2px',
              borderStyle: 'solid',
              borderColor: activeIndex === index ? option.color : '#292929',
              backgroundColor: '#18181b',
              boxShadow: activeIndex === index 
                ? `0 20px 60px ${option.color}40` 
                : '0 10px 30px rgba(0,0,0,0.30)',
              flex: activeIndex === index ? '7 1 0%' : '1 1 0%',
              zIndex: activeIndex === index ? 10 : 1,
            }}
            onClick={() => handleOptionClick(index)}
          >
            {/* Gradient overlay */}
            <div 
              className="absolute inset-0 transition-all duration-700 ease-in-out pointer-events-none"
              style={{
                background: activeIndex === index 
                  ? `linear-gradient(to top, ${option.color}ee 0%, ${option.color}80 30%, transparent 70%)`
                  : 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 50%)'
              }}
            />
            
            {/* Shadow effect */}
            <div 
              className="absolute left-0 right-0 pointer-events-none transition-all duration-700 ease-in-out"
              style={{
                bottom: activeIndex === index ? '0' : '-40px',
                height: '120px',
                boxShadow: activeIndex === index 
                  ? 'inset 0 -120px 120px -120px #000, inset 0 -120px 120px -80px #000' 
                  : 'inset 0 -120px 0px -120px #000, inset 0 -120px 0px -80px #000'
              }}
            />
            
            {/* Label with icon and info */}
            <div className="absolute left-0 right-0 bottom-5 flex items-center justify-start h-12 z-10 pointer-events-none px-4 gap-3 w-full">
              <div 
                className="min-w-[44px] max-w-[44px] h-[44px] flex items-center justify-center rounded-full backdrop-blur-[10px] shadow-[0_1px_4px_rgba(0,0,0,0.18)] border-2 flex-shrink-0 transition-all duration-200"
                style={{
                  backgroundColor: `${option.color}dd`,
                  borderColor: activeIndex === index ? '#fff' : option.color
                }}
              >
                {option.icon}
              </div>
              <div className="text-white whitespace-pre relative overflow-hidden">
                <div 
                  className="font-bold text-lg transition-all duration-700 ease-in-out"
                  style={{
                    opacity: activeIndex === index ? 1 : 0,
                    transform: activeIndex === index ? 'translateX(0)' : 'translateX(25px)'
                  }}
                >
                  {option.title}
                </div>
                <div 
                  className="text-sm text-white/80 transition-all duration-700 ease-in-out"
                  style={{
                    opacity: activeIndex === index ? 1 : 0,
                    transform: activeIndex === index ? 'translateX(0)' : 'translateX(25px)'
                  }}
                >
                  {option.description}
                </div>
                <div 
                  className="text-xs text-white/60 mt-1 transition-all duration-700 ease-in-out"
                  style={{
                    opacity: activeIndex === index ? 1 : 0,
                    transform: activeIndex === index ? 'translateX(0)' : 'translateX(25px)',
                    transitionDelay: '100ms'
                  }}
                >
                  {option.pages} pages
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
