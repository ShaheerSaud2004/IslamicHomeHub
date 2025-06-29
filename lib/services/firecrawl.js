const { FirecrawlApp } = require('@mendable/firecrawl-js');
const OpenAI = require('openai');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { NEWS_SOURCES } = require('../config/sources');
const { categorizeAndSummarize } = require('./ai-processor');
const { getDatabase } = require('./database');
const MarkdownStorageService = require('./markdown-storage');
const ContentFormatter = require('../utils/contentFormatter');

// Utility function for delays with exponential backoff
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Enhanced rate limiting with exponential backoff
const exponentialBackoff = (attempt) => {
  const baseDelay = 2000; // 2 seconds base
  const maxDelay = 30000; // 30 seconds max
  const backoffDelay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
  return backoffDelay + Math.random() * 1000; // Add jitter
};

class FirecrawlService {
  constructor() {
    // Handle different FirecrawlApp export formats with better error handling
    try {
      let FirecrawlClass;
      
      // Try different import patterns for FirecrawlApp
      const FirecrawlModule = require('@mendable/firecrawl-js');

      // Pattern 1: Named export
      if (FirecrawlModule.FirecrawlApp && typeof FirecrawlModule.FirecrawlApp === 'function') {
        FirecrawlClass = FirecrawlModule.FirecrawlApp;
      }
      // Pattern 2: Default export
      else if (FirecrawlModule.default && typeof FirecrawlModule.default === 'function') {
        FirecrawlClass = FirecrawlModule.default;
      }
      // Pattern 3: Direct export
      else if (typeof FirecrawlModule === 'function') {
        FirecrawlClass = FirecrawlModule;
      }
      // Pattern 4: Check for any constructor-like function
      else {
        const possibleClasses = Object.keys(FirecrawlModule).filter(key => 
          typeof FirecrawlModule[key] === 'function' && 
          key.toLowerCase().includes('firecrawl')
        );
        
        if (possibleClasses.length > 0) {
          FirecrawlClass = FirecrawlModule[possibleClasses[0]];
        }
      }
      
      if (!FirecrawlClass) {
        throw new Error('Could not find FirecrawlApp constructor in module');
          }
          
      // Test the constructor
      this.app = new FirecrawlClass({ apiKey: process.env.FIRECRAWL_API_KEY });
      console.log('✅ FirecrawlApp initialized successfully');
      
    } catch (error) {
      console.error('❌ Failed to initialize FirecrawlApp:', error);
      
      // Fallback: create a mock service that doesn't scrape but allows the app to run
      console.log('🔄 Creating fallback service without scraping capabilities');
      this.app = {
        scrapeUrl: async () => ({
          success: false,
          error: 'Firecrawl service unavailable - using fallback mode'
        })
      };
    }
    
    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    this.dbPath = path.join(process.cwd(), 'data', 'news.db');
    this.lastRequestTime = 0;
    this.minDelay = 5000; // Increased to 5 seconds minimum between requests
    this.rateLimitCount = 0;
    this.rateLimitWindow = 60000; // 1 minute window
    this.maxRequestsPerWindow = 5; // Very conservative limit - reduced from 10 to 5
    this.db = getDatabase();
    this.markdownStorage = new MarkdownStorageService();
    this.contentFormatter = new ContentFormatter(); // Add content formatter
  }

  // Enhanced rate limiting with circuit breaker pattern
  async enforceRateLimit(attempt = 0) {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    // Reset counter every minute
    if (timeSinceLastRequest > 60000) {
      this.rateLimitCount = 0;
    }

    // Check if we've hit the rate limit
    if (this.rateLimitCount >= this.maxRequestsPerWindow) {
      const waitTime = 60000 - timeSinceLastRequest + 5000; // Wait extra 5 seconds
      console.log(`Rate limit reached. Waiting ${waitTime}ms before continuing...`);
      await delay(waitTime);
      this.rateLimitCount = 0;
    }

    // Apply exponential backoff for retries
    if (attempt > 0) {
      const backoffTime = exponentialBackoff(attempt);
      console.log(`Backoff attempt ${attempt}. Waiting ${backoffTime}ms...`);
      await delay(backoffTime);
    } else {
      // Regular rate limiting
      const minDelay = this.minDelay;
      if (timeSinceLastRequest < minDelay) {
        await delay(minDelay - timeSinceLastRequest);
      }
    }

    this.lastRequestTime = Date.now();
    this.rateLimitCount++;
  }

