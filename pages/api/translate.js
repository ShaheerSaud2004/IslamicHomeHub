const translationService = require('../../lib/services/translation');
const { getDatabase } = require('../../lib/services/database');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { articleId, targetLanguage = 'English' } = req.body;

    if (!articleId) {
      return res.status(400).json({ error: 'Article ID is required' });
    }

    // Get the article from database
    const db = getDatabase();
    const article = await db.getArticleById(parseInt(articleId));

    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    // Translate the article
    const translatedArticle = await translationService.translateArticle(article, targetLanguage);

    res.status(200).json({
      success: true,
      article: translatedArticle
    });

  } catch (error) {
    console.error('Translation API error:', error);
    res.status(500).json({ 
      error: 'Failed to translate article',
      message: error.message 
    });
  }
} 