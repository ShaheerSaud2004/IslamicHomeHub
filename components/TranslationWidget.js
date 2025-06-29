import { useState } from 'react';
import Languages from 'lucide-react/dist/esm/icons/languages';
import Globe from 'lucide-react/dist/esm/icons/globe';
import Check from 'lucide-react/dist/esm/icons/check';
import Loader from 'lucide-react/dist/esm/icons/loader';

const TranslationWidget = ({ articleId, onTranslationComplete }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('English');

  const supportedLanguages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
    { code: 'ur', name: 'Urdu', flag: '🇵🇰' },
    { code: 'tr', name: 'Turkish', flag: '🇹🇷' },
    { code: 'fa', name: 'Persian', flag: '🇮🇷' },
    { code: 'id', name: 'Indonesian', flag: '🇮🇩' },
    { code: 'ms', name: 'Malay', flag: '🇲🇾' },
    { code: 'bn', name: 'Bengali', flag: '🇧🇩' },
    { code: 'fr', name: 'French', flag: '🇫🇷' },
    { code: 'es', name: 'Spanish', flag: '🇪🇸' },
    { code: 'de', name: 'German', flag: '🇩🇪' },
    { code: 'ru', name: 'Russian', flag: '🇷🇺' },
    { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
    { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
    { code: 'sw', name: 'Swahili', flag: '🇰🇪' }
  ];

  const handleTranslate = async (targetLanguage) => {
    if (currentLanguage === targetLanguage) return;

    setIsTranslating(true);
    setIsOpen(false);

    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          articleId,
          targetLanguage
        })
      });

      const data = await response.json();

      if (data.success) {
        setCurrentLanguage(targetLanguage);
        if (onTranslationComplete) {
          onTranslationComplete(data.article);
        }
      } else {
        console.error('Translation failed:', data.error);
      }
    } catch (error) {
      console.error('Error translating article:', error);
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isTranslating}
        className="flex items-center space-x-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isTranslating ? (
          <Loader className="h-4 w-4 animate-spin" />
        ) : (
          <Languages className="h-4 w-4" />
        )}
        <span className="text-sm font-medium">
          {isTranslating ? 'Translating...' : `Translate (${currentLanguage})`}
        </span>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-50 min-w-80">
          <div className="flex items-center space-x-2 mb-3">
            <Globe className="h-4 w-4 text-emerald-600" />
            <h3 className="font-medium text-gray-900">Select Language</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto">
            {supportedLanguages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleTranslate(lang.name)}
                className={`flex items-center space-x-3 p-2 rounded-lg text-left hover:bg-gray-50 transition-colors ${
                  currentLanguage === lang.name 
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                    : 'text-gray-700'
                }`}
              >
                <span className="text-lg">{lang.flag}</span>
                <span className="text-sm font-medium">{lang.name}</span>
                {currentLanguage === lang.name && (
                  <Check className="h-3 w-3 text-emerald-600 ml-auto" />
                )}
              </button>
            ))}
          </div>

          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-500">
              Translations are powered by AI and may not be perfect. Islamic terms are preserved in their original form.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TranslationWidget; 