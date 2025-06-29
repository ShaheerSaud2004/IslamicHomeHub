import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { 
  Building, BookOpen, Users, DollarSign, Heart, Briefcase, 
  GraduationCap, TrendingUp, Globe, ChevronRight, Clock, 
  Tag, Star, ArrowLeft 
} from 'lucide-react';

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryArticles, setCategoryArticles] = useState([]);
  const [loadingArticles, setLoadingArticles] = useState(false);

  // Islamic category descriptions and icons
  const categoryInfo = {
    'Religious': {
      icon: Building,
      color: 'text-green-600',
      bg: 'bg-green-50',
      border: 'border-green-200',
      description: 'Islamic teachings, Quran studies, Hadith, religious practices, and spiritual guidance for Muslims.',
      arabic: 'الشؤون الدينية'
    },
    'Community': {
      icon: Users,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      description: 'Muslim community news, local mosque activities, interfaith dialogue, and social initiatives.',
      arabic: 'المجتمع المسلم'
    },
    'Education': {
      icon: GraduationCap,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      border: 'border-purple-200',
      description: 'Islamic education, madrasas, Islamic universities, and educational achievements in the Muslim world.',
      arabic: 'التعليم الإسلامي'
    },
    'Economics': {
      icon: DollarSign,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      description: 'Islamic finance, halal business, economic development in Muslim countries, and Sharia-compliant investments.',
      arabic: 'الاقتصاد والتمويل الإسلامي'
    },
    'Culture': {
      icon: BookOpen,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      description: 'Islamic art, literature, history, traditions, and cultural heritage of the Muslim world.',
      arabic: 'الثقافة الإسلامية'
    },
    'Politics': {
      icon: Briefcase,
      color: 'text-red-600',
      bg: 'bg-red-50',
      border: 'border-red-200',
      description: 'Political developments affecting Muslims, governance in Muslim countries, and policy analysis.',
      arabic: 'السياسة'
    },
    'Health': {
      icon: Heart,
      color: 'text-pink-600',
      bg: 'bg-pink-50',
      border: 'border-pink-200',
      description: 'Health and wellness from Islamic perspective, medical advances in Muslim countries, and healthcare initiatives.',
      arabic: 'الصحة والعافية'
    },
    'Technology': {
      icon: TrendingUp,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
      border: 'border-indigo-200',
      description: 'Technology innovations in the Muslim world, digital Islamic resources, and tech entrepreneurship.',
      arabic: 'التكنولوجيا والابتكار'
    },
    'World': {
      icon: Globe,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
      border: 'border-orange-200',
      description: 'International news affecting Muslims, global Muslim affairs, and world events with Islamic perspective.',
      arabic: 'الأخبار العالمية'
    },
    'Sports': {
      icon: Star,
      color: 'text-teal-600',
      bg: 'bg-teal-50',
      border: 'border-teal-200',
      description: 'Sports news featuring Muslim athletes, Islamic sports events, and sports culture in Muslim countries.',
      arabic: 'الرياضة'
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();
      if (data.success) {
        setCategories(data.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
    setLoading(false);
  };

  const fetchCategoryArticles = async (category) => {
    setLoadingArticles(true);
    try {
      const response = await fetch(`/api/news?category=${category}&limit=6`);
      const data = await response.json();
      if (data.success) {
        setCategoryArticles(data.data.articles);
      }
    } catch (error) {
      console.error('Error fetching category articles:', error);
    }
    setLoadingArticles(false);
  };

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
    fetchCategoryArticles(category.name);
    
    // Smooth scroll to articles section
    setTimeout(() => {
      const articlesSection = document.getElementById('category-articles-section');
      if (articlesSection) {
        articlesSection.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      }
    }, 100);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <>
      <Head>
        <title>Islamic News Categories - Muslim News Hub</title>
        <meta name="description" content="Browse news by Islamic categories including Religious, Community, Education, Islamic Finance, Culture, and more. Organized for easy navigation." />
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
                <Building className="h-10 w-10 text-green-600 mr-3" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
                  <p className="text-sm text-green-600 font-medium">تصنيفات الأخبار</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Page Header */}
          <div className="text-center mb-12 bg-white rounded-2xl shadow-lg p-8 border border-green-100">
            <BookOpen className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Browse by Islamic Categories
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Explore news organized by Islamic topics and themes. Find exactly what matters to you and your faith.
            </p>
          </div>

          {selectedCategory ? (
            /* Category Detail View */
            <div>
              <button 
                onClick={() => setSelectedCategory(null)}
                className="mb-6 flex items-center text-green-600 hover:text-green-700 font-medium transition-colors duration-200"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Categories
              </button>

              <div className="bg-white rounded-2xl shadow-lg p-8 border border-green-100 mb-8">
                {(() => {
                  const info = categoryInfo[selectedCategory.name];
                  const Icon = info?.icon || BookOpen;
                  return (
                    <div className="flex items-start space-x-6">
                      <div className={`p-4 rounded-xl ${info?.bg} ${info?.border} border-2`}>
                        <Icon className={`h-12 w-12 ${info?.color}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-3">
                          <h1 className="text-3xl font-bold text-gray-900">{selectedCategory.name}</h1>
                          <span className="text-lg text-green-600 font-medium">{info?.arabic}</span>
                        </div>
                        <p className="text-lg text-gray-600 mb-4">{info?.description}</p>
                        <div className="flex items-center space-x-6 text-sm text-gray-500">
                          <span className="flex items-center">
                            <Tag className="h-4 w-4 mr-2" />
                            {selectedCategory.count} articles
                          </span>
                          <span className="flex items-center">
                            <Clock className="h-4 w-4 mr-2" />
                            Updated daily
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Category Articles */}
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
                <div id="category-articles-section" className="scroll-mt-20">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Latest {selectedCategory.name} News</h2>
                    <Link 
                      href={`/?category=${selectedCategory.name}`}
                      className="text-green-600 hover:text-green-700 font-medium flex items-center transition-colors duration-200"
                    >
                      View All <ChevronRight className="h-4 w-4 ml-1" />
                    </Link>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {categoryArticles.map(article => (
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

                  {categoryArticles.length === 0 && (
                    <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
                      <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No articles found</h3>
                      <p className="text-gray-600">Check back later for new {selectedCategory.name} articles.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            /* Categories Grid */
            <div>
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {[...Array(9)].map((_, i) => (
                    <div key={i} className="bg-white rounded-xl shadow-sm p-8 animate-pulse border border-gray-100">
                      <div className="w-16 h-16 bg-gray-200 rounded-xl mb-4"></div>
                      <div className="h-6 bg-gray-200 rounded mb-3"></div>
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {categories.map(category => {
                    const info = categoryInfo[category.name];
                    const Icon = info?.icon || BookOpen;
                    
                    return (
                      <button
                        key={category.name}
                        onClick={() => handleCategoryClick(category)}
                        className={`bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 p-8 text-left border border-gray-100 hover:${info?.border} group`}
                      >
                        <div className={`w-16 h-16 ${info?.bg} ${info?.border} border-2 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                          <Icon className={`h-8 w-8 ${info?.color}`} />
                        </div>
                        
                        <div className="mb-4">
                          <h3 className="text-xl font-bold text-gray-900 mb-2">{category.name}</h3>
                          <p className="text-sm text-green-600 font-medium mb-3">{info?.arabic}</p>
                          <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
                            {info?.description}
                          </p>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                          <span className="text-sm text-gray-500">
                            {category.count} articles
                          </span>
                          <ChevronRight className={`h-5 w-5 ${info?.color} group-hover:translate-x-1 transition-transform duration-300`} />
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {categories.length === 0 && !loading && (
                <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100">
                  <BookOpen className="h-20 w-20 text-gray-300 mx-auto mb-6" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">No categories available</h3>
                  <p className="text-gray-600">Categories will appear here once news articles are added.</p>
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