'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Copy, Trash2, Globe, Info, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';

interface Language {
  code: string;
  name: string;
  flag: string;
}

const LANGUAGES: Language[] = [
  { code: 'en-US', name: 'English', flag: '🇺🇸' },
  { code: 'hi-IN', name: 'Hindi', flag: '🇮🇳' },
  { code: 'ml-IN', name: 'Malayalam', flag: '🇮🇳' },
  { code: 'ta-IN', name: 'Tamil', flag: '🇮🇳' },
  { code: 'te-IN', name: 'Telugu', flag: '🇮🇳' },
  { code: 'kn-IN', name: 'Kannada', flag: '🇮🇳' },
  { code: 'bn-IN', name: 'Bengali', flag: '🇮🇳' },
  { code: 'gu-IN', name: 'Gujarati', flag: '🇮🇳' },
  { code: 'mr-IN', name: 'Marathi', flag: '🇮🇳' },
  { code: 'pa-IN', name: 'Punjabi', flag: '🇮🇳' },
  { code: 'es-ES', name: 'Spanish', flag: '🇪🇸' },
  { code: 'fr-FR', name: 'French', flag: '🇫🇷' },
  { code: 'de-DE', name: 'German', flag: '🇩🇪' },
  { code: 'ja-JP', name: 'Japanese', flag: '🇯🇵' },
  { code: 'zh-CN', name: 'Chinese', flag: '🇨🇳' },
  { code: 'ar-SA', name: 'Arabic', flag: '🇸🇦' },
  { code: 'ru-RU', name: 'Russian', flag: '🇷🇺' },
  { code: 'pt-BR', name: 'Portuguese', flag: '🇧🇷' },
  { code: 'ko-KR', name: 'Korean', flag: '🇰🇷' },
  { code: 'it-IT', name: 'Italian', flag: '🇮🇹' },
];

