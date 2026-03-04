'use client';

import React, { useState } from 'react';
import { BookOpen, Search, Volume2, Star, History, Info, X, Check, Loader2, Globe } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TemplateHeader } from './template-header';
import { TemplateFooter } from './template-footer';

interface DictionaryTemplateProps {
  title: string;
  notebookId?: string;
}

interface WordData {
  word: string;
  pronunciation: string;
  partOfSpeech: string;
  definition: string;
  examples: string[];
  synonyms: string[];
  translations?: { [key: string]: string };
}

export function DictionaryTemplate({ title }: DictionaryTemplateProps) {
  const [searchWord, setSearchWord] = useState('');
  const [sourceLang, setSourceLang] = useState('English');
  const [targetLang, setTargetLang] = useState('Hindi');
  const [wordData, setWordData] = useState<WordData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>(['Serendipity', 'Ephemeral', 'Resilience', 'Eloquent']);
  const [showDocumentation, setShowDocumentation] = useState(false);

  const languages = [
    'English', 'Hindi', 'Bengali', 'Telugu', 'Marathi', 'Tamil', 'Gujarati', 'Kannada', 'Malayalam', 'Punjabi',
    'Spanish', 'French', 'German', 'Chinese', 'Japanese', 'Korean', 'Arabic', 'Portuguese', 'Russian', 'Italian'
  ];

  const getLanguageCode = (language: string): string => {
    const languageCodes: { [key: string]: string } = {
      'English': 'en', 'Hindi': 'hi', 'Bengali': 'bn', 'Telugu': 'te', 'Marathi': 'mr',
      'Tamil': 'ta', 'Gujarati': 'gu', 'Kannada': 'kn', 'Malayalam': 'ml', 'Punjabi': 'pa',
      'Spanish': 'es', 'French': 'fr', 'German': 'de', 'Chinese': 'zh', 'Japanese': 'ja',
      'Korean': 'ko', 'Arabic': 'ar', 'Portuguese': 'pt', 'Russian': 'ru', 'Italian': 'it'
    };
    return languageCodes[language] || 'en';
  };

  const handleSearch = async () => {
    if (!searchWord.trim()) return;

    setIsLoading(true);
    setError('');

    try {
      // Use Free Dictionary API for English words
      if (sourceLang === 'English') {
        const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${searchWord.toLowerCase()}`);
        
        if (!response.ok) {
          throw new Error('Word not found');
        }

        const data = await response.json();
        const entry = data[0];
        const meaning = entry.meanings[0];

        // Get translation if target language is not English
        let translation = '';
        if (targetLang !== 'English') {
          const transResponse = await fetch(
            `https://api.mymemory.translated.net/get?q=${encodeURIComponent(searchWord)}&langpair=en|${getLanguageCode(targetLang)}`
          );
          const transData = await transResponse.json();
          translation = transData.responseData?.translatedText || searchWord;
        }

        setWordData({
          word: entry.word,
          pronunciation: entry.phonetic || entry.phonetics[0]?.text || 'N/A',
          partOfSpeech: meaning.partOfSpeech,
          definition: meaning.definitions[0].definition,
          examples: meaning.definitions[0].example ? [meaning.definitions[0].example] : [],
          synonyms: meaning.synonyms?.slice(0, 6) || [],
          translations: targetLang !== 'English' ? { [targetLang]: translation } : undefined
        });

        // Add to recent searches
        setRecentSearches(prev => {
          const updated = [searchWord, ...prev.filter(w => w.toLowerCase() !== searchWord.toLowerCase())];
          return updated.slice(0, 6);
        });
      } else {
        // For non-English source languages, translate to target language
        const transResponse = await fetch(
          `https://api.mymemory.translated.net/get?q=${encodeURIComponent(searchWord)}&langpair=${getLanguageCode(sourceLang)}|${getLanguageCode(targetLang)}`
        );
        const transData = await transResponse.json();
        const translation = transData.responseData?.translatedText || searchWord;

        setWordData({
          word: searchWord,
          pronunciation: 'N/A',
          partOfSpeech: 'Translation',
          definition: `Translation from ${sourceLang} to ${targetLang}`,
          examples: [],
          synonyms: [],
          translations: { [targetLang]: translation }
        });

        setRecentSearches(prev => {
          const updated = [searchWord, ...prev.filter(w => w !== searchWord)];
          return updated.slice(0, 6);
        });
      }
    } catch (err) {
      setError('Word not found or translation failed. Please try another word.');
      setWordData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecentSearch = (word: string) => {
    setSearchWord(word);
  };

  const handlePronounce = () => {
    if (wordData && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(wordData.word);
      utterance.lang = getLanguageCode(sourceLang) === 'en' ? 'en-US' : 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-neutral-900 dark:to-neutral-800">
      <TemplateHeader title={title} />
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-2">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-600 to-gray-600 bg-clip-text text-transparent">
                {title}
              </h1>
              <button
                onClick={() => setShowDocumentation(true)}
                className="p-2 bg-slate-100 dark:bg-slate-900/30 text-slate-600 dark:text-slate-400 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-900/50 transition-colors"
                title="Know More"
              >
                <Info className="h-5 w-5" />
              </button>
          </div>
          <p className="text-neutral-600 dark:text-neutral-400">Multi-language word meanings and translations</p>
        </div>

        <Card className="p-6 bg-white dark:bg-neutral-800">
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                <Globe className="h-4 w-4 inline mr-1" />
                Source Language
              </label>
              <select
                value={sourceLang}
                onChange={(e) => setSourceLang(e.target.value)}
                className="w-full px-4 py-2 bg-slate-100 dark:bg-slate-900/30 border-2 border-slate-300 dark:border-slate-700 rounded-lg font-medium text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-500"
              >
                {languages.map(lang => <option key={lang}>{lang}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                <Globe className="h-4 w-4 inline mr-1" />
                Target Language
              </label>
              <select
                value={targetLang}
                onChange={(e) => setTargetLang(e.target.value)}
                className="w-full px-4 py-2 bg-blue-100 dark:bg-blue-900/30 border-2 border-blue-300 dark:border-blue-700 rounded-lg font-medium text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {languages.map(lang => <option key={lang}>{lang}</option>)}
              </select>
            </div>
          </div>
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <Search className="h-5 w-5 text-neutral-400" />
              <label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Enter word or text in {sourceLang}
              </label>
            </div>
            <textarea
              value={searchWord}
              onChange={(e) => setSearchWord(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSearch()}
              placeholder={`Type or paste text in ${sourceLang}... (Press Enter to search, Shift+Enter for new line)`}
              rows={3}
              className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-700 border-2 border-slate-200 dark:border-slate-700 rounded-lg text-lg text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-500 resize-none"
            />
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
              💡 You can paste sentences or paragraphs for translation
            </p>
          </div>
          <div className="flex items-center gap-3 mt-4">
            <Button
              onClick={handleSearch}
              disabled={!searchWord.trim() || isLoading}
              className="bg-gradient-to-r from-slate-500 to-gray-600 text-white hover:opacity-90 px-6 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Searching...</>
              ) : (
                <><Search className="h-4 w-4 mr-2" />Search</>
              )}
            </Button>
            {recentSearches.length > 0 && (
              <div className="flex gap-2 overflow-x-auto flex-1">
                {recentSearches.map(word => (
                  <button
                    key={word}
                    onClick={() => handleRecentSearch(word)}
                    className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors whitespace-nowrap"
                  >
                    <History className="h-3 w-3 inline mr-1" />
                    {word}
                  </button>
                ))}
              </div>
            )}
          </div>
          {error && (
            <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
              {error}
            </div>
          )}
        </Card>

        {wordData && (
        <Card className="p-6 bg-white dark:bg-neutral-800">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-3xl font-bold text-neutral-900 dark:text-white">{wordData.word}</h2>
                <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                  <Star className="h-5 w-5 text-slate-400" />
                </button>
                <button
                  onClick={handlePronounce}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                  title="Pronounce"
                >
                  <Volume2 className="h-5 w-5 text-slate-600" />
                </button>
              </div>
              <p className="text-slate-600 dark:text-slate-400 mb-1">{wordData.pronunciation}</p>
              <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-sm font-medium">
                {wordData.partOfSpeech}
              </span>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-bold text-slate-600 dark:text-slate-400 mb-2">DEFINITION</h3>
              <p className="text-lg text-neutral-900 dark:text-white">{wordData.definition}</p>
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-600 dark:text-slate-400 mb-2">EXAMPLES</h3>
              <ul className="space-y-2">
                {wordData.examples.map((example, idx) => (
                  <li key={idx} className="flex gap-3">
                    <span className="text-slate-400">•</span>
                    <span className="text-neutral-700 dark:text-neutral-300 italic">{example}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-600 dark:text-slate-400 mb-2">SYNONYMS</h3>
              <div className="flex flex-wrap gap-2">
                {wordData.synonyms.map(syn => (
                  <span key={syn} className="px-3 py-1.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-lg text-sm">
                    {syn}
                  </span>
                ))}
              </div>
            </div>

            {wordData.translations && Object.keys(wordData.translations).length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-slate-600 dark:text-slate-400 mb-3">TRANSLATIONS</h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  {Object.entries(wordData.translations).map(([lang, trans]) => (
                    <div key={lang} className="p-3 bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-800 dark:to-gray-800 rounded-lg border border-slate-200 dark:border-slate-700">
                      <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">{lang}</p>
                      <p className="text-lg font-semibold text-neutral-900 dark:text-white">{trans}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>
        )}

        {!wordData && !error && (
          <Card className="p-12 bg-white dark:bg-neutral-800 text-center">
            <BookOpen className="h-16 w-16 text-neutral-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">Search for a Word</h3>
            <p className="text-neutral-600 dark:text-neutral-400">Enter a word and select languages to get definitions and translations</p>
          </Card>
        )}

        {/* Documentation Modal */}
        {showDocumentation && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <Card className="max-w-4xl w-full max-h-[90vh] overflow-y-auto bg-white dark:bg-neutral-800">
              <div className="sticky top-0 bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 p-6 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                    <BookOpen className="h-6 w-6 text-slate-600" />
                    Dictionary - Template Documentation
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
                    Dictionary is a powerful multi-language word lookup tool. Search for words in 20+ languages including 9 major Indian languages. 
                    Get detailed definitions, pronunciations, examples, synonyms, and translations powered by Free Dictionary API and MyMemory Translation API.
                  </p>
                </section>
                <section>
                  <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-4">✨ Key Features</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 dark:bg-slate-900/20 rounded-lg border border-slate-200 dark:border-slate-800">
                      <div className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-slate-600 mt-0.5" />
                        <div>
                          <h4 className="font-bold text-neutral-900 dark:text-white mb-1">20+ Languages</h4>
                          <p className="text-sm text-neutral-700 dark:text-neutral-300">Support for English, Hindi, Bengali, Telugu, Marathi, Tamil, Gujarati, Kannada, Malayalam, Punjabi, and 10 more</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <div className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div>
                          <h4 className="font-bold text-neutral-900 dark:text-white mb-1">Detailed Definitions</h4>
                          <p className="text-sm text-neutral-700 dark:text-neutral-300">Get comprehensive word meanings with pronunciation, part of speech, and usage examples</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                      <div className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-purple-600 mt-0.5" />
                        <div>
                          <h4 className="font-bold text-neutral-900 dark:text-white mb-1">Synonyms & Examples</h4>
                          <p className="text-sm text-neutral-700 dark:text-neutral-300">Discover synonyms and see words used in context with real examples</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                      <div className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-green-600 mt-0.5" />
                        <div>
                          <h4 className="font-bold text-neutral-900 dark:text-white mb-1">Multi-Language Translation</h4>
                          <p className="text-sm text-neutral-700 dark:text-neutral-300">Translate words between any supported language pairs</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                      <div className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-amber-600 mt-0.5" />
                        <div>
                          <h4 className="font-bold text-neutral-900 dark:text-white mb-1">Pronunciation</h4>
                          <p className="text-sm text-neutral-700 dark:text-neutral-300">Listen to word pronunciation with text-to-speech</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 bg-pink-50 dark:bg-pink-900/20 rounded-lg border border-pink-200 dark:border-pink-800">
                      <div className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-pink-600 mt-0.5" />
                        <div>
                          <h4 className="font-bold text-neutral-900 dark:text-white mb-1">Recent Searches</h4>
                          <p className="text-sm text-neutral-700 dark:text-neutral-300">Quick access to your last 6 searched words</p>
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
                      <p className="text-sm text-neutral-700 dark:text-neutral-300">Choose your source language (the language of the word you're searching) and target language (the language you want translation in).</p>
                    </div>
                    <div className="p-4 bg-neutral-50 dark:bg-neutral-700/50 rounded-lg">
                      <h4 className="font-bold text-neutral-900 dark:text-white mb-2">2. Enter Word</h4>
                      <p className="text-sm text-neutral-700 dark:text-neutral-300">Type the word you want to look up in the search box. Press Enter or click the Search button.</p>
                    </div>
                    <div className="p-4 bg-neutral-50 dark:bg-neutral-700/50 rounded-lg">
                      <h4 className="font-bold text-neutral-900 dark:text-white mb-2">3. View Results</h4>
                      <p className="text-sm text-neutral-700 dark:text-neutral-300">Get detailed information including pronunciation, definition, examples, synonyms, and translation in your target language.</p>
                    </div>
                    <div className="p-4 bg-neutral-50 dark:bg-neutral-700/50 rounded-lg">
                      <h4 className="font-bold text-neutral-900 dark:text-white mb-2">4. Listen to Pronunciation</h4>
                      <p className="text-sm text-neutral-700 dark:text-neutral-300">Click the speaker icon next to the word to hear how it's pronounced.</p>
                    </div>
                    <div className="p-4 bg-neutral-50 dark:bg-neutral-700/50 rounded-lg">
                      <h4 className="font-bold text-neutral-900 dark:text-white mb-2">5. Use Recent Searches</h4>
                      <p className="text-sm text-neutral-700 dark:text-neutral-300">Click on any recent search chip to quickly look up that word again.</p>
                    </div>
                  </div>
                </section>
                <section className="bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-900/20 dark:to-gray-900/20 p-6 rounded-lg border border-slate-200 dark:border-slate-800">
                  <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-4">💎 Pro Tips</h3>
                  <ul className="space-y-2 text-neutral-700 dark:text-neutral-300">
                    <li className="flex items-start gap-2">
                      <span className="text-slate-600 mt-1">✓</span>
                      <span><strong>English Source:</strong> For best results with full definitions, examples, and synonyms, use English as source language.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-slate-600 mt-1">✓</span>
                      <span><strong>Other Languages:</strong> Non-English source languages will provide translations to target language.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-slate-600 mt-1">✓</span>
                      <span><strong>Keyboard Shortcut:</strong> Press Enter after typing to search instantly.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-slate-600 mt-1">✓</span>
                      <span><strong>Recent Searches:</strong> Your last 6 searches are saved for quick access.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-slate-600 mt-1">✓</span>
                      <span><strong>API Info:</strong> Uses Free Dictionary API for English definitions and MyMemory API for translations.</span>
                    </li>
                  </ul>
                </section>
              </div>
              <div className="sticky bottom-0 bg-white dark:bg-neutral-800 border-t border-neutral-200 dark:border-neutral-700 p-6">
                <Button onClick={() => setShowDocumentation(false)} className="w-full bg-gradient-to-r from-slate-500 to-gray-600 text-white hover:opacity-90">Got It!</Button>
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
