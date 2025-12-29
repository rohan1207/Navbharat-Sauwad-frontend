import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaPlay, FaArrowRight } from 'react-icons/fa';
import newsData from '../data/newsData.json';
import Sidebar from '../components/Sidebar';
import { getFeaturedArticles, getLatestArticles, getCategories, getArticlesByCategory, getShorts } from '../utils/api';

const Home = () => {
  const [featuredNews, setFeaturedNews] = useState(null);
  const [otherNews, setOtherNews] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [shorts, setShorts] = useState([]);
  const [popularArticles, setPopularArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  // Primary categories matching Navigation menu
  const primaryCategoryIds = [
    'latest-news',
    'pune',
    'maharashtra',
    'national-international',
    'information-technology',
    'lifestyle',
    'column-articles',
    'entertainment',
    'sports',
    'health',
    'editorial'
  ];

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Load featured and latest articles
        const [featured, latest, cats, shortsData] = await Promise.all([
          getFeaturedArticles(),
          getLatestArticles(6),
          getCategories(),
          getShorts()
        ]);

        // Set featured news
        if (featured && featured.length > 0) {
          setFeaturedNews(featured[0]);
          setOtherNews(latest.slice(1, 6));
        } else {
          // Fallback to JSON
          const fallbackFeatured = newsData.latestNews[0];
          setFeaturedNews(fallbackFeatured);
          setOtherNews(newsData.latestNews.slice(1, 6));
        }

        // Set categories
        if (cats && cats.length > 0) {
          setAllCategories(cats);
          // Filter categories to match Navigation menu
          // Try to match by nameEn (slug) or name first, then by id
          const filteredCats = primaryCategoryIds
            .map(id => {
              // First try to find by nameEn (slug format like "latest-news")
              let found = cats.find(cat => 
                cat.nameEn?.toLowerCase().replace(/\s+/g, '-') === id ||
                cat.id === id || 
                cat._id?.toString() === id
              );
              
              // If not found, try matching by name (Marathi)
              if (!found) {
                const nameMap = {
                  'latest-news': 'ताज्या बातम्या',
                  'pune': 'पुणे',
                  'maharashtra': 'महाराष्ट्र',
                  'national-international': 'देश विदेश',
                  'information-technology': 'माहिती तंत्रज्ञान',
                  'lifestyle': 'लाईफस्टाईल',
                  'column-articles': 'स्तंभ लेख',
                  'entertainment': 'मनोरंजन',
                  'sports': 'क्रीडा',
                  'health': 'आरोग्य',
                  'editorial': 'संपादकीय'
                };
                const marathiName = nameMap[id];
                if (marathiName) {
                  found = cats.find(cat => cat.name === marathiName);
                }
              }
              
              return found;
            })
            .filter(cat => cat !== undefined);
          setCategories(filteredCats);
        } else {
          // Fallback to JSON
          setAllCategories(newsData.categories);
          const filteredCats = primaryCategoryIds
            .map(id => newsData.categories.find(cat => cat.id === id))
            .filter(cat => cat !== undefined);
          setCategories(filteredCats);
        }

        // Set shorts
        if (shortsData && shortsData.length > 0) {
          setShorts(shortsData);
        } else {
          setShorts(newsData.shorts || []);
        }

        // Load category articles for popular
        const allArticles = [...latest];
        if (cats && cats.length > 0) {
          for (const cat of cats.slice(0, 5)) {
            const catId = cat.id || cat._id;
            const catArticles = await getArticlesByCategory(catId);
            allArticles.push(...catArticles.slice(0, 2));
          }
        } else {
          // Fallback
          newsData.categories.forEach(cat => {
            if (cat.news) {
              allArticles.push(...cat.news.slice(0, 2));
            }
          });
        }
        setPopularArticles(allArticles.slice(0, 10));

      } catch (error) {
        console.error('Error loading data:', error);
        // Fallback to JSON
        const fallbackFeatured = newsData.latestNews[0];
        setFeaturedNews(fallbackFeatured);
        setOtherNews(newsData.latestNews.slice(1, 6));
        setAllCategories(newsData.categories);
        const filteredCats = primaryCategoryIds
          .map(id => newsData.categories.find(cat => cat.id === id))
          .filter(cat => cat !== undefined);
        setCategories(filteredCats);
        setShorts(newsData.shorts || []);
        setPopularArticles([...newsData.latestNews, ...newsData.categories.flatMap(cat => cat.news)].slice(0, 10));
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Load category articles when categories change
  useEffect(() => {
    const loadCategoryArticles = async () => {
      if (categories.length === 0) return;
      
      const updatedCategories = await Promise.all(
        categories.map(async (cat) => {
          // Use the actual MongoDB _id for API calls
          const catId = cat._id || cat.id;
          const articles = await getArticlesByCategory(catId);
          
          // If no articles from API, use fallback
          if (!articles || articles.length === 0) {
            // Try to match by name or the string ID for fallback
            const fallbackCat = newsData.categories.find(c => 
              c.id === catId || 
              c.id === (cat.id || cat.nameEn?.toLowerCase().replace(/\s+/g, '-'))
            );
            return {
              ...cat,
              news: fallbackCat?.news || []
            };
          }
          
          return {
            ...cat,
            news: articles
          };
        })
      );
      
      setCategories(updatedCategories);
    };

    loadCategoryArticles();
  }, [allCategories.length, primaryCategoryIds]);

  if (loading) {
    return (
      <div className="min-h-screen bg-subtleGray flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-newsRed"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-subtleGray">
      {/* Main Content Area */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Sidebar */}
          <div className="lg:col-span-2 order-2 lg:order-1">
            <Sidebar type="left" />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-8 order-1 lg:order-2">
            {/* Featured Article - Large Hero Section */}
            {featuredNews && (
              <article className="mb-8 bg-cleanWhite rounded-lg overflow-hidden shadow-sm border border-subtleGray/70">
                <Link to={`/news/${featuredNews._id || featuredNews.id || ''}`} className="block group">
                  <div className="relative overflow-hidden">
                    <img
                      src={featuredNews.featuredImage || featuredNews.image}
                      alt={featuredNews.title}
                      className="w-full h-[400px] md:h-[500px] object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                    <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="inline-block h-2 w-2 rounded-full bg-newsRed animate-pulse"></span>
                        <span className="text-xs font-semibold tracking-wide uppercase text-cleanWhite/90">
                          आजची मुख्य बातमी
                        </span>
                        <span className="text-xs text-cleanWhite/70 ml-auto">
                          {new Date(featuredNews.publishedAt || featuredNews.createdAt || featuredNews.date).toLocaleDateString('mr-IN')}
                        </span>
                      </div>
                      <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold text-cleanWhite mb-4 leading-tight group-hover:text-newsRed/90 transition-colors">
                        {featuredNews.title}
                      </h1>
                      {featuredNews.subtitle && (
                        <p className="text-lg md:text-xl text-cleanWhite/80 mb-3 font-medium">
                          {featuredNews.subtitle}
                        </p>
                      )}
                      <p className="text-base md:text-lg text-cleanWhite/90 line-clamp-2 mb-3">
                        {featuredNews.summary}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-cleanWhite/80">
                        <span>{featuredNews.author?.name || featuredNews.author}</span>
                        {featuredNews.categoryId?.name && (
                          <>
                            <span>•</span>
                            <span>{featuredNews.categoryId.name}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              </article>
            )}

            {/* Top Stories Grid - 2 Cards in first row, 3 cards in second row */}
            <section className="mb-10">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="h-6 w-1 bg-newsRed rounded-full"></div>
                  <h2 className="text-xl md:text-2xl font-bold text-deepCharcoal">
                    शीर्ष बातम्या
                  </h2>
                </div>
                <Link
                  to="/category/latest-news"
                  className="text-sm font-semibold text-newsRed hover:text-newsRed/80 flex items-center gap-1 transition-colors"
                >
                  सर्व पहा
                  <FaArrowRight className="w-3 h-3" />
                </Link>
              </div>
              {/* First Row - 2 Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {otherNews.slice(0, 2).map((news) => (
                  <Link
                    key={news.id || news._id}
                    to={`/news/${news._id || news.id || ''}`}
                    className="group bg-cleanWhite rounded-lg overflow-hidden shadow-sm border border-subtleGray/70 hover:shadow-md transition-all duration-300"
                  >
                    <div className="relative overflow-hidden">
                      {(news.featuredImage || news.image) ? (
                        <img
                          src={news.featuredImage || news.image}
                          alt={news.title}
                          className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-400 text-sm">No Image</span>
                        </div>
                      )}
                      <div className="absolute top-2 left-2">
                        <span className="bg-newsRed text-cleanWhite text-xs font-semibold px-2 py-1 rounded">
                          {news.category}
                        </span>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-bold text-deepCharcoal mb-2 line-clamp-2 group-hover:text-newsRed transition-colors">
                        {news.title}
                      </h3>
                      {news.subtitle && (
                        <p className="text-sm text-slateBody/80 mb-2 font-medium line-clamp-1">
                          {news.subtitle}
                        </p>
                      )}
                      <p className="text-sm text-slateBody line-clamp-2 mb-3">
                        {news.summary}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-metaGray">
                        <span>{news.date}</span>
                        <span>•</span>
                        <span>{news.author}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              {/* Second Row - 3 Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {otherNews.slice(2, 5).map((news) => (
                  <Link
                    key={news.id || news._id}
                    to={`/news/${news._id || news.id || ''}`}
                    className="group bg-cleanWhite rounded-lg overflow-hidden shadow-sm border border-subtleGray/70 hover:shadow-md transition-all duration-300"
                  >
                    <div className="relative overflow-hidden">
                      {(news.featuredImage || news.image) ? (
                        <img
                          src={news.featuredImage || news.image}
                          alt={news.title}
                          className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-400 text-sm">No Image</span>
                        </div>
                      )}
                      <div className="absolute top-2 left-2">
                        <span className="bg-newsRed text-cleanWhite text-xs font-semibold px-2 py-1 rounded">
                          {news.category}
                        </span>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-bold text-deepCharcoal mb-2 line-clamp-2 group-hover:text-newsRed transition-colors">
                        {news.title}
                      </h3>
                      {news.subtitle && (
                        <p className="text-sm text-slateBody/80 mb-2 font-medium line-clamp-1">
                          {news.subtitle}
                        </p>
                      )}
                      <p className="text-sm text-slateBody line-clamp-2 mb-3">
                        {news.summary}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-metaGray">
                        <span>{news.date}</span>
                        <span>•</span>
                        <span>{news.author}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>

            {/* Horizontal Video Ad Section */}
            <section className="mb-10">
              <div className="bg-cleanWhite rounded-lg overflow-hidden shadow-sm border border-subtleGray/70">
                <div className="relative w-full aspect-video bg-black min-h-[120px] md:min-h-[160px] lg:min-h-[200px]">
                  <p className="absolute top-2 left-2 z-10 text-[10px] text-cleanWhite/80 font-semibold uppercase tracking-wide bg-black/50 px-2 py-1 rounded">
                    व्हिडिओ जाहिरात
                  </p>
                  <div className="w-full h-full">
                    <video
                      className="w-full h-full object-cover"
                      autoPlay
                      muted
                      loop
                      playsInline
                    >
                      <source src="https://videos.pexels.com/video-files/3045163/3045163-hd_1920_1080_30fps.mp4" type="video/mp4" />
                      <source src="https://videos.pexels.com/video-files/3045163/3045163-uhd_2560_1440_30fps.mp4" type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  </div>
                </div>
              </div>
            </section>

            {/* Short Videos Section */}
            {shorts.length > 0 && (
              <section className="mb-10">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="h-6 w-1 bg-newsRed rounded-full"></div>
                    <h2 className="text-xl md:text-2xl font-bold text-deepCharcoal">
                      शॉर्ट व्हिडिओ
                    </h2>
                  </div>
                  <Link
                    to="/shorts"
                    className="text-sm font-semibold text-newsRed hover:text-newsRed/80 flex items-center gap-1 transition-colors"
                  >
                    सर्व पहा
                    <FaArrowRight className="w-3 h-3" />
                  </Link>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
                  {shorts.slice(0, 5).map((short) => (
                    <Link
                      key={short.id}
                      to={`/shorts/${short.id}`}
                      className="group relative bg-cleanWhite rounded-lg overflow-hidden shadow-sm border border-subtleGray/70 hover:shadow-md transition-all duration-300"
                    >
                      <div className="relative aspect-[9/16] overflow-hidden bg-black">
                        <img
                          src={short.image}
                          alt={short.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="bg-white/95 rounded-full p-2.5 md:p-3 group-hover:scale-110 transition-transform shadow-lg">
                            <FaPlay className="w-3 h-3 md:w-4 md:h-4 text-deepCharcoal ml-0.5" />
                          </div>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 p-2 md:p-3">
                          <h4 className="text-[10px] md:text-xs font-semibold text-cleanWhite line-clamp-2 group-hover:text-newsRed/90 transition-colors drop-shadow-lg">
                            {short.title}
                          </h4>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Category Sections */}
            {categories.map((category) => (
              <section key={category._id || category.id || category.nameEn} className="mb-10">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="h-6 w-1 bg-newsRed rounded-full"></div>
                    <h2 className="text-xl md:text-2xl font-bold text-deepCharcoal">
                      {category.name}
                    </h2>
                  </div>
                  <Link
                    to={`/category/${category._id || category.id || category.nameEn?.toLowerCase().replace(/\s+/g, '-')}`}
                    className="text-sm font-semibold text-newsRed hover:text-newsRed/80 flex items-center gap-1 transition-colors"
                  >
                    सर्व पहा
                    <FaArrowRight className="w-3 h-3" />
                  </Link>
                </div>

                {/* Featured Article for Category */}
                {category.news && category.news[0] && (
                  <div className="mb-6">
                    <Link
                      to={`/news/${category.news[0]._id || category.news[0].id || ''}`}
                      className="group block bg-cleanWhite rounded-lg overflow-hidden shadow-sm border border-subtleGray/70 hover:shadow-md transition-all duration-300"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                        <div className="relative overflow-hidden">
                          <img
                            src={category.news[0].featuredImage || category.news[0].image}
                            alt={category.news[0].title}
                            className="w-full h-64 md:h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        </div>
                        <div className="p-6 flex flex-col justify-center">
                          <div className="mb-3">
                            <span className="bg-newsRed/10 text-newsRed text-xs font-semibold px-2 py-1 rounded">
                              {category.name || category.nameEn}
                            </span>
                          </div>
                          <h3 className="text-xl md:text-2xl font-bold text-deepCharcoal mb-3 line-clamp-3 group-hover:text-newsRed transition-colors">
                            {category.news[0].title}
                          </h3>
                          {category.news[0].subtitle && (
                            <p className="text-sm text-slateBody/80 mb-3 font-medium line-clamp-2">
                              {category.news[0].subtitle}
                            </p>
                          )}
                          <p className="text-sm text-slateBody line-clamp-3 mb-4">
                            {category.news[0].summary}
                          </p>
                          <div className="flex items-center gap-3 text-xs text-metaGray">
                            <span>{new Date(category.news[0].publishedAt || category.news[0].createdAt || category.news[0].date).toLocaleDateString('mr-IN')}</span>
                            <span>•</span>
                            <span>{category.news[0].author?.name || category.news[0].author}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </div>
                )}

                {/* Other Articles Grid */}
                {category.news && category.news.length > 1 && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {category.news.slice(1, 4).map((news) => (
                      <Link
                        key={news.id || news._id}
                        to={`/news/${news._id || news.id || ''}`}
                        className="group bg-cleanWhite rounded-lg overflow-hidden shadow-sm border border-subtleGray/70 hover:shadow-md transition-all duration-300"
                      >
                        <div className="relative overflow-hidden">
                          <img
                            src={news.featuredImage || news.image}
                            alt={news.title}
                            className="w-full h-40 object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        </div>
                        <div className="p-4">
                          <h4 className="text-base font-bold text-deepCharcoal mb-2 line-clamp-2 group-hover:text-newsRed transition-colors">
                            {news.title}
                          </h4>
                          {news.subtitle && (
                            <p className="text-xs text-slateBody/80 mb-2 font-medium line-clamp-1">
                              {news.subtitle}
                            </p>
                          )}
                          <p className="text-xs text-slateBody line-clamp-2 mb-2">
                            {news.summary}
                          </p>
                          <p className="text-xs text-metaGray">{new Date(news.publishedAt || news.createdAt || news.date).toLocaleDateString('mr-IN')}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </section>
            ))}

            {/* Popular Articles Section - Numbered List */}
            <section className="mb-10 bg-cleanWhite rounded-lg p-6 shadow-sm border border-subtleGray/70">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-6 w-1 bg-newsRed rounded-full"></div>
                <h2 className="text-xl md:text-2xl font-bold text-deepCharcoal">
                  लोकप्रिय
                </h2>
              </div>
              <div className="space-y-4">
                {popularArticles.map((article, index) => (
                  <Link
                    key={article.id || article._id}
                    to={`/news/${article._id || article.id || ''}`}
                    className="flex items-start gap-4 group hover:bg-subtleGray/50 p-3 rounded-lg transition-colors"
                  >
                    <div className="flex-shrink-0 w-8 h-8 bg-newsRed text-cleanWhite rounded-full flex items-center justify-center font-bold text-sm">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-base font-semibold text-deepCharcoal line-clamp-2 group-hover:text-newsRed transition-colors">
                        {article.title}
                      </h4>
                      <p className="text-xs text-metaGray mt-1">{new Date(article.publishedAt || article.createdAt || article.date).toLocaleDateString('mr-IN')}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-2 order-3">
            <Sidebar type="right" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
