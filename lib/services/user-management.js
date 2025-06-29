const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { getDatabase } = require('./database');

class UserManagementService {
  constructor() {
    this.db = getDatabase();
    this.jwtSecret = process.env.JWT_SECRET || 'your-fallback-secret';
    this.saltRounds = 10;
  }

  async initializeUserTables() {
    return new Promise((resolve, reject) => {
      const createTables = `
        -- Users table
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT UNIQUE NOT NULL,
          email TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          full_name TEXT,
          bio TEXT,
          location TEXT,
          avatar_url TEXT,
          is_verified BOOLEAN DEFAULT FALSE,
          is_admin BOOLEAN DEFAULT FALSE,
          is_scholar BOOLEAN DEFAULT FALSE,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          last_login DATETIME,
          preferences TEXT DEFAULT '{}'
        );

        -- Blog posts table
        CREATE TABLE IF NOT EXISTS blog_posts (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          title TEXT NOT NULL,
          content TEXT NOT NULL,
          summary TEXT,
          slug TEXT UNIQUE NOT NULL,
          featured_image TEXT,
          category TEXT,
          tags TEXT,
          status TEXT DEFAULT 'published', -- draft, published, archived
          is_featured BOOLEAN DEFAULT FALSE,
          view_count INTEGER DEFAULT 0,
          like_count INTEGER DEFAULT 0,
          comment_count INTEGER DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          published_at DATETIME,
          FOREIGN KEY (user_id) REFERENCES users(id)
        );

        -- Comments table
        CREATE TABLE IF NOT EXISTS comments (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          article_id INTEGER,
          blog_post_id INTEGER,
          parent_comment_id INTEGER,
          content TEXT NOT NULL,
          is_approved BOOLEAN DEFAULT TRUE,
          like_count INTEGER DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id),
          FOREIGN KEY (parent_comment_id) REFERENCES comments(id)
        );

        -- User preferences table
        CREATE TABLE IF NOT EXISTS user_reading_history (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          article_id INTEGER,
          blog_post_id INTEGER,
          reading_time INTEGER,
          completed BOOLEAN DEFAULT FALSE,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id)
        );

        -- User subscriptions
        CREATE TABLE IF NOT EXISTS user_subscriptions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          subscription_type TEXT NOT NULL, -- newsletter, push, category, country
          subscription_value TEXT, -- specific category or country
          is_active BOOLEAN DEFAULT TRUE,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id)
        );

        -- Create indexes
        CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
        CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
        CREATE INDEX IF NOT EXISTS idx_blog_posts_user_id ON blog_posts(user_id);
        CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status);
        CREATE INDEX IF NOT EXISTS idx_comments_article_id ON comments(article_id);
        CREATE INDEX IF NOT EXISTS idx_comments_blog_post_id ON comments(blog_post_id);
        CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);
      `;

      this.db.db.exec(createTables, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  async registerUser(userData) {
    const { username, email, password, fullName, location } = userData;
    
    try {
      // Check if user already exists
      const existingUser = await this.getUserByEmailOrUsername(email, username);
      if (existingUser) {
        throw new Error('User already exists with this email or username');
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, this.saltRounds);

      // Create user
      return new Promise((resolve, reject) => {
        const query = `
          INSERT INTO users (username, email, password_hash, full_name, location)
          VALUES (?, ?, ?, ?, ?)
        `;
        
        this.db.db.run(query, [username, email, passwordHash, fullName, location], function(err) {
          if (err) {
            reject(err);
            return;
          }

          const userId = this.lastID;
          resolve({
            id: userId,
            username,
            email,
            fullName,
            location,
            createdAt: new Date().toISOString()
          });
        });
      });
    } catch (error) {
      throw error;
    }
  }

  async loginUser(email, password) {
    try {
      const user = await this.getUserByEmail(email);
      if (!user) {
        throw new Error('Invalid credentials');
      }

      const isValidPassword = await bcrypt.compare(password, user.password_hash);
      if (!isValidPassword) {
        throw new Error('Invalid credentials');
      }

      // Update last login
      await this.updateLastLogin(user.id);

      // Generate JWT token
      const token = jwt.sign(
        { 
          userId: user.id, 
          username: user.username,
          email: user.email,
          isAdmin: user.is_admin 
        },
        this.jwtSecret,
        { expiresIn: '7d' }
      );

      return {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          fullName: user.full_name,
          bio: user.bio,
          location: user.location,
          avatarUrl: user.avatar_url,
          isVerified: user.is_verified,
          isAdmin: user.is_admin,
          isScholar: user.is_scholar
        },
        token
      };
    } catch (error) {
      throw error;
    }
  }

  async createBlogPost(userId, postData) {
    const { title, content, summary, category, tags, featuredImage, isDraft } = postData;
    
    try {
      const slug = this.generateSlug(title);
      const status = isDraft ? 'draft' : 'published';
      const publishedAt = isDraft ? null : new Date().toISOString();

      return new Promise((resolve, reject) => {
        const query = `
          INSERT INTO blog_posts (
            user_id, title, content, summary, slug, featured_image, 
            category, tags, status, published_at
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        this.db.db.run(query, [
          userId, title, content, summary, slug, featuredImage,
          category, tags, status, publishedAt
        ], function(err) {
          if (err) {
            reject(err);
            return;
          }

          resolve({
            id: this.lastID,
            title,
            slug,
            status,
            createdAt: new Date().toISOString()
          });
        });
      });
    } catch (error) {
      throw error;
    }
  }

  async getBlogPosts(filters = {}) {
    return new Promise((resolve, reject) => {
      let query = `
        SELECT 
          bp.*,
          u.username,
          u.full_name,
          u.avatar_url,
          u.is_verified,
          u.is_scholar
        FROM blog_posts bp
        JOIN users u ON bp.user_id = u.id
        WHERE bp.status = 'published'
      `;
      let params = [];

      if (filters.category) {
        query += ` AND bp.category = ?`;
        params.push(filters.category);
      }

      if (filters.userId) {
        query += ` AND bp.user_id = ?`;
        params.push(filters.userId);
      }

      if (filters.featured) {
        query += ` AND bp.is_featured = TRUE`;
      }

      query += ` ORDER BY bp.published_at DESC LIMIT ?`;
      params.push(filters.limit || 20);

      this.db.db.all(query, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
  }

  async addComment(userId, commentData) {
    const { content, articleId, blogPostId, parentCommentId } = commentData;
    
    return new Promise((resolve, reject) => {
      const query = `
        INSERT INTO comments (user_id, content, article_id, blog_post_id, parent_comment_id)
        VALUES (?, ?, ?, ?, ?)
      `;
      
      this.db.db.run(query, [userId, content, articleId, blogPostId, parentCommentId], function(err) {
        if (err) {
          reject(err);
          return;
        }

        resolve({
          id: this.lastID,
          content,
          createdAt: new Date().toISOString()
        });
      });
    });
  }

  async getComments(articleId, blogPostId) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT 
          c.*,
          u.username,
          u.full_name,
          u.avatar_url,
          u.is_verified
        FROM comments c
        JOIN users u ON c.user_id = u.id
        WHERE c.is_approved = TRUE
        AND (c.article_id = ? OR c.blog_post_id = ?)
        ORDER BY c.created_at ASC
      `;
      
      this.db.db.all(query, [articleId, blogPostId], (err, rows) => {
        if (err) reject(err);
        else resolve(this.organizeComments(rows || []));
      });
    });
  }

  organizeComments(comments) {
    const commentMap = {};
    const rootComments = [];

    // First pass: create comment objects
    comments.forEach(comment => {
      commentMap[comment.id] = {
        ...comment,
        replies: []
      };
    });

    // Second pass: organize into tree structure
    comments.forEach(comment => {
      if (comment.parent_comment_id) {
        const parent = commentMap[comment.parent_comment_id];
        if (parent) {
          parent.replies.push(commentMap[comment.id]);
        }
      } else {
        rootComments.push(commentMap[comment.id]);
      }
    });

    return rootComments;
  }

  async getUserByEmail(email) {
    return new Promise((resolve, reject) => {
      this.db.db.get('SELECT * FROM users WHERE email = ?', [email], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  async getUserByEmailOrUsername(email, username) {
    return new Promise((resolve, reject) => {
      this.db.db.get('SELECT * FROM users WHERE email = ? OR username = ?', [email, username], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  async updateLastLogin(userId) {
    return new Promise((resolve, reject) => {
      this.db.db.run(
        'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?', 
        [userId], 
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  }

  generateSlug(title) {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .substring(0, 50);
  }

  verifyToken(token) {
    try {
      return jwt.verify(token, this.jwtSecret);
    } catch (error) {
      throw new Error('Invalid token');
    }
  }
}

module.exports = UserManagementService; 