import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import { loadEpapers } from '../utils/epaperLoader';
import ShareButtons from '../components/ShareButtons';
import SEO from '../components/SEO';

const EPaperSection = () => {
  const { id, pageNo, sectionId } = useParams();
  const navigate = useNavigate();
  const [epaper, setEpaper] = useState(null);
  const [page, setPage] = useState(null);
  const [section, setSection] = useState(null);
  const [croppedImageUrl, setCroppedImageUrl] = useState(null);
  const [loading, setLoading] = useState(true);

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

  // Use backend URL for sharing so crawlers get proper meta tags
  // Use IDs instead of slugs for cleaner URLs (avoid "Untitled" and encoded characters)
  const backendBase = import.meta.env.VITE_BACKEND_URL || 'https://navbharat-sauwad-backend.onrender.com';
  
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
  
  const shareUrl = `${backendBase}/epaper/${epaperIdentifier}/page/${page?.pageNo || '1'}/section/${sectionIdentifier}${window.location.search}`;
  
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

  // Calculate optimal display size based on section dimensions
  const sectionAspectRatio = section.width / section.height;
  const maxWidth = Math.min(1200, section.width * 2); // Scale up but limit
  const maxHeight = Math.min(1600, section.height * 2);
  
  // Maintain aspect ratio
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
        {/* Header */}
        <div className="bg-cleanWhite border-b-2 border-subtleGray py-4 sticky top-0 z-40 shadow-sm">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between">
              <Link
                to={`/epaper/${id}`}
                className="flex items-center gap-2 text-metaGray hover:text-deepCharcoal transition-colors font-semibold"
              >
                <FaArrowLeft className="w-4 h-4" />
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

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-6xl mx-auto">
          {/* Top Logo - Seamless */}
          <div className="flex items-center justify-center py-6 bg-gradient-to-b from-cleanWhite to-subtleGray/10 rounded-t-xl">
            <img
              src="/logo1.png"
              alt="नव मंच"
              className="h-20 md:h-24 w-auto"
            />
          </div>
          
          {/* Cropped Image - Properly Sized */}
          <div className="bg-cleanWhite overflow-hidden flex items-center justify-center" style={{ minHeight: '400px' }}>
            {croppedImageUrl ? (
              <img
                src={croppedImageUrl}
                alt={getCleanSectionTitle()}
                className="max-w-full h-auto"
                style={{ 
                  imageRendering: 'crisp-edges',
                  display: 'block',
                  maxWidth: `${displayWidth}px`,
                  maxHeight: `${displayHeight}px`,
                  width: 'auto',
                  height: 'auto'
                }}
                onError={(e) => {
                  console.error('Error loading cropped image:', croppedImageUrl);
                  e.target.src = page.image;
                }}
              />
            ) : (
              <div className="text-center text-metaGray py-12">
                <p>छवी लोड होत आहे...</p>
              </div>
            )}
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
        </div>
      </div>
    </>
  );
};

export default EPaperSection;

