const { getDatabase } = require('../../lib/services/database');

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const db = getDatabase();

    // Get countries with counts
    const countries = await db.getCountryCounts();

    res.status(200).json({
      success: true,
      data: countries
    });

  } catch (error) {
    console.error('Error fetching countries:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching countries',
      error: error.message
    });
  }
} 