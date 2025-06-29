const { getDatabase } = require('../../lib/services/database');
const { contentFormatter } = require('../../lib/utils/contentFormatter');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method POST required' });
  }

  const { limit = 10, dryRun = false } = req.body;

  try {
    console.log(`🎨 Starting article formatting process (limit: ${limit}, dryRun: ${dryRun})...`);
    
    const dbPath = path.join(process.cwd(), 'data', 'news.db');
    const db = new sqlite3.Database(dbPath);

    // Get articles that need formatting
    const getArticlesQuery = `
      SELECT id, title, content, summary 
      FROM articles 
      WHERE content IS NOT NULL 
      AND content != ''
      ORDER BY id DESC
      LIMIT ?
    `;

    const articles = await new Promise((resolve, reject) => {
      db.all(getArticlesQuery, [limit], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    console.log(`📰 Found ${articles.length} articles to format`);

    let formattedCount = 0;
    let improvedCount = 0;
    const results = [];

    for (const article of articles) {
      try {
        // Apply enhanced formatting
        const originalContent = article.content;
        const formattedContent = contentFormatter.formatArticleContent(originalContent, article.title);
        
        // Generate better summary
        const formattedSummary = contentFormatter.formatSummary(article.summary || '');
        
        // Check if content was actually improved
        const wasImproved = formattedContent && 
                          formattedContent.length !== originalContent.length &&
                          formattedContent !== originalContent;

        if (formattedContent) {
          formattedCount++;
          
          if (wasImproved) {
            improvedCount++;
          }

          // Store results
          results.push({
            id: article.id,
            title: article.title,
            originalLength: originalContent.length,
            formattedLength: formattedContent.length,
            wasImproved: wasImproved,
            originalSummary: article.summary?.substring(0, 100) + '...',
            formattedSummary: formattedSummary?.substring(0, 100) + '...'
          });

          // Update database if not dry run
          if (!dryRun && wasImproved) {
            const updateQuery = `
              UPDATE articles 
              SET content = ?, summary = ?
              WHERE id = ?
            `;

            await new Promise((resolve, reject) => {
              db.run(updateQuery, [formattedContent, formattedSummary, article.id], (err) => {
                if (err) reject(err);
                else resolve();
              });
            });

            console.log(`✅ Updated article ${article.id}: ${article.title.substring(0, 50)}...`);
          }
        } else {
          console.log(`⚠️ Could not format article ${article.id}: ${article.title.substring(0, 50)}...`);
        }

      } catch (error) {
        console.error(`❌ Error formatting article ${article.id}:`, error.message);
        results.push({
          id: article.id,
          title: article.title,
          error: error.message
        });
      }
    }

    db.close();

    const summary = {
      totalProcessed: articles.length,
      totalFormatted: formattedCount,
      totalImproved: improvedCount,
      updated: dryRun ? 0 : improvedCount
    };

    console.log(`🎯 Formatting complete:`, summary);

    res.status(200).json({
      success: true,
      message: `Article formatting completed! ${summary.totalImproved} articles improved${dryRun ? ' (dry run)' : ' and updated'}.`,
      summary: summary,
      results: results.slice(0, 5) // Return first 5 for brevity
    });

  } catch (error) {
    console.error('❌ Article formatting error:', error);
    res.status(500).json({
      success: false,
      message: 'Error during article formatting',
      error: error.message
    });
  }
} 