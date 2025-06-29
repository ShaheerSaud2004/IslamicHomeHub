const fs = require('fs-extra');
const path = require('path');
const matter = require('gray-matter');
const slug = require('slug');

class MarkdownStorageService {
  constructor() {
    this.articlesDir = process.env.ARTICLES_MD_DIR || './articles';
    this.enableStorage = process.env.ENABLE_MD_STORAGE === 'true';
    
    if (this.enableStorage) {
      this.ensureDirectories();
    }
  }

  ensureDirectories() {
    // Create main articles directory
    fs.ensureDirSync(this.articlesDir);
    
    // Create category subdirectories
    const categories = [
      'religious', 'politics', 'community', 'education', 
      'culture', 'economics', 'health', 'technology', 'world', 'sports'
    ];
    
    categories.forEach(category => {
      fs.ensureDirSync(path.join(this.articlesDir, category));
    });
    
    // Create year/month directories for better organization
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    
    categories.forEach(category => {
      fs.ensureDirSync(path.join(this.articlesDir, category, String(year)));
      fs.ensureDirSync(path.join(this.articlesDir, category, String(year), month));
    });
  }

  async saveArticleAsMarkdown(article) {
    if (!this.enableStorage) {
      return null;
    }

    try {
      // Generate filename
      const publishedDate = new Date(article.publishedAt);
      const year = publishedDate.getFullYear();
      const month = String(publishedDate.getMonth() + 1).padStart(2, '0');
      const day = String(publishedDate.getDate()).padStart(2, '0');
      
      const titleSlug = slug(article.title, { lower: true, strict: true });
      const filename = `${year}-${month}-${day}-${titleSlug}.md`;
      
      // Create category/year/month directory if it doesn't exist
      const categoryDir = path.join(
        this.articlesDir, 
        article.category.toLowerCase(), 
        String(year), 
        month
      );
      fs.ensureDirSync(categoryDir);
      
      const filepath = path.join(categoryDir, filename);
      
      // Create frontmatter
      const frontmatter = {
        title: article.title,
        summary: article.summary,
        url: article.url,
        source: {
          name: article.source.name,
          url: article.source.url,
          logo: article.source.logo
        },
        category: article.category,
        subcategory: article.subcategory,
        countries: article.countries,
        regions: article.regions,
        tags: article.tags,
        publishedAt: article.publishedAt,
        scrapedAt: new Date().toISOString(),
        imageUrl: article.imageUrl,
        author: article.author,
        language: article.language,
        sentiment: article.sentiment,
        importance: article.importance,
        readingTime: article.readingTime
      };

      // Create markdown content
      const markdownContent = this.createMarkdownContent(article, frontmatter);
      
      // Write file
      await fs.writeFile(filepath, markdownContent, 'utf8');
      
      console.log(`📄 Saved markdown: ${filepath}`);
      return filepath;

    } catch (error) {
      console.error('Error saving article as markdown:', error);
      return null;
    }
  }

  createMarkdownContent(article, frontmatter) {
    // Generate markdown file with frontmatter
    const content = matter.stringify(article.content, frontmatter);
    
    // Add additional sections
    let markdownContent = content;
    
    // Add summary section if different from content start
    if (article.summary && !article.content.startsWith(article.summary.substring(0, 50))) {
      markdownContent += '\n\n## Summary\n\n' + article.summary;
    }
    
    // Add source link
    markdownContent += `\n\n## Source\n\n[Read original article at ${article.source.name}](${article.url})`;
    
    // Add tags section
    if (article.tags && article.tags.length > 0) {
      markdownContent += '\n\n## Tags\n\n' + article.tags.map(tag => `#${tag}`).join(' ');
    }
    
    // Add countries/regions
    if (article.countries && article.countries.length > 0) {
      markdownContent += '\n\n## Countries\n\n' + article.countries.join(', ');
    }
    
    if (article.regions && article.regions.length > 0) {
      markdownContent += '\n\n## Regions\n\n' + article.regions.join(', ');
    }
    
    // Add metadata footer
    markdownContent += `\n\n---\n\n*Scraped on ${new Date().toISOString()} | Importance: ${article.importance}/10 | Sentiment: ${article.sentiment}*`;
    
    return markdownContent;
  }

