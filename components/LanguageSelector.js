import { useState, useEffect } from 'react';
import { Globe, ChevronDown, Check } from 'lucide-react';

const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸', nativeName: 'English' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸', nativeName: 'Español' },
  { code: 'fr', name: 'French', flag: '🇫🇷', nativeName: 'Français' },
  { code: 'de', name: 'German', flag: '🇩🇪', nativeName: 'Deutsch' },
  { code: 'it', name: 'Italian', flag: '🇮🇹', nativeName: 'Italiano' },
  { code: 'pt', name: 'Portuguese', flag: '🇵🇹', nativeName: 'Português' },
  { code: 'ar', name: 'Arabic', flag: '🇸🇦', nativeName: 'العربية' },
  { code: 'ur', name: 'Urdu', flag: '🇵🇰', nativeName: 'اردو' },
  { code: 'tr', name: 'Turkish', flag: '🇹🇷', nativeName: 'Türkçe' },
  { code: 'fa', name: 'Persian', flag: '🇮🇷', nativeName: 'فارسی' },
  { code: 'id', name: 'Indonesian', flag: '🇮🇩', nativeName: 'Bahasa Indonesia' },
  { code: 'ms', name: 'Malay', flag: '🇲🇾', nativeName: 'Bahasa Melayu' },
  { code: 'bn', name: 'Bengali', flag: '🇧🇩', nativeName: 'বাংলা' },
  { code: 'hi', name: 'Hindi', flag: '🇮🇳', nativeName: 'हिन्दी' },
  { code: 'ru', name: 'Russian', flag: '🇷🇺', nativeName: 'Русский' },
  { code: 'zh', name: 'Chinese', flag: '🇨🇳', nativeName: '中文' },
  { code: 'sw', name: 'Swahili', flag: '🇰🇪', nativeName: 'Kiswahili' },
  { code: 'ha', name: 'Hausa', flag: '🇳🇬', nativeName: 'Hausa' },
  { code: 'yo', name: 'Yoruba', flag: '🇳🇬', nativeName: 'Yorùbá' },
  { code: 'ig', name: 'Igbo', flag: '🇳🇬', nativeName: 'Igbo' }
];

export default function LanguageSelector({ selectedLanguage = 'en', onLanguageChange, className = '' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const currentLanguage = SUPPORTED_LANGUAGES.find(lang => lang.code === selectedLanguage) || SUPPORTED_LANGUAGES[0];

  const filteredLanguages = SUPPORTED_LANGUAGES.filter(lang =>
    lang.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lang.nativeName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleLanguageSelect = (languageCode) => {
    onLanguageChange(languageCode);
    setIsOpen(false);
    setSearchTerm('');
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.language-selector')) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative language-selector ${className}`}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
      >
        <Globe className="w-4 h-4 text-gray-600" />
        <span className="text-sm font-medium text-gray-700">
          {currentLanguage.flag} {currentLanguage.name}
        </span>
        <ChevronDown 
          className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`} 
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-hidden">
          {/* Search Input */}
          <div className="p-3 border-b border-gray-100">
            <input
              type="text"
              placeholder="Search languages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              autoFocus
            />
          </div>

          {/* Language List */}
          <div className="max-h-64 overflow-y-auto">
            {filteredLanguages.length > 0 ? (
              filteredLanguages.map((language) => (
                <button
                  key={language.code}
                  onClick={() => handleLanguageSelect(language.code)}
                  className={`w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition-colors duration-150 ${
                    language.code === selectedLanguage ? 'bg-emerald-50 text-emerald-600' : 'text-gray-700'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">{language.flag}</span>
                    <div className="flex flex-col">
                      <span className="font-medium">{language.name}</span>
                      <span className="text-xs text-gray-500">{language.nativeName}</span>
                    </div>
                  </div>
                  {language.code === selectedLanguage && (
                    <Check className="w-4 h-4 text-emerald-600" />
                  )}
                </button>
              ))
            ) : (
              <div className="px-4 py-8 text-center text-gray-500">
                <Globe className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No languages found</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
            <p className="text-xs text-gray-500 text-center">
              Translation powered by AI • {SUPPORTED_LANGUAGES.length} languages available
            </p>
          </div>
        </div>
      )}
    </div>
  );
} 