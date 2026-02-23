// Transliteration mappings for Indian languages
// Based on phonetic romanization to native script conversion

export interface TransliterationMap {
  [key: string]: string;
}

// Malayalam transliteration map
const malayalamMap: TransliterationMap = {
  // Vowels
  'a': 'അ', 'aa': 'ആ', 'A': 'ആ',
  'i': 'ഇ', 'ii': 'ഈ', 'I': 'ഈ', 'ee': 'ഈ',
  'u': 'ഉ', 'uu': 'ഊ', 'U': 'ഊ', 'oo': 'ഊ',
  'e': 'എ', 'E': 'ഏ',
  'ai': 'ഐ',
  'o': 'ഒ', 'O': 'ഓ',
  'au': 'ഔ',
  
  // Consonants
  'ka': 'ക', 'kha': 'ഖ', 'ga': 'ഗ', 'gha': 'ഘ', 'nga': 'ങ',
  'cha': 'ച', 'chha': 'ഛ', 'ja': 'ജ', 'jha': 'ഝ', 'nja': 'ഞ',
  'Ta': 'ട', 'Tha': 'ഠ', 'Da': 'ഡ', 'Dha': 'ഢ', 'Na': 'ണ',
  'ta': 'ത', 'tha': 'ഥ', 'da': 'ദ', 'dha': 'ധ', 'na': 'ന',
  'pa': 'പ', 'pha': 'ഫ', 'ba': 'ബ', 'bha': 'ഭ', 'ma': 'മ',
  'ya': 'യ', 'ra': 'ര', 'la': 'ല', 'va': 'വ', 'wa': 'വ',
  'sha': 'ശ', 'Sha': 'ഷ', 'sa': 'സ', 'ha': 'ഹ',
  'La': 'ള', 'zha': 'ഴ', 'Ra': 'റ',
  
  // Common words
  'njan': 'ഞാൻ', 'njaan': 'ഞാൻ',
  'ente': 'എന്റെ',
  'aanu': 'ആണ്',
  'alla': 'അല്ല',
  'enthu': 'എന്ത്',
};

// Hindi/Devanagari transliteration map
const hindiMap: TransliterationMap = {
  // Vowels
  'a': 'अ', 'aa': 'आ', 'A': 'आ',
  'i': 'इ', 'ii': 'ई', 'I': 'ई', 'ee': 'ई',
  'u': 'उ', 'uu': 'ऊ', 'U': 'ऊ', 'oo': 'ऊ',
  'e': 'ए', 'ai': 'ऐ',
  'o': 'ओ', 'au': 'औ',
  
  // Consonants
  'ka': 'क', 'kha': 'ख', 'ga': 'ग', 'gha': 'घ', 'nga': 'ङ',
  'cha': 'च', 'chha': 'छ', 'ja': 'ज', 'jha': 'झ', 'nja': 'ञ',
  'Ta': 'ट', 'Tha': 'ठ', 'Da': 'ड', 'Dha': 'ढ', 'Na': 'ण',
  'ta': 'त', 'tha': 'थ', 'da': 'द', 'dha': 'ध', 'na': 'न',
  'pa': 'प', 'pha': 'फ', 'ba': 'ब', 'bha': 'भ', 'ma': 'म',
  'ya': 'य', 'ra': 'र', 'la': 'ल', 'va': 'व', 'wa': 'व',
  'sha': 'श', 'Sha': 'ष', 'sa': 'स', 'ha': 'ह',
  
  // Common words
  'main': 'मैं', 'mein': 'मैं',
  'hai': 'है',
  'hain': 'हैं',
  'nahin': 'नहीं',
  'kya': 'क्या',
};

