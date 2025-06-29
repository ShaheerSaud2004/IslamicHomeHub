#!/usr/bin/env node

const { appInitializer } = require('../lib/services/app-initializer');
const DatabaseSeeder = require('../lib/services/database-seeder');
const FirecrawlService = require('../lib/services/firecrawl');

class BackgroundPopulator {
  constructor() {
    this.seeder = new DatabaseSeeder();
    this.isRunning = false;
    this.intervalId = null;
    this.populationInterval = 30 * 60 * 1000; // 30 minutes
    this.maxRetries = 3;
  }

  /**
   * Start the background population service
   */
  async start(intervalMinutes = 30) {
    if (this.isRunning) {
      console.log('⚠️ Background populator is already running');
      return;
    }

    this.populationInterval = intervalMinutes * 60 * 1000;
    this.isRunning = true;

    console.log('🚀 Starting background population service...');
    console.log(`⏰ Population interval: ${intervalMinutes} minutes`);

    // Initial population check
    await this.populateOnce();

    // Set up periodic population
    this.intervalId = setInterval(async () => {
      await this.populateOnce();
    }, this.populationInterval);

    console.log('✅ Background population service started');
  }

  /**
   * Stop the background population service
   */
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    console.log('🛑 Background population service stopped');
  }

  /**
   * Run one population cycle
   */
  async populateOnce() {
    try {
      console.log('\n🔄 Starting population cycle...');
      const startTime = Date.now();

      // Step 1: Ensure minimum content exists
      const currentCount = await this.seeder.getArticleCount();
      console.log(`📊 Current articles: ${currentCount}`);

      if (currentCount < 8) {
        console.log('🌱 Low article count, adding seed articles...');
        await this.seeder.ensureMinimumContent(8);
      }

      // Step 2: Try to scrape new content (with rate limiting)
      let newArticles = 0;
      try {
        console.log('🕸️ Attempting to scrape new articles...');
        const firecrawlService = new FirecrawlService();
        
        const result = await firecrawlService.scrapeAllSources({
          maxArticlesPerSource: 3, // Very conservative
          prioritySourcesOnly: true,
          categories: [],
          regions: []
        });

        newArticles = result.totalSaved || 0;
        console.log(`✅ Scraped ${newArticles} new articles`);

      } catch (scrapeError) {
        console.log('⚠️ Scraping failed:', scrapeError.message);
        
        // If scraping fails and we have low content, add seed articles
        const afterScrapeCount = await this.seeder.getArticleCount();
        if (afterScrapeCount < 12) {
          console.log('🆘 Adding backup content...');
          await this.seeder.ensureMinimumContent(12);
        }
      }

      // Step 3: Report results
      const endCount = await this.seeder.getArticleCount();
      const duration = ((Date.now() - startTime) / 1000).toFixed(1);
      
      console.log('📈 Population cycle complete:');
      console.log(`   - Final article count: ${endCount}`);
      console.log(`   - New articles added: ${newArticles}`);
      console.log(`   - Duration: ${duration}s`);
      console.log(`   - Next cycle: ${new Date(Date.now() + this.populationInterval).toLocaleTimeString()}`);

    } catch (error) {
      console.error('❌ Population cycle error:', error);
      
      // Emergency fallback
      try {
        console.log('🆘 Emergency content check...');
        const emergencyCount = await this.seeder.getArticleCount();
        if (emergencyCount < 5) {
          await this.seeder.forceSeed();
          console.log('✅ Emergency seeding completed');
        }
      } catch (emergencyError) {
        console.error('❌ Emergency seeding failed:', emergencyError);
      }
    }
  }

  /**
   * Get status of the background service
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      intervalMinutes: this.populationInterval / (60 * 1000),
      nextRun: this.intervalId ? new Date(Date.now() + this.populationInterval) : null
    };
  }
}

// Handle command line arguments
const args = process.argv.slice(2);
const action = args[0] || 'start';
const intervalMinutes = parseInt(args[1]) || 30;

async function main() {
  const populator = new BackgroundPopulator();

  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n🛑 Received SIGINT, shutting down gracefully...');
    populator.stop();
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    console.log('\n🛑 Received SIGTERM, shutting down gracefully...');
    populator.stop();
    process.exit(0);
  });

  try {
    switch (action) {
      case 'start':
        console.log('🚀 Muslim News Hub - Background Populator');
        console.log('==========================================');
        
        // Initialize app first
        await appInitializer.initialize();
        
        // Start background service
        await populator.start(intervalMinutes);
        
        // Keep the process running
        process.stdin.resume();
        break;

      case 'once':
        console.log('🔄 Running single population cycle...');
        await appInitializer.initialize();
        await populator.populateOnce();
        console.log('✅ Single cycle completed');
        process.exit(0);
        break;

      case 'status':
        const status = populator.getStatus();
        console.log('📊 Background Populator Status:');
        console.log(`   - Running: ${status.isRunning}`);
        console.log(`   - Interval: ${status.intervalMinutes} minutes`);
        if (status.nextRun) {
          console.log(`   - Next run: ${status.nextRun.toLocaleString()}`);
        }
        process.exit(0);
        break;

      default:
        console.log('Usage: node background-populate.js [start|once|status] [intervalMinutes]');
        console.log('  start [30]  - Start background service (default 30 min interval)');
        console.log('  once        - Run single population cycle');
        console.log('  status      - Show service status');
        process.exit(1);
    }

  } catch (error) {
    console.error('❌ Background populator error:', error);
    process.exit(1);
  }
}

// Only run if this script is executed directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = BackgroundPopulator; 