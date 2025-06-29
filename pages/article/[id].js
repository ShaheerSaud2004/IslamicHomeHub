import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ArrowLeft, ExternalLink, Clock, Globe, Tag, User, Calendar, TrendingUp, Heart, Share2, BookOpen, Languages } from 'lucide-react';
import TranslationWidget from '../../components/TranslationWidget';
import { formatContent, formatTitle, formatSummary, isArabicText, calculateReadingTime } from '../../lib/utils/contentFormatter';

export default function ArticlePage() {
  const router = useRouter();
  const { id } = router.query;
  const [article, setArticle] = useState(null);
  const [translatedArticle, setTranslatedArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enhancing, setEnhancing] = useState(false);
  const [aiInsights, setAiInsights] = useState(null);
  const [autoTranslating, setAutoTranslating] = useState(false);

  // Use translated article if available, otherwise use original
  const displayArticle = translatedArticle || article;

  // Enhanced content formatting with fallback
  const getFormattedContent = (content) => {
    if (!content) return ['Article content is being processed...'];
    
    try {
      // Try to use the new content formatter with multiple safety checks
      let formatted;
      
      try {
        formatted = formatContent && typeof formatContent === 'function' ? formatContent(content) : null;
      } catch (formatterError) {
        console.warn('External formatter failed, using fallback:', formatterError);
        formatted = null;
      }
      
      // If external formatter failed, use simple fallback
      if (!formatted || typeof formatted !== 'string' || formatted.trim().length === 0) {
        // Simple fallback formatting
        formatted = content
          .replace(/\n{3,}/g, '\n\n') // Normalize line breaks
          .replace(/\s+/g, ' ') // Normalize spaces
          .trim();
      }
      
      // Final safety check
      if (!formatted || typeof formatted !== 'string') {
        return ['Article content could not be processed properly.'];
      }
      
      // Additional safety check before split
      const result = formatted.split('\n\n').filter(p => p && typeof p === 'string' && p.trim().length > 0);
      
      // Ensure we always return an array with at least one element
      if (!result || !Array.isArray(result) || result.length === 0) {
        // As a final fallback, just return the content as a single paragraph
        return [formatted];
      }
      
      return result;
    } catch (error) {
      console.error('Error formatting content:', error);
      // Ultimate fallback - just return the original content as a single paragraph
      return [content || 'Article content could not be displayed due to formatting issues.'];
    }
  };

  const getFormattedTitle = (title) => {
    try {
      if (!title) return 'Untitled Article';
      return (formatTitle && typeof formatTitle === 'function' ? formatTitle(title) : title) || 'Untitled Article';
    } catch (error) {
      console.error('Error formatting title:', error);
      return title || 'Untitled Article';
    }
  };

  const getFormattedSummary = (summary) => {
    try {
      if (!summary) return 'No summary available for this article.';
      return (formatSummary && typeof formatSummary === 'function' ? formatSummary(summary) : summary) || 'No summary available for this article.';
    } catch (error) {
      console.error('Error formatting summary:', error);
      return summary || 'No summary available for this article.';
    }
  };

  const isContentArabic = (content) => {
    try {
      if (!content) return false;
      return isArabicText && typeof isArabicText === 'function' ? isArabicText(content) : false;
    } catch (error) {
      console.error('Error checking Arabic content:', error);
      return false;
    }
  };

  const autoTranslateToEnglish = async () => {
    if (!article || autoTranslating || translatedArticle) return;
    
    // Check if the article has Arabic content
    const hasArabicTitle = isArabicText(article.title);
    const hasArabicSummary = isArabicText(article.summary);
    const hasArabicContent = isArabicText(article.content);
    
    if (hasArabicTitle || hasArabicSummary || hasArabicContent) {
      setAutoTranslating(true);
      try {
        const response = await fetch('/api/translate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            articleId: id,
            targetLanguage: 'English'
          })
        });

        const data = await response.json();

        if (data.success) {
          setTranslatedArticle(data.article);
        }
      } catch (error) {
        console.error('Auto-translation failed:', error);
      } finally {
        setAutoTranslating(false);
      }
    }
  };

  useEffect(() => {
    if (id) {
      fetchArticle();
    }
  }, [id]);

  useEffect(() => {
    if (article && isContentArabic(article.content) && !translatedArticle && !autoTranslating) {
      setAutoTranslating(true);
    }
  }, [article]);

  const fetchArticle = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/news/${id}`);
      const data = await response.json();

      if (data.success) {
        setArticle(data.data);
      } else {
        console.error('Error fetching article:', data.message);
      }
    } catch (error) {
      console.error('Error fetching article:', error);
    }
    setLoading(false);
  };

  const handleTranslationComplete = (translated) => {
    setTranslatedArticle(translated);
    setAutoTranslating(false);
  };

  const enhanceWithAI = async () => {
    setEnhancing(true);
    try {
      const response = await fetch(`/api/news/${id}?enhance=true`);
      const data = await response.json();

      if (data.success && data.data.aiInsights) {
        setAiInsights(data.data.aiInsights);
      }
    } catch (error) {
      console.error('Error enhancing article:', error);
    }
    setEnhancing(false);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Religious': 'bg-green-100 text-green-800 border-green-200',
      'Politics': 'bg-red-100 text-red-800 border-red-200',
      'Community': 'bg-blue-100 text-blue-800 border-blue-200',
      'Education': 'bg-purple-100 text-purple-800 border-purple-200',
      'Culture': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Economics': 'bg-indigo-100 text-indigo-800 border-indigo-200',
      'Health': 'bg-pink-100 text-pink-800 border-pink-200',
      'Technology': 'bg-gray-100 text-gray-800 border-gray-200',
      'World': 'bg-orange-100 text-orange-800 border-orange-200',
      'Sports': 'bg-teal-100 text-teal-800 border-teal-200'
    };
    return colors[category] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getSentimentColor = (sentiment) => {
    const colors = {
      'positive': 'text-green-600',
      'negative': 'text-red-600',
      'neutral': 'text-gray-600'
    };
    return colors[sentiment] || 'text-gray-600';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading article...</p>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Article Not Found</h1>
          <Link href="/" className="text-green-600 hover:text-green-700">
            ← Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const formattedContent = getFormattedContent(displayArticle.translatedContent || displayArticle.content);
  const contentIsArabic = isContentArabic(displayArticle.content);
  
  // Safe reading time calculation with error handling
  let actualReadingTime = 5; // Default fallback
  try {
    if (calculateReadingTime && typeof calculateReadingTime === 'function') {
      actualReadingTime = calculateReadingTime(displayArticle.translatedContent || displayArticle.content) || 5;
    }
  } catch (error) {
    console.error('Error calculating reading time:', error);
    // Fallback calculation: roughly 200 words per minute
    const content = displayArticle.translatedContent || displayArticle.content || '';
    const wordCount = content.split(/\s+/).filter(word => word.length > 0).length;
    actualReadingTime = Math.max(1, Math.ceil(wordCount / 200));
  }

  return (
    <>
      <Head>
        <title>{getFormattedTitle(displayArticle.translatedTitle || displayArticle.title)} - Muslim News Hub</title>
        <meta name="description" content={getFormattedSummary(displayArticle.translatedSummary || displayArticle.summary)} />
        <meta property="og:title" content={getFormattedTitle(displayArticle.translatedTitle || displayArticle.title)} />
        <meta property="og:description" content={getFormattedSummary(displayArticle.translatedSummary || displayArticle.summary)} />
        {displayArticle.imageUrl && <meta property="og:image" content={displayArticle.imageUrl} />}
        <meta property="og:type" content="article" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center text-green-600 hover:text-green-700 transition-colors">
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to Home
              </Link>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => window.share && window.share({ title: displayArticle.title, url: window.location.href })}
                  className="flex items-center text-gray-600 hover:text-gray-700 transition-colors"
                >
                  <Share2 className="h-5 w-5 mr-1" />
                  Share
                </button>
                <button
                  onClick={() => window.print()}
                  className="flex items-center text-gray-600 hover:text-gray-700 transition-colors"
                >
                  <BookOpen className="h-5 w-5 mr-1" />
                  Print
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Translation Widget */}
          <div className="mb-8">
            <TranslationWidget
              article={article}
              onTranslationComplete={handleTranslationComplete}
              autoTranslate={autoTranslating}
            />
            </div>

          {/* Main Article */}
          <article className="bg-white rounded-lg shadow-sm overflow-hidden">
            {displayArticle.imageUrl && (
              <div className="relative">
              <img 
                src={displayArticle.imageUrl} 
                  alt={getFormattedTitle(displayArticle.translatedTitle || displayArticle.title)}
                  className="w-full h-64 md:h-96 object-cover"
                onError={(e) => { e.target.style.display = 'none' }}
              />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                {translatedArticle && (
                  <div className="absolute top-4 right-4">
                    <div className="bg-emerald-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1">
                      <Languages className="w-4 h-4" />
                      <span>Translated</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="p-6 md:p-8">
              {/* Article Meta */}
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getCategoryColor(displayArticle.category)}`}>
                  {displayArticle.category}
                </span>
                {displayArticle.subcategory && (
                  <span className="px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-600 border border-gray-200">
                    {displayArticle.subcategory}
                  </span>
                )}
                {displayArticle.importance >= 7 && (
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 border border-red-200">
                    <TrendingUp className="h-3 w-3 inline mr-1" />
                    High Priority
                  </span>
                )}
                <span className={`text-sm font-medium ${getSentimentColor(displayArticle.sentiment)}`}>
                  {displayArticle.sentiment.charAt(0).toUpperCase() + displayArticle.sentiment.slice(1)} Sentiment
                </span>
              </div>

              {/* Title */}
              <h1 className={`text-3xl md:text-4xl font-bold text-gray-900 mb-6 leading-tight ${contentIsArabic ? 'text-right' : 'text-left'}`}>
                {getFormattedTitle(displayArticle.translatedTitle || displayArticle.title)}
              </h1>

              {/* Summary */}
              <div className="bg-green-50 border-l-4 border-green-400 p-6 mb-8 rounded-r-lg">
                <h3 className="text-lg font-semibold text-green-800 mb-3 flex items-center">
                  <BookOpen className="h-5 w-5 mr-2" />
                  Article Summary
                </h3>
                <p className={`text-green-700 text-lg leading-relaxed ${contentIsArabic ? 'text-right' : 'text-left'}`}>
                  {getFormattedSummary(displayArticle.translatedSummary || displayArticle.summary)}
                </p>
              </div>

              {/* Article Info */}
              <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600 mb-8 pb-6 border-b border-gray-200">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  {formatDate(displayArticle.publishedAt || displayArticle.published_at)}
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2" />
                  {actualReadingTime} min read
                </div>
                {displayArticle.author && (
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    {displayArticle.author}
                  </div>
                )}
                <div className="flex items-center">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  <span className="text-green-600 font-medium">
                    {displayArticle.source?.name || displayArticle.source_name}
                  </span>
                </div>
              </div>

              {/* Countries and Regions */}
              {((displayArticle.countries && displayArticle.countries.length > 0) || (displayArticle.regions && displayArticle.regions.length > 0)) && (
                <div className="flex flex-wrap gap-6 mb-8 p-4 bg-gray-50 rounded-lg">
                  {displayArticle.countries && displayArticle.countries.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">Countries</h4>
                      <div className="flex flex-wrap gap-2">
                        {(Array.isArray(displayArticle.countries) ? displayArticle.countries : JSON.parse(displayArticle.countries || '[]')).map(country => (
                          <span key={country} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-700 border border-blue-200">
                            <Globe className="h-3 w-3 mr-1" />
                            {country}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {displayArticle.regions && displayArticle.regions.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">Regions</h4>
                      <div className="flex flex-wrap gap-2">
                        {(Array.isArray(displayArticle.regions) ? displayArticle.regions : JSON.parse(displayArticle.regions || '[]')).map(region => (
                          <span key={region} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-700 border border-purple-200">
                            {region}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Content */}
              <div className="mb-8">
                <div className={`prose prose-lg max-w-none ${contentIsArabic ? 'prose-arabic' : ''}`}>
                  <div className={`text-gray-900 leading-relaxed space-y-4 ${contentIsArabic ? 'text-right' : 'text-left'}`}>
                    {formattedContent.map((paragraph, index) => (
                      <p key={index} className="text-lg leading-relaxed mb-4 text-justify">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>
              </div>

              {/* Translation Info */}
              {translatedArticle && (
                <div className="mb-8 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <h4 className="text-sm font-semibold text-emerald-800 mb-2 flex items-center">
                    <Languages className="h-4 w-4 mr-2" />
                    Translation Information
                  </h4>
                  <p className="text-sm text-emerald-700">
                    This article was automatically translated from {translatedArticle.originalLanguage || 'Arabic'} to English using AI technology.
                    The translation aims to preserve the original meaning while making the content accessible to English readers.
                  </p>
                </div>
              )}

              {/* Tags */}
              {displayArticle.tags && displayArticle.tags.length > 0 && (
                <div className="mb-8">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Related Topics</h4>
                  <div className="flex flex-wrap gap-2">
                    {(Array.isArray(displayArticle.tags) ? displayArticle.tags : JSON.parse(displayArticle.tags || '[]')).map(tag => (
                      <span key={tag} className="inline-flex items-center px-4 py-2 rounded-full text-sm bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200 transition-colors">
                        <Tag className="h-3 w-3 mr-2" />
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* AI Enhancement Button */}
              <div className="mb-8 text-center">
                <button
                  onClick={enhanceWithAI}
                  disabled={enhancing}
                  className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  {enhancing ? 'Generating AI Insights...' : 'Get AI Insights'}
                </button>
              </div>

              {/* Source Link */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6 mb-8 border border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-green-900 mb-1">Read Original Article</h4>
                    <p className="text-sm text-green-700">Visit the source for the complete story and additional context</p>
                  </div>
                  <a
                    href={displayArticle.url || displayArticle.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm hover:shadow-md"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Visit Source
                  </a>
                </div>
              </div>
            </div>
          </article>

          {/* AI Insights */}
          {aiInsights && (
            <div className="bg-white rounded-lg shadow-sm p-8 mt-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <TrendingUp className="h-6 w-6 text-blue-600 mr-2" />
                AI Insights & Analysis
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {aiInsights.keyPoints && aiInsights.keyPoints.length > 0 && (
                  <div className="bg-blue-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-blue-900 mb-4">Key Points</h3>
                    <ul className="space-y-3">
                      {aiInsights.keyPoints.map((point, index) => (
                        <li key={index} className="text-blue-800 flex items-start">
                          <span className="text-blue-600 mr-3 mt-1">•</span>
                          <span className="leading-relaxed">{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {aiInsights.relatedTopics && aiInsights.relatedTopics.length > 0 && (
                  <div className="bg-purple-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-purple-900 mb-4">Related Topics</h3>
                    <div className="flex flex-wrap gap-2">
                      {aiInsights.relatedTopics.map(topic => (
                        <span key={topic} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm border border-purple-200">
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {aiInsights.significance && (
                <div className="mt-8 bg-green-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-green-900 mb-4">Significance for Muslim Communities</h3>
                  <p className="text-green-800 leading-relaxed">{aiInsights.significance}</p>
                </div>
              )}

              {aiInsights.enhancedSummary && (
                <div className="mt-8 bg-amber-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-amber-900 mb-4">Enhanced Summary</h3>
                  <p className="text-amber-800 leading-relaxed">{aiInsights.enhancedSummary}</p>
                </div>
              )}
            </div>
          )}

          {/* Related Articles */}
          {article.relatedArticles && article.relatedArticles.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm p-8 mt-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <BookOpen className="h-6 w-6 text-green-600 mr-2" />
                Related Articles
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {article.relatedArticles.map(relatedArticle => (
                  <Link 
                    href={`/article/${relatedArticle._id}`}
                    key={relatedArticle._id}
                    className="block p-6 border border-gray-200 rounded-lg hover:border-green-300 hover:shadow-md transition-all duration-200 bg-gray-50 hover:bg-white"
                  >
                    <div className="flex items-start space-x-4">
                      {relatedArticle.imageUrl && (
                        <img 
                          src={relatedArticle.imageUrl} 
                          alt={getFormattedTitle(relatedArticle.title)}
                          className="w-20 h-20 object-cover rounded-lg"
                          onError={(e) => { e.target.style.display = 'none' }}
                        />
                      )}
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 leading-tight">
                          {getFormattedTitle(relatedArticle.title)}
                        </h3>
                        <p className="text-sm text-gray-600 line-clamp-2 mb-3 leading-relaxed">
                          {getFormattedSummary(relatedArticle.summary, 150)}
                        </p>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>{relatedArticle.source?.name || 'Muslim News Hub'}</span>
                          <span>{formatDate(relatedArticle.publishedAt)}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
} 