// Tamil transliteration map
const tamilMap: TransliterationMap = {
  // Vowels
  'a': 'அ', 'aa': 'ஆ', 'A': 'ஆ',
  'i': 'இ', 'ii': 'ஈ', 'I': 'ஈ', 'ee': 'ஈ',
  'u': 'உ', 'uu': 'ஊ', 'U': 'ஊ', 'oo': 'ஊ',
  'e': 'எ', 'E': 'ஏ',
  'ai': 'ஐ',
  'o': 'ஒ', 'O': 'ஓ',
  'au': 'ஔ',
  
  // Consonants
  'ka': 'க', 'nga': 'ங',
  'cha': 'ச', 'ja': 'ஜ', 'nja': 'ஞ',
  'Ta': 'ட', 'Na': 'ண',
  'ta': 'த', 'na': 'ன',
  'pa': 'ப', 'ma': 'ம',
  'ya': 'ய', 'ra': 'ர', 'la': 'ல', 'va': 'வ',
  'zha': 'ழ', 'La': 'ள', 'Ra': 'ற',
  'sa': 'ஸ', 'ha': 'ஹ',
  
  // Common words
  'naan': 'நான்',
  'enna': 'என்ன',
};

// Telugu transliteration map
const teluguMap: TransliterationMap = {
  // Vowels
  'a': 'అ', 'aa': 'ఆ', 'A': 'ఆ',
  'i': 'ఇ', 'ii': 'ఈ', 'I': 'ఈ', 'ee': 'ఈ',
  'u': 'ఉ', 'uu': 'ఊ', 'U': 'ఊ', 'oo': 'ఊ',
  'e': 'ఎ', 'E': 'ఏ',
  'ai': 'ఐ',
  'o': 'ఒ', 'O': 'ఓ',
  'au': 'ఔ',
  
  // Consonants
  'ka': 'క', 'kha': 'ఖ', 'ga': 'గ', 'gha': 'ఘ', 'nga': 'ఙ',
  'cha': 'చ', 'chha': 'ఛ', 'ja': 'జ', 'jha': 'ఝ', 'nja': 'ఞ',
  'Ta': 'ట', 'Tha': 'ఠ', 'Da': 'డ', 'Dha': 'ఢ', 'Na': 'ణ',
  'ta': 'త', 'tha': 'థ', 'da': 'ద', 'dha': 'ధ', 'na': 'న',
  'pa': 'ప', 'pha': 'ఫ', 'ba': 'బ', 'bha': 'భ', 'ma': 'మ',
  'ya': 'య', 'ra': 'ర', 'la': 'ల', 'va': 'వ', 'wa': 'వ',
  'sha': 'శ', 'Sha': 'ష', 'sa': 'స', 'ha': 'హ',
  'La': 'ళ',
  
  // Common words
  'nenu': 'నేను',
};

// Kannada transliteration map
const kannadaMap: TransliterationMap = {
  // Vowels
  'a': 'ಅ', 'aa': 'ಆ', 'A': 'ಆ',
  'i': 'ಇ', 'ii': 'ಈ', 'I': 'ಈ', 'ee': 'ಈ',
  'u': 'ಉ', 'uu': 'ಊ', 'U': 'ಊ', 'oo': 'ಊ',
  'e': 'ಎ', 'E': 'ಏ',
  'ai': 'ಐ',
  'o': 'ಒ', 'O': 'ಓ',
  'au': 'ಔ',
  
  // Consonants
  'ka': 'ಕ', 'kha': 'ಖ', 'ga': 'ಗ', 'gha': 'ಘ', 'nga': 'ಙ',
  'cha': 'ಚ', 'chha': 'ಛ', 'ja': 'ಜ', 'jha': 'ಝ', 'nja': 'ಞ',
  'Ta': 'ಟ', 'Tha': 'ಠ', 'Da': 'ಡ', 'Dha': 'ಢ', 'Na': 'ಣ',
  'ta': 'ತ', 'tha': 'ಥ', 'da': 'ದ', 'dha': 'ಧ', 'na': 'ನ',
  'pa': 'ಪ', 'pha': 'ಫ', 'ba': 'ಬ', 'bha': 'ಭ', 'ma': 'ಮ',
  'ya': 'ಯ', 'ra': 'ರ', 'la': 'ಲ', 'va': 'ವ', 'wa': 'ವ',
  'sha': 'ಶ', 'Sha': 'ಷ', 'sa': 'ಸ', 'ha': 'ಹ',
  'La': 'ಳ',
  
  // Common words
  'naanu': 'ನಾನು',
};

