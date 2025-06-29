const UserManagementService = require('../lib/services/user-management');
const NotificationService = require('../lib/services/notifications');

async function initializeAllTables() {
  console.log('🚀 Initializing enhanced Muslim News Hub database...');
  
  try {
    // Initialize user management tables
    console.log('📋 Creating user management tables...');
    const userService = new UserManagementService();
    await userService.initializeUserTables();
    console.log('✅ User management tables created successfully');

    // Initialize notification tables  
    console.log('🔔 Creating notification tables...');
    const notificationService = new NotificationService();
    await notificationService.initializeNotificationTables();
    console.log('✅ Notification tables created successfully');

    // Create default admin user
    console.log('👤 Creating default admin user...');
    try {
      const adminUser = await userService.registerUser({
        username: 'admin',
        email: 'admin@muslimhub.com',
        password: 'AdminPassword123!',
        fullName: 'Site Administrator',
        location: 'Global'
      });
      console.log('✅ Default admin user created:', adminUser.username);
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('ℹ️  Admin user already exists, skipping...');
      } else {
        throw error;
      }
    }

    console.log('\n🎉 DATABASE INITIALIZATION COMPLETE!');
    console.log('\n📊 New Features Available:');
    console.log('  🔍 Advanced Search - /api/search');
    console.log('  🕌 Islamic Features - /api/islamic-features');
    console.log('  🌍 Translation - /api/translate');
    console.log('  📈 Trending - /api/trending');
    console.log('  👥 User Auth - /api/auth/*');
    console.log('  📝 Blog System - /api/blog/*');
    console.log('  🔔 Notifications - /api/notifications/*');
    
    console.log('\n🔐 Admin Credentials:');
    console.log('  Email: admin@muslimhub.com');
    console.log('  Password: AdminPassword123!');
    
    console.log('\n⚙️  Next Steps:');
    console.log('  1. Update your .env file with API keys');
    console.log('  2. Run: npm run dev');
    console.log('  3. Test new features at http://localhost:3000');

  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
}

// Run the initialization
initializeAllTables(); 