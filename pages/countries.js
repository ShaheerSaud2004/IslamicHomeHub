import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { 
  Globe, MapPin, Users, Clock, ChevronRight, 
  ArrowLeft, Building, Star, Tag, TrendingUp 
} from 'lucide-react';

export default function Countries() {
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [countryArticles, setCountryArticles] = useState([]);
  const [loadingArticles, setLoadingArticles] = useState(false);

  // Regional organization for Muslim countries
  const regions = {
    'Middle East': {
      flag: '🕌',
      description: 'Heart of the Islamic world',
      color: 'text-green-600',
      bg: 'bg-green-50',
      countries: ['Saudi Arabia', 'UAE', 'Qatar', 'Kuwait', 'Bahrain', 'Oman', 'Yemen', 'Iraq', 'Syria', 'Lebanon', 'Jordan', 'Palestine', 'Iran', 'Turkey']
    },
    'South Asia': {
      flag: '🏔️',
      description: 'Largest Muslim populations',
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      countries: ['Pakistan', 'India', 'Bangladesh', 'Afghanistan', 'Maldives', 'Sri Lanka']
    },
    'Southeast Asia': {
      flag: '🌺',
      description: 'Growing Muslim communities',
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      countries: ['Indonesia', 'Malaysia', 'Brunei', 'Thailand', 'Philippines', 'Singapore']
    },
    'North Africa': {
      flag: '🏺',
      description: 'Islamic heritage sites',
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      countries: ['Egypt', 'Libya', 'Tunisia', 'Algeria', 'Morocco', 'Sudan']
    },
    'Sub-Saharan Africa': {
      flag: '🦁',
      description: 'Expanding Muslim presence',
      color: 'text-orange-600',
      bg: 'bg-orange-50',
      countries: ['Nigeria', 'Senegal', 'Mali', 'Niger', 'Chad', 'Somalia', 'Djibouti']
    },
    'Europe': {
      flag: '🏰',
      description: 'Muslim minorities & converts',
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
      countries: ['United Kingdom', 'France', 'Germany', 'Netherlands', 'Belgium', 'Sweden', 'Norway', 'Denmark', 'Bosnia and Herzegovina', 'Albania', 'Kosovo']
    },
    'North America': {
      flag: '🗽',
      description: 'Muslim diaspora communities',
      color: 'text-red-600',
      bg: 'bg-red-50',
      countries: ['United States', 'Canada', 'Mexico']
    },
    'Central Asia': {
      flag: '🏜️',
      description: 'Historic Silk Road nations',
      color: 'text-teal-600',
      bg: 'bg-teal-50',
      countries: ['Kazakhstan', 'Uzbekistan', 'Turkmenistan', 'Tajikistan', 'Kyrgyzstan', 'Azerbaijan']
    }
  };

  // Country information with flags and descriptions
  const countryInfo = {
    'Saudi Arabia': { flag: '🇸🇦', description: 'Guardian of the Two Holy Mosques' },
    'UAE': { flag: '🇦🇪', description: 'Modern Islamic finance hub' },
    'Qatar': { flag: '🇶🇦', description: 'Host of Islamic conferences' },
    'Kuwait': { flag: '🇰🇼', description: 'Philanthropic Islamic nation' },
    'Pakistan': { flag: '🇵🇰', description: 'World\'s second-largest Muslim population' },
    'Indonesia': { flag: '🇮🇩', description: 'World\'s largest Muslim population' },
    'Malaysia': { flag: '🇲🇾', description: 'Islamic banking pioneer' },
    'Turkey': { flag: '🇹🇷', description: 'Bridge between East and West' },
    'Egypt': { flag: '🇪🇬', description: 'Al-Azhar center of Islamic learning' },
    'Morocco': { flag: '🇲🇦', description: 'Historic Islamic architecture' },
    'Bangladesh': { flag: '🇧🇩', description: 'Third-largest Muslim population' },
    'Iran': { flag: '🇮🇷', description: 'Center of Shia Islamic scholarship' },
    'Iraq': { flag: '🇮🇶', description: 'Historic center of Islamic civilization' },
    'Nigeria': { flag: '🇳🇬', description: 'Largest Muslim population in Africa' },
    'India': { flag: '🇮🇳', description: 'Large Muslim minority community' },
    'United States': { flag: '🇺🇸', description: 'Growing Muslim community' },
    'United Kingdom': { flag: '🇬🇧', description: 'Historic Muslim communities' },
    'France': { flag: '🇫🇷', description: 'Largest Muslim population in Europe' },
    'Germany': { flag: '🇩🇪', description: 'Growing Turkish Muslim community' },
    'Canada': { flag: '🇨🇦', description: 'Diverse Muslim diaspora' }
  };

  useEffect(() => {
    fetchCountries();
  }, []);

  const fetchCountries = async () => {
    try {
      const response = await fetch('/api/countries');
      const data = await response.json();
      if (data.success) {
        setCountries(data.data);
      }
    } catch (error) {
      console.error('Error fetching countries:', error);
    }
    setLoading(false);
  };

  const fetchCountryArticles = async (country) => {
    setLoadingArticles(true);
    try {
      const response = await fetch(`/api/news?country=${country}&limit=6`);
      const data = await response.json();
      if (data.success) {
        setCountryArticles(data.data.articles);
      }
    } catch (error) {
      console.error('Error fetching country articles:', error);
    }
    setLoadingArticles(false);
  };

  const handleCountryClick = (country) => {
    setSelectedCountry(country);
    fetchCountryArticles(country.name);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getRegionForCountry = (countryName) => {
    for (const [regionName, regionData] of Object.entries(regions)) {
      if (regionData.countries.includes(countryName)) {
        return regionName;
      }
    }
    return null;
  };

  const groupCountriesByRegion = () => {
    const groupedCountries = {};
    
    // Initialize regions
    Object.keys(regions).forEach(region => {
      groupedCountries[region] = [];
    });

    // Group countries by region
    countries.forEach(country => {
      const region = getRegionForCountry(country.name);
      if (region) {
        groupedCountries[region].push(country);
      }
    });

    return groupedCountries;
  };

  return (
    <>
      <Head>
        <title>Muslim Countries & Regions - Muslim News Hub</title>
        <meta name="description" content="Browse news by Muslim-majority countries and regions. Stay updated with news from across the Islamic world and Muslim communities globally." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-green-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-20">
              <div className="flex items-center space-x-4">
                <Link href="/" className="flex items-center text-gray-600 hover:text-green-600 transition-colors duration-200">
                  <ArrowLeft className="h-5 w-5 mr-2" />
                  Back to Home
                </Link>
              </div>
              
              <div className="flex items-center">
                <Globe className="h-10 w-10 text-green-600 mr-3" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Countries</h1>
                  <p className="text-sm text-green-600 font-medium">البلدان الإسلامية</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Page Header */}
          <div className="text-center mb-12 bg-white rounded-2xl shadow-lg p-8 border border-green-100">
            <Globe className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Muslim World & Communities
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Explore news from Muslim-majority countries and communities worldwide. Stay connected with the global Ummah.
            </p>
          </div>

          {selectedCountry ? (
            /* Country Detail View */
            <div>
              <button 
                onClick={() => setSelectedCountry(null)}
                className="mb-6 flex items-center text-green-600 hover:text-green-700 font-medium transition-colors duration-200"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Countries
              </button>

              <div className="bg-white rounded-2xl shadow-lg p-8 border border-green-100 mb-8">
                <div className="flex items-start space-x-6">
                  <div className="text-6xl">
                    {countryInfo[selectedCountry.name]?.flag || '🌍'}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-3">
                      <h1 className="text-3xl font-bold text-gray-900">{selectedCountry.name}</h1>
                      <span className="text-lg text-green-600 font-medium">
                        {getRegionForCountry(selectedCountry.name)}
                      </span>
                    </div>
                    <p className="text-lg text-gray-600 mb-4">
                      {countryInfo[selectedCountry.name]?.description || 'Important Muslim community'}
                    </p>
                    <div className="flex items-center space-x-6 text-sm text-gray-500">
                      <span className="flex items-center">
                        <Tag className="h-4 w-4 mr-2" />
                        {selectedCountry.count} articles
                      </span>
                      <span className="flex items-center">
                        <Clock className="h-4 w-4 mr-2" />
                        Updated daily
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Country Articles */}
              {loadingArticles ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="bg-white rounded-xl shadow-sm p-6 animate-pulse border border-gray-100">
                      <div className="h-4 bg-gray-200 rounded mb-4"></div>
                      <div className="h-3 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Latest News from {selectedCountry.name}</h2>
                    <Link 
                      href={`/?country=${selectedCountry.name}`}
                      className="text-green-600 hover:text-green-700 font-medium flex items-center transition-colors duration-200"
                    >
                      View All <ChevronRight className="h-4 w-4 ml-1" />
                    </Link>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {countryArticles.map(article => (
                      <Link 
                        href={`/article/${article._id}`} 
                        key={article._id}
                        className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100 hover:border-green-200 group"
                      >
                        <div className="p-6">
                          {article.imageUrl && (
                            <img 
                              src={article.imageUrl} 
                              alt={article.title}
                              className="w-full h-40 object-cover rounded-lg mb-4 group-hover:scale-105 transition-transform duration-300"
                              onError={(e) => { e.target.style.display = 'none' }}
                            />
                          )}
                          
                          <div className="flex items-center space-x-2 mb-3">
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                              {article.category}
                            </span>
                            {article.importance >= 8 && (
                              <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200 flex items-center">
                                <Star className="h-3 w-3 mr-1" />
                                مهم
                              </span>
                            )}
                          </div>
                          
                          <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-green-700 transition-colors duration-200">
                            {article.title}
                          </h3>

                          <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                            {article.summary}
                          </p>

                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span className="flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              {formatDate(article.publishedAt)}
                            </span>
                            <span className="text-green-600 font-medium bg-green-50 px-2 py-1 rounded">
                              {article.source.name}
                            </span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>

                  {countryArticles.length === 0 && (
                    <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
                      <Globe className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No articles found</h3>
                      <p className="text-gray-600">Check back later for new articles from {selectedCountry.name}.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            /* Countries by Region */
            <div>
              {loading ? (
                <div className="space-y-8">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                      <div className="h-6 bg-gray-200 rounded mb-4 w-48"></div>
                      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {[...Array(6)].map((_, j) => (
                          <div key={j} className="p-4 bg-gray-50 rounded-lg animate-pulse">
                            <div className="w-8 h-8 bg-gray-200 rounded mb-2"></div>
                            <div className="h-4 bg-gray-200 rounded mb-1"></div>
                            <div className="h-3 bg-gray-200 rounded"></div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-8">
                  {Object.entries(groupCountriesByRegion()).map(([regionName, regionCountries]) => {
                    const regionData = regions[regionName];
                    
                    if (regionCountries.length === 0) return null;
                    
                    return (
                      <div key={regionName} className="bg-white rounded-xl shadow-sm p-8 border border-gray-100">
                        <div className="flex items-center space-x-4 mb-6">
                          <div className="text-3xl">{regionData.flag}</div>
                          <div>
                            <h2 className="text-2xl font-bold text-gray-900">{regionName}</h2>
                            <p className="text-gray-600">{regionData.description}</p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                          {regionCountries.map(country => (
                            <button
                              key={country.name}
                              onClick={() => handleCountryClick(country)}
                              className={`p-4 rounded-xl text-left transition-all duration-200 border-2 hover:shadow-md ${regionData.bg} border-gray-200 hover:border-current group`}
                            >
                              <div className="text-3xl mb-2">
                                {countryInfo[country.name]?.flag || '🌍'}
                              </div>
                              <h3 className="font-semibold text-sm text-gray-900 mb-1 line-clamp-1">
                                {country.name}
                              </h3>
                              <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                                {countryInfo[country.name]?.description || 'Muslim community'}
                              </p>
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-500">
                                  {country.count} articles
                                </span>
                                <ChevronRight className={`h-4 w-4 ${regionData.color} group-hover:translate-x-1 transition-transform duration-300`} />
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {countries.length === 0 && !loading && (
                <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100">
                  <Globe className="h-20 w-20 text-gray-300 mx-auto mb-6" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">No countries available</h3>
                  <p className="text-gray-600">Countries will appear here once news articles are added.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="bg-gradient-to-r from-green-800 to-green-900 text-white py-12 mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <Building className="h-12 w-12 text-green-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Muslim News Hub</h3>
              <p className="text-green-200 mb-4">Connecting the Global Ummah Through News</p>
              <div className="flex justify-center space-x-8 text-sm">
                <Link href="/" className="text-green-300 hover:text-white transition-colors duration-200">Home</Link>
                <Link href="/categories" className="text-green-300 hover:text-white transition-colors duration-200">Categories</Link>
                <Link href="/countries" className="text-green-300 hover:text-white transition-colors duration-200">Countries</Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
} 