export function SoundBox() {
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(LANGUAGES[0]);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(true);
  const [error, setError] = useState('');
  const [showDocumentation, setShowDocumentation] = useState(false);
  
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      
      if (!SpeechRecognition) {
        setIsSupported(false);
        setError('Speech recognition is not supported in your browser. Please use Chrome, Edge, or Safari.');
        return;
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = selectedLanguage.code;

      recognition.onresult = (event: any) => {
        let interim = '';
        let final = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcriptPart = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            final += transcriptPart + ' ';
          } else {
            interim += transcriptPart;
          }
        }

        if (final) {
          // Process voice commands for punctuation
          let processedText = final;
          
          // Replace voice commands with actual punctuation
          processedText = processedText
            .replace(/\s*full stop\s*/gi, '. ')
            .replace(/\s*period\s*/gi, '. ')
            .replace(/\s*comma\s*/gi, ', ')
            .replace(/\s*question mark\s*/gi, '? ')
            .replace(/\s*exclamation mark\s*/gi, '! ')
            .replace(/\s*new paragraph\s*/gi, '.\n\n')
            .replace(/\s*new line\s*/gi, '\n');
          
          setTranscript(prev => prev + processedText);
        }
        setInterimTranscript(interim);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setError(`Error: ${event.error}`);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
        setInterimTranscript('');
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [selectedLanguage]);

  const startListening = () => {
    if (!recognitionRef.current) return;
    
    setError('');
    setIsListening(true);
    recognitionRef.current.lang = selectedLanguage.code;
    recognitionRef.current.start();
  };

  const stopListening = () => {
    if (!recognitionRef.current) return;
    
    recognitionRef.current.stop();
    setIsListening(false);
    setInterimTranscript('');
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(transcript);
      alert('Text copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const clearTranscript = () => {
    setTranscript('');
    setInterimTranscript('');
    setError('');
  };

  return (
    <Card className="w-full max-w-4xl mx-auto p-8 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-neutral-900 dark:to-neutral-800 border-2 border-purple-200 dark:border-purple-800">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-4 mb-2">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Sound Box
          </h2>
          <button
            onClick={() => setShowDocumentation(true)}
            className="p-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
            title="Documentation"
          >
            <Info className="h-4 w-4" />
          </button>
        </div>
        <p className="text-neutral-600 dark:text-neutral-400">
          Speak in any language and watch it convert to text
        </p>
      </div>

      {/* Language Selector */}
      <div className="mb-6">
        <label className="flex items-center gap-2 text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-3">
          <Globe className="h-5 w-5 text-purple-600" />
          Select Language
        </label>
        <select
          value={selectedLanguage.code}
          onChange={(e) => {
            const lang = LANGUAGES.find(l => l.code === e.target.value);
            if (lang) setSelectedLanguage(lang);
          }}
          className="w-full px-4 py-3 bg-white dark:bg-neutral-800 border-2 border-purple-300 dark:border-purple-700 rounded-xl text-lg font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
          disabled={isListening}
        >
          {LANGUAGES.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.flag} {lang.name}
            </option>
          ))}
        </select>
      </div>

      {/* Controls */}
      <div className="flex justify-center gap-4 mb-6">
        {!isListening ? (
          <button
            onClick={startListening}
            disabled={!isSupported}
            className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold text-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            <Mic className="h-6 w-6" />
            Start Recording
          </button>
        ) : (
          <button
            onClick={stopListening}
            className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-xl font-semibold text-lg hover:opacity-90 transition-opacity shadow-lg animate-pulse"
          >
            <MicOff className="h-6 w-6" />
            Stop Recording
          </button>
        )}
      </div>

      {/* Status Indicator */}
      {isListening && (
        <div className="text-center mb-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-full">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
            <span className="font-semibold">Listening in {selectedLanguage.name}...</span>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Punctuation Controls */}
      {isListening && (
        <div className="mb-4">
          <p className="text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-2">
            Quick Punctuation (or say the command)
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setTranscript(prev => prev + '. ')}
              className="px-3 py-1.5 text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
            >
              . Full Stop
            </button>
            <button
              onClick={() => setTranscript(prev => prev + ', ')}
              className="px-3 py-1.5 text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
            >
              , Comma
            </button>
            <button
              onClick={() => setTranscript(prev => prev + '? ')}
              className="px-3 py-1.5 text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
            >
              ? Question
            </button>
            <button
              onClick={() => setTranscript(prev => prev + '! ')}
              className="px-3 py-1.5 text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
            >
              ! Exclamation
            </button>
            <button
              onClick={() => setTranscript(prev => prev + '.\n\n')}
              className="px-3 py-1.5 text-sm bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors font-semibold"
            >
              ¶ New Paragraph
            </button>
            <button
              onClick={() => setTranscript(prev => prev + '\n')}
              className="px-3 py-1.5 text-sm bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
            >
              ↵ New Line
            </button>
          </div>
        </div>
      )}

      {/* Transcript Display */}
      <div className="relative">
        <div className="min-h-[300px] max-h-[500px] overflow-y-auto p-6 bg-white dark:bg-neutral-800 border-2 border-purple-200 dark:border-purple-700 rounded-xl whitespace-pre-wrap">
          {transcript || interimTranscript ? (
            <div className="text-lg leading-relaxed">
              <span className="text-neutral-900 dark:text-neutral-100">
                {transcript}
              </span>
              {interimTranscript && (
                <span className="text-neutral-400 dark:text-neutral-500 italic">
                  {interimTranscript}
                </span>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-neutral-400 dark:text-neutral-600">
              <div className="text-center">
                <Mic className="h-16 w-16 mx-auto mb-4 opacity-30" />
                <p className="text-lg">
                  Click "Start Recording" and speak in {selectedLanguage.name}
                </p>
                <p className="text-sm mt-2">
                  Your speech will appear here as text
                </p>
                <p className="text-xs mt-4 text-neutral-500">
                  Say "full stop" or "new paragraph" for punctuation
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        {transcript && (
          <div className="flex gap-3 mt-4">
            <button
              onClick={copyToClipboard}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors"
            >
              <Copy className="h-5 w-5" />
              Copy Text
            </button>
            <button
              onClick={clearTranscript}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors"
            >
              <Trash2 className="h-5 w-5" />
              Clear
            </button>
          </div>
        )}
      </div>

      {/* Browser Support Notice */}
      {!isSupported && (
        <div className="mt-6 p-4 bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700 rounded-lg text-yellow-800 dark:text-yellow-400 text-center">
          <p className="font-semibold">Browser Not Supported</p>
          <p className="text-sm mt-1">
            Please use Chrome, Edge, or Safari for the best experience
          </p>
        </div>
      )}

      {/* Documentation Modal */}
      <AnimatePresence>
        {showDocumentation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4"
            onClick={() => setShowDocumentation(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
            >
              <div className="sticky top-0 bg-gradient-to-r from-purple-500 to-blue-600 p-6 flex items-center justify-between z-10">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <Mic className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Sound Box Guide</h2>
                    <p className="text-purple-100 text-sm">Speech-to-text in 20+ languages</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDocumentation(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-white" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-3">🎤 Overview</h3>
                  <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed">
                    Sound Box is a powerful speech-to-text tool that converts your voice into written text in real-time. Supporting 20+ languages including 9 Indian languages, it uses the Web Speech API to provide accurate transcription with voice command support for punctuation.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-3">✨ Key Features</h3>
                  <div className="grid gap-3">
                    <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                      <h4 className="font-semibold text-purple-900 dark:text-purple-400 mb-1">🌍 20+ Languages</h4>
                      <p className="text-sm text-purple-800 dark:text-purple-300">English, Hindi, Malayalam, Tamil, Telugu, Kannada, Bengali, Gujarati, Marathi, Punjabi, Spanish, French, German, Japanese, Chinese, Arabic, Russian, Portuguese, Korean, Italian</p>
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-900 dark:text-blue-400 mb-1">🎯 Real-time Transcription</h4>
                      <p className="text-sm text-blue-800 dark:text-blue-300">See your words appear instantly as you speak with interim results.</p>
                    </div>
                    <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-4">
                      <h4 className="font-semibold text-indigo-900 dark:text-indigo-400 mb-1">📝 Voice Commands</h4>
                      <p className="text-sm text-indigo-800 dark:text-indigo-300">Say "full stop", "comma", "question mark", "new paragraph" for automatic punctuation.</p>
                    </div>
                    <div className="bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800 rounded-lg p-4">
                      <h4 className="font-semibold text-violet-900 dark:text-violet-400 mb-1">🖱️ Quick Punctuation Buttons</h4>
                      <p className="text-sm text-violet-800 dark:text-violet-300">Click buttons to add punctuation while recording.</p>
                    </div>
                    <div className="bg-fuchsia-50 dark:bg-fuchsia-900/20 border border-fuchsia-200 dark:border-fuchsia-800 rounded-lg p-4">
                      <h4 className="font-semibold text-fuchsia-900 dark:text-fuchsia-400 mb-1">📋 Copy & Clear</h4>
                      <p className="text-sm text-fuchsia-800 dark:text-fuchsia-300">Easily copy transcribed text to clipboard or clear to start fresh.</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-3">🚀 How to Use</h3>
                  <div className="space-y-3">
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-500 text-white flex items-center justify-center text-sm font-bold">1</div>
                      <div>
                        <p className="font-semibold text-neutral-900 dark:text-white">Select Language</p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">Choose your preferred language from the dropdown (20+ options available).</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-500 text-white flex items-center justify-center text-sm font-bold">2</div>
                      <div>
                        <p className="font-semibold text-neutral-900 dark:text-white">Allow Microphone Access</p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">Click "Start Recording" and grant microphone permission when prompted.</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-500 text-white flex items-center justify-center text-sm font-bold">3</div>
                      <div>
                        <p className="font-semibold text-neutral-900 dark:text-white">Start Speaking</p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">Speak clearly in your selected language. Your words will appear in real-time.</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-500 text-white flex items-center justify-center text-sm font-bold">4</div>
                      <div>
                        <p className="font-semibold text-neutral-900 dark:text-white">Add Punctuation</p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">Say voice commands ("full stop", "comma") or click the quick buttons.</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-500 text-white flex items-center justify-center text-sm font-bold">5</div>
                      <div>
                        <p className="font-semibold text-neutral-900 dark:text-white">Stop Recording</p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">Click "Stop Recording" when finished speaking.</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-500 text-white flex items-center justify-center text-sm font-bold">6</div>
                      <div>
                        <p className="font-semibold text-neutral-900 dark:text-white">Copy or Clear</p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">Copy the text to clipboard or clear to start a new transcription.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-3">💡 Pro Tips</h3>
                  <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4 space-y-2">
                    <p className="text-sm text-neutral-700 dark:text-neutral-300">✅ <strong>Speak clearly</strong> - Enunciate words for better accuracy</p>
                    <p className="text-sm text-neutral-700 dark:text-neutral-300">✅ <strong>Quiet environment</strong> - Reduce background noise for best results</p>
                    <p className="text-sm text-neutral-700 dark:text-neutral-300">✅ <strong>Use voice commands</strong> - Say "full stop" instead of clicking buttons</p>
                    <p className="text-sm text-neutral-700 dark:text-neutral-300">✅ <strong>Pause between sentences</strong> - Brief pauses help with accuracy</p>
                    <p className="text-sm text-neutral-700 dark:text-neutral-300">✅ <strong>Chrome recommended</strong> - Best performance in Chrome, Edge, or Safari</p>
                    <p className="text-sm text-neutral-700 dark:text-neutral-300">✅ <strong>Check language</strong> - Ensure selected language matches your speech</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-3">🎙️ Voice Commands</h3>
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <p className="text-sm text-blue-800 dark:text-blue-300 leading-relaxed mb-3">
                      <strong>Say these commands while recording to add punctuation automatically:</strong>
                    </p>
                    <ul className="space-y-1 text-sm text-blue-800 dark:text-blue-300">
                      <li>• "full stop" or "period" → adds a period (.)</li>
                      <li>• "comma" → adds a comma (,)</li>
                      <li>• "question mark" → adds a question mark (?)</li>
                      <li>• "exclamation mark" → adds an exclamation (!)</li>
                      <li>• "new paragraph" → starts a new paragraph</li>
                      <li>• "new line" → starts a new line</li>
                    </ul>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-3">🌐 Browser Support</h3>
                  <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-4">
                    <p className="text-sm text-emerald-800 dark:text-emerald-300 leading-relaxed">
                      <strong>Sound Box uses the Web Speech API.</strong> For the best experience, use Chrome, Microsoft Edge, or Safari. The feature requires microphone access permission. Your voice data is processed locally in your browser and is not stored or transmitted.
                    </p>
                  </div>
                </div>
              </div>

              <div className="sticky bottom-0 bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-700 p-6">
                <button
                  onClick={() => setShowDocumentation(false)}
                  className="w-full px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-lg hover:opacity-90 transition-opacity font-medium"
                >
                  Got it!
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
