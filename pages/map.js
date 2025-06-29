import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import WorldMap from '../components/WorldMap';

// Import individual icons to avoid barrel import issues
import MapPin from 'lucide-react/dist/esm/icons/map-pin';
import ArrowLeft from 'lucide-react/dist/esm/icons/arrow-left';
import ExternalLink from 'lucide-react/dist/esm/icons/external-link';
import Clock from 'lucide-react/dist/esm/icons/clock';
import Tag from 'lucide-react/dist/esm/icons/tag';

export default function MapPage() {
  const router = useRouter();
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [countryArticles, setCountryArticles] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleCountryClick = async (countryName) => {
    setSelectedCountry(countryName);
    setLoading(true);
    
    try {
      const response = await fetch(`/api/news?country=${encodeURIComponent(countryName)}&limit=10`);
      const data = await response.json();
      
      if (data.success) {
        setCountryArticles(data.articles || []);
      }
    } catch (error) {
      console.error('Error fetching country articles:', error);
      setCountryArticles([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return 'Recent';
    }
  };

  return (
    <>
      <Head>
        <title>Global News Map - Muslim News Aggregator</title>
        <meta name="description" content="Explore Islamic news coverage across the globe with our interactive world map" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <Link 
                  href="/"
                  className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <ArrowLeft className="h-5 w-5 mr-2" />
                  Back to Home
                </Link>
                <div className="h-6 border-l border-gray-300"></div>
                <h1 className="text-xl font-bold text-gray-900 flex items-center">
                  <MapPin className="h-6 w-6 text-emerald-600 mr-2" />
                  Global News Map
                </h1>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Map Section */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Interactive World Map</h2>
                  <p className="text-gray-600">
                    Click on any marker to explore news from that region. Our coverage spans major Islamic news centers worldwide.
                  </p>
                </div>
                
                <WorldMap 
                  onCountryClick={handleCountryClick}
                  highlightedCountries={selectedCountry ? [selectedCountry] : []}
                />
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                {!selectedCountry ? (
                  <div className="text-center py-8">
                    <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Location</h3>
                    <p className="text-gray-600">
                      Click on any marker on the map to view news articles from that region.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">
                        News from {selectedCountry}
                      </h3>
                      <button
                        onClick={() => {
                          setSelectedCountry(null);
                          setCountryArticles([]);
                        }}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        ✕
                      </button>
                    </div>

                    {loading ? (
                      <div className="space-y-4">
                        {[...Array(3)].map((_, i) => (
                          <div key={i} className="animate-pulse">
                            <div className="h-4 bg-gray-200 rounded mb-2"></div>
                            <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                          </div>
                        ))}
                      </div>
                    ) : countryArticles.length > 0 ? (
                      <div className="space-y-4 max-h-96 overflow-y-auto">
                        {countryArticles.map((article) => (
                          <div key={article.id} className="border-b border-gray-100 pb-4 last:border-b-0">
                            <h4 className="font-medium text-gray-900 mb-2 line-clamp-2">
                              {article.title}
                            </h4>
                            <div className="flex items-center space-x-4 text-sm text-gray-500 mb-2">
                              <div className="flex items-center">
                                <Clock className="h-3 w-3 mr-1" />
                                {formatDate(article.createdAt)}
                              </div>
                              {article.category && (
                                <div className="flex items-center">
                                  <Tag className="h-3 w-3 mr-1" />
                                  {article.category}
                                </div>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                              {article.summary}
                            </p>
                            <Link
                              href={`/article/${article.id}`}
                              className="inline-flex items-center text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                            >
                              Read more
                              <ExternalLink className="h-3 w-3 ml-1" />
                            </Link>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-gray-500">No articles found for {selectedCountry}</p>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Quick Stats */}
              <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Coverage Statistics</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Active Locations</span>
                    <span className="font-semibold text-emerald-600">20+</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Countries Covered</span>
                    <span className="font-semibold text-emerald-600">15+</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Regions</span>
                    <span className="font-semibold text-emerald-600">6</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Live Updates</span>
                    <span className="font-semibold text-green-500">●</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 