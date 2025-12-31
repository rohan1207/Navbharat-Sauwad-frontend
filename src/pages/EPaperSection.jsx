import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FaArrowLeft, FaDownload } from 'react-icons/fa';
import { loadEpapers } from '../utils/epaperLoader';
import ShareButtons from '../components/ShareButtons';
import SEO from '../components/SEO';

// Mobile zoomable image component for sections
const SectionZoomableImage = ({ imageUrl, alt }) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);
  
  // Prevent body scroll on mobile
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

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
        initialDistance = getDistance(e.touches[0], e.touches[1]);
        initialScale = scale;
      } else if (e.touches.length === 1 && scale > 1) {
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
        const currentDistance = getDistance(e.touches[0], e.touches[1]);
        const newScale = Math.max(1, Math.min(3, (currentDistance / initialDistance) * initialScale));
        setScale(newScale);
      } else if (e.touches.length === 1 && isDragging && scale > 1) {
        e.preventDefault();
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

    const handleTouchEnd = () => {
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
    container.addEventListener('touchend', handleTouchEnd);
    container.addEventListener('touchend', handleDoubleTap);

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
      className="relative w-full overflow-hidden touch-none bg-cleanWhite"
      style={{
        minHeight: 'calc(100vh - 60px)',
        touchAction: 'none',
        userSelect: 'none'
      }}
    >
      <div
        style={{
          transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
          transformOrigin: 'center center',
          transition: scale === 1 ? 'transform 0.3s ease-out' : 'none',
          width: '100%',
          minHeight: 'calc(100vh - 60px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '10px'
        }}
      >
        <img
          src={imageUrl}
          alt={alt}
          className="w-full h-auto object-contain"
          style={{
            maxWidth: '100%',
            pointerEvents: 'none',
            imageRendering: 'crisp-edges'
          }}
          onError={(e) => {
            console.error('Error loading section image:', imageUrl);
          }}
        />
      </div>
      
      {/* Zoom indicator */}
      {scale > 1 && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-3 py-1 rounded-full text-xs z-10">
          {Math.round(scale * 100)}%
        </div>
      )}
    </div>
  );
};

