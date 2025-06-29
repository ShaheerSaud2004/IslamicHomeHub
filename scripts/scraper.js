#!/usr/bin/env node

require('dotenv').config();
const { getDatabase } = require('../lib/services/database');
const FirecrawlService = require('../lib/services/firecrawl');

async function runScraper() {
  console.log('🚀 Starting Muslim News Scraper...');
  console.log('📅 Started at:', new Date().toISOString());
  
  try {
    // Initialize database connection
    const db = getDatabase();
    console.log('✅ Connected to SQLite database');
    
    // Initialize Firecrawl service
    const firecrawlService = new FirecrawlService();
    
    // Start scraping
    const articles = await firecrawlService.scrapeAllSources();
    
    if (articles.length === 0) {
      console.log('⚠️  No new articles found during scraping');
      return;
    }

    // Save articles to database
    let savedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    console.log(`📊 Processing ${articles.length} articles...`);

    for (const articleData of articles) {
      try {
        // Check if article already exists
        const existingArticle = await db.getArticleByUrl(articleData.url);
        if (existingArticle) {
          console.log(`⏭️  Skipping existing article: ${articleData.title.substring(0, 50)}...`);
          skippedCount++;
          continue;
        }

        // Skip non-Islamic articles
        if (articleData.isIslamic === false) {
          console.log(`🚫 Skipping non-Islamic article: ${articleData.title.substring(0, 50)}...`);
          skippedCount++;
          continue;
        }

        // Save article
        const savedArticle = await db.createArticle(articleData);
        
        savedCount++;
        console.log(`✅ Saved: ${savedArticle.title.substring(0, 50)}... [${savedArticle.category}]`);

      } catch (error) {
        console.error(`❌ Error saving article: ${articleData.title}`, error.message);
        errorCount++;
      }
    }

    // Print summary
    console.log('\n📈 Scraping Summary:');
    console.log('='.repeat(50));
    console.log(`📰 Total articles found: ${articles.length}`);
    console.log(`💾 Articles saved: ${savedCount}`);
    console.log(`⏭️  Articles skipped: ${skippedCount}`);
    console.log(`❌ Errors encountered: ${errorCount}`);
    console.log(`⏰ Completed at: ${new Date().toISOString()}`);
    
    // Database statistics
    const totalArticles = await db.countArticles();
    console.log(`📊 Total articles in database: ${totalArticles}`);
    
    if (savedCount > 0) {
      console.log('\n🎉 Scraping completed successfully!');
      
      // Show category breakdown
      const categories = await db.getCategoryCounts();
      console.log('\n📊 Articles by category:');
      categories.forEach(cat => {
        console.log(`   - ${cat.category}: ${cat.count}`);
      });
      
      // Show top countries
      const countries = await db.getCountryCounts();
      const topCountries = countries.slice(0, 5);
      if (topCountries.length > 0) {
        console.log('\n🌍 Top countries:');
        topCountries.forEach(country => {
          console.log(`   - ${country.name}: ${country.count}`);
        });
      }
    } else {
      console.log('\n⚠️  No new articles were saved.');
    }

  } catch (error) {
    console.error('💥 Fatal error during scraping:', error);
    process.exit(1);
  } finally {
    // Close database connection
    const db = getDatabase();
    await db.close();
    console.log('📴 Database connection closed');
  }
}

// Handle process termination
process.on('SIGINT', async () => {
  console.log('\n🛑 Scraping interrupted by user');
  const db = getDatabase();
  await db.close();
  process.exit(0);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('🚨 Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Check required environment variables
const requiredEnvVars = ['FIRECRAWL_API_KEY', 'OPENAI_API_KEY'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error('❌ Missing required environment variables:');
  missingEnvVars.forEach(varName => {
    console.error(`   - ${varName}`);
  });
  console.error('\n💡 Please set these variables in your .env file');
  process.exit(1);
}

// Run the scraper
runScraper(); 