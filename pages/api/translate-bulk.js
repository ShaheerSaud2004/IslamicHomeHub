const translationService = require('../../lib/services/translation');
const { getDatabase } = require('../../lib/services/database');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { articleIds, targetLanguage = 'English' } = req.body;

    if (!articleIds || !Array.isArray(articleIds) || articleIds.length === 0) {
      return res.status(400).json({ error: 'Article IDs array is required' });
    }

    if (articleIds.length > 10) {
      return res.status(400).json({ error: 'Maximum 10 articles can be translated at once' });
    }

    console.log(`Bulk translating ${articleIds.length} articles to ${targetLanguage}`);

    const db = getDatabase();
    const translatedArticles = {};
    const errors = {};

    // Process articles in parallel with a limit
    const translationPromises = articleIds.map(async (articleId) => {
      try {
        // Get the article from database
        const article = await db.getArticleById(parseInt(articleId));

        if (!article) {
          errors[articleId] = 'Article not found';
          return;
        }

        // Translate the article
        const translatedArticle = await translationService.translateArticle(article, targetLanguage);

        translatedArticles[articleId] = {
          id: articleId,
          translatedTitle: translatedArticle.translatedTitle,
          translatedSummary: translatedArticle.translatedSummary,
          translatedContent: translatedArticle.translatedContent,
          originalLanguage: translatedArticle.originalLanguage,
          translatedLanguage: translatedArticle.translatedLanguage,
          isTranslated: translatedArticle.isTranslated,
          translationError: translatedArticle.translationError
        };

        console.log(`Successfully translated article ${articleId}`);

      } catch (error) {
        console.error(`Error translating article ${articleId}:`, error);
        errors[articleId] = error.message || 'Translation failed';
      }
    });

    // Wait for all translations to complete
    await Promise.all(translationPromises);

    const successCount = Object.keys(translatedArticles).length;
    const errorCount = Object.keys(errors).length;

    console.log(`Bulk translation completed: ${successCount} successful, ${errorCount} errors`);

    res.status(200).json({
      success: true,
      message: `Translated ${successCount} articles successfully`,
      targetLanguage,
      translatedArticles,
      errors,
      stats: {
        total: articleIds.length,
        successful: successCount,
        failed: errorCount
      }
    });

  } catch (error) {
    console.error('Bulk translation API error:', error);
    res.status(500).json({ 
      error: 'Failed to perform bulk translation',
      message: error.message 
    });
  }
} 