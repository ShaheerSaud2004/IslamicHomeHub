const { OpenAI } = require('openai');

class TranslationService {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    
    // Token limits for different models
    this.maxInputTokens = 3000; // Conservative limit for input
    this.maxOutputTokens = 3000; // Conservative limit for output
    this.chunkSize = 2000; // Characters per chunk for long content
  }

  // Estimate token count (rough approximation: 1 token ≈ 4 characters for most languages)
  estimateTokenCount(text) {
    return Math.ceil(text.length / 4);
  }

  // Split text into chunks for translation
  splitTextIntoChunks(text, maxChunkSize = this.chunkSize) {
    if (!text || typeof text !== 'string') {
      return [''];
    }
    
    if (text.length <= maxChunkSize) {
      return [text];
    }

    const chunks = [];
    let currentChunk = '';
    const sentences = text.split(/[.!?。؟]/);

    for (const sentence of sentences) {
      if ((currentChunk + sentence).length <= maxChunkSize) {
        currentChunk += sentence + '.';
      } else {
        if (currentChunk) {
          chunks.push(currentChunk.trim());
        }
        currentChunk = sentence + '.';
      }
    }

    if (currentChunk) {
      chunks.push(currentChunk.trim());
    }

    return chunks;
  }

  // Detect language of text
  async detectLanguage(text) {
    try {
      const sampleText = text.substring(0, 200);
      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{
          role: 'system',
          content: 'You are a language detection expert. Respond with only the language name in English (e.g., "Arabic", "English", "French", etc.).'
        }, {
          role: 'user',
          content: `Detect the language of this text: "${sampleText}"`
        }],
        max_tokens: 10,
        temperature: 0
      });

      return response.choices[0].message.content.trim();
    } catch (error) {
      console.error('Error detecting language:', error);
      return 'Unknown';
    }
  }

  // Translate text to target language with chunking support
  async translateText(text, fromLang, toLang) {
    try {
      if (!text || text.trim().length === 0) {
        return text;
      }

      if (fromLang.toLowerCase() === toLang.toLowerCase()) {
        return text; // No translation needed
      }

      // Check if text is too long and needs chunking
      const estimatedTokens = this.estimateTokenCount(text);
      
      if (estimatedTokens > this.maxInputTokens) {
        return await this.translateLongText(text, fromLang, toLang);
      }

      // Calculate safe max_tokens for output
      const outputTokens = Math.min(
        Math.max(200, Math.ceil(estimatedTokens * 1.2)), // Allow 20% expansion
        this.maxOutputTokens
      );

      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{
          role: 'system',
          content: `You are a professional translator. Translate the following text from ${fromLang} to ${toLang}. Maintain the meaning, tone, and style of the original text. Keep the translation concise but accurate.`
        }, {
          role: 'user',
          content: text
        }],
        max_tokens: outputTokens,
        temperature: 0.3
      });

      return response.choices[0].message.content.trim();
    } catch (error) {
      console.error('Error translating text:', error);
      
      // If it's a token limit error, try with shorter content
      if (error.message && error.message.includes('max_tokens')) {
        try {
          return await this.translateLongText(text, fromLang, toLang);
        } catch (retryError) {
          console.error('Error in retry translation:', retryError);
          return text; // Return original text if all attempts fail
        }
      }
      
      return text; // Return original text if translation fails
    }
  }

  // Handle translation of long text by chunking
  async translateLongText(text, fromLang, toLang) {
    try {
      const chunks = this.splitTextIntoChunks(text);
      const translatedChunks = [];

      for (const chunk of chunks) {
        if (chunk.trim().length === 0) continue;

        const estimatedTokens = this.estimateTokenCount(chunk);
        const outputTokens = Math.min(
          Math.max(100, Math.ceil(estimatedTokens * 1.2)),
          this.maxOutputTokens
        );

        const response = await this.openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [{
            role: 'system',
            content: `You are a professional translator. Translate the following text chunk from ${fromLang} to ${toLang}. Maintain the meaning and style.`
          }, {
            role: 'user',
            content: chunk
          }],
          max_tokens: outputTokens,
          temperature: 0.3
        });

        translatedChunks.push(response.choices[0].message.content.trim());
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      return translatedChunks.join(' ');
    } catch (error) {
      console.error('Error in long text translation:', error);
      
      // Fallback: try to translate just the first part
      const shortText = text.substring(0, 1000);
      try {
        const response = await this.openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [{
            role: 'system',
            content: `Translate this text from ${fromLang} to ${toLang}. If the text is cut off, provide a good translation of what's available.`
          }, {
            role: 'user',
            content: shortText
          }],
          max_tokens: 500,
          temperature: 0.3
        });

        const partialTranslation = response.choices[0].message.content.trim();
        return partialTranslation + (text.length > 1000 ? ' [Content truncated due to length]' : '');
      } catch (fallbackError) {
        console.error('Fallback translation failed:', fallbackError);
        return text;
      }
    }
  }

  // Translate an entire article
  async translateArticle(article, targetLang = 'English') {
    try {
      // Clean up the article content first
      const cleanTitle = this.cleanText(article.title || '');
      const cleanSummary = this.cleanText(article.summary || '');
      const cleanContent = this.cleanText(article.content || '');

      // Detect the original language from title and summary
      const textToDetect = cleanTitle + ' ' + cleanSummary;
      const originalLang = await this.detectLanguage(textToDetect);
      
      console.log(`Detected language: ${originalLang} for article: ${cleanTitle.substring(0, 50)}...`);
      
      if (originalLang.toLowerCase() === targetLang.toLowerCase() || originalLang === 'Unknown') {
        return {
          ...article,
          translatedTitle: cleanTitle,
          translatedSummary: cleanSummary,
          translatedContent: cleanContent,
          originalLanguage: originalLang,
          translatedLanguage: targetLang,
          isTranslated: false
        };
      }

      // Translate title, summary, and content
      console.log('Starting translation...');
      
      const [translatedTitle, translatedSummary] = await Promise.all([
        this.translateText(cleanTitle, originalLang, targetLang),
        this.translateText(cleanSummary, originalLang, targetLang)
      ]);

      // Translate content separately (it might be very long)
      let translatedContent = cleanContent;
      if (cleanContent && cleanContent.length > 0) {
        console.log(`Translating content (${cleanContent.length} characters)...`);
        translatedContent = await this.translateText(cleanContent, originalLang, targetLang);
      }

      console.log('Translation completed successfully');

      return {
        ...article,
        translatedTitle,
        translatedSummary,
        translatedContent,
        originalLanguage: originalLang,
        translatedLanguage: targetLang,
        isTranslated: true
      };
    } catch (error) {
      console.error('Error translating article:', error);
      return {
        ...article,
        translatedTitle: this.cleanText(article.title || ''),
        translatedSummary: this.cleanText(article.summary || ''),
        translatedContent: this.cleanText(article.content || ''),
        originalLanguage: 'Unknown',
        translatedLanguage: targetLang,
        isTranslated: false,
        translationError: error.message
      };
    }
  }

  // Clean text by removing URL encoding and other artifacts
  cleanText(text) {
    if (!text) return '';
    
    // Remove URL encoded content that's not readable
    let cleaned = text.replace(/https:\/\/[^\s]*%[0-9A-F]{2}[^\s]*/gi, '');
    
    // Remove excessive URL encoding patterns
    cleaned = cleaned.replace(/%[0-9A-F]{2}/g, '');
    
    // Clean up extra whitespace
    cleaned = cleaned.replace(/\s+/g, ' ').trim();
    
    return cleaned;
  }

  // Get list of supported languages
  getSupportedLanguages() {
    return [
      { code: 'en', name: 'English', flag: '🇺🇸' },
      { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
      { code: 'ur', name: 'Urdu', flag: '🇵🇰' },
      { code: 'tr', name: 'Turkish', flag: '🇹🇷' },
      { code: 'fa', name: 'Persian', flag: '🇮🇷' },
      { code: 'id', name: 'Indonesian', flag: '🇮🇩' },
      { code: 'ms', name: 'Malay', flag: '🇲🇾' },
      { code: 'bn', name: 'Bengali', flag: '🇧🇩' },
      { code: 'fr', name: 'French', flag: '🇫🇷' },
      { code: 'es', name: 'Spanish', flag: '🇪🇸' },
      { code: 'de', name: 'German', flag: '🇩🇪' },
      { code: 'ru', name: 'Russian', flag: '🇷🇺' },
      { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
      { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
      { code: 'sw', name: 'Swahili', flag: '🇰🇪' }
    ];
  }
}

module.exports = new TranslationService(); 