const SearchService = require('../../lib/services/search');

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method GET required' });
  }

  try {
    const searchService = new SearchService();
    const { q: query, category, country, startDate, endDate, islamicOnly, limit } = req.query;

    if (!query || query.trim().length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Search query is required' 
      });
    }

    const filters = {
      category: category || null,
      country: country || null,
      startDate: startDate || null,
      endDate: endDate || null,
      islamicOnly: islamicOnly === 'true',
      limit: parseInt(limit) || 50
    };

    const searchResults = await searchService.searchArticles(query, filters);

    res.status(200).json({
      success: true,
      data: searchResults
    });

  } catch (error) {
    console.error('Search API error:', error);
    res.status(500).json({
      success: false,
      message: 'Search failed',
      error: error.message
    });
  }
} 