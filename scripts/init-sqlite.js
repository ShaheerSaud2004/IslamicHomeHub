#!/usr/bin/env node

require('dotenv').config();
const { DatabaseService } = require('../lib/services/database');
const fs = require('fs-extra');
const path = require('path');

async function initializeDatabase() {
  console.log('🗄️  Initializing SQLite Database for Muslim News Aggregator...');
  
  try {
    // Check required environment variables
    const requiredEnvVars = ['FIRECRAWL_API_KEY', 'OPENAI_API_KEY'];
    const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

    if (missingEnvVars.length > 0) {
      console.error('❌ Missing required environment variables:');
      missingEnvVars.forEach(varName => {
        console.error(`   - ${varName}`);
      });
      console.error('\n💡 Please set these variables in your .env file');
      return;
    }

    // Create data directory
    const dbPath = process.env.DATABASE_PATH || './data/news.db';
    const dbDir = path.dirname(dbPath);
    fs.ensureDirSync(dbDir);
    console.log(`📁 Created data directory: ${dbDir}`);

    // Create articles directory for markdown storage
    const articlesDir = process.env.ARTICLES_MD_DIR || './articles';
    fs.ensureDirSync(articlesDir);
    console.log(`📁 Created articles directory: ${articlesDir}`);

    // Initialize database
    console.log('🔧 Initializing SQLite database...');
    const dbService = new DatabaseService();
    
    // Wait for database to be initialized
    await dbService.init();
    
    console.log('✅ Database connection successful');

    // Check if tables exist and have proper structure
    const tables = await new Promise((resolve, reject) => {
      dbService.db.all(`
        SELECT name FROM sqlite_master 
        WHERE type='table' AND name NOT LIKE 'sqlite_%'
      `, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    console.log('📊 Database tables:');
    tables.forEach(table => {
      console.log(`   - ${table.name}`);
    });

    // Check indexes
    const indexes = await new Promise((resolve, reject) => {
      dbService.db.all(`
        SELECT name, tbl_name FROM sqlite_master 
        WHERE type='index' AND name NOT LIKE 'sqlite_%'
      `, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    console.log('🔍 Database indexes:');
    indexes.forEach(index => {
      console.log(`   - ${index.name} (on ${index.tbl_name})`);
    });

    // Check for FTS virtual table
    const ftsTable = await new Promise((resolve, reject) => {
      dbService.db.get(`
        SELECT name FROM sqlite_master 
        WHERE type='table' AND name='articles_fts'
      `, [], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (ftsTable) {
      console.log('🔍 Full-text search enabled');
    } else {
      console.log('⚠️  Full-text search not available');
    }

    // Show current article count
    const articleCount = await new Promise((resolve, reject) => {
      dbService.db.get('SELECT COUNT(*) as count FROM articles', [], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    console.log(`📰 Current articles in database: ${articleCount.count}`);

    // Database size
    const dbSize = fs.statSync(dbPath).size;
    const dbSizeMB = (dbSize / (1024 * 1024)).toFixed(2);
    console.log(`💾 Database size: ${dbSizeMB} MB`);

    console.log('\n✅ SQLite database initialization completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('   1. Verify your API keys in the .env file');
    console.log('   2. Run the scraper: npm run scrape');
    console.log('   3. Start the development server: npm run dev');
    console.log('   4. Visit http://localhost:3000');

    console.log('\n🔧 Database Configuration:');
    console.log(`   - Database file: ${dbPath}`);
    console.log(`   - Articles directory: ${articlesDir}`);
    console.log(`   - Markdown storage: ${process.env.ENABLE_MD_STORAGE === 'true' ? 'Enabled' : 'Disabled'}`);

    // Test sample queries
    console.log('\n🧪 Testing sample queries...');
    
    try {
      // Test category counts
      const categoryTest = await dbService.getCategoryCounts();
      console.log(`   - Category counts query: ✅ (${categoryTest.length} categories)`);
    } catch (error) {
      console.log(`   - Category counts query: ❌ ${error.message}`);
    }

    try {
      // Test country counts
      const countryTest = await dbService.getCountryCounts();
      console.log(`   - Country counts query: ✅ (${countryTest.length} countries)`);
    } catch (error) {
      console.log(`   - Country counts query: ❌ ${error.message}`);
    }

    try {
      // Test article filtering
      const articlesTest = await dbService.getArticles({ limit: 1 });
      console.log(`   - Articles query: ✅ (${articlesTest.length} articles)`);
    } catch (error) {
      console.log(`   - Articles query: ❌ ${error.message}`);
    }

    // Close database connection
    await dbService.close();
    console.log('📴 Database connection closed');

  } catch (error) {
    console.error('❌ Error initializing database:', error);
    process.exit(1);
  }
}

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Database initialization interrupted by user');
  process.exit(0);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('🚨 Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Run initialization
initializeDatabase(); 