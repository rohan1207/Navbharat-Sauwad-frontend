import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FaChevronUp, FaChevronDown } from 'react-icons/fa';
import { loadEpapers } from '../utils/epaperLoader';
import EPaperPage2 from '../components/EPaperPage2';
import ShareButtons from '../components/ShareButtons';
import SEO from '../components/SEO';

const EPaperViewer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [epaper, setEpaper] = useState(null);
  const [selectedPage, setSelectedPage] = useState(null);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const sidebarRef = useRef(null);
  const mainContentRef = useRef(null);

  useEffect(() => {
    const loadEpaper = async () => {
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
        
        if (found) {
          console.log('✅ Found epaper:', found.title, 'ID:', found.id || found._id);
          setEpaper(found);
          if (found.pages && found.pages.length > 0) {
            setSelectedPage(found.pages[0]);
            setCurrentPageIndex(0);
          } else {
            console.warn('Epaper has no pages');
          }
          setLoading(false);
        } else {
          console.log('❌ Epaper not found for id:', id);
          console.log('Available epaper IDs:', epapers.map(ep => ({ id: ep.id, _id: ep._id, title: ep.title })));
          setLoading(false);
          setTimeout(() => navigate('/epaper2'), 500);
        }
      } catch (error) {
        console.error('Error loading e-paper:', error);
        setLoading(false);
        setTimeout(() => navigate('/epaper2'), 500);
      }
    };
    
    if (id) {
      loadEpaper();
    } else {
      navigate('/epaper2');
    }
  }, [id, navigate]);

  const handlePageClick = (page, index) => {
    setSelectedPage(page);
    setCurrentPageIndex(index);
    // Scroll to top of main content
    if (mainContentRef.current) {
      mainContentRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };


  const scrollSidebar = (direction) => {
    if (sidebarRef.current) {
      const scrollAmount = 200;
      sidebarRef.current.scrollBy({
        top: direction === 'up' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  // Use backend URL for sharing so crawlers get proper meta tags
  // Prefer slug over ID for better SEO
  const backendBase = import.meta.env.VITE_BACKEND_URL || 'https://navbharat-sauwad-backend.onrender.com';
  let sharePath = window.location.pathname;
  
  // Replace ID with slug if available
  if (epaper && epaper.slug && sharePath.includes(`/epaper/${id}`)) {
    sharePath = sharePath.replace(`/epaper/${id}`, `/epaper/${epaper.slug}`);
  }
  
  const shareUrl = `${backendBase}${sharePath}${window.location.search}`;
  
  // Clean title - remove "Untitled" and empty titles
  const getCleanEpaperTitle = () => {
    if (!epaper || !epaper.title) return 'ई-पेपर';
    const title = epaper.title.trim();
    if (title === '' || title.toLowerCase() === 'untitled') {
      return 'ई-पेपर';
    }
    return title;
  };
  
  const shareTitle = epaper ? `${getCleanEpaperTitle()} - नव मंच` : 'नव मंच ई-पेपर';
  const shareDescription = epaper 
    ? `${getCleanEpaperTitle()} - ${epaper.date ? new Date(epaper.date).toLocaleDateString('mr-IN') : ''}`
    : 'नव मंच ई-पेपर';
  
  // Ensure image URL is absolute for proper preview cards
  const getAbsoluteImageUrl = (imgUrl) => {
    if (!imgUrl) return '';
    if (imgUrl.startsWith('http://') || imgUrl.startsWith('https://')) {
      return imgUrl;
    }
    return `${window.location.origin}${imgUrl.startsWith('/') ? imgUrl : `/${imgUrl}`}`;
  };
  
  const shareImage = getAbsoluteImageUrl(selectedPage?.image || epaper?.thumbnail || '');

  if (loading || !epaper) {
    return (
      <div className="min-h-screen bg-subtleGray flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-newsRed mx-auto mb-4"></div>
          <p className="text-metaGray">ई-पेपर लोड होत आहे...</p>
        </div>
      </div>
    );
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
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-deepCharcoal">{getCleanEpaperTitle()}</h1>
                <p className="text-sm text-metaGray mt-1">{epaper.date}</p>
              </div>
            <div className="flex items-center gap-3">
              <ShareButtons
                title={shareTitle}
                description={shareDescription}
                image={shareImage}
                url={shareUrl}
              />
              <Link
                to="/epaper2"
                className="text-metaGray hover:text-deepCharcoal transition-colors font-semibold"
              >
                मागे जा
              </Link>
            </div>
          </div>
        </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-6">
          <div className="flex gap-6">
            {/* Left Sidebar - Page Thumbnails */}
            <div className="hidden lg:block w-32 flex-shrink-0">
              <div className="bg-cleanWhite rounded-lg border border-subtleGray p-3 sticky top-24">
                {/* Scroll Up Button */}
                <button
                  onClick={() => scrollSidebar('up')}
                  className="w-full mb-2 p-2 bg-subtleGray hover:bg-subtleGray/80 rounded-lg transition-colors flex items-center justify-center"
                >
                  <FaChevronUp className="w-4 h-4 text-deepCharcoal" />
                </button>

                {/* Thumbnails */}
                <div ref={sidebarRef} className="space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto scrollbar-thin scrollbar-thumb-subtleGray">
                  {epaper.pages.map((page, index) => (
                    <div
                      key={page.pageNo}
                      className={`relative aspect-[3/4] rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                        currentPageIndex === index
                          ? 'border-newsRed shadow-lg scale-105'
                          : 'border-subtleGray hover:border-newsRed/50 hover:shadow-md'
                      }`}
                    >
                      <button
                        onClick={() => handlePageClick(page, index)}
                        className="w-full h-full"
                      >
                        <img
                          src={page.image}
                          alt={`Page ${page.pageNo}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                      <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-cleanWhite text-xs font-semibold py-1.5 text-center">
                        पृष्ठ {page.pageNo}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Scroll Down Button */}
                <button
                  onClick={() => scrollSidebar('down')}
                  className="w-full mt-2 p-2 bg-subtleGray hover:bg-subtleGray/80 rounded-lg transition-colors flex items-center justify-center"
                >
                  <FaChevronDown className="w-4 h-4 text-deepCharcoal" />
                </button>
              </div>
            </div>

            {/* Main Content Area */}
            <div ref={mainContentRef} className="flex-1">
              {selectedPage && (
                <div className="bg-cleanWhite rounded-lg border border-subtleGray p-4 md:p-6">
                  <EPaperPage2
                    page={selectedPage}
                    epaperId={id}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default EPaperViewer;

