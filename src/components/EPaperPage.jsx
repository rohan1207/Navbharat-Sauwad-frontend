import React, { useState, useEffect, useRef } from 'react';

const EPaperPage = ({ page, onNewsClick }) => {
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
    <div className="border border-gray-200 rounded-lg p-4">
      <h3 className="text-lg font-semibold mb-3 text-gray-900">
        पृष्ठ {page.pageNo}
      </h3>
      <div ref={containerRef} className="relative inline-block w-full">
        <img
          ref={imgRef}
          src={page.image}
          alt={`Page ${page.pageNo}`}
          className="w-full rounded-lg shadow-md"
        />
        {/* Clickable news areas */}
        {page.news && page.news.map((newsItem) => {
          const coords = getDisplayCoords(newsItem);
          if (!coords) return null;
          
          return (
            <div
              key={newsItem.id}
              onClick={() => onNewsClick(newsItem)}
              className="absolute border-2 border-orange-500 bg-orange-500 bg-opacity-20 cursor-pointer hover:bg-opacity-40 hover:border-orange-600 transition-all rounded"
              style={{
                left: `${coords.left}px`,
                top: `${coords.top}px`,
                width: `${coords.width}px`,
                height: `${coords.height}px`,
              }}
              title={newsItem.title}
            >
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500 text-white text-xs p-1 opacity-0 hover:opacity-100 transition-opacity rounded-b">
                {newsItem.title}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default EPaperPage;





