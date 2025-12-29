import React from 'react';
import { Link } from 'react-router-dom';
import newsData from '../data/newsData.json';

const Sidebar = ({ type = 'left' }) => {
  const mostPopular = newsData.latestNews.slice(0, 5);
  const latestNews = newsData.latestNews.slice(0, 3);

  if (type === 'left') {
    return (
      <aside className="w-full lg:w-64 space-y-6">
        {/* Advertisement */}
        <div className="bg-cleanWhite border border-subtleGray rounded p-4 text-center">
          <p className="text-xs text-metaGray mb-2">जाहिरात</p>
          <div className="h-64 bg-subtleGray rounded flex items-center justify-center overflow-hidden">
            <img
              src="/ad.png"
              alt="Advertisement"
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        {/* Most Popular */}
        <div>
          <h3 className="text-lg font-bold text-deepCharcoal mb-4 border-b border-subtleGray pb-2">
            सर्वाधिक वाचले
          </h3>
          <div className="space-y-4">
            {mostPopular.map((news, index) => (
              <Link
                key={news.id}
                to={`/news/${news._id || news.id || ''}`}
                className="flex space-x-3 group hover:bg-subtleGray p-2 rounded transition-colors"
              >
                <div className="flex-shrink-0 w-20 h-20 bg-subtleGray rounded overflow-hidden">
                  <img
                    src={news.image}
                    alt={news.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-deepCharcoal line-clamp-2 group-hover:text-newsRed transition-colors">
                    {news.title}
                  </h4>
                  <p className="text-xs text-metaGray mt-1">{news.date}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </aside>
    );
  }

  // Right Sidebar
  const allNews = [...newsData.latestNews, ...newsData.categories.flatMap(cat => cat.news)];
  const popularNews = allNews.slice(0, 5);

  return (
    <aside className="w-full lg:w-64 space-y-6">
      {/* Advertisement */}
      <div className="bg-cleanWhite border border-subtleGray rounded-lg p-4 text-center shadow-sm">
        <p className="text-xs text-metaGray mb-2 font-semibold">जाहिरात</p>
        <div className="h-64 bg-subtleGray rounded-lg flex items-center justify-center overflow-hidden">
          <img
            src="/ad.png"
            alt="Advertisement"
            className="w-full h-full object-contain"
          />
        </div>
      </div>

      {/* Latest News Timeline */}
      <div className="bg-cleanWhite rounded-lg p-4 shadow-sm border border-subtleGray">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-subtleGray">
          <div className="h-5 w-0.5 bg-newsRed rounded-full"></div>
          <h3 className="text-lg font-bold text-deepCharcoal">
            ताज्या बातम्या
          </h3>
        </div>
        <div className="space-y-4 relative">
          <div className="absolute left-2 top-0 bottom-0 w-0.5 bg-subtleGray"></div>
          {latestNews.map((news, index) => (
            <div key={news.id} className="relative pl-6">
              <div className="absolute left-0 top-1 w-4 h-4 bg-newsRed rounded-full border-2 border-white shadow-sm"></div>
              <Link
                to={`/news/${news._id || news.id || ''}`}
                className="block group hover:bg-subtleGray/50 p-2 rounded-lg transition-colors"
              >
                <p className="text-xs text-metaGray mb-1">
                  {news.date}
                </p>
                <h4 className="text-sm font-semibold text-deepCharcoal line-clamp-2 group-hover:text-newsRed transition-colors">
                  {news.title}
                </h4>
              </Link>
            </div>
          ))}
        </div>
        <Link
          to="/category/latest-news"
          className="block text-center text-sm text-newsRed hover:text-newsRed/80 mt-4 font-semibold transition-colors"
        >
          अधिक बातम्या वाचा →
        </Link>
      </div>

      {/* Popular News */}
      <div className="bg-cleanWhite rounded-lg p-4 shadow-sm border border-subtleGray">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-subtleGray">
          <div className="h-5 w-0.5 bg-newsRed rounded-full"></div>
          <h3 className="text-lg font-bold text-deepCharcoal">
            लोकप्रिय
          </h3>
        </div>
        <div className="space-y-3">
          {popularNews.map((news, index) => (
            <Link
              key={news.id}
              to={`/news/${news.id}`}
              className="flex items-start gap-3 group hover:bg-subtleGray/50 p-2 rounded-lg transition-colors"
            >
              <div className="flex-shrink-0 w-6 h-6 bg-newsRed text-cleanWhite rounded-full flex items-center justify-center font-bold text-xs">
                {index + 1}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-deepCharcoal line-clamp-2 group-hover:text-newsRed transition-colors">
                  {news.title}
                </h4>
                <p className="text-xs text-metaGray mt-1">{news.date}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;






