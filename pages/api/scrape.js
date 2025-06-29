const { getDatabase } = require('../../lib/services/database');
const FirecrawlService = require('../../lib/services/firecrawl');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method POST required' });
  }

  try {
    const db = getDatabase();
    const firecrawlService = new FirecrawlService();
    
    // Start scraping process
    console.log('Starting manual scraping process...');
    const articles = await firecrawlService.scrapeAllSources();

    if (articles.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'Scraping completed but no new articles found',
        data: {
          totalScraped: 0,
          totalSaved: 0,
          articles: []
        }
      });
    }

    // Save articles to database
    let savedCount = 0;
    const savedArticles = [];

    for (const articleData of articles) {
      try {
        // Skip if article already exists
        const existingArticle = await db.getArticleByUrl(articleData.url);
        if (existingArticle) {
          console.log(`Article already exists: ${articleData.title}`);
          continue;
        }

        // Skip non-Islamic articles
        if (articleData.isIslamic === false) {
          console.log(`Skipping non-Islamic article: ${articleData.title}`);
          continue;
        }

        const savedArticle = await db.createArticle(articleData);
        
        savedArticles.push({
          id: savedArticle.id,
          title: savedArticle.title,
          category: savedArticle.category,
          source: savedArticle.source.name,
          url: savedArticle.url
        });
        
        savedCount++;
        console.log(`Saved article: ${savedArticle.title}`);

      } catch (error) {
        console.error(`Error saving article: ${articleData.title}`, error);
      }
    }

    res.status(200).json({
      success: true,
      message: `Scraping completed successfully. Saved ${savedCount} new articles.`,
      data: {
        totalScraped: articles.length,
        totalSaved: savedCount,
        articles: savedArticles
      }
    });

  } catch (error) {
    console.error('Error in scraping process:', error);
    res.status(500).json({
      success: false,
      message: 'Error during scraping process',
      error: error.message
    });
  }
}

// Set timeout to 5 minutes for this endpoint
export const config = {
  api: {
    responseLimit: false,
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
  maxDuration: 300, // 5 minutes
} 