  // Enhanced article categorization with better AI prompts
  async categorizeAndAnalyzeArticle(title, summary, content, sourceRegion) {
    try {
      const prompt = `
You are an expert Islamic news categorizer. Analyze this article and provide a JSON response:

Title: "${title}"
Summary: "${summary}"
Content snippet: "${content?.substring(0, 500) || 'N/A'}"
Source Region: "${sourceRegion}"

Categorize this article into ONE of these Islamic/Muslim-focused categories:
- Religious: Islamic teachings, theology, jurisprudence, religious practices, mosque news, Islamic scholars
- Community: Muslim community events, social issues, diaspora news, community organizations, social programs
- Politics: Political issues affecting Muslims, government policies, elections, political movements in Muslim countries
- Education: Islamic education, madrasas, Muslim students, educational institutions, academic achievements
- Economics: Islamic finance, halal business, economic development in Muslim countries, trade, cryptocurrency from Islamic perspective
- Culture: Islamic art, literature, traditions, cultural celebrations, heritage sites, cultural preservation
- Health: Health issues in Muslim communities, halal medicine, healthcare in Muslim countries, medical breakthroughs
- Technology: Tech developments in Muslim countries, Islamic apps, digital innovations, tech and religion intersection
- World: International news affecting Muslim countries, conflicts, diplomacy, global Muslim affairs
- Sports: Sports in Muslim countries, Muslim athletes, sports and Islamic values

Also determine:
1. Importance level (1-10): How significant is this to the global Muslim community?
2. Primary countries/regions mentioned
3. 3-5 relevant tags
4. Is this primarily about Muslims or Islamic topics? (true/false)

Return ONLY valid JSON:
{
  "category": "category_name",
  "importance": number,
  "countries": ["country1", "country2"],
  "tags": ["tag1", "tag2", "tag3"],
  "isIslamicContent": boolean,
  "reasoning": "Brief explanation of categorization"
}`;

      const response = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
        max_tokens: 300
      });

      const result = JSON.parse(response.choices[0].message.content);
      
      // Validate the result
      const validCategories = ['Religious', 'Community', 'Politics', 'Education', 'Economics', 'Culture', 'Health', 'Technology', 'World', 'Sports'];
      if (!validCategories.includes(result.category)) {
        result.category = 'Community'; // Default fallback
    }

