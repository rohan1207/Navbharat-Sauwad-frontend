import React, { useState, useEffect } from 'react';
import { FaDownload, FaSync } from 'react-icons/fa';
import Sidebar from '../components/Sidebar';
import EPaperPage2 from '../components/EPaperPage2';
import { loadEpapers } from '../utils/epaperLoader';

const EPaper2 = () => {
  const [epapers, setEpapers] = useState([]);
  const [selectedEpaper, setSelectedEpaper] = useState(null);
  const [selectedSection, setSelectedSection] = useState(null);

  // Function to load epapers
  const loadEpaperData = React.useCallback(async () => {
    try {
      const loaded = await loadEpapers();
      if (loaded && Array.isArray(loaded) && loaded.length > 0) {
        setEpapers(loaded);
        setSelectedEpaper(prev => {
          if (prev) {
            const updated = loaded.find(ep => ep.id === prev.id);
            return updated || prev;
          }
          return prev;
        });
      }
    } catch (error) {
      console.error('Error loading epapers:', error);
    }
  }, []);

  useEffect(() => {
    loadEpaperData();
  }, [loadEpaperData]);

  const handleSectionClick = (epaper, page, newsItem) => {
    setSelectedSection({
      epaper,
      page,
      news: newsItem,
      croppedImageUrl: getCroppedImageUrl(page.image, newsItem)
    });
  };

  // Helper to generate cropped Cloudinary URL
  const getCroppedImageUrl = (pageImageUrl, newsItem) => {
    if (!pageImageUrl || !newsItem) return pageImageUrl;
    
    // Extract Cloudinary public_id
    const urlMatch = pageImageUrl.match(/\/v\d+\/(.+)$/);
    if (!urlMatch) return pageImageUrl;
    
    const filename = pageImageUrl.split('/').pop();
    const baseUrl = pageImageUrl.split('/').slice(0, -2).join('/');
    
    // Cloudinary transformations for cropping
    const transformations = [
      `w_${Math.round(newsItem.width)}`,
      `h_${Math.round(newsItem.height)}`,
      `x_${Math.round(newsItem.x)}`,
      `y_${Math.round(newsItem.y)}`,
      `c_crop`,
      `q_auto:best`,
      `f_auto`
    ].join(',');
    
    return `${baseUrl}/image/upload/${transformations}/${filename}`;
  };

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('mr-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const closeSectionModal = () => {
    setSelectedSection(null);
  };

  return (
    <div className="min-h-screen bg-subtleGray">
      {/* Section Header */}
      <div className="bg-cleanWhite border-b-2 border-subtleGray py-4">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center">
            <h1 className="text-3xl md:text-4xl font-bold text-deepCharcoal">
              ई-पेपर 2 (सरलीकृत)
            </h1>
          </div>
          <p className="text-center text-sm text-metaGray mt-2">
            क्लिक करा आणि फक्त त्या विभागाची छवी पहा
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Sidebar */}
          <div className="lg:col-span-2 order-2 lg:order-1">
            <Sidebar type="left" />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-8 order-1 lg:order-2">
            {/* E-Paper List */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6 pb-3 border-b border-subtleGray">
                <h2 className="text-2xl font-bold text-deepCharcoal">
                  उपलब्ध ई-पेपर
                </h2>
                <button
                  onClick={loadEpaperData}
                  className="flex items-center space-x-2 px-4 py-2 bg-subtleGray text-slateBody rounded-lg hover:bg-subtleGray/80 transition-colors"
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
                    className="bg-cleanWhite border border-subtleGray rounded-lg p-6 hover:shadow-lg transition-shadow"
                  >
                    <h3 className="text-xl font-bold text-deepCharcoal mb-2">{epaper.title}</h3>
                    <p className="text-slateBody mb-4 text-sm">{epaper.date}</p>
                    <button
                      onClick={() => setSelectedEpaper(epaper)}
                      className="w-full bg-gradient-to-r from-newsRed to-editorialBlue text-cleanWhite px-4 py-2 rounded hover:opacity-90 transition-opacity font-semibold"
                    >
                      पेपर पहा
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* E-Paper Viewer */}
            {selectedEpaper && (
              <div className="bg-cleanWhite border border-subtleGray rounded-lg p-6 mb-8">
                <div className="flex justify-between items-center mb-4 pb-3 border-b border-subtleGray">
                  <h2 className="text-2xl font-bold text-deepCharcoal">
                    {selectedEpaper.title}
                  </h2>
                  <button
                    onClick={() => setSelectedEpaper(null)}
                    className="text-metaGray hover:text-deepCharcoal text-xl font-bold"
                  >
                    ✕
                  </button>
                </div>
                <div className="space-y-6">
                  {selectedEpaper.pages.map((page) => (
                    <EPaperPage2
                      key={page.pageNo}
                      page={page}
                      onSectionClick={(newsItem) => handleSectionClick(selectedEpaper, page, newsItem)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-2 order-3">
            <Sidebar type="right" />
          </div>
        </div>
      </div>

      {/* Section Detail Modal - Shows Cropped Image */}
      {selectedSection && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-cleanWhite rounded-lg shadow-xl max-w-5xl w-full max-h-[95vh] overflow-y-auto">
            {/* Header */}
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-subtleGray sticky top-0 bg-cleanWhite z-10">
              <h2 className="text-xl font-bold text-deepCharcoal">
                बातमी विभाग
              </h2>
              <button
                onClick={closeSectionModal}
                className="text-metaGray hover:text-deepCharcoal text-2xl font-bold"
              >
                ✕
              </button>
            </div>
            
            {/* Cropped Image - The Main Content */}
            <div className="mb-4 border border-subtleGray rounded-lg overflow-hidden bg-gray-50">
              <img
                src={selectedSection.croppedImageUrl}
                alt="बातमी विभाग"
                className="w-full h-auto"
                style={{ 
                  imageRendering: 'crisp-edges',
                  display: 'block'
                }}
                onError={(e) => {
                  console.error('Error loading cropped image:', selectedSection.croppedImageUrl);
                  e.target.src = selectedSection.page.image;
                }}
              />
            </div>
            
            {/* Auto-generated Metadata */}
            <div className="space-y-2 text-sm text-metaGray border-t border-subtleGray pt-4">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-deepCharcoal">📄 पृष्ठ:</span>
                <span>{selectedSection.page.pageNo}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-deepCharcoal">📰 वृत्तपत्र:</span>
                <span>{selectedSection.epaper.title}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-deepCharcoal">📅 तारीख:</span>
                <span>{formatDate(selectedSection.epaper.date)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EPaper2;



