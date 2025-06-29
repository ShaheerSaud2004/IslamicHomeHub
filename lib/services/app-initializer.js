const DatabaseSeeder = require('./database-seeder');
const { getDatabase } = require('./database');

class AppInitializer {
  constructor() {
    this.seeder = new DatabaseSeeder();
    this.isInitialized = false;
  }

  /**
   * Initialize the application with minimum required content
   */
  async initialize() {
    if (this.isInitialized) {
      return { success: true, message: 'Already initialized' };
    }

    try {
      console.log('🚀 Initializing Muslim News Hub...');
      
      // Step 1: Check database connection
      console.log('📊 Checking database connection...');
      const db = getDatabase();
      if (!db) {
        throw new Error('Database connection failed');
      }
      console.log('✅ Database connection successful');

      // Step 2: Check current content
      const currentCount = await this.seeder.getArticleCount();
      console.log(`📰 Current articles in database: ${currentCount}`);

      // Step 3: Ensure minimum content
      if (currentCount < 8) {
        console.log('🌱 Database needs initial content, seeding...');
        const seedResult = await this.seeder.ensureMinimumContent(8);
        
        if (seedResult.success) {
          console.log(`✅ ${seedResult.message}`);
        } else {
          console.log(`⚠️ Seeding had issues: ${seedResult.message}`);
        }
      } else {
        console.log('✅ Database has sufficient content');
      }

      // Step 4: Final verification
      const finalCount = await this.seeder.getArticleCount();
      console.log(`📈 Final article count: ${finalCount}`);

      this.isInitialized = true;

      return {
        success: true,
        message: `Muslim News Hub initialized successfully with ${finalCount} articles`,
        articleCount: finalCount
      };

    } catch (error) {
      console.error('❌ App initialization error:', error);
      
      // Emergency fallback
      try {
        console.log('🆘 Emergency initialization attempt...');
        await this.seeder.forceSeed();
        const emergencyCount = await this.seeder.getArticleCount();
        
        this.isInitialized = true;
        
        return {
          success: true,
          message: `Emergency initialization completed with ${emergencyCount} articles`,
          articleCount: emergencyCount,
          warning: 'Used emergency seeding'
        };
        
      } catch (emergencyError) {
        console.error('❌ Emergency initialization failed:', emergencyError);
        return {
          success: false,
          message: 'App initialization failed completely',
          error: error.message,
          emergencyError: emergencyError.message
        };
      }
    }
  }

  /**
   * Check if app is properly initialized
   */
  async isAppReady() {
    try {
      const articleCount = await this.seeder.getArticleCount();
      return {
        ready: articleCount >= 5,
        articleCount: articleCount,
        message: articleCount >= 5 ? 'App is ready' : 'App needs more content'
      };
    } catch (error) {
      return {
        ready: false,
        articleCount: 0,
        message: 'Database connection error',
        error: error.message
      };
    }
  }

  /**
   * Refresh content (useful for periodic updates)
   */
  async refreshContent() {
    try {
      console.log('🔄 Refreshing content...');
      
      const currentCount = await this.seeder.getArticleCount();
      
      // If content is very low, force reseed
      if (currentCount < 5) {
        console.log('🌱 Content is low, force reseeding...');
        const result = await this.seeder.forceSeed();
        return {
          success: true,
          message: `Content refreshed: ${result.articlesAdded} articles added`,
          action: 'force_seed'
        };
      }
      
      // Otherwise, just ensure minimum
      const result = await this.seeder.ensureMinimumContent(8);
      return {
        success: true,
        message: result.message,
        action: 'ensure_minimum'
      };
      
    } catch (error) {
      console.error('❌ Content refresh error:', error);
      return {
        success: false,
        message: 'Content refresh failed',
        error: error.message
      };
    }
  }
}

// Export singleton instance
const appInitializer = new AppInitializer();

module.exports = {
  AppInitializer,
  appInitializer
}; 