const EPaperSection = () => {
  const { id, pageNo, sectionId } = useParams();
  const navigate = useNavigate();
  const [epaper, setEpaper] = useState(null);
  const [page, setPage] = useState(null);
  const [section, setSection] = useState(null);
  const [croppedImageUrl, setCroppedImageUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Track window size for responsive image sizing
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Prevent body scroll on mobile when viewing section
  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    if (isMobile) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const epapers = await loadEpapers();
        if (!epapers || epapers.length === 0) {
          console.log('No epapers found');
          setLoading(false);
          setTimeout(() => navigate('/epaper2'), 500);
          return;
        }
        
        // Try to find epaper by slug first, then by id
        const found = epapers.find(ep => {
          const epSlug = ep.slug;
          const epId = ep.id !== undefined ? ep.id : ep._id;
          
          // Match by slug first
          if (epSlug && epSlug === id) return true;
          
          // Then match by ID
          if (epId !== undefined && epId !== null) {
            const epIdStr = String(epId);
            const searchIdStr = String(id);
            return epIdStr === searchIdStr;
          }
          
          return false;
        });
        
        if (!found) {
          console.log('❌ Epaper not found for id:', id);
          console.log('Available epaper IDs:', epapers.map(ep => ({ id: ep.id, _id: ep._id, title: ep.title })));
          setLoading(false);
          setTimeout(() => navigate('/epaper2'), 500);
          return;
        }
        console.log('✅ Found epaper:', found.title);
        setEpaper(found);

        const foundPage = found.pages?.find(p => {
          const pNo = parseInt(pageNo);
          return p.pageNo === pNo;
        });
        if (!foundPage) {
          console.log('❌ Page not found:', pageNo);
          setLoading(false);
          setTimeout(() => navigate(`/epaper/${id}`), 500);
          return;
        }
        console.log('✅ Found page:', foundPage.pageNo);
        setPage(foundPage);

        // Log all available sections for debugging
        console.log('🔍 Looking for section:', sectionId);
        console.log('📋 Available sections:', foundPage.news?.map(n => ({
          slug: n.slug,
          id: n.id,
          _id: n._id ? String(n._id) : null,
          title: n.title
        })));

        // Find section by ID first (most reliable), then by slug, then by _id
        // IMPORTANT: Check ID first because slugs like "Untitled" are not unique
        const foundSection = foundPage.news?.find(n => {
          const nSlug = n.slug;
          const nId = n.id !== undefined ? n.id : null;
          const n_id = n._id ? String(n._id) : null;
          const sId = sectionId;
          
          // Match by ID first (most reliable - always unique)
          if (nId !== undefined && nId !== null) {
            const match = String(nId) === String(sId) || nId === parseInt(sId) || nId === sId;
            if (match) {
              console.log('✅ Matched by id:', nId, '===', sId);
              return true;
            }
          }
          
          // Then match by _id (MongoDB ObjectId) - also unique
          if (n_id) {
            const match = n_id === String(sId) || String(n_id) === String(sId);
            if (match) {
              console.log('✅ Matched by _id:', n_id, '===', sId);
              return true;
            }
          }
          
          // Finally match by slug (only if it's meaningful and unique)
          // Skip if slug is "Untitled" or empty - those are not unique
          if (nSlug && nSlug.trim() !== '' && nSlug.toLowerCase() !== 'untitled' && nSlug === sId) {
            console.log('✅ Matched by slug:', nSlug, '===', sId);
            return true;
          }
          
          return false;
        });
        if (!foundSection) {
          console.log('❌ Section not found:', sectionId);
          console.log('Available sections:', foundPage.news?.map(n => ({ id: n.id, title: n.title })));
          setLoading(false);
          setTimeout(() => navigate(`/epaper/${id}`), 500);
          return;
        }
        console.log('✅ Found section:', foundSection.id);
        setSection(foundSection);

        // Generate cropped image URL
        const croppedUrl = getCroppedImageUrl(foundPage.image, foundSection);
        setCroppedImageUrl(croppedUrl);
        setLoading(false);
      } catch (error) {
        console.error('Error loading section:', error);
        setLoading(false);
        setTimeout(() => navigate('/epaper2'), 500);
      }
    };
    
    if (id && pageNo && sectionId) {
      loadData();
    } else {
      navigate('/epaper2');
    }
  }, [id, pageNo, sectionId, navigate]);

  // Helper to generate cropped Cloudinary URL
  const getCroppedImageUrl = (pageImageUrl, newsItem) => {
    if (!pageImageUrl || !newsItem) return pageImageUrl;
    
    if (!pageImageUrl.includes('cloudinary.com')) {
      return pageImageUrl;
    }
    
    try {
      const uploadIndex = pageImageUrl.indexOf('/image/upload/');
      if (uploadIndex === -1) return pageImageUrl;
      
      const baseUrl = pageImageUrl.substring(0, uploadIndex + '/image/upload'.length);
      const afterUpload = pageImageUrl.substring(uploadIndex + '/image/upload/'.length);
      
      const transformations = [
        `c_crop`,
        `w_${Math.round(newsItem.width)}`,
        `h_${Math.round(newsItem.height)}`,
        `x_${Math.round(newsItem.x)}`,
        `y_${Math.round(newsItem.y)}`,
        `q_auto:best`,
        `f_auto`
      ].join(',');
      
      return `${baseUrl}/${transformations}/${afterUpload}`;
    } catch (error) {
      console.error('Error generating cropped URL:', error);
      return pageImageUrl;
    }
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

  // Use frontend URL for sharing (cleaner, better branding)
  // Use IDs instead of slugs for cleaner URLs (avoid "Untitled" and encoded characters)
  const frontendBase = 'https://navmanchnews.com';
  
  // Build clean URL with IDs
  let epaperIdentifier;
  if (epaper) {
    // Use ID for e-paper (cleaner than encoded slug)
    if (epaper.id !== undefined && epaper.id !== null) {
      epaperIdentifier = String(epaper.id);
    } else if (epaper._id) {
      epaperIdentifier = String(epaper._id);
    } else {
      epaperIdentifier = id; // Fallback
    }
  } else {
    epaperIdentifier = id;
  }
  
  let sectionIdentifier;
  if (section) {
    // Always use ID for sections (never "Untitled" slug)
    if (section.id !== undefined && section.id !== null) {
      sectionIdentifier = String(section.id);
    } else if (section._id) {
      sectionIdentifier = String(section._id);
    } else {
      sectionIdentifier = sectionId; // Fallback
    }
  } else {
    sectionIdentifier = sectionId;
  }
  
  const shareUrl = `${frontendBase}/epaper/${epaperIdentifier}/page/${page?.pageNo || '1'}/section/${sectionIdentifier}${window.location.search}`;
  
  // Clean title - remove "Untitled" and empty titles
  const getCleanSectionTitle = () => {
    if (!section || !section.title) return 'बातमी विभाग';
    const title = section.title.trim();
    if (title === '' || title.toLowerCase() === 'untitled') {
      return 'बातमी विभाग';
    }
    return title;
  };
  
  const getCleanEpaperTitle = () => {
    if (!epaper || !epaper.title) return 'ई-पेपर';
    const title = epaper.title.trim();
    if (title === '' || title.toLowerCase() === 'untitled') {
      return 'ई-पेपर';
    }
    return title;
  };
  
  const shareTitle = epaper && section 
    ? `${getCleanSectionTitle()} - ${getCleanEpaperTitle()}`
    : 'नव मंच ई-पेपर';
  
  const shareDescription = epaper && section
    ? `${getCleanEpaperTitle()} - पृष्ठ ${page.pageNo} - ${formatDate(epaper.date)}`
    : 'नव मंच ई-पेपर';
  
  // Ensure image URL is absolute for proper preview cards
  const getAbsoluteImageUrl = (imgUrl) => {
    if (!imgUrl) return '';
    if (imgUrl.startsWith('http://') || imgUrl.startsWith('https://')) {
      return imgUrl;
    }
    return `${window.location.origin}${imgUrl.startsWith('/') ? imgUrl : `/${imgUrl}`}`;
  };
  
  // Use full page image for section share cards (more reliable than cropped section)
  const shareImage = getAbsoluteImageUrl(page?.image || epaper?.thumbnail || '');

  // Download section image with logo on top
  const downloadSectionWithLogo = async (sectionImageUrl, sectionTitle) => {
    try {
      // Load section image
      const sectionImg = new Image();
      sectionImg.crossOrigin = 'anonymous';
      
      await new Promise((resolve, reject) => {
        sectionImg.onload = resolve;
        sectionImg.onerror = reject;
        sectionImg.src = sectionImageUrl;
      });

      // Load logo
      const logoImg = new Image();
      logoImg.crossOrigin = 'anonymous';
      
      await new Promise((resolve, reject) => {
        logoImg.onload = resolve;
        logoImg.onerror = () => {
          console.warn('Logo failed to load, using watermark approach');
          resolve(); // Continue even if logo fails
        };
        logoImg.src = '/logo1.png';
      });

      // Create canvas - extend from top to place logo above clip
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      // Calculate logo dimensions
      let logoHeight = 0;
      let logoWidth = 0;
      let logoAreaHeight = 0;
      
      if (logoImg.complete && logoImg.naturalWidth > 0) {
        // Logo size: 12% of section width or max 100px height
        logoHeight = Math.min(sectionImg.width * 0.12, 100);
        const logoAspectRatio = logoImg.width / logoImg.height;
        logoWidth = logoHeight * logoAspectRatio;
        logoAreaHeight = logoHeight + 40; // Logo height + padding (20px top + 20px bottom)
      } else {
        // If logo fails to load, use watermark approach
        logoAreaHeight = 0;
      }

      // Set canvas size: section width, extended height (section + logo area)
      canvas.width = sectionImg.width;
      canvas.height = sectionImg.height + logoAreaHeight;

      // Fill white background
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw section image below logo area
      ctx.drawImage(sectionImg, 0, logoAreaHeight);

      // Draw logo above the clip (centered)
      if (logoImg.complete && logoImg.naturalWidth > 0 && logoAreaHeight > 0) {
        const logoX = (canvas.width - logoWidth) / 2;
        const logoY = 20; // 20px from top
        
        // Draw logo
        ctx.drawImage(
          logoImg,
          logoX,
          logoY,
          logoWidth,
          logoHeight
        );
      } else if (logoImg.complete && logoImg.naturalWidth > 0) {
        // Fallback: Watermark approach - spread logo with low opacity
        const watermarkSize = Math.min(sectionImg.width * 0.3, 200);
        const watermarkAspectRatio = logoImg.width / logoImg.height;
        const watermarkWidth = watermarkSize * watermarkAspectRatio;
        const watermarkHeight = watermarkSize;
        
        // Save context for opacity
        ctx.save();
        ctx.globalAlpha = 0.15; // Low opacity for watermark effect
        
        // Draw watermark in center
        ctx.drawImage(
          logoImg,
          (sectionImg.width - watermarkWidth) / 2,
          (sectionImg.height - watermarkHeight) / 2,
          watermarkWidth,
          watermarkHeight
        );
        
        ctx.restore();
      }

      // Convert to blob and download
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `${sectionTitle || 'section'}-navmanch-${Date.now()}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }
      }, 'image/png');
    } catch (error) {
      console.error('Error downloading section:', error);
      alert('डाउनलोड करताना त्रुटी आली. कृपया पुन्हा प्रयत्न करा.');
    }
  };

  if (loading || !epaper || !page || !section) {
    return (
      <div className="min-h-screen bg-subtleGray flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-newsRed mx-auto mb-4"></div>
          <p className="text-metaGray">विभाग लोड होत आहे...</p>
        </div>
      </div>
    );
  }

  // Calculate optimal display size based on section dimensions (for desktop only)
  const sectionAspectRatio = section.width / section.height;
  
  // Desktop: scale up but limit
  const maxWidth = Math.min(1200, section.width * 2);
  const maxHeight = Math.min(1600, section.height * 2);
  
  // Maintain aspect ratio for desktop
  let displayWidth = maxWidth;
  let displayHeight = maxWidth / sectionAspectRatio;
  
  if (displayHeight > maxHeight) {
    displayHeight = maxHeight;
    displayWidth = maxHeight * sectionAspectRatio;
  }

  return (
    <>
      <SEO 
        title={shareTitle}
        description={shareDescription}
        image={shareImage}
        url={shareUrl}
        type="article"
      />
      <div className="min-h-screen bg-subtleGray">
        {/* Desktop Header */}
        <div className="hidden md:block bg-cleanWhite border-b-2 border-subtleGray py-3 sm:py-4 sticky top-0 z-40 shadow-sm">
          <div className="container mx-auto px-3 sm:px-4">
            <div className="flex items-center justify-between gap-2">
              <Link
                to={`/epaper/${id}`}
                className="flex items-center gap-1.5 sm:gap-2 text-metaGray hover:text-deepCharcoal transition-colors font-semibold text-sm sm:text-base"
              >
                <FaArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>मागे जा</span>
              </Link>
              <ShareButtons
                title={shareTitle}
                description={shareDescription}
                image={shareImage}
                url={shareUrl}
              />
            </div>
          </div>
        </div>

        {/* Mobile Header - Minimal - Fixed at top */}
        <div className="md:hidden bg-cleanWhite border-b border-subtleGray py-2 fixed top-0 left-0 right-0 z-50 shadow-sm">
          <div className="container mx-auto px-3">
            <div className="flex items-center justify-between">
              <Link
                to={`/epaper/${id}`}
                className="flex items-center gap-2 text-deepCharcoal hover:text-newsRed transition-colors font-semibold text-sm"
              >
                <FaArrowLeft className="w-4 h-4" />
                <span>मागे</span>
              </Link>
              <ShareButtons
                title={shareTitle}
                description={shareDescription}
                image={shareImage}
                url={shareUrl}
              />
            </div>
          </div>
        </div>

      {/* Main Content */}
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-6">
        <div className="max-w-6xl mx-auto">
          {/* Desktop: Full layout with logo and footer */}
          <div className="hidden md:block">
            {/* Image Container with Logo Above - Adapts to image width */}
            <div className="bg-cleanWhite overflow-hidden rounded-t-xl flex flex-col items-center">
              {croppedImageUrl ? (
                <div className="flex flex-col items-center w-full">
                  {/* Logo - Positioned directly above image with minimal gap, matches image width */}
                  <div className="flex items-center justify-center pt-2 pb-0" style={{ width: `${displayWidth}px`, maxWidth: '100%' }}>
                    <img
                      src="/logo1.png"
                      alt="नव मंच"
                      className="h-16 md:h-20 w-auto"
                    />
                  </div>
                  
                  {/* Cropped Image */}
                  <div className="flex items-center justify-center pt-1 px-2">
                    <img
                      src={croppedImageUrl}
                      alt={getCleanSectionTitle()}
                      className="w-full h-auto max-w-full object-contain md:w-auto md:max-w-none"
                      style={{ 
                        imageRendering: 'crisp-edges',
                        display: 'block',
                        maxWidth: `${displayWidth}px`,
                        maxHeight: `${displayHeight}px`
                      }}
                      onError={(e) => {
                        console.error('Error loading cropped image:', croppedImageUrl);
                        e.target.src = page.image;
                      }}
                    />
                  </div>
                </div>
              ) : (
                <div className="text-center text-metaGray py-8 sm:py-12">
                  <p className="text-sm sm:text-base">छवी लोड होत आहे...</p>
                </div>
              )}
            </div>
            
            {/* Download Button - Desktop */}
            <div className="bg-cleanWhite flex items-center justify-center py-4">
              <button
                onClick={() => downloadSectionWithLogo(croppedImageUrl || page.image, getCleanSectionTitle())}
                className="flex items-center gap-2 px-6 py-3 bg-newsRed text-white rounded-lg font-semibold hover:bg-newsRed/90 transition-colors shadow-md hover:shadow-lg"
              >
                <FaDownload className="w-4 h-4" />
                <span>क्लिप डाउनलोड करा</span>
              </button>
            </div>
            
            {/* Footer Section */}
            <div className="bg-gradient-to-b from-subtleGray/10 to-cleanWhite pt-4 pb-6 rounded-b-xl">
              {/* Website URL */}
              <div className="text-center mb-4">
                <p className="text-xs md:text-sm text-metaGray font-medium tracking-wide">
                  navmanch.com/epapers
                </p>
              </div>
              
              {/* Metadata */}
              <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 px-4 text-xs md:text-sm text-metaGray">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-deepCharcoal">तारीख:</span>
                  <span>{formatDate(epaper.date)}</span>
                </div>
                <div className="hidden md:block w-px h-4 bg-subtleGray"></div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-deepCharcoal">ई-पेपर:</span>
                    <span className="max-w-[200px] truncate">{getCleanEpaperTitle()}</span>
                  </div>
                <div className="hidden md:block w-px h-4 bg-subtleGray"></div>
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-deepCharcoal">पृष्ठ:</span>
                  <span>{page.pageNo}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile: Full screen zoomable view */}
          <div className="md:hidden pt-12">
            {/* Image Container with Logo Above - Adapts to image width */}
            <div className="w-full bg-cleanWhite flex flex-col items-center">
              {/* Logo - Positioned directly above image with minimal gap */}
              <div className="flex items-center justify-center pt-2 pb-0 w-full px-2">
                <img
                  src="/logo1.png"
                  alt="नव मंच"
                  className="h-14 w-auto"
                />
              </div>
              
              {/* Section Image */}
              <div className="w-full bg-cleanWhite flex items-center justify-center pt-1">
                <SectionZoomableImage 
                  imageUrl={croppedImageUrl || page.image}
                  alt={getCleanSectionTitle()}
                />
              </div>
            </div>
            
            {/* Mobile Download Button - Fixed at bottom */}
            <div className="fixed bottom-20 left-0 right-0 z-50 px-4 pb-4">
              <button
                onClick={() => downloadSectionWithLogo(croppedImageUrl || page.image, getCleanSectionTitle())}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-newsRed text-white rounded-lg font-semibold hover:bg-newsRed/90 transition-colors shadow-lg"
              >
                <FaDownload className="w-5 h-5" />
                <span>क्लिप डाउनलोड करा</span>
              </button>
            </div>
          </div>
        </div>
        </div>
      </div>
    </>
  );
};

export default EPaperSection;

