import React, { useState, useEffect } from 'react';
import newsData from '../data/newsData.json';
import { FaDownload, FaSync } from 'react-icons/fa';
import Sidebar from '../components/Sidebar';
import EPaperPage from '../components/EPaperPage';
import { loadEpapers } from '../utils/epaperLoader';

const EPaper = () => {
  const [epapers, setEpapers] = useState([]);
  const [selectedEpaper, setSelectedEpaper] = useState(null);
  const [selectedNews, setSelectedNews] = useState(null);

  // Function to load epapers
  const loadEpaperData = React.useCallback(async () => {
    try {
      const loaded = await loadEpapers();
      console.log('Loaded epapers:', loaded);
      if (loaded && Array.isArray(loaded) && loaded.length > 0) {
        setEpapers(loaded);
        // Update selected epaper if it exists
        setSelectedEpaper(prev => {
          if (prev) {
            const updated = loaded.find(ep => ep.id === prev.id);
            return updated || prev;
          }
          return prev;
        });
      } else {
        // Fallback to default data
        const fallback = newsData.epapers || [];
        setEpapers(fallback);
        console.log('Using fallback data:', fallback);
      }
    } catch (error) {
      console.error('Error loading epapers:', error);
      // Fallback to default data on error
      setEpapers(newsData.epapers || []);
    }
  }, []);

  // Load epapers on mount
  useEffect(() => {
    loadEpaperData();
  }, [loadEpaperData]);

  // Listen for storage events (when data is updated in admin panel)
  useEffect(() => {
    const handleStorageChange = (e) => {
      console.log('Storage event detected:', e.key, e.newValue);
      if (e.key === 'epapers') {
        console.log('Epapers updated in storage, reloading...');
        loadEpaperData();
      }
    };

    // Listen for storage events (works across tabs)
    window.addEventListener('storage', handleStorageChange);

    // Also listen for focus events to refresh when user comes back to tab
    const handleFocus = () => {
      console.log('Window focused, checking for epaper updates...');
      loadEpaperData();
    };
    window.addEventListener('focus', handleFocus);

    // Also listen for custom event (for same-tab updates)
    const handleCustomStorage = () => {
      console.log('Custom epapersUpdated event received, reloading...');
      loadEpaperData();
    };
    window.addEventListener('epapersUpdated', handleCustomStorage);

    // Also poll localStorage periodically (as a fallback)
    const pollInterval = setInterval(() => {
      const saved = localStorage.getItem('epapers');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length !== epapers.length) {
            console.log('Epaper count changed, reloading...');
            loadEpaperData();
          }
        } catch (e) {
          // Ignore parse errors
        }
      }
    }, 2000); // Check every 2 seconds

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('epapersUpdated', handleCustomStorage);
      clearInterval(pollInterval);
    };
  }, [loadEpaperData, epapers.length]);

  const handleNewsClick = (epaper, page, newsItem) => {
    setSelectedNews({
      epaper,
      page,
      news: newsItem,
    });
  };

  const closeNewsModal = () => {
    setSelectedNews(null);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Section Header */}
      <div className="bg-white border-b-2 border-gray-300 py-4">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
              ई-पेपर
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
            {/* E-Paper List */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6 pb-3 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900">
                  उपलब्ध ई-पेपर
                </h2>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    loadEpaperData();
                  }}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  title="रिफ्रेश करा"
                >
                  <FaSync className="w-4 h-4" />
                  <span className="text-sm">रिफ्रेश</span>
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {epapers.map((epaper) => (
                  <div
                    key={epaper.id}
                    className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
                  >
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{epaper.title}</h3>
                    <p className="text-gray-600 mb-4 text-sm">{epaper.date}</p>
                    <div className="flex space-x-3">
                      <button
                        onClick={() => setSelectedEpaper(epaper)}
                        className="flex-1 bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500 text-white px-4 py-2 rounded hover:opacity-90 transition-opacity font-semibold text-sm"
                      >
                        पेपर पहा
                      </button>
                      <button className="flex items-center justify-center bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-800 transition-colors">
                        <FaDownload className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* E-Paper Viewer */}
            {selectedEpaper && (
              <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
                <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-200">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {selectedEpaper.title}
                  </h2>
                  <button
                    onClick={() => setSelectedEpaper(null)}
                    className="text-gray-600 hover:text-gray-900 text-xl font-bold"
                  >
                    ✕
                  </button>
                </div>
                <div className="space-y-6">
                  {selectedEpaper.pages.map((page) => (
                    <EPaperPage
                      key={page.pageNo}
                      page={page}
                      onNewsClick={(newsItem) => handleNewsClick(selectedEpaper, page, newsItem)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-2">
            <Sidebar type="right" />
          </div>
        </div>
      </div>

      {/* News Detail Modal */}
      {selectedNews && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                {selectedNews.news.title}
              </h2>
              <button
                onClick={closeNewsModal}
                className="text-gray-600 hover:text-gray-900 text-2xl font-bold"
              >
                ✕
              </button>
            </div>
            <div className="space-y-3 text-sm text-gray-600 mb-4">
              <p>
                <strong className="text-gray-900">वृत्तपत्र:</strong> {selectedNews.epaper.title}
              </p>
              <p>
                <strong className="text-gray-900">तारीख:</strong> {selectedNews.epaper.date}
              </p>
              <p>
                <strong className="text-gray-900">पृष्ठ क्रमांक:</strong> {selectedNews.page.pageNo}
              </p>
            </div>
            <div className="border-t pt-4">
              <p className="text-gray-700 leading-relaxed">
                {selectedNews.news.content}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EPaper;
