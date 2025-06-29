const NEWS_SOURCES = [
  {
    name: 'Al Jazeera English',
    url: 'https://www.aljazeera.com/news/',
    baseUrl: 'https://www.aljazeera.com',
    logo: 'https://www.aljazeera.com/wp-content/uploads/2019/05/Al-Jazeera-Logo.png',
    selectors: {
      articles: 'article',
      title: 'h3 a, h2 a, .article-card__title a',
      link: 'h3 a, h2 a, .article-card__title a',
      summary: '.article-card__summary, .article-teaser__summary',
      image: 'img',
      date: 'time, .article-card__date'
    },
    region: 'Middle East',
    language: 'en',
    priority: 1
  },
  {
    name: 'Middle East Eye',
    url: 'https://www.middleeasteye.net/news',
    baseUrl: 'https://www.middleeasteye.net',
    logo: 'https://www.middleeasteye.net/themes/custom/mee/logo.svg',
    selectors: {
      articles: '.article-card, .post',
      title: '.article-card__title a, h2 a',
      link: '.article-card__title a, h2 a',
      summary: '.article-card__standfirst, .excerpt',
      image: '.article-card__image img',
      date: '.article-card__date'
    },
    region: 'Middle East',
    language: 'en',
    priority: 1
  },
  {
    name: 'Arab News',
    url: 'https://www.arabnews.com/',
    baseUrl: 'https://www.arabnews.com',
    logo: 'https://www.arabnews.com/sites/default/files/styles/n_670_395/public/2019/03/26/1553593127364936600.jpg',
    selectors: {
      articles: '.post, article, .news-item',
      title: 'h2 a, h3 a, .entry-title a',
      link: 'h2 a, h3 a, .entry-title a',
      summary: '.entry-excerpt, .summary',
      image: '.featured-image img',
      date: '.entry-date, .date'
    },
    region: 'Middle East',
    language: 'en',
    priority: 1
  },
  {
    name: 'Islam21c',
    url: 'https://islam21c.com/news/',
    baseUrl: 'https://islam21c.com',
    logo: 'https://islam21c.com/wp-content/themes/islam21c/images/logo.png',
    selectors: {
      articles: '.post, article',
      title: 'h2 a, h3 a, .entry-title a',
      link: 'h2 a, h3 a, .entry-title a',
      summary: '.entry-summary, .post-excerpt',
      image: '.featured-image img, .post-thumbnail img',
      date: '.entry-date, .post-date'
    },
    region: 'Europe',
    language: 'en',
    priority: 1
  },
  {
    name: 'About Islam',
    url: 'https://aboutislam.net/category/news/',
    baseUrl: 'https://aboutislam.net',
    logo: 'https://aboutislam.net/wp-content/themes/aboutislam/images/logo.png',
    selectors: {
      articles: '.post, article',
      title: 'h2 a, .entry-title a',
      link: 'h2 a, .entry-title a',  
      summary: '.entry-excerpt, .post-excerpt',
      image: '.featured-image img',
      date: '.entry-date'
    },
    region: 'Global',
    language: 'en',
    priority: 1
  },
  {
    name: 'Muslim Matters',
    url: 'https://muslimmatters.org/',
    baseUrl: 'https://muslimmatters.org',
    logo: 'https://muslimmatters.org/wp-content/themes/muslimmatters/images/logo.png',
    selectors: {
      articles: '.post-item, article',
      title: '.post-title a, h2 a, h3 a',
      link: '.post-title a, h2 a, h3 a',
      summary: '.post-excerpt, .excerpt',
      image: '.post-thumbnail img',
      date: '.post-date, .date'
    },
    region: 'North America',
    language: 'en',
    priority: 1
  },
  {
    name: 'Dawn Pakistan',
    url: 'https://www.dawn.com/news',
    baseUrl: 'https://www.dawn.com',
    logo: 'https://www.dawn.com/_img/logo.png',
    selectors: {
      articles: '.story, article',
      title: '.story__title a, h2 a',
      link: '.story__title a, h2 a',
      summary: '.story__excerpt',
      image: '.story__media img',
      date: '.story__time'
    },
    region: 'South Asia',
    language: 'en',
    priority: 1
  },
  {
    name: 'IslamiCity',
    url: 'https://www.islamicity.org/category/news/',
    baseUrl: 'https://www.islamicity.org',
    logo: 'https://www.islamicity.org/logo.png',
    selectors: {
      articles: '.post, article',
      title: '.entry-title a, h2 a',
      link: '.entry-title a, h2 a',
      summary: '.entry-excerpt',
      image: '.post-thumbnail img',
      date: '.entry-date'
    },
    region: 'North America',
    language: 'en',
    priority: 1
  },
  {
    name: 'The Muslim News',
    url: 'https://www.muslimnews.co.uk/',
    baseUrl: 'https://www.muslimnews.co.uk',
    logo: 'https://www.muslimnews.co.uk/wp-content/themes/muslimnews/images/logo.png',
    selectors: {
      articles: '.post, article',
      title: 'h2 a, .entry-title a',
      link: 'h2 a, .entry-title a',
      summary: '.entry-excerpt',
      image: '.featured-image img',
      date: '.entry-date'
    },
    region: 'Europe',
    language: 'en',
    priority: 1
  },
  {
    name: 'The Islamic Monthly',
    url: 'https://www.theislamicmonthly.com/',
    baseUrl: 'https://www.theislamicmonthly.com',
    logo: 'https://www.theislamicmonthly.com/logo.png',
    selectors: {
      articles: '.post, article',
      title: 'h2 a, .entry-title a',
      link: 'h2 a, .entry-title a',
      summary: '.entry-excerpt',
      image: '.featured-image img',
      date: '.entry-date'
    },
    region: 'North America',
    language: 'en',
    priority: 2
  },
  {
    name: 'OnIslam',
    url: 'https://www.onislam.net/english/',
    baseUrl: 'https://www.onislam.net',
    logo: 'https://www.onislam.net/logo.png',
    selectors: {
      articles: '.post, article',
      title: 'h2 a, .entry-title a',
      link: 'h2 a, .entry-title a',
      summary: '.entry-excerpt',
      image: '.featured-image img',
      date: '.entry-date'
    },
    region: 'Global',
    language: 'en',
    priority: 2
  },
  {
    name: 'Crescent International',
    url: 'https://crescent-online.net/',
    baseUrl: 'https://crescent-online.net',
    logo: 'https://crescent-online.net/logo.png',
    selectors: {
      articles: '.post, article',
      title: 'h2 a, .entry-title a',
      link: 'h2 a, .entry-title a',
      summary: '.entry-excerpt',
      image: '.featured-image img',
      date: '.entry-date'
    },
    region: 'Global',
    language: 'en',
    priority: 2
  },
  {
    name: 'Anadolu Agency English',
    url: 'https://www.aa.com.tr/en/',
    baseUrl: 'https://www.aa.com.tr',
    logo: 'https://www.aa.com.tr/logo.png',
    selectors: {
      articles: '.post, article, .news-item',
      title: 'h2 a, h3 a, .entry-title a',
      link: 'h2 a, h3 a, .entry-title a',
      summary: '.entry-excerpt, .summary',
      image: '.featured-image img',
      date: '.entry-date'
    },
    region: 'Europe',
    language: 'en',
    priority: 2
  },
  {
    name: 'Press TV',
    url: 'https://www.presstv.ir/',
    baseUrl: 'https://www.presstv.ir',
    logo: 'https://www.presstv.ir/logo.png',
    selectors: {
      articles: '.post, article',
      title: 'h2 a, .entry-title a',
      link: 'h2 a, .entry-title a',
      summary: '.entry-excerpt',
      image: '.featured-image img',
      date: '.entry-date'
    },
    region: 'Middle East',
    language: 'en',
    priority: 2
  },
  {
    name: 'TRT World',
    url: 'https://www.trtworld.com/',
    baseUrl: 'https://www.trtworld.com',
    logo: 'https://www.trtworld.com/logo.png',
    selectors: {
      articles: '.post, article',
      title: 'h2 a, .entry-title a',
      link: 'h2 a, .entry-title a',
      summary: '.entry-excerpt',
      image: '.featured-image img',
      date: '.entry-date'
    },
    region: 'Europe',
    language: 'en',
    priority: 2
  },
  {
    name: 'The Daily Star',
    url: 'https://www.thedailystar.net/',
    baseUrl: 'https://www.thedailystar.net',
    logo: 'https://www.thedailystar.net/logo.png',
    selectors: {
      articles: '.post, article',
      title: 'h2 a, .entry-title a',
      link: 'h2 a, .entry-title a',
      summary: '.entry-excerpt',
      image: '.featured-image img',
      date: '.entry-date'
    },
    region: 'South Asia',
    language: 'en',
    priority: 2
  },
  {
    name: 'New Straits Times',
    url: 'https://www.nst.com.my/',
    baseUrl: 'https://www.nst.com.my',
    logo: 'https://www.nst.com.my/logo.png',
    selectors: {
      articles: '.post, article',
      title: 'h2 a, .entry-title a',
      link: 'h2 a, .entry-title a',
      summary: '.entry-excerpt',
      image: '.featured-image img',
      date: '.entry-date'
    },
    region: 'Southeast Asia',
    language: 'en',
    priority: 2
  },
  {
    name: 'Jakarta Post',
    url: 'https://www.thejakartapost.com/',
    baseUrl: 'https://www.thejakartapost.com',
    logo: 'https://www.thejakartapost.com/logo.png',
    selectors: {
      articles: '.post, article',
      title: 'h2 a, .entry-title a',
      link: 'h2 a, .entry-title a',
      summary: '.entry-excerpt',
      image: '.featured-image img',
      date: '.entry-date'
    },
    region: 'Southeast Asia',
    language: 'en',
    priority: 2
  }
];

