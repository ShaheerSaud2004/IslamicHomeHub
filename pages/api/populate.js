const FirecrawlService = require('../../lib/services/firecrawl');
const DatabaseSeeder = require('../../lib/services/database-seeder');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    console.log('🚀 Starting comprehensive database population...');
    
    // Initialize services
    const seeder = new DatabaseSeeder();
    
    // Step 1: Ensure minimum content exists first
    console.log('📊 Checking current database content...');
    const currentCount = await seeder.getArticleCount();
    console.log(`Current database has ${currentCount} articles`);
    
    // If database is empty or has very few articles, seed it immediately
    if (currentCount < 5) {
      console.log('🌱 Database needs seeding - adding sample articles...');
      const seedResult = await seeder.ensureMinimumContent(8);
      console.log('Seed result:', seedResult);
    }
    
    // Step 2: Attempt to scrape new content (with fallback handling)
    let scrapeResult = { totalScraped: 0, totalSaved: 0, sourcesProcessed: 0 };
    
    try {
      console.log('🔍 Attempting to scrape fresh content...');
      const firecrawlService = new FirecrawlService();
      
      // Use conservative scraping settings to avoid rate limits
      scrapeResult = await firecrawlService.scrapeAllSources({
        maxArticlesPerSource: 5, // Reduced from 15 to 5
        prioritySourcesOnly: true, // Only scrape priority sources
        categories: [], 
        regions: []
      });
      
      console.log(`Scraping completed: ${scrapeResult.totalSaved} new articles added`);
      
    } catch (scrapeError) {
      console.log('⚠️ Scraping failed, but continuing with seed data...');
      console.error('Scrape error:', scrapeError.message);
      
      // If scraping completely fails, ensure we have seed data
      if (currentCount < 8) {
        console.log('🔄 Ensuring minimum content after scrape failure...');
        await seeder.ensureMinimumContent(8);
      }
    }
    
    // Step 3: Final content check
    const finalCount = await seeder.getArticleCount();
    console.log(`📈 Final database content: ${finalCount} articles`);
    
    // Step 4: If still low on content, force seed more articles
    if (finalCount < 8) {
      console.log('🚨 Content still low, force seeding...');
      const forceSeeded = await seeder.forceSeed();
      console.log('Force seed result:', forceSeeded);
    }
    
    const endCount = await seeder.getArticleCount();
    
    res.status(200).json({
      success: true,
      message: `Database population completed! Website now has ${endCount} articles.`,
      data: {
        initialCount: currentCount,
        finalCount: endCount,
        scrapedArticles: scrapeResult.totalSaved || 0,
        seedArticles: Math.max(0, endCount - currentCount - (scrapeResult.totalSaved || 0)),
        sourcesProcessed: scrapeResult.sourcesProcessed || 0,
        status: endCount >= 8 ? 'Content sufficient' : 'Content needs attention'
      }
    });

  } catch (error) {
    console.error('❌ Population error:', error);
    
    // Emergency fallback - try to seed even if other operations failed
    try {
      console.log('🆘 Emergency seeding attempt...');
      const seeder = new DatabaseSeeder();
      const emergencyResult = await seeder.ensureMinimumContent(8);
      const emergencyCount = await seeder.getArticleCount();
      
      res.status(200).json({
        success: true,
        message: `Population had errors but emergency seeding succeeded. ${emergencyCount} articles available.`,
        data: {
          finalCount: emergencyCount,
          emergencySeeded: emergencyResult.articlesAdded,
          status: 'Emergency mode - using sample articles'
        },
        warning: 'Scraping failed but website has content from sample articles'
      });
      
    } catch (emergencyError) {
      console.error('❌ Emergency seeding also failed:', emergencyError);
      res.status(500).json({
        success: false,
        message: 'Failed to populate database and emergency seeding failed',
        error: error.message,
        emergencyError: emergencyError.message
      });
    }
  }
} 