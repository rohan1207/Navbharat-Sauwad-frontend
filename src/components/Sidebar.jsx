import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import newsData from '../data/newsData.json';
import { apiFetch } from '../utils/api';

const Sidebar = ({ type = 'left' }) => {
  const mostPopular = newsData.latestNews.slice(0, 5);
  const latestNews = newsData.latestNews.slice(0, 3);
  const [ads, setAds] = useState([]);

  useEffect(() => {
    const fetchAds = async () => {
      try {
        const position = type === 'left' ? 'left' : 'right';
        const data = await apiFetch(`/ads/active/${position}`);
        if (data && data.length > 0) {
          setAds(data);
          // Track impressions
          data.forEach(ad => {
            if (ad._id) {
              apiFetch(`/ads/${ad._id}/impression`, { method: 'POST' }).catch(console.error);
            }
          });
        }
      } catch (error) {
        console.error('Error fetching ads:', error);
      }
    };
    fetchAds();
  }, [type]);

  const handleAdClick = async (adId, link) => {
    if (adId) {
      try {
        await apiFetch(`/ads/${adId}/click`, { method: 'POST' });
      } catch (error) {
        console.error('Error tracking click:', error);
      }
    }
    if (link) {
      window.open(link, '_blank', 'noopener,noreferrer');
    }
  };

  if (type === 'left') {
    return (
      <aside className="w-full space-y-6">
        {/* Advertisement */}
        {ads.length > 0 ? (
          ads.map((ad) => (
            <div key={ad._id} className="group">
              <div 
                className="h-[420px] md:h-[500px] bg-gradient-to-br from-subtleGray/20 to-subtleGray/5 rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.01] border border-subtleGray/20"
                onClick={() => handleAdClick(ad._id, ad.link)}
              >
                {ad.videoUrl ? (
                  <video
                    src={ad.videoUrl}
                    className="w-full h-full object-cover"
                    autoPlay
                    muted
                    loop
                    playsInline
                  />
                ) : (
                  <img
                    src={ad.imageUrl}
                    alt={ad.title || 'जाहिरात'}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="h-[420px] md:h-[500px] bg-gradient-to-br from-subtleGray/10 to-subtleGray/5 rounded-xl flex items-center justify-center border border-subtleGray/10">
            <p className="text-xs text-metaGray/60 font-medium">जाहिरात</p>
          </div>
        )}

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
    <aside className="w-full space-y-6">
      {/* Advertisement */}
      {ads.length > 0 ? (
        ads.map((ad) => (
          <div key={ad._id} className="group">
            <div 
              className="h-[420px] md:h-[500px] bg-gradient-to-br from-subtleGray/20 to-subtleGray/5 rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.01] border border-subtleGray/20"
              onClick={() => handleAdClick(ad._id, ad.link)}
            >
              {ad.videoUrl ? (
                <video
                  src={ad.videoUrl}
                  className="w-full h-full object-cover"
                  autoPlay
                  muted
                  loop
                  playsInline
                />
              ) : (
                <img
                  src={ad.imageUrl}
                  alt={ad.title || 'जाहिरात'}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              )}
            </div>
          </div>
        ))
      ) : (
        <div className="h-[420px] md:h-[500px] bg-gradient-to-br from-subtleGray/10 to-subtleGray/5 rounded-xl flex items-center justify-center border border-subtleGray/10">
          <p className="text-xs text-metaGray/60 font-medium">जाहिरात</p>
        </div>
      )}

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

      {/* Vertical Video Ad Section */}
      <VerticalVideoAds />
    </aside>
  );
};

// Vertical Video Ads Component
const VerticalVideoAds = () => {
  const [ads, setAds] = useState([]);

  useEffect(() => {
    const fetchAds = async () => {
      try {
        const data = await apiFetch('/ads/active/right-vertical-video');
        if (data && data.length > 0) {
          setAds(data);
          // Track impressions
          data.forEach(ad => {
            if (ad._id) {
              apiFetch(`/ads/${ad._id}/impression`, { method: 'POST' }).catch(console.error);
            }
          });
        }
      } catch (error) {
        console.error('Error fetching vertical video ads:', error);
      }
    };
    fetchAds();
  }, []);

  const handleAdClick = async (adId, link) => {
    if (adId) {
      try {
        await apiFetch(`/ads/${adId}/click`, { method: 'POST' });
      } catch (error) {
        console.error('Error tracking click:', error);
      }
    }
    if (link) {
      window.open(link, '_blank', 'noopener,noreferrer');
    }
  };

  if (ads.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {ads.map((ad) => (
        <div 
          key={ad._id} 
          className="bg-cleanWhite rounded-lg overflow-hidden shadow-sm border border-subtleGray/70 cursor-pointer hover:shadow-md transition-all duration-300 group"
          onClick={() => handleAdClick(ad._id, ad.link)}
        >
          <div className="relative aspect-[9/16] bg-black">
            {ad.videoUrl ? (
              <video
                src={ad.videoUrl}
                className="w-full h-full object-cover"
                autoPlay
                muted
                loop
                playsInline
              />
            ) : (
              <img
                src={ad.imageUrl}
                alt={ad.title || 'जाहिरात'}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            )}
            <div className="absolute top-2 left-2 z-10">
              <span className="text-[10px] text-cleanWhite/80 font-semibold uppercase tracking-wide bg-black/50 px-2 py-1 rounded">
                व्हिडिओ जाहिरात
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Sidebar;






