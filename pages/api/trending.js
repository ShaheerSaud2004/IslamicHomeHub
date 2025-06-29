const SearchService = require('../../lib/services/search');
const { getDatabase } = require('../../lib/services/database');

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method GET required' });
  }

  try {
    const searchService = new SearchService();
    const db = getDatabase();
    const { type, timeframe, limit } = req.query;

    const limitNum = parseInt(limit) || 10;
    const timeframeNum = parseInt(timeframe) || 7; // days

    switch (type) {
      case 'topics':
        const trendingTopics = await searchService.getTrendingTopics();
        return res.status(200).json({
          success: true,
          data: {
            topics: trendingTopics,
            timeframe: `${timeframeNum} days`,
            generatedAt: new Date().toISOString()
          }
        });

      case 'articles':
        const trendingArticles = await getTrendingArticles(db, timeframeNum, limitNum);
        return res.status(200).json({
          success: true,
          data: {
            articles: trendingArticles,
            timeframe: `${timeframeNum} days`,
            generatedAt: new Date().toISOString()
          }
        });

      case 'categories':
        const popularCategories = await getPopularCategories(db, timeframeNum);
        return res.status(200).json({
          success: true,
          data: {
            categories: popularCategories,
            timeframe: `${timeframeNum} days`,
            generatedAt: new Date().toISOString()
          }
        });

      case 'countries':
        const activeCountries = await getActiveCountries(db, timeframeNum);
        return res.status(200).json({
          success: true,
          data: {
            countries: activeCountries,
            timeframe: `${timeframeNum} days`,
            generatedAt: new Date().toISOString()
          }
        });

      case 'dashboard':
        // Get comprehensive trending data
        const [topics, articles, categories, countries] = await Promise.all([
          searchService.getTrendingTopics(),
          getTrendingArticles(db, timeframeNum, 5),
          getPopularCategories(db, timeframeNum),
          getActiveCountries(db, timeframeNum)
        ]);

        return res.status(200).json({
          success: true,
          data: {
            trending: {
              topics: topics.slice(0, 5),
              articles: articles,
              categories: categories.slice(0, 5),
              countries: countries.slice(0, 8)
            },
            timeframe: `${timeframeNum} days`,
            generatedAt: new Date().toISOString()
          }
        });

      case 'analytics':
        const analytics = await getAnalytics(db, timeframeNum);
        return res.status(200).json({
          success: true,
          data: {
            analytics,
            timeframe: `${timeframeNum} days`,
            generatedAt: new Date().toISOString()
          }
        });

      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid type requested. Available: topics, articles, categories, countries, dashboard, analytics'
        });
    }

  } catch (error) {
    console.error('Trending API error:', error);
    res.status(500).json({
      success: false,
      message: 'Trending data request failed',
      error: error.message
    });
  }
}

async function getTrendingArticles(db, timeframeDays, limit) {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT 
        id, title, summary, category, countries, regions,
        published_at as publishedAt, importance, reading_time as readingTime,
        source_name, source_url, source_logo
      FROM articles 
      WHERE published_at > datetime('now', '-${timeframeDays} days')
      ORDER BY importance DESC, published_at DESC
      LIMIT ?
    `;
    
    db.db.all(query, [limit], (err, rows) => {
      if (err) reject(err);
      else {
        // Transform rows to include source object
        const articles = rows.map(row => ({
          ...row,
          source: {
            name: row.source_name,
            url: row.source_url,
            logo: row.source_logo
          }
        }));
        resolve(articles);
      }
    });
  });
}

async function getPopularCategories(db, timeframeDays) {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT 
        category,
        COUNT(*) as articleCount,
        AVG(importance) as avgImportance,
        MAX(published_at) as latestArticle
      FROM articles 
      WHERE published_at > datetime('now', '-${timeframeDays} days')
      AND category IS NOT NULL
      GROUP BY category
      ORDER BY articleCount DESC, avgImportance DESC
    `;
    
    db.db.all(query, [], (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
}

async function getActiveCountries(db, timeframeDays) {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT 
        countries,
        COUNT(*) as articleCount,
        MAX(published_at) as latestArticle
      FROM articles 
      WHERE published_at > datetime('now', '-${timeframeDays} days')
      AND countries IS NOT NULL
      AND countries != '[]'
    `;
    
    db.db.all(query, [], (err, rows) => {
      if (err) {
        reject(err);
        return;
      }

      // Process countries from JSON arrays
      const countryStats = {};
      
      rows.forEach(row => {
        try {
          const countries = JSON.parse(row.countries || '[]');
          countries.forEach(country => {
            if (!countryStats[country]) {
              countryStats[country] = {
                country: country,
                articleCount: 0,
                latestArticle: row.latestArticle
              };
            }
            countryStats[country].articleCount += 1;
            
            // Update latest article if this one is newer
            if (row.latestArticle > countryStats[country].latestArticle) {
              countryStats[country].latestArticle = row.latestArticle;
            }
          });
        } catch (e) {
          // Skip invalid JSON
        }
      });

      // Convert to array and sort
      const sortedCountries = Object.values(countryStats)
        .sort((a, b) => b.articleCount - a.articleCount);

      resolve(sortedCountries);
    });
  });
}

async function getAnalytics(db, timeframeDays) {
  return new Promise((resolve, reject) => {
    const queries = {
      totalArticles: `SELECT COUNT(*) as count FROM articles WHERE published_at > datetime('now', '-${timeframeDays} days')`,
      avgImportance: `SELECT AVG(importance) as avg FROM articles WHERE published_at > datetime('now', '-${timeframeDays} days')`,
      topSources: `
        SELECT 
          source_name as sourceName,
          COUNT(*) as articleCount
        FROM articles 
        WHERE published_at > datetime('now', '-${timeframeDays} days')
        AND source_name IS NOT NULL
        GROUP BY source_name
        ORDER BY articleCount DESC
        LIMIT 5
      `,
      categoriesBreakdown: `
        SELECT 
          category,
          COUNT(*) as count,
          ROUND((COUNT(*) * 100.0 / (SELECT COUNT(*) FROM articles WHERE published_at > datetime('now', '-${timeframeDays} days'))), 2) as percentage
        FROM articles 
        WHERE published_at > datetime('now', '-${timeframeDays} days')
        AND category IS NOT NULL
        GROUP BY category
        ORDER BY count DESC
      `
    };

    const results = {};
    const queryPromises = Object.entries(queries).map(([key, query]) => {
      return new Promise((res, rej) => {
        db.db.all(query, [], (err, rows) => {
          if (err) rej(err);
          else {
            results[key] = rows;
            res();
          }
        });
      });
    });

    Promise.all(queryPromises)
      .then(() => resolve(results))
      .catch(reject);
  });
} 