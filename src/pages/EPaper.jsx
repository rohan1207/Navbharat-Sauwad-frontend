import React, { useState, useEffect, useRef } from 'react';
import newsData from '../data/newsData.json';
import { FaDownload, FaSync } from 'react-icons/fa';
import Sidebar from '../components/Sidebar';
import EPaperPage from '../components/EPaperPage';
import { loadEpapers } from '../utils/epaperLoader';

// Zoomable Image Component for Mobile News Modal
const ZoomableNewsImage = ({ imageUrl, alt, fallbackImage }) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);
  
  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;

    const getDistance = (touch1, touch2) => {
      const dx = touch2.clientX - touch1.clientX;
      const dy = touch2.clientY - touch1.clientY;
      return Math.sqrt(dx * dx + dy * dy);
    };

    let initialDistance = 0;
    let initialScale = 1;

    const handleTouchStart = (e) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        e.stopPropagation();
        initialDistance = getDistance(e.touches[0], e.touches[1]);
        initialScale = scale;
      } else if (e.touches.length === 1 && scale > 1) {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
        setDragStart({
          x: e.touches[0].clientX - position.x,
          y: e.touches[0].clientY - position.y
        });
      }
    };

    const handleTouchMove = (e) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        e.stopPropagation();
        const currentDistance = getDistance(e.touches[0], e.touches[1]);
        const newScale = Math.max(1, Math.min(5, (currentDistance / initialDistance) * initialScale));
        setScale(newScale);
      } else if (e.touches.length === 1 && isDragging && scale > 1) {
        e.preventDefault();
        e.stopPropagation();
        const newX = e.touches[0].clientX - dragStart.x;
        const newY = e.touches[0].clientY - dragStart.y;
        
        const maxX = (scale - 1) * (container.offsetWidth / 2);
        const maxY = (scale - 1) * (container.offsetHeight / 2);
        
        setPosition({
          x: Math.max(-maxX, Math.min(maxX, newX)),
          y: Math.max(-maxY, Math.min(maxY, newY))
        });
      }
    };

    const handleTouchEnd = (e) => {
      e.stopPropagation();
      setIsDragging(false);
      if (scale < 1) setScale(1);
      if (scale === 1) {
        setPosition({ x: 0, y: 0 });
      }
    };

    let lastTap = 0;
    const handleDoubleTap = (e) => {
      const currentTime = new Date().getTime();
      const tapLength = currentTime - lastTap;
      if (tapLength < 300 && tapLength > 0) {
        e.preventDefault();
        e.stopPropagation();
        if (scale === 1) {
          setScale(2);
        } else {
          setScale(1);
          setPosition({ x: 0, y: 0 });
        }
      }
      lastTap = currentTime;
    };

    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd, { passive: false });
    container.addEventListener('touchend', handleDoubleTap, { passive: false });

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
      container.removeEventListener('touchend', handleDoubleTap);
    };
  }, [scale, position, isDragging, dragStart]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden bg-cleanWhite"
      style={{
        touchAction: 'none',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        WebkitTouchCallout: 'none'
      }}
    >
      <div
        style={{
          transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
          transformOrigin: 'center center',
          transition: scale === 1 ? 'transform 0.3s ease-out' : 'none',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '4px'
        }}
      >
        <img
          src={imageUrl}
          alt={alt}
          className="w-full h-auto object-contain"
          style={{
            maxWidth: '100%',
            maxHeight: '100%',
            pointerEvents: 'none',
            imageRendering: 'crisp-edges',
            WebkitUserDrag: 'none',
            userDrag: 'none'
          }}
          onError={(e) => {
            console.error('Error loading image:', imageUrl);
            if (fallbackImage && e.target.src !== fallbackImage) {
              e.target.src = fallbackImage;
            }
          }}
        />
      </div>
      
      {/* Zoom indicator */}
      {scale > 1 && (
        <div className="absolute top-2 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-3 py-1 rounded-full text-xs z-10">
          {Math.round(scale * 100)}%
        </div>
      )}
    </div>
  );
};

