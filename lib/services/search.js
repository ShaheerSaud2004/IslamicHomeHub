const { getDatabase } = require('./database');
const { categorizeAndSummarize } = require('./ai-processor');

class SearchService {
  constructor() {
    this.db = getDatabase();
    this.islamicKeywords = [
      'islam', 'muslim', 'quran', 'hadith', 'prophet', 'muhammad', 'allah',
      'mosque', 'masjid', 'ramadan', 'eid', 'hajj', 'umrah', 'prayer', 'salah',
      'islamic', 'sharia', 'imam', 'scholar', 'fatwa', 'sunnah'
    ];
  }

  async searchArticles(query, filters = {}) {
    try {
      const searchResults = await this.performSearch(query, filters);
      const rankedResults = await this.rankSearchResults(searchResults, query);
      
      return {
        query,
        totalResults: rankedResults.length,
        results: rankedResults,
        filters: filters,
        suggestions: await this.getSearchSuggestions(query),
        relatedTopics: await this.getRelatedTopics(query)
      };
    } catch (error) {
      console.error('Search error:', error);
      return {
        query,
        totalResults: 0,
        results: [],
        error: 'Search failed'
      };
    }
  }

  async performSearch(query, filters) {
    let searchQuery = `
      SELECT * FROM articles 
      WHERE articles MATCH ? 
    `;
    let params = [query];

    // Add category filter
    if (filters.category) {
      searchQuery += ` AND category = ?`;
      params.push(filters.category);
    }

    // Add country filter
    if (filters.country) {
      searchQuery += ` AND countries LIKE ?`;
      params.push(`%${filters.country}%`);
    }

    // Add date range filter
    if (filters.startDate && filters.endDate) {
      searchQuery += ` AND published_at BETWEEN ? AND ?`;
      params.push(filters.startDate, filters.endDate);
    }

    // Add Islamic content filter
    if (filters.islamicOnly) {
      searchQuery += ` AND (${this.buildIslamicFilter()})`;
    }

    searchQuery += ` ORDER BY published_at DESC LIMIT ?`;
    params.push(filters.limit || 50);

    return new Promise((resolve, reject) => {
      this.db.db.all(searchQuery, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
  }

  buildIslamicFilter() {
    return this.islamicKeywords.map(keyword => 
      `title LIKE '%${keyword}%' OR content LIKE '%${keyword}%' OR tags LIKE '%${keyword}%'`
    ).join(' OR ');
  }

  async rankSearchResults(results, query) {
    const queryWords = query.toLowerCase().split(' ');
    
    return results.map(article => {
      let score = 0;
      
      // Title match (highest weight)
      queryWords.forEach(word => {
        if (article.title.toLowerCase().includes(word)) {
          score += 10;
        }
      });

      // Summary match
      queryWords.forEach(word => {
        if (article.summary?.toLowerCase().includes(word)) {
          score += 5;
        }
      });

      // Content match
      queryWords.forEach(word => {
        if (article.content.toLowerCase().includes(word)) {
          score += 2;
        }
      });

      // Tags match
      queryWords.forEach(word => {
        if (article.tags?.toLowerCase().includes(word)) {
          score += 3;
        }
      });

      // Islamic content boost
      const hasIslamicContent = this.islamicKeywords.some(keyword =>
        article.title.toLowerCase().includes(keyword) ||
        article.content.toLowerCase().includes(keyword)
      );
      if (hasIslamicContent) score += 5;

      // Recency boost (articles from last 7 days)
      const daysOld = (Date.now() - new Date(article.published_at).getTime()) / (1000 * 60 * 60 * 24);
      if (daysOld <= 7) score += 3;

      // Importance score boost
      score += article.importance || 0;

      return { ...article, searchScore: score };
    }).sort((a, b) => b.searchScore - a.searchScore);
  }

  async getSearchSuggestions(query) {
    try {
      // Get popular search terms from articles
      const popularTerms = await this.getPopularTerms();
      
      // Simple string matching for suggestions
      const suggestions = popularTerms.filter(term => 
        term.toLowerCase().includes(query.toLowerCase()) ||
        query.toLowerCase().includes(term.toLowerCase())
      ).slice(0, 5);

      return suggestions;
    } catch (error) {
      console.error('Search suggestions error:', error);
      return [];
    }
  }

  async getPopularTerms() {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT tags, category, countries FROM articles 
        WHERE published_at > datetime('now', '-30 days')
      `;
      
      this.db.db.all(query, [], (err, rows) => {
        if (err) {
          reject(err);
          return;
        }

        const termCounts = {};
        rows.forEach(row => {
          // Count category terms
          if (row.category) {
            termCounts[row.category] = (termCounts[row.category] || 0) + 1;
          }
          
          // Count tag terms
          if (row.tags) {
            const tags = row.tags.split(',');
            tags.forEach(tag => {
              const trimmedTag = tag.trim();
              if (trimmedTag) {
                termCounts[trimmedTag] = (termCounts[trimmedTag] || 0) + 1;
              }
            });
          }

          // Count country terms
          if (row.countries) {
            const countries = JSON.parse(row.countries || '[]');
            countries.forEach(country => {
              termCounts[country] = (termCounts[country] || 0) + 1;
            });
          }
        });

        // Sort by frequency and return top terms
        const sortedTerms = Object.entries(termCounts)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 20)
          .map(([term]) => term);

        resolve(sortedTerms);
      });
    });
  }

  async getRelatedTopics(query) {
    try {
      // Use AI to find semantically related topics
      const aiResponse = await categorizeAndSummarize(
        `Find related Islamic topics to: ${query}`,
        'Generate 5 related search topics for Muslim news'
      );

      return aiResponse.tags || [];
    } catch (error) {
      console.error('Related topics error:', error);
      return [];
    }
  }

  async getTrendingTopics() {
    try {
      return new Promise((resolve, reject) => {
        const query = `
          SELECT 
            category,
            COUNT(*) as articleCount,
            AVG(importance) as avgImportance
          FROM articles 
          WHERE published_at > datetime('now', '-7 days')
          GROUP BY category
          ORDER BY articleCount DESC, avgImportance DESC
          LIMIT 10
        `;
        
        this.db.db.all(query, [], (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        });
      });
    } catch (error) {
      console.error('Trending topics error:', error);
      return [];
    }
  }

  async getSearchAnalytics() {
    // In production, track search queries and return analytics
    return {
      totalSearches: 0,
      popularQueries: [],
      noResultsQueries: [],
      avgResultsPerQuery: 0
    };
  }
}

module.exports = SearchService; 