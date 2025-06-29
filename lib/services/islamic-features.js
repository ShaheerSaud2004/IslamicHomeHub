const axios = require('axios');

class IslamicFeaturesService {
  constructor() {
    this.prayerTimesAPI = 'https://api.aladhan.com/v1';
    this.islamicCalendarAPI = 'https://api.aladhan.com/v1';
    this.quranAPI = 'https://api.quran.com/api/v4';
    
    this.islamicMonths = [
      'Muharram', 'Safar', 'Rabi\' al-awwal', 'Rabi\' al-thani',
      'Jumada al-awwal', 'Jumada al-thani', 'Rajab', 'Sha\'ban',
      'Ramadan', 'Shawwal', 'Dhu al-Qi\'dah', 'Dhu al-Hijjah'
    ];
  }

  async getPrayerTimes(latitude, longitude, method = 2) {
    try {
      const response = await axios.get(
        `${this.prayerTimesAPI}/timings`, {
          params: {
            latitude,
            longitude,
            method, // 2 = Islamic Society of North America
            timestamp: Math.floor(Date.now() / 1000)
          }
        }
      );

      const timings = response.data.data.timings;
      return {
        fajr: timings.Fajr,
        sunrise: timings.Sunrise,
        dhuhr: timings.Dhuhr,
        asr: timings.Asr,
        maghrib: timings.Maghrib,
        isha: timings.Isha,
        date: response.data.data.date,
        location: { latitude, longitude }
      };
    } catch (error) {
      console.error('Prayer times error:', error);
      return null;
    }
  }

  async getIslamicDate() {
    try {
      const response = await axios.get(`${this.islamicCalendarAPI}/gToH`);
      const hijri = response.data.data.hijri;
      
      return {
        day: hijri.day,
        month: hijri.month.en,
        monthNumber: hijri.month.number,
        year: hijri.year,
        formatted: `${hijri.day} ${hijri.month.en} ${hijri.year} AH`,
        gregorian: response.data.data.gregorian
      };
    } catch (error) {
      console.error('Islamic date error:', error);
      return null;
    }
  }

  async getVerseOfTheDay() {
    try {
      // Get random verse (there are 6236 verses in Quran)
      const randomVerse = Math.floor(Math.random() * 6236) + 1;
      
      const response = await axios.get(
        `${this.quranAPI}/verses/by_key/${this.getVerseKey(randomVerse)}`, {
          params: {
            words: true,
            translations: 'en.sahih', // Sahih International translation
            fields: 'text_uthmani'
          }
        }
      );

      const verse = response.data.verse;
      return {
        arabicText: verse.text_uthmani,
        translation: verse.translations[0]?.text || '',
        reference: `Quran ${verse.verse_key}`,
        chapter: verse.chapter_id,
        verseNumber: verse.verse_number
      };
    } catch (error) {
      console.error('Verse of the day error:', error);
      return this.getFallbackVerse();
    }
  }

  getVerseKey(verseId) {
    // Simple mapping for demonstration - in production use proper verse indexing
    const chapter = Math.floor(verseId / 100) + 1;
    const verse = (verseId % 100) + 1;
    return `${chapter}:${verse}`;
  }

  getFallbackVerse() {
    return {
      arabicText: 'وَمَن يَتَّقِ اللَّهَ يَجْعَل لَّهُ مَخْرَجًا',
      translation: 'And whoever fears Allah - He will make for him a way out.',
      reference: 'Quran 65:2',
      chapter: 65,
      verseNumber: 2
    };
  }

  async getIslamicEvents() {
    const islamicDate = await this.getIslamicDate();
    if (!islamicDate) return [];

    const events = [];
    const { monthNumber, day } = islamicDate;

    // Major Islamic events
    const islamicEvents = {
      1: { // Muharram
        1: 'Islamic New Year',
        10: 'Day of Ashura'
      },
      3: { // Rabi' al-awwal  
        12: 'Mawlid an-Nabi (Prophet\'s Birthday)'
      },
      7: { // Rajab
        27: 'Isra and Mi\'raj (Night Journey)'
      },
      8: { // Sha'ban
        15: 'Laylat al-Bara\'at (Night of Forgiveness)'
      },
      9: { // Ramadan
        1: 'First Day of Ramadan',
        27: 'Laylat al-Qadr (Night of Power)'
      },
      10: { // Shawwal
        1: 'Eid al-Fitr'
      },
      12: { // Dhu al-Hijjah
        8: 'Day of Arafah',
        10: 'Eid al-Adha',
        11: 'Day of Tashreeq (1st)',
        12: 'Day of Tashreeq (2nd)', 
        13: 'Day of Tashreeq (3rd)'
      }
    };

    // Check for current day events
    if (islamicEvents[monthNumber] && islamicEvents[monthNumber][day]) {
      events.push({
        name: islamicEvents[monthNumber][day],
        date: islamicDate.formatted,
        isToday: true
      });
    }

    // Check for upcoming events (next 30 days)
    for (let i = 1; i <= 30; i++) {
      const futureDay = day + i;
      if (islamicEvents[monthNumber] && islamicEvents[monthNumber][futureDay]) {
        events.push({
          name: islamicEvents[monthNumber][futureDay],
          date: `${futureDay} ${islamicDate.month} ${islamicDate.year} AH`,
          daysUntil: i
        });
      }
    }

    return events;
  }

  async getHadithOfTheDay() {
    // Fallback hadith collection - in production, integrate with hadith API
    const hadiths = [
      {
        text: 'The Prophet (ﷺ) said: "The believer who mixes with people and bears their annoyance with patience will have a greater reward than the believer who does not mix with people and does not patiently bear their annoyance."',
        reference: 'Sunan Ibn Majah 4032',
        narrator: 'Ibn Umar'
      },
      {
        text: 'The Prophet (ﷺ) said: "None of you truly believes until he loves for his brother what he loves for himself."',
        reference: 'Sahih al-Bukhari 13',
        narrator: 'Anas ibn Malik'
      },
      {
        text: 'The Prophet (ﷺ) said: "Allah does not judge according to your bodies and appearances but He scans your hearts and looks into your deeds."',
        reference: 'Sahih Muslim 2564',
        narrator: 'Abu Huraira'
      }
    ];

    const randomIndex = Math.floor(Math.random() * hadiths.length);
    return hadiths[randomIndex];
  }

  calculateQiblaDirection(latitude, longitude) {
    // Kaaba coordinates
    const kaabaLat = 21.4225;
    const kaabaLng = 39.8262;

    const lat1 = latitude * Math.PI / 180;
    const lat2 = kaabaLat * Math.PI / 180;
    const deltaLng = (kaabaLng - longitude) * Math.PI / 180;

    const y = Math.sin(deltaLng) * Math.cos(lat2);
    const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(deltaLng);

    let bearing = Math.atan2(y, x) * 180 / Math.PI;
    bearing = (bearing + 360) % 360;

    return {
      degrees: Math.round(bearing),
      direction: this.getCompassDirection(bearing),
      distance: this.calculateDistance(latitude, longitude, kaabaLat, kaabaLng)
    };
  }

  getCompassDirection(degrees) {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const index = Math.round(degrees / 22.5) % 16;
    return directions[index];
  }

  calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return Math.round(R * c);
  }
}

module.exports = IslamicFeaturesService; 