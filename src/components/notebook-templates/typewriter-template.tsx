"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Type, Globe, Download, Copy, Trash2, Save, Languages,
  ChevronDown, Keyboard, Volume2, FileText, Sparkles, ToggleLeft, ToggleRight
} from "lucide-react";
import { transliterate, supportsTransliteration } from "@/lib/transliteration";

// ─── Types ───────────────────────────────────────────────────────────────────

interface TypewriterDocument {
  id: string;
  title: string;
  content: string;
  language: string;
  createdAt: string;
  updatedAt: string;
}

interface TypewriterTemplateProps {
  title?: string;
  notebookId?: string;
}

interface LanguageConfig {
  code: string;
  name: string;
  nativeName: string;
  script: string;
  specialChars?: string[];
  transliterationMap?: Record<string, string>;
}

// ─── Language Configurations ─────────────────────────────────────────────────

const LANGUAGES: LanguageConfig[] = [
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    script: 'Latin',
  },
  {
    code: 'hi',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    script: 'Devanagari',
    specialChars: ['अ', 'आ', 'इ', 'ई', 'उ', 'ऊ', 'ए', 'ऐ', 'ओ', 'औ', 'क', 'ख', 'ग', 'घ', 'च', 'छ', 'ज', 'झ', 'ट', 'ठ', 'ड', 'ढ', 'ण', 'त', 'थ', 'द', 'ध', 'न', 'प', 'फ', 'ब', 'भ', 'म', 'य', 'र', 'ल', 'व', 'श', 'ष', 'स', 'ह', 'ं', 'ः', 'ँ'],
  },
  {
    code: 'ta',
    name: 'Tamil',
    nativeName: 'தமிழ்',
    script: 'Tamil',
    specialChars: ['அ', 'ஆ', 'இ', 'ஈ', 'உ', 'ஊ', 'எ', 'ஏ', 'ஐ', 'ஒ', 'ஓ', 'ஔ', 'க', 'ங', 'ச', 'ஞ', 'ட', 'ண', 'த', 'ந', 'ப', 'ம', 'ய', 'ர', 'ல', 'வ', 'ழ', 'ள', 'ற', 'ன'],
  },
  {
    code: 'ml',
    name: 'Malayalam',
    nativeName: 'മലയാളം',
    script: 'Malayalam',
    specialChars: ['അ', 'ആ', 'ഇ', 'ഈ', 'உ', 'ഊ', 'ഋ', 'എ', 'ഏ', 'ഐ', 'ഒ', 'ഓ', 'ഔ', 'ക', 'ഖ', 'ഗ', 'ഘ', 'ങ', 'ച', 'ഛ', 'ജ', 'ഝ', 'ഞ', 'ട', 'ഠ', 'ഡ', 'ഢ', 'ണ', 'ത', 'ഥ', 'ദ', 'ധ', 'ന', 'പ', 'ഫ', 'ബ', 'ഭ', 'മ', 'യ', 'ര', 'ല', 'വ', 'ശ', 'ഷ', 'സ', 'ഹ', 'ള', 'ഴ', 'റ'],
  },
  {
    code: 'te',
    name: 'Telugu',
    nativeName: 'తెలుగు',
    script: 'Telugu',
    specialChars: ['అ', 'ఆ', 'ఇ', 'ఈ', 'ఉ', 'ఊ', 'ఋ', 'ఎ', 'ఏ', 'ఐ', 'ఒ', 'ఓ', 'ఔ', 'క', 'ఖ', 'గ', 'ఘ', 'ఙ', 'చ', 'ఛ', 'జ', 'ఝ', 'ఞ', 'ట', 'ఠ', 'డ', 'ఢ', 'ణ', 'త', 'థ', 'ద', 'ధ', 'న', 'ప', 'ఫ', 'బ', 'భ', 'మ', 'య', 'ర', 'ల', 'వ', 'శ', 'ష', 'స', 'హ', 'ళ'],
  },
  {
    code: 'kn',
    name: 'Kannada',
    nativeName: 'ಕನ್ನಡ',
    script: 'Kannada',
    specialChars: ['ಅ', 'ಆ', 'ಇ', 'ಈ', 'ಉ', 'ಊ', 'ಋ', 'ಎ', 'ಏ', 'ಐ', 'ಒ', 'ಓ', 'ಔ', 'ಕ', 'ಖ', 'ಗ', 'ಘ', 'ಙ', 'ಚ', 'ಛ', 'ಜ', 'ಝ', 'ಞ', 'ಟ', 'ಠ', 'ಡ', 'ಢ', 'ಣ', 'ತ', 'ಥ', 'ದ', 'ಧ', 'ನ', 'ಪ', 'ಫ', 'ಬ', 'ಭ', 'ಮ', 'ಯ', 'ರ', 'ಲ', 'ವ', 'ಶ', 'ಷ', 'ಸ', 'ಹ', 'ಳ'],
  },
  {
    code: 'bn',
    name: 'Bengali',
    nativeName: 'বাংলা',
    script: 'Bengali',
    specialChars: ['অ', 'আ', 'ই', 'ঈ', 'উ', 'ঊ', 'ঋ', 'এ', 'ঐ', 'ও', 'ঔ', 'ক', 'খ', 'গ', 'ঘ', 'ঙ', 'চ', 'ছ', 'জ', 'ঝ', 'ঞ', 'ট', 'ঠ', 'ড', 'ঢ', 'ণ', 'ত', 'থ', 'দ', 'ধ', 'ন', 'প', 'ফ', 'ব', 'ভ', 'ম', 'য', 'র', 'ল', 'শ', 'ষ', 'স', 'হ'],
  },
  {
    code: 'mr',
    name: 'Marathi',
    nativeName: 'मराठी',
    script: 'Devanagari',
    specialChars: ['अ', 'आ', 'इ', 'ई', 'उ', 'ऊ', 'ए', 'ऐ', 'ओ', 'औ', 'क', 'ख', 'ग', 'घ', 'च', 'छ', 'ज', 'झ', 'ट', 'ठ', 'ड', 'ढ', 'ण', 'त', 'थ', 'द', 'ध', 'न', 'प', 'फ', 'ब', 'भ', 'म', 'य', 'र', 'ल', 'व', 'श', 'ष', 'स', 'ह', 'ळ'],
  },
  {
    code: 'gu',
    name: 'Gujarati',
    nativeName: 'ગુજરાતી',
    script: 'Gujarati',
    specialChars: ['અ', 'આ', 'ઇ', 'ઈ', 'ઉ', 'ઊ', 'એ', 'ઐ', 'ઓ', 'ઔ', 'ક', 'ખ', 'ગ', 'ઘ', 'ચ', 'છ', 'જ', 'ઝ', 'ટ', 'ઠ', 'ડ', 'ઢ', 'ણ', 'ત', 'થ', 'દ', 'ધ', 'ન', 'પ', 'ફ', 'બ', 'ભ', 'મ', 'ય', 'ર', 'લ', 'વ', 'શ', 'ષ', 'સ', 'હ', 'ળ'],
  },
  {
    code: 'pa',
    name: 'Punjabi',
    nativeName: 'ਪੰਜਾਬੀ',
    script: 'Gurmukhi',
    specialChars: ['ਅ', 'ਆ', 'ਇ', 'ਈ', 'ਉ', 'ਊ', 'ਏ', 'ਐ', 'ਓ', 'ਔ', 'ਕ', 'ਖ', 'ਗ', 'ਘ', 'ਙ', 'ਚ', 'ਛ', 'ਜ', 'ਝ', 'ਞ', 'ਟ', 'ਠ', 'ਡ', 'ਢ', 'ਣ', 'ਤ', 'ਥ', 'ਦ', 'ਧ', 'ਨ', 'ਪ', 'ਫ', 'ਬ', 'ਭ', 'ਮ', 'ਯ', 'ਰ', 'ਲ', 'ਵ', 'ਸ', 'ਹ', 'ਲ਼'],
  },
  {
    code: 'ur',
    name: 'Urdu',
    nativeName: 'اردو',
    script: 'Arabic',
    specialChars: ['ا', 'ب', 'پ', 'ت', 'ٹ', 'ث', 'ج', 'چ', 'ح', 'خ', 'د', 'ڈ', 'ذ', 'ر', 'ڑ', 'ز', 'ژ', 'س', 'ش', 'ص', 'ض', 'ط', 'ظ', 'ع', 'غ', 'ف', 'ق', 'ک', 'گ', 'ل', 'م', 'ن', 'ں', 'و', 'ہ', 'ھ', 'ء', 'ی', 'ے'],
  },
  {
    code: 'ar',
    name: 'Arabic',
    nativeName: 'العربية',
    script: 'Arabic',
    specialChars: ['ا', 'ب', 'ت', 'ث', 'ج', 'ح', 'خ', 'د', 'ذ', 'ر', 'ز', 'س', 'ش', 'ص', 'ض', 'ط', 'ظ', 'ع', 'غ', 'ف', 'ق', 'ك', 'ل', 'م', 'ن', 'ه', 'و', 'ي', 'ء', 'آ', 'أ', 'ؤ', 'إ', 'ئ', 'ة', 'ى'],
  },
  {
    code: 'zh',
    name: 'Chinese',
    nativeName: '中文',
    script: 'Chinese',
  },
  {
    code: 'ja',
    name: 'Japanese',
    nativeName: '日本語',
    script: 'Japanese',
  },
  {
    code: 'ko',
    name: 'Korean',
    nativeName: '한국어',
    script: 'Hangul',
  },
  {
    code: 'ru',
    name: 'Russian',
    nativeName: 'Русский',
    script: 'Cyrillic',
    specialChars: ['А', 'Б', 'В', 'Г', 'Д', 'Е', 'Ё', 'Ж', 'З', 'И', 'Й', 'К', 'Л', 'М', 'Н', 'О', 'П', 'Р', 'С', 'Т', 'У', 'Ф', 'Х', 'Ц', 'Ч', 'Ш', 'Щ', 'Ъ', 'Ы', 'Ь', 'Э', 'Ю', 'Я'],
  },
];

