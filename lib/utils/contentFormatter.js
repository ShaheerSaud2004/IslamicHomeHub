class ContentFormatter {
  constructor() {
    this.paragraphMinLength = 80;
    this.maxParagraphLength = 1200;
    this.sentenceMinLength = 15;
  }

  /**
   * Main function to clean and format article content
   */
  formatArticleContent(content, title = '') {
    if (!content || typeof content !== 'string') {
      return null;
    }

    // Don't process extremely short content
    if (content.trim().length < 50) {
      return null;
    }

    let formatted = content;

    try {
      // Step 1: Clean URL encoding and artifacts
      formatted = this.cleanUrlEncoding(formatted);
      
      // Step 2: Remove unwanted elements
      formatted = this.removeUnwantedElements(formatted);
      
      // Step 3: Fix spacing and formatting
      formatted = this.normalizeSpacing(formatted);
      
      // Step 4: Format paragraphs properly
      formatted = this.formatParagraphs(formatted);
      
      // Step 5: Add proper sentence structure
      formatted = this.improveSentenceFlow(formatted);
      
      // Step 6: Add paragraph breaks for readability
      formatted = this.addParagraphBreaks(formatted);
      
      // Step 7: Final cleanup and polishing
      formatted = this.finalCleanup(formatted);

      // Step 8: Validate and ensure minimum quality
      formatted = this.validateContent(formatted, title);

      return formatted;
    } catch (error) {
      console.error('Error formatting content:', error);
      // Return null instead of throwing to prevent crashes
      return null;
    }
  }

  /**
   * Clean URL encoding and decode special characters
   */
  cleanUrlEncoding(text) {
    // Remove URLs with heavy encoding that are unreadable
    text = text.replace(/https?:\/\/[^\s]*%[0-9A-F]{2}[^\s]*/gi, '');
    
    // Remove excessive URL encoding patterns
    text = text.replace(/%[0-9A-F]{2}/g, '');
    
    // Decode common HTML entities
    const entities = {
      '&amp;': '&',
      '&lt;': '<',
      '&gt;': '>',
      '&quot;': '"',
      '&#39;': "'",
      '&#x27;': "'",
      '&nbsp;': ' ',
      '&mdash;': '—',
      '&ndash;': '–',
      '&hellip;': '…',
      '&laquo;': '«',
      '&raquo;': '»',
      '&rsquo;': '\'',
      '&lsquo;': '\'',
      '&rdquo;': '"',
      '&ldquo;': '"'
    };

    Object.keys(entities).forEach(entity => {
      text = text.replace(new RegExp(entity, 'g'), entities[entity]);
    });

    return text;
  }

  /**
   * Remove unwanted HTML tags and elements
   */
  removeUnwantedElements(text) {
    // Remove script and style tags and their content
    text = text.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    text = text.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
    
    // Remove all HTML tags but keep their content
    text = text.replace(/<[^>]*>/g, '');
    
    // Remove comments
    text = text.replace(/<!--[\s\S]*?-->/g, '');
    
    // Remove specific navigation and website elements we've seen
    const unwantedPatterns = [
      /Back to Home/gi,
      /Share this article/gi,
      /Print this page/gi,
      /Translate.*?\)/gi,
      /Copyright.*?All rights reserved.*?\./gi,
      /The content.*?shall not be republished.*?\./gi,
      /Site Search.*?Most Popular/gi,
      /Topics Menu.*?one click away/gi,
      /Login.*?Status/gi,
      /Main Hubs.*?Home Pages/gi,
      /Welcome to.*?IslamiCity/gi,
      /Please wait.*?prepared this.*?\.\.\./gi,
      /Follow us on.*?/gi,
      /Subscribe.*?newsletter/gi,
      /Get AI Insights/gi,
      /Read Original Article/gi,
      /Visit the source.*?additional context/gi,
      /Visit Source/gi,
      /Related Articles?.*$/gi,
      /Sign up.*?newsletter/gi,
      /Click here to.*?/gi,
      /Read more.*?/gi,
      /_.*?_/g, // Remove underscores used in navigation
      /MOST RECENT.*?##/gi,
      /Most Contributing Authors.*?##/gi,
      /Inspiring Themes.*?tour/gi
    ];

    unwantedPatterns.forEach(pattern => {
      text = text.replace(pattern, '');
    });
    
    // Remove excessive exclamation marks and repeated characters
    text = text.replace(/!{3,}/g, '.');
    text = text.replace(/\.{4,}/g, '...');
    text = text.replace(/\?{2,}/g, '?');
    
    // Remove excessive markdown symbols that might be artifacts
    text = text.replace(/#{4,}/g, '');
    text = text.replace(/\*{3,}/g, '');
    text = text.replace(/-{4,}/g, '');
    
    // Remove URLs that are clearly navigation or ads
    const unwantedUrls = [
      /https?:\/\/[^\s]*facebook\.com[^\s]*/gi,
      /https?:\/\/[^\s]*twitter\.com[^\s]*/gi,
      /https?:\/\/[^\s]*instagram\.com[^\s]*/gi,
      /https?:\/\/[^\s]*youtube\.com[^\s]*/gi,
      /https?:\/\/[^\s]*wp-content[^\s]*/gi,
      /https?:\/\/[^\s]*\.jpg[^\s]*/gi,
      /https?:\/\/[^\s]*\.png[^\s]*/gi,
      /https?:\/\/[^\s]*\.gif[^\s]*/gi
    ];

    unwantedUrls.forEach(pattern => {
      text = text.replace(pattern, '');
    });
    
    return text;
  }

  /**
   * Normalize spacing and fix common formatting issues
   */
  normalizeSpacing(text) {
    // Fix multiple spaces
    text = text.replace(/[ \t]+/g, ' ');
    
    // Fix multiple line breaks (keep maximum of 2)
    text = text.replace(/\n{3,}/g, '\n\n');
    
    // Fix spacing around punctuation
    text = text.replace(/\s+([.!?,:;])/g, '$1');
    text = text.replace(/([.!?])\s*([A-Z])/g, '$1 $2');
    
    // Fix quotes and parentheses spacing
    text = text.replace(/\s+([)}\]])/g, '$1');
    text = text.replace(/([({[])\s+/g, '$1');
    
    // Remove extra spaces at line beginnings and ends
    text = text.replace(/^\s+/gm, '');
    text = text.replace(/\s+$/gm, '');
    
    return text.trim();
  }

  /**
   * Format content into proper paragraphs
   */
  formatParagraphs(text) {
    // Split into potential paragraphs
    let paragraphs = text.split(/\n\s*\n/);
    
    // Filter and clean paragraphs
    paragraphs = paragraphs
      .map(p => p.trim())
      .filter(p => p.length > 30) // Remove very short paragraphs
      .map(p => this.formatSingleParagraph(p))
      .filter(p => p && p.length > 20); // Remove empty or very short paragraphs
    
    // Merge very short paragraphs with the next one
    const mergedParagraphs = [];
    for (let i = 0; i < paragraphs.length; i++) {
      const current = paragraphs[i];
      const next = paragraphs[i + 1];
      
      if (current.length < this.paragraphMinLength && next && current.length + next.length < this.maxParagraphLength) {
        paragraphs[i + 1] = current + ' ' + next;
      } else {
        mergedParagraphs.push(current);
      }
    }
    
    return mergedParagraphs.join('\n\n');
  }

  /**
   * Format a single paragraph
   */
  formatSingleParagraph(paragraph) {
    // Remove any remaining HTML artifacts
    paragraph = paragraph.replace(/&[a-zA-Z0-9#]{2,8};/g, ' ');
    
    // Fix sentence spacing and capitalization
    paragraph = paragraph.replace(/\.\s*([a-z])/g, (match, letter) => '. ' + letter.toUpperCase());
    paragraph = paragraph.replace(/\?\s*([a-z])/g, (match, letter) => '? ' + letter.toUpperCase());
    paragraph = paragraph.replace(/!\s*([a-z])/g, (match, letter) => '! ' + letter.toUpperCase());
    
    // Ensure paragraph starts with capital letter
    if (paragraph.length > 0) {
      paragraph = paragraph.charAt(0).toUpperCase() + paragraph.slice(1);
    }
    
    // Ensure paragraph ends with proper punctuation
    if (paragraph.length > 50 && !/[.!?]$/.test(paragraph.trim())) {
      paragraph = paragraph.trim() + '.';
    }
    
    return paragraph.trim();
  }

  /**
   * Improve sentence flow and readability
   */
  improveSentenceFlow(text) {
    // Split into sentences
    let sentences = text.split(/(?<=[.!?])\s+/).filter(s => s.trim().length > this.sentenceMinLength);
    
    // Remove duplicate sentences
    const uniqueSentences = [];
    const seenSentences = new Set();
    
    for (const sentence of sentences) {
      const normalized = sentence.toLowerCase().replace(/\s+/g, ' ').trim();
      if (!seenSentences.has(normalized) && sentence.trim().length > this.sentenceMinLength) {
        seenSentences.add(normalized);
        uniqueSentences.push(sentence.trim());
      }
    }
    
    return uniqueSentences.join(' ');
  }

  /**
   * Add proper paragraph breaks for better readability
   */
  addParagraphBreaks(text) {
    // Split long blocks of text into readable paragraphs
    const sentences = text.split(/(?<=[.!?])\s+/);
    const paragraphs = [];
    let currentParagraph = [];
    let currentLength = 0;
    
    for (const sentence of sentences) {
      if (currentLength + sentence.length > this.maxParagraphLength && currentParagraph.length > 0) {
        paragraphs.push(currentParagraph.join(' '));
        currentParagraph = [sentence];
        currentLength = sentence.length;
      } else {
        currentParagraph.push(sentence);
        currentLength += sentence.length;
      }
    }
    
    if (currentParagraph.length > 0) {
      paragraphs.push(currentParagraph.join(' '));
    }
    
    return paragraphs.filter(p => p.trim().length > 50).join('\n\n');
  }

  /**
   * Final cleanup and formatting
   */
  finalCleanup(text) {
    // Remove any remaining markdown artifacts
    text = text.replace(/\[.*?\]\(.*?\)/g, ''); // Remove markdown links
    text = text.replace(/\*\*(.*?)\*\*/g, '$1'); // Remove bold markdown
    text = text.replace(/\*(.*?)\*/g, '$1'); // Remove italic markdown
    text = text.replace(/`(.*?)`/g, '$1'); // Remove code markdown
    
    // Fix common formatting issues
    text = text.replace(/\s+/g, ' '); // Normalize all whitespace
    text = text.replace(/\n{3,}/g, '\n\n'); // Max 2 line breaks
    
    // Remove common website footer text
    text = text.replace(/All rights reserved.*$/gi, '');
    text = text.replace(/Copyright.*$/gi, '');
    
    // Ensure proper paragraph spacing
    text = text.replace(/\n\n+/g, '\n\n');
    
    return text.trim();
  }

  /**
   * Validate and ensure minimum content quality
   */
  validateContent(text, title = '') {
    // Ensure minimum length
    if (text.length < 200) {
      return null; // Content too short
    }
    
    // Check for meaningful content (not just navigation or ads)
    const meaningfulWords = ['said', 'according', 'reported', 'announced', 'stated', 'explained', 'revealed', 'confirmed', 'shows', 'indicates'];
    const hasMeaningfulContent = meaningfulWords.some(word => text.toLowerCase().includes(word));
    
    if (!hasMeaningfulContent && text.length < 500) {
      return null; // Likely not a real article
    }
    
    // Remove title repetition at the beginning
    if (title && text.toLowerCase().startsWith(title.toLowerCase())) {
      text = text.substring(title.length).trim();
    }
    
    // Ensure content starts properly
    if (text.length > 0) {
      text = text.charAt(0).toUpperCase() + text.slice(1);
    }
    
    return text;
  }

  /**
   * Format title for better display
   */
  formatTitle(title) {
    if (!title) return '';
    
    let formatted = this.cleanUrlEncoding(title);
    formatted = this.removeUnwantedElements(formatted);
    formatted = formatted.replace(/\s+/g, ' ').trim();
    
    // Remove common prefixes/suffixes that might be artifacts
    formatted = formatted.replace(/^(.*?)\s*[-–|]\s*(.*)$/, '$1');
    formatted = formatted.replace(/\.\.\.$/, '');
    
    return formatted;
  }

  /**
   * Format summary for better display
   */
  formatSummary(summary, maxLength = 300) {
    if (!summary || typeof summary !== 'string') return '';
    
    let formatted = this.cleanUrlEncoding(summary);
    formatted = this.removeUnwantedElements(formatted);
    formatted = this.normalizeSpacing(formatted);
    
    // Ensure we have content after cleaning
    if (!formatted || formatted.trim().length === 0) {
      return '';
    }
    
    // Truncate if too long
    if (formatted.length > maxLength) {
      const truncated = formatted.substring(0, maxLength);
      const lastSentence = truncated.lastIndexOf('.');
      if (lastSentence > maxLength * 0.7) {
        formatted = truncated.substring(0, lastSentence + 1);
      } else {
        formatted = truncated.trim() + '...';
      }
    }
    
    return formatted;
  }

  /**
   * Check if text is primarily Arabic
   */
  isArabicText(text) {
    if (!text || typeof text !== 'string') return false;
    
    const arabicRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
    const arabicChars = text.match(arabicRegex);
    return arabicChars && arabicChars.length > text.length * 0.3;
  }

  /**
   * Format content specifically for Arabic text
   */
  formatArabicContent(content) {
    let formatted = this.formatArticleContent(content);
    
    // Add RTL direction hint for Arabic content
    if (this.isArabicText(formatted)) {
      // Ensure proper Arabic spacing
      formatted = formatted.replace(/\u200C/g, ''); // Remove zero-width non-joiners
      formatted = formatted.replace(/\u200D/g, ''); // Remove zero-width joiners
      formatted = formatted.replace(/[\u0600-\u06FF]\s+(?=[\u0600-\u06FF])/g, (match) => {
        return match.replace(/\s+/g, ' ');
      });
    }
    
    return formatted;
  }

  /**
   * Generate reading time estimate
   */
  calculateReadingTime(content, wordsPerMinute = 200) {
    if (!content) return 1;
    
    const cleanContent = this.formatArticleContent(content);
    
    // Handle case where formatArticleContent returns null
    if (!cleanContent) {
      // Fallback to using original content for word count
      const wordCount = content.split(/\s+/).filter(word => word.length > 0).length;
      return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
    }
    
    const wordCount = cleanContent.split(/\s+/).filter(word => word.length > 0).length;
    
    return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
  }

  /**
   * Extract the first meaningful paragraph as a preview
   */
  extractPreview(content, maxLength = 200) {
    if (!content) return '';
    
    const formatted = this.formatArticleContent(content);
    
    // Handle case where formatArticleContent returns null
    if (!formatted) {
      // Fallback to using original content
      return this.formatSummary(content.substring(0, maxLength * 2), maxLength);
    }
    
    const paragraphs = formatted.split('\n\n');
    
    for (const paragraph of paragraphs) {
      if (paragraph.trim().length > 50) {
        return this.formatSummary(paragraph, maxLength);
      }
    }
    
    return this.formatSummary(formatted, maxLength);
  }
}

// Export singleton instance
const contentFormatter = new ContentFormatter();

module.exports = {
  ContentFormatter,
  contentFormatter,
  
  // Utility functions for easy import
  formatContent: (content) => contentFormatter.formatArticleContent(content),
  formatTitle: (title) => contentFormatter.formatTitle(title),  
  formatSummary: (summary, maxLength) => contentFormatter.formatSummary(summary, maxLength),
  isArabicText: (text) => contentFormatter.isArabicText(text),
  calculateReadingTime: (content) => contentFormatter.calculateReadingTime(content),
  extractPreview: (content, maxLength) => contentFormatter.extractPreview(content, maxLength)
}; 