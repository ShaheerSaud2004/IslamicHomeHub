import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Clock, Globe, Tag, Star, TrendingUp, MapPin, Languages } from 'lucide-react';
import LanguageSelector from './LanguageSelector';
import { formatTitle, formatSummary, calculateReadingTime } from '../lib/utils/contentFormatter';

export default function ArticleCarousel({ articles = [], autoSlide = true, slideInterval = 5000 }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [translatedArticles, setTranslatedArticles] = useState({});
  const [translatingArticles, setTranslatingArticles] = useState(new Set());
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [autoTranslateEnabled, setAutoTranslateEnabled] = useState(true);
  const carouselRef = useRef(null);

  // Enhanced content formatting functions
  const getFormattedTitle = (title) => {
    return formatTitle(title) || 'Loading...';
  };

  const getFormattedSummary = (summary) => {
    return formatSummary(summary, 200) || 'No summary available for this article.';
  };

  const getReadingTime = (content) => {
    return calculateReadingTime(content);
  };

  // Auto-slide functionality
  useEffect(() => {
    if (!autoSlide || articles.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % articles.length);
    }, slideInterval);

    return () => clearInterval(interval);
  }, [autoSlide, slideInterval, articles.length]);

  // Auto-translate articles when language changes
  useEffect(() => {
    if (autoTranslateEnabled && selectedLanguage !== 'en') {
      articles.forEach(article => {
        if (article && !translatedArticles[`${article.id}_${selectedLanguage}`]) {
          translateArticle(article, selectedLanguage);
        }
      });
    }
  }, [selectedLanguage, articles, autoTranslateEnabled]);

  // Detect if text is Arabic
  const isArabicText = (text) => {
    if (!text) return false;
    const arabicRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
    return arabicRegex.test(text);
  };

  // Translate an article
  const translateArticle = async (article, targetLanguage = 'English') => {
    if (!article || !article.id) return;

    const cacheKey = `${article.id}_${targetLanguage}`;
    
    // Skip if already translated or currently translating
    if (translatedArticles[cacheKey] || translatingArticles.has(cacheKey)) {
      return;
    }

    // Skip if already in target language
    if (article.language === targetLanguage) {
      return;
    }

    setTranslatingArticles(prev => new Set([...prev, cacheKey]));

    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          articleId: article.id,
          targetLanguage,
        }),
      });

      if (response.ok) {
        const translatedData = await response.json();
        setTranslatedArticles(prev => ({
          ...prev,
          [cacheKey]: translatedData
        }));
      } else {
        console.error('Translation failed:', response.statusText);
      }
    } catch (error) {
      console.error('Translation error:', error);
    } finally {
      setTranslatingArticles(prev => {
        const newSet = new Set(prev);
        newSet.delete(cacheKey);
        return newSet;
      });
    }
  };

  // Get display article (translated or original)
  const getDisplayArticle = (article) => {
    if (!article) return null;

    const cacheKey = `${article.id}_${selectedLanguage}`;
    const translated = translatedArticles[cacheKey];
    
    if (translated && translated.isTranslated) {
      return {
        ...article,
        title: translated.translatedTitle || article.title,
        summary: translated.translatedSummary || article.summary,
        content: translated.translatedContent || article.content,
        isTranslated: true,
        originalLanguage: translated.originalLanguage,
        translatedLanguage: translated.translatedLanguage
      };
    }

    return article;
  };

  // Navigation handlers
  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % articles.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + articles.length) % articles.length);
  };

  // Handle language change
  const handleLanguageChange = (languageCode) => {
    setSelectedLanguage(languageCode);
  };

  if (!articles || articles.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-8 text-center border border-gray-100">
        <TrendingUp className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-600 mb-2">No Featured Articles</h3>
        <p className="text-gray-500">Check back later for the latest Islamic news stories.</p>
      </div>
    );
  }

  const currentArticle = getDisplayArticle(articles[currentSlide]);
  const isTranslating = translatingArticles.has(`${articles[currentSlide]?.id}_${selectedLanguage}`);

  return (
    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl shadow-lg overflow-hidden border border-emerald-100">
      {/* Header with Language Selector */}
      <div className="px-6 py-4 bg-white border-b border-emerald-100 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-emerald-100 rounded-lg">
            <Star className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">Featured Articles</h2>
            <p className="text-sm text-gray-600">Latest news from the Islamic world</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Auto-translate toggle */}
          <div className="flex items-center space-x-2">
            <Languages className="w-4 h-4 text-gray-500" />
            <label className="flex items-center space-x-2 text-sm">
              <input
                type="checkbox"
                checked={autoTranslateEnabled}
                onChange={(e) => setAutoTranslateEnabled(e.target.checked)}
                className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
              />
              <span className="text-gray-700">Auto-translate</span>
            </label>
          </div>

          {/* Language Selector */}
          <LanguageSelector
            selectedLanguage={selectedLanguage}
            onLanguageChange={handleLanguageChange}
          />
        </div>
      </div>

      {/* Carousel Content */}
      <div className="relative" ref={carouselRef}>
        {/* Article Display */}
        <div className="p-8">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            {/* Article Image */}
            <div className="relative">
              {currentArticle?.imageUrl ? (
                <div className="relative h-64 md:h-80 rounded-xl overflow-hidden shadow-lg">
                  <img
                    src={currentArticle.imageUrl}
                    alt={getFormattedTitle(currentArticle.title)}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                  
                  {/* Translation Status Badge */}
                  {(currentArticle?.isTranslated || isTranslating) && (
                    <div className="absolute top-4 right-4">
                      {isTranslating ? (
                        <div className="bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
                          <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Translating...</span>
                        </div>
                      ) : (
                        <div className="bg-emerald-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
                          <Globe className="w-3 h-3" />
                          <span>Translated</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-64 md:h-80 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-xl flex items-center justify-center">
                  <div className="text-center">
                    <Globe className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
                    <p className="text-emerald-600 font-medium">Islamic News</p>
                  </div>
                </div>
              )}
            </div>

            {/* Article Content */}
            <div className="space-y-4">
              {/* Category and Metadata */}
              <div className="flex items-center space-x-4 text-sm">
                {currentArticle?.category && (
                  <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full font-medium">
                    {currentArticle.category}
                  </span>
                )}
                {currentArticle?.publishedAt && (
                  <div className="flex items-center space-x-1 text-gray-500">
                    <Clock className="w-4 h-4" />
                    <span>{new Date(currentArticle.publishedAt).toLocaleDateString()}</span>
                  </div>
                )}
                {currentArticle?.source?.name && (
                  <div className="flex items-center space-x-1 text-gray-500">
                    <Tag className="w-4 h-4" />
                    <span>{currentArticle.source.name}</span>
                  </div>
                )}
              </div>

              {/* Title */}
              <h3 className="text-2xl md:text-3xl font-bold text-gray-800 leading-tight">
                {getFormattedTitle(currentArticle?.title)}
              </h3>

              {/* Summary */}
              {currentArticle?.summary && (
                <p className="text-gray-600 text-lg leading-relaxed line-clamp-3">
                  {getFormattedSummary(currentArticle.summary)}
                </p>
              )}

              {/* Translation Info */}
              {currentArticle?.isTranslated && (
                <div className="flex items-center space-x-2 text-sm text-emerald-600 bg-emerald-50 px-3 py-2 rounded-lg">
                  <Languages className="w-4 h-4" />
                  <span>
                    Translated from {currentArticle.originalLanguage} to {currentArticle.translatedLanguage}
                  </span>
                </div>
              )}

              {/* Read More Button */}
              <div className="pt-4">
                <Link href={`/article/${currentArticle?.id}`}>
                  <button className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-emerald-700 hover:to-teal-700 transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg">
                    Read Full Article
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Arrows */}
        {articles.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white text-gray-700 p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 z-10"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white text-gray-700 p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 z-10"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}
      </div>

      {/* Slide Indicators */}
      {articles.length > 1 && (
        <div className="px-6 py-4 bg-white border-t border-emerald-100">
          <div className="flex items-center justify-between">
            <div className="flex space-x-2">
              {articles.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-200 ${
                    index === currentSlide
                      ? 'bg-emerald-500 scale-125'
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>
            
            <div className="text-sm text-gray-500">
              {currentSlide + 1} of {articles.length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 