const CATEGORIES = [
  'Religious',
  'Politics',
  'Community',
  'Education',
  'Culture',
  'Economics',
  'Health',
  'Technology',
  'World',
  'Sports'
];

const REGIONS = [
  'Middle East',
  'South Asia',
  'Southeast Asia',
  'Europe',
  'North Africa',
  'Sub-Saharan Africa',
  'North America',
  'South America',
  'Central Asia',
  'Oceania'
];

const COUNTRY_TO_REGION = {
  // Middle East
  'Saudi Arabia': 'Middle East',
  'UAE': 'Middle East',
  'Qatar': 'Middle East',
  'Kuwait': 'Middle East',
  'Bahrain': 'Middle East',
  'Oman': 'Middle East',
  'Yemen': 'Middle East',
  'Iraq': 'Middle East',
  'Syria': 'Middle East',
  'Lebanon': 'Middle East',
  'Jordan': 'Middle East',
  'Palestine': 'Middle East',
  'Israel': 'Middle East',
  'Iran': 'Middle East',
  'Turkey': 'Middle East',
  
  // South Asia
  'Pakistan': 'South Asia',
  'India': 'South Asia',
  'Bangladesh': 'South Asia',
  'Afghanistan': 'South Asia',
  'Maldives': 'South Asia',
  'Sri Lanka': 'South Asia',
  
  // Southeast Asia
  'Indonesia': 'Southeast Asia',
  'Malaysia': 'Southeast Asia',
  'Brunei': 'Southeast Asia',
  'Thailand': 'Southeast Asia',
  'Philippines': 'Southeast Asia',
  'Singapore': 'Southeast Asia',
  
  // North Africa
  'Egypt': 'North Africa',
  'Libya': 'North Africa',
  'Tunisia': 'North Africa',
  'Algeria': 'North Africa',
  'Morocco': 'North Africa',
  'Sudan': 'North Africa',
  
  // Sub-Saharan Africa
  'Nigeria': 'Sub-Saharan Africa',
  'Senegal': 'Sub-Saharan Africa',
  'Mali': 'Sub-Saharan Africa',
  'Niger': 'Sub-Saharan Africa',
  'Chad': 'Sub-Saharan Africa',
  'Somalia': 'Sub-Saharan Africa',
  'Djibouti': 'Sub-Saharan Africa',
  
  // Europe
  'United Kingdom': 'Europe',
  'France': 'Europe',
  'Germany': 'Europe',
  'Netherlands': 'Europe',
  'Belgium': 'Europe',
  'Sweden': 'Europe',
  'Norway': 'Europe',
  'Denmark': 'Europe',
  'Switzerland': 'Europe',
  'Austria': 'Europe',
  'Bosnia and Herzegovina': 'Europe',
  'Albania': 'Europe',
  'Kosovo': 'Europe',
  
  // North America
  'United States': 'North America',
  'Canada': 'North America',
  'Mexico': 'North America',
  
  // Central Asia
  'Kazakhstan': 'Central Asia',
  'Uzbekistan': 'Central Asia',
  'Turkmenistan': 'Central Asia',
  'Tajikistan': 'Central Asia',
  'Kyrgyzstan': 'Central Asia',
  'Azerbaijan': 'Central Asia'
};

module.exports = {
  NEWS_SOURCES,
  CATEGORIES,
  REGIONS,
  COUNTRY_TO_REGION
}; 