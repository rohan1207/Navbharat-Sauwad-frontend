import React from 'react';
import { useParams, Link } from 'react-router-dom';
import newsData from '../data/newsData.json';
import Sidebar from '../components/Sidebar';

const CategoryPage = () => {
  const { categoryId } = useParams();
  const category = newsData.categories.find((cat) => cat.id === categoryId);

  if (!category) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">श्रेणी सापडली नाही</h2>
          <Link to="/" className="text-orange-600 hover:text-orange-700">
            मुखपृष्ठावर परत जा
          </Link>
        </div>
      </div>
    );
  }

  const featuredNews = category.news[0];
  const otherNews = category.news.slice(1);

  return (
    <div className="min-h-screen bg-white">
      {/* Section Header */}
      <div className="bg-white border-b-2 border-gray-300 py-4">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
              {category.name}
            </h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Sidebar */}
          <div className="lg:col-span-2">
            <Sidebar type="left" />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-8">
            {/* Featured Story */}
            {featuredNews && (
              <article className="mb-8 pb-8 border-b border-gray-200">
                <Link to={`/news/${featuredNews.id}`} className="block group">
                  <div className="mb-4">
                    <img
                      src={featuredNews.image}
                      alt={featuredNews.title}
                      className="w-full h-96 object-cover rounded group-hover:opacity-90 transition-opacity"
                    />
                  </div>
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3 group-hover:text-orange-600 transition-colors">
                    {featuredNews.title}
                  </h1>
                  <p className="text-gray-700 text-lg leading-relaxed mb-3">
                    {featuredNews.summary}
                  </p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>{featuredNews.date}</span>
                    <span>•</span>
                    <span>{featuredNews.author}</span>
                  </div>
                </Link>
              </article>
            )}

            {/* Other Stories */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {otherNews.map((news) => (
                <Link
                  key={news.id}
                  to={`/news/${news.id}`}
                  className="group"
                >
                  <div className="mb-3">
                    <img
                      src={news.image}
                      alt={news.title}
                      className="w-full h-48 object-cover rounded group-hover:opacity-90 transition-opacity"
                    />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-orange-600 transition-colors">
                    {news.title}
                  </h3>
                  <p className="text-sm text-gray-600 line-clamp-3 mb-2">
                    {news.summary}
                  </p>
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <span>{news.date}</span>
                    <span>•</span>
                    <span>{news.author}</span>
                  </div>
                </Link>
              ))}
            </div>
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

export default CategoryPage;
