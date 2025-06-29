import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';

// Import individual icons to avoid barrel import issues
import Search from 'lucide-react/dist/esm/icons/search';
import Globe from 'lucide-react/dist/esm/icons/globe';
import Clock from 'lucide-react/dist/esm/icons/clock';
import Tag from 'lucide-react/dist/esm/icons/tag';
import Building2 from 'lucide-react/dist/esm/icons/building-2';
import BookOpen from 'lucide-react/dist/esm/icons/book-open';
import Users from 'lucide-react/dist/esm/icons/users';
import DollarSign from 'lucide-react/dist/esm/icons/dollar-sign';
import Heart from 'lucide-react/dist/esm/icons/heart';
import Briefcase from 'lucide-react/dist/esm/icons/briefcase';
import GraduationCap from 'lucide-react/dist/esm/icons/graduation-cap';
import Map from 'lucide-react/dist/esm/icons/map';
import Star from 'lucide-react/dist/esm/icons/star';
import TrendingUp from 'lucide-react/dist/esm/icons/trending-up';
import MapPin from 'lucide-react/dist/esm/icons/map-pin';
import ChevronRight from 'lucide-react/dist/esm/icons/chevron-right';
import User from 'lucide-react/dist/esm/icons/user';
import LogOut from 'lucide-react/dist/esm/icons/log-out';

// Import modal components and carousel
import { SignInModal, CreateAccountModal, ArticleCarousel, LanguageSelector } from '../components';

// Import content formatter and news sources
import { formatTitle, formatSummary, calculateReadingTime } from '../lib/utils/contentFormatter';
import { NEWS_SOURCES } from '../lib/config/sources';

