import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import newsData from '../data/newsData.json';
import Sidebar from '../components/Sidebar';

const NewsDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Find news in all categories
  let news = null;
  let category = null;

  for (const cat of newsData.categories) {
    const found = cat.news.find((n) => n.id === parseInt(id));
    if (found) {
      news = found;
      category = cat;
      break;
    }
  }

  // Also check latest news
  if (!news) {
    const found = newsData.latestNews.find((n) => n.id === parseInt(id));
    if (found) {
      news = found;
    }
  }

  if (!news) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">बातमी सापडली नाही</h2>
          <Link to="/" className="text-orange-600 hover:text-orange-700">
            मुखपृष्ठावर परत जा
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Sidebar */}
          <div className="lg:col-span-2">
            <Sidebar type="left" />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-8">
            <article className="bg-white">
              {/* Category Badge */}
              {category && (
                <div className="mb-4">
                  <Link
                    to={`/category/${category.id}`}
                    className="inline-block bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500 text-white text-sm font-semibold px-3 py-1 rounded hover:opacity-90"
                  >
                    {category.name}
                  </Link>
                </div>
              )}

              {/* Article Image */}
              <div className="mb-6">
                <img
                  src={news.image}
                  alt={news.title}
                  className="w-full h-auto rounded"
                />
              </div>

              {/* Article Title */}
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
                {news.title}
              </h1>

              {/* Article Meta */}
              <div className="flex items-center space-x-4 text-sm text-gray-600 mb-6 pb-4 border-b border-gray-200">
                <span>{news.date}</span>
                <span>•</span>
                <span>{news.author}</span>
              </div>

              {/* Article Content */}
              <div className="prose max-w-none">
                <p className="text-lg text-gray-700 leading-relaxed mb-4">
                  {news.summary}
                </p>
                <p className="text-base text-gray-700 leading-relaxed whitespace-pre-line">
                  {news.content}
                </p>
              </div>

              {/* Back Button */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={() => navigate(-1)}
                  className="bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500 text-white px-6 py-2 rounded font-semibold hover:opacity-90 transition-opacity"
                >
                  परत जा
                </button>
              </div>
            </article>
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-2">
            <Sidebar type="right" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsDetail;
