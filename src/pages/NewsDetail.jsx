import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import newsData from '../data/newsData.json';
import Sidebar from '../components/Sidebar';
import TextToSpeech from '../components/TextToSpeech';
import ShareButtons from '../components/ShareButtons';
import SEO from '../components/SEO';
import { getArticle, getCategories } from '../utils/api';

const NewsDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [news, setNews] = useState(null);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadArticle = async () => {
      try {
        setLoading(true);
        
        // Validate ID before making API call
        if (!id || id === 'undefined' || id === 'null') {
          console.warn('Invalid article ID:', id);
          setLoading(false);
          return;
        }
        
        // Try to get from API
        const article = await getArticle(id);
        
        if (article) {
          setNews(article);
          
          // Get category if categoryId exists
          if (article.categoryId) {
            const categories = await getCategories();
            const foundCategory = categories.find(cat => 
              (cat.id === article.categoryId) || 
              (cat._id === article.categoryId) ||
              (cat._id?.toString() === article.categoryId?.toString())
            );
            if (foundCategory) {
              setCategory(foundCategory);
            }
          }
        } else {
          // Fallback to JSON
          let foundNews = null;
          let foundCategory = null;
          
          for (const cat of newsData.categories) {
            const found = cat.news.find((n) => n.id === parseInt(id));
            if (found) {
              foundNews = found;
              foundCategory = cat;
              break;
            }
          }
          
          if (!foundNews) {
            const found = newsData.latestNews.find((n) => n.id === parseInt(id));
            if (found) {
              foundNews = found;
            }
          }
          
          setNews(foundNews);
          setCategory(foundCategory);
        }
      } catch (error) {
        console.error('Error loading article:', error);
        // Fallback to JSON
        let foundNews = null;
        let foundCategory = null;
        
        for (const cat of newsData.categories) {
          const found = cat.news.find((n) => n.id === parseInt(id));
          if (found) {
            foundNews = found;
            foundCategory = cat;
            break;
          }
        }
        
        if (!foundNews) {
          const found = newsData.latestNews.find((n) => n.id === parseInt(id));
          if (found) {
            foundNews = found;
          }
        }
        
        setNews(foundNews);
        setCategory(foundCategory);
      } finally {
        setLoading(false);
      }
    };

    loadArticle();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-subtleGray flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-newsRed"></div>
      </div>
    );
  }

  if (!news) {
    return (
      <div className="min-h-screen bg-subtleGray flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-deepCharcoal mb-4">बातमी सापडली नाही</h2>
          <Link to="/" className="text-editorialBlue hover:text-newsRed">
            मुखपृष्ठावर परत जा
          </Link>
        </div>
      </div>
    );
  }

  // Get plain text description for sharing
  const getPlainText = (html) => {
    if (!html) return '';
    try {
      const div = document.createElement('div');
      div.innerHTML = html;
      return div.textContent || div.innerText || '';
    } catch {
      return String(html).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    }
  };

  const articleDescription = news?.summary || (news?.content ? getPlainText(news.content).substring(0, 200) : '') || news?.title || '';
  
  // Ensure image URL is absolute for proper preview cards
  const getAbsoluteImageUrl = (imgUrl) => {
    if (!imgUrl) return '';
    // If already absolute (starts with http:// or https://)
    if (imgUrl.startsWith('http://') || imgUrl.startsWith('https://')) {
      return imgUrl;
    }
    // If relative, make it absolute
    return `${window.location.origin}${imgUrl.startsWith('/') ? imgUrl : `/${imgUrl}`}`;
  };
  
  const articleImage = getAbsoluteImageUrl(news?.featuredImage || news?.image || '');
  // Use backend URL for sharing so crawlers get proper meta tags
  // Prefer slug over ID for better SEO
  const backendBase = import.meta.env.VITE_BACKEND_URL || 'https://navbharat-sauwad-backend.onrender.com';
  const articleUrl = news 
    ? `${backendBase}/news/${news.slug || news._id || news.id}` 
    : window.location.href;

  return (
    <>
      <SEO 
        title={news.title}
        description={articleDescription}
        image={articleImage}
        url={articleUrl}
        type="article"
      />
      <div className="min-h-screen bg-subtleGray">
        <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-x-6 gap-y-6">
          {/* Left Sidebar - after main on mobile */}
          <div className="lg:col-span-2 order-2 lg:order-1">
            <Sidebar type="left" />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-8 order-1 lg:order-2">
            <article className="bg-cleanWhite rounded-lg border border-subtleGray px-4 sm:px-8 py-6 shadow-sm">
              {/* Category + breadcrumb style */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  {(category || news.categoryId) && (
                    <Link
                      to={`/category/${category?.id || category?._id || news.categoryId?.id || news.categoryId?._id || news.categoryId}`}
                      className="inline-flex items-center space-x-2 text-xs font-semibold uppercase tracking-wide text-newsRed"
                    >
                      <span className="h-5 w-1 rounded-full bg-newsRed" />
                      <span>{category?.name || news.categoryId?.name}</span>
                    </Link>
                  )}
                </div>
                <span className="hidden sm:inline text-xs text-metaGray">
                  {new Date(news.publishedAt || news.createdAt || news.date).toLocaleDateString('mr-IN')}
                </span>
              </div>

              {/* Article Image */}
              <div className="mb-6 rounded-lg overflow-hidden">
                <img
                  src={news.featuredImage || news.image}
                  alt={news.title}
                  className="w-full h-auto object-cover"
                />
              </div>

              {/* Article Title with TTS Button */}
              <div className="flex items-start justify-between gap-4 mb-3">
                <h1 className="text-3xl md:text-4xl font-bold text-deepCharcoal leading-tight flex-1">
                {news.title}
              </h1>
                <div className="flex-shrink-0 pt-1">
                  <TextToSpeech article={news} />
                </div>
              </div>

              {/* Article Meta */}
              <div className="flex flex-wrap items-center gap-3 text-sm text-metaGray mb-6 pb-4 border-b border-subtleGray">
                <span>{new Date(news.date || news.publishedAt || news.createdAt).toLocaleDateString('mr-IN')}</span>
                <span>•</span>
                <span>{news.author?.name || news.author}</span>
              </div>

              {/* Article Content */}
              <div className="prose max-w-none prose-headings:text-deepCharcoal prose-p:text-slateBody prose-p:leading-relaxed prose-p:mb-4 prose-h4:text-xl prose-h4:font-bold prose-h4:mt-6 prose-h4:mb-3 prose-strong:text-deepCharcoal prose-ul:list-disc prose-ul:ml-6 prose-ol:list-decimal prose-ol:ml-6">
                <div 
                  className="text-base text-slateBody leading-relaxed article-content"
                  dangerouslySetInnerHTML={{ __html: news.content || '' }}
                />
              </div>

              {/* Share and Back Buttons */}
              <div className="mt-8 pt-6 border-t border-subtleGray flex flex-col sm:flex-row justify-between items-center gap-4">
                <button
                  onClick={() => navigate(-1)}
                  className="bg-gradient-to-r from-newsRed to-editorialBlue text-cleanWhite px-6 py-2 rounded font-semibold hover:opacity-90 transition-opacity"
                >
                  परत जा
                </button>
                <ShareButtons
                  title={news.title}
                  description={articleDescription}
                  image={articleImage}
                  url={articleUrl}
                />
              </div>
            </article>
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-2 order-3">
            <Sidebar type="right" />
          </div>
        </div>
        </div>
      </div>
    </>
  );
};

export default NewsDetail;