// ─── Component ───────────────────────────────────────────────────────────────

export function TypewriterTemplate({ title = "TypeWriter", notebookId }: TypewriterTemplateProps) {
  const [documents, setDocuments] = useState<TypewriterDocument[]>([]);
  const [activeDocId, setActiveDocId] = useState<string | null>(null);
  const [content, setContent] = useState('');
  const [docTitle, setDocTitle] = useState('Untitled Document');
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageConfig>(LANGUAGES[0]);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [showSpecialChars, setShowSpecialChars] = useState(false);
  const [fontSize, setFontSize] = useState(16);
  const [saving, setSaving] = useState(false);
  const [transliterationEnabled, setTransliterationEnabled] = useState(true);
  const [inputBuffer, setInputBuffer] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const activeDoc = documents.find(d => d.id === activeDocId);
  const canTransliterate = supportsTransliteration(selectedLanguage.code);

  // ─── Persistence ─────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!notebookId) return;
    try {
      const saved = localStorage.getItem(`typewriter-${notebookId}`);
      if (saved) {
        const data = JSON.parse(saved);
        setDocuments(data.documents || []);
        setActiveDocId(data.activeDocId || null);
      }
    } catch (error) {
      console.error('Failed to load typewriter data:', error);
    }
  }, [notebookId]);

  useEffect(() => {
    if (activeDoc) {
      setContent(activeDoc.content);
      setDocTitle(activeDoc.title);
      const lang = LANGUAGES.find(l => l.code === activeDoc.language);
      if (lang) setSelectedLanguage(lang);
    }
  }, [activeDocId, activeDoc]);

  const saveData = useCallback(() => {
    if (!notebookId) return;
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    
    saveTimeoutRef.current = setTimeout(() => {
      setSaving(true);
      try {
        localStorage.setItem(`typewriter-${notebookId}`, JSON.stringify({
          documents,
          activeDocId
        }));
      } catch (error) {
        console.error('Failed to save typewriter data:', error);
      }
      setTimeout(() => setSaving(false), 500);
    }, 1000);
  }, [notebookId, documents, activeDocId]);

  useEffect(() => {
    saveData();
  }, [documents, activeDocId, saveData]);

  // ─── Document Management ─────────────────────────────────────────────────────

  const createDocument = () => {
    const newDoc: TypewriterDocument = {
      id: Date.now().toString(),
      title: 'Untitled Document',
      content: '',
      language: selectedLanguage.code,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setDocuments(prev => [...prev, newDoc]);
    setActiveDocId(newDoc.id);
    setContent('');
    setDocTitle('Untitled Document');
  };

  const updateDocument = () => {
    if (!activeDocId) return;
    setDocuments(prev => prev.map(doc => 
      doc.id === activeDocId 
        ? { ...doc, title: docTitle, content, language: selectedLanguage.code, updatedAt: new Date().toISOString() }
        : doc
    ));
  };

  useEffect(() => {
    if (activeDocId && content !== activeDoc?.content) {
      updateDocument();
    }
  }, [content, docTitle, selectedLanguage]);

  const deleteDocument = (id: string) => {
    if (confirm('Are you sure you want to delete this document?')) {
      setDocuments(prev => prev.filter(d => d.id !== id));
      if (activeDocId === id) {
        setActiveDocId(null);
        setContent('');
        setDocTitle('Untitled Document');
      }
    }
  };

  // ─── Transliteration Handler ─────────────────────────────────────────────────

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    
    // If transliteration is disabled or language doesn't support it, just update content
    if (!transliterationEnabled || !canTransliterate) {
      setContent(newValue);
      return;
    }

    // Get the difference between old and new content
    const cursorPos = e.target.selectionStart;
    const diff = newValue.length - content.length;
    
    // If user is typing (adding characters)
    if (diff > 0) {
      const addedText = newValue.substring(cursorPos - diff, cursorPos);
      
      // Check if user pressed space or punctuation (trigger transliteration)
      if (/[\s.,!?;:]/.test(addedText)) {
        // Get the word before the space/punctuation
        const beforeCursor = newValue.substring(0, cursorPos - diff);
        const lastSpaceIndex = Math.max(
          beforeCursor.lastIndexOf(' '),
          beforeCursor.lastIndexOf('\n'),
          0
        );
        const wordToTransliterate = beforeCursor.substring(lastSpaceIndex).trim();
        
        if (wordToTransliterate) {
          const transliterated = transliterate(wordToTransliterate, selectedLanguage.code);
          const beforeWord = newValue.substring(0, lastSpaceIndex + (lastSpaceIndex > 0 ? 1 : 0));
          const afterWord = newValue.substring(cursorPos);
          const newContent = beforeWord + transliterated + addedText + afterWord;
          
          setContent(newContent);
          
          // Adjust cursor position
          setTimeout(() => {
            if (textareaRef.current) {
              const newCursorPos = beforeWord.length + transliterated.length + addedText.length;
              textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
            }
          }, 0);
          return;
        }
      }
    }
    
    setContent(newValue);
  };

  // ─── Special Character Insertion ─────────────────────────────────────────────

  const insertCharacter = (char: string) => {
    if (!textareaRef.current) return;
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    const newContent = content.substring(0, start) + char + content.substring(end);
    setContent(newContent);
    
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(start + char.length, start + char.length);
      }
    }, 0);
  };

  // ─── Export Functions ────────────────────────────────────────────────────────

  const exportAsText = () => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${docTitle}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(content);
    alert('Content copied to clipboard!');
  };

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-950 dark:to-neutral-900">
      {/* Header */}
      <div className="bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
                <Type className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">{title}</h1>
                <p className="text-sm text-neutral-500">Multi-language text editor</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {saving && (
                <span className="text-xs text-neutral-500 flex items-center gap-1">
                  <Save className="w-3 h-3 animate-pulse" />
                  Saving...
                </span>
              )}
              <button
                onClick={createDocument}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium hover:opacity-90"
              >
                New Document
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Document List */}
        <div className="w-64 bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 overflow-y-auto">
          <div className="p-4">
            <h3 className="text-sm font-semibold text-neutral-500 mb-3">Documents</h3>
            <div className="space-y-2">
              {documents.map(doc => (
                <div
                  key={doc.id}
                  onClick={() => setActiveDocId(doc.id)}
                  className={`p-3 rounded-lg cursor-pointer transition-all ${
                    activeDocId === doc.id
                      ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                      : 'hover:bg-neutral-50 dark:hover:bg-neutral-800'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-neutral-900 dark:text-white truncate">
                        {doc.title}
                      </p>
                      <p className="text-xs text-neutral-500 mt-1">
                        {LANGUAGES.find(l => l.code === doc.language)?.nativeName}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteDocument(doc.id);
                      }}
                      className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                    >
                      <Trash2 className="w-3 h-3 text-red-500" />
                    </button>
                  </div>
                </div>
              ))}
              {documents.length === 0 && (
                <div className="text-center py-8 text-neutral-400">
                  <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No documents yet</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Editor */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {activeDocId ? (
            <>
              {/* Toolbar */}
              <div className="bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 px-6 py-3">
                <div className="flex items-center justify-between gap-4">
                  <input
                    type="text"
                    value={docTitle}
                    onChange={(e) => setDocTitle(e.target.value)}
                    className="text-lg font-semibold bg-transparent outline-none text-neutral-900 dark:text-white flex-1"
                    placeholder="Document title..."
                  />
                  
                  <div className="flex items-center gap-2">
                    {/* Language Selector */}
                    <div className="relative">
                      <button
                        onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                        className="flex items-center gap-2 px-4 py-2 bg-neutral-100 dark:bg-neutral-800 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700"
                      >
                        <Globe className="w-4 h-4" />
                        <span className="text-sm font-medium">{selectedLanguage.nativeName}</span>
                        <ChevronDown className="w-4 h-4" />
                      </button>
                      
                      {showLanguageMenu && (
                        <div className="absolute top-full right-0 mt-2 w-64 bg-white dark:bg-neutral-800 rounded-xl shadow-xl border border-neutral-200 dark:border-neutral-700 max-h-96 overflow-y-auto z-50">
                          {LANGUAGES.map(lang => (
                            <button
                              key={lang.code}
                              onClick={() => {
                                setSelectedLanguage(lang);
                                setShowLanguageMenu(false);
                              }}
                              className={`w-full px-4 py-3 text-left hover:bg-neutral-50 dark:hover:bg-neutral-700 ${
                                selectedLanguage.code === lang.code ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                              }`}
                            >
                              <div className="font-medium text-sm">{lang.nativeName}</div>
                              <div className="text-xs text-neutral-500">{lang.name} • {lang.script}</div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Transliteration Toggle */}
                    {canTransliterate && (
                      <button
                        onClick={() => setTransliterationEnabled(!transliterationEnabled)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                          transliterationEnabled
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                            : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600'
                        }`}
                        title={transliterationEnabled ? 'Transliteration ON' : 'Transliteration OFF'}
                      >
                        {transliterationEnabled ? (
                          <ToggleRight className="w-4 h-4" />
                        ) : (
                          <ToggleLeft className="w-4 h-4" />
                        )}
                        <span className="text-xs font-medium">A→अ</span>
                      </button>
                    )}

                    {/* Font Size */}
                    <div className="flex items-center gap-2 px-3 py-2 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
                      <Type className="w-4 h-4" />
                      <input
                        type="range"
                        min="12"
                        max="32"
                        value={fontSize}
                        onChange={(e) => setFontSize(Number(e.target.value))}
                        className="w-20"
                      />
                      <span className="text-xs font-medium w-8">{fontSize}px</span>
                    </div>

                    {/* Special Characters */}
                    {selectedLanguage.specialChars && (
                      <button
                        onClick={() => setShowSpecialChars(!showSpecialChars)}
                        className="p-2 bg-neutral-100 dark:bg-neutral-800 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700"
                        title="Special Characters"
                      >
                        <Keyboard className="w-4 h-4" />
                      </button>
                    )}

                    {/* Export */}
                    <button
                      onClick={exportAsText}
                      className="p-2 bg-neutral-100 dark:bg-neutral-800 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700"
                      title="Download as Text"
                    >
                      <Download className="w-4 h-4" />
                    </button>

                    {/* Copy */}
                    <button
                      onClick={copyToClipboard}
                      className="p-2 bg-neutral-100 dark:bg-neutral-800 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700"
                      title="Copy to Clipboard"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Special Characters Palette */}
                {showSpecialChars && selectedLanguage.specialChars && (
                  <div className="mt-3 p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-neutral-500">Special Characters</span>
                      <button
                        onClick={() => setShowSpecialChars(false)}
                        className="text-xs text-neutral-500 hover:text-neutral-700"
                      >
                        Close
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto">
                      {selectedLanguage.specialChars.map((char, idx) => (
                        <button
                          key={idx}
                          onClick={() => insertCharacter(char)}
                          className="px-3 py-2 bg-white dark:bg-neutral-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded text-lg border border-neutral-200 dark:border-neutral-600"
                        >
                          {char}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Text Editor */}
              <div className="flex-1 overflow-hidden p-6">
                <textarea
                  ref={textareaRef}
                  value={content}
                  onChange={handleTextChange}
                  placeholder={`Start typing in ${selectedLanguage.nativeName}...${canTransliterate && transliterationEnabled ? ' (Type in English, press Space to convert)' : ''}`}
                  className="w-full h-full p-6 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 outline-none resize-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600"
                  style={{
                    fontSize: `${fontSize}px`,
                    lineHeight: '1.8',
                    direction: selectedLanguage.script === 'Arabic' ? 'rtl' : 'ltr'
                  }}
                />
              </div>

              {/* Footer Stats */}
              <div className="bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800 px-6 py-3">
                <div className="flex items-center justify-between text-xs text-neutral-500">
                  <div className="flex items-center gap-4">
                    <span>Characters: {content.length}</span>
                    <span>Words: {content.trim() ? content.trim().split(/\s+/).length : 0}</span>
                    <span>Lines: {content.split('\n').length}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Languages className="w-3 h-3" />
                    <span>{selectedLanguage.name}</span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-neutral-400">
              <div className="text-center">
                <Type className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg mb-2">No document selected</p>
                <p className="text-sm">Create a new document to start typing</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
