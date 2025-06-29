const { getDatabase } = require('../../../lib/services/database');
const { appInitializer } = require('../../../lib/services/app-initializer');

// Helper function to detect Arabic text - updated to be less aggressive
function containsArabic(text) {
  if (!text) return false;
  // Arabic Unicode range: U+0600 to U+06FF and U+0750 to U+077F
  const arabicRegex = /[\u0600-\u06FF\u0750-\u077F]/g;
  const arabicMatches = text.match(arabicRegex);
  
  // Only consider it Arabic if more than 30% of the content is Arabic characters
  if (!arabicMatches) return false;
  
  const arabicRatio = arabicMatches.length / text.length;
  return arabicRatio > 0.3;
}

// Helper function to check if content is primarily English
function isPrimarilyEnglish(text) {
  if (!text || typeof text !== 'string' || text.length < 50) return true; // Assume short text is English
  
  // Check for English words and patterns
  const englishWords = text.match(/\b[a-zA-Z]+\b/g);
  const totalWords = text.split(/\s+/).length;
  
  if (!englishWords || totalWords === 0) return false;
  
  const englishRatio = englishWords.length / totalWords;
  return englishRatio > 0.7; // More than 70% English words
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const db = getDatabase();

    // Auto-initialize database if needed (ensures website always has content)
    const appStatus = await appInitializer.isAppReady();
    if (!appStatus.ready || appStatus.articleCount < 5) {
      console.log('📊 Database needs content, auto-initializing...');
      await appInitializer.initialize();
    }

    const {
      page = 1,
      limit = 20,
      category,
      country,
      region,
      search,
      sortBy = 'published_at',
      sortOrder = 'desc',
      importance,
      sentiment,
      source,
      language = 'en' // Default to English only
    } = req.query;

    // Build filter object
    const filters = {};

    if (category) {
      filters.category = category;
    }

    if (country) {
      filters.country = country;
    }

    if (region) {
      filters.region = region;
    }

    if (importance) {
      filters.importance = parseInt(importance);
    }

    if (sentiment) {
      filters.sentiment = sentiment;
    }

    if (source) {
      filters.source = source;
    }

    if (search) {
      filters.search = search;
    }

    // Add language filter - only return English articles
    filters.language = language;

    // Add pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    filters.limit = limitNum;
    filters.offset = (pageNum - 1) * limitNum;
    filters.sortBy = sortBy;
    filters.sortOrder = sortOrder;

    // Execute queries
    const [articles, totalCount] = await Promise.all([
      db.getArticles(filters),
      db.countArticles(filters)
    ]);

    // Additional filtering to remove any Arabic content that might have slipped through
    const englishOnlyArticles = articles.filter(article => {
      // Use the improved English detection instead of just checking for Arabic
      const titleIsEnglish = isPrimarilyEnglish(article.title);
      const summaryIsEnglish = isPrimarilyEnglish(article.summary);
      
      // Keep articles that have primarily English title and summary
      return titleIsEnglish && summaryIsEnglish;
    });

    // Remove content for list view to reduce payload size
    const articlesWithoutContent = englishOnlyArticles.map(article => {
      const { content, ...articleWithoutContent } = article;
      return articleWithoutContent;
    });

    const totalPages = Math.ceil(englishOnlyArticles.length / limitNum);

    res.status(200).json({
      success: true,
      data: {
        articles: articlesWithoutContent,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalCount: englishOnlyArticles.length,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1
        }
      }
    });

  } catch (error) {
    console.error('Error fetching news:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching news articles',
      error: error.message
    });
  }
} 