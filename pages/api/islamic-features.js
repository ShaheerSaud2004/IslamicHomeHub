const IslamicFeaturesService = require('../../lib/services/islamic-features');

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method GET required' });
  }

  try {
    const islamicService = new IslamicFeaturesService();
    const { feature, latitude, longitude, method } = req.query;

    switch (feature) {
      case 'prayer-times':
        if (!latitude || !longitude) {
          return res.status(400).json({ 
            success: false, 
            message: 'Latitude and longitude are required for prayer times' 
          });
        }
        
        const prayerTimes = await islamicService.getPrayerTimes(
          parseFloat(latitude), 
          parseFloat(longitude), 
          parseInt(method) || 2
        );
        
        return res.status(200).json({
          success: true,
          data: prayerTimes
        });

      case 'islamic-date':
        const islamicDate = await islamicService.getIslamicDate();
        return res.status(200).json({
          success: true,
          data: islamicDate
        });

      case 'verse-of-the-day':
        const verse = await islamicService.getVerseOfTheDay();
        return res.status(200).json({
          success: true,
          data: verse
        });

      case 'hadith-of-the-day':
        const hadith = await islamicService.getHadithOfTheDay();
        return res.status(200).json({
          success: true,
          data: hadith
        });

      case 'islamic-events':
        const events = await islamicService.getIslamicEvents();
        return res.status(200).json({
          success: true,
          data: events
        });

      case 'qibla-direction':
        if (!latitude || !longitude) {
          return res.status(400).json({ 
            success: false, 
            message: 'Latitude and longitude are required for qibla direction' 
          });
        }
        
        const qiblaDirection = islamicService.calculateQiblaDirection(
          parseFloat(latitude), 
          parseFloat(longitude)
        );
        
        return res.status(200).json({
          success: true,
          data: qiblaDirection
        });

      case 'dashboard':
        // Get all Islamic features for dashboard
        const dashboardData = {};
        
        if (latitude && longitude) {
          dashboardData.prayerTimes = await islamicService.getPrayerTimes(
            parseFloat(latitude), 
            parseFloat(longitude)
          );
          dashboardData.qiblaDirection = islamicService.calculateQiblaDirection(
            parseFloat(latitude), 
            parseFloat(longitude)
          );
        }
        
        dashboardData.islamicDate = await islamicService.getIslamicDate();
        dashboardData.verseOfTheDay = await islamicService.getVerseOfTheDay();
        dashboardData.hadithOfTheDay = await islamicService.getHadithOfTheDay();
        dashboardData.islamicEvents = await islamicService.getIslamicEvents();
        
        return res.status(200).json({
          success: true,
          data: dashboardData
        });

      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid feature requested. Available: prayer-times, islamic-date, verse-of-the-day, hadith-of-the-day, islamic-events, qibla-direction, dashboard'
        });
    }

  } catch (error) {
    console.error('Islamic features API error:', error);
    res.status(500).json({
      success: false,
      message: 'Islamic features request failed',
      error: error.message
    });
  }
} 