const EPaper = () => {
  const [epapers, setEpapers] = useState([]);
  const [selectedEpaper, setSelectedEpaper] = useState(null);
  const [selectedNews, setSelectedNews] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

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

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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

  // Helper to generate cropped Cloudinary URL
  const getCroppedImageUrl = (pageImageUrl, newsItem, pageWidth, pageHeight) => {
    if (!pageImageUrl || !newsItem) return pageImageUrl;
    
    // Check if it's a Cloudinary URL
    if (!pageImageUrl.includes('cloudinary.com')) {
      // If not Cloudinary, we can't crop it server-side
      // Return original URL (frontend cropping would require canvas)
      return pageImageUrl;
    }
    
    try {
      // Cloudinary URL format: https://res.cloudinary.com/{cloud_name}/image/upload/{version}/{public_id}.{ext}
      // We need to insert transformations before the version or public_id
      
      // Find the position after 'upload'
      const uploadIndex = pageImageUrl.indexOf('/image/upload/');
      if (uploadIndex === -1) return pageImageUrl;
      
      // Get base URL up to 'upload'
      const baseUrl = pageImageUrl.substring(0, uploadIndex + '/image/upload'.length);
      
      // Get everything after 'upload/' (version/public_id/filename)
      const afterUpload = pageImageUrl.substring(uploadIndex + '/image/upload/'.length);
      
      // Cloudinary crop transformations
      // Format: c_crop,w_{width},h_{height},x_{x},y_{y},q_auto:best,f_auto
      const transformations = [
        `c_crop`,
        `w_${Math.round(newsItem.width)}`,
        `h_${Math.round(newsItem.height)}`,
        `x_${Math.round(newsItem.x)}`,
        `y_${Math.round(newsItem.y)}`,
        `q_auto:best`,
        `f_auto`
      ].join(',');
      
      // Insert transformations: baseUrl/transformations/afterUpload
      return `${baseUrl}/${transformations}/${afterUpload}`;
    } catch (error) {
      console.error('Error generating cropped URL:', error);
      return pageImageUrl;
    }
  };

  const handleNewsClick = (epaper, page, newsItem) => {
    const croppedImageUrl = getCroppedImageUrl(page.image, newsItem, page.width, page.height);
    
    setSelectedNews({
      epaper,
      page,
      news: newsItem,
      croppedImageUrl: croppedImageUrl
    });
  };

  const closeNewsModal = () => {
    setSelectedNews(null);
  };

  // Prevent body scroll when modal is open on mobile
  useEffect(() => {
    if (selectedNews && isMobile) {
      document.body.style.overflow = 'hidden';
      // Prevent whole page zoom
      const viewport = document.querySelector('meta[name="viewport"]');
      if (viewport) {
        viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
      }
    } else {
      document.body.style.overflow = '';
      // Restore viewport
      const viewport = document.querySelector('meta[name="viewport"]');
      if (viewport) {
        viewport.setAttribute('content', 'width=device-width, initial-scale=1.0');
      }
    }
    return () => {
      document.body.style.overflow = '';
      const viewport = document.querySelector('meta[name="viewport"]');
      if (viewport) {
        viewport.setAttribute('content', 'width=device-width, initial-scale=1.0');
      }
    };
  }, [selectedNews, isMobile]);

  return (
    <div className="min-h-screen bg-subtleGray">
      {/* Section Header */}
      <div className="bg-cleanWhite border-b-2 border-subtleGray py-4">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center">
            <h1 className="text-3xl md:text-4xl font-bold text-deepCharcoal">
              ई-पेपर
            </h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-x-6 gap-y-6">
          {/* Left Sidebar - after main on mobile */}
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
                  onClick={(e) => {
                    e.preventDefault();
                    loadEpaperData();
                  }}
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
                    <div className="flex space-x-3">
                      <button
                        onClick={() => setSelectedEpaper(epaper)}
                        className="flex-1 bg-gradient-to-r from-newsRed to-editorialBlue text-cleanWhite px-4 py-2 rounded hover:opacity-90 transition-opacity font-semibold text-sm"
                      >
                        पेपर पहा
                      </button>
                      <button className="flex items-center justify-center bg-deepCharcoal text-cleanWhite px-4 py-2 rounded hover:bg-deepCharcoal/90 transition-colors">
                        <FaDownload className="w-4 h-4" />
                      </button>
                    </div>
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
                  {[...selectedEpaper.pages]
                    .sort((a, b) => {
                      // Sort by sortOrder if available, otherwise by pageNo
                      const orderA = a.sortOrder !== undefined ? a.sortOrder : a.pageNo;
                      const orderB = b.sortOrder !== undefined ? b.sortOrder : b.pageNo;
                      return orderA - orderB;
                    })
                    .map((page) => (
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
          <div className="lg:col-span-2 order-3">
            <Sidebar type="right" />
          </div>
        </div>
      </div>

      {/* News Detail Modal */}
      {selectedNews && (
        <div 
          className="fixed inset-0 bg-white z-50 flex flex-col"
          onClick={closeNewsModal}
          style={{ 
            touchAction: isMobile ? 'none' : 'auto',
            WebkitOverflowScrolling: 'touch'
          }}
        >
          {/* Mobile Layout */}
          {isMobile ? (
            <div 
              className="flex flex-col h-full w-full bg-white"
              onClick={(e) => e.stopPropagation()}
              style={{ touchAction: 'none' }}
            >
              {/* Header with Logo and Close Button - Fixed */}
              <div className="flex-shrink-0 bg-cleanWhite border-b border-subtleGray/30 py-2 px-3 flex items-center justify-between z-10">
                <div className="flex items-center justify-center flex-1">
                  <img
                    src="/logo1.png"
                    alt="नव मंच"
                    className="h-16 w-auto"
                  />
                </div>
                <button
                  onClick={closeNewsModal}
                  className="w-8 h-8 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center transition-all duration-200 backdrop-blur-sm shadow-lg flex-shrink-0"
                  aria-label="Close"
                  style={{ touchAction: 'auto' }}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {/* Zoomable Image Container - Takes remaining space, no white space */}
              {selectedNews.croppedImageUrl && (
                <div 
                  className="flex-1 overflow-hidden bg-cleanWhite relative" 
                  style={{ 
                    minHeight: 0,
                    touchAction: 'none'
                  }}
                >
                  <ZoomableNewsImage
                    imageUrl={selectedNews.croppedImageUrl}
                    alt={selectedNews.news.title || 'बातमी विभाग'}
                    fallbackImage={selectedNews.page.image}
                  />
                </div>
              )}
              
              {/* Footer Section - Fixed at bottom */}
              <div className="flex-shrink-0 bg-cleanWhite border-t border-subtleGray/30 z-10">
                {/* Download Button */}
                <div className="flex items-center justify-center py-3 px-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      // Download functionality can be added here
                    }}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-newsRed text-white rounded-lg font-semibold hover:bg-newsRed/90 transition-colors shadow-lg"
                    style={{ touchAction: 'auto' }}
                  >
                    <FaDownload className="w-5 h-5" />
                    <span>क्लिप डाउनलोड करा</span>
                  </button>
                </div>
                
                {/* Footer Metadata */}
                <div className="bg-gradient-to-b from-subtleGray/10 to-cleanWhite pt-3 pb-4 px-4">
                  {/* Website URL */}
                  <div className="text-center mb-3">
                    <p className="text-xs text-metaGray font-medium tracking-wide">
                      navmanchnews.com/epapers
                    </p>
                  </div>
                  
                  {/* Metadata */}
                  <div className="flex flex-col items-center gap-2 text-xs text-metaGray">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-deepCharcoal">तारीख:</span>
                      <span>{new Date(selectedNews.epaper.date).toLocaleDateString('mr-IN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-deepCharcoal">ई-पेपर:</span>
                      <span className="text-center">{selectedNews.epaper.title}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-deepCharcoal">पृष्ठ:</span>
                      <span>{selectedNews.page.pageNo}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Desktop Layout - Original with scroll */
            <div 
              className="bg-white max-w-6xl w-full max-h-[95vh] overflow-y-auto relative mx-auto my-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Top Logo */}
              <div className="flex items-center justify-center py-4 bg-gradient-to-b from-cleanWhite to-subtleGray/10">
                <img
                  src="/logo1.png"
                  alt="नव मंच"
                  className="h-24 w-auto"
                />
              </div>
              
              {/* Cropped Image */}
              {selectedNews.croppedImageUrl && (
                <div className="overflow-hidden bg-cleanWhite">
                  <img
                    src={selectedNews.croppedImageUrl}
                    alt={selectedNews.news.title || 'बातमी विभाग'}
                    className="w-full h-auto"
                    style={{ 
                      imageRendering: 'crisp-edges',
                      display: 'block'
                    }}
                    onError={(e) => {
                      console.error('Error loading cropped image:', selectedNews.croppedImageUrl);
                      e.target.src = selectedNews.page.image;
                    }}
                  />
                </div>
              )}
              
              {/* Content (if available) */}
              {selectedNews.news.content && (
                <div className="px-4 py-6 border-t border-subtleGray/30">
                  <div 
                    className="text-slateBody leading-relaxed article-content"
                    dangerouslySetInnerHTML={{ __html: selectedNews.news.content || '' }}
                  />
                </div>
              )}
              
              {/* Footer Section */}
              <div className="bg-gradient-to-b from-subtleGray/10 to-cleanWhite pt-4 pb-6">
                {/* Website URL */}
                <div className="text-center mb-4">
                  <p className="text-xs md:text-sm text-metaGray font-medium tracking-wide">
                    navmanchnews.com/epapers
                  </p>
                </div>
                
                {/* Metadata */}
                <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 px-4 text-xs md:text-sm text-metaGray">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-deepCharcoal">तारीख:</span>
                    <span>{new Date(selectedNews.epaper.date).toLocaleDateString('mr-IN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}</span>
                  </div>
                  <div className="hidden md:block w-px h-4 bg-subtleGray"></div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-deepCharcoal">ई-पेपर:</span>
                    <span className="max-w-[200px] truncate">{selectedNews.epaper.title}</span>
                  </div>
                  <div className="hidden md:block w-px h-4 bg-subtleGray"></div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-deepCharcoal">पृष्ठ:</span>
                    <span>{selectedNews.page.pageNo}</span>
                  </div>
                </div>
              </div>
              
              {/* Close Button */}
              <button
                onClick={closeNewsModal}
                className="absolute top-4 right-4 w-10 h-10 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center transition-all duration-200 backdrop-blur-sm shadow-lg"
                aria-label="Close"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EPaper;
