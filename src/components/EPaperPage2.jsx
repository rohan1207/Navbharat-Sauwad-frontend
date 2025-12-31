import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const EPaperPage2 = ({ page, onSectionClick, epaperId, epaperSlug }) => {
  const navigate = useNavigate();
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const imgRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      if (imgRef.current) {
        const rect = imgRef.current.getBoundingClientRect();
        setImageSize({ width: rect.width, height: rect.height });
      }
    };

    if (imgRef.current) {
      imgRef.current.addEventListener('load', handleResize);
      handleResize();
    }

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      if (imgRef.current) {
        imgRef.current.removeEventListener('load', handleResize);
      }
    };
  }, [page.image]);

  const getDisplayCoords = (newsItem) => {
    if (!imageSize.width || !page.width || !page.height) return null;
    
    const scaleX = imageSize.width / page.width;
    const scaleY = imageSize.height / page.height;
    
    return {
      left: newsItem.x * scaleX,
      top: newsItem.y * scaleY,
      width: newsItem.width * scaleX,
      height: newsItem.height * scaleY
    };
  };

  return (
    <div className="border border-gray-200 rounded-lg p-3 sm:p-4">
      <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3 text-gray-900">
        पृष्ठ {page.pageNo}
      </h3>
      <div ref={containerRef} className="relative inline-block w-full">
        <img
          ref={imgRef}
          src={page.image}
          alt={`Page ${page.pageNo}`}
          className="w-full rounded-lg shadow-md"
        />
        {/* Clickable sections - Invisible but clickable */}
        {page.news && page.news.map((newsItem, index) => {
          const coords = getDisplayCoords(newsItem);
          if (!coords) return null;
          
          const handleClick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (epaperId) {
              // Navigate to section page - use slug if available and meaningful, otherwise ID, then _id
              // IMPORTANT: Don't use slug if it's "Untitled" or empty - use ID instead for uniqueness
              let sectionId;
              const hasValidSlug = newsItem.slug && 
                                   newsItem.slug.trim() !== '' && 
                                   newsItem.slug.toLowerCase() !== 'untitled';
              
              if (hasValidSlug) {
                sectionId = newsItem.slug;
              } else if (newsItem.id !== undefined && newsItem.id !== null) {
                // Use ID if slug is not valid - IDs are always unique
                sectionId = String(newsItem.id);
              } else if (newsItem._id) {
                // Fallback to _id if no ID
                sectionId = String(newsItem._id);
              } else {
                console.error('Section has no valid identifier:', newsItem);
                return; // Don't navigate if no identifier
              }
              
              const epIdentifier = epaperSlug || String(epaperId);
              console.log('Navigating to section:', {
                sectionId,
                epIdentifier,
                pageNo: page.pageNo,
                sectionTitle: newsItem.title,
                sectionSlug: newsItem.slug,
                sectionId_field: newsItem.id,
                section_id: newsItem._id
              });
              navigate(`/epaper/${epIdentifier}/page/${page.pageNo}/section/${sectionId}`);
            } else if (onSectionClick) {
              // Fallback to callback if no epaperId
              onSectionClick(newsItem);
            }
          };

          // Use a unique key - prefer id, then _id, then index
          const uniqueKey = newsItem.id !== undefined ? newsItem.id : (newsItem._id ? String(newsItem._id) : `section-${page.pageNo}-${index}`);
          
          return (
            <div
              key={uniqueKey}
              onClick={handleClick}
              className="absolute cursor-pointer border border-black/20 hover:border-black/40 hover:bg-white/10 transition-all duration-200"
              style={{
                left: `${coords.left}px`,
                top: `${coords.top}px`,
                width: `${coords.width}px`,
                height: `${coords.height}px`,
                background: 'transparent'
              }}
              title="क्लिक करा विभाग पहा"
            />
          );
        })}
      </div>
    </div>
  );
};

export default EPaperPage2;

