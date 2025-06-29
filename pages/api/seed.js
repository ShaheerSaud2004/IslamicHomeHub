const DatabaseSeeder = require('../../lib/services/database-seeder');
const { appInitializer } = require('../../lib/services/app-initializer');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method POST required' });
  }

  const { action = 'ensure' } = req.body;

  try {
    const seeder = new DatabaseSeeder();

    switch (action) {
      case 'ensure':
        console.log('🌱 Ensuring minimum database content...');
        const ensureResult = await seeder.ensureMinimumContent(8);
        const currentCount = await seeder.getArticleCount();
        
        res.status(200).json({
          success: true,
          message: ensureResult.message,
          data: {
            action: 'ensure_minimum',
            articlesAdded: ensureResult.articlesAdded,
            totalArticles: currentCount,
            status: currentCount >= 8 ? 'sufficient' : 'needs_more'
          }
        });
        break;

      case 'force':
        console.log('🔄 Force seeding database...');
        const forceResult = await seeder.forceSeed();
        const forceCount = await seeder.getArticleCount();
        
        res.status(200).json({
          success: true,
          message: forceResult.message,
          data: {
            action: 'force_seed',
            articlesAdded: forceResult.articlesAdded,
            totalArticles: forceCount,
            status: 'completed'
          }
        });
        break;

      case 'category':
        const { category } = req.body;
        if (!category) {
          return res.status(400).json({
            success: false,
            message: 'Category is required for category seeding'
          });
        }

        console.log(`🏷️ Adding seed articles for category: ${category}`);
        const categoryResult = await seeder.addCategorySeeds(category);
        const categoryCount = await seeder.getArticleCount();
        
        res.status(200).json({
          success: true,
          message: categoryResult.message,
          data: {
            action: 'category_seed',
            category: category,
            articlesAdded: categoryResult.articlesAdded,
            totalArticles: categoryCount
          }
        });
        break;

      case 'status':
        console.log('📊 Checking database status...');
        const statusCount = await seeder.getArticleCount();
        const isEmpty = await seeder.isDatabaseEmpty();
        const seedExists = await seeder.seedArticlesExist();
        const appStatus = await appInitializer.isAppReady();
        
        res.status(200).json({
          success: true,
          message: 'Database status retrieved',
          data: {
            action: 'status_check',
            totalArticles: statusCount,
            isEmpty: isEmpty,
            seedArticlesExist: seedExists,
            appReady: appStatus.ready,
            recommendation: statusCount < 5 ? 'force_seed' : statusCount < 8 ? 'ensure_minimum' : 'sufficient'
          }
        });
        break;

      case 'initialize':
        console.log('🚀 Initializing application...');
        const initResult = await appInitializer.initialize();
        const initCount = await seeder.getArticleCount();
        
        res.status(200).json({
          success: initResult.success,
          message: initResult.message,
          data: {
            action: 'initialize',
            totalArticles: initCount,
            warning: initResult.warning || null,
            status: initResult.success ? 'initialized' : 'failed'
          }
        });
        break;

      default:
        res.status(400).json({
          success: false,
          message: 'Invalid action. Use: ensure, force, category, status, or initialize'
        });
        break;
    }

  } catch (error) {
    console.error('❌ Seeding error:', error);
    res.status(500).json({
      success: false,
      message: 'Error during seeding operation',
      error: error.message,
      action: action
    });
  }
} 