  async readMarkdownArticle(filepath) {
    try {
      const content = await fs.readFile(filepath, 'utf8');
      const parsed = matter(content);
      
      return {
        frontmatter: parsed.data,
        content: parsed.content
      };
    } catch (error) {
      console.error('Error reading markdown file:', error);
      return null;
    }
  }

  async getAllMarkdownFiles() {
    if (!this.enableStorage) {
      return [];
    }

    const files = [];
    
    try {
      const categories = await fs.readdir(this.articlesDir);
      
      for (const category of categories) {
        const categoryPath = path.join(this.articlesDir, category);
        const stat = await fs.stat(categoryPath);
        
        if (stat.isDirectory()) {
          const categoryFiles = await this.getFilesRecursively(categoryPath);
          files.push(...categoryFiles.map(file => ({
            path: file,
            category,
            relativePath: path.relative(this.articlesDir, file)
          })));
        }
      }
    } catch (error) {
      console.error('Error reading markdown files:', error);
    }
    
    return files;
  }

  async getFilesRecursively(dir) {
    const files = [];
    const items = await fs.readdir(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = await fs.stat(fullPath);
      
      if (stat.isDirectory()) {
        const subFiles = await this.getFilesRecursively(fullPath);
        files.push(...subFiles);
      } else if (path.extname(item) === '.md') {
        files.push(fullPath);
      }
    }
    
    return files;
  }

  async generateIndex() {
    if (!this.enableStorage) {
      return;
    }

    try {
      const files = await this.getAllMarkdownFiles();
      
      // Group by category
      const categorized = {};
      
      for (const file of files) {
        if (!categorized[file.category]) {
          categorized[file.category] = [];
        }
        
        const article = await this.readMarkdownArticle(file.path);
        if (article) {
          categorized[file.category].push({
            title: article.frontmatter.title,
            path: file.relativePath,
            publishedAt: article.frontmatter.publishedAt,
            source: article.frontmatter.source?.name,
            importance: article.frontmatter.importance
          });
        }
      }
      
      // Sort by date within each category
      Object.keys(categorized).forEach(category => {
        categorized[category].sort((a, b) => 
          new Date(b.publishedAt) - new Date(a.publishedAt)
        );
      });
      
      // Generate index markdown
      let indexContent = '# Muslim News Archive\n\n';
      indexContent += `*Generated on ${new Date().toISOString()}*\n\n`;
      indexContent += `Total articles: ${files.length}\n\n`;
      
      // Table of contents
      indexContent += '## Categories\n\n';
      Object.keys(categorized).sort().forEach(category => {
        const count = categorized[category].length;
        indexContent += `- [${category.charAt(0).toUpperCase() + category.slice(1)}](#${category}) (${count} articles)\n`;
      });
      
      // Category sections
      Object.keys(categorized).sort().forEach(category => {
        indexContent += `\n## ${category.charAt(0).toUpperCase() + category.slice(1)}\n\n`;
        
        categorized[category].forEach(article => {
          const date = new Date(article.publishedAt).toLocaleDateString();
          const importance = '★'.repeat(Math.floor(article.importance / 2));
          indexContent += `- [${article.title}](${article.path}) - *${article.source}* - ${date} ${importance}\n`;
        });
      });
      
      // Write index file
      const indexPath = path.join(this.articlesDir, 'README.md');
      await fs.writeFile(indexPath, indexContent, 'utf8');
      
      console.log(`📚 Generated index at ${indexPath}`);
      
    } catch (error) {
      console.error('Error generating markdown index:', error);
    }
  }

  // Cleanup old files (optional)
  async cleanupOldFiles(daysToKeep = 30) {
    if (!this.enableStorage) {
      return;
    }

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
    
    try {
      const files = await this.getAllMarkdownFiles();
      
      for (const file of files) {
        const stat = await fs.stat(file.path);
        
        if (stat.mtime < cutoffDate) {
          await fs.unlink(file.path);
          console.log(`🗑️  Deleted old file: ${file.relativePath}`);
        }
      }
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
  }
}

module.exports = MarkdownStorageService; 