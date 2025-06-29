const nodemailer = require('nodemailer');
const { getDatabase } = require('./database');

class NotificationService {
  constructor() {
    this.db = getDatabase();
    this.emailTransporter = this.setupEmailTransporter();
    this.pushNotificationClients = new Map(); // WebSocket connections
  }

  setupEmailTransporter() {
    return nodemailer.createTransport({
      service: 'gmail', // or your preferred email service
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  }

  async initializeNotificationTables() {
    return new Promise((resolve, reject) => {
      const createTables = `
        -- Notification templates
        CREATE TABLE IF NOT EXISTS notification_templates (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT UNIQUE NOT NULL,
          type TEXT NOT NULL, -- email, push, sms
          subject TEXT,
          content TEXT NOT NULL,
          variables TEXT, -- JSON array of variable names
          is_active BOOLEAN DEFAULT TRUE,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        -- Sent notifications log
        CREATE TABLE IF NOT EXISTS notification_logs (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER,
          template_id INTEGER,
          type TEXT NOT NULL,
          recipient TEXT NOT NULL, -- email, phone, user_id
          subject TEXT,
          content TEXT,
          status TEXT DEFAULT 'pending', -- pending, sent, failed, delivered
          sent_at DATETIME,
          delivered_at DATETIME,
          error_message TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id),
          FOREIGN KEY (template_id) REFERENCES notification_templates(id)
        );

        -- Breaking news alerts
        CREATE TABLE IF NOT EXISTS breaking_news_alerts (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          article_id INTEGER,
          title TEXT NOT NULL,
          summary TEXT,
          urgency_level INTEGER DEFAULT 1, -- 1-5 scale
          target_regions TEXT, -- JSON array
          target_categories TEXT, -- JSON array
          is_sent BOOLEAN DEFAULT FALSE,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          sent_at DATETIME,
          FOREIGN KEY (article_id) REFERENCES articles(id)
        );

        -- User notification preferences
        CREATE TABLE IF NOT EXISTS user_notification_preferences (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          email_newsletter BOOLEAN DEFAULT TRUE,
          email_breaking_news BOOLEAN DEFAULT TRUE,
          email_prayer_reminders BOOLEAN DEFAULT FALSE,
          push_breaking_news BOOLEAN DEFAULT TRUE,
          push_prayer_times BOOLEAN DEFAULT FALSE,
          push_new_articles BOOLEAN DEFAULT FALSE,
          notification_frequency TEXT DEFAULT 'daily', -- immediate, daily, weekly
          preferred_categories TEXT, -- JSON array
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id),
          UNIQUE(user_id)
        );
      `;

      this.db.db.exec(createTables, (err) => {
        if (err) reject(err);
        else {
          this.setupDefaultTemplates();
          resolve();
        }
      });
    });
  }

  async setupDefaultTemplates() {
    const templates = [
      {
        name: 'daily_newsletter',
        type: 'email',
        subject: 'Your Daily Muslim News - {{date}}',
        content: `
          <h2>Assalamu Alaikum {{userName}},</h2>
          <p>Here are today's top Islamic news stories:</p>
          {{articlesList}}
          <p>May Allah bless your day.</p>
          <p>{{siteName}} Team</p>
        `,
        variables: JSON.stringify(['userName', 'date', 'articlesList', 'siteName'])
      },
      {
        name: 'breaking_news',
        type: 'push',
        subject: 'Breaking: {{title}}',
        content: '{{summary}}',
        variables: JSON.stringify(['title', 'summary'])
      },
      {
        name: 'prayer_reminder',
        type: 'push',
        subject: 'Prayer Time: {{prayerName}}',
        content: 'It\'s time for {{prayerName}} prayer. {{prayerTime}}',
        variables: JSON.stringify(['prayerName', 'prayerTime'])
      }
    ];

    for (const template of templates) {
      await this.createNotificationTemplate(template);
    }
  }

  async createNotificationTemplate(template) {
    return new Promise((resolve, reject) => {
      const query = `
        INSERT OR REPLACE INTO notification_templates 
        (name, type, subject, content, variables)
        VALUES (?, ?, ?, ?, ?)
      `;
      
      this.db.db.run(query, [
        template.name, 
        template.type, 
        template.subject, 
        template.content,
        template.variables
      ], function(err) {
        if (err) reject(err);
        else resolve(this.lastID);
      });
    });
  }

  async sendDailyNewsletter() {
    try {
      // Get users who want daily newsletters
      const subscribers = await this.getNewsletterSubscribers();
      
      // Get today's top articles
      const topArticles = await this.getTodaysTopArticles();
      
      for (const user of subscribers) {
        await this.sendNewsletterToUser(user, topArticles);
      }
      
      console.log(`Daily newsletter sent to ${subscribers.length} subscribers`);
    } catch (error) {
      console.error('Newsletter sending error:', error);
    }
  }

  async sendBreakingNewsAlert(articleId, urgencyLevel = 3) {
    try {
      // Get article details
      const article = await this.getArticleById(articleId);
      if (!article) return;

      // Create breaking news alert
      const alertId = await this.createBreakingNewsAlert({
        articleId,
        title: article.title,
        summary: article.summary,
        urgencyLevel,
        targetRegions: article.regions,
        targetCategories: [article.category]
      });

      // Get users who want breaking news
      const subscribers = await this.getBreakingNewsSubscribers(urgencyLevel);
      
      let sentCount = 0;
      for (const user of subscribers) {
        const sent = await this.sendBreakingNewsToUser(user, article);
        if (sent) sentCount++;
      }

      // Mark alert as sent
      await this.markAlertAsSent(alertId);
      
      console.log(`Breaking news sent to ${sentCount} users`);
      return sentCount;
    } catch (error) {
      console.error('Breaking news alert error:', error);
      return 0;
    }
  }

  async sendPrayerReminder(userId, prayerName, prayerTime) {
    try {
      const user = await this.getUserById(userId);
      if (!user) return false;

      const userPrefs = await this.getUserNotificationPreferences(userId);
      if (!userPrefs?.push_prayer_times) return false;

      // Send push notification
      await this.sendPushNotification(userId, {
        title: `Prayer Time: ${prayerName}`,
        body: `It's time for ${prayerName} prayer. ${prayerTime}`,
        icon: '/images/prayer-icon.png',
        data: {
          type: 'prayer_reminder',
          prayerName,
          prayerTime
        }
      });

      return true;
    } catch (error) {
      console.error('Prayer reminder error:', error);
      return false;
    }
  }

  async sendEmailNotification(email, template, variables = {}) {
    try {
      const templateData = await this.getNotificationTemplate(template);
      if (!templateData) throw new Error('Template not found');

      // Replace variables in subject and content
      let subject = templateData.subject;
      let content = templateData.content;
      
      Object.keys(variables).forEach(key => {
        const placeholder = `{{${key}}}`;
        subject = subject.replace(new RegExp(placeholder, 'g'), variables[key]);
        content = content.replace(new RegExp(placeholder, 'g'), variables[key]);
      });

      const mailOptions = {
        from: process.env.EMAIL_FROM || 'noreply@muslimhub.com',
        to: email,
        subject: subject,
        html: content
      };

      const info = await this.emailTransporter.sendMail(mailOptions);
      
      // Log the notification
      await this.logNotification({
        templateId: templateData.id,
        type: 'email',
        recipient: email,
        subject: subject,
        content: content,
        status: 'sent',
        sentAt: new Date().toISOString()
      });

      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Email notification error:', error);
      
      // Log the failed notification
      await this.logNotification({
        type: 'email',
        recipient: email,
        status: 'failed',
        errorMessage: error.message
      });
      
      return { success: false, error: error.message };
    }
  }

  async sendPushNotification(userId, notification) {
    try {
      // In a real implementation, you would use FCM, OneSignal, or similar
      // For now, we'll simulate with WebSocket if user is online
      
      const userSocket = this.pushNotificationClients.get(userId);
      if (userSocket && userSocket.readyState === 1) {
        userSocket.send(JSON.stringify({
          type: 'notification',
          ...notification
        }));
        
        await this.logNotification({
          userId,
          type: 'push',
          recipient: userId.toString(),
          subject: notification.title,
          content: notification.body,
          status: 'sent',
          sentAt: new Date().toISOString()
        });
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Push notification error:', error);
      return false;
    }
  }

  async getNewsletterSubscribers() {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT u.*, unp.notification_frequency, unp.preferred_categories
        FROM users u
        LEFT JOIN user_notification_preferences unp ON u.id = unp.user_id
        WHERE (unp.email_newsletter = TRUE OR unp.email_newsletter IS NULL)
        AND u.email IS NOT NULL
      `;
      
      this.db.db.all(query, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
  }

  async getTodaysTopArticles(limit = 10) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT * FROM articles 
        WHERE DATE(published_at) = DATE('now')
        ORDER BY importance DESC, published_at DESC
        LIMIT ?
      `;
      
      this.db.db.all(query, [limit], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
  }

  async sendNewsletterToUser(user, articles) {
    const articlesList = articles.map(article => `
      <div style="margin-bottom: 20px; padding: 15px; border-left: 3px solid #2563eb;">
        <h3 style="margin: 0 0 10px 0;">
          <a href="${process.env.SITE_URL}/article/${article.id}" style="color: #2563eb; text-decoration: none;">
            ${article.title}
          </a>
        </h3>
        <p style="margin: 0; color: #666;">${article.summary}</p>
        <small style="color: #999;">${article.category} • ${new Date(article.published_at).toLocaleDateString()}</small>
      </div>
    `).join('');

    return await this.sendEmailNotification(user.email, 'daily_newsletter', {
      userName: user.full_name || user.username,
      date: new Date().toLocaleDateString(),
      articlesList: articlesList,
      siteName: 'Muslim News Hub'
    });
  }

  registerPushClient(userId, websocket) {
    this.pushNotificationClients.set(userId, websocket);
    
    websocket.on('close', () => {
      this.pushNotificationClients.delete(userId);
    });
  }

  // Additional helper methods would be implemented here...
  async getNotificationTemplate(name) { /* implementation */ }
  async logNotification(data) { /* implementation */ }
  async createBreakingNewsAlert(data) { /* implementation */ }
  async getBreakingNewsSubscribers(urgencyLevel) { /* implementation */ }
  async getUserNotificationPreferences(userId) { /* implementation */ }
}

module.exports = NotificationService; 