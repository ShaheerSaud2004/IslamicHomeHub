const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs-extra');

class DatabaseService {
  constructor() {
    this.db = null;
    this.init();
  }

  init() {
    // Ensure data directory exists
    const dbPath = process.env.DATABASE_PATH || './data/news.db';
    const dbDir = path.dirname(dbPath);
    fs.ensureDirSync(dbDir);

    // Initialize database
    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
          reject(err);
        } else {
          console.log('Connected to SQLite database');
          this.db.exec('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;', (err) => {
            if (err) {
              reject(err);
            } else {
              this.createTables().then(resolve).catch(reject);
            }
          });
        }
      });
    });
  }

  createTables() {
    return new Promise((resolve, reject) => {
      // Articles table
      const createArticlesTable = `
        CREATE TABLE IF NOT EXISTS articles (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          content TEXT NOT NULL,
          summary TEXT NOT NULL,
          url TEXT UNIQUE NOT NULL,
          source_name TEXT NOT NULL,
          source_url TEXT NOT NULL,
          source_logo TEXT,
          category TEXT NOT NULL,
          subcategory TEXT,
          countries TEXT, -- JSON array as string
          regions TEXT,   -- JSON array as string
          tags TEXT,      -- JSON array as string
          published_at DATETIME NOT NULL,
          scraped_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          image_url TEXT,
          author TEXT,
          language TEXT DEFAULT 'en',
          sentiment TEXT DEFAULT 'neutral',
          importance INTEGER DEFAULT 5,
          reading_time INTEGER DEFAULT 0,
          is_active BOOLEAN DEFAULT 1,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          md_file_path TEXT -- Path to markdown file
        )
      `;

      // Create indexes
      const indexes = [
        'CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category)',
        'CREATE INDEX IF NOT EXISTS idx_articles_published_at ON articles(published_at DESC)',
        'CREATE INDEX IF NOT EXISTS idx_articles_source ON articles(source_name)',
        'CREATE INDEX IF NOT EXISTS idx_articles_url ON articles(url)',
        'CREATE INDEX IF NOT EXISTS idx_articles_active ON articles(is_active)',
        'CREATE INDEX IF NOT EXISTS idx_articles_importance ON articles(importance DESC)',
        'CREATE INDEX IF NOT EXISTS idx_articles_sentiment ON articles(sentiment)',
        'CREATE INDEX IF NOT EXISTS idx_articles_category_published ON articles(category, published_at DESC)',
        'CREATE INDEX IF NOT EXISTS idx_articles_active_published ON articles(is_active, published_at DESC)',
      ];

      // Execute table creation
      this.db.exec(createArticlesTable, (err) => {
        if (err) {
          reject(err);
        } else {
          // Execute index creation
          let indexCount = 0;
          const totalIndexes = indexes.length;
          
          if (totalIndexes === 0) {
            resolve();
            return;
          }

          indexes.forEach(indexSql => {
            this.db.exec(indexSql, (err) => {
              if (err) {
                console.error('Error creating index:', err);
              }
              indexCount++;
              if (indexCount === totalIndexes) {
                // Try to enable full-text search
                this.db.exec(`
                  CREATE VIRTUAL TABLE IF NOT EXISTS articles_fts USING fts5(
                    title, content, summary, tags, content='articles', content_rowid='id'
                  )
                `, (err) => {
                  if (err) {
                    console.log('FTS not available or already exists');
                  }
                  resolve();
                });
              }
            });
          });
        }
      });
    });
  }

  // Article CRUD operations
  createArticle(articleData) {
    return new Promise((resolve, reject) => {
      const stmt = this.db.prepare(`
        INSERT INTO articles (
          title, content, summary, url, source_name, source_url, source_logo,
          category, subcategory, countries, regions, tags, published_at,
          image_url, author, language, sentiment, importance, reading_time, md_file_path
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      // Store reference to database for use in callback
      const db = this.db;

      stmt.run([
        articleData.title,
        articleData.content,
        articleData.summary,
        articleData.url,
        articleData.source.name,
        articleData.source.url,
        articleData.source.logo || null,
        articleData.category,
        articleData.subcategory || null,
        JSON.stringify(articleData.countries || []),
        JSON.stringify(articleData.regions || []),
        JSON.stringify(articleData.tags || []),
        articleData.publishedAt,
        articleData.imageUrl || null,
        articleData.author || null,
        articleData.language || 'en',
        articleData.sentiment || 'neutral',
        articleData.importance || 5,
        articleData.readingTime || 0,
        articleData.mdFilePath || null
      ], function(err) {
        if (err) {
          reject(err);
        } else {
          // Update FTS index - use stored db reference
          const ftsStmt = db.prepare(`
            INSERT INTO articles_fts(rowid, title, content, summary, tags)
            VALUES (?, ?, ?, ?, ?)
          `);
          
          ftsStmt.run([
            this.lastID,
            articleData.title,
            articleData.content,
            articleData.summary,
            JSON.stringify(articleData.tags || [])
          ], (ftsErr) => {
            // Don't fail if FTS insert fails
            if (ftsErr) {
              console.log('FTS insert failed:', ftsErr.message);
            }
            ftsStmt.finalize();
            resolve({ id: this.lastID, ...articleData });
          });
        }
      });
      
      stmt.finalize();
    });
  }

  getArticleById(id) {
    return new Promise((resolve, reject) => {
      this.db.get('SELECT * FROM articles WHERE id = ? AND is_active = 1', [id], (err, row) => {
        if (err) {
          reject(err);
        } else if (row) {
          resolve(this.parseArticle(row));
        } else {
          resolve(null);
        }
      });
    });
  }

  getArticleByUrl(url) {
    return new Promise((resolve, reject) => {
      this.db.get('SELECT * FROM articles WHERE url = ?', [url], (err, row) => {
        if (err) {
          reject(err);
        } else if (row) {
          resolve(this.parseArticle(row));
        } else {
          resolve(null);
        }
      });
    });
  }

  getArticles(filters = {}) {
    return new Promise((resolve, reject) => {
      let query = 'SELECT * FROM articles WHERE is_active = 1';
      const params = [];

      // Add filters
      if (filters.category) {
        query += ' AND category = ?';
        params.push(filters.category);
      }

      if (filters.country) {
        query += ' AND countries LIKE ?';
        params.push(`%"${filters.country}"%`);
      }

      if (filters.region) {
        query += ' AND regions LIKE ?';
        params.push(`%"${filters.region}"%`);
      }

      if (filters.source) {
        query += ' AND source_name = ?';
        params.push(filters.source);
      }

      if (filters.sentiment) {
        query += ' AND sentiment = ?';
        params.push(filters.sentiment);
      }

      if (filters.importance) {
        query += ' AND importance >= ?';
        params.push(filters.importance);
      }

      if (filters.search) {
        query += ' AND (title LIKE ? OR content LIKE ? OR summary LIKE ?)';
        const searchTerm = `%${filters.search}%`;
        params.push(searchTerm, searchTerm, searchTerm);
      }

      // Add sorting
      const sortBy = filters.sortBy || 'published_at';
      const sortOrder = filters.sortOrder || 'desc';
      query += ` ORDER BY ${sortBy} ${sortOrder.toUpperCase()}`;

      // Add pagination
      if (filters.limit) {
        query += ' LIMIT ?';
        params.push(filters.limit);
        
        if (filters.offset) {
          query += ' OFFSET ?';
          params.push(filters.offset);
        }
      }

      this.db.all(query, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows.map(row => this.parseArticle(row)));
        }
      });
    });
  }

  countArticles(filters = {}) {
    return new Promise((resolve, reject) => {
      let query = 'SELECT COUNT(*) as count FROM articles WHERE is_active = 1';
      const params = [];

      // Add same filters as getArticles
      if (filters.category) {
        query += ' AND category = ?';
        params.push(filters.category);
      }

      if (filters.country) {
        query += ' AND countries LIKE ?';
        params.push(`%"${filters.country}"%`);
      }

      if (filters.region) {
        query += ' AND regions LIKE ?';
        params.push(`%"${filters.region}"%`);
      }

      if (filters.source) {
        query += ' AND source_name = ?';
        params.push(filters.source);
      }

      if (filters.search) {
        query += ' AND (title LIKE ? OR content LIKE ? OR summary LIKE ?)';
        const searchTerm = `%${filters.search}%`;
        params.push(searchTerm, searchTerm, searchTerm);
      }

      this.db.get(query, params, (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row.count);
        }
      });
    });
  }

  getCategoryCounts() {
    return new Promise((resolve, reject) => {
      this.db.all(`
        SELECT category, COUNT(*) as count 
        FROM articles 
        WHERE is_active = 1 
        GROUP BY category 
        ORDER BY count DESC
      `, [], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  getCountryCounts() {
    return new Promise((resolve, reject) => {
      this.db.all(`
        SELECT countries 
        FROM articles 
        WHERE is_active = 1 AND countries IS NOT NULL AND countries != '[]'
      `, [], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          const countryCounts = {};
          rows.forEach(row => {
            try {
              const countries = JSON.parse(row.countries);
              countries.forEach(country => {
                countryCounts[country] = (countryCounts[country] || 0) + 1;
              });
            } catch (error) {
              // Skip invalid JSON
            }
          });

          const result = Object.entries(countryCounts)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count);
          
          resolve(result);
        }
      });
    });
  }

  getRelatedArticles(articleId, limit = 5) {
    return new Promise((resolve, reject) => {
      // First get the article to find related ones
      this.getArticleById(articleId).then(article => {
        if (!article) {
          resolve([]);
          return;
        }

        this.db.all(`
          SELECT * FROM articles 
          WHERE id != ? AND is_active = 1 
          AND (
            category = ? OR 
            countries LIKE ? OR 
            regions LIKE ?
          )
          ORDER BY published_at DESC 
          LIMIT ?
        `, [
          articleId,
          article.category,
          `%${article.countries[0] || ''}%`,
          `%${article.regions[0] || ''}%`,
          limit
        ], (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows.map(row => this.parseArticle(row)));
          }
        });
      }).catch(reject);
    });
  }

  parseArticle(article) {
    return {
      _id: article.id,
      id: article.id,
      title: article.title,
      content: article.content,
      summary: article.summary,
      url: article.url,
      source: {
        name: article.source_name,
        url: article.source_url,
        logo: article.source_logo
      },
      category: article.category,
      subcategory: article.subcategory,
      countries: article.countries ? JSON.parse(article.countries) : [],
      regions: article.regions ? JSON.parse(article.regions) : [],
      tags: article.tags ? JSON.parse(article.tags) : [],
      publishedAt: article.published_at,
      scrapedAt: article.scraped_at,
      imageUrl: article.image_url,
      author: article.author,
      language: article.language,
      sentiment: article.sentiment,
      importance: article.importance,
      readingTime: article.reading_time,
      isActive: article.is_active,
      createdAt: article.created_at,
      updatedAt: article.updated_at,
      mdFilePath: article.md_file_path
    };
  }

  close() {
    return new Promise((resolve) => {
      if (this.db) {
        this.db.close((err) => {
          if (err) {
            console.error('Error closing database:', err);
          }
          resolve();
        });
      } else {
        resolve();
      }
    });
  }
}

// Singleton instance
let dbInstance = null;

function getDatabase() {
  if (!dbInstance) {
    dbInstance = new DatabaseService();
  }
  return dbInstance;
}

module.exports = { DatabaseService, getDatabase }; 