export default function Home() {
  const router = useRouter();
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scraping, setScraping] = useState(false);
  
  // User authentication state
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Modal state
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [showCreateAccountModal, setShowCreateAccountModal] = useState(false);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedSection, setSelectedSection] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedLanguage, setSelectedLanguage] = useState('en');

  // Enhanced content formatting functions
  const getFormattedTitle = (title) => {
    return formatTitle(title) || 'Untitled Article';
  };

  const getFormattedSummary = (summary, maxLength = 200) => {
    return formatSummary(summary, maxLength) || 'No summary available for this article.';
  };

  const getReadingTime = (content) => {
    return calculateReadingTime(content);
  };

  // Islamic sections for better categorization
  const islamicSections = [
    { id: 'all', name: 'All News', icon: Globe, color: 'text-gray-600', bg: 'bg-gray-50' },
    { id: 'religious', name: 'Islamic & Religious', icon: Building2, color: 'text-green-600', bg: 'bg-green-50', categories: ['Religious'] },
    { id: 'community', name: 'Muslim Community', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50', categories: ['Community'] },
    { id: 'education', name: 'Islamic Education', icon: GraduationCap, color: 'text-purple-600', bg: 'bg-purple-50', categories: ['Education'] },
    { id: 'finance', name: 'Halal & Finance', icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50', categories: ['Economics'] },
    { id: 'culture', name: 'Islamic Culture', icon: BookOpen, color: 'text-amber-600', bg: 'bg-amber-50', categories: ['Culture'] },
    { id: 'politics', name: 'Muslim World Politics', icon: Briefcase, color: 'text-red-600', bg: 'bg-red-50', categories: ['Politics', 'World'] },
    { id: 'health', name: 'Health & Wellness', icon: Heart, color: 'text-pink-600', bg: 'bg-pink-50', categories: ['Health'] },
    { id: 'technology', name: 'Tech & Innovation', icon: TrendingUp, color: 'text-indigo-600', bg: 'bg-indigo-50', categories: ['Technology'] }
  ];

  // Featured regions for Muslims with unique colors
  const muslimRegions = [
    { 
      name: 'Middle East', 
      count: 0, 
      flag: '🕌', 
      description: 'Heart of the Islamic world',
      colors: {
        bg: 'from-amber-50 to-orange-50',
        hover: 'hover:from-amber-100 hover:to-orange-100',
        border: 'border-amber-200 hover:border-amber-400',
        text: 'group-hover:text-amber-700',
        subtext: 'group-hover:text-amber-600',
        glow: 'from-amber-400/20 to-orange-400/20',
        dot: 'bg-amber-400'
      }
    },
    { 
      name: 'South Asia', 
      count: 0, 
      flag: '🏔️', 
      description: 'Largest Muslim populations',
      colors: {
        bg: 'from-blue-50 to-indigo-50',
        hover: 'hover:from-blue-100 hover:to-indigo-100',
        border: 'border-blue-200 hover:border-blue-400',
        text: 'group-hover:text-blue-700',
        subtext: 'group-hover:text-blue-600',
        glow: 'from-blue-400/20 to-indigo-400/20',
        dot: 'bg-blue-400'
      }
    },
    { 
      name: 'Southeast Asia', 
      count: 0, 
      flag: '🌺', 
      description: 'Growing Muslim communities',
      colors: {
        bg: 'from-pink-50 to-rose-50',
        hover: 'hover:from-pink-100 hover:to-rose-100',
        border: 'border-pink-200 hover:border-pink-400',
        text: 'group-hover:text-pink-700',
        subtext: 'group-hover:text-pink-600',
        glow: 'from-pink-400/20 to-rose-400/20',
        dot: 'bg-pink-400'
      }
    },
    { 
      name: 'North Africa', 
      count: 0, 
      flag: '🏺', 
      description: 'Islamic heritage sites',
      colors: {
        bg: 'from-yellow-50 to-amber-50',
        hover: 'hover:from-yellow-100 hover:to-amber-100',
        border: 'border-yellow-200 hover:border-yellow-400',
        text: 'group-hover:text-yellow-700',
        subtext: 'group-hover:text-yellow-600',
        glow: 'from-yellow-400/20 to-amber-400/20',
        dot: 'bg-yellow-400'
      }
    },
    { 
      name: 'Sub-Saharan Africa', 
      count: 0, 
      flag: '🦁', 
      description: 'Expanding Muslim presence',
      colors: {
        bg: 'from-purple-50 to-violet-50',
        hover: 'hover:from-purple-100 hover:to-violet-100',
        border: 'border-purple-200 hover:border-purple-400',
        text: 'group-hover:text-purple-700',
        subtext: 'group-hover:text-purple-600',
        glow: 'from-purple-400/20 to-violet-400/20',
        dot: 'bg-purple-400'
      }
    },
    { 
      name: 'Europe', 
      count: 0, 
      flag: '🏰', 
      description: 'Muslim minorities & converts',
      colors: {
        bg: 'from-teal-50 to-cyan-50',
        hover: 'hover:from-teal-100 hover:to-cyan-100',
        border: 'border-teal-200 hover:border-teal-400',
        text: 'group-hover:text-teal-700',
        subtext: 'group-hover:text-teal-600',
        glow: 'from-teal-400/20 to-cyan-400/20',
        dot: 'bg-teal-400'
      }
    },
    { 
      name: 'North America', 
      count: 0, 
      flag: '🗽', 
      description: 'Muslim diaspora communities',
      colors: {
        bg: 'from-emerald-50 to-green-50',
        hover: 'hover:from-emerald-100 hover:to-green-100',
        border: 'border-emerald-200 hover:border-emerald-400',
        text: 'group-hover:text-emerald-700',
        subtext: 'group-hover:text-emerald-600',
        glow: 'from-emerald-400/20 to-green-400/20',
        dot: 'bg-emerald-400'
      }
    }
  ];

  // Get current Islamic date
  const getIslamicDate = () => {
    // This is a simplified version. In a real app, you'd use a proper Islamic calendar library
    const today = new Date();
    const islamicMonths = [
      'Muharram', 'Safar', 'Rabi al-Awwal', 'Rabi al-Thani', 'Jumada al-Awwal', 'Jumada al-Thani',
      'Rajab', 'Sha\'ban', 'Ramadan', 'Shawwal', 'Dhu al-Qi\'dah', 'Dhu al-Hijjah'
    ];
    // Approximate calculation - in production, use proper Islamic calendar conversion
    const islamicYear = 1446; // Current approximate year
    const monthIndex = today.getMonth();
    return `${today.getDate()} ${islamicMonths[monthIndex % 12]} ${islamicYear} AH`;
  };

  // Fetch articles with section filtering
  const fetchArticles = async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '12'
      });

      if (searchQuery) params.append('search', searchQuery);
      if (selectedCountry) params.append('country', selectedCountry);
      
      // Handle section-based category filtering
      if (selectedSection !== 'all') {
        const section = islamicSections.find(s => s.id === selectedSection);
        if (section && section.categories) {
          section.categories.forEach(cat => {
            params.append('category', cat);
          });
        }
      } else if (selectedCategory) {
        params.append('category', selectedCategory);
      }

      const response = await fetch(`/api/news?${params}`);
      const data = await response.json();

      if (data.success) {
        setArticles(data.data.articles);
        setTotalPages(data.data.pagination.totalPages);
        setCurrentPage(data.data.pagination.currentPage);
      }
    } catch (error) {
      console.error('Error fetching articles:', error);
    }
    setLoading(false);
  };

  // Fetch categories and countries
  const fetchMetadata = async () => {
    try {
      const [categoriesRes, countriesRes] = await Promise.all([
        fetch('/api/categories'),
        fetch('/api/countries')
      ]);

      const categoriesData = await categoriesRes.json();
      const countriesData = await countriesRes.json();

      if (categoriesData.success) setCategories(categoriesData.data);
      if (countriesData.success) setCountries(countriesData.data.slice(0, 15));
    } catch (error) {
      console.error('Error fetching metadata:', error);
    }
  };

  // Check authentication status on component mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      
      if (token && storedUser) {
        setUser(JSON.parse(storedUser));
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      // Clear invalid stored data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      setIsAuthenticated(false);
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  useEffect(() => {
    fetchArticles();
    fetchMetadata();
  }, [selectedCategory, selectedCountry, searchQuery, selectedSection]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Religious': 'bg-green-100 text-green-800 border-green-200',
      'Politics': 'bg-red-100 text-red-800 border-red-200',
      'Community': 'bg-blue-100 text-blue-800 border-blue-200',
      'Education': 'bg-purple-100 text-purple-800 border-purple-200',
      'Culture': 'bg-amber-100 text-amber-800 border-amber-200',
      'Economics': 'bg-emerald-100 text-emerald-800 border-emerald-200',
      'Health': 'bg-pink-100 text-pink-800 border-pink-200',
      'Technology': 'bg-indigo-100 text-indigo-800 border-indigo-200',
      'World': 'bg-orange-100 text-orange-800 border-orange-200',
      'Sports': 'bg-teal-100 text-teal-800 border-teal-200'
    };
    return colors[category] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  // Handle section filtering with smooth scroll
  const handleSectionFilter = (sectionId) => {
    setSelectedSection(sectionId);
    setCurrentPage(1);
    
    // Smooth scroll to articles section
    setTimeout(() => {
      const articlesSection = document.getElementById('articles-section');
      if (articlesSection) {
        articlesSection.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      }
    }, 100);
  };

  return (
    <>
      <Head>
        <title>Muslim News Hub - Latest Islamic News & Updates from Around the Ummah</title>
        <meta name="description" content="Stay connected with the global Muslim community. Latest Islamic news, religious updates, community stories, and Muslim world politics from trusted sources." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Simplified Beautiful Header */}
        <header className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white shadow-lg relative">
          {/* Simple background overlay */}
          <div className="absolute inset-0 bg-black/5"></div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="flex items-center justify-between h-16">
              {/* Logo and Title */}
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Globe className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">
                    Islamic Community News
                  </h1>
                  <p className="text-emerald-100 text-sm">
                    Real-time updates from the Muslim world
                  </p>
                </div>
              </div>
              
              {/* Navigation and Controls */}
              <div className="flex items-center space-x-4">
                {/* Language Selector */}
                <LanguageSelector
                  selectedLanguage={selectedLanguage}
                  onLanguageChange={setSelectedLanguage}
                  className="text-white"
                />

                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search Islamic news..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900 w-64"
                  />
                </div>

                {/* Auth Buttons */}
                <button
                  onClick={() => setShowSignInModal(true)}
                  className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={() => setShowCreateAccountModal(true)}
                  className="bg-white text-emerald-600 px-4 py-2 rounded-lg font-medium hover:bg-emerald-50 transition-colors"
                >
                  Create Account
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Section with Enhanced Design */}
          <div className="text-center mb-8 bg-gradient-to-br from-white via-emerald-50/30 to-teal-50/50 rounded-2xl shadow-xl p-8 border border-emerald-100/50 backdrop-blur-sm relative overflow-hidden">
            {/* Background decorative elements */}
            <div className="absolute top-0 left-0 w-full h-full">
              <div className="absolute top-10 left-10 w-20 h-20 bg-emerald-200/20 rounded-full blur-xl"></div>
              <div className="absolute bottom-10 right-10 w-32 h-32 bg-teal-200/20 rounded-full blur-xl"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-cyan-200/10 rounded-full blur-2xl"></div>
            </div>
            
            <div className="relative z-10">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-lg mb-6">
                <Building2 className="h-10 w-10 text-white" />
              </div>
              
              <h1 className="text-4xl font-bold text-gray-900 mb-4 bg-gradient-to-r from-emerald-700 via-teal-700 to-cyan-700 bg-clip-text text-transparent">
                Welcome to Muslim News Hub
              </h1>
              
              <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-6 leading-relaxed">
                Your trusted source for Islamic news and Muslim community updates from around the world.
              </p>
              
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-6 mb-6 shadow-inner">
                <p className="text-emerald-800 font-semibold mb-4 text-lg">
                  Join the Muslim News Hub community for personalized features
                </p>
                <div className="flex justify-center space-x-4 mb-4">
                  <button 
                    onClick={() => setShowCreateAccountModal(true)}
                    className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-8 py-3 rounded-xl text-sm font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    Create Account
                  </button>
                  <button 
                    onClick={() => setShowSignInModal(true)}
                    className="bg-white hover:bg-gray-50 text-emerald-600 border-2 border-emerald-500 hover:border-emerald-600 px-8 py-3 rounded-xl text-sm font-semibold transition-all duration-300 shadow-md hover:shadow-lg"
                  >
                    Sign In
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Main Layout with Sidebar */}
          <div className="flex gap-8">
            {/* Left Sidebar - Islamic Topics */}
            <div className="w-80 flex-shrink-0">
              <div className="sticky top-8">
                {/* Islamic Topics Sidebar */}
                <div className="bg-gradient-to-br from-white via-emerald-50/20 to-teal-50/30 rounded-2xl shadow-xl border border-emerald-100/50 backdrop-blur-sm relative overflow-hidden">
                  {/* Decorative background */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-emerald-200/20 to-teal-200/20 rounded-full blur-2xl"></div>
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-cyan-200/20 to-emerald-200/20 rounded-full blur-xl"></div>
                  
                  <div className="relative z-10 p-6">
                    {/* Header */}
                    <div className="text-center mb-6">
                      <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-lg mb-3">
                        <BookOpen className="h-6 w-6 text-white" />
                      </div>
                      <h2 className="text-xl font-bold text-gray-900 bg-gradient-to-r from-emerald-700 to-teal-700 bg-clip-text text-transparent">
                        Islamic Topics
                      </h2>
                      <p className="text-sm text-emerald-700 font-medium mt-1">
                        Browse by Islamic themes
                      </p>
                    </div>

                    {/* Topics List */}
                    <div className="space-y-3">
                      {islamicSections.map((section, index) => {
                        const Icon = section.icon;
                        const isActive = selectedSection === section.id;
                        
                        return (
                          <button
                            key={section.id}
                            onClick={() => handleSectionFilter(section.id)}
                            className={`w-full group relative flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-0.5 ${
                              isActive 
                                ? `${section.bg} ${section.color} border-2 ${section.color === 'text-green-600' ? 'border-green-300' : section.color === 'text-blue-600' ? 'border-blue-300' : section.color === 'text-purple-600' ? 'border-purple-300' : section.color === 'text-emerald-600' ? 'border-emerald-300' : section.color === 'text-amber-600' ? 'border-amber-300' : section.color === 'text-red-600' ? 'border-red-300' : section.color === 'text-pink-600' ? 'border-pink-300' : section.color === 'text-indigo-600' ? 'border-indigo-300' : 'border-gray-300'} shadow-lg ring-2 ring-opacity-20 ${section.color === 'text-green-600' ? 'ring-green-400' : section.color === 'text-blue-600' ? 'ring-blue-400' : section.color === 'text-purple-600' ? 'ring-purple-400' : section.color === 'text-emerald-600' ? 'ring-emerald-400' : section.color === 'text-amber-600' ? 'ring-amber-400' : section.color === 'text-red-600' ? 'ring-red-400' : section.color === 'text-pink-600' ? 'ring-pink-400' : section.color === 'text-indigo-600' ? 'ring-indigo-400' : 'ring-gray-400'}` 
                                : 'bg-white/70 hover:bg-white text-gray-600 border-2 border-gray-200 hover:border-gray-300 hover:shadow-md shadow-sm'
                            }`}
                            style={{ animationDelay: `${index * 50}ms` }}
                          >
                            {/* Glow effect for active state */}
                            {isActive && (
                              <div className={`absolute inset-0 rounded-xl bg-gradient-to-r ${
                                section.color === 'text-green-600' ? 'from-green-400/20 to-emerald-400/20' :
                                section.color === 'text-blue-600' ? 'from-blue-400/20 to-cyan-400/20' :
                                section.color === 'text-purple-600' ? 'from-purple-400/20 to-violet-400/20' :
                                section.color === 'text-emerald-600' ? 'from-emerald-400/20 to-teal-400/20' :
                                section.color === 'text-amber-600' ? 'from-amber-400/20 to-yellow-400/20' :
                                section.color === 'text-red-600' ? 'from-red-400/20 to-pink-400/20' :
                                section.color === 'text-pink-600' ? 'from-pink-400/20 to-rose-400/20' :
                                section.color === 'text-indigo-600' ? 'from-indigo-400/20 to-blue-400/20' :
                                'from-gray-400/20 to-slate-400/20'
                              } blur-lg scale-110 animate-pulse`} />
                            )}
                            
                            <div className="relative z-10 flex items-center space-x-3 w-full">
                              <div className={`p-2 rounded-lg ${
                                isActive 
                                  ? `${section.bg} border ${section.color === 'text-green-600' ? 'border-green-300' : section.color === 'text-blue-600' ? 'border-blue-300' : section.color === 'text-purple-600' ? 'border-purple-300' : section.color === 'text-emerald-600' ? 'border-emerald-300' : section.color === 'text-amber-600' ? 'border-amber-300' : section.color === 'text-red-600' ? 'border-red-300' : section.color === 'text-pink-600' ? 'border-pink-300' : section.color === 'text-indigo-600' ? 'border-indigo-300' : 'border-gray-300'} shadow-sm transform group-hover:rotate-3`
                                  : 'bg-gray-100 border border-gray-200 group-hover:bg-gray-200 transform group-hover:rotate-2'
                              } transition-all duration-300`}>
                                <Icon className={`h-4 w-4 ${isActive ? section.color : 'text-gray-500 group-hover:text-gray-700'} transition-colors duration-300`} />
                              </div>
                              
                              <div className="flex-1 text-left">
                                <span className={`font-semibold text-sm ${isActive ? section.color : 'text-gray-700 group-hover:text-gray-900'} transition-colors duration-300 block`}>
                                  {section.name}
                                </span>
                                {isActive && (
                                  <span className={`text-xs ${section.color} opacity-75 animate-fade-in`}>
                                    Active
                                  </span>
                                )}
                              </div>
                              
                              {/* Active indicator */}
                              {isActive && (
                                <div className={`w-2 h-2 ${
                                  section.color === 'text-green-600' ? 'bg-green-500' :
                                  section.color === 'text-blue-600' ? 'bg-blue-500' :
                                  section.color === 'text-purple-600' ? 'bg-purple-500' :
                                  section.color === 'text-emerald-600' ? 'bg-emerald-500' :
                                  section.color === 'text-amber-600' ? 'bg-amber-500' :
                                  section.color === 'text-red-600' ? 'bg-red-500' :
                                  section.color === 'text-pink-600' ? 'bg-pink-500' :
                                  section.color === 'text-indigo-600' ? 'bg-indigo-500' :
                                  'bg-gray-500'
                                } rounded-full animate-pulse shadow-lg border border-white`} />
                              )}
                            </div>
                            
                            {/* Click ripple effect */}
                            <div className="absolute inset-0 rounded-xl opacity-0 group-active:opacity-100 bg-white/20 animate-ping pointer-events-none" />
                          </button>
                        );
                      })}
                    </div>

                    {/* Footer stats */}
                    <div className="mt-6 pt-4 border-t border-emerald-200/50">
                      <div className="text-center text-xs text-emerald-600 space-y-1">
                        <div className="flex items-center justify-center space-x-2">
                          <Globe className="h-3 w-3" />
                          <span>17 Trusted Sources</span>
                        </div>
                        <div className="flex items-center justify-center space-x-2">
                          <Users className="h-3 w-3" />
                          <span>Global Coverage</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 min-w-0">
              {/* Filters */}
              <div className="bg-white rounded-lg shadow-sm p-4 mb-8 border">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Search */}
                  <div className="relative">
                    <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search news..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  {/* Category Filter */}
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">All Categories</option>
                    {categories.map(category => (
                      <option key={category.name} value={category.name}>
                        {category.name} ({category.count})
                      </option>
                    ))}
                  </select>

                  {/* Country Filter */}
                  <select
                    value={selectedCountry}
                    onChange={(e) => setSelectedCountry(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">All Countries</option>
                    {countries.map(country => (
                      <option key={country.name} value={country.name}>
                        {country.name} ({country.count})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Muslim Regions */}
              <div className="mb-8 bg-white rounded-lg shadow-sm p-6 border">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <Map className="h-5 w-5 text-green-600 mr-2" />
                  Muslim World Regions
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {muslimRegions.map((region, index) => (
                    <button
                      key={region.name}
                      onClick={() => {
                        setSelectedCountry('');
                        setSelectedSection('all');
                        setSearchQuery(region.name.toLowerCase());
                      }}
                      className={`group relative p-4 text-center rounded-xl bg-gradient-to-br ${region.colors.bg} ${region.colors.hover} border-2 ${region.colors.border} transition-all duration-300 overflow-hidden shadow-sm hover:shadow-lg transform hover:-translate-y-1`}
                    >
                      {/* Hover gradient overlay */}
                      <div className={`absolute inset-0 bg-gradient-to-br ${region.colors.glow} opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`} />
                      
                      {/* Glow effect on hover */}
                      <div className={`absolute inset-0 rounded-xl bg-gradient-to-r ${region.colors.glow} blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-300 scale-150`} />
                      
                      <div className="relative z-10">
                        <div className="text-2xl mb-2 transform group-hover:scale-110 transition-transform duration-300">
                          {region.flag}
                        </div>
                        <h3 className={`font-semibold text-xs text-gray-900 mb-1 ${region.colors.text} transition-colors`}>
                          {region.name}
                        </h3>
                        <p className={`text-xs text-gray-500 ${region.colors.subtext} transition-colors leading-tight`}>
                          {region.description}
                        </p>
                        
                        {/* Decorative element */}
                        <div className={`absolute top-1 right-1 w-1 h-1 ${region.colors.dot} rounded-full opacity-0 group-hover:opacity-100 animate-ping`} />
                        <div className={`absolute top-1 right-1 w-1 h-1 ${region.colors.dot} rounded-full opacity-0 group-hover:opacity-100`} />
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Articles Section */}
              <div id="articles-section" className="scroll-mt-20">
                {loading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[...Array(12)].map((_, i) => (
                      <div key={i} className="bg-gradient-to-br from-white to-gray-50/50 rounded-xl shadow-lg p-6 border border-gray-100/50 relative overflow-hidden group">
                        {/* Shimmer overlay effect */}
                        <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent"></div>
                        
                        {/* Image skeleton */}
                        <div className="h-48 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded-xl mb-4 animate-pulse relative overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-r from-gray-200/0 via-gray-100/50 to-gray-200/0 animate-pulse"></div>
                        </div>
                        
                        {/* Category badge skeleton */}
                        <div className="flex items-center space-x-2 mb-3">
                          <div className="h-6 w-20 bg-gradient-to-r from-emerald-100 to-teal-100 rounded-full animate-pulse"></div>
                          <div className="h-6 w-16 bg-gradient-to-r from-amber-100 to-orange-100 rounded-full animate-pulse"></div>
                        </div>
                        
                        {/* Title skeleton */}
                        <div className="space-y-2 mb-4">
                          <div className="h-5 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-lg animate-pulse"></div>
                          <div className="h-5 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-lg w-3/4 animate-pulse"></div>
                        </div>
                        
                        {/* Summary skeleton */}
                        <div className="space-y-2 mb-4">
                          <div className="h-3 bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 rounded animate-pulse"></div>
                          <div className="h-3 bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 rounded animate-pulse"></div>
                          <div className="h-3 bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 rounded w-2/3 animate-pulse"></div>
                        </div>
                        
                        {/* Meta info skeleton */}
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <div className="h-3 w-16 bg-gradient-to-r from-gray-100 to-gray-50 rounded animate-pulse"></div>
                            <div className="h-3 w-12 bg-gradient-to-r from-gray-100 to-gray-50 rounded animate-pulse"></div>
                          </div>
                          <div className="h-6 w-20 bg-gradient-to-r from-emerald-100 to-teal-100 rounded-lg animate-pulse"></div>
                        </div>
                        
                        {/* Tags skeleton */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          <div className="h-6 w-16 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-full animate-pulse"></div>
                          <div className="h-6 w-20 bg-gradient-to-r from-purple-50 to-pink-50 rounded-full animate-pulse"></div>
                          <div className="h-6 w-14 bg-gradient-to-r from-green-50 to-emerald-50 rounded-full animate-pulse"></div>
                        </div>
                        
                        {/* Read more skeleton */}
                        <div className="h-4 w-32 bg-gradient-to-r from-emerald-100 to-teal-100 rounded animate-pulse"></div>
                      </div>
                    ))}
                  </div>
                ) : articles.length === 0 ? (
                  <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100">
                    <BookOpen className="h-20 w-20 text-gray-300 mx-auto mb-6" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">No articles found</h3>
                    <p className="text-gray-600 mb-6">Try adjusting your filters or search terms.</p>
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedCategory('');
                        setSelectedCountry('');
                        setSelectedSection('all');
                        setCurrentPage(1);
                      }}
                      className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 font-medium"
                    >
                      Clear Filters
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Featured Articles Carousel */}
                    {articles.length > 0 && (
                      <div className="mb-12">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                          <Star className="h-6 w-6 text-green-600 mr-2" />
                          Featured Stories
                          <span className="ml-3 px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                            Auto-Translated
                          </span>
                        </h2>
                        <ArticleCarousel 
                          articles={articles.slice(0, 5)} 
                          autoSlide={true} 
                          slideInterval={6000}
                        />
                      </div>
                    )}

                    {/* More Articles Grid */}
                    {articles.length > 5 && (
                      <>
                        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                          <BookOpen className="h-6 w-6 text-green-600 mr-2" />
                          More Articles
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
                          {articles.slice(5).map(article => (
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
                                    className="w-full h-48 object-cover rounded-lg mb-4 group-hover:scale-105 transition-transform duration-300"
                                    onError={(e) => { e.target.style.display = 'none' }}
                                  />
                                )}
                                
                                <div className="flex items-center space-x-2 mb-3">
                                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getCategoryColor(article.category)}`}>
                                    {article.category}
                                  </span>
                                  {article.importance >= 8 && (
                                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200 flex items-center">
                                      <Star className="h-3 w-3 mr-1" />
                                      Important
                                    </span>
                                  )}
                                </div>

                                <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-green-700 transition-colors duration-200">
                                  {getFormattedTitle(article.title)}
                                </h3>

                                <div className="text-gray-600 text-sm mb-4 leading-relaxed">
                                  <p className="line-clamp-3">
                                    {getFormattedSummary(article.summary) && article.summary.length > 150 
                                      ? `${getFormattedSummary(article.summary).substring(0, 150).trim()}...` 
                                      : getFormattedSummary(article.summary) || 'No summary available for this article.'
                                    }
                                  </p>
                                  {getFormattedSummary(article.summary) && article.summary.length > 150 && (
                                    <span className="text-green-600 text-xs font-medium mt-1 inline-block">
                                      Read more →
                                    </span>
                                  )}
                                </div>

                                <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                                  <div className="flex items-center space-x-3">
                                    <span className="flex items-center">
                                      <Clock className="h-3 w-3 mr-1" />
                                      {formatDate(article.publishedAt)}
                                    </span>
                                    <span>{getReadingTime(article.summary)} min read</span>
                                  </div>
                                  <span className="text-green-600 font-medium bg-green-50 px-2 py-1 rounded">
                                    {article.source.name}
                                  </span>
                                </div>

                                {(article.countries || []).length > 0 && (
                                  <div className="flex items-center space-x-1 mb-3">
                                    <MapPin className="h-3 w-3 text-gray-400" />
                                    <span className="text-xs text-gray-500">
                                      {(article.countries || []).slice(0, 2).join(', ')}
                                      {(article.countries || []).length > 2 && ` +${(article.countries || []).length - 2} more`}
                                    </span>
                                  </div>
                                )}

                                {article.tags.length > 0 && (
                                  <div className="flex flex-wrap gap-1">
                                    {article.tags.slice(0, 3).map(tag => (
                                      <span key={tag} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-50 text-gray-600 border border-gray-200">
                                        <Tag className="h-2 w-2 mr-1" />
                                        {tag}
                                      </span>
                                    ))}
                                  </div>
                                )}

                                <div className="mt-4 flex items-center text-green-600 text-sm font-medium">
                                  Read Full Article <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform duration-200" />
                                </div>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </>
                    )}

                    {/* Show all articles in grid if 5 or fewer */}
                    {articles.length > 0 && articles.length <= 5 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
                      {articles.map(article => (
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
                                className="w-full h-48 object-cover rounded-lg mb-4 group-hover:scale-105 transition-transform duration-300"
                                onError={(e) => { e.target.style.display = 'none' }}
                              />
                            )}
                            
                            <div className="flex items-center space-x-2 mb-3">
                              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getCategoryColor(article.category)}`}>
                                {article.category}
                              </span>
                              {article.importance >= 8 && (
                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200 flex items-center">
                                  <Star className="h-3 w-3 mr-1" />
                                    Important
                              </span>
                              )}
                            </div>

                            <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-green-700 transition-colors duration-200">
                                {getFormattedTitle(article.title)}
                            </h3>

                              <div className="text-gray-600 text-sm mb-4 leading-relaxed">
                                <p className="line-clamp-3">
                                  {getFormattedSummary(article.summary) && article.summary.length > 150 
                                    ? `${getFormattedSummary(article.summary).substring(0, 150).trim()}...` 
                                    : getFormattedSummary(article.summary) || 'No summary available for this article.'
                                  }
                                </p>
                                {getFormattedSummary(article.summary) && article.summary.length > 150 && (
                                  <span className="text-green-600 text-xs font-medium mt-1 inline-block">
                                    Read more →
                                  </span>
                                )}
                              </div>

                            <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                              <div className="flex items-center space-x-3">
                                <span className="flex items-center">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {formatDate(article.publishedAt)}
                                </span>
                                  <span>{getReadingTime(article.summary)} min read</span>
                              </div>
                              <span className="text-green-600 font-medium bg-green-50 px-2 py-1 rounded">
                                {article.source.name}
                              </span>
                            </div>

                            {(article.countries || []).length > 0 && (
                              <div className="flex items-center space-x-1 mb-3">
                                <MapPin className="h-3 w-3 text-gray-400" />
                                <span className="text-xs text-gray-500">
                                  {(article.countries || []).slice(0, 2).join(', ')}
                                  {(article.countries || []).length > 2 && ` +${(article.countries || []).length - 2} more`}
                                </span>
                              </div>
                            )}

                            {article.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {article.tags.slice(0, 3).map(tag => (
                                  <span key={tag} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-50 text-gray-600 border border-gray-200">
                                    <Tag className="h-2 w-2 mr-1" />
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}

                            <div className="mt-4 flex items-center text-green-600 text-sm font-medium">
                              Read Full Article <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform duration-200" />
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="flex justify-center items-center space-x-2">
                        <button
                          onClick={() => fetchArticles(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                        >
                          Previous
                        </button>
                        
                        <span className="px-6 py-3 text-sm font-medium text-gray-700 bg-green-50 border border-green-200 rounded-lg">
                          Page {currentPage} of {totalPages}
                        </span>
                        
                        <button
                          onClick={() => fetchArticles(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className="px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                        >
                          Next
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>

              {articles.length === 0 && !loading && (
                <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100">
                  <Building2 className="h-20 w-20 text-gray-300 mx-auto mb-6" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">No articles found</h3>
                  <p className="text-gray-600 mb-6">Try adjusting your filters or check back later for new updates.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Simplified Footer */}
        <footer className="bg-gradient-to-r from-emerald-800 via-teal-800 to-cyan-800 text-white py-12 mt-16 relative">
          {/* Simple background overlay */}
          <div className="absolute inset-0 bg-black/10"></div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center">
              <div className="p-3 bg-white/20 rounded-lg inline-block mb-4">
                <Building2 className="h-12 w-12 text-emerald-300" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-white">
                Muslim News Hub
              </h3>
              <p className="text-emerald-200 mb-6 text-lg">
                Connecting the Global Ummah Through News
              </p>
              <div className="flex justify-center space-x-8 text-sm mb-6">
                <Link href="/" className="text-emerald-300 hover:text-white transition-colors duration-200">
                  Home
                </Link>
                <Link href="/categories" className="text-emerald-300 hover:text-white transition-colors duration-200">
                  Categories
                </Link>
                <Link href="/countries" className="text-emerald-300 hover:text-white transition-colors duration-200">
                  Countries
                </Link>
                <Link href="/map" className="text-emerald-300 hover:text-white transition-colors duration-200">
                  World Map
                </Link>
              </div>
              <div className="bg-white/10 rounded-lg p-4 inline-block">
                <p className="text-emerald-100 italic">
                  "And hold firmly to the rope of Allah all together and do not become divided."
                </p>
                <p className="text-emerald-300 text-sm mt-2">- Quran 3:103</p>
              </div>
            </div>
          </div>
        </footer>

        {/* Modals */}
        <SignInModal 
          isOpen={showSignInModal} 
          onClose={() => setShowSignInModal(false)}
          onSwitchToRegister={() => {
            setShowSignInModal(false);
            setShowCreateAccountModal(true);
          }}
        />
        
        <CreateAccountModal 
          isOpen={showCreateAccountModal} 
          onClose={() => setShowCreateAccountModal(false)}
          onSwitchToSignIn={() => {
            setShowCreateAccountModal(false);
            setShowSignInModal(true);
          }}
        />
      </div>
    </>
  );
} 