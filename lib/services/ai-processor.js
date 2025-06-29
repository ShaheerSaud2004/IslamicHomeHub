const { OpenAI } = require('openai');
const { CATEGORIES, COUNTRY_TO_REGION } = require('../config/sources');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function categorizeAndSummarize(title, content) {
  try {
    // Truncate content if too long (to stay within token limits)
    const maxContentLength = 8000;
    const truncatedContent = content.length > maxContentLength 
      ? content.substring(0, maxContentLength) + '...'
      : content;

    const prompt = `
You are an AI assistant specializing in Islamic and Muslim news categorization. Analyze the following news article and provide a detailed JSON response.

Title: ${title}
Content: ${truncatedContent}

Please provide a JSON response with the following structure:
{
  "category": "string", // Choose from: ${CATEGORIES.join(', ')}
  "subcategory": "string", // A more specific subcategory if applicable
  "summary": "string", // A concise 2-3 sentence summary
  "countries": ["string"], // Array of countries mentioned or relevant to the article
  "regions": ["string"], // Array of regions based on the countries
  "tags": ["string"], // 3-5 relevant tags for the article
  "sentiment": "string", // "positive", "negative", or "neutral"
  "importance": number, // Scale of 1-10 based on newsworthiness and impact
  "isIslamic": boolean // Whether this article is relevant to Muslim/Islamic topics
}

Guidelines:
- For category, choose the most appropriate from the provided list
- Countries should be full country names (e.g., "United States", "Saudi Arabia")
- Regions will be auto-mapped from countries
- Tags should be lowercase and relevant to Islamic/Muslim context
- Importance: 1-3 (low), 4-6 (medium), 7-8 (high), 9-10 (breaking/critical)
- Only include articles that are relevant to Muslim communities or Islamic topics
- If not Islamic/Muslim related, set isIslamic to false

Respond only with valid JSON.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are an expert at categorizing and summarizing Islamic and Muslim news articles. Always respond with valid JSON only."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 800
    });

    const responseText = completion.choices[0].message.content.trim();
    
    // Try to parse JSON response
    let result;
    try {
      result = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', responseText);
      // Fallback to default values
      result = {
        category: 'World',
        subcategory: null,
        summary: generateFallbackSummary(title, content),
        countries: [],
        regions: [],
        tags: [],
        sentiment: 'neutral',
        importance: 5,
        isIslamic: true
      };
    }

    // Validate and clean up the result
    result = validateAndCleanResult(result);

    // Map countries to regions
    result.regions = mapCountriesToRegions(result.countries);

    return result;

  } catch (error) {
    console.error('Error in AI categorization:', error);
    
    // Return fallback result
    return {
      category: 'World',
      subcategory: null,
      summary: generateFallbackSummary(title, content),
      countries: [],
      regions: [],
      tags: [],
      sentiment: 'neutral',
      importance: 5,
      isIslamic: true
    };
  }
}

function validateAndCleanResult(result) {
  // Ensure category is valid
  if (!CATEGORIES.includes(result.category)) {
    result.category = 'World';
  }

  // Ensure arrays are arrays
  result.countries = Array.isArray(result.countries) ? result.countries : [];
  result.regions = Array.isArray(result.regions) ? result.regions : [];
  result.tags = Array.isArray(result.tags) ? result.tags : [];

  // Ensure sentiment is valid
  if (!['positive', 'negative', 'neutral'].includes(result.sentiment)) {
    result.sentiment = 'neutral';
  }

  // Ensure importance is a number between 1-10
  if (typeof result.importance !== 'number' || result.importance < 1 || result.importance > 10) {
    result.importance = 5;
  }

  // Ensure summary exists
  if (!result.summary || typeof result.summary !== 'string') {
    result.summary = 'No summary available.';
  }

  // Ensure isIslamic is boolean
  if (typeof result.isIslamic !== 'boolean') {
    result.isIslamic = true;
  }

  // Clean up tags
  result.tags = result.tags
    .filter(tag => typeof tag === 'string' && tag.trim().length > 0)
    .map(tag => tag.toLowerCase().trim())
    .slice(0, 5); // Limit to 5 tags

  return result;
}

function mapCountriesToRegions(countries) {
  const regions = new Set();
  
  countries.forEach(country => {
    const region = COUNTRY_TO_REGION[country];
    if (region) {
      regions.add(region);
    }
  });
  
  return Array.from(regions);
}

function generateFallbackSummary(title, content) {
  // Generate a simple summary by taking first few sentences
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 20);
  const summary = sentences.slice(0, 2).join('. ').trim();
  
  if (summary.length > 300) {
    return summary.substring(0, 300) + '...';
  }
  
  return summary || title;
}

async function enhanceArticleWithAI(article) {
  try {
    const prompt = `
Enhance this news article with additional insights:

Title: ${article.title}
Content: ${article.content.substring(0, 2000)}...
Current Category: ${article.category}
Current Countries: ${article.countries.join(', ')}

Please provide a JSON response with enhanced information:
{
  "enhancedSummary": "string", // A more detailed summary
  "keyPoints": ["string"], // 3-5 key points from the article
  "relatedTopics": ["string"], // Related Islamic/Muslim topics
  "significance": "string", // Why this news is significant for Muslim communities
  "recommendedReading": ["string"] // Related topics to explore further
}

Respond only with valid JSON.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are an expert at providing insights on Islamic and Muslim news articles."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 600
    });

    const result = JSON.parse(completion.choices[0].message.content.trim());
    return result;

  } catch (error) {
    console.error('Error enhancing article with AI:', error);
    return {
      enhancedSummary: article.summary,
      keyPoints: [],
      relatedTopics: [],
      significance: '',
      recommendedReading: []
    };
  }
}

module.exports = {
  categorizeAndSummarize,
  enhanceArticleWithAI
}; 