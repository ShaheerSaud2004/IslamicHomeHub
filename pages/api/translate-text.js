const translationService = require('../../lib/services/translation');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { text, targetLanguage = 'English' } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    console.log(`Translating text to ${targetLanguage}:`, text.substring(0, 100) + '...');

    // Detect the language first
    const detectedLanguage = await translationService.detectLanguage(text);
    console.log(`Detected language: ${detectedLanguage}`);

    // Translate the text
    const translatedText = await translationService.translateText(text, detectedLanguage, targetLanguage);

    res.status(200).json({
      success: true,
      originalText: text,
      translatedText,
      detectedLanguage,
      targetLanguage
    });

  } catch (error) {
    console.error('Translation API error:', error);
    res.status(500).json({ 
      error: 'Failed to translate text',
      message: error.message 
    });
  }
} 