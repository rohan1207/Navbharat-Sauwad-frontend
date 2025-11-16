import React from 'react';
import { Link } from 'react-router-dom';
import newsData from '../data/newsData.json';

const Sidebar = ({ type = 'left' }) => {
  const mostPopular = newsData.latestNews.slice(0, 5);
  const latestNews = newsData.latestNews.slice(0, 3);

  if (type === 'left') {
    return (
      <aside className="w-full lg:w-64 space-y-6">
        {/* Advertisement Placeholder */}
        <div className="bg-gray-100 border border-gray-200 rounded p-4 text-center">
          <p className="text-xs text-gray-500 mb-2">जाहिरात</p>
          <div className="h-64 bg-gray-200 rounded flex items-center justify-center">
            <span className="text-gray-400 text-sm">जाहिरात स्थान</span>
          </div>
        </div>

        {/* Most Popular */}
        <div>
          <h3 className="text-lg font-bold text-orange-600 mb-4 border-b border-gray-200 pb-2">
            सर्वाधिक वाचले
          </h3>
          <div className="space-y-4">
            {mostPopular.map((news, index) => (
              <Link
                key={news.id}
                to={`/news/${news.id}`}
                className="flex space-x-3 group hover:bg-gray-50 p-2 rounded transition-colors"
              >
                <div className="flex-shrink-0 w-20 h-20 bg-gray-200 rounded overflow-hidden">
                  <img
                    src={news.image}
                    alt={news.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-gray-900 line-clamp-2 group-hover:text-orange-600 transition-colors">
                    {news.title}
                  </h4>
                  <p className="text-xs text-gray-500 mt-1">{news.date}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </aside>
    );
  }

  // Right Sidebar
  return (
    <aside className="w-full lg:w-64 space-y-6">
      {/* Advertisement Placeholder */}
      <div className="bg-gray-100 border border-gray-200 rounded p-4 text-center">
        <p className="text-xs text-gray-500 mb-2">जाहिरात</p>
        <div className="h-64 bg-gray-200 rounded flex items-center justify-center">
          <span className="text-gray-400 text-sm">जाहिरात स्थान</span>
        </div>
      </div>

      {/* Latest News Timeline */}
      <div>
        <h3 className="text-lg font-bold text-orange-600 mb-4 border-b border-gray-200 pb-2">
          ताज्या बातम्या
        </h3>
        <div className="space-y-4 relative">
          <div className="absolute left-2 top-0 bottom-0 w-0.5 bg-gray-200"></div>
          {latestNews.map((news, index) => (
            <div key={news.id} className="relative pl-6">
              <div className="absolute left-0 top-1 w-4 h-4 bg-orange-600 rounded-full border-2 border-white"></div>
              <Link
                to={`/news/${news.id}`}
                className="block group hover:bg-gray-50 p-2 rounded transition-colors"
              >
                <p className="text-xs text-gray-500 mb-1">
                  {news.date} - {news.category}
                </p>
                <h4 className="text-sm font-semibold text-gray-900 line-clamp-2 group-hover:text-orange-600 transition-colors">
                  {news.title}
                </h4>
              </Link>
            </div>
          ))}
        </div>
        <Link
          to="/"
          className="block text-center text-sm text-orange-600 hover:text-orange-700 mt-4 font-medium"
        >
          अधिक बातम्या वाचा →
        </Link>
      </div>
    </aside>
  );
};

export default Sidebar;





