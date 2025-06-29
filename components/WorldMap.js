import { useState, useEffect } from 'react';
import { MapPin, Globe, TrendingUp } from 'lucide-react';

const WorldMap = ({ onCountryClick, highlightedCountries = [] }) => {
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [hoveredRegion, setHoveredRegion] = useState(null);

  // News locations with coordinates and regional grouping
  const newsRegions = [
    { 
      id: 'middle-east', 
      name: 'Middle East', 
      countries: ['Saudi Arabia', 'UAE', 'Qatar', 'Kuwait'], 
      articles: 42,
      x: '55%', 
      y: '40%',
      color: 'bg-amber-500'
    },
    { 
      id: 'south-asia', 
      name: 'South Asia', 
      countries: ['Pakistan', 'Bangladesh', 'India'], 
      articles: 35,
      x: '70%', 
      y: '45%',
      color: 'bg-blue-500'
    },
    { 
      id: 'southeast-asia', 
      name: 'Southeast Asia', 
      countries: ['Indonesia', 'Malaysia'], 
      articles: 28,
      x: '80%', 
      y: '55%',
      color: 'bg-pink-500'
    },
    { 
      id: 'north-africa', 
      name: 'North Africa', 
      countries: ['Morocco', 'Tunisia', 'Algeria', 'Egypt'], 
      articles: 31,
      x: '45%', 
      y: '35%',
      color: 'bg-yellow-500'
    },
    { 
      id: 'sub-saharan', 
      name: 'Sub-Saharan Africa', 
      countries: ['Nigeria', 'Kenya', 'Somalia'], 
      articles: 18,
      x: '48%', 
      y: '55%',
      color: 'bg-purple-500'
    },
    { 
      id: 'europe', 
      name: 'Europe', 
      countries: ['United Kingdom', 'France', 'Germany'], 
      articles: 22,
      x: '48%', 
      y: '25%',
      color: 'bg-teal-500'
    },
    { 
      id: 'north-america', 
      name: 'North America', 
      countries: ['United States', 'Canada'], 
      articles: 25,
      x: '20%', 
      y: '30%',
      color: 'bg-emerald-500'
    }
  ];

  const handleRegionClick = (region) => {
    setSelectedCountry(region.name);
    if (onCountryClick) {
      onCountryClick(region.name);
    }
  };

  return (
    <div className="w-full">
      {/* Simple SVG World Map with Interactive Regions */}
      <div className="relative w-full h-96 bg-gradient-to-b from-blue-50 to-blue-100 rounded-lg border border-gray-200 overflow-hidden">
        {/* World Map Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-100 via-green-50 to-yellow-50">
          {/* Simplified world map using CSS shapes */}
          <div className="absolute inset-0 opacity-20">
            <svg viewBox="0 0 1000 500" className="w-full h-full">
              {/* Simple continent shapes */}
              <path
                d="M150 150 Q200 120 350 140 Q400 160 450 180 Q500 170 550 160 Q600 150 650 170 Q700 180 750 160 Q800 150 850 170 L850 300 Q800 320 750 310 Q700 300 650 320 Q600 330 550 320 Q500 310 450 330 Q400 340 350 320 Q300 310 250 330 Q200 340 150 320 Z"
                fill="#22c55e" 
                fillOpacity="0.3"
              />
              <path
                d="M200 350 Q250 330 300 340 Q350 350 400 330 Q450 320 500 340 Q550 350 600 330 L600 450 Q550 470 500 460 Q450 450 400 470 Q350 480 300 460 Q250 450 200 470 Z"
                fill="#eab308" 
                fillOpacity="0.3"
              />
            </svg>
          </div>
        </div>

        {/* Interactive News Regions */}
        {newsRegions.map((region) => (
          <button
            key={region.id}
            onClick={() => handleRegionClick(region)}
            onMouseEnter={() => setHoveredRegion(region)}
            onMouseLeave={() => setHoveredRegion(null)}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
            style={{ left: region.x, top: region.y }}
          >
            {/* Region Marker */}
            <div className={`relative ${region.color} w-6 h-6 rounded-full shadow-lg group-hover:scale-125 transition-all duration-300 pulse-animation`}>
              <div className="absolute inset-0 rounded-full bg-white opacity-20"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full"></div>
            </div>

            {/* Article Count Badge */}
            <div className={`absolute -top-8 left-1/2 transform -translate-x-1/2 ${region.color} text-white text-xs font-bold px-2 py-1 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-300`}>
              {region.articles}
            </div>

            {/* Region Info Popup */}
            {hoveredRegion?.id === region.id && (
              <div className="absolute top-8 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-xl p-4 min-w-48 z-10 border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-2">{region.name}</h3>
                <p className="text-sm text-gray-600 mb-2">
                  {region.articles} news articles
                  </p>
                <div className="text-xs text-gray-500">
                  <strong>Countries:</strong> {region.countries.join(', ')}
                </div>
                <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-white border-l border-t border-gray-200 rotate-45"></div>
              </div>
            )}
          </button>
        ))}

        {/* Title Overlay */}
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-md">
          <h3 className="font-semibold text-gray-900 flex items-center">
            <Globe className="h-4 w-4 text-emerald-600 mr-2" />
            Global Islamic News Coverage
          </h3>
          <p className="text-xs text-gray-600 mt-1">Click on any region to explore</p>
        </div>
      </div>
      
      {/* Legend */}
      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
          <MapPin className="h-5 w-5 text-emerald-600 mr-2" />
          Interactive News Coverage Map
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-4">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-emerald-500 rounded-full mr-2 animate-pulse"></div>
            <span className="text-gray-700">Active News Regions</span>
          </div>
          <div className="flex items-center">
            <TrendingUp className="h-4 w-4 text-emerald-600 mr-2" />
            <span className="text-gray-700">Real-time Updates</span>
          </div>
          <div className="flex items-center">
            <Globe className="h-4 w-4 text-emerald-600 mr-2" />
            <span className="text-gray-700">Global Islamic News</span>
          </div>
        </div>

        {/* Region Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
          {newsRegions.map((region) => (
            <div 
              key={region.id}
              onClick={() => handleRegionClick(region)}
              className="flex items-center p-2 bg-white rounded border border-gray-200 hover:border-emerald-300 cursor-pointer transition-colors"
            >
              <div className={`w-3 h-3 ${region.color} rounded-full mr-2`}></div>
              <div>
                <div className="text-xs font-medium text-gray-900">{region.name}</div>
                <div className="text-xs text-gray-500">{region.articles} articles</div>
              </div>
            </div>
          ))}
        </div>
        
        {selectedCountry && (
          <div className="mt-4 p-3 bg-emerald-50 rounded-md border border-emerald-200">
            <p className="text-emerald-800 font-medium">
              Selected: <span className="font-bold">{selectedCountry}</span>
            </p>
            <p className="text-emerald-700 text-sm mt-1">
              Showing news coverage from this region
            </p>
          </div>
        )}
      </div>

      {/* CSS for animations */}
      <style jsx>{`
        .pulse-animation {
          animation: pulse-glow 2s infinite;
        }
        
        @keyframes pulse-glow {
          0%, 100% {
            box-shadow: 0 0 5px rgba(34, 197, 94, 0.5);
          }
          50% {
            box-shadow: 0 0 20px rgba(34, 197, 94, 0.8), 0 0 30px rgba(34, 197, 94, 0.6);
          }
        }
      `}</style>
    </div>
  );
};

export default WorldMap; 