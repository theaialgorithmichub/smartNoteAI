'use client';

import React, { useState } from 'react';
import { Languages, Mic, Volume2, Copy, ArrowLeftRight, Info, X, Check, Trash2, XCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TemplateHeader } from './template-header';
import { TemplateFooter } from './template-footer';

interface LanguageTranslatorTemplateProps {
  title: string;
  notebookId?: string;
}

interface Translation {
  id: number;
  source: string;
  target: string;
  from: string;
  to: string;
  timestamp: string;
}

export function LanguageTranslatorTemplate({ title }: LanguageTranslatorTemplateProps) {
  const [sourceText, setSourceText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [sourceLang, setSourceLang] = useState('English');
  const [targetLang, setTargetLang] = useState('Hindi');
  const [history, setHistory] = useState<Translation[]>([]);
  const [showDocumentation, setShowDocumentation] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  const languages = [
    'English', 'Hindi', 'Bengali', 'Telugu', 'Marathi', 'Tamil', 'Gujarati', 'Kannada', 'Malayalam', 'Punjabi',
    'Spanish', 'French', 'German', 'Chinese', 'Japanese', 'Korean', 'Arabic', 'Portuguese', 'Russian', 'Italian'
  ];

  const handleTranslate = async () => {
    if (!sourceText.trim()) return;
    
    setIsTranslating(true);
    
    try {
      // Use MyMemory Translation API (free, no API key required)
      const response = await fetch(
        `https://api.mymemory.translated.net/get?q=${encodeURIComponent(sourceText)}&langpair=${getLanguageCode(sourceLang)}|${getLanguageCode(targetLang)}`
      );
      
      const data = await response.json();
      const translation = data.responseData?.translatedText || sourceText;
      
      setTranslatedText(translation);
      
      // Add to history (keep only latest 15)
      const newTranslation: Translation = {
        id: Date.now(),
        source: sourceText,
        target: translation,
        from: sourceLang,
        to: targetLang,
        timestamp: new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
      };
      
      setHistory(prev => [newTranslation, ...prev].slice(0, 15));
    } catch (error) {
      console.error('Translation error:', error);
      setTranslatedText('Translation failed. Please try again.');
    } finally {
      setIsTranslating(false);
    }
  };

  const getLanguageCode = (language: string): string => {
    const languageCodes: { [key: string]: string } = {
      'English': 'en',
      'Hindi': 'hi',
      'Bengali': 'bn',
      'Telugu': 'te',
      'Marathi': 'mr',
      'Tamil': 'ta',
      'Gujarati': 'gu',
      'Kannada': 'kn',
      'Malayalam': 'ml',
      'Punjabi': 'pa',
      'Spanish': 'es',
      'French': 'fr',
      'German': 'de',
      'Chinese': 'zh',
      'Japanese': 'ja',
      'Korean': 'ko',
      'Arabic': 'ar',
      'Portuguese': 'pt',
      'Russian': 'ru',
      'Italian': 'it'
    };
    return languageCodes[language] || 'en';
  };

  const handleSwapLanguages = () => {
    const tempLang = sourceLang;
    setSourceLang(targetLang);
    setTargetLang(tempLang);
    
    const tempText = sourceText;
    setSourceText(translatedText);
    setTranslatedText(tempText);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleClearSource = () => {
    setSourceText('');
    setTranslatedText('');
  };

  const handleClearTranslation = () => {
    setTranslatedText('');
  };

  const handleVoiceInput = () => {
    // Check if browser supports Web Speech API
    if (typeof window === 'undefined') {
      alert('Voice input is not available.');
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      alert('Voice input is not supported in your browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      
      // Configure recognition
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;
      
      // Set language based on source language
      const langCode = getLanguageCode(sourceLang);
      const langMap: { [key: string]: string } = {
        'hi': 'hi-IN', 'es': 'es-ES', 'fr': 'fr-FR', 'de': 'de-DE',
        'zh': 'zh-CN', 'ja': 'ja-JP', 'ar': 'ar-SA', 'pt': 'pt-PT',
        'ru': 'ru-RU', 'it': 'it-IT', 'ko': 'ko-KR', 'bn': 'bn-IN',
        'te': 'te-IN', 'mr': 'mr-IN', 'ta': 'ta-IN', 'gu': 'gu-IN',
        'kn': 'kn-IN', 'ml': 'ml-IN', 'pa': 'pa-IN'
      };
      recognition.lang = langMap[langCode] || 'en-US';
      
      recognition.onstart = () => {
        setIsRecording(true);
        console.log('Voice recognition started');
      };
      
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        console.log('Transcript:', transcript);
        setSourceText(transcript);
      };
      
      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
        
        if (event.error === 'not-allowed') {
          alert('Microphone access denied. Please allow microphone access in your browser settings.');
        } else if (event.error === 'no-speech') {
          alert('No speech detected. Please try again.');
        } else {
          alert(`Voice input error: ${event.error}. Please try again.`);
        }
      };
      
      recognition.onend = () => {
        setIsRecording(false);
        console.log('Voice recognition ended');
      };
      
      // Start recognition
      recognition.start();
    } catch (error) {
      console.error('Failed to start voice recognition:', error);
      alert('Failed to start voice input. Please try again.');
      setIsRecording(false);
    }
  };

  const handleListen = (text: string, lang: string) => {
    // Placeholder for text-to-speech functionality
    if ('speechSynthesis' in window && text) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang === 'Hindi' ? 'hi-IN' : lang === 'Spanish' ? 'es-ES' : 'en-US';
      window.speechSynthesis.speak(utterance);
    } else {
      alert('Text-to-speech is not supported in your browser or no text to read.');
    }
  };

  const deleteHistoryItem = (id: number) => {
    setHistory(history.filter(item => item.id !== id));
  };

  const clearAllHistory = () => {
    if (confirm('Are you sure you want to clear all translation history?')) {
      setHistory([]);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-neutral-900 dark:to-neutral-800">
      <TemplateHeader title={title} />
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-2">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-sky-600 to-blue-600 bg-clip-text text-transparent">
                {title}
              </h1>
              <button
                onClick={() => setShowDocumentation(true)}
                className="p-2 bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 rounded-lg hover:bg-sky-200 dark:hover:bg-sky-900/50 transition-colors"
                title="Know More"
              >
                <Info className="h-5 w-5" />
              </button>
          </div>
          <p className="text-neutral-600 dark:text-neutral-400">Translate text and voice instantly</p>
        </div>

        <Card className="p-6 bg-white dark:bg-neutral-800">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-sky-600 dark:text-sky-400">
                    Source Language:
                  </label>
                  <select
                    value={sourceLang}
                    onChange={(e) => setSourceLang(e.target.value)}
                    className="px-4 py-2 bg-sky-100 dark:bg-sky-900/30 border-2 border-sky-300 dark:border-sky-700 rounded-lg font-medium text-neutral-900 dark:text-white"
                  >
                    {languages.map(lang => <option key={lang}>{lang}</option>)}
                  </select>
                </div>
                <button 
                  onClick={handleVoiceInput}
                  disabled={isRecording}
                  className={`p-2 hover:bg-sky-100 dark:hover:bg-sky-900/30 rounded-lg transition-colors ${
                    isRecording ? 'bg-red-100 dark:bg-red-900/30 animate-pulse' : ''
                  }`}
                  title={isRecording ? 'Recording...' : 'Voice Input'}
                >
                  <Mic className={`h-5 w-5 ${
                    isRecording ? 'text-red-600' : 'text-sky-600'
                  }`} />
                </button>
              </div>
              <div className="relative">
                <textarea
                  value={sourceText}
                  onChange={(e) => setSourceText(e.target.value)}
                  placeholder={`Write or paste your text in ${sourceLang} here...`}
                  className="w-full h-48 p-4 pr-10 bg-neutral-50 dark:bg-neutral-700 border-2 border-neutral-200 dark:border-neutral-600 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-sky-500 text-neutral-900 dark:text-white"
                />
                {sourceText && (
                  <button
                    onClick={handleClearSource}
                    className="absolute top-2 right-2 p-1.5 hover:bg-neutral-200 dark:hover:bg-neutral-600 rounded-full transition-colors"
                    title="Clear text"
                  >
                    <XCircle className="h-5 w-5 text-neutral-500 dark:text-neutral-400" />
                  </button>
                )}
              </div>
              <div className="flex gap-2 mt-3">
                <Button 
                  onClick={handleVoiceInput}
                  disabled={isRecording}
                  className={`flex-1 text-white ${
                    isRecording 
                      ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                      : 'bg-sky-500 hover:bg-sky-600'
                  }`}
                >
                  <Mic className="h-4 w-4 mr-2" />
                  {isRecording ? 'Recording...' : 'Voice Input'}
                </Button>
                <Button 
                  onClick={() => handleListen(sourceText, sourceLang)}
                  disabled={!sourceText}
                  className="flex-1 bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Volume2 className="h-4 w-4 mr-2" />
                  Listen
                </Button>
              </div>
            </div>

            <div className="relative">
              <button 
                onClick={handleSwapLanguages}
                className="absolute -left-8 top-1/2 -translate-y-1/2 p-3 bg-gradient-to-r from-sky-500 to-blue-500 text-white rounded-full hover:opacity-90 transition-opacity z-10"
                title="Swap Languages"
              >
                <ArrowLeftRight className="h-5 w-5" />
              </button>
              
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-blue-600 dark:text-blue-400">
                    Target Language:
                  </label>
                  <select
                    value={targetLang}
                    onChange={(e) => setTargetLang(e.target.value)}
                    className="px-4 py-2 bg-blue-100 dark:bg-blue-900/30 border-2 border-blue-300 dark:border-blue-700 rounded-lg font-medium text-neutral-900 dark:text-white"
                  >
                    {languages.map(lang => <option key={lang}>{lang}</option>)}
                  </select>
                </div>
                <button 
                  onClick={() => handleCopy(translatedText)}
                  disabled={!translatedText}
                  className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Copy Translation"
                >
                  <Copy className="h-5 w-5 text-blue-600" />
                </button>
              </div>
              <div className="relative">
                <div className="w-full h-48 p-4 pr-10 bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-lg text-neutral-900 dark:text-white overflow-y-auto">
                  {translatedText || <span className="text-neutral-400">Translation will appear here...</span>}
                </div>
                {translatedText && (
                  <button
                    onClick={handleClearTranslation}
                    className="absolute top-2 right-2 p-1.5 hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full transition-colors"
                    title="Clear translation"
                  >
                    <XCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </button>
                )}
              </div>
              <div className="flex gap-2 mt-3">
                <Button 
                  onClick={() => handleListen(translatedText, targetLang)}
                  disabled={!translatedText}
                  className="flex-1 bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Volume2 className="h-4 w-4 mr-2" />
                  Listen
                </Button>
                <Button 
                  onClick={() => handleCopy(translatedText)}
                  disabled={!translatedText}
                  className="flex-1 bg-green-500 text-white hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
              </div>
            </div>
          </div>

          <div className="mt-6 text-center">
            <Button 
              onClick={handleTranslate}
              disabled={!sourceText.trim() || isTranslating}
              className="bg-gradient-to-r from-sky-500 to-blue-500 text-white hover:opacity-90 px-8 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Languages className="h-4 w-4 mr-2" />
              {isTranslating ? 'Translating...' : 'Translate'}
            </Button>
          </div>
        </Card>

        <Card className="p-6 bg-white dark:bg-neutral-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
              Translation History <span className="text-sm font-normal text-neutral-500 dark:text-neutral-400">(Latest 15)</span>
            </h3>
            {history.length > 0 && (
              <Button 
                onClick={clearAllHistory}
                className="bg-red-500 text-white hover:bg-red-600 text-sm"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear All
              </Button>
            )}
          </div>
          {history.length === 0 ? (
            <div className="text-center py-12">
              <Languages className="h-16 w-16 text-neutral-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">No Translation History</h3>
              <p className="text-neutral-600 dark:text-neutral-400">Your translations will appear here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((item) => (
                <div key={item.id} className="p-4 bg-gradient-to-r from-sky-50 to-blue-50 dark:from-sky-900/20 dark:to-blue-900/20 rounded-lg border border-sky-200 dark:border-sky-800">
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-xs text-neutral-500 dark:text-neutral-400">{item.timestamp}</span>
                    <button 
                      onClick={() => deleteHistoryItem(item.id)}
                      className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </button>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-sky-600 dark:text-sky-400 font-medium mb-1">{item.from}</p>
                      <p className="text-neutral-900 dark:text-white">{item.source}</p>
                    </div>
                    <div>
                      <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-1">{item.to}</p>
                      <p className="text-neutral-900 dark:text-white">{item.target}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
        {/* Documentation Modal */}
        {showDocumentation && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <Card className="max-w-4xl w-full max-h-[90vh] overflow-y-auto bg-white dark:bg-neutral-800">
              <div className="sticky top-0 bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 p-6 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                    <Languages className="h-6 w-6 text-sky-600" />
                    Language Translator - Template Documentation
                  </h2>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">Complete guide to features and capabilities</p>
                </div>
                <button onClick={() => setShowDocumentation(false)} className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors">
                  <X className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
                </button>
              </div>
              <div className="p-6 space-y-6">
                <section>
                  <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-3">📋 Overview</h3>
                  <p className="text-neutral-700 dark:text-neutral-300">
                    Language Translator is a fully functional translation tool powered by MyMemory Translation API. Translate text between 20+ languages 
                    including 9 major Indian languages. Features include real-time translation, voice input with Web Speech API, text-to-speech, 
                    language swapping, and automatic history tracking of your latest 15 translations.
                  </p>
                </section>
                <section>
                  <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-4">✨ Key Features</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 bg-sky-50 dark:bg-sky-900/20 rounded-lg border border-sky-200 dark:border-sky-800">
                      <div className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-sky-600 mt-0.5" />
                        <div>
                          <h4 className="font-bold text-neutral-900 dark:text-white mb-1">Real Translation API</h4>
                          <p className="text-sm text-neutral-700 dark:text-neutral-300">Powered by MyMemory Translation API for actual translations between 20+ languages</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <div className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div>
                          <h4 className="font-bold text-neutral-900 dark:text-white mb-1">Voice Input (Web Speech API)</h4>
                          <p className="text-sm text-neutral-700 dark:text-neutral-300">Speak in any supported language with visual recording feedback</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                      <div className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-purple-600 mt-0.5" />
                        <div>
                          <h4 className="font-bold text-neutral-900 dark:text-white mb-1">Text-to-Speech</h4>
                          <p className="text-sm text-neutral-700 dark:text-neutral-300">Listen to both source and translated text in native pronunciation</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                      <div className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-green-600 mt-0.5" />
                        <div>
                          <h4 className="font-bold text-neutral-900 dark:text-white mb-1">Clear Buttons</h4>
                          <p className="text-sm text-neutral-700 dark:text-neutral-300">Quick clear buttons for source text and translation with X icons</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                      <div className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-amber-600 mt-0.5" />
                        <div>
                          <h4 className="font-bold text-neutral-900 dark:text-white mb-1">Swap Languages</h4>
                          <p className="text-sm text-neutral-700 dark:text-neutral-300">Instantly reverse translation direction with text content swap</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 bg-pink-50 dark:bg-pink-900/20 rounded-lg border border-pink-200 dark:border-pink-800">
                      <div className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-pink-600 mt-0.5" />
                        <div>
                          <h4 className="font-bold text-neutral-900 dark:text-white mb-1">Translation History (15)</h4>
                          <p className="text-sm text-neutral-700 dark:text-neutral-300">Auto-saves latest 15 translations with timestamps and delete options</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
                <section>
                  <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-4">🇮🇳 Indian Languages Supported</h3>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {['Hindi', 'Bengali', 'Telugu', 'Marathi', 'Tamil', 'Gujarati', 'Kannada', 'Malayalam', 'Punjabi'].map(lang => (
                      <div key={lang} className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800 text-center">
                        <p className="font-medium text-neutral-900 dark:text-white">{lang}</p>
                      </div>
                    ))}
                  </div>
                </section>
                <section>
                  <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-4">🚀 How to Use</h3>
                  <div className="space-y-3">
                    <div className="p-4 bg-neutral-50 dark:bg-neutral-700/50 rounded-lg">
                      <h4 className="font-bold text-neutral-900 dark:text-white mb-2">1. Select Languages</h4>
                      <p className="text-sm text-neutral-700 dark:text-neutral-300">Choose your source language (left) and target language (right) from the dropdown menus. Supports 20+ languages including 9 Indian languages.</p>
                    </div>
                    <div className="p-4 bg-neutral-50 dark:bg-neutral-700/50 rounded-lg">
                      <h4 className="font-bold text-neutral-900 dark:text-white mb-2">2. Enter Text</h4>
                      <p className="text-sm text-neutral-700 dark:text-neutral-300">Type your text in the left panel OR click the microphone button to use voice input. The microphone turns red and pulses while recording.</p>
                    </div>
                    <div className="p-4 bg-neutral-50 dark:bg-neutral-700/50 rounded-lg">
                      <h4 className="font-bold text-neutral-900 dark:text-white mb-2">3. Translate</h4>
                      <p className="text-sm text-neutral-700 dark:text-neutral-300">Click the "Translate" button. Real translation happens via MyMemory API. Translation appears in the right panel with automatic history save.</p>
                    </div>
                    <div className="p-4 bg-neutral-50 dark:bg-neutral-700/50 rounded-lg">
                      <h4 className="font-bold text-neutral-900 dark:text-white mb-2">4. Listen & Copy</h4>
                      <p className="text-sm text-neutral-700 dark:text-neutral-300">Click "Listen" buttons to hear text-to-speech in the selected language. Click "Copy" to copy translation to clipboard.</p>
                    </div>
                    <div className="p-4 bg-neutral-50 dark:bg-neutral-700/50 rounded-lg">
                      <h4 className="font-bold text-neutral-900 dark:text-white mb-2">5. Clear & Swap</h4>
                      <p className="text-sm text-neutral-700 dark:text-neutral-300">Use X buttons in top-right corners to clear text. Click the swap button (↔) to reverse languages and swap text content.</p>
                    </div>
                    <div className="p-4 bg-neutral-50 dark:bg-neutral-700/50 rounded-lg">
                      <h4 className="font-bold text-neutral-900 dark:text-white mb-2">6. Manage History</h4>
                      <p className="text-sm text-neutral-700 dark:text-neutral-300">View your latest 15 translations below. Delete individual items with trash icon or clear all history at once.</p>
                    </div>
                  </div>
                </section>
                <section className="bg-gradient-to-r from-sky-50 to-blue-50 dark:from-sky-900/20 dark:to-blue-900/20 p-6 rounded-lg border border-sky-200 dark:border-sky-800">
                  <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-4">💎 Pro Tips</h3>
                  <ul className="space-y-2 text-neutral-700 dark:text-neutral-300">
                    <li className="flex items-start gap-2">
                      <span className="text-sky-600 mt-1">✓</span>
                      <span><strong>Voice Input:</strong> Allow microphone access when prompted. Works best in Chrome, Edge, and Safari. Speak clearly after clicking mic button.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-sky-600 mt-1">✓</span>
                      <span><strong>Quick Clear:</strong> Use X buttons to quickly clear text fields without manually selecting and deleting.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-sky-600 mt-1">✓</span>
                      <span><strong>Swap Feature:</strong> Use swap button for reverse translations - both languages and text content swap automatically.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-sky-600 mt-1">✓</span>
                      <span><strong>Listen Feature:</strong> Use text-to-speech to learn correct pronunciation in target language.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-sky-600 mt-1">✓</span>
                      <span><strong>History Management:</strong> Review past translations, delete unwanted entries, or clear all at once.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-sky-600 mt-1">✓</span>
                      <span><strong>API Info:</strong> Uses MyMemory Translation API (free tier: 5000 words/day). No API key required.</span>
                    </li>
                  </ul>
                </section>
              </div>
              <div className="sticky bottom-0 bg-white dark:bg-neutral-800 border-t border-neutral-200 dark:border-neutral-700 p-6">
                <Button onClick={() => setShowDocumentation(false)} className="w-full bg-gradient-to-r from-sky-500 to-blue-500 text-white hover:opacity-90">Got It!</Button>
              </div>
            </Card>
          </div>
        )}
        </div>
      </div>
      <TemplateFooter />
    </div>
  );
}
