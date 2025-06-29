const { getDatabase } = require('../../../lib/services/database');
const { enhanceArticleWithAI } = require('../../../lib/services/ai-processor');

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const db = getDatabase();

    const { id } = req.query;
    const { enhance = false } = req.query;

    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({
        success: false,
        message: 'Invalid article ID'
      });
    }

    const article = await db.getArticleById(parseInt(id));

    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found'
      });
    }

    let response = {
      success: true,
      data: article
    };

    // Optionally enhance with AI insights
    if (enhance === 'true') {
      try {
        const aiEnhancement = await enhanceArticleWithAI(article);
        response.data.aiInsights = aiEnhancement;
      } catch (error) {
        console.error('Error enhancing article:', error);
      }
    }

    // Get related articles
    const relatedArticles = await db.getRelatedArticles(parseInt(id), 5);

    // Remove content from related articles to reduce payload size
    const relatedWithoutContent = relatedArticles.map(article => {
      const { content, ...articleWithoutContent } = article;
      return articleWithoutContent;
    });

    response.data.relatedArticles = relatedWithoutContent;

    res.status(200).json(response);

  } catch (error) {
    console.error('Error fetching article:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching article',
      error: error.message
    });
  }
} 