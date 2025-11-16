import React from 'react';
import { Link } from 'react-router-dom';
import newsData from '../data/newsData.json';
import Sidebar from '../components/Sidebar';
import TopVideos from '../components/TopVideos';

const Home = () => {
  const latestNews = newsData.latestNews;
  const featuredNews = latestNews[0];
  const otherNews = latestNews.slice(1, 4);
  const categories = newsData.categories.slice(0, 4);

  return (
    <div className="min-h-screen bg-white">
      {/* Main Content Area - 3 Column Layout */}
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
                  <div className="mb-2">
                    <span className="inline-block bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500 text-white text-xs font-semibold px-2 py-1 rounded">
                      {featuredNews.category}
                    </span>
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

            {/* Other Top Stories */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 pb-8 border-b border-gray-200">
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
                  <div className="mb-2">
                    <span className="text-xs font-semibold text-orange-600 uppercase">
                      {news.category}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-orange-600 transition-colors">
                    {news.title}
                  </h3>
                  <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                    {news.summary}
                  </p>
                  <p className="text-xs text-gray-500">{news.date}</p>
                </Link>
              ))}
            </div>

            {/* Top Videos Section */}
            <TopVideos />

            {/* Category Sections */}
            {categories.map((category) => (
              <section key={category.id} className="mb-12">
                {/* Section Header */}
                <div className="flex items-center justify-between mb-6 pb-3 border-b-2 border-gray-300">
                  <div className="flex items-center space-x-3">
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                      {category.name}
                    </h2>
                  </div>
                  <Link
                    to={`/category/${category.id}`}
                    className="text-sm font-semibold text-orange-600 hover:text-orange-700"
                  >
                    सर्व पहा →
                  </Link>
                </div>

                {/* Category News Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {category.news.slice(0, 4).map((news) => (
                    <Link
                      key={news.id}
                      to={`/news/${news.id}`}
                      className="group flex space-x-4"
                    >
                      <div className="flex-shrink-0 w-32 h-24 bg-gray-200 rounded overflow-hidden">
                        <img
                          src={news.image}
                          alt={news.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-bold text-gray-900 mb-1 line-clamp-2 group-hover:text-orange-600 transition-colors">
                          {news.title}
                        </h3>
                        <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                          {news.summary}
                        </p>
                        <p className="text-xs text-gray-500">{news.date}</p>
                      </div>
                    </Link>
                  ))}
                </div>

                {/* See More Link */}
                <div className="mt-6 text-center">
                  <Link
                    to={`/category/${category.id}`}
                    className="inline-block text-sm font-semibold text-orange-600 hover:text-orange-700"
                  >
                    अधिक बातम्या पहा →
                  </Link>
                </div>
              </section>
            ))}
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

export default Home;
