const { getDatabase } = require('../../lib/services/database');
const { CATEGORIES } = require('../../lib/config/sources');

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const db = getDatabase();

    // Get category counts
    const categoryCounts = await db.getCategoryCounts();

    // Create response with all categories (including those with 0 count)
    const categories = CATEGORIES.map(category => {
      const found = categoryCounts.find(c => c.category === category);
      return {
        name: category,
        count: found ? found.count : 0
      };
    });

    // Sort by count (descending)
    categories.sort((a, b) => b.count - a.count);

    res.status(200).json({
      success: true,
      data: categories
    });

  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching categories',
      error: error.message
    });
  }
} 