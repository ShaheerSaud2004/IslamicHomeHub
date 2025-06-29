const sqlite3 = require('sqlite3');
const path = require('path');
const fs = require('fs-extra');

class Database {
  constructor() {
    // Skip database initialization during static build
    if (process.env.DISABLE_DB === 'true') {
      this.isStaticBuild = true;
      return;
    }
    
    this.dbPath = path.join(process.cwd(), 'data', 'news.db');
  }

  async connect() {
    if (this.isStaticBuild) {
      console.log('Database disabled for static build');
      return;
    }
    
    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(this.dbPath, (err) => {
        if (err) {
          console.error('Database connection error:', err);
          reject(err);
        } else {
          console.log('Connected to SQLite database');
          this.initializeTables().then(resolve).catch(reject);
        }
      });
    });
  }

  async initializeTables() {
    if (this.isStaticBuild) return;
    
    return new Promise((resolve, reject) => {
      const sql = `
        CREATE TABLE IF NOT EXISTS articles (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          content TEXT,
          summary TEXT,
          url TEXT UNIQUE,
          author TEXT,
          published_date TEXT,
          category TEXT,
          subcategory TEXT,
          source TEXT,
          country TEXT,
          region TEXT,
          tags TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          reading_time INTEGER DEFAULT 0,
          sentiment TEXT DEFAULT 'neutral',
          importance INTEGER DEFAULT 5,
          is_islamic BOOLEAN DEFAULT false,
          is_featured BOOLEAN DEFAULT false,
          view_count INTEGER DEFAULT 0,
          image_url TEXT,
          video_url TEXT,
          is_verified BOOLEAN DEFAULT false
        );

        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT UNIQUE NOT NULL,
          email TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          full_name TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          is_active BOOLEAN DEFAULT true,
          role TEXT DEFAULT 'user'
        );

        CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category);
        CREATE INDEX IF NOT EXISTS idx_articles_published ON articles(published_date);
        CREATE INDEX IF NOT EXISTS idx_articles_country ON articles(country);
        CREATE INDEX IF NOT EXISTS idx_articles_source ON articles(source);
        CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      `;

      this.db.exec(sql, (err) => {
        if (err) {
          console.error('Error creating tables:', err);
          reject(err);
        } else {
          console.log('Database tables initialized');
          resolve();
        }
      });
    });
  }

  // Mock methods for static build
  getMockData() {
    return {
      articles: [
        {
          id: 1,
          title: "Welcome to Islamic News Hub",
          content: "This is a demonstration article for the Islamic News Hub.",
          summary: "A sample article showcasing the platform's capabilities.",
          url: "#",
          author: "Islamic News Hub",
          published_date: new Date().toISOString(),
          category: "General",
          subcategory: "Welcome",
          source: "Islamic News Hub",
          country: "Global",
          region: "Global",
          tags: "welcome,demo",
          reading_time: 2,
          sentiment: "positive",
          importance: 8,
          is_islamic: true,
          is_featured: true
        }
      ],
      categories: ["General", "Religious", "World", "Community", "Education"],
      countries: ["Global", "United States", "United Kingdom", "Canada", "Pakistan"]
    };
  }

  async getAllArticles(page = 1, limit = 12, filters = {}) {
    if (this.isStaticBuild) {
      const mockData = this.getMockData();
      return {
        articles: mockData.articles,
        total: 1,
        page,
        totalPages: 1
      };
    }

    return new Promise((resolve, reject) => {
      let sql = 'SELECT * FROM articles WHERE 1=1';
      let params = [];

      if (filters.category) {
        sql += ' AND category = ?';
        params.push(filters.category);
      }

      if (filters.country) {
        sql += ' AND country = ?';
        params.push(filters.country);
      }

      if (filters.search) {
        sql += ' AND (title LIKE ? OR content LIKE ? OR summary LIKE ?)';
        const searchTerm = `%${filters.search}%`;
        params.push(searchTerm, searchTerm, searchTerm);
      }

      const countSql = sql.replace('SELECT *', 'SELECT COUNT(*) as total');
      
      this.db.get(countSql, params, (err, countResult) => {
        if (err) {
          reject(err);
          return;
        }

        const total = countResult.total;
        const offset = (page - 1) * limit;
        
        sql += ' ORDER BY published_date DESC LIMIT ? OFFSET ?';
        params.push(limit, offset);

        this.db.all(sql, params, (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve({
              articles: rows,
              total,
              page,
              totalPages: Math.ceil(total / limit)
            });
          }
        });
      });
    });
  }

  async getArticleById(id) {
    if (this.isStaticBuild) {
      const mockData = this.getMockData();
      return mockData.articles[0];
    }

    return new Promise((resolve, reject) => {
      this.db.get('SELECT * FROM articles WHERE id = ?', [id], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  async getCategories() {
    if (this.isStaticBuild) {
      return this.getMockData().categories;
    }

    return new Promise((resolve, reject) => {
      this.db.all('SELECT DISTINCT category FROM articles WHERE category IS NOT NULL ORDER BY category', (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows.map(row => row.category));
        }
      });
    });
  }

  async getCountries() {
    if (this.isStaticBuild) {
      return this.getMockData().countries;
    }

    return new Promise((resolve, reject) => {
      this.db.all('SELECT DISTINCT country FROM articles WHERE country IS NOT NULL ORDER BY country', (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows.map(row => row.country));
        }
      });
    });
  }

  async saveArticle(article) {
    if (this.isStaticBuild) {
      console.log('Article save skipped - static build mode');
      return { id: 1 };
    }

    return new Promise((resolve, reject) => {
      const sql = `
        INSERT OR REPLACE INTO articles (
          title, content, summary, url, author, published_date, category,
          subcategory, source, country, region, tags, reading_time,
          sentiment, importance, is_islamic, image_url, video_url
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const params = [
        article.title,
        article.content,
        article.summary,
        article.url,
        article.author || 'Unknown',
        article.published_date || new Date().toISOString(),
        article.category,
        article.subcategory,
        article.source,
        article.country,
        article.region,
        Array.isArray(article.tags) ? article.tags.join(',') : article.tags,
        article.reading_time || 0,
        article.sentiment || 'neutral',
        article.importance || 5,
        article.is_islamic || false,
        article.image_url,
        article.video_url
      ];

      this.db.run(sql, params, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: this.lastID });
        }
      });
    });
  }

  async createUser(userData) {
    if (this.isStaticBuild) {
      console.log('User creation skipped - static build mode');
      return { id: 1 };
    }

    return new Promise((resolve, reject) => {
      const sql = `
        INSERT INTO users (username, email, password_hash, full_name)
        VALUES (?, ?, ?, ?)
      `;

      this.db.run(sql, [userData.username, userData.email, userData.password_hash, userData.full_name], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: this.lastID });
        }
      });
    });
  }

  async getUserByEmail(email) {
    if (this.isStaticBuild) {
      return null;
    }

    return new Promise((resolve, reject) => {
      this.db.get('SELECT * FROM users WHERE email = ?', [email], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  async close() {
    if (this.isStaticBuild || !this.db) return;
    
    return new Promise((resolve) => {
      this.db.close((err) => {
        if (err) {
          console.error('Error closing database:', err);
        } else {
          console.log('Database connection closed');
        }
        resolve();
      });
    });
  }
}

module.exports = new Database(); 