      return result;
    } catch (error) {
      console.error('Error in AI categorization:', error);
      // Fallback categorization based on keywords
      return this.fallbackCategorization(title, summary, sourceRegion);
    }
  }

  // Fallback categorization without AI
  fallbackCategorization(title, summary, sourceRegion) {
    const text = `${title} ${summary}`.toLowerCase();
    
    const categoryKeywords = {
      'Religious': ['islam', 'quran', 'hadith', 'mosque', 'prayer', 'ramadan', 'hajj', 'imam', 'fatwa', 'shariah', 'allah', 'prophet'],
      'Politics': ['government', 'election', 'political', 'parliament', 'minister', 'president', 'policy', 'democracy', 'vote'],
      'Community': ['community', 'social', 'family', 'youth', 'women', 'children', 'charity', 'volunteer', 'organization'],
      'Economics': ['economy', 'business', 'trade', 'finance', 'bank', 'halal', 'investment', 'market', 'economic'],
      'Education': ['education', 'school', 'university', 'student', 'learning', 'academic', 'research', 'knowledge'],
      'Health': ['health', 'medical', 'hospital', 'disease', 'treatment', 'medicine', 'healthcare', 'wellness'],
      'Technology': ['technology', 'digital', 'app', 'internet', 'computer', 'innovation', 'tech', 'software'],
      'Culture': ['culture', 'art', 'tradition', 'heritage', 'literature', 'history', 'festival', 'celebration'],
      'Sports': ['sport', 'football', 'cricket', 'olympics', 'athlete', 'game', 'tournament', 'championship']
    };

    let bestCategory = 'Community';
    let highestScore = 0;

    for (const [category, keywords] of Object.entries(categoryKeywords)) {
      const score = keywords.reduce((count, keyword) => {
        return count + (text.includes(keyword) ? 1 : 0);
      }, 0);
      
      if (score > highestScore) {
        highestScore = score;
        bestCategory = category;
      }
    }

    return {
      category: bestCategory,
      importance: highestScore > 0 ? Math.min(highestScore + 3, 8) : 5,
      countries: [sourceRegion || 'Global'],
      tags: ['muslim', 'news', bestCategory.toLowerCase()],
      isIslamicContent: true,
      reasoning: `Fallback categorization based on keyword matching`
    };
  }

  // Check for Arabic content
  containsArabic(text) {
    const arabicRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
    return arabicRegex.test(text);
  }

  // Check if content is primarily English
  isPrimarilyEnglish(text) {
    if (!text || text.length < 50) return false;
    
    const arabicMatches = text.match(/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/g);
    const arabicRatio = arabicMatches ? arabicMatches.length / text.length : 0;
    
    return arabicRatio < 0.3; // Less than 30% Arabic characters
  }

  // Enhanced article processing with better content extraction
  async processArticleContent(content, title, url) {
    if (!content || content.trim().length < 100) {
      throw new Error('Article content too short or empty');
    }

    // Use the enhanced content formatter
    const cleanContent = this.contentFormatter.formatArticleContent(content, title);
    
    // If formatter returns null, content was not suitable
    if (!cleanContent) {
      throw new Error('Article content unsuitable for publication (likely navigation or ads)');
    }

    // Additional validation
    if (cleanContent.length < 300) {
      throw new Error('Article content too short after formatting');
    }

    // Check if content is primarily English
    if (!this.isPrimarilyEnglish(cleanContent)) {
      throw new Error('Article content is not primarily in English');
    }

    console.log(`✅ Content formatted successfully: ${cleanContent.length} characters`);
    return cleanContent;
  }

  // Enhanced article scraping with retry logic
  async scrapeArticle(url, title, retryCount = 0) {
    const maxRetries = 3;
    
    try {
      console.log(`Scraping article: ${title}...`);
      
      // Enforce rate limiting
      await this.enforceRateLimit();
      
      const result = await this.app.scrapeUrl(url, {
        formats: ['markdown', 'html'],
        includeTags: ['article', 'main', 'div', 'section', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
        excludeTags: ['nav', 'footer', 'header', 'aside', 'script', 'style', 'form', 'button', 'input'],
        onlyMainContent: true,
        timeout: 30000
      });

      if (!result.success || !result.markdown) {
        throw new Error(`Failed to scrape article: ${result.error || 'No content returned'}`);
      }

      // Process and clean the article content using enhanced formatter
      const cleanContent = await this.processArticleContent(result.markdown, title, url);
      
      // Generate better summary from cleaned content
      const summary = await this.generateEnhancedSummary(cleanContent, title);
      
      // Get AI categorization with the cleaned content and summary
      const aiResponse = await this.categorizeAndAnalyzeArticle(title, summary, cleanContent, url);
      
      if (!aiResponse.isIslamicContent && !url.includes('aljazeera') && !url.includes('dawn') && !url.includes('arabnews')) {
        console.log(`Skipping non-Islamic article: ${title}`);
        return null;
      }

      const article = {
        title: title.trim(),
        content: cleanContent,
        url: url,
        image_url: result.metadata?.image || result.metadata?.ogImage || null,
        summary: summary,
        category: aiResponse.category || 'World',
        subcategory: aiResponse.subcategory || null,
        countries: JSON.stringify(aiResponse.countries || []),
        regions: JSON.stringify(aiResponse.regions || []),
        tags: JSON.stringify(aiResponse.tags || []),
        sentiment: aiResponse.sentiment || 'neutral',
        importance: aiResponse.importance || 5,
        date_published: new Date().toISOString(),
        source: result.metadata?.sourceURL || url
      };

      return article;

    } catch (error) {
      console.error(`Error processing article ${title}:`, error.message);
      
      if (retryCount < maxRetries && (error.statusCode === 429 || error.statusCode === 500)) {
        const backoffDelay = Math.pow(2, retryCount) * 2000 + Math.random() * 1000;
        console.log(`Retrying article ${title} in ${backoffDelay}ms...`);
        await delay(backoffDelay);
        return this.scrapeArticle(url, title, retryCount + 1);
      }
      
      console.error(`Failed to process article after ${retryCount + 1} attempts: ${title}`);
      return null;
    }
  }

  // Generate enhanced summary from cleaned content
  async generateEnhancedSummary(content, title) {
    try {
      // Use the first 800 characters for summary generation
      const contentForSummary = content.substring(0, 800);
      
      const prompt = `
Create a concise, informative summary of this Islamic news article in 2-3 sentences:

Title: "${title}"
Content: "${contentForSummary}"

Requirements:
- Focus on the main news point
- Keep it under 200 words
- Write in clear, journalistic style
- Include key facts and context
- No promotional language

Summary:`;

      const response = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
        max_tokens: 150
      });

      const summary = response.choices[0].message.content.trim();
      
      // Clean up the summary
      const cleanSummary = this.contentFormatter.formatSummary(summary, 250);
      
      return cleanSummary || content.substring(0, 200) + '...';
      
    } catch (error) {
      console.error('Error generating summary:', error);
      // Fallback to first paragraph or portion of content
      const firstParagraph = content.split('\n\n')[0];
      return firstParagraph.length > 50 ? firstParagraph.substring(0, 200) + '...' : content.substring(0, 200) + '...';
    }
  }

  // Enhanced news source scraping
  async scrapeNewsSource(source, maxArticles = 15) {
    try {
      console.log(`Scraping ${source.name}...`);
      
      await this.enforceRateLimit();
      
      // Scrape the main page
      const scrapeResult = await this.app.scrapeUrl(source.url, {
        formats: ['markdown', 'html'],
        includeTags: ['article', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'a', 'img', 'time'],
        excludeTags: ['nav', 'footer', 'header', 'aside', 'script', 'style', 'form'],
        onlyMainContent: true
      });

      if (!scrapeResult.success) {
        console.log(`Failed to scrape ${source.name}: ${scrapeResult.error}`);
        return [];
      }

      // Extract article links
      const html = scrapeResult.html || '';
      const markdown = scrapeResult.markdown || '';
      
      const linkRegex = /https?:\/\/[^\s<>"]+/g;
      const links = [...(html.match(linkRegex) || []), ...(markdown.match(linkRegex) || [])];
      
      // Filter and clean links
      const articleLinks = [...new Set(links)]
        .filter(link => {
          // Filter out common non-article URLs
          const excludePatterns = [
            /\.(jpg|jpeg|png|gif|svg|pdf|mp4|mp3)$/i,
            /facebook\.com|twitter\.com|instagram\.com|youtube\.com/,
            /\/wp-content\/|\/assets\/|\/static\//,
            /javascript:|mailto:|tel:/,
            /#|\/search|\/tag\/|\/category\/|\/author\//
          ];
          
          return !excludePatterns.some(pattern => pattern.test(link)) &&
                 link.includes(source.baseUrl || source.url.split('/')[2]);
        })
        .slice(0, maxArticles);

      console.log(`Found ${articleLinks.length} article links from ${source.name}`);

      const articles = [];
      for (const link of articleLinks) {
        try {
          const articleData = await this.scrapeArticle(link, link.split('/').pop().split('.').slice(0, -1).join('.'), 0);
          if (articleData) {
            // Add source information
            articleData.source = {
              name: source.name,
              url: source.baseUrl || source.url,
              region: source.region,
              logo: source.logo
            };
            
            articles.push(articleData);
          
            // Add small delay between articles from same source
            if (articles.length < articleLinks.length) {
              await delay(1500);
            }
          }
        } catch (error) {
          console.error(`Error processing article ${link}:`, error);
          continue;
      }
    }

      console.log(`Scraped ${articles.length} articles from ${source.name}`);
      return articles;

    } catch (error) {
      console.error(`Error scraping ${source.name}:`, error);
      return [];
    }
  }

  // Save article to database with enhanced data
  async saveArticle(articleData, analysisData) {
    return new Promise((resolve, reject) => {
      const db = new sqlite3.Database(this.dbPath);
      
      const query = `
        INSERT OR IGNORE INTO articles 
        (title, content, summary, url, imageUrl, category, publishedAt, scrapedAt, 
         sourceName, sourceUrl, sourceRegion, sourceLogo, importance, countries, tags) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      const values = [
        articleData.title,
        articleData.content,
        articleData.summary,
        articleData.url,
        articleData.image_url,
        articleData.category,
        articleData.date_published,
        new Date().toISOString(),
        articleData.source.name,
        articleData.source.url,
        articleData.source.region,
        articleData.source.logo,
        articleData.importance,
        articleData.countries,
        articleData.tags
      ];
      
      db.run(query, values, function(err) {
        db.close();
        if (err) {
          if (err.message.includes('UNIQUE constraint failed')) {
            console.log(`Article already exists: ${articleData.url}`);
            resolve(false);
          } else {
            reject(err);
          }
        } else {
          console.log(`Saved article: ${articleData.title}`);
          resolve(true);
        }
      });
    });
  }

  // Comprehensive scraping of all sources
  async scrapeAllSources(options = {}) {
    const {
      maxArticlesPerSource = 12,
      prioritySourcesOnly = false,
      categories = [],
      regions = []
    } = options;

    console.log('Starting comprehensive news scraping process...');
    
    // Filter sources based on options
    let sourcesToScrape = NEWS_SOURCES;
    
    if (prioritySourcesOnly) {
      sourcesToScrape = sourcesToScrape.filter(source => source.priority === 1);
  }

    if (regions.length > 0) {
      sourcesToScrape = sourcesToScrape.filter(source => regions.includes(source.region));
    }

    console.log(`Scraping from ${sourcesToScrape.length} sources...`);

    let totalScraped = 0;
    let totalSaved = 0;

    // Process sources in smaller batches to manage rate limits
    const batchSize = 3;
    for (let i = 0; i < sourcesToScrape.length; i += batchSize) {
      const batch = sourcesToScrape.slice(i, i + batchSize);
      
      const batchPromises = batch.map(async (source) => {
      try {
          const articles = await this.scrapeNewsSource(source, maxArticlesPerSource);
          let savedCount = 0;

          for (const article of articles) {
            try {
              // Only process if it's Islamic content
              const saved = await this.saveArticle(article, article);
              if (saved) savedCount++;
        
              // Small delay between AI calls to avoid rate limits
              await delay(500);
      } catch (error) {
              console.error(`Error processing article from ${source.name}:`, error);
      }
    }

          return { source: source.name, scraped: articles.length, saved: savedCount };
        } catch (error) {
          console.error(`Error with source ${source.name}:`, error);
          return { source: source.name, scraped: 0, saved: 0 };
        }
      });

      const batchResults = await Promise.all(batchPromises);

      for (const result of batchResults) {
        totalScraped += result.scraped;
        totalSaved += result.saved;
        console.log(`${result.source}: ${result.scraped} scraped, ${result.saved} saved`);
      }

      // Longer delay between batches
      if (i + batchSize < sourcesToScrape.length) {
        console.log('Waiting between batches to respect rate limits...');
        await delay(10000); // 10 second delay between batches
      }
    }

    console.log(`\n=== SCRAPING COMPLETE ===`);
    console.log(`Total articles scraped: ${totalScraped}`);
    console.log(`Total articles saved: ${totalSaved}`);
    
    return {
      totalScraped,
      totalSaved,
      sourcesProcessed: sourcesToScrape.length
    };
  }

  // Quick population method for initial setup
  async populateDatabase() {
    console.log('Starting database population with comprehensive scraping...');
    
    const result = await this.scrapeAllSources({
      maxArticlesPerSource: 15,
      prioritySourcesOnly: false, // Include all sources
      categories: [], // Include all categories
      regions: [] // Include all regions
    });

    return result;
  }
}

module.exports = FirecrawlService; 