const { getDatabase } = require('./database');
const { SEED_ARTICLES } = require('../data/seed-articles');
const { contentFormatter } = require('../utils/contentFormatter');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class DatabaseSeeder {
  constructor() {
    this.db = getDatabase();
    this.dbPath = path.join(process.cwd(), 'data', 'news.db');
    this.contentFormatter = contentFormatter;
  }

  /**
   * Check if database has any articles
   */
  async isDatabaseEmpty() {
    return new Promise((resolve, reject) => {
      const db = new sqlite3.Database(this.dbPath);
      
      db.get('SELECT COUNT(*) as count FROM articles', [], (err, row) => {
        db.close();
        if (err) {
          reject(err);
        } else {
          resolve(row.count === 0);
        }
      });
    });
  }

  /**
   * Get current article count
   */
  async getArticleCount() {
    return new Promise((resolve, reject) => {
      const db = new sqlite3.Database(this.dbPath);
      
      db.get('SELECT COUNT(*) as count FROM articles', [], (err, row) => {
        db.close();
        if (err) {
          reject(err);
        } else {
          resolve(row.count);
        }
      });
    });
  }

  /**
   * Check if seed articles already exist
   */
  async seedArticlesExist() {
    return new Promise((resolve, reject) => {
      const db = new sqlite3.Database(this.dbPath);
      
      const seedUrls = SEED_ARTICLES.map(article => article.url);
      const placeholders = seedUrls.map(() => '?').join(',');
      
      db.get(
        `SELECT COUNT(*) as count FROM articles WHERE url IN (${placeholders})`,
        seedUrls,
        (err, row) => {
          db.close();
          if (err) {
            reject(err);
          } else {
            resolve(row.count > 0);
          }
        }
      );
    });
  }

  /**
   * Seed database with sample articles
   */
  async seedDatabase() {
    try {
      console.log('🌱 Starting database seeding process...');
      
      // Check if seed articles already exist
      const seedExists = await this.seedArticlesExist();
      if (seedExists) {
        console.log('✅ Seed articles already exist, skipping...');
        return { success: true, message: 'Seed articles already exist', articlesAdded: 0 };
      }

      const db = new sqlite3.Database(this.dbPath);
      
      const insertQuery = `
        INSERT OR IGNORE INTO articles 
        (title, content, summary, url, imageUrl, category, publishedAt, scrapedAt, 
         sourceName, sourceUrl, sourceRegion, sourceLogo, importance, countries, tags) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      let successCount = 0;
      let errorCount = 0;

      for (const article of SEED_ARTICLES) {
        try {
          // Apply enhanced formatting to seed article content
          const formattedContent = this.contentFormatter.formatArticleContent(
            article.content, 
            article.title
          );
          
          // Apply enhanced formatting to summary
          const formattedSummary = this.contentFormatter.formatSummary(
            article.summary, 
            300
          );

          await new Promise((resolve, reject) => {
            const values = [
              article.title,
              formattedContent || article.content, // Use formatted content or fallback
              formattedSummary || article.summary, // Use formatted summary or fallback
              article.url,
              article.imageUrl,
              article.category,
              article.publishedAt,
              article.scrapedAt,
              article.sourceName,
              article.sourceUrl,
              article.sourceRegion,
              article.sourceLogo,
              article.importance,
              article.countries,
              article.tags
            ];

            db.run(insertQuery, values, function(err) {
              if (err) {
                console.error(`❌ Error inserting seed article: ${article.title}`, err.message);
                errorCount++;
                reject(err);
              } else {
                console.log(`✅ Seeded formatted article: ${article.title}`);
                successCount++;
                resolve();
              }
            });
          });
        } catch (error) {
          // Continue with other articles even if one fails
          continue;
        }
      }

      db.close();

      console.log(`🌱 Seeding complete: ${successCount} articles added, ${errorCount} errors`);
      
      return {
        success: true,
        message: `Database seeded successfully with ${successCount} formatted articles`,
        articlesAdded: successCount,
        errors: errorCount
      };

    } catch (error) {
      console.error('❌ Error during seeding:', error);
      return {
        success: false,
        message: 'Error seeding database',
        error: error.message
      };
    }
  }

  /**
   * Ensure database has minimum content
   */
  async ensureMinimumContent(minArticles = 8) {
    try {
      const currentCount = await this.getArticleCount();
      console.log(`📊 Current database has ${currentCount} articles`);

      if (currentCount < minArticles) {
        console.log(`📈 Database has fewer than ${minArticles} articles, seeding...`);
        const result = await this.seedDatabase();
        return result;
      } else {
        console.log(`✅ Database has sufficient content (${currentCount} articles)`);
        return {
          success: true,
          message: `Database has sufficient content (${currentCount} articles)`,
          articlesAdded: 0
        };
      }
    } catch (error) {
      console.error('❌ Error ensuring minimum content:', error);
      return {
        success: false,
        message: 'Error checking database content',
        error: error.message
      };
    }
  }

  /**
   * Force reseed database (for testing or reset)
   */
  async forceSeed() {
    try {
      console.log('🔄 Force seeding database...');
      
      // Delete existing seed articles first
      const db = new sqlite3.Database(this.dbPath);
      const seedUrls = SEED_ARTICLES.map(article => article.url);
      const placeholders = seedUrls.map(() => '?').join(',');
      
      await new Promise((resolve, reject) => {
        db.run(
          `DELETE FROM articles WHERE url IN (${placeholders})`,
          seedUrls,
          (err) => {
            if (err) reject(err);
            else resolve();
          }
        );
      });
      
      db.close();
      console.log('🗑️ Removed existing seed articles');

      // Now seed with fresh data
      return await this.seedDatabase();
      
    } catch (error) {
      console.error('❌ Error during force seed:', error);
      return {
        success: false,
        message: 'Error force seeding database',
        error: error.message
      };
    }
  }

  /**
   * Add additional seed articles for specific categories
   */
  async addCategorySeeds(category) {
    const categoryArticles = SEED_ARTICLES.filter(article => 
      article.category.toLowerCase() === category.toLowerCase()
    );

    if (categoryArticles.length === 0) {
      return {
        success: false,
        message: `No seed articles found for category: ${category}`
      };
    }

    try {
      const db = new sqlite3.Database(this.dbPath);
      let addedCount = 0;

      for (const article of categoryArticles) {
        const values = [
          article.title,
          article.content,
          article.summary,
          article.url,
          article.imageUrl,
          article.category,
          article.publishedAt,
          article.scrapedAt,
          article.sourceName,
          article.sourceUrl,
          article.sourceRegion,
          article.sourceLogo,
          article.importance,
          article.countries,
          article.tags
        ];

        try {
          await new Promise((resolve, reject) => {
            db.run(
              `INSERT OR IGNORE INTO articles 
               (title, content, summary, url, imageUrl, category, publishedAt, scrapedAt, 
                sourceName, sourceUrl, sourceRegion, sourceLogo, importance, countries, tags) 
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              values,
              function(err) {
                if (err) reject(err);
                else {
                  if (this.changes > 0) addedCount++;
                  resolve();
                }
              }
            );
          });
        } catch (error) {
          console.error(`Error adding category seed: ${article.title}`, error);
        }
      }

      db.close();

      return {
        success: true,
        message: `Added ${addedCount} seed articles for category: ${category}`,
        articlesAdded: addedCount
      };

    } catch (error) {
      console.error('Error adding category seeds:', error);
      return {
        success: false,
        message: 'Error adding category seeds',
        error: error.message
      };
    }
  }
}

module.exports = DatabaseSeeder; 