// Bengali transliteration map
const bengaliMap: TransliterationMap = {
  // Vowels
  'a': 'অ', 'aa': 'আ', 'A': 'আ',
  'i': 'ই', 'ii': 'ঈ', 'I': 'ঈ', 'ee': 'ঈ',
  'u': 'উ', 'uu': 'ঊ', 'U': 'ঊ', 'oo': 'ঊ',
  'e': 'এ', 'ai': 'ঐ',
  'o': 'ও', 'au': 'ঔ',
  
  // Consonants
  'ka': 'ক', 'kha': 'খ', 'ga': 'গ', 'gha': 'ঘ', 'nga': 'ঙ',
  'cha': 'চ', 'chha': 'ছ', 'ja': 'জ', 'jha': 'ঝ', 'nja': 'ঞ',
  'Ta': 'ট', 'Tha': 'ঠ', 'Da': 'ড', 'Dha': 'ঢ', 'Na': 'ণ',
  'ta': 'ত', 'tha': 'থ', 'da': 'দ', 'dha': 'ধ', 'na': 'ন',
  'pa': 'প', 'pha': 'ফ', 'ba': 'ব', 'bha': 'ভ', 'ma': 'ম',
  'ya': 'য', 'ra': 'র', 'la': 'ল', 'va': 'ব', 'wa': 'ব',
  'sha': 'শ', 'Sha': 'ষ', 'sa': 'স', 'ha': 'হ',
  
  // Common words
  'ami': 'আমি',
};

// Language code to map mapping
const languageMaps: Record<string, TransliterationMap> = {
  'ml': malayalamMap,
  'hi': hindiMap,
  'mr': hindiMap, // Marathi uses Devanagari
  'ta': tamilMap,
  'te': teluguMap,
  'kn': kannadaMap,
  'bn': bengaliMap,
  'gu': hindiMap, // Gujarati similar to Devanagari
  'pa': hindiMap, // Punjabi (Gurmukhi) - simplified
};

/**
 * Transliterate romanized text to native script
 * @param text - The romanized text to transliterate
 * @param languageCode - The target language code (e.g., 'ml', 'hi', 'ta')
 * @returns Transliterated text in native script
 */
export function transliterate(text: string, languageCode: string): string {
  const map = languageMaps[languageCode];
  if (!map) return text;

  // Split text into words
  const words = text.split(/(\s+)/);
  
  return words.map(word => {
    if (/^\s+$/.test(word)) return word; // Preserve whitespace
    
    // Try to match the whole word first (for common words)
    const lowerWord = word.toLowerCase();
    if (map[lowerWord]) return map[lowerWord];
    
    // Otherwise, transliterate character by character
    let result = '';
    let i = 0;
    
    while (i < word.length) {
      let matched = false;
      
      // Try to match longest possible sequence (up to 4 characters)
      for (let len = Math.min(4, word.length - i); len > 0; len--) {
        const substr = word.substring(i, i + len);
        const lowerSubstr = substr.toLowerCase();
        
        if (map[lowerSubstr]) {
          result += map[lowerSubstr];
          i += len;
          matched = true;
          break;
        }
      }
      
      // If no match found, keep the original character
      if (!matched) {
        result += word[i];
        i++;
      }
    }
    
    return result;
  }).join('');
}

/**
 * Check if a language supports transliteration
 * @param languageCode - The language code to check
 * @returns True if transliteration is supported
 */
export function supportsTransliteration(languageCode: string): boolean {
  return languageCode in languageMaps;
}

/**
 * Get suggestions for partial input
 * @param input - The partial romanized input
 * @param languageCode - The target language code
 * @param maxSuggestions - Maximum number of suggestions to return
 * @returns Array of transliterated suggestions
 */
export function getSuggestions(
  input: string,
  languageCode: string,
  maxSuggestions: number = 5
): string[] {
  const map = languageMaps[languageCode];
  if (!map || !input) return [];

  const lowerInput = input.toLowerCase();
  const suggestions: string[] = [];

  // Find matching keys in the map
  for (const [key, value] of Object.entries(map)) {
    if (key.startsWith(lowerInput) && key !== lowerInput) {
      suggestions.push(value);
      if (suggestions.length >= maxSuggestions) break;
    }
  }

